# NeoRTC



# Installation

TBD

# Documentation

## NeoRTC.Conference(settings:RTCConfig): NeoRTC.App

    var app = new NeoRTC.Conference();


### NeoRTC.Settings

TBD

defaults to 

        {
            iceTransports: 'all',
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302"
                }
            ]
        }


## Methods


### getUserMedia(constaints:MediaStreamConstraints,callback(mediastream):Function): void


When you call getUserMedia the browser prompts the clients for
mediastream access based on the constaints parameter.

            app.getUserMedia( { video: true, audio: false },
                function (mediaStream) {
                    // do op's with mediaStream
            });

### ChangeContext(ctx:string)

TBD

    app.ChangeContext("foo") ;


### AddLocalStream(mediaStream:MediaStream):void

Add a mediastream to the local peer. the mediastream's you
add will be shared with the other peers on the same context.


    app.AddLocalStream(mediaStream);


### sendInstantMessage(message:any): void

When you call sendInstantMessage you will pass the message:any
to all clients connected to the same context.

    app.sendInstantMessage({text:'Hello from Chat'})


## Events

### OnReady(): void

Fires when the NeoRTC.Conference is connected to the backend (service).

    app.OnReady = function () {
            // do op
     }  

### OnLocalStream(mediaStream;MediaStream): void

Fires when a local stream is added.

### OnRemoteStream(mediaStream:MediaStream,connection:PeerConnection)

Fires when a remote mediastream is available.


### OnRemoteStreamlost(mediastreamId:string): void

Fires when a mediastream is lost.












