/**
 * @fileoverview 네트워크 Interceptor
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('app.net')
    .service('NetInterceptor', NetInterceptor);

  /**
   * Network Interceptor
   * @param {Promise} $q $q 객체
   * @param {object} jndPubSub jndPubSub 서비스
   * @constructor
   */
  /* @ngInject */
  function NetInterceptor($rootScope, $q, $timeout, jndPubSub) {
    /**
     * Network 연결 상태 변경사항 감지 시 설정할 delay time
     * @type {number}
     */
    var TIMEOUT_THRESHOLD = 2000;
    
    var _isConnected = true;
    var _timer;
    /**
     * 응답에러가 발생한 상태 맵
     * @type {{responseErrorStatusCode: count}}
     * @private
     */
    var _responseErrorStatusMap = {};

    var _$scope = $rootScope.$new();
    
    this.isConnected = isConnected;
    this.responseError = responseError;

    _init();

    /**
     *
     * @private
     */
    function _init() {
      _setStatus(window.navigator.onLine);
      _attachScopeEvent();
      _attachDomEvent();
    }

    /**
     * attach scope events
     * @private
     */
    function _attachScopeEvent() {
      _$scope.$on('WatchDog:onWakeUp', _onWakeUp);
    }

    /**
     * dom 이벤트를 바인딩 한다.
     * @private
     */
    function _attachDomEvent() {
      $(window).on("offline", _.bind(_setStatus, this, false));
      $(window).on("online", _.bind(_setStatus, this, true));
    }

    /**
     * wake up event handler
     * @private
     */
    function _onWakeUp() {
      var responseStatus = _getResponseErrorStatus();
      if (responseStatus['504']) {
        // wake up 후 바로 'onGatewayTimeoutError'를 pub하였을때 듣고있던 scope에서 xhr 수행하게 되는데 이때
        // 크롬 브라우저에서 'ERR_NETWORK_IO_SUSPENDED'가 발생하여 정상적인 xhr이 수행되지 않으므로 timeout을 사용한다.
        setTimeout(function() {
          jndPubSub.pub('NetInterceptor:onGatewayTimeoutError');
        }, TIMEOUT_THRESHOLD);
      }
      _clearResponseErrorStatus();
    }

    /**
     * 현재 네트워크 커넥션 상태를 반환한다.
     * @returns {boolean}
     */
    function isConnected() {
      return _isConnected;
    }

    /**
     * 커넥션 상태를 설정한다.
     * @param {boolean} isConnected 네트워크 연결상태
     * @private
     */
    function _setStatus(isConnected) {
      //Linux 의 경우 연결이 정상적으로 이루어졌을 경우, 즉시 request 를 수행하면 ERR_NAME_RESOLUTION_FAILED 등의 오류가 발생하므로
      //timeout 을 사용한다.
      $timeout.cancel(_timer);
      _timer = $timeout(_.bind(_applyStatus, this, isConnected), TIMEOUT_THRESHOLD);
    }

    /**
     * network status 상태를 설정한다.
     * @param {boolean} isConnected 네트워크 연결상태
     * @private
     */
    function _applyStatus(isConnected) {
      var currentStatus = _isConnected;
      _isConnected = isConnected;
      if (currentStatus !== isConnected) {
        _broadcast(isConnected);
      }
    }

    /**
     * 연결 상태를 broadcast 한다.
     * @param {boolean} isConnected
     * @private
     */
    function _broadcast(isConnected) {
      if (isConnected) {
        jndPubSub.pub('NetInterceptor:connect');
        $('.content-wrapper').removeClass('offline')
      } else {
        jndPubSub.pub('NetInterceptor:disconnect');
        $('.content-wrapper').addClass('offline');
      }
    }

    /**
     * API responseError 발생시 connection status 를 설정한다.
     * @param {object} rejection
     * @returns {Promise}
     */
    function responseError(rejection) {
      _setStatus(window.navigator.onLine);
      _setResponseErrorStatus(rejection.status);
      return $q.reject(rejection);
    }

    /**
     * response error status 전달
     * @returns {object}
     * @private
     */
    function _getResponseErrorStatus() {
      return _responseErrorStatusMap;
    }

    /**
     * response error status 설정
     * @param {number} responseStatus
     * @private
     */
    function _setResponseErrorStatus(responseStatus) {
      _responseErrorStatusMap[responseStatus] = (_responseErrorStatusMap[responseStatus] || 0) + 1;
    }

    /**
     * response error status 초기화
     * @private
     */
    function _clearResponseErrorStatus() {
      _responseErrorStatusMap = {};
    }
  }
})();
