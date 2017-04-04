import { ThorIOClient } from 'thor-io.client-vnext'
import 'webrtc-adapter';




var NeoRTCApp = (function () {

  

    var ctor = function (config) {

        var self = this;
        var factory;

        var rtcConfig = config || {
            iceTransports: 'all',
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302"
                }
            ]
        };

        this.log("Created an instance of RTCApp");

        // We are using the "thor-io.vnext" backed
        // deployed at 'https://webrtclab2.herokuapp.com/'
        var url = "ws://webrtclab2.herokuapp.com";
        factory = new ThorIOClient.Factory(url, ["contextBroker"]);

        factory.OnClose = function (reason) {
            self.log(reason);
        }

        // We are connected to the "backend"
        factory.OnOpen = function (broker) {

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

    ctor.prototype.sendInstantMessage = function (message) {
        this.factory.GetProxy("contextBroker").Invoke("instantMessage",
            message
        );
    }

    ctor.prototype.log = function (message, data) {
        var logEl = document.querySelector("#log-el");
        if (!logEl && console) {
            console.log(message, JSON.stringify(data || {}));
        } else {
            var p = document.createElement("p");
            p.textContent = message + "-" + JSON.stringify(data || {});
            logEl.appendChild(p);
        }
    }


    ctor.prototype.rtcClient = {};
    ctor.prototype.OnLocalStream = function (mediaStream) {
    }
    ctor.prototype.OnReady = function () {
    }
    ctor.prototype.AddLocalStream = function (mediaStream) {
        this.rtcClient.AddLocalStream(mediaStream);
    }
    ctor.prototype.ChangeContext = function (ctx) {
        this.rtcClient.ChangeContext(ctx)
    }


    ctor.prototype.OnInstantMessage = function(instantMessage){
            
    }

    ctor.prototype.OnRemoteStream = function (a, b) {
    }

    ctor.prototype.OnRemoteStreamlost = function (a) {
    }

    ctor.prototype.getUserMedia = function (
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

    return ctor;
})();


export function Conference(config){
        return new NeoRTCApp(config);
}

