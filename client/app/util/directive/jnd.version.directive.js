/**
 * @fileoverview jandi version
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndVersion', jndVersion);


  function jndVersion(configuration) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/util/directive/jnd.version.html',
      link: link
    };
    function link(scope, el, attr) {
      var version = configuration.version;
      scope.isAlpha = version.indexOf('alpha') !== -1;
      scope.version = version;
    }
  }
})();
