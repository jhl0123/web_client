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
                                  RoomChatDmList, EntityFilterMember) {
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
      },

      /**
       * topic 들을 초기화 한다
       */
      initializeTopics: function() {
        var joinedTopics = RoomTopicList.toJSON(true);
        this._initCurrent();
        _.forEach(joinedTopics, function(topic, index) {
          setTimeout(_.bind(this.add, this, topic.id), UNIT * index);
        }, this);
        this._removeUnjoinedTopics();
      },
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
      
      initializeChats: function() {
        var chats = RoomChatDmList.toJSON(true);
        _.forEach(chats, function(chat, index) {
          setTimeout(_.bind(this.add, this, chat.extMember.id), UNIT * index);
        }, this);
      },
      /**
       * 
       * @param roomId
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
      
      getCurrent: function() {
        var roomId = currentSessionHelper.getCurrentEntityId();
        this._initCurrent();
        return this.get(roomId);
      },

      _initCurrent: function() {
        var roomId = currentSessionHelper.getCurrentEntityId();
        if (roomId) {
          if (!this.isExist(roomId)) {
            this.add(roomId);
          }
        }
      }
    });

    return new MessageCacheCollectionClass();
  }
})();
