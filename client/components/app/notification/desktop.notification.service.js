/**
 * @fileoverview window.Notification 생성하는 service
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('DesktopNotification', DesktopNotification);

  /* @ngInject */
  function DesktopNotification($state, $filter, RouterHelper, jndPubSub, HybridAppHelper, DesktopNotificationUtil,
                               BotList) {
    var that = this;
    var NOTIFICATION_EXPIRE_TIME = 7000;
    var isSupportNotification;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      that.config = config;
      that.show = show;
    }

    /**
     * config
     */
    function config() {
      isSupportNotification = 'Notification' in window;
    }

    /**
     * show notification
     * @param {options} options
     */
    function show(options) {
      var notificationAudio;
      var notificationData;

      if (isSupportNotification && options) {
        notificationAudio = DesktopNotificationUtil.getNotificationAudio();
        if (notificationAudio) {
          if (!options.sound) {
            // noti sound 값이 존재하지 않는다면 기본 sound를 사용한다.
            if (notificationData = DesktopNotificationUtil.getData()) {
              options.sound = notificationData.soundNormal
            }
          }

          notificationAudio.play(options.sound);
        }
        createNotification(options);
      }
    }

    /**
     * create window.Notification
     * @param {object} options
     */
    function createNotification(options) {
      var title = options.title || $filter('translate')('@web-notification-title');
      var notification;

      if (options.body) {
        // markdown 제거한다.
        options.body = $filter('stripMarkdown')(options.body);
      }

      notification = new Notification(title, {
        tag: options.tag,
        body: options.body,
        icon: options.icon,
        silent: true
      });

      notification.onshow = function() {
        _showNotification(notification, options);
      };
      notification.onclick = function() {
        _clickNotification(options);
      };

      if (HybridAppHelper.isMacApp()) {
        HybridAppHelper.trigger('notification', {
          title: title,
          body: options.body,
          icon: options.icon,
          url: DesktopNotificationUtil.getNotificationUrl(options.data)
        });
      }
    }

    /**
     * show notification event handler
     * @param {object} notification
     * @param {object} options
     * @private
     */
    function _showNotification(notification, options) {
      // Binds fadeout effect on notification.
      setTimeout(notification.close.bind(notification), NOTIFICATION_EXPIRE_TIME);

      options.onShow && options.onShow();
    }

    /**
     * click notification event handler
     * @param {object} options
     * @private
     */
    function _clickNotification(options) {
      var fn;

      if (fn = options.onClick) {
        fn(options.data);
      } else {
        _defaultClickNotification(options);
      }

      window.focus();
      jndPubSub.pub('notification-click');
    }

    /**
     * 기본 click notification event handler
     * @param {object} options
     * @private
     */
    function _defaultClickNotification(options) {
      // Decides what to do when notification click.
      // Takes user to topic/messages where notification came from.
      var targetEntity = options.data;
      var entityId;
      var entityType;
      var jandiBot;

      if (!!targetEntity) {
        entityId = targetEntity.id;
        entityType = targetEntity.type;

        if (entityType === 'file_comment') {
          RouterHelper.setCommentToScroll(targetEntity.commentId);
          $state.go('files', {itemId: entityId});
        } else {
          if (jandiBot = BotList.getJandiBot()) {
            if (entityId === jandiBot.id) {
              entityType = 'users';
            }
          }

          $state.go('archives', {entityType: entityType, entityId: entityId});
        }
      }
    }
  }
})();
