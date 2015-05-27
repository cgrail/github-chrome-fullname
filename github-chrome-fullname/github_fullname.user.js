(function() {
    "use strict";

    // Matches the following user User Ids D012345, d012345, I012345, i012345, C0123456, c0123456
    var userIdRegex = /[di]\d{6}|c\d{7}/gi;

    //Mapping User IDs to real Names
    var oUserMap = {};

    var aUrlExceptions = [
        "issues/new" // Create new issue. If replace is executed on this page it will slow down the whole browser.
    ];

    // List of all "exceptions" (criteria, when a user ID should NOT be replaced by the real name)
    var aExceptions = [{
        "parents": "#wiki-body"
    }, {
        "parents": "textarea"
    }, {
        "parents": ".ace_editor"
    }, {
        "parents": ".form-content" // Edit comment text area
    }, {
        "self": ".vcard-username"
    }];

    function isAllowedUrl(){
        var currentUrl = window.location.href;
        for (var i = 0; i < aUrlExceptions.length; i++) {
            if(currentUrl.indexOf(aUrlExceptions[i]) !== -1){
                return false;
            }
        }
        return true;
    }

    //Checks if a jQuery element fulfills any of the replacement exceptions
    function replacementAllowed(jqOccurrence) {
        //Check if this text matches the criteria for any of the "exceptions"
        for (var i = 0; i < aExceptions.length; i++) {
            //Instead of writing a massive if-elseif-elseif-elseif-else, you can also reverse a switch statement like this.
            //Technically the two are identical, but this looks a bit cleaner to me
            switch (true) {
                case (aExceptions[i].parents ? jqOccurrence.parents(aExceptions[i].parents).length > 0 : false):
                    //Replacement not allowed
                    return false;

                case (aExceptions[i].self ? jqOccurrence.parent().parent().children(aExceptions[i].self).length > 0 : false):
                    //Replacement not allowed
                    return false;

                case (aExceptions[i].children ? jqOccurrence.children(aExceptions[i].children).length > 0 : false):
                    //Replacement not allowed
                    return false;

                default:
                    //Check the next exception
                    continue;
            }
        }

        //All exceptions passed / do not apply
        return true;
    }

    //Lazy loads real user names from github
    function loadUserName(userId) {
        //Check if we didn't already load that ID
        if (!oUserMap[userId]) {
            var deferedUserName = jQuery.Deferred();
            oUserMap[userId] = deferedUserName;
            //Load the real name
            jQuery.ajax({
                url: "https://github.wdf.sap.corp/api/v3/users/" + userId,
                dataType: "json",
                success: function(oData) {
                    //Check if the user entered a real name
                    if (oData.name) {
                        deferedUserName.resolve(oData.name);
                    }
                    //Otherwise just use the user ID
                    else {
                        deferedUserName.resolve(userId);
                    }
                },
                error: function() {
                    deferedUserName.resolve(userId);
                }
            });
        }
        return oUserMap[userId];
    }

    //Takes a string, replaces all user IDs with real names
    function getConvertedString(sString, aUserIDs) {

        var deferedConvertedString = jQuery.Deferred();
        var convertedString = sString;

        //Create a distinct set of user IDs
        var oUserIDs = {};
        for (var i = 0; i < aUserIDs.length; i++) {
            oUserIDs[aUserIDs[i]] = true;
        }
        var aDistinctUserIDs = Object.keys(oUserIDs);
        var convertedUserNamesCounter = 0;

        //Replace the user IDs with the real names
        for (var i = 0; i < aDistinctUserIDs.length; i++) {
            var userId = aDistinctUserIDs[i];
            loadUserName(userId).done(function(userName){
                convertedUserNamesCounter++;
                if (userName) {
                    convertedString = convertedString.replace(userId, userName);
                }
                if(convertedUserNamesCounter === aDistinctUserIDs.length){
                    deferedConvertedString.resolve(convertedString);
                }
            });
        }

        //Done
        return deferedConvertedString;
    }

    //Crawls through the whole document replacing user IDs with real names
    function replaceUserIDs() {
        //Crawl through the whole DOM tree
        jQuery("*", "body")
            .andSelf()
            .contents()
            .each(function() {

                //Check if this is a tooltip type
                if (this.nodeType === 1 && this.attributes.getNamedItem("aria-label")) {
                    //Getting the jQuery reference
                    var jqThis = jQuery(this);

                    //Check if there are user IDs
                    var aUserIds = jqThis.attr("aria-label").match(userIdRegex);
                    if (aUserIds) {
                        //Replace the tooltip
                        getConvertedString(jqThis.attr("aria-label"), aUserIds).done(function(convertedString){
                            jqThis.attr("aria-label", convertedString);
                        });
                    }

                    //Continue with the next node
                    return;
                }

                //Check if this is a text type
                if (this.nodeType === 3 && this.nodeValue) {

                    //Check if there are user IDs
                    var aUserIds = this.nodeValue.match(userIdRegex);
                    if (aUserIds) {
                        //Getting the jQuery reference
                        var jqThis = jQuery(this);
                        var currentNode = this;
                        //Check if we are allowed to replace this text
                        if (replacementAllowed(jqThis)) {
                            //Replace the text
                            getConvertedString(currentNode.nodeValue, aUserIds).done(function(convertedString){
                                currentNode.nodeValue = convertedString;
                            });

                        }
                    }

                    //Continue with the next node
                    return;
                }
            });

    }

    // Check DOM size every second. After change of DOM elements replace user Ids.
    var lastDomSize;
    window.setInterval(function () {
        if(!isAllowedUrl()){
            return;
        }
        var currentDomSize =document.getElementsByTagName("*").length;
        if (currentDomSize != lastDomSize) {
          lastDomSize = currentDomSize;
          replaceUserIDs();
        }
    }, 1000);

})();
