/**
 * @fileoverview member list directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('listOnModal', listOnModal);

  function listOnModal($timeout, Viewport, ListRenderer, jndKeyCode, jndPubSub) {
    return {
      restrict: 'E',
      replace: true,
      link: link
    };

    function link(scope, el, attrs) {
      var originScope = scope.$parent;

      // model
      var model = attrs.model;

      // multitab일 경우 구분 type
      var type = attrs.type;

      // list property name
      var list = attrs.list;

      // item의 type(member, topic)
      var itemType = attrs.itemType;

      // item element의 class
      var itemClass = attrs.itemClass;

      // create list callback
      var getMatches = scope.$eval(attrs.getMatches);

      // item select callback
      var onSelect = scope.$eval(attrs.onSelect);

      // viewport의 최대 height
      var maxHeight = parseInt(attrs.viewportMaxHeight, 10);

      // item의 height
      var itemHeight = parseInt(attrs.itemHeight, 10);

      // 자연스러운 scrollring을 위한 buffer length
      var bufferLength = parseInt(attrs.bufferLength, 10);

      // filter element
      var jqFilter = $(attrs.filter);

      // viewport element
      var jqViewport = el.parent();

      // list element
      var jqList = $('<div class="list"></div>').appendTo(el);
      
      var viewport = Viewport.create(jqViewport, jqList, {
        viewportMaxHeight: maxHeight,
        itemHeight: itemHeight,
        bufferLength: bufferLength,
        // create imte callback
        onCreateItem: function(jqElement, data) {
          jqElement.data('entity', data);
        },
        // rendered callback
        onRendered: function() {
          _setActiveClass();
        }
      });
      
      // active 상태인 item의 index
      var activeIndex;
      
      // filter 값에 matche되는 list
      var matches;
      
      // 이전 active 상태였던 dom element
      var prevActiveElement;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        activeIndex = 0;

        // 최초 list 갱신
        _updateList('');

        // list가 생성된 후 focus item을 설정
        _focusItem(activeIndex);

        $timeout(function() {
          jqFilter.focus();
        });

        _on();

        originScope.getActiveIndex = getActiveIndex;
        originScope.setActiveIndex = setActiveIndex;
      }

      /**
       * event on
       * @private
       */
      function _on() {
        if (type != null) {
          scope
            .$on('updateList:' + type, function() {
              _updateList(jqFilter.val());
            });
        }

        scope.$watch(model, function(newValue, oldValue) {
          if (newValue !== oldValue) {
            // model value changed

            _updateList(newValue);
          }
        });

        jqFilter
          .on('keydown', function (event) {
            var which = event.which;

            if (scope.$eval(attrs.activeted)) {
              if (jndKeyCode.match('UP_ARROW', which)) {
                event.preventDefault();

                activeIndex = (activeIndex > 0 ? activeIndex : matches.length) - 1;
                _focusItem(activeIndex);
                ListRenderer.render(itemType, matches, viewport);
              } else if (jndKeyCode.match('DOWN_ARROW', which)) {
                event.preventDefault();

                activeIndex = ((activeIndex + 1) % matches.length);
                _focusItem(activeIndex);
                ListRenderer.render(itemType, matches, viewport);
              } else if (jndKeyCode.match('ENTER', which)) {
                event.preventDefault();
  
                _select();
              } else {
                activeIndex = 0;
                _focusItem(activeIndex);
              }
            }
          });

        jqViewport
          .on('scroll', _onScroll)
          .on('mousewheel', _onScroll)
          .on('click', '.' + itemClass, _onClick)
          .on('mouseenter', '.' + itemClass, _onMouseEnter);
      }
  
      /**
       * get active index
       * @returns {*}
       */
      function getActiveIndex() {
        return activeIndex;
      }
  
      /**
       * set active index
       * @param index
       */
      function setActiveIndex(index) {
        activeIndex = index;
        _focusItem(activeIndex);
      }

      /**
       * topic list를 갱신한다.
       * @param {array} value
       * @private
       */
      function _updateList(value) {
        matches = getMatches(scope.$eval(list), value);
        ListRenderer.render(itemType, matches, viewport, true);
      }

      /**
       * click event handler
       * @param {object} event
       * @private
       */
      function _onClick(event) {
        var item;

        if (itemType === 'member' && event.target.className.indexOf('star') > -1) {
          // item type이 'member'이고 star icon click 시 처리
          if (item = matches[activeIndex]) {
            jndPubSub.pub('onStarClick', {
              entityType: 'user',
              entityId: item.id
            });
          }
        } else {
          _select();
        }
      }

      /**
       * 특정 topic에 join한다.
       * @param {number} entityId
       * @private
       */
      function _select() {
        var item;

        item = matches[activeIndex];
        if (item != null && onSelect) {
          onSelect(item);
        }
      }

      /**
       * scroll event handler
       * @private
       */
      function _onScroll() {
        ListRenderer.render(itemType, matches, viewport);
      }

      /**
       * mouseenter event handler
       * @param {object} event
       * @private
       */
      function _onMouseEnter(event) {
        var target = event.currentTarget;

        activeIndex = $(target).data('viewport-index');
        _focusItem(activeIndex);
        _setActiveClass()
      }

      /**
       * 특정 item focus하기 위해 container의 scroll top 값을 조정한다.
       * @param {number} activeIndex
       * @private
       */
      function _focusItem(activeIndex) {
        var scrollTop = viewport.getFocusableScrollTop(activeIndex);

        if (_.isNumber(scrollTop)) {
          jqViewport.scrollTop(scrollTop);
        }
      }

      /**
       * 현재 focus된 item에 active class를 설정하고, 이전에 focus 되었던 imte에 active class를 제거한다.
       * @private
       */
      function _setActiveClass() {
        var element;

        prevActiveElement && prevActiveElement.removeClass('active');
        if (element = viewport.getItemElement(activeIndex)) {
          prevActiveElement = element.addClass('active');
        }
      }
    }
  }
})();
