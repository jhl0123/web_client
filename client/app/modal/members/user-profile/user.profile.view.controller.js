/**
 * @fileoverview 다른 멤버들의 프로필을 보는 모달창의 컨트롤러.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('ProfileViewCtrl', ProfileViewCtrl);

  /* @ngInject */
  function ProfileViewCtrl($scope, $filter, curUser, $state, modalHelper, jndPubSub, memberService, messageAPIservice) {
    _init();

    function _init() {
      $scope.curUser = curUser;
      curUser.extProfileImage = memberService.getProfileImage(curUser.id, 'small');

      $scope.name = $filter('getName')($scope.curUser);
      $scope.department = $filter('getUserDepartment')($scope.curUser);
      $scope.position = $filter('getUserPosition')($scope.curUser);
      $scope.phoneNumber = $filter('getUserPhoneNumber')($scope.curUser);
      $scope.email = $filter('getUserEmail')($scope.curUser);
      $scope.statusMessage = $filter('getUserStatusMessage')($scope.curUser);

      $scope.isDefaultProfileImage = memberService.isDefaultProfileImage($scope.curUser.u_photoUrl);
      $scope.isStarred = $scope.curUser.isStarred;
      $scope.isDeactivatedUser = _isDeactivatedUser();
      $scope.isMyself = _isMyself();

      $scope.message = {content:''};

      $scope.$on('updateMemberProfile', _onUpdateMemberProfile);

      $scope.close = close;
      $scope.onActionClick = onActionClick;
      $scope.onSubmitDoneClick = onSubmitDoneClick;
      $scope.postMessage = postMessage;

      _attachEvents();
    }

    /**
     * attach events
     * @private
     */
    function _attachEvents() {
      $scope.$watch('message.content', _onMessageContentChange);
    }

    /**
     * modal close
     */
    function close() {
      modalHelper.closeModal();
    }

    /**
     * 프로필 모달에서 버튼을 눌렀을 경우 해당하는 기능은 불러준다.
     * @param actionType {string} 실행되어야 할 기능의 이름
     */
    function onActionClick(type) {
      if (type === 'file') {
        _onFileListClick(curUser.id);
      } else if (type === 'email') {
        _sendEmail($scope.curUser.u_email);
      } else if (type === 'directMessage' && !_isMyself()) {
        _goToDM(curUser.id);
      } else if (type === 'mention') {
        _goToMention();
      }

      modalHelper.closeModal();
    }

    /**
     * submit done click
     */
    function onSubmitDoneClick() {
      if (_isEnableDM()) {
        $scope.showSubmitDone = false;
      }
    }

    function _isEnableDM() {
      return $scope.showSubmitDone && !$scope.isSending
    }

    /**
     * post message
     */
    function postMessage() {
      $scope.showSubmitDone = true;
      $scope.isSending = true;

      messageAPIservice.postMessage('users', curUser.id, $scope.message.content)
        .success(function() {
          $scope.message.content = '';
        })
        .finally(function() {
          $scope.isSending = false;
        });
    }

    /**
     * updateMemberProfile 이벤트 발생시 이벤트 핸들러
     * @param {object} event
     * @param {{event: object, member: object}} data
     * @private
     */
    function _onUpdateMemberProfile(event, data) {
      var member = data.member;
      if ($scope.curUser.id === member.id) {
        $scope.curUser.exProfileImg = memberService.getProfileImage(member.id, 'small');
      }
    }

    /**
     * 해당 유저의 파일리스트를 연다.
     * @param userId {number} 해당 유저의 아이디.
     * @private
     */
    function _onFileListClick(userId) {
      if ($state.current.name != 'messages.detail.files') {
        $state.go('messages.detail.files');
      }

      jndPubSub.pub('updateFileWriterId', userId);
    }

    /**
     * 현재 보고 있는 사용자가 disabled 된 사용자인지 아닌지 확인한다.
     * @returns {boolean} true, disabled 됐다면
     * @private
     */
    function _isDeactivatedUser() {
      var deactivatedMessageKey;
      var isDeactivated = false;

      if (memberService.isDisabled($scope.curUser)) {
        isDeactivated = true;
        deactivatedMessageKey = '@common-disabled-member-profile-msg';
      } else if (memberService.isDeleted($scope.curUser)) {
        isDeactivated = true;
        deactivatedMessageKey = '@common-deleted-member-profile-msg';
      }

      if (isDeactivated) {
        $scope.deactivatedMessage = $filter('translate')(deactivatedMessageKey);
      }

      return isDeactivated;
    }

    /**
     * 현재 보고 있는 사용자가 disabled 된 사용자인지 아닌지 확인한다.
     * @returns {boolean} true, disabled 됐다면
     * @private
     */
    function _isCurrentUserDisabled() {
      return $scope.curUser.status === 'disabled';
    }

    /**
     * 현재 보고 있는 사용자가 나 자신인지 아닌지 확인한다.
     * @returns {boolean} true, 내 자신이면
     * @private
     */
    function _isMyself() {
      var member = memberService.getMember();
      return $scope.curUser.id === member.id;
    }

    /**
     * 이메일을 보내는 창을 연다.
     * @param emailAddr {string} 보냉 이메일 주소
     * @private
     */
    function _sendEmail(emailAddr) {
      if (!_isCurrentUserDisabled()) {
        window.location.href = "mailto:" + emailAddr;
      }
    }

    /**
     * 1:1 대화로 옮긴다.
     * @param userId {number} 1:1 대화를 할 상대의 아이디
     * @private
     */
    function _goToDM(userId) {
      if (_isMyself()) {
        return;
      }

     // TODO: REFACTOR ROUTE.SERVICE
      var routeParam = {
        entityType: 'users',
        entityId: userId
      };

      $state.go('archives', routeParam);
    }

    /**
     * go metion tab
     * @private
     */
    function _goToMention() {
      $state.go('messages.detail.mentions');
    }

    /**
     * message content change
     * @param {string} value
     * @private
     */
    function _onMessageContentChange(value) {
      if (_isEnableDM() && value !== '') {
        $scope.showSubmitDone = false;
      }
    }
  }
})();
