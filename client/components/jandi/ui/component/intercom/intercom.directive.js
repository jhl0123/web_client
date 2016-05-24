/**
 * @fileoverview intercom dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandi.ui.component.intercom')
    .directive('intercom', intercom);

  function intercom($window, configuration) {
    return {
      restrict: 'A',
      scope: {
        member: '=intercomMember',
        language: '=intercomLanguage'
      },
      link: link
    };

    function link(scope, el) {
      // boot 수행 여부
      var _hasBoot = false;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _attachScopeEvents();
        _attachDomEvents()
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        scope.$watch('member', _onMemberChanged);
        scope.$watch('language', _onLanguageChanged);
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        el.on('click', _onIntercomOpen);
        $($window).unload(_onWindowUnload);
      }

      /**
       * 현재 멤버 정보가 바뀜 이벤트 핸들러
       */
      function _onMemberChanged() {
        _updateIntercom();
      }

      /**
       * 현재 사용하는 언어가 바뀜 이벤트 핸들러
       * @private
       */
      function _onLanguageChanged() {
        _updateIntercom();
      }

      /**
       * window unload 이벤트 핸들러
       * @private
       */
      function _onWindowUnload() {
        // 'web_client'에서 동작하는 intercom의 쿠키가 'web_landing'에 그대로 전달되어 잘못된 사용자 식별을 통해 유도하지 않은
        // 메세지가 'web_landing' intercom에 출력될 수 있으므로 쿠키를 삭제하는 shutdown을 호출한다.
        $window.Intercom("shutdown");
      }

      /**
       * intercom에 표현되는 사용자 정보 갱신
       * @private
       */
      function _updateIntercom() {
        if (!_hasBoot) {
          _hasBoot = true;
          $window.Intercom('boot',
            _.extend({app_id: configuration.intercom_app_id}, _getIntercomSetting())
          );
        } else {
          // intercom에 설정된 멤버정보를 갱신한다.
          $window.Intercom('update', _getIntercomSetting());
        }
      }

      /**
       * intercom 설정을 전달
       * @returns {{name: *, email: *, create_at: number, language_override: string}}
       * @private
       */
      function _getIntercomSetting() {
        var member = scope.member;
        var language = scope.language;

        return {
          app_id: configuration.intercom_app_id,
          name: member.name,
          email: member.u_email,
          create_at: new Date(member.createdAt).getTime(),
          language_override: language
        };
      }

      /**
       * intercom 열림 이벤트 핸들러
       * @private
       */
      function _onIntercomOpen() {
        $window.Intercom('show');
      }
    }
  }
})();
