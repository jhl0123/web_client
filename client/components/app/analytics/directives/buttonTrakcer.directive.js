(function() {
  'use strict';

  /**
  * @fileoverview, Button Click Event Tracker. Button Element에 Attribtue형식으로 추가된다. 
  *       버튼을 클릭할경우 GA와 로그서버로 이벤트를 전송한다. 
  * @author Kevin Lee <kevin@tosslab.com>
  * @example <button button-tracker="Sign Up" button-position="Main Top"></button>
  */

  angular
    .module('app.analytics')
    .directive('buttonTracker', buttonTracker);

  /* @ngInject */
  function buttonTracker(GAHelper, AnalyticsHelper){
    return {
      restrict: 'A',
      link: linkFunc
    };

    function linkFunc(scope, element, attributes) {
      var tracker = attributes.buttonTracker;
      var position = attributes.buttonPosition
      var isValid = tracker && position;

      if (isValid) {
        element.on('click', function(){

          //Send Data to Google Analytics
          GAHelper.sendEvent('Button Click', tracker, position);

          //Send Data to Log Server
          AnalyticsHelper.track(AnalyticsHelper.EVENT.BUTTON_CLICK, {
            BUTTON_NAME: attributes.buttonTracker,
            BUTTON_POSITION: attributes.buttonPosition
          });
        });
      } else {
        AnalyticsHelper.error('ButtonTracker or ButtonTracker Undefined. Tracker: ' + tracker + ', position' + position, 'ButtonTracker.directive');
      }
    }
  }
})();
