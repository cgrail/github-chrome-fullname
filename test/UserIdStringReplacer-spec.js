"use strict";

/*global UserIdStringReplacer*/
describe("UserIdStringReplacer", function() {

    var replacer;

    var testUserId1 = "D000001";
    var testUserName1 = "Superman";
    var testUserId2 = "D000002";
    var testUserName2 = "Superwoman";
    var testUserId3 = "D000003";
    var testUserName3 = "Cacheman";
    var fetchMock = new FetchMock();
    var userNameCacheMock = {
        getCachedUserNames: function () {
            return new Promise(function(resolve) {
                var cache = {};
                cache[testUserId3] = testUserName3;
                resolve(cache);
            });
        },
        cacheUserNames: function() {

        }
    };

    beforeEach(function() {
        replacer = new UserIdStringReplacer("https://github.wdf.sap.corp", userNameCacheMock);
        fetchMock.install();
        window.chrome = {
            storage: {
                local: {
                    get: function(key, fn){
                        fn();

                    },
                    set: function(key){

                    }
                }
            }
        };
    });

    afterEach(function() {
        fetchMock.uninstall();
    });

    var replaceAndAssert = function(act, exp, done){
        replacer.replaceUserIds(act).then(function(replacedValue) {
            window.setTimeout(function(){
                expect(replacedValue).toEqual(exp);
                if(done){
                    done();
                }
            }, 10);
        });
    };

    var stubAjaxRequestForUser = function(userId, userName){
        var response = {
            "name": userName
        };
        fetchMock.mockRequest(replacer.githubUserApiUrl + userId, response);
    };

    it("should return an empty string for an empty string", function(done) {
        replaceAndAssert("", "", done);
    });


    it("should return the same string if no userId is contained", function(done) {
        var testString = "Hallo Welt wie geht es dir?";
        replaceAndAssert(testString, testString, done);
    });

    it("should should return the string with the userId if no userName is defined", function(done) {
        stubAjaxRequestForUser(testUserId1, undefined);
        replaceAndAssert(testUserId1, testUserId1, done);
    });


    it("should should return the string with the userId when the backend call fails", function(done) {
        replaceAndAssert(testUserId1, testUserId1, done);
    });

    it("should replace a userId with the userName", function(done) {
        stubAjaxRequestForUser(testUserId1, testUserName1);
        replaceAndAssert(testUserId1, testUserName1, done);
    });

    it("should not call the backend twice for the same userId", function(done) {
        stubAjaxRequestForUser(testUserId1, testUserName1);
        replaceAndAssert(testUserId1, testUserName1);
        replaceAndAssert(testUserId1, testUserName1, done);
    });

    it("should not replace a userId when the backend returns no userName", function(done) {
        stubAjaxRequestForUser(testUserId1, "");
        replaceAndAssert(testUserId1, testUserId1, done);
    });

    it("should not call the backend when the userName is already cached", function(done) {
        replaceAndAssert(testUserId3, testUserName3, done);
    });

    it("should replace multiple userIds with userName", function(done) {
        stubAjaxRequestForUser(testUserId1, testUserName1);
        stubAjaxRequestForUser(testUserId2, testUserName2);
        var givenString = testUserId1 + " has merged commit 1 from " + testUserId2;
        var expectedString = testUserName1 + " has merged commit 1 from " + testUserName2;
        replaceAndAssert(givenString, expectedString, done);
    });

});
