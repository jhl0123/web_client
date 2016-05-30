/**
 * @fileoverview custom selectbox 에서 성능 저하로 인해 ng-repeat 을 대신하는 directive
 * @example
 * <jnd-selectbox-repeat list="enabledList" template="selectbox.item"></jnd-selectbox-repeat>
 * list: 노출할 list
 * template: 핸들바 template
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndSelectboxRepeat', jndSelectboxRepeat);

  function jndSelectboxRepeat(jndPubSub) {
    return {
      restrict: 'E',
      replace: true,
      link: link,
      scope: {
        'list': '=list',
        'template': '@template'
      }
    };
    
    function link(scope, el, attrs) {
      var _template;
      var _timer;
      
      _init();
      
      /**
       * 초기화
       * @private
       */
      function _init() {
        _template = Handlebars.templates[scope.template];
        scope.$watch('list', _render);
      }

      /**
       * 랜더링 한다.
       * @private
       */
      function _render() {
        var list = [];

        _.forEach(scope.list, function(item) {
          list.push($(_template(item)).data('item', item));
        });
        el.empty().append(list);
        jndPubSub.pub('custom-focus:focus-item', scope.list[0]);
      }
    }
  }
})();


