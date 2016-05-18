/**
 * @fileoverview panel과 panel간의 사이즈(너비 또는 높이)를 조정하는 UI를 제공하는 splitter dicrective
 * @example
 *
 * // !important splitter-panel의 element style 중 position은 항상 absolute여야 한다.
 * <div splitter splitter-orientation="[horizontal|vertical]">
 *   <div splitter-panel min-size="100" max-size="200"></div>
 *   <div splitter-panel min-size="100"></div>
 *   <div splitter-panel min-size="100"></div>
 *   <div splitter-panel min-size="100"></div>
 * </div>
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.ui.component.splitter')
    .directive('splitter', splitter);
  
  function splitter() {
    return {
      restrict: 'A',
      scope: {
        orientation: '@splitterOrientation',
        onPanelSizeChanged: '&?'
      },
      controller: 'SplitterCtrl',
      link: link
    };
    
    function link(scope, el) {
      var _cursorLayerTemplate = '<div class="splitter-cursor-layer"></div>';
      var _splitBarTemplate = '<div class="split-bar"><i class="icon-more-fill"></div>';

      var _isHorizontal = scope.orientation === 'horizontal';

      var _isDrag;
      var _jqCursorLayer;
      var _jqSplitBar;
      var _negativePanel;
      var _positivePanel;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        if (scope.panels.length > 1) {
          _appendSplitBar();

          _attachDomEvents();
          _attachScopeEvents();
        }
      }

      /**
       * split bar element를 panel 사이에 추가함
       * @private
       */
      function _appendSplitBar() {
        var nextPanel;
        var jqSplitBar;

        angular.forEach(scope.panels, function(panel, index) {
          nextPanel = scope.panels[index + 1];

          if (nextPanel) {
            jqSplitBar = $(_splitBarTemplate);

            if (_isHorizontal) {
              // 수평 bar 생성
              jqSplitBar
                .addClass('horizontal-bar')
                .css({
                  top: 0,
                  left: panel.jqPanel.css('width')
                });
            } else {
              // 수직 bar 생성
              jqSplitBar
                .addClass('vertical-bar')
                .css({
                  top: panel.jqPanel.css('height'),
                  left: 0
                });
            }

            panel.jqPanel.after(jqSplitBar);

            jqSplitBar
              .data('negativePanel', panel)
              .data('positivePanel', nextPanel);

            if (panel.size > 0) {
              _setPanelSizeByValue({
                negative: panel,
                positive: nextPanel,
                jqSplitBar: jqSplitBar
              }, panel.size);
            }
          }
        });
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        el.on('mousedown', '.split-bar', _onMouseDown);
        $(window).on('mouseup', _onMouseUp);
      }

      /**
       * detach dom events
       * @private
       */
      function _detachDomEvents() {
        $(window).off('mouseup', _onMouseUp);
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        scope.$on('$destroy', _onDestroy);
      }

      /**
       * mouse move event handler
       * @param {object} $event
       * @private
       */
      function _onMouseMove($event) {
        if (_isDrag) {
          // split bar에서 drag 시작하여 mouse move 중이다.

          _setPanelsSizeByMouse($event);
        }
      }

      /**
       * mouse로 panel size 설정함
       * @param {object} $event
       * @private
       */
      function _setPanelsSizeByMouse($event) {
        var bounds = el[0].getBoundingClientRect();
        var propertyNames = _getPropertyNamesForCalc();
        var value = $event[propertyNames.mouse] - bounds[propertyNames.negative];

        _setPanelSize(propertyNames, {
          negative: _negativePanel,
          positive: _positivePanel,
          jqSplitBar: _jqSplitBar
        }, bounds, value);
      }

      /**
       * 특정 값으로 panel size 설정함
       * @param {object} panels
       * @param {number} value
       * @private
       */
      function _setPanelSizeByValue(panels, value) {
        var bounds = el[0].getBoundingClientRect();

        _setPanelSize(_getPropertyNamesForCalc(), panels, bounds, value);
      }

      /**
       * panel size를 계산하기 위해 필요한 property name들을 전달함
       * @private
       */
      function _getPropertyNamesForCalc() {
        var propertyNames = {};

        if (_isHorizontal) {
          propertyNames.mouse = 'clientX';
          propertyNames.size = 'width';
          propertyNames.positive = 'right';
          propertyNames.negative = 'left';
        } else {
          propertyNames.mouse = 'clientY';
          propertyNames.size = 'height';
          propertyNames.positive = 'bottom';
          propertyNames.negative = 'top';
        }

        return propertyNames;
      }

      /**
       * panel size 설정함
       * @param {object} propertyNames
       * @param {object} panels
       * @param {object} bounds
       * @param {number} panelSize
       * @private
       */
      function _setPanelSize(propertyNames, panels, bounds, panelSize) {
        var containerSize = bounds[propertyNames.positive] - bounds[propertyNames.negative];

        if (containerSize - panelSize < panels.positive.minSize) {
          // splitter bar의 오른쪽 또는 하단의 값이 min size보다 작을 경우 최소값을 유지한다.

          panelSize = containerSize - panels.positive.minSize;
        } else if (containerSize - panelSize > panels.positive.maxSize) {
          // splitter bar의 오른쪽 또는 하단의 값이 max size보다 클 경우 최대값을 유지한다.

          panelSize = panels.positive.maxSize;
        }

        if (panelSize < panels.negative.minSize) {
          // splitter bar의 왼쪽 또는 상단의 값이 min size보다 작을 경우 최소값을 유지한다.

          panelSize = panels.negative.minSize;
        } else if (panelSize > panels.negative.maxSize) {
          // splitter bar의 왼쪽 또는 상단의 값이 max size보다 클 경우 최대값을 유지한다.

          panelSize = panels.negative.maxSize;
        }

        panels.negative.jqPanel.css(propertyNames.size, panelSize);
        panels.jqSplitBar.css(propertyNames.negative, panelSize);
        panels.positive.jqPanel.css(propertyNames.negative, panelSize);

        scope.onPanelSizeChanged({
          $panels: panels,
          $panelSize: panelSize
        });
      }

      /**
       * mouse up event handler
       * @private
       */
      function _onMouseUp() {
        if (_isDrag) {
          _jqSplitBar.removeClass('active');
          _jqCursorLayer.remove();
        }

        _isDrag = false;
      }

      /**
       * mouse down event handler
       * @param {object} $event
       * @private
       */
      function _onMouseDown($event) {
        _isDrag = true;

        _jqSplitBar = $($event.currentTarget);
        _negativePanel = _jqSplitBar.data('negativePanel');
        _positivePanel = _jqSplitBar.data('positivePanel');

        _jqSplitBar.addClass('active');

        _jqCursorLayer = $(_cursorLayerTemplate);
        _jqCursorLayer.on('mousemove', _onMouseMove)
          .addClass(_isHorizontal ? 'col-resize' : 'row-resize')
          .appendTo('body');
      }

      /**
       * scope destroy event handler
       * @private
       */
      function _onDestroy() {
        el.find('.split-bar').remove();
        _jqCursorLayer && _jqCursorLayer.remove();
        _detachDomEvents();
      }
    }
  }
})();
