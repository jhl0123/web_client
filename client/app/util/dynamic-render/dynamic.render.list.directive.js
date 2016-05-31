/**
 * @fileoverview member list directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('dynamicRenderList', dynamicRenderList);

  function dynamicRenderList($timeout, CoreUtil, DynamicRenderViewport, ListRenderer, jndKeyCode, EntityHandler,
                         teamAPIservice, UserList) {
    return {
      require: '^dynamicRenderViewport',
      restrict: 'E',
      link: link
    };

    function link(scope, el, attrs, ctrl) {
      var originScope = scope.$parent;

      // model
      var model = attrs.model;

      // model type
      var modelType = attrs.modelType;

      // multitab일 경우 구분 type
      var type = attrs.type;

      // list property name
      var _list = attrs.list;

      // item의 type(member, topic)
      var itemType = attrs.itemType;

      // item element의 class
      var itemClass = attrs.itemClass;

      // create list callback
      var getMatches = scope.$eval(attrs.getMatches);

      // item select callback
      var onSelect = scope.$eval(attrs.onSelect);

      // viewport의 height
      var height = parseInt(attrs.viewportHeight, 10);

      // viewport의 최대 height
      var maxHeight = parseInt(ctrl.maxHeight || $(window).height() / 2, 10);

      // item의 height
      var itemHeight = _.isString(attrs.itemHeight) ? scope.$eval(attrs.itemHeight) : parseInt(attrs.itemHeight, 10);

      // 자연스러운 scrollring을 위한 buffer length
      var bufferLength = parseInt(attrs.bufferLength, 10);

      // filter element
      var jqFilter = $(attrs.filter);

      // viewport element
      var jqViewport = el.parent();

      // list element
      var jqList = $('<div class="list"></div>').appendTo(jqViewport);
      
      var viewport = DynamicRenderViewport.create(jqViewport, jqList, {
        viewportHeight: height,
        viewportMaxHeight: maxHeight,
        itemHeight: itemHeight,
        bufferLength: bufferLength,
        // create imte callback
        onCreateItem: function(jqElement, data) {
          jqElement.data('entity', data);
        },
        // rendered callback
        onRendered: function() {
          setActiveClass();
        }
      });
      
      // active 상태인 item의 index
      var activeIndex;
      
      // filter 값에 matche되는 list
      var matches;
      
      // 이전 active 상태였던 dom element
      var prevActiveElement;

      // 이전 mouse point;
      var _prevMousePoint;

      var _modelType = scope.$eval(attrs.modelType);

      var _modelValue = '';

      scope.viewport = viewport;

      originScope.getActiveIndex = getActiveIndex;
      originScope.setActiveIndex = setActiveIndex;
      originScope.setActiveClass = setActiveClass;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        activeIndex = 0;

        // 최초 list 갱신
        _updateList();

        // list가 생성된 후 focus item을 설정
        _focusItem(activeIndex);

        $timeout(function() {
          el.remove();
        });

        _attachScopeEvents();
        _attachDomEvents();
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        if (type != null) {
          scope.$on('setActiveIndex:' + type, _onSetActiveIndex);
          scope.$on('updateList:' + type, _onUpdateList);
        }

        scope.$on('$destroy', _onDestroy);
        scope.$watch(model, _onFilterValueChanged);

        if (modelType) {
          scope.$watch(modelType, _onFilterTypeChanged);
        }
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        jqFilter.on('keydown', _onKeydown);

        jqViewport
          .on('scroll', _onScroll)
          .on('mousewheel', _onScroll)
          .on('click', '.' + itemClass, _onClick)
          .on('mousemove', '.' + itemClass, _onMouseMove);
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
       * update list event handler
       * @private
       */
      function _onUpdateList() {
        _modelValue = jqFilter.val();

        _updateList();
      }

      /**
       * set active index event handler
       * @param {object} event
       * @param {number} index
       * @private
       */
      function _onSetActiveIndex(event, index) {
        _setActiveItem(index);
      }

      /**
       * scope desctroy event handler
       * @private
       */
      function _onDestroy() {

        //ToDo: listOnModal directive가 element가 아닌 container의 attribute로 제공 되어야 dom select 문제가 해결됨.
        // scope destroy시 jqFilter를 제거하여 scope 생성시 이전 jqFilter가 선택되지 않도록 한다.
        jqFilter.remove();
      }

      /**
       * filter value changed event handler
       * @param {string} newValue
       * @param {string} oldValue
       * @private
       */
      function _onFilterValueChanged(newValue, oldValue) {
        if (_isValueChanged(newValue, oldValue)) {
          // model value changed
          _modelValue = newValue;

          setActiveIndex(0);
          _updateList();
        }
      }

      /**
       * filter value 변경 여부
       * @param {string} newValue
       * @param {string} oldValue
       * @returns {boolean}
       * @private
       */
      function _isValueChanged(newValue, oldValue) {
        return newValue === '' && oldValue == null || (newValue || '') !== (oldValue || '');
      }

      /**
       * filter type changed event handler
       * @param {string} newValue
       * @private
       */
      function _onFilterTypeChanged(newValue) {
        _modelType = newValue;
        _updateList();
      }

      /**
       * key down event handler
       * @param event
       * @private
       */
      function _onKeydown(event) {
        var which = event.which;
        var index;

        if (scope.$eval(attrs.activeted)) {
          if (jndKeyCode.match('UP_ARROW', which)) {
            event.preventDefault();

            index = (activeIndex > 0 ? activeIndex : matches.length) - 1;
            _setActiveItem(index);
          } else if (jndKeyCode.match('DOWN_ARROW', which)) {
            event.preventDefault();

            index = ((activeIndex + 1) % matches.length);
            _setActiveItem(index);
          } else if (!event.metaKey && !event.ctrlKey && jndKeyCode.match('ENTER', which)) {
            event.preventDefault();

            _select();
          }
        }
      }

      /**
       * click event handler
       * @param {object} event
       * @private
       */
      function _onClick(event) {
        var jqTarget = $(event.target);
        var item = matches[activeIndex];

        if (itemType === 'member' && jqTarget.hasClass('star')) {
          // item type이 'member'이고 star icon click 시 처리
          if (item) {
            EntityHandler.toggleStarred(item.id);
          }
        } else if (jqTarget.closest('._sendInvitation').length) {
          if (item) {
            _sendInvitationMail(item.id);
          }

        } else {
          _select();
        }
      }

      /**
       * invitation 을 재전송한다
       * @private
       */
      function _sendInvitationMail(userId) {
        var user = UserList.get(userId);
        var email = CoreUtil.pick(user, 'u_email');
        if (email) {
          teamAPIservice.inviteToTeam([email])
            .then(teamAPIservice.alertInvitationSuccess, null);
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
        ListRenderer.render({
          type: itemType,
          list: matches,
          viewport: viewport,
          filterText: _modelValue,
          filterType: _modelType
        });
      }

      /**
       * mousemove event handler
       * @param {object} event
       * @private
       */
      function _onMouseMove(event) {
        var target = event.currentTarget;
        var index;

        if (_prevMousePoint && (_prevMousePoint.x != event.clientX || _prevMousePoint.y != event.clientY)) {
          index = +$(target).data('viewport-index');
          if (activeIndex != index) {
            activeIndex = index;

            // viewport에 반쯤 걸친 상태로 출력된 아이템이 있을때 _focusItem을 수행함으로서 viewport 영역에 완전히 보여지도록 한다.
            // 현재 jandi에서 출력되는 list들은 해당 기능을 사용하지 제공하지 않으므로 주석 처리함.
            // _focusItem(activeIndex);

            setActiveClass();
          }
        }

        _prevMousePoint = {
          x: event.clientX,
          y: event.clientY
        };
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
      function setActiveClass() {
        var element;

        prevActiveElement && prevActiveElement.removeClass('active');
        if (element = viewport.getItemElement(activeIndex)) {
          prevActiveElement = element.addClass('active');
        }
      }

      /**
       * topic list를 갱신한다.
       * @private
       */
      function _updateList() {
        var list = scope.$eval(_list);
        matches = getMatches ? getMatches(list, _modelValue, _modelType) : list;
        ListRenderer.render({
          type: itemType,
          list: matches,
          viewport: viewport,
          filterText: _modelValue,
          filterType: _modelType
        }, true);
      }

      /**
       * 활성 아이템을 설정함.
       * @param {number} activeIndex
       * @private
       */
      function _setActiveItem(index) {
        setActiveIndex(index);
        ListRenderer.render({
          type: itemType,
          list: matches,
          viewport: viewport,
          filterText: _modelValue,
          filterType: _modelType
        });
      }
    }
  }
})();
