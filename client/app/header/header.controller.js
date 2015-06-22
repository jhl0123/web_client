(function() {

  'use strict';

  angular
    .module('jandiApp')
    .controller('headerCtrl',headerCtrl);

  /* @ngInject */
  function headerCtrl($scope, $state, $filter, accountService,
                      memberService, publicService, configuration,
                      language, modalHelper, jndPubSub, DeskTopNotificationBanner, pcAppHelper) {
    var modalMap;
    var stateParams;

    _init();

    function _init() {
      DeskTopNotificationBanner.showNotificationBanner($scope);

      _initRightPanelButtonLabel();
      $scope.languageList = language.getLanguageList();
    }

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      _initRightPanelButtonLabel();
      stateParams = toParams;
    });

    $scope.onLanguageClick = onLanguageClick;

    function onLanguageClick(lang) {
      if (accountService.getAccountLanguage() == lang) return;

      var languageObj = {
        lang: lang
      };

      accountService.setAccountInfo(languageObj)
        .success(function(response) {
          accountService.setAccountLanguage(response.lang);
          publicService.getLanguageSetting(accountService.getAccountLanguage());
          publicService.setCurrentLanguage();

          pcAppHelper.onLanguageChanged(lang);

          _reloadCurrentPage($state.current, stateParams);

        })
        .error(function(err) {
          console.log(err)
        })
        .finally(function() {
        })
    }

    function _reloadCurrentPage(state, stateParams) {
      // 현재 state 다시 로드
      $state.transitionTo(state, stateParams, {
        reload: true,
        inherit: false,
        notify: true
      });

    }

    $scope.toTeam = toTeam;

    /**
     * 잔디 메인으로 보내면서 팀 리스트 페이지를 연다.
     */
    function toTeam() {
      publicService.redirectTo(configuration.main_address + 'team');
    }

    /**
     * 로그아웃 한다.
     */
    $scope.onSignOutClick = publicService.signOut;

    modalMap = {
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

    $scope.openModal = function(selector) {
      var fn;
      (fn = modalMap[selector]) && fn();
    };

    $scope.toggleLoading = function() {
      $scope.isLoading = !$scope.isLoading;
    };

    $scope.isUserAuthorized = function() {
      return memberService.isAuthorized($scope.user);
    };

    $scope.onShowTutorialClick = function() {
      jndPubSub.pub('initTutorialStatus');
    };

    $scope.onTutorialPulseClick = function($event) {
      jndPubSub.pub('onTutorialPulseClick', $event);
    };

    $scope.onRightPanelToggle = function() {
      if (_isRpanelVisible()) {
        $state.go('messages.detail');
      } else {
        var viewport = $('.msgs');
        var content = $('.msgs-holder');

        // scroll to bottom
        if (viewport.scrollTop() + viewport.height() >= content.height()) {
          setTimeout(function() {
            viewport.animate({scrollTop: content.height()}, 200);
          });
        }

        $state.go('messages.detail.files');
      }
    };

    function _initRightPanelButtonLabel() {
      $scope.isRpanelVisible = _isRpanelVisible();

      if ($scope.isRpanelVisible) {
        $scope.rPanelButtonLabel = $filter('translate')('@btn-close');
      } else {
        $scope.rPanelButtonLabel = $filter('translate')('@common-search');
      }
    }
    function _isRpanelVisible() {
      return $state.includes('**.files.**');
    }
  }
})();
