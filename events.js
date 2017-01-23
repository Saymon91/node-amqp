module.export = {
  "connectionStart": {
  "name": "connectionStart",
    "fields": [
    {
      "name": "versionMajor",
      "domain": "octet"
    },
    {
      "name": "versionMinor",
      "domain": "octet"
    },
    {
      "name": "serverProperties",
      "domain": "table"
    },
    {
      "name": "mechanisms",
      "domain": "longstr"
    },
    {
      "name": "locales",
      "domain": "longstr"
    }
  ],
    "methodIndex": 10,
    "classIndex": 10
},
  "connectionStartOk": {
  "name": "connectionStartOk",
    "fields": [
    {
      "name": "clientProperties",
      "domain": "table"
    },
    {
      "name": "mechanism",
      "domain": "shortstr"
    },
    {
      "name": "response",
      "domain": "longstr"
    },
    {
      "name": "locale",
      "domain": "shortstr"
    }
  ],
    "methodIndex": 11,
    "classIndex": 10
},
  "connectionSecure": {
  "name": "connectionSecure",
    "fields": [
    {
      "name": "challenge",
      "domain": "longstr"
    }
  ],
    "methodIndex": 20,
    "classIndex": 10
},
  "connectionSecureOk": {
  "name": "connectionSecureOk",
    "fields": [
    {
      "name": "response",
      "domain": "longstr"
    }
  ],
    "methodIndex": 21,
    "classIndex": 10
},
  "connectionTune": {
  "name": "connectionTune",
    "fields": [
    {
      "name": "channelMax",
      "domain": "short"
    },
    {
      "name": "frameMax",
      "domain": "long"
    },
    {
      "name": "heartbeat",
      "domain": "short"
    }
  ],
    "methodIndex": 30,
    "classIndex": 10
},
  "connectionTuneOk": {
  "name": "connectionTuneOk",
    "fields": [
    {
      "name": "channelMax",
      "domain": "short"
    },
    {
      "name": "frameMax",
      "domain": "long"
    },
    {
      "name": "heartbeat",
      "domain": "short"
    }
  ],
    "methodIndex": 31,
    "classIndex": 10
},
  "connectionOpen": {
  "name": "connectionOpen",
    "fields": [
    {
      "name": "virtualHost",
      "domain": "shortstr"
    },
    {
      "name": "reserved1",
      "domain": "shortstr"
    },
    {
      "name": "reserved2",
      "domain": "bit"
    }
  ],
    "methodIndex": 40,
    "classIndex": 10
},
  "connectionOpenOk": {
  "name": "connectionOpenOk",
    "fields": [
    {
      "name": "reserved1",
      "domain": "shortstr"
    }
  ],
    "methodIndex": 41,
    "classIndex": 10
},
  "connectionClose": {
  "name": "connectionClose",
    "fields": [
    {
      "name": "replyCode",
      "domain": "short"
    },
    {
      "name": "replyText",
      "domain": "shortstr"
    },
    {
      "name": "classId",
      "domain": "short"
    },
    {
      "name": "methodId",
      "domain": "short"
    }
  ],
    "methodIndex": 50,
    "classIndex": 10
},
  "connectionCloseOk": {
  "name": "connectionCloseOk",
    "fields": [],
    "methodIndex": 51,
    "classIndex": 10
},
  "connectionBlocked": {
  "name": "connectionBlocked",
    "fields": [
    {
      "name": "reason",
      "domain": "shortstr"
    }
  ],
    "methodIndex": 60,
    "classIndex": 10
},
  "connectionUnblocked": {
  "name": "connectionUnblocked",
    "fields": [],
    "methodIndex": 61,
    "classIndex": 10
},
  "channelOpen": {
  "name": "channelOpen",
    "fields": [
    {
      "name": "reserved1",
      "domain": "shortstr"
    }
  ],
    "methodIndex": 10,
    "classIndex": 20
},
  "channelOpenOk": {
  "name": "channelOpenOk",
    "fields": [
    {
      "name": "reserved1",
      "domain": "longstr"
    }
  ],
    "methodIndex": 11,
    "classIndex": 20
},
  "channelFlow": {
  "name": "channelFlow",
    "fields": [
    {
      "name": "active",
      "domain": "bit"
    }
  ],
    "methodIndex": 20,
    "classIndex": 20
},
  "channelFlowOk": {
  "name": "channelFlowOk",
    "fields": [
    {
      "name": "active",
      "domain": "bit"
    }
  ],
    "methodIndex": 21,
    "classIndex": 20
},
  "channelClose": {
  "name": "channelClose",
    "fields": [
    {
      "name": "replyCode",
      "domain": "short"
    },
    {
      "name": "replyText",
      "domain": "shortstr"
    },
    {
      "name": "classId",
      "domain": "short"
    },
    {
      "name": "methodId",
      "domain": "short"
    }
  ],
    "methodIndex": 40,
    "classIndex": 20
},
  "channelCloseOk": {
  "name": "channelCloseOk",
    "fields": [],
    "methodIndex": 41,
    "classIndex": 20
},
  "exchangeDeclare": {
  "name": "exchangeDeclare",
    "fields": [
    {
      "name": "reserved1",
      "domain": "short"
    },
    {
      "name": "exchange",
      "domain": "shortstr"
    },
    {
      "name": "type",
      "domain": "shortstr"
    },
    {
      "name": "passive",
      "domain": "bit"
    },
    {
      "name": "durable",
      "domain": "bit"
    },
    {
      "name": "autoDelete",
      "domain": "bit"
    },
    {
      "name": "reserved2",
      "domain": "bit"
    },
    {
      "name": "reserved3",
      "domain": "bit"
    },
    {
      "name": "noWait",
      "domain": "bit"
    },
    {
      "name": "arguments",
      "domain": "table"
    }
  ],
    "methodIndex": 10,
    "classIndex": 40
},
  "exchangeDeclareOk": {
  "name": "exchangeDeclareOk",
    "fields": [],
    "methodIndex": 11,
    "classIndex": 40
},
  "exchangeDelete": {
  "name": "exchangeDelete",
    "fields": [
    {
      "name": "reserved1",
      "domain": "short"
    },
    {
      "name": "exchange",
      "domain": "shortstr"
    },
    {
      "name": "ifUnused",
      "domain": "bit"
    },
    {
      "name": "noWait",
      "domain": "bit"
    }
  ],
    "methodIndex": 20,
    "classIndex": 40
},
  "exchangeDeleteOk": {
  "name": "exchangeDeleteOk",
    "fields": [],
    "methodIndex": 21,
    "classIndex": 40
},
  "exchangeBind": {
  "name": "exchangeBind",
    "fields": [
    {
      "name": "reserved1",
      "domain": "short"
    },
    {
      "name": "destination",
      "domain": "shortstr"
    },
    {
      "name": "source",
      "domain": "shortstr"
    },
    {
      "name": "routingKey",
      "domain": "shortstr"
    },
    {
      "name": "noWait",
      "domain": "bit"
    },
    {
      "name": "arguments",
      "domain": "table"
    }
  ],
    "methodIndex": 30,
    "classIndex": 40
},
  "exchangeBindOk": {
  "name": "exchangeBindOk",
    "fields": [],
    "methodIndex": 31,
    "classIndex": 40
},
  "exchangeUnbind": {
  "name": "exchangeUnbind",
    "fields": [
    {
      "name": "reserved1",
      "domain": "short"
    },
    {
      "name": "destination",
      "domain": "shortstr"
    },
    {
      "name": "source",
      "domain": "shortstr"
    },
    {
      "name": "routingKey",
      "domain": "shortstr"
    },
    {
      "name": "noWait",
      "domain": "bit"
    },
    {
      "name": "arguments",
      "domain": "table"
    }
  ],
    "methodIndex": 40,
    "classIndex": 40
},
  "exchangeUnbindOk": {
  "name": "exchangeUnbindOk",
    "fields": [],
    "methodIndex": 51,
    "classIndex": 40
},
  "queueDeclare": {
  "name": "queueDeclare",
    "fields": [
    {
      "name": "reserved1",
      "domain": "short"
    },
    {
      "name": "queue",
      "domain": "shortstr"
    },
    {
      "name": "passive",
      "domain": "bit"
    },
    {
      "name": "durable",
      "domain": "bit"
    },
    {
      "name": "exclusive",
      "domain": "bit"
    },
    {
      "name": "autoDelete",
      "domain": "bit"
    },
    {
      "name": "noWait",
      "domain": "bit"
    },
    {
      "name": "arguments",
      "domain": "table"
    }
  ],
    "methodIndex": 10,
    "classIndex": 50
},
  "queueDeclareOk": {
  "name": "queueDeclareOk",
    "fields": [
    {
      "name": "queue",
      "domain": "shortstr"
    },
    {
      "name": "messageCount",
      "domain": "long"
    },
    {
      "name": "consumerCount",
      "domain": "long"
    }
  ],
    "methodIndex": 11,
    "classIndex": 50
},
  "queueBind": {
  "name": "queueBind",
    "fields": [
    {
      "name": "reserved1",
      "domain": "short"
    },
    {
      "name": "queue",
      "domain": "shortstr"
    },
    {
      "name": "exchange",
      "domain": "shortstr"
    },
    {
      "name": "routingKey",
      "domain": "shortstr"
    },
    {
      "name": "noWait",
      "domain": "bit"
    },
    {
      "name": "arguments",
      "domain": "table"
    }
  ],
    "methodIndex": 20,
    "classIndex": 50
},
  "queueBindOk": {
  "name": "queueBindOk",
    "fields": [],
    "methodIndex": 21,
    "classIndex": 50
},
  "queueUnbind": {
  "name": "queueUnbind",
    "fields": [
    {
      "name": "reserved1",
      "domain": "short"
    },
    {
      "name": "queue",
      "domain": "shortstr"
    },
    {
      "name": "exchange",
      "domain": "shortstr"
    },
    {
      "name": "routingKey",
      "domain": "shortstr"
    },
    {
      "name": "arguments",
      "domain": "table"
    }
  ],
    "methodIndex": 50,
    "classIndex": 50
},
  "queueUnbindOk": {
  "name": "queueUnbindOk",
    "fields": [],
    "methodIndex": 51,
    "classIndex": 50
},
  "queuePurge": {
  "name": "queuePurge",
    "fields": [
    {
      "name": "reserved1",
      "domain": "short"
    },
    {
      "name": "queue",
      "domain": "shortstr"
    },
    {
      "name": "noWait",
      "domain": "bit"
    }
  ],
    "methodIndex": 30,
    "classIndex": 50
},
  "queuePurgeOk": {
  "name": "queuePurgeOk",
    "fields": [
    {
      "name": "messageCount",
      "domain": "long"
    }
  ],
    "methodIndex": 31,
    "classIndex": 50
},
  "queueDelete": {
  "name": "queueDelete",
    "fields": [
    {
      "name": "reserved1",
      "domain": "short"
    },
    {
      "name": "queue",
      "domain": "shortstr"
    },
    {
      "name": "ifUnused",
      "domain": "bit"
    },
    {
      "name": "ifEmpty",
      "domain": "bit"
    },
    {
      "name": "noWait",
      "domain": "bit"
    }
  ],
    "methodIndex": 40,
    "classIndex": 50
},
  "queueDeleteOk": {
  "name": "queueDeleteOk",
    "fields": [
    {
      "name": "messageCount",
      "domain": "long"
    }
  ],
    "methodIndex": 41,
    "classIndex": 50
},
  "basicQos": {
  "name": "basicQos",
    "fields": [
    {
      "name": "prefetchSize",
      "domain": "long"
    },
    {
      "name": "prefetchCount",
      "domain": "short"
    },
    {
      "name": "global",
      "domain": "bit"
    }
  ],
    "methodIndex": 10,
    "classIndex": 60
},
  "basicQosOk": {
  "name": "basicQosOk",
    "fields": [],
    "methodIndex": 11,
    "classIndex": 60
},
  "basicConsume": {
  "name": "basicConsume",
    "fields": [
    {
      "name": "reserved1",
      "domain": "short"
    },
    {
      "name": "queue",
      "domain": "shortstr"
    },
    {
      "name": "consumerTag",
      "domain": "shortstr"
    },
    {
      "name": "noLocal",
      "domain": "bit"
    },
    {
      "name": "noAck",
      "domain": "bit"
    },
    {
      "name": "exclusive",
      "domain": "bit"
    },
    {
      "name": "noWait",
      "domain": "bit"
    },
    {
      "name": "arguments",
      "domain": "table"
    }
  ],
    "methodIndex": 20,
    "classIndex": 60
},
  "basicConsumeOk": {
  "name": "basicConsumeOk",
    "fields": [
    {
      "name": "consumerTag",
      "domain": "shortstr"
    }
  ],
    "methodIndex": 21,
    "classIndex": 60
},
  "basicCancel": {
  "name": "basicCancel",
    "fields": [
    {
      "name": "consumerTag",
      "domain": "shortstr"
    },
    {
      "name": "noWait",
      "domain": "bit"
    }
  ],
    "methodIndex": 30,
    "classIndex": 60
},
  "basicCancelOk": {
  "name": "basicCancelOk",
    "fields": [
    {
      "name": "consumerTag",
      "domain": "shortstr"
    }
  ],
    "methodIndex": 31,
    "classIndex": 60
},
  "basicPublish": {
  "name": "basicPublish",
    "fields": [
    {
      "name": "reserved1",
      "domain": "short"
    },
    {
      "name": "exchange",
      "domain": "shortstr"
    },
    {
      "name": "routingKey",
      "domain": "shortstr"
    },
    {
      "name": "mandatory",
      "domain": "bit"
    },
    {
      "name": "immediate",
      "domain": "bit"
    }
  ],
    "methodIndex": 40,
    "classIndex": 60
},
  "basicReturn": {
  "name": "basicReturn",
    "fields": [
    {
      "name": "replyCode",
      "domain": "short"
    },
    {
      "name": "replyText",
      "domain": "shortstr"
    },
    {
      "name": "exchange",
      "domain": "shortstr"
    },
    {
      "name": "routingKey",
      "domain": "shortstr"
    }
  ],
    "methodIndex": 50,
    "classIndex": 60
},
  "basicDeliver": {
  "name": "basicDeliver",
    "fields": [
    {
      "name": "consumerTag",
      "domain": "shortstr"
    },
    {
      "name": "deliveryTag",
      "domain": "longlong"
    },
    {
      "name": "redelivered",
      "domain": "bit"
    },
    {
      "name": "exchange",
      "domain": "shortstr"
    },
    {
      "name": "routingKey",
      "domain": "shortstr"
    }
  ],
    "methodIndex": 60,
    "classIndex": 60
},
  "basicGet": {
  "name": "basicGet",
    "fields": [
    {
      "name": "reserved1",
      "domain": "short"
    },
    {
      "name": "queue",
      "domain": "shortstr"
    },
    {
      "name": "noAck",
      "domain": "bit"
    }
  ],
    "methodIndex": 70,
    "classIndex": 60
},
  "basicGetOk": {
  "name": "basicGetOk",
    "fields": [
    {
      "name": "deliveryTag",
      "domain": "longlong"
    },
    {
      "name": "redelivered",
      "domain": "bit"
    },
    {
      "name": "exchange",
      "domain": "shortstr"
    },
    {
      "name": "routingKey",
      "domain": "shortstr"
    },
    {
      "name": "messageCount",
      "domain": "long"
    }
  ],
    "methodIndex": 71,
    "classIndex": 60
},
  "basicGetEmpty": {
  "name": "basicGetEmpty",
    "fields": [
    {
      "name": "reserved1",
      "domain": "shortstr"
    }
  ],
    "methodIndex": 72,
    "classIndex": 60
},
  "basicAck": {
  "name": "basicAck",
    "fields": [
    {
      "name": "deliveryTag",
      "domain": "longlong"
    },
    {
      "name": "multiple",
      "domain": "bit"
    }
  ],
    "methodIndex": 80,
    "classIndex": 60
},
  "basicReject": {
  "name": "basicReject",
    "fields": [
    {
      "name": "deliveryTag",
      "domain": "longlong"
    },
    {
      "name": "requeue",
      "domain": "bit"
    }
  ],
    "methodIndex": 90,
    "classIndex": 60
},
  "basicRecoverAsync": {
  "name": "basicRecoverAsync",
    "fields": [
    {
      "name": "requeue",
      "domain": "bit"
    }
  ],
    "methodIndex": 100,
    "classIndex": 60
},
  "basicRecover": {
  "name": "basicRecover",
    "fields": [
    {
      "name": "requeue",
      "domain": "bit"
    }
  ],
    "methodIndex": 110,
    "classIndex": 60
},
  "basicRecoverOk": {
  "name": "basicRecoverOk",
    "fields": [],
    "methodIndex": 111,
    "classIndex": 60
},
  "txSelect": {
  "name": "txSelect",
    "fields": [],
    "methodIndex": 10,
    "classIndex": 90
},
  "txSelectOk": {
  "name": "txSelectOk",
    "fields": [],
    "methodIndex": 11,
    "classIndex": 90
},
  "txCommit": {
  "name": "txCommit",
    "fields": [],
    "methodIndex": 20,
    "classIndex": 90
},
  "txCommitOk": {
  "name": "txCommitOk",
    "fields": [],
    "methodIndex": 21,
    "classIndex": 90
},
  "txRollback": {
  "name": "txRollback",
    "fields": [],
    "methodIndex": 30,
    "classIndex": 90
},
  "txRollbackOk": {
  "name": "txRollbackOk",
    "fields": [],
    "methodIndex": 31,
    "classIndex": 90
},
  "confirmSelect": {
  "name": "confirmSelect",
    "fields": [
    {
      "name": "noWait",
      "domain": "bit"
    }
  ],
    "methodIndex": 10,
    "classIndex": 85
},
  "confirmSelectOk": {
  "name": "confirmSelectOk",
    "fields": [],
    "methodIndex": 11,
    "classIndex": 85
}
}

