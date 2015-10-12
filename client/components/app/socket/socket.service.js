/**
 * @fileoverview 소켓 이벤트를 받기만하고 소켓 이벤트 핸들러로 넘겨주는 곳. Service that manages(emits and receives) socket event.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocket', jndWebSocket);

  /* @ngInject */
  function jndWebSocket($rootScope, socketFactory, config, currentSessionHelper, memberService,
                        storageAPIservice, jndWebSocketHelper, $injector, NetInterceptor, jndWebSocketCommon,
                        jndWebSocketServiceHelper, logger, jndWebSocketEmitter, jndWebSocketOtherTeamManager) {

    var $scope = $rootScope.$new();
    var socket;
    var ioSocket;
    var isConnected;

    var CHECK_CONNECT_TEAM = 'check_connect_team';
    var CONNECT_TEAM = 'connect_team';
    var ERROR_CONNECT_TEAM = 'error_connect_team';

    // Emit only event
    var DISCONNECT_TEAM = 'disconnect_team';

    var handlers = {};

    this.init = init;
    this.disconnect = disconnect;
    this.checkSocketConnection = checkSocketConnection;
    this.disconnectTeam = disconnectTeam;

    /**
     * Initialize variables.
     */
    function init() {
      disconnect();
    }

    /**
     * socket connection 을 끊는다.
     */
    function disconnect() {
      if (socket && ioSocket) {
        socket.removeAllListeners();
        ioSocket.io.disconnect();
      }
      isConnected = false;
    }

    /**
     * Check current socket connection status.
     * If no socket connection has been established, connect new one and add event listeners to it.
     * If socket connection is found, WHAT SHOULD I DO? HOW DO I VERIFY CURRENT SOCKET CONNECTION?
     */
    function checkSocketConnection() {
      if (!isConnected || _.isUndefined(socket)) {
        // Socket is not established yet.
        connect();
      }
    }

    /**
     * Connect to socket server and initialize socket variable.
     */
    function connect() {
      socket && socket.removeAllListeners();

      // When connecting to socket, always force new connection.
      ioSocket = io.connect(config.socket_server, {
        'forceNew': true,
        'reconnection': true,
        'reconnectionDelay': 1000,
        'reconnectionDelayMax': 1000,
        'timeout': 100
      });
      socket = socketFactory({
        prefix: '_jnd_socket:',
        ioSocket: ioSocket
      });
      $scope.$on('disconnected', _onDisconnected);
      jndWebSocketEmitter.setSocket(socket);
      _setSocketEventListener();
    }

    /**
     * disconnected 이벤트 핸들러
     * @private
     */
    function _onDisconnected() {
      if (isConnected) {
        socket.removeAllListeners();
        ioSocket.io.disconnect();
        ioSocket.io.connect();
        _setSocketEventListener();
      }
      isConnected = false;
    }

    /**
     * socket connect 이벤트 핸들러
     * @private
     */
    function _onSocketConnect() {
      isConnected = true;
      NetInterceptor.setStatus(true);
      _setSocketEventListener();
    }

    /**
     * socket disconnect 이벤트 핸들러
     * @private
     */
    function _onSocketDisconnect() {
      isConnected = false;
      NetInterceptor.setStatus(false);
    }

    /**
     * Add all socket event listeners to socket variable.
     * @private
     */
    function _setSocketEventListener() {
      handlers = {};

      socket.removeAllListeners();
      socket.on('connect', _onSocketConnect);
      socket.on('disconnect', _onSocketDisconnect);
      socket.on(CHECK_CONNECT_TEAM, _onCheckConnectTeam);
      socket.on(CONNECT_TEAM, _onConnectTeam);
      socket.on(ERROR_CONNECT_TEAM, _onErrorConnectTeam);

      _attachSocketService();
    }

    /**
     * 각각의 서비스들을 $injector로 주입받아 그 서비스들이 handle하는 event들을
     * 소켓 오브젝트에 추가시킨다.
     * @private
     */
    function _attachSocketService() {
      var servicesList = jndWebSocketServiceHelper.getServices();
      var eventsList;

      _.forEach(servicesList, function(serviceName) {
        eventsList = $injector.get(serviceName).getEvents();

        _.forEach(eventsList, function(obj) {
          socket.on(obj.name, _onSocketEvent);
          handlers[obj.name] = obj.handler;
        });
      });
    }

    /**
     * 모든 소켓이벤트에 발생된다. 현재팀에 관한 이벤트인지 아닌지 확인 후 dispatch한다.
     * @param {object} socketEvent - socket event
     * @private
     */
    function _onSocketEvent(socketEvent) {
      logger.socketEventLogger(socketEvent.event, socketEvent);
      if (_isCurrentTeamEvent(socketEvent)) {
        handlers[socketEvent.event](socketEvent);
      } else {
        jndWebSocketOtherTeamManager.onSocketEvent(socketEvent);
      }
    }

    /**
     * 현재 팀의 소켓이벤트인지 확인한다.
     * @param {object} socketEvent - socket event
     * @returns {boolean}
     * @private
     */
    function _isCurrentTeamEvent(socketEvent) {
      var currentTeamId = currentSessionHelper.getCurrentTeam().id;
      var teamId = jndWebSocketCommon.getTeamId(socketEvent);

      if (socketEvent.event === 'link_preview_image') {
        // 현재는 link_preview_image socket event에 teamId 정보가 없음.
        // 테스트용으로 우선 true를 리턴하게 함.
        return true;
      }

      return teamId > -1 && currentTeamId === teamId;
    }

    /**
     * Socket event receiver - SUCCESS socket connection.
     *  1. let socket server know of my current TEAM by emitting 'CONNECT_TEAM' event.
     * @param data
     * @private
     */
    function _onCheckConnectTeam(data) {
      jndWebSocketHelper.socketEventLogger(CHECK_CONNECT_TEAM, data, false);

      currentSessionHelper.setSocketConnection();

      var param = {};

      var team = currentSessionHelper.getCurrentTeam();
      var member = memberService.getMember();
      var token = storageAPIservice.getAccessToken();

      param = {
        token: token,
        teamId: team.id,
        teamName: team.name,
        memberId: member.id,
        memberName: member.name
      };

      _emit(CONNECT_TEAM, param);

    }

    /**
     * Socket event receiver - connect_team
     *  1. Update local variable.
     * @param data {object} data object that comes with socket event
     * @private
     */
    function _onConnectTeam(data) {
      jndWebSocketHelper.socketEventLogger(CONNECT_TEAM, data, false);
      isConnected = true;
    }

    /**
     * Socket event receiver - error_connect_team
     *  1. Connect to socket server.
     * @param data
     * @private
     */
    function _onErrorConnectTeam(data) {
      var INVALID_SOCKET_TOKEN = 'Invalid token';
      isConnected = false;

      jndWebSocketHelper.socketEventLogger(ERROR_CONNECT_TEAM, data, false);

      if (data.message === INVALID_SOCKET_TOKEN) {
        _onInvalidSocketToken();
        return;
      }

      checkSocketConnection();
    }

    /**
     * Disconnect socket connection by emitting 'disconnect_team' socket event.
     * Used when user
     *  1. signs out.
     *  2. switches team.
     */
    function disconnectTeam() {
      if (currentSessionHelper.getSocketConnection()) {
        currentSessionHelper.resetSocketConnection();

        var param = {
          teamId: memberService.getTeamId(),
          memberId: memberService.getMemberId()
        };

        _emit(DISCONNECT_TEAM, param);

        // Update socket status variable.
        isConnected = false;
      }
    }

    /**
     * Wrapper for emit socket event.
     * @param eventName {string} name of event to be emitted
     * @param data {object} object to be attached along with socket event
     */
    function _emit(eventName, data) {
      socket.emit(eventName, data);
      jndWebSocketHelper.socketEventLogger(eventName, data, true);
    }

    /**
     * Update authorization token.
     * @private
     */
    function _onInvalidSocketToken() {
      var authAPIservice = $injector.get('authAPIservice');

      if (angular.isUndefined(authAPIservice)) return;

      authAPIservice.requestAccessTokenWithRefreshToken();
    }
  }
})();
