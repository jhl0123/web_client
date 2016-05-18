/**
 * @fileoverview stars controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightStarsCtrl', RightStarsCtrl);

  /* @ngInject */
  function RightStarsCtrl($scope, $filter, $timeout, StarAPIService, JndUtil) {
    var _starListData = {
      messageId: null
    };
    var MENTIONS_COUNT = 20;
    var _removeItems = [];

    var _timerRemoveItems;

    _init();

    // First function to be called.
    function _init() {
      $scope.activeTabName = 'all';

      // 각 tab을 각각의 controller로 쪼개야됨
      $scope.tabs = {
        all: {
          list: [],
          map: {},
          // tab의 loading 상태 여부
          isLoading: false,
          // tab의 scroll loading 상태 여부
          isScrollLoading: false,
          // tab name
          name: $filter('translate')('@star-all'),
          // tab 활성화 여부
          active: true,
          // tab list 전체가 load 되었는지 여부
          isEndOfList: false,
          // tab 비어있는지 여부
          isEmpty: false,
          // tab 첫 load가 되었는지 여부
          hasFirstLoad: false
        },
        files: {
          list: [],
          map: {},
          isLoading: false,
          isScrollLoading: false,
          name: $filter('translate')('@star-files'),
          active: false,
          isEndOfList: false,
          isEmpty: false,
          hasFirstLoad: false
        }
      };

      $scope.loadMore = loadMore;
      $scope.messageType = $scope.fileType = 'star';
      $scope.isConnected = true;

      $scope.onTabSelect = onTabSelect;

      _initStarListData($scope.activeTabName);

      _attachScopeEvents();
    }

    /**
     * attach scope events
     * @private
     */
    function _attachScopeEvents() {
      $scope.$on('externalFile:fileShareChanged', _onFileShareChanged);

      // open right panel
      $scope.$on('rightPanelStatusChange', _onRightPanelStatusChange);

      // star / unstar
      $scope.$on('message:starred', _starred);
      $scope.$on('message:unStarred', _unStarred);

      // create/delete comment
      $scope.$on('jndWebSocketFile:commentCreated', _rightFileDetailOnFileCommentCreated);
      $scope.$on('jndWebSocketFile:commentDeleted', _rightFileDetailOnFileCommentDeleted);

      // delete message/file
      $scope.$on('jndWebSocketMessage:topicMessageDeleted', _topicMessageDeleted);
      $scope.$on('rightFileDetailOnFileDeleted', _rightFileOnFileDeleted);

      // 컨넥션이 끊어졌다 연결되었을 때, refreshFileList 를 호출한다.
      $scope.$on('connected', _onConnected);
      $scope.$on('disconnected', _onDisconnected);
      $scope.$on('NetInterceptor:onGatewayTimeoutError', _refreshView);
      $scope.$on('Auth:refreshTokenSuccess', _refreshView);
    }

    /**
     * 외부 파일공유 상태 변경 이벤트 핸들러
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _onFileShareChanged($event, data) {
      var msg = $scope.tabs.all.map[data.id];

      if (msg) {
        msg.message.content.externalUrl = data.content.externalUrl;
        msg.message.content.externalCode = data.content.externalCode;
        msg.message.content.externalShared = data.content.externalShared;
      }
    }

    /**
     * open right panel event handler
     * @private
     */
    function _onRightPanelStatusChange() {
      if ($scope.status.isActive && !$scope.tabs[$scope.activeTabName].hasFirstLoad) {
        // 'rightPanelStatusChange' event 발생시 tab(all, file)이 최초로 로드되는 시점에만 star list를 호출한다

        _refreshActiveTab($scope.activeTabName);
      }
    }

    /**
     * starred event handler
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _starred($event, data) {
      var index;

      index = _removeItems.indexOf(data.messageId);
      if (index > -1) {
        // starred된 item이 삭제목록에 존재한다면 삭제 목록에서 제거

        _removeItems.splice(index, 1);
      } else {
        // star된 item을 star list에 추가

        _getStarItem(data.messageId);
      }
    }

    /**
     * unstarred event handler
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _unStarred($event, data) {
      var messageId = data.messageId;

      if ($scope.tabs.all.map[messageId]) {
        // unstar된 item이 star list에 존재한다면 삭제 목록에 추가함

        _removeItems.push(messageId);

        // 일정 시간이 흐른 후 unstarred된 star list를 한번에 제거함
        $timeout.cancel(_timerRemoveItems);
        _timerRemoveItems = $timeout(function() {
          var messageId;

          for (;messageId = _removeItems.pop();) {
            if ($scope.tabs.files.map[messageId]) {
              _removeStarItem('files', messageId);
            }

            _removeStarItem('all', messageId);
          }

          !$scope.tabs.all.list.length && _setEmptyTab('all', true);
          !$scope.tabs.files.list.length && _setEmptyTab('files', true);
        }, 0);
      }
    }

    /**
     * delete message socket event
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _topicMessageDeleted($event, data) {
      _removeStarItem('all', data.messageId);
      _removeStarItem('files', data.messageId);
    }

    /**
     * delete file socket event
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _rightFileOnFileDeleted($event, data) {
      _removeStarItem('all', data.file.id);
      _removeStarItem('files', data.file.id);
    }

    /**
     * create comment socket event
     */
    function _rightFileDetailOnFileCommentCreated($event, data) {
      _updateComment('create', data);
    }

    /**
     * delete comment socket event
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _rightFileDetailOnFileCommentDeleted($event, data) {
      _updateComment('delete', data);
    }

    /**
     * comment item 갱신
     * @param {string} type
     * @param {object} data
     * @private
     */
    function _updateComment(type, data) {
      var fileId;
      var commentCount;

      if (data.file) {
        fileId =  data.file.id;
        commentCount = data.file.commentCount;

        if (type === 'delete') {
          // 삭제된 comment가 tabs의 item으로 존재한다면 해당 item 삭제
          _removeStarItem('all', data.comment.id);
          _removeStarItem('files', data.comment.id);
        }

        _updateCommentCount('all', fileId, commentCount);
        _updateCommentCount('files', fileId, commentCount);
      }
    }

    /**
     * comment count 갱신
     * @param {string} activeTabName
     * @param {number} fileId
     * @param {number} count
     * @private
     */
    function _updateCommentCount(activeTabName, fileId, count) {
      var item;
      if (item = $scope.tabs[activeTabName].map[fileId]) {
        item.message.commentCount = count;
      }
    }

    /**
     * scrolling시 star list 불러오기
     */
    function loadMore() {
      var activeTabName = $scope.activeTabName;
      var activeTab = $scope.tabs[activeTabName];

      if (_isValidLoadMore(activeTab)) {
        activeTab.isScrollLoading = true;

        _getStarList(activeTabName);
      }
    }

    /**
     * load more 가능여부
     * @param {object} activeTab
     * @returns {boolean}
     * @private
     */
    function _isValidLoadMore(activeTab) {
      return !(activeTab.isScrollLoading || activeTab.isEndOfList) &&
        $scope.isConnected &&
        !activeTab.isEmpty;
    }

    /**
     * 활성화된 텝의 list를 갱신함
     * @param {string} activeTabName
     * @private
     */
    function _refreshActiveTab(activeTabName) {
      if ($scope.isConnected) {
        _initStarListData(activeTabName);
        _initGetStarList(activeTabName);
      }
    }

    /**
     * tab(all,file) select event handler
     * @param {string} type
     */
    function onTabSelect(type) {
      if ($scope.status.isActive) {
        $scope.tabs[type].active = true;
        $scope.activeTabName = type;

        if (!$scope.tabs[type].hasFirstLoad) {
          _refreshActiveTab($scope.activeTabName);
        }
      }
    }

    /**
     * tab(all,file) star list 초기화
     * @param {string} activeTabName
     * @private
     */
    function _initStarListData(activeTabName) {
      var activeTab = $scope.tabs[activeTabName];

      _starListData.messageId = null;

      activeTab.list = [];
      activeTab.map = {};
      activeTab.isEndOfList = activeTab.isLoading = activeTab.isScrollLoading = false;
      activeTab.searchStatus = _getSearchStatus(activeTab);
    }

    /**
     * tab(all,file) star list 초기 load
     * @param {string} activeTabName
     * @private
     */
    function _initGetStarList(activeTabName) {
      var activeTab = $scope.tabs[activeTabName];

      if (!activeTab.isLoading) {
        // loading시 연속해서 star list를 갱신하지 않도록 한다.

        activeTab.isLoading = true;
        activeTab.isEmpty = false;
        activeTab.searchStatus = _getSearchStatus(activeTab);

        _getStarList(activeTabName);
      }
    }

    /**
     * star list 전달
     * @param {string} activeTabName
     * @private
     */
    function _getStarList(activeTabName) {
      var activeTab = $scope.tabs[activeTabName];

      StarAPIService.get(_starListData.messageId, MENTIONS_COUNT, (activeTabName === 'files' ? 'file' : undefined))
        .success(function(data) {
          if (data) {
            if (data.records && data.records.length) {
              _addStars(data.records, activeTabName);
            }

            // 다음 getStarList에 전달할 param 갱신
            _updateCursor(activeTabName, data);

            activeTab.hasFirstLoad = true;
            !activeTab.list.length && _setEmptyTab(activeTabName, true);
          }
        })
        .error(JndUtil.alertUnknownError)
        .finally(function() {
          activeTab.isLoading = activeTab.isScrollLoading = false;
          activeTab.searchStatus = _getSearchStatus(activeTab);
        });
    }

    /**
     * 특정 star item 전달
     * @param {string} messageId
     * @private
     */
    function _getStarItem(messageId) {
      StarAPIService.getItem(messageId)
        .success(function(data) {
          if (data) {
            !$scope.tabs.all.list.length && _setEmptyTab('all', false);
            _addStar('all', data, true);

            if (data.message.contentType === 'file') {
              // star item이 file type이라면 files list에도 추가함
              !$scope.tabs.files.list.length && _setEmptyTab('files', false);
              _addStar('files', data, true);
            }
          }
        });
    }

    /**
     * tab(all,file)의 list를 설정
     * @param {object} records
     * @param {string} activeTabName
     * @private
     */
    function _addStars(records, activeTabName) {
      var record;
      var i;
      var len;

      for (i = 0, len = records.length; i < len; i++) {
        record = records[i];

        record.activeTabName = activeTabName;
        _addStar(activeTabName, record);
      }
    }

    /**
     * tab(all,file)의 item을 추가
     * @param {string} activeTabName
     * @param {object} data
     * @param {boolean} isUnShift - unshift 또는 push 처리 여부
     * @private
     */
    function _addStar(activeTabName, data, isUnShift) {
      var activeTab = $scope.tabs[activeTabName];

      if (activeTab.map[data.message.id] == null) {
        activeTab.list[isUnShift ? 'unshift' : 'push'](data);
        activeTab.map[data.message.id] = data;
      }
    }

    /**
     * tab(all,file)의 item을 제거
     * @param {string} activeTabName
     * @param {number} messageId
     * @private
     */
    function _removeStarItem(activeTabName, messageId) {
      var list = $scope.tabs[activeTabName].list;
      var map = $scope.tabs[activeTabName].map;
      var index;

      index = list.indexOf(map[messageId]);
      if (index > -1) {
        list.splice(index, 1);
        delete map[messageId];
      }

      if (!list.length) {
        _setEmptyTab(activeTabName, true);
      }
    }

    /**
     * 비어있는 tab(all, file)으로 설정
     * @param {string} activeTabName
     * @param {boolean} value
     * @private
     */
    function _setEmptyTab(activeTabName, value) {
      var activeTab = $scope.tabs[activeTabName];

      activeTab.isEmpty = value;
      activeTab.isEndOfList = !value;
      activeTab.searchStatus = _getSearchStatus(activeTab);
    }

    /**
     * 다음 star list를 얻어오는 param과 tab(all, file)의 상태 갱신
     * @param {string} activeTabName
     * @param {object} data
     * @private
     */
    function _updateCursor(activeTabName, data) {
      var activeTab = $scope.tabs[activeTabName];

      if (data.records && data.records.length > 0) {
        _starListData.messageId = data.records[data.records.length - 1].starredId;
      }

      if (activeTab.list && activeTab.list.length > 0) {
        // 더이상 star list가 존재하지 않으므로 endOfList로 처리함
        activeTab.isEndOfList = !data.hasMore;
      }
    }

    /**
     * 검색 상태 전달
     * @param {string} activeTab
     * @returns {*}
     * @private
     */
    function _getSearchStatus(activeTab) {
      var searchStatus;

      if (activeTab.isLoading) {
        searchStatus = 'loading';
      } else if (activeTab.isEmpty) {
        searchStatus = 'empty';
      }

      return searchStatus;
    }

    /**
     * 네트워크 활성 이벤트 핸들러
     * @private
     */
    function _onConnected() {
      _refreshView();
    }

    /**
     * view 갱신
     * @private
     */
    function _refreshView() {
      $scope.isConnected = true;

      if($scope.status.isActive) {
        _refreshActiveTab($scope.activeTabName);
      } else {
        $scope.tabs.all.hasFirstLoad = false;
        $scope.tabs.files.hasFirstLoad = false;
      }
    }

    /**
     * 네크워크 비활성 이벤트 핸들러
     * @private
     */
    function _onDisconnected() {
      $scope.isConnected = false;
    }
  }
})();
