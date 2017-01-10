"use strict";

/*global UserIdReplacer, loadFixtures*/
describe("UserIdReplacer", function() {

    var replacer;
    var userIdStringReplacer;

    var testUserId1 = "d000007";
    var testUserName1 = "Superman";
    var fetchMock = new FetchMock();
    var userNameCacheMock = {
        getCachedUserNames: function () {
            return new Promise(function(resolve) {
                resolve({});
            });
        },
        cacheUserNames: function() {

        }
    };

    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = "test/fixtures";
        var restricter = new ReplaceRestricter();
        userIdStringReplacer = new UserIdStringReplacer("https://github.wdf.sap.corp", userNameCacheMock);
        replacer = new UserIdReplacer(restricter, userIdStringReplacer);
        fetchMock.install();
        window.chrome = {
            storage: {
                local: {
                    get: function(key, fn){
                        fn();

                    }
                }
            }
        };
    });

    afterEach(function() {
        fetchMock.uninstall();
    });

    it("it should replace all user Ids on the page", function(done) {
        loadFixtures("testGithubCommits.html");
        var response = {
            "name": testUserName1
        };

        fetchMock.mockRequest(userIdStringReplacer.githubUserApiUrl + testUserId1, response);

        // Execute
        replacer.replaceUserIDs();
        window.setTimeout(function(){
            expect(jQuery("*:contains(\"Superman\")").length).toEqual(48);
            done();
        }, 1);

    });

});
