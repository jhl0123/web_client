(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('markerService', markerService);

  /* @ngInject */
  function markerService(publicService, CoreUtil) {

    var lastLinkIdToCount;     // Map of lastLinkId - count pair
    var memberIdToLastLinkId;  // Map of memberId - lastLinkId pair
    var markerOffset;          //

    this.init = init;


    this.putNewMarker = putNewMarker;

    this.putMemberIdLastLinkId = putMemberId;

    this.getLastLinkIdToCountMap = getLastLinkIdToCountMap;
    this.putLastLinkId = putLastLinkId;

    this.removeMarker = removeMarker;
    this.updateMarker = updateMarker;

    this.getMarkerOffset = getMarkerOffset;
    this.resetMarkerOffset = resetMarkerOffset;

    this.getLastLinkIdOfMemberId = getLastLinkIdOfMemberId;

    init();
    
    /**
     * Initialize local variables.
     *
     * @private
     */
    function init() {
      lastLinkIdToCount = {};
      memberIdToLastLinkId = {};
      markerOffset = 0;
    }

    /**
     * Put new marker by adding both value to both 'lastLinkIdToCount' and 'memberIdToLastLinkId'.
     *
     * @param memberId {number} member id
     * @param lastLinkId {number} last link id
     * @private
     */
    function putNewMarker(memberId, lastLinkId, localLastMessageId) {
      if (lastLinkId >= 0) {
        if (localLastMessageId !== -1 && lastLinkId > localLastMessageId) {
          //console.log('was going to put a marker but current market is way to ahead.')
          markerOffset++;
        } else {
          //console.log('putting new marker for ', memberId, ' with last link id of', lastLinkId);
          putLastLinkId(lastLinkId, memberId);
          putMemberId(memberId, lastLinkId);
        }
      }
    }

    /**
     * Add an object at 'memberId' with value of 'lastLinkId'
     *
     * @param memberId {number}
     * @param lastLinkId {number}
     */
    function putMemberId(memberId, lastLinkId) {
      memberIdToLastLinkId[memberId] = lastLinkId;
    }
    /**
     * Remove memberId from 'memberIdToLastLinkId'.
     *
     * @param memberId
     * @private
     */
    function _removeMemberId(memberId) {
      delete memberIdToLastLinkId[memberId];
    }

    /**
     * Return current 'lastLinkIdToCount' map object.
     *
     * @returns {object} map? or object? HELP.
     */
    function getLastLinkIdToCountMap() {
      return lastLinkIdToCount;
    }

    function putLastLinkId(lastLinkId, memberId) {
      if (CoreUtil.pick(lastLinkIdToCount, lastLinkId)) {
        var currentObj = lastLinkIdToCount[lastLinkId];

        if (currentObj.members[memberId]) {
          // 이미 memberId의 마커 정보가 저장되어있음.
        } else {
          // 새로운 마커를 추가.
          var members = currentObj.members;
          members[memberId] = true;
          currentObj.count = currentObj.count + 1;

          lastLinkIdToCount[lastLinkId] = currentObj;
        }
      } else {
        // 기존에 없을 경우 새로 추가.
        var members = {};
        members[memberId] = true;

        var obj = {
          members: members,
          count: 1
        };

        lastLinkIdToCount[lastLinkId] = obj;
      }
    }

    /**
     * memberId 의 marker 정보를 반환한다.
     * @param {number} memberId
     * @returns {*}
     */
    function getLastLinkIdOfMemberId(memberId) {
      return CoreUtil.pick(memberIdToLastLinkId, memberId);
    }

    /**
     * Remove marker by removing corresponding data from 'lastLinkIdToCount' and 'memberIdToLastLinkId'.
     *
     * @param memberId
     * @private
     */
    function removeMarker(memberId) {
      var oldLastLinkId = getLastLinkIdOfMemberId(memberId);

      if (publicService.isNullOrUndefined(oldLastLinkId)) return;

      //console.log('decrementing count for ', oldLastLinkId, 'from ', lastLinkIdToCount[oldLastLinkId]);

      var currentMarkerObj = lastLinkIdToCount[oldLastLinkId];
      // Remove memberId from members.
      delete currentMarkerObj.members[memberId];

      var newSizeOfMembers = _.size(currentMarkerObj.members);

      if (newSizeOfMembers === 0) {
        delete lastLinkIdToCount[oldLastLinkId];
      } else {
        currentMarkerObj.count = newSizeOfMembers;
      }

      _removeMemberId(memberId);
    }

    /**
     * Update marker information both in lastLinkIdToCount and memberIdToLastLinkId map.
     *
     * @param memberId {number} member id
     * @param lastLinkId {number} last link id
     */
    function updateMarker(memberId, lastLinkId) {
      //console.log('update marker for ', memberId, ' to ', lastLinkId)
      removeMarker(memberId);
      putNewMarker(memberId, lastLinkId);
    }

    function getMarkerOffset() {
      return markerOffset;
    }
    function resetMarkerOffset() {
      markerOffset = 0;
    }
  }

})();