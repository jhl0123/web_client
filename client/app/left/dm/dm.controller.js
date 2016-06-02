/**
 * @filevoerview left left 밑에 있는  1:1 dm 부분을 control하는 controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('DmCtrl', DmCtrl);

  /* @ngInject */
  function DmCtrl($scope, $timeout, storageAPIservice, DmApi, entityAPIservice, currentSessionHelper,
                           publicService, $filter, modalHelper, jndPubSub, Dialog, JndUtil, centerService,
                           EntityHandler, MessageCacheCollection, DmHandler) {
    // okay - okay to go!
    // loading - currently loading.
    // failed - failed to retrieve list from server.
    $scope.messageListLoadingStatus = 'okay';

    $scope.messageList;
    $scope.isMessageListCollapsed = storageAPIservice.isLeftDMCollapsed();

    // TODO: REALLY??? IS THIS THE BEST???
    $scope.onDMInputFocus = onDMInputFocus;
    $scope.onDMInputBlur = onDMInputBlur;

    $scope.onMessageHeaderClick = onMessageHeaderClick;
    $scope.onMeesageLeaveClick = onMessageLeaveClick;

    $scope.openModal= openTeamMemberListModal;

    $scope.isDisabledMember = isDisabledMember;
    $scope.onStarClick = EntityHandler.toggleStarred;

    $scope.totalAlarmCnt = 0;

    _init();

    function _init() {
      if ($scope.isMessageListCollapsed) {
        $('#dm-list').css('display', 'none');
      }
      _setTotalAlarmCnt();
      // Must keep watching memberList in 'leftController' in order to keep member's starred status.
      $scope.$on('updateBadgePosition', _setTotalAlarmCnt);
      $scope.$on('updateChatList', getMessageList);
      $scope.$watch('isMessageListCollapsed', _onCollapseStatusChanged);
      _parseDm();
    }

    function openTeamMemberListModal() {
      modalHelper.openTeamMemberListModal();
    }

    /**
     * collapse status 변경시 update badge posision 이벤트 트리거한다.
     * @private
     */
    function _onCollapseStatusChanged() {
      jndPubSub.updateBadgePosition();
    }

    function getMessageList() {
      if ($scope.messageListLoadingStatus == 'loading') return;
      $scope.messageListLoadingStatus = 'loading';
      DmHandler.getRecentList().then(_onSuccessGetRecentList, _onErrorGetRecentList);
    }

    /**
     * 최신 대화 목록 조회 성공 콜백
     * @private
     */
    function _onSuccessGetRecentList() {
      $scope.messageListLoadingStatus = 'okay';
      _parseDm();
    }

    /**
     * 최신 대화 목록 조회 실패 콜백
     * @private
     */
    function _onErrorGetRecentList() {
      $scope.messageListLoadingStatus = 'failed';
    }

    /**
     * Dm.list 의 데이터를 파싱하여 컨트롤러에서 필요한 배열을 생성한다.
     * @private
     */
    function _parseDm() {
      var room;
      $scope.messageList = [];
      _.forEach(DmHandler.list, function(chat) {
        room = EntityHandler.get(chat.companionId);
        if (!_.isUndefined(room)) {
          //현재 activate DM 이 아닌곳에 한해서 unread count 를 업데이트 한다.
          if (!_isActiveCurrentDm(room)) {
            entityAPIservice.updateBadgeValue(room, chat.unread);
          }
          $scope.messageList.push(room);
        }
      });
      _setTotalAlarmCnt();
    }
    
    /**
     * message header 클릭 이벤트
     */
    function onMessageHeaderClick(clickEvent) {
      var jqBadge = $(clickEvent.target).find('.left-header-badge');
      if ($('#dm-list').css('display') === 'none') {
        jqBadge.hide();
      }
      $('#dm-list').stop().slideToggle({
        always: function() {
          JndUtil.safeApply($scope, function() {
            jqBadge.show();
            $('#dm-list').css('height', '');
            $scope.isMessageListCollapsed = ($('#dm-list').css('display') === 'none');
            storageAPIservice.setLeftDMCollapsed($scope.isMessageListCollapsed);
            _setTotalAlarmCnt();
            jndPubSub.updateBadgePosition();
          });
        }
      });
    }

    /**
     * 전체 뱃지 개수를 설정한다
     * @private
     */
    function _setTotalAlarmCnt() {
      $scope.totalAlarmCnt = $scope.isMessageListCollapsed ? _getTotalAlarmCnt() : 0;
    }

    /**
     * 전체 뱃지 개수를 반환한다
     * @returns {number}
     * @private
     */
    function _getTotalAlarmCnt() {
      var count;
      var totalCnt = 0;
      _.forEach($scope.messageList, function(entity) {
        count = +(entity.alarmCnt || 0);
        totalCnt += count;
      });
      return totalCnt;
    }

    /**
     * 현재 active 상태인 DM 인지 여부를 확인한다.
     * @returns {*|Object|boolean}
     * @private
     */
    function _isActiveCurrentDm(entity) {
      var currentEntity = currentSessionHelper.getCurrentEntity();
      return currentEntity &&
        (currentEntity.id === entity.id) &&
        centerService.hasBottomReached() &&
        !currentSessionHelper.isBrowserHidden();
    }

    function onMessageLeaveClick(entityId) {
      Dialog.confirm({
        body: $filter('translate')('@common-conversation-leave-confirm'),
        onClose: function(result) {
           if (result === 'okay') {
             DmApi.leaveCurrentMessage(entityId)
               .success(function(response) {
                 //if (entityId == $scope.currentEntity.id) {
                 if (entityId == currentSessionHelper.getCurrentEntity().id) {
                   publicService.goToDefaultTopic();
                 }
               })
               .error(function(err) {
                 // TODO: WHAT SHOULD I DO WHEN FAILED?
               })
               .finally(function() {
                 getMessageList();
               });
           }
        }
      });
    }

    function onDMInputFocus() {
      $('.absolute-search-icon').stop().animate({opacity: 1}, 400);
    }

    function onDMInputBlur() {
      $('.absolute-search-icon').stop().css({'opacity' : 0.2});
    }

    function isDisabledMember(member) {
      return publicService.isDisabledMember(member);
    }


    $scope.$on('leaveCurrentChat', function(event, entityId) {
      onMessageLeaveClick(entityId);
    });
  }

})();