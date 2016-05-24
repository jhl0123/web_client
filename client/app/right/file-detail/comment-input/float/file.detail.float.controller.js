/**
 * @fileoverview file detail float controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('FileDetailFloatCtrl', FileDetailFloatCtrl);

  /* @ngInject */
  function FileDetailFloatCtrl() {
    var _that = this;

    var _jqScrollContainer;
    var _jqInputElement;

    _that.getJqScrollContainer = getJqScrollContainer;
    _that.setJqScrollContainer = setJqScrollContainer
    _that.getJqInput = getJqInput;
    _that.setJqInput = setJqInput;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
    }

    /**
     * get scroll container element
     * @returns {*}
     */
    function getJqScrollContainer() {
      return _jqScrollContainer;
    }

    /**
     * set scoll container element
     * @param {object} jqScrollContainer
     */
    function setJqScrollContainer(jqScrollContainer) {
      _jqScrollContainer = jqScrollContainer;
    }

    /**
     * get input element
     * @returns {*}
     */
    function getJqInput() {
      return _jqInputElement;
    }

    /**
     * set input element
     * @param {object} jqInputElement
     */
    function setJqInput(jqInputElement) {
      _jqInputElement = jqInputElement;
    }
  }
})();
