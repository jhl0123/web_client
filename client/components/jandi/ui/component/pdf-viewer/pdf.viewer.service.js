/**
 * @fileoverview pdf-viewer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandi.ui.component.pdfViewer')
    .service('PdfViewer', PdfViewer);

  /* @ngInject */
  function PdfViewer($rootScope) {
    this.load = load;
    this.unload = unload;

    this.setScale = setScale;
    this.zoomIn = zoomIn;
    this.zoomOut = zoomOut;
    this.zoomDefault = zoomDefault;
    this.zoomToggle = zoomToggle;
    
    this.goToPage = goToPage;
    this.nextPage = nextPage;
    this.prevPage = prevPage;

    this.pub = pub;

    /**
     * URL 에 해당하는 PDF 를 load 한다.
     * @param {string} url - load 할 pdf URL
     */
    function load(url) {
      pub('PdfViewer:load', url);
    }

    /**
     * PDF 를 unload  한다.
     */
    function unload() {
      pub('PdfViewer:unload');
    }

    /**
     * scale 값을 설정한다.
     * @param {number|string} scale
     */
    function setScale(scale) {
      pub('PdfViewer:setScale', scale);
    }

    /**
     * default scale 값으로 설정한다.
     */
    function zoomDefault() {
      pub('PdfViewer:zoomDefault');
    }

    /**
     * zoom in 한다.
     */
    function zoomIn() {
      pub('PdfViewer:zoomIn');
    }

    /**
     * zoom out 한다.
     */
    function zoomOut() {
      pub('PdfViewer:zoomOut');
    }

    /**
     * page-fit, page-width 를 토글한다.
     */
    function zoomToggle() {
      pub('PdfViewer:zoomToggle');
    }
    
    /**
     * pageNum 에 해당하는 페이지로 이동한다.
     * @param {number} pageNum
     */
    function goToPage(pageNum) {
      pageNum = pageNum || 1;
      pub('PdfViewer:goToPage', pageNum);
    }

    /**
     * 다음 페이지로 이동한다.
     */
    function nextPage() {
      pub('PdfViewer:nextPage');
    }

    /**
     * 이전 페이지로 이동한다.
     */
    function prevPage() {
      pub('PdfViewer:prevPage');
    }    
    
    /**
     * 이벤트를 publish 한다.
     * @param {string} eventName
     * @param {...*} [params]
     */
    function pub(eventName, params) {
      if (_.isString(eventName)) {
        $rootScope.$broadcast.apply($rootScope, arguments);
      }
    }
  }
})();
