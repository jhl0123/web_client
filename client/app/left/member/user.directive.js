(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('currentUser', currentUser);

  function currentUser() {
    return {
      link: link,
      scope: true,
      restrict: 'EA',
      replace: true,
      templateUrl: 'app/left/member/member.html',
      controller: 'currentMemberCtrl'
    };
    function link() {

    }
  }
})();