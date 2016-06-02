(function() {
  'use strict';

  /**
  * @fileoverview File Download Event Tracker. Donwload시 Log를 수집한다.
  * @author Kevin Lee  <kevin@tosslab.com>
  * @example <a download-file file-url="{{file_detail.content.fileUrl}}" 
  * file-title="{{file_detail.content.name}}" download-tracker="{{test2(file_detail)}}" 
  * ng-click="onClickDownload(file_detail);">
  */

  angular
    .module('app.analytics')
    .directive('downloadTracker', downloadTracker);

  /* @ngInject */
  function downloadTracker(GAHelper, AnalyticsHelper, CoreUtil){
    return {
      restrict: 'A',
      link: linkFunc
    };


    function linkFunc(scope, element, attributes) {
      
      var fileId;

      scope.track = function(fileInfo) {
        fileId = CoreUtil.pick(fileInfo, 'id');
      };

      element.on('click', function() {
        if (fileId) {
          AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DOWNLOAD, {
            'FILE_ID': fileId
          });
        }
      });
      
    }
  }
})();
