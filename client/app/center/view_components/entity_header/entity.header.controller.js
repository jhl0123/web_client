/**
 * @fileoverview center panel의 header를 관리하는 controller
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('entityHeaderCtrl', entityHeaderCtrl);
  
  /* @ngInject */
  function entityHeaderCtrl($scope, $filter, entityHeader, entityAPIservice, memberService, currentSessionHelper,
                            publicService, jndPubSub, analyticsService, modalHelper, AnalyticsHelper, $state, TopicMessageCache,
                            Dialog, JndUtil, JndConnect, EntityHandler, RoomTopicList, NetInterceptor, jndWebSocket) {

    //console.info('[enter] entityHeaderCtrl', currentSessionHelper.getCurrentEntity());
    var _translate = $filter('translate');
    var _entityId = $state.params.entityId;
    var _entityType = $state.params.entityType;
    var _currentEntity = currentSessionHelper.getCurrentEntity();

    var requestConnectInfo;

    //커넥트 관련 요소를 활성화 할지 여부
    $scope.isConnectActive = JndConnect.isActive();
    $scope._currentEntity = _currentEntity;
    
    $scope.isConnected = true;

    $scope.isMember = false;

    /**
     * inactive(dummy) 유저 인지 여부
     * @type {boolean}
     */
    $scope.isInactiveUser = false;

    $scope.onEntityTitleClicked = onEntityTitleClicked;

    $scope.openInviteModal = modalHelper.openTopicInviteModal;
    $scope.inviteUserToChannel = modalHelper.openTopicInviteFromDmModal;

    $scope.onLeaveClicked = leaveCurrentEntity;
    $scope.onDeleteClicked = deleteCurrentEntity;
    $scope.onCurrentChatLeave = leaveCurrentChat;

    $scope.onUpdateTopicInfoClick = onUpdateTopicInfoClick;
    $scope.onFileListClick = onFileListClick;
    $scope.kickOut = kickOut;
    $scope.openMemberModal =  openMemberModal;
    $scope.onPrefixIconClicked = onPrefixIconClicked;
    $scope.onConnectorToggle = onConnectorToggle;

    $scope.onTopicNotificationBellClicked = onTopicNotificationBellClicked;

    _init();

    /**
     * 초기화 함수.
     * @private
     */
    function _init() {
      //entity 리스트 load 가 완료되지 않았다면 dataInitDone 이벤트를 기다린다
      if (publicService.isInitDone()) {
        _initWithParam(_currentEntity);
        _attachEventListeners();
      } else {
        $scope.$on('publicService:dataInitDone', _init);
      }
    }

    /**
     * 현재 $scope에 event listener를 단다.
     * @private
     */
    function _attachEventListeners() {
      $scope.$on('NetInterceptor:connect', _onConnectionStatusChange);
      $scope.$on('NetInterceptor:disconnect', _onConnectionStatusChange);
      
      $scope.$on('jndWebSocket:connect', _onConnectionStatusChange);
      $scope.$on('jndWebSocket:disconnect', _onConnectionStatusChange);
      
      $scope.$on('onTopicDeleted', _onTopicDeleted);
      $scope.$on('onTopicLeft', _onTopicLeft);
      $scope.$on('onBeforeEntityChange', changeEntityHeaderTitle);

      $scope.$on('webSocketTopic:topicUpdated', _onTopicUpdated);

      $scope.$on('onCurrentEntityChanged', function(event, param) {
        if (_currentEntity !== param) {
          _initWithParam(param);
        }
      });
      $scope.$on('jndWebSocketMember:memberUpdated', _onMemberUpdated);
      $scope.$on('RoomTopicList:changed', _onRoomTopicListChanged);

      $scope.$on('onTopicSubscriptionChanged', function(event, data) {
        if (data.room.id === parseInt(_entityId, 10)) {
          _checkNotificationStatus();
        }
      });
    }

    function _initWithParam(param) {
      if (!!param) {
        _checkCurrentEntity(param);
        _checkDisabledMember();

        _checkOwnership();
        _checkIfDefaultTopic();
        _checkNotificationStatus();

        _initConnectInfo();
        _updateConnectInfo();
      }
    }

    /**
     * Check parameter and update local variable 'currentEntity'.
     * @param param
     * @private
     */
    function _checkCurrentEntity(param) {
      var entity;
      if (publicService.isNullOrUndefined(param)) {
        entity = $scope.currentEntity;
      } else {
        entity = param;
      }

      _setCurrentEntity(entity);
    }

    /**
     * parameter로 들어온 엔티티를 현재 엔티티로 지정한다.
     * @param {object} entity - current entity
     * @private
     */
    function _setCurrentEntity(entity) {
      if (!!entity) {
        _currentEntity = entity;
        _entityId = entity.id;
        _entityType = entity.type;

        $scope.currentEntity = entity;

        $scope.isUser = memberService.isUser(_currentEntity.id);
        $scope.isJandiBot = memberService.isJandiBot(_currentEntity.id);
        $scope.isMember = $scope.isUser || $scope.isJandiBot;

        $scope.isAllowConnect = !$scope.isMember || $scope.isJandiBot;
        _setUserList();
      }
    }

    /**
     * 토픽 참여자 리스트를 생성한다.
     * @private
     */
    function _setUserList() {
      _checkOwnership();
      $scope.users = _getUsers(_currentEntity);
    }

    /**
     * roomTopicList 정보가 변경되었을 때 이벤트 핸들러
     * @param {object} angularEvent
     * @param {object} changedIdMap - 변경된 topic 의 id map
     *    @param {boolean} changedIdMap.id
     * @private
     */
    function _onRoomTopicListChanged(angularEvent, changedIdMap) {
      var currentId = $scope.currentEntity.id;
      if (changedIdMap[currentId]) {
        _setCurrentEntity(RoomTopicList.get(currentId));
      }
    }

    /**
     * member 정보 update 시 entity header 정보 업데이트
     * ex) member 가 dummy 에서 실제 사용자로 변경 시, 혹은 이름 변경 시
     * @param {object} angularEvent
     * @param {object} data
     *    @param {object} member  - 멤버 정보
     * @private
     */
    function _onMemberUpdated(angularEvent, data) {
      var currentId = $scope.currentEntity.id;
      //현재 방이 TOPIC 의 경우 현재 방의 member list 를 갱신한다.
      if (RoomTopicList.isExist(currentId)) {
        _setUserList();
      //현재 방이 DM 의 경우
      } else if (data.member.id === currentId) {
        _initWithParam(EntityHandler.get(currentId));
      }
    }

    /**
     * Check ownership of current entity whether I'm an owner of current entity or not.
     * Set updated value to $scope.isOwner variable.
     */
    function _checkOwnership() {
      $scope.myId = memberService.getMemberId();
      $scope.ownerId = entityAPIservice.getOwnerId(_currentEntity);
      $scope.isOwner = entityAPIservice.isOwner(_currentEntity, memberService.getMemberId());
      $scope.isAdmin = memberService.isAdmin();
      $scope.hasAuth = $scope.isOwner || $scope.isAdmin;
      $scope.hasKickoutAuth = !currentSessionHelper.isDefaultTopic(_currentEntity) && $scope.hasAuth;
    }

    /**
     * Check whether current entity is a default topic of current team.
     * * Set updated value to $scope.isDefaultTopic variable.
     */
    function _checkIfDefaultTopic() {
      $scope.isDefaultTopic = currentSessionHelper.isDefaultTopic(_currentEntity);
    }

    /**
     * 현재 entity 가 disabled된 상태인지 아닌지 확인한다.
     * @private
     */
    function _checkDisabledMember() {
      if (publicService.isDisabledMember(_currentEntity)) {
        $scope.isDisabledEntity = true;
      } else {
        $scope.isDisabledEntity = false;
      }

      $scope.isInactiveUser = memberService.isInactiveUser(_currentEntity);
      $scope.isAllowUserable = !$scope.isDisabledEntity && !$scope.isJandiBot;
    }

    /**
     * 현재 토픽의 notification setting을 체크한다.
     * @private
     */
    function _checkNotificationStatus() {
      $scope.isTopicNotificationOn = memberService.isTopicNotificationOn(_entityId);

      if ($scope.isTopicNotificationOn) {
        $scope.topicNotificationBellTooltipMsg = _translate('@turn-off-topic-alarm');
      } else {
        $scope.topicNotificationBellTooltipMsg = _translate('@turn-on-topic-alarm');
      }
    }

    /**
     * 현재 entity(topic)를 떠난다.
     */
    function leaveCurrentEntity() {
      if (_entityType === 'privategroups') {
        Dialog.confirm({
          allowHtml: true,
          body: _translate('@ch-menu-leave-private-confirm'),
          onClose: function(result) {
            result === 'okay' && _setLeaveCurrentEntity();
          }
        });
      } else {
        _setLeaveCurrentEntity();
      }
    }

    /**
     * 현재 토픽을 떠나도록 설정함.
     * @private
     */
    function _setLeaveCurrentEntity() {
      var isTopicAdmin = entityAPIservice.isOwner(_currentEntity, memberService.getMemberId());
      var userLength = $scope.users ? $scope.users.length : 0;

      if (isTopicAdmin && userLength > 1) {
        // 토픽 관리자가 토픽을 스스로 나갈때 관리자 권한을 이양할 사용자가 존재한다면 confirm창을 띄우게된다.

        _showLeaveCurrentEntityConfirm();
      } else {
        _requestLeaveEntity();
      }
    }

    /**
     * 관리자 이양 confrim 출력함.
     * @private
     */
    function _showLeaveCurrentEntityConfirm() {
      Dialog.confirm({
        title: _translate('@topic-admin-transfer-adminleave-confirm'),
        allowHtml: true,
        onClose: function(result) {
          if (result === 'okay') {
            modalHelper.openTopicRenameModal($scope, {
              onChangeTopicAdmin: function() {

                // topic admin 변경이 완료된 후 토픽을 떠나도록 요청한다.
                _requestLeaveEntity();
              }
            });
          }
        }
      });
    }

    /**
     * 사용자를 kickout 한다.
     * @param {number} userId
     */
    function kickOut(userId) {
      var isTopicAdmin = entityAPIservice.isOwner(_currentEntity, userId);

      Dialog.confirm({
        title: _translate('@confirm-kickout'),
        body: isTopicAdmin ? _translate('@topic-admin-transfer-kickout-confirm') : undefined,
        onClose: function(result) {
          if (result === 'okay') {
            _doKickOutUser(isTopicAdmin, userId);
          }
        }
      });
    }

    /**
     * 특정 사용자를 퇴장시킴
     * @param {boolean} isTopicAdmin
     * @param {number} userId
     * @private
     */
    function _doKickOutUser(isTopicAdmin, userId) {
      if (isTopicAdmin) {
        modalHelper.openTopicRenameModal($scope, {
          topicAdminId: userId,
          onChangeTopicAdmin: function() {
            _requestKickOut(userId);
          }
        });
      } else {
        _requestKickOut(userId);
      }
    }

    /**
     * 퇴장 요청함
     * @param {number} userId
     * @private
     */
    function _requestKickOut(userId) {
      entityHeader.kickOut(_entityId ,userId)
        .error(_onKickOutFailed);
    }

    /**
     * 강퇴 실패시 이벤트 핸들러
     * @param {object} response
     * @param {number} status
     * @private
     */
    function _onKickOutFailed(response, status) {
      JndUtil.alertUnknownError(response, status);
    }

    /**
     * request leave entity
     * @private
     */
    function _requestLeaveEntity() {
      entityHeader.leaveEntity(_entityType, _entityId)
        .success(function() {
          _successLeaveEntityAnalytics();

          TopicMessageCache.remove(_entityId);
          publicService.goToDefaultTopic();
        })
        .error(function(error) {
          _errorLeaveEntityAnalytics(error);
        });
    }

    /**
     * success leave entity analytics
     * @private
     */
    function _successLeaveEntityAnalytics() {
      // analytics
      var entity_type = analyticsService.getEntityType(_entityType);

      try {
        AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_LEAVE, {
          'RESPONSE_SUCCESS': true,
          'TOPIC_ID': parseInt(_entityId, 10)
        });
      } catch (e) {
      }
      analyticsService.mixpanelTrack("Entity Leave", {'type': entity_type} );
    }

    /**
     * error leave entity analytics
     * @param {object} error
     * @private
     */
    function _errorLeaveEntityAnalytics(error) {
      try {
        AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_LEAVE, {
          'RESPONSE_SUCCESS': true,
          'ERROR_CODE': error.code
        });
      } catch (e) {
      }
    }

    /**
     * update topic info click
     */
    function onUpdateTopicInfoClick() {
      modalHelper.openTopicRenameModal($scope, {
        enableTransferConfirm: true
      });
    }

    /**
     * 현재 entity(toppic)를 지운다.
     */
    function deleteCurrentEntity() {
      Dialog.confirm({
        body: _translate('@ch-menu-delete-confirm'),
        onClose: function(result) {
          if (result === 'okay') {
            entityHeader.deleteEntity(_entityType, _entityId)
              .success(function() {
                var entity_type = analyticsService.getEntityType(_entityType);
                // analytics
                try {
                  AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_DELETE, {
                    'RESPONSE_SUCCESS': true,
                    'TOPIC_ID': parseInt(_entityId, 10)
                  });
                } catch (e) {
                }

                analyticsService.mixpanelTrack("Entity Delete", {'type': entity_type});
    
                TopicMessageCache.remove(_entityId);
    
                // topic 삭제시 file upload 중이라면 전부 취소하는 event를 broadcast함
                jndPubSub.pub('onFileUploadAllClear');
    
                publicService.goToDefaultTopic();
              })
              .error(function(error) {
                // analytics
                try {
                  AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_DELETE, {
                    'RESPONSE_SUCCESS': false,
                    'ERROR_CODE': error.code
                  });
                } catch (e) {
                }
              });
          }
        }
      });
    }

    /**
     * 현재 1:1 창을 나간다.
     */
    function leaveCurrentChat() {
      jndPubSub.pub('leaveCurrentChat', _entityId);
    }

    /**
     * 1:1 DM 경우에서 상대방의 파일리스트 보기를 눌렀을 경우.
     * @param memberId
     */
    function onFileListClick(memberId) {
      jndPubSub.pub('showUserFileList', memberId);
    }
    /**
     * title 이 클릭되어졌을 경우에 호출된다.
     */
    function onEntityTitleClicked() {
      if (_currentEntity.type === 'users') {
        openMemberModal();
      }
    }

    /**
     * 엔티티 타입 아이콘 (타이틀 왼쪽에 위치한 아이콘)이 클릭되어졌을 때 호출된다.
     */
    function onPrefixIconClicked() {
      if (_entityType === 'users') {
        openMemberModal();
      }
    }

    /**
     * connector toggle
     * @param {boolean} $isOpen
     */
    function onConnectorToggle() {
      // connector가 toggle 될때마다 server로 request하여 connect plugs를 갱신한다.
      // 항상 갱신하는 이유는 entity header에 노출되는 count를 항상 갱신해야 하기 때문이다.
      _updateConnectInfo();
    }

    /**
     * 토픽별 노티피케이션 설정 아이콘을 클릭했을 때 호출된다.
     */
    function onTopicNotificationBellClicked() {
      entityHeader.toggleTopicNotification(_entityId, !$scope.isTopicNotificationOn);
    }

    /**
     *
     * @param memberId
     */
    function openMemberModal(memberId) {
      jndPubSub.pub('onMemberClick', memberId || _currentEntity);
    }

    // TODO: PLEASE REFACTOR THIS 'onStarClick' method.
    // TODO: THERE ARE MANY DIFFERENT PLACES USING DUPLICATED LINES OF CODES.
    $scope.onStarClick = function() {
      EntityHandler.toggleStarred(_entityId)
    };

    /**
     * connection 상태가 변경되었을 때 콜백
     * @private
     */
    function _onConnectionStatusChange() {
      JndUtil.safeApply($scope, function() {
        $scope.isShowConnectionWarning = _isShowConnectionWarning();
      });
    }

    /**
     * connection warning 을 보여줄지 여부를 반환한다.
     * @returns {boolean}
     * @private
     */
    function _isShowConnectionWarning() {
      return !NetInterceptor.isConnected() || !jndWebSocket.isConnected();
    }
    
    /**
     * left에서 토픽이 클릭되었을 때 우선적으로 header의 title을 바꾸세요! 라고 말해준다.
     * 그 이벤트를 듣고있다가 바꾼다.
     * @param event
     * @param param
     */
    function changeEntityHeaderTitle(event, param) {
      $scope.currentEntity = _currentEntity = param;
      _initWithParam(param);
    }

    /**
     * 현재 보고있는 토픽이 지워졌을 경우.
     * @param event
     * @param data
     * @private
     */
    function _onTopicDeleted(event, data) {
      if (data.topic.id === _entityId) {
        TopicMessageCache.remove(_entityId);
        publicService.goToDefaultTopic();
      }
    }

    /**
     * 현재 보고 있는 토픽을 나갔을 경우.
     * @param event
     * @param data
     * @private
     */
    function _onTopicLeft(event, data) {
      _onTopicDeleted(event, data);
    }

    /**
     * 토픽 정보가 갱신된 경우
     * @param {object} $event
     * @param {object} topic
     * @private
     */
    function _onTopicUpdated($event, topic) {
      if (topic.id === $scope.currentEntity.id) {
        _checkOwnership();
      }
    }

    /**
     * init connect info
     * @private
     */
    function _initConnectInfo() {
      $scope.connectInfo = {};
    }

    /**
     * update connect info
     * @private
     */
    function _updateConnectInfo() {
      var room;
      var roomId;
      var entityId;

      if ($scope.isAllowConnect) {
        entityId = $scope.isMember ? $scope.currentEntity.entityId : $scope.currentEntity.id;

        if (entityId) {
          // currentEntity에서 entityId 또는 id를 전달 받을 수 있는경우

          if (room = EntityHandler.get(entityId)) {
            roomId = memberService.isJandiBot(room.id) ? room.entityId : room.id;

            requestConnectInfo && requestConnectInfo.abort();
            requestConnectInfo = entityHeader.getConnectInfo(roomId)
              .success(function(data) {
                $scope.connectInfo = data;
              });
          }
        } else {
          // currentEntity.entityId를 전달 못받을 수도 있다. 예를들어, DM의 경우 currentEntity 는 member object에서 room 정보를
          // 포함하는 확장된 값을 사용하는데 사용자가 상대방과 DM에서 메세지를 주고 받다가 DM리스트에서 삭제한 경우 currentEntity는
          // member object로서의 역활만 가능하다. 그러므로 DM에 해당하는 entityId를 알 수 있는 시점에 connect 정보를 요청해야 한다.
          // center.controller에 messageAPIservice.getMessages 호출한 응답값으로 entityId를 알 수 있으므로 여기에 해당 처리의
          // 코드를 작성한다.

          _attachEntityIdChange();
        }
      }
    }

    /**
     * attach entityId change event handler
     * DM이고 해당 DM의 roomId를 entityMap에서 읽을 수 없을때 사용함
     * @private
     */
    function _attachEntityIdChange() {
      var entityIdChanged;
      entityIdChanged = $scope.$on('centerService:roomIdChanged', function (angularEvent, entityId) {
        requestConnectInfo && requestConnectInfo.abort();
        requestConnectInfo = entityHeader.getConnectInfo(entityId)
          .success(function(data) {
            $scope.connectInfo = data;
            entityIdChanged();
          });
      });
    }

    /**
     * get users
     * @param {object} entity
     * @returns {Array}
     * @private
     */
    function _getUsers(entity) {
      var currentUser;
      var user;
      var users = [];
      var userIdList = RoomTopicList.getUserIdList(entity.id);
      var currentUserId = memberService.getMemberId();
      var isKickedOutEnable;
      var isTopicAdmin;
      
      if (userIdList.length) {
        _.each(userIdList, function(userId) {
          isKickedOutEnable = !!($scope.hasKickoutAuth && userId !== currentUserId);
          isTopicAdmin = userId === entityAPIservice.getOwnerId(_currentEntity);
          user = {
            id: userId,
            name: memberService.getNameById(userId),
            isKickedOutEnable: isKickedOutEnable,
            isTopicAdmin: isTopicAdmin
          };

          //현재 로그인 한 user 는 목록의 최상단에 위치시키기 위함
          if (userId === currentUserId) {
            currentUser = user;
          } else {
            users.push({
              id: userId,
              name: memberService.getNameById(userId),
              isKickedOutEnable: isKickedOutEnable,
              isTopicAdmin: isTopicAdmin
            });
          }
        });

        users = _.sortBy(users, function (user) {
          return user.name.toLowerCase();
        });
        users.unshift(currentUser);
      }

      return users;
    }
  }
})();
