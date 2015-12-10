/**
 * @fileoverview file upload modal directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileUploadModal', fileUploadModal);

  function fileUploadModal($rootScope, $timeout, $state, modalHelper, AnalyticsHelper, EntityMapManager,
                           entityAPIservice, MentionExtractor, analyticsService) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el) {
      var PUBLIC_FILE = 744;    // PUBLIC_FILE code

      var fileUploadOptions = scope.fileUploadOptions;
      var fileUploader;
      var fileObject;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.upload = upload;
        scope.cancel = cancel;

        _setFilUploader();
      }

      /**
       * file upload를 수행하는 object를 설정한다.
       * @private
       */
      function _setFilUploader() {
        fileObject = fileUploadOptions.fileUploader.fileObject;
        if (fileUploadOptions.fileUploader.isUploadingStatus()) {
          // 현재 upload 중이고 이어서 upload함
          fileUploader = fileUploadOptions.fileUploader;
          fileUploader.updateUploadStatus();
        } else {
          // 최초 upload함
          fileUploader = fileUploadOptions.fileUploader.setOptions({
            // file api 제공 여부
            supportFileAPI: true,
            // file object convert
            convertFile: function(file) {
              if (file.comment) {
                scope.comment = file.comment;
              }

              return scope.file = file;
            },
            // fileInfo object convert
            convertFileInfo: function(file) {
              var fileInfo;

              if (file.isImage) {
                _createImgEle(scope, file);
              }

              fileInfo = {
                isPrivateFile: false,
                uploadType: file.uploadType,
                permission: PUBLIC_FILE,

                // file upload시 공유 대화방 수정 가능함.
                //roomId: scope.selectedEntity.entityId || scope.selectedEntity.id,
                share: scope.selectedEntityId,

                // file upload시 comment 수정 가능함.
                comment: scope.comment
              };

              // upload modal title 갱신, fileInfo에 title 설정
              $timeout(function() {
                $('#file_upload_title').val(fileInfo.title = file.name);
              }, 100);

              // upload modal currentEntity 갱신
              scope.selectedEntity = scope.selectedEntity;
              scope.selectedEntityId = scope.selectedEntity.id;

              $('#file_upload_comment').focus();

              return scope.fileInfo = fileInfo;
            },
            // upload sequence 시작
            onBegin: function() {
              scope.lastIndex = fileObject.size();
            },
            // 하나의 file upload 시작
            onUpload: function(file, fileInfo) {
              // 공유 entity id 와 comment는 최초 설정된 값에서 변경 가능하므로 재설정함
              //fileInfo.roomId = scope.selectedEntity.entityId || scope.selectedEntity.id;
              fileInfo.share = scope.selectedEntityId;

              fileInfo.comment = el.find('#file_upload_comment').val().trim();


              _setMentions(fileInfo);

              // scope comment 초기화
              scope.comment = '';

              _setCurrentProgressBar(file);
            },
            // 하나의 file upload 중
            onProgress: function(evt, file) {
              scope.lastIndex = fileObject.size();

              // set transition
              _setProgressBarStyle('progress');

              if (!$rootScope.curUpload.isAborted) {
                _setCurrentProgressBar(file, {
                  progress: parseInt(100.0 * evt.loaded / evt.total),
                  status: 'uploading'
                });
              }
            },
            // 하나의 file upload 완료
            onSuccess: function(response, index, length) {
              _setProgressBarStyle('success', index, length);
              $rootScope.curUpload.status = 'done';

              // analytics
              var share_target = "";
              var fileInfo = response.data.fileInfo;
              var topicType;

              switch (scope.selectedEntity.type) {
                case 'channels':
                  topicType = 'public';
                  share_target = "topic";
                  break;
                case 'privategroups':
                  topicType = 'private';
                  share_target = "private group";
                  break;
                case 'users':
                  topicType = 'users';
                  share_target = "direct message";
                  break;
                default:
                  topicType = 'invalid';
                  share_target = "invalid";
                  break;
              }
              try {
                AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_UPLOAD, {
                  'RESPONSE_SUCCESS': true,
                  'TOPIC_ID': scope.selectedEntity.id,
                  'FILE_ID': response.data.messageId
                });
              } catch (e) {
              }


              var file_meta = (response.data.fileInfo.type).split("/");

              var upload_data = {
                "entity type"   : share_target,
                "category"      : file_meta[0],
                "extension"     : response.data.fileInfo.ext,
                "mime type"     : response.data.fileInfo.type,
                "size"          : response.data.fileInfo.size
              };

              analyticsService.mixpanelTrack( "File Upload", upload_data );
            },
            // 하나의 file upload error
            onError: function(err, index, length) {
              var property = {};
              var PROPERTY_CONSTANT = AnalyticsHelper.PROPERTY;

              //analytics
              try {
                AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_UPLOAD, {
                  'RESPONSE_SUCCESS': false,
                  'ERROR_CODE': err.code
                });
              } catch (e) {

              }

              _setProgressBarStyle('error', index, length);

              $rootScope.curUpload.status = $rootScope.curUpload.isAborted ? 'abort' : 'error';
              $rootScope.curUpload.hasError = true;
              $rootScope.curUpload.progress = 0;
            },
            // upload confirm end
            onConfirmEnd: function(index, length) {
              modalHelper.closeModal();

              if (_isUploadEnd(index, length)) {
                fileUploadOptions.onEnd();
              }
            },
            // upload sequence end
            onEnd: fileUploadOptions.onEnd
          });
        }
      }

      /**
       * image파일 upload시 upload modal에 보여지는 미리보기 용 dataUrl 생성한다.
       */
      function _createImgEle(scope, file) {
        var fileReader;

        if (file.dataUrl) {
          scope.dataUrl = '';
          $timeout(function() {
            scope.$apply(function(scope) {
              scope.dataUrl = file.dataUrl;
            });
          });
        } else {
          fileReader = new window.FileReader();

          scope.dataUrl = '';
          fileReader.onload = function(e) {
            scope.$apply(function(scope) {
              scope.dataUrl = e.target.result;
            });
          };
          fileReader.readAsDataURL(file);
        }
      }

      /**
       * 현재 progress bar를 설정한다.
       * @param {object} file
       * @param {object} options
       * @private
       */
      function _setCurrentProgressBar(file, options) {
        var curUpload = {
          lFileIndex: fileUploader.lastProgressIndex,
          cFileIndex: fileUploader.currentProgressIndex,
          title: file.name,
          progress: 0,
          status: 'initiate'
        };

        $rootScope.curUpload = _.extend(curUpload, options);
      }

      /**
       * 마지막 file upload confirm이 진행 되었고, 더이상 upload를 진행하지 않는지 여부를 전달한다.
       * @param {number} index
       * @param {number} length
       * @returns {boolean}
       * @private
       */
      function _isUploadEnd(index, length) {
        return index === length && $rootScope.curUpload && $rootScope.curUpload.status === 'done';
      }

      /**
       * progress bar의 style을 설정한다.
       * @param {string} type - 설정 type
       * @param {number} index - 현재 upload되는 file의 index
       * @param {number} length - upload 되는 file의 length
       */
      function _setProgressBarStyle(type, index, length) {
        var jqProgressBar = $('.progress-striped').children();

        // progress bar 100% 상태에서 다음 file을 upload 위해 progress bar 0%로 변경시
        // transition style 적용되어 animation 들어가는 것을 방지 하기위해 confirm done
        // 일때 transition 적용을 잠시 해제함.
        if (index !== length) {
          if (type === 'success') {
            jqProgressBar.removeClass('animation-progress-bar');
          } else {
            jqProgressBar.css('width', 0).removeClass('animation-progress-bar');
          }
        } else if (type === 'progress') {

          // progress bar animation 효과 설정
          jqProgressBar.addClass('animation-progress-bar');
        }
      }

      /**
       * 업로드 하는 파일에 대한 mention정보를 설정한다.
       * @param {object} fileInfo
       * @private
       */
      function _setMentions(fileInfo) {
        var room;
        var users;
        var mentionList;
        var mentionMap;
        var mention;

        //if (room = EntityMapManager.get('total', fileInfo.roomId)) {
        if (room = EntityMapManager.get('total', fileInfo.share)) {
          users = entityAPIservice.getUserList(room);

          if (users && users.length > 0) {
            mentionList = MentionExtractor.getMentionListForTopic(users, $state.params.entityId);
            mentionMap = MentionExtractor.getSingleMentionItems(mentionList);
            //if (mention = MentionExtractor.getMentionAllForText(fileInfo.comment, mentionMap, fileInfo.roomId)) {
            if (mention = MentionExtractor.getMentionAllForText(fileInfo.comment, mentionMap, fileInfo.share)) {
              fileInfo.comment = mention.msg;
              fileInfo.mentions = mention.mentions;
            }
          }
        }
      }

      /**
       * file upload
       */
      function upload() {
        fileUploader.upload(true);
      }

      /**
       * file upload cancel
       */
      function cancel() {
        fileUploader.upload(false);
      }
    }
  }
})();
