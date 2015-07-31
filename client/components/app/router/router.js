(function() {
  'use strict';

  angular
    .module('app.router', [
      'ui.router'
    ])
    .config(config)
    .run(run);


  /* @ngInject */
  function run($rootScope, Router) {
    $rootScope.$on("$routeChangeError", Router.onRouteChangeError);
    $rootScope.$on('$stateNotFound', Router.onStateNotFound);
    $rootScope.$on('$locationChangeSuccess', Router.onLocationChangeSuccess);
    $rootScope.$on('$stateChangeStart', Router.onStateChangeStart);
  }

  /* @ngInject */
  function config($stateProvider, $urlRouterProvider) {
    //_setState($stateProvider);
    _setUrlRoutingRule($urlRouterProvider)
  }

  function _setState($stateProvider) {
    $stateProvider
      .state('disconnect', {
        url         : '/disconnect',
        title       : 'JANDI',
        templateUrl : 'app/disconnect/disconnect.html',
        controller  : 'DisconnectCtrl'
      })
      .state('signin', {
        url         : '/',
        title       : 'Sign In',
        templateUrl : 'app/signin/signin.html',
        controller  : 'authController'
      })
      .state('messages', {
        abstract    : true,
        url         : '/messages',
        views       : {
          '': {
            templateUrl : 'app/left/left.html',
            controller  : 'leftPanelController1',
            resolve     : {
              leftPanel: function (leftpanelAPIservice, publicService, storageAPIservice) {
                return leftpanelAPIservice.getLists()
                  .error(function(err) {
                    publicService.signOut();
                  });
              }
            }
          },
          'headerpanel' : {
            templateUrl : 'app/header/header.html',
            controller  : 'headerCtrl'
          },
          'rightpanel': {
            templateUrl: 'app/right/right.html',
            controller: 'rPanelCtrl'
          },
          'detailpanel': {
            templateUrl : 'app/right/file.detail/file.detail.html',
            controller  : 'fileDetailCtrl'
          }
        }
      })
      .state('messages.home', {
        url         : '',
        title       : 'Welcome',
        views       : {
          'centerpanel': {
            templateUrl : 'app/main.html'
          }
        }
      })
      .state('messages.detail', {
        url         : '^/{entityType}/{entityId:[0-9]+}',
        title       : 'Messages',
        views       : {
          'centerpanel': {
            templateUrl : 'app/center/center.html',
            controller  : 'centerpanelController'
          }
        }
      })
      .state('messages.detail.files', {
        url         : '/files',
        title       : 'FILE LIST'
      })
      .state('messages.detail.files.item', {
        url         : '/:itemId',
        title       : 'FILE DETAIL'
      })
      .state('messages.detail.files.redirect', {
        params      : [ 'entityType', 'entityId', 'userName', 'itemId' ],
        views       : {
          'detailpanel@': {
            templateUrl : 'app/right/file.detail/file.detail.html',
            controller  : 'fileDetailCtrl'
          }
        }
      })
      .state('archives', {
        url         : '/archives/{entityType}/{entityId}'
      })
      .state('files', {
        url         : '/files/{userName}/{itemId}',
        controller  : ''
      })
      .state('error', {
        url         : '/error?code&msg&referrer',
        title       : 'ERROR',
        controller  : 'errorController'
      })
      .state('mobile', {
        url         : '/mobile',
        templateUrl : 'app/mobile/mobile.catcher.html',
        controller  : 'mobileCatcherController'
      })
      .state('503', {
        url         : '/gongsajung',
        templateUrl : 'app/tpl/503/503.html',
        controller  : 'underConstructionCtrl'
      })
      .state('404', {
        url         : '/404',
        title       : '404',
        templateUrl : 'app/error/404.html',
        controller  : 'errorController'
      })
      .state('notfound', {
        url         : '/lostinjandi',
        title       : '404',
        templateUrl : 'app/error/404.html',
        controller  : 'errorController'
      });

  }

  function _setUrlRoutingRule($urlRouterProvider) {
    /* URL routing rule for exception */
    $urlRouterProvider
      .when("", "/")
      .when("/channels/:id/", "/channels/:id")
      .when("/privategroups/:id/", "/privategroups/:id")
      .when("/passwordReset?teamId&token", "/passwordreset?teamId&token")
      .otherwise("/404");

    /* URL must be lower-case */
    $urlRouterProvider.rule(function ($injector, $location) {
      var path = $location.path(),
        normalized = path.toLowerCase();

      if (path !== normalized) {
        return normalized;
      }
    });

  }
})();
