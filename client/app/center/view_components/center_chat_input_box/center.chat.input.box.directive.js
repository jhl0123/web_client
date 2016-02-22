(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerChatInputBox', centerChatInputBox);

  function centerChatInputBox($state, $filter, $timeout, integrationService, fileAPIservice, ImagePaste, Browser,
                              jndPubSub, currentSessionHelper, entityAPIservice, MentionExtractor) {
    var multiple = true;    // multiple upload 여부

    return {
      restrict: 'E',
      scope: false,
      link: link,
      replace: true,
      templateUrl: 'app/center/view_components/center_chat_input_box/center.chat.input.box.html'
    };

    function link(scope, el) {
      var _jqMenu = el.find('#file-upload-menu');
      var _jqMessageInput = el.find('#message-input');
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

      var _entityId = $state.params._entityId;
      var _timerElasticResize;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.onMentionIconClick = onMentionIconClick;

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
        scope.$on('hotkey-upload', _onHotkeyUpload);
        scope.$on('onCurrentEntityChanged', _onCurrentEntityChanged);
        scope.$on('mentionahead:showed:message', _onMentionaheadShowed);
        scope.$on('mentionahead:hid:message', _onMentionaheadHid);

        scope.$watch('msgLoadStatus.loading', _onChangeLoading);
        scope.$watch('curUpload.status', _onCurUploadStatusChange);
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        _jqMenu.on('click', 'li', _onMenuItemClick);
      }

      /**
       * current entity changed event handler
       * @private
       */
      function _onCurrentEntityChanged() {
        _setMentionList();
      }

      /**
       * mentionahead showed
       * @private
       */
      function _onMentionaheadShowed() {
        scope.isMentionaheadShow = true;
      }

      /**
       * mentionahead hid
       * @private
       */
      function _onMentionaheadHid() {
        scope.isMentionaheadShow = false;
      }

      /**
       * mention 가능한 member 설정한다.
       * @private
       */
      function _setMentionList() {
        var currentEntity = currentSessionHelper.getCurrentEntity();
        var users;
        var mentionMembers;

        if (currentEntity) {
          users = entityAPIservice.getUserList(currentEntity);
          if (users) {
            mentionMembers = MentionExtractor.getMentionListForTopic(users, _entityId);
            jndPubSub.pub('mentionahead:message', mentionMembers);
          }
        }
      }

      function _onHotkeyUpload() {
        _uploadMap['computer']();
      }

      /**
       * loading status change event handler
       * @param {boolean} loading
       * @private
       */
      function _onChangeLoading(loading) {
        if (loading === false && !scope.isDisabledMember(scope.currentEntity)) {
          setTimeout(function() {
            _jqMessageInput.focus();
          });
        }
      }

      /**
       * cur upload status change event handler
       * @param {undefined|string} newValue
       * @param {undefined|string} oldValue
       * @private
       */
      function _onCurUploadStatusChange(newValue, oldValue) {
        if (newValue == null || oldValue != null) {
          clearTimeout(_timerElasticResize);
          _timerElasticResize = setTimeout(function() {
            console.log('elastic resize ::: message');
            jndPubSub.pub('elasticResize:message');
          }, 5000);
        }
      }

      /**
       * menu item click event handler
       * @param {object} event
       * @private
       */
      function _onMenuItemClick(event) {
        var role = this.getAttribute('role');
        var fn;

        if (fn = _uploadMap[role]) {
          fn(event);
        }
      }

      /**
       * mention icon click event handler
       */
      function onMentionIconClick() {
        jndPubSub.pub('mentionahead:show:message');
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
                  var blob = fileAPIservice.dataURItoBlob(data);
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
