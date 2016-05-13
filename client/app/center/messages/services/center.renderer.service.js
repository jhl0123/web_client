/**
 * @fileoverview Center renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('CenterRenderer', CenterRenderer);

  /* @ngInject */
  function CenterRenderer($filter, MessageCollection, CenterRendererFactory) {
    var _template = '';

    this.render = render;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _initHandlebarsHelper();
      _template = Handlebars.templates['center.main'];
    }

    /**
     * Handlebars 템플릿 엔진의 helper 를 등록 한다.
     * @private
     */
    function _initHandlebarsHelper() {
      Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
        switch (operator) {
          case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
          case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
          case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
          case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
          case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
          case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
          case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      });
      Handlebars.registerHelper('translate', function(key) {
        return $filter('translate')(key);
      });
    }

    /**
     * index 에 해당하는 메세지를 랜더링한다.
     * @param {number} index
     * @returns {*}
     */
    function render(index, type) {
      var hasId = _.isUndefined(type);
      var msg = MessageCollection.list[index];
      var contentType = type || msg.message.contentType;
      var renderer = CenterRendererFactory.get(contentType);
      var content = renderer ? renderer.render(index) : '';

      var context;

      if (_.isObject(content)) {
        context = {
          css: {
            className: content.className || ''
          },
          content: content.template,
          contentType: contentType
        }
      } else {
        context = {
          content: content,
          contentType: contentType
        };
      }


      if (hasId) {
        context.id = msg.id;
      }

      return _template(context);
    }
  }
})();
