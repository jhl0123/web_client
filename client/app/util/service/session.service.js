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
  function currentSessionHelper($state, CoreUtil, UserList, BotList) {
    var currentTeam;
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

    this.getCurrentTeamUserList = getCurrentTeamUserList;

    this.getCurrentTeamUserCount = getCurrentTeamUserCount;

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
      currentTeam && (currentTeam.name = teamName);
    }

    function updateCurrentTeamName(teamName) {
      _setCurrentTeamName(teamName);
    }

    function isDefaultTopic(topic) {
      return topic.id == getDefaultTopicId();
    }

    function getDefaultTopicId() {
      return currentTeam && currentTeam.t_defaultChannelId;
    }

    /**
     * 현재 팀의 User 리스트를 반환한다.
     * @returns {*}
     */
    function getCurrentTeamUserList() {
      return UserList.toJSON();
    }

    function getCurrentTeamUserCount() {
      return UserList.getEnabledList().length;
    }

    function setCurrentEntity(entity) {
      currentEntity = entity;
    }

    function getCurrentEntity() {
      return currentEntity;
    }
    function getCurrentEntityType() {
      return currentEntity && currentEntity.type;
    }

    function getCurrentEntityId(isEntityId) {
      var entityId = CoreUtil.pick(currentEntity, 'id');
      if (entityId && isEntityId) {
        if (UserList.isExist(currentEntity.id)) {
          entityId = UserList.get(currentEntity.id).entityId;
        }

        if (BotList.isExist(currentEntity.id)) {
          entityId = BotList.get(currentEntity.id).entityId;
        }
      }
      return entityId;
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
      return document.hidden || !document.hasFocus() || !_hasBrowserFocus;
    }
  }
})();
