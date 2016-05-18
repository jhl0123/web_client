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
  function Sticker($http, $q, configuration, memberService, Preloader, accountService) {
    var that = this;
    var server_address = configuration.server_address;
    var accountLanguage = accountService.getAccountLanguage();

    var cache = {};
    var pending = {};
    var stickerGroups = [
      {
        className: 'recent',
        id: 'recent'
      },
      {
        className: 'kiyomi',
        id: /tw/i.test(accountLanguage) ? 102 : 101
      },
      {
        className: 'pangya',
        id: 100
      },
      {
        className: 'dingo',
        id: 103
      }
    ];

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _preload();

      that.getStickers = getStickers;
      that.getStickerGroups = getStickerGroups;
      that.getRetinaStickerUrl = getRetinaStickerUrl;
    }

    /**
     * 사용할 sticker group을 preload한다.
     */
    function _preload() {
      // request stickers
      _.each(stickerGroups, function(stickerGroup) {
        var id = stickerGroup.id;

        getStickers(id);
      });
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

            _setStickersUrl(list);
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
     * set stickers url
     * @param {array} list
     * @private
     */
    function _setStickersUrl(list) {
      _.each(list, function(item) {
        // stickers url에 size query를 붙임
        item.url += '?size=130';
      });
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
  
    /**
     * get sticker groups
     * @returns {*[]}
     */
    function getStickerGroups() {
      return stickerGroups;
    }
    
    /**
     * get retina sticker url
     * @param {string} url
     * @returns {*}
     */
    function getRetinaStickerUrl(url) {
      return url.replace(/\?size=[\d]+$/, '');
    }
  }
})();
