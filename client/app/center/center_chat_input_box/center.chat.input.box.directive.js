(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerChatInputBox', centerChatInputBox);

  function centerChatInputBox(integrationService, configuration) {
    var multiple = true;    // multiple upload 여부

    return {
      restrict: 'E',
      scope: false,
      link: link,
      replace: true,
      templateUrl: 'app/center/center_chat_input_box/center.chat.input.box.html'
    };

    function link(scope, element, attrs) {
      var menu = element.find('#integration-menu');
      var primaryFileBtn = element.children('#primary_file_button');
      var uploadMap = {
        'computer': function() {
          $('<input type="file" ' + (multiple ? 'multiple' : '') + ' />')
            .on('change', function(evt) {
              scope.onFileSelect(evt.target.files);
            })
            .trigger('click');
        },
        'google-drive': function() {
          integrationService.createGoogleDrive(scope, {multiple: multiple});
        },
        'dropbox': function(evt) {
          integrationService.createDropBox(scope, {multiple: multiple, event: evt});
        }
      };

      menu
        .on('click', 'li', function(evt) {
          var className = this.className;
          var fn;

          if (fn = uploadMap[className]) {
            fn(evt);
          }
        });

      // file upload menu의 각 item image pre-load
      var iconGoogleDrive = new Image();
      var iconDropbox = new Image();

      iconGoogleDrive.src = configuration.assets_url + '../assets/images/icon_google_drive.png';
      iconDropbox.src = configuration.assets_url + '../assets/images/icon_dropbox.png';

      menu.find('.icon-google-drive').css({backgroundImage: iconGoogleDrive.src});
      menu.find('.icon-dropbox').css({backgroundImage: iconDropbox.src});
    }
  }
})();
