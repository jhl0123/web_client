/**
 * @fileoverview dialog config/run
 */
(function() {
  'use strict';

  angular
    .module('jandi.ui.component.dialog', [
      'ui.bootstrap',
      'toastr'
    ])
    .config(config)
    .run(run);

  function config(toastrConfig) {

    // toastr customization
    _.merge(toastrConfig, {
      closeButton: true,
      positionClass: 'toast-top-center',
      iconClasses: {
        success: 'c-toast-success',
        info: 'c-toast-info',
        warning: 'c-toast-warning',
        error: 'c-toast-error'
      },
      templates: {
        toast: 'components/jandi/ui/component/dialog/toast/toast.html'
      },
      closeHtml: '<i class="icon-delete"></i>',
      timeOut: '5000'
    });
  }

  function run() {

  }
})();
