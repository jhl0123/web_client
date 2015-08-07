(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerFileDropdownLayer', centerFileDropdownLayer);

  function centerFileDropdownLayer($timeout, configuration) {
    return {
      restrict: 'E',
      controller: 'CenterFileDropdownLayerCtrl',
      templateUrl: 'app/center/view_components/center_chat_templates/dropdown/file/center.file.dropdown.layer.html',
      replace: true,
      link: link,
      scope: true
    };

    function link(scope, el, attr, ctrl) {
      var _jqTarget;
      var _timerWrap;
      var _timer;
      var _regxHTTP = /^[http|https]/i;

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
        scope.$on('show:center-file-dropdown', _onShow);
        scope.$on('hide:center-file-dropdown', _onHide);
        scope.$on('toggle:center-file-dropdown', _onToggle);
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
        var fileUrl = data.msg.message.content.fileUrl;
        var fileTitle = data.msg.message.content.title;
        _onHide();

        scope.target = data.target;
        scope.msg = data.msg;
        scope.isIntegrateFile = data.isIntegrateFile;
        scope.isShown = true;

        scope.hasProtocol = _regxHTTP.test(fileUrl);

        if (scope.hasProtocol) {
          scope.downloadUrl = fileUrl;
          scope.originalUrl = fileUrl;
        } else {
          scope.downloadUrl = configuration.api_address + 'download/' + fileUrl;
          scope.originalUrl = configuration.server_uploaded + fileUrl;
        }

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
        //var left = offset.left + target.outerWidth() - _jqTarget.outerWidth() - parentOffset.left + 20;
        var left = offset.left - parentOffset.left;
        var top = offset.top - _jqTarget.outerHeight() + $('#msgs-container').scrollTop() - parentOffset.top - 3;

        top = top < 0 ? 0 : top;

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
      }

      /**
       * dom 이벤트를 detach 한다.
       * @private
       */
      function _detachDomEvents() {
        $(window).off('click', _onHide);
      }
    }
  }
})();