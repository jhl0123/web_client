/**
 * @fileoverview invite topic controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicInviteCtrl', TopicInviteCtrl);

  function TopicInviteCtrl($scope, $rootScope, $modalInstance, currentSessionHelper, entityheaderAPIservice,
                           $state, $filter, RoomTopicList, analyticsService, modalHelper, AnalyticsHelper, jndPubSub,
                           memberService, SearchTypeUser) {
    var msg1;
    var msg2;

    _init();

    /*
     Generating list of users that are not in current channel or private group.
     */
    function _init() {
      $scope.currentEntity = currentSessionHelper.getCurrentEntity();

      generateMemberList();

      $scope.keywordTypes = SearchTypeUser.getFilterTypes();
      $scope.keyword = {
        value: '',
        type: $scope.keywordTypes[0].value
      };

      $scope.hasAllMembers = false;

      if ($scope.activeMembers.length === 1) {
        msg1 = '@emptyMsg-no-team-member-joined';
        msg2 = '@emptyMsg-click-to-invite-to-current-team';
      } else {
        msg1 = '@emptyMsg-everyone-in-current-topic';
        msg2 = '@emptyMsg-invite-not-joined-teammate';
      }

      $scope.inviteTeamMsg1 = $filter('translate')(msg1);
      $scope.inviteTeamMsg2 = $filter('translate')(msg2);

      $scope.getMatches = getMatches;

      $scope.onMemberClick = onMemberClick;
      $scope.onInviteTeamClick = onInviteTeamClick;
      $scope.onSelectAll = onSelectAll;
      $scope.onInviteClick = onInviteClick;
      $scope.cancel = cancel;
      $scope.onKeywordTypeSelect = onKeywordTypeSelect;
    }

    $scope.$on('EntityHandler:parseLeftSideMenuDataDone', _onParseLeftSideMenuDone);

    /**
     * member starred event handler
     * @private
     */
    function _onParseLeftSideMenuDone() {
      generateMemberList();
      _updateMemberList();
    }

    /**
     * set member list
     */
    function generateMemberList() {
      var prevAvailableMemberMap = $scope.availableMemberMap;
      var users = RoomTopicList.getUserIdList($scope.currentEntity.id);

      $scope.availableMemberMap = {};

      // 활성 member list
      $scope.activeMembers = [];

      // 선택 가능한 member list
      $scope.selectingMembers = [];

      $scope.availableMemberList = _.reject(currentSessionHelper.getCurrentTeamUserList(), function(user) {
        var isActiveMember = memberService.isActiveMember(user);

        if (prevAvailableMemberMap && prevAvailableMemberMap[user.id]) {
          user.extSelected = prevAvailableMemberMap[user.id].extSelected;
        }

        if (isActiveMember) {
          $scope.activeMembers.push(user);
        }

        $scope.availableMemberMap[user.id] = user;

        return users.indexOf(user.id) > -1 || !isActiveMember;
      });

      $scope.inviteUsers = _.reject($scope.availableMemberList, function(user) {
        return !!user.extSelected === false;
      });

      $scope.isInviteChannel = $scope.availableMemberList.length !== 0;
      if ($scope.isInviteChannel) {
        // 초대 가능한 member가 존재하므로 topic 초대 process 진행함

        // has all members
        $scope.hasAllMembers = $scope.inviteUsers.length === $scope.availableMemberList.length;
      }
    }

    /**
     * list에서 filter된 list를 전달한다.
     * @param {array} list
     * @param {string} filterText
     * @param {string} filterType
     * @returns {*}
     */
    function getMatches(list, filterText, filterType) {
      var propertyName = SearchTypeUser.getSearchPropertyPath(filterType);

      filterText = filterText.toLowerCase();

      list = $filter('getMatchedList')(list, propertyName, filterText, function(item) {
        return !!item.extSelected !== true;
      });

      $scope.selectingMembers = $filter('orderByQueryIndex')(list, 'name', filterText, function(item, desc) {
        return [!item.isStarred].concat(desc);
      });

      _setAllMembersStatus();

      return $scope.selectingMembers;
    }

    /**
     * insert selected member
     */
    function onInviteTeamClick() {
      $modalInstance.dismiss('cancel');
      modalHelper.openInviteToTeamModal();
    }

    /**
     * member click event handler
     * @param {object} member
     * @param {boolean} value
     */
    function onMemberClick(member, value) {
      var fn = value !== false ? _addMember : _removeMember;

      fn(member);

      _setAllMembersStatus();
      _setFilterStatus();
      _updateMemberList();
    }

    /**
     * add selected member
     * @param {object} member
     */
    function _addMember(member) {
      var inviteUsers = $scope.inviteUsers;
      var activeIndex = $scope.getActiveIndex();
      var list = $scope.selectingMembers;

      member.extSelected = true;
      inviteUsers.indexOf(member) < 0 && inviteUsers.unshift(member);

      // activeIndex가 제일 마지막 item일때 선택되었다면
      // activeIndex를 마지막 item의 이전 item으로 설정하여 activeIndex list에 항상 보이도록 함
      if (list.length - 1 === activeIndex) {
        $scope.setActiveIndex(list.length - 2);
      }
    }

    /**
     * remove selected member
     * @param {object} member
     */
    function _removeMember(member) {
      var inviteUsers = $scope.inviteUsers;

      member.extSelected = false;
      inviteUsers.splice(inviteUsers.indexOf(member), 1);
    }

    /**
     * invite member
     * @param {string} entityType - channel or privategroup
     */
    function onInviteClick(entityType) {
      var guestList = [];
      if (!$scope.isLoading && $scope.inviteUsers.length > 0) {

        jndPubSub.showLoading();

        angular.forEach($scope.inviteUsers, function(user) {
          this.push(user.id);
        }, guestList);

        entityheaderAPIservice.inviteUsers(entityType, $state.params.entityId, guestList)
          .success(function() {
            _analyticsInviteSuccess(entityType, guestList);

            // 토픽에 유저 초대 요청이 성공한 다음 'EntityHandler:parseLeftSideMenuDataDone'이 발생하여 토픽에 멤버 정보가
            // 갱신되기까지 오랜 시간이 소요되므로 초대 성공 후 바로 토픽의 멤버 정보를 갱신하여 사용자가 view에서 느끼는 혼란을 방지한다.
            RoomTopicList.addMember($scope.currentEntity.id, guestList);
            generateMemberList();
            _updateMemberList();

            $modalInstance.dismiss('success');
          })
          .error(function(error) {
            _analyticsInviteError(error);

            // TODO - TO JAY, MAYBE WE NEED TO SHOW MESSAGE WHY IT FAILED??
            console.error('inviteUsers', error.msg );
          })
          .finally(function() {
            jndPubSub.hideLoading();
          });
      }
    }

    /**
     * close modal
     */
    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    /**
     * select all members event handler
     */
    function onSelectAll() {
      var list;
      var fn;

      if (!$scope.hasAllMembers) {
        list = $scope.selectingMembers;
        fn = _addMember;
      } else {
        list = $scope.inviteUsers.splice(0);
        fn = _removeMember;
      }

      _.each(list, function(member) {
        fn(member);
      });

      _clearFilter();
      _focusFilter();
      _updateMemberList();
      _setAllMembersStatus();
    }
  
    /**
     * update member list
     * @private
     */
    function _updateMemberList() {
      jndPubSub.pub('updateList:avaliableMember');
    }

    /**
     * filter의 상태를 설정함.
     */
    function _setFilterStatus() {
      if ($scope.selectingMembers.length === 1) {
        // 걸러진 모든 member가 선택됨

        // filter의 값을 공백으로 초기화 하여 걸러지지 않은 모든 member를 출력하도록 한다.
        _clearFilter();
      }

      _focusFilter();
    }

    /**
     * clear filter
     * @private
     */
    function _clearFilter() {
      $scope.keyword.value = '';
      $('#invite-member-filter').val('');
    }

    /**
     * focus filter
     * @private
     */
    function _focusFilter() {
      // element 선택 후 바로 focus 수행시 element에 focus가 갔다가 다음 수행에 의하여 focus가 빠질수 있으므로 setTimeout 사용한다.
      setTimeout(function() {
        $('#invite-member-filter').focus();
      });
    }

    /**
     * set all member
     * ng-model, attr로 checkbox 값은 변경하여도 checkbox의 모양이 바뀌지 않아 dom element의 property를 수정함
     */
    function _setAllMembersStatus(value) {
      if (value == null) {
        // select all checkbox 갱신
        if ($scope.selectingMembers.length === 0 && $scope.inviteUsers.length > 0) {
          $scope.hasAllMembers = value = true;
        } else {
          $scope.hasAllMembers = value = false;
        }
      }

      $('#select-all-members').prop('checked', value);
    }

    /**
     * keyword type select event handler
     * @param {string} newValue
     * @param {string} oldValue
     */
    function onKeywordTypeSelect(newValue, oldValue) {
      if (newValue !== oldValue) {
        _clearFilter();
        $scope.keyword.type = newValue;
      }

      _focusFilter();
    }

    /**
     * 초대성공 analytics
     * @private
     * @param {string} entityType
     * @param {array} guestList
     */
    function _analyticsInviteSuccess(entityType, guestList) {
      // analytics
      var entity_type = "";
      switch (entityType) {
        case 'channels':
          entity_type = "topic";
          break;
        case 'privategroups':
          entity_type = "private group";
          break;
        default:
          entity_type = "invalid";
          break;
      }
      try {
        //Analtics Tracker. Not Block the Process
        AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_MEMBER_INVITE, {
          'RESPONSE_SUCCESS': true,
          'TOPIC_ID': parseInt($state.params.entityId, 10),
          'MEMBER_COUNT': guestList.length
        });
      } catch (e) {
      }

      analyticsService.mixpanelTrack( "Entity Invite", { "type": entity_type, "count": guestList.length } );
    }

    /**
     * 초대실패 analytics
     * @param {object} error
     * @private
     */
    function _analyticsInviteError(error) {
      try {
        //Analtics Tracker. Not Block the Process
        AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_MEMBER_INVITE, {
          'RESPONSE_SUCCESS': false,
          'ERROR_CODE': error.code
        });
      } catch (e) {
      }
    }
  }
})();
