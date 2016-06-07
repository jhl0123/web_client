/**
 * @fileoverview Text renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TextRenderer', TextRenderer);

  /* @ngInject */
  function TextRenderer($filter, MessageCacheCollection, currentSessionHelper, jndPubSub, RendererUtil, memberService) {
    var _encodeHTML = $filter('htmlEncode');

    var _template;
    var _templateChild;

    var _templateAttachment;
    var _templateLinkPreview;
    var _templateConnectPreview;

    this.render = render;
    this.events = {
      'click': [
        {
          currentTarget: '._textMore',
          handler: _showMoreDropdown
        },
        {
          currentTarget: '._link-preview',
          handler: _openLinkPreviewUrl
        }
      ]
    };

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _template = Handlebars.templates['center.text'];
      _templateChild = Handlebars.templates['center.text.child'];

      _templateAttachment = Handlebars.templates['center.text.attachment'];
      _templateLinkPreview = Handlebars.templates['center.text.link.preview'];
      _templateConnectPreview = Handlebars.templates['center.text.connect.preview'];
    }

    /**
     * '더보기' dropdown 을 노출한다.
     * @param {object} clickEvent
     * @param {object} data
     * @private
     */
    function _showMoreDropdown(clickEvent, data) {
      var entityType = currentSessionHelper.getCurrentEntityType();
      var showAnnouncement = _isShowAnnouncement(data.msg, entityType);
      jndPubSub.pub('show:center-item-dropdown', {
        target: data.jqTarget,
        msg: data.msg,
        hasStar: data.msg.hasStar,
        isMyMessage: RendererUtil.isMyMessage(data.msg),
        showAnnouncement: showAnnouncement
      });
    }

    /**
     * open link preview url
     * @param {object} clickEvent
     * @param {object} data
     * @private
     */
    function _openLinkPreviewUrl(clcikEvent, data) {
      var jqLinkPreview = data.jqTarget.parents('._link-preview');
      var href;
      var target;

      if (jqLinkPreview.length > 0) {
        href = jqLinkPreview.data('href');
        target = jqLinkPreview.data('target');

        window.open(href, target);
      }
    }

    /**
     * 공지등록 버튼의 출력 여부
     * @param {object} msg
     * @param {string} entityType
     * @returns {boolean|*|boolean|*}
     * @private
     */
    function _isShowAnnouncement(msg, entityType) {
      // message가 스티커가 아니며 message를 작성한 작성자가 반드시 user(bot이 아님)여야 하고
      // 현재 center의 chat list가 channel(topic)인 경우 공지사항으로 등록 가능하다
      return (!RendererUtil.isSticker(msg) && _isTopic(entityType) && memberService.isUser(msg.message.writerId));
    }

    /**
     * 해당 entityType 이 topic 인지 여부를 반환한다.
     * @param {string} entityType
     * @returns {boolean}
     * @private
     */
    function _isTopic(entityType) {
      return entityType === 'channels' || entityType === 'privategroups';
    }

    /**
     * index 에 해당하는 메세지를 rendering 한다.
     * @param {number} index
     * @returns {*}
     */
    function render(index) {
      var messageCollection = MessageCacheCollection.getCurrent();
      var msg = messageCollection.list[index];
      var isChild = messageCollection.isChildText(index);
      var isSticker = RendererUtil.isSticker(msg);
      var template = isChild ? _templateChild : _template;

      var linkPreview = _getLinkPreview(msg, index);
      var connectPreview = _getConnectPreview(msg, index);
      var profileCursor;

      if (memberService.isConnectBot(msg.message.writerId)) {
        // connect bot이 작성한 message이면 cursor를 default로 설정한다.
        profileCursor = '';
      } else {
        profileCursor = 'cursor_pointer';
      }

      return {
        conditions: _getConditions(msg, isChild, isSticker),
        template: template({
          html: {
            linkPreview: linkPreview,
            connectPreview: connectPreview
          },
          css: {
            star: RendererUtil.getStarCssClass(msg.message),
            starIcon: msg.message.isStarred ? 'icon-star-on' : 'icon-star-off',
            disabledMember: RendererUtil.getDisabledMemberCssClass(msg),
            profileCursor: profileCursor
          },
          hasMore: RendererUtil.hasMore(msg),
          hasStar: RendererUtil.hasStar(msg),
          hasLinkPreview: !!linkPreview,
          hasConnectPreview: !!connectPreview,
          isSticker: isSticker,
          isChild: isChild,
          hasChild: messageCollection.hasChildText(index),
          msg: msg
        })
      };
    }

    /**
     * message의 상태들 전달함
     * @param {object} msg
     * @param {boolean} isChild
     * @param {boolean} isSticker
     * @returns {array}
     * @private
     */
    function _getConditions(msg, isChild, isSticker) {
      var conditions = ['text', 'non-selectable'];

      conditions.push(_getMsgItemClass(msg));

      if (isChild) {
        conditions.push('text-child');
      }

      if (isSticker) {
        conditions.push('sticker');
      }

      return conditions;
    }

    /**
     * get msg item class
     * @param {object} msg
     * @returns {*}
     * @private
     */
    function _getMsgItemClass(msg) {
      var result = [];
      if (memberService.isConnectBot(msg.message.writerId)) {
        result.push('bot-text');
      }

      if (memberService.isJandiBot(msg.message.writerId)) {
        result.push('jandi-bot');
      }

      return result.join(' ');
    }

    /**
     * msg에 보여줄 link preview가 있으면 보여주고 없으면 안보여주는 template을 리턴한다.
     * @param {object} msg - message object
     * @param {number} index - index to look up
     * @returns {string}
     * @private
     */
    function _getLinkPreview(msg, index) {
      var messageCollection = MessageCacheCollection.getCurrent();
      var html = '';
      var linkPreview;

      if (messageCollection.hasLinkPreview(index)) {
        if (msg.message.linkPreview.extThumbnail) {
         msg.message.linkPreview.extThumbnail.hasSuccess = RendererUtil.hasThumbnailCreated(msg.message.linkPreview);
        } else {
          msg.message.linkPreview.extThumbnail = {
            hasSuccess: RendererUtil.hasThumbnailCreated(msg.message.linkPreview)
          };
        }

        linkPreview = _templateLinkPreview({
          css: {
            loading: msg.message.linkPreview.extThumbnail.isWaiting ? 'is-loading': '',
            image: msg.message.linkPreview.extThumbnail.hasSuccess ? 'has-image' : '',
            domain: msg.message.linkPreview.domain ? 'has-domain' : ''
          },
          html: {
            title: msg.message.linkPreview.title,
            description: msg.message.linkPreview.description,
            domain: msg.message.linkPreview.domain,
            imageUrl: _getSafeUrl(msg.message.linkPreview.imageUrl),
            linkUrl: _getSafeUrl(msg.message.linkPreview.linkUrl)
          },
          msg: msg
        });

        html = _templateAttachment({
          html: {
            content: linkPreview
          }
        });
      }

      return html;
    }

    /**
     * msg에 보여줄 connect preview가 있으면 보여주고 없으면 안보여주는 template을 전달한다.
     * @param msg
     * @param index
     * @private
     */
    function _getConnectPreview(msg, index) {
      var messageCollection = MessageCacheCollection.getCurrent();
      var html = '';
      var content = msg.message.content;
      var connectPreview;

      if (messageCollection.hasConnectPreview(index)) {
        connectPreview = '';

        _.each(content.connectInfo, function(info) {
          connectPreview += _getConnectPreviewItem(info);
        });

        if (connectPreview) {
          html = _templateAttachment({
            html: {
              content: connectPreview
            },
            style: {
              bar: 'background-color: ' + (content.connectColor || '#000') + ';'
            }
          });
        }
      }

      return html;
    }

    /**
     * connect preview를 구성하는 개별 item 전달
     * @param {object} info
     * @returns {string}
     * @private
     */
    function _getConnectPreviewItem(info) {
      var markdown = $filter('markdown');
      var result = '';

      var hasTitle;
      var hasDescription;
      var hasImage;

      if (_.isObject(info)) {
        hasTitle = !!info.title;
        hasDescription = !!info.description;
        hasImage = !!info.imageUrl;

        if (hasTitle || hasDescription || hasImage) {
          result = _templateConnectPreview({
            html: {
              title: markdown(_encodeHTML(info.title)),
              description: markdown(_encodeHTML(info.description)),
              image: _getConnectImage(info.imageUrl)
            },
            hasTitle: hasTitle,
            hasDescription: hasDescription,
            hasImage: hasImage,
            hasSubsets: false
          });
        }
      }

      return result;
    }

    /**
     * get connect image
     * @param {string} imageUrl
     * @returns {string}
     * @private
     */
    function _getConnectImage(imageUrl) {
      var html = '';
      var url;

      if (imageUrl != null) {
        html = '<a href="' + _getSafeUrl(imageUrl) + '" target="_blank">' + _encodeHTML(imageUrl) + '</a>';
      }

      return html;
    }

    /**
     * get safe url
     * @param {string} url
     * @returns {*}
     * @private
     */
    function _getSafeUrl(url) {
      return /[\\<>"]/.test(url) ? encodeURIComponent(url) : url;
    }
  }
})();
