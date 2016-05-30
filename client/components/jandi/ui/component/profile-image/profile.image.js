/**
 * @fileoverview profile image
 *
 */
(function() {
  'use strict';

  angular
    .module('jandi.ui.component.profileImage', [
      'ui.bootstrap',
      'jandiApp',
      'jandi.core',
      'jandi.config',
      'jandi.ui.component.dialog'
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
