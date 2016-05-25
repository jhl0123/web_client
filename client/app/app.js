'use strict';

var app = angular.module('jandiApp', [
  'config.framework',
  'jandi.framework',
  'base.framework',
  'app.framework'
]);

app.run(function($rootScope, $state, $stateParams, $urlRouter, storageAPIservice, publicService, entityAPIservice,
                 fileAPIservice, configuration, Browser) {

  $rootScope._ = window._;
  $rootScope.browser = Browser;
  $rootScope.$state       = $state;
  $rootScope.$stateParams = $stateParams;
  publicService.getBrowserInfo();
});

app.config(function ($urlRouterProvider, $httpProvider, $tooltipProvider, $stateProvider) {

  _init();

  /**
   * 초기화
   * @private
   */
  function _init() {
    $httpProvider.interceptors.push('AuthInterceptor');
    $httpProvider.interceptors.push('NetInterceptor');
    $tooltipProvider.setTriggers({
      'show': 'hide'
    });

    //TODO: 아래 로직을 router.js 로 옮기는 refactoring 필요
    _setState();
    _setTutorialState();
  }

  /**
   * state 를 설정한다.
   * @private
   */
  function _setState() {
    $stateProvider
      .state('signin', {
        url: '/',
        title: 'Sign In',
        templateUrl: 'app/signin/signin.html',
        controller: 'authController'
      })
      .state('messages', {
        abstract: true,
        url: '/messages',
        views: {
          '': {
            templateUrl: 'app/left/left.html',
            controller: 'leftPanelController',
            resolve: {
              initialPromise: function($q, $state, memberService, Auth, TopicFolderModel, leftpanelAPIservice, ChatApi) {
                var promises = [];

                if (memberService.getMember()) {
                  promises.push(leftpanelAPIservice.getLists());
                  promises.push(TopicFolderModel.load('initialize'));
                  promises.push(ChatApi.getRecentMessageList());
                  return $q.all(promises);
                } else {
                  Auth.signIn();
                  return $q.reject();
                }
              }
            }
          },
          'headerpanel': {
            templateUrl: 'app/header/header.html',
            controller: 'headerCtrl'
          },
          'rightpanel': {
            templateUrl: 'app/right/right.html',
            controller: 'rPanelCtrl'
          },
          'detailpanel': {
            templateUrl: 'app/right/file-detail/file.detail.html',
            controller: 'FileDetailCtrl'
          }
        }
      })
      .state('messages.home', {
        url: '',
        title: 'Welcome',
        views: {
          'centerpanel': {
          }
        }
      })
      .state('messages.detail', {
        url: '^/{entityType}/{entityId:[0-9]+}',
        title: 'Messages',
        views: {
          'centerpanel': {
            templateUrl: 'app/center/center.html',
            controller: 'centerpanelController'
          }
        }
      })
      .state('messages.detail.files', {
        url: '/files',
        title: 'FILE LIST'
      })
      .state('messages.detail.files.item', {
        url: '/:itemId',
        title: 'FILE DETAIL'
      })
      .state('messages.detail.files.redirect', {
        params: ['entityType', 'entityId', 'userName', 'itemId', 'tail'],
        views: {
          'detailpanel@': {
            templateUrl: 'app/right/file-detail/file.detail.html',
            controller: 'FileDetailCtrl'
          }
        }
      })
      .state('messages.detail.messages', {
        url: '/messages',
        title: 'MESSAGE LIST'
      })
      .state('messages.detail.stars', {
        url: '/stars',
        title: 'STAR LIST'
      })
      .state('messages.detail.stars.item', {
        url: '/:itemId',
        title: 'STAR DETAIL'
      })
      .state('messages.detail.stars.redirect', {
        params: ['entityType', 'entityId', 'userName', 'itemId', 'tail'],
        views: {
          'detailpanel@': {
            templateUrl: 'app/right/file-detail/file.detail.html',
            controller: 'FileDetailCtrl'
          }
        }
      })
      .state('messages.detail.mentions', {
        url: '/mentions',
        title: 'MENTION LIST'
      })
      .state('messages.detail.mentions.item', {
        url: '/:itemId',
        title: 'MENTION DETAIL'
      })
      .state('messages.detail.mentions.redirect', {
        params: ['entityType', 'entityId', 'userName', 'itemId', 'tail'],
        views: {
          'detailpanel@': {
            templateUrl: 'app/right/file-detail/file.detail.html',
            controller: 'FileDetailCtrl'
          }
        }
      })
      .state('archives', {
        url: '/archives/{entityType}/{entityId}'
      })
      .state('files', {
        url: '/files/{userName}/{itemId}',
        controller: ''
      })
      .state('stars', {
        url: '/stars/{userName}/{itemId}',
        controller: ''
      })
      .state('mentions', {
        url: '/mentions/{userName}/{itemId}',
        controller: ''
      })
      .state('error', {
        url: '/error?code&msg&referrer',
        title: 'ERROR',
        controller: 'errorController'
      })
      .state('mobile', {
        url: '/mobile',
        templateUrl: 'app/mobile/mobile.catcher.html',
        controller: 'mobileCatcherController'
      })
      .state('503', {
        url: '/gongsajung',
        templateUrl: 'app/tpl/503/503.html',
        controller: 'underConstructionCtrl'
      })
      .state('404', {
        url: '/404',
        title: '404',
        templateUrl: 'app/error/404.html',
        controller: 'errorController'
      })
      .state('popup', {
        abstract: true,
        url: '/popup',
        template: '<ui-view/>'
      })
      .state('notfound', {
        url: '/lostinjandi',
        title: '404',
        templateUrl: 'app/error/404.html',
        controller: 'errorController'
      });
  }

  /**
   * tutorial 관련 state 를 설정한다.
   * @private
   */
  function _setTutorialState() {
    $stateProvider
      .state('tutorial', {
        url: '/tutorial?start',
        templateUrl: 'app/tutorial/popup/tutorial.main.html',
        controller: 'TutorialMainCtrl'
      })
      .state('tutorial.team', {
        abstract: true,
        url: '/team',
        template: '<ui-view/>'
      })
      .state('tutorial.team.invitation', {
        url: '/invitation',
        templateUrl: 'app/tutorial/popup/view_components/lecture/team/invitation/lecture.team.invitation.html',
        controller: 'LectureTeamInvitationCtrl'
      })
      .state('tutorial.topic', {
        abstract: true,
        url: '/topic',
        template: '<ui-view/>'
      })
      .state('tutorial.topic.create', {
        url: '/create',
        templateUrl: 'app/tutorial/popup/view_components/lecture/topic/create/lecture.topic.create.html',
        controller: 'LectureTopicCreateCtrl'
      })
      .state('tutorial.topic.join', {
        url: '/join',
        templateUrl: 'app/tutorial/popup/view_components/lecture/topic/join/lecture.topic.join.html',
        controller: 'LectureTopicJoinCtrl'
      })
      .state('tutorial.topic.leave', {
        url: '/leave',
        templateUrl: 'app/tutorial/popup/view_components/lecture/topic/leave/lecture.topic.leave.html',
        controller: 'LectureTopicLeaveCtrl'
      })
      .state('tutorial.file', {
        abstract: true,
        url: '/file',
        template: '<ui-view/>'
      })
      .state('tutorial.file.comment', {
        url: '/comment',
        templateUrl: 'app/tutorial/popup/view_components/lecture/file/comment/lecture.file.comment.html',
        controller: 'LectureFileCommentCtrl'
      })
      .state('tutorial.file.upload', {
        url: '/upload',
        templateUrl: 'app/tutorial/popup/view_components/lecture/file/upload/lecture.file.upload.html',
        controller: 'LectureFileUploadCtrl'
      })
      .state('tutorial.dm', {
        abstract: true,
        url: '/dm',
        template: '<ui-view/>'
      })
      .state('tutorial.dm.send', {
        url: '/send',
        templateUrl: 'app/tutorial/popup/view_components/lecture/dm/send/lecture.dm.send.html',
        controller: 'LectureDmSendCtrl'
      })
      .state('tutorial.profile', {
        abstract: true,
        url: '/profile',
        template: '<ui-view/>'
      })
      .state('tutorial.profile.change', {
        url: '/change',
        templateUrl: 'app/tutorial/popup/view_components/lecture/profile/change/lecture.profile.change.html',
        controller: 'LectureProfileChangeCtrl'
      })
      .state('tutorial.menu', {
        abstract: true,
        url: '/menu',
        template: '<ui-view/>'
      })
      .state('tutorial.menu.team', {
        url: '/team',
        templateUrl: 'app/tutorial/popup/view_components/lecture/menu/team/lecture.menu.team.html',
        controller: 'LectureMenuTeamCtrl'
      })
      .state('tutorial.menu.help', {
        url: '/help',
        templateUrl: 'app/tutorial/popup/view_components/lecture/menu/help/lecture.menu.help.html',
        controller: 'LectureMenuHelpCtrl'
      });
  }
});
