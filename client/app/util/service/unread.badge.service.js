/**
 * @fileoverview unread badge 의 위치 정보를 담고 있는 service
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('UnreadBadge', UnreadBadge);

  function UnreadBadge() {
    var map = {};

    this.add = add;
    this.remove = remove;
    this.get = get;
    this.getUnreadPos = getUnreadPos;
    this.update = update;

    /**
     * badge 정보를 추가한다.
     * @param {string} key  식별자
     * @param {object} data  뱃지의 위치 정보
     *    @param {number} data.top 뱃지의 top
     *    @param {number} data.bottom 뱃지의 bottom
     *    @param {object} data.entity 뱃지 정보의 원본 데이터 entity
     *    @param {HTMLElement} data.el 뱃지 엘리먼트
     */
    function add(key, data) {
      map[key] = data;
    }

    /**
     * 정보를 업데이트한다.
     * @param {string} key  식별자
     * @param {object} data  뱃지의 위치 정보
     *    @param {number} data.top 뱃지의 top
     *    @param {number} data.bottom 뱃지의 bottom
     *    @param {object} data.entity 뱃지 정보의 원본 데이터 entity
     *    @param {HTMLElement} data.el 뱃지 엘리먼트
     */
    function update(key, data) {
      map[key] = data;
    }

    /**
     * badge 정보를 제거한다.
     * @param {string} key 삭제할 아이템 식별자
     */
    function remove(key) {
      if (map[key]) {
        map[key] = null;
        delete map[key];
      }
    }

    /**
     * unread badge 정보를 전달한다.
     * @returns {{}}
     */
    function get() {
      return map;
    }

    /**
     * view-port 에 노출되지 않은 unread badge 의 포지션 정보를 반환한다.
     * @param {number} top 현재 view-port 의 top 값
     * @param {number} bottom 현재 view-port 의 bottom 값
     * @returns {{above: Array, below: Array}}
     */
    function getUnreadPos(top, bottom) {

      var unread = {
        above: [],
        below: []
      };

      _.each(map, function(data, key) {
        if (bottom < data.bottom) {
          unread.below.push(data.bottom);
        } else if (data.top < top) {
          unread.above.push(data.top);
        }
      });
      unread.above = unread.above.sort(_sortNum);
      unread.below = unread.below.sort(_sortNum);
      return unread;
    }

    /**
     * sorting 함수
     * @param {number} a
     * @param {number} b
     * @returns {number}
     * @private
     */
    function _sortNum(a, b) {
      return a - b;
    }
  }
})();
