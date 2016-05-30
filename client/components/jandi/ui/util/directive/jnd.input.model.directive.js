/**
 * @fileoverview input 모델 바인딩 디렉티브
 * @author Soonyoung Park <young.park@tosslab.com>
 * @example
   <input type="text"
      jnd-input-model="curUser.name"
      jnd-is-trim="on"
      jnd-on-change="onChange()" />
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.ui.util')
    .directive('jndInputModel', function($timeout) {
      return {
        restrict: 'A',
        link: function(scope, el, attrs) {
          var _key;
          var _keys;
          var _isTrimEnable;
          var _timer;

          _init();

          /**
           * 생성자 함수
           * @private
           */
          function _init() {
            _key = attrs.jndInputModel;
            if (_.isString(_key)) {
              _keys = _key.split('.');
              _isTrimEnable = attrs.jndIsTrim === 'on';
              _attachDomEvents();
              _attachEvents();
              el.val(_getValue());
            }
          }

          /**
           * event 를 attach 한다.
           * @private
           */
          function _attachEvents() {
            scope.$on('$destroy', _onDestroy);
            scope.$watch(_key, function(newVal) {
              var val = el.val();
              val = _isTrimEnable ? _.trim(val) : val;
              if (newVal !== val) {
                el.val(newVal);
              }
            });
          }

          /**
           * model target property 의 reference 가 될 수 있는 object 를 반환한다.
           * @returns {*}
           * @private
           */
          function _getObject() {
            var i = 0;
            var lastIdx = _keys.length - 1;
            var key;
            var target = scope;
            for (; i < lastIdx; i++) {
              key = _keys[i];
              target = target[key];
              if (_.isUndefined(target)) {
                return;
              }
            }
            return target;
          }

          /**
           * model target property 를 반환한다.
           * @returns {*}
           * @private
           */
          function _getValue() {
            var target = _getObject();
            var key = _keys[_keys.length - 1];
            return _.isUndefined(target) ? target : target[key];
          }

          /**
           * value 를 set 한다.
           * @param {string} value
           * @private
           */
          function _setValue(value) {
            var target = _getObject();
            var key = _keys[_keys.length - 1];
            target[key] = _isTrimEnable ? _.trim(value) : value;
          }

          /**
           * dom event 바인딩
           * @private
           */
          function _attachDomEvents() {
            el.on('propertychange change click keyup input paste', _onChange);
          }

          /**
           * dom event 바인딩 해제
           * @private
           */
          function _detachDomEvents() {
            el.off('propertychange change click keyup input paste', _onChange);
          }

          /**
           * 소멸자
           * @private
           */
          function _onDestroy() {
            _detachDomEvents();
          }

          /**
           * change 이벤트 핸들러
           * @param {object} changeEvent
           * @private
           */
          function _onChange(changeEvent) {
            var value = $(changeEvent.target).val();
            $timeout.cancel(_timer);
            _timer = $timeout(_.bind(_apply, this, value), 10);
          }

          /**
           * apply scope model
           * @param {string} value
           * @private
           */
          function _apply(value) {
            scope.$apply(function() {
              _setValue(value);
              scope.$eval(attrs.jndOnChange);
            });
          }
        }
      };
    });
})();
