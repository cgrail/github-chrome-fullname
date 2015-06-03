(function() {
    "use strict";

    var restricter = new ReplaceRestricter();
    var userIdStringReplacer = new UserIdStringReplacer("https://github.wdf.sap.corp");
    var userIdReplacer = new UserIdReplacer(restricter, userIdStringReplacer);

    // Check DOM size every second. After change of DOM elements replace user Ids.
    var lastDomSize;
    window.setInterval(function() {
        var currentDomSize = document.getElementsByTagName("*").length;
        if (currentDomSize !== lastDomSize) {
            lastDomSize = currentDomSize;
            userIdReplacer.replaceUserIDs();
        }
    }, 1000);

})();
