"use strict";

describe("BackgroundTest", function () {

    var backgroundListener;

    beforeEach(function () {
        jasmine.getFixtures().fixturesPath = "test/fixtures";
        window.chrome = {
            runtime: {
                onMessage: {
                    addListener: function (listener) {
                        backgroundListener = listener;
                    }
                }
            }
        };
    });

    it("should cache valid user names", function () {
        var sendResponseCalled = false;
        backgroundListener({
                action: "saveUserNames"
            }, {},
            function () {
                sendResponseCalled = true;
            }
        );

        expect(sendResponseCalled).toBe(true);
    });

});
