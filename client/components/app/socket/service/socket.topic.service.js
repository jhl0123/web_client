/**
 * @fileoverview topic 관련 socket event를 처리한다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketTopic', TopicSocket);

  /* @ngInject */
  function TopicSocket(jndPubSub, entityAPIservice, memberService, jndWebSocketCommon) {
    var TOPIC_LEFT = 'topic_left';
    var TOPIC_JOINED = 'topic_joined';
    var TOPIC_DELETED = 'topic_deleted';
    var TOPIC_CREATED = 'topic_created';
    var TOPIC_UPDATED = 'topic_updated';
    var TOPIC_STARRED = 'topic_starred';
    var TOPIC_UNSTARRED = 'topic_unstarred';

    var ROOM_SUBSCRIBE = 'room_subscription_updated';

    var events = [
      {
        name: 'topic_left',
        handler: _onTopicLeft
      },
      {
        name: 'topic_joined',
        handler: _onTopicJoined
      },
      {
        name: 'topic_deleted',
        handler: _onTopicLDeleted
      },
      {
        name: 'topic_created',
        handler: _onTopicLCreated
      },
      {
        name: 'topic_updated',
        handler: _onTopicUpdated
      },
      {
        name: 'topic_starred',
        handler: _onTopicStarChanged
      },
      {
        name: 'topic_unstarred',
        handler: _onTopicStarChanged
      },
      {
        name: 'room_subscription_updated',
        handler: _onTopicSubscriptionChanged
      }
    ];

    this.getEvents = getEvents;

    function getEvents() {
      return events;
    }

    /**
     * 'topic_left' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicLeft(data) {
      if (jndWebSocketCommon.isCurrentEntity(data.topic)) {
        jndPubSub.toDefaultTopic();
      } else {
        _updateLeftPanel(data);
      }
    }

    /**
     * 'topic_joined' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicJoined(data) {
      _updateLeftPanel(data);
    }

    /**
     * 'topic_deleted' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicLDeleted(data) {
      if (jndWebSocketCommon.isCurrentEntity(data.topic)) {
        jndPubSub.toDefaultTopic();
      } else {
        _updateLeftPanel(data);
      }
    }

    /**
     * 'topic_created' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicLCreated(data) {
      _updateLeftPanel(data);
    }

    /**
     * 'topic_updated' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicUpdated(data) {
      var _topic = data.topic;
      var _topicEntity = entityAPIservice.getEntityById(_topic.type, _topic.id);

      if (!!_topicEntity) {
        entityAPIservice.extend(_topicEntity, _topic);
      }
      jndPubSub.pub('topicUpdated', data.topic);
    }

    /**
     * 'room_subscribe' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicSubscriptionChanged(data) {
      var _data = data.data;
      var _eventName = 'onTopicSubscriptionChanged';

      memberService.setTopicNotificationStatus(_data.roomId, _data.subscribe);
      jndPubSub.pub(_eventName, data);
    }

    /**
     * 'topic_starred', 'topic_unstarred' EVENT HANDLER
     * @param {object} data - socket event parameter
     * @private
     */
    function _onTopicStarChanged(data) {
      _updateLeftPanel();
    }

    function _updateLeftPanel(data) {
      jndPubSub.updateLeftPanel();
      jndPubSub.onChangeShared(data);
    }
  }
})();
