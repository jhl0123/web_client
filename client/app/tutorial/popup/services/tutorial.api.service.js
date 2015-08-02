/**
 * @fileoverview Tutorial API 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TutorialAPI', TutorialAPI);

  /* @ngInject */
  function TutorialAPI($http, configuration) {
    var SERVER_ADDRESS = configuration.server_address;

    this.set = set;

    /**
     * tutorial 진행상황을 저장한다.
     * @param step
     * @param isComplete
     * @returns {*}
     */
    function set(step, isComplete) {
      return $http({
        method  : 'PUT',
        url     : SERVER_ADDRESS + 'settings/tutorial',
        data    : {
          tutorialStep: step,
          tutorialConfirm: isComplete,
          tutorialOpened: true
        }
      });
    }
  }
})();