/**
 * @fileoverview team invite modal directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('invitationModal', invitationModal);

  function invitationModal($filter, clipboard) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el) {
      var done = $filter('translate')('@common-done');

      var jqInviteLink = el.find('#invite-link');

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _on();

        // clipboard 제공하지 않음
        scope.isSupportClip = clipboard.support;

        if (!scope.inviteDisabled) {
          // 팀초대가 활성화 되어 있음

          scope.setInviteBtnText = setInviteBtnText;
          setInviteBtnText([]);

          scope.isCopySuccess = false;
          _setClipBtn();
        }
      }

      /**
       * on listeners
       * @private
       */
      function _on() {
        el.on('click', '.modal-body', _onModalBodyClick);

        if (!scope.isSupportClip) {
          jqInviteLink
            .on('click', _onInviteLinkClick)
            .on('blur', _onInviteLinkBlur);
        }
      }

      /**
       * click event handler
       * @private
       */
      function _onModalBodyClick() {
        $('#email-input').focus();
      }

      /**
       * 초대 메일 보내기 버튼 설정함.
       * @param {array} $list
       */
      function setInviteBtnText($list) {
        var jqInviteButton = el.find('#team-invite-btn');
        var length =  $list.length;

        if (length > 0) {
          jqInviteButton
            .removeAttr('disabled')
            .removeClass('disabled')
            .text($filter('translate')('@team-invite-send').replace('{{inviteeNumber}}', length));
        } else {
          jqInviteButton
            .attr('disabled', true)
            .addClass('disabled')
            .text($filter('translate')('@btn-invite'));
        }
      }

      /**
       * 클립보드에 URI 붙여넣기하는 버튼 설정함.
       * @private
       */
      function _setClipBtn() {
        var jqClipButton = el.find('.clip-invite');

        jqClipButton
          .on('mousedown', function () {
            jqClipButton.addClass('active');
          })
          .on('mouseup', function () {
            jqClipButton.removeClass('active');
          })
          .on('mouseleave', function () {
            jqClipButton.removeClass('active');
          });

        if (!scope.disableSeedUri) {
          clipboard.createInstance(jqClipButton, {
            getText: function() {
              scope.isCopySuccess = true;
              return jqInviteLink.val();
            }
          });
        }
      }

      /**
       * invite link click event handler
       * @private
       */
      function _onInviteLinkClick() {
        var element = this;
        scope.$apply(function() {
          scope.isLinkTextFocus = true;
          element.select();
        });
      }

      /**
       * invite link blur event handler
       * @private
       */
      function _onInviteLinkBlur() {
        scope.$apply(function() {
          scope.isLinkTextFocus = false;
        });
      }
    }
  }
})();
