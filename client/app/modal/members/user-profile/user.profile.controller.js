/**
 * @fileoverview 다른 멤버들의 프로필을 보는 모달창의 컨트롤러.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('UserProfileCtrl', UserProfileCtrl);

  /* @ngInject */
  function UserProfileCtrl($scope, $modalInstance, $filter, $timeout, curUser, $state, MemberProfile, memberService,
                           messageAPIservice, analyticsService, jndKeyCode, jndPubSub, accountService, teamAPIservice) {
    var isChangedName = false;
    var isChangedEmail = false;
    var isChangedProfile = false;

    var timerShowDmInputAuto;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _setCurrentUser(curUser);

      $scope.account = accountService.getAccount();
      $scope.isDefaultProfileImage = memberService.isDefaultProfileImage($scope.curUser.u_photoUrl);
      $scope.isStarred = $scope.curUser.isStarred;
      $scope.isInactiveUser = memberService.isInactiveUser(curUser);
      $scope.isMyself = _isMyself();

      $scope.message = {content:''};

      $scope.onActionClick = onActionClick;
      $scope.onSubmitDoneClick = onSubmitDoneClick;
      $scope.onDmKeydown = onDmKeydown;

      $scope.onProfileSelect = onProfileSelect;
      $scope.onProfileChange = onProfileChange;

      $scope.close = close;
      $scope.postMessage = postMessage;

      $scope.activeIndex = null;

      if ($scope.isMyself) {
        $scope.emails = $scope.account.emails;
      }

      _attachEvents();
    }

    /**
     * attach events
     * @private
     */
    function _attachEvents() {
      $scope.$watch('message.content', _onMessageContentChange);
      $scope.$on('onCurrentMemberChanged', _onCurrentMemberChanged);
      $scope.$on('jndWebSocketMember:memberUpdated', _onUpdateMemberProfile);

      $scope.$on('$destroy', _onDestroy);
    }

    /**
     * set current user
     * @param {object} curUser
     * @private
     */
    function _setCurrentUser(curUser) {
      $scope.curUser = curUser;

      $scope.userProfileImage = memberService.getProfileImage(curUser.id, 'medium');
      $scope.name = $filter('getName')($scope.curUser);
      $scope.department = $filter('getUserDepartment')($scope.curUser);
      $scope.position = $filter('getUserPosition')($scope.curUser);
      $scope.phoneNumber = $filter('getUserPhoneNumber')($scope.curUser);
      $scope.email = $filter('getUserEmail')($scope.curUser);

      $scope.isDeactivatedUser = _isDeactivatedUser();
      $scope.statusMessage = $scope.isDeactivatedUser ?
        $scope.deactivatedMessage : $filter('getUserStatusMessage')($scope.curUser);
    }

    /**
     * 현재 멤버의 정보가 바뀌었다는 뜻이므로 locally가지고 있는 멤버의 정보를 최신으로 업데이트한다.
     */
    function _onCurrentMemberChanged() {
      if ($scope.isMyself) {
        _setCurrentUser(memberService.getMember());
      }
    }

    /**
     * scope destroy event handler
     * @private
     */
    function _onDestroy() {
      isChangedName && _changeProfileName();
      isChangedEmail && _changeProfileEmail();
      isChangedProfile && _changeProfileOtherInfo();
    }

    /**
     * modal close
     */
    function close() {
      $modalInstance.close();
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
      } else if (type === 'resendInvitation') {
        _sendInvitationMail();
      } else if (type === 'cancelInvitation') {
        _cancelInvitation();
      }

      $modalInstance.close();
    }

    /**
     * 초대 메일을 전송한다.
     * @private
     */
    function _sendInvitationMail() {
      teamAPIservice.inviteToTeam([$scope.email])
        .then(teamAPIservice.alertInvitationSuccess);
    }

    /**
     * 초대장을 취소한다.
     * @private
     */
    function _cancelInvitation() {
      teamAPIservice.confirmCancelInvitation(curUser.id);
    }

    /**
     * dm 입력란 keydown event handler
     */
    function onDmKeydown(event) {
      //if (jndKeyCode.match('ENTER', event.keyCode) && !$scope.isSending) {
      if (jndKeyCode.match('ENTER', event.keyCode)) {
        $scope.setShowDmSubmit(false);
      }
    }

    /**
     * submit done click
     */
    function onSubmitDoneClick() {
      if (_isEnableDM()) {
        $scope.setShowDmSubmit(false);
      }
    }

    /**
     * profile select event handler
     * @param {string} index
     */
    function onProfileSelect(index) {
      $scope.activeIndex = index;
    }

    /**
     * dm 활성화 여부
     * @returns {boolean}
     * @private
     */
    function _isEnableDM() {
      //return $scope.isShowDmSubmit && !$scope.isSending
      return $scope.isShowDmSubmit;
    }

    /**
     * post message
     */
    function postMessage() {
      if ($scope.message.content) {
        $scope.setShowDmSubmit(true);
        //$scope.isSending = true;

        $timeout.cancel(timerShowDmInputAuto);
        timerShowDmInputAuto = $timeout(function() {
          $scope.setShowDmSubmit(false);
        }, 2000);

        messageAPIservice.postMessage('users', curUser.id, $scope.message.content)
          .finally(function() {
            $scope.message.content = '';
            //$scope.isSending = false;
          });
      }
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
        $scope.userProfileImage = memberService.getProfileImage(member.id, 'small');
      }
    }

    /**
     * 해당 유저의 파일리스트를 연다.
     * @param userId {number} 해당 유저의 아이디.
     * @private
     */
    function _onFileListClick(userId) {
      MemberProfile.openFileList(userId);

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
        $scope.deactivatedMessage = $filter('translate')(deactivatedMessageKey).replace(/<?br>/g, '\n');
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

      MemberProfile.goToDM(userId);
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
        $scope.setShowDmSubmit(false);
      }
    }

    /**
     * profile change event handler
     * @param {string} type
     * @param {string} value
     */
    function onProfileChange(type, value) {
      switch(type) {
        case 'name':
          isChangedName = true;
          $scope.curUser.name = value;
          break;
        case 'email':
          isChangedEmail = true;
          $scope.curUser.u_email = value;
          break;
        case 'department':
          isChangedProfile = true;
          $scope.curUser.u_extraData.department = value;
          break;
        case 'position':
          isChangedProfile = true;
          $scope.curUser.u_extraData.position = value;
          break;
        case 'phoneNumber':
          isChangedProfile = true;
          $scope.curUser.u_extraData.phoneNumber = value;
          break;
        case 'statusMessage':
          isChangedProfile = true;
          $scope.curUser.u_statusMessage = value;
          break;
      }
    }

    /**
     * 현재 보고 있는 프로필의 이름을 바꾼다.
     */
    function _changeProfileName() {
      memberService.setName(memberService.getName($scope.curUser))
        .error(function (err) {
          console.log(err);
        });
    }

    /**
     * 현재 보고 있는 프로필의 이메일을 바꾼다.
     */
    function _changeProfileEmail() {
      memberService.setEmail(memberService.getEmail($scope.curUser))
        .error(function (err) {
          console.log(err);
        });
    }

    /**
     * 현재 보고 있는 프로필의 다른 정보(추가 정보)들을 바꾼다.
     *   - 오늘의 기분, 전화번호, 부서, 그리고 직책
     */
    function _changeProfileOtherInfo() {
      memberService.updateProfile($scope.curUser)
        .success(function() {
          // analytics
          analyticsService.mixpanelTrack( "Set Profile" );
          var profile_data = {

            "status"    : $scope.curUser.u_statusMessage,
            "mobile"    : $scope.curUser.u_extraData.phoneNumber,
            "division"  : $scope.curUser.u_extraData.department,
            "position"  : $scope.curUser.u_extraData.position
          };

          analyticsService.mixpanelPeople( "set", profile_data );
        })
        .error(function(err) {
          console.error('updateUserProfile', arguments);
        });
    }
  }
})();
