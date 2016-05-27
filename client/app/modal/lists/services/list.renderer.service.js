/**
 * @fileoverview member list renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('ListRenderer', ListRenderer);

  /* @ngInject */
  function ListRenderer(ItemRenderFactory, $filter) {
    this.render = render;

    /**
     * member list를 랜더링한다.
     * @param {object} data
     * @param {string} data.type - renderer type
     * @param {array} data.list - topic list
     * @param {string} data.filterText
     * @param {object} data.viewport
     * @param {boolean} isUpdateList
     */
    function render(data, isUpdateList) {
      var elements = [];
      var itemRenderer = ItemRenderFactory.get(data.type);
      var i;
      var len;
      var item;

      var position;

      if (isUpdateList) {
        data.viewport.updateList(data.list);
      }

      position = data.viewport.getPosition();

      for (i = position.beginIndex, len = position.endIndex; i <= len; ++i) {
        item = data.list[i];

        if (item.name) {
          // data.name에 xss 방지
          item.extEncodedName = $filter('htmlEncode')(item.name);
        }

        elements.push(itemRenderer.render(item, data.filterText, data.filterType));
      }

      data.viewport.render(position, elements);
    }
  }
})();
