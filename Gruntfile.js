// imports
var _ = require('lodash');
// gruntfile
module.exports = function (grunt) {
    'use strict';

        // development folders and files
    var SOURCE_PATH             =   'src/',
        SASS_PATH               =   SOURCE_PATH + 'styles/',
        JAVASCRIPT_PATH         =   SOURCE_PATH + 'scripts/',
        TEMPLATES_PATH          =   SOURCE_PATH + 'templates/',
        TEMPLATES_LAYOUTS_PATH  =   TEMPLATES_PATH + 'layouts/',
        TEMPLATES_PAGES_PATH    =   TEMPLATES_PATH + 'pages/',
        TEMPLATES_PARTIALS_PATH =   TEMPLATES_PATH + 'parts/',
        TEMPLATES_DATA_PATH     =   TEMPLATES_PATH + 'data/',
        HTML5_BOILERPLATE_PATH  =   'lib/html5-boilerplate/',

        SASS_FILES              =   [SASS_PATH + '**/*.scss'],
        JAVASCRIPT_SOURCES      =   ['*.js', JAVASCRIPT_PATH + '**/*.js'],
        HTACCESS_BASE_FILE      =   HTML5_BOILERPLATE_PATH + '.htaccess',
        HTACCESS_FILE           =   SOURCE_PATH + 'htaccess.conf',
        MANIFEST_WEBAPP_NAME    =   'manifest.webapp',

        // build generated output
        BUILD_PATH              =   'build/',
        HTDOCS_PATH             =   BUILD_PATH + 'www/',
        CSS_PATH                =   HTDOCS_PATH + 'css/',
        JS_PATH                 =   HTDOCS_PATH + 'js/',
        CSS_FILES               =   [CSS_PATH + '**/*.css'],
        HTML_FILES              =   [HTDOCS_PATH + '**/*.html'],
        JS_FILES                =   [JS_PATH + '**/*.js'],
        FILES_TO_CACHE          =   HTML_FILES.concat(CSS_FILES, JS_FILES),

        // browser compatibility
        BROWSER_SUPPORT = [
            'last 2 version',
            'ff >= 18'
        ],

        // linters
        JSLINT_GLOBALS = [
            'module',
            'require',
            'console'
        ],
        JSLINT_DIRECTIVES = {
            nomen: true,
            predef: JSLINT_GLOBALS
        },
        GJSLINT_DISABLE = [
            '1',  //Extra space after "function" (Error 1)
            '6',  //Wrong indentation: expected x but got y (Error 6)
            '220' //No docs found for member (Error 220)
        ],
        GJSLINT_OPTIONS = {
            flags: [
                '--disable ' + GJSLINT_DISABLE.join(','),
                '--strict'
            ],
            reporter: {
                name: 'console'
            }
        },
        JS_LINTER = 'jslint';

// Grunt tasks
// ---------------------------------------------------------------------------
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Stylesheets
        compass: {
            options: {
                sassDir: SASS_PATH,
                cssDir: CSS_PATH,
                bundleExec: true
            },
            dev: {
                options: {
                    environment: 'development'
                }
            }
        },
        autoprefixer: {
            all: {
                options: {
                    browsers: BROWSER_SUPPORT
                },
                files: [{
                    expand: true,
                    cwd: CSS_PATH,
                    src: '**/*.css',
                    dest: CSS_PATH
                }]
            }
        },

        // Javascript
        jsvalidate: {
            all: JAVASCRIPT_SOURCES
        },
        jshint: {
            all: {
                src: JAVASCRIPT_SOURCES
            }
        },
        jslint: {
            all: {
                src: JAVASCRIPT_SOURCES,
                directives: JSLINT_DIRECTIVES
            }
        },

        gjslint: {
            options: GJSLINT_OPTIONS,
            all: {
                src: JAVASCRIPT_SOURCES
            }
        },

        // Apache Config
        concat: {
            htaccess: {
                files: [{
                    src: [
                        HTACCESS_BASE_FILE,
                        HTACCESS_FILE
                    ],
                    dest: HTDOCS_PATH + '.htaccess'
                }]
            }
        },

        // Templates
        assemble: {
            options: {
                flatten: true,
                layoutdir: TEMPLATES_LAYOUTS_PATH,
                partials: [TEMPLATES_PARTIALS_PATH + '**/*.hbs'],
                data: [TEMPLATES_DATA_PATH + '**/*.{json,yml}'],
                pkg: '<%= pkg %>'
            },
            pages: {
                files: [{
                    src: [
                        TEMPLATES_PAGES_PATH + '/**/*.hbs'
                    ],
                    dest: HTDOCS_PATH
                }]
            }
        },

        // Open Web App Manifest
        openwebapp: {
            options: {
                name: '<%= pkg.fullName %>',
                version: '<%= pkg.version %>',
                description: '<%= pkg.description %>',
                launch_path: '/app.html',
                developer: {
                    name: '<%= pkg.author.name %>',
                    url: '<%= pkg.author.url %>'
                },
                // icons: {
                //     "128": "/img/icons/app_128.png"
                // },
                installs_allowed_from: ['*']
            },
            all: {
                dest: HTDOCS_PATH + MANIFEST_WEBAPP_NAME
            }
        },

        //good html indentation
        prettify: {
            options: {
                indent: 4,
                indent_char: ' ',
                wrap_line_length: 78
                // brace_style: 'expand',
                // unformatted: ['a', 'sub', 'sup', 'b', 'i', 'u']
            },
            all: {
                files: [{
                    expand: true,
                    cwd: HTDOCS_PATH,
                    src: '**/*.html',
                    dest: HTDOCS_PATH
                }]
            }
        },

        //HTML Validation
        validation: {
            options: {
                reportpath: '.temp/validation-report.json',
                path: '.temp/validation-staus.json'
            },
            all: {
                options: {
                    reset: true
                },
                files: [{
                    src: HTML_FILES
                }]
            },
            repeat: {
                files: [{
                    src: HTML_FILES
                }]
            }
        },

        // Appcache
        manifest: {
            generate: {
                options: {
                    network: [
                    ],
                    process: function (path) {
                        // remove documentRoot part of the cached files paths
                        return path.substring(HTDOCS_PATH.length);
                    },
                    hash: true,
                    timestamp: false,
                    basePath: ''
                },
                src: FILES_TO_CACHE,
                dest: HTDOCS_PATH + 'manifest.appcache'
            }
        },

        // Watch
        watch: {
            options: {
                spawn: false
            },
            javascript: {
                files: JAVASCRIPT_SOURCES,
                tasks: ['jsvalidate', JS_LINTER]
            },
            css: {
                files: CSS_FILES,
                tasks: ['autoprefixer']
            },
            assemble: {
                files: [
                    TEMPLATES_PATH + '/**/*.hbs',
                    TEMPLATES_DATA_PATH + '**/*.{json,yml}'
                ],
                tasks: ['assemble'],
                options: {
                    spawn: true
                }
            },
            update_htaccess: {
                files: HTACCESS_FILE,
                tasks: ['concat:htaccess']
            },
            sass: {
                files: SASS_FILES,
                tasks: ['compass'],
                options: {
                    spawn: true
                }
            },
            cache: {
                files: FILES_TO_CACHE,
                tasks: ['manifest']
            }
        }
    });

    // on watch events configure certain tasks to only run on changed file
    grunt.event.on('watch', function (action, filepath) {
        grunt.verbose('Watch event', filepath, action);
        grunt.config(['jsvalidate', 'all'], filepath);
        grunt.config(['jshint', 'all'], filepath);
        grunt.config(['jslint', 'all'], filepath);
        grunt.config(['gjslint', 'all'], filepath);
        grunt.config(['autoprefixer', 'all'], filepath);
    });

    //run grunt.loadNpmTasks on each grunt plugin found in your package.json
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.loadNpmTasks('assemble');

    grunt.registerMultiTask(
        'openwebapp',
        'generate manifest.webapp file',
        function () {
            var task_options = {},
                target_options,
                done = this.async();
            if (grunt.config(this.name).options) {
                task_options = grunt.config(this.name).options;
            }
            if (this.target) {
                target_options = grunt.config([this.name, this.target]).options;
                // merge ("extend") the two option objects
                _.assign(task_options, target_options);
            }
            this.files.forEach(function (item) {
                if (item.dest) {
                    grunt.file.write(item.dest,
                        JSON.stringify(task_options, null, 4));
                    grunt.log.writeln('File "' + item.dest + '" created.');
                }
            });
            done(true);
        }
    );


    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('default', [
        'jsvalidate',
        JS_LINTER,
        'assemble',
        'compass',
        'prettify',
        'validation:all',
        'autoprefixer',
        'concat',
        'openwebapp',
        'manifest'
    ]);

    // lint js files on all linters
    grunt.registerTask('lint', [
        'jsvalidate',
        'jshint',
        'gjslint',
        'jslint'
    ]);
};
