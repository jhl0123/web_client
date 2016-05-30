/**
 * @fileoverview jandi app에 종속적인 ui component 모음
 *
 */
(function() {
  'use strict';

  angular
    .module('jandi.ui.component', [
      'jandi.ui.component.intercom',
      'jandi.ui.component.dialog',
      'jandi.ui.component.profileImage',
      'jandi.ui.component.pdfViewer',
      'jandi.ui.component.splitter'
    ])
    .run(run)
    .config(config);

  /* @ngInject */
  function config() {
  }

  /* @ngInject */
  function run() {
  }

})();
