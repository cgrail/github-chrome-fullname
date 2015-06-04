"use strict";

function UserIdReplacer(restricter, userIdStringReplacer) {
    this.stringReplacer = userIdStringReplacer;
    this.restricter = restricter;
}

//Crawls through the whole document replacing user IDs with real names
UserIdReplacer.prototype.replaceUserIDs = function() {

    var that = this;

    //Crawl through the whole DOM tree
    jQuery("*", "body")
        .andSelf()
        .contents()
        .each(function() {

            //Check if this is a tooltip type
            if (this.nodeType === 1 && this.attributes.getNamedItem("aria-label")) {
                that.replaceTooltip(jQuery(this));
                return;
            }

            //Check if this is a text type
            if (this.nodeType === 3 && this.nodeValue) {
                that.replaceNode(this);
                return;
            }
        });
};

UserIdReplacer.prototype.replaceTooltip = function(element){
    //Getting the jQuery reference
    var jqElement = jQuery(element);
    var ariaLabel = jqElement.attr("aria-label");
    this.stringReplacer.replaceUserIds(ariaLabel).then(function(replacedAriaLabel){
        jqElement.attr("aria-label", replacedAriaLabel);
    });
};

UserIdReplacer.prototype.replaceNode = function(element){
    //Getting the jQuery reference
    var jqElement = jQuery(element);
    var oldValue = element.nodeValue;
    var that = this;
    this.stringReplacer.replaceUserIds(oldValue).then(function(replacedNodeValue){
        if(!replacedNodeValue || replacedNodeValue.trim().length === 0){
            return;
        }
        if(oldValue === replacedNodeValue){
            return;
        }

        //Check if we are allowed to replace this text
        if (!that.restricter.isReplacementAllowed(jqElement)) {
            return;
        }
        element.nodeValue = replacedNodeValue;
    });
};
