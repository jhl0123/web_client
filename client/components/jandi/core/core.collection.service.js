/**
 * @fileoverview 콜렉션 클래스 생성자를 반환한다.
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandi.core')
    .factory('CoreCollection', CoreCollection);

  /* @ngInject */
  function CoreCollection(CoreUtil) {

    /**
     * CoreCollection Class
     * @constructor
     */
    var CoreCollectionClass = CoreUtil.defineClass({
      /**
       * 인자로 받은 option 값에 대해 초기 세팅을 한다.
       * @param {Object} options
       *    @param {String} [options.key='id'] - key 값으로 사용할 field 명
       *    @param {Array} [options.list] - 생성과 동시에 설정할 콜렉션 list
       * @private
       */
      init: function(options) {
        this._initOwnProperties();
        this._reset();
        this._initOptions(options);
      },

      /**
       * 자기 자신의 속성값을 초기화 한다.
       * @private
       */
      _initOwnProperties: function() {
        _.extend(this, {
          _key: 'id',
          _data: {
            list: [],
            map: {}
          }
        });
      },

      /**
       * 인자로 받은 option 값에 대해 초기 세팅을 한다.
       * @param {Object} options
       *    @param {String} [options.key='id'] - key 값으로 사용할 field 명
       *    @param {Array} [options.list] - 생성과 동시에 설정할 콜렉션 list
       * @private
       */
      _initOptions: function(options) {
        var list = CoreUtil.pick(options, 'list');
        this._key = CoreUtil.pick(options, 'key') || this._key;

        if (_.isArray(list)) {
          _.forEach(list, function(item) {
            this.add(item);
          }, this);
        }
      },

      /**
       * 콜렉션의 length 를 0 으로 초기화 한다.
       */
      reset: function() {
        var data = this._data;
        data.list.splice(0, this.length);
        data.map = {};
        this.length = 0;
      },

      /**
       * id 값으로 데이터를 조회한다.
       * @param {number|string} id
       * @returns {*}
       */
      get: function (id) {
        return this._data.map[id];
      },

      /**
       * collection 에 item 을 추가한다.
       * @param {object} item
       */
      add: function (item) {
        var data = this._data;
        var id = CoreUtil.pick(item, this._key);
        if (!_.isUndefined(id)) {
          if (!_.isUndefined(this.get(id))) {
            this.update(item)
          } else {
            data.list.push(item);
            data.map[id] = item;
            this.length = data.list.length;
          }
        } else {
          throw new Error('Collection.add(item) - item is invalid');
        }
      },

      /**
       * item 을 update 한다.
       * @param {object} item
       * @returns {boolean} update 성공/실패 여부
       */
      update: function(item) {
        var map = this._data.map;
        if (map[item[this._key]]) {
          map[item[this._key]] = item;
          return true;
        } else {
          return false;
        }
      },

      /**
       * id 에 해당하는 item 이 존재하는지 여부를 반환한다.
       * @param {number|string} id
       */
      isExist: function(id) {
        return !!this._data.map[id];
      },

      /**
       * targetObj 를 id 에 해당하는 item 에 extend 한다.
       * @param {number|string} id
       * @param {object} targetObj
       * @returns {boolean}
       */
      extend: function(id, targetObj) {
        var map = this._data.map;
        if (map[id]) {
          _.extend(map[id], targetObj);
          return true;
        } else {
          return false;
        }
      },

      /**
       * 콜렉션을 초기화 하고 인자로 받은 list 로 재 구성 한다.
       * @param {Array} list
       */
      setList: function(list) {
        this.reset();
        _.forEach(list, function(item) {
          this.add(item);
        }, this);
      },

      /**
       * 인자로 item 을 받아 해당 item 이 콜렉션의 몇 번째 인덱스에 존재하는지 반환한다.
       * @param {object} targetItem
       * @returns {number}
       */
      indexOf: function(targetItem) {
        var list = this._data.list;
        var index = -1;
        _.forEach(list, function(item, i) {
          if (item === targetItem) {
            index = i;
            return false;
          }
        });
        return index;
      },

      /**
       * id 에 해당하는 데이터를 제거한다.
       * @param {number|string} id
       * @returns {boolean} - 삭제 성공/실패 여부
       */
      remove: function(id) {
        var data = this._data;
        var index;
        var item;
        var result = false;

        if (!_.isUndefined(id)) {
          item = data.map[id];
          if (item) {
            index = this.indexOf(item);
            data.list.splice(index, 1);
            delete data.map[id];
            this.length = data.list.length;
            result = true;
          }
        }
        return result;
      },

      /**
       * 콜렉션의 결과 값을 반환한다.
       * @param {boolean} [isRaw=false] - 원본 리스트를 반환한다. 원본 리스트를 반환할 경우,
       *                                map 데이터와 정합성이 깨질 수 있으므로 특별한 경우일 경우에만 옵션을 설정하도록 한다.
       * @returns {Array}
       */
      toJSON: function(isRaw) {
        return isRaw ? this._data.list : _.clone(this._data.list);
      },

      /**
       * 모든 설정 정보를 초기화 한다.
       * @private
       */
      _reset: function() {
        this._key = 'id';
        this.reset();
      }
    });

    return CoreCollectionClass;
  }
})();
