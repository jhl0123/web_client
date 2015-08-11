/**
 * @fileoverview file controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('FileCtrl', FileCtrl);

  /* @ngInject */
  function FileCtrl($scope, $rootScope, $state, $filter, EntityMapManager, publicService, fileAPIservice, FileData, messageAPIservice, memberService) {
    _init();

    // First function to be called.
    function _init() {
      // file controller�� ���޵Ǵ� data�� tab(file, star, mention)���� ���� �ٸ��Ƿ� message data��
      // file controller���� ��밡���� data format���� convert��
      var file = $scope.file = FileData.convert($scope.fileType, $scope.fileData);

      $scope.file.extWriter = $scope.writer = EntityMapManager.get('total', file.writerId);

      $scope.writerName = $scope.writer.name;
      $scope.profileImage = $filter('getSmallThumbnail')($scope.writer);
      $scope.createDate = $filter('getyyyyMMddformat')(file.createdAt);
      $scope.commentCount = file.commentCount;
      $scope.contentTitle = file.contentTitle;

      $scope.isStarred = file.isStarred || false;

      $scope.onFileCardClick = onFileCardClick;

      $scope.onOpenShareModal = onOpenShareModal;
      $scope.isDisabledMember = isDisabledMember;
      $scope.onFileDeleteClick = onFileDeleteClick;
      $scope.setCommentFocus = setCommentFocus;
    }

    /**
     * open share modal
     */
    function onOpenShareModal() {
      fileAPIservice.openFileShareModal($scope, $scope.file);
    }

    /**
     * file card click event handler
     */
    function onFileCardClick() {
      var memberId = memberService.getMemberId();

      if ($scope.file.writerId === memberId) {
        // ������ �ۼ��� file �̶�� �׻� ��ȸ ����

        $state.go($scope.file.type + 's', {userName: $scope.writerName, itemId: $scope.file.id});
      } else {
        messageAPIservice.getMessage($scope.fileData.teamId, $scope.file.id)
          .success(function() {
            // �ش� file�� ���ٱ����� ����

            $state.go($scope.file.type + 's', {userName: $scope.writerName, itemId: $scope.file.id});
          })
          .error(function() {
            alert($filter('translate')('@common-leaved-topic'));
          })
      }
    }

    /**
     * disabled member ����
     * @returns {*|boolean|*}
     */
    function isDisabledMember() {
      return publicService.isDisabledMember($scope.file.extWriter);
    }

    /**
     * delete file click event handler
     */
    function onFileDeleteClick() {
      var fileId = $scope.file.id;

      if (!confirm($filter('translate')('@file-delete-confirm-msg'))) {
        return;
      }

      fileAPIservice.deleteFile(fileId)
        .success(function() {
          try {
            //analytics
            AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, {
              'RESPONSE_SUCCESS': true,
              'FILE_ID': fileId
            });
          } catch (e) {
          }

          $rootScope.$broadcast('onFileDeleted', fileId);
        })
        .error(function(err) {
          console.log(err);
          try {
            //analytics
            AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, {
              'RESPONSE_SUCCESS': false,
              'ERROR_CODE': err.code
            });
          } catch (e) {
          }
        });
    }

    /**
     * focus to comment area
     */
    function setCommentFocus() {
      if ($state.params.itemId != $scope.file.id) {
        $rootScope.setFileDetailCommentFocus = true;

        $state.go('files', {
          userName    : $scope.writerName,
          itemId      : $scope.file.id
        });
      } else {
        fileAPIservice.broadcastCommentFocus();
      }
    }
  }
})();
