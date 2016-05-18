/**
 * @fileoverview file detail의 comment input directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailCommentInput', fileDetailCommentInput);

  /* @ngInject */
  function fileDetailCommentInput($rootScope, jndKeyCode, JndMessageStorage, jndPubSub, Mentionahead, memberService) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        file: '=',
        hasInitialLoaded: '=',
        postComment: '&',
        setMentionsGetter: '&',
        onMemberClick: '='
      },
      controller: 'FileDetailCommentInputCtrl',
      templateUrl : 'app/right/file-detail/comment-input/file.detail.comment.input.html',
      link: link
    };

    function link(scope, el) {
      var _jqFileDetail = $('.file-detail');
      var _jqCommentInput = $('#file-detail-comment-input');

      var _stickerType = 'file';
      var _sticker;

      var _timerScrollBottom;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.createComment = createComment;
        scope.onCommentInputChange = onCommentInputChange;
        scope.onMentionIconClick = onMentionIconClick;
        scope.onMessageInputFocus = onMessageInputFocus;
        scope.onMessageInputBlur = onMessageInputBlur;
        scope.isMentionaheadOpen = isMentionaheadOpen;

        scope.member = memberService.getMember();

        _initComment();

        _setProfileImage(scope.member);

        _attachScopeEvents();
        _attachDomEvents();
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        scope.$on('$destroy', _onDestroy);
        scope.$on('window:unload', _onWindowUnload);

        scope.$on('setCommentFocus', _onFocusInput);
        scope.$on('onChangeSticker:' + _stickerType, _onChangeSticker);

        scope.$on('rightFileDetailOnFileDeleted', _onRightFileDetailOnFileDeleted);
        scope.$on('jndWebSocketMember:memberUpdated', _onUpdateMemberProfile);

        scope.$on('elasticResize:comment', _onElasticResize);

        scope.$on('room:memberAdded', _onMemberUpdate);
        scope.$on('jndWebSocketMessage:topicLeave', _onMemberUpdate);

        scope.$watch('file', _onFileChange);
        scope.$watch('getMentions', _onGetMentionChange);
        scope.$watch('mentionahead.status', _onMentionaheadStatusChanged);
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        el.on('keydown', _onKeyDown);
      }

      /**
       * mention change event handler
       * @param {string} value
       * @private
       */
      function _onGetMentionChange(value) {
        scope.setMentionsGetter({
          $getter: value
        });
      }

      /**
       * mentionahead status 변경 이벤트 핸들러
       * @param {string} status
       * @private
       */
      function _onMentionaheadStatusChanged(status) {
        if (status === Mentionahead.OPEN) {
          _hideSticker();
        }
      }

      /**
       * comment 를 posting 한다.
       */
      function createComment() {
        var comment = _jqCommentInput.val().trim();

        if (comment || _sticker) {
          _hideSticker();

          _clearWithFocus();

          scope.postComment({
            $comment: comment,
            $sticker: _sticker
          });
        } else if (comment === '') {
          _clearWithFocus();
        }
        scope.hasMessage = false;
      }

      /**
       * mention icon click
       */
      function onMentionIconClick() {
        scope.mentionahead.status = Mentionahead.MENTION_WITH_CHAR;
      }

      /**
       * on message input focus
       */
      function onMessageInputFocus() {
        scope.isMessageInputFocus = true;
      }

      /**
       * on message input blur
       */
      function onMessageInputBlur() {
        scope.isMessageInputFocus = false;
      }

      /**
       * message input change event handler
       * @param {object} event
       */
      function onCommentInputChange(event) {
        var message;
        if (event.type === 'keyup' && jndKeyCode.match('ESC', event.keyCode)) {
          _hideSticker();
        } else if (_.isString(event.target.value)) {
          message = _.trim(event.target.value).length;
          scope.hasMessage = message > 0 || !!_sticker;
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
        _jqCommentInput.focus();
      }

      /**
       * 입력할 sticker 변경 event handler
       * @param angularEvent
       * @param item
       * @private
       */
      function _onChangeSticker(angularEvent, item) {
        if (_sticker = item) {
          setTimeout(_focusInput);
        }

        scope.hasMessage = !!_sticker;
      }

      /**
       * 스티커 레이어를 숨긴다.
       * @private
       */
      function _hideSticker() {
        jndPubSub.pub('deselectSticker:' + _stickerType);
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
        scope.file && JndMessageStorage.setCommentInput(scope.file.id, _jqCommentInput.val());
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
        scope.profileImage = memberService.getProfileImage(member.id);
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
        clearTimeout(_timerScrollBottom);
        if (_isScrollOver()) {
          _timerScrollBottom = setTimeout(function() {
            _fixScrollBottom();
          }, 100);
        }
      }

      /**
       * key down event handler
       * @private
       */
      function _onKeyDown() {
        if (_isScrollOver()) {
          _fixScrollBottom();
        }
      }

      /**
       * is scroll over
       * @returns {boolean}
       * @private
       */
      function _isScrollOver() {
        return el.height() + el.offset().top <= _jqFileDetail.scrollTop() + _jqFileDetail[0].scrollHeight;
      }

      /**
       * 스크롤 바텀 고정함
       * @returns {*}
       * @private
       */
      function _fixScrollBottom() {
        return _jqFileDetail.scrollTop(_jqFileDetail[0].scrollHeight);
      }

      /**
       * comment input의 값을 초기화하고 focus를 설정한다.
       * @private
       */
      function _clearWithFocus() {
        setTimeout(function() {
          _jqCommentInput.val('').focus()[0].removeAttribute('style');
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
        scope.mentionahead.list = Mentionahead.getMentionListForFile(file);
        scope.isDmOnly = scope.mentionahead.list.length === 0;
      }

      /**
       * Mentionahead가 열렸는지 여부
       * @returns {boolean}
       */
      function isMentionaheadOpen() {
        return !scope.isDmOnly && Mentionahead.isOpen(scope.mentionahead.status);
      }
    }
  }
})();
