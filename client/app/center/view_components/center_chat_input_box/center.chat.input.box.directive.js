(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerChatInputBox', centerChatInputBox);

  function centerChatInputBox($state, $filter, integrationService, CoreUtil, ImagePaste, Browser, memberService,
                              jndPubSub, currentSessionHelper, entityAPIservice, Mentionahead, Tutorial) {
    var multiple = true;    // multiple upload 여부

    return {
      restrict: 'E',
      scope: false,
      link: link,
      replace: true,
      controller: 'CenterChatInputBoxCtrl',
      templateUrl: 'app/center/view_components/center_chat_input_box/center.chat.input.box.html'
    };

    function link(scope, el) {
      var _jqMenu = el.find('#file-upload-menu');
      var _jqMessageInput = el.find('#message-input');
      var _jqProgress = el.find('.file-upload-progress-container');
      var _jqUploadBtn = el.find('.icon-upload-button');
      var _uploadMap = {
        'computer': function() {
          $('<input type="file" ' + (multiple ? 'multiple' : '') + ' />')
            .on('change', function(evt) {
              scope.onFileSelect(evt.target.files);
            })
            .trigger('click');
        },
        'google-drive': function() {
          integrationService.createGoogleDrive(scope, {multiple: multiple});
        },
        'dropbox': function(evt) {
          integrationService.createDropBox(scope, {multiple: multiple, event: evt});
        }
      };
      var _entityId = $state.params.entityId;
      var _progressHeight;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.onMentionIconClick = onMentionIconClick;
        scope.onMessageInputFocus = onMessageInputFocus;
        scope.onMessageInputBlur = onMessageInputBlur;
        scope.isMentionaheadOpen = isMentionaheadOpen;

        _initializeVariables();
        _attachScopeEvents();
        _attachDomEvents();

        if (Browser.chrome) {
          _setImagePaste();
        }

        _setMentionList();
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        scope.$on('jndMainKeyHandler:upload', _onHotkeyUpload);
        scope.$on('onCurrentEntityChanged', _onCurrentEntityChanged);
        scope.$on('RoomTopicList:changed', _onRoomTopicListChanged);
        scope.$on('jndWebSocketMember:memberUpdated', _setMentionList);

        scope.$watch('status.isLoading', _onChangeLoading);
      }

      /**
       * 변수 값을 초기화 한다.
       * @private
       */
      function _initializeVariables() {
        scope.isDM = memberService.isMember(_entityId);
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        _jqMenu.on('click', 'li', _onMenuItemClick);
        _jqProgress.on('transitionend', _onTransitionEnd);
        _jqUploadBtn.on('click', _onClickUpload);
      }

      /**
       * upload 버튼 클릭 이벤트 핸들러
       * @private
       */
      function _onClickUpload() {
        Tutorial.hideTooltip('upload');
      }

      /**
       * current entity changed event handler
       * @private
       */
      function _onCurrentEntityChanged(angularEvent, currentEntity) {
        _entityId = currentEntity.id;
        _setMentionList();
        _initializeVariables();
      }

      /**
       * roomTopicList 정보가 변경되었을 때 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} changedIdMap - 변경된 topic 의 id map
       *    @param {boolean} changedIdMap.id
       * @private
       */
      function _onRoomTopicListChanged(angularEvent, changedIdMap) {
        var currentId = CoreUtil.pick(scope, 'currentEntity', 'id');
        if (changedIdMap[currentId]) {
          _setMentionList();
        }
      }

      /**
       * mention 가능한 member 설정한다.
       * @private
       */
      function _setMentionList() {
        scope.mentionahead.list = Mentionahead.getMentionListForTopic(_entityId);
      }

      /**
       * hotkey 로 업로드 시
       * @private
       */
      function _onHotkeyUpload() {
        _uploadMap['computer']();
        Tutorial.hideTooltip('upload');
      }

      /**
       * loading status change event handler
       * @param {boolean} loading
       * @private
       */
      function _onChangeLoading(loading) {
        if (loading === false && !scope.isDisabledMember(scope.currentEntity)) {

          // loading status 변경된 직후에도 element가 아직 disabled 상태이므로
          // setTimeout에 두어 focus 수행가능한 상태에서 수행하도록 한다.
          setTimeout(function() {
            _jqMessageInput.focus();
          });
        }
      }

      /**
       * menu item click event handler
       * @param {object} event
       * @private
       */
      function _onMenuItemClick(event) {
        var role = $(event.target).closest('li').attr('role');
        var fn;

        if (fn = _uploadMap[role]) {
          fn(event);
        }
      }

      /**
       * transitionend event handler
       * @private
       */
      function _onTransitionEnd() {
        var progressHeight = _jqProgress.height();
        if (_progressHeight != progressHeight) {
          jndPubSub.pub('elasticResize:message');
        }
        _progressHeight = progressHeight;
      }

      /**
       * mention icon click event handler
       */
      function onMentionIconClick() {
        scope.mentionahead.status = Mentionahead.MENTION_WITH_CHAR;
      }

      /**
       * Mentionahead가 열렸는지 여부
       * @returns {boolean}
       */
      function isMentionaheadOpen() {
        return !scope.isDM && Mentionahead.isOpen(scope.mentionahead.status);
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
       * image 붙여넣기 가능하도록 설정한다.
       * @private
       */
      function _setImagePaste() {
        ImagePaste.createInstance(_jqMessageInput, {
          // content data 되기 직전 event handler
          onContentLoading: function() {
            scope.isLoading = true;
          },
          // content load 된 후 event handler
          onContentLoad: function(type, data) {
            var comment = _jqMessageInput.val();
            _jqMessageInput.val('').trigger('change');

            if (type === 'text') {
              _jqMessageInput.val(data).trigger('change');
            } else if (type === 'image') {
              scope.onFileSelect([data], {
                createFileObject: function(data) {
                  var blob = CoreUtil.dataURItoBlob(data);
                  // message-input에 입력된 text를 file comment로 설정함

                  return {
                    name: 'Image_' + $filter('date')((new Date()).getTime(), 'yyyy-MM-dd HH:mm:ss') + '.png',
                    type: 'image/png',
                    blob: blob,
                    size: blob.size,
                    uploadType: 'clipboard',
                    dataUrl: data,

                    comment: comment
                  };
                }
              });
            }
          },
          // content load 된 후 image load시 변경된 상태가 정리된 후 event handler
          onContentLoaded: function() {
            scope.isLoading = false;
          }
        });
      }
    }
  }
})();
