'use strict';

var app = angular.module('jandiApp');

app.controller('leftPanelController', function(
  $scope, $state, $timeout, $q, leftpanelAPIservice, entityAPIservice, accountService,
  publicService, memberService, storageAPIservice, analyticsService, currentSessionHelper, jndWebSocket, jndPubSub,
  modalHelper, UnreadBadge, AnalyticsHelper, HybridAppHelper, NotificationManager, TopicFolderModel, TopicUpdateLock,
  JndUtil, EntityFilterMember, EntityHandler, Auth, initialPromise, JndPanelSizeStorage) {

  var _that = this;
  var _getLeftListDeferredObject;

  //unread 갱신시 $timeout 에 사용될 타이머
  var _unreadTimer;
  var _isBadgeMoveLocked = false;
  var _entityEnterTimer;
  var _hasToUpdate = false;
  // center chat timer
  var _timerUpdateCenterChat;

  $scope.entityId = $state.params.entityId;

  /**
   * 초기 Loading 시 보여줄 문자열 리스트
   * @type {string[]}
   */
  $scope.initialLoadingTexts = [
    'Loading',
    'Loading.',
    'Loading..',
    'Loading...'
  ];

  //unread 위치에 대한 정보
  $scope.unread = {
    above: [],
    below: []
  };

  // left panel 에 토픽 리스트가 접혀있는 상태인지 아닌지 확인하는 부분.
  $scope.leftListCollapseStatus = {
    isTopicsCollapsed: storageAPIservice.isLeftTopicCollapsed() || false
  };

  $scope.goUnreadBelow = goUnreadBelow;
  $scope.goUnreadAbove = goUnreadAbove;
  $scope.enterEntity = enterEntity;
  $scope.openModal = openModal;
  $scope.onMemberClick = onMemberClick;
  $scope.onPanelSizeChanged = onPanelSizeChanged;
  
  _init();
  
  /**
   * 초기화 메서드
   * @private
   */
  function _init() {
    var responseLeftSideMenu = initialPromise[0].data;

    $scope.leftPanelWidth = JndPanelSizeStorage.getLeftPanelWidth();

    if (initialPromise[0].data) {
      publicService.showDummyLayout();
      publicService.hideInitialLoading();

      _attachScopeEvents();
      _attachDomEvents();
      _initLeftSideMenuData(responseLeftSideMenu);
    } else {
      Auth.requestAccessTokenWithRefreshToken();
    }
  }

  /**
   * leftSideMenu 데이터 초기화 메서드
   * @param {object} response
   * @private
   */
  function _initLeftSideMenuData(response) {
    _onSuccessGetLeftSideMenu(false, response);
    if (!$state.params.entityId) {
      _goToDefaultTopic();
    }
  }

  /**
   * scope event 를 바인딩 한다
   * @private
   */
  function _attachScopeEvents() {
    $scope.$on('updateBadgePosition', updateUnreadPosition);
    $scope.$on('$stateChangeSuccess', _onStateChangeSuccess);
    $scope.$on('$destroy', _onDestroy);
    $scope.$on('toDefaultTopic', _goToDefaultTopic);
    $scope.$on('TopicUpdateLock:change', _onTopicUpdateLockChange);
    $scope.$on('updateLeftBadgeCount', _onUpdateLeftBadgeCount);
    $scope.$on('updateLeftPanelCaller', _requestLeftSideMenu);
    $scope.$on('connected', _onConnected);
    $scope.$on('NetInterceptor:onGatewayTimeoutError', _requestLeftSideMenu);
    $scope.$on('Auth:refreshTokenSuccess', _requestLeftSideMenu);
    $scope.$on('onMemberClick', function(event, user) {
      $scope.onMemberClick(user);
    });
    $scope.$watch('leftListCollapseStatus.isTopicsCollapsed', _onCollapseStatusChanged);
  }

  /**
   * scope 소멸자
   * @private
   */
  function _onDestroy() {
    $timeout.cancel(_unreadTimer);
    _detachDomEvents();
  }

  /**
   * 이벤트 핸들러를 attach 한다.
   * @private
   */
  function _attachDomEvents() {
    $(window).on('resize', updateUnreadPosition);
    $('#lpanel-list-container').on('scroll', updateUnreadPosition);
  }

  /**
   * 이벤트 핸들러 detach 한다.
   * @private
   */
  function _detachDomEvents() {
    $(window).off('resize', updateUnreadPosition);
    $('#lpanel-list-container').off('scroll', updateUnreadPosition);
  }

  /**
   * collapse status 변경시 update badge posision 이벤트 트리거한다.
   * @private
   */
  function _onCollapseStatusChanged() {
    storageAPIservice.setLeftTopicCollapsed($scope.leftListCollapseStatus.isTopicsCollapsed);
    jndPubSub.updateBadgePosition();
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
    $scope.entityId = toParams.entityId;
    TopicFolderModel.setCurrentEntity($scope.entityId);
  }

  /**
   * 네트워크 활성 이벤트 핸들러
   * @private
   */
  function _onConnected() {
    _requestLeftSideMenu();
  }

  /**
   * leftSideMenu API 를 call 한다.
   * @param {boolean} [isOnlyForAlarmCount=false] - alarm count 정보만 업데이트 할 지 여부를 설정한다.
   * @private
   */
  function _requestLeftSideMenu(isOnlyForAlarmCount) {
    isOnlyForAlarmCount = _.isBoolean(isOnlyForAlarmCount) ? isOnlyForAlarmCount : false;

    if (!TopicUpdateLock.isLocked()) {
      _hasToUpdate = false;
      if (!_.isUndefined(_getLeftListDeferredObject)) {
        _getLeftListDeferredObject.resolve();
      }
      _getLeftListDeferredObject = $q.defer();

      if (isOnlyForAlarmCount) {
        leftpanelAPIservice.getLists(_getLeftListDeferredObject)
          .success(_.bind(_onSuccessGetLeftSideMenu, null, isOnlyForAlarmCount));
      } else {
        TopicFolderModel.load('requestLeftSideMenu').then(function() {
          leftpanelAPIservice.getLists(_getLeftListDeferredObject)
            .success(_.bind(_onSuccessGetLeftSideMenu, null, isOnlyForAlarmCount));
        });
      }
    } else {
      _hasToUpdate = true;
    }
  }

  /**
   * leftSideMenu 정보 조회 성공 콜백
   * @param {boolean} [isOnlyForAlarmCount=false] - alarm count 정보만 업데이트 할 지 여부를 설정한다.
   * @param {object} response
   * @private
   */
  function _onSuccessGetLeftSideMenu(isOnlyForAlarmCount, response) {
    if (isOnlyForAlarmCount) {
      _parseAlarmInfoCount(response.alarmInfoCount, response.alarmInfos);
    } else {
      _parseLeftSideMenuData(response);
      jndWebSocket.checkSocketConnection();
      // 전체 entity 갱신시 chat list를 갱신하므로 반드시 수정되어야 함
      _updateCenterChat();
    }
  }

  /**
   * leftSideMenu 데이터를 파싱한다.
   * @param {object} response
   * @private
   */
  function _parseLeftSideMenuData(response) {
    var entityId = $state.params.entityId;
    var entityType = $state.params.entityType || 'total';
    EntityHandler.parseLeftSideMenuData(response);
    _parseAlarmInfoCount(response.alarmInfoCount, response.alarmInfos);
    entityAPIservice.setCurrentEntityWithId(entityId);
    TopicFolderModel.update();
  }

  /**
   * left panel topic 의 뱃지 카운트를 업데이트 한다.
   * Update badge count.
   * @param {number} alarmInfoCnt
   * @param {array} alarms
   */
  function _parseAlarmInfoCount(alarmInfoCnt, alarms) {
    _.each(alarms, function (alarm) {
      var entity;
      var entityId = alarm.entityId;

      // TODO: 서버님께서 alarmCount가 0인 entity에 대해서 data를 생성해서 주시는 이유가 궁금합니다.
      if (alarm.alarmCount != 0 && (entity = EntityHandler.get(entityId))) {
        entityAPIservice.updateBadgeValue(entity, alarm.alarmCount);
      }
      memberService.setLastReadMessageMarker(entityId, alarm.lastLinkId);
    });
  }

  /**
   * left badge count 를 업데이트 한다.
   */
  function _onUpdateLeftBadgeCount() {
    _requestLeftSideMenu(true);
  }

  /**
   * topic update lock 변경시 이벤트 핸들러
   * @param {object} angularEvent
   * @param {boolean} isLock
   * @private
   */
  function _onTopicUpdateLockChange(angularEvent, isLock) {
    if (!isLock && _hasToUpdate) {
      _requestLeftSideMenu();
    }
  }

  /**
   * member 를 click 했을 때
   * @param {number|object} member
   */
  function onMemberClick(member) {
    if (angular.isNumber(member)) {
      member = EntityFilterMember.get(member);
    } else {
      member = EntityFilterMember.get(member.id);
    }

    if (memberService.isUser(member.id)) {
      modalHelper.openUserProfileModal($scope, member);
    } else if (memberService.isJandiBot(member.id)) {
      modalHelper.openBotProfileModal($scope, member);
    }
  }

  /**
   * 토픽 방에 입장한다.
   * @param {object} entity
   */
  function enterEntity(entity) {
    JndUtil.safeApply($scope, function() {
      NotificationManager.set(entity, 0);
      HybridAppHelper.onAlarmCntChanged(entity.id, 0);
      entity.alarmCnt = '';
      $scope.entityId = entity.id;
      jndPubSub.pub('onBeforeEntityChange', entity);
    });
    $timeout.cancel(_entityEnterTimer);
    _entityEnterTimer = $timeout(_.bind(_doEnter, _that, entity), 10);
  }

  /**
   * 토픽 방 입장을 수행한다.
   * @param {object} entity
   * @private
   */
  function _doEnter(entity) {
    var entityType = entity.type;
    var entityId = entity.id;
    var currentEntity = currentSessionHelper.getCurrentEntity();

    if (currentEntity.id === entityId) {
      jndPubSub.pub('refreshCurrentTopic');
    } else {
      if (memberService.isBot(entityId)) {
        entityType = 'users';
      }

      $state.go('archives', {entityType: entityType, entityId: entityId});
    }
  }

  /**
   * upcate center chat
   * @private
   */
  function _updateCenterChat() {
    $timeout.cancel(_timerUpdateCenterChat);
    _timerUpdateCenterChat = $timeout(function() {
      jndPubSub.pub('updateChatList');
    }, 50);
  }

  /**
   * 기본 topic 으로 이동한다.
   * @private
   */
  function _goToDefaultTopic() {
    $state.go('archives', {entityType:'channels',  entityId: currentSessionHelper.getDefaultTopicId() });
  }

  /**
   * modal 을 open 한다.
   * @param {string} selector
   * @param {object} options
   */
  function openModal(selector, options) {
    if (selector == 'join') {
      modalHelper.openTopicJoinModal($scope);
    } else if (selector == 'channel') {
      modalHelper.openTopicCreateModal($scope);
    } else if (selector == 'topic') {
      modalHelper.openTopicCreateModal($scope);
    }
  }

  /**
   * 아래쪽 unread 로 scroll 이동
   * @param {Event} clickEvent
   */
  function goUnreadBelow(clickEvent) {
    if (!_isBadgeMoveLocked) {
      var jqTarget = $(clickEvent.target).closest('.lpanel-list-help-unread ');
      var jqContainer = $('#lpanel-list-container');
      var scrollTop = jqContainer[0].scrollTop;
      var offsetTop = jqContainer.offset().top;
      var currentBottom = scrollTop + offsetTop + jqContainer.height();
      var top = _getPosUnreadBelow();
      // 한번에 마지막 뱃지로 내려가도록 정책 변경
      //var isLast = $scope.unread.below.length === 1;
      var isLast = true;

      // 아래 여백
      var space = 9;

      var targetScrollTop = scrollTop + (top - currentBottom);

      if (isLast) {
        targetScrollTop += space;
        $scope.unread.below = [];
      } else {
        targetScrollTop += (jqTarget.outerHeight() + space);
      }
      _isBadgeMoveLocked = true;
      jqContainer.animate({
        scrollTop: targetScrollTop
      }, {
        done: function () {
          _isBadgeMoveLocked = false;
        }
      });
    }
  }

  /**
   * 위쪽 unread 로 scroll 이동
   * @param {Event} clickEvent
   */
  function goUnreadAbove(clickEvent) {
    if (!_isBadgeMoveLocked) {
      var jqTarget = $(clickEvent.target);
      var jqContainer = $('#lpanel-list-container');
      var scrollTop = jqContainer[0].scrollTop;
      var offsetTop = jqContainer.offset().top;
      var currentTop = scrollTop + offsetTop;
      var top = _getPosUnreadAbove();
      //위 여백
      var space = 7;
      var targetScrollTop = scrollTop - (currentTop - top);

      if ($scope.unread.above.length > 1) {
        targetScrollTop -= jqTarget.outerHeight() + space;
      }

      _isBadgeMoveLocked = true;
      jqContainer.animate({
        scrollTop: targetScrollTop
      }, {
        done: function () {
          _isBadgeMoveLocked = false;
        }
      });
    }
  }

  /**
   * 위쪽 unread badge top 위치 반환
   * @returns {number}
   * @private
   */
  function _getPosUnreadAbove() {
    var above = $scope.unread.above;

    if (above.length) {
      return above[above.length - 1];
    } else {
      return 0;
    }
  }

  /**
   * 아래쪽 unread badge bottom 위치 반환
   * @returns {number}
   * @private
   */
  function _getPosUnreadBelow() {
    var below = $scope.unread.below;
    return below[below.length - 1] || 0;
  }



  /**
   * unread position 을 업데이트한다.
   * 중복 호출에 대한 성능 향상을 위해 timeout 을 사용한다.
   */
  function updateUnreadPosition() {
    $timeout.cancel(_unreadTimer);
    _unreadTimer = $timeout(function() {
      _updateUnreadPosition();

      // 현재 team badge 갱신시 hybrid app badge도 갱신함
      HybridAppHelper.updateBadge();
    }, 100);
  }

  /**
   * unread position 을 업데이트한다.
   * @private
   */
  function _updateUnreadPosition() {
    var jqContainer = $('#lpanel-list-container');
    var scrollTop = jqContainer[0].scrollTop;
    var offsetTop = jqContainer.offset().top;
    var height = jqContainer.height();

    var top = scrollTop + offsetTop;
    var bottom = top + height;
    $scope.unread = UnreadBadge.getUnreadPos(top, bottom);
  }

  /**
   * panel size changed event handler
   * @param {object} $panels
   * @param {object} $panelSize
   */
  function onPanelSizeChanged($panels, $panelSize) {
    JndPanelSizeStorage.setLeftPanelWidth($panelSize);
  }
});
