(function() {

  'use strict';

  angular
    .module('jandiApp')
    .controller('headerCtrl',headerCtrl);

  /* @ngInject */
  function headerCtrl($scope, $rootScope, $state, $filter, $timeout, accountService, HybridAppHelper, memberService,
                      publicService, centerService, language, modalHelper, jndPubSub, DeskTopNotificationBanner,
                      Browser, AnalyticsHelper, Router, OtherTeamBadgeManager) {
    var modalMap = {
      'agreement': function() {
        modalHelper.openAgreementModal();
      },
      'privacy': function() {
        modalHelper.openPrivacyModal();
      },
      'channel': function() {
        modalHelper.openTopicCreateModal($scope);
      },
      'invite': function() {
        modalHelper.openInviteToTeamModal($scope);
      },
      'team-change': function() {
        modalHelper.openTeamChangeModal($scope);
      },
      'team-member': function() {
        modalHelper.openTeamMemberListModal();
      },
      'setting-notifications': function() {
        modalHelper.openNotificationSettingModal($scope);
      }
    };

    var stateParams;
    var currentRightPanel;

    var isOpenQuickLauncher;
    var quickLauncherModal;
    var timerOpenQuickLauncher;

    _init();

    function _init() {
      $rootScope.isOpenRightPanel = _getIsOpenRightPanel();

      DeskTopNotificationBanner.showNotificationBanner($scope);

      $scope.languageList = language.getLanguageList();
      $scope.isIe = Browser.msie;

      // sign out
      $scope.onSignOutClick = publicService.signOut;

      $scope.onLanguageClick = onLanguageClick;
      $scope.toTeam = toTeam;

      $scope.openModal = openModal;
      $scope.toggleLoading = toggleLoading;
      $scope.isUserAuthorized = isUserAuthorized;
      $scope.onShowTutorialClick = onShowTutorialClick;
      $scope.onTutorialPulseClick = onTutorialPulseClick;
      $scope.openRightPanel = openRightPanel;

      $scope.openQuickLauncher = openQuickLauncher;
      $scope.quickLauncherButtonTooltip = getQuickLauncherButtonTooltip()

      $scope.toolbar = {
        files: false,
        messages: false,
        stars: false,
        mentions: false
      };

      if (currentRightPanel = Router.getActiveRightTabName($state.current)) {
        // active된 right panel에 따라 header icon 활성화 여부를 설정한다.
        $scope.toolbar[currentRightPanel] = true;
      }

      _attachLEventListeners();
    }

    /**
     * 현재 스코프가 들어야할 이벤트들을 추가한다.
     * @private
     */
    function _attachLEventListeners() {
      $scope.$on('$stateChangeSuccess', function(event, toState, toParams) {
        stateParams = toParams;
      });

      // header icon의 active event handler
      $scope.$on('onActiveHeaderTab', function($event, type) {
        if (currentRightPanel !== type) {
          jndPubSub.pub('resetRPanelSearchStatusKeyword');
        }

        _setTabStatus(currentRightPanel, false);
        _setTabStatus(type, true);
      });

      // right panel의 open event handler
      $scope.$on('onRightPanel', function($event, data) {
        $rootScope.isOpenRightPanel = true;

        _setTabStatus(currentRightPanel, false);
        _setTabStatus(data.type, true);
      });

      // right panel의 close event handler
      $scope.$on('closeRightPanel', function() {
        _closeRightPanel();
      });

      $scope.$on('updateTeamBadgeCount', updateTeamBadge);

      $scope.$on('toggleQuickLauncher', _onToggleQuickLauncher);
      $scope.$on('center:toggleSticker', _onToggleSticker);
    }

    $scope.onLanguageClick = onLanguageClick;

    /**
     * change language event handler
     * @param {string} lang
     */
    function onLanguageClick(lang) {
      var currentLang = accountService.getAccountLanguage();
      if (currentLang === lang) return;

      var languageObj = {
        lang: lang
      };

      accountService.setAccountInfo(languageObj)
        .success(function(response) {
          //Analtics Tracker. Not Block the Process
          try {
            AnalyticsHelper.track(AnalyticsHelper.EVENT.LANGUAGE_CHANGE, {
              'RESPONSE_SUCCESS': true,
              'PREVIOUS_LANGUAGE': currentLang,
              'CURRENT_LANGUAGE': lang
            });
          } catch (e) {
          }

          accountService.setAccountLanguage(response.lang);

          publicService.setLanguageConfig(accountService.getAccountLanguage());

          // language를 변경하게 되면 html에 content로 bind된 text는 변경이 되지만 '.js' file내
          // 변수로 선언된 text는 변경되지 않으므로 '.js' 재수행을 필요로 하므로 page를 reload함.
          publicService.reloadCurrentPage($state.current, stateParams);
        })
        .error(function(err) {
          console.log(err);
          //Analtics Tracker. Not Block the Process
          try {
            AnalyticsHelper.track(AnalyticsHelper.EVENT.LANGUAGE_CHANGE, {
              'RESPONSE_SUCCESS': false,
              'ERROR_CODE': err.code,
              'PREVIOUS_LANGUAGE': currentLang,
              'CURRENT_LANGUAGE': lang
            });
          } catch (e) {
          }

        })
        .finally(function() {
        })
    }

    /**
     * 잔디 메인으로 보내면서 팀 리스트 페이지를 연다.
     */
    function toTeam() {
      publicService.redirectToMain();
    }

    $scope.updateTeamBadge = updateTeamBadge;

    /**
     * 메뉴 중 '팀' -> '팀 전환하기' 옆에 다른 팀의 badge count를 업데이트한다.
     */
    function updateTeamBadge() {
      $scope.otherTeamBadgeCount = OtherTeamBadgeManager.getTotalBadgeCount();
      $scope.hasBadgeOnOtherTeam = $scope.otherTeamBadgeCount > 0;

      // other team badge 갱신시 hybrid app badge도 갱신함
      HybridAppHelper.updateBadge();
    }

    /**
     * open modal
     * @param {string} selector
     */
    function openModal(selector) {
      var fn;
      (fn = modalMap[selector]) && fn();
    }

    /**
     * toggle loading screen
     */
    function toggleLoading() {
      $scope.isLoading = !$scope.isLoading;
    }

    /**
     * 권한 인증된 user 인지 여부
     * @returns {boolean}
     */
    function isUserAuthorized() {
      return memberService.isAuthorized($scope.user);
    }

    /**
     * click show tutorial
     */
    function onShowTutorialClick() {
      //@fixme: remove old tutorial logic
      if (HybridAppHelper.isPcApp()) {
        jndPubSub.pub('initTutorialStatus');
      } else {
        jndPubSub.pub('tutorial:open');
      }
    }

    /**
     * click tutorial pulse event handler
     * @param {object} $event
     */
    function onTutorialPulseClick($event) {
      jndPubSub.pub('onTutorialPulseClick', $event);
    }

    /**
     * open right panel event handler
     * @param {string} type - open tab type
     */
    function openRightPanel(type) {
      if ($scope.toolbar[type] && currentRightPanel === type) {
        _closeRightPanel();
      } else {
        _autoScroll();
        _setTabStatus(currentRightPanel, false);

        $state.go('messages.detail.' + type);
      }
    }

    /**
     * right panel의 scoll을 bottom으로 이동함.
     * @private
     */
    function _autoScroll() {
      if (centerService.isScrollBottom()) {
        jndPubSub.pub('center:scrollToBottom');
      }
    }

    /**
     * set tab status
     * @param {string} type
     * @param {boolean} value
     * @private
     */
    function _setTabStatus(type, value) {
      $scope.toolbar[type] = value;
      currentRightPanel = type;
    }

    /**
     * close right panel
     * @private
     */
    function _closeRightPanel() {
      $rootScope.isOpenRightPanel = false;

      $scope.toolbar[currentRightPanel] = false;
      currentRightPanel = null;
      $state.go('messages.detail');
    }

    /**
     * right panel open 여부를 전달함.
     * @returns {boolean}
     * @private
     */
    function _getIsOpenRightPanel() {
      return /files|messages|stars|mentions/.test($state.current.url);
    }

    /**
     * open quick launcher
     */
    function openQuickLauncher() {
      quickLauncherModal = modalHelper.openQuickLauncherModal();

      quickLauncherModal.opened.then(function() {
        isOpenQuickLauncher = true;
      });

      quickLauncherModal.result.finally(function() {
        isOpenQuickLauncher = false;
      });
    }

    /**
     * on toggle quick launcher
     * @private
     */
    function _onToggleQuickLauncher() {
      if (isOpenQuickLauncher) {
        modalHelper.closeModal();
      } else {
        timerOpenQuickLauncher = $timeout.cancel(timerOpenQuickLauncher);
        $timeout(function() {
          openQuickLauncher();
        }, 50);
      }
    }

    /**
     * on toggle sticker
     * @private
     */
    function _onToggleSticker() {
      modalHelper.closeModal();
    }

    /**
     * quick launcher button의 tooltip을 os에 맞게 전달한다.
     * @returns {*}
     */
    function getQuickLauncherButtonTooltip() {
      return $filter('translate')(Browser.platform.isMac ? '@quick-launcher-tooltip-for-mac' : '@quick-launcher-tooltip-for-win');
    }
  }
})();
