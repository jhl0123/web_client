(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('entityHeader', entityHeader);

  /* @ngInject */
  function entityHeader($http, memberService, config) {
    var teamId = memberService.getTeamId();

    this.leaveEntity = leaveEntity;
    this.deleteEntity = deleteEntity;
    this.toggleTopicNotification = toggleTopicNotification;

    function leaveEntity(entityType, entityId) {
      return $http({
        method: 'PUT',
        url: config.server_address + entityType + '/' + entityId + '/leave',
        data: {
          teamId: teamId
        }
      });
    }

    function deleteEntity(entityType, entityId) {
      return $http({
        method: 'DELETE',
        url: config.server_address + entityType + '/' + entityId,
        params: {
          teamId: teamId
        }
      });
    }

    function toggleTopicNotification(entityId, toBeValue) {
      return $http({
        method: 'PUT',
        url: config.server_address + 'teams/' + teamId + '/rooms/' + entityId + '/subscribe',
        data: {
          subscribe: toBeValue
        }
      });
    }
  }
})();

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('watcher', getWatchers);


  function getWatchers() {
    this.getWatchCount = getWatchCount;

    function getWatchCount() {
      var total = 0;

      angular.element('.ng-scope').each(function() {
        var scope = $(this).scope();

        total += scope.$$watchers ? scope.$$watchers.length : 0;
      });

      return total;
    }
  }
})();