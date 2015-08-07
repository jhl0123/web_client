/**
 * Keep tracks of every information that is bounded to current session!!!!
 *
 * Let's move things to here from $rootScope
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('currentSessionHelper', currentSessionHelper);

  /* @ngInject */
  function currentSessionHelper($state) {
    var currentTeam;
    var currentTeamMemberList;
    var currentEntity;
    var currentTeamAdmin;

    var _hasBrowserFocus = true;

    var isSocketConnected = false;

    // File id of a file currently selected in right panel.
    var currentFileId = -1;

    this.clear = clear;
    this.isLoggedIn = isLoggedIn;
    this.getCurrentTeam = getCurrentTeam;
    this.setCurrentTeam = setCurrentTeam;

    this.updateCurrentTeamName = updateCurrentTeamName;

    this.isDefaultTopic = isDefaultTopic;
    this.getDefaultTopicId = getDefaultTopicId;

    this.getCurrentTeamMemberList = getCurrentTeamMemberList;
    this.setCurrentTeamMemberList = setCurrentTeamMemberList;

    this.getCurrentTeamMemberCount = getCurrentTeamMemberCount;

    this.setCurrentEntity = setCurrentEntity;
    this.getCurrentEntity = getCurrentEntity;

    this.getCurrentEntityType = getCurrentEntityType;
    this.getCurrentEntityId = getCurrentEntityId;

    this.setSocketConnection = setSocketConnection;
    this.resetSocketConnection = resetSocketConnection;
    this.getSocketConnection = getSocketConnection;

    this.getCurrentFileId = getCurrentFileId;
    this.removeCurrentFileId = removeCurrentFileId;

    this.getCurrentTeamAdmin = getCurrentTeamAdmin;
    this.setCurrentTeamAdmin = setCurrentTeamAdmin;


    this.setBrowserFocus = setBrowserFocus;
    this.resetBrowserFocus = resetBrowserFocus;
    this.isBrowserHidden = isBrowserHidden;

    this.isMobile = jQuery.browser.mobile;

    _init();

    /**
     * 초기화 함수
     * @private
     */
    function _init() {
      clear();
    }

    /**
     * session 값을 초기화 한다.
     */
    function clear() {
      currentTeam = null;
      currentTeamMemberList = null;
      currentEntity = null;
      currentTeamAdmin = null;
      _hasBrowserFocus = true;
      isSocketConnected = false;
      currentFileId = -1;
    }

    /**
     * login 하였는지 여부를 반환한다.
     * @returns {boolean}
     */
    function isLoggedIn() {
      return currentTeam !== null || currentEntity !== null;
    }

    function getCurrentTeam() { return currentTeam; }
    function setCurrentTeam(team) { currentTeam = team; }

    function _setCurrentTeamName(teamName) {
      currentTeam.name = teamName;
    }

    function updateCurrentTeamName(teamName) {
      _setCurrentTeamName(teamName);
    }

    function isDefaultTopic(topic) {
      return topic.id == getDefaultTopicId();
    }

    function getDefaultTopicId() {
      return currentTeam.t_defaultChannelId;
    }
    function getCurrentTeamMemberList() { return currentTeamMemberList; }
    function setCurrentTeamMemberList(memberList) { currentTeamMemberList = memberList; }

    function getCurrentTeamMemberCount() {
      var activeMemberCount = 0;
      _.forEach(currentTeamMemberList, function(member, index) {
        if (member.status == 'enabled') activeMemberCount++;
      });

      //console.log(activeMemberCount)
      return activeMemberCount;
    }

    function setCurrentEntity(entity) {
      currentEntity = entity;
    }

    function getCurrentEntity() {
      return currentEntity;
    }
    function getCurrentEntityType() {
      return currentEntity.type;
    }
    function getCurrentEntityId() {
      return currentEntity.id;
    }

    function setSocketConnection() {
      isSocketConnected = true;
    }
    function resetSocketConnection() {
      isSocketConnected = false;
    }

    function getSocketConnection() {
      return isSocketConnected;
    }

    function setCurrentFileId(fileId) {
      currentFileId = fileId;
    }
    function getCurrentFileId() {
      return parseInt($state.params.itemId);
    }
    function removeCurrentFileId() {
      currentFileId = -1;
    }

    function getCurrentTeamAdmin() {
      return currentTeamAdmin;
    }

    function setCurrentTeamAdmin(value) {
      currentTeamAdmin = value;
    }

    /**
     * Set browser indicator to 'true'
     */
    function setBrowserFocus() {
      _hasBrowserFocus = true;
    }

    /**
     *  Reset browser indicator back to 'false'
     */
    function resetBrowserFocus() {
      _hasBrowserFocus = false;
    }

    /**
     * Check if current browser has focus or not.
     * @returns {boolean|*}
     */
    function isBrowserHidden() {
      return !_hasBrowserFocus || document.hidden;
    }
  }
})();