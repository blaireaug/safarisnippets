(function() {

// App runs inside a sandboxed iframe.
// It cannot access chrome APIs.
// So all communication with it is done via messages.

var appWindow = document.getElementById("app").contentWindow;

function postMessageToApp(message) {
  appWindow.postMessage(message, "*");
}

function handleMessage(event) {
  var message = event.data;
  Object.keys(message).forEach(function(key) {
    var data = message[key];
    switch (key) {
      case "createAudience":
        db.createAudience(data, function() {
          chrome.extension.sendMessage({ audienceCreated: true });
          postMessageToApp({ callback: message._callbackId });
        });
        break;

      case "deleteAudience":
        db.deleteAudience(data, function() {
          chrome.extension.sendMessage({ audienceDeleted: true });
          postMessageToApp({ callback: message._callbackId });
        });
        break;

      case "activateAudience":
        db.activateAudience(data, function() {
          chrome.extension.sendMessage({ audienceActivated: true });
          postMessageToApp({ callback: message._callbackId });
        });
        break;

      case "deactivateAudience":
        db.deactivateAudience(data, function() {
          chrome.extension.sendMessage({ audienceDeactivated: true });
          postMessageToApp({ callback: message._callbackId });
        });
        break;

      case "getSnippets":
        db.getAudience(data, function(audience) {
          postMessageToApp({
            callback: message._callbackId,
            snippets: audience.snippets
          });
        });
        break;

      case "deleteSnippet":
        db.deleteSnippet(data.audienceName, data.snippetIndex);
        break;

      case "openLink":
        chrome.tabs.create({ url: data });
        break;

      default:
        chrome.extension.sendMessage(message);
        break;
    }
  });
}

function init() {
  window.addEventListener("message", handleMessage, false);
  
  db.getAudiences(function(audiences) {
    postMessageToApp({
      init: { audiences: audiences }
    });
  });

  chrome.extension.onMessage.addListener(function(message) {
    if (message.snippetAdded) {
      postMessageToApp(message);
    }
  });
}


setTimeout(init, 500);

}());
