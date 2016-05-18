/**
 * @fileoverview 폴더 draggable 디렉티브
 * @todo: client/app/left/topics/topic/topic.draggable.directive.js
 * 와 로직이 대부분 겹치기 때문에, 향후 공통 로직은 service 혹은 directive 로 뽑아내는 것이 좋을 듯 함.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topicFolderDraggable', topicFolderDraggable);

  function topicFolderDraggable(jndPubSub, TopicUpdateLock, TopicFolderModel, JndPanelSizeStorage) {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        folder: '=topicFolderDraggable'
      },
      link: link
    };

    function link(scope, el, attrs) {
      var _draggingScope;
      var _pageX;
      var _pageY;
      var _jqDraggable;
      var _cursorBaseStyle;
      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        _attachEvents();
        _attachDomEvents();
      }

      /**
       * Scope 이벤트 리스너를 추가한다.
       * @private
       */
      function _attachEvents() {
        scope.$on('topic-folder:drag', _onDragStatusChange);
      }

      /**
       * dragging status 변경 시 핸들러
       * @param {event} angularEvent
       * @param {object} draggingScope
       * @private
       */
      function _onDragStatusChange(angularEvent, draggingScope) {
        _draggingScope = draggingScope;
        if (!_draggingScope) {
          el.removeClass('topic-folder-dropzone-active');
          _hideBorder();
        } else {
          el.addClass('topic-folder-dropzone-active');
        }
      }

      /**
       * dom 이벤트를 바인딩 한다.
       * @private
       */
      function _attachDomEvents() {
        el.on('dragstart', _onDragStart)
          .on('mousedown', _onMouseDown)
          .on('mouseover', _onMouseOver)
          .on('mouseout', _onMouseOut)
          .on('mouseup', _onMouseUp);
      }

      /**
       * drag start 이벤트 핸들러
       * @param {object} mouseEvent
       * @private
       */
      function _onDragStart(mouseEvent) {
        mouseEvent.preventDefault();
      }

      /**
       * mouse up 이벤트 핸들러
       * @param {object} mouseEvent
       * @private
       */
      function _onMouseUp(mouseEvent) {
        if (_isFolderMovable()) {
          var seq = _draggingScope.folder.seq < scope.folder.seq ? scope.folder.seq - 1 : scope.folder.seq;
          TopicFolderModel.modify(_draggingScope.folder.id, {
            seq: seq
          });
        }
      }

      /**
       * mouse over 이벤트 핸들러
       * @private
       */
      function _onMouseOver() {
        if (_isFolderMovable()) {
          _showBorder();
        }
      }

      /**
       * mouseout 이벤트 핸들러
       * @private
       */
      function _onMouseOut() {
        if (_isFolderMovable()) {
          _hideBorder();
        }
      }

      /**
       * 해당 위치로 folder 순서를 바꿀 수 있는지 여부를 반환한다.
       * @returns {*|boolean}
       * @private
       */
      function _isFolderMovable() {
        return _draggingScope && _draggingScope !== scope && _draggingScope.folder.seq + 1 !== scope.folder.seq;
      }

      /**
       * folder 순서 변경 가능표시 border 를 노출한다.
       * @private
       */
      function _showBorder() {
        el.closest('.topic-folder').find('._border').addClass('on');
      }

      /**
       * folder 순서 변경 가능표시 border 를 감춘다.
       * @private
       */
      function _hideBorder() {
        el.closest('.topic-folder').find('._border').removeClass('on');
      }

      /**
       * mousedown 이벤트 핸들러
       * @param {object} mouseEvent
       * @private
       */
      function _onMouseDown(mouseEvent) {
        _setStartPosition(mouseEvent);
        _attachDraggableEvents();
      }

      /**
       * mousedown 시 drag 시작을 파악하기 위한 시작 지점을 기억한다.
       * @param {object} mouseEvent
       * @private
       */
      function _setStartPosition(mouseEvent) {
        _pageX = mouseEvent.pageX;
        _pageY = mouseEvent.pageY;
      }

      /**
       * drag 를 시작한다.
       * @param {object} mouseEvent
       * @private
       */
      function _startDrag(mouseEvent) {
        var jqContainer = $('#lpanel-list-container');
        _draggingScope = scope;
        TopicUpdateLock.lock();
        jndPubSub.pub('topic-folder:drag', scope);
        _cursorBaseStyle = jqContainer.css('cursor');
        jqContainer.css('cursor', 'pointer');
        _showDraggable(mouseEvent);
        el.parent().addClass('topic-dragging');
      }

      /**
       * drag 를 종료한다.
       * @private
       */
      function _endDrag() {
        if (_draggingScope) {
          _draggingScope = null;
          jndPubSub.pub('topic-folder:drag', null);
          $('#lpanel-list-container').css('cursor', _cursorBaseStyle);
          _hideDraggable();
          el.parent().removeClass('topic-dragging');
          TopicUpdateLock.unlock();
        }
      }

      /**
       * drag 엘리먼트를  생성한다.
       * @param {object} mouseEvent
       * @private
       */
      function _showDraggable(mouseEvent) {
        _jqDraggable = $('<div class="lpanel-list topic-folder has-folder topic-folder-draggable"></div>');
        _jqDraggable.css('width', JndPanelSizeStorage.getLeftPanelWidth());

        _jqDraggable.append(el.parent().html());

        $('body').append(_jqDraggable);

        _setDraggablePosition(mouseEvent);
        $(mouseEvent.target).trigger('mouseover');
      }

      /**
       * draggable 엘리먼트의 position 을 설정한다.
       * @param {object} mouseEvent
       * @private
       */
      function _setDraggablePosition(mouseEvent) {
        //mouseover 이벤트가 발생할 수 있도록 하기 위해 위에서 3px, 왼쪽에서 3px 씩 떨어뜨린다.
        var top = mouseEvent.pageY + 3;
        var left = mouseEvent.pageX + 3;
        _jqDraggable.css({
          top: top + 'px',
          left: left + 'px'
        });
      }

      /**
       * draggable 엘리먼트를 제거한다.
       * @private
       */
      function _hideDraggable() {
        _jqDraggable.remove();
      }

      /**
       * mousedown 이 일어난 지점부터의 거리를 구한다.
       * @param {event} mouseMoveEvent 이벤트 객체
       * @return {number} 처음 위치좌표로 부터의 거리.
       * @private
       */
      function _getDistance(mouseMoveEvent) {
        var pageX = mouseMoveEvent.pageX;
        var pageY = mouseMoveEvent.pageY;
        var x = Math.abs(_pageX - pageX);
        var y = Math.abs(_pageY - pageY);
        return Math.round(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
      }

      /**
       * draggable 을 위한 window 이벤트를 binding 한다.
       * @private
       */
      function _attachDraggableEvents() {
        $(window).on('mousemove', _onWindowMouseMove);
        $(window).on('selectstart', _onWindowSelectStart);
        $(window).on('mouseup', _onWindowMouseUp);
      }

      /**
       * draggable 을 위한 window 이벤트를 제거한다.
       * @private
       */
      function _detachDraggableEvents() {
        $(window).off('mousemove', _onWindowMouseMove);
        $(window).off('selectstart', _onWindowSelectStart);
        $(window).off('mouseup', _onWindowMouseUp);
      }

      /**
       * select start 이벤트 발생 시 이벤트 핸들러
       * @param {object} mouseEvent
       * @private
       */
      function _onWindowSelectStart(mouseEvent) {
        mouseEvent.preventDefault();
      }

      /**
       * mouseup 이벤트가 발생했을 때.
       * @private
       */
      function _onWindowMouseUp() {
        _endDrag();
        _detachDraggableEvents();
      }

      /**
       * dragging 시작된 상태에서 mousemove 이벤트 발생 시
       * @param {object} mouseEvent
       * @private
       */
      function _onWindowMouseMove(mouseEvent) {
        if (_draggingScope) {
          _setDraggablePosition(mouseEvent);
        } else {
          if (_getDistance(mouseEvent) > 5) {
            _startDrag(mouseEvent);
          }
        }
      }
    }
  }
})();
