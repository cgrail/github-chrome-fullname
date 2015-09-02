"use strict";

function UserIdStringReplacer(githubUrl) {
    this._userIdRegex = /[di]\d{6}|c\d{7}/gi;
    this._deferredUserMap = {};
    this.githubUserApiUrl = githubUrl + "/api/v3/users/";
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
        var replaceUserIdPromise = this.loadUserName(userId);
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

//Lazy loads real user names from github
UserIdStringReplacer.prototype.loadUserName = function(userId) {
    //Check if we didn't already load that ID
    if (!this._deferredUserMap[userId]) {
        var githubUserApiUrl = this.githubUserApiUrl;
        var result = {
            userId: userId
        };
        var deferedUserName = fetch(githubUserApiUrl + userId)
        .then(function(result){
            return result.json();
        }).then(function(data){
            //Check if the user entered a real name
            if (data.name) {
                result.userName = data.name;
            }
            return result;
        }).catch(function(){
            return result;
        });
        this._deferredUserMap[userId] = deferedUserName;
    }
    return this._deferredUserMap[userId];
};
