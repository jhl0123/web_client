/**
 * @fileoverview Text renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TextRenderer', TextRenderer);

  /* @ngInject */
  function TextRenderer(MessageCollection, currentSessionHelper, jndPubSub, RendererUtil) {
    var _template;
    var _templateChild;
    var _templateLinkPreview;

    this.render = render;
    this.delegateHandler = {
      'click': _onClick
    };

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _templateChild = Handlebars.templates['center.text.child'];
      _template = Handlebars.templates['center.text'];
      _templateLinkPreview = Handlebars.templates['center.text.link.preview'];
    }


    /**
     * click 이벤트 핸들러
     * @param clickEvent
     * @private
     */
    function _onClick(clickEvent) {
      var jqTarget = $(clickEvent.target);
      var id = jqTarget.closest('.msgs-group').attr('id');

      if (jqTarget.hasClass('_textMore')) {
        _showMoreDropdown(jqTarget, MessageCollection.get(id));
      }
    }

    /**
     * '더보기' dropdown 을 노출한다.
     * @param {object} jqTarget
     * @param {object} msg
     * @private
     */
    function _showMoreDropdown(jqTarget, msg) {
      var entityType = currentSessionHelper.getCurrentEntityType();
      var showAnnouncement = (!RendererUtil.isSticker(msg) && entityType !== 'users');
      jndPubSub.pub('show:center-item-dropdown', {
        target: jqTarget,
        msg: msg,
        hasStar: msg.hasStar,
        isMyMessage: RendererUtil.isMyMessage(msg),
        showAnnouncement: showAnnouncement
      });
    }

    /**
     * index 에 해당하는 메세지를 rendering 한다.
     * @param {number} index
     * @returns {*}
     */
    function render(index) {
      var msg = MessageCollection.list[index];
      var isChild = MessageCollection.isChildText(index);
      var hasLinkPreview = MessageCollection.hasLinkPreview(index);
      var linkPreview = hasLinkPreview ? _templateLinkPreview({msg: msg}) : '';
      var template = isChild ? _templateChild : _template;
      return template({
        html: {
          linkPreview: linkPreview
        },
        css: {
          star: RendererUtil.getStarCssClass(msg),
          disabledMember: RendererUtil.getDisabledMemberCssClass(msg)
        },
        hasMore: RendererUtil.hasMore(msg),
        hasStar: RendererUtil.hasStar(msg),
        isSticker: RendererUtil.isSticker(msg),
        isChild: isChild,
        msg: msg
      });
    }
  }
})();