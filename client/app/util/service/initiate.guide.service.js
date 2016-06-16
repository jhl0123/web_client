/**
 * @fileoverview application 초기 진입후 account정보를 전달받은 후(전체화면으로 출력되는 로딩휠이 사라진 후) 가이드를 제공하는 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('InitiateGuide', InitiateGuide);

  function InitiateGuide($rootScope, $q, AccountHasSeen, accountService, HybridAppHelper, modalHelper) {
    var _that = this;
    var _$scope = $rootScope.$new();
    var _defer = $q.defer();

    _that.show = show;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _attachScopeEvents();
    }

    /**
     * attach scope events
     * @private
     */
    function _attachScopeEvents() {
      _$scope.$on('accountService:setAccount', _onSetAccount);
    }

    /**
     * on set account event handler
     * @private
     */
    function _onSetAccount() {
      _defer.resolve();
    }

    /**
     * show guide modal
     */
    function show() {
      if (_defer) {
        _defer.promise.then(_show);
        if (accountService.getAccount()) {
          _defer.resolve();
        }
      }
    }

    /**
     * show guide modal
     * @private
     */
    function _show() {
      if (HybridAppHelper.isDeprecatedApp()) {
        modalHelper.openDeprecated({
          namespace: 'guide'
        });
      } else {
        if (_isOldUser()) {
          //기존 사용자면 welcome 은 생략한다
          AccountHasSeen.set('TUTORIAL_VER3_WELCOME', true);
        } else if (!AccountHasSeen.get('TUTORIAL_VER3_WELCOME')) {
          //초기 진입 시 모든 랜더링 동작을 완료한 이후 welcome 모달을 fade in 효과로 노출하기 위해 1초의 딜레이를 할당한다.
          modalHelper.openWelcome({
            namespace: 'guide'
          });
        }
      }

      _defer = null;
      _$scope.$destroy();
    }

    /**
     * tutorial 을 이미 시청한 기존 사용자인지 여부를 반환한다.
     * @private
     */
    function _isOldUser() {
      return AccountHasSeen.get('GUIDE_TOPIC_FOLDER') && AccountHasSeen.get('GUIDE_CONNECT') ;
    }
  }
})();
