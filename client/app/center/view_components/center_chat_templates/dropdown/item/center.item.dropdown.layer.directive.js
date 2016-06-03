/**
 * @fileoverview Center 아이템 dropdown 레이어 디렉티브
 * @author Young Park <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerItemDropdownLayer', centerTextDropdownLayer);

  function centerTextDropdownLayer($timeout, memberService) {
    return {
      restrict: 'E',
      controller: 'CenterItemDropdownLayerCtrl',
      templateUrl: 'app/center/view_components/center_chat_templates/dropdown/item/center.item.dropdown.layer.html',
      replace: true,
      link: link,
      scope: true
    };

    function link(scope, el, attr, ctrl) {
      var _jqMsgsContainer = $('#msgs-container');
      var _jqTarget;
      var _timerWrap;
      var _timer;
      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        _attachEvents();
        _jqTarget = el;
        _jqTarget.hide();
      }

      /**
       * 이벤트 리스너를 바인딩한다.
       * @private
       */
      function _attachEvents() {
        scope.$on('$destroy', _onDestroy);
        scope.$on('show:center-item-dropdown', _onShow);
        scope.$on('hide:center-item-dropdown', _onHide);
        scope.$on('toggle:center-item-dropdown', _onToggle);
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _detachDomEvents();
      }

      /**
       * show 이벤트 핸들러
       * @param angularEvent
       * @param data
       * @private
       */
      function _onShow(angularEvent, data) {
        _onHide();
        scope.target = data.target;
        scope.msg = data.msg;
        scope.isMyMessage = data.isMyMessage;
        scope.showAnnouncement = data.showAnnouncement;
        scope.hasStar = _.isBoolean(data.hasStar) ? data.hasStar : data.msg.message.contentType !== 'sticker';
        scope.isShown = true;

        scope.isAdmin = memberService.isAdmin();

        /*
        fixme: 현재 파악하지 못한 이유로 인해 1회의 timeout 으로는 우선순위가 뒤로 밀려, rendering 시점을 알 수 없음.
        따라서 현 시점에서는 비 정상적으로 2회의 timeout 을 사용함.
         */
        $timeout.cancel(_timerWrap);
        _timerWrap = $timeout(_setPositionWrap);
      }

      /**
       * show/hide 토글한다.
       * @param {event} angularEvent
       * @param {object} data
       * @private
       */
      function _onToggle(angularEvent, data) {
        if (_jqTarget.css('display') === 'block') {
          _onHide();
        } else {
          _onShow(angularEvent, data);
        }
      }

      /**
       * fixme. please remove this function.
       * 현재 파악하지 못한 이유로 인해 1회의 timeout 으로는 우선순위가 뒤로 밀려, rendering 시점을 알 수 없어
       * 현 시점에서는 비 정상적으로 2회의 timeout 을 사용함.
       * @private
       */
      function _setPositionWrap() {
        $timeout.cancel(_timer);
        _timer = $timeout(_setPosition);
      }

      /**
       * position 을 세팅한다.
       * @private
       */
      function _setPosition() {
        var target = scope.target;
        var offset = target.offset();
        var parentOffset = _jqTarget.parent().offset();
        // 조금 더 아름답게 노출하기 위해 왼쪽에서 보정값 20을 더하고 위에서 보정값 3을 뺀다.
        var left = offset.left + target.width() - _jqTarget.outerWidth() - parentOffset.left;
        var top = offset.top - _jqTarget.outerHeight() + $('#msgs-container').scrollTop() - parentOffset.top - 8;

        top = top < 0 ? 0 : top;

        if (_jqMsgsContainer.offset().left > left - el.width()) {
          // container에 가려서 dropdown menu가 안보임

          el.addClass('left-over');
        }

        _jqTarget.css({
          left: left + 'px',
          top: top + 'px'
        });
        _jqTarget.show();
        _attachDomEvents();
      }

      /**
       *
       * @private
       */
      function _onHide() {
        _jqTarget.hide();
        _detachDomEvents();
      }

      /**
       * dom 이벤트를 attach 한다.
       * @private
       */
      function _attachDomEvents() {
        $(window).on('click', _onHide);
        $(window).on('resize', _onHide);
      }

      /**
       * dom 이벤트를 detach 한다.
       * @private
       */
      function _detachDomEvents() {
        $(window).off('click', _onHide);
        $(window).off('resize', _onHide);
      }
    }
  }
})();
