/**
 * @fileoverview System 이벤트를 랜더링한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('SystemEventRenderer', SystemEventRenderer);

  /* @ngInject */
  function SystemEventRenderer($filter, MessageCacheCollection, language) {

    var _template = '';

    this.render = render;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _template = Handlebars.templates['center.system.event'];
    }

    /**
     * Event type 에 따른 rendering 시 사용할 key 값을 반환한다.
     * @param {object} msg
     * @returns {{}}
     * @private
     */
    function _getEventTypeStatus(msg) {
      var status = {};
      switch (msg.info.eventType) {
        case 'invite':
          status.isInvite = true;
          break;
        case 'announcement_deleted':
          status.isAnnouncementDeleted = true;
          break;
        case 'announcement_created':
          status.isAnnouncementCreated = true;
          break;
      }
      return status;
    }

    /**
     * Translation 한 결과값을 반환한다.
     * @param {String} key - L10N Key 값
     * @param {Object} mapper - 변환할 Map 값
     * @returns {*}
     * @private
     */
    function _getPreTranslation(key, mapper) {
      return $filter('template')($filter('translate')(key), mapper);
    }

    /**
     * index 에 해당하는 메세지를 랜더링한다.
     * @param {number} index
     * @returns {*}
     */
    function render(index) {
      var messageCollection = MessageCacheCollection.getCurrent();
      var msg = messageCollection.list[index];
      var filter = $filter('getName');
      var length = (msg && msg.message && msg.message.invites && msg.message.invites.length) || 0;
      var invitees = [];
      var lang = language.preferences.language;
      var hasPostfix = !!(lang === 'ko' || lang === 'ja');
      var status = _getEventTypeStatus(msg);

      _.forEach(msg.message.invites, function(invitee, index) {
        invitees.push({
          name: filter(invitee),
          isLast: length - 1 === index
        });
      });

      return {
        conditions: ['system-event', 'noti'],
        template: _template({
          text: {
            announcement:  {
              deleted: _getPreTranslation('@system-msg-announcement-deleted', {
                msg: msg
              }),
              created: _getPreTranslation('@system-msg-announcement-created', {
                msg: msg
              })
            }
          },
          status: status,
          hasPostfix: hasPostfix,
          msg: msg,
          invitees: invitees
        })
      };
    }
  }
})();
