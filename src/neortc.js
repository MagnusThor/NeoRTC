import { ThorIOClient } from 'thor-io.client-vnext'
import 'webrtc-adapter';

var NeoRTCApp = (function () {
    var neoRTC = function (brokerUrl,config) {
        var self = this;
        var factory;

        var rtcConfig = config || {
            "iceTransports": 'all',
            "rtcpMuxPolicy": "require", 
            "bundlePolicy": "max-bundle",
            "iceServers": [
                {
                    "urls": "stun:stun.l.google.com:19302"
                }
            ]
        };
        this.log("Created an instance of NeoRTCApp");
        var url = brokerUrl || "ws://webrtc-lab.herokuapp.com";
        factory = new ThorIOClient.Factory(url, ["neoBroker"]);

        factory.OnClose = function (reason) {
            self.log(reason);
        }

        // We are connected to the "backend"
        factory.OnOpen = function (broker) {
         
            broker.On("fileShare",function(fileInfo,arrayBuffer) { 
                    var arr = new Uint8Array(arrayBuffer);
                    self.OnFileReceived(fileInfo,new Blob([arr],{
                        type: fileInfo.type
                    }),arrayBuffer)
            });

            broker.On("instantMessage",function(im){
                self.OnInstantMessage(im);
            })

            self.log("Got a connection to the broker");
            self.rtcClient = new ThorIOClient.WebRTC(broker, rtcConfig);

            self.rtcClient.OnError = function (err) {
                self.log("rtcClient error", err);
            }
            // When we got a so-called context on the broker
            // OnContextCreated is invoked. And by that
            // this client has a "room/context/space" for 1-n Peer's'
            self.rtcClient.OnContextCreated = function (ctx) {
                self.log("got a context from the broker", ctx);
            }
            // When a local stream is added
            self.rtcClient.OnLocalStream = function (mediaStream) {
                self.OnLocalStream(mediaStream)
            }
            // When we are on a new context, connect to it
            self.rtcClient.OnContextChanged = function (ctx) {
                self.log("OnContextChanged", ctx);

                self.rtcClient.ConnectContext();

            }

            // We lost a remote stream
            self.rtcClient.OnRemoteStreamlost = function (mediaStreamId) {
                self.log("OnRemoteStreamlost", mediaStreamId);
                self.OnRemoteStreamlost(mediaStreamId);
            }

            // When a peer is disconnected
            self.rtcClient.OnContextDisconnected = function (connection) {
                self.log("disconnected from context ", connection)
            }

            // When we are cpnnected to the context
            self.rtcClient.OnContextConnected = function (connection) {
                self.log("connected to context ", connection)
            }

            // When we got a remote media stream
            self.rtcClient.OnRemoteStream = function (mediaStream, connection) {
                self.OnRemoteStream(mediaStream);
            }

            // When we are connected t the backend and the broker, tell the app
            // w can continure with our stuff
            broker.OnOpen = function (ci) {
                self.OnReady();
            }

            // connect to the backend ( broker )
            broker.Connect();

        };
        
        this.factory = factory;
    }

    neoRTC.prototype.sendFile = function(fileInfo,buffer){
      
        var message = new ThorIOClient.Message("fileShare",
                  fileInfo,"neoBroker",buffer);
                    let bm = new ThorIOClient.BinaryMessage(message.toString(),buffer);
                  this.factory.GetProxy("neoBroker").InvokeBinary(bm.Buffer);
    }

    neoRTC.prototype.sendInstantMessage = function (message) {
        this.factory.GetProxy("neoBroker").Invoke("instantMessage",
            message
        );
    }


    neoRTC.prototype.addDataChannel = function(name){
        return this.rtcClient.CreateDataChannel(name)
    }

    neoRTC.prototype.log = function (message, data) {
        var logEl = document.querySelector("#log-el");
        if (!logEl && console) {
            console.log(message, JSON.stringify(data || {}));
        } else {
            var p = document.createElement("p");
            p.textContent = message + "-" + JSON.stringify(data || {});
            logEl.appendChild(p);
        }
    }


    neoRTC.prototype.rtcClient = {};


    neoRTC.prototype.OnFileReceived = function(fileIinfo,blob,buffer){

    }

    neoRTC.prototype.OnLocalStream = function (mediaStream) {
    }
    neoRTC.prototype.OnReady = function () {
    }
    neoRTC.prototype.AddLocalStream = function (mediaStream) {
        this.rtcClient.AddLocalStream(mediaStream);
    }
    neoRTC.prototype.ChangeContext = function (ctx) {
        this.rtcClient.ChangeContext(ctx)
    }


    neoRTC.prototype.OnInstantMessage = function(instantMessage){
            
    }

    neoRTC.prototype.OnRemoteStream = function (a, b) {
    }

    neoRTC.prototype.OnRemoteStreamlost = function (a) {
    }

    neoRTC.prototype.getUserMedia = function (
        constraints,
        cb) {
        var self = this;
        navigator.getUserMedia(constraints, function (mediaStream) {
            cb(mediaStream)
            self.AddLocalStream(mediaStream);

        }, function (err) {
            this.log(err);
        });
    }

    return neoRTC;
})();


export function Conference(config){
        return new NeoRTCApp(config);
}

