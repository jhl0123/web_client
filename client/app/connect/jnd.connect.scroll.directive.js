/**
 * @fileoverview 잔디 컨넥트 스크롤 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectScroll', jndConnectScroll);

  function jndConnectScroll(jndPubSub) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el, attrs) {
      var SCROLL_THRESHOLD = 48;
      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        _attachDomEvents();
        jndPubSub.pub('jndConnectScroll:hideHeaderNav');
        scope.$on('$destroy', _onDestroy);
      }

      /**
       * dom event 를 바인딩한다.
       * @private
       */
      function _attachDomEvents() {
        el.on('scroll', _onScroll)
      }

      /**
       * scroll 이벤트 핸들러
       * @param {object} scrollEvent
       * @private
       */
      function _onScroll(scrollEvent) {
        var jqTarget = $(scrollEvent.target);
        var scrollTop = jqTarget.scrollTop();
        if (scrollTop > SCROLL_THRESHOLD) {
          _showNav();
        } else {
          _hideNav();
        }
      }

      /**
       * 상단 navigation 을 노출한다.
       * @private
       */
      function _showNav() {
        jndPubSub.pub('jndConnectScroll:showHeaderNav');
      }

      /**
       * 상단 navigation 을 감춘다.
       * @private
       */
      function _hideNav() {
        jndPubSub.pub('jndConnectScroll:hideHeaderNav');
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        jndPubSub.pub('jndConnectScroll:hideHeaderNav');
      }
    }
  }
})();
