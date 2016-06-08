/**
 * @fileoverview announcement를 관리하는 controller
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('AnnouncementCtrl', AnnouncementCtrl);

  /* @ngInject */
  function AnnouncementCtrl($scope, Announcement, AnnouncementData, memberService, $stateParams,
                            config, jndPubSub, $filter, Dialog) {

    var _topicId = parseInt($stateParams.entityId, 10);

    var myId = memberService.getMemberId();

    var _announcement;

    var ANNOUNCEMENT_CREATED = config.socketEvent.announcement.created;
    var ANNOUNCEMENT_DELETED = config.socketEvent.announcement.deleted;
    var ANNOUNCEMENT_STATUS_UPDATED = config.socketEvent.announcement.status_updated;

    var hasOwnEventHandler = false;

    $scope.hasAnnouncement = false;
    $scope.displayStatus = {
      hide: false,
      minimized: false
    };


    $scope.onAnnouncementArrowClicked = onAnnouncementArrowClicked;
    $scope.onHidedAnnouncementClicked = onHidedAnnouncementClicked;

    $scope.onAnnouncementBodyClicked = onAnnouncementBodyClicked;

    $scope.onAnnouncementWriterClicked = onAnnouncementWriterClicked;
    $scope.onAnnouncementCreatorClicked = onAnnouncementCreatorClicked;

    $scope.isAnnouncementHided = isAnnouncementHided;
    $scope.isAnnouncmentMinimized = isAnnouncementMinimized;

    $scope.deleteAnnouncement = deleteAnnouncement;
    $scope.hideAnnouncement = hideAnnouncement;

    $scope.toggleAnnouncementStatus = toggleAnnouncementStatus;


    _init();

    /**
     * 초기화 함수.
     * @private
     */
    function _init() {
      _attachListeners();
      _attachWindowEvent();
      _getAnnouncement();
      memberService.isAnnouncementOpen(_topicId);
    }

    /**
     * event listener들을 설정한다.
     * @private
     */
    function _attachListeners() {
      $scope.$on('$destroy', _onScopeDestroy);

      $scope.$on(config.socketEvent.announcement.created, _onAnnouncementSocketEvent);
      $scope.$on(config.socketEvent.announcement.deleted, _onAnnouncementSocketEvent);
      $scope.$on(config.socketEvent.announcement.status_updated, _onAnnouncementSocketEvent);

      $scope.$on('createAnnouncement', _createAnnouncement);

      $scope.$on('minimizeAnnouncement', minimizeAnnouncement);

      $scope.$on('jndWebSocketMember:memberUpdated', _updateMemberProfile);
      $scope.$on('$stateChangeSuccess', _onStateChangeSuccess);
      $scope.$watch('displayStatus.hide', function(isHided) {
        Announcement.setIsOpened(!isHided);
      });
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
      var topicId = +toParams.entityId;
      if (_topicId !== topicId) {
        _topicId = topicId;
        hasOwnEventHandler = false;
        $scope.hasAnnouncement = false;
        _.extend($scope.displayStatus, {
          hide: false,
          minimized: false
        });
        _getAnnouncement();
        memberService.isAnnouncementOpen(_topicId);
      }
    }
    /**
     * 현재 토픽의 announcement 를 불러온다.
     * @private
     */
    function _getAnnouncement() {
      AnnouncementData.getAnnouncement(_topicId)
        .success(_onGetAnnouncementSuccess)
        .error(_onGetAnnouncementError);

    }

    /**
     * announcement 를 가져오기에 성공했을 때!
     * @param {object} announcement - server 로 부터 온 response
     * @private
     */
    function _onGetAnnouncementSuccess(announcement) {
      if (!_.isEmpty(announcement)) {
        _announcement = announcement;
        $scope.announcementCreator = _getActionOwner(announcement, announcement.creatorId, 'createdAt');
        $scope.announcementWriter = _getActionOwner(announcement, announcement.writerId, 'writtenAt');

        $scope.announcementBody = Announcement.getFilteredContentBody(announcement.content);

        _getAnnouncementStatus();
        _showAnnouncement();
      }
    }

    function _getAnnouncementStatus() {
      var isAnnouncementOpened = memberService.isAnnouncementOpen(_topicId);

      if (isAnnouncementOpened === false) {
        hideAnnouncement();
      } else {
        memberService.updateAnnouncementStatus(_topicId, true);
        minimizeAnnouncement();
      }
    }
    /**
     * announcement 를 가져오는데 실패했을 때
     * @param {object} error - server 로 부터 온 error object
     * @private
     */
    function _onGetAnnouncementError(error) {
    }

    /**
     * text controller 가 어나운스먼트 만들어주세요! 라고 이벤트를 날리면 호출된다.
     * @param {object} event - event(angular $broadcast) object
     * @param {object} param - event 에 해당하는 파라미터들.
     * @private
     */
    function _createAnnouncement(event, param) {
      var entityId = param.entityId;
      var messageId = param.messageId;

      if ($scope.hasAnnouncement) {
        Dialog.confirm({
          body: $filter('translate')('@announcement-create-confirm'),
          onClose: function(result) {
            if (result === 'okay') {
              AnnouncementData.createAnnouncement(entityId, messageId);
            }
          }
        });
      } else {
        AnnouncementData.createAnnouncement(entityId, messageId)
      }

      //if (!($scope.hasAnnouncement && !confirm($filter('translate')('@announcement-create-confirm')))) {
      //  AnnouncementData.createAnnouncement(entityId, messageId)
      //}
    }

    /**
     * announcement 우측 상단에 있는 화살표를 눌렀을 경우
     */
    function onAnnouncementArrowClicked() {
      _setHasOwnEventHandler();

      if (isAnnouncementMinimized()) {
        maximizeAnnouncement();
      } else {
        minimizeAnnouncement();
      }
    }

    /**
     * 최소화된 공지사항을 클릭했을 경우.
     */
    function onHidedAnnouncementClicked() {
      toggleAnnouncementStatus();
    }

    /**
     * announcement 의 이벤트클릭을 받고 있다가 클릭된 부분이 어딘지에 따라 알맞는 펑션을 실행한다.
     * 만약 'hasOwnEventHandler'가 true라면 이미 다른 function에서 이벤트를 핸들하였기때문에 아무것도 하지 않는다.
     * @param {object} event - click event object
     */
    function onAnnouncementBodyClicked(event) {
      var jqTarget;

      if (!hasOwnEventHandler) {

        jqTarget = $(event.target);

        if (jqTarget.is('a')) {
          // link clicked, go to link.
          //publicService.openNewTab(jqTarget.attr('href'));
        } else if (isAnnouncementMinimized()) {
          maximizeAnnouncement();
        } else if (jqTarget.closest('.announcement-body').length === 0) {
          minimizeAnnouncement();
        }
      }

      _resetHasOwnEventHandler();

    }

    /**
     * announcement writer 가 클릭되었을 경우 멤버 프로필 모달을 연다.
     */
    function onAnnouncementWriterClicked() {
      _setHasOwnEventHandler();
      _openMemberProfileModal(_announcement.writerId);
    }

    /**
     * announcement creator 가 클릭되었을 경우 멤버 프로필 모달을 연다.
     */
    function onAnnouncementCreatorClicked() {
      _setHasOwnEventHandler();
      _openMemberProfileModal(_announcement.creatorId);
    }

    /**
     * 멤버 프로필 모달을 연다.
     * @param {number} memberId - 멤버의 아이디
     * @private
     */
    function _openMemberProfileModal (memberId) {
      jndPubSub.pub('onMemberClick', memberId);
    }

    /**
     * announcement 의 visible status 를 true 로 바꿔준다.
     * @private
     */
    function _showAnnouncement() {
      $scope.hasAnnouncement = true;
      Announcement.adjustAnnouncementHeight();
    }

    /**
     * announcement dom element를 삭제한다.
     * @private
     */
    function _detachAnnouncement() {
      $scope.hasAnnouncement = false;
      memberService.removeAnnouncementStatus(_topicId);
    }

    /**
     * announcement 를 minimized 상태로 바꿔준다.
     * @private
     */
    function maximizeAnnouncement() {
      $scope.displayStatus.hide = false;
      $scope.displayStatus.minimized = false;

      Announcement.adjustAnnouncementHeight();
    }

    /**
     * announcement 를 extended 상태로 바꿔준다.
     * @private
     */
    function minimizeAnnouncement() {
      $scope.displayStatus.hide = false;
      $scope.displayStatus.minimized = true;
    }

    /**
     * announcement 가 숨겨져있는가?
     * @returns {boolean}
     */
    function isAnnouncementHided() {
      return $scope.displayStatus.hide;
    }

    /**
     * announcement 가 최소화되어있는가?
     * @returns {boolean}
     */
    function isAnnouncementMinimized() {
      return $scope.displayStatus.minimized;
    }

    /**
     * announcement 를 hide 상태로 바꿔준다.
     * @private
     */
    function hideAnnouncement() {
      $scope.displayStatus.hide = true;
    }

    /**
     * announcement 를 지운다.
     */
    function deleteAnnouncement() {
      _setHasOwnEventHandler();

      Dialog.confirm({
        body: $filter('translate')('@announcement-delete-confirm'),
        onClose: function(result) {
          if (result === 'okay') {
            AnnouncementData.deleteAnnouncement(_topicId)
              .success(_detachAnnouncement);
          }
        }
      });
    }

    function toggleAnnouncementStatus() {
      _setHasOwnEventHandler();
      var isCurrentTopicAnnouncementOpen = !memberService.isAnnouncementOpen(_topicId);

      //화면에 선 적용을 위해 수행한다.
      _applyAnnouncementStatus(isCurrentTopicAnnouncementOpen);

      AnnouncementData.toggleAnnouncementStatus(myId, _topicId, isCurrentTopicAnnouncementOpen)
        .error(function(err) {
          //통신 실패 시 원복한다.
          _applyAnnouncementStatus(!isCurrentTopicAnnouncementOpen);
        });
    }

    /**
     * 공지 사항의 display 상태를 반영한다.
     * @param isOpen
     * @private
     */
    function _applyAnnouncementStatus(isOpen) {
      memberService.updateAnnouncementStatus(_topicId, isOpen);
      _getAnnouncementStatus();
    }

    /**
     * actionType 에 따라 알맞는 멤버정보를 리턴한다.
     * @param {object} announcement - server로 부터 받은 announcement object
     * @param {number} entityId - 엔티티 아이디
     * @param {string} actionType - 액션의 종류
     * @returns {*}
     * @private
     */
    function _getActionOwner(announcement, entityId, actionType) {
      return Announcement.getActionOwner(announcement, entityId, actionType);
    }

    /**
     * $(window)에 event listener 를 붙힌다.
     * @private
     */
    function _attachWindowEvent() {
      $(window).on('resize', _onWindowResize);
    }

    /**
     * $(window)에서 event listener 를 분리한다.
     * @private
     */
    function _detachWindowEvent() {
      $(window).off('resize', _onWindowResize);
    }

    /**
     * $(window) 에 resize event listener 를 단다.
     * @private
     */
    function _onWindowResize() {
      if (!isAnnouncementHided() && !isAnnouncementMinimized()) {
        Announcement.adjustAnnouncementHeight();
      }
    }

    /**
     * $scope, 현재 스코프가 소멸될 때
     * @private
     */
    function _onScopeDestroy() {
      $scope.hasAnnouncement = false;
      _detachWindowEvent();
    }

    function _onAnnouncementSocketEvent(event, data) {
      if (_isCurrentTopic(data.topicId)) {
        switch (event.name) {
          case ANNOUNCEMENT_CREATED:
            jndPubSub.updateChatList();
            _getAnnouncement();
            break;
          case ANNOUNCEMENT_DELETED:
            jndPubSub.updateChatList();
            _detachAnnouncement();
            break;
          case ANNOUNCEMENT_STATUS_UPDATED:
          default:
            _applyAnnouncementStatus(data.status);
            memberService.updateAnnouncementStatus(_topicId, data.status);
            _getAnnouncementStatus();
            break;
        }
      }
    }

    /**
     * 현재 토픽아이디과 같은지 확인한다.
     * @param {number} eventTopic - topic id
     * @returns {boolean}
     * @private
     */
    function _isCurrentTopic(eventTopic) {
      return Announcement.isCurrentTopic(eventTopic, _topicId);
    }

    /**
     * hasOwnEventHandler flag를 true로 만든다.
     * @private
     */
    function _setHasOwnEventHandler() {
      hasOwnEventHandler = true;
    }

    /**
     * hasOwnEventHandler flag를 false로 만든다.
     * @private
     */
    function _resetHasOwnEventHandler() {
      hasOwnEventHandler = false;
    }

    /**
     * 어떤 멤버의 profile 이 바뀌었다는 socket event를 처리한다.
     * @param {object} event - $broadcast event obejct
     * @param {object} data - socket data object
     * @private
     */
    function _updateMemberProfile(event, data) {
      if ($scope.hasAnnouncement) {
        if (data.member.id === _announcement.writerId) {
          _updateActionOwner($scope.announcementWriter, data.member);
        } else if (data.member.id === _announcement.creatorId) {
          _updateActionOwner($scope.announcementCreator, data.member);
        }
      }
    }

    /**
     * annoucementWriter 혹은  announcementCreator 를 새로 업데이트 된 정보로 바꾼다.
     * @param {object} target - $scope variable to be updated
     * @param {object} source - new member entity object
     * @private
     */
    function _updateActionOwner(target, source) {
      _.extend(target, source);
      target.profilePic = memberService.getProfileImage(source.id, 'small');
    }
  }
})();
