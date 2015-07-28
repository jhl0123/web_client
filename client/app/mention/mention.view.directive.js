/**
 * @fileoverview 멘션 view 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('mentionView', mentionView);

  /**
   *
   * @returns {{restrict: string, scope: {src: string}, link: link}}
   */
  function mentionView(entityAPIservice, jndPubSub) {

    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el, attrs) {
      var _id;
      var _type;

      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        _type = attrs.mentionType;
        _id = attrs.mentionView;

        el.addClass('mention')
          .addClass('cursor_pointer');

        _attachEvents();
        _attachDomEvents();
      }

      /**
       * 이벤트를 바인딩한다.
       * @private
       */
      function _attachEvents() {
        scope.$on('$destroy', _onDestroy);
      }

      /**
       * dom 이벤트 바인딩한다.
       * @private
       */
      function _attachDomEvents() {
        el.on('click', _onClick);
      }

      /**
       * dom 이벤트 바인딩 해제 한다.
       * @private
       */
      function _detachDomEvents() {
        el.off('click', _onClick);
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _detachDomEvents();
      }

      /**
       * 클릭 이벤트 핸들러
       * @private
       */
      function _onClick() {
        var entity;
        if (_type === 'member') {
          entity = entityAPIservice.getUserEntity(_id);
          jndPubSub.pub('onUserClick', entity);
        } else if (_type === 'room') {
          //entity = entityAPIservice.getTopicEntity(_id);
        }

      }
    }
  }
})();
