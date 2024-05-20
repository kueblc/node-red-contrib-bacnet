"use strict";module.exports=function(r){var a=require("./core/bacnet-core");r.nodes.registerType("BACnet-Read",function(e){r.nodes.createNode(this,e),this.name=e.name,this.objectType=parseInt(e.objectType),this.propertyId=parseInt(e.propertyId),this.multipleRead=e.multipleRead,e.instance?(this.instance=r.nodes.getNode(e.instance),this.objectInstance=this.instance.instanceAddress):this.objectInstance=0,e.device?(this.device=r.nodes.getNode(e.device),this.deviceIPAddress=this.device.deviceAddress):this.deviceIPAddress="127.0.0.1",this.connector=r.nodes.getNode(e.server);var d=this;d.status({fill:"green",shape:"dot",text:"active"}),d.on("input",function(t){if(d.connector){var e=t.payload.options||{};if(d.multipleRead){a.internalDebugLog("Multiple Read");var r=[{objectId:{type:d.objectType,instance:parseInt(d.objectInstance)},properties:[{id:parseInt(d.propertyId)}]}];try{a.internalDebugLog("readProperty node.deviceIPAddress: "+d.deviceIPAddress),a.internalDebugLog("readProperty msg.payload.deviceIPAddress: "+t.payload.deviceIPAddress),a.internalDebugLog("readPropertyMultiple default requestArray: "+JSON.stringify(r)),a.internalDebugLog("readPropertyMultiple msg.payload.requestArray: "+JSON.stringify(t.payload.requestArray)),a.internalDebugLog("readPropertyMultiple node.propertyId: "+d.propertyId),a.internalDebugLog("readPropertyMultiple msg.payload.propertyId: "+t.payload.propertyId)}catch(e){a.internalDebugLog("readPropertyMultiple error: "+e)}d.connector.client.readPropertyMultiple(t.payload.deviceIPAddress||d.deviceIPAddress,t.payload.requestArray||r,e,function(e,r){e?(e=a.translateErrorMessage(e),a.internalDebugLog(e),d.error(e,t)):(t.input=t.payload,t.payload=r,d.send(t))})}else{a.internalDebugLog("Read");r={type:parseInt(d.objectType),instance:parseInt(d.objectInstance)};try{a.internalDebugLog("readProperty node.deviceIPAddress: "+d.deviceIPAddress),a.internalDebugLog("readProperty msg.payload.deviceIPAddress: "+t.payload.deviceIPAddress),a.internalDebugLog("readProperty default objectId: "+JSON.stringify(r)),a.internalDebugLog("readProperty msg.payload.objectId: "+JSON.stringify(t.payload.objectId)),a.internalDebugLog("readProperty node.propertyId: "+d.propertyId),a.internalDebugLog("readProperty msg.payload.propertyId: "+t.payload.propertyId)}catch(e){a.internalDebugLog("readProperty error: "+e)}d.connector.client.readProperty(t.payload.deviceIPAddress||d.deviceIPAddress,t.payload.objectId||r,parseInt(t.payload.propertyId)||parseInt(d.propertyId),e,function(e,r){e?(e=a.translateErrorMessage(e),a.internalDebugLog(e),d.error(e,t)):(t.input=t.payload,t.payload=r,d.send(t))})}}else d.error(new Error("Client Not Ready To Read"),t)})})};
//# sourceMappingURL=maps/bacnet-read.js.map
