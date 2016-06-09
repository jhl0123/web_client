/**
 * @fileoverview 메세지 캐시 콜렉션
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('MessageCacheCollection', MessageCacheCollection);

  /* @ngInject */
  function MessageCacheCollection($rootScope, CoreUtil, CoreCollection, MessageCollection, RoomTopicList, currentSessionHelper,
                                  RoomChatDmList, EntityFilterMember, jndWebSocket, SocketEventApi, jndPubSub) {
    //for debug;
    var instance;
    var UNIT = 300;
    var MessageCacheCollectionClass = CoreUtil.defineClass(CoreCollection, /**@lends Collection.prototype */{
      /**
       * 인자로 받은 option 값에 대해 초기 세팅을 한다.
       * @param {Object} options
       *    @param {String} [options.key='id'] - key 값으로 사용할 field 명
       *    @param {Array} [options.list] - 생성과 동시에 설정할 콜렉션 list
       * @private
       */
      init: function(options) {
        CoreCollection.prototype.init.apply(this, arguments);
        this._scope = $rootScope.$new();
        this._scope.$on('RoomTopicList:changed', _.bind(this.initializeTopics, this));
        this._scope.$on('NetInterceptor:connect', _.bind(this._requestEventsHistory, this));
        this._scope.$on('NetInterceptor:onGatewayTimeoutError', _.bind(this._requestEventsHistory, this));
        this._scope.$on('jndWebSocket:connect', _.bind(this._requestEventsHistory, this));
        this._scope.$on('Auth:refreshTokenSuccess', _.bind(this._requestEventsHistory, this));
      },

      /**
       * disconnect 동안 누락된 이벤트를 조회하기 위해
       * event history API 를 호출한다.
       * @private
       */
      _requestEventsHistory: function () {
        var lastTimeStamp = jndWebSocket.getLastTimestamp();
        SocketEventApi.get({
          ts: lastTimeStamp
        }).success(_.bind(this._onSuccessGetEventsHistory, this))
          .error(_.bind(this._onErrorGetEventHistory, this));
      },

      /**
       * event history 성공 이벤트 핸들러
       * @param response
       * @private
       */
      _onSuccessGetEventsHistory: function(response) {
        var socketEvents = response.records;
        jndWebSocket.processSocketEvents(socketEvents);
      },

      /**
       * event history 오류 핸들러
       * @private
       */
      _onErrorGetEventHistory: function() {
        jndPubSub.pub('MessageCacheCollection:getEventHistoryError');
      },
      
      /**
       * topic 들을 초기화 한다
       */
      initializeTopics: function() {
        var joinedTopics = RoomTopicList.toJSON(true);
        joinedTopics = _.sortBy(joinedTopics, 'alarmCnt');
        this._initCurrent();
        _.forEachRight(joinedTopics, function(topic, index) {
          setTimeout(_.bind(this.add, this, topic.id), UNIT * (index + 1));
        }, this);
        this._removeUnjoinedTopics();
      },

      /**
       * 대화방을 초기화 한다.
       */
      initializeChats: function() {
        var chats = RoomChatDmList.toJSON(true);
        _.forEach(chats, function(chat, index) {
          setTimeout(_.bind(this.add, this, chat.extMember.id), UNIT * (index + 1));
        }, this);
      },

      /**
       * 현재 가입하지 않은 topic 들을 제거한다.
       * @private
       */
      _removeUnjoinedTopics: function() {
        var cachedIds = _.pluck(this.toJSON(true), 'id');
        var joinedTopicIds = _.pluck(RoomTopicList.toJSON(true), 'id');
        var chatIds = _.map(RoomChatDmList.toJSON(true), function(chatRoom) {
          return CoreUtil.pick(chatRoom, 'extMember', 'id');
        });
        var garbageIds = _.difference(cachedIds, joinedTopicIds.concat(chatIds));
        _.forEach(garbageIds, function(id) {
          if (!EntityFilterMember.isExist(id)) {
            this.remove(id);
          }
        }, this);
      },
      

      /**
       * roomId 에 해당하는 collection 을 생성한다.
       * @param {number} roomId
       */
      add: function(roomId) {
        var collection = this.get(roomId);
        var status;
        if (!collection) {
          CoreCollection.prototype.add.call(this, new MessageCollection({
            id: roomId
          }));          
        } else {
          status = collection.status;
          if (!status.isLoading && !status.isInitialized) {
            collection.initialRequest();
          }
        }
      },

      /**
       * 현재 user 가 보고있는 방 정보를 반환한다.
       * @returns {*}
       */
      getCurrent: function() {
        var roomId = currentSessionHelper.getCurrentEntityId();
        this._initCurrent();
        return this.get(roomId);
      },

      /**
       * 현재 방이 없다면 생성 한다.
       * @private
       */
      _initCurrent: function() {
        var roomId = currentSessionHelper.getCurrentEntityId();
        if (roomId) {
          if (!this.isExist(roomId)) {
            this.add(roomId);
          }
        }
      }
    });
    instance = new MessageCacheCollectionClass();
    window.MessageCacheCollection = instance;
    
    return instance;
  }
})();
