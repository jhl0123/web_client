(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('chats', chats);

  function chats() {
    return {
      restrict: 'EA',
      scope: true,
      link: link,
      transclude: true,
      replace: true,
      templateUrl: 'app/left/chats/chats.html',
      controller: 'ChatsCtrl'
    };

    function link(scope, el, attrs) {
      _init();

      function _init() {
        _attachEvents();
      }
      /**
       * 이벤트 핸들러 바인딩
       * @private
       */
      function _attachEvents() {
        el.find('.lpanel-list__header').on('mouseover', _onMouseOverHeader)
          .on('mouseout', _onMouseOutHeader);
      }

      function _onMouseOverHeader() {
        el.find('.left-header-badge').addClass('hide');
      }

      function _onMouseOutHeader() {
        el.find('.left-header-badge').removeClass('hide');
      }

    }
  }
})();