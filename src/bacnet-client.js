/*
 The MIT License

 Copyright (c) 2017,2018,2019,2020,2021,2022,2023,2024 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-bacnet
 */
'use strict'

module.exports = function (RED) {
  const bacnetCore = require('./core/bacnet-core')
  const BACnet = require('node-bacnet')

  function BACnetClient (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.adpuTimeout = parseInt(config.adpuTimeout) || 6000
    this.port = parseInt(config.port) || 47808
    this.interface = config.interface || '0.0.0.0'
    this.broadcastAddress = config.broadcastAddress || '0.0.0.255'

    const node = this
    node.devices = []
    node.nmap = {}
    node.pendingResolution = {}

    function setupClient () {
      node.client = new BACnet({ adpuTimeout: node.adpuTimeout, port: node.port, interface: node.interface, broadcastAddress: node.broadcastAddress })

      node.client.on('iAm', (device) => {
        node.devices.push(device)
        bacnetCore.internalDebugLog('iAm Event', device)
        node.cacheDeviceAddress(device)
      })

      node.client.on('timeout', function () {
        bacnetCore.internalDebugLog('timeout')
      })

      node.client.whoIs()

      node.client.on('error', function (err) {
        node.error(err, { payload: 'BACnet Client Error' })
        node.client.close()
        node.client = null
        node.devices = []
        setupClient()
      })
    }

    setupClient()

    node.on('input', function (msg) {
      msg.devices = node.devices
      node.send(msg)
    })

    node.on('close', function (done) {
      if (node.client) {
        node.client.close()
        node.client = null
      }
      done()
    })

    node.whoIsExplicit = function (lowLimit, highLimit, deviceIPAddress, cb) {
      node.devices = []
      const options = {
        lowLimit,
        highLimit,
        deviceIPAddress
      }
      node.client.whoIs(options)
      setTimeout(cb, 3000)
    }

    node.whoIs = function (cb) {
      node.devices = []
      node.client.whoIs()
      setTimeout(cb, 3000)
    }

    node.cacheDeviceAddress = function (device) {
      const { deviceId } = device.payload
      const { address, net, adr } = device.header.sender
      const deviceAddress = {
        address,
        net,
        adr,
        lastUpdated: Date.now()
      }
      node.nmap[deviceId] = deviceAddress

      if (deviceId in node.pendingResolution) {
        const pending = node.pendingResolution[deviceId]
        delete node.pendingResolution[deviceId]
        for (const cb of pending) {
          cb(deviceAddress)
        }
      }
    }

    node.getDeviceAddressById = function (deviceId, cb) {
      if (deviceId in node.nmap) {
        const deviceAddress = node.nmap[deviceId]
        cb(deviceAddress)
      } else {
        console.log('getDeviceAddressById cache miss', deviceId)
        const pending = node.pendingResolution[deviceId] = node.pendingResolution[deviceId] || []
        if (pending.push(cb) === 1) {
          node.client.whoIs({
            lowLimit: deviceId,
            highLimit: deviceId
          })
        }
      }
    }
  }

  RED.nodes.registerType('BACnet-Client', BACnetClient)
}
