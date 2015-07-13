/**
 * @fileoverview 튜토리얼 토픽 생성 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureTopicCreateCtrl', function ($scope, $rootScope, $filter, jndPubSub, TutorialTutor,
                                                     TutorialData) {
    var TOTAL_STEP = 4;
    var _tutorDataList;

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      TutorialData.get('accountPromise').then(function() {
        $scope.step = 0;
        $scope.entityName = '';
        _initTutor();
        _attachEvents();
      });
    }

    /**
     * 튜터를 초기화한다.
     * @private
     */
    function _initTutor() {
      var userName = TutorialData.getAccount().name;
      _tutorDataList = [
        {
          title: '토픽',
          content: 'blah blah',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        },
        {
          title: '토픽을 만들어봐.',
          content: '눌러!',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        },
        {
          title: userName + ',',
          content: '자 토픽을 만들어봐.',
          top: 255,
          left: 280,
          hasSkip: false,
          hasNext: false
        },
        {
          title: '그레이트팍!',
          content: '{{entityName}} 잘 만들었졍',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        }
      ];
      TutorialTutor.reset();
      TutorialTutor.set(_tutorDataList[0]);
    }

    /**
     * attachEvents
     * @private
     */
    function _attachEvents() {
      $scope.$on('tutorial:nextStep', _onNextStep);
      $scope.$on('tutorial:createTopic', _onCreateTopic);
      $scope.$on('$destroy', _onDestroy);
    }

    /**
     * createTopic 이벤트 핸들러
     * @param {object} event
     * @param {string} entityName
     * @private
     */
    function _onCreateTopic(event, entityName) {
      var tutorData = _tutorDataList[$scope.step + 1];
      $scope.entityName = entityName;
      tutorData.content = tutorData.content.replace('{{entityName}}', $scope.entityName);
      _onNextStep();
    }

    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {

    }

    /**
     * 다음 버튼 클릭시 이벤트 핸들러
     * @private
     */
    function _onNextStep() {;
      var step = $scope.step;
      if (step + 1 === TOTAL_STEP) {
        jndPubSub.pub('tutorial:nextLecture');
      } else {
        step++;
        TutorialTutor.set(_tutorDataList[step]);
      }
      $scope.step = step;
    }
  });
})();
