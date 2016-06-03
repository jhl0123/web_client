/**
 * @fileoverview Entity 콜랙션의 Base 생성자를 반환한다.
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('EntityCollection', EntityCollection);

  /* @ngInject */
  function EntityCollection(CoreCollection, CoreUtil) {

    /**
     * Collection Class
     * @constructor
     */
    var EntityCollectionClass = CoreUtil.defineClass(CoreCollection, /**@lends Collection.prototype */{
      /**
       * 인자로 받은 option 값에 대해 초기 세팅을 한다.
       * @param {Object} options
       *    @param {String} [options.key='id'] - key 값으로 사용할 field 명
       *    @param {Array} [options.list] - 생성과 동시에 설정할 콜렉션 list
       * @private
       */
      init: function(options) {
        CoreCollection.prototype.init.apply(this, arguments);
      },

      /**
       * item 을 추가한다.
       * @override
       * @param {object} item
       */
      add: function(item) {
        this._toLowerPlural(item);
        CoreCollection.prototype.add.call(this, item);
      },

      /**
       * item 을 업데이트 한다.
       * @override
       * @param {object} item
       */
      update: function(item) {
        this._toLowerPlural(item);
        CoreCollection.prototype.update.call(this, item);
      },

      /**
       * item 을 확장한다.
       * @override
       * @param {number|string} id
       * @param {object} targetObj
       */
      extend: function(id, targetObj) {
        if (this.get(id)) {
          this._toLowerPlural(targetObj);
          CoreCollection.prototype.extend.call(this, id, targetObj);
        }
      },

      /**
       * item 의 type 을 lower case 이면서 복수 형태로 변환한다.
       * @param {object} item
       * @private
       */
      _toLowerPlural: function(item) {
        //@fixme: 현재 entity.service.js 의 extend 에서 's' 를 붙여주는 로직에 대한 호환성을 위해 아래와 같은 로직을 수행한다.
        if (item.type && !this._isPlural(item.type)) {
          item.type = item.type.toLowerCase() + 's';
        }
      },

      /**
       * 단어가 복수 인지 확인한다.
       * @param str
       * @returns {Object|*|boolean}
       * @private
       */
      _isPlural: function(str) {
        var length = str && str.length;
        return !!(length && str[length - 1] === 's');
      }
    });

    return EntityCollectionClass;
  }
})();
