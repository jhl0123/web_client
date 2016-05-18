/**
 * @fileoverview crop image dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('characterImage', characterImage);

  function characterImage(CharacterImage) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        imageData: '='
      },
      templateUrl : 'components/jandi/ui/component/profile-image/character-image/character.image.html',
      link: link
    };

    function link(scope, el) {
      var _jqCanvas = el.find('canvas');
      var _context = _jqCanvas[0].getContext('2d');

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.onClick = onClick;
        scope.isActive = isActive;

        _initAvatarInfo()
      }

      /**
       * avatarInfo 초기화.
       * @private
       */
      function _initAvatarInfo() {
        CharacterImage.getAvatarInfo()
          .then(function (avatarInfo) {
            scope.isReady = true;

            scope.characters = avatarInfo.characters;
            scope.backgrounds = avatarInfo.backgrounds;

            scope.active = {
              character: 0,
              background: 0
            };

            _draw();
          });
      }

      /**
       * avatar data 선택 이벤트 핸들러.
       * @param {string} type
       * @param {number} $index
       */
      function onClick(type, $index) {
        scope.active[type] = $index;

        _draw();
      }

      /**
       * 활성화 여부.
       * @param {string} type
       * @param {number} $index
       * @returns {boolean}
       */
      function isActive(type, $index) {
        return scope.active[type] == $index;
      }

      /**
       * 선택된 character와 background로 canvas에 그림.
       * @private
       */
      function _draw() {
        var character = scope.characters[scope.active.character];
        var background = scope.backgrounds[scope.active.background];

        CharacterImage.getCROSImage(character)
          .then(function(image) {
            _context.fillStyle = background;
            _context.fillRect(0, 0, 130, 130);

            _context.drawImage(image, 0, 0, 130, 130);

            scope.imageData.value = _jqCanvas[0].toDataURL();
          });
      }
    }
  }
})();
