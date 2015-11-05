/**
 * @fileoverview 토픽 리스트 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('topicsCtrl', topicsCtrl);

  function topicsCtrl($scope, TopicFolderModel, JndUtil, jndPubSub) {
    $scope.createTopicFolder = createTopicFolder;
    $scope.onTopicHeaderClick = onTopicHeaderClick;

    _init();

    function _init() {
      if ($scope.leftListCollapseStatus.isTopicsCollapsed) {
        $('#topics-list').css('display', 'none');
      }
      $scope.$on('topic-folder:update', _setTotalAlarmCnt);
      $scope.$on('updateBadgePosition', _setTotalAlarmCnt);
    }

    /**
     * Topic folder 를 생성한다.
     * @param {event} clickEvent
     */
    function createTopicFolder(clickEvent) {
      clickEvent.stopPropagation();
      TopicFolderModel.create(true);
    }


    /**
     * topic header 클릭시 이벤트 핸들러
     */
    function onTopicHeaderClick(clickEvent) {
      var jqBadge = $(clickEvent.target).find('.left-header-badge');
      if ($('#topics-list').css('display') === 'none') {
        jqBadge.hide();
      }

      $('#topics-list').stop().slideToggle({
        always: function() {
          JndUtil.safeApply($scope, function() {
            $('#topics-list').css('height', '');
            jqBadge.show();
            $scope.leftListCollapseStatus.isTopicsCollapsed = ($('#topics-list').css('display') === 'none');
            _setTotalAlarmCnt();
            jndPubSub.updateBadgePosition();
          });
        }
      });
    }

    /**
     * 전체 뱃지 개수를 설정한다
     * @private
     */
    function _setTotalAlarmCnt() {
      $scope.totalAlarmCnt = $scope.leftListCollapseStatus.isTopicsCollapsed ? _getTotalAlarmCnt() : 0;
    }

    /**
     * 전체 뱃지 개수를 반환한다
     * @returns {number}
     * @private
     */
    function _getTotalAlarmCnt() {
      var count;
      var totalCnt = 0;

      _.forEach($scope.folderData.folderList, function(folder) {
        _.forEach(folder.entityList, function(entity) {
          count = +(entity.alarmCnt || 0);
          totalCnt += count;
        });
      });

      return totalCnt;
    }

  }
})();
