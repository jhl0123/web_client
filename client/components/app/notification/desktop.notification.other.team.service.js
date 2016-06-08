/**
 * @fileoverview Sample Notification 생성하는 service
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('OtherTeamNotification', OtherTeamNotification);

  /* @ngInject */
  function OtherTeamNotification($filter, configuration, jndWebSocketCommon, HybridAppHelper,
                                 DesktopNotificationUtil, DesktopNotification) {
    var that = this;

    that.show = show;

    /**
     * show other team notification
     * @param {object} socketEvent
     */
    function show(socketEvent) {
      var teamInfo;
      var teamName;
      var options;

      if (!DesktopNotificationUtil.isAllowDMnMentionOnly()) {
        if (_isGoodtoSendNotification(socketEvent)) {
          teamInfo = DesktopNotificationUtil.getTeamInfo(socketEvent.teamId);
          teamName = teamInfo.teamName;

          if (!_.isUndefined(teamName)) {
            options = {
              tag: 'tag',
              body: _getBody(teamName),
              icon: configuration.assets_url + 'assets/images/jandi-logo-200x200.png',
              onClick: _onClick,
              data: socketEvent
            };

            DesktopNotification.show(options);
          }
        }
      }
    }

    /**
     * browser notification을 날려도 되는 상황인지 아닌지 확인/리턴한다.
     * @param {object} socketEvent - sockt event param
     * @returns {boolean}
     * @private
     */
    function _isGoodtoSendNotification(socketEvent) {
      var result = false;
      if (DesktopNotificationUtil.isAllowSendNotification() && jndWebSocketCommon.shouldSendNotification(socketEvent)) {
        // 우선 시스템상에서 브라우져 노티가 켜져있고 socket event가 나로부터 온게 아니어야 함.
        result = true;
      }

      return result;
    }

    /**
     * 브라우져 노티피케이션을 클릭했을 때 호출된다.
     * @param {object} param - socket event
     * @private
     */
    function _onClick(param) {
      var newWindow;

      if (!HybridAppHelper.isHybridApp()) {
        newWindow = window.open('', '_blank');
        newWindow.location.href = DesktopNotificationUtil.getNotificationUrl(param);
      }
    }

    /**
     * 브라우져 노티피케이션에 보여질 body 부분의 text를 설정한 후 리턴한다.
     * @param {string} teamName - 포함되어야할 팀의 이름
     * @returns {*}
     * @private
     */
    function _getBody(teamName) {
      return $filter('translate')('@web-notification-body-other-team').replace('{{teamName}}', teamName);
    }
  }
})();
