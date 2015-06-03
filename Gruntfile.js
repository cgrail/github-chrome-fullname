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
                    "global-strict": false,
                    "no-underscore-dangle": false,
                    "new-cap": false,
                    "no-loop-func": false,
                    "no-undef": false
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
                    "node_modules/jasmine-jquery/vendor/jquery/jquery.js",
                    "node_modules/jasmine-jquery/lib/jasmine-jquery.js"
                ],
                specs: "test/**/*.js",
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
                        "!github-chrome-fullname/index.js"
                    ],
                    thresholds: {
                        lines: 100,
                        statements: 100,
                        branches: 100,
                        functions: 100
                    }
                },
                keepRunner: true
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
    grunt.registerTask("testCoveralls", ["test", "coveralls:allTests"]);
    grunt.registerTask("default", ["test", "connect", "watch"]);
};
