/**
 * @fileoverview 토픽 폴더 모델. data model 과 api 의 다리 역할을 한다.
 * @author Young Park <young.park@tosslab.com>
 * @todo:
 * load() 가 반복적으로 호출되는 오류 현상 해결 이후
 * load(), reload() 메서드와 topic.folder.api.service.js 의 trackingCode 제거
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TopicFolderModel', TopicFolderModel);

  function TopicFolderModel($rootScope, $q, $filter, $timeout, memberService, jndPubSub, TopicFolderAPI, RoomTopicList,
                            JndTopicFolderStorage, currentSessionHelper, Dialog, JndUtil, TopicInvitedFlagMap) {
    var _raw = {
      folderList: [],
      folderMap: {},
      entityList: [],
      entityMap: {}
    };
    var FOLDER_NAME = $filter('translate')('@folder-new');
    var _folderData = {};
    var _folderList = [];
    var _deferred;
    var _scope = $rootScope.$new(true);

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

    _init();

    /**
     * 초기화
     * @private
     */
    function _init() {
      _scope.$on('RoomTopicList:changed', update);
    }

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
     * @param {number} status - http status
     * @private
     */
    function _onCreateFailed(response, status) {
      if (response.code === 40008) {
        Dialog.alert({
          body: $filter('translate')('@folder-name-taken')
        });
      } else {
        //todo: general error
        JndUtil.alertUnknownError(response, status);
      }
      reload('createFailed');
    }

    /**
     * 생성 API 성공 핸들러
     * @param {boolean} isRename - rename 할지 여부
     * @param {object} response - 응답값
     * @private
     */
    function _onCreateSuccess(isRename, response) {
      reload('createSuccess').then(function() {
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
          reload('removeFailed');
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
     * @param {number} status - http status
     * @private
     */
    function _onModifyError(response, status) {
      //중복된 이름 존재
      if (response.code === 40008) {
        Dialog.alert({
          body: $filter('translate')('@folder-name-taken')
        });
      } else {
        JndUtil.alertUnknownError(response, status);
      }
      reload('modifyError');
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
          tempEntity = RoomTopicList.get(entity.roomId, true);
          if (tempEntity) {
            tempEntity.extIsCurrent = (+tempEntity.id === +(currentEntity && currentEntity.id));
            tempEntity.extFolderId = folderId;
            tempEntity.extHasFolder = (folderId !== -1);
            tempEntity.extHasInvitedFlag = TopicInvitedFlagMap.isInvited(entity.roomId);
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
          entity.extSeq = folder.seq;
        } else {
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
     * @param {string} [trackingCode] - 오류 현상 파악을 위해 임시로 트레킹 코드를 추가한다.
     * @returns {Promise}
     */
    function load(trackingCode) {
      if (_deferred) {
        _deferred.resolve();
      }
      _deferred = $q.defer();
      var promises = [];
      var teamId = memberService.getTeamId();
      promises.push(TopicFolderAPI.getFolders(teamId, _deferred, trackingCode));
      promises.push(TopicFolderAPI.getEntities(teamId, _deferred, trackingCode));

      return $q.all(promises)
        .then(_onSuccessLoad, _onErrorLoad);
    }

    /**
     * load fail 시 이벤트 핸들러
     * @private
     */
    function _onErrorLoad(results) {
      return $q.reject('load error');
    }

    /**
     * load 성공시 이벤트 핸들러
     * @param {Array} results
     * @returns {*}
     * @private
     */
    function _onSuccessLoad(results) {
      _onSuccessGetFolders(results[0].data);
      _onSuccessGetEntities(results[1].data);
      return _deferred;
    }

    /**
     * folder 정보 조회 성공 콜백
     * @param {object} response
     * @private
     */
    function _onSuccessGetFolders(response) {
      _raw.folderList = response;
      _raw.folderMap = _.indexBy(_raw.folderList, 'id');
    }

    /**
     * entity 정보 조회 성공 콜백
     * @param response
     * @private
     */
    function _onSuccessGetEntities(response) {
      _raw.entityList = response;
      _raw.entityMap = _.indexBy(_raw.entityList, 'id');
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
     * @param {string} trackingCode 임시 트레킹 코드
     * @returns {*}
     */
    function reload(trackingCode) {
      return load('reload:' + trackingCode).then(function() {
        update();
      }, null);
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
      _setUnassignedTopic();
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
     * folder 정보가 없는 토픽 대상으로 folderId 를 -1 로 할당한다. 
     * @private
     */
    function _setUnassignedTopic() {
      var roomIds = _.pluck(_raw.entityList, 'roomId');
      var joinedTopics = RoomTopicList.toJSON(true);
      
      _.forEach(joinedTopics, function(topic) {
        if (!_.contains(roomIds, topic.id)) {
          _raw.entityList.push({
            roomId: topic.id,
            folderId: -1
          });
        }
      });
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
     * @param {number} status
     * @private
     */
    function _onPushError(response, status) {
      if (response) {
        if (response.code === 40016) {
          Dialog.alert({
            body: $filter('translate')('@folder-item-already-exists')
          });
        } else {
          JndUtil.alertUnknownError(response, status);
        }
      }
      reload('pushError');
    }
  }
})();
