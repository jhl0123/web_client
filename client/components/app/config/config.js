(function() {
  'use strict';

  /**
   * last_update_message
   *  - Month/Dday/Year Hour:Minute:Second
   */
  angular
    .module('app.config', [])
    .constant('configuration', {
      name                : 'local',
      api_address         : 'http://www.jandi.io:8888/',
      api_version         : '2',
      ga_token            : 'UA-54051037-1',
      ga_token_global     : 'UA-54051037-4',
      mp_account_token    : '322e7bff6504a2f680c0f2d4a3545319',
      mp_member_token     : '081e1e9730e547f43bdbf59be36a4e31',
      base_url            : '.jandi.io:8888',
      base_protocol       : 'http://',
      main_address        : 'http://www.jandi.io:8888/main/#/',
      app_store_address   : 'itms-apps://itunes.apple.com/us/app/jandi/id904895208?mt=8',
      play_store_address  : 'https://play.google.com/store/apps/details?id=com.tosslab.jandi.app',
      last_update_message : '04/01/2015 19:45:00'
    })
    .run(run);

  /* @ngInject */
  function run($rootScope, config) {
    // server address, server api version 
    config.init($rootScope);
  }

})();

