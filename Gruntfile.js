// imports
var _ = require('lodash');
// gruntfile
module.exports = function (grunt) {
    'use strict';

    // development files
    var SOURCE_PATH = 'src/',
        SASS_PATH = SOURCE_PATH + 'styles/',
        SASS_FILES = [
            SASS_PATH + '**/*.scss'
        ],
        JAVASCRIPT_PATH = SOURCE_PATH + 'scripts/',
        JAVASCRIPT_SOURCES = [
            '*.js',
            JAVASCRIPT_PATH + '**/*.js'
        ],
        HTML5_BOILERPLATE_PATH = 'lib/html5-boilerplate/',
        HTACCESS_BASE_FILE = HTML5_BOILERPLATE_PATH + '.htaccess',
        HTACCESS_FILE = SOURCE_PATH + 'htaccess.conf',
        HTML_PAGES = [SOURCE_PATH + '**/*.html'],
        MANIFEST_WEBAPP_NAME = 'manifest.webapp',
        MANIFEST_WEBAPP_FILE = SOURCE_PATH + MANIFEST_WEBAPP_NAME,

        // build generated output
        BUILD_PATH = 'build/',
        HTDOCS_PATH = BUILD_PATH + 'www/',
        CSS_PATH = HTDOCS_PATH + 'css/',
        JS_PATH = HTDOCS_PATH + 'js/',
        CSS_FILES = [
            CSS_PATH + '**/*.css'
        ],
        HTML_FILES = [
            HTDOCS_PATH + '**/*.html'
        ],
        JS_FILES = [
            JS_PATH + '**/*.js'
        ],
        FILES_TO_CACHE = HTML_FILES.concat(CSS_FILES.concat(JS_FILES)),

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

    grunt.initConfig({

        //# Stylesheets
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

        //# Javascript
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

        //# Apache Config
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

        //# Other Static files
        copy: {
            webapp: {
                files: [{
                    src: MANIFEST_WEBAPP_FILE,
                    dest: HTDOCS_PATH + MANIFEST_WEBAPP_NAME
                }]
            },
            html: {
                files: [{
                    expand: true,
                    cwd: SOURCE_PATH,
                    src: '**/*.html',
                    dest: HTDOCS_PATH
                }]
            }
        },

        //# Appcache
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

        //# Watch
        watch: {
            javascript: {
                files: JAVASCRIPT_SOURCES,
                tasks: ['jsvalidate', JS_LINTER],
                options: {
                    spawn: false
                }
            },
            css: {
                files: CSS_FILES,
                tasks: ['autoprefixer', 'manifest'],
                options: {
                    spawn: false
                }
            },
            copy_html: {
                files: HTML_PAGES,
                tasks: ['copy:html', 'manifest'],
                options: {
                    spawn: false
                }
            },
            update_htaccess: {
                files: HTACCESS_FILE,
                tasks: ['concat:htaccess'],
                options: {
                    spawn: true
                }
            },
            copy_manifest_webapp: {
                files: MANIFEST_WEBAPP_FILE,
                tasks: ['copy:webapp'],
                options: {
                    spawn: true
                }
            },
            sass: {
                files: SASS_FILES,
                tasks: ['compass', 'manifest'],
                options: {
                    spawn: true
                }
            },
            cache: {
                files: HTDOCS_PATH + '**/*',
                tasks: ['manifest'],
                options: {
                    spawn: false
                }
            }
        }
    });

    // on watch events update just the modified files
    grunt.event.on('watch', function (action, filepath) {
        var fileExtension = filepath.split('.').pop(),
            jshintConfig,
            jslintConfig,
            gjslintConfig,
            autoprefixerConfig,
            copyConfig,
            isJSFile = (fileExtension === 'js'),
            isCSSFile = (fileExtension === 'css'),
            justCopy = _.contains(['html', 'htaccess'], fileExtension);

        if (action === 'deleted') { return; }
        if (isJSFile) {
            jshintConfig = grunt.config.get('jshint');
            jslintConfig = grunt.config.get('jslint');
            gjslintConfig = grunt.config.get('gjslint');
            jshintConfig.all.src = filepath;
            jslintConfig.all.src = filepath;
            gjslintConfig.all.src = filepath;
            grunt.config.set('jsvalidate', jshintConfig);
            grunt.config.set('jshint', jshintConfig);
            grunt.config.set('jslint', jslintConfig);
            grunt.config.set('gjslint', jslintConfig);
        } else if (isCSSFile) {
            autoprefixerConfig = grunt.config.get('autoprefixer');
            autoprefixerConfig.all.files[0] = {
                src: filepath,
                dest: filepath
            };
            grunt.config.set('autoprefixer', autoprefixerConfig);
        } else if (justCopy) {
            copyConfig = grunt.config.get('copy');
            copyConfig.html.files[0] = {
                src: filepath,
                dest: HTDOCS_PATH + filepath.substring(SOURCE_PATH.length)
            };
            grunt.config.set('copy', copyConfig);
        }
    });

    //run grunt.loadNpmTasks on each grunt plugin found in your package.json
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('default', [
        'compass',
        'autoprefixer',
        'jsvalidate',
        JS_LINTER,
        'copy',
        'concat',
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
