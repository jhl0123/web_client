/**
 * @fileoverview 목록에 대한 검색용 필터
 * !!!important
 * 해당 소스의 수정시 반드시 entity.search.filter.spec.js 의 karma 테스트 결과를 확인한다.
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.filter('getMatchedList', function(EntitySearchFilter) {
    /**
     * 필터된 목록을 전달함.
     * @param {array} list
     * @param {string|array} property
     * @param {string} query
     * @param {function} [callback] - filter시 사용자 임의 로직을 수행함
     */
    return function(list, property, query, callback) {
      return _.filter(list, function(item) {
        var value = EntitySearchFilter.getPropertyValue(item, property);

        value = (value || '').toLowerCase();
        query = (query || '').toLowerCase();

        return (!callback || callback(item)) && value.indexOf(query) > -1;
      });
    };
  });

  app.filter('orderByQueryIndex', function(EntitySearchFilter) {
    /**
     * 접두사가 일치하는 아이템을 우선으로 목록을 정렬함.
     * @param {array} list
     * @param {string} property
     * @param {string} query
     * @param {function} [callback] - sortBy시 사용자 임의 로직을 수행함
     */
    return function(list, property, query, callback) {
      return _.sortBy(list, function(item) {
        var value = EntitySearchFilter.getPropertyValue(item, property);
        var isBeginStringMatch;

        query = (query || '').toLowerCase();
        isBeginStringMatch = value.indexOf(query) === 0 ? -1 : 1;

        return callback ? callback(item, [isBeginStringMatch, value]) : [isBeginStringMatch, value];
      });
    };
  });
})();

