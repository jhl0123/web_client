
/**
 * window 간 통신을 위한 postMessage 디렉티브
 */
(function() {
  'use strict';

  angular.
    module('jandiApp')
    .directive('windowPostMessage', windowPostMessage);

  /* @ngInject */
  function windowPostMessage(JndUtil, jndPubSub) {

    return {
      restrict: 'A',
      scope: false,
      link: link
    };

    function link(scope, el, attrs) {
      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        _attachDomEvents();
      }

      /**
       * dom event 를 바인딩 한다
       * @private
       */
      function _attachDomEvents() {
        $(window).on('message', _onMessageReceive);
      }

      /**
       * message 이벤트 핸들러
       * @param {object} messageEvent
       * @private
       */
      function _onMessageReceive(messageEvent) {
        var origin = messageEvent.originalEvent.origin;
        var data;

        if (_isWhiteUrl(origin)) {
          data = _parsePostMessageData(messageEvent.originalEvent.data);
          if (data.eventName) {
            JndUtil.safeApply(scope, function() {
              jndPubSub.pub(data.eventName, data.eventArgs);
            });
          }
        }
      }

      /**
       * event parse
       * @param {string} data - postMessage로 전달된 문자열 data(ex: eventNAme#args1#args2#..)
       * @returns {{name: String, args: Array}}
       * @private
       */
      function _parsePostMessageData(data) {
        var args = [];
        data = data || '';
        data = data.split('#');

        if (data[1]) {
          _.each(data, function(value, index) {
            if (index > 0) {
              args.push(value);
            }
          });
        }

        return {
          eventName: data[0],
          eventArgs: args
        };
      }

      /**
       * 안전한 url 인지 확인한다.
       * @param {string} url
       * @returns {boolean}
       * @private
       */
      function _isWhiteUrl(url) {
        return /^https?:\/\/[^\/\.]+.jandi.(com|io)/.test(url);
      }
    }
  }
})();
