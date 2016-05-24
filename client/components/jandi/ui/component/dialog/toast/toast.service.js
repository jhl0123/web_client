/**
 * @fileoverview toast service
 * toast service는 'angular-toastr' component를 사용함.
 * 해당 component에 대한 설명은 'https://github.com/Foxandxss/angular-toastr' 참고
 */
(function() {
  'use strict';

  // FILE UPLOAD controller
  angular
    .module('jandi.ui.component.dialog')
    .service('Toast', Toast);

  /* @ngInject */
  function Toast(toastr) {
    var that = this;
    var _isSingleToast = false;
    var _toastInstance;

    _init();

    function _init() {
      that.show = show;

      that.success = success;
      that.info = info;
      that.warning = warning;
      that.error = error;
    }

    /**
     * toast type 별로 show
     * @param {string} type - info, warning, error
     * @param {object} options
     */
    function show(type, options, deferred) {
      var title = options.title;
      var body = options.body;

      if (_isSingleToast && _toastInstance) {
        toastr.clear(_toastInstance);
      }

      _toastInstance = that[type](title, body, _.extend(options, {
        onHidden: _getOnClose(options, deferred)
      }));
    }

    /**
     * success toast open
     * @param {string} title
     * @param {string} body
     * @param {object} options
     * @returns {*}
     */
    function success(title, body, options) {
      return toastr.success(body, title, options);
    }

    /**
     * info toast open
     * @param {string} title
     * @param {string} body
     * @param {object} options
     * @returns {*}
     */
    function info(title, body, options) {
      return toastr.info(body, title, options);
    }

    /**
     * warning toast open
     * @param {string} title
     * @param {string} body
     * @param {object} options
     * @returns {*}
     */
    function warning(title, body, options) {
      return toastr.warning(body, title, options);
    }

    /**
     * error toast open
     * @param {string} title
     * @param {string} body
     * @param {object} options
     * @returns {*}
     */
    function error(title, body, options) {
      return toastr.error(body, title, options);
    }

    /**
     * close callback 전달
     * @param {object} options
     * @param {object} deferred
     * @returns {Function}
     * @private
     */
    function _getOnClose(options, deferred) {
      return function() {
        var fn = options.onClose;

        fn && fn();
        deferred.resolve();
      };
    }
  }
}());
