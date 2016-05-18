'use strict';

module.exports = function (grunt) {
  var localConfig;
  try {
    localConfig = require('./server/config/local.env');
  } catch(e) {
    localConfig = {};
  }

  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    express: 'grunt-express-server',
    useminPrepare: 'grunt-usemin',
    ngtemplates: 'grunt-angular-templates',
    cdnify: 'grunt-google-cdn',
    protractor: 'grunt-protractor-runner',
    injector: 'grunt-asset-injector',
    nggettext_extract: 'grunt-angular-gettext',
    nggettext_compile: 'grunt-angular-gettext',
    replace: 'grunt-replace',
    wiredep: 'grunt-wiredep',
    conventionalChangelog: 'grunt-conventional-changelog',
    bump: 'grunt-bump'
  });

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // Project settings
    yeoman: {
      // configurable paths
      client: require('./bower.json').appPath || 'client',
      dist: 'dist'
    },
    express: {
      options: {
        port: process.env.PORT || 9000
      },
      dev: {
        options: {
          script: 'server/app.js',
          debug: true
        }
      },
      prod: {
        options: {
          script: 'dist/server/app.js'
        }
      }
    },
    concat: {
      preload: {
        options: {
          separator: "",
          nonull: true,
          process: function(src, filepath) {
            var regx = /[\.\/]*assets\/.*?\.(png|jpg|jpeg|gif|webp|svg)/g;
            var results = src.match(regx) || [];
            return results.length ? results.join('\n') + '\n': '';
          }
        },
        files: {
          '.tmp/preload.tmp': [
            'client/**/*.{js,css,html}'
          ]
        }
      }
    },
    open: {
      server: {
        url: 'http://local.jandi.io:<%= express.options.port %>'
      }
    },
    watch: {
      injectJS: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.js',
          '!<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '!<%= yeoman.client %>/{app,components}/**/*.mock.js',
          '!<%= yeoman.client %>/components/config/config.framework.js',
          '!<%= yeoman.client %>/components/base/base.framework.js',
          '!<%= yeoman.client %>/components/app/app.framework.js',
          '!<%= yeoman.client %>/components/app/analytics/analytics.js',
          '!<%= yeoman.client %>/components/app/language/language.js',
          '!<%= yeoman.client %>/components/app/local_storage/local.storage.js',
          '!<%= yeoman.client %>/components/app/storage/storage.js',
          '!<%= yeoman.client %>/components/app/pubsub/pubsub.js',
          '!<%= yeoman.client %>/app/app.js'],
        tasks: ['injector:scripts']
      },
      injectCss: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.css'
        ],
        tasks: ['injector:css']
      },
      mochaTest: {
        files: ['server/**/*.spec.js'],
        tasks: ['env:test', 'mochaTest']
      },
      jsTest: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '<%= yeoman.client %>/{app,components}/**/*.mock.js'
        ],
        tasks: ['newer:jshint:all', 'karma']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        files: [
          '{.tmp,<%= yeoman.client %>}/{app,assets,components}/**/*.css',
          '{.tmp,<%= yeoman.client %>}/{app,assets,components}/**/*.html',
          '{.tmp,<%= yeoman.client %>}/{app,assets,components}/**/*.js',
          //'!{.tmp,<%= yeoman.client %>}{app,components}/**/*.spec.js',
          '!{.tmp,<%= yeoman.client %>}/{app,assets,components}/**/*.mock.js',
          '<%= yeoman.client %>/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.client %>/assets/videos/**/*',
          '<%= yeoman.client %>/assets/sounds/**/*',
          '<%= yeoman.client %>/{app,components}/**/*.hbs'
        ],
        options: {
          livereload: true
        }
      },
      handlebars: {
        files: ['<%= yeoman.client %>/{app,components}/**/*.hbs'],
        tasks: ['handlebars:compile']
      },
      express: {
        files: [
          'server/**/*.{js,json}'
        ],
        tasks: ['express:dev', 'wait'],
        options: {
          livereload: true,
          nospawn: true //Without this option specified express won't be reloaded
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '<%= yeoman.client %>/.jshintrc',
        reporter: require('jshint-stylish')
      },
      server: {
        options: {
          jshintrc: 'server/.jshintrc'
        },
        src: [ 'server/{,*/}*.js']
      },
      all: [
        '<%= yeoman.client %>/{app,components}/**/*.js',
        '!<%= yeoman.client %>/{app,components}/**/*.spec.js',
        '!<%= yeoman.client %>/{app,components}/**/*.mock.js'
      ],
      test: {
        src: [
          '<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '<%= yeoman.client %>/{app,components}/**/*.mock.js'
        ]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*',
            '!<%= yeoman.dist %>/.openshift',
            '!<%= yeoman.dist %>/Procfile'
          ]
        }]
      },
      server: '.tmp',
      //app: '<%= yeoman.dist %>/public/app/*',
      tmp: '<%= yeoman.dist %>/tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/',
          src: '*.css',
          dest: '.tmp/'
        }]
      }
    },

    // Debugging with node inspector
    'node-inspector': {
      custom: {
        options: {
          'web-host': 'localhost'
        }
      }
    },

    // Use nodemon to run server in debug mode with an initial breakpoint
    nodemon: {
      debug: {
        script: 'server/app.js',
        options: {
          nodeArgs: ['--debug-brk'],
          env: {
            PORT: process.env.PORT || 9000
          },
          callback: function (nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });

            // opens browser on initial server start
            nodemon.on('config:update', function () {
              setTimeout(function () {
                require('open')('http://localhost:8080/debug?port=5858');
              }, 500);
            });
          }
        }
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      target: {

        // Point to the files that should be updated when
        // you run `grunt wiredep`
        src: [
          '<%= yeoman.client %>/index.html'
        ],

        // Optional
        options: {
          cwd: '',
          dependencies: true,
          devDependencies: false,
          exclude: [
            '/bootstrap-sass-official/', '/json3/', '/es5-shim/',
            '/ng-file-upload-shim/',
            'bower_components/angulartics/src/angulartics-ga-cordova.js',
            'bower_components/angulartics/src/angulartics-ga.js',
            'bower_components/angulartics/src/angulartics-mixpanel.js',
            'bower_components/angulartics/src/angulartics-scroll.js',
            'bower_components/angulartics/src/angulartics-adobe.js',
            'bower_components/angulartics/src/angulartics-chartbeat.js',
            'bower_components/angulartics/src/angulartics-flurry.js',
            'bower_components/angulartics/src/angulartics-gtm.js',
            'bower_components/angulartics/src/angulartics-kissmetrics.js',
            'bower_components/angulartics/src/angulartics-piwik.js',
            'bower_components/angulartics/src/angulartics-segmentio.js',
            'bower_components/angulartics/src/angulartics-splunk.js',
            'bower_components/angulartics/src/angulartics-woopra.js',
            'bower_components/angulartics/src/angulartics-marketo.js',
            'bower_components/angulartics/src/angulartics-intercom.js'
          ],
          fileTypes: {},
          ignorePath: '<%= yeoman.client %>/',
          overrides: {}
        }

      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/public/app/*.js',
            '<%= yeoman.dist %>/public/app/*.css',
            '<%= yeoman.dist %>/public/assets/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/public/assets/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: ['<%= yeoman.client %>/index.html'],
      options: {
        dest: '<%= yeoman.dist %>/public'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/public/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/public/{,*/}*.css'],
      js: ['<%= yeoman.dist %>/public/{,*/}*.js'],
      options: {
        assetsDirs: [
          '<%= yeoman.dist %>/public',
          '<%= yeoman.dist %>/public/assets/images'
        ],
        // This is so we update image references in our ng-templates
        patterns: {
          js: [
            [/(assets\/images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
          ],
          css: [
            [/(assets\/images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the CSS to reference our revved images'],
            [/(assets\/fonts\/.*?\.(?:eot|woff|ttf|svg))/gm, 'Update the JS to reference our revved fonts']
          ]
        }
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.client %>/assets/images',
          src: '**/*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/public/assets/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.client %>/assets/images',
          src: '**/*.svg',
          dest: '<%= yeoman.dist %>/public/assets/images'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat',
          src: '*/**.js',
          dest: '.tmp/concat'
        }]
      }
    },
    uglify: {
      options: {
        compress: {
          drop_console: true
        }
      }
    },
    // Package all the html partials into a single javascript payload
    ngtemplates: {
      options: {
        // This should be the name of your apps angular module
        module: 'jandiApp',
        htmlmin: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        },
        usemin: 'app/app.js'
      },
      main: {
        cwd: '<%= yeoman.client %>',
        src: ['{app,components}/**/*.html'],
        dest: '.tmp/templates.js'
      },
      tmp: {
        cwd: '.tmp',
        src: ['{app,components}/**/*.html'],
        dest: '.tmp/tmp-templates.js'
      }
    },
    handlebars: {
      compile: {
        options: {
          // configure a namespace for your templates
          namespace: 'Handlebars.templates',
          // convert file path into a function name
          // in this example, I convert grab just the filename without the extension
          processName: function(filePath) {
            var pieces = filePath.split('/');
            return pieces[pieces.length - 1].replace('.hbs', '');
          }
        },
        files: {
          '<%= yeoman.client %>/assets/javascripts/handlebars.templates.js': '<%= yeoman.client %>/{app,components}/**/*.hbs'
        }
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.client %>',
          dest: '<%= yeoman.dist %>/public',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            'assets/videos/**/*',
            'assets/sounds/**/*',
            'assets/images/**/*.{webp}',
            'assets/fonts/**/*',
            'index.html'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/public/assets/images',
          src: ['generated/*']
        }, {
          expand: true,
          dest: '<%= yeoman.dist %>',
          src: [
            'package.json',
            'server/**/*'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.client %>',
        dest: '.tmp/',
        src: ['{app,components}/**/*.css']
      },
      assets_path: {
        expand: true,
        cwd: '<%= yeoman.dist %>/tmp',
        src: '*',
        dest: '<%= yeoman.dist %>/public/app/'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
      ],
      test: [
      ],
      debug: {
        tasks: [
          'nodemon',
          'node-inspector'
        ],
        options: {
          logConcurrentOutput: true
        }
      },
      dist: [
        'imagemin',
        'svgmin'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: ['server/**/*.spec.js']
    },

    protractor: {
      options: {
        configFile: 'protractor.conf.js'
      },
      chrome: {
        options: {
          args: {
            browser: 'chrome'
          }
        }
      }
    },

    env: {
      test: {
        NODE_ENV: 'test'
      },
      prod: {
        NODE_ENV: 'production'
      },
      all: localConfig
    },

    injector: {
      // Inject application script files into index.html (doesn't include bower)
      scripts: {
        options: {
          sort: function (a, b) {
            a = a.replace(/\.js$/, '');
            b = b.replace(/\.js$/, '');
            
            var temp1 = a.split("/");
            var temp2 = b.split("/");
            var result = 0;
            var i;
            var length = Math.min(temp1.length, temp2.length);

            for (i = 0; i < length; i++) {
              if (temp1[i] !== temp2[i]) {
                if (i === length -1) {
                  if (temp1.length > temp2.length) {
                    result = 1;
                  } else if (temp1.length < temp2.length) {
                    result = -1;
                  }
                } else {
                  break;
                }
              }
            }
            
            if (result === 0) {
              if (a > b) {
                result = 1;
              } else if (a < b) {
                result = -1;
              }
            }
            return result;
          },
          transform: function(filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<script src="' + filePath + '"></script>';
          },

          starttag: '<!-- injector:js -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index.html': [
            [
              '{.tmp,<%= yeoman.client %>}/assets/**/*.js',
              '{.tmp,<%= yeoman.client %>}/app/util/**/*.js',
              '{.tmp,<%= yeoman.client %>}/app/util/*.js',
              '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.js',
              '!{.tmp,<%= yeoman.client %>}/components/config/config.framework.js',
              '!{.tmp,<%= yeoman.client %>}/components/base/base.framework.js',
              '!{.tmp,<%= yeoman.client %>}/components/jandi/browser/browser.js',
              '!{.tmp,<%= yeoman.client %>}/components/jandi/preloader/preloader.js',
              '!{.tmp,<%= yeoman.client %>}/components/jandi/dialog/dialog.js',
              '!{.tmp,<%= yeoman.client %>}/components/jandi/core/core.js',
              '!{.tmp,<%= yeoman.client %>}/components/jandi/jandi.framework.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/analytics/analytics.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/router/router.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/language/language.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/local_storage/local.storage.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/mention_ahead/mention.ahead.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/storage/storage.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/net/net.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/cache/cache.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/pubsub/pubsub.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/notification/desktop.notification.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/socket/socket.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/app.framework.js',
              '!{.tmp,<%= yeoman.client %>}/app/app.js',
              '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.spec.js',
              '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js']
          ]
        }
      },

      // Inject component css into index.html
      css: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<link rel="stylesheet" href="' + filePath + '">';
          },
          starttag: '<!-- injector:css -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index.html': [
            '<%= yeoman.client %>/{app,assets,components}/**/*.css'
          ]
        }
      }
    },

    // 다국어 지원이 필요한 .html을 읽어서 원본 origin_template.pot 파일 생성 위치와 파일명 지정
    nggettext_extract: {
      pot: {
        files: {
          '<%= yeoman.client %>/app/translation/po/origin_template.pot': [
            '<%= yeoman.client %>/app/**/*.html'
          ]
        }
      }
    },

    // 다국어 .po 파일을 읽어서 angular 형식의 파일을 만들 위치와 파일명 지정. 별도의 모듈로 gettext_translation을 적용한다.
    nggettext_compile: {
      all: {
        files: {
          '<%= yeoman.client %>/app/translation/translation.js': [
            '<%= yeoman.client %>/app/translation/po/*.po'
          ]
        }
      }
    },

    // replace
    replace: {
      preload: {
        options: {
          patterns: [
            {
              match: /\'@@config\.preload\'/g,
              replacement: function() {
                var buffer = grunt.file.read('.tmp/preload.tmp');
                var list = buffer.split('\n');
                var map = {};
                var i = 0;
                var path;
                list.pop();
                for (; i < list.length; i++) {
                  map[list[i]] = true;
                }
                list = [];

                for (path in map) {
                  list.push(path);
                }

                return JSON.stringify(list);
              }
            }
          ]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['./config/config.preload.js'],
          dest: '<%= yeoman.client %>/components/config/common/'
        }]
      },
      markup: {
        options: {
          patterns: [
            {
              match: /<script.*<\/script>\s*\n/g,
              replacement: function() {
                return '';
              }
            },
            {
              match: /<link rel="stylesheet" href="/g,
              replacement: function() {
                return '<link rel="stylesheet" href="../client/';
              }
            }
          ]
        },
        files: [{
          expand: true,
          flatten: true,
          src: '<%= yeoman.client %>/index.html',
          dest: './markup/'
        }]
      },
      assets_css: {
        options: {
          patterns: [
            {
              match: /[\.\/]*assets\//g,
              replacement: function() {
                return '../assets/';
              }
            },
            {
              match: /\.\.\/fonts\//g,
              replacement: function() {
                return '../bower_components/font-awesome/fonts/';
              }
            }
          ]
        },
        files: [{
          expand: true,
          flatten: true,
          src: '<%= yeoman.dist %>/public/app/*.css',
          dest: '<%= yeoman.dist %>/tmp/'
        }]
      },
      assets_js: {
        options: {
          patterns: [
            {
              match: /[\.\/]*assets\//g,
              replacement: function() {
                return 'assets/';
              }
            }
          ]
        },
        files: [{
          expand: true,
          flatten: true,
          src: '<%= yeoman.dist %>/public/app/*.js',
          dest: '<%= yeoman.dist %>/tmp/'
        }]
      },
      version: {
        options: {
          patterns: [
            {
              json: {
                version: '<%=pkg.version%>'
              }
            }
          ]
        },
        files: [{
          expand: true,
          flatten: true,
          src: './config/version.json',
          dest: '<%= yeoman.dist %>/public/'
        }]
      },
      local: {
        options: {
          patterns: [
            {
              json: grunt.file.readJSON('./config/environments/local.json')
            },
            {
              json: {
                version: '<%=pkg.version%>'
              }
            }
          ]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['./config/config.js'],
          dest: '<%= yeoman.client %>/components/config/common/'
        }]
      },
      development: {
        options: {
          patterns: [
            {
              json: grunt.file.readJSON('./config/environments/development.json')
            },
            {
              json: {
                version: '<%=pkg.version%>'
              }
            }
          ]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['./config/config.js'],
          dest: '<%= yeoman.client %>/components/config/common/'
        }]
      },
      staging: {
        options: {
          patterns: [
            {
              json: grunt.file.readJSON('./config/environments/staging.json')
            },
            {
              json: {
                version: '<%=pkg.version%>'
              }
            }
          ]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['./config/config.js'],
          dest: '<%= yeoman.client %>/components/config/common/'
        }]
      }
    },

    conventionalChangelog: {
      options: {
        changelogOpts: {
          // conventional-changelog options go here
          preset: 'angular'
        }
      },
      release: {
        src: 'CHANGELOG.md'
      }
    },

    bump: {
      options: {
        files: ['package.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json', 'CHANGELOG.md', 'README.md', 'CHANGELOG-ALPHA.md'],
        createTag: false, //tobe true
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false,
        prereleaseName: 'alpha',
        regExp: false
      }
    }
  });

  // Used for delaying livereload until after server has restarted
  grunt.registerTask('wait', function () {
    grunt.log.ok('Waiting for server reload...');

    var done = this.async();

    setTimeout(function () {
      grunt.log.writeln('Done waiting!');
      done();
    }, 1500);
  });

  grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
    this.async();
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'env:all', 'env:prod', 'express:prod', 'wait', 'open', 'express-keepalive']);
    } else if (target === 'debug') {
      return grunt.task.run([
        'handlebars',
        'preload',
        'clean:server',
        'env:all',
        'concurrent:server',
        'injector',
        'wiredep',
        'autoprefixer',
        'concurrent:debug'
      ]);
    } else {
      var serveTasks = [
        'handlebars',
        'preload',
        'replace:local',
        'clean:server',
        'env:all',
        'concurrent:server',
        'injector',
        'wiredep',
        'autoprefixer',
        'express:dev',
        'wait',
        'open',
        'watch'
      ];

      var filePath = './config/environments/local.team.json';
      var defaultTeamName = 'tosslab';
      var patterns = grunt.config.get('replace.local.options.patterns');

      if (!grunt.file.exists(filePath)) {
        grunt.file.write(filePath, "{\n\t\"team_name\": \"" + defaultTeamName + "\"\n}\n");
      }

      patterns.push({
        json: grunt.file.readJSON('./config/environments/local.team.json')
      });
      grunt.config.set('replace.local.options.patterns', patterns);

      grunt.task.run(serveTasks);
    }
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('test', function(target) {
    if (target === 'server') {
      return grunt.task.run([
        'env:all',
        'env:test',
        'mochaTest'
      ]);
    }

    else if (target === 'client') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'concurrent:test',
        'injector',
        'autoprefixer',
        'karma'
      ]);
    }

    else if (target === 'e2e') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'env:test',
        'concurrent:test',
        'injector',
        'wiredep',
        'autoprefixer',
        'express:dev',
        'protractor'
      ]);
    }

    else grunt.task.run([
        'test:server',
        'test:client'
      ]);
  });

  grunt.registerTask('build', function(target) {
    if (target === 'test') {
      return grunt.task.run([
        // karma - unit test *) change concurrent:test to test
        'clean:server',
        'env:all',
        'test',
        'injector',
        'autoprefixer',
        'karma',

        // protractor - e2e test

        'clean:dist',
        'concurrent:dist',
        'injector',
        'wiredep',
        'useminPrepare',
        'autoprefixer',
        'ngtemplates',
        'concat',
        'ngAnnotate',
        'copy:dist',
        'cdnify',
        'cssmin',
        'uglify',
        'rev',
        'usemin',
        'package-update',
        'replace:assets_js',
        'replace:assets_css',
        'replace:version',
        'copy:assets_path',
        'clean:tmp'
      ]);
    }
    else grunt.task.run([
      'clean:dist',
      'concurrent:dist',
      'injector',
      'wiredep',
      'useminPrepare',
      'autoprefixer',
      'ngtemplates',
      'concat',
      'ngAnnotate',
      'copy:dist',
      'cdnify',
      'cssmin',
      'uglify',
      'rev',
      'usemin',
      'package-update',
      'replace:assets_js',
      'replace:assets_css',
      'replace:version',
      'copy:assets_path',
      'clean:tmp'
    ]);
  });

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);

  grunt.registerTask('staging', [
    'handlebars',
    'preload',
    'replace:staging'
  ]);
  grunt.registerTask('development', [
    'handlebars',
    'preload',
    'replace:development'
  ]);
  grunt.registerTask('local', [
    'handlebars',
    'preload',
    'replace:local'
  ]);

  grunt.registerTask('deploy', [
    'staging',
    'build'
  ]);

  grunt.registerTask('package-update', function() {
    grunt.config.set('pkg', grunt.file.readJSON('package.json'));
  });

  /**
   * 버전 릴리즈
   */
  grunt.registerTask('version-release', function(target) {
    switch (target) {
      case 'major':
        target = 'major';
        break;
      case 'minor':
        target = 'minor';
        break;
      default:
        target = 'patch';
        break;
    }
    grunt.config.set('bump.options.commit', true);
    grunt.config.set('bump.options.push', true);
    grunt.config.set('bump.options.createTag', true);
    grunt.task.run(['bump:' + target + ':bump-only', 'package-update', 'conventionalChangelog', 'bump::commit-only']);
  });

  /**
   * alpha 버전 릴리즈
   */
  grunt.registerTask('version-prerelease', function(target) {
    switch (target) {
      case 'major':
        target = 'premajor';
        break;
      case 'minor':
        target = 'preminor';
        break;
      default:
        target = 'prerelease';
        break;
    }
    grunt.config.set('bump.options.commit', true);
    grunt.config.set('bump.options.push', true);
    grunt.config.set('bump.options.commitMessage', 'Alpha v%VERSION%');

    //grunt.config.set('bump.options.createTag', true);
    //grunt.config.set('conventionalChangelog.release.src', 'CHANGELOG-ALPHA.md');
    //grunt.task.run(['bump:' + target + ':bump-only', 'package-update', 'conventionalChangelog', 'bump::commit-only']);
    grunt.task.run(['bump:' + target]);
  });
  grunt.registerTask('preload', function(target) {
    grunt.task.run([
      'concat:preload',
      'replace:preload',
      'clean:server'
    ]);
  });

  /**
   * 마크업 환경 제공
   */
  grunt.registerTask('build-markup', function(target) {
    grunt.task.run([
      'clean:server',
      'env:all',
      'concurrent:server',
      'injector',
      'handlebars',
      'wiredep',
      'autoprefixer',
      'replace:markup'
    ]);
  });
};
