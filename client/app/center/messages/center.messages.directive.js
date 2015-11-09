/**
 * @fileoverview 각 토픽마다 생성되는 announcement directive
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerMessagesDirective', centerMessagesDirective);

  function centerMessagesDirective($compile, $filter, $state, CenterRenderer, CenterRendererFactory, MessageCollection,
                                   StarAPIService, jndPubSub, fileAPIservice, memberService, Dialog, currentSessionHelper,
                                   EntityMapManager) {
    return {
      restrict: 'E',
      replace: true,
      link: link
    };

    function link(scope, el, attrs) {
      var _teamId;
      var _listScope = scope.$new();
      var that = this;

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        _teamId = memberService.getTeamId();
        _attachEvents();
        _attachDomEvents();
        _renderAll();
      }

      /**
       * angular event 를 바인딩한다.
       * @private
       */
      function _attachEvents() {
        scope.$on('messages:reset', _renderAll);
        scope.$on('messages:append', _onAppend);
        scope.$on('messages:prepend', _onPrepend);
        scope.$on('messages:beforeRemove', _onBeforeRemove);
        scope.$on('messages:remove', _onRemove);
        scope.$on('messages:set', _renderAll);

        scope.$on('messages:updateUnread', _onUpdateUnread);

        scope.$on('starred', _onStarred);
        scope.$on('unStarred', _onUnStarred);

        scope.$on('$destroy', _onDestroy);

        scope.$on('updateCenterForRelatedFile', _onFileUpdated);
        scope.$on('centerOnFileDeleted', _onFileDeleted);

        scope.$on('toggleLinkPreview', _onAttachMessagePreview);
        scope.$on('updateMemberProfile', _onUpdateMemberProfile);
        scope.$on('createdThumbnailImage', _onCreatedThumbnailImage);
        scope.$on('fileShared', _onFileShareStatusChange);
        scope.$on('fileUnshared', _onFileShareStatusChange);
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
        return fileAPIservice.getFileDetail(fileId)
          .success(function(response) {
            var shareEntities;
            _.forEach(response.messageDetails, function(item) {
              if (item.contentType === 'file') {
                shareEntities = _toEntityIdList(item.shareEntities);
              }
            });
            _.forEach(MessageCollection.list, function(msg, index) {
              if (msg.message.id === fileId) {
                msg.message.shareEntities = shareEntities;
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
          entity = EntityMapManager.get('total', memberId);
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
          .on('click', _onClick)
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
        var list = MessageCollection.list;
        var member = data.member;
        var id = member.id;

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
        _.forEach(renderers, function(renderer) {
          if (renderer.delegateHandler) {
            _attachEachDelegateHandler(renderer.delegateHandler);
          }
        });
      }

      /**
       * 각각의 dom event handler 를 추가한다.
       * @param {Object} handlers
       * @private
       */
      function _attachEachDelegateHandler(handlers) {
        _.each(handlers, function(handler, eventName) {
          el.on(eventName, handler);
        });
      }

      /**
       * delegation 을 사용하지 않고,
       * 각각의 Renderer 에 설정된 이벤트 핸들러를 바인딩 한다.
       * (현재 사용하지 않는 함수. 추후 사용 가능성 있음.)
       * @param {object} jqTarget
       * @param {object} renderer
       * @private
       * @deprecated
       */
      function _attachRendererHandler(jqTarget, renderer) {
        if (renderer.eventHandler) {
          _.each(renderer.eventHandler, function(handler, name) {
            var tmp = name.split(' '),
              eventName = tmp[0],
              selector = tmp[1] || '';

            if (selector) {
              jqTarget = jqTarget.find(selector);
            }
            jqTarget.on(eventName, handler);
          });
        }
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _destroyCompiledScope(el);
      }

      /**
       * 모든 랜더러 공통 click 이벤트 핸들러
       * @param {Event} clickEvent
       * @private
       */
      function _onClick(clickEvent) {
        var jqTarget = $(clickEvent.target);
        var id = jqTarget.closest('.msgs-group').attr('id');
        var msg = MessageCollection.get(id);

        //star 클릭 시
        if (jqTarget.closest('._star').length) {
          _onClickStar(msg);
        } else if (jqTarget.closest('._user').length) {
          _onClickUser(msg);
        } else if (jqTarget.closest('._fileShare').length) {
          _onClickFileShare(msg);
        } else if (jqTarget.closest('._fileGo').length) {
          _onClickFileGo(msg);
        }
      }

      /**
       * 우측 패널 오픈
       * @param {Object} msg
       * @private
       */
      function _onClickFileGo(msg) {
        var contentType = msg.message.contentType;
        var userName = $filter('getName')(msg.message.writerId);;
        var itemId = msg.message.id;

        if (msg.feedback && contentType !== 'file') {
          userName = $filter('getName')(msg.feedback.writerId);
          itemId = msg.feedback.id;
        }
        $state.go('files', {
          userName: userName,
          itemId: itemId
        });
      }

      /**
       * file share click 이벤트 핸들러
       * @param {object} msg
       * @private
       */
      function _onClickFileShare(msg) {
        scope.onShareClick(msg.message);
      }

      /**
       * star click 핸들러
       * @param {object} msg
       * @private
       */
      function _onClickStar(msg) {
        var index = MessageCollection.at(msg.messageId);
        msg.message.isStarred = !msg.message.isStarred;
        _refreshStar(msg);
        if (msg.message.isStarred) {
          StarAPIService.star(msg.messageId, _teamId)
            .error(_.bind(_onStarRequestError, that, msg));
        } else {
          StarAPIService.unStar(msg.messageId, _teamId)
            .error(_.bind(_onStarRequestError, that, msg));
        }
      }

      /**
       * star 오류 핸들러
       * @param {object} msg
       * @private
       */
      function _onStarRequestError(msg) {
        msg.message.isStarred = !msg.message.isStarred;
        _refreshStar(msg);

        Dialog.error({
          title: $filter('translate')('@star-forbidden')
        });
      }

      /**
       * user 클릭 이벤트 핸들러
       * @param {object} msg
       * @private
       */
      function _onClickUser(msg) {
        jndPubSub.pub('onUserClick', msg.extWriter.id);
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
        var msg = MessageCollection.getByMessageId(param.messageId);
        var index;

        if (_teamId.toString() === param.teamId.toString()) {
          msg.message.isStarred = true;
          _refreshStar(msg);
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
        var msg = MessageCollection.getByMessageId(param.messageId);
        var index;
        if (_teamId.toString() === param.teamId.toString()) {
          msg.message.isStarred = false;
          _refreshStar(msg);
        }
      }

      /**
       * star 의 상태를 변경한다.
       * @param {object} msg
       * @private
       */
      function _refreshStar(msg) {
        var jqTarget = $('#' + msg.id).find('._star');
        if (jqTarget.length) {
          if (msg.message.isStarred) {
            jqTarget.removeClass('off').removeClass('msg-item__action');
          } else {
            jqTarget.addClass('off msg-item__action');
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
        _.forEach(list, function(message) {
          _pushMarkup(htmlList, message, index);
          index++;
        });
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
          try {
            $compile(targetEl)(_listScope);
          } catch (e) {
            console.error(e);
          }
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
       * thumbnail 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} socketData
       * @private
       */
      function _onCreatedThumbnailImage(angularEvent, socketData) {
        var messageId = socketData.data.message.id;
        MessageCollection.forEach(function(msg, index) {
          if (messageId === (msg.message && msg.message.id) && !msg.message.content.extHasPreview) {
            // back-end에서 link
            msg.message.content.extHasPreview = true;
            msg.message.content.extIsNewImage = false;
            msg.message.content.extraInfo = socketData.data.message.content.extraInfo;
            _refresh(msg.id, index);
            return false;
          }
        });
      }
    }
  }
})();
