/**
 * @fileoverview profile image dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('profileImageMenu', profileImageMenu);

  function profileImageMenu($modal, $filter, JndUtil, Dialog) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        profileImageStatus: '=?',
        onProfileImageChange: '&'
      },
      templateUrl : 'components/jandi/ui/component/profile-image/menu/profile.image.menu.html',
      link: link
    };

    function link(scope, el, attrs) {
      var _translate = $filter('translate');

      var _buttonTextKey = attrs.buttonTextKey || '@btn-change';
      var _menuClass = attrs.menuClass || '';

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.buttonText = _translate(_buttonTextKey);
        scope.menuClass = _menuClass;

        scope.onCropClick = onCropClick;
        scope.onCharacterClick = onCharacterClick;
      }

      /**
       * crop 선택 이벤트 핸들러
       */
      function onCropClick() {
        $('<input type="file" accept="image/*"/>')
          .on('change', function(evt) {
            var promise = JndUtil.getImageDataByFile(evt.target.files[0]);
            promise.then(_resolveImageData);
          })
          .trigger('click');
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
            scope.isSelectedImage = true;
            scope.imageData = img.toDataURL('image/jpeg');

            _openProfileImageModal({
              type: 'crop',
              imageData: scope.imageData,
              onProfileImageChange: _onProfileImageChange
            });
          }
        }
      }

      /**
       * character 생성 선택 이벤트 핸들러
       */
      function onCharacterClick() {
        _openProfileImageModal({
          type: 'character',
          onProfileImageChange: _onProfileImageChange
        });
      }

      /**
       * profile image change 이벤트 핸들러
       * @param {string} dataURI
       * @private
       */
      function _onProfileImageChange(dataURI) {
        scope.onProfileImageChange({
          $dataURI: dataURI
        });
      }

      /**
       * profile image를 변경하는 모달창 열림.
       * @param {object} options
       *  @param {string} options.type - 모달의 타입. 'crop'이면 image crop이고 'character'면 character 조합.
       *  @param {function} options.onProfileImageChange - change callback 함수.
       *  @param {string} [options.imageData] - 타입이 'crop'일때 crop할 imageData
       * @returns {Object}
       */
      function _openProfileImageModal(options) {
        $modal.open({
          scope: scope.$new(),
          templateUrl: 'components/jandi/ui/component/profile-image/profile.image.html',
          controller: 'ProfileImageCtrl',
          windowClass: 'full-screen-modal profile-image-modal',
          resolve: {
            options: function() {
              return options;
            }
          }
        });
      }
    }
  }
})();
