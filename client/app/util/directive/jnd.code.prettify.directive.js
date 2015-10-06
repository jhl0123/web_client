/**
 * @fileoverview google code prettify 적용하는 directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndCodePrettify', jndCodePrettify);

  function jndCodePrettify() {
    return {
      restrict: 'E',
      link: link,
      scope: false
    };

    function link(scope, el, attr)  {
      el.html('<pre class="prettyprint">' + prettyPrintOne(el.html()) + '</pre>').children().css('minHeight', '25px');
    }
  }
})();
