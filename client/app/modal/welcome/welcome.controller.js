/**
 * @fileoverview welcome modal controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('WelcomeCtrl', WelcomeCtrl);

  function WelcomeCtrl($scope, $filter, $timeout, Tutorial, AccountHasSeen, modalHelper) {
    var _translate = $filter('translate');

    $scope.curStep = 0;
    $scope.isComplete = true;
    $scope.stepList = [
      {
        imgUrl: '../../../assets/images/tutorial/welcome_01.png',
        content: _translate('@tutorial-slide-1')
      },
      {
        imgUrl: '../../../assets/images/tutorial/welcome_02.png',
        content: _translate('@tutorial-slide-2')
      },
      {
        imgUrl: '../../../assets/images/tutorial/welcome_03.png',
        content: _translate('@tutorial-slide-3')
      }
    ];

    $scope.prev = prev;
    $scope.next = next;
    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      //isComplete 값 변경에 대한 fade 효과를 주기 위해 $timeout 을 사용한다.
      $timeout(function() {
        $scope.isComplete = false;
      });
    }

    /**
     * 다음 스텝으로 진행한다.
     */
    function prev() {
      if ($scope.curStep > 0) {
        $scope.curStep--;
      }
    }

    /**
     * 이전 스텝으로 진행한다.
     */
    function next() {
      if ($scope.curStep >= $scope.stepList.length -1) {
        _complete();
      } else {
        $scope.curStep++;
      }
    }

    /**
     * 모달의 스텝을 모두 완료한다.
     * @private
     */
    function _complete() {
      AccountHasSeen.set('TUTORIAL_VER3_WELCOME', true);
      $scope.isComplete = true;
      //isComplete 값 변경에 대한 fade 효과를 주기 위해 $timeout 을 사용한다.
      $timeout(function() {
        modalHelper.closeModal({
          namespace: 'guide'
        });

        Tutorial.showTooltip();
      }, 100);
    }
  }
})();
