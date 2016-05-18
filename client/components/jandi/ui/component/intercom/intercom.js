/**
 * @fileoverview intercom
 *
 */
(function() {
  'use strict';

  angular
    .module('jandi.ui.component.intercom', [
      'jandi.config'
    ])
    .config(config)
    .run(run);

  /* @ngInject */
  function config(configuration) {
    // intercom service 제공하는 외부 script 주입한다.
    var intercomScript = "(function(){var w=window;var ic=w.Intercom;if(typeof ic==='function'){ic('reattach_activator');ic('update',window.intercomSettings);}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/{app_id}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);}if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})()";
    $('<script>' + intercomScript.replace('{app_id}',configuration.intercom_app_id) + '</script>')
      .appendTo(window.document.body);
  }

  /* @ngInject */
  function run() {
  }
})();
