"use strict";

function ReplaceRestricter() {
    this.restrictedUrls = [
        "issues/new" // Create new issue. If replace is executed on this page it will slow down the whole browser.
    ];
    // List of all "exceptions" (criteria, when a user ID should NOT be replaced by the real name)
    this.restrictedElements = [{
        "parents": "#wiki-body"
    }, {
        "parents": "textarea"
    }, {
        "parents": ".ace_editor"
    }, {
        "parents": ".form-content" // Edit comment text area
    }, {
        "parents": ".copyable-terminal" // UserIds which are commands for the terminal shouldn't be replaced
    }, {
        "parents": ".commit-ref" // Visible remote branch name. It should be able to use this name in the terminal
    }, {
        "self": ".vcard-username"
    }];
}

ReplaceRestricter.prototype.isAllowedUrl = function(currentUrl) {
    for (var i = 0; i < this.restrictedUrls.length; i++) {
        if (currentUrl.indexOf(this.restrictedUrls[i]) !== -1) {
            return false;
        }
    }
    return true;
};

//Checks if a jQuery element fulfills any of the replacement exceptions
ReplaceRestricter.prototype.isReplacementAllowed = function(jqElement) {
    if(!jqElement){
        return false;
    }
    //Check if this text matches the criteria for any of the "exceptions"
    for (var i = 0; i < this.restrictedElements.length; i++) {
        //Instead of writing a massive if-elseif-elseif-elseif-else, you can also reverse a switch statement like this.
        //Technically the two are identical, but this looks a bit cleaner to me
        switch (true) {
            case (this.restrictedElements[i].parents ? jqElement.parents(this.restrictedElements[i].parents).length > 0 : false):
                //Replacement not allowed
                return false;

            case (this.restrictedElements[i].self ? jqElement.parent().parent().children(this.restrictedElements[i].self).length > 0 : false):
                //Replacement not allowed
                return false;

            default:
                //Check the next exception
                continue;
        }
    }
    //All exceptions passed / do not apply
    return true;
};
