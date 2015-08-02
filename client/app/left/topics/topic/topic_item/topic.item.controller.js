/**
 * @fileoverview left panel 에서 토픽 하나만 controll한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicItemCtrl', TopicItemCtrl);

  /* @ngInject */
  function TopicItemCtrl($scope, memberService, $timeout) {
    var _joinedEntity;
    var _roomId;

    $scope.isNotificationOff = false;

    $scope.onTooltipShow = onTooltipShow;
    $scope.onTooltipHide = onTooltipHide;

    _init();

    /**
     * 초기화함수이다.
     * @private
     */
    function _init() {
      _initLocalVariables();
      _attachEventListener();
      _checkTopicNotificationSetting();
    }

    function _initLocalVariables() {
      _joinedEntity = $scope.joinedEntity;
      _roomId = _joinedEntity.id;
    }

    function _attachEventListener() {
      $scope.$on('onTopicSubscriptionChanged' + _roomId, _checkTopicNotificationSetting);
    }

    /**
     * 현재 joinedEntity의 notification setting 이 켜져있는지 꺼져있는지 확인한다.
     * @private
     */
    function _checkTopicNotificationSetting() {
      $scope.isNotificationOff = !memberService.isTopicNotificationOn(_roomId);
    }

    // topic title에 mouseenter시 tooltip의 출력 여부 설정하는 function
    // angular ui tooltip에 '' 문자열을 입력하면 tooltip을 출력하지 않음
    function onTooltipShow(event, joinedEntityName) {
      var target;
      var c;

      $scope.tooltip = joinedEntityName;

      target = $( event.target );
      c = target
        .clone()
        .css( {display: 'block', width: '100%', visibility: 'hidden'} )
        .appendTo(target.parent());

      if (c.width() <= target.width()) {
        $scope.tooltip = joinedEntityName;
        $timeout(function() {
          target.trigger('show');
        });
      } else {
        $scope.tooltip = '';
      }

      c.remove();
    }

    function onTooltipHide(event) {
      $scope.tooltip = '';
      $timeout(function() {
        $(event.target).trigger('hide');
      });
    }
  }
})();