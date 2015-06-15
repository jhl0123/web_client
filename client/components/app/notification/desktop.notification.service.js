(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('DesktopNotification', DesktopNotification);

  /* @ngInject */
  function DesktopNotification($state, $filter, logger, jndPubSub, localStorage, accountService) {
    var that = this;

    var NOTIFICATION_EXPIRE_TIME = 5000;
    var NOTIFICATION_PERMISSION = {
      granted: 'granted',
      denied: 'denied',
      default: 'default',
      callbacks: {
        granted: _onPermissionGranted,
        denied: _onPermissionDenied,
        default: _onPermissionDefault
      }
    };

    var NOTIFICATION_SHOW_CONTENT_FLAG_KEY = 'show_notification_content';
    var NOTIFICATION_LOCAL_STORAGE_KEY = 'local_notification_flag';

    var NOTIFICATION_NEVER_ASK_KEY = 'notification_never_ask_flag';

    // Notification support 여부
    var isNotificationSupported;

    // 노티피케이션 permission 의 값
    var notificationPermission;

    // 노티피케이션 내용을 보여줄지 말지 알려주는 flag.  브라우져 내부에서만 가지고 있다.
    var isShowNotificationContent;

    // 노티피케이션을 킬지 말지 알려주는 flag. 브라우져 내부에서만 가지고 있다.
    var isNotificationOnLocally;

    that.init = init;

    that.getNotificationPermission = getNotificationPermission;
    that.isNotificationLocalFlagUp = isNotificationLocalFlagUp;

    that.getShowNotificationContentFlag = getShowNotificationContentFlag;

    that.isNotificationOn = isNotificationOn;

    that.isNotificationPermissionDenied = isNotificationPermissionDenied;
    that.isNotificationPermissionGranted = isNotificationPermissionGranted;

    that.setShowNotificationContent = setShowNotificationContent;

    that.turnOnDesktopNotification = turnOnDesktopNotification;
    that.toggleDesktopNotificationLocally = toggleDesktopNotificationLocally;

    that.sendSampleNotification = sendSampleNotification;

    that.addNotification = addNotification;

    that.canSendNotification = shouldSendNotification;

    that.setNeverAskFlag = setNeverAskFlag;
    that.isNeverAskFlagUp = isNeverAskFlagUp;

    that.log = log;

    function init() {
      isNotificationSupported = 'Notification' in window;
      _setNotificationPermission();
      _loadLocalNotificationFlag();
      _loadShowNotificationContentFlag();
      log();
    }



    /**
     * 현재 노티피케이션의 permission 상태를 리턴한다.
     * @returns {string} notificationPermission - Notification.permission 의 값
     */
    function getNotificationPermission() {
      return notificationPermission;
    }

    /**
     * 브라우져 내부에서 저장하고 있는 값을 리턴한다.
     * @returns {boolean} isNotificationOnLocally - true, if it's on
     */
    function isNotificationLocalFlagUp() {
      return isNotificationOnLocally;
    }

    /**
     * Notification content를 보여줄지 말지 결정하는 flag 를 리턴한다.
     * @returns {*}
     */
    function getShowNotificationContentFlag() {
      return isShowNotificationContent;
    }

    /**
     * Notification 이 켜져있는지 알 수 있는 함수이다.
     * @returns {*}
     */
    function isNotificationOn() {
      return isNotificationPermissionGranted();
    }

    /**
     * 노티피케이션이 블락되었는지 확인한다.
     * @returns {boolean}
     */
    function isNotificationPermissionDenied() {
      return notificationPermission === 'denied';
    }

    /**
     * Notification.permission 을 확인한다.
     * 'granted' 일 경우에만 유져가 web notification 을 허락했다고 판단한다.
     */
    function isNotificationPermissionGranted() {
      return notificationPermission === 'granted';
    }

    /**
     * 노티피케이션에서 메세지 내용을 보여줄지 말지 결정하는 flag 를 set 한다.
     * @param {boolean} isShowNotificationContentFlag - flag value
     */
    function setShowNotificationContent(isShowNotificationContentFlag) {
      isShowNotificationContent = isShowNotificationContentFlag;
      _storeShowNotificationContentFlag();
    }

    /**
     * 노티피케이션을 킬 수 있도록 사용자에게 permission 을 물어본다.
     */
    function turnOnDesktopNotification() {
      Notification.requestPermission(_onRequestNotificationPermission);
    }

    /**
     * isNotificationOnLocally 값은 설정한다.
     */
    function toggleDesktopNotificationLocally() {
      var newNotificationLocalValue = !isNotificationOnLocally;
      _setDesktopNotificationLocally(newNotificationLocalValue);
      _onNotificationSettingChanged();
    }

    /**
     * isNotificationOnLocally 의 값을 설정한다.
     * 혹시 몰라서 SETTER 를 따로 뺐지만 솔직히 쓸 일이 있을까 싶다.
     * @param {string} newNotificationLocalValue - value to be set
     * @private
     */
    function _setDesktopNotificationLocally(newNotificationLocalValue) {
      isNotificationOnLocally = newNotificationLocalValue;
      _storeLocalNotificationFlag();
    }

    /**
     *  예시 노티피케이션을 보낸다.
     */
    function sendSampleNotification() {
      var options = {
        tag: 'tag',
        body: $filter('translate')('@web-notification-sample-body-text')
      };
      var sampleNotification = _createInstance(options);
      sampleNotification.show();
    }

    /**
     * 브라우저 팝업창에서 유저의 대답을 받아 처리하는 콜백 펑션.
     * 대답은 'default', 'denied', 그리고 'granted' 가 있을 수 있지만 브라우져마다 default 의 값이 조금 다를 수도 있다.
     * @param {string} permission - user 의 대답
     * @private
     */
    function _onRequestNotificationPermission(permission) {
      // TODO: 이럴경우에는 callbackFunction 선언을 먼저해야하나요? 아니면 notificationPermission 을 먼저 할당하나요?궁금궁금.
      notificationPermission = permission;
      var callbackFunction = NOTIFICATION_PERMISSION.callbacks[permission];

      if (!!callbackFunction) {
        callbackFunction(permission);
      } else {
        // 해당하는 콜백펑션이 없을 경우에는 default 로 처리한다.
        _onPermissionDefault();
      }

      _onNotificationSettingChanged();
    }

    function _onNotificationSettingChanged() {
      jndPubSub.pub('onDesktopNotificationPermissionChanged', notificationPermission);
    }

    /**
     * 사용자가 Notification.permission 을 허락했을 때
     * @private
     */
    function _onPermissionGranted() {
      _resetNeverAskFlag();
      setShowNotificationContent(true);
      isNotificationOnLocally = true;
      _storeLocalNotificationFlag();
    }

    /**
     * 사용자가 Notification.permission 을 거부했을 때
     * @private
     */
    function _onPermissionDenied() {
      setShowNotificationContent(false);
      isNotificationOnLocally = false;
      _storeLocalNotificationFlag();
    }

    /**
     * 사용자가 Notification.permission 에서 'x' 눌렀을 때
     * @private
     */
    function _onPermissionDefault() {
      setShowNotificationContent(false);
    }

    /**
     * 현재 브라우져의 노티피케이션이 허락되었는지 업데이트한다.
     * @private
     */
    function _setNotificationPermission() {
      if (isNotificationSupported) {
        notificationPermission = _getNotificationPermission();
      }
    }

    /**
     * Notification.permission 을 리턴한다.
     * @returns {string} notificationPermission - Notification.permission 의 값
     * @private
     */
    function _getNotificationPermission() {
      return Notification.permission;
    }

    /**
     * Notification content를 보여줄지 말지 결정하는 flag 를 local storage 에 저장한다.
     * @private
     */
    function _storeShowNotificationContentFlag() {
      localStorage.set(NOTIFICATION_SHOW_CONTENT_FLAG_KEY, isShowNotificationContent);
    }

    /**
     * local storage 로 부터 불러온다.
     * 없으면 granted 인지 아닌지확인한다.
     * @private
     */
    function _loadShowNotificationContentFlag() {
      var localIsShowContentFlag = localStorage.get(NOTIFICATION_SHOW_CONTENT_FLAG_KEY);

      if (localIsShowContentFlag === null) {
        localIsShowContentFlag = shouldSendNotification();
      } else {
        localIsShowContentFlag = _getBoolean(localStorage.get(NOTIFICATION_SHOW_CONTENT_FLAG_KEY));
      }

      isShowNotificationContent = localIsShowContentFlag;
    }

    /**
     * isNotificationOnLocally 을 local storage 에 저장한다.
     * @private
     */
    function _storeLocalNotificationFlag() {
      localStorage.set(NOTIFICATION_LOCAL_STORAGE_KEY, isNotificationOnLocally);
    }

    /**
     * local storage 로 부터 isNotificationOnLocally 를 가져온다.
     * @returns {*}
     * @private
     */
    function _loadLocalNotificationFlag() {
      isNotificationOnLocally = _getBoolean(localStorage.get(NOTIFICATION_LOCAL_STORAGE_KEY));
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
     * local storage 에 never_ask 관련 flag 를 true 로 바꾼다.
     */
    function setNeverAskFlag() {
      localStorage.set(NOTIFICATION_NEVER_ASK_KEY, true);
    }

    /**
     * local storage 에 never_ask 관련 flag 를 리턴한다.
     * @private
     */
    function _getNeverAskFlag() {
      return localStorage.get(NOTIFICATION_NEVER_ASK_KEY);
    }

    /**
     * local storage 에서 never ask flag 를 없앤다.
     */
    function _resetNeverAskFlag() {
      localStorage.remove(NOTIFICATION_NEVER_ASK_KEY)
    }

    /**
     * never ask flag 가 true인지 아닌지 리턴한다.
     * @returns {boolean}
     */
    function isNeverAskFlagUp() {
      return _getBoolean(_getNeverAskFlag());
    }

    /**
     * Notification object 생성
     *
     * @param {object} options - object options
     */
    function _createInstance(options) {
      return Object.create(WebNotification).init(options);
    }

    /**
     * object options 생성 및 object 생성
     *
     * @param {object} data - message
     * @param {object} writerEntity - message 작성한 작성자의 entity
     * @param {object} roomEntity - message 전달한 room의 entity
     */
    function addNotification(data, writerEntity, roomEntity) {
      var isUser;
      var options = {};
      var notification;
      var message;


      if (_validateNotificationParams(data, writerEntity, roomEntity)) {
        isUser = roomEntity.type === 'users';
        message = data.message;
        message = decodeURIComponent(message);

        options.tag = isUser ? writerEntity.id : roomEntity.id;

        options.body = _setOptionBody(isUser, writerEntity, roomEntity, message);

        options.icon = $filter('getSmallThumbnail')(writerEntity);
        options.data = {
          id: roomEntity.id,
          type: roomEntity.type
        };

        (notification = _createInstance(options)) && notification.show();
      }
    }

    /**
     * 유져인지 아닌지 확인 후 알맞는 포맷에 맞게 바디를 만든다.
     * @param {boolean} isUser - 유져인지 아닌지 분별
     * @param {object} writerEntity - 메세지를 보낸이
     * @param {object} roomEntity - 메세지가 전공된 곳
     * @param {string} message - 메세지 내용
     * @returns {string} body - 바디에 들어갈 내용
     * @private
     */
    function _setOptionBody(isUser, writerEntity, roomEntity, message) {
      return isShowNotificationContent ?
        _getBodyWithMessage(isUser, writerEntity, roomEntity, message) : _getBodyWithoutMessage(isUser, writerEntity, roomEntity);
    }

    /**
     * 유져인지 아닌지 확인 후, 메세지를 포함한 바디를 맞는 포맷으로 만든다.
     * @param {boolean} isUser - 유져인지 아닌지 분별
     * @param {object} writerEntity - 메세지를 보낸이
     * @param {object} roomEntity - 메세지가 전공된 곳
     * @param {string} message - 메세지 내용
     * @returns {string} body - 바디에 들어갈 내용}
     * @private
     */
    function _getBodyWithMessage(isUser, writerEntity, roomEntity, message) {
      if (isUser) {
        return writerEntity.name + ' : ' + message;
      }
      return '[' + roomEntity.name + '] ' + writerEntity.name + ' : '+ message;
    }

    /**
     * 유져인지 아닌지 확인 후, 메세지를 포함하지 않고 바디를 맞는 포맷으로 만든다.
     * @param {boolean} isUser - 유져인지 아닌지 분별
     * @param {object} writerEntity - 메세지를 보낸이
     * @param {object} roomEntity - 메세지가 전공된 곳
     * @returns {string} body - 바디에 들어갈 내용}
     * @private
     */
    function _getBodyWithoutMessage(isUser, writerEntity, roomEntity) {
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

    /**
     * addNotification function 에서 필요한 validation 이다.
     * 정확한 내용은 나도 잘 모른다.
     * @param {object} data - data
     * @param {object} writerEntity - writer entity
     * @param {object} roomEntity - room entity
     * @returns {*}
     * @private
     */
    function _validateNotificationParams(data, writerEntity,  roomEntity) {
      return data && writerEntity && roomEntity && data.message && shouldSendNotification();
    }

    /**
     * 노티피케이션을 보낼 수 있는 설정인지 아닌지 확인한다.
     * "Notification.permission 이 'granted' 여야하고 동시에 isNotificationOnLocally 가 true 여야 한다."
     * @returns {*}
     */
    function shouldSendNotification() {
      return isNotificationPermissionGranted() && isNotificationOnLocally;
    }



    /**
     * WebAPI Notification class
     */
    var WebNotification = {
      init: notificationInit,
      show: show,
      _createOptions: _createOptions
    };

    /**
     * @constructor
     * @param {object} options - object options
     */
    function notificationInit(options) {
      var that = this;

      that.options = {
        body: 'Hello World!',
        tag: 'tag',
        icon: ''
      };

      angular.extend(that.options, options);

      return that;
    }

    /**
     * Web Notification show
     * native Notification object 생성하고 event handler를 열결함.
     */
    function show() {
      var that = this;
      var options = that.options;
      var notification;

      // 이것을 맨 위로 글로벌하게 빼고 싶었지만 사용자가 언어를 바꿨을 때 service 다시 호출되질않아서 번역이 안 맞는 경우가 있어서 매번배먼 콜하는 방식으로 바꿈.
      var NOTIFICATION_TITLE = $filter('translate')('@web-notification-title');

      // An actually notification object.
      notification = new Notification(that.options.title || NOTIFICATION_TITLE, that._createOptions());

      notification.onshow = onNotificationShow;
      notification.onclick = onNotificationClick;

      /**
       * 노티피케이션이 보여지면 호출되어진다.
       */
      function onNotificationShow() {
        // Binds fadeout effect on notification.
        setTimeout(notification.close.bind(notification), NOTIFICATION_EXPIRE_TIME);

        options.onShow && options.onShow();
      }

      /**
       * 노티피케이션이 클릭되었을 경우 호출된다.
       */
      function onNotificationClick() {
        // Decides what to do when notification click.
        // Takes user to topic/messages where notification came from.
        var roomEntity = that.options.data;

        if (!!roomEntity) {
          $state.go('archives', {entityType: roomEntity.type, entityId: roomEntity.id});
        }

        window.focus();
        options.onClick && options.onClick();
      }
    }

    /**
     * Web Notification object 생성시 전달하는 options object 생성
     */
    function _createOptions() {
      var that = this;
      var options = that.options;

      return {
        tag: options.tag,
        // body message for notification
        body: options.body,
        // User profile picture.
        icon: options.icon
      };
    }

    function log() {
      logger.desktopNotificationSettingLogger(isNotificationSupported, notificationPermission, isNotificationOnLocally, shouldSendNotification(), isShowNotificationContent);
    }
  }

})();
