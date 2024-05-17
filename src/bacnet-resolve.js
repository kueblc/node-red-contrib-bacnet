/*
 The MIT License

 Copyright (c) 2024 Colin Kuebler (kueblc)
 All rights reserved.
 node-red-contrib-bacnet
 */
'use strict'

module.exports = function (RED) {
  function BACnetResolve (config) {
    const node = this
    RED.nodes.createNode(node, config)

    node.name = config.name
    node.connector = RED.nodes.getNode(config.server)

    if (node.connector) {
      node.status({ fill: 'green', shape: 'dot', text: 'active' })
    }

    node.on('input', function (msg) {
      if (!node.connector) {
        node.error(new Error('Client Not Ready To Read'), msg)
        return
      }

      node.connector.getDeviceAddressById(
        msg.payload.deviceId,
        function ({ address, net, adr }) {
          msg.payload.deviceIPAddress = { address, net, adr }
          node.send(msg)
        }
      )
    })
  }

  RED.nodes.registerType('BACnet-Resolve', BACnetResolve)
}
