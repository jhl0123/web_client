/**
 * @fileoverview union 에서 사용할 토픽 선택 셀렉트 박스 + 생성 버튼 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectUnionSelectboxRoom', jndConnectUnionSelectboxRoom);

  function jndConnectUnionSelectboxRoom($timeout, JndConnect, EntityHandler, TopicFolderModel, currentSessionHelper,
                                        BotList, CoreUtil, RoomTopicList, RoomChatDmList) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        model: '=jndDataModel'
      },
      templateUrl: 'app/connect/union/common/selectbox-room/jnd.connect.union.selectbox.room.html',
      link: link
    };

    function link(scope, el, attrs) {
      var _timer;
      scope.openTopicCreateModal = JndConnect.openTopicCreateModal;

      _init();

      /**
       * 초기화 메서드
       * @private
       */
      function _init() {
        _setList();
        scope.model = scope.model || currentSessionHelper.getCurrentEntityId();
        scope.selectedValue = scope.model;
        scope.$watch('model', _onModelChange);
        scope.$watch('selectedValue', _onSelectedValueChange);
        scope.$on('topic-folder:update', _onUpdate);
      }

      /**
       * folder 가 update 되었을 때
       * @private
       */
      function _onUpdate() {
        $timeout.cancel(_timer);
        _timer = $timeout(_setList, 50);
      }

      /**
       * 업데이트된 리스트를 반영한다.
       * @private
       */
      function _setList() {
        var jandiBot = BotList.getJandiBot();
        var list = RoomTopicList.toJSON(true);

        list = _.filter(list, function(entity) {
          return _isTopic(entity);
        });

        //entityId 가 존재할 경우에만 jandiBot 을 노출한다.
        if (CoreUtil.pick(jandiBot, 'entityId')) {
          list.push(jandiBot);
        }

        scope.list = TopicFolderModel.getNgOptions(list);
      }

      /**
       * entity 가 topic 인지 여부를 반환한다.
       * @param {object} entity
       * @returns {boolean}
       * @private
       */
      function _isTopic(entity) {
        return entity.type === 'privategroups' || entity.type === 'channels';
      }

      /**
       * 선택된 값 변경시 콜백
       * topic 이 아닐 경우 entityId 를 model 에 세팅한다.
       * @param {number} newValue
       * @private
       */
      function _onSelectedValueChange(newValue) {
        var entity = EntityHandler.get(newValue);

        if (entity) {
          if (RoomTopicList.isExist(entity.id)) {
            scope.model = newValue;
          } else if (entity.entityId) {
            scope.model = entity.entityId;
          }
        }
      }

      /**
       * model 값 변경시 콜백
       * topic 이 아닐 경우 id 를 selectedValue 에 세팅한다.
       * @param {number} newValue
       * @private
       */
      function _onModelChange(newValue) {
        var entity = EntityHandler.get(newValue);
        if (entity) {
          if (RoomChatDmList.isExist(entity.id)) {
            scope.selectedValue = entity.extMember.id;
          } else {
            scope.selectedValue = entity.id;
          }
        }
      }
    }
  }
})();
