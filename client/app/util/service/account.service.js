(function(){
  'use strict';

  angular
    .module('jandiApp')
    .factory('accountService', accountService);

  accountService.$inject = ['$location', 'configuration', '$http', '$rootScope', 'storageAPIservice'];

  function accountService($location, configuration, $http, $rootScope) {
    var accountLanguage;

    var service = {
      getAccountInfo: getAccountInfo,
      setAccountInfo: setAccountInfo,
      getAccount: getAccount,
      setAccount: setAccount,
      removeAccount: removeAccount,
      getCurrentMemberId: getCurrentMemberId,
      hasChangeLog: hasChangeLog,
      hasSeenTutorial: hasSeenTutorial,
      getAccountLanguage: getAccountLanguage,
      validateCurrentPassword: validateCurrentPassword,
      setAccountLanguage: setAccountLanguage
    };

    return service;

    function getAccountInfo() {
      return $http({
        method: 'GET',
        url: $rootScope.server_address + 'account'
      });
    }
    function setAccountInfo(account) {
      return $http({
        method: 'PUT',
        url: $rootScope.server_address + 'account',
        data: account
      });
    }

    function getAccount() {
      return $rootScope.account;
    }
    function setAccount(account) {
      $rootScope.account = account;
      accountLanguage = account.lang;
    }
    function removeAccount() {
      $rootScope.account = null;
    }

    // TODO: CURRENTLY THIS IS O(N) ALGORITHM.  WHEN FOUND MATCH, BREAK OUT OF FOR LOOP AND RETURN RIGHT AWAY!
    // Returns memberId of current team from Account.
    function getCurrentMemberId(memberships) {
      var signInInfo = {
        memberId    : -1,
        teamId      : -1
      };

      var prefix = $location.host().split('.')[0];

      if (configuration.name == 'local') {
        if (prefix == 'local') {
          prefix = 'tosslab';
          //prefix = 'asdfz';
        }
      }

      _.forEach(memberships, function(membership, index) {
        if (membership.t_domain == prefix) {
          signInInfo.memberId = membership.memberId;
          signInInfo.teamId   = membership.teamId;
        }
      });

      return signInInfo;
    }

    function hasChangeLog() {

      console.log(configuration)
      console.log(configuration.last_update_message);
      console.log(new Date(configuration.last_update_message))

      var account = getAccount();

      // Account or tutoredAt info don't exist. return false.
      if (!account || !account.tutoredAt) return false;

      var tutoredAt = new Date(account.tutoredAt);
      var lastUpdateMesageAt = new Date(configuration.last_update_message);

      console.log(tutoredAt)
      console.log(lastUpdateMesageAt)
      // Return true if and only if tutoredAt is in past.
      if (tutoredAt < lastUpdateMesageAt) {
        console.log('return true!!!');
        return true;
      }

      return false;
    }
    function hasSeenTutorial() {
      return !!getAccount().tutoredAt;
    }

    function setAccountLanguage(lang) {
      $rootScope.account.lang = lang;
      accountLanguage = lang;
    }

    function getAccountLanguage() {
      return accountLanguage || $rootScope.preferences.serverLang;
    }
    function validateCurrentPassword(cur_password) {
      cur_password = cur_password || '';
      return $http({
        method  : 'POST',
        url     : $rootScope.server_address + 'validation/password',
        data    : {
          password: cur_password
        }
      });
    }
  }
})();