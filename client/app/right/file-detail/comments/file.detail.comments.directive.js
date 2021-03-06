/**
 * @fileoverview file detail의 comments directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailComments', fileDetailComments);

  /* @ngInject */
  function fileDetailComments($filter, $timeout, UserList, Dialog, FileDetail, jndPubSub, JndUtil, memberService) {
    return {
      require: '^fileDetailContent',
      restrict: 'E',
      replace: true,
      scope: {
        file: '=',
        comments: '=',
        errorComments: '=',
        isAdmin: '=',
        postComment: '&',
        onMemberClick: '='
      },
      templateUrl : 'app/right/file-detail/comments/file.detail.comments.html',
      link: link
    };

    function link(scope, el, attr, ctrl) {
      var _commentMap = {};

      scope.hasOwnComment = hasOwnComment;
      scope.starComment = starComment;
      scope.deleteComment = deleteComment;

      scope.retry = retry;
      scope.deleteSendingComment = deleteSendingComment;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _.each(scope.comments, function(comment) {
          // dropdown menu on/off 여부
          comment.extIsOpen = false;

          _commentMap[comment.id] = comment;
        });

        // comments가 rendering이 완료된 다음 file detail body element의 높이값을 재설정 해야한다.
        $timeout(function() {
          ctrl.resizeFileDetailBody();
        });

        _attachScopeEvents();
        _attachDomEvents();
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        scope.$on('jndWebSocketFile:commentCreated', _onCreateComment);
        scope.$on('jndWebSocketFile:commentDeleted', _onDeleteComment);
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        el.on('click', '.mention', _onMentionClick);
        el.on('mouseleave', '.comment-item', _onMouseLeave);
      }

      /**
       * mention click 이벤트 핸들러
       * @param {object} $event
       * @private
       */
      function _onMentionClick($event) {
        var jqTarget = $($event.currentTarget);
        var memberId;
        var user;

        // $apply를 호출하여 즉각 뷰에 반영하도록 한다.
        JndUtil.safeApply(scope, function() {
          memberId = jqTarget.attr('mention-view');
          if (user = UserList.get(memberId)) {
            scope.onMemberClick(user);
          }
        });
      }

      /**
       * mouse leave 이벤트 핸들러
       * @param {object} $event
       * @private
       */
      function _onMouseLeave($event) {
        var comment = _commentMap[$event.currentTarget.getAttribute('id')];

        if (comment && comment.extIsOpen === true) {
          JndUtil.safeApply(scope, function() {
            comment.extIsOpen = false;
          });
        }
      }

      /**
       * comment 소유했는지 여부를 전달한다.
       * @param {object} comment
       * @returns {boolean|string}
       */
      function hasOwnComment(comment) {
        var currentMemberId = memberService.getMemberId();
        return currentMemberId === comment.writerId || scope.isAdmin;
      }

      /**
       * comment 를 즐겨찾기한다.
       * @param {object} $event
       */
      function starComment($event) {
        $($event.target).parents('.comment-item-header__action').find('.comment-star i').trigger('click');
      }

      /**
       * postComment 실패한 comment를 재전송한다.
       * @param {number} index
       * @param {object} comment
       */
      function retry(index, comment) {
        deleteSendingComment(index);

        scope.postComment({
          $comment: comment.content.body,
          $sticker: comment.originSticker
        });
      }

      /**
       * postComment 실패한 comment를 삭제한다.
       * @param index
       */
      function deleteSendingComment(index) {
        scope.errorComments.splice(index, 1);
      }

      /**
       * comment 를 삭제한다.
       * @param {object} comment
       */
      function deleteComment(comment) {
        Dialog.confirm({
          body: $filter('translate')('@web-notification-body-messages-confirm-delete'),
          onClose: function (result) {
            if (result === 'okay') {
              _deleteComment(comment);
            }
          }
        });
      }

      /**
       * comment 를 삭제한다.
       * @param {object} comment
       * @private
       */
      function _deleteComment(comment) {
        var commentId = comment.id;
        var isSticker = comment.extIsSticker;

        if (isSticker) {
          FileDetail.deleteSticker(commentId)
            .success(_onSuccessDelete);
        } else {
          FileDetail.deleteComment(scope.file.id, commentId)
            .success(_onSuccessDelete);
        }
      }

      /**
       * 삭제 성공 event handler
       * @private
       */
      function _onSuccessDelete() {
        Dialog.success({
          title: $filter('translate')('@message-deleted')
        });
      }

      /**
       * comment 작성 event handler
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      function _onCreateComment(angularEvent, data) {
        if (_isCurrentFileEvent(data)) {
          jndPubSub.pub('fileDetail:updateComments');
        }
      }

      /**
       * comment 삭제 event handler
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      function _onDeleteComment(angularEvent, data) {
        if (_isCurrentFileEvent(data)) {
          jndPubSub.pub('fileDetail:updateComments');
        }
      }

      /**
       * 현재 file에 대한 event 인지 여부를 전달한다.
       * @param {object} data
       * @returns {boolean}
       * @private
       */
      function _isCurrentFileEvent(data) {
        return data.file.id == scope.file.id;
      }
    }
  }
})();
