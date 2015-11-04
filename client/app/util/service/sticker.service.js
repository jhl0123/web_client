/**
 * @fileoverview Sticker 서비스
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Sticker', Sticker);

  /* @ngInject */
  function Sticker($http, $q, configuration, memberService, Preloader) {
    var that = this;

    var server_address = configuration.server_address;

    var cache = {};
    var pending = {};
    var stickerIds = ['recent', 100, 101];

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      // request stickers
      _.each(stickerIds, function(id) {
        getStickers(id);
      });

      that.getStickers = getStickers;
    }

    /**
     * stickers 전달
     * @param {number} groupId
     * @returns {*}
     */
    function getStickers(groupId) {
      var deferred = $q.defer();

      var stickers;
      var request;

      groupId = groupId || 'recent';
      if (stickers = cache[groupId]) {
        // cache에 stickers가 존재함

        deferred.resolve(stickers);
      } else if (!pending[groupId]) {
        request = _requestStickers(groupId);
        request.then((function(groupId) {
          return function(response) {
            var list = response ? response.data : [];

            if (groupId === 'recent') {
              deferred.resolve(list.reverse());
            } else {
              deferred.resolve(cache[groupId] = list);
            }

            Preloader.img(_.pluck(list, 'url'));
            delete pending[groupId];
          };
        }(groupId)));
        pending[groupId] = request;
      }

      return deferred.promise;
    }

    /**
     * request stickers
     * @param {number} groupId
     * @returns {*}
     * @private
     */
    function _requestStickers(groupId) {
      return groupId === 'recent' ? _getRecentList() : _getList(groupId);
    }

    /**
     * request recent stickers
     * @returns {*}
     */
    function _getRecentList() {
      var teamId = memberService.getTeamId();
      return $http({
        method  : 'GET',
        url     : server_address + 'stickers/teams/' + teamId + '/recent'
      });
    }

    /**
     * request stickers
     * @param {number} groupId
     * @returns {*}
     */
    function _getList(groupId) {
      return $http({
        method  : 'GET',
        url     : server_address + 'stickers/groups/' + groupId
      });
    }
  }
})();
