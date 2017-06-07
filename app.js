   var app;
   $(function () {

       var ReadFile = (function () {
           var file = function () {
               this.read = function (f, fn) {
                   var reader = new FileReader();
                   reader.onload = (function (tf) {
                       return function (e) {
                           fn(tf, e.target.result);
                       };
                   })(f);
                   reader.readAsArrayBuffer(f);
               }
           }
           return file;
       }());

       var uid = $("#chat-controls").attr("data-uid");

       var setFullScreen = function (src) {
           var el = $("#fullscreen-video video")[0];
           el.srcObject = src;
       }
       app = new NeoRTC.Conference("wss://webrtc-lab.herokuapp.com");
       app.OnInstantMessage = function (message) {

           var dt = new Date(message.dt);
           var p = $("<p>");
           p.text(message.text);
           var time = $("<time>");
           time.text(dt.getHours().toString() + ":" + dt.getMinutes().toString());
           var uid = $("<mark>");
           uid.text(message.uid);
           $(p).prepend(uid);
           $(p).prepend(time);

           $("#instant-messages").prepend(p);
       }

       $("#share-file").on("change", function (evt) {
           var file = evt.target.files[0];
           var r = new ReadFile();

           r.read(file, function (result, arrayBuffer) {

               var bm = app.sendFile({
                   uid: uid,
                   name: result.name,
                   size: result.size,
                   mimeType: result.type
               }, arrayBuffer);

           });
       });

       app.OnFileReceived = function (fileinfo, buffer) {
           var dt = new Date();
           var p = $("<p>");
           p.text(fileinfo.uid + " shared a file. ");
           var time = $("<time>");
           time.text(dt.getHours().toString() + ":" + dt.getMinutes().toString());

           if (fileinfo.mimeType.indexOf("image/") > -1) {

               var blob = new Blob([buffer], {
                   type: fileinfo.mimeType
               });
               var blobUrl = window.URL.createObjectURL(blob);

               var img = document.createElement("img");
               img.setAttribute("src", blobUrl);
               img.setAttribute("alt", fileinfo.name);

               $(p).append(img);

           } else {

               var blob = new Blob([buffer], {
                   type: fileinfo.mimeType
               });
               var blobUrl = window.URL.createObjectURL(blob);

               var download = $("<a>");
               download.attr("href", blobUrl);
               download.text(fileinfo.name);
               download.attr("download", fileinfo.name);

               $(p).append(download);

           }
           $(p).prepend(time);
           $("#instant-messages").prepend(p);
       };



       app.OnRemoteStream = function (mediaStream) {
           var video = document.createElement("video");
           video.classList.add("remote-stream");
           video.id = mediaStream.id;
           video.srcObject = mediaStream;
           video.oncanplay = function () {
               video.play();
           }
           document.querySelector("#remote-videos").appendChild(video);

           $(video).click(function (evt) {
               setFullScreen(evt.target.srcObject);
           });

       }

       app.OnRemoteStreamlost = function (mediaStreamId) {

           var video = document.querySelector("#" + mediaStreamId);
           document.querySelector("#remote-videos").removeChild(video);
       }

       app.OnReady = function () {

           window.onhashchange = function (hashchange) {
               //        app.ChangeContext(location.hash);
           }
           // add an event listener for the IM thing
           document.querySelector("#instant-message").addEventListener("keydown", function (evt) {
               if (evt.keyCode === 13) {
                   var model = {
                       text: this.value,
                       uid: uid,
                       dt: new Date()
                   };
                   evt.preventDefault();
                   app.sendInstantMessage(model);
                   this.value = "";

                   console.log("do ajax post tp mvc", model);

               }
           });


           var screenShare = function () {
               if (chrome.runtime) {

                   var extensionId = "pjljkkmedcfkbndfjcomilkiibpafaah";
                   var extPort = chrome.runtime.connect(extensionId);

                   if (extPort) {

                       $("#btn-screenshare").removeClass("hide").on("click", function () {
                           extPort.postMessage("show", "dialog");
                       });

                       extPort.onMessage.addListener(function (msg) {

                           var constraints = {
                               video: {
                                   mandatory: {
                                       chromeMediaSource: 'desktop',
                                       chromeMediaSourceId: msg.desktopId,
                                       minWidth: 1280,
                                       maxWidth: 1280,
                                       minHeight: 720,
                                       maxHeight: 720
                                   }
                               }
                           };
                           navigator.getUserMedia(constraints, function (mediaStream) {
                               app.AddLocalStream(mediaStream);

                               var video = document.createElement("video");
                               video.muted = true;
                               video.srcObject = mediaStream;
                               video.oncanplay = function () {
                                   video.play();
                               }
                               video.poster = "//placehold.it/80x80?text=no+video";
                               $("#remote-videos").prepend(video).hide().fadeIn();

                               window.setTimeout(function () {
                                   app.reconnectAll();
                               }, 1500);


                           }, function (err) {
                               console.log(err);
                           });
                       });





                   }
               }

           }

           var joinConference = function (settings) {

               app.getUserMedia(settings, function (mediaStream) {

                   $(".join").fadeOut(function () {
                       $("#conference").removeClass("hide").fadeIn();
                   });

                   app.ChangeContext(location.hash == "" ? "lobby" : location.hash);

                   var video = document.createElement("video");
                   video.muted = true;
                   video.srcObject = mediaStream;

                   video.oncanplay = function () {
                       video.play();
                   }

                   video.poster = "http://placehold.it/80x80?text=no+video";

                   $("#remote-videos").prepend(video).hide().fadeIn();

                   $("#chat-controls").removeClass("hide").fadeIn(function () {});

                   $(video).click(function (evt) {
                       setFullScreen(evt.target.srcObject);
                   });
                   screenShare();
               });

           }

           $("#btn-join-default,#btn-join-av").on("click", function () {

               joinConference({
                   video: true,
                   audio: true
               });

           });

           $("#btn-join-a").on("click", function () {

               joinConference({
                   video: false,
                   audio: true
               });
           });

       }



   });