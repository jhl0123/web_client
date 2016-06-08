/**
 * @fileoverview Date divider
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('DateDividerRenderer', DateDividerRenderer);

  /* @ngInject */
  function DateDividerRenderer(MessageCacheCollection) {
    var _template = '';

    this.render = render;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _template = Handlebars.templates['center.date.divider'];
    }

    /**
     * index 에 해당하는 메세지를 랜더링한다.
     * @param {number} index
     * @returns {*}
     */
    function render(index) {
      var messageCollection = MessageCacheCollection.getCurrent();
      var msg = messageCollection.list[index];

      return {
        conditions: ['system-event', 'date-divider'],
        template: _template({
          msg: msg,
          date: msg.date
        })
      };
    }
  }
})();
