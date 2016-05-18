/**
 * @fileoverview Center 패널의 Header 영역에서 토픽 멤버 리스트 커스텀 셀렉트박스 디렉티브
 * @todo: custom selectbox 는 공통 로직에 대해 상속 등의 방법을 활용하여 refactoring 필요함.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndSelectboxTopicMember', jndSelectboxTopicMember);

  function jndSelectboxTopicMember($filter, EntityFilterMember, publicService, JndUtil, jndPubSub, memberService,
                                   CoreUtil) {
    return {
      restrict: 'AE',
      link: link,
      replace: true,
      scope: {
        onSelect: '&onSelect',
        onKickout: '&onKickout',
        list: '=jndDataList',
        isDisabled: '=jndDataIsDisabled'
      },
      templateUrl: 'app/util/directive/custom-selectbox/jnd.selectbox.topic.member.html'
    };

    function link(scope, el, attrs) {
      var _lastKeyword = '';
      var _isPreventSelect = false;
      var TOGGLE_DISABLE_SCROLL_DURATION = 500;

      // profile image를 보여줄지 여부
      var _isShowProfileImage = attrs.isShowProfileImage === 'true';

      scope.close = close;
      scope.onKeyUp = onKeyUp;
      scope.toggleShow = toggleShow;
      scope.onChange = onChange;
      scope.toggleDisabled = toggleDisabled;
      scope.onClickKickout = onClickKickout;
      
      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        scope.isShowProfileImage = _isShowProfileImage;

        scope.isShown = false;
        scope.searchKeyword = '';

        // 모든 멤버 허용 여부
        scope.isAllowAllMember = scope.$eval(attrs.isAllowAllMember) !== false;

        _initializeData();
        _attachEvents();
        _attachDomEvents();
      }

      /**
       * kickout 클릭 시 이벤트 핸들러
       * @param {object} clickEvent
       * @param {number} memberId
       */
      function onClickKickout(clickEvent, memberId) {
        _isPreventSelect = true;
        scope.onKickout({
          memberId: memberId
        });
      }
      
      /**
       * selectbox 를 닫는다
       */
      function close() {
        el.find('.custom-select-box').hide();
        scope.isShown = false;
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _detachDomEvents();
      }

      /**
       * 이벤트 바인딩 한다
       * @private
       */
      function _attachEvents() {
        scope.$on('$destroy', _onDestroy);
        scope.$watch('list', _initializeData);
      }

      /**
       * DOM 이벤트 바인딩
       * @private
       */
      function _attachDomEvents() {
        $(document).on('mousedown', _onMouseDownDocument);
      }

      /**
       * DOM 이벤트 바인딩 해제
       * @private
       */
      function _detachDomEvents() {
        $(document).off('mousedown', _onMouseDownDocument);
      }

      /**
       * Document 의 mouse-down 이벤트 핸들러
       * @param {Event} clickEvent
       * @private
       */
      function _onMouseDownDocument(clickEvent) {
        if (!$(clickEvent.target).closest('._selectbox').is(el)) {
          JndUtil.safeApply(scope, function() {
            el.find('.custom-select-box').hide();
            close();
          });
        }
      }

      /**
       * 현재 선택된 item 의 value 값을 반환한다
       * @param {object} selectedItem
       * @returns {*}
       * @private
       */
      function _getSelectedValue(selectedItem) {
        return CoreUtil.pick(selectedItem, 'id');
      }

      /**
       * Data 를 초기화 한다
       * @private
       */
      function _initializeData() {
        _isPreventSelect = true;
        scope.selectedValue = CoreUtil.pick(scope, 'list', 0, 'id');
        scope.memberData = _getMemberData();
        scope.searchList = [];
        scope.isShowDisabled = _isDisabledMemberSelected();
      }

      /**
       * change 이벤트 핸들러
       * @param targetScope
       */
      function onChange(targetScope) {
        var item = targetScope.item;
        scope.selectedValue = _getSelectedValue(item);
        if (!_isPreventSelect) {
          scope.onSelect({
            memberId: item.id
          });
        }
        _isPreventSelect = false;
      }

      /**
       * 차단 사용자 노출 여부를 toggle 한다
       */
      function toggleDisabled() {
        var jqDisabledList = el.find('.menulist-item-block');
        if (scope.isShowDisabled) {
          jqDisabledList.stop().slideUp(TOGGLE_DISABLE_SCROLL_DURATION, function() {
            JndUtil.safeApply(scope, function() {
              scope.isShowDisabled = !scope.isShowDisabled;
            });
          });
        } else {
          scope.isShowDisabled = true;
          setTimeout(_scrollToDisable, 50);
        }
      }

      /**
       * disable list 를 슬라이드 하여 노출한다
       * @private
       */
      function _scrollToDisable() {
        var memberData = _getMemberData();
        var jqDisabledBtn = el.find('.toggle-menulist');
        var jqContainer = el.find('._container');
        var scrollTop = jqContainer.scrollTop();
        var currentOffsetTop = jqDisabledBtn.offset().top;
        var offsetTop = jqContainer.offset().top;
        jqContainer.stop().animate({
          scrollTop: scrollTop + (currentOffsetTop - offsetTop)
        }, TOGGLE_DISABLE_SCROLL_DURATION, 'swing', function() {
          jndPubSub.pub('custom-focus:focus-value', memberData.disabledList[0].id)
        });
      }

      /**
       * (차단 사용자 리스트를 노출할지 여부 확인을 위해)
       * 차단 사용자가 선택되었는지 여부를 반환한다.
       * @returns {boolean}
       * @private
       */
      function _isDisabledMemberSelected() {
        return !!_.find(scope.memberData.disabledList, function(member) {
          return member.id === scope.selectedValue;
        });
      }

      /**
       * member data 를 반환한다
       * @returns {{enabledList: Array, disabledList: Array}}
       * @private
       */
      function _getMemberData() {
        var members = _getMembers();
        var enabledList = [];
        var disabledList = [];
        _.each(members, function(member) {
          if (!memberService.isConnectBot(member.id)) {
            if (publicService.isDisabledMember(member)) {
              disabledList.push(member);
            } else {
              if (memberService.isJandiBot(member.id)) {
                enabledList.unshift(member);
                member.extIsJandiBot = true;
              } else {
                enabledList.push(member);
              }
            }
          }
        });
        return {
          enabledList: enabledList,
          disabledList: disabledList
        };
      }

      /**
       * member list 를 반환한다
       * @returns {string|*}
       * @private
       */
      function _getMembers() {
        return scope.list  || EntityFilterMember.toJSON();
      }

      /**
       * select 레이어의 노출 여부를 toggle 한다
       */
      function toggleShow() {
        if (!scope.isDisabled) {
          scope.isShown = !scope.isShown;
          _initializeData();
        }
      }
      /**
       * keyup 이벤트 핸들러
       */
      function onKeyUp(keyEvent) {
        _search($(keyEvent.target).val());
      }

      /**
       * 메시지를 검색한다
       * @param {string} keyword
       * @private
       */
      function _search(keyword) {
        var start;
        var result = [];
        keyword = _.trim(keyword);

        if (!_isSameKeyword(keyword)) {
          _lastKeyword = keyword;
          if (keyword) {
            keyword = keyword.toLowerCase();
            _.each(_getMembers(), function (entity) {
              if (!memberService.isConnectBot(entity.id)) {
                start = entity.name.toLowerCase().indexOf(keyword);
                if (start !== -1) {
                  if (scope.isShowDisabled) {
                    entity.extSearchName = _highlight(entity.name, start, keyword.length);
                    if (publicService.isDisabledMember(entity)) {
                      entity.extSearchName = '<del>' + entity.extSearchName + '</del>';
                    }
                    result.push(entity);
                  } else if (!publicService.isDisabledMember(entity)) {
                    entity.extSearchName = _highlight(entity.name, start, keyword.length);
                    result.push(entity);
                  }
                }
              }
            });
          }
          scope.searchList = $filter('orderByQueryIndex')(result, 'name', keyword);
        }
      }

      /**
       * 동일 keyword 인지 여부를 반환한다
       * @param {string} keyword
       * @returns {boolean}
       * @private
       */
      function _isSameKeyword(keyword) {
        return _lastKeyword === keyword;
      }

      /**
       * 검색한 message 를 highlight 처리한다
       * @param {string} string - 검색 대상 string
       * @param {number} start - 검색할 string 이 검출된 시작 위치
       * @param {number} length - 검색할 string 의 길이
       * @returns {string} - highlight 처리된 결과
       * @private
       */
      function _highlight(string, start, length) {
        var strArr = [
          string.substring(0, start),
          '<b>',
          string.substring(start, start + length),
          '</b>',
          string.substring(start + length)
        ];
        return strArr.join('');
      }
    }
  }
})();
