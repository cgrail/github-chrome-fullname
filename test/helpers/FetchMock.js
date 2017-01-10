"use strict";

function FetchMock() {
    this.uninstall();
}

FetchMock.prototype.install = function() {
    var mr = this.mockedRequests;
    window.fetch = function(url) {
        if (!mr[url]) {
            return Promise.reject("No mocked request has been defined for: " + url);
        }
        return Promise.resolve({
            status: mr[url].status,
            json: function() {
                return mr[url];
            }
        });
    };
};

FetchMock.prototype.uninstall = function() {
    delete window.fetch;
    this.mockedRequests = {};
};

FetchMock.prototype.mockRequest = function(url, response, status) {
    response.status = status || 200;
    this.mockedRequests[url] = response;
};

