/**
 * @fileoverview file directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('file', file);

  function file() {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        fileType: '=',
        fileData: '=',
        fileQuery: '='
      },
      link: link,
      templateUrl : 'app/right/file/file.html',
      controller: 'FileCtrl'
    };

    function link(scope, el) {
      var extendMenu = el.find('.file-menu');
      var toggleMenu;

      // ���� ����, ���, �ٿ�ε�, ���� �޴���ư�� click event handling
      extendMenu
        .on('click', function(event) {
          event.stopPropagation();

          toggleMenu = !toggleMenu;
          toggleMenu ? extendMenu.addClass('open') : extendMenu.removeClass('open');
        })
        .on('click', 'a.share-file,a.focus-comment-file,a.download-file,a.delete-file', function(event) {
          var selector;

          selector = event.currentTarget.className;
          if (selector ==='share-file') {
            scope.onClickShare();
          } else if (selector === 'focus-comment-file') {
            scope.setCommentFocus();
          } else if (selector === 'delete-file') {
            scope.onFileDeleteClick();
          }

          toggleMenu = true;
        });
    }
  }
})();
