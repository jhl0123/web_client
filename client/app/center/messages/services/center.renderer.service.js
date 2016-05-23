/**
 * @fileoverview Center renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('CenterRenderer', CenterRenderer);

  /* @ngInject */
  function CenterRenderer($filter, MessageCollection, CenterRendererFactory, memberService) {
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

      var context = {
        css: {
          conditions: []
        }
      };

      if (_.isObject(content)) {
        context.css.conditions = content.conditions || [];
        context.content = content.template;
        context.contentType = contentType;
      } else {
        context.content = content;
        context.contentType = contentType;
      }

      if (_isSelf(msg)) {
        context.css.conditions.push('self');
      }

      if (hasId) {
        context.id = msg.id;
      }

      // message의 상태를 나타내는 className을 설정한다.
      context.css.conditions = context.css.conditions.join(' ');

      return _template(context);
    }

    /**
     * 현재 사용자가 message 작성자인지 여부를 반환한다.
     * @param {object} msg
     * @returns {boolean}
     * @private
     */
    function _isSelf(msg) {
      return msg.message.writerId === memberService.getMemberId();
    }
  }
})();
