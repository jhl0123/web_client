/**
 * @fileoverview 입력창에서 sending 완료 전 까지 노출할 ng-repeat 을 사용하지 않은 dummy text 디렉티브
 * @see MessageSendingCollection
 * @author Soonyoung park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerMessagesSendingDirective', centerMessagesSendingDirective);

  function centerMessagesSendingDirective(MessageSendingCollection, MessageCacheCollection, MessageText, jndPubSub) {
    return {
      restrict: 'E',
      replace: true,
      link: link
    };

    function link(scope, el, attrs) {
      var _template = Handlebars.templates['center.text.sending'];

      _init();

      /**
       * 초기화 메서드
       * @private
       */
      function _init() {
        _attachScopeEvents();
        _attachDomEvents();
      }

      /**
       * scope 이벤트를 바인딩한다.
       * @private
       */
      function _attachScopeEvents() {
        scope.$on('MessageSendingCollection:reset', _reset);
        scope.$on('MessageSendingCollection:beforeRemove', _onBeforeRemove);
        scope.$on('MessageSendingCollection:afterRemove', _onAfterRemove);
        scope.$on('MessageSendingCollection:append', _onAppend);
        scope.$on('MessageSendingCollection:clearSentMessages', _reset);
        scope.$on('MessageSendingCollection:refresh', _onRefresh);
      }

      /**
       * dom 이벤트를 바인딩 한다.
       * @private
       */
      function _attachDomEvents() {
        el.on('click', _onClick);
      }

      /**
       * click 이벤트 핸들러
       * @param {Event} clickEvent
       * @private
       */
      function _onClick(clickEvent) {
        var jqTarget = $(clickEvent.target);
        if (jqTarget.closest('._retry').length) {
          _retry(jqTarget);
        } else if (jqTarget.closest('._textMore').length) {
          _onClickMore(jqTarget);
        }
      }

      /**
       * 전송을 재시도 한다.
       * @param {object} jqTarget - retry 를 입력한 target element
       * @private
       */
      function _retry(jqTarget) {
        var list = MessageSendingCollection.list;
        var index = _.findIndex(list, {
          id: jqTarget.closest('.msgs-group').attr('id')
        });
        var msg = list[index];
        var payload = msg._payload;
        var contentType = msg.message.contentType;
        var content = payload.content;
        var sticker = payload.sticker;
        var mentions = payload.mentions;

        if (contentType === 'sticker') {
          content = '';
          mentions = null;
        } else {
          sticker = null;
        }

        scope.post(content, sticker, mentions);
        MessageSendingCollection.remove(msg);
      }

      /**
       * 더보기 버튼 클릭 이벤트 핸들러
       * @param {object} jqTarget
       * @private
       */
      function _onClickMore(jqTarget) {
        var list = MessageSendingCollection.list;
        var index = _.findIndex(list, {
          id: jqTarget.closest('.msgs-group').attr('id')
        });
        jndPubSub.pub('show:center-item-dropdown', {
          target: jqTarget,
          msg: list[index],
          hasStar: false,
          isMyMessage: true,
          showAnnouncement: false
        });
      }

      /**
       * reset 한다
       * @private
       */
      function _reset() {
        var list = MessageSendingCollection.list;
        var htmlList = [];
        _.forEach(list, function (msg, index) {
          htmlList.push(_render(index));
        });
        el.html(htmlList);
      }

      /**
       * remove 수행 전 이벤트 콜백
       * @param {object} angularEvent
       * @param {number} index
       * @private
       */
      function _onBeforeRemove(angularEvent, index) {
        var id = MessageSendingCollection.list[index].id;
        var jqTarget = $('#' + id);

        jqTarget.remove();
      }

      /**
       * remove 수행 이후 콜백
       * @private
       */
      function _onAfterRemove() {
        var list = MessageSendingCollection.list;
        if (list.length) {
          _refresh(list[0].id);
        }
      }

      /**
       * append 콜백
       * @param {object} angularEvent
       * @param {object} msg
       * @private
       */
      function _onAppend(angularEvent, msg) {
        el.append(_render(MessageSendingCollection.indexOf(msg.id)));
      }

      /**
       * refresh 콜백
       * @param {object} angularEvent
       * @param {string|number} id
       * @private
       */
      function _onRefresh(angularEvent, id) {
        _refresh(id);
      }

      /**
       * id 에 해당하는 element 를 현재 데이터에 맞게 다시 랜더링 한다.
       * @param {string|number} id
       * @private
       */
      function _refresh(id) {
        var jqTarget = $('#' + id);
        var index = MessageSendingCollection.indexOf(id);

        if (jqTarget.length && index !== -1) {
          jqTarget.replaceWith(_render(index));
        }
      }

      /**
       * index 에 해당하는 sending 데이터를 활용하여 생성한 html 문자열을 반환한다.
       * @param {number} index
       * @returns {string}
       * @private
       */
      function _render(index) {
        var list = MessageSendingCollection.list;
        var msg = list[index];
        var hasProfile = false;
        var messageCollection = MessageCacheCollection.getCurrent();
        var lastMsg = messageCollection.list[messageCollection.list.length - 1];
        if (!index) {
          hasProfile = !MessageText.isChild(1, [lastMsg, msg]);
        }
        return _template({
          css: {
            child: hasProfile ? '' : 'text-child'
          },
          hasProfile: hasProfile,
          msg: msg,
          id: msg.id,
          isSticker: msg.message.contentType === 'sticker',
          isFailed: msg.status === 'failed'
        });
      }
    }
  }
})();
