"use strict";

function ChromeUserNameCache() {
}

ChromeUserNameCache.prototype.cacheUserNames = function(cachedUserNames) {
    chrome.storage.local.set({cachedUserNames: cachedUserNames});
};

ChromeUserNameCache.prototype.getCachedUserNames = function() {
    return new Promise(function(resolve) {
        chrome.storage.local.get("cachedUserNames", function(response) {
            if (response && response.cachedUserNames){
                resolve(response.cachedUserNames);
            }
            resolve({});
        });
    });
};