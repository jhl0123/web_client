/**
 * @fileoverview crop image dicrective
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .directive('cropImage', cropImage);
  
  function cropImage() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        imageData: '='
      },
      templateUrl : 'components/jandi/ui/component/profile-image/crop-image/crop.image.html',
      link: link
    };
    
    function link(scope, el) {
      _init();
      
      /**
       * init
       * @private
       */
      function _init() {
        scope.originImageData = scope.imageData.value;
      }
    }
  }
})();
