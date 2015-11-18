/**
 * Main reason for this service is to
 *  1. keep modal instance as a singleton object throughout the whole application
 *  2. Reduce unnecessary codes
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('modalHelper', modalWindowHelper);

  /* @ngInject */
  function modalWindowHelper($rootScope, $modal, $filter, $timeout, teamAPIservice, fileAPIservice, accountService,
                             NetInterceptor, Dialog, Browser) {

    var that = this;

    // singleton modal instance
    var modal;

    var inviteModalLock;


    that.openFileUploadModal = openFileUploadModal;
    that.openFileShareModal = openFileShareModal;
    that.openFileIntegrationModal = openFileIntegrationModal;

    that.openTopicCreateModal = openTopicCreateModal;
    that.openTopicInviteModal = openTopicInviteModal;
    that.openTopicInviteFromDmModal = openTopicInviteFromDmModal;
    that.openTopicJoinModal = openTopicJoinModal;
    that.openTopicRenameModal = openTopicRenameModal;

    that.openTeamChangeModal = openTeamChangeModal;
    that.openTeamMemberListModal = openTeamMemberListModal;
    that.openInviteToTeamModal = openInviteToTeamModal;

    that.openCurrentMemberModal = openCurrentMemberModal;
    that.openMemberProfileModal = openMemberProfileModal;

    that.openImageCarouselModal = openImageCarouselModal;
    that.openFullScreenImageModal = openFullScreenImageModal;

    that.openNotificationSettingModal = openNotificationSettingModal;

    that.openPasswordResetRequestModal = openPasswordResetRequestModal;

    that.openAgreementModal = openAgreementModal;
    that.openPrivacyModal = openPrivacyModal;

    that.openQuickLauncherModal = openQuickLauncherModal;

    that.closeModal = closeModal;

    that.setRemovePromise = setRemovePromise;

    /**
     * file 을 upload 하는 모달창을 연다.
     * @param $scope
     */
    function openFileUploadModal($scope, options) {
      var modalOption = {
        scope: $scope,
        templateUrl: 'app/modal/files/upload/upload.html',
        controller: 'FileUploadModalCtrl',
        size: 'lg',
        backdrop: 'static',
        resolve: {
          fileUploadOptions: function() {
            return options;
          }
        }
      };
      _modalOpener(modalOption);
    }

    /**
     * file 을 share 하는 모달창을 연다.
     * @param $scope
     */
    function openFileShareModal($scope, fileToShare) {
      var modalOption;
      var selectOptions;

      selectOptions = fileAPIservice.getShareOptions($rootScope.joinedEntities, $rootScope.memberList);
      selectOptions = fileAPIservice.removeSharedEntities(fileToShare, selectOptions);

      if (!selectOptions.length) {
        Dialog.warning({
          title: $filter('translate')('@common-all-shared')
        });
      } else {
        modalOption = {
          scope: $scope.$new(),
          templateUrl: 'app/modal/files/share/share.html',
          controller: 'FileShareModalCtrl',
          size: 'lg',
          resolve: {
            fileToShare: function () {
              return fileToShare;
            },
            selectOptions: function (){
              return selectOptions;
            }
          }
        }
      };
      _modalOpener(modalOption);
      //_safeApply($scope);
    }

    /**
     * file integration 할 수 있는 모달창을 연다.
     * @param $scope
     */
    function openFileIntegrationModal($scope, data) {
      var modalOption = {
        scope: $scope,
        templateUrl: 'app/modal/files/integration/integration.html',
        controller: 'fileIntegrationModalCtrl',
        size: 'lg',
        windowClass: 'integration-modal',
        resolve: {
          data: function() {
            return data;
          }
        }
      };
      _modalOpener(modalOption);
    }
    /**
     * topic 을 create 할 수 있는 모달창을 연다.
     * @param $scope
     */
    function openTopicCreateModal(options) {
      var modalOption = {
        templateUrl: 'app/modal/topics/topic_create/topic.create.html',
        controller: 'TopicCreateCtrl',
        size: 'lg',
        autofocus: '#topic-create-name',
        resolve: {
          topicName: function () {
            return (options && options.topicName) || '';
          }
        }
      };
      _.extend(modalOption, options);
      _modalOpener(modalOption);
    }

    /**
     * 현재 토픽으로 초대할 수 있는 모달창을 연다.
     */
    function openTopicInviteModal() {
      var modalOption = {
        templateUrl: 'app/modal/topics/topic_invite/topic.invite.html',
        controller: 'TopicInviteCtrl',
        size: 'lg',
        windowClass: 'allowOverflowY',
        autofocus: '#invite-member-filter',
        resolve: {
          data: function() {
            // 토픽으로 초대 가능한 member의 수
            // 현재 channel의 유저가 가진 team의 갯수
            return '';
          }
        }
      };
      _modalOpener(modalOption);
    }

    /**
     * 1:1 DM 창에서 상대방을 내가 조인한 토픽에 초대하는 모달창을 연다.
     * @param $scope
     */
    function openTopicInviteFromDmModal($scope) {
      var modalOption = {
        scope: $scope,
        templateUrl: 'app/modal/topics/topic_invite_from_dm/topic.invite.direct.html',
        controller: 'TopicInviteFromDmCtrl',
        size: 'lg'
      };
      _modalOpener(modalOption);
    }

    /**
     * topic 에 조인 할 수 있는 모달창을 연다.
     * @param $scope
     */
    function openTopicJoinModal($scope) {
      var modalOption = {
        scope: $scope,
        templateUrl: 'app/modal/topics/topic_join/topic.join.html',
        controller: 'TopicJoinCtrl',
        size: 'lg',
        autofocus: '#invite-member-filter'
      };
      _modalOpener(modalOption);
    }

    /**
     * topic 의 이름을 rename 할 수 있는 모달창을 연다.
     * @param $scope
     */
    function openTopicRenameModal($scope) {
      var modalOption = {
        scope: $scope,
        templateUrl: 'app/modal/topics/topic_rename/topic.rename.html',
        controller: 'TopicRenameCtrl',
        size: 'lg',
        autofocus: '#topic-rename-name'
      };
      _modalOpener(modalOption);
    }

    /**
     * 팀 변환을 위한 현재 사용자가 가입되어있는 팀 리스트를 보여주는 모달창을 연다.
     * @param $scope
     */
    function openTeamChangeModal($scope) {
      var modalOption = {
        scope: $scope,
        templateUrl: 'app/modal/teams/team_change/team.change.html',
        controller: 'TeamChangeController',
        size: 'lg'
      };
      _modalOpener(modalOption);
    }

    /**
     * 팀에 소속된 모든 멤버들을 볼 수 있는 모달창을 연댜.
     */
    function openTeamMemberListModal() {
      var modalOption = {
        templateUrl: 'app/modal/teams/team_member_list/team.member.list.html',
        controller: 'TeamMemberListCtrl',
        size: 'lg',
        autofocus: '#team-member-filter'
      };
      _modalOpener(modalOption);
    }

    /**
     * 이메일로 팀으로 초대하는 모달창을 연다.
     */
    function openInviteToTeamModal() {
      if (!inviteModalLock) {
        inviteModalLock = true;
        // modal에 해당 member의 team information을 전달 해야함.
        teamAPIservice.getTeamInfo()
          .success(function(res) {
            var modalOption = {
              templateUrl: 'app/modal/teams/team_invite/team.invite.html',
              controller: 'TeamInviteCtrl',
              size: 'lg',
              resolve: {
                teamInfo: function() {
                  return res;
                }
              }
            };
            _modalOpener(modalOption);
          })
          .finally(function() {
            inviteModalLock = false;
          });
      }
    }

    /**
     * 현재 나의 프로필을 수정/확인 할 수 있는 모달창을 연다.
     * @param $scope
     */
    function openCurrentMemberModal($scope) {
      var modalOption = {
        scope: $scope,
        templateUrl: 'app/modal/members/current_member_profile/current.member.profile.html',
        controller: 'ProfileSettingCtrl',
        backdrop: 'static',
        windowClass: 'current-member-profile',
        autofocus: '#member-profile-name'
      };

      _modalOpener(modalOption);
    }

    /**
     * 멤버의 간단한 프로필을 보는 모달창을 연다.
     * @param $scope {scope}
     * @param member {object} member entity to be shown
     */
    function openMemberProfileModal($scope, member) {
      var modalOption = {
        scope: $scope.$new(),
        templateUrl: 'app/modal/members/member_profile/member.profile.view.html',
        controller: 'ProfileViewCtrl',
        windowClass: 'profile-view-modal',
        resolve: {
          curUser: function getCurUser(){ return member; }
        }
      };

      _modalOpener(modalOption);
      _safeApply($scope);
    }

    /**
     * apply 를 안전하게 수행한다.
     * @param {object} scope
     * @private
     */
    function _safeApply(scope) {
      if (scope.$$phase !== '$apply' && scope.$$phase !== '$digest') {
        scope.$apply();
      }
    }

    /**
     * image-carousel modal open
     * @param {object} data
     * @param {string} title - file title
     * @param {number} messageId - file message id
     * @param {string} imageUrl - origin image url
     */
    function openImageCarouselModal(data) {
      var modalOptions = {
        controller: 'ImageCarouselCtrl',
        templateUrl: 'app/modal/images/carousel/image.carousel.html',
        windowClass: 'image-carousel-modal',
        resolve: {
          data: function() {
            return data;
          }
        }
      };

      _modalOpener(modalOptions);
    }

    function openFullScreenImageModal($scope, fileUrl) {
      var modalOption = {
        scope: $scope,
        controller: 'FullScreenImageCtrl',
        templateUrl: 'app/modal/images/full_image/full.screen.image.html',
        windowClass: 'modal-full fade-only',
        resolve: {
          photoUrl: function() {
            return fileUrl;
          }
        }
      };

      _modalOpener(modalOption);
    }

    function openNotificationSettingModal($scope) {
      var modalOption = {
        scope: $scope,
        controller: 'NotificationCtrl',
        templateUrl: 'app/modal/settings/notification/setting.notification.html',
        backdrop: 'static'
      };

      _modalOpener(modalOption);
    }

    /**
     * 비밀번호 재설정을 위한 이메일을 요청하는 모달창을 연다.
     * @param $scope
     */
    function openPasswordResetRequestModal($scope) {
      var modalOption = {
        scope: $scope,
        templateUrl: 'app/modal/password/password.reset.request.html',
        controller: 'PasswordRequestCtrl',
        size: 'lg'
      };

      _modalOpener(modalOption);
    }

    /**
     * 이용약관 모달창을 연다.
     */
    function openAgreementModal() {
      var agreement = 'app/modal/terms/agreements/agreement';
      agreement = agreement + '_' + accountService.getAccountLanguage() + '.html';

      var modalOption = {
        templateUrl: agreement,
        size: 'lg'
      };

      _modalOpener(modalOption);
    }

    /**
     * 개인정보 보호 방침 모달창을 연다.
     */
    function openPrivacyModal() {
      var privacy = 'app/modal/terms/privacy/privacy';
      privacy = privacy + '_' + accountService.getAccountLanguage() + '.html';

      var modalOption = {
        templateUrl: privacy,
        size: 'lg'
      };

      _modalOpener(modalOption);
    }

    /**
     * quick launcher 모달창을 연다.
     */
    function openQuickLauncherModal() {
      var modalOption = {
        templateUrl: 'app/modal/rooms/quick_launcher/quick.launcher.html',
        controller: 'QuickLauncherCtrl',
        windowClass: 'quick-launcher-modal'
      };
      return _modalOpener(modalOption);
    }

    /**
     * 모달창을 여는 펑션이다.
     * @param modalOption {object} modal option to be passed when opening modal instance
     * @returns {object} $modalInstance
     * @private
     */
    function _modalOpener(options) {
      closeModal();

      if (NetInterceptor.isConnected()) {
        modal = $modal.open(options);

        _modalRendered(modal, options);
        setRemovePromise(modal);

        return modal;
      }
    }

    /**
     * 모달을 별 이유없이 닫는다.
     */
    function closeModal() {
      return modal && modal.close();
    }

    /**
     * modal rendered promise
     * @param {object} modal
     * @param {object} options
     * @private
     */
    function _modalRendered(modal, options) {
      // dev/alpha에서 focus가 body로 갔다가 modal로 가는 현상때문에 msie의 rendering
      // 버그와 별개로 timeout 400을 줌
      options.renderedTimeout = options.renderedTimeout || (Browser.msie ? 400 : 400);

      modal.rendered.then(function() {
        if (options.autofocus) {
          setTimeout(function() {
            $(options.autofocus).focus();
          }, options.renderedTimeout);
        }
      });
    }

    /**
     * modal element 강제 삭제 설정
     * modal이 close 되어도 element가 삭제되지 않는 경우 처리를 위함
     * @param {object} modal
     * @private
     */
    function setRemovePromise(modal) {
      var jqModal = $('div.modal');
      var jqBody = $('body');
      var jqBackdrop = $('.modal-backdrop');

      modal.result.finally(function() {
        setTimeout(function() {
          jqBody.removeClass('modal-open');
          jqModal.remove();
          jqBackdrop.remove();
        }, 200);
      });
    }
  }
})();
