/**
 * @fileoverview pdf.js 를 wrapping 한 angular 용 pdf-viewer ui 모듈
 * @requires pdfjs-dist@1.4.201 (https://github.com/mozilla/pdfjs-dist)
 * @author young.park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandi.ui.component.pdfViewer', [])
    .config(config)
    .run(run);

  /* @ngInject */
  function config() {
  }

  /* @ngInject */
  function run() {
  }
})();
