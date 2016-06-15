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
      $scope.downloadLink = HybridAppHelper.isMacApp() ?
        'http://bit.ly/jandimac' :
        'https://d1fxzwizdp8gty.cloudfront.net/download/JANDISetup.exe';
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
