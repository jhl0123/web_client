/**
 * @fileoverview file detail의 title directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailTitle', fileDetailTitle);

  /* @ngInject */
  function fileDetailTitle() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        file: '=',
        hasInitialLoaded: '=',
        isArchivedFile: '=',
        backToPrevState: '=',
        closeRightPanel: '='
      },
      templateUrl : 'app/right/file-detail/title/file.detail.title.html',
      link: angular.noop
    };
  }
})();
