/**
 * @fileoverview deprecated modal controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('DeprecatedCtrl', DeprecatedCtrl);

  function DeprecatedCtrl($scope, HybridAppHelper, modalHelper) {
    $scope.close = close;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      if (HybridAppHelper.isMacApp()) {
        $scope.updateDesc = '@macapp-update-desc';
        $scope.downloadLink = 'https://d1fxzwizdp8gty.cloudfront.net/download/JANDI.dmg';
      } else {
        $scope.updateDesc = '@winapp-update-desc';
        $scope.downloadLink = 'https://d1fxzwizdp8gty.cloudfront.net/download/JANDI.exe';
      }
    }

    /**
     * modal close
     */
    function close() {
      modalHelper.closeModal({
        namespace: 'guide'
      });
    }
  }
})();
