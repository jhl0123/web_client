/**
 * @fileoverview Bot 리스트 Singleton 모델을 반환한다.
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('BotList', BotList);

  /* @ngInject */
  function BotList(CoreUtil, EntityCollection) {

    /**
     * BotList 클래스
     * @constructor
     */
    var BotListClass = CoreUtil.defineClass(EntityCollection, /**@lends EntityCollection.prototype */{
      /**
       * 생성자
       */
      init: function() {
        EntityCollection.prototype.init.apply(this, arguments);
        this._jandiBot = null;
      },

      /**
       * 콜렉션에 chatRoom 을 추가한다.
       * @override
       * @param {object} bot
       */
      add: function(bot) {
        if (bot.botType === 'jandi_bot') {
          this._jandiBot = bot;
        }
        EntityCollection.prototype.add.call(this, bot);
      },

      /**
       * Jandi Bot 을 반환한다.
       * @returns {object}
       */
      getJandiBot: function() {
        return this._jandiBot;
      },

      /**
       * jandi bot 인지 여부를 반환한다.
       * @param {number|string} id
       * @returns {boolean}
       */
      isJandiBot: function(id) {
        var bot = this.get(id);
        return (bot && bot.botType) === 'jandi_bot';
      },

      /**
       * connect bot 인지 여부를 반환한다.
       * @param {number|string} id
       * @returns {boolean}
       */
      isConnectBot: function(id) {
        var bot = this.get(id);
        return (bot && bot.botType) === 'connect_bot';
      }
    });

    return new BotListClass();
  }
})();
