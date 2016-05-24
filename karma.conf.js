// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'client/bower_components/jquery/dist/jquery.js',
      'client/bower_components/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'client/bower_components/ng-file-upload/angular-file-upload.js',
      'client/bower_components/bootstrap/dist/js/bootstrap.js',
      'client/bower_components/angular-loader/angular-loader.js',
      'client/bower_components/angular-resource/angular-resource.js',
      'client/bower_components/angular-cookies/angular-cookies.js',
      'client/bower_components/angular-sanitize/angular-sanitize.js',
      'client/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'client/bower_components/angular-ui-router/release/angular-ui-router.js',
      'client/bower_components/angular-xeditable/dist/js/xeditable.js',
      'client/bower_components/angular-socket-io/socket.js',
      'client/bower_components/angular-animate/angular-animate.js',
      'client/bower_components/angular-local-storage/angular-local-storage.js',
      'client/bower_components/angular-toastr/dist/angular-toastr.tpls.js',
      'client/bower_components/lodash/lodash.js',
      'client/bower_components/jquery.lazyload/jquery.lazyload.js',
      'client/bower_components/jquery.lazyload/jquery.scrollstop.js',
      'client/bower_components/ngImgCrop/compile/minified/ng-img-crop.js',
      'client/bower_components/angular-gettext/dist/angular-gettext.js',
      'client/bower_components/jquery-waypoints/waypoints.js',
      'client/bower_components/SHA-1/sha1.js',
      'client/bower_components/angulartics/src/angulartics.js',
      'client/bower_components/angular-elastic/elastic.js',
      'client/bower_components/jquery-ui/jquery-ui.js',
      'client/bower_components/blueimp-load-image/js/load-image.js',
      'client/bower_components/blueimp-load-image/js/load-image-ios.js',
      'client/bower_components/blueimp-load-image/js/load-image-orientation.js',
      'client/bower_components/blueimp-load-image/js/load-image-meta.js',
      'client/bower_components/blueimp-load-image/js/load-image-exif.js',
      'client/bower_components/blueimp-load-image/js/load-image-exif-map.js',
      'client/bower_components/zeroclipboard/dist/ZeroClipboard.js',
      'client/bower_components/handlebars/handlebars.js',

      'client/components/jandi/core/core.js',

      'client/components/jandi/ui/jandi.ui.js',
      'client/components/jandi/ui/component/intercom/intercom.js',
      'client/components/jandi/ui/component/pdf-viewer/pdf.viewer.js',
      'client/components/jandi/ui/util/jandi.ui.util.js',

      'client/components/jandi/jandi.framework.js',

      'client/components/config/common/**/*.js',

      'client/components/config/config.framework.js',
      'client/components/base/**/*.js',
      'client/components/base/base.framework.js',

      'client/components/app/mention_ahead/mention.ahead.js',
      'client/components/app/router/router.js',
      'client/components/app/analytics/analytics.js',
      'client/components/app/keyCode/keyCode.js',
      'client/components/app/language/language.js',
      'client/components/app/local_storage/local.storage.js',
      'client/components/app/net/net.js',
      'client/components/app/notification/desktop.notification.js',
      'client/components/app/pubsub/pubsub.js',
      'client/components/app/socket/socket.js',
      'client/components/app/storage/storage.js',

      'client/components/app/app.framework.js',
      'client/app/app.js',

      'client/app/**/*.js',
      'client/assets/**/*.js',
      'client/components/**/*.js',

      //jasmine-jquery
      'node_modules/jasmine-jquery/lib/jasmine-jquery.js',

      // test codes
      'client/test/**/*.spec.js',

      // fixtures
      {pattern: 'client/test/**/*.json', watched: true, served: true, included: false},
      {pattern: 'client/assets/**/*', watched: false, served: true, included: false},

      //html templates
      'client/**/*.html'
    ],

    proxies: {
      '/assets/': '/base/client/assets/'
    },

    preprocessors: {
      'client/**/*.js': ['coverage', 'ngannotate'],
      'client/**/*.html': ['ng-html2js']
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'client/',
      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('templates')
      moduleName: 'templates'
    },
    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_WARN,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,
    reporters: ['coverage', 'junit', 'progress'],
    junitReporter: {
      outputFile: 'test-junit-results.xml'
    },

    // code coverage report
    coverageReporter: {
      type: 'cobertura',
      dir: 'coverage/',
      file: 'coverage.xml'
    },
    captureTimeout: 100000,
    browserNoActivityTimeout: 60000,
    browserDisconnectTimeout: 60000,
    colors: true
  });
};
