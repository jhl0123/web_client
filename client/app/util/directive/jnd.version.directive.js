/**
 * @fileoverview jandi version
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndVersion', jndVersion);


  function jndVersion(JndVersion) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/util/directive/jnd.version.html',
      link: link
    };
    function link(scope, el, attr) {
      scope.isShow = JndVersion.isShow;
      scope.version = JndVersion.versionText;
    }
  }
})();
