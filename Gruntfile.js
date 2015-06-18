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
    changelog: 'grunt-conventional-changelog',
    bump: 'grunt-bump'
  });

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

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
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.css',
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.html',
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.js',
          //'!{.tmp,<%= yeoman.client %>}{app,components}/**/*.spec.js',
          '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js',
          '<%= yeoman.client %>/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        options: {
          livereload: true
        }
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
      server: '.tmp'
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
          src: '{,*/}*.css',
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
            '<%= yeoman.dist %>/public/{,*/}*.js',
            '<%= yeoman.dist %>/public/{,*/}*.css',
            '<%= yeoman.dist %>/public/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
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
            [/(assets\/fonts\/.*?\.(?:eot|woff|svg))/gm, 'Update the JS to reference our revved fonts']
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
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/public/assets/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.client %>/assets/images',
          src: '{,*/}*.svg',
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
            'assets/images/{,*/}*.{webp}',
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
      options: {

      },
      // Inject application script files into index.html (doesn't include bower)
      scripts: {
        options: {
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
              '{.tmp,<%= yeoman.client %>}/assets/javascripts/*.js',
              '{.tmp,<%= yeoman.client %>}/app/util/**/*.js',
              '{.tmp,<%= yeoman.client %>}/app/util/*.js',
              '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.js',
              '!{.tmp,<%= yeoman.client %>}/components/config/config.framework.js',

              '!{.tmp,<%= yeoman.client %>}/components/jnadi/jandi.framework.js',
              '!{.tmp,<%= yeoman.client %>}/components/jnadi/preloader/preloader.js',

              '!{.tmp,<%= yeoman.client %>}/components/base/base.framework.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/app.framework.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/analytics/analytics.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/language/language.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/local_storage/local.storage.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/storage/storage.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/pubsub/pubsub.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/notification/desktop.notification.js',
              '!{.tmp,<%= yeoman.client %>}/components/app/socket/socket.js',
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
            '<%= yeoman.client %>/{app,components}/**/*.css'
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
      local: {
        options: {
          patterns: [{
            json: grunt.file.readJSON('./config/environments/local.json')
          }]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['./config/config.js'],
          dest: '<%= yeoman.client %>/components/config/common/'
        }]
      },
      local_ie9: {
        options: {
          patterns: [{
            json: grunt.file.readJSON('./config/environments/local_ie9.json')
          }]
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
          patterns: [{
            json: grunt.file.readJSON('./config/environments/development.json')
          }]
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
          patterns: [{
            json: grunt.file.readJSON('./config/environments/staging.json')
          }]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['./config/config.js'],
          dest: '<%= yeoman.client %>/components/config/common/'
        }]
      }
    },

    changelog: {
      options: {
        // Task-specific options go here.
        repository: 'https://github.com/tosslab/web_client.git',
        version: require('./package.json').version
      }
    }, 

    bump: {
      options: {
        files: ['package.json'],
        updateConfigs: [],
        commit: false,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'upstream',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false,
        prereleaseName: false,
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
      switch (target) {
        case 'ie9':
          serveTasks.unshift('replace:local_ie9');
              break;
        default:
          serveTasks.unshift('replace:local');
              break;
      }
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
        'usemin'
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
      'usemin'
    ]);
  });

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);

  grunt.registerTask('staging', [
    'replace:staging'
  ]);
  grunt.registerTask('development', [
    'replace:development'
  ]);
  grunt.registerTask('local', [
    'replace:local'
  ]);

  grunt.registerTask('deploy', [
    'staging',
    'build'
  ]);

  grunt.registerTask('version', [
    'bump',
    'changelog'
  ]);
};
