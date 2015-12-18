/**
 * @fileoverview 잔디 컨넥트 서비스(union) 에 연결된 plug 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectCardPlugCtrl', JndConnectCardPlugCtrl);

  /* @ngInject */
  function JndConnectCardPlugCtrl($scope, jndPubSub) {
    $scope.toggleOnOff = toggleOnOff;
    $scope.modify = modify;
    $scope.remove = remove;


    /**
     * plug 의 on off 상태를 토글한다.
     */
    function toggleOnOff() {
      $scope.plug.isOn = !$scope.plug.isOn;
    }

    function modify() {
      console.log('##modify', $scope.plug.raw, $scope.plug.raw.id);
      jndPubSub.pub('connectCard:modifyPlug', {
        unionName: $scope.union.name,
        connectId: $scope.plug.raw.id
      });
    }

    function remove() {

    }
  }
})();
