/**
 * @fileoverview 각 토픽마다 생성되는 announcement directive
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerMessagesDirective', centerMessagesDirective);

  function centerMessagesDirective($filter, $state, CenterRenderer, CenterRendererFactory, MessageCollection,
                                   StarAPIService, jndPubSub, FileDetail, memberService, Dialog, currentSessionHelper,
                                   EntityHandler, JndUtil, RendererUtil, fileAPIservice) {
    return {
      restrict: 'E',
      replace: true,
      link: link
    };

    function link(scope, el, attrs) {
      var that = this;
      var _teamId;
      var _listScope = scope.$new();

      var _events = {
        click: [
          {
            apply: true,
            currentTarget: '._star',
            handler: _onClickStar
          },
          {
            apply: true,
            currentTarget: '._fileStar',
            handler: _onClickFileStar
          },
          {
            apply: true,
            currentTarget: '._user',
            handler: _onClickUser
          },
          {
            apply: true,
            currentTarget: '._fileShare',
            handler: _onClickFileShare
          },
          {
            apply: true,
            currentTarget: '._commentDelete',
            handler: _onClickCommentDelete
          },
          {
            currentTarget: '._fileDetail',
            handler: _onClickFileDetail
          }
        ]
      };

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        _teamId = memberService.getTeamId();
        _attachScopeEvents();
        _attachDomEvents();
        _renderAll();
      }

      /**
       * angular event 를 바인딩한다.
       * @private
       */
      function _attachScopeEvents() {
        scope.$on('messages:reset', _renderAll);
        scope.$on('messages:append', _onAppend);
        scope.$on('messages:prepend', _onPrepend);
        scope.$on('messages:beforeRemove', _onBeforeRemove);
        scope.$on('messages:remove', _onRemove);
        scope.$on('messages:set', _renderAll);

        scope.$on('messages:updateUnread', _onUpdateUnread);

        scope.$on('message:starred', _onStarred);
        scope.$on('message:unStarred', _onUnStarred);

        scope.$on('webSocketConnect:connectUpdated', _onConnectUpdated);

        scope.$on('$destroy', _onDestroy);

        scope.$on('updateCenterForRelatedFile', _onFileUpdated);
        scope.$on('centerOnFileDeleted', _onFileDeleted);

        scope.$on('toggleLinkPreview', _onAttachMessagePreview);
        scope.$on('jndWebSocketMember:memberUpdated', _onUpdateMemberProfile);
        scope.$on('errorThumbnailImage', _onErrorThumbnailImage);
        scope.$on('fileShared', _onFileShareStatusChange);
        scope.$on('fileUnshared', _onFileShareStatusChange);

        scope.$on('hotkey-scroll-page-up', _onHotkeyScrollUp);
        scope.$on('hotkey-scroll-page-down', _onHotkeyScrollDown);

        scope.$on('jndWebSocketFile:commentCreated', _onFileCommentCreated);
        scope.$on('jndWebSocketFile:commentDeleted', _onFileCommentDeleted);
      }

      /**
       *
       * @private
       */
      function _onHotkeyScrollUp() {
        var container = document.getElementById('msgs-container');
        var jqInput = $('#message-input');
        container.scrollTop -= ($(container).height() - jqInput.height() - 20);
      }

      /**
       *
       * @private
       */
      function _onHotkeyScrollDown() {
        var container = document.getElementById('msgs-container');
        var jqInput = $('#message-input');
        container.scrollTop += ($(container).height() - jqInput.height() - 20);
      }

      /**
       * file 공유 상태 변경시 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} data
       *    @param {object} data.file
       *    @param {string} data.event
       * @private
       */
      function _onFileShareStatusChange(angularEvent, data) {
        var entityIndex;
        var currentEntityId = currentSessionHelper.getCurrentEntityId(true);
        var eventType = data.event;
        var fileId = data.file.id;
        var message;

        _onFileUpdated(angularEvent, data.file)
          .error(function() {
            _.forEach(MessageCollection.list, function(msg, index) {
              if (msg.message.id === fileId) {
                message = msg.message
              } else if ((msg.feedback && msg.feedback.id) === fileId) {
                message = msg.feedback;
              } else {
                message = null;
              }

              if (message) {
                entityIndex = message.shareEntities.indexOf(currentEntityId);
                if (eventType === 'file_unshared' && entityIndex !== -1) {
                  message.shareEntities.splice(entityIndex, 1);
                } else if (eventType === 'file_shared' && entityIndex === -1) {
                  message.shareEntities.push(currentEntityId);
                }
                _refresh(msg.id, index);
              }
            });
          });
      }

      /**
       * file update 되었을 때 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} file
       * @private
       */
      function _onFileUpdated(angularEvent, file) {
        var fileId = file.id;
        return FileDetail.get(fileId)
          .success(function(response) {
            var shareEntities;
            var message;

            _.forEach(response.messageDetails, function(item) {
              if (item.contentType === 'file') {
                shareEntities = _toEntityIdList(item.shareEntities);
              }
            });
            _.forEach(MessageCollection.list, function(msg, index) {
              message = RendererUtil.getFeedbackMessage(msg);
              if (message.id === fileId) {
                message.shareEntities = shareEntities;
                _refresh(msg.id, index);
              }
            });
          });
      }

      /**
       * entityIdList 로 변경하여 반영한다
       * @param {Array} memberIdList
       * @returns {Array}
       * @private
       */
      function _toEntityIdList(memberIdList) {
        var entityIdList = [];
        var entity;
        _.forEach(memberIdList, function(memberId) {
          entity = EntityHandler.get(memberId);
          entityIdList.push(entity.entityId || entity.id);
        });
        return entityIdList;
      }

      /**
       * file 삭제 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} param
       * @private
       */
      function _onFileDeleted(angularEvent, param) {
        var deletedFileId = parseInt(param.file.id, 10);
        _.forEach(MessageCollection.list, function(msg, index) {
          if (msg.message.id === deletedFileId) {
            msg.message.status = 'archived';
            _refresh(msg.id, index);
          }
          if (msg.feedback && msg.feedback.id === deletedFileId) {
            msg.feedback.status = 'archived';
            _refresh(msg.id, index);
          }
        });
      }

      /**
       * dom event 를 바인딩한다.
       * @private
       */
      function _attachDomEvents() {
        _attachDelegateDomHandlers();
        el
          .on('mouseover', _onMouseOver)
          .on('mouseout', _onMouseOut);
      }

      /**
       * updateMemberProfile 이벤트 발생시 이벤트 핸들러
       * @param {object} event
       * @param {{event: object, member: object}} data
       * @private
       */
      function _onUpdateMemberProfile(event, data) {
        var id = data.member.id;

        _refreshMsgByMemberId(id);
      }

      /**
       * connect updated event handler
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      function _onConnectUpdated(angularEvent, data) {
        var id = data.bot.id;
        _refreshMsgByMemberId(id);
      }

      function _refreshMsgByMemberId(id) {
        var list = MessageCollection.list;

        _.forEach(list, function(msg, index) {
          if (msg.extFromEntityId === id) {
            MessageCollection.manipulateMessage(msg);
            _refresh(msg.id, index);
          }
        });
      }

      /**
       * delegate 로 처리할 dom event handler 를 추가한다.
       * @private
       */
      function _attachDelegateDomHandlers() {
        var renderers = CenterRendererFactory.getAll();

        // renderer 고유의 event handler
        _.forEach(renderers, function(renderer) {
          if (renderer.events) {
            _attachRendererDomEvents(renderer.events);
          }
        });

        // renderer 공통의 event handler
        _attachRendererDomEvents(_events);
      }

      /**
       * center element에 각 events를 추가한다.
       * @param {object} events
       * @private
       */
      function _attachRendererDomEvents(events) {
        _.each(events, function(event, eventName) {
          if (eventName === 'click') {
            _attachClickEvent(event, eventName);
          }
        });
      }

      /**
       * center element에 click event를 추가한다.
       * @param {array} event
       * @param {string} eventName
       * @private
       */
      function _attachClickEvent(event, eventName) {
        _.each(event, function(delegate) {
          el.on(eventName, delegate.currentTarget, function(clickEvent) {
            var jqTarget = $(clickEvent.target);
            var jqMessage = jqTarget.closest('.message');
            var id = jqMessage.attr('id');
            var msg = MessageCollection.get(id);

            delegate.handler(clickEvent, {
              jqTarget: jqTarget,
              jqMessage: jqMessage,
              id: id,
              msg: msg
            });

            if (delegate.apply) {
              JndUtil.safeApply(scope);
            }
          })
        });
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _destroyCompiledScope(el);
      }

      /**
       * file share click 이벤트 핸들러
       * @param {object} clickEvent
       * @param {object} data
       * @private
       */
      function _onClickFileShare(clickEvent, data) {
        scope.onShareClick(data.msg.message);
      }

      /**
       * comment delete
       * @param {object} clickEvent
       * @param {object} data
       * @private
       */
      function _onClickCommentDelete(clickEvent, data) {
        var file = RendererUtil.getFeedbackMessage(data.msg);
        var comment = data.msg.message;

        // message collection에서 바로 삭제한다.
        MessageCollection.remove(comment.id, true);

        if (data.msg.message.contentType === 'comment_sticker') {
          FileDetail.deleteSticker(comment.id)
            .success(_onSuccessCommentDelete);
        } else {
          FileDetail.deleteComment(file.id, comment.id)
            .success(_onSuccessCommentDelete);
        }
      }

      /**
       * success comment delete
       * @private
       */
      function _onSuccessCommentDelete() {
        Dialog.success({
          title: $filter('translate')('@message-deleted')
        });
      }

      /**
       * file detail
       * @param {object} clickEvent
       * @param {object} data
       * @private
       */
      function _onClickFileDetail(clickEvent, data) {
        var contentType = data.msg.message.contentType;
        var userName = $filter('getName')(data.msg.message.writerId);
        var itemId = contentType === 'comment' ? data.msg.feedbackId : data.msg.message.id;

        if ($state.params.itemId != itemId) {
          if (data.msg.feedback && contentType !== 'file') {
            userName = $filter('getName')(data.msg.feedback.writerId);
            itemId = data.msg.feedback.id;
          }

          $state.go('files', {
            userName: userName,
            itemId: itemId
          });
        }
      }

      /**
       * star click 핸들러
       * @param {object} clickEvent
       * @param {object} data
       * @private
       */
      function _onClickStar(clickEvent, data) {
        var message = data.msg.message;

        _requestStar(data.msg, message, '._star');
      }

      /**
       * file star click 핸들러
       * @param {object} clickEvent
       * @param {object} data
       * @private
       */
      function _onClickFileStar(clickEvent, data) {
        var jqCurrentTarget = $(clickEvent.currentTarget);
        var message;

        if (jqCurrentTarget.hasClass('_feedbackStar')) {
          message = RendererUtil.getFeedbackMessage(data.msg);
        } else {
          message = data.msg.message;
        }

        _requestStar(data.msg, message, '._fileStar');
      }

      /**
       * request star
       * @param {object} msg
       * @param {object} message
       * @private
       */
      function _requestStar(msg, message, jqTarget) {
        var messageId = message.id;

        message.isStarred = !message.isStarred;
        _refreshStar(msg, message, jqTarget);
        if (message.isStarred) {
          StarAPIService.star(messageId, _teamId)
            .error(_.bind(_onStarRequestError, that, msg, message, jqTarget));
        } else {
          StarAPIService.unStar(messageId, _teamId)
            .error(_.bind(_onStarRequestError, that, msg, message, jqTarget));
        }
      }

      /**
       * star 오류 핸들러
       * @param {object} msg
       * @param {object} message
       * @private
       */
      function _onStarRequestError(msg, message, jqTarget) {
        message.isStarred = !message.isStarred;
        _refreshStar(msg, message, jqTarget);

        Dialog.error({
          title: $filter('translate')('@star-forbidden')
        });
      }

      /**
       * user 클릭 이벤트 핸들러
       * @param {object} clickEvent
       * @param {object} data
       * @private
       */
      function _onClickUser(clickEvent, data) {
        var writer = data.msg.extWriter;

        // user를 event가 파일 상세에 전달되어 파일 상세가 열리지 않도록 한다.
        clickEvent.stopPropagation();

        if (!memberService.isConnectBot(writer.id)) {
          jndPubSub.pub('onMemberClick', writer.id);
        }
      }

      /**
       * socket 에서 starred 이벤트 발생시
       * @param {Object} event - angular 이벤트
       * @param {Object} param
       *     @param {Number|String} param.teamId - team id
       *     @param {Number|String} param.messageId - message id
       * @private
       */
      function _onStarred(event, param) {
        if (_teamId.toString() === param.teamId.toString()) {
          _setStarred(param.messageId, true);
        }
      }

      /**
       * socket 에서 un-starred 이벤트 발생시 이벤트 핸들러
       * @param {Object} event - angular 이벤트
       * @param {Object} param
       *     @param {Number|String} param.teamId - team id
       *     @param {Number|String} param.messageId - message id
       * @private
       */
      function _onUnStarred(event, param) {
        if (_teamId.toString() === param.teamId.toString()) {
          _setStarred(param.messageId, false);
        }
      }

      /**
       * set starred
       * @param {number|string} messageId
       * @param {boolean} isStarred
       * @private
       */
      function _setStarred(messageId, isStarred) {
        MessageCollection.forEach(function(msg) {
          var message;

          if (msg.feedbackId === messageId) {
            message = RendererUtil.getFeedbackMessage(msg);

            message.isStarred = isStarred;
            _refreshStar(msg, message, '._star-' + msg.feedbackId);
          } else if (msg.message.id === messageId) {
            message = msg.message;

            message.isStarred = isStarred;
            _refreshStar(msg, message, '._star-' + msg.message.id);
          }
        });
      }

      /**
       * star 의 상태를 변경한다.
       * @param {object} message
       * @param {string|object} jqTarget
       * @private
       */
      function _refreshStar(msg, message, jqTarget) {
        jqTarget = $('#' + msg.id).find(jqTarget || '._star');
        if (jqTarget.length) {
          if (message.isStarred) {
            jqTarget.removeClass('off').addClass('on');
            jqTarget.find('i').removeClass('icon-star-off').addClass('icon-star-on');
          } else {
            jqTarget.removeClass('on').addClass('off');
            jqTarget.find('i').removeClass('icon-star-on').addClass('icon-star-off');
          }
        }
      }

      /**
       * mouse over 시 이벤트 핸들러
       * (ng-mouseenter, ng-mouseleave 가 느리다는 포스팅이 있어, 적용해 봄)
       * @param {Event} mouseOverEvent
       * @private
       */
      function _onMouseOver(mouseOverEvent) {
        var jqTarget = $(mouseOverEvent.target);
        if (jqTarget.closest('.msg-item-icon').length) {
          jqTarget.closest('.msg-item').addClass('text-highlight-background');
        }
      }

      /**
       * mouse over 시 이벤트 핸들러
       * (ng-mouseenter, ng-mouseleave 가 느리다는 포스팅이 있어, 적용해 봄)
       * @param {Event} mouseOutEvent
       * @private
       */
      function _onMouseOut(mouseOutEvent) {
        var jqTarget = $(mouseOutEvent.target);
        if (jqTarget.closest('.msg-item-icon').length) {
          jqTarget.closest('.msg-item').removeClass('text-highlight-background');
        }
      }

      /**
       * unread marker 를 업데이트 한다.
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      function _onUpdateUnread(angularEvent, data) {
        var msg = data.msg;
        var jqTarget = $('#' + msg.id);
        if (jqTarget.length) {
          jqTarget.find('.unread-badge').text(msg.unreadCount);
        }
      }

      /**
       * refresh 할 때, 날짜 구분선이 이미 랜더링 되었는지 확인한다.
       * @param id
       * @param index
       * @returns {boolean}
       * @private
       */
      function _isDateRendered(id, index) {
        var jqTarget = $('#' + id);
        if (jqTarget.length) {
          if (MessageCollection.isNewDate(index) && jqTarget.prev().attr('content-type') !== 'dateDivider') {
            return false;
          }
        }
        return true;
      }

      /**
       * prepend 이벤트 핸들러
       * @param {Object} angularEvent
       * @param {Array} list
       * @private
       */
      function _onPrepend(angularEvent, list) {
        var htmlList = [];
        var headMsg = MessageCollection.list[list.length];
        _.forEach(list, function(message, index) {
          _pushMarkup(htmlList, message, index);
        });

        if (headMsg) {
          _refresh(headMsg.id, list.length);
        }

        el.prepend(_getCompiledEl(htmlList.join('')));
        scope.onRepeatDone();
      }

      /**
       * markup 을 생성한다.
       * @param {Array} htmlList - 생성할 Markup array
       * @param {Object} message
       * @param {Number} index - 해당 message 의 index
       * @private
       */
      function _pushMarkup(htmlList, message, index) {
        if (MessageCollection.isNewDate(index)) {
          htmlList.push(CenterRenderer.render(index, 'dateDivider'));
        }
        htmlList.push(CenterRenderer.render(index));

        if (scope.isLastReadMarker(message.id)) {
          htmlList.push(CenterRenderer.render(index, 'unreadBookmark'));
        }
      }

      /**
       * message append 이벤트 핸들러
       * @param {Object} angularEvent
       * @param {Array} list
       * @private
       */
      function _onAppend(angularEvent, list) {
        var length = list.length;
        var htmlList = [];
        var index = MessageCollection.list.length - length;
        var prevIndex;
        var prevMessage;

        _.forEach(list, function(message) {
          _pushMarkup(htmlList, message, index);
          index++;
        });

        // append 되는 메시지가 child text 또는 child comment이면
        // 이전 메시지의 뷰가 바뀌어야 한다(조건에 부합하는 이전 메시지는 메시지 작성 시간을 출력하지 않음).
        if (MessageCollection.isChildText(MessageCollection.list.length - 1) ||
          MessageCollection.isChildComment(MessageCollection.list.length - 1)) {
          prevIndex = MessageCollection.list.length - 2;
          prevMessage = MessageCollection.list[prevIndex];
          _refresh(prevMessage.id, prevIndex);
        }

        el.append(_getCompiledEl(htmlList.join('')));
        scope.onRepeatDone();
        //$compile(el.contents())(scope);
      }

      /**
       * id 에 해당하는 dom 을 갱신한다.
       * @param id
       * @param index
       * @private
       */
      function _refresh(id, index) {
        var jqTarget = $('#' + id);
        var jqPrev = jqTarget.prev();

        if (jqTarget.length) {
          //Date 를 갱신하기 위해 기존 date 를 제거한다.
          if (jqPrev.attr('content-type') === 'dateDivider') {
            jqPrev.remove();
          }
          if (!_isDateRendered(id, index)) {
            jqTarget.before(_getCompiledEl(CenterRenderer.render(index, 'dateDivider')));
          }
          jqTarget.replaceWith(_getCompiledEl(CenterRenderer.render(index)));
        }
      }

      /**
       * 필요한 부분은 compile 하여 element 를 반환한다.
       * @param {string} htmlStr - html 스트링
       * @returns {*}
       * @private
       */
      function _getCompiledEl(htmlStr) {
        var jqDummy = $('<div></div>');
        jqDummy.html(htmlStr);

        _.forEach(jqDummy.find('._compile'), function(targetEl) {
          JndUtil.safeCompile(_listScope, targetEl);
        });

        return jqDummy.contents();
      }

      /**
       * 컴파일 된 scope 를 제거한다.
       * @private
       */
      function _destroyCompiledScope() {
        _listScope.$destroy();
      }

      /**
       * 실제 remove 가 발생하기 전 이벤트 핸들러
       * @param angularEvent
       * @param index
       * @private
       */
      function _onBeforeRemove(angularEvent, index) {
        var msg = MessageCollection.list[index];
        var isLastMsg = (index === MessageCollection.list.length - 1);
        var jqTarget = $('#' + msg.id);
        var jqPrev = jqTarget.prev();

        //Date 를 갱신하기 위해 기존 date 를 제거한다.
        if (jqTarget.length) {
          if (jqPrev.attr('content-type') === 'dateDivider') {
            jqPrev.remove();
            jqPrev = jqTarget.prev();
          }
          if (jqPrev.attr('content-type') === 'unreadBookmark' && isLastMsg) {
            jqPrev.remove();
          }

          jqTarget.remove();
        }
      }

      /**
       * remove 이벤트 핸들러
       * @param angularEvent
       * @param index
       * @private
       */
      function _onRemove(angularEvent, index) {
        var msg = MessageCollection.list[index];
        var prevIndex = index - 1;
        var prevMessage;

        // 삭제된 메시지의 이전 메시지가 child text 또는 child comment가 아니라면
        // 이전 메시지의 뷰가 바뀌어야 한다(조건에 부합하는 이전 메시지는  메시지 작성 시간을 출력하지 않음).
        if (!MessageCollection.hasChildText(prevIndex) ||
          !MessageCollection.hasChildComment(prevIndex)) {
          prevMessage = MessageCollection.list[prevIndex];
          _refresh(prevMessage.id, prevIndex);
        }

        if (msg) {
          _refresh(msg.id, index);
        }
      }

      /**
       * 모든 메세지 리스트를 랜더링 한다.
       * @private
       */
      function _renderAll() {
        var htmlList = [];
        var list = MessageCollection.list;
        _destroyCompiledScope();
        _.forEach(list, function(message, index) {
          _pushMarkup(htmlList, message, index);
        });
        el.empty().html(_getCompiledEl(htmlList.join('')));
        if (list.length) {
          scope.onRepeatDone();
        }
      }

      /**
       * preview 이벤트 핸들러
       * @param {object} angularEvent
       * @param {number|string} messageId
       * @private
       */
      function _onAttachMessagePreview(angularEvent, messageId) {
        MessageCollection.forEach(function(msg, index) {
          if (messageId === (msg.message && msg.message.id)) {
            _refresh(msg.id, index);
          }
        });
      }

      /**
       * thumbnail error event handler
       * @param {object} $event
       * @param {object} socketEvent
       * @private
       */
      function _onErrorThumbnailImage($event, socketEvent) {
        _refreshFileMessage(socketEvent, function(msg) {
          msg.message.content.fileUrl = socketEvent.data.message.content.fileUrl;
        });
      }

      /**
       * 특정 file message를 갱신한다.
       * @param {object} socketEvent
       * @param {function} callback
       * @private
       */
      function _refreshFileMessage(socketEvent, callback) {
        var messageId = socketEvent.data.message.id;
        MessageCollection.forEach(function(msg, index) {
          if (messageId === (msg.message && msg.message.id) && !msg.message.content.extHasPreview) {
            // back-end에서 link
            msg.message.content.extHasPreview = true;
            msg.message.content.extIsNewImage = false;

            callback(msg);

            _refresh(msg.id, index);
            return false;
          }
        });
      }

      /**
       * created file comment
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      function _onFileCommentCreated(angularEvent, data) {
        _updateFileComment(data);
      }

      /**
       * deleted file comment
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      function _onFileCommentDeleted(angularEvent, data) {
        _updateFileComment(data);
      }

      /**
       * comment count update handler
       * @param data
       * @private
       */
      function _updateFileComment(data) {
        var fileId = data.file.id;
        var commentCount = data.file.commentCount;
        var message;

        _.forEach(MessageCollection.list, function(msg) {
          message = RendererUtil.getFeedbackMessage(msg);
          if (message.id === fileId) {
            message.commentCount = commentCount;
          }
        });
        $('.comment-count-' + data.file.id).text(commentCount);
      }
    }
  }
})();
