/**
 * @fileoverview file detail의 header directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailHeader', fileDetailHeader);

  /* @ngInject */
  function fileDetailHeader($state, $filter, AnalyticsHelper, analyticsService, Dialog, fileAPIservice, jndPubSub,
                            modalHelper, RightPanel) {
    return {
      require: '^fileDetailContent',
      restrict: 'E',
      replace: true,
      scope: {
        file: '=',
        downloadUrl: '=',
        originalUrl: '=',
        isArchivedFile: '=',
        isInvalidRequest: '=',
        isAdmin: '=',
        isIntegrateFile: '=',
        onMemberClick: '=',
        backToPrevState: '='
      },
      templateUrl : 'app/right/file-detail/header/file.detail.header.html',
      link: link
    };

    function link(scope, el, attrs, ctrl) {
      scope.isStarred = undefined;
      scope.isFileOwner = undefined;

      scope.backToFileList = backToFileList;
      scope.onClickDownload = onClickDownload;
      scope.onClickShare = onClickShare;
      scope.onCommentFocusClick = onCommentFocusClick;
      scope.onStarClick = onStarClick;
      scope.onFileDeleteClick = onFileDeleteClick;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        ctrl.setJqHeader(el);

        if (!scope.isInvalidRequest) {
          scope.isStarred = scope.file.isStarred;
          scope.isFileOwner = $filter('isFileWriter')(scope.file);

          _attachScopeEvents();
        }
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        scope.$on('externalFile:fileShareChanged', _onFileShareChanged);
      }

      /**
       * 외부 파일공유 상태 변경 이벤트 핸들러
       * @param {object} $event
       * @param {object} data
       * @private
       */
      function _onFileShareChanged($event, data) {
        var file = scope.file;

        if (file.id === data.id) {
          file.content.externalUrl = data.content.externalUrl;
          file.content.externalCode = data.content.externalCode;
          file.content.externalShared = data.content.externalShared;
        }
      }

      /**
       * download click event handler
       * @param {object} file
       */
      function onClickDownload() {
        var file = scope.file;

        // analytics
        var file_meta = (file.content.type).split("/");
        var download_data = {
          "category": file_meta[0],
          "extension": file.content.ext,
          "mime type": file.content.type,
          "size": file.content.size
        };
        analyticsService.mixpanelTrack("File Download", download_data);
      }

      /**
       * share click event handler
       * @param file
       */
      function onClickShare() {
        var file = scope.file;

        modalHelper.openFileShareModal(scope, file);
      }

      /**
       * focus click event handler
       */
      function onCommentFocusClick() {
        jndPubSub.pub('setCommentFocus');
      }

      /**
       * star click trigger
       */
      function onStarClick() {
        setTimeout(function() {
          $('.file-detail').find('.star-btn').trigger('click');
        });
      }

      /**
       * file delete click event handler
       * @param fileId
       */
      function onFileDeleteClick() {
        Dialog.confirm({
          body: $filter('translate')('@file-delete-confirm-msg'),
          allowHtml: true,
          onClose: function(result) {
            result === 'okay' && _requestFileDelete();
          }
        });
      }

      /**
       * request file delete
       * @private
       */
      function _requestFileDelete() {
        var fileId = scope.file.id;

        fileAPIservice.deleteFile(fileId)
          .success(function() {
            _successFileDelete();

            try {
              //analytics
              AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, {
                'RESPONSE_SUCCESS': true,
                'FILE_ID': fileId
              });
            } catch (e) {}
          })
          .error(function(err) {
            try {
              //analytics
              AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, {
                'RESPONSE_SUCCESS': false,
                'ERROR_CODE': err.code
              });
            } catch (e) {}
          });
      }

      /**
       * success file delete
       * @private
       */
      function _successFileDelete() {
        var file = scope.file;
        scope.isArchivedFile = true;

        Dialog.success({
          title: $filter('translate')('@success-file-delete').replace('{{filename}}', file.content.title)
        });

        jndPubSub.pub('onFileDeleted', file.id);
      }

      /**
       * Redirect user back to file list.
       */
      function backToFileList() {
        $state.go('messages.detail.' + (RightPanel.getTail() || 'files'));
      }
    }
  }
})();
