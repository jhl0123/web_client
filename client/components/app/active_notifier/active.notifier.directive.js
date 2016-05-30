/**
 * @fileoverview 유져의 행동을 감지해 서버에 active 상태인지 아닌지 알려주는 directive
 *  web_admin 과 공용으로 사용한다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('activeNotifier', activeNotifier);

  /* @ngInject */
  function activeNotifier($http, CoreUtil, configuration, storageAPIservice, currentSessionHelper, ActiveNotifier) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el, attrs) {
      /**
       * 입력이 없는 시점에서 active 상태로 유지시킬 시간 범위
       * @type {number}
       * @private
       */
      var ACTIVE_THRESHOLD = 60000;

      /**
       * Active 상태를 유지시키는 체크하는 간격 in ms
       * @type {number}
       */
      var CHECK_ACTIVE_INTERVAL_TIME = 60000;

      /**
       * 강제 업데이트 랜덤 time 최대 값 in ms (1시간)
       * @type {number}
       */
      var FORCE_UPDATE_DELAY_TIME_MAX = 3600000;

      /**
       * 강제 업데이트 랜덤 time 최소 값 in ms (1시간)
       * @type {number}
       */
      var FORCE_UPDATE_DELAY_TIME_MIN = 1000;

      /**
       * 강제 업데이트 timer
       */
      var _forceUpdateTimer;

      /**
       * 주기적으로 상태 확인을 위한 timer
       */
      var _checkStatusTimer;

      /**
       * 마지막으로 active 되었던 시간
       * {Date}
       */
      var _lastActiveTime;

      /**
       * update(refresh) 를 해야하는지 여부. true 일 경우 inactive 상태일 때 update(refresh) 를 수행한다
       * @type {boolean}
       * @private
       */
      var _isUpdateRequired = false;

      // $(window)에서 들어야할 이벤트들. *event handler는 모두 같다.
      // TODO: 'keyup'을 걸어야하나 말아야 하나 고민됩니다.
      var _EVENTS = {
        'mousemove': _setActive,
        'click': _setActive,
        'focus': _setActive,
        'keyup': _setActive
      };

      _init();

      /**
       * 초기화 함수.
       */
      function _init() {
        //live 서버에서 console 로 version 체크하기 위함.
        var jandi = window.JANDI= window.JANDI || {};
        jandi.version = configuration.version;

        _lastActiveTime = _.now();
        _detachEventListener();
        _attachEventListener();
        scope.$on('$destroy', _onDestroy);
        scope.$on('publicService:dataInitDone', _onDataInitDone);
      }

      /**
       * 데이터 initialize 가 끝난 뒤 콜백
       * @private
       */
      function _onDataInitDone() {
        _notify(true);
      }

      /**
       * $(window)에 이벤트 listener들을 추가한다.
       * @private
       */
      function _attachEventListener() {
        el.on(_EVENTS);
        $(window).on('beforeunload', _onBeforeUnload);
      }

      /**
       * 위에서 $(window)에 추가했던 이벤트들을 다시 제거한다.
       * @private
       */
      function _detachEventListener() {
        el.off(_EVENTS);
        $(window).off('beforeunload', _onBeforeUnload);
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _notify(false);
        _detachEventListener();
      }

      /**
       * beforeunload 시 active 상태를 해제한다.
       * @private
       */
      function _onBeforeUnload() {
        _notify(false);
      }


      /**
       * active 상태로 설정한다.
       */
      function _setActive() {
        _lastActiveTime = _.now();

        if (_isActiveStatusChange()) {
          _onActiveStatusChange();
        }
      }

      /**
       * active 상태 값이 변경되었을 때 서버에 active 상태를 전달하고 latest version 값을 조회한다.
       * @private
       */
      function _onActiveStatusChange() {
        _notify(_isActive());
        _requestLatestVersion();
      }

      /**
       * active 상태 체크를 위한 타이머를 설정한다.
       * @private
       */
      function _startCheckStatusTimer() {
        _stopCheckStatusTimer();
        _checkStatusTimer = setTimeout(_checkStatus, CHECK_ACTIVE_INTERVAL_TIME);
      }

      /**
       * active 상태 체크를 위한 타이머를 해제한다.
       * @private
       */
      function _stopCheckStatusTimer() {
        clearTimeout(_checkStatusTimer);
      }

      /**
       * active 상태를 확인 한다.
       * @private
       */
      function _checkStatus() {
        var currentStatus = ActiveNotifier.getStatus();
        if (_isActiveStatusChange()) {
          _onActiveStatusChange();
          // 현재 상태가 active 상태이고 변경 없을 시
          // CHECK_ACTIVE_INTERVAL_TIME 시간 마다 active 상태라는 request 를 서버에 전송한다.
        } else if (currentStatus) {
          _notify(currentStatus);
        }
      }

      /**
       * active 상태 값이 변경되었는지 여부를 반환한다.
       * @returns {boolean}
       * @private
       */
      function _isActiveStatusChange() {
        return ActiveNotifier.getStatus() !== _isActive();
      }

      /**
       * 현재 active 상태인지 여부를 반환한다.
       * @returns {boolean}
       * @private
       */
      function _isActive() {
        return (_.now() - _lastActiveTime) < ACTIVE_THRESHOLD;
      }

      /**
       * 서버로 현재 active 상태를 저장한다.
       * @private
       */
      function _notify(isActive) {
        var accessToken = storageAPIservice.getAccessToken();
        
        ActiveNotifier.setStatus(isActive);
        
        if (isActive) {
          _stopForceUpdateTimer();
          _startCheckStatusTimer();
        } else if (_isUpdateRequired) {
          _startForceUpdateTimer();
        }

        if (accessToken) {
          $.ajax({
            method: 'GET',
            url: configuration.api_address + 'inner-api/platform/active',
            dataType: 'jsonp',
            data: {
              access_token: accessToken,
              active: isActive,
              version: configuration.version
            }
          });
        }
      }

      /**
       * 강제 업데이트 timer 를 가동한다.
       * @private
       */
      function _startForceUpdateTimer() {
        var delayTime = _getForceUpdateDelayTime();
        _stopForceUpdateTimer();
        _forceUpdateTimer = setTimeout(_reload, delayTime);
      }

      /**
       * 강제 업데이트 timer 를 해제한다.
       * @private
       */
      function _stopForceUpdateTimer() {
        clearTimeout(_forceUpdateTimer);
      }

      /**
       * inactive 상태일 경우에만 강제 업데이트(reload) 한다.
       * @private
       */
      function _reload() {
        if (!_isActive()) {
          window.location.reload();
        }
      }

      /**
       * 강제 업데이트를 위한 random delay time 을 반환한다.
       * @returns {number}
       * @private
       */
      function _getForceUpdateDelayTime() {
        return Math.floor((Math.random() *
        (FORCE_UPDATE_DELAY_TIME_MAX - FORCE_UPDATE_DELAY_TIME_MIN) + FORCE_UPDATE_DELAY_TIME_MIN));
      }

      /**
       * 최신 version 정보를 요청한다.
       * @private
       */
      function _requestLatestVersion() {
        var team = currentSessionHelper.getCurrentTeam();
        var url = configuration.base_protocol + team.t_domain + configuration.base_url + '/version/app';
        $http({
          method: 'GET',
          url: url
        }).success(_onSuccessRequestLatestVersion);
      }

      /**
       * 최신 version 정보 요청 성공시 콜백
       * @param {object} response
       * @private
       */
      function _onSuccessRequestLatestVersion(response) {
        var latestVersion = CoreUtil.pick(response, 'version');
        if (latestVersion) {
          _isUpdateRequired = _hasToUpdate(latestVersion);

          if (!_isActive() && _isUpdateRequired) {
            _startForceUpdateTimer();
          }
        }
      }

      /**
       * 업데이트 해야되는지 여부를 반환한다.
       * @param {string} latestVersion - 서버에 저장된 가장 최신 버전 정보
       * @returns {boolean}
       * @private
       */
      function _hasToUpdate(latestVersion) {
        var latest;
        var current;
        var hasToUpdate = false;
        if (_.isString(latestVersion)) {
          latest = _parseVersion(latestVersion);
          current = _parseVersion(configuration.version);
          _.forEach(latest, function(latestNum, index) {
            if (index === 3) {
              if (latestNum !== current[index]) {
                if (!latestNum || latestNum > current[index]) {
                  hasToUpdate = true;
                  return false;
                }
              }
            } else {
              if (latestNum > current[index]) {
                hasToUpdate = true;
                return false;
              } else if (current[index] > latestNum) {
                return false;
              }
            }
          });
        }
        return hasToUpdate;
      }

      /**
       * version 정보를 parsing 하여 version string 으로 반환한다.
       * @param {string} versionStr
       * @returns {string[]}
       * @private
       */
      function _parseVersion(versionStr) {
        var versionArr;
        var version = ['0', '0', '0'];
        if (_.isString(versionStr)) {
          versionArr = versionStr.split('.');
          version[0] = _getNumber(versionArr[0]) || parseInt(version[0], 10);
          version[1] = _getNumber(versionArr[1]) || parseInt(version[1], 10);
          version[2] = _getNumber(versionArr[2]) || parseInt(version[2], 10);

          //prerelease version
          version[3] = versionStr.split('-')[1] || '';
        }
        return version;
      }

      /**
       * version 정보 중 숫자만 추출하여 반환한다.
       * @param {string} version
       * @returns {*}
       * @private
       */
      function _getNumber(version) {
        if (_.isString(version)) {
          var index = version.search(/[^0-9]/);
          if (index !== -1) {
            version = version.substring(0, index) || '0';
          }
        }
        return parseInt(version, 10);
      }
    }
  }
})();
