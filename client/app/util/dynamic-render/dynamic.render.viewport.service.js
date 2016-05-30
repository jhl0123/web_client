/**
 * @fileoverview viewport 서비스. viewport 영역에 출력 해야할 data를 전달한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('DynamicRenderViewport', DynamicRenderViewport);

  /* @ngInject */
  function DynamicRenderViewport() {
    var Viewport = {
      init: init,
      updateList: updateList,
      render: render,
      remove: remove,

      getItem: getItem,
      getItemElement: getItemElement,
      getPosition: getPosition,
      getFocusableScrollTop: getFocusableScrollTop,
    };

    return {
      /**
       * Viewport factory
       * @param {object} jqViewport
       * @param {object} jqList
       * @param {object} options
       * @returns {*}
       */
      create: function(jqViewport, jqList, options) {
        return Object.create(Viewport).init(jqViewport, jqList, options);
      }
    };
    /**
     * init
     * @param {object} jqViewport
     * @param {object} jqList
     * @param {object} options
     * @param {number} options.viewportHeight       - viewport의 height
     * @param {number} options.viewportMaxHeight    - viewport의 최대 height
     * @param {number|function} options.itemHeight  - item의 height
     * @param {array} options.list                  - list data
     * @param {number} options.bufferLength         - 자연스러운 scroll을 위해 여분으로 생성될 item 수
     * @param {function} options.onCreateItem       - 특정 dom element가 생성된 후 수행할 callback
     * @param {function} options.onRendered         - viewport에 노출될 dom element가 전부 생성된 후 수행할 callback
     * @returns {init}
     */
    function init(jqViewport, jqList, options) {
      var that = this;

      that.renderedMap = {};

      that.jqViewport = jqViewport;

      if (!_isRelativePosition(jqViewport)) {
        that.jqViewport.css({position: 'relative'});
      }

      that.jqList = jqList;

      that.options = {
        viewportHeight: 0,
        itemHeight: 25,
        list: [],
        bufferLength: 10
      };

      _.extend(that.options, options);

      // viewportMaxHeight가 입력되지 않았다면 viewportHeight를 maxHeight로 사용한다.
      // viewportMaxHeight가 입력되지 않으면 고정된 viewportHeight를 제공한다.
      !_.isNumber(that.options.viewportMaxHeight) && (that.options.viewportMaxHeight = that.options.viewportHeight);

      // 가변높이 viewport 인지 여부
      that._isDynamicHeight = (_.isNumber(that.options.viewportHeight) && that.options.viewportHeight > 0) ? false : true;

      return that;
    }

    /**
     * 자식 dom들의 상대 포지션으로 사용가능한 포지션 값(relative, absolute)인지 여부
     * @param {object} jqViewport
     * @returns {boolean}
     * @private
     */
    function _isRelativePosition(jqViewport) {
      var position = jqViewport.css('position');
      var isRelativePosition = false;

      if (position === 'relative' || position === 'absolute') {
        isRelativePosition = true;
      }

      return isRelativePosition;
    }

    /**
     * viewport에 노출되어야 할 item의 position을 전달한다.
     * @returns {{
     *  oriBeginIndex : bufferLength option 제외한 begin index,
     *  oriEndIndex   : bufferLength options 제외한 end index,
     *  beginIndex    : bufferLength options을 포함한 begin index,
     *  endIndex      : bufferLength options을 포함한 end index}}
     */
    function getPosition() {
      var that = this;
      var options = that.options;
      var listLength = that.options.list.length;
      var beginY = 0;
      var endY = 0;
      var oriBeginIndex;
      var beginIndex;
      var oriEndIndex;
      var endIndex;

      if (listLength > 0) {
        beginY = that.jqViewport.scrollTop() || 0;
        endY = beginY + options.viewportHeight;

        oriBeginIndex = _getIndexOnPosition(options.list, options.itemHeight, beginY);
        beginIndex = oriBeginIndex - options.bufferLength;
        beginIndex = beginIndex < 0 ? 0 : beginIndex;

        oriEndIndex = _getIndexOnPosition(options.list, options.itemHeight, endY);
        endIndex = oriEndIndex + options.bufferLength;
        endIndex = endIndex >= listLength ? listLength - 1 : endIndex;

        if (beginIndex < 0) {
          beginIndex = 0;
        }

        if (endIndex > listLength) {
          endIndex = listLength - 1;
        }
      }

      return {
        oriBeginIndex: oriBeginIndex,
        oriEndIndex: oriEndIndex,
        beginIndex: beginIndex,
        endIndex: endIndex
      };
    }

    /**
     * position y 지점까지 포함되는 item index를 전달한다.
     * @param {array} list
     * @param {number|function} itemHeight
     * @param {number} y
     * @returns {*}
     * @private
     */
    function _getIndexOnPosition(list, itemHeight, y) {
      var result;

      if (_.isFunction(itemHeight)) {
        result = 0;

        _.each(list, function (item, index) {
          result += item.extItemHeight;

          if (y < result) {
            result = index;
            return false;
          }
        });
      } else {
        result = Math.floor(y / itemHeight);
      }

      return result;
    }

    /**
     * viewport에 출력될 list를 갱신한다.
     * @param {array} list
     * @returns {updateList}
     */
    function updateList(list) {
      var that = this;
      var options = that.options;

      options.list = list;

      if (_.isFunction(options.itemHeight)) {
        options.listHeight = 0;
        _.each(options.list, function(item) {
          options.listHeight += item.extItemHeight = options.itemHeight(item);
        });
      } else {
        options.listHeight = list.length * options.itemHeight;    // 전체 item height
      }
      that.jqList.empty().css('height', options.listHeight);

      if (that._isDynamicHeight) {
        options.viewportHeight = options.listHeight > options.viewportMaxHeight ? options.viewportMaxHeight : options.listHeight;
      }

      that.jqViewport.css('height', options.viewportHeight);

      // list 갱신시 이전에 생성된 dom element는 삭제한다.
      that.remove();

      that.renderedMap = {};
      that.prevRenderList = [];

      return that;
    }

    /**
     * viewport에 dom element를 rednering
     * @param {object} position - viewport에서 생성해야할 position
     * @param {array} elements  - dom element를 생성할 html 문자열 array
     */
    function render(position, elements) {
      var that = this;
      var map = that.renderedMap;
      var renderList = [];

      _.each(elements, function(element, index) {
        index = position.beginIndex + index;
        if (map[index] == null) {
          // index마다 각자의 item Height
          map[index] = $(element)
            .appendTo(that.jqList)
            .css({
              position: 'absolute',
              top: _getTotalItemHeight(that.options.list, that.options.itemHeight, index)
            })
            .data('viewport-index', index);
          that.options.onCreateItem && that.options.onCreateItem(map[index], that.options.list[index]);
        }

        renderList.push(index);
      });

      // 이전에 생성된 dom element 중 현재 보여져야할 position에 포함되지 않았다면 삭제를 수행한다.
      _.each(that.prevRenderList, function(value) {
        if (position.beginIndex > value || position.endIndex < value) {
          that.remove(value);
        }
      });

      that.prevRenderList = renderList;

      that.options.onRendered && that.options.onRendered();
    }

    /**
     * focus 되야할 element의 scroll top 값을 전달한다.
     * @param {number} index
     * @returns {*}
     */
    function getFocusableScrollTop(index) {
      var that = this;

      var viewportScrollTop = that.jqViewport.scrollTop() || 0;
      var viewportHeight = that.options.viewportHeight;
      var viewportTop = that.jqViewport.offset().top;

      var itemHeight;
      var itemTop;

      var compare;
      var scrollTop;

      if (that.options.list[index]) {
        itemHeight = _getItemHeight(that.options.list, that.options.itemHeight, index);
        itemTop = _getTotalItemHeight(that.options.list, that.options.itemHeight, index) + viewportTop - viewportScrollTop;

        compare = itemTop - viewportTop;
        if (compare <= 0) {
          // 위로 가기

          scrollTop = viewportScrollTop + compare;
        } else if (compare + itemHeight > viewportHeight) { // 밑으로 갈 하나의 item height
          // 밑으로 가기

          scrollTop = viewportScrollTop + compare - viewportHeight + itemHeight;
        }
      }

      return scrollTop;
    }

    /**
     * 특정 item의 height를 전달한다.
     * @param {array} list
     * @param {number|function} itemHeight
     * @param {number} index
     * @returns {*}
     * @private
     */
    function _getItemHeight(list, itemHeight, index) {
      return _.isFunction(itemHeight) ? list[index].extItemHeight : itemHeight;
    }

    /**
     * 처음 부터 특정 item까지의 height를 전달한다.
     * @param {array} list
     * @param {number|function} itemHeight
     * @param {number} index
     * @returns {number}
     * @private
     */
    function _getTotalItemHeight(list, itemHeight, index) {
      var i;
      var len;
      var total = 0;

      if (_.isFunction(itemHeight)) {
        for (i = 0, len = index; i < len; i++) {
          total += list[i].extItemHeight;
        }
      } else {
        total = index * itemHeight;
      }

      return total;
    }

    /**
     * 생성된 dom element를 viewport에서 보여지지 않도록 삭제한다.
     * @param {number}index
     */
    function remove(index) {
      var that = this;
      var map = that.renderedMap;

      if (_.isNumber(index)) {
        map[index].remove();
        delete map[index];
      } else {
        for (index in map) {
          if (map.hasOwnProperty(index)) {
            map[index].remove();
            delete map[index];
          }
        }
      }
    }

    /**
     * 특정 index에 해당하는 dom element를 전달한다.
     * @param {number} index
     * @returns {*}
     */
    function getItemElement(index) {
      return this.renderedMap[index];
    }

    /**
     * list 또는 list의 특정 item data(dom element 아님)를 전달한다.
     * @param {number} index
     * @returns {*}
     */
    function getItem(index) {
      var that = this;

      return _.isNumber(index) ? that.options.list[index] : that.options.list;
    }
  }
})();
