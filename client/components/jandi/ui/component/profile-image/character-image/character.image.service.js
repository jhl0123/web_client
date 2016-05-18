/**
 * @fileoverview profile image service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('CharacterImage', CharacterImage);

  /* @ngInject */
  function CharacterImage($http, $q, config, CoreUtil) {
    var that = this;

    var _imageMap = {};
    var _avatarInfo;

    that.getAvatarInfo = getAvatarInfo;
    that.getCROSImage = getCROSImage;

    /**
     * avatar를 꾸미는 정보 전달함.
     * @returns {*}
     */
    function getAvatarInfo() {
      var defer = $q.defer();

      if (_avatarInfo) {
        // avatarInfo의 요청이 한번 이루어져 존재한다면 바로 전달한다.

        defer.resolve(_avatarInfo);
      } else {
        _requestAvatarInfo()
          .success(function (response) {
            _avatarInfo = {
              characters: doShuffle(response.characters),
              backgrounds: response.backgroundColors
            };

            defer.resolve(_avatarInfo);
          });
      }

      return defer.promise;
    }

    /**
     * avatar 정보 요청함.
     * @returns {*}
     * @private
     */
    function _requestAvatarInfo() {
      return $http({
        method: 'GET',
        url: config.server_address + 'avatars'
      });
    }

    /**
     * CROS image를 전달함.
     * @param {string} url
     * @returns {*}
     */
    function getCROSImage(url) {
      var defer = $q.defer();

      if (_imageMap[url]) {
        // imageMap에 해당 image가 존재한다면 바로 전달한다.

        defer.resolve(_imageMap[url]);
      } else {
        _setImage(defer, url);
      }

      return defer.promise;
    }

    /**
     * image 설정함.
     * @param {object} defer
     * @param {string} url
     */
    function _setImage(defer, url) {
      // 다른 도메인의 이미지를 canvas에서 가공 후 dataUrl을 뽑아내려면 CROS를 허용해야 하지만.
      // IE 10이하는 해당 기능을 제공하지 않으므로 xhr을 사용하여 image를 로드함.
      // https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image#Example_Storing_an_image_from_a_foreign_origin
      _requestBlob(defer, url);

      defer.promise.then(function(image) {
        _imageMap[url] = image;
      });
    }

    /**
     * blob 요청함.
     * @param {object} defer
     * @param {string} url
     * @private
     */
    function _requestBlob(defer, url) {
      var xhr = new XMLHttpRequest();

      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = function() {
        _onLoad.call(this, defer);
      };

      xhr.send();
    }

    /**
     * blob load 이벤트 핸들러.
     * @param {object} defer
     * @private
     */
    function _onLoad(defer) {
      var that = this;

      if (that.status === 200) {
        CoreUtil.blobToDataURI(that.response, function(dataURI) {
          _createImage(defer, dataURI);
        });
      }
    }

    /**
     * blob 에서 dataURL로 변경함.
     * @param {object} blob
     * @param {function} callback
     * @private
     */
    function _blobToDataURL(blob, callback) {
      var fileReader = new FileReader();
      fileReader.onload = function(e) {
        callback(e.target.result);
      };
      fileReader.readAsDataURL(blob);
    }

    /**
     * dataURL을 src로 가지는 image element를 생성함.
     * @param {object} defer
     * @param {string} dataURL
     * @private
     */
    function _createImage(defer, dataURL) {
      var image = new Image();

      image.onload = function() {
        defer.resolve(image);
      };
      image.src = dataURL;
    }

    /**
     * array 섞기
     * @param {array} array
     * @returns {*}
     */
    function doShuffle(array) {
      var arrayLength = array.length;
      var temp;
      var randomIndex;

      _.each(array, function(value, index) {
        randomIndex = Math.floor(Math.random() * arrayLength);

        temp = array[index];
        array[index] = array[randomIndex];
        array[randomIndex] = temp;
      });

      return array;
    }
  }
})();
