/**
 * @fileoverview 서비스 종속적인 유틸리티 서비스 모음
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndUtil', JndUtil);

  function JndUtil($compile, $filter, $q, Dialog) {
    this.safeApply = safeApply;
    this.safeCompile = safeCompile;

    this.alertUnknownError = alertUnknownError;
  
    this.getImageDataByFile = getImageDataByFile;

    /**
     * angular 의 $apply 를 안전하게 수행한다.
     * @param {object} scope
     * @param {function} fn
     */
    function safeApply(scope, fn) {
      var phase = scope.$root.$$phase;
      if (scope) {
        fn = _.isFunction(fn) ? fn : function () {};

        if (phase !== '$apply' && phase !== '$digest') {
          scope.$apply(fn);
        } else {
          fn();
        }
      }
    }

    /**
     * angular 의 $compile 을 안전하게 수행한다.
     * @param {object} scope
     * @param {object} jqCompile
     */
    function safeCompile(scope, jqCompile) {
      try {
        $compile(jqCompile)(scope);
      } catch(e) {}
    }

    /**
     * 알수 없는 오류에 대한 alert 을 노출한다.
     * @param {object} response
     * @param {number} status - http 상태 코드
     */
    function alertUnknownError(response, status) {
      var msg = $filter('translate')('@common-unknown-error');
      var body;
      //401 오류는 net.auth.service 에서 refresh token 을 가져오는 로직을 수행하기 때문에 alert 을 노출하지 않는다.
      //504 gateway timeout 일 경우에는 status code 가 존재하지 않는 경우인데 이 때에는 alert 을 노출하지 않는다.
      if (status !== 401 && status) {
        response = _.extend({
          code: status,
          msg: 'Unknown error'
        }, response);

        body = [
          msg + '<br />',
          'code: ' + response.code,
          response.msg
        ];

        Dialog.alert({
          allowHtml: true,
          body: body.join('<br />')
        });
      }
    }
    
    /**
     * get image data
     * @param {object} file
     * @returns {deferred.promise|{then, always}}
     */
    function getImageDataByFile(file) {
      var deferred = $q.defer();
      var orientation;
    
      if (file) {
        loadImage.parseMetaData(file, function(data) {
          if (data.exif) {
            orientation = data.exif.get('Orientation');
          }
        
          loadImage(file, function(img) {
            deferred.resolve(img);
          }, {
            canvas: true,
            orientation: orientation
          });
        });
      }
    
      return deferred.promise;
    }
  }
})();
