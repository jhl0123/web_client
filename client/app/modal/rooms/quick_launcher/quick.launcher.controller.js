/**
 * @fileoverview quick launcher controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('QuickLauncherCtrl', QuickLauncherCtrl);

  /* @ngInject */
  function QuickLauncherCtrl($scope, $state, $filter, UnreadBadge, EntityHandler, centerService, memberService,
                             currentSessionHelper, entityheaderAPIservice, jndPubSub, modalHelper, BotList,
                             RoomTopicList, AnalyticsHelper) {
    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.list = [];
      
      $scope.openCreateTopicModal = openCreateTopicModal;
      $scope.openBrowseTopicModal = openBrowseTopicModal;

      $scope.getMatches = getMatches;
      $scope.getRooms = getRooms;
      $scope.getFilteredRooms = getFilteredRooms;

      $scope.onRoomSelect = onRoomSelect;
    }

    /**
     * open create topic modal
     * @param {string} query - 토픽 생성 모달 오픈시 설정될 토픽명
     */
    function openCreateTopicModal(query) {
      modalHelper.openTopicCreateModal({
        topicName: query
      });
    }

    /**
     * open browse topic modal
     */
    function openBrowseTopicModal() {
      modalHelper.openTopicJoinModal();
    }

    /**
     * list에서 filter된 list를 전달한다.
     * @param {array} list
     * @param {string} value
     * @returns {*}
     */
    function getMatches(list, value) {
      var matches = value === '' ? getRooms() : getFilteredRooms(value);

      if (value !== '' && matches.length === 0) {
        $scope.isEmptyMatches = true;
      } else {
        $scope.isEmptyMatches = false;
      }

      return matches;
    }

    /**
     * room select event handler
     * @param {object} room
     */
    function onRoomSelect(room) {
      if (currentSessionHelper.getCurrentEntityId() === room.id) {
        // 현재 room과 같은 room인 경우

        modalHelper.closeModal();
      } else {
        if (room.type === 'channels') {
          if (RoomTopicList.get(room.id, true)) {
            // join한 topic

            AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_JOIN, {
              ERROR_CODE: ''
            });

            _joinRoom(room);
          } else {
            if (!$scope.isLoading) {
              jndPubSub.showLoading();

              entityheaderAPIservice.joinChannel(room.id)
                .success(function () {
                  AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_ENTER);

                  _joinRoom(room);
                })
                .finally(function() {
                  jndPubSub.hideLoading();
                });
            }
          }
        } else {
          _joinRoom(room);
        }
      }
    }

    /**
     * join room
     * @param room
     * @private
     */
    function _joinRoom(room) {
      var entityType = memberService.isBot(room.id) ? 'users' : room.type;
      modalHelper.closeModal();
      $state.go('archives', {entityType: entityType, entityId: room.id});
    }

    /**
     * filter 되지 않은 room list를 전달한다.
     * @returns {*|Array}
     */
    function getRooms() {
      var hasBadgeRooms = _getHadBadgeRooms();
      var resentWorkRooms = _getResentWorkRooms();
      var hasBadgeRoomsBeginIndex = 0;
      var resentWorkRoomBeginIndex = 0;
      var rooms = _.uniq([].concat(hasBadgeRooms, resentWorkRooms), function (room) {
        room.count == null ? resentWorkRoomBeginIndex++ : hasBadgeRoomsBeginIndex++;
        return room.id;
      });

      _setJumpListIndexs(hasBadgeRoomsBeginIndex, resentWorkRoomBeginIndex);

      return rooms;
    }

    /**
     * badge를 가진 room list를 전달한다.
     * @returns {Array|{criteria, index, value}}
     * @private
     */
    function _getHadBadgeRooms() {
      var unreadBadgeMap = UnreadBadge.get();
      var rooms = [];
      var room;
      var entity;
      var e;

      for (e in unreadBadgeMap) {
        if (unreadBadgeMap.hasOwnProperty(e)) {
          entity = EntityHandler.get(unreadBadgeMap[e].id);
          if (entity) {
            room = {
              type: entity.type,
              id: entity.id,
              name: entity.name,
              count: entity.alarmCnt
            };

            if (memberService.isMember(entity.id)) {
              room.profileImage = memberService.getProfileImage(entity.id);
              room.priority = 1;
            } else {
              room.priority = 2;
            }

            rooms.push(room);
          }
        }
      }

      return rooms.sort(function (value1, value2) {
        var result = _comparePriority(value1, value2);
        return result === 0 ? _compareName(value1, value2) : result;
      });
    }

    /**
     * compare priority
     * @param {object} value1
     * @param {object} value2
     * @returns {number}
     * @private
     */
    function _comparePriority(value1, value2) {
      var result = 0;

      if (value1.priority > value2.priority) {
        result = 1;
      } else if (value1.priority < value2.priority) {
        result = -1;
      }

      return result;
    }

    /**
     * compare name
     * @param {object} value1
     * @param {object} value2
     * @returns {boolean}
     * @private
     */
    function _compareName(value1, value2) {
      return value1.name.toLowerCase() > value2.name.toLowerCase();
    }

    /**
     * 최근 방문한 topic list를 전달한다.
     * @returns {Array}
     * @private
     */
    function _getResentWorkRooms() {
      var rooms = [];
      var centerHistory = centerService.getHistory();
      var entity;
      var i;
      var room;

      for (i = centerHistory.length - 1; i > -1; i--) {
        if (entity = EntityHandler.get(centerHistory[i].entityId)) {
          room = {
            type: entity.type,
            id: entity.id,
            name: entity.name
          };

          if (memberService.isMember(entity.id)) {
            room.profileImage = memberService.getProfileImage(entity.id);
          }
          rooms.push(room);
        }
      }

      return rooms;
    }

    /**
     * filter 된 room list를 전달한다.
     * @param {string} value - filter 문자열
     * @returns {Array.<T>}
     */
    function getFilteredRooms(value) {
      var filterText = value || '';
      var enableMembers = _getEnabledMembers(filterText);
      var joinedRooms = _getJoinedRooms(filterText);
      var unjoinedChannels = _getUnJoinedChannels(filterText);

      _setJumpListIndexs(enableMembers.length, joinedRooms.length, unjoinedChannels.length);

      return [].concat( enableMembers, joinedRooms, unjoinedChannels);
    }

    /**
     * enabled member list를 전달한다.
     * @param {string} filterText -  filter 문자열
     * @returns {Array|{criteria, index, value}}
     * @private
     */
    function _getEnabledMembers(filterText) {
      var members = currentSessionHelper.getCurrentTeamUserList();
      var jandiBot = BotList.getJandiBot();

      if (jandiBot) {
        members = members.concat([jandiBot]);
      }

      filterText = filterText.toLowerCase();

      members = $filter('getMatchedList')(members, 'name', filterText, function(item) {
        return !memberService.isDeactivatedMember(item) && memberService.getMemberId() !== item.id
      });

      return $filter('orderByQueryIndex')(members, 'name', filterText);
    }

    /**
     * 참여중인 room list를 전달한다.
     * @param {string} value - filter 문자열
     * @returns {Array|{criteria, index, value}}
     * @private
     */
    function _getJoinedRooms(value) {
      var rooms = [];

      // 참여 channel list filtering
      _.forEach(RoomTopicList.toJSON(true), function(channel) {
        if (channel.name.toLowerCase().indexOf(value.toLowerCase()) > -1) {
          rooms.push({
            type: channel.type,
            id: channel.id,
            name: channel.name,
            count: channel.alarmCnt
          });
        }
      });

      return $filter('orderByQueryIndex')(rooms, 'name', value.toLowerCase());
    }

    /**
     * 참여하지 않은 channel list를 전달한다.
     * @param {string} value - filter 문자열
     * @returns {Array|{criteria, index, value}}
     * @private
     */
    function _getUnJoinedChannels(value) {
      var channels = [];

      _.forEach(RoomTopicList.toJSON(false), function(channel) {
        if (channel.name.toLowerCase().indexOf(value.toLowerCase()) > -1) {
          channels.push({
            type: channel.type,
            id: channel.id,
            name: channel.name,
            isUnjoinedChannel: true
          });
        }
      });

      return $filter('orderByQueryIndex')(channels, 'name', value.toLowerCase());
    }

    /**
     * item 분류마다 첫 item index를 설정하여 item 분류별 jump가 가능하도록 jump list index를 설정한다.
     * @private
     */
    function _setJumpListIndexs() {
      var jumpListIndexs = $scope.jumpListIndexs = [];
      var args = arguments;

      _.forEach(args, function(value, index) {
        if (value > 0) {
          jumpListIndexs.push((jumpListIndexs[index - 1] || 0) + (args[index - 1] || 0));
        }
      });
    }
  }
})();
