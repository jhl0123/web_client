/**
 * @fileoverview jandi main controller
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndMainCtrl', JndMainCtrl);

  function JndMainCtrl($scope, $filter, Dialog, RoomTopicList, jndPubSub, memberService,
                          currentSessionHelper, TopicInvitedFlagMap, JndUtil, WatchDog) {
    $scope.isShowDummyLayout = false;
    $scope.tutorial = {
      isShowWelcome: false,
      isShowPopover: false
    };

    $scope.connectSetting = {
      isOpen: false,
      params: null
    };
    var _inviteSocketQueue = [];

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      WatchDog.run();

      _attachEvents();
    }

    /**
     * 이벤트 핸들러를 바인딩 한다.
     * @private
     */
    function _attachEvents() {
      $scope.$on('publicService:hideDummyLayout', _onHideDummyLayout);
      $scope.$on('publicService:showDummyLayout', _onShowDummyLayout);

      $scope.$on('kickedOut', _onKickedOut);
      $scope.$on('jndWebSocketTopic:topicInvited:currentMember', _onTopicInvite);
      
      $scope.$on('JndConnect:open', _onJndConnectOpen);
      $scope.$on('JndConnect:close', _onJndConnectClose);

      $scope.$on('Tutorial:showWelcome', _onShowTutorialWelcome);
      $scope.$on('Tutorial:hideWelcome', _onHideTutorialWelcome);

      $scope.$on('Tutorial:showPopover', _onShowTutorialPopover);
      $scope.$on('Tutorial:hidePopover', _onHideTutorialPopover);
    }

    function _onShowDummyLayout() {
      $scope.isShowDummyLayout = true;
    }
    function _onHideDummyLayout() {
      $scope.isShowDummyLayout = false;
    }

    /**
     * Welcome 튜토리얼 Show 이벤트 핸들러
     * @private
     */
    function _onShowTutorialWelcome() {
      $scope.tutorial.isShowWelcome = true;
    }

    /**
     * Welcome 튜토리얼 Hide 이벤트 핸들러
     * @private
     */
    function _onHideTutorialWelcome() {
      $scope.tutorial.isShowWelcome = false;
    }

    /**
     * Popover 튜토리얼 Show 이벤트 핸들러
     * @private
     */
    function _onShowTutorialPopover() {
      $scope.tutorial.isShowPopover = true;
    }

    /**
     * Popover 튜토리얼 Hide 이벤트 핸들러
     * @private
     */
    function _onHideTutorialPopover() {
      $scope.tutorial.isShowPopover = false;
    }
    /**
     * connect setting show 이벤트 핸들러
     * @param {object} angularEvent
     * @param {object} [params=null] - 세팅 회면 진입 시 connectId 의 수정 페이지를 바로 노출할 경우 해당 변수를 전달해야 한다.
     *  @param  {string} params.unionName - union 이름
     *  @param  {number} params.connectId - connectId
     * @private
     */
    function _onJndConnectOpen(angularEvent, params) {
      JndUtil.safeApply($scope, function() {
        $scope.connectSetting.isOpen = true;
        $scope.connectSetting.params = params || null;
      });
    }

    /**
     * connect hide 이벤트 핸들러
     * @private
     */
    function _onJndConnectClose() {
      JndUtil.safeApply($scope, function() {
        $scope.connectSetting.isOpen = false;
        $scope.connectSetting.params = null;
      });
    }

    /**
     * kick out 이벤트 핸들러
     * @param {object} angularEvent
     * @param {object} socketEvent
     * @private
     */
    function _onKickedOut(angularEvent, socketEvent) {
      var topicEntity = RoomTopicList.get(socketEvent.room.id);
      var topicName = topicEntity.name;
      var msgTmpl = $filter('translate')('@common-kicked-out');
      var msg = msgTmpl.replace('{{TopicName}}', topicName);
      Dialog.warning({
        body:  msg,
        extendedTimeOut: 0,
        timeOut: 0
      });
    }

    /**
     * topic invite 이벤트 핸들러
     * 해당 entity 에 member 를 추가한다
     * @param {object} angularEvent
     * @param {object} socketEvent
     * @private
     */
    function _onTopicInvite(angularEvent, socketEvent) {
      TopicInvitedFlagMap.add(socketEvent.data.topic.id);
      _showTopicInvitedToast(socketEvent.data);
    }

    /**
     * 토픽 초대를 받았을 때 toast 를 노출한다.
     * @param {object} data
     * @private
     */
    function _showTopicInvitedToast(data) {
      var entity = RoomTopicList.get(data.topic.id);
      var memberIdList = RoomTopicList.getMemberIdList(data.topic.id);
      var inviter = data.inviter;
      var filter = $filter('translate');
      var msg;
      var topicName = $filter('htmlEncode')(entity.name);
      var inviterName = $filter('htmlEncode')($filter('getName')(inviter));

      if (entity.type.indexOf('private') !== -1) {
        msg = filter('@topic-invite-private');
      } else {
        msg = filter('@topic-invite-public');
      }
      msg = msg.replace('{{invitorName}}', inviterName);
      msg = msg.replace('{{topicName}}', topicName);

      Dialog.success({
        body:  msg,
        allowHtml: true,
        onTap: function() {
          console.log('### onTap', arguments);
        },
        extendedTimeOut: 0,
        timeOut: 0
      });

      if (memberIdList.indexOf(inviter.id) === -1) {
        memberIdList.push(inviter.id);
      }

      entity.members = memberIdList;
      jndPubSub.pub('room:memberAdded');
    }

    /**
     * 인자로 들어온 entity 가 현재 entity 인지 반환한다
     * @param {object} entity
     * @returns {boolean}
     * @private
     */
    function _isCurrentEntity(entity) {
      return currentSessionHelper.getCurrentEntity().id === (entity && entity.id);
    }
  }
})();
