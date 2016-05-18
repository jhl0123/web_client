/**
 * @fileoverview 목록에 대한 검색용 필터 검증
 */
(function() {
  'use strict';

  describe('search.filter', function() {
    var getMatchedList;
    var orderByQueryIndex;

    beforeEach(module('jandiApp'));
    beforeEach(inject(function(_$filter_) {
      getMatchedList = _$filter_('getMatchedList');
      orderByQueryIndex = _$filter_('orderByQueryIndex');
    }));

    describe('getMatchedList', function() {
      var list = [
        {name: 'name1', value: 1},
        {name: 'name2', value: 2},
        {name: 'name3', value: 3},
        {name: 'name4', value: 4},
        {name: 'name5', value: 5}
      ];

      var list2 = [
        {name: {name: 'name1'}, value: 1},
        {name: {name: 'name2'}, value: 2},
        {name: {name: 'name3'}, value: 3},
        {name: {name: 'name4'}, value: 4},
        {name: {name: 'name5'}, value: 5}
      ];

      it('복사된 리스트를 전달하는지 확인한다.', function() {
        var result = getMatchedList(list, 'name', '');

        expect(result === list).toEqual(false);
      });

      it('필터된 리스트를 전달하는지 확인한다.', function() {
        var result = getMatchedList(list, 'name', '1');

        expect(result[0].value).toEqual(1);
      });

      it('필터된 리스트가 대소문자를 구별하지 않는지 확인한다.', function() {
        var result = getMatchedList(list, 'name', 'E4');

        expect(result[0].value).toEqual(4);
      });

      it('match 값이 object의 property로 존재할때 동작하는지 확인한다.', function() {
        var result = getMatchedList(list2, ['name', 'name'], '5');

        expect(result[0].value).toEqual(5);
      });

      it('사용자 임의 조건을 수행하는지 확인한다.', function() {
        var result = getMatchedList(list, 'name', 'name', function(item) {
          return item.name.indexOf('4') > -1;
        });

        expect(result[0].value).toEqual(4);
      });
    });

    describe('orderByQueryIndex', function() {
      var list = [
        {name: 'abcde1', value: 1},
        {name: 'bcdef2', value: 2},
        {name: 'cdefg3', value: 3},
        {name: 'defgh4', value: 4},
        {name: 'efghi5', value: 5}
      ];

      var list2 = [
        {name: {name: 'abcde1'}, value: 1},
        {name: {name: 'bcdef2'}, value: 2},
        {name: {name: 'cdefg3'}, value: 3},
        {name: {name: 'defgh4'}, value: 4},
        {name: {name: 'efghi5'}, value: 5}
      ];

      it('복사된 리스트를 전달하는지 확인한다.', function() {
        var result = orderByQueryIndex(list, 'name', '');

        expect(result === list).toEqual(false);
      });

      it('정렬된 리스트를 전달하는지 확인한다.', function() {
        var result = orderByQueryIndex(list, 'name', 'b');

        expect(result[0].value).toEqual(2);
      });

      it('정렬된 리스트가 대소문자를 구별하지 않는지 확인한다.', function() {
        var result = orderByQueryIndex(list, 'name', 'D');

        expect(result[0].value).toEqual(4);
      });

      it('사용자 임의 조건을 수행하는지 확인한다.', function() {
        var result = orderByQueryIndex(list, 'name', 'e', function(item, desc) {
          return [item.value === 5].concat(desc);
        });

        expect(result[0].value).toEqual(1);
      });

      it('order 값이 object의 property로 존재할때 동작하는지 확인한다.', function() {
        var result = orderByQueryIndex(list2, ['name', 'name'], 'D');

        expect(result[0].value).toEqual(4);
      });
    });
  });
})();
