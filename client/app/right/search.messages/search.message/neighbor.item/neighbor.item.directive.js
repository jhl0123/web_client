(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('neighborItem', neighborItem)
    .controller('neighborItemCtrl', neighborItemCtrl);

  function neighborItem() {
    return {
      restrict: 'EA',
      scope: {
        message: "=",
        query: "="
      },
      replace: true,
      link: link,
      templateUrl : 'app/right/search.messages/search.message/neighbor.item/neighbor.item.html',
      controller: 'neighborItemCtrl'
    };
  }

  function link(scope, element, attrs) {

  }

  /* @ngInject */
  function neighborItemCtrl($scope, $timeout) {
    var message = $scope.message;

    var STATUS_SHARED = 'shared';
    var STATUS_UNSHARED = 'unshared';
    var TYPE_COMMENT = 'comment';

    $scope.isFile = isFile();
    $scope.isShared = isShared();
    $scope.isUnShared = isUnShared();
    $scope.isComment = isComment();

    (function() {
      if (!!$scope.query) {
        highlightText($scope.query);
      }
    })();

    if ($scope.query) {
    }

    function highlightText(text) {
      $timeout(function() {
        $('.current .message-content').highlight(text);
      }, 50)
    }

    function isFile() {
      return message.type != 'text';
    }
    function isShared() {
      return message.status == STATUS_SHARED;
    }
    function isUnShared() {
      return message.status == STATUS_UNSHARED;
    }
    function isComment() {
      return message.type == TYPE_COMMENT;
    }
  }

})();