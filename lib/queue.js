'use strict';
const { inspect } = require('util');
const { StringDecoder } = require('string_decoder');
const _ = require('lodash');
const Channel = require('./channel');
const Message = require('./message');
const debug = require('./debug');
const { methods, classes } = require('./definitions');

const async = require('async');

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


module.exports = class Queue extends Channel {
  constructor(connection, channel, name, options, callback) {
    super(connection, channel);
    this.name = name;
    this._bindings = [];
    this.consumerTagListeners = {};
    this.consumerTagOptions = {};

    // route messages to subscribers based on consumerTag
    this.on('rawMessage', message => {
      if (message.consumerTag && this.consumerTagListeners[message.consumerTag]) {
        this.consumerTagListeners[message.consumerTag](message);
      }
    });

    this.options = { autoDelete: true, closeChannelOnUnsubscribe: false };
    Object.assign(this.options, options || {});
    //console.error('QUEUE options:', JSON.stringify(this.options, true, 2));

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
    // Bindings controller
    this.bindQueue = async.queue(({ exchange, data }, callback) => {
      const args = {
        exchange,
        reserved1 : 0,
        queue     : this.name,
        routingKey: data.routingKey || '',
        noWait    : false,
        arguments : data.arguments || {}
      };

      this.once('queueBindOk', () => {
        const exists = this._bindings.find(binding =>
          equal({ exchange: binding.exchange, data: binding.data }, { exchange, data }));
        exists && Object.assign(exists, { bound: true });
        callback instanceof Function && callback();
      });

      this.connection.checkExchange(exchange, (checkError, result) => {
        if (result) {
          this.connection._sendMethod(this.channel, methods.queueBind, args);
          const notBoundToExchange = this._bindings.filter(binding =>
            binding.exchange === exchange && !binding.bound);

          for (var index = 0, length = notBoundToExchange.length; index < length; index++) {
            this.bindQueue.push(notBoundToExchange[index]);
          }
          return;
        }

        const notBoundToExchange = this._bindings.filter(binding =>
        binding.exchange === exchange && binding.bound);

        for (var index = 0, length = notBoundToExchange.length; index < length; index++) {
          notBoundToExchange[index].bound = false;
        }
        callback instanceof Function && callback(new Error('Exchange not found'));
      });
    });

    this.unbindQueue = async.queue(({ exchange, data }, callback) => {
      const args = {
        exchange,
        reserved1 : 0,
        queue     : this.name,
        routingKey: data.routingKey || '',
        noWait    : false,
        arguments : data.arguments || {}
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

    //this.reconnect();
  };

  subscribeRaw(messageListener, options, callback) {
    var consumerTag = `node-amqp-${process.pid}-${Math.random()}`;
    this.consumerTagListeners[consumerTag] = messageListener;

    options = options || {};
    options.state = 'opening';
    this.consumerTagOptions[consumerTag] = options;
    if (options.prefetchCount !== undefined) {
      const args = {
        reserved1    : 0,
        prefetchSize : 0,
        prefetchCount: options.prefetchCount,
        global       : false
      };
      this.connection._sendMethod(this.channel, methods.basicQos, args);
    }

    return this._taskPush(methods.basicConsumeOk, () => {
      const args = {
        reserved1  : 0,
        queue      : this.name,
        consumerTag: consumerTag,
        noLocal    : !!options.noLocal,
        noAck      : !!options.noAck,
        exclusive  : !!options.exclusive,
        noWait     : false,
        arguments  : {}
      };
      this.connection._sendMethod(this.channel, methods.basicConsume, args);
      this.consumerTagOptions[consumerTag].state = 'open';
    });
  };

  unsubscribe(consumerTag) {
    return this._taskPush(methods.basicCancelOk, () => {
      const args = {
        reserved1  : 0,
        consumerTag: consumerTag,
        noWait     : false
      };
      this.connection._sendMethod(this.channel, methods.basicCancel, args);
    }).addCallback(() => {
      if (this.options.closeChannelOnUnsubscribe) {
        this.close();
      }
      delete this.consumerTagListeners[consumerTag];
      delete this.consumerTagOptions[consumerTag];
    });
  };

  subscribe(messageListener, options = {}) {
    options = _.defaults(options || {}, {
      ack                 : false,
      prefetchCount       : 1,
      routingKeyInPayload : this.connection.options.routingKeyInPayload,
      deliveryTagInPayload: this.connection.options.deliveryTagInPayload
    });

    // basic consume
    var rawOptions = {
      noAck    : !options.ack,
      exclusive: options.exclusive
    };

    if (options.ack) {
      rawOptions.prefetchCount = options.prefetchCount;
    }

    return this.subscribeRaw(message => {
      let { contentType, headers, size } = message;
      const decoder = new StringDecoder('utf8');

      if (contentType == null && headers && headers.properties) {
        contentType = headers.properties.content_type;
      }

      const isJSON = ['text/json', 'application/json'].indexOf(contentType) > -1;

      let buffer;

      if (isJSON) {
        buffer = "";
      } else {
        buffer = new Buffer(size);
        buffer.used = 0;
      }

      this._lastMessage = message;

      message.addListener('data', data => {
        if (isJSON) {
          buffer += decoder.write(data);
        } else {
          data.copy(buffer, buffer.used);
          buffer.used += data.length;
        }
      });

      message.addListener('end', () => {
        let json;
        const deliveryInfo = {};
        const msgProperties = classes[60].fields;

        if (isJSON) {
          decoder.end();
          try {
            json = JSON.parse(buffer);
          } catch (parseError) {
            json = null;
            deliveryInfo.parseError = parseError;
            deliveryInfo.rawData = buffer;
          }
        } else {
          json = { data: buffer, contentType: message.contentType };
        }

        for (var index = 0, length = msgProperties.length; index < length; index++) {
          if (message[msgProperties[index].name]) {
            deliveryInfo[msgProperties[index].name] = message[msgProperties[index].name];
          }
        }

        deliveryInfo.queue = message.queue ? message.queue.name : null;
        deliveryInfo.deliveryTag = message.deliveryTag;
        deliveryInfo.redelivered = message.redelivered;
        deliveryInfo.exchange = message.exchange;
        deliveryInfo.routingKey = message.routingKey;
        deliveryInfo.consumerTag = message.consumerTag;

        if (options.routingKeyInPayload) json._routingKey = message.routingKey;
        if (options.deliveryTagInPayload) json._deliveryTag = message.deliveryTag;

        var headers = {};
        for (var key in this.headers) {
          if (this.headers.hasOwnProperty(key)) {
            if (this.headers[key] instanceof Buffer) {
              headers[key] = this.headers[key].toString();
            } else {
              headers[key] = this.headers[key];
            }
          }
        }

        messageListener instanceof Function && messageListener(json, headers, deliveryInfo, message);
        this.emit('message', json, headers, deliveryInfo, message);
      });
    }, rawOptions);
  };

  shift(reject, requeue) {
    if (this._lastMessage) {
      if (reject) {
        this._lastMessage.reject(requeue ? true : false);
      } else {
        this._lastMessage.acknowledge();
      }
      this._lastMessage = null;
    }
  };

  bind(exchange, data, callback) {
    const exchangeName = (exchange || {}).name || exchange;
    const exists = this._bindings
      .find(binding => equal({ exchange, data }, { exchange: binding.exchange, data: binding.data }));
    if (exists) {
      callback instanceof Function && callback(new Error('Binding already exists'));
      return this;
    }


    const binding = { exchange: exchangeName, data, bound: false };
    this._bindings.push(binding);
    this.bindQueue.push(binding, callback);
    return this;
  };

  unbind(exchange, data, callback) {
    const exchangeName = (exchange || {}).name || exchange;
    const exists = this._bindings
      .find(binding => equal({ exchange, data }, { exchange: binding.exchange, data: binding.data }));
    if (!exists) {
      callback instanceof Function && callback(new Error('Binding not exists'));
      return this;
    }

    this.unbindQueue.push({ exchange: exchangeName, data }, callback);
  };

  destroy(options, callback) {
    options = options || {};
    this.once('queueDeleteOk', () => {
      this.connection.queueClosed(this.name);
      callback instanceof Function && callback();
    });

    const args = {
      reserved1: 0,
      queue    : this.name,
      ifUnused : options.ifUnused ? true : false,
      ifEmpty  : options.ifEmpty ? true : false,
      noWait   : false,
      arguments: {}
    };
    this.connection._sendMethod(this.channel, methods.queueDelete, args);
  };

  purge() {
    return this._taskPush(methods.queuePurgeOk, () => {
      const args = {
        reserved1: 0,
        queue    : this.name,
        noWait   : false
      };
      this.connection._sendMethod(this.channel, methods.queuePurge, args);
    });
  }

  _onMethod(channel, method, args) {
    this.emit(method.name, args);
    //console.log('QUEUE:', method.name);
    if (this._handleTaskReply.apply(this, arguments)) {
      return;
    }

    switch (method) {
      case methods.channelOpenOk:
        if (this.options.noDeclare) {
          this.state = 'open';
          this.emit('open');
        } else {
          if (this.name.startsWith('amq.')) {
            this.name = '';
          }
          const args = {
            reserved1 : 0,
            queue     : this.name,
            passive   : !!this.options.passive,
            durable   : !!this.options.durable,
            exclusive : !!this.options.exclusive,
            autoDelete: !!this.options.autoDelete,
            noWait    : false,
            arguments : this.options['arguments'] || {}
          };
          this.connection._sendMethod(channel, methods.queueDeclare, args);
          this.state = 'declare';
        }
        break;

      case methods.queueDeclareOk:
        this.state = 'open';
        this.name = args.queue;
        this.connection.queues[this.name] = this;

        // Rebind to previously bound exchanges, if present.
        // Important this is called *before* openCallback, otherwise bindings will happen twice.
        // Run test-purge to make sure you got this right
        this._bindings
          .filter(({ bound }) => !bound)
          .forEach(({ exchange, data }) =>
            this.bindQueue.push({ exchange, data }, () => {}));

        this.emit('open', args.queue, args.messageCount, args.consumerCount);

        // If this is a reconnect, we must re-subscribe our queue listeners.
        var consumerTags = Object.keys(this.consumerTagListeners);
        for (var index in consumerTags) {
          const consumerTag = consumerTags[index];
          const consumerOptions = this.consumerTagOptions[consumerTag];

          if (consumerTags.hasOwnProperty(index)) {
            if (consumerOptions.state === 'closed') {
              this.subscribeRaw(consumerOptions, this.consumerTagListeners[consumerTag]);
              // Having called subscribeRaw, we are now a new consumer with a new consumerTag.
              delete this.consumerTagListeners[consumerTag];
              delete this.consumerTagOptions[consumerTag];
            }
          }
        }
        break;

      case methods.basicConsumeOk:
        debug && debug('basicConsumeOk', inspect(args, null));
        break;

      case methods.queueBindOk:
        break;

      case methods.queueUnbindOk:
        break;

      case methods.basicQosOk:
        console.log(channel, method, args);
        break;

      case methods.confirmSelectOk:
        this._sequence = 1;
        this.confirm = true;
        break;

      case methods.channelClose:
        this.state = 'closed';
        this.closeOK();
        this.connection.queueClosed(this.name);
        //var e = new Error(args.replyText);
        //e.code = args.replyCode;
        //this.emit('error', e);
        this.emit('close');
        break;

      case methods.channelCloseOk:
        this.connection.queueClosed(this.name);
        this.emit('close');
        break;

      case methods.basicDeliver:
        this.currentMessage = new Message(this, args);
        break;

      case methods.queueDeleteOk:
        break;

      case methods.basicCancel:
        this.close(`Closed due to basicCancel received on consumer (${args.consumerTag})`);
        break;

      default:
        throw new Error("Uncaught method '" + method.name + "' with args \n" +
          JSON.stringify(args, true, 2) + ";\n tasks = \n" + JSON.stringify(this._tasks, true, 2));
    }

    this._tasksFlush();
  };

  _onContentHeader(channel, classInfo, weight, properties, size) {
    Object.assign(this.currentMessage, properties);
    this.currentMessage.read = 0;
    this.currentMessage.size = size;

    this.emit('rawMessage', this.currentMessage);
    if (size === 0) {
      // If the message has no body, directly emit 'end'
      this.currentMessage.emit('end');
    }
  };

  _onContent(channel, data) {
    this.currentMessage.read += data.length;
    this.currentMessage.emit('data', data);
    if (this.currentMessage.read == this.currentMessage.size) {
      this.currentMessage.emit('end');
    }
  };

  flow(active) {
    return this._taskPush(methods.channelFlowOk, () =>
      this.connection._sendMethod(this.channel, methods.channelFlow, { 'active': active }));
  };
};
