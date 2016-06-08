(function() {

  'use strict';

  angular
    .module('jandiApp')
    .controller('headerCtrl',headerCtrl);

  /* @ngInject */
  function headerCtrl($scope, $state, $filter, $timeout, accountService, memberService, Environment,
                      publicService, language, modalHelper, jndPubSub, DeskTopNotificationBanner, Browser,
                      AnalyticsHelper, Router, JndConnect, JndZoom, RightPanel, Tutorial,
                      AccountHasSeen) {
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
      'team-change': _openTeamSwitchMenu,
      'team-member': function() {
        modalHelper.openTeamMemberListModal();
      },
      'setting-notifications': function() {
        modalHelper.openNotificationSettingModal($scope);
      },
      'shortcut': function() {
        modalHelper.openShortcutModal($scope);
      }
    };

    var stateParams;
    var currentRightPanel;

    var isOpenQuickLauncher;
    var quickLauncherModal;
    var timerOpenQuickLauncher;

    _init();

    function _init() {
      _initRightPanelStatus();

      DeskTopNotificationBanner.showNotificationBanner($scope);

      //커넥트 관련 요소를 활성화 할지 여부
      $scope.isConnectActive = JndConnect.isActive();
      $scope.languageList = language.getLanguageList();
      $scope.isIe = Browser.msie;

      // sign out
      $scope.onSignOutClick = publicService.signOut;

      $scope.isZoomEnable = JndZoom.isZoomEnable();
      $scope.zoomIn = zoomIn;
      $scope.zoomOut = zoomOut;
      $scope.zoomReset = zoomReset;

      $scope.onLanguageClick = onLanguageClick;
      $scope.toTeam = toTeam;

      $scope.openModal = openModal;
      $scope.toggleLoading = toggleLoading;
      $scope.isUserAuthorized = isUserAuthorized;
      $scope.onShowTutorialClick = onShowTutorialClick;
      $scope.onTutorialPulseClick = onTutorialPulseClick;
      $scope.openRightPanel = openRightPanel;
      $scope.showConnect = showConnect;

      $scope.openQuickLauncher = openQuickLauncher;
      $scope.quickLauncherButtonTooltip = getQuickLauncherButtonTooltip();

      RightPanel.initTabs();

      $scope.ctrlKey = Environment.CTRL;
      $scope.toolbar = RightPanel.getTabStatus();
      currentRightPanel = RightPanel.getStateName($state.current);
      $scope.isCompleteTutorial = true;
      $scope.dropdownIsOpen = {
        team: false,
        help: false
      };

      _initializeIntercomLanguage();

      _initTutorialBlink();
      _attachEvents();
    }

    /**
     * tutorial blink 표시를 초기화 한다.
     * @private
     */
    function _initTutorialBlink() {
      if (accountService.getAccount()) {
        _setTutorialBlink();
      } else {
        $scope.$on('accountService:setAccount', _setTutorialBlink);
      }
    }

    /**
     * tutorial blink 상태를 업데이트 한다.
     * @private
     */
    function _setTutorialBlink() {
      $scope.isCompleteTutorial = AccountHasSeen.get('TUTORIAL_VER3_POPOVER');
    }

    /**
     * 우측 패널 open 이벤트 핸들러
     * @param {object} angularEvent
     * @param {string} type
     * @private
     */
    function _onHotkeyOpenRight(angularEvent, type) {
      openRightPanel(type);
    }

    /**
     * 우측패널 닫기 이벤트 핸들러
     * @private
     */
    function _onHotKeyCloseRight() {
      _closeRightPanel();
    }

    /**
     * connect 메뉴를 노출한다.
     */
    function showConnect(data) {
      JndConnect.open(data);
    }

    /**
     * 최초 로딩시 오른족 패널의 상태 초기값 설정함
     * @private
     */
    function _initRightPanelStatus() {
      Router.setRightPanelStatus();
    }

    /**
     * 현재 스코프가 들어야할 이벤트들을 추가한다.
     * @private
     */
    function _attachEvents() {
      $scope.$on('$stateChangeSuccess', function(event, toState, toParams) {
        stateParams = toParams;
      });
      $scope.$on('hotkey-open-right', _onHotkeyOpenRight);
      $scope.$on('hotkey-close-right', _onHotKeyCloseRight);

      // header icon의 active event handler
      $scope.$on('onActiveHeaderTab', function($event, type) {
        _setTabStatus(currentRightPanel, false);
        _setTabStatus(type, true);
      });

      // right panel의 open event handler
      $scope.$on('rightPanelStatusChange', function($event, data) {
        _setTabStatus(currentRightPanel, false);
        _setTabStatus(data.type, true);
      });

      $scope.$on('Router:fileChanged', function($event, data) {
        _setTabStatus(currentRightPanel, false);
        _setTabStatus(data.type, true);
      });

      // right panel의 close event handler
      $scope.$on('closeRightPanel', function() {
        _closeRightPanel();
      });

      $scope.$on('toggleQuickLauncher', _onToggleQuickLauncher);
      $scope.$on('Tutorial:complete', _onTutorialComplete);

      $scope.$on('Router:openRightPanel', _onRightPanelOpen);

      $scope.$on('onCurrentMemberChanged', _onCurrentMemberChanged);
    }

    $scope.onLanguageClick = onLanguageClick;

    /**
     * tutorial 완료 이벤트 핸들러
     * @private
     */
    function _onTutorialComplete() {
      $scope.isCompleteTutorial = true;
    }

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

          // server에서 response 값 전달시 account api 호출시 전달한 lang값을 설정한 row를 
          // 조회 하지 못하는 케이스가 발생하므로 account api 호출시 사용한 data를 그대로 사용한다.
          accountService.setAccountLanguage(lang);

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

    /**
     * open modal
     * @param {string} selector
     * @param {object} $event
     */
    function openModal(selector, $event) {
      var fn;
      (fn = modalMap[selector]) && fn($event);
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
      Tutorial.showPopover();
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
      var tab = $scope.toolbar[type];

      if (tab) {
        if (tab.isActive && currentRightPanel === type) {
          _closeRightPanel();
        } else {
          _setTabStatus(currentRightPanel, false);

          $state.go('messages.detail.' + type);
        }
      }
    }

    /**
     * set tab status
     * @param {string} type
     * @param {boolean} value
     * @private
     */
    function _setTabStatus(type, value) {
      var tab = $scope.toolbar[type];

      if (tab) {
        tab.isActive = value;
        currentRightPanel = type;
      }
    }

    /**
     * close right panel
     * @private
     */
    function _closeRightPanel() {
      var tab = $scope.toolbar[currentRightPanel];

      if (tab) {
        tab.isActive = false;
        currentRightPanel = null;
        $state.go('messages.detail');
      }
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
     * change right panel
     * @param {object} $event
     * @param {boolean} isOpen
     * @private
     */
    function _onRightPanelOpen($event, isOpen) {
      if (isOpen === false) {
        // right panel이 열리지 않은 상태이므로 4개 텝 모두 닫는다.
        RightPanel.closeTabs();
      }
    }

    /**
     * quick launcher button의 tooltip을 os에 맞게 전달한다.
     * @returns {*}
     */
    function getQuickLauncherButtonTooltip() {
      return $filter('translate')(Browser.platform.isMac ? '@quick-launcher-tooltip-for-mac' : '@quick-launcher-tooltip-for-win');
    }

    /**
     * zoom in
     * @param {Event} clickEvent
     */
    function zoomIn(clickEvent) {
      clickEvent.stopPropagation();
      JndZoom.zoomIn();
    }

    /**
     * zoom out
     * @param {Event} clickEvent
     */
    function zoomOut(clickEvent) {
      clickEvent.stopPropagation();
      JndZoom.zoomOut();
    }

    /**
     * zoom reset
     * @param {Event} clickEvent
     */
    function zoomReset(clickEvent) {
      clickEvent.stopPropagation();
      JndZoom.zoomReset();
    }

    /**
     * team switch menu
     * @param {object} $event
     * @private
     */
    function _openTeamSwitchMenu($event) {
      // 팀 변경 메뉴 오픈시 body까지 이벤트가 전달되어 열린 후 바로 닫히지 않도록 처리한다.
      $event.stopPropagation();

      jndPubSub.pub('headerCtrl:teamSwitchOpen');
    }

    /**
     * 현재 사용중인 멤버정보 변경 이벤트 핸들러
     * @private
     */
    function _onCurrentMemberChanged() {
      $scope.intercomMember = memberService.getMember();
    }

    /**
     * intercom 언어를 설정함.
     * intercom 언어는 실시간으로 수정가능 하지만 'web_client'에서는 페이지 로드시 언어를 설정하므로 초기화 성격으로 수행되어야함.
     * @private
     */
    function _initializeIntercomLanguage() {
      var language = accountService.getAccountLanguage();

      if (language === 'zh-cn') {
        language = 'zh-CN'
      } else if (language === 'zh-tw') {
        language = 'zh-TW';
      }

      $scope.intercomLanguage = language;
    }
  }
})();
