/**
 * @filevoerview team switch 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('leftTeamSwitch', leftTeamSwitch);

  /**
   * @use angular-bootstrap v0.13.4 $position
   */
  function leftTeamSwitch($position, $timeout, configuration, jndKeyCode, JndUtil) {
    return {
      restrict: 'E',
      scope: {
        team: '='
      },
      link: link,
      replace: true,
      templateUrl: 'app/left/team-switch/left.team.switch.html',
      controller: 'LeftTeamSwitchCtrl'
    };

    function link(scope, el, attrs) {
      var _jqList = el.find('._list');
      var _jqSwitchButton = el.find('.team-switch-button');
      var _jqSwitchContents = el.find('.team-list');

      var _timer;

      _init();

      /**
       * 초기화 메서드
       * @private
       */
      function _init() {
        scope.activeIndex = 0;
        scope.isOpen = false;

        scope.isActive = isActive;
        scope.setActive = setActive;
        scope.go = go;

        _attachEvent();
        _attachDomEvent();
        _setMaxHeight();
      }

      /**
       * dom event 를 바인딩한다.
       * @private
       */
      function _attachDomEvent() {
        $(window).on('resize', _onWindowResize);
        _jqSwitchButton.on('keydown', _onKeyDown);
      }

      /**
       * dom event 바인딩을 해제한다.
       * @private
       */
      function _detachDomEvent() {
        $(window).off('resize', _onWindowResize);
      }

      /**
       * 이벤트를 바인딩 한다.
       * @private
       */
      function _attachEvent() {
        scope.$on('modalHelper:opened', _onModalOpened);
        scope.$on('headerCtrl:teamSwitchOpen', _onTeamSwitchOpen);
        scope.$on('jndMainKeyHandler:teamSwitchToggle', _onTeamSwitchToggle);
        scope.$on('jndWebSocketOtherTeam:afterNotificationSend', _onAfterNotificationSend);
        scope.$on('$destroy', _onDestroy);

        scope.$watch('isOpen', _onIsOpenChange);
      }

      /**
       * max-height 을 설정한다.
       * @private
       */
      function _setMaxHeight() {
        var height = $('.lpanel-user__user').height() + $('#lpanel-list-container').height() + 17;
        _jqList.css({'max-height': height + 'px'});
      }

      /**
       * window resize 시 이벤트 핸들러
       * @private
       */
      function _onWindowResize() {
        clearTimeout(_timer);
        _timer = setTimeout(function() {
          _setMaxHeight();
          _autoScroll(scope.activeIndex);
        }, 100);
      }

      /**
       * keydown 이벤트 핸들러
       * @param {object} $event
       * @private
       */
      function _onKeyDown($event) {
        var keyCode = $event.keyCode;

        if (jndKeyCode.match('UP_ARROW', keyCode)) {
          scope.setActive((scope.activeIndex > 0 ? scope.activeIndex : scope.teamList.length) - 1);
          scope.$digest();
        } else if (jndKeyCode.match('DOWN_ARROW', keyCode)) {
          scope.setActive((scope.activeIndex + 1) % scope.teamList.length);
          scope.$digest();
        } else if (jndKeyCode.match('ENTER', keyCode)) {
          scope.go(scope.teamList[scope.activeIndex]);
        }
      }

      /**
       * 팀 변경 토글 이벤트 처리함
       * @private
       */
      function _onTeamSwitchToggle() {
        JndUtil.safeApply(scope, function() {
          scope.isOpen = !scope.isOpen;
        });
      }

      /**
       * 팀 변경 열림 이벤트 처리함
       * @private
       */
      function _onTeamSwitchOpen() {
        if (scope.isOpen === false) {
          scope.isOpen = true;
        }
      }

      /**
       * isOpen 변경 이벤트 처리함.
       * @param {boolean} newIsOpen
       * @param {boolean} oldIsOpen
       * @private
       */
      function _onIsOpenChange(newIsOpen, oldIsOpen) {
        if (scope.hasOtherTeam) {
          if (newIsOpen !== oldIsOpen) {
            _jqList.slideToggle(200);

            if (newIsOpen) {
              scope.activeIndex = 0;
              _jqSwitchButton.focus();
            }
          }
        } else {
          scope.isOpen = false;
        }
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _detachDomEvent();
      }

      /**
       * 알림 전송 후 이벤트 처리함.
       * @private
       */
      function _onAfterNotificationSend() {
        // badge dot를 blink 한다.
        scope.hasBlink = false;
        $timeout(function() {
          scope.hasBlink = true;
        }, 10);
      }

      /**
       * modal opened 이벤트 처리
       * @private
       */
      function _onModalOpened() {
        JndUtil.safeApply(scope, function() {
          scope.isOpen = false;
        });
      }

      /**
       * 해당 팀으로 이동한다.
       * @param {object} team
       */
      function go(team) {
        if (team) {
          $('body').addClass('fade out');
          window.location.href = configuration.base_protocol + team.t_domain + configuration.base_url;
        }
      }

      /**
       * active 여부
       * @param {number} $index
       * @returns {boolean}
       */
      function isActive($index) {
        return scope.activeIndex === $index;
      }

      /**
       * active 설정
       * @param {number} $index
       * @returns {*}
       */
      function setActive($index) {
        _autoScroll($index);

        return scope.activeIndex = $index;
      }

      /**
       * 특정 item이 list에서 보이도록 scroll 설정
       * @param {number} index
       */
      function _autoScroll(index) {
        var jqItem = _jqSwitchContents.children().eq(index);
        var itemPosition;
        var contPosition;
        var scrollTop;
        var compare;

        if (jqItem[0]) {
          scrollTop = _jqSwitchContents.scrollTop();

          itemPosition = $position.offset(jqItem);
          contPosition = $position.offset(_jqSwitchContents);

          compare = itemPosition.top - contPosition.top;
          if (compare < 0) {
            _jqSwitchContents.scrollTop(scrollTop + compare);
          } else if (compare + itemPosition.height > contPosition.height) {
            _jqSwitchContents.scrollTop(scrollTop + compare - contPosition.height + itemPosition.height);
          }
        }
      }
    }
  }
})();
