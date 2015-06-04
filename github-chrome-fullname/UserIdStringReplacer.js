"use strict";

function UserIdStringReplacer(githubUrl) {
    this._userIdRegex = /[di]\d{6}|c\d{7}/gi;
    this._deferredUserMap = {};
    this.githubUserApiUrl = githubUrl + "/api/v3/users/";
}

UserIdStringReplacer.prototype.replaceUserIds = function(sourceString) {
    var deferedConvertedString = jQuery.Deferred();
    var convertedString = sourceString;

    if (!sourceString || sourceString.trim().length === 0) {
        return deferedConvertedString.resolve(convertedString);
    }

    var aUserIds = sourceString.match(this._userIdRegex);

    if (aUserIds === null || aUserIds.length === 0) {
        return deferedConvertedString.resolve(convertedString);
    }

    var aDistinctUserIDs = this.getDistinctUserIds(aUserIds);

    //Replace the user IDs with the real names
    var convertedUserNamesCounter = 0;
    var replaceUserId = function(userId, userName) {
        convertedUserNamesCounter++;
        if(userName && userName !== userId){
            convertedString = convertedString.replace(userId, userName);
        }
        if (convertedUserNamesCounter === aDistinctUserIDs.length) {
            deferedConvertedString.resolve(convertedString);
        }
    };
    for (var j = 0; j < aDistinctUserIDs.length; j++) {
        this.loadUserName(aDistinctUserIDs[j]).done(replaceUserId);
    }

    //Done
    return deferedConvertedString;
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
        var deferedUserName = jQuery.Deferred();
        this._deferredUserMap[userId] = deferedUserName;
        //Load the real name
        jQuery.ajax({
            url: this.githubUserApiUrl + userId,
            dataType: "json",
            success: function(oData) {
                if (oData.name) {
                    //Check if the user entered a real name
                    deferedUserName.resolve(userId, oData.name);
                } else {
                    //Otherwise just use the user ID
                    deferedUserName.resolve(userId);
                }
            },
            error: function() {
                deferedUserName.resolve(userId);
            }
        });
    }
    return this._deferredUserMap[userId];
};
