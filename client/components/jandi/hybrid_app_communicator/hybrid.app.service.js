/**
 * @fileoverview Service that calls functions in hybrid application
 *
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.hybridApp')
    .service('HybridAppHelper', HybridAppHelper);
  
  /* @ngInject */
  function HybridAppHelper(PcAppHelper, MacAppHelper) {
    var delegator = this;
    var _appHelper;

    _init();

    function _init() {
      if (isPcApp()) {
        _appHelper = PcAppHelper;
      } else if (isMacApp()) {
        _appHelper = MacAppHelper;
      }

      _implement(_appHelper, PcAppHelper, MacAppHelper);

      delegator.isPcApp = isPcApp;
      delegator.isMacApp = isMacApp;
      delegator.isHybridApp = isHybridApp;
      delegator.isDeprecatedApp = isDeprecatedApp;
    }

    /**
     * delegator의 method implements
     * @param {object} appHelper - PcAppHelper 또는 MacAppHelper
     * @private
     */
    function _implement(appHelper) {
      var interfas = [];
      var from;
      var e;
      var i;
      var len;

      for (i = 1, len = arguments.length; i < len; i++) {
        from = arguments[i];
        for (e in from) {
          if (from.hasOwnProperty(e)) {
            interfas.push(e);
          }
        }
      }

      appHelper = appHelper || {};
      for(i = 0, len = interfas.length; i < len; i++) {
        delegator[interfas[i]] = (function(key) {
          return function() {
            return appHelper[key] && appHelper[key].apply(appHelper, arguments);
          };
        }(interfas[i]));
      }
    }

    /**
     * pc app 인지 여부
     * @returns {*}
     */
    function isPcApp() {
      return PcAppHelper.isPcApp();
    }

    /**
     * mac app 인지 여부
     * @returns {*}
     */
    function isMacApp() {
      return MacAppHelper.isMacApp();
    }

    /**
     * 0.9.6 version 이하의 window, mac app인지 여부
     */
    function isDeprecatedApp() {
      return isPcApp() || MacAppHelper.isDeprecatedVersion();
    }

    /**
     * hybrid app 인지 여부
     * @returns {boolean}
     */
    function isHybridApp() {
      return !!_appHelper;
    }
  }
})();
