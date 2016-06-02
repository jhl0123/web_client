/**
 * @fileoverview 메세지 콜렉션 클래스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('CenterPanelCtrl', CenterPanelCtrl);

  function CenterPanelCtrl($scope, $rootScope, $state, $filter, $timeout, $q, messageAPIservice, fileAPIservice,
                           entityAPIservice, analyticsService, memberService, publicService, MessageQuery,
                           currentSessionHelper, logger, centerService, markerService, TextBuffer, modalHelper,
                           NetInterceptor, jndPubSub, jndKeyCode, MessageCacheCollection, MessageSendingCollection,
                           AnalyticsHelper, Announcement, NotificationManager, Dialog, RendererUtil, HybridAppHelper,
                           TopicInvitedFlagMap, UserList, JndConnect, RoomTopicList, SocketEventApi, jndWebSocket,
                           ActiveNotifier, EntityFilterMember, DmApi) {

    var TEXTAREA_MAX_LENGTH = 40000;
    var CURRENT_ENTITY_ARCHIVED = 2002;
    var INVALID_SECURITY_TOKEN = 2000;

    var _scrollHeightBefore;
    var _hasLastReadMarker;

    var _isDestroyed = false;
    var _isViewContentLoaded = false;

    var _messageCollection;

    var _entityType = $state.params.entityType;
    var _entityId = +$state.params.entityId;

    // 처음에 center에 진입할 때, 현재 entityId가 가지고 있는 마지막으로 읽은 message marker를 불러온다.
    // message marker는 link id와 동일하다. message id 아님.
    var _lastReadMessageMarker;
    var _isFromSearch = false;
    var _isLogEnabled = true;
    var _hasRoomMarkerInfo = false;
    /**
     * right panel 이 open 되었을 때 scroll 을 최 하단으로 보낼지 여부
     * @type {boolean}
     * @private
     */
    var _wasBottomReached = false;

    /**
     * Indicates that whether current entity has failed getting room info once.
     * @type {boolean}
     * @private
     */
    var _hasRetryGetRoomInfo = false;

    var _deferredObject = {
      getMessage: null,
      postMessage: null,
      updateMessage: null,
      getRoomInformation: null
    };

    var _stickerType = 'chat';
    var _sticker = null;

    /**
     *
     * @type {{entityType: *}}
     */
    $scope.analytics = {
      entityType: _entityType
    };

    $scope.hasScrollToBottom = false;
    $scope.hasOldMessageToLoad = true;
    $scope.hasNewMsg = false;
    $scope.isInitializeRender = false;
    $scope.hasLastMessageRendered = false;
    $scope.emptyMessageStateHelper = '';

    //todo: $scope property 수가 너무 많아질 경우, object 형태로 관리하는 방안을 고려해 보아야 함.


    $scope.onClickUnshare = onClickUnshare;
    $scope.onFileListClick = onFileListClick;
    $scope.onShareClick = onShareClick;
    $scope.isDisabledMember = publicService.isDisabledMember;

    $scope.onTextChange = _cutTextareaMaxLength;
    $scope.onMessageInputChange = onMessageInputChange;

    $scope.setCommentFocus = setCommentFocus;

    $scope.loadNewMessages = loadNewMessages;
    $scope.loadOldMessages = loadOldMessages;
    $scope.clearNewMessageAlerts = clearNewMessageAlerts;

    $scope.post = post;
    $scope.postMessage = postMessage;

    $scope.openModal = openModal;
    $scope.hasMoreNewMessageToLoad = hasMoreNewMessageToLoad;

    $scope.isTextType = isTextType;
    $scope.isCommentType = isCommentType;

    $scope.onScrollToBottomIconClicked = onScrollToBottomIconClicked;
    $scope.onHasNewMessageAlertClicked = onHasNewMessageAlertClicked;
    $scope.onHasNewMessageAlertCloseClicked = onHasNewMessageAlertCloseClicked;

    $scope.onRepeatDone = onRepeatDone;
    $scope.onSendingRepeatDone = onSendingRepeatDone;

    $scope.isLastReadMarker = isLastReadMarker;


    _init();

    /**
     * 생성자 함수
     * @private
     */
    function _init() {
      $scope.$on('$stateChangeSuccess', _onStateChangeSuccess);
      $scope.$on('$viewContentLoaded', _onViewContentLoaded);

      //entity 리스트 load 가 완료되지 않았다면 dataInitDone 이벤트를 기다린다
      if (publicService.isInitDone() && _entityId && _entityType) {
        _initializeListeners();
        _initialRender();
      } else {
        $scope.$on('publicService:dataInitDone', _init);
      }
    }

    /**
     * 초기 랜더링을 한다.
     * @private
     */
    function _initialRender() {
      if (publicService.isInitDone()) {
        centerService.preventChatWithMyself(_entityId);
        TopicInvitedFlagMap.remove(_entityId);
        _reset();
        _initMessageCollection();
        _initializeView();
        _initializeFocusStatus();

        if (!_messageCollection.status.isInitialized) {
          _messageCollection.getRequestPromise().then(
            _getCurrentRoomMarker
          );
        } else {
          _getCurrentRoomMarker();
        }
        _checkEntityMessageStatus();
        centerService.setHistory(_entityType, _entityId);
      }
    }

    /**
     * 브라우저의 focus 상태를 초기화한다
     * @private
     */
    function _initializeFocusStatus() {
      if (document.hasFocus()) {
        centerService.setBrowserFocus();
      } else {
        centerService.resetBrowserFocus();
      }
    }

    /**
     * 어떠한 메세지 리스트를 보여줄지 결정한다.
     * @private
     */
    function _initializeView() {
      if (MessageQuery.hasSearchLinkId()) {
        _search();
      } else {
        _messageCollection.render();
      }
    }

    /**
     * 내부 변수를 초기화 한다.
     * @private
     */
    function _reset() {
      $scope.isInitializeRender = false;
      $scope.currentEntity = currentSessionHelper.getCurrentEntity();
      $scope.analytics.entityType = _entityType;
      MessageSendingCollection.reset();

      centerService.setEntityId(centerService.isChat() ? currentSessionHelper.getCurrentEntity().entityId : _entityId);

      modalHelper.closeModal('cancel');
      _cancelHttpRequest();
      _initLocalVariables();
      _hideContents();
    }

    /**
     * 내부에서 사용할 변수를 모두 초기화한다.
     * @private
     */
    function _initLocalVariables() {
      _hasRoomMarkerInfo = false;
      _isFromSearch = false;
      _hasRetryGetRoomInfo = false;
      _wasBottomReached = false;
      _hasLastReadMarker = false;
      _lastReadMessageMarker = _getEntityId() ? memberService.getLastReadMessageMarker(_getEntityId()) : null;

      _deferredObject = {
        getMessage: null,
        postMessage: null,
        updateMessage: null,
        getRoomInformation: null
      };

      _stickerType = 'chat';
      _sticker = null;

      $scope.hasScrollToBottom = false;
      $scope.hasNewMsg = false;
      $scope.isInitializeRender = false;
      $scope.hasLastMessageRendered = false;
      $scope.emptyMessageStateHelper = '';

      _resetUnreadCounters();
      _resetNewMsgHelpers();
    }

    /**
     *  scope listener를 초기화한다.
     * @private
     */
    function _initializeListeners() {

      $scope.$on('NetInterceptor:connect', _onConnected);
      $scope.$on('NetInterceptor:onGatewayTimeoutError', _refreshView);
      $scope.$on('Auth:refreshTokenSuccess', _refreshView);

      $scope.$on('refreshCurrentTopic', _refreshCurrentTopic);
      $scope.$on('MessageCollection:newMessageArrived', _onNewMessageArrived);
      $scope.$on('MessageCollection:newSystemMessageArrived', _onNewSystemMessageArrived);
      $scope.$on('elasticResize:message', _onElasticResize);
      $scope.$on('jumpToMessageId', _search);
      $scope.$on('setChatInputFocus', _setChatInputFocus);
      $scope.$on('EntityHandler:parseLeftSideMenuDataDone', _checkEntityMessageStatus);

      // $scope.$on('centerUpdateChatList', _onChatUpdated);

      $scope.$on('centerOnMarkerUpdated', _onCenterMarkerUpdated);
      $scope.$on('centerOnTopicLeave', _onCenterOnTopicLeave);
      $scope.$on('onChangeSticker:' + _stickerType, _onChangeSticker);
      $scope.$on('center:scrollToBottom', _centerScrollToBottom);
      $scope.$on('Router:openRightPanel', _onBeforeRightPanelOpen);
      $scope.$on('RightPanel:rendered', _onAfterRightPanelOpen);
      $scope.$on('onStageLoadedToCenter', function () {
        $('#file-detail-comment-input').focus();
      });

      $scope.$on('attachMessagePreview', _onAttachMessagePreview);
      $scope.$on('attachMessagePreviewThumbnail', _onLinkPreviewThumbnailCreated);

      $scope.$on('showUserFileList', function (event, param) {
        onFileListClick(param);
      });

      $scope.$on('window:focus', _onWindowFocus);
      $scope.$on('window:blur', _onWindowBlur);
      $scope.$on('window:unload', _onWindowUnload);

      $scope.$on('body:dragStart', _onDragStart);
      $scope.$on('topicDeleted', _onTopicDeleted);

      $scope.$on('MessageCollection:messageDeleted', _checkEntityMessageStatus);
      $scope.$on('MessageCollection:commentDeleted', _checkEntityMessageStatus);
    }

    /**
     * message collection 을 초기화 한다.
     * @private
     */
    function _initMessageCollection() {
      _messageCollection = MessageCacheCollection.getCurrent();

      $scope.status = _messageCollection.status;
      $scope.isNewDate = _messageCollection.isNewDate;
      $scope.hasLinkPreview = _messageCollection.hasLinkPreview;
      $scope.isChildText = _messageCollection.isChildText;
      $scope.isChildComment = _messageCollection.isChildComment;
      $scope.isTitleComment = _messageCollection.isTitleComment;
    }

    /**
     * state change 이벤트 핸들러
     * @param {Object} event
     * @param {Object} toState
     * @param {Object} toParams
     * @param {Object} fromState
     * @param {Object} fromParams
     * @private
     */
    function _onStateChangeSuccess(event, toState, toParams, fromState, fromParams) {
      var entityId = +toParams.entityId;
      var entityType = toParams.entityType;
      if (entityId && entityType && _isRoomChanged(entityId)) {
        if (_entityId && _messageCollection) {
          _saveTextBuffer();
          _messageCollection.toBackground();
        }
        _entityType = entityType;
        _entityId = +entityId;
        _initialRender();
      }
    }

    /**
     * 방 정보가 변경 되었는지 여부를 반환한다.
     * @param {number} entityId
     * @returns {boolean}
     * @private
     */
    function _isRoomChanged(entityId) {
      return entityId !== _entityId;
    }

    /**
     * 새 메세지를 조회하고 있는지를 반환한다.
     * @returns {boolean}
     * @private
     */
    function _isLoadingNewMessages() {
      return MessageQuery.get('type') === 'new';
    }

    /**
     * 이전 메세지를 조회하고 있는지를 반환한다.
     * @returns {boolean}
     * @private
     */
    function _isLoadingOldMessages() {
      return MessageQuery.get('type') === 'old';
    }

    /**
     * 현재 topic 을 새로고침한다.
     * @private
     */
    function _refreshCurrentTopic(isSkipBookmark) {
      if (!$scope.status.isLoading && NetInterceptor.isConnected()) {
        _reset();
        _messageCollection.initialRequest()
          .then(_.bind(_getCurrentRoomMarker, this));
      }
    }

    /**
     * 컨트롤러의 view content 가 load 되었을 시 이벤트 핸들러 ($viewContentLoaded 이벤트 핸들러)
     * @private
     */
    function _onViewContentLoaded() {
      _isViewContentLoaded = true;
      $timeout(function () {
        _loadTextBuffer();
      });
    }

    /**
     * 현재 작동하고 있는 getMessages call을 resolve한다.
     * @private
     */
    function _cancelHttpRequest() {
      _.each(_deferredObject, function (deferred) {
        if (deferred && _.isFunction(deferred.resolve)) {
          deferred.resolve();
        }
      });
    }

    /**
     * 스크롤이 노출되었는지 여부를 반환한다
     * @returns {boolean}
     * @private
     */
    function _hasScroll() {
      return $('#msgs-holder').height() > $('#msgs-container').height();
    }

    /**
     * 윈도우 focus 시 이벤트 핸들러
     * @private
     */
    function _onWindowFocus() {
      if (_isViewContentLoaded) {
        centerService.setBrowserFocus();
        if (!_hasScroll() || centerService.isScrollBottom()) {
          _clearBadgeCount($scope.currentEntity);
        }
        NotificationManager.resetNotificationCountOnFocus();
        // update hybrid app badge
        HybridAppHelper.updateBadge();
      }
    }

    /**
     * 윈도우 blur 시 이벤트 핸들러
     * @private
     */
    function _onWindowBlur() {
      if (_isViewContentLoaded) {
        centerService.resetBrowserFocus();
      }
    }

    /**
     * window unload event handler
     * @private
     */
    function _onWindowUnload() {
      if (_isViewContentLoaded) {
        _saveTextBuffer();
      }
    }

    /**
     * center에 drag&drop 으로 file upload시 window 내에서 발생하는
     * drag&drop 이벤트 에서도 file upload sequence 시작되기 때문에
     * window의 drag start event cancel
     */
    function _onDragStart($event, dragEvent) {
      if (_isViewContentLoaded) {
        dragEvent.preventDefault();
        dragEvent.stopPropagation();
        return false;
      }
    }

    /**
     * 검색한다.
     * @private
     */
    function _search() {
      _hideContents();
      _reset();
      _isFromSearch = true;
      _messageCollection.reset();
      _messageCollection.request();
    }

    /**
     * 해당 index 가 TextType 인지 여부를 반환한다.
     * @param index
     * @returns {*|boolean}
     */
    function isTextType(index) {
      return centerService.isTextType(_messageCollection.getContentType(index));
    }

    /**
     * 해당 index 가 CommentType 인지 여부를 반환한다.
     * @param index
     * @returns {*|boolean}
     */
    function isCommentType(index) {
      return centerService.isCommentType(_messageCollection.getContentType(index));
    }

    /**
     * 새 message 를 load 한다.
     * @returns {boolean}
     */
    function loadNewMessages() {
      if (hasMoreNewMessageToLoad() && NetInterceptor.isConnected() && !_messageCollection.status.isLoading) {
        MessageQuery.set({
          type: 'new',
          linkId: _messageCollection.getLastLinkId()
        });
        _messageCollection.request(MessageQuery.get());
        return true;
      } else {
        return false;
      }
    }

    /**
     * 이전 message 를 load 한다.
     * @returns {boolean}
     */
    function loadOldMessages() {
      if (_hasMoreOldMessageToLoad() && NetInterceptor.isConnected() && !_messageCollection.status.isLoading) {
        var container = document.getElementById('msgs-container');
        _scrollHeightBefore = container.scrollHeight;
        MessageQuery.set({
          type: 'old',
          linkId: _messageCollection.getFirstLinkId()
        });
        _messageCollection.request(MessageQuery.get());
        return true;
      } else {
        return false;
      }
    }

    /**
     * Checks if there is no old messages to load.
     * Meaning all previous messages has been loaded and display on web.
     * @returns {boolean}
     * @private
     */
    function _hasMoreOldMessageToLoad() {
      var firstLinkId = _messageCollection.roomData.firstLinkId;
      if (_messageCollection.list.length &&
        firstLinkId !== -1 &&
        (_messageCollection.getFirstLinkId() == -1 ||
        _messageCollection.getFirstLinkId() !== firstLinkId)) {
        $scope.hasOldMessageToLoad = true;
        return true;
      } else {
        $scope.hasOldMessageToLoad = false;
        return false;
      }
    }

    /**
     * 조회할 새로운 message 가 있는지 여부를 반환한다.
     * @returns {boolean}
     */
    function hasMoreNewMessageToLoad() {
      return _messageCollection.getLastLinkId() < _messageCollection.roomData.lastLinkId;
    }

    /**
     * Chat 패널을 보인다.
     * @private
     */
    function _showContents() {
      $('#msgs-holder').addClass('opac-in-very-fast');
    }

    /**
     * Chat 패널을 감춘다.
     * @private
     */
    function _hideContents() {
      $('#msgs-holder').removeClass('opac-in-very-fast').addClass('opac-zero');
    }


    /**
     * 메시지 load 이후 scroll 값을 보정한다.
     * @private
     */
    function _adjustScroll() {
      // console.log('::updateScroll')
      if (_isFromSearch && MessageQuery.hasSearchLinkId()) {
        _findMessageDomElementById(MessageQuery.get('linkId'), true);
        MessageQuery.clearSearchLinkId();
        _isFromSearch = false;
      } else if (!$scope.isInitializeRender) {
        _scrollAfterInitialLoad();
        MessageQuery.clearSearchLinkId();
      } else if (_isLoadingNewMessages()) {
        _animateBackgroundColor($('#' + _messageCollection.getFirstLinkId()));
      } else if (_isLoadingOldMessages()) {
        _scrollAfterRenderOldMessages();
      }
      MessageQuery.reset();
    }

    /**
     * 초기 load 이후 스크롤 값을 보정한다.
     * @private
     */
    function _scrollAfterInitialLoad() {
      if (_hasLastReadMarker) {
        //fixme: unread-bookmark 가 없는 타 토픽에서 이동한 경우 시점 차이로 인해 unread-bookmark 엘리먼트를 찾을 수 없기 때문에,
        // timeout 을 설정한다.
        $timeout(function () {
          _findMessageDomElementById('unread-bookmark', true);
        });
      } else {
        _scrollToBottom();
        //fixme: help message 가 존재할 경우 이후에 랜더링이 완료되므로, $timeout 으로 한번 더 scrollToBottom 을 호출한다.
        $timeout(_scrollToBottom);
      }
    }

    /**
     * 이전 메시지를 로드한 이후 스크롤 위치를 마지막 위치로 보정한다.
     * @private
     */
    function _scrollAfterRenderOldMessages() {
      var container = document.getElementById('msgs-container');
      var scrollTop = container.scrollTop;
      if (_scrollHeightBefore) {
        container.scrollTop = scrollTop + container.scrollHeight - _scrollHeightBefore;
      }
    }

    /**
     * scrollHeight 값 으로 스크롤 한다.
     * @param {number} scrollHeight
     * @private
     */
    function _scrollTo(scrollHeight) {
      document.getElementById('msgs-container').scrollTop = scrollHeight;
    }

    /**
     * 최하단으로 스크롤 한다.
     * @private
     */
    function _scrollToBottom() {
      document.getElementById('msgs-container').scrollTop = document.getElementById('msgs-container').scrollHeight;
    }

    function _scrollToBottomWithAnimate(duration) {
      duration = duration || 500;
      var height = document.getElementById('msgs-container').scrollHeight;
      $('#msgs-container').stop().animate({scrollTop: height}, duration, 'swing', function () {
        _resetNewMsgHelpers();
      });
    }

    function _findMessageDomElementById(id, withOffset) {
      var jqTarget = $('#' + id);
      var jqContainer = $('#msgs-container');
      var targetScrollTop = jqContainer.scrollTop();

      if (_.isUndefined(jqTarget.offset())) {
        _scrollToBottom();
      } else {
        targetScrollTop += jqTarget.offset().top;
        targetScrollTop -= jqContainer.offset().top;

        if (Announcement.isOpened()) {
          targetScrollTop -= $('.center-announcement-container:first').height();
        }

        if (withOffset) {
          targetScrollTop -= jqContainer.height() / 3;
        }

        _scrollTo(targetScrollTop);
        _animateBackgroundColor(jqTarget);
      }
    }

    // TODO: NOT A GOOD NAME. WHEN FUNCTION NAME STARTS WITH 'is' EXPECT IT TO RETURN BOOLEAN VALUE.
    // Current 'isAtBottom' function is not returning boolean. PLEASE CHANGE THE NAME!!
    function clearNewMessageAlerts() {
      _clearBadgeCount($scope.currentEntity);
      _resetNewMsgHelpers();
    }

    function _animateBackgroundColor(element) {
      //console.log('::_animateBackgroundColor');
      element.addClass('message-highlight');

      $timeout(function () {
        element.addClass('message-highlight-out');
        $timeout(function () {
          element.removeClass('message-highlight');
          element.removeClass('message-highlight-out');
        }, 517)
      }, 500);
    }


    function _postMessageMarker() {
      var lastLinkId = _messageCollection.roomData.lastLinkId;
      if (memberService.getLastReadMessageMarker(_entityId) !== lastLinkId) {
        messageAPIservice.updateMessageMarker(_entityId, _entityType, lastLinkId)
          .success(function (response) {
            memberService.setLastReadMessageMarker(_getEntityId(), lastLinkId);
            _messageCollection.updateUnreadCount();
            //log('----------- successfully updated message marker for entity name ' + $scope.currentEntity.name + ' to ' + lastMessageId);
          })
          .error(function (response) {
            log('message marker not updated for ' + $scope.currentEntity.id);
          });
      } else {
        _messageCollection.updateUnreadCount();
      }
    }

    /**
     * hide sticker
     * @private
     */
    function _hideSticker() {
      jndPubSub.pub('deselectSticker:' + _stickerType);
    }

    /**
     * 네트워크 연결 되었을때 콜백
     * @private
     */
    function _onConnected() {
      _refreshView();
    }

    /**
     * view 갱신
     * @private
     */
    function _refreshView() {
      _initMarkers();
      if (MessageSendingCollection.queue.length) {
        _requestPostMessages(true);
      }
      _requestEventsHistory();
    }

    /**
     * disconnect 동안 누락된 이벤트를 조회하기 위해
     * event history API 를 호출한다.
     * @private
     */
    function _requestEventsHistory() {
      var lastTimeStamp = jndWebSocket.getLastTimestamp();
      SocketEventApi.get({
        ts: lastTimeStamp
      }).success(_onSuccessGetEventsHistory)
        .error(_onErrorGetEventHistory);
    }

    function _onErrorGetEventHistory() {
      jndPubSub.pub('centerpanelController:getEventHistoryError');
      _refreshCurrentTopic(true);
    }

    /**
     * event history 조회 성공 이벤트 핸들러
     * @param {object} response
     * @private
     */
    function _onSuccessGetEventsHistory(response) {
      var socketEvents = response.records;
      jndWebSocket.processSocketEvents(socketEvents);
    }

    /**
     * input 박스에서 메세지를 포스팅 한다.
     */
    function postMessage() {
      var jqInput = $('#message-input');
      var msg = $.trim(jqInput.val());
      var content;
      var mentions;

      // prevent duplicate request
      if (msg || _sticker) {
        if ($scope.getMentions) {
          if (content = $scope.getMentions()) {
            msg = content.msg;
            mentions = content.mentions;
          }
        }
        post(msg, _sticker, mentions);
      }
      $scope.hasMessage = false;

      jqInput.val('');
      _hideSticker();
      _setChatInputFocus();
    }

    function post(msg, sticker, mentions) {
      var hasNew = hasMoreNewMessageToLoad();
      var isRoomIdExist = true;
      MessageSendingCollection.enqueue(msg, sticker, mentions, hasNew);
      if (!hasNew) {
        _scrollToBottom();
      }

      if (_entityType === 'users') {
        isRoomIdExist = !!EntityFilterMember.getChatRoomId(_entityId);
      }
      if (!isRoomIdExist) {
        DmApi.createRoom(_entityId)
          .success(_onCreateRoomSuccess);
      } else {
        _requestPostMessages();
      }
    }

    function _onCreateRoomSuccess() {
      _getCurrentRoomMarker();
      _requestPostMessages();
    }

    /**
     * queue 에 있는 메세지들을 전부 posting 한다.
     * @private
     */
    function _requestPostMessages(isForce) {
      var queue = MessageSendingCollection.queue;
      var payload;
      var roomId = _entityId;

      if (isForce || (NetInterceptor.isConnected() && !$scope.isPosting)) {
        if (queue.length) {
          $scope.isPosting = true;
          _deferredObject.postMessage = $q.defer();
          if (EntityFilterMember.isExist(roomId)) {
            roomId = EntityFilterMember.getChatRoomId(roomId);
          }
          payload = queue.shift();

          messageAPIservice.postMessage(roomId, _getPostParam(payload), _deferredObject.postMessage)
            .success(_.bind(_onSuccessPost, this, payload))
            .error(_.bind(_onErrorPost, this, payload))
            .finally(_onFinallyPost);
        }
      }
    }

    /**
     * message 를 post 하기위한 파라미터를 반환한다.
     * @param {object} payload
     * @returns {{}}
     * @private
     */
    function _getPostParam(payload) {
      var param = {};
      param.mentions = payload.mentions;
      if (payload.content) {
        param.text = payload.content;
      }

      if (payload.sticker && payload.sticker.id && payload.sticker.groupId) {
        param.stickerId = payload.sticker.id;
        param.groupId = payload.sticker.groupId;
      }
      return param;
    }

    /**
     * message post 성공 콜백
     * @param {object} payload
     * @param {object} response
     * @private
     */
    function _onSuccessPost(payload, response) {
      var length = response.length;
      var linkId = response[length - 1].id;
      MessageSendingCollection.sent(payload, true);

      if (_messageCollection.hasLastMessage()) {
        _messageCollection.append(response, true);
      }
      memberService.setLastReadMessageMarker(_entityId, linkId);
      MessageSendingCollection.clearSentMessages();
      try {
        //analytics
        AnalyticsHelper.track(AnalyticsHelper.EVENT.MESSAGE_POST, {
          'RESPONSE_SUCCESS': true
        });
      } catch (e) {
      }
    }

    /**
     * message post 오류 콜백
     * @param {object} payload
     * @private
     */
    function _onErrorPost(payload) {
      MessageSendingCollection.sent(payload, false);
      MessageSendingCollection.clearSentMessages();
    }

    /**
     * message post finally 콜백
     * @private
     */
    function _onFinallyPost() {
      if (!_isDestroyed) {
        if (NetInterceptor.isConnected() && MessageSendingCollection.queue.length) {
          _requestPostMessages(true);
        } else {
          $scope.isPosting = false;
          _onDonePost();
        }
      }
    }

    /**
     * 전체 message post 완료 콜백
     * @private
     */
    function _onDonePost() {
      if (!_messageCollection.hasLastMessage()) {
        _refreshCurrentTopic(true);
      }
    }

    function openModal(selector) {
      // OPENING JOIN MODAL VIEW
      if (selector === 'rename') {
        // Why is center controller calling this function??
        // TODO: REFACTOR TO ENTITY HEADER CONTROLLER.
        modalHelper.openTopicRenameModal($scope);
      } else if (selector === 'invite') {
        modalHelper.openTopicInviteModal($scope);
      } else if (selector === 'inviteUserToChannel') {
        modalHelper.openTopicInviteFromDmModal($scope);
      }
    }

    function onClickUnshare(message, entity) {
      var property = {};
      var PROPERTY_CONSTANT = AnalyticsHelper.PROPERTY;
      fileAPIservice.unShareEntity(message.id, entity.id)
        .success(function () {
          //곧지워짐
          var file_meta = (message.content.type).split("/");
          var share_data = {
            "entity type": $scope.currentEntity.type,
            "category": file_meta[0],
            "extension": message.content.ext,
            "mime type": message.content.type,
            "size": message.content.size
          };
          analyticsService.mixpanelTrack("File Unshare", share_data);

          try {
            AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_UNSHARE, {
              'RESPONSE_SUCCESS': true,
              'FILE_ID': message.id,
              'TOPIC_ID': entity.id
            });
          } catch (e) {
          }

          Dialog.success({
            title: $filter('translate')('@success-file-unshare').replace('{{filename}}', message.content.title)
          });
        })
        .error(function (err) {
          try {
            AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_UNSHARE, {
              'RESPONSE_SUCCESS': false,
              'ERROR_CODE': error.code
            });
          } catch (e) {
          }

          alert(err.msg);
        });
    }

    //  right controller is listening to 'updateFileWriterId'.
    function onFileListClick(userId) {
      if ($state.current.name != 'messages.detail.files')
        $state.go('messages.detail.files');
      $scope.$emit('updateFileWriterId', userId);
    }


    function log(string) {
      if (_isLogEnabled) logger.log(string);
    }

    function setCommentFocus(file) {
      var writer;
      if ($state.params.itemId != file.id) {
        $rootScope.setFileDetailCommentFocus = true;
        writer = UserList.get(file.writerId);
        $state.go('files', {
          userName: writer.name,
          itemId: file.id
        });
      } else {
        fileAPIservice.broadcastCommentFocus();
      }
    }


    /**
     * max length 만큼 textarea 의 내용을 자른다.
     * @private
     */
    function _cutTextareaMaxLength() {
      var text = $('#message-input').val();
      if (text.length > TEXTAREA_MAX_LENGTH) {
        text = text.substring(0, TEXTAREA_MAX_LENGTH);
        $('#message-input').val(text);
      }
    }

    /**
     * share 버튼을 click 했을 때 이벤트 핸들러
     * @param {object} file
     */
    function onShareClick(file) {
      modalHelper.openFileShareModal($scope, file);
    }

    /**
     * 채팅 화면이 active 상태인지 여부를 반환한다.
     * @returns {boolean}
     * @private
     */
    function _isChatPanelActive() {
      return !centerService.isBrowserHidden() && !JndConnect.isOpen() && ActiveNotifier.getStatus();
    }

    /**
     * input 에 focus 한다.
     * @private
     */
    function _setChatInputFocus() {
      $('#message-input').focus();
    }

    /**
     * If badge count was incremented while un-focused state,
     * still keep track of badge counts and display on left side.
     *
     * However, when user comes back to JANDI, clear badge count of currently looking entity.
     *
     * @param entity
     * @private
     */
    function _clearBadgeCount(entity) {
      if (entity) {
        entityAPIservice.updateBadgeValue(entity, '');
        _postMessageMarker();
      }
    }


    /********************************************

     EMPTY MESSAGE.

     ********************************************/


    function _checkEntityMessageStatus() {
      $scope.hasNoMessage = _hasNoMessage();

      // Current topic has messages going on. NO NEED TO DISPLAY ANY TYPE OF HELP MESSAGES.
      // FIXME: this is not how we return. - jihoon
      if (!$scope.hasNoMessage) {
        return;
      }

      // current topic is 1:1 dm and disactivated member.
      // FIXME: this is not how we return. - jihoon
      if (centerService.isChat() && !memberService.isActiveMember(currentSessionHelper.getCurrentEntity())) {
        return;
      }


      var emptyMessageStateHelper = 'NO_CONVERSATION_IN_TOPIC';

      // I am only member in current topic.
      if (_isSoloTeam()) {
        emptyMessageStateHelper = 'NO_MEMBER_IN_TEAM';
      } else if (_isFullRoom()) {
        if (!_isDefaultTopic()) {
          emptyMessageStateHelper = 'EVERYONE_IN_THE_BUILDING';
        }
      } else if (_amIAlone()) {
        emptyMessageStateHelper = 'NO_MEMBER_IN_TOPIC';
      }

      //log(emptyMessageStateHelper)
      $scope.emptyMessageStateHelper = emptyMessageStateHelper;
      $rootScope.$broadcast('onEntityMessageStatusChanged', emptyMessageStateHelper);
    }

    function _amIAlone() {
      var userCount = RoomTopicList.getUserLength(currentSessionHelper.getCurrentEntity().id);

      //console.log()
      //console.log('this is _alIAlone ', memberCount, ' returning ', memberCount == 1)

      return userCount == 1;
    }

    function _hasNoMessage() {
      var messageLength = _messageCollection.list.length;

      //log(messageLength, systemMessageCount, !_hasMoreOldMessageToLoad())

      // For entity whose type is 'users' (1:1 direct message), there is no default message.
      // While there is a default message for private/public topic.  default for public/private topic is a system event.
      var numberOfDefaultMessage = _entityType === 'users' ? 0 : 1;

      var systemMessageCount = 0;
      _messageCollection.forEach(function (msg) {
        if (msg.message.contentType !== 'systemEvent') {
          return false;
        } else {
          systemMessageCount++;
        }
      });
      if (!_hasMoreOldMessageToLoad() && (messageLength == systemMessageCount || messageLength <= numberOfDefaultMessage)) return true;

      return false;
    }

    /**
     * 나 혼자만의 팀인지 아닌지 확인한다.
     * @returns {boolean}
     * @private
     */
    function _isSoloTeam() {
      return currentSessionHelper.getCurrentTeamUserCount() == 1;
    }

    function _isFullRoom() {
      var currentEntityUserCount = RoomTopicList.getUserLength(currentSessionHelper.getCurrentEntity().id);
      var totalTeamUserCount = currentSessionHelper.getCurrentTeamUserCount();

      return currentEntityUserCount == totalTeamUserCount;
    }

    function _isDefaultTopic() {
      return currentSessionHelper.isDefaultTopic(currentSessionHelper.getCurrentEntity());
    }

    /********************************************

     NEW MESSAGE ALERT.

     ********************************************/

    function onScrollToBottomIconClicked() {
      // Remove icon first.
      _resetHasScrollToBottom();

      _newMsgHelper();
    }

    /**
     * Reset both new message alert & scroll to bottom icon.
     * @private
     */
    function _resetNewMsgHelpers() {
      _resetNewMsgAlert();
      _resetHasScrollToBottom();
    }

    function _resetNewMsgAlert() {
      _hideNewMessageAlertBanner();
    }

    function _resetHasScrollToBottom() {
      $timeout(function () {
        $scope.hasScrollToBottom = false;
      });
    }


    function onHasNewMessageAlertClicked() {
      _clearBadgeCount($scope.currentEntity);
      _newMsgHelper();
      _resetNewMsgHelpers();
    }

    /**
     * Decide what to do with current scroll.
     *
     * If most recent message has been already loaded, then just scroll to very bottom with animation.
     * Or just jump to most recent message by refresh current topic.
     * @private
     */
    function _newMsgHelper() {
      if (hasMoreNewMessageToLoad()) {
        // Has more messages to load
        _refreshCurrentTopic();
      } else {
        // Already have latest message of current entity, just scroll down to it.
        _scrollToBottomWithAnimate();
      }
    }

    function onHasNewMessageAlertCloseClicked() {
      _resetNewMsgAlert();
    }


    /**
     * Handle a case when I receive a message while
     *   1.  I'm looking at somewhere else(probably older messages through search)
     *       without having most recent message.
     *   2.  I'm looking at somewhere else with latest message with me.
     *
     *   이 엔티티의 마지막 메세지가 없는 상태에서 새로운 메세지가 들어왔을 때.
     *   이 엔티티의 마지막 메세지가 있는 상태에서 새로운 메세지가 들어왔을 때.
     *   둘 다.
     *
     *  @private
     */
    function _gotNewMessage() {
      log('_gotNewMessage');
      _showNewMessageAlertBanner();

      /*
       users 의 경우 chats.controller.js 의 _generateMessageList 에서
       badge count 를 업데이트 해주기 때문에 user 가 아닐 경우만 badge count increase 함함
       */

      if (currentSessionHelper.getCurrentEntityType() !== 'users') {
        entityAPIservice.updateBadgeValue($scope.currentEntity, -1);
      }
    }


    function _getEntityId() {
      return centerService.getEntityId();
    }


    /**
     * Decide to whether display badge or not.
     *
     * Display badge and new message alert bar only when
     *  1. message is not written by me AND
     *  2. scroll is not currently at the bottom AND
     *  3. window doesn't have focus state.
     *
     * @param msg
     * @private
     */
    function _onNewMessageArrived(angularEvent, msg) {
      console.log('###_onNewMessageArrived', msg);
      MessageSendingCollection.clearSentMessages();
      if (centerService.isMessageFromMe(msg)) {
        if (!_messageCollection.hasLastMessage()) {
          _refreshCurrentTopic(true);
        } else {
          _scrollToBottom();
          _postMessageMarker();
        }
      }

      if (_isChatPanelActive() && centerService.hasBottomReached()) {
        _scrollToBottom();
      } else if (!centerService.isMessageFromMe(msg) && _hasScroll()) {
        _gotNewMessage();
      } else {
        // entityAPIservice.updateBadgeValue($scope.currentEntity, -1);
      }
      _messageCollection.updateUnreadCount();
      $timeout(_checkEntityMessageStatus, 100);
    }

    /**
     * on new system message arrived
     * @private
     */
    function _onNewSystemMessageArrived() {
      if (centerService.hasBottomReached()) {
        _scrollToBottomWithAnimate();
      }
      _messageCollection.updateUnreadCount();
      $timeout(_checkEntityMessageStatus, 100);
    }

    /**
     * scroll to bottom
     * @param {object} $event
     * @param {number} [duration] - scroll bottom 까지 지연시간(ms)
     * @private
     */
    function _centerScrollToBottom($event, duration) {
      if (_.isNumber(duration)) {
        _scrollToBottomWithAnimate(duration);
      } else {
        _scrollToBottom(true);
      }
    }

    /**
     * right panel toggle event handler
     * @param {object} $event
     * @param {boolean} isOpen
     * @private
     */
    function _onBeforeRightPanelOpen($event, isOpen) {
      if (isOpen && $scope.isInitializeRender && _isBottomReached()) {
        _wasBottomReached = true;
      }
    }

    /**
     *
     * @private
     */
    function _onAfterRightPanelOpen() {
      if (_wasBottomReached) {
        _scrollToBottom();
      }
    }

    function _resetUnreadCounters() {
      _hasRetryGetRoomInfo = false;
      markerService.init();
    }

    /**
     * Iterate through markers list from server and put marker.
     *
     * @param markers
     * @private
     */
    function _initMarkers(markers) {
      //console.log('start initializing markers', markers);
      markerService.init();
      markerService.resetMarkerOffset();
      _.forEach(markers, function (marker) {
        markerService.putNewMarker(marker.memberId, marker.lastLinkId, _messageCollection.getLastLinkId());
      });

      _messageCollection.updateUnreadCount();
    }

    /**
     * Get room info.
     * If failed to get room info due to undefined 'currentRoomId', try once again. *only again
     *
     * + The same as Update unread count
     * @private
     */
    function _getCurrentRoomMarker() {
      var currentRoomId = _getEntityId();
      if (currentRoomId) {
        _deferredObject.getRoomInformation = $q.defer();
        messageAPIservice.getRoomInformation(currentRoomId, _deferredObject.getRoomInformation)
          .success(function (response) {
            _initMarkers(response.markers);
            _hasRetryGetRoomInfo = false;
            _hasRoomMarkerInfo = true;
            //console.log('success')
          })
          .error(function (err) {
            if (!_hasRetryGetRoomInfo && publicService.isNullOrUndefined(currentRoomId)) {
              //console.log('me')
              _getCurrentRoomMarker();
              _hasRetryGetRoomInfo = true;
            }
          });
      }
    }

    /**
     * chat 스크롤이 최 하단에 닿아있는지 여부를 반환한다.
     * @returns {boolean} 최 하단에 닿아있는지 여부
     * @private
     */
    function _isBottomReached() {
      return $('#msgs-container')[0].scrollTop + $('#msgs-container').height() >= $('#msgs-holder').outerHeight();
    }

    /**
     * 랜더링 repeat 가 끝났을 때 호출되는 함수
     */
    function onRepeatDone() {
      _adjustScroll();
      _checkEntityMessageStatus();
      if (_messageCollection.status.isInitialized) {
        publicService.hideDummyLayout();
        if (!$scope.isInitializeRender) {
          _onInitialRenderDone();
          $scope.isInitializeRender = true;
        }
      }
      if (!_hasRoomMarkerInfo) {
        _getCurrentRoomMarker();
      }
      _showContents();
    }

    /**
     * room 의 초기 랜더링 완료 이후 수행할 함수
     * @private
     */
    function _onInitialRenderDone() {
      _loadTextBuffer();
    }

    /**
     * sending 메세지의 repeatDone 이벤트 핸들러
     */
    function onSendingRepeatDone() {
      _scrollToBottom();
    }

    /**
     * Someone left current topic -> update markers
     * @param event
     * @param param
     * @private
     */
    function _onCenterOnTopicLeave(event, param) {
      // Someone left current topic -> update markers
      markerService.removeMarker(param.writer);
    }

    /**
     * Callback function for marker updated socket event.
     * @param event
     * @param param
     * @private
     */
    function _onCenterMarkerUpdated(event, param) {
      log('centerOnMarkerUpdated');
      _messageCollection.updateUnreadCount();
    }

    /**
     * sticker change 시 이벤트 핸들러
     * @param {object} event
     * @param {object} item 스티커
     * @private
     */
    function _onChangeSticker(event, item) {
      _sticker = item;
      $scope.hasMessage = !!_sticker;
      setTimeout(_setChatInputFocus);
    }

    /**
     * elastic resize 시 이벤트 핸들러
     *
     * when textarea gets resized, msd-elastic -> adjust function emits 'elastic:resize'.
     * listening to 'elastic:resize' and move msg-holder to right position.
     * @private
     */
    function _onElasticResize() {
      var jqCenterChatInput = $('.center-chat-input-container');
      var jqMessages = $('#msgs-container');
      var isBottomReached;

      // center controller의 content load가 완료 된 상태이고 chat 스크롤이 최 하단에 닿아있을때 scroll도 같이 수정
      if ($scope.isInitializeRender && _isBottomReached()) {
        isBottomReached = true;
      }

      jqMessages.css('bottom', jqCenterChatInput.height());
      if (isBottomReached) {
        setTimeout(_scrollToBottom, 100);
      }
    }

    /**
     * 입력된 text가 preview(social snippets)를 제공하는 경우 center controller에서의 handling
     *
     * 'attachMessagePreview' event에서 content가 attach되는 message의 식별자를 전달 받아
     * 해당 식별자로 특정 message를 다시 조회 하여 생성된 content data로 view를 생성하여 text element 자식 element로 append 함
     * @param event
     * @param data
     * @private
     */
    function _onAttachMessagePreview(event, data) {
      var messageId;
      var linkPreview;
      var timeoutCaller;
      _deferredObject.getMessage = $q.defer();
      messageAPIservice
        .getMessage(memberService.getTeamId(), data.message.id, {}, _deferredObject.getMessage)
        .success(function (response) {
          messageId = response.id;
          linkPreview = response.linkPreview;

          if (linkPreview.imageUrl) {
            // thumbnail을 기다린다는 flag를 설정한다.
            linkPreview.extThumbnail = {
              isWaiting: true
            };

            timeoutCaller = setTimeout(function () {
              // 4초 후에도 thumbnail이 생성이 안되었을 경우, loading wheel을 제거한다.
              _updateMessageLinkPreviewStatus(messageId);
            }, 4000);

            RendererUtil.addToThumbnailTracker(messageId, timeoutCaller);
          }

          _updateMessageLinkPreview(messageId, linkPreview);
        })
        .error(function (error) {
          console.log('link preview error', error);
        });
    }

    /**
     * link preview에서 보여줄 이미지의 thumbnail이 완성되었을 경우 호출된다.
     * @param {angularEvent} event
     * @param {object} socketEvent - 'link_preview_image' socket event로 넘어온 parameter
     * @private
     */
    function _onLinkPreviewThumbnailCreated(event, socketEvent) {
      var data = socketEvent.data;

      // 이 시점은 thumbnail이 success든 fail이든 우선은 thumbnail 작업은 완료되었다!의 단계이므로 우선 false로 바꾼다.
      data.linkPreview.extThumbnail = {
        isWaiting: false
      };

      RendererUtil.cancelThumbnailTracker(data.messageId);
      _updateMessageLinkPreview(data.messageId, data.linkPreview);
    }


    /**
     * messageId에 해당하는 msg를 찾아서 linkPreview를 새로 업데이트한다.
     * @param {number} messageId - id of message
     * @param {object} linkPreview - linkPreview object to update
     * @private
     */
    function _updateMessageLinkPreview(messageId, linkPreview) {
      var message = _messageCollection.getByMessageId(messageId, true);

      if (message) {
        // thumbnail이 생성됐는지 안됐는지 확인해서 값을 설정한다.
        linkPreview.extThumbnail.hasSuccess = RendererUtil.hasThumbnailCreated(linkPreview);

        message.message.linkPreview = linkPreview;

        if (centerService.isMessageFromMe(message) && _isBottomReached()) {
          _scrollToBottom();
        }
      }

      jndPubSub.pub('toggleLinkPreview', messageId);
    }

    /**
     * messageId에 해당하는 message의 link preview를 찾은 후 extThumnbail.isWaiting의 값을 false로 바꾼다.
     * @param {number} messageId - message id
     * @private
     */
    function _updateMessageLinkPreviewStatus(messageId) {
      var message = _messageCollection.getByMessageId(messageId, true);

      if (message) {
        message.message.linkPreview.extThumbnail.isWaiting = false;
        jndPubSub.pub('toggleLinkPreview', messageId);
      }

      // timeout still needs to be deleted.
      RendererUtil.cancelThumbnailTracker(messageId);
    }

    /**
     * 마지막으로 읽은 마커와 같은지 안 같은지 확인 후 unread bookmark를 보여줘야할지와 함께 연산해서 결과값을 리턴한다.
     * @param {number} linkId - 체크하고싶은 link id
     * @returns {boolean}
     */
    function isLastReadMarker(linkId) {
      linkId = parseInt(linkId, 10);
      var hasLastReadMarker = (linkId === _lastReadMessageMarker && shouldDisplayUnreadMarker(linkId));
      _hasLastReadMarker = _hasLastReadMarker || hasLastReadMarker;
      return hasLastReadMarker;
    }

    /**
     * unread bookmark를 보여줘야할지 말지 결정한다.
     * 1. 현재의 link아이디가 리스트가 가지고 있는 마지막 아이디어야 한다.
     * 2. _shouldDisplayBookmarkFlage 가 true 로 올러와야한다.
     * @param {number} linkId - link id to check
     * @returns {boolean}
     */
    function shouldDisplayUnreadMarker(linkId) {
      return linkId !== _messageCollection.getLastLinkId();
    }

    /**
     * 채팅 입력창 바로 위에 검은색 배너를 노출시킨다.
     * @private
     */
    function _showNewMessageAlertBanner() {
      $('#has-new-msg-banner').addClass('show');
    }

    /**
     * 채팅 입력창 바로 위에 검은색 배너를 숨킨다.
     * @private
     */
    function _hideNewMessageAlertBanner() {
      $('#has-new-msg-banner').removeClass('show');
    }

    /**
     * topic deleted event handler
     * @param event
     * @param data
     * @private
     */
    function _onTopicDeleted(event, data) {
      if (data && data.room) {
        TextBuffer.remove(data.room.id);
      }
    }

    /**
     * text-buffer 에 현재 input 정보를 저장한다.
     * @private
     */
    function _saveTextBuffer() {
      TextBuffer.set(_entityId, $('#message-input').val());
    }

    /**
     * text-buffer 에 저장된 값을 현재 input 에 반영한다.
     * @private
     */
    function _loadTextBuffer() {
      $('#message-input').val(TextBuffer.get(_entityId)).trigger('change').focus();
    }

    /**
     * message input change event handler
     * @param {object} event
     */
    function onMessageInputChange(event) {
      var message;
      var value = event.target.value;
      if (event.type === 'keyup' && jndKeyCode.match('ESC', event.keyCode)) {
        _hideSticker();
      } else if (_.isString(value)) {
        message = _.trim(value).length;
        $scope.hasMessage = message > 0 || !!_sticker;
        $scope.showMarkdownGuide = message > 1;
        TextBuffer.set(_entityId, value);
      }
    }
  }
})();
