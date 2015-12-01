/**
 * @fileoverview file detail의 comment input directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailCommentInput', fileDetailCommentInput);

  /* @ngInject */
  function fileDetailCommentInput($rootScope, $filter, EntityMapManager, entityAPIservice, memberService, jndKeyCode,
                                  jndPubSub, JndMessageStorage) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        file: '=',
        hasInitialLoaded: '=',
        postComment: '&',
        setMentionsGetter: '&',
        onUserClick: '='
      },
      templateUrl : 'app/right/file.detail/comment_input/file.detail.comment.input.html',
      link: link
    };

    function link(scope) {
      var jqCommentInput = $('#file-detail-comment-input');

      var stickerType = 'file';
      var sticker;

      var timerScrollBottom;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.createComment = createComment;
        scope.onKeyUp = onKeyUp;

        _initComment();

        _setProfileImage(memberService.getMember());

        _attachEvents();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$on('$destroy', _onDestroy);
        scope.$on('window:unload', _onWindowUnload);

        scope.$on('setCommentFocus', _onFocusInput);
        scope.$on('onChangeSticker:' + stickerType, _onChangeSticker);

        scope.$on('rightFileDetailOnFileDeleted', _onRightFileDetailOnFileDeleted);
        scope.$on('updateMemberProfile', _onUpdateMemberProfile);

        scope.$on('elasticResize:comment', _onElasticResize);

        scope.$on('room:memberAdded', _onMemberUpdate);
        scope.$on('room:memberDeleted', _onMemberUpdate);

        scope.$watch('file', _onFileChange);
        scope.$watch('getMentions', _onGetMentionChange);
      }

      function _onGetMentionChange(value) {
        scope.setMentionsGetter({
          $getter: value
        });
      }

      /**
       * comment 를 posting 한다.
       */
      function createComment() {
        var comment = jqCommentInput.val().trim();

        if (comment || sticker) {
          _hideSticker();

          _clearWithFocus();

          scope.postComment({
            $comment: comment,
            $sticker: sticker
          });
        } else if (comment === '') {
          _clearWithFocus();
        }
      }

      /**
       * keyDown event handler
       * @param keyUpEvent
       */
      function onKeyUp(keyUpEvent) {
        if (jndKeyCode.match('ESC', keyUpEvent.keyCode)) {
          _hideSticker();
        }
      }

      /**
       * focus input event handler
       * @private
       */
      function _onFocusInput() {
        _focusInput();
      }

      /**
       * comment input element에 focus
       * @private
       */
      function _focusInput() {
        jqCommentInput.focus();
      }

      /**
       * 입력할 sticker 변경 event handler
       * @param angularEvent
       * @param item
       * @private
       */
      function _onChangeSticker(angularEvent, item) {
        if (sticker = item) {
          setTimeout(_focusInput);
        }
      }

      /**
       * 스티커 레이어를 숨긴다.
       * @private
       */
      function _hideSticker() {
        jndPubSub.pub('deselectSticker:' + stickerType);
      }

      /**
       * scope 의 $destroy 이벤트 발생 시 event handler
       * @private
       */
      function _onDestroy() {
        _saveCommentInput();
      }

      /**
       * window unload event handler
       * @private
       */
      function _onWindowUnload() {
        _saveCommentInput();
      }

      /**
       * comment input의 값을 webstorage에 저장한다.
       * @private
       */
      function _saveCommentInput() {
        scope.file && JndMessageStorage.setCommentInput(scope.file.id, jqCommentInput.val());
      }

      /**
       * topic member update event handler
       * @private
       */
      function _onMemberUpdate() {
        jndPubSub.pub('fileDetail:updateFile');
      }

      /**
       * comment input의 초기 설정한다.
       * @private
       */
      function _initComment() {
        if ($rootScope.setFileDetailCommentFocus) {
          $rootScope.setFileDetailCommentFocus = false;

          _focusInput();
        }

        $('#file-detail-comment-input').val(JndMessageStorage.getCommentInput(scope.file.id));
      }

      /**
       * 현재 사용자의 profile image를 설정한다.
       * @param {object} member
       * @private
       */
      function _setProfileImage(member) {
        scope.profileImage = $filter('getSmallThumbnail')(member);
      }

      /**
       * updateMemberProfile 이벤트 발생시 event handler
       * @param {object} angularEvent
       * @param {{event: object, member: object}} data
       * @private
       */
      function _onUpdateMemberProfile(angularEvent, data) {
        var currentMember = memberService.getMember();
        var member = data.member;
        var id = member.id;

        if (currentMember.id === id) {
          _setProfileImage(member);
        }
      }

      /**
       * file 삭제 event handler
       * @param angularEvent
       * @param param
       * @private
       */
      function _onRightFileDetailOnFileDeleted(angularEvent, param) {
        var deletedFileId = param.file.id;

        if (scope.file.id == deletedFileId) {
          JndMessageStorage.removeCommentInput(deletedFileId);
        }
      }

      /**
       * elastic resize event handler
       * @private
       */
      function _onElasticResize() {
        var jqFileDetail = $('.file-detail');

        clearTimeout(timerScrollBottom);
        if (jqFileDetail[0] && jqFileDetail.height() + jqFileDetail.scrollTop() >= jqFileDetail[0].scrollHeight) {
          timerScrollBottom = setTimeout(function() {
            jqFileDetail.scrollTop(jqFileDetail[0].scrollHeight);
          }, 100);
        }
      }

      /**
       * comment input의 값을 초기화하고 focus를 설정한다.
       * @private
       */
      function _clearWithFocus() {
        setTimeout(function() {
          jqCommentInput.val('').focus()[0].removeAttribute('style');
        });
      }

      /**
       * file change event handler
       * @param {object} file
       * @private
       */
      function _onFileChange(file) {
        _setMentionMembers(file);
      }

      /**
       * mention 가능한 member 설정한다.
       * @param {object} file
       * @private
       */
      function _setMentionMembers(file) {
        var currentMemberId = memberService.getMemberId();
        var sharedEntities;
        var mentionMembers;

        if (file) {
          sharedEntities = file.shareEntities;
          mentionMembers = [];

          _.each(sharedEntities, function(sharedEntity) {
            var entity = EntityMapManager.get('total', sharedEntity);
            var users;

            if (entity && /channels|privategroups/.test(entity.type)) {
              users = entityAPIservice.getUserList(entity);
              _.each(users, function(userId) {
                var user = EntityMapManager.get('user', userId);
                if (user && currentMemberId !== user.id && user.status === 'enabled') {
                  user.extViewName = '[@' + user.name + ']';
                  user.extSearchName = user.name;
                  mentionMembers.push(user);
                }
              });
            }
          });

          // 공유된 room 마다 mention 가능한 member를 설정함
          mentionMembers = _.chain(mentionMembers).uniq('id').sortBy(function (item) {
            return item.name.toLowerCase();
          }).value();

          jndPubSub.pub('mentionahead:comment', mentionMembers);
        }
      }
    }
  }
})();
