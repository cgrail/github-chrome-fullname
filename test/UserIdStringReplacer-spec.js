"use strict";

/*global UserIdStringReplacer*/
describe("UserIdStringReplacer", function() {

    var replacer;

    var testUserId1 = "D000001";
    var testUserName1 = "Superman";
    var testUserId2 = "D000002";
    var testUserName2 = "Superwoman";

    beforeEach(function() {
        replacer = new UserIdStringReplacer("https://github.wdf.sap.corp");
        jasmine.Ajax.install();
    });

    var replaceAndAssert = function(act, exp, done){
        replacer.replaceUserIds(act).done(function(replacedValue) {
            expect(replacedValue).toEqual(exp);
            if(done){
                done();
            }
        });
    };

    var stubAjaxRequestForUser = function(userId, userName){
        var response = {
            "name": userName
        };
        jasmine.Ajax.stubRequest(replacer.githubUserApiUrl + userId).andReturn({
            "responseText": JSON.stringify(response)
        });
    };

    afterEach(function() {
        jasmine.Ajax.uninstall();
    });

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
        jasmine.Ajax.stubRequest(replacer.githubUserApiUrl + testUserId1).andReturn({
            "status": "404"
        });
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

    it("should replace multiple userIds with userName", function(done) {
        stubAjaxRequestForUser(testUserId1, testUserName1);
        stubAjaxRequestForUser(testUserId2, testUserName2);
        var givenString = testUserId1 + " has merged commit 1 from " + testUserId2;
        var expectedString = testUserName1 + " has merged commit 1 from " + testUserName2;
        replaceAndAssert(givenString, expectedString, done);
    });

});
