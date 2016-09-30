module.exports = function(grunt) {
    "use strict";

    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-coveralls");
    grunt.loadNpmTasks("grunt-notify");

    grunt.initConfig({
        eslint: {
            options: {
                envs: ["browser", "jasmine"],
                globals: ["jQuery"],
                rules: {
                    "global-strict": 0,
                    "no-underscore-dangle": 0,
                    "new-cap": 0,
                    "no-loop-func": 0,
                    "no-undef": 0
                }
            },
            target: [
                "github-chrome-fullname/*.js",
                "test/**/*.js"
            ]
        },
        jasmine: {
            src: "github-chrome-fullname/**/*.js",
            options: {
                vendor: [
                    "node_modules/jasmine-ajax/lib/mock-ajax.js",
                    "node_modules/jquery/dist/jquery.js",
                    "node_modules/jasmine-jquery/lib/jasmine-jquery.js"
                ],
                helpers: [
                    "test/helpers/FetchMock.js"
                ],
                specs: "test/*.js",
                polyfills : ["node_modules/es6-promise/dist/es6-promise.auto.js"],
                keepRunner: true,
                template: require("grunt-template-jasmine-istanbul"),
                templateOptions: {
                    coverage: "temp/coverage/coverage.json",
                    report: [{
                        type: "html",
                        options: {
                            dir: "temp/coverage"
                        }
                    }, {
                        type: "lcov",
                        options: {
                            dir: "temp/lcov"
                        }
                    }],
                    files: [
                        "github-chrome-fullname/*.js",
                        "!github-chrome-fullname/index.js",
                        "!github-chrome-fullname/ChromeUserNameCache.js"
                    ],
                    thresholds: {
                        lines: 100,
                        statements: 100,
                        branches: 100,
                        functions: 100
                    }
                }
            }
        },
        coveralls: {
            allTests: {
                src: "temp/lcov/lcov.info"
            }
        },
        connect: {
            server: {
                options: {
                    port: 8888
                }
            }
        },
        watch: {
            files: ["github-chrome-fullname/*.js", "test/*.js"],
            tasks: ["test"]
        }
    });

    grunt.registerTask("test", ["eslint", "jasmine"]);
    grunt.registerTask("testAndUploadCoverage", ["test", "coveralls:allTests"]);
    grunt.registerTask("default", ["test", "serve"]);
    grunt.registerTask("serve", ["connect", "watch"]);
};
