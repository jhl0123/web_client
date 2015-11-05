/**
 * @fileoverview 토픽 폴더 모델. data model 과 api 의 다리 역할을 한다.
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TopicFolderModel', TopicFolderModel);

  function TopicFolderModel($q, $filter, $timeout, memberService, EntityMapManager, jndPubSub, TopicFolderAPI,
                            JndTopicFolderStorage, currentSessionHelper, Dialog, JndUtil) {
    var _raw = {
      folderList: [],
      folderMap: {},
      entityList: [],
      entityMap: {}
    };
    var FOLDER_NAME = $filter('translate')('@folder-new');
    var _folderData = {};
    var _folderList = [];

    this.create = create;
    this.push = push;
    this.remove = remove;
    this.modify = modify;
    this.merge = merge;
    this.update = update;
    this.load = load;
    this.reload = reload;
    this.getFolderData = getFolderData;
    this.setCurrentEntity = setCurrentEntity;
    this.getEntityMap = getEntityMap;
    this.getFolderMap = getFolderMap;
    this.getNgOptions = getNgOptions;

    /**
     * 익명 폴더 이름을 생성한다.
     * @returns {string}
     * @private
     */
    function _getAnonymousFolderName() {
      var nameList = [];
      var suffix = 0;
      var folderName = FOLDER_NAME;

      _.forEach(_raw.folderList, function(folder) {
        nameList.push(folder.name);
      });

      while (nameList.indexOf(folderName) !== -1) {
        suffix++;
        folderName = FOLDER_NAME + ' ' + suffix;
      }

      return folderName;
    }


    /**
     * 폴더를 생성한다.
     * @param {boolean} isRename - 생성하며 rename 모드로 진입할지 여부
     */
    function create(isRename) {
      var folderName = _getAnonymousFolderName();
      TopicFolderAPI.create(memberService.getTeamId(), folderName)
        .success(_.bind(_onCreateSuccess, null, isRename))
        .error(_onCreateFailed);
    }

    /**
     * 두 폴더를 합치며 생성한다.
     * @param {Array} entities - 합칠 entity id 리스트
     * @param {Boolean} isRename - 생성하며 rename 모드로 진입할지 여부
     * @returns {*}
     */
    function merge(entities, isRename) {
      var teamId = memberService.getTeamId();
      var folderName = _getAnonymousFolderName();
      return TopicFolderAPI.merge(teamId, folderName, entities)
        .success(_.bind(_onCreateSuccess, null, isRename))
        .error(_onCreateFailed);
    }

    /**
     * 생성 API 실패시 핸들러
     * @param {object} response - response 데이터
     * @private
     */
    function _onCreateFailed(response) {
      if (response.code === 40008) {
        Dialog.alert({
          body: $filter('translate')('@folder-name-taken')
        });
      } else {
        //todo: general error
        JndUtil.alertUnknownError(response);
      }
      reload();
    }

    /**
     * 생성 API 성공 핸들러
     * @param {boolean} isRename - rename 할지 여부
     * @param {object} response - 응답값
     * @private
     */
    function _onCreateSuccess(isRename, response) {
      reload().then(function() {
        if (isRename) {
          $timeout(function () {
            jndPubSub.pub('topic-folder:rename', response.folderId);
          });
        }
      });
    }

    /**
     * 폴더를 삭제한다.
     * @param {number} folderId
     */
    function remove(folderId) {
      _remove(folderId);
      TopicFolderAPI.remove(memberService.getTeamId(), folderId)
        .error(function() {
          //todo: 삭제 실패
          reload();
        });
    }

    /**
     * view 의 폴더를 삭제한다.
     * @param {number} folderId
     * @private
     */
    function _remove(folderId) {
      _.forEach(_raw.entityList, function(entity) {
        if (entity.folderId === folderId) {
          entity.folderId = -1;
        }
      });
      _.forEach(_raw.folderList, function(folder, index) {
        if (folder.id === folderId) {
          _raw.folderList.splice(index, 1);
          return false;
        }
      });
      JndTopicFolderStorage.removeOpenStatus(folderId);
      update();
    }

    /**
     * updateItems 정보에 따라 폴더의 정보를 수정한다.
     * @param {number} folderId - 수정할 폴더 ID
     * @param {object} updateItems - 수정할 정보들
     */
    function modify(folderId, updateItems) {
      var seq = updateItems.seq;
      var name = updateItems.name;
      var targetFolder = _raw.folderMap[folderId];
      var teamId = memberService.getTeamId();

      //이름 변경건이 있을 경우.
      if (name) {
        if (targetFolder.name === name) {
          delete updateItems.name;
        } else {
          targetFolder.name = name;
        }
      }

      //sequence 변경건이 있을 경우.
      if (seq) {
        seq = parseInt(seq, 10) - 0.5;
        targetFolder.seq = targetFolder.seq < seq ? seq + 1 : seq;
        _raw.folderList = _.sortBy(_raw.folderList, 'seq');
        _.forEach(_raw.folderList, function(folder, index) {
          folder.seq = index + 1;
        });
      }

      update();

      if (!_.isEmpty(updateItems)) {
        TopicFolderAPI.modify(teamId, folderId, updateItems)
          .error(_onModifyError);
      }
    }

    /**
     * 수정 API 오류 발생 시 핸들러
     * @param {Object} response
     * @private
     */
    function _onModifyError(response) {
      //중복된 이름 존재
      if (response.code === 40008) {
        Dialog.alert({
          body: $filter('translate')('@folder-name-taken')
        });
        //alert($filter('translate')('@folder-name-taken'));
      } else {
        JndUtil.alertUnknownError(response);
      }
      reload();
    }

    /**
     * folderId 에 해당하는 entityList 를 반환한다.
     * @param {number} folderId
     * @returns {Array}
     */
    function _getEntityList(folderId) {
      var currentEntity = currentSessionHelper.getCurrentEntity();
      var entityList = [];
      var tempEntity;

      _.forEach(_raw.entityList, function(entity) {
        if (entity.folderId === folderId) {
          tempEntity = EntityMapManager.get('total', entity.roomId);
          if (tempEntity) {
            tempEntity.extIsCurrent = (+tempEntity.id === +(currentEntity && currentEntity.id));
            tempEntity.extFolderId = folderId;
            tempEntity.extHasFolder = (folderId !== -1);
            entityList.push(tempEntity);
          }
        }
      });
      return entityList;
    }

    /**
     * selectbox 에서의 토픽 그룹핑 제공을 위해
     * entities 배열을 받아 ngOptions 에서 활용할 수 있도록 추가 정보를 덧붙인다.
     * @param entities
     * @returns {Array|{criteria, index, value}|*}
     */
    function getNgOptions(entities) {
      _.forEach(entities, function(entity)  {
        var folderId = entity.extFolderId;
        var folder = _raw.folderMap[folderId];
        if (folder) {
          entity.extGroupName = '[' + folder.name + ']';
          entity.extSeq = folder.seq;
        } else {
          entity.extGroupName = entity.typeCategory;
          entity.extSeq = _raw.folderList.length + 1;
        }
      });
      entities = _.sortBy(entities, 'extSeq');
      return entities;
    }

    /**
     * 폴더 리스트를 반환한다.
     * @returns {Array|{criteria, index, value}}
     */
    function getFolderList() {
      return _folderList;
    }

    /**
     * 폴더 데이터를 반환한다.
     * @returns {{}}
     */
    function getFolderData() {
      return _folderData;
    }

    /**
     * folder 관련 정보를 모두 조회한다.
     * @returns {Promise}
     */
    function load() {
      return $q.all([
        TopicFolderAPI.getFolders().then(function(result) {
          _raw.folderList = result.data;
          _raw.folderMap = _.indexBy(_raw.folderList, 'id');
        }),
        TopicFolderAPI.getEntities().then(function(result) {
          _raw.entityList = result.data;
          _raw.entityMap = _.indexBy(_raw.entityList, 'id');
        })
      ]);
    }

    /**
     * folder 의 id 로 mapping 된 정보를 반환한다.
     * @returns {_raw.folderMap|{}}
     */
    function getFolderMap() {
      return _raw.folderMap;
    }

    /**
     * entity 의 id 로 mapping 된 정보를 반환한다.
     * @returns {_raw.entityMap|{}}
     */
    function getEntityMap() {
      return _raw.entityMap;
    }

    /**
     * folder 관련 정보를 조회하고 view 에 반영한다.
     * @returns {*}
     */
    function reload() {
      return load().then(function() {
        update();
      });
    }

    /**
     * currentEntity 값을 설정한다.
     * @param {number} entityId
     */
    function setCurrentEntity(entityId) {
      _.forEach(_folderList, function(folder) {
        var isCurrent = false;
        _.forEach(folder.entityList, function(entity) {
          entity.extIsCurrent = (+entity.id === +entityId);
          if (entity.extIsCurrent) {
            isCurrent = true;
          }
        });
        folder.isCurrent = isCurrent;
      });
    }

    /**
     * raw 데이터를 기반으로 view 에 반영하기 위한 데이터를 가공한다.
     */
    function update() {
      var currentEntity = currentSessionHelper.getCurrentEntity();
      _folderList = _.sortBy(_raw.folderList, 'seq');

      _.forEach(_folderList, function(folder) {
        folder.entityList = _getEntityList(folder.id);
        folder.isCurrent = _.findIndex(folder.entityList, {extIsCurrent: true}) !== -1;
      });

      _folderData.folderList = _folderList;
      _folderData.folderList.push({
        name: '',
        id: -1,
        seq: _folderData.folderList.length + 1,
        entityList: _getEntityList(-1)
      });

      jndPubSub.pub('topic-folder:update', _folderData);
      //update digest 가 끝난 이후 badge position 을 업데이트 해야하기 때문에 timeout 을 준다.
      $timeout(function() {
        jndPubSub.updateBadgePosition();
      }, 100);
    }

    /**
     * 폴더에 entity 를 추가한다.
     * @param {number} folderId
     * @param {number} entityId
     */
    function push(folderId, entityId) {
      var teamId = memberService.getTeamId();
      var isPop = (folderId === -1);
      _.forEach(_raw.entityList, function(entity) {
        if (entity.roomId === entityId) {
          if (isPop) {
           folderId = entity.folderId;
           entity.folderId = -1;
          } else {
           entity.folderId = folderId;
          }
          return false;
        }
      });
      update();

      if (isPop) {
        TopicFolderAPI.pop(teamId, folderId, entityId);
      } else {
        TopicFolderAPI.push(teamId, folderId, entityId).
          error(_onPushError);
      }
    }

    /**
     * push 메서드 실패시 이벤트 핸들러
     * @param {object} response
     * @private
     */
    function _onPushError(response) {
      if (response) {
        if (response.code === 40016) {
          Dialog.alert({
            body: $filter('translate')('@folder-item-already-exists')
          });
        } else {
          JndUtil.alertUnknownError(response);
        }
      }
      reload();
    }
  }
})();
