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
        "parents": ".merge-pr-more-commits" // Comment for fork: Add more commits by pushing to the
    }, {
        "parents": "code" // No replace for anything which seems like code
    }, {
        "parents": "pre" // No replace for anything that is preformatted
    }, {
        "parents": ".protip" // Exclude protip
    }, {
        "parents": ".blob-wrapper" // exclude github blobs
    }, {
        "self": ".vcard-username"
    }];
    // List of all elements which should be included even if other rules might restrict them. Introduced for author in code comments which was exclued by the exlusion of ".blob-wrapper"
    this.alwaysIncludedElements = [{
        "parents": "a.author"
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
    //Check if the dom element should be included even if a restriction rule would not include it.
    for (var i = 0; i < this.alwaysIncludedElements.length; i++) {
        if((this.alwaysIncludedElements[i].parents ? jqElement.parents(this.alwaysIncludedElements[i].parents).length > 0 : false)){
            return true;
        }
    }
    //Check if this text matches the criteria for any of the "exceptions"
    for (var i = 0; i < this.restrictedElements.length; i++) {
        if((this.restrictedElements[i].parents ? jqElement.parents(this.restrictedElements[i].parents).length > 0 : false)){
            return false;
        } else if(this.restrictedElements[i].self ? jqElement.parent().parent().children(this.restrictedElements[i].self).length > 0 : false){
            return false;
        }
    }
    //All exceptions passed / do not apply
    return true;
};
