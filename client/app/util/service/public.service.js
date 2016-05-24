/**
 *
 *        TODO: PLEASE MOVE EVERYTHING THAT IS RELATED TO 'MODAL' TO 'modal.service.js'
 *         4/9/2015 JiHoon
 *
 */
(function() {
  angular
    .module('jandiApp')
    .factory('publicService', publicService);

  /* @ngInject */
  function publicService($rootScope, accountService, storageAPIservice, jndWebSocket, jndPubSub, UserList,
                         currentSessionHelper, $state, analyticsService, language, RoomTopicList, EntityHandler,
                         HybridAppHelper, $filter, memberService, configuration) {
    var _isInit = false;
    var service = {
      getInviteOptions: getInviteOptions,
      closeModal: closeModal,
      setLanguageConfig: setLanguageConfig,
      setDebugMode: setDebugMode,
      signOut: signOut,
      getBrowserInfo: getBrowserInfo,
      redirectTo: redirectTo,
      redirectToMain: redirectToMain,
      redirectToSignIn: redirectToSignIn,
      isDisabledMember: isDisabledMember,
      isNullOrUndefined: isNullOrUndefined,
      goToDefaultTopic: goToDefaultTopic,
      adjustBodyWrapperHeight: adjustBodyWrapperHeight,
      hideInitialLoading: hideInitialLoading,
      showDummyLayout: showDummyLayout,
      hideDummyLayout: hideDummyLayout,
      reloadCurrentPage: reloadCurrentPage,
      openNewTab: openNewTab,
      setInitDone: setInitDone,
      isInitDone: isInitDone,
      hasFilePermission: hasFilePermission,
      isFileUnshared: isFileUnshared
    };

    return service;

    /**
     * 공통 sign-in 페이지로 redirect 한다.
     */
    function redirectToSignIn() {
      var languageMap = {
        'en': 'en',
        'ko': 'kr',
        'zh-cn': 'zh-cn',
        'zh-tw': 'zh-tw',
        'ja': 'jp'
      };
      var lang = language.getCurrentLanguage().serverLang || 'en';
      location.href = configuration.landing_address + languageMap[lang] + '/signin/?redirectUrl=' + location.href;
    }

    function getInviteOptions(joinedChannelList, privateGroupList, inviteeId) {
      var list = [];

      angular.forEach(joinedChannelList, function(entity) {
        var users = RoomTopicList.getUserIdList(entity.id);
        if (!_.contains(users, inviteeId))
          this.push(entity);
      }, list);

      angular.forEach(privateGroupList, function(entity) {
        var users = RoomTopicList.getUserIdList(entity.id);
        if (!_.contains(users, inviteeId))
          this.push(entity);
      }, list);

      return $filter('orderBy')(list, 'name');
    }

    function closeModal(modalInstance) {
      modalInstance.dismiss('close');
    }

    // Browser/OS may give us slightly different format for same language.
    // In such case, we reformat the language variable so that we can notify 'server' and 'translator' with correct language format.
    function setLanguageConfig(curLang) {
      language.setConfig(curLang);
    }

    // Setting debug mode for translator, nggettext
    function setDebugMode(isDebug) {
      language.setDebugMode(isDebug);
    }

    function signOut() {
      // There is no need to remove session storage, but still just in case.
      currentSessionHelper.clear();
      storageAPIservice.removeSession();
      storageAPIservice.removeLocal();
      storageAPIservice.removeCookie();

      analyticsService.removeMemberCookieMixpanel();
      analyticsService.removeAccountCookieMixpanel();

      accountService.removeAccount();

      // Disconnect socket connection.
      jndWebSocket.disconnectTeam();
      jndPubSub.hideLoading();
      hideDummyLayout();

      // PC app function.
      HybridAppHelper.onSignedOut();


      redirectToSignIn();
    }

    function getBrowserInfo() {
      $rootScope.isMobile = jQuery.browser.mobile;

      var userAgent = navigator.userAgent || navigator.vendor || window.opera;
      $rootScope.isAndroid = userAgent.match(/Android/i)=='Android';
    }
    function redirectTo(url) {
      // Direct to 'url'.
      location.href = url;
    }
    function redirectToMain() {
      redirectTo(configuration.main_address + 'team');
    }

    /**
     * member가 enable status 가 아니면 true를 리턴한다.
     * @param {number|object} member - 찾으려는 member
     * @returns {*}
     */
    function isDisabledMember(member) {
      if (member == null) {
        return false;
      }

      if (_isNumber(member)) {
        member = UserList.get(member);
      } else if (!member.status) {
        member = UserList.get(member.id);
      }

      return memberService.isDeactivatedMember(member);
    }

    function _isNumber(obj) {
      return typeof obj == 'number';
    }

    function isNullOrUndefined(value) {
      return typeof value === 'undefined' || value === null || angular.isUndefined(value);
    }

    function goToDefaultTopic() {
      $state.go('archives', {entityType:'channels',  entityId:currentSessionHelper.getDefaultTopicId() });
    }

    /**
     * 배너의 유무를 판단하여 '.body' 와 '.body-wrapper' 의 높이를 조절한다.
     * 기본값은 $(window).height() 이지만 배너가 있다면 배너의 높이만큼 작아저야 한다.
     * @param isBannerUp
     */
    function adjustBodyWrapperHeight(isBannerUp) {
      var jqBodyWrapper = $('.body-wrapper');
      var jqBody = $('.body');

      if (isBannerUp) {
        jqBodyWrapper.addClass('has-banner');
        jqBody.addClass('has-banner');
      } else {
        jqBodyWrapper.removeClass('has-banner');
        jqBody.removeClass('has-banner');
      }
    }

    /**
     * dummy layout 을 노출한다.
     */
    function showDummyLayout() {
      jndPubSub.pub('publicService:showDummyLayout');
    }

    /**
     * dummy layout 을 숨긴다
     */
    function hideDummyLayout() {
      hideInitialLoading();
      jndPubSub.pub('publicService:hideDummyLayout');
    }

    /**
     * 첫 진입 시 노출되는 전체 화면을 덮는 로딩 뷰를 숨긴다.
     */
    function hideInitialLoading() {
      jndPubSub.pub('publicService:hideInitialLoading');
    }

    /**
     * data initialize 가 완료 되었음을 설정한다
     */
    function setInitDone() {
      if (!_isInit) {
        _isInit = true;
        jndPubSub.pub('publicService:dataInitDone');
      }
    }

    /**
     * initialize 가 완료 되었는지 여부를 반환한다
     * @returns {boolean}
     */
    function isInitDone() {
      return _isInit;
    }

    /**
     * file 접근 권한이 존재하는지 여부를 반환 (MK의 server 로직을 그대로 가져 옴.)
     * @param {object} msg
     * @param {boolean} [isComment=false] - comment 의 경우 true 로 질의한다
     * @returns {boolean}
     * @private
     */
    function hasFilePermission(msg, isComment) {
      var message = isComment? msg.feedback : msg.message;
      var member = memberService.getMember();
      var hasCommonEntities = false;

      _.forEach(message.shareEntities, function(id) {
        if (EntityHandler.isExist(id)) {
          hasCommonEntities = true;
          return false;
        }
      });

      // 파일이 전체 공개인 경우
      if (message.permission % 10 > 0) {
        return true;
      }

      // 파일 작성자가 본인인 경우
      if (message.writerId === memberService.getMemberId()) {
        return true;
      }

      // 파일이 접근 가능한 entity에 공유된 경우
      if (hasCommonEntities) {
        return true;
      }

      return false;
    }

    /**
     * unshared 된 file 인지 여부를 반환한다
     * @param {object} msg
     * @param {boolean} [isComment=false] - comment 의 경우 true 로 질의한다
     * @returns {boolean}
     * @private
     */
    function isFileUnshared(msg, isComment) {
      var message = isComment? msg.feedback : msg.message;
      var currentEntityId = currentSessionHelper.getCurrentEntityId(true);
      var currentId = currentSessionHelper.getCurrentEntityId();
      return message.shareEntities.indexOf(currentEntityId) === -1 && message.shareEntities.indexOf(currentId) === -1;
    }

    /**
     * current page reload
     * @param {object} currentState
     * @param {object} params
     */
    function reloadCurrentPage(currentState, params) {
      //TODO: 현재 transitionTo 를 사용 시 profile modal 및 center panel L10N 이 제대로 설정되지 않아 location.reload 를 사용함.
      // 현재 state 다시 로드
      //$state.transitionTo(currentState, params, {
      //  reload: true,
      //  inherit: false,
      //  notify: true
      //});
      window.location.reload();
    }

    function openNewTab(url) {
      var open_link = window.open('', '_blank');
      open_link.location.href = url;
    }
  }
})();
