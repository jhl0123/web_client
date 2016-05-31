/**
 * @fileoverview room 커스텀 셀렉트박스 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndSelectboxRoom', jndSelectboxRoom);

  function jndSelectboxRoom($filter, $timeout, TopicFolderModel, publicService, JndUtil, jndPubSub, memberService, RoomTopicList,
                            UserList, BotList) {
    return {
      restrict: 'AE',
      link: link,
      replace: true,
      scope: {
        selectedValue: '=jndDataModel',
        callback: '=jndSelectboxRoom',
        list: '=jndDataList',
        isDisabled: '=jndDataIsDisabled',
        hasAll: '@jndHasAll',
        hasDisabled: '@jndHasDisabled',
        onlyTopics: '@jndOnlyTopics'
      },
      templateUrl: 'app/util/directive/custom-selectbox/jnd.selectbox.room.html'
    };

    function link(scope, el, attrs) {
      var SEARCH_DELAY = 100;
      var _lastKeyword = '';
      var _filterMap;
      var _timerSearch;
      var TOGGLE_DISABLE_SCROLL_DURATION = 500;
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
        scope.isShown = false;
        _initializeFilter();
        _initializeData();
        _attachEvents();
        _attachDomEvents();
      }

      /**
       * 필터를 reset 한다.
       * @private
       */
      function _resetFilter() {
        _initializeFilter();
        _initializeData();
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
        scope.$watch('list', _resetFilter)
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
       * select 된 name 으로 노출한다
       * @private
       */
      function _setSelectedName() {
        JndUtil.safeApply(scope, function() {
          scope.selectedName = _getSelectedName();
        });
      }

      /**
       * Document 의 mouse-down 이벤트 핸들러
       * @param {Event} clickEvent
       * @private
       */
      function _onMouseDownDocument(clickEvent) {
        if (!$(clickEvent.target).closest('._selectbox').is(el)) {
          JndUtil.safeApply(scope, function() {
            close();
          });
        }
      }

      /**
       * 현재 선택된 item 의 name 값을 반환한다
       * @returns {*}
       * @private
       */
      function _getSelectedName() {
        var name;
        var entityList;
        var selectedEntity;
        if (scope.selectedValue) {
          selectedEntity = _.find(_getAllEntities(), function(entity) {
            if (_filterMap) {
              return _filterMap[entity.id] && entity.id === scope.selectedValue;
            } else {
              return entity.id === scope.selectedValue;
            }
          });
        }
        if (selectedEntity) {
          name = selectedEntity.name;
        } else {
          if (scope.hasAll) {
            name = $filter('translate')('@option-all-rooms');
          } else {
            _.forEach(scope.folderData.folderList, function(folder) {
              entityList = $filter('orderBy')(folder.entityList, ['isStarred', '-name'], true);
              _.forEach(entityList, function (entity) {
                name = entity.name;
                scope.selectedValue = entity.id;
                return false;
              });
              if (name) {
                return false;
              }
            });
          }
        }
        return name;
      }

      /**
       * Data 를 초기화 한다
       * @private
       */
      function _initializeData() {
        _lastKeyword = '';
        scope.searchKeyword = '';        
        scope.folderData = _getFolderData();
        scope.memberData = _getMemberData();
        scope.searchList = [];
        scope.isShowDisabled = _isDisabledMemberSelected();
        scope.selectedName = _getSelectedName();
      }

      /**
       * filter 를 초기화한다
       * @private
       */
      function _initializeFilter() {
        var list = scope.list;
        if (list) {
          _filterMap = {};
          _.forEach(list, function(entity) {
            _filterMap[entity.id] = true;
          });
        }
      }

      /**
       * filter 를 적용한 folder hierarchy 데이터 형태로 가공한다.
       * @returns {*|{}}
       * @private
       */
      function _getFolderData() {
        var folderData = TopicFolderModel.getFolderData();
        var entityList;
        var folderList = [];
        if (_filterMap) {
          _.forEach(folderData.folderList, function(folder) {
            entityList = [];
            _.forEach(folder.entityList, function(entity) {
              if (_filterMap[entity.id]) {
                entityList.push(entity);
              }
            });
            if (entityList.length) {
              folderList.push({
                name: folder.name,
                entityList: $filter('orderBy')(entityList, ['isStarred', '-name'], true)
              });
            }
          });
          folderData = {
            folderList: folderList
          };
        }
        return folderData;
      }

      /**
       * change 이벤트 핸들러
       * @param jqTarget
       */
      function onChange(jqTarget) {
        var item = jqTarget.data('item');
        if (item) {
          scope.selectedName = item.name;
          scope.selectedValue = item.id;
        } else {
          scope.selectedName = $filter('translate')('@option-all-rooms');
          scope.selectedValue = null;
        }

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
        var currentMemberId = memberService.getMemberId();
        var memberList = UserList.toJSON();
        var jandiBot = BotList.getJandiBot();
        var enabledList = [];
        var disabledList = [];

        if (jandiBot) {
          memberList.push(jandiBot);
        }

        _.forEach(memberList, function(member) {
          if (!_filterMap || (_filterMap && _filterMap[member.id])) {
            if(currentMemberId !== member.id && !memberService.isConnectBot(member.id)) {
              if (publicService.isDisabledMember(member)) {
                disabledList.push(member);
              } else {
                if (memberService.isJandiBot(member.id)) {
                  enabledList.unshift(member);
                } else {
                  enabledList.push(member);
                }
              }
            }
          }
        });
        return {
          enabledList: _.sortBy(enabledList, 'name'),
          disabledList: _.sortBy(disabledList, 'name')
        };
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
            _.each(_getAllEntities(), function (entity) {
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
            });
          }
          scope.searchList = $filter('orderByQueryIndex')(result, 'name', keyword);
        }
      }

      /**
       * filter 에 걸린 모든 entity 들을 반환한다
       * @returns {*}
       * @private
       */
      function _getAllEntities() {
        var id;
        var allEntities = _.union(RoomTopicList.toJSON(true), UserList.toJSON());
        var jandiBot = BotList.getJandiBot();

        if (jandiBot) {
          allEntities.push(jandiBot);
        }

        if (_filterMap) {
          allEntities = _.filter(allEntities, function(entity) {
            return _filterMap[entity.id];
          });
        }

        allEntities = _.filter(allEntities, function(entity) {
          id = entity.id;
          return !memberService.isConnectBot(id) && id !== memberService.getMemberId();
        });

        return allEntities;
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
