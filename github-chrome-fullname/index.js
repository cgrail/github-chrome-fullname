(function() {
    "use strict";

    var fullCheckSites = [
        "huboard.mo.sap.corp"
    ];

    /*global ReplaceRestricter, UserIdStringReplacer, UserIdReplacer*/
    var restricter = new ReplaceRestricter();
    var userIdStringReplacer = new UserIdStringReplacer("https://github.wdf.sap.corp");
    var userIdReplacer = new UserIdReplacer(restricter, userIdStringReplacer);

    // Check DOM size every second. After change of DOM elements replace user Ids.
    var lastDomSize;

    var useFullCheck = (fullCheckSites.indexOf(window.location.hostname) !== -1)

    window.setInterval(function() {
        if (!restricter.isAllowedUrl(window.location.href)) {
            return;
        }

        var currentDomSize = useFullCheck ? $('html').html().length : document.getElementsByTagName("*").length;
        if (currentDomSize !== lastDomSize) {
            lastDomSize = currentDomSize;
            userIdReplacer.replaceUserIDs();
        }
    }, 1000);

})();
