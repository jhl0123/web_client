/**
 * @fileoverview dialog service
 * @see https://github.com/Foxandxss/angular-toastr
 */
(function() {
  'use strict';

  angular
    .module('jandi.ui.component.dialog')
    .service('Dialog', Dialog);

  /* @ngInject */
  function Dialog($rootScope, $modal, $q, $filter, Toast) {
    var _that = this;
    var _modals = ['alert', 'confirm'];
    var _toasts = ['success', 'info', 'warning', 'error'];

    var _toastTimer = 2000;

    _init();

    function _init() {
      _that.show = show;
      _that.isOkay = isOkay;
      _that.toastInvalidPassword = toastInvalidPassword;
      _that.tryAgainToast = tryAgainToast;

      /**
       * alert modal
       * @function alert
       * @param {object} options
       * @param {string} [options.title]            - modal title
       * @param {string} options.body               - modal body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       * @returns {*}
       */
      /**
       * confirm modal
       * @function confirm
       * @param {object} options
       * @param {string} options.title              - modal title
       * @param {string} options.body               - modal body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       * @returns {*}
       */
      _.each(_modals, function(name) {
        _that[name] = (function(name) {
          return function(options) {
            var deferred  = $q.defer();

            if (_.isObject(options)) {
              options.type = name;
              options.deferred = deferred;
              $modal.open(_getModalOptions(options));
            }

            return deferred.promise;
          };
        }(name));
      });

      /**
       * success toast
       * @function success
       * @param {object} options
       * @param {string} options.title              - toast title
       * @param {string} options.body               - toast body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       * @param {number} [options.timeOut=5000]     - toast 유지시간
       * @returns {*}
       */
      /**
       * info toast
       * @function info
       * @param {object} options
       * @param {string} options.title              - toast title
       * @param {string} options.body               - toast body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       * @param {number} [options.timeOut=5000]     - toast 유지시간(ms)
       * @returns {*}
       */
      /**
       * warning toast
       * @function warning
       * @param {object} options
       * @param {string} options.title              - toast title
       * @param {string} options.body               - toast body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       * @param {number} [options.timeOut=5000]     - toast 유지시간(ms)
       * @returns {*}
       */
      /**
       * error toast
       * @function error
       * @param {object} options
       * @param {string} options.title              - toast title
       * @param {string} options.body               - toast body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       * @param {number} [options.timeOut=5000]     - toast 유지시간(ms)
       * @returns {*}
       */
      _.each(_toasts, function(name) {
        _that[name] = (function(name) {
          return function(options) {
            var deferred = $q.defer();

            if (_.isFunction(Toast[name]) && _.isObject(options)) {
              options.type = name;
              Toast.show(name, options, deferred);
            }

            return deferred.promise;
          };
        }(name));
      });
    }

    /**
     * modal options 전달
     * @param options
     * @returns {{scope: (*|Object), controller: string, templateUrl: string, windowClass: string, resolve: {options: Function}}}
     * @private
     */
    function _getModalOptions(options) {
      return {
        scope: $rootScope.$new(true),
        controller: 'ModalCtrl',
        templateUrl: 'components/jandi/ui/component/dialog/modal/modal.html',
        windowClass: options.windowClass || 'center-dialog-modal',
        backdrop: options.backdrop || 'static',
        resolve: {
          options: function() {
            return options;
          }
        }
      };
    }

    /**
     * modal혹은  toast를 보여준다.
     * 외부에서 success나 confirm을 직접 불러도되지만 이렇게 wrapper로 부르는 방법을 시도해보고 싶었음.
     * code readability 가 어떤게 더 좋은지 알아보자.
     * @param {string} type - modal/toast의 type
     * @param {object} param - 같이 던져줄 param object
     */
    function show(type, param) {
      _that[type](param);
    }

    /**
     * 모달이 닫힌 이유가 긍정의 이유인지 아닌지 확인한다.
     * @param {string} reason - modal이 닫힌 이유
     * @returns {boolean}
     */
    function isOkay(reason) {
      return reason === 'okay';
    }

    /**
     * 잘못된 비밂번호를 입력했을 때 토스트를 출력한다.
     */
    function toastInvalidPassword() {
      _that['error']({
        title: $filter('translate')('@input-user-password-invalid'),
        timeOut: _toastTimer
      });
    }

    /**
     * '잠시 후에 다시 시도하십시요' 라는 toast를 보여준다.
     */
    function tryAgainToast() {
      _that['error']({
        title: $filter('translate')('@common-api-error-msg'),
        timeOut: _toastTimer
      });
    }
  }
})();
