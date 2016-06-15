/**
 * @fileoverview center panel
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerPanel', centerPanel);

  function centerPanel(JndVersion) {
    return {
      restrict: 'E',
      scope: true,
      controller: 'CenterPanelCtrl',
      link: link,
      templateUrl: 'app/center/center.panel.html'
    };

    function link(scope, el, attrs) {
      if (JndVersion.isDev) {
        el.find('.msgs').addClass('dev');
      }
    }
  }
})();
