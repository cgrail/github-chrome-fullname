(function() {
    "use strict";

    var allowedSites = [
        "github.wdf.sap.corp",
        "huboard.mo.sap.corp"
    ];

    /*global ReplaceRestricter, UserIdStringReplacer, UserIdReplacer*/
    var restricter = new ReplaceRestricter();
    var userIdStringReplacer = new UserIdStringReplacer("https://github.wdf.sap.corp");
    var userIdReplacer = new UserIdReplacer(restricter, userIdStringReplacer);

    // Check DOM size every second. After change of DOM elements replace user Ids.
    var lastDomSize;

    var parser = document.createElement('a');
    parser.href = window.location.href;

    var hostname = parser.hostname;
    if (allowedSites.indexOf(hostname) === -1) {
      return;
    }

    window.setInterval(function() {
        if (!restricter.isAllowedUrl(window.location.href)) {
            return;
        }
        var currentDomSize = document.getElementsByTagName("*").length;
        if (currentDomSize !== lastDomSize) {
            lastDomSize = currentDomSize;
            userIdReplacer.replaceUserIDs();
        }
    }, 1000);

})();
