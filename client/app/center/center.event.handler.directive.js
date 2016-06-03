/**
 * @fileoverview center event handler directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerEventHandler', centerEventHandler);

  function centerEventHandler(jndPubSub) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el) {
      var jqWindow = $(window);
      var jqDocument = $(document);
      var jqBody = $('body');

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _on();
      }

      /**
       * on listeners
       * @private
       */
      function _on() {
        scope.$on('$destroy', _destroy);

        jqWindow
          .on('focus', _onWindowFocus)
          .on('blur', _onWindowBlur)
          .on('unload', _onWindowUnload);

        jqDocument.on('visibilitychange', _onVisibilityChange);
        jqBody.on('dragstart', _onDragStart);
      }

      /**
       * off listeners
       * @private
       */
      function _off() {
        jqWindow
          .off('focus', _onWindowFocus)
          .off('blur', _onWindowBlur)
          .off('unload', _onWindowUnload);

        jqDocument.off('visibilitychange', _onVisibilityChange);
        jqBody.off('dragstart', _onDragStart);
      }

      /**
       * scope destroy event handler
       * @private
       */
      function _destroy() {
        _off();
      }

      /**
       * window focus event handler
       * @private
       */
      function _onWindowFocus(event) {
        jndPubSub.pub('window:focus', event);
      }

      /**
       * window blur event handler
       * @private
       */
      function _onWindowBlur(event) {
        jndPubSub.pub('window:blur', event);
      }

      /**
       * window unload event handler
       * @param {object} event
       * @private
       */
      function _onWindowUnload(event) {
        jndPubSub.pub('window:unload', event);
      }

      /**
       * visibility change event handler
       * ref: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
       * @private
       */
      function _onVisibilityChange(event) {
        jndPubSub.pub('document:visibilityChange', event);
      }

      /**
       * drag start event handler
       * @private
       */
      function _onDragStart(event) {
        jndPubSub.pub('body:dragStart', event);
      }
    }
  }
})();
