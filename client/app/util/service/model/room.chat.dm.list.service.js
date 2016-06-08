/**
 * @fileoverview DM 채팅 방 List Singleton 모델
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('RoomChatDmList', RoomChatDmList);

  /* @ngInject */
  function RoomChatDmList(CoreUtil, EntityCollection, UserList, BotList, memberService) {

    /**
     * RoomChatDmList 클래스
     * @constructor
     */
    var RoomChatDmListClass = CoreUtil.defineClass(EntityCollection, /**@lends EntityCollection.prototype */{
      /**
       * 생성자
       */
      init: function() {
        EntityCollection.prototype.init.apply(this, arguments);
      },

      /**
       * 콜렉션에 chatRoom 을 추가한다.
       * @param {object} chatRoom
       * @override
       */
      add: function(chatRoom) {
        var member;
        if (!this._isLegacyFormat(chatRoom)) {
          chatRoom = this._convertToLegacyFormat(chatRoom);
        }
        member = UserList.get(chatRoom.companionId) || BotList.get(chatRoom.companionId);
        if (member) {
          this._extendMember(member, chatRoom);
          EntityCollection.prototype.add.call(this, _.extend(chatRoom, {
            id: chatRoom.entityId,
            extMember: member
          }));
        }
      },

      /**
       * 해당 chat room 의 member 를 반환한다.
       * @param {string|number} id
       * @returns {*}
       */
      getMember: function(id) {
        var room = this.get(id);
        return CoreUtil.pick(room, 'extMember');
      },

      /**
       * center 진입 시 unread-bookmark 를 위한 lastMessageId 를 위해 chatRoom 의 attributes 를 member 에 extend 한다.
       * @param {object} member
       * @param {object} chatRoom
       * @private
       */
      _extendMember: function (member, chatRoom) {
        _.each(chatRoom, function(value, name) {
          if (name !== 'id') {
            member[name] = value;
          }
        })
      },

      _isLegacyFormat: function(chatRoom) {
        return !!chatRoom.entityId;
      },

      _convertToLegacyFormat: function(chatRoom) {
        var myId = memberService.getMemberId();
        var companionId;
        _.forEach(chatRoom.members, function(id) {
          if (myId !== id) {
            companionId = id;
            return false;
          }
        });
        return {
          lastMessageStatus: null,
          lastMessage: null,
          lastLinkId: chatRoom.lastLinkId,
          unread: 0,
          companionId: companionId,
          entityId: chatRoom.id
        };
      }
    });

    return new RoomChatDmListClass();
  }
})();
