/**
 * @fileoverview deprecated modal controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('DeprecatedCtrl', DeprecatedCtrl);

  function DeprecatedCtrl($scope, modalHelper) {
    $scope.close = close;
    $scope.onDownloadClick = onDownloadClick;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
    }

    /**
     * modal close
     */
    function close() {
      modalHelper.closeModal({
        namespace: 'announcement'
      });
    }

    /**
     * download click
     */
    function onDownloadClick() {
      window.open('http://bit.ly/jandimac', '_self');
      close();
    }
  }
})();
