/**
 * @fileoverview 사용자 List Singleton 모델
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('UserList', UserList);

  /* @ngInject */
  function UserList(CoreUtil, configuration, EntityCollection, jndPubSub) {

    var UserListClass = CoreUtil.defineClass(EntityCollection, /**@lends EntityCollection.prototype */{
      /**
       * 생성자
       */
      init: function() {
        EntityCollection.prototype.init.apply(this, arguments);
      },

      /**
       * 콜렉션에 user를 추가한다.
       * @override
       * @param {object} user
       */
      add: function(user) {
        var protocol = configuration.protocol;
        var domain = configuration.domain;
        var thumbnailUrl = protocol + 'www.' + domain + '/images/profile_img_dummyaccount_640x640.png';
        var wasExist = this.isExist(user.id);

        //inactive user 의 경우 thumbnail url 정보를 덮어쓴다.
        if (user.status === 'inactive') {
          _.extend(user, {
            u_photoThumbnailUrl: {
              smallThumbnailUrl: thumbnailUrl,
              mediumThumbnailUrl: thumbnailUrl,
              largeThumbnailUrl: thumbnailUrl
            }
          });
        }

        EntityCollection.prototype.add.call(this, user);

        //존재 하지 않았던 user 에 대해서만 added 이벤트를 트리거 한다.
        if (!wasExist) {
          jndPubSub.pub('UserList:added', user);
        }
      },
      
      /**
       * 상태가 enable 인 사용자 list 를 반환한다.
       * @returns {Array}
       */
      getEnabledList: function() {
        return _.filter(this.toJSON(true), function(user) {
          return user.status == 'enabled';
        });
      },

      /**
       * userId 에 해당하는 chatRoom id 를 반환한다.
       * @param {number|string} userId
       * @returns {*}
       */
      getChatRoomId: function(userId) {
        var user = this.get(userId);
        return user && user.entityId;
      }
    });

    return new UserListClass();
  }
})();
