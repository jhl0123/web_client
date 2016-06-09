/**
 * @fileoverview file detail의 shared directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailShared', fileDetailMeta);

  /* @ngInject */
  function fileDetailMeta($filter, $state, $timeout, AnalyticsHelper, analyticsService, Dialog, EntityHandler,
                          entityheaderAPIservice, fileAPIservice, jndPubSub, RoomTopicList) {
    return {
      require: '^fileDetailContent',
      restrict: 'E',
      replace: true,
      templateUrl : 'app/right/file-detail/shared/file.detail.shared.html',
      link: link
    };

    function link(scope, el, attrs, ctrl) {
      var _unsharedForMe;

      // 공유 토픽을 가지고 있는지 여부
      scope.hasTopic = undefined;

      scope.onClickSharedEntity = onClickSharedEntity;
      scope.onClickUnshare = onClickUnshare;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        if (!scope.isInvalidRequest) {
          _setShared();

          _attachEvents();
        }
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$on('jndWebSocketFile:fileShared', _onFileShared);
        scope.$on('jndWebSocketFile:fileUnshared', _onFileUnshared);

        scope.$on('onChangeShared', _onChangeShared);

        scope.$watch('file', _onChangeFile);
      }

      /**
       * shared entity 클릭시 이벤트 핸들러
       * @param {object} entityId
       */
      function onClickSharedEntity(entity) {
        var entityId = entity.id;
        var entityType = entity.type;

        if (entityType === 'users' || entityType === 'bots') {
          _goDm(entityId);
        } else {
          var targetEntity = EntityHandler.get(entityId);

          if (RoomTopicList.isJoined(entityId)) {
            _goTopic(targetEntity);
          } else {
            _goWithJoinTopic(entityId);
          }
        }
      }

      /**
       * go dm
       * @param {number|string} entityId
       * @private
       */
      function _goDm(entityId) {
        $state.go('archives', {entityType: 'users', entityId: entityId});
      }

      /**
       * joined topic and go
       * @param {number|string} entityId
       * @private
       */
      function _goWithJoinTopic(entityId) {
        entityheaderAPIservice.joinChannel(entityId)
          .success(function() {
            $state.go('archives', {entityType: 'channels',  entityId: entityId });
          });
      }

      /**
       * go public topic
       * @param {object} targetEntity
       * @private
       */
      function _goTopic(targetEntity) {
        $state.go('archives', { entityType: targetEntity.type, entityId: targetEntity.id });
      }

      /**
       * 공유 해제 click event handler
       * @param {object} entity
       */
      function onClickUnshare(entity) {
        var file = scope.file;

        fileAPIservice.unShareEntity(file.id, entity.id)
          .success(_onSuccessUnshared);
      }

      /**
       * on success unshared
       * @private
       */
      function _onSuccessUnshared() {
        _unsharedForMe = true;
        _analyticsUnshared();
      }

      /**
       * file이 공유된 topic명 설정한다.
       */
      function _setShared() {
        var file = scope.file;

        file.extShared = fileAPIservice.updateShared(file);
        scope.hasTopic = !!file.extShared.length;

        // extShared에 값이 설정되고 rendering이 완료된 다음 file detail body element의 높이값을 재설정 해야한다.
        $timeout(function() {
          ctrl.resizeFileDetailBody();
          ctrl.setCommentInputLayout();
        });
      }

      /**
       * file shared event handler
       * @param {object} $event
       * @param {object} data
       * @private
       */
      function _onFileShared($event, data) {
        var file = scope.file;

        if (data.file.id == file.id) {
          jndPubSub.pub('fileDetail:updateFile');
        }
      }

      /**
       * file unshared event handler
       * @param {object} $event
       * @param {object} data
       * @private
       */
      function _onFileUnshared($event, data) {
        var file = scope.file;

        if (data.file.id == file.id) {
          jndPubSub.pub('fileDetail:updateFile');
        }
      }

      /**
       * file object 갱신 event handler
       * @param {object} newFile
       * @param {object} oldFile
       * @private
       */
      function _onChangeFile(newFile, oldFile) {
        if (newFile && oldFile !== newFile) {
          // 공유된 room 갱신
          _setShared();

          if (_unsharedForMe) {
            // unshared된 다음 바로 list가 갱신되지 않기때문에 unshared되고 file detail이 새로 생성된 다음 dialog.success를 호출함
            Dialog.success({
              title: $filter('translate')('@success-file-unshare').replace('{{filename}}', newFile.content.title)
            });
          }

          _unsharedForMe = false;
        }
      }

      /**
       * 공유 된 topic 변경 event handler
       * @param angularEvent
       * @param data
       * @private
       */
      function _onChangeShared(angularEvent, data) {
        var shareEntities = scope.file.shareEntities;

        if (data && shareEntities.length === 1 &&
          ((data.event === "topic_deleted" && shareEntities[0] === data.room.id) || (data.type === 'delete' && shareEntities[0] === data.id))) {
          // archived file 이고 event type이 'topic_deleted' 또는 shared 'delete' 일때
          // 마지막으로 공유된 토픽이 삭제되는 것이라면 공유 토픽을 가지지 않은 것으로 표기함
          scope.hasTopic = false;
        } else {
          // topic이 삭제되어 leftside menu가 update되어야 사용자에게 update된 file detail을 보여줄 수 있다.
          setTimeout(function() {
            jndPubSub.pub('fileDetail:updateFile');
          }, 800);
        }
      }

      function _analyticsUnshared() {
        // 곧 지워짐
        var share_target = "";
        switch (entity.type) {
          case 'channel':
            share_target = "topic";
            break;
          case 'privateGroup':
            share_target = "private group";
            break;
          case 'user':
            share_target = "direct message";
            break;
          default:
            share_target = "invalid";
            break;
        }
        var file_meta = (file.content.type).split("/");
        var share_data = {
          "entity type": share_target,
          "category": file_meta[0],
          "extension": file.content.ext,
          "mime type": file.content.type,
          "size": file.content.size
        };
        analyticsService.mixpanelTrack( "File Unshare", share_data );

        try {
          //analytics
          AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_UNSHARE, {
            'RESPONSE_SUCCESS': true,
            'FILE_ID': file.id,
            'TOPIC_ID': entity.id
          });
        } catch (e) {
        }
      }
    }
  }
})();
