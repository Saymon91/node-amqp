'use strict';
const { EventEmitter } = require('events');
const { Promise } = require('./promise');
const { methods } = require('./definitions');

// This class is not exposed to the user. Queue and Exchange are subclasses
// of Channel. This just provides a task queue.

module.exports = class Channel extends EventEmitter {
  constructor(connection, channel) {
    super();
    this.setMaxListeners(0);

    this.channel = channel;
    this.connection = connection;
    this._tasks = [];

    this.reconnect();
  }

  reconnect() {
    this.connection._sendMethod(this.channel, methods.channelOpen, { reserved1: "" });
  };

  closeOK() {
    this.connection._sendMethod(this.channel, methods.channelCloseOk, { reserved1: "" });
  }

  _taskPush(reply, cb) {
    var promise = new Promise();
    this._tasks.push({
      promise: promise,
      reply  : reply,
      sent   : false,
      cb     : cb
    });
    this._tasksFlush();
    return promise;
  };

  _tasksFlush() {
    if (this.state != 'open') {
      return;
    }

    for (var index = 0, length = this._tasks.length; index < length; index++) {
      var task = this._tasks[index];
      if (!task || task.sent) continue;
      task.cb();
      task.sent = true;
      if (!task.reply) {
        // if we don't expect a reply, just delete it now
        this._tasks.splice(index, 1);
        index--;
      }
    }
  }

  _handleTaskReply(channel, method, args) {
    for (var index = 0, length = this._tasks.length; index < length; index++) {
      var task;
      if (this._tasks[index].reply == method) {
        task = this._tasks[index];
        this._tasks.splice(index, 1);
        task.promise.emitSuccess(args);
        this._tasksFlush();
        return true;
      }
    }

    return false;
  }

  _onChannelMethod(channel, method, args) {
    //console.error('CHANNEL:', method.name, args);
    switch (method) {
      case methods.channelCloseOk:
        delete this.connection.channels[this.channel];
        this.state = 'closed';
      // TODO should this be falling through?
      default:
        this._onMethod(channel, method, args);
    }
  }

  close(reason, callback) {
    this.once('channelCloseOk', () => {
      callback();
    });
    this.state = 'closing';
    const args = {
      replyText: reason ? reason : 'Goodbye from node',
      replyCode: 200,
      classId  :  0,
      methodId : 0
    };
    this.connection._sendMethod(this.channel, methods.channelClose, args);
  };
};

