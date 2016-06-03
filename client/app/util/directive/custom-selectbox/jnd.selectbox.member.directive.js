/**
 * @fileoverview member 커스텀 셀렉트박스 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndSelectboxMember', jndSelectboxMember);

  function jndSelectboxMember($filter, $timeout, EntityFilterMember, publicService, JndUtil, jndPubSub, memberService) {
    return {
      restrict: 'AE',
      link: link,
      replace: true,
      scope: {
        callback: '=jndSelectboxMember',
        selectedValue: '=jndDataModel',
        list: '=jndDataList',
        isDisabled: '=jndDataIsDisabled'
      },
      templateUrl: 'app/util/directive/custom-selectbox/jnd.selectbox.member.html'
    };

    function link(scope, el, attrs) {
      var SEARCH_DELAY = 100;
      var _lastKeyword = '';
      var _timerSearch;
      var TOGGLE_DISABLE_SCROLL_DURATION = 500;
      
      // profile image를 보여줄지 여부
      var _isShowProfileImage = attrs.isShowProfileImage === 'true';

      scope.close = close;
      scope.onKeyUp = onKeyUp;
      scope.toggleShow = toggleShow;
      scope.onChange = onChange;
      scope.toggleDisabled = toggleDisabled;

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
        scope.$watch('selectedValue', _setSelectedName);
      }

      /**
       * select 된 name 으로 노출한다
       * @private
       */
      function _setSelectedName() {
        JndUtil.safeApply(scope, function() {
          var selectedItem = _getSelectedItem();

          scope.selectedName = _getSelectedName(selectedItem);
          scope.selectedImageUrl = _getSelectedImageUrl(selectedItem);
        });
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
       * 현재 선택된 item 을 반환한다
       * @returns {*}
       * @private
       */
      function _getSelectedItem() {
        return _.find(_getMembers(), function(member) {
          return member.id === scope.selectedValue;
        });
      }

      /**
       * 현재 선택된 item 의 name 값을 반환한다
       * @param {object} selectedItem
       * @returns {*}
       * @private
       */
      function _getSelectedName(selectedItem) {
        return selectedItem ? selectedItem.name :  $filter('translate')('@option-all-members');
      }

      /**
       * 현재 선택된 item 의 image url 값을 반환한다
       * @param {object} selectedItem
       * @returns {*}
       * @private
       */
      function _getSelectedImageUrl(selectedItem) {
        var imageUrl;

        if (selectedItem) {
          imageUrl = memberService.getProfileImage(selectedItem.id);
        }

        return imageUrl || '';
      }

      /**
       * 현재 선택된 item 의 value 값을 반환한다
       * @param {object} selectedItem
       * @returns {*}
       * @private
       */
      function _getSelectedValue(selectedItem) {
        return selectedItem ? selectedItem.id : 'all';
      }

      /**
       * Data 를 초기화 한다
       * @private
       */
      function _initializeData() {
        var selectedItem = _getSelectedItem();
        _lastKeyword = '';
        scope.searchKeyword = '';
        scope.memberData = _getMemberData();
        scope.searchList = [];
        scope.isShowDisabled = _isDisabledMemberSelected();
        scope.selectedName = _getSelectedName(selectedItem);
        scope.selectedImageUrl = _getSelectedImageUrl(selectedItem);
      }

      /**
       * change 이벤트 핸들러
       * @param jqTarget
       */
      function onChange(jqTarget) {
        var item = jqTarget.data('item');

        scope.selectedName = _getSelectedName(item);
        scope.selectedImageUrl = _getSelectedImageUrl(item);
        scope.selectedValue = _getSelectedValue(item);

        if (_.isFunction(scope.callback)) {
          scope.callback();
        }
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
            _extendThumbnail(member);
            if (publicService.isDisabledMember(member)) {
              disabledList.push(member);
            } else {
              if (memberService.isJandiBot(member.id)) {
                enabledList.unshift(member);
                member.extIsJandiBot = true;
                member.extCss = 'jandiBot';
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
        $timeout.cancel(_timerSearch);
        _timerSearch = $timeout(_.bind(_search, this, $(keyEvent.target).val()), SEARCH_DELAY);
      }

      /**
       * 메시지를 검색한다
       * @param {string} keyword
       * @private
       */
      function _search(keyword) {
        scope.searchKeyword = keyword;
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
                  _extendThumbnail(entity);
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
       * member 의 thumbnail 정보를 확장한다.
       * @param {object} member
       * @private
       */
      function _extendThumbnail(member) {
        member.extThumbnail = $filter('getSmallThumbnail')(member);
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
