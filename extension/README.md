# Some kind of guide how install


Enable **developer mode** in chrome://extensions/


Install **Develop and Debug Chrome Apps & Extensions.** from 
https://chrome.google.com/webstore/detail/chrome-apps-extensions-de/ohmmkhmmmpcnpikjeljgnaoabkaalbgc?hl=sv

Under chrome://extension choose "Load unpacked extension" , navigate to the root folder of the extension , thats where the manifest.json file is... , after loading successfully you should
see an ID:....  , this is the id of the extension of yours ( see extensionId below in code examples)..

## Connect your NeoRTC instance to the extension


    var app = NeRTC.Conference(url); 

    if (chrome.runtime) {
        var extensionId = "lelhnjfbpedmhkniggeecbammdhpfeik"; // replace with your extensionId
        var extPort = chrome.runtime.connect(extensionId);

        extPort.onMessage.addListener(function (data) {

            var constraints = {
            audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: data.desktopId,
                        minWidth: 1280,
                        maxWidth: 1280,
                        minHeight: 720,
                        maxHeight: 720
                    }
                }
            };

                 navigator.getUserMedia(constraints, function (mediaStream) {  

                     app.AddLocalStream(mediaStream);

                 },function(err){});   
        

        });

          extPort.postMessage("show", "dialog"); // get the video-source dialog


    }

