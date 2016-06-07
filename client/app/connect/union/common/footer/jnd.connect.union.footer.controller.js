/**
 * @fileoverview union 공통 footer 컨트롤러
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionFooterCtrl', JndConnectUnionFooterCtrl);

  /* @ngInject */
  function JndConnectUnionFooterCtrl($scope, $filter, CoreUtil, jndPubSub, modalHelper, JndUtil, Dialog, JndConnectUnion) {
    var _translate = $filter('translate');
    $scope.save = JndConnectUnion.notifySave;
    $scope.onFileSelect = onFileSelect;

    $scope.langList = [
      {
        text: _translate('@jnd-connect-103'),
        value: 'ko'
      },
      {
        text: _translate('@jnd-connect-104'),
        value: 'en'
      },
      {
        text: _translate('@jnd-connect-105'),
        value: 'ja'
      },
      {
        text: _translate('@jnd-connect-106'),
        value: 'zh-cn'
      },
      {
        text: _translate('@jnd-connect-107'),
        value: 'zh-tw'
      }
    ];
    $scope.changedFileUri = null;
    $scope.inputBotName = '';

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $scope.inputBotName = $scope.data.botName;
      $scope.$watch('inputBotName', _onChangeInputBotName);
      $scope.$watch('data.botName', _setInputBotName);
    }

    /**
     * input 의 bot name 을 설정한다.
     * @private
     */
    function _setInputBotName() {
      if ($scope.inputBotName && $scope.inputBotName !== $scope.data.botName) {
        $scope.inputBotName = $scope.data.botName;
      }
    }

    /**
     * bot name 변경되었을 시 빈값이라면 default bot name 으로 설정한다.
     * @private
     */
    function _onChangeInputBotName() {
      $scope.data.botName = $scope.inputBotName || $scope.data.defaultBotName;
    }

    /**
     * 모달의 profile 이미지 변경 완료 이벤트 발생시 핸들러
     * @param {string} url
     * @private
     */
    function _onProfileSettingDone(url) {
      if (url) {
        $scope.changedFileUri = url;
        $scope.data.botThumbnailFile = CoreUtil.dataURItoBlob(url);
      }
    }

    /**
     * file select 이벤트 핸들러
     * @param {object} $files
     */
    function onFileSelect($files) {
      if ($files && $files.length) {
        _getImageData($files).then(_resolveImageData);
      }
    }

    /**
     * get image data
     * @param {object} files
     * @returns {*}
     * @private
     */
    function _getImageData(files) {
      var file = files[0];
      return JndUtil.getImageDataByFile(file);
    }

    /**
     * resolve image data
     * @param {object} img
     * @private
     */
    function _resolveImageData(img) {
      if (img) {
        if (img.type === 'error') {
          Dialog.warning({
            'title': _translate('@common-unsupport-image')
          });
        } else {
          modalHelper.openProfileImageModal($scope, {
            type: 'crop',
            imageData: img.toDataURL('image/jpeg'),
            onProfileImageChange: _onProfileSettingDone
          });
        }
      }
    }
  }
})();
