/**
 * @fileoverview profile image controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('ProfileImageCtrl', ProfileImageCtrl);

  /* @ngInject */
  function ProfileImageCtrl($scope, $modalInstance, options) {

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.imageData = {
        value: options.imageData
      };
      $scope.isCharacter = options.type === 'character';

      $scope.onProfileImageChange = options.onProfileImageChange;

      $scope.onDone = onDone;
      $scope.onCancel = onCancel;
    }

    /**
     * 완료 이벤트 핸들러.
     */
    function onDone() {
      $scope.onProfileImageChange($scope.imageData.value);

      $modalInstance.close();
    }

    /**
     * 취소 이벤트 핸들러.
     */
    function onCancel() {
      $modalInstance.close();
    }
  }
})();
