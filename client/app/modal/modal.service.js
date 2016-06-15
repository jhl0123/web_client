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
                             NetInterceptor, Dialog, Browser, currentSessionHelper, CoreUtil, Tutorial, RoomTopicList,
                             jndPubSub) {
    var _that = this;

    var DEFAULT_NAMESPACE = 'default';

    // open된 modal들을 namespace별로 전체를 닫거나 관리하기 위해 사용한다.
    var _modalSpaces = {};

    var _inviteModalLock;

    _that.openFileUploadModal = openFileUploadModal;
    _that.openFileShareModal = openFileShareModal;
    _that.openFileIntegrationModal = openFileIntegrationModal;

    _that.openTopicCreateModal = openTopicCreateModal;
    _that.openTopicInviteModal = openTopicInviteModal;
    _that.openTopicInviteFromDmModal = openTopicInviteFromDmModal;
    _that.openTopicJoinModal = openTopicJoinModal;
    _that.openTopicRenameModal = openTopicRenameModal;

    _that.openTeamMemberListModal = openTeamMemberListModal;
    _that.openInviteToTeamModal = openInviteToTeamModal;

    _that.openUserProfileModal = openUserProfileModal;
    _that.openProfileImageModal = openProfileImageModal;
    _that.openBotProfileModal = openBotProfileModal;

    _that.openImageCarouselModal = openImageCarouselModal;
    _that.openFullScreenImageModal = openFullScreenImageModal;

    _that.openNotificationSettingModal = openNotificationSettingModal;

    _that.openPasswordResetRequestModal = openPasswordResetRequestModal;

    _that.openAgreementModal = openAgreementModal;
    _that.openPrivacyModal = openPrivacyModal;

    _that.openQuickLauncherModal = openQuickLauncherModal;
    _that.openShortcutModal = openShortcutModal;
    _that.openWelcome = openWelcome;
    _that.openDeprecated = openDeprecated;

    _that.closeModal = closeModal;
    _that.dismissModal = dismissModal;

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

      selectOptions = fileAPIservice.getShareOptions(
        RoomTopicList.toJSON(true),
        currentSessionHelper.getCurrentTeamUserList()
      );

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
      }
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
            return CoreUtil.pick(options, 'topicName') || '';
          },
          isEnterTopic: function() {
            var isEnterTopic = CoreUtil.pick(options, 'isEnterTopic');
            return _.isBoolean(isEnterTopic) ? isEnterTopic : true;
          }
        }
      };
      _.extend(modalOption, options);
      _modalOpener(modalOption);
      Tutorial.hideTooltip('topic');
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
    function openTopicRenameModal($scope, data) {
      var modalOption = {
        scope: $scope,
        templateUrl: 'app/modal/topics/topic_rename/topic.rename.html',
        controller: 'TopicRenameCtrl',
        size: 'lg',
        autofocus: '#topic-rename-name',
        resolve: {
          options: function() {
            // 토픽으로 초대 가능한 member의 수
            // 현재 channel의 유저가 가진 team의 갯수
            return data;
          }
        }
      };
      return _modalOpener(modalOption);
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
      if (!_inviteModalLock) {
        _inviteModalLock = true;
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
            _inviteModalLock = false;
          });
      }
    }

    /**
     * user의 간단한 프로필을 보는 모달창을 연다.
     * @param $scope {scope}
     * @param member {object} member entity to be shown
     */
    function openUserProfileModal($scope, member) {
      var modalOption = {
        scope: $scope.$new(),
        templateUrl: 'app/modal/members/user-profile/user.profile.html',
        controller: 'UserProfileCtrl',
        windowClass: 'profile-view-modal',
        resolve: {
          curUser: function getCurUser(){ return member; }
        }
      };

      _modalOpener(modalOption);
      _safeApply($scope);
    }

    /**
     * bot의 간단한 프로필을 보는 모달창을 연다.
     * @param $scope {scope}
     * @param member {object} member entity to be shown
     */
    function openBotProfileModal($scope, bot) {
      var modalOption = {
        scope: $scope.$new(),
        templateUrl: 'app/modal/members/bot-profile/bot.profile.html',
        controller: 'BotProfileCtrl',
        windowClass: 'profile-view-modal',
        resolve: {
          curBot: function getCurUser(){ return bot; }
        }
      };

      _modalOpener(modalOption);
      _safeApply($scope);
    }

    /**
     * profile image를 변경하는 모달창 열림.
     * @param {object} $scope
     * @param {object} options
     *  @param {string} options.type - 모달의 타입. 'crop'이면 image crop이고 'character'면 character 조합.
     *  @param {function} options.onProfileImageChange - change callback 함수.
     *  @param {string} [options.imageData] - 타입이 'crop'일때 crop할 imageData
     * @returns {Object}
     */
    function openProfileImageModal($scope, options) {
      var modalOption = {
        scope: $scope.$new(),
        templateUrl: 'components/jandi/ui/component/profile-image/profile.image.html',
        controller: 'ProfileImageCtrl',
        windowClass: 'full-screen-modal profile-image-modal',
        resolve: {
          options: function() {
            return options;
          }
        },
        multiple: true
      };

      return _modalOpener(modalOption);
    }

    /**
     * welcome modal
     * 가입 후 첫 team 진입시 출력하는 modal
     * @param {object} option
     */
    function openWelcome(option) {
      var modalOption = {
        controller: 'WelcomeCtrl',
        templateUrl: 'app/modal/welcome/welcome.html',
        windowClass: 'guide-modal'
      };

      _modalOpener(_.extend(modalOption, option));
    }

    /**
     * deprecated modal
     * 더이상 지원하지 않는 application 사용시 출력하는 modal
     * @param {object} option
     */
    function openDeprecated(option) {
      var modalOption = {
        controller: 'DeprecatedCtrl',
        templateUrl: 'app/modal/deprecated/deprecated.html',
        windowClass: 'guide-modal'
      };

      _modalOpener(_.extend(modalOption, option));
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

    /**
     * keyboard shortcut 모달을 open 한다
     * @param $scope
     */
    function openShortcutModal($scope) {
      var modalOption = {
        scope: $scope,
        controller: 'ModalShortcutCtrl',
        templateUrl: 'app/modal/shortcut/modal.shortcut.html',
        windowClass: 'keyboard-shortcut-modal'
      };

      _modalOpener(modalOption);
    }

    function openNotificationSettingModal($scope) {
      var modalOption = {
        scope: $scope,
        controller: 'SettingNotificationCtrl',
        templateUrl: 'app/modal/settings/notification/setting.notification.html'
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
        animation: false,
        templateUrl: 'app/modal/rooms/quick_launcher/quick.launcher.html',
        controller: 'QuickLauncherCtrl',
        windowClass: 'quick-launcher-modal',
        backdropClass: 'quick-launcher-backdrop'
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
      var namespace = options.namespace || DEFAULT_NAMESPACE;
      var modal;

      if (!options.multiple) {
        closeModal();
      }

      if (NetInterceptor.isConnected()) {
        _modalSpaces[namespace] = _modalSpaces[namespace] || [];
        modal = $modal.open(options);
        _modalSpaces[namespace].push(modal);

        modal.opened.then(function() {
          jndPubSub.pub('modalHelper:opened');
        });
        modal.result.then(_.bind(_modalResult, null, modal, namespace), _.bind(_modalResult, null, modal, namespace));

        _modalRendered(modal, options);

        return modal;
      }
    }

    /**
     * modal result callback
     * @param {object} modal
     * @param {string} namespace
     * @private
     */
    function _modalResult(modal, namespace) {
      var modals = _modalSpaces[namespace];
      var index;

      if (modals) {
        index = modals.indexOf(modal);
        if (index > -1) {
          modals.splice(index, 1);

          if (modals.length === 0) {
            delete _modalSpaces[namespace];
          }
        }
      }
    }

    /**
     * 모달의 결과값을 전달하며 닫음
     * @param {object} [option]
     * @param {string} [option.namespace]
     * @param {string} [option.result]
     * @returns {*}
     */
    function closeModal(option) {
      option = option || {};
      _.each(_modalSpaces[option.namespace || DEFAULT_NAMESPACE], function(modal) {
        modal.close(option.result);
      });
    }

    /**
     * 모달의 취소사유를 전달하며 닫음
     * @param {object} [option]
     * @param {string} [option.namespace]
     * @param {string} [option.reason]
     * @returns {*}
     */
    function dismissModal(option) {
      option = option || {};
      _.each(_modalSpaces[option.namespace || DEFAULT_NAMESPACE], function(modal) {
        modal.dismiss(option.reason);
      });
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
  }
})();
