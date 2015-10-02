/**
 * @fileoverview team invite modal controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TeamInviteCtrl', TeamInviteCtrl);

  /* @ngInject */
  function TeamInviteCtrl($scope, $modalInstance, $filter, $timeout, teamInfo, configuration,
                          memberService, publicService, currentSessionHelper, jndPubSub,
                          teamAPIservice, analyticsService) {
    var currentTeamAdmin;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.disabledImage = configuration.assets_url + 'assets/images/invite-disabled.png';
      $scope.doneImage = configuration.assets_url + 'assets/images/invite-done.png';
      $scope.membersImage = configuration.assets_url + 'assets/images/invite-members.png';

      $scope.seedUri = teamInfo.invitationUrl || '';                            // invite public link
      $scope.inviteDisabled = teamInfo.invitationStatus === 'disabled';   // invite status
      $scope.disableSeedUri = $scope.seedUri === '';

      // current team name
      $scope.currentTeamName = currentSessionHelper.getCurrentTeam().name;

      // team의 admin
      currentTeamAdmin = currentSessionHelper.getCurrentTeamAdmin();
      $scope.adminName = currentTeamAdmin ? currentTeamAdmin.name : '';
      $scope.isAdmin = currentTeamAdmin.id === memberService.getMemberId();

      $scope.send = send;
      $scope.inviteMore = inviteMore;
      $scope.onInviteEmailsInit = onInviteEmailsInit;

      $scope.cancel = cancel;

      $scope.toggleLoading = toggleLoading;
      $scope.toAdmin = toAdmin;

      // invite 완료 flag
      $scope.isInviteDone = false;

      $scope.isLoading = false;
    }

    /**
     * 팀 초대 메일 보내기
     */
    function send() {
      var emails;

      if (!$scope.isLoading) {
        $scope.isLoading = true;

        console.log('send invite email ::: ');
        emails = $scope.emails;

        teamAPIservice.inviteToTeam(emails)
          .success(function (response) {
            var successCount = 0;
            var failCount = 0;

            _.forEach(response, function(value) {
              if (value.success) {
                // eamil 전송 성공

                successCount++;
              } else {
                failCount++;
              }
            });

            // email 전송한 총 수를 표현한다.
            if (failCount === 0) {
              // 모두 email 전송 성공함
              $scope.inviteResultDesc = $filter('translate')('@team-invite-done').replace('{{inviteeNumber}}', successCount);
            } else {
              $scope.inviteResultDesc = $filter('translate')('@team-invite-done-with-fail')
                .replace('{{inviteeNumber}}', successCount)
                .replace('{{failedInviteeNumber}}', failCount);
            }
            $scope.isInviteDone = true;

            // analytics
            if (successCount > 0) {
              analyticsService.mixpanelTrack( "User Invite", { "count": successCount } );
              analyticsService.mixpanelPeople( "increment", { "key": "invite", "value": successCount } );
            }
          })
          .finally(function () {
            $scope.isLoading = false;
          });
      }
    }

    /**
     * 팀 초대 계속 진행함
     */
    function inviteMore() {
      $scope.isInviteDone = false;
      $scope.emails = [];
    }

    /**
     * 팀 초대 모달 닫기
     */
    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    /**
     * loading screen toggle
     */
    function toggleLoading() {
      if ($scope.isLoading) {
        jndPubSub.hideLoading();
      } else {
        jndPubSub.showLoading();
      }
      $scope.isLoading = !$scope.isLoading;
    }

    /**
     * web_admin으로 redirect
     */
    function toAdmin() {
      var teamName = $filter('getName')($scope.team);
      publicService.redirectTo(configuration.main_address + 'admin/' + teamName);
    }

    /**
     * invite emails directive 초기화 event handler
     */
    function onInviteEmailsInit() {
      $timeout(function() {
        if (!$scope.isSupportClip) {

          // clipboard 제공하지 않는다면 invite link에 focus 줌
          $('#invite-link').focus();
        }
      }, 50);
    }
  }
})();
