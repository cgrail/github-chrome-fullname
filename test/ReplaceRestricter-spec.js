"use strict";

/*global ReplaceRestricter, sandbox, loadFixtures*/
describe("ReplaceRestricterTest", function() {

    var restricter;

    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = "test/fixtures";
        restricter = new ReplaceRestricter();
    });

    it("should not be allowed to replace an empty element", function() {
        expect(restricter.isReplacementAllowed()).toBe(false);
    });

    it("should be allowed to replace a standalone element", function() {
        var testElement = sandbox();
        expect(restricter.isReplacementAllowed(testElement)).toBe(true);
    });

    it("should be allowed to replace a simple User Id", function() {
        loadFixtures("testGithubCommits.html");
        expect(restricter.isReplacementAllowed(jQuery("#simpleUserId"))).toBe(true);
    });

    it("should not be allowed to replace an element which is part of a formContent", function() {
        loadFixtures("testGithubCommits.html");
        expect(restricter.isReplacementAllowed(jQuery("#elementWithFormContentAsParent"))).toBe(false);
    });

    it("should not be allowed to replace an element which is a vcard", function() {
        loadFixtures("testGithubCommits.html");
        expect(restricter.isReplacementAllowed(jQuery("#vcardUserName"))).toBe(false);
    });

    it("create a new issue is not an allowed url", function() {
        expect(restricter.isAllowedUrl("http://corporate.github/issues/new")).toBe(false);
    });

    it("view commits is an allowed url", function() {
        expect(restricter.isAllowedUrl("http://corporate.github/sample/commits/master")).toBe(true);
    });

});
