/**
 * @fileoverview Service that calls functions in pc application through 'jandipc'
 * @author JiHoon Kim <jihoonk@tosslab.com>
 *
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.hybridApp')
    .service('hybridAppHelper', hybridAppHelper);
  
  /* @ngInject */
  function hybridAppHelper(macAppHelper, pcAppHelper) {
    var delegator = this;

    _init();

    function _init() {
      var appHelper;
      var interfas = [
        'trigger',
        'onSignedOut',
        'onSignedIn',
        'onAlarmCntChanged',
        'onLanguageChanged',
        'isHybridApp'
      ];

      if (isPcApp()) {
        appHelper = pcAppHelper;
      } else if (isMacApp()) {
        appHelper = macAppHelper;
      }

      _implement(appHelper, interfas);

      delegator.isPcApp = isPcApp;
      delegator.isMacApp = isMacApp;
    }

    /**
     * delegator의 method implements
     * @param {object} appHelper - pcAppHelper 또는 macAppHelper
     * @param {array} interfas
     * @private
     */
    function _implement(appHelper, interfas) {
      var i;
      var len;

      appHelper = appHelper || {};
      for(i = 0, len = interfas.length; i < len; i++) {
        delegator[interfas[i]] = (function(key) {
          return function() {
            return appHelper[key] && appHelper[key].apply(appHelper, arguments);
          };
        }(interfas[i]));
      }
    }

    function isMacApp() {
      return macAppHelper.isHybridApp();
    }

    function isPcApp() {
      return pcAppHelper.isHybridApp();
    }
  }
})();
