/**
 * @fileoverview Text renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('UnreadBookmarkRenderer', UnreadBookmarkRenderer);

  /* @ngInject */
  function UnreadBookmarkRenderer() {
    var _template;

    this.render = render;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _template = Handlebars.templates['center.unread.bookmark'];
    }

    function render(){
      return {
        className: 'system-event unread-mark',
        template: _template()
      };
    }
  }
})();
