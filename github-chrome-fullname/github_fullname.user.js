(function() {
    "use strict";

    var replacer = new UserIdReplacer("https://github.wdf.sap.corp");
    var restricter = new ReplaceRestricter();

    function replaceTooltip(element){
        //Getting the jQuery reference
        var jqElement = jQuery(element);
        var ariaLabel = jqElement.attr("aria-label");
        replacer.replaceUserIds(ariaLabel).done(function(replacedAriaLabel){
            // The promise might be resolved after a navigation and destruction of the current DOM node
            if (!jqElement) {
                return;
            }
            jqElement.attr("aria-label", replacedAriaLabel);
        });
    }

    function replaceNode(element){
        //Getting the jQuery reference
        var jqElement = jQuery(element);
        replacer.replaceUserIds(element.nodeValue).done(function(replacedNodeValue){
            // The promise might be resolved after a navigation and destruction of the current DOM node
            if (!element) {
                return;
            }
            //Check if we are allowed to replace this text
            if (!restricter.isReplacementAllowed(jqElement)) {
                return;
            }
            element.nodeValue = replacedNodeValue;
        });
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
                    replaceTooltip(jQuery(this));
                    return;
                }

                //Check if this is a text type
                if (this.nodeType === 3 && this.nodeValue) {
                    replaceNode(this);
                    return;
                }
            });

    }

    // Check DOM size every second. After change of DOM elements replace user Ids.
    var lastDomSize;
    window.setInterval(function() {
        if (!restricter.isAllowedUrl(window.location.href)) {
            return;
        }
        var currentDomSize = document.getElementsByTagName("*").length;
        if (currentDomSize !== lastDomSize) {
            lastDomSize = currentDomSize;
            replaceUserIDs();
        }
    }, 1000);

})();
