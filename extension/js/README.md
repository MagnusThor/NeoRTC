# Som kind of guide how to develop , install etc


Enable **developer mode** in chrome://extensions/


Install **Develop and Debug Chrome Apps & Extensions.** from 
https://chrome.google.com/webstore/detail/chrome-apps-extensions-de/ohmmkhmmmpcnpikjeljgnaoabkaalbgc?hl=sv

Under chrome://extension choose "Load unpacked extension" , navigate to the root folder of the extension , thats where the manifest.json file is... , after loading successfully you should
see an ID:....  , this is the id of the extension of yours ( see extensionId below in code examples)..




## Connect your NerRTC instance to the extension



    var app = NeRTC.Conference(); 

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

            app.getUserMedia(constraints, function(stream)
            {

            });




        });

          extPort.postMessage("show", "dialog"); // get the video-source dialog


    }

