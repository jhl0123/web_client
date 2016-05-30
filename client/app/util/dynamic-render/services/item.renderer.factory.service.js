/**
 * @fileoverview list renderer factory 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('ItemRenderFactory', ItemRenderFactory);

  /* @ngInject */
  function ItemRenderFactory(MemberItemRenderer, TopicItemRenderer, RoomItemRenderer, MentionItemRenderer) {
    var that = this;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      that.get = get;
    }

    /**
     * contentType 에 해당하는 renderer 를 반환한다.
     * @param {string} type
     * @returns {*}
     */
    function get(type) {
      var renderer;

      switch (type) {
        case 'member':
          renderer = MemberItemRenderer;
          break;
        //text 와 sticker 는 동일한 renderer 를 사용
        case 'topic':
          renderer = TopicItemRenderer;
          break;
        case 'room':
          renderer = RoomItemRenderer;
          break;
        case 'mention':
          renderer = MentionItemRenderer;
          break;
      }

      return renderer;
    }
  }
})();
