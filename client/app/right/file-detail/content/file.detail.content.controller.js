/**
 * @fileoverview file detail float controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('FileDetailContentCtrl', FileDetailContentCtrl);

  /* @ngInject */
  function FileDetailContentCtrl() {
    var _that = this;
    var _jqHeader;
    var _jqScrollContainer;
    var _jqInputElement;

    _that.getJqHeader = getJqHeader;
    _that.setJqHeader = setJqHeader;
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
     * get header
     * @returns {*}
     */
    function getJqHeader() {
      return _jqHeader;
    }

    /**
     * set header
     * @param {object} jqHeader
     */
    function setJqHeader(jqHeader) {
      _jqHeader = jqHeader;
    }

    /**
     * scroll을 제공하는 container 전달
     * @returns {*}
     */
    function getJqScrollContainer() {
      return _jqScrollContainer;
    }

    /**
     * scroll을 제공하는 container 설정
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
