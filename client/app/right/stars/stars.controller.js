/**
 * @fileoverview stars controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightPanelStarsTabCtrl', RightPanelStarsTabCtrl);

  /* @ngInject */
  function RightPanelStarsTabCtrl($scope, $filter, $state, $timeout, Router, StarAPIService) {
    var starListData = {
      messageId: null
    };
    var isActivated;

    var removeItems = [];
    var timerRemoveItems;

    _init();

    // First function to be called.
    function _init() {
      // �� tab�� ������ controller�� �ɰ��ߵ�
      $scope.tabs = {
        all: {
          list: [],
          map: {},
          // tab�� loading ���� ����
          isLoading: false,
          // tab�� scroll loading ���� ����
          isScrollLoading: false,
          // tab name
          name: $filter('translate')('@star-all'),
          // tab Ȱ��ȭ ����
          active: true,
          // tab list ��ü�� load �Ǿ����� ����
          endOfList: false,
          // tab ����ִ��� ����
          empty: false,
          // tab ù load�� �Ǿ����� ����
          hasFirstLoad: false
        },
        files: {
          list: [],
          map: {},
          isLoading: false,
          isScrollLoading: false,
          name: $filter('translate')('@star-files'),
          active: false,
          endOfList: false,
          empty: false,
          hasFirstLoad: false
        }
      };
      $scope.activeTabName = 'all';

      $scope.loadMore = loadMore;
      $scope.messageType = $scope.fileType = 'star';

      $scope.onTabSelect = onTabSelect;

      _initStarListData($scope.activeTabName);

      if (Router.getActiveRightTabName($state.current) === 'stars') {
        isActivated = true;

        // onTabSelect�� �ٷ� ����Ǳ� ������ ���⼭ �������� ����
        //_initGetStarList();
      }
    }

    /**
     * open right panel event handler
     */
    $scope.$on('onRightPanel', function($event, data) {
      if (data.type === 'stars') {
        isActivated = true;

        if (!$scope.tabs[$scope.activeTabName].hasFirstLoad) {
          // 'onRightPanel' event �߻��� tab(all, file)�� ���ʷ� �ε�Ǵ� �������� star list�� ȣ���Ѵ�
          _initStarListData($scope.activeTabName);
          _initGetStarList($scope.activeTabName);
        }
      } else {
        isActivated = false;
      }
    });

    /**
     * starred event handler
     */
    $scope.$on('starred', function($event, data) {
      var index;

      index = removeItems.indexOf(data.messageId);
      if (index > -1) {
        // starred�� item�� ������Ͽ� �����Ѵٸ� ���� ��Ͽ��� ����

        removeItems.splice(index, 1);
      } else {
        // star�� item�� star list�� �߰�

        _getStarItem(data.messageId);
      }
    });

    /**
     * unstarred event handler
     */
    $scope.$on('unStarred', function($event, data) {
      var messageId = data.messageId;

      if ($scope.tabs.all.map[messageId]) {
        // unstar�� item�� star list�� �����Ѵٸ� ���� ��Ͽ� �߰���

        removeItems.push(messageId);

        // ���� �ð��� �帥 �� unstarred�� star list�� �ѹ��� ������
        $timeout.cancel(timerRemoveItems);
        timerRemoveItems = $timeout(function() {
            var messageId;

            for (;messageId = removeItems.pop();) {
              if ($scope.tabs.files.map[messageId]) {
                _removeStarItem('files', messageId);
              }

              _removeStarItem('all', messageId);
            }

            $scope.tabs.all.list.length === 0 && _setEmptyTab('all', true);
            $scope.tabs.files.list.length === 0 && _setEmptyTab('files', true);
        }, 0);
      }
    });

    /**
     * scrolling�� star list �ҷ�����
     */
    function loadMore() {
      var activeTabName = $scope.activeTabName;

      if (!($scope.tabs[activeTabName].isScrollLoading || $scope.tabs[$scope.activeTabName].endOfList)) {
        $scope.tabs[activeTabName].isScrollLoading = true;

        _getStarList(activeTabName);
      }
    }

    /**
     * tab(all,file) select event handler
     * @param {string} type
     */
    function onTabSelect(type) {
      if (isActivated) {
        $scope.tabs[type].active = true;
        $scope.activeTabName = type;

        if (!$scope.tabs[type].hasFirstLoad) {
          _initStarListData($scope.activeTabName);
          _initGetStarList($scope.activeTabName);
        }
      }
    }

    /**
     * tab(all,file) star list �ʱ�ȭ
     * @param {string} activeTabName
     * @private
     */
    function _initStarListData(activeTabName) {
      starListData.messageId = null;

      $scope.tabs[activeTabName].list = [];
      $scope.tabs[activeTabName].map = {};

      $scope.tabs[activeTabName].endOfList = $scope.tabs[activeTabName].isLoading = $scope.tabs[activeTabName].isScrollLoading = false;
    }

    /**
     * tab(all,file) star list �ʱ� load
     * @param {string} activeTabName
     * @private
     */
    function _initGetStarList(activeTabName) {
      $scope.tabs[activeTabName].isLoading = true;
      $scope.tabs[activeTabName].empty = false;

      _getStarList(activeTabName);
    }

    /**
     * star list ����
     * @param {string} activeTabName
     * @private
     */
    function _getStarList(activeTabName) {
      if (!$scope.tabs[activeTabName].isLoading || !$scope.tabs[activeTabName].isScrollLoading) {
        StarAPIService.get(starListData.messageId, 40, (activeTabName === 'files' ? 'file' : undefined))
          .success(function(data) {
            if (data) {
              if (data.records && data.records.length) {
                _pushStarList(data.records, activeTabName);
              }

              // ���� getStarList�� ������ param ����
              _updateCursor(activeTabName, data);
            }
          })
          .finally(function() {
            $scope.tabs[activeTabName].hasFirstLoad = true;
            $scope.tabs[activeTabName].isLoading = $scope.tabs[activeTabName].isScrollLoading = false;

            $scope.tabs[activeTabName].list.length === 0 && _setEmptyTab(activeTabName, true);
          });
      }
    }

    /**
     * Ư�� star item ����
     * @param {string} messageId
     * @private
     */
    function _getStarItem(messageId) {
      StarAPIService.getItem(messageId)
        .success(function(data) {
          if (data) {
            _addStarItem('all', data, true);
            _setEmptyTab('all', false);

            if (data.message.contentType === 'file') {
              // star item�� file type�̶�� files list���� �߰���
              _addStarItem('files', data, true);
              _setEmptyTab('files', false);
            }
          }
        });
    }

    /**
     * tab(all,file)�� list�� ����
     * @param {object} records
     * @param {string} activeTabName
     * @private
     */
    function _pushStarList(records, activeTabName) {
      var record;
      var i;
      var len;

      for (i = 0, len = records.length; i < len; i++) {
        record = records[i];

        record.activeTabName = activeTabName;
        _addStarItem(activeTabName, record);
      }
    }

    /**
     * tab(all,file)�� item�� �߰�
     * @param {string} activeTabName
     * @param {object} data
     * @param {boolean} isUnShift - unshift �Ǵ� push ó�� ����
     * @private
     */
    function _addStarItem(activeTabName, data, isUnShift) {
      if ($scope.tabs[activeTabName].map[data.message.id] == null) {
        $scope.tabs[activeTabName].list[isUnShift ? 'unshift' : 'push'](data);
        $scope.tabs[activeTabName].map[data.message.id] = data;
      }
    }

    /**
     * tab(all,file)�� item�� ����
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
    }

    /**
     * ����ִ� tab(all, file)���� ����
     * @param {string} activeTabName
     * @param {boolean} value
     * @private
     */
    function _setEmptyTab(activeTabName, value) {
      $scope.tabs[activeTabName].empty = value;
      $scope.tabs[activeTabName].endOfList = !value;
    }

    /**
     * ���� star list�� ������ param�� tab(all, file)�� ���� ����
     * @param {string} activeTabName
     * @param {object} data
     * @private
     */
    function _updateCursor(activeTabName, data) {
      if (data.records && data.records.length > 0) {
        starListData.messageId = data.records[data.records.length - 1].starredId;
      }

      if ($scope.tabs[activeTabName].list && $scope.tabs[activeTabName].list.length > 0) {
        // ���̻� star list�� �������� �����Ƿ� endOfList�� ó����
        $scope.tabs[activeTabName].endOfList = !data.hasMore;
      }
    }
  }
})();
