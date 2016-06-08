/**
 * @fileoverview message directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightMessageGroup', rightMessageGroup);

  /* @ngInject  */
  function rightMessageGroup() {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      templateUrl : 'app/right/messages/message-group/message.group.html',
      controller: 'RightMessageGroupCtrl'
    };
  }
})();
