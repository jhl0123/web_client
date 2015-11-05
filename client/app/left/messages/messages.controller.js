/**
 * @filevoerview left left 밑에 있는  1:1 dm 부분을 control하는 controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('messageListCtrl', messageListCtrl);

  /* @ngInject */
  function messageListCtrl($scope, $timeout, storageAPIservice, messageList, entityAPIservice, currentSessionHelper,
                           publicService, $filter, modalHelper, jndPubSub, EntityMapManager, Dialog, JndUtil) {
    // okay - okay to go!
    // loading - currently loading.
    // failed - failed to retrieve list from server.
    $scope.messageListLoadingStatus = 'okay';

    // no longer used in this controller. ready to remove?
    $scope.currentEntity = currentSessionHelper.getCurrentEntity();

    $scope.messageList;
    $scope.isMessageListCollapsed = storageAPIservice.isLeftDMCollapsed();

    // TODO: REALLY??? IS THIS THE BEST???
    $scope.onDMInputFocus = onDMInputFocus;
    $scope.onDMInputBlur = onDMInputBlur;

    $scope.onMessageHeaderClick = onMessageHeaderClick;
    $scope.onMeesageLeaveClick = onMessageLeaveClick;

    $scope.openModal= openTeamMemberListModal;

    $scope.isDisabledMember = isDisabledMember;
    $scope.totalAlarmCnt = 0;

    _init();

    function _init() {
      if ($scope.isMessageListCollapsed) {
        $('#dm-list').css('display', 'none');
      }
      _setTotalAlarmCnt();
      // Must keep watching memberList in 'leftController' in order to keep member's starred status.
      $scope.$on('updateBadgePosition', _setTotalAlarmCnt);
      $scope.$watch('memberList', getMessageList);
      $scope.$on('updateChatList', getMessageList);
      $scope.$watch('isMessageListCollapsed', _onCollapseStatusChanged);
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

      messageList.getRecentMessageList()
        .success(function(response) {
          $scope.messageList = _generateMessageList(response);
          $scope.messageListLoadingStatus = 'okay';
          publicService.setInitDone();
        })
        .error(function(err) {
          $scope.messageListLoadingStatus = 'failed';
        })
        .finally(function() {
        });
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

    function _generateMessageList(messages) {
      var messageList = [];
      var _currentEntity;

      EntityMapManager.reset('memberEntityId');
      messages = _.uniq(messages, 'entityId');

      _.each(messages, function(message) {

        var entity = EntityMapManager.get('total', message.companionId);

        if (!angular.isUndefined(entity)) {
          if (message.unread > 0) {
            // Number of unread message can be greater than 0 even I'm currently viewing an entity that just sent a message to me.
            // In this case, message list still needs to be updated because entity may not be on the list.
            // However, I don't need to update/increment badge count for current entity.
            // Thus, update badge count for entities that I'm not viewing.
            // 원래는 위와 같은 이유로 현재 보고 있지 않는 엔티티에 대해서만 badge 를 update했지만,
            // 백앤드에 내가 작성한 메세지에 대해서는 unread를 증가시ㅣ지 않는 방향으로 가기로 함.
            // 그래서 모든 엔티티에 대해서 badge를 update해도 됨.

            entityAPIservice.updateBadgeValue(entity, message.unread);

            //_currentEntity = currentSessionHelper.getCurrentEntity();
            //if (message.companionId != _currentEntity.id) {

            //}
          }

          // merge message object to entity object so that list can be sorted by 'lastMessageId' attribute in message object.
          $.extend(entity, message);
          messageList.push(entity);
          EntityMapManager.add('memberEntityId', entity);
        }
      });
      _setTotalAlarmCnt();
      return messageList;
    }

    function onMessageLeaveClick(entityId) {
      Dialog.confirm({
        body: $filter('translate')('@common-conversation-leave-confirm'),
        onClose: function(result) {
           if (result === 'okay') {
             messageList.leaveCurrentMessage(entityId)
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

    // TODO: PLEASE REFACTOR THIS 'onStarClick' method.
    // TODO: THERE ARE MANY DIFFERENT PLACES USING DUPLICATED LINES OF CODES.
    $scope.onStarClick = function(entityType, entityId) {
      var param = {
        entityType: entityType,
        entityId: entityId
      };

      jndPubSub.pub('onStarClick', param);
    }
  }

})();