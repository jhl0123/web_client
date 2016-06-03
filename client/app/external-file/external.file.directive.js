/**
 * @fileoverview external share view 디렉티브
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .directive('externalFile', externalFile);

  function externalFile($filter, memberService, ExternalFile, Dialog, jndPubSub, JndUtil, currentSessionHelper) {
    return {
      restrict: 'A',
      scope: {
        fileData: '=',
        fileId: '@'
      },
      link: link
    };
    
    function link(scope, el, attrs) {
      // team id
      var _teamId = attrs.teamId || memberService.getTeamId();

      _init();
      
      /**
       * init
       * @private
       */
      function _init() {
        _attachDomEvents();
        _attachScopeEvents();
      }

      /**
       * scope 이벤트를 바인딩한다.
       * @private
       */
      function _attachScopeEvents() {
        scope.$on('jndWebSocketFile:externalFileShared', _onExternalFileStatusChange);
        scope.$on('jndWebSocketFile:externalFileUnShared', _onExternalFileStatusChange);
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        el.on('click', _onClick);
      }

      /**
       * click 이벤트 리스너
       * @private
       */
      function _onClick() {
        if (scope.fileData.externalShared) {
          JndUtil.safeApply(scope, function() {
            ExternalFile.openUnshareDialog(function(type) {
              type === 'okay' && _setExternalUnshare();
            });
          });
        } else {
          _setExternalShare();
        }
      }

      /**
       * 외부 파일 공유 상태 변경 소켓 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} socketEvent
       * @private
       */
      function _onExternalFileStatusChange(angularEvent, socketEvent) {
        if (socketEvent.data.messageId === scope.fileId) {
          _.extend(scope.fileData, socketEvent.data.fileData);
        }
      }

      /**
       * external share 설정한다.
       * @private
       */
      function _setExternalShare() {
        var fileId = scope.$eval(attrs.fileId);

        ExternalFile.share(fileId, _teamId)
          .success(_onExternalShareSuccess);
      }

      /**
       * exteral share success
       * @param {object} data
       * @private
       */
      function _onExternalShareSuccess(data) {
        _setExternalContent(data);

        ExternalFile.openShareDialog(data.content, true);
      }

      /**
       * external unshare 설정한다.
       * @private
       */
      function _setExternalUnshare() {
        var fileId = scope.$eval(attrs.fileId);

        ExternalFile.unshare(fileId, _teamId)
          .success(_onExternalUnshareSuccess);
      }

      /**
       * external unshare success
       * @param {object} data
       * @private
       */
      function _onExternalUnshareSuccess(data) {
        _setExternalContent(data);

        Dialog.success({
          title: $filter('translate')('@external-share-remove-msg')
        });
      }
  
      /**
       * external content를 설정한다.
       * @param {object} data
       * @private
       */
      function _setExternalContent(data) {
        data.roomId = currentSessionHelper.getCurrentEntityId();
        scope.fileData.externalUrl = data.content.externalUrl;
        scope.fileData.externalCode = data.content.externalCode;
        scope.fileData.externalShared = data.content.externalShared;        
        jndPubSub.pub('externalFile:fileShareChanged', data);
      }
    }
  }
})();
