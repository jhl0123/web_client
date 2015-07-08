/**
 * @fileoverview announcement 관련 소켓 이벤트에 따라 다른 로직으로 처리하는 곳.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketAnnouncement', jndWebSocketAnnouncement);

  /* @ngInject */
  function jndWebSocketAnnouncement(jndPubSub, messageAPIservice, entityAPIservice, currentSessionHelper, memberService,
                              logger, $state, configuration, config, DesktopNotification) {

    var ANNOUNCEMENT_CREATED =  config.socketEvent.announcement.created;
    var ANNOUNCEMENT_DELETED = config.socketEvent.announcement.deleted;
    var ANNOUNCEMENT_STATUS_UPDATED = config.socketEvent.announcement.status_updated;

    this.onAnnouncementEvent = onAnnouncementEvent;

    function onAnnouncementEvent(data) {
      switch (data.event) {
        case ANNOUNCEMENT_CREATED:
          _onAnnouncementCreated(data);
          break;
        case ANNOUNCEMENT_DELETED:
          _onAnnouncementDeleted(data);
          break;
        case ANNOUNCEMENT_STATUS_UPDATED:
        default:
          _onAnnouncementStatusUpdated(data);
          break;
      }
      _announcementLogger(data);
    }

    /**
     * announcement 가 생성됐다는 소켓 이벤트를 처리한다.
     * @param {object} data - socket event param
     * @private
     */
    function _onAnnouncementCreated(data) {
      jndPubSub.pub(config.socketEvent.announcement.created, data.data);
    }

    /**
     * announcement 가 삭제됐다는 소켓 이벤트를 처리한다.
     * @param {object} data - socket event param
     * @private
     */
    function _onAnnouncementDeleted(data) {
      jndPubSub.pub(config.socketEvent.announcement.deleted, data.data);
    }

    /**
     * announcement 의 status 가 변경됐다는 소켓 이벤트를 처리한다.
     * @param {object} data - socket event param
     * @private
     */
    function _onAnnouncementStatusUpdated(data) {
      jndPubSub.pub(config.socketEvent.announcement.status_updated, data.data);

    }

    function _announcementLogger(data) {
      var type = data.event;
      var action;

      if (config.name === 'local' || config.name === 'development') {
        console.log("============  announcement ========================");
        if (type === ANNOUNCEMENT_STATUS_UPDATED) {
          action = 'STATUS UPDATED';
        } else {
          if (type === ANNOUNCEMENT_CREATED) {
            action = 'CREATED';
          } else if (type === ANNOUNCEMENT_DELETED) {
            action = 'DELETED';
          }
        }
        console.log('action: ', action);
        console.log('topic id: ', data.data.topicId);

        console.log('')
      }
    }
  }
})();