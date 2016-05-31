/**
 * @fileoverview mention item renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MentionItemRenderer', MentionItemRenderer);

  /* @ngInject */
  function MentionItemRenderer($filter, memberService) {
    var that = this;
    var _template;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _template = Handlebars.templates['mention.list.item'];

      that.render = render;
    }

    /**
     * mention item을 랜더링한다.
     * @param {object} data
     * @returns {*}
     */
    function render(data, filterText) {
      data = _convertData(data);

      return _template({
        css: {
         isJandiBot: data.isJandiBot
        },
        html: {
          name: $filter('typeaheadHighlight')($filter('htmlEncode')(data.name), filterText)
        },
        image: data.image
      });
    }

    /**
     * render에서 사용가능한 data로 변환
     * @param data
     * @returns {{isJandiBot: boolean, name: *, image: *}}
     * @private
     */
    function _convertData(data) {
      return {
        isJandiBot: data.model.extIsJandiBot,
        name: data.label,
        image: data.model.extProfileImage
      };
    }
  }
})();
