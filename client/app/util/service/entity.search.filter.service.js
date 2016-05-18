/**
 * @fileoverview entity search filter service
 */
(function() {

  'use strict';

  angular
    .module('jandiApp')
    .service('EntitySearchFilter', EntitySearchFilter);

  /* @ngInject */
  function EntitySearchFilter(CoreUtil) {
    var _that = this;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _that.getPropertyValue = getPropertyValue;
    }

    /**
     * object의 특정 property에 value 전달
     * @param {object} item
     * @param {string|array} property
     * @returns {*|string}
     * @private
     */
    function getPropertyValue(item, property) {
      var value;

      if (_.isArray(property)) {
        value = CoreUtil.pick.apply(this, [item].concat(property));
      } else {
        value = item[property];
      }

      return (value || '').toLowerCase();
    }
  }
})();
