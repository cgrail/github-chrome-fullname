"use strict";

/*global chrome*/
(function() {


  var CACHED_USER_IDS_KEY = "__GH_SAP_CACHED_USER_IDS";

  function loadCachedUserNames() {
    var cachedUserNamesString = localStorage.getItem(CACHED_USER_IDS_KEY);
    var cachedUserNames;

    if (cachedUserNamesString && cachedUserNamesString !== "") {
     cachedUserNames = JSON.parse(cachedUserNamesString);
    } else {
      cachedUserNames = {};
    }
    return cachedUserNames;
  }

  function saveCachedUserNames(userNames) {
      localStorage.setItem(CACHED_USER_IDS_KEY, userNames);
  }

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "loadCachedUserNames") {
      var cachedUserNames = loadCachedUserNames();
      sendResponse({"cachedUserNames": cachedUserNames});
    }
    if (request.action === "saveUserNames" && request.userId && request.userName) {
      var cachedUserNames = loadCachedUserNames();
      cachedUserNames[request.userId] = request.userName;
      saveCachedUserNames(JSON.stringify(cachedUserNames));
    }
  });

})();
