/**
 * @fileoverview 각 토픽마다 생성되는 announcement directive
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerMessagesDirective', centerMessagesDirective);
  
  function centerMessagesDirective($filter, $state, CenterRenderer, CenterRendererFactory, MessageCacheCollection,
                                   StarAPIService, jndPubSub, FileDetail, memberService, Dialog, currentSessionHelper,
                                   EntityHandler, JndUtil, RendererUtil, fileAPIservice, CoreUtil) {
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
        scope.$on('MessageCollection:render', _renderAll);
        scope.$on('MessageCollection:reset', _renderAll);
        scope.$on('MessageCollection:append', _onAppend);
        scope.$on('MessageCollection:prepend', _onPrepend);
        scope.$on('MessageCollection:beforeRemove', _onBeforeRemove);
        scope.$on('MessageCollection:remove', _onRemove);
        scope.$on('MessageCollection:set', _renderAll);
        scope.$on('MessageCollection:embed', _onEmbed);
        scope.$on('MessageCollection:refresh', _onRefresh);
        scope.$on('MessageCollection:refresh:commentCount', _onRefreshCommentCount);
        scope.$on('MessageCollection:refresh:star', _onRefreshStar);
        
        scope.$on('MessageCollection:updateUnread', _onUpdateUnread);

        // scope.$on('jndWebSocketMessage:starred', _onStarred);
        // scope.$on('jndWebSocketMessage:unStarred', _onUnStarred);

        scope.$on('webSocketConnect:connectUpdated', _onConnectUpdated);

        scope.$on('$destroy', _onDestroy);

        scope.$on('toggleLinkPreview', _onAttachMessagePreview);
        scope.$on('jndWebSocketMember:memberUpdated', _onUpdateMemberProfile);
        scope.$on('errorThumbnailImage', _onErrorThumbnailImage);

        scope.$on('hotkey-scroll-page-up', _onHotkeyScrollUp);
        scope.$on('hotkey-scroll-page-down', _onHotkeyScrollDown);

        scope.$on('UserList:added', _onMemberAdded);
      }

      /**
       * scrollUp 핫키 이벤트 핸들러
       * @private
       */
      function _onHotkeyScrollUp() {
        var container = document.getElementById('msgs-container');
        var jqInput = $('#message-input');
        container.scrollTop -= ($(container).height() - jqInput.height() - 20);
      }

      /**
       * scroll down 핫키 이벤트 핸들러
       * @private
       */
      function _onHotkeyScrollDown() {
        var container = document.getElementById('msgs-container');
        var jqInput = $('#message-input');
        container.scrollTop += ($(container).height() - jqInput.height() - 20);
      }

      /**
       * msg 에 해당하는 item 을 갱신한다.
       * @param {object} angularEvent
       * @param {object} msg
       * @private
       */
      function _onRefresh(angularEvent, msg) {
        var messageCollection = MessageCacheCollection.getCurrent();
        _refresh(msg.id, messageCollection.at(msg.id, true));
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

      /**
       * 새로운 member 추가되었을 때 이벤트 핸들러
       * 초대 메시지에 관해서만 refresh 한다.
       * @param {object} angularEvent
       * @param {object} member
       * @private
       */
      function _onMemberAdded(angularEvent, member) {
        var memberId = member.id;
        var messageCollection = MessageCacheCollection.getCurrent();
        var list = messageCollection.list;
        var info;
        _.forEach(list, function(msg, index) {
          if (msg.status === 'event') {
            info = CoreUtil.pick(msg, 'info');
            if (info && info.eventType === 'invite' && _.contains(info.inviteUsers, memberId)) {
              messageCollection.manipulateMessage(msg);
              _refresh(msg.id, index);
            }
          }
        });
      }

      /**
       * 인자로 받은 멤버가 작성한 메시지에 대해서만 refresh 한다.
       * @param {number} id
       * @private
       */
      function _refreshMsgByMemberId(id) {
        var messageCollection = MessageCacheCollection.getCurrent();
        var list = messageCollection.list;

        _.forEach(list, function(msg, index) {
          if (msg.extFromEntityId === id) {
            messageCollection.manipulateMessage(msg);
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
            var messageCollection = MessageCacheCollection.getCurrent();
            var jqTarget = $(clickEvent.target);
            var jqMessage = jqTarget.closest('.message');
            var id = jqMessage.attr('id');
            var msg = messageCollection.get(id);

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
        Dialog.confirm({
          body: $filter('translate')('@web-notification-body-messages-confirm-delete'),
          onClose: function (result) {
            if (result === 'okay') {
              _deleteComment(data);
            }
          }
        });
      }

      /**
       * delete comment
       * @param {object} data
       * @private
       */
      function _deleteComment(data) {
        var file = RendererUtil.getFeedbackMessage(data.msg);
        var comment = data.msg.message;
        var messageCollection = MessageCacheCollection.getCurrent();
        // message collection에서 바로 삭제한다.
        messageCollection.remove(comment.id, true);

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
       * @param {object} jqTarget
       * @private
       */
      function _requestStar(msg, message, jqTarget) {
        var linkId = message.id;

        message.isStarred = !message.isStarred;
        _refreshStar(linkId, message.isStarred, jqTarget);
        if (message.isStarred) {
          StarAPIService.star(linkId, _teamId)
            .error(_.bind(_onStarRequestError, that, msg, message, jqTarget));
        } else {
          StarAPIService.unStar(linkId, _teamId)
            .error(_.bind(_onStarRequestError, that, msg, message, jqTarget));
        }
      }

      /**
       * star 오류 핸들러
       * @param {object} msg
       * @param {object} message
       * @param {object} jqTarget
       * @private
       */
      function _onStarRequestError(msg, message, jqTarget) {
        message.isStarred = !message.isStarred;
        _refreshStar(msg.id, message.isStarred, jqTarget);

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
       * star 정보를 refresh 한다.
       * @param {object} angularEvent
       * @param {number} linkId
       * @param {number} messageId
       * @param {boolean} isStarred
       * @private
       */
      function _onRefreshStar(angularEvent, linkId, messageId, isStarred) {
        _refreshStar(linkId, isStarred, '._star-' + messageId);
      }

      /**
       * star 의 상태를 변경한다.
       * @param {number} linkId
       * @param {boolean} isStarred
       * @param {object|string} jqTarget - target 또는 셀렉터
       * @private
       */
      function _refreshStar(linkId, isStarred, jqTarget) {
        jqTarget = $('#' + linkId).find(jqTarget || '._star');
        if (jqTarget.length) {
          if (isStarred) {
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
        var messageCollection = MessageCacheCollection.getCurrent();
        var jqTarget = $('#' + id);
        if (jqTarget.length) {
          if (messageCollection.isNewDate(index) && jqTarget.prev().attr('content-type') !== 'dateDivider') {
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
        var messageCollection = MessageCacheCollection.getCurrent();
        var headMsg = messageCollection.list[list.length];
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
        var messageCollection = MessageCacheCollection.getCurrent();
        if (messageCollection.isNewDate(index)) {
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
        var messageCollection = MessageCacheCollection.getCurrent();
        var index = messageCollection.list.length - length;
        var prevIndex;
        var prevMessage;

        _.forEach(list, function(message) {
          _pushMarkup(htmlList, message, index);
          index++;
        });

        // append 되는 메시지가 child text 또는 child comment이면
        // 이전 메시지의 뷰가 바뀌어야 한다(조건에 부합하는 이전 메시지는 메시지 작성 시간을 출력하지 않음).
        if (messageCollection.isChildText(messageCollection.list.length - 1) ||
          messageCollection.isChildComment(messageCollection.list.length - 1)) {
          prevIndex = messageCollection.list.length - 2;
          prevMessage = messageCollection.list[prevIndex];
          _refresh(prevMessage.id, prevIndex);
        }

        el.append(_getCompiledEl(htmlList.join('')));
        scope.onRepeatDone();
      }

      /**
       *
       * @param angularEvent
       * @param {number} index - embed 한 item 의 index
       * @private
       */
      function _onEmbed(angularEvent, index) {
        var messageCollection = MessageCacheCollection.getCurrent();
        var message;
        var prevMessage;
        var prevIndex = index - 1;
        var htmlList = [];
        var jqPrev;
        
        if (index > 0) {
          message = messageCollection.list[index];
          prevMessage = messageCollection.list[prevIndex];
          jqPrev = $('#' + prevMessage.id);
          _pushMarkup(htmlList, message, index);
          _refresh(prevMessage.id, prevIndex);
          jqPrev.after(_getCompiledEl(htmlList.join('')));
          scope.onRepeatDone();
        }
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
        var messageCollection = MessageCacheCollection.getCurrent();
        var msg = messageCollection.list[index];
        var isLastMsg = (index === messageCollection.list.length - 1);
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
        var messageCollection = MessageCacheCollection.getCurrent();
        var msg = messageCollection.list[index];
        var prevIndex = index - 1;
        var prevMessage;

        // 삭제된 메시지의 이전 메시지가 child text 또는 child comment가 아니라면
        // 이전 메시지의 뷰가 바뀌어야 한다(조건에 부합하는 이전 메시지는  메시지 작성 시간을 출력하지 않음).
        if (!messageCollection.hasChildText(prevIndex) ||
          !messageCollection.hasChildComment(prevIndex)) {
          prevMessage = messageCollection.list[prevIndex];
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
        var messageCollection = MessageCacheCollection.getCurrent();
        var list = messageCollection.list;
        _destroyCompiledScope();
        _.forEach(list, function(message, index) {
          _pushMarkup(htmlList, message, index);
        });
        el.empty().html(_getCompiledEl(htmlList.join('')));
        scope.onRepeatDone();
      }

      /**
       * preview 이벤트 핸들러
       * @param {object} angularEvent
       * @param {number|string} messageId
       * @private
       */
      function _onAttachMessagePreview(angularEvent, messageId) {
        var messageCollection = MessageCacheCollection.getCurrent();
        messageCollection.forEach(function(msg, index) {
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
        var messageCollection = MessageCacheCollection.getCurrent();
        messageCollection.forEach(function(msg, index) {
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
       * comment count refresh 이벤트 핸들러
       * @param {object} angularEvent
       * @param {number} messageId - fileId 혹은 pollId
       * @param {number} commentCount
       * @private
       */
      function _onRefreshCommentCount(angularEvent, messageId, commentCount) {
        _refreshCommentCount(messageId, commentCount);
      }

      
      /**
       * comment count 를 갱신한다.
       * @param {number} messageId
       * @param {number} commentCount
       * @private
       */
      function _refreshCommentCount(messageId, commentCount) {
        $('.comment-count-' + messageId).text(commentCount);
      }
    }
  }
})();
