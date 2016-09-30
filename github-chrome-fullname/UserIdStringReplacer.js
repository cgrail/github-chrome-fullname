"use strict";

/*global chrome*/
function UserIdStringReplacer(githubUrl) {
    this._userIdRegex = /[di]\d{6}|c\d{7}/gi;
    this._deferredUserMap = {};
    this._cachedUsers = {};
    this.githubUserApiUrl = githubUrl + "/api/v3/users/";
    this.preloadUserNamesPromise = this.preloadUserNames();
}

UserIdStringReplacer.prototype.replaceUserIds = function(sourceString) {
    var convertedString = sourceString;

    if (!sourceString || sourceString.trim().length === 0) {
        return Promise.resolve(convertedString);
    }

    var aUserIds = sourceString.match(this._userIdRegex);

    if (aUserIds === null || aUserIds.length === 0) {
        return Promise.resolve(convertedString);
    }

    var aDistinctUserIDs = this.getDistinctUserIds(aUserIds);

    //Replace the user IDs with the real names
    var replaceUserId = function(result) {
        if(result && result.userName && result.userName !== result.userId){
            convertedString = convertedString.replace(result.userId, result.userName);
        }
    };
    var replacedUserIdsPromise = [];
    aDistinctUserIDs.forEach(function(userId){
        var replaceUserIdPromise = this.getUserName(userId);
        replaceUserIdPromise.then(replaceUserId);
        replacedUserIdsPromise.push(replaceUserIdPromise);
    }, this);

    return Promise.all(replacedUserIdsPromise).then(function(){
        return convertedString;
    });
};

UserIdStringReplacer.prototype.getDistinctUserIds = function(userIds) {
    //Create a distinct set of user IDs
    var oUserIDs = {};
    for (var i = 0; i < userIds.length; i++) {
        oUserIDs[userIds[i]] = true;
    }
    var aDistinctUserIDs = Object.keys(oUserIDs);
    return aDistinctUserIDs;
};

UserIdStringReplacer.prototype.getUserName = function(userId) {
    return this.preloadUserNamesPromise.then(function() {
        return this.loadUserName(userId);
    }.bind(this));
};

//Lazy loads real user names from github
UserIdStringReplacer.prototype.loadUserName = function(userId) {
    //Check if we didn't already load that ID
    if (this._cachedUsers[userId]) {
        var userName = this._cachedUsers[userId];
        this._deferredUserMap[userId] = new Promise(function(resolve) {
            resolve({
                userId: userId,
                userName: userName
            });
        });
    }
    if (!this._deferredUserMap[userId]) {
        var githubUserApiUrl = this.githubUserApiUrl;
        var result = {
            userId: userId
        };
        var that = this;
        this._deferredUserMap[userId] = fetch(githubUserApiUrl + userId)
            .then(function(response){
                return response.json();
            }).then(function(data){
                //Check if the user entered a real name
                if (data.name) {
                    result.userName = data.name;
                    that.cacheUserNames(userId, result.userName);
                }
                return result;
            }).catch(function(){
                return result;
            });
    }
    return this._deferredUserMap[userId];
};

UserIdStringReplacer.prototype.cacheUserNames = function (userId, userName) {
    this._cachedUsers[userId] = userName;
    chrome.storage.local.set({"cachedUserNames": this._cachedUsers});
};

UserIdStringReplacer.prototype.preloadUserNames = function() {
    return new Promise(function(resolve) {
        chrome.storage.local.get("cachedUserNames", function(result) {
            resolve(result);
        });
    }).then(function(response) {
        if (response && response.cachedUserNames){
            this._cachedUsers = response.cachedUserNames;
        }
    }.bind(this));
};
