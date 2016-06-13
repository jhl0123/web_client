/**
 * @fileoverview jandi version
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndVersion', JndVersion);


  function JndVersion(configuration) {
    var _that = this;
    _init();

    /**
     * version 정보를 설정한다.
     * @private
     */
    function _init() {
      var versionText = configuration.version;
      var name = configuration.name;
      var isDev = (name === 'local' || name === 'development');
      var isStaging = name.indexOf('staging') !== -1;
      var isAlpha = versionText.indexOf('alpha') !== -1;
      var isShow = !isStaging || isAlpha;

      if (!isStaging) {
        if (isAlpha) {
          //QA 시 version 정보가 노출되면 혼선의 여지가 있으므로 development 라는 label 만 노출한다.
          if (name === 'development') {
            versionText = name;
          } else {
            versionText = versionText.split('-')[0] + '-' + name;
          }
        } else {
          versionText += '-' + name;
        }
      }
      _.extend(_that, {
        isShow: isShow,
        isDev: isDev,
        version: configuration.version,
        versionText: versionText
      });
    }
  }
})();
