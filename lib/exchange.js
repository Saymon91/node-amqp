'use strict';
var _ = require('lodash');
var { methods } = require('./definitions');
var Channel = require('./channel');
var debug = require('./debug');

const async = require('async');

function createExchangeErrorHandlerFor (exchange) {
  return function (err) {
    if (!exchange.options.confirm) return;

    // should requeue instead?
    // https://www.rabbitmq.com/reliability.html#producer
    debug && debug('Exchange error handler triggered, erroring and wiping all unacked publishes');
    for (var id in exchange._unAcked) {
      var task = exchange._unAcked[id];
      task.emit('ack error', err);
      delete exchange._unAcked[id];
    }
  };
}

function equal(one, two) {
  if (one === two) return true;
  if (typeof one !== typeof two) return false;

  if (Array.isArray(one) &&  Array.isArray(two)) {
    if (one.length !== two.length) return false;
    return one.join() == two.join();
  }

  if (_.isObject(one) && _.isObject(two)) {
    if (!equal(Object.keys(one), Object.keys(two))) return false;

    for (var key in one) {
      if (!equal(two[key], one[key])) return false;
    }
    return true;
  }

  return false;
}

module.exports = class Exchange extends Channel {
  constructor(connection, channel, name, options, callback) {
    super(connection, channel);
    this.name = name;
    this.sourceExchanges = {};
    this.options = _.defaults(options || {}, { autoDelete: true });

    this._bindings = [];

    this._sequence = null;
    this._unAcked  = {};
    this._addedExchangeErrorHandler = false;

    if (callback instanceof Function) {
      let openCallback;
      let closeCallback;
      closeCallback = () => {
        this.removeListener('open', openCallback);
        callback(new Error('Queue closed'), this);
      };
      openCallback = args => {
        this.removeListener('close', closeCallback);
        const { messageCount, consumerCount } = args || {};
        callback(null, this, messageCount, consumerCount);
      };
      this.once('open', openCallback);
      this.once('close', closeCallback);
    }

    this.init();
  }

  init() {
    this.bindQueue = async.queue(({ exchange, data }, callback) => {
      const args = {
        reserved1  : 0,
        destination: this.name,
        source     : exchange,
        routingKey : data.routingKey || '',
        noWait     : false,
        arguments  : data['arguments'] || {}
      };

      this.once('exchangeBindOk', () => {
        const exists = this._bindings.find(binding =>
          equal({ exchange: binding.exchange, data: binding.data }, { exchange, data }));
        exists && Object.assign(exists, { bound: true });
        callback instanceof Function && callback();
      });

      this.connection.checkExchange(exchange, (checkError, result) => result
        ? this.connection._sendMethod(this.channel, methods.exchangeBind, args)
        : callback instanceof Function && callback(new Error('Exchange not found')));
    });

    this.unbindQueue = async.queue(({ exchange, data }, callback) => {
      const args = {
        reserved1  : 0,
        destination: this.name,
        source     : source,
        routingKey : data.routingKey || '',
        noWait     : false,
        arguments  : data['arguments'] || {}
      };

      this.once('queueUnbindOk', () => {
        const bindIndex = this._bindings.findIndex(binding =>
          equal({ exchange: binding.exchange, data: binding.data }, { exchange, data }));
        bindIndex >= 0 && this._bindings.splice(bindIndex, 1);
        callback instanceof Function && callback();
      });

      this.connection._sendMethod(this.channel, methods.queueUnbind, args);
    });

    this.on('channelClose', () =>
      this._bindings = this._bindings.map(binding => Object.assign(binding, { bound: false })));

    this.connection.on('connectionCloseOk', args =>
      this._onMethod(this.channel, methods.channelClose, args));
  }

  _onMethod(channel, method, args) {
    this.emit(method.name, args);

    if (this._handleTaskReply.apply(this, arguments))
      return true;

    switch (method) {
      case methods.channelOpenOk:
        this._sequence = null;

        if (!this._addedExchangeErrorHandler) {
          this.errorHandler = createExchangeErrorHandlerFor(this);
          this.connection.on('error', this.errorHandler);
          this.on('error', this.errorHandler);
          this._addedExchangeErrorHandler = true;
        }

        // Pre-baked exchanges don't need to be declared
        if (this.name.startsWith('amqp.')) {
          //If confirm mode is specified we have to set it no matter the exchange.
          if (this.options.confirm) {
            this._confirmSelect(channel);
            return;
          }

          this.state = 'open';
          this.emit('open');

          // For if we want to delete a exchange,
          // we dont care if all of the options match.
        } else if (this.options.noDeclare) {
          if (this.options.confirm) {
            this._confirmSelect(channel);
            this.state = 'open';
            this.emit('open');
          }
        } else {
          const args = {
            reserved1 : 0,
            reserved2 : false,
            reserved3 : false,
            exchange  : this.name,
            type      : this.options.type || 'topic',
            passive   : !!this.options.passive,
            durable   : !!this.options.durable,
            autoDelete: !!this.options.autoDelete,
            internal  : !!this.options.internal,
            noWait    : false,
            arguments : this.options.arguments || {}
          };
          this.connection._sendMethod(channel, methods.exchangeDeclare, args);
          this.state = 'declaring';
        }
        break;

      case methods.exchangeDeclareOk:
        if (this.options.confirm) {
          this._confirmSelect(channel);
        } else {

          this.state = 'open';
          this.emit('open');
        }
        break;

      case methods.confirmSelectOk:
        this._sequence = 1;

        this.state = 'open';
        this.emit('open');
        break;

      case methods.channelClose:
        this.state = "closed";

        this.closeOK();
        this.connection.exchangeClosed(this.name);
        //var e = new Error(args.replyText);
        //e.code = args.replyCode;
        //this.emit('error', e);
        this.emit('close');
        break;

      case methods.channelCloseOk:
        this.connection.exchangeClosed(this.name);
        this.emit('close');
        break;


      case methods.basicAck:
        this.emit('basic-ack', args);
        var sequenceNumber = args.deliveryTag.readUInt32BE(4), tag;
        debug && debug("basic-ack, sequence: ", sequenceNumber);

        if (sequenceNumber === 0 && args.multiple === true) {
          // we must ack everything
          for (tag in this._unAcked) {
            this._unAcked[tag].emit('ack');
            delete this._unAcked[tag];
          }
        } else if (sequenceNumber !== 0 && args.multiple === true) {
          // we must ack everything before the delivery tag
          for (tag in this._unAcked) {
            if (tag <= sequenceNumber) {
              this._unAcked[tag].emit('ack');
              delete this._unAcked[tag];
            }
          }
        } else if (this._unAcked[sequenceNumber] && args.multiple === false) {
          // simple single ack
          this._unAcked[sequenceNumber].emit('ack');
          delete this._unAcked[sequenceNumber];
        }
        break;

      case methods.basicReturn:
        this.emit('basic-return', args);
        break;

      case methods.exchangeBindOk:
        break;

      case methods.exchangeUnbindOk:
        break;

      default:
        throw new Error("Uncaught method '" + method.name + "' with args " +
          JSON.stringify(args));
    }

    this._tasksFlush();
  }

  // exchange.publish('routing.key', 'body');
  //
  // the third argument can specify additional options
  // - mandatory (boolean, default false)
  // - immediate (boolean, default false)
  // - contentType (default 'application/octet-stream')
  // - contentEncoding
  // - headers
  // - deliveryMode
  // - priority (0-9)
  // - correlationId
  // - replyTo
  // - expiration
  // - messageId
  // - timestamp
  // - userId
  // - appId
  // - clusterId
  //
  // the callback is optional and is only used when confirm is turned on for the exchange

  publish(routingKey, data, options, callback) {
    callback = callback || function() {};

    if (this.connection._blocked) {
      return callback(true, new Error(`Connection is blocked, server reason: ${this.connection._blockedReason}`));
    }

    if (this.state !== 'open') {
      this._sequence = null;
      return callback(true, new Error('Can not publish: exchange is not open'));
    }

    if (this.options.confirm && !this._readyToPublishWithConfirms()) {
      return callback(true, new Error('Not yet ready to publish with confirms'));
    }

    options = _.assignIn({}, options || {});
    options.routingKey = routingKey;
    options.exchange   = this.name;
    options.mandatory  = !!options.mandatory || false;
    options.immediate  = !!options.immediate || false;
    options.reserved1  = 0;

    var task = this._taskPush(null, () => {
      this.connection._sendMethod(this.channel, methods.basicPublish, options);
      // This interface is probably not appropriate for streaming large files.
      // (Of course it's arguable about whether AMQP is the appropriate
      // transport for large files.) The content header wants to know the size
      // of the data before sending it - so there's no point in trying to have a
      // general streaming interface - streaming messages of unknown size simply
      // isn't possible with AMQP. This is all to say, don't send big messages.
      // If you need to stream something large, chunk it yourself.
      this.connection._sendBody(this.channel, data, options);
    });

    if (this.options.confirm) this._awaitConfirm(task, callback);
    return task;
  };

  _awaitConfirm(task, callback) {
    if (!this._addedExchangeErrorHandler) {
      // if connection fails, we want to ack error all unacked publishes.
      this.connection.on('error', createExchangeErrorHandlerFor(this));
      this.on('error', createExchangeErrorHandlerFor(this));
      this._addedExchangeErrorHandler = true;
    }

    debug && debug('awaiting confirmation for ' + this._sequence);
    task.sequence = this._sequence;
    this._unAcked[this._sequence] = task;
    this._sequence++;

    if ('function' != typeof callback) return;

    task.once('ack error', err => {
      task.removeAllListeners();
      callback(true, err);
    });

    task.once('ack', () => {
      task.removeAllListeners();
      callback(false);
    });
  }

  cleanup() {
    if (this.binds === 0) { // don't keep reference open if unused
      this.connection.exchangeClosed(this.name);
    }
  }

  destroy(ifUnused, callback) {
    if (this._addedExchangeErrorHandler) {
      this.removeListener('error', this.errorHandler);
      this.connection.removeListener('error', this.errorHandler);
      this._addedExchangeErrorHandler = false;
    }

    this.once('exchangeDeleteOk', () => {
      this.connection.exchangeClosed(this.name);
      callback();
    });

    const args = {
      reserved1: 0,
      exchange : this.name,
      ifUnused : !!ifUnused || false,
      noWait   : false
    };
    this.connection._sendMethod(this.channel, methods.exchangeDelete, args);
  };

  unbind(exchange, data, callback) {
    const bindIndex = this._bindings.find(binding =>
      equal({ exchange, data }, { exchange: binding.exchange, data: binding.data }));
    if (bindIndex < 0) {
      return callback instanceof Function && callback(new Error('Binding not found'));
    }

    const binding = this._bindings[bindIndex];
    if (binding && !binding.bound) {
      this._bindings.splice(bindIndex, 1);
      return callback instanceof Function && callback();
    }

    this.unbindQueue.push({ exchange, data }, callback);
  };

  bind(exchange, data, callback) {
    const bindIndex = this._bindings.find(binding =>
      equal({ exchange, data }, { exchange: binding.exchange, data: binding.data }));
    if (bindIndex < 0) {
      return callback instanceof Function && callback(new Error('Binding not found'));
    }

    const binding = this._bindings[bindIndex];
    if (binding && binding.bound) {
      return callback instanceof Function && callback(new Error('Already bound'));
    }

    this.bindQueue.push({ exchange, data }, callback);
  }

  _confirmSelect(channel) {
    this.connection._sendMethod(channel, methods.confirmSelect, { noWait: false });
  }

  _readyToPublishWithConfirms() {
    return this._sequence != null;
  }
};
