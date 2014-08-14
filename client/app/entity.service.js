'use strict';

var app = angular.module('jandiApp');

app.factory('entityAPIservice', function($http, $rootScope, $upload, $filter) {
    var entityAPI = {};

    entityAPI.getEntityFromListById = function(list, value) {
        var entity = $filter('filter')(list, { 'id' : value }, function(actual, expected) {
            return actual == expected;
        });

        if (angular.isUndefined(entity) || entity.length != 1) return;

        return entity[0];
    };

    //  Returns proper list from $rootScope.
    entityAPI.getEntityList = function(entity) {
        var type = entity.type;
        var list;
        switch(type) {
            case 'user' :
                return $rootScope.userList;
            case 'channel' :
                return $rootScope.joinedChannelList;
            case 'privateGroup' :
                return $rootScope.privateGroupList;
            default :
                return $rootScope.totalEntities;
        }
    }

    //  updating alarmCnt field of 'entity' to 'alarmCount'.
    entityAPI.updateBadgeValue = function(entity, alarmCount) {
        var list = $rootScope.privateGroupList;

        if (entity.type == 'channel') {
            //  I'm not involved with entity.  I don't care about this entity.
            if (angular.isUndefined(this.getEntityFromListById($rootScope.joinedChannelList, entity.id))) {
//                console.log('returning')
                return;
            }

            list = $rootScope.joinedChannelList;
        }
        else if (entity.type == 'user') {
            list = $rootScope.userList;
        }

        this.setBadgeValue(list, entity, alarmCount);
    }

    entityAPI.setBadgeValue = function(list, entity, alarmCount) {
        if (alarmCount == -1) {
//            console.log('incrementing')
            if (angular.isUndefined(this.getEntityFromListById(list, entity.id).alarmCnt)) {
//                console.log('setting to 1')
                this.getEntityFromListById(list, entity.id).alarmCnt = 1;
            }
            else {
                this.getEntityFromListById(list, entity.id).alarmCnt++;
//                console.log('incrementing')
            }


            return;
        }

//        console.log(entity.name + '  to ' + alarmCount)
        this.getEntityFromListById(list, entity.id).alarmCnt = alarmCount;
    };

    return entityAPI;
});
