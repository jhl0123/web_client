/**
 * @fileoverview 소켓 이벤트 히스토리 API
 * @author Soonyoung Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('SocketEventApi', SocketEventApi);

  /* @ngInject */
  function SocketEventApi($http, configuration) {
    var API_URL = configuration.api_address + 'inner-api/';

    this.get = get;
    
    /**
     * 이벤트 히스토리 조회 
     * 
     * @param {object} params
     *    @param {number} params.ts
     *    @param {number} [params.size]
     *    @param {number} [params.memberId]
     *    @param {number} [params.eventType]
     */
    function get(params) {

      return $http({
        method: 'GET',
        url: API_URL + 'events',
        params: params
      });
    }
  }
})();
