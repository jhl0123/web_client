/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectJira', jndConnectJira);

  function jndConnectJira() {
    return {
      restrict: 'E',
      scope: false,
      controller: 'JndConnectJiraCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/union/jira/jnd.connect.jira.html'
    };

    function link(scope, el, attrs) {

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {

      }

    }
  }
})();