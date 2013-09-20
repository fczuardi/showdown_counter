// imports
var _ = require('lodash');
// gruntfile
module.exports = function (grunt) {
    'use strict';

        // development folders and files
    var SOURCE_PATH             =   'src/',
        SASS_PATH               =   SOURCE_PATH + 'styles/',
        JAVASCRIPT_PATH         =   SOURCE_PATH + 'scripts/',
        IMAGES_PATH             =   SOURCE_PATH + 'img/',
        TEMPLATES_PATH          =   SOURCE_PATH + 'templates/',
        TEMPLATES_LAYOUTS_PATH  =   TEMPLATES_PATH + 'layouts/',
        TEMPLATES_PAGES_PATH    =   TEMPLATES_PATH + 'pages/',
        TEMPLATES_PARTIALS_PATH =   TEMPLATES_PATH + 'parts/',
        TEMPLATES_DATA_PATH     =   TEMPLATES_PATH + 'data/',
        HTML5_BOILERPLATE_PATH  =   'lib/html5-boilerplate/',
        JAVASCRIPT_LIBS         =   'lib/js/',
        NODE_MODULES_PATH       =   'node_modules/',
        JAVASCRIPT_LIBS_NODE    =   ['requirejs/require.js'],

        SASS_FILES              =   [SASS_PATH + '**/*.scss'],
        SCRIPTS_TO_IGNORE       =   [
                                     '!main-built.js',
                                     '!src/scripts/lib/cordova/*.js'
                                    ],
        JAVASCRIPT_SOURCES      =   ['*.js',
                                     JAVASCRIPT_PATH + '**/*.js'
                                    ].concat(SCRIPTS_TO_IGNORE),

        HTACCESS_BASE_FILE      =   HTML5_BOILERPLATE_PATH + '.htaccess',
        HTACCESS_FILE           =   SOURCE_PATH + 'htaccess.conf',
        MANIFEST_WEBAPP_NAME    =   'manifest.webapp',

        // build generated output
        BUILD_PATH              =   'build/',
        HTDOCS_PATH             =   BUILD_PATH + 'www/',
        CSS_PATH                =   HTDOCS_PATH + 'css/',
        FONTS_PATH              =   HTDOCS_PATH + 'fonts/',
        IMG_PATH                =   HTDOCS_PATH + 'img/',
        JS_PATH                 =   HTDOCS_PATH + 'js/',
        CSS_FILES               =   [CSS_PATH + '**/*.css'],
        HTML_FILES              =   [HTDOCS_PATH + '**/*.html'],
        JS_FILES                =   [JS_PATH + '**/*.js'],
        FONT_FILES              =   [FONTS_PATH +  '/**/*.{ttf,woff,svg,eot}'],
        IMG_FILES               =   [IMG_PATH +  '/**/*.{png,jpg,gif}'],

        //themes
        POMPIERE_FONT_PATH      =   'lib/Pompiere',
        UBUNTU_THEME_PATH       =   'lib/ubuntu-html5-theme/0.1/ambiance/',

        FILES_TO_CACHE          =   HTML_FILES.concat(
                                                      CSS_FILES,
                                                      JS_FILES,
                                                      FONT_FILES,
                                                      IMG_FILES
                                                    ),


        // browser compatibility
        BROWSER_SUPPORT = [
            'last 2 version',
            'ff >= 18'
        ],

        // linters
        JSLINT_GLOBALS = [
            'module',
            'require',
            'console',
            'requirejs',
            'define',
            'window',
            'document',
            'onTouchStart',
            'onTouchMove',
            'onTouchEnd',
            'Modernizr'
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
        JS_LINTER = 'jshint',
        LIVE_RELOAD_ENABLED = true;

// Grunt tasks
// ---------------------------------------------------------------------------
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Stylesheets
        compass: {
            options: {
                sassDir: SASS_PATH,
                cssDir: CSS_PATH,
                bundleExec: true,
                relativeAssets: true,
                fontsDir: FONTS_PATH
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
                    src: '*.css',
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
                appcache_path: '/manifest.appcache',
                developer: {
                    name: '<%= pkg.author.name %>',
                    url: '<%= pkg.author.url %>'
                },
                icons: {
                    "128": "/img/icons/app_128.png",
                    "64": "/img/icons/app_64.png",
                    "60": "/img/icons/app_60.png"
                },
                installs_allowed_from: ['*']
            },
            all: {
                dest: HTDOCS_PATH + MANIFEST_WEBAPP_NAME
            }
        },

        //HTML indentation for generated pages
        prettify: {
            options: {
                indent: 4,
                indent_char: ' ',
                wrap_line_length: 78,
                brace_style: 'expand',
                unformatted: ['a', 'sub', 'sup', 'b', 'i', 'u']
            },
            all: {
                expand: true,
                cwd: HTDOCS_PATH,
                ext: '.html',
                src: ['**/*.html'],
                dest: HTDOCS_PATH
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


        modernizr: {

            dist: {
                // Path to the build you're using for development.
                // "devFile" : "build/www/js/lib/modernizr/modernizr-latest.js",
                'devFile' : false,

                // Path to save out the built file
                'dest' : 'build/www/js/lib/modernizr/modernizr-custom.js',

                // Based on default settings on http://modernizr.com/download/
                'options' : [
                    // 'setClasses',
                    // 'addTest',
                    // 'html5printshiv',
                    // 'load',
                    // 'testProp',
                    // 'fnBind'
                ],

                // By default, source is uglified before saving
                'uglify' : true,

                // Define any tests you want to impliticly include
                'tests' : [],

                // By default, will crawl your project for references to
                // Modernizr tests
                // Set to false to disable
                'crawl' : true,

                // By default, this task will crawl all *.js, *.css, *.scss
                // files.
                // 'files' : [
                //     '**/*.{js,css,scss}',
                //     '!node_modules/**/*',
                //     '!{Gruntfile,grunt}.js'
                // ],
                'files' : JS_FILES,

                // Have custom Modernizr tests? Add them here.
                'customTests' : []
            }

        },
        //Javascript modules concatenation
        requirejs: {
            compile: {
                options: {
                    almond: true,
                    baseUrl: './build/www/js/lib',
                    paths: {
                        'main': '../main',
                        'domReady': 'requirejs/domReady',
                        'dom': 'mozilla/pointer/dom',
                        'pointer': 'mozilla/pointer/pointer',
                        'modernizr': 'modernizr/modernizr-custom',
                        'cordova': 'cordova/cordova-2.8',
                        'counter': 'mnmo/counter',
                        'counterSet': 'mnmo/counterSet',
                        'contextMenu': 'mnmo/contextMenu'
                    },
                    name: 'main',
                    out: './build/www/js/main-built.js'
                }
            }
        },
        // Theme assets
        copy: {
            app_as_index: {
                files: [{
                    src: HTDOCS_PATH + 'app.html',
                    dest: HTDOCS_PATH + 'index.html'
                }]
            },
            // ubuntu_fonts: {
            //     files: [{
            //         expand: true,
            //         src: [UBUNTU_THEME_PATH + 'fonts/**/*.{ttf,woff,svg,eot}'],
            //         dest: HTDOCS_PATH + 'fonts/ubuntu/',
            //         flatten: true
            //     }]
            // },
            // ubuntu_css: {
            //     files: [{
            //         expand: true,
            //         src: [UBUNTU_THEME_PATH + 'css/**/*.css'],
            //         dest: HTDOCS_PATH + 'css/ubuntu/',
            //         flatten: true
            //     }]
            // },
            // ubuntu_img: {
            //     files: [{
            //         expand: true,
            //         src: [UBUNTU_THEME_PATH + 'img/**/*'],
            //         dest: HTDOCS_PATH + 'img/ubuntu/',
            //         flatten: true
            //     }]
            // },
            pompiere_fonts: {
                files: [{
                    expand: true,
                    src: [POMPIERE_FONT_PATH + '/**/*.{ttf,woff,svg,eot}'],
                    dest: HTDOCS_PATH + 'fonts/Pompiere/',
                    flatten: true
                }]

            },
            images: {
                files: [{
                    expand: true,
                    cwd: IMAGES_PATH,
                    src: ['**/*'],
                    dest: HTDOCS_PATH + 'img/',
                }]
            },
            js_libs: {
                files: [{
                    expand: true,
                    cwd: JAVASCRIPT_LIBS,
                    src: ['**/*.js'],
                    dest: HTDOCS_PATH + 'js/lib/'
                }]
            },
            js_libs_node: {
                files: [{
                    expand: true,
                    cwd: NODE_MODULES_PATH,
                    src: JAVASCRIPT_LIBS_NODE,
                    dest: HTDOCS_PATH + 'js/lib/'
                }]
            },
            scripts: {
                files: [{
                    expand: true,
                    cwd: JAVASCRIPT_PATH,
                    src: ['**/*.js'],
                    dest: HTDOCS_PATH + 'js/'
                }]
            }
        },

        'regex-replace': {
            // ubuntu_assets_url: {
            //     src: [HTDOCS_PATH + 'css/ubuntu/**/*.css'],
            //     actions: [
            //         {
            //             name: 'img_paths',
            //             search: '../img/',
            //             replace: '../../img/ubuntu/',
            //             flags: 'g'
            //         }
            //     ]
            // }
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
                tasks: ['jsvalidate', JS_LINTER, 'copy:scripts', 'requirejs'],
                options: {
                    livereload: LIVE_RELOAD_ENABLED
                }
            },
            css: {
                files: CSS_FILES,
                tasks: ['autoprefixer'],
                options: {
                    livereload: LIVE_RELOAD_ENABLED,
                    spawn: true
                }
            },
            html: {
                files: HTML_FILES,
                // tasks: ['prettify', 'validation:repeat'],
                tasks: ['validation:repeat'],
                options: {
                    livereload: LIVE_RELOAD_ENABLED,
                    spawn: true
                }
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
                tasks: ['manifest'],
                options: {
                    livereload: LIVE_RELOAD_ENABLED
                }
            }
        },
        // to grab dependencies
        curl: {
            domReady:{
                src: 'https://raw.github.com/requirejs/domReady/latest/domReady.js',
                dest: 'lib/js/requirejs/domReady.js'

            },
            pompiere:{
                src: 'http://www.google.com/fonts/download?kit=6WX-i9ddkT_xM2fhugoMRy3USBnSvpkopQaUR-2r7iU',
                dest: '.temp/pompiere.zip'
            }
            // 'ubuntu-cordova': {
            // 'build/www/plugins.xml':
            //     'http://bazaar.launchpad.net/~ubuntu-sdk-tutorials-dev/ubuntu-sdk-tutorials/trunk/download/head:/plugins.xml-20130718182619-c92il0qk6i2ni0xw-1/plugins.xml',
            // 'build/www/counters.cordovaproject':
            //     'http://bazaar.launchpad.net/~ubuntu-sdk-tutorials-dev/ubuntu-sdk-tutorials/trunk/download/head:/qrcodescanner.cordov-20130718074154-454ovhnac2fgorus-1/qrcode-scanner.cordovaproject'
            // }
        },
        unzip: {
            mnmo: {
                src: '.temp/pompiere.zip',
                dest: POMPIERE_FONT_PATH
            }
        }
    });

    // on watch events configure certain tasks to only run on changed file
    grunt.event.on('watch', function (action, filepath) {
        if (action === 'deleted') { return; }
        grunt.config(['jsvalidate', 'all'], filepath);
        grunt.config(['jshint', 'all'], filepath);
        grunt.config(['jslint', 'all'], filepath);
        grunt.config(['gjslint', 'all'], filepath);
        grunt.config(['copy:scripts'], filepath);
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

// ----- more tasks

    // fetch dependencies from the internet and put them on the expected places
    grunt.registerTask('install', [
        'curl',
        'unzip'
    ]);

    // lint js files on all linters
    grunt.registerTask('lint', [
        'jsvalidate',
        'jshint',
        'gjslint',
        'jslint'
    ]);

    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('default', [
        'jsvalidate',
        JS_LINTER,
        'assemble',
        'compass',
        'prettify',
        'validation:all',
        'copy:pompiere_fonts',
        'copy:images',
        'copy:js_libs',
        'copy:js_libs_node',
        'copy:scripts',
        'copy:app_as_index',
        'modernizr',
        'requirejs',
        'autoprefixer',
        'concat:htaccess',
        'openwebapp',
        'manifest'
    ]);

};
