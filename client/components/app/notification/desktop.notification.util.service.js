/**
 * @fileoverview notification util
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('DesktopNotificationUtil', DesktopNotificationUtil);

  /* @ngInject */
  function DesktopNotificationUtil($filter, logger, jndPubSub, localStorageHelper, accountService, HybridAppHelper,
                                   configuration, NotificationAudio, entityAPIservice) {
    var that = this;

    var NOTIFICATION_SHOW_CONTENT_FLAG_KEY = 'show_notification_content';
    var NOTIFICATION_LOCAL_STORAGE_KEY = 'local_notification_flag';
    var NOTIFICATION_NEVER_ASK_KEY = 'notification_never_ask_flag';

    var NOTIFICATION_STORAGE_KEY = 'setting_notification';
    var notificationData;

    // notification instance
    var notificationAudio;

    _init();

    that.isAllowShowContent = isAllowShowContent;

    that.getNotificationAudio = getNotificationAudio;

    that.getData = getData;
    that.setData = setData;

    that.getFileTitleFormat = getFileTitleFormat;
    that.getSenderContentFormat = getSenderContentFormat;
    that.getRoomFormat = getRoomFormat;
    that.getTeamInfo = getTeamInfo;
    that.getNotificationUrl = getNotificationUrl;
    that.getBodyWithoutMessage = getBodyWithoutMessage;

    that.validateNotificationParams = validateNotificationParams;
    that.isChatType = isChatType;
    that.log = log;
    /**
     * init
     */
    function _init() {
      if (HybridAppHelper.isHybridApp()) {
        // hybrid 앱 일 경우
        _initHybridSetting();
      } else {
        _initSetting();
      }
    }

    /**
     * 웹일 경우 첫 설정 펑션
     * @private
     */
    function _initSetting() {
      // load to notification data
    }

    /**
     * hybrid 앱일 경우 우선 첫 설정을 'granted'로 한다.
     * @private
     */
    function _initHybridSetting() {
      // load to notification data
      /*
       _onPermissionGranted 에서 isShowNotificationContent, isNotificationOnLocally 값을 강제 true 로 설정하므로,
       해당 값을 localStorage 값으로 다시 설정 한다
       */
    }


    function isAllowSendNotification() {

    }

    /**
     * addNotification function 에서 필요한 validation 이다.
     * 정확한 내용은 나도 잘 모른다.
     * @param {object} data - data
     * @param {object} writerEntity - writer entity
     * @param {object} roomEntity - room entity
     * @returns {*}
     */
    function validateNotificationParams(data, writerEntity,  roomEntity) {
      return data && writerEntity && roomEntity && data.message && shouldSendNotification();
    }

    /**
     * get notification audio
     * @param {array} sounds
     * @returns {*}
     */
    function getNotificationAudio(sounds, options) {
      if (notificationAudio == null) {
        notificationAudio = NotificationAudio.getInstance(sounds, options);
      }

      return notificationAudio;
    }

    function getData() {
      if (notificationData == null) {
        // cache 되지 않음

        notificationData = localStorageHelper.get(NOTIFICATION_STORAGE_KEY);
        if (notificationData == null) {
          // local storage에 존재하지 않음

          notificationData = {
            // notification 사용여부, true | false
            on: _loadLocalNotificationFlag(),
            // notification을 사용하는 메시지 타입, all | dmNmention
            type: 'all',
            // notification에 content 노출 시킬지 여부, all | none | public_only
            showContent: _getOldSetShowContent() || 'all',
            // 일반 메시지에 사용할 알림 값, asstes/sounds/{{$1}}.mp3
            soundNormal: 'off',
            // 멘션 메시지에 사용할 알림 값, asstes/sounds/{{$1}}.mp3
            soundMention: 'off',
            // 1:1 메시지에 사용할 알림 값, asstes/sounds/{{$1}}.mp3
            soundDM: 'off'
          };
        }
      }

      notificationData.on = _getBoolean(notificationData.on);
      return notificationData;
    }

    function _getOldSetShowContent() {
      var isShowContent = _loadShowNotificationContentFlag();

      if (isShowContent === true) {
        isShowContent = 'all'
      } else if (isShowContent === false) {
        isShowContent = 'none';
      }

      return isShowContent;
    }

    function setData(value) {
      notificationData = value;
      localStorageHelper.set(NOTIFICATION_STORAGE_KEY, value);
    }

    function isAllowShowContent(entityId) {
      var data = getData();
      var result;

      if (data.showContent === 'all' ||
        (data.showContent === 'public_only' && entityAPIservice.isPublicTopic(entityId))) {
        result = true;
      } else {
        result = false;
      }

      return result;
    }

    /**
     * 불리언 타입을 리턴한다.
     * @param {string} value - true 인지 아닌지 확인
     * @returns {boolean}
     * @private
     */
    function _getBoolean(value) {
      if (typeof value === 'string') {
        return value === 'true';
      }
      return false;
    }

    /**
     * socketEvent가 dm을 향한건지 토픽을 향한건지 확인한다.
     * @param {object} socketEvent - socket event paramter
     * @returns {boolean}
     */
    function isChatType(socketEvent) {
      return socketEvent.room.type === 'chat';
    }


    /**
     * local storage 로 부터 isNotificationOnLocally 를 가져온다.
     * @returns {*}
     * @private
     */
    function _loadLocalNotificationFlag() {
      var value = localStorageHelper.get(NOTIFICATION_LOCAL_STORAGE_KEY);
      return value && _getBoolean(value);
    }

    /**
     * local storage 로 부터 불러온다.
     * 없으면 granted 인지 아닌지확인한다.
     * @private
     */
    function _loadShowNotificationContentFlag() {
      var value = localStorageHelper.get(NOTIFICATION_SHOW_CONTENT_FLAG_KEY);
      return value && _getBoolean(value);
    }








    /**
     * browser notification에서 사용되어질 file title에 대한 format에 맞춰 리턴한다.
     * @param {string} title - file title
     * @returns {string}
     */
    function getFileTitleFormat(title) {
      return '<' + title + '>';
    }

    /**
     * browser notification에서 사용되어질 '이름: 내용' 포맷을 리턴한다.
     * @param {string} senderName - 작성자 이름
     * @param {string} content - 내용
     * @returns {string}
     */
    function getSenderContentFormat(senderName, content) {
      return senderName + ': ' + content;
    }

    /**
     * browser notification에서 사용되어질 토픽 이름에 대한 포맷을 리턴한다.
     * @param {object} title - 토픽 이름
     * @returns {string}
     */
    function getRoomFormat(title) {
      return '[' + title + ']';
    }

    /**
     * 현재 유저의 membership을 돌면서 teamId가 같은  team을 찾는다.
     * 그 팀의 이름과 도메인을 리턴한다.
     * @param {number} teamId - 찾으려는 팀의 아이디
     * @returns {{teamName: *, teamDomain: *}}
     * @private
     */
    function getTeamInfo(teamId) {
      var account = accountService.getAccount();
      var memberships = account.memberships;
      var teamName;
      var teamDomain;

      _.forEach(memberships, function(team) {
        if (team.teamId === teamId) {
          teamName = team.name;
          teamDomain = team.t_domain;
        }
      });

      return {
        teamName: teamName,
        teamDomain: teamDomain
      };
    }

    /**
     * notification에 대한 url을 전달함
     * @param {object} data
     * @returns {string}
     */
    function getNotificationUrl(data) {
      var teamInfo;
      var url;
      var type;
      var roomId;

      if (_.isObject(data)) {
        teamInfo = getTeamInfo(data.teamId);

        // 기본적으로 /app/# 까지 포함한 주소를 만든다.
        url = configuration.base_protocol + teamInfo.teamDomain + configuration.base_url + '/app/#';

        if (isChatType(data)) {
          // chat 일 경우

          type = 'user';
          // 방 url이 roomId(혹은 entityId)로 되어있지 않고 user의 id로 되어있기에 그 값을 설정한다.
          roomId = data.writer;
        } else {
          // channel 일 경우

          type = data.room.type.toLowerCase();
          roomId = data.room.id;
        }

        // url 뒤에 가고 싶은 방의 타입과 주소를 설정한다.
        url += '/' + type + 's/' + roomId;

        if (!!data.messageType && data.messageType === 'file_comment') {
          // file comment socket event일 때
          url += '/files/' + data.file.id;
        }
      }

      return url;
    }

    /**
     * 유져인지 아닌지 확인 후, 메세지를 포함하지 않고 바디를 맞는 포맷으로 만든다.
     * @param {boolean} isUser - 유져인지 아닌지 분별
     * @param {object} writerEntity - 메세지를 보낸이
     * @param {object} roomEntity - 메세지가 전공된 곳
     * @returns {string} body - 바디에 들어갈 내용}
     * @private
     */
    function getBodyWithoutMessage(isUser, writerEntity, roomEntity) {
      if (isUser) {
        return _getBodyForChat(roomEntity);
      }
      return _getBodyForTopic(writerEntity, roomEntity);
    }

    /**
     * 토픽에서 새로운 메세지가 왔을때, 실제 내용은 보여주지 않고 노티피케이션에 들어갈 메세지를 만든다.
     * @param {object} fromEntity - 메세지를 보낸 사람
     * @param {object} toEntity - 메세지가 전송된 토픽
     * @returns {string}
     * @private
     */
    function _getBodyForTopic(fromEntity, toEntity) {
      var currentLanguage = accountService.getAccountLanguage();

      var bodyMessage;

      switch (currentLanguage) {
        case 'ko' :
          bodyMessage = '[' + toEntity.name + ']' + $filter('translate')('@web-notification-body-topic-mid')
            + fromEntity.name;
          break;
        case 'ja' :
          bodyMessage = fromEntity.name + $filter('translate')('@web-notification-body-topic-mid')
            + '[' + toEntity.name + ']';
          break;
        case 'en' :
          bodyMessage = $filter('translate')('@web-notification-body-topic-pre')
            + '[' + toEntity.name + ']'
            + $filter('translate')('@web-notification-body-topic-mid')
            + fromEntity.name;
          break;
        default :
          bodyMessage = $filter('translate')('@web-notification-body-topic-pre')
            + '[' + toEntity.name + ']'
            + $filter('translate')('@web-notification-body-topic-mid')
            + fromEntity.name;
          break;
      }
      bodyMessage += $filter('translate')('@web-notification-body-topic-post');
      return bodyMessage;
    }

    /**
     * 1:1 로 새로운 메세지가 들어왔을때 내용을 보여주지 않고 노티피케이션에 들어갈 메세지를 만든다.
     * @param {object} fromEntity - 메세지를 보낸 사람
     * @returns {string}
     * @private
     */
    function _getBodyForChat(fromEntity) {
      return $filter('translate')('@web-notification-body-messages-pre')
        + fromEntity.name
        + $filter('translate')('@web-notification-body-messages-post');
    }


    // Notification support 여부
    var isNotificationSupported = 'Notification' in window;

    // 노티피케이션 permission 의 값
    var notificationPermission;

    // 노티피케이션을 킬지 말지 알려주는 flag. 브라우져 내부에서만 가지고 있다.
    var isNotificationOnLocally;

    //노티피케이션을 보낼 수 있는 설정인지 아닌지 확인한다.
    // shouldSendNotification Notification permission이 'granted' 이고 isNotificationOnLocally이 true인 경우

    // 노티피케이션 내용을 보여줄지 말지 알려주는 flag.  브라우져 내부에서만 가지고 있다.
    var isShowNotificationContent;

    /**
     * notification log
     */
    function log() {
      logger.desktopNotificationSettingLogger(isNotificationSupported, notificationPermission, isNotificationOnLocally, shouldSendNotification(), isShowNotificationContent);
    }
  }
})();
