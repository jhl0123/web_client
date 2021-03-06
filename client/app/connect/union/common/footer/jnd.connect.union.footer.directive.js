/**
 * @fileoverview union 공통 footer 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectUnionFooter', jndConnectUnionFooter);

  function jndConnectUnionFooter() {
    return {
      restrict: 'E',
      controller: 'JndConnectUnionFooterCtrl',
      scope: {
        data: '=jndData',
        current: '=jndCurrent'
      },
      link: link,
      replace: true,
      templateUrl: 'app/connect/union/common/footer/jnd.connect.union.footer.html'
    };

    function link(scope, el, attrs) {
      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        if (scope.current.union.name === 'incoming') {
          scope.hasLang = false;
        } else {
          scope.hasLang = true;
        }
      }
    }
  }
})();
