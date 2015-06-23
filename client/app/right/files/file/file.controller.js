(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('fileCtrl', fileCtrl);

  function fileCtrl($scope, $rootScope, $filter, $timeout, $state, entityheaderAPIservice, fileAPIservice, analyticsService, publicService, entityAPIservice) {
    var file;

    file = $scope.file;

    $scope.onFileItemClick = onFileItemClick;
    $scope.onFileDeleteClick = onFileDeleteClick;
    $scope.setCommentFocus = setCommentFocus;
    $scope.isIntegrateFile = fileAPIservice.isIntegrateFile(file.content.serverUrl);

    function onFileItemClick() {
      fileAPIservice.tempFileRequest = $scope.fileRequest;
      $state.go('files', {userName: file.writer.name, itemId: file.id});
    }

    function onFileDeleteClick() {
      var fileId = file.id;

      if (!confirm($filter('translate')('@file-delete-confirm-msg'))) {
        return;
      }

      fileAPIservice.deleteFile(fileId)
        .success(function(response) {
          $rootScope.$broadcast('onFileDeleted', fileId);
        })
        .error(function(err) {
          console.log(err);
        })
        .finally(function() {

        });
    }

    function setCommentFocus() {
      if ($state.params.itemId != file.id) {
        $rootScope.setFileDetailCommentFocus = true;

        $state.go('files', {
          userName    : file.writer.name,
          itemId      : file.id
        });
      } else {
        fileAPIservice.broadcastCommentFocus();
      }
    }
  }
})();
