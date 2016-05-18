/**
 * @fileoverview 파일 관련 소켓 이벤트를 처리한다.
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketFile', jndWebSocketFile);

  /* @ngInject */
  function jndWebSocketFile(jndPubSub, memberService, jndWebSocketCommon) {
    var FILE_CREATED = 'file_created';
    var FILE_IMAGE = 'file_image';
    var FILE_IMAGE_ERROR = 'file_image_error';
    var FILE_SHARED = 'file_shared';
    var FILE_UNSHARED = 'file_unshared';
    var FILE_DELETED = 'file_deleted';
    var FILE_COMMENT_CREATED = 'file_comment_created';
    var FILE_COMMENT_DELETED = 'file_comment_deleted';

    var FILE_EXTERNAL_SHARED = 'file_external_shared';
    var FILE_EXTERNAL_UNSHARED = 'file_external_unshared';

    var events = [
      {
        name: FILE_CREATED,
        version: 1,
        handler: _onFileCreated
      },
      {
        name: FILE_IMAGE_ERROR,
        version: 1,
        handler: _onFileImageError
      },
      {
        name: FILE_SHARED,
        version: 1,
        handler: _onFileShared
      },
      {
        name: FILE_UNSHARED,
        version: 1,
        handler: _onFileUnshared
      },
      {
        name: FILE_DELETED,
        version: 1,
        handler: _onFileDeleted
      },
      {
        name: FILE_COMMENT_CREATED,
        version: 1,
        handler: _onFileCommentCreated
      },
      {
        name: FILE_COMMENT_DELETED,
        version: 1,
        handler: _onFileCommentDeleted
      },
      {
        name: FILE_EXTERNAL_SHARED,
        version: 1,
        handler: _onFileExternalShared
      },
      {
        name: FILE_EXTERNAL_UNSHARED,
        version: 1,
        handler: _onFileExternalUnshared
      }
    ];

    this.getEvents = getEvents;

    function getEvents() {
      return events;
    }

    function _onFileCreated(data) {
    }

    /**
     * image file에 대한 thumbnail 생성실패 socket event
     * @param {object} data
     * @private
     */
    function _onFileImageError(data) {
      jndPubSub.pub('errorThumbnailImage', data);
    }

    function _onFileShared(data) {
      jndPubSub.pub('fileShared', data);
    }

    /**
     * 파일이 공유되었을때
     * @param data
     * @private
     */
    function _onFileUnshared(data) {
      jndPubSub.pub('fileUnshared', data);
    }

    /**
     * 파일이 지워졌을 때
     * @param data
     * @private
     */
    function _onFileDeleted(data) {
      jndPubSub.pub('rightFileOnFileDeleted', data);
      jndPubSub.pub('rightFileDetailOnFileDeleted', data);
      jndPubSub.pub('centerOnFileDeleted', data);
    }

    /**
     * 파일에 코멘트가 달렸을 때 
     * @param {object} socketEvent
     * @private
     */
    function _onFileCommentCreated(socketEvent) {
      var comment = socketEvent.comment;
      var linkId = comment.linkId;
      comment.shareEntities = _.uniq(comment.shareEntities);
      if (jndWebSocketCommon.isActionFromMe(socketEvent.writer)) {
        _.forEach(comment.shareEntities, function(roomId) {
          jndWebSocketCommon.updateMyLastMessageMarker(roomId, linkId);
        });
      } else {
        _.forEach(comment.shareEntities, function(roomId) {
          jndWebSocketCommon.increaseBadgeCount(roomId);
        });
      }
      jndPubSub.pub('jndWebSocketFile:commentCreated', socketEvent);
    }

    /**
     * 파일에 달린 코멘트가 지워졌을 때
     * @param socketEvent
     * @private
     */
    function _onFileCommentDeleted(socketEvent) {
      var comment = socketEvent.comment;
      var linkId = comment.linkId;
      
      _.forEach(comment.shareEntities, function(roomId) {
        if (memberService.isUnreadMessage(roomId, linkId)) {
          jndWebSocketCommon.decreaseBadgeCount(roomId);
        }
      });
      
      jndPubSub.pub('jndWebSocketFile:commentDeleted', socketEvent);
    }

    /**
     * 파일 외부링크 공유설정
     * @param {object} socketEvent
     * @private
     */
    function _onFileExternalShared(socketEvent) {
    }

    /**
     * 파일 외부링크 공유해제
     * @param {object} socketEvent
     * @private
     */
    function _onFileExternalUnshared(socketEvent) {
    }
  }
})();
