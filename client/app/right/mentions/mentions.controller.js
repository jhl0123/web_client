/**
 * @fileoverview mentions controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightPanelMentionsTabCtrl', RightPanelMentionsTabCtrl);

  /* @ngInject */
  function RightPanelMentionsTabCtrl($scope, $state, Router, MentionsAPI) {
    var mentionListData = {
      messageId: null
    };
    var isActivated;

    _init();

    // First function to be called.
    function _init() {
      $scope.loadMore = loadMore;
      $scope.messageType = 'mention';

      _initMentionListData();
      if (Router.getActiveRightTabName($state.current) === 'mentions') {
        isActivated = true;

        _initGetMentionList();
      }
    }

    /**
     * open right panel event handler
     */
    $scope.$on('onRightPanel', function($event, data) {
      if (data.type === 'mentions') {
        isActivated = true;

        _initMentionListData();
        _initGetMentionList();
      } else {
        isActivated = false;
      }
    });

    /**
     * scrolling�� mention list �ҷ�����
     */
    function loadMore() {
      if (!($scope.isScrollLoading || $scope.isEndOfList)) {
        $scope.isScrollLoading = true;

        _getMentionList();
      }
    }

    /**
     * mention list �ʱ�ȭ
     * @private
     */
    function _initMentionListData() {
      mentionListData.messageId = null;

      $scope.records = [];
      $scope.isEndOfList = $scope.isLoading = $scope.isScrollLoading = false;
    }

    /**
     * mention list �ʱ� load
     * @private
     */
    function _initGetMentionList() {
      $scope.isLoading = true;
      $scope.isMentionEmpty = false;

      _getMentionList();
    }

    /**
     * mention list ����
     * @private
     */
    function _getMentionList() {
      MentionsAPI.getMentionList(mentionListData)
        .success(function(data) {
          if (data) {
            if (data.records && data.records.length) {
              _pushMentionList(data.records);
            }

            // ���� getMentionList�� ������ param ����
            _updateCursor(data);
          }
        })
        .finally(function() {
          $scope.isMentionEmpty = $scope.records.length === 0;
          $scope.isLoading = $scope.isScrollLoading = false;
        });
    }

    /**
     * mention�� list�� ����
     * @param {object} records
     * @private
     */
    function _pushMentionList(records) {
      var i;
      var len;

      for (i = 0, len = records.length; i < len; i++) {
        $scope.records.push(records[i]);
      }
    }

    /**
     * ���� mention list�� ������ param�� mention list�� ���� ����
     * @param {object} data
     * @private
     */
    function _updateCursor(data) {
      if (data.records && data.records.length > 0) {
        mentionListData.messageId = data.records[data.records.length - 1].message.id;
      }

      if ($scope.records && $scope.records.length > 0 ) {
        // �� �̻� mention list�� �������� �����Ƿ� endOfList�� ó����
        $scope.isEndOfList = !data.hasMore;
      }
    }
  }
})();
