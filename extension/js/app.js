var ports = {}
var listeners = {};
var contextMenuID = '4353455656';
var currentPort;

chrome.contextMenus.create({
    title: 'Share window,tab or desktop',
    id: contextMenuID
}, function () {
    chrome.contextMenus.onClicked.addListener(captureDesktop);
});

function captureDesktop(portId) {
    currentPort = portId;
    chrome.tabs.query({
        active: true
    }, function (t) {
        chrome.desktopCapture.chooseDesktopMedia(["screen", "window"], t[0], onApproved);
    });
}

function onApproved(desktopId) {
    if (!desktopId) {
        return;
    }
    if (listeners.hasOwnProperty("postDesktopId")) listeners["postDesktopId"](desktopId);
}
chrome.runtime.onConnectExternal.addListener(function (port) {
    var portId_ = port.portId_;
    ports[portId_] = port;
    port.onDisconnect.addListener(function () {
        delete ports[portId_];
    });
    port.onMessage.addListener(function (message, sender) {
        captureDesktop();
        listeners["postDesktopId"] = function (a) {
            ports[port.portId_].postMessage({
                desktopId: a
            });
        };
    });
});