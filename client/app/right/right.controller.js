'use strict';

var app = angular.module('jandiApp');

app.controller('rightpanelController', function($scope, $rootScope, $modal, $timeout, $state, entityheaderAPIservice, fileAPIservice, analyticsService, $filter) {

  $scope.isLoading = true;
  $scope.isScrollLoading = true;

  //console.info('[enter] rightpanelController');

  var startMessageId   = -1;

  $scope.fileTitleQuery   = '';

  $scope.fileRequest      = {
    searchType: 'file',
    writerId: 'all',
    sharedEntityId: $state.params.entityId,
    startMessageId: -1,
    listCount: 10,
    keyword: '',
    fileType: $scope.fileTypeFilter
  };

  $scope.sharedEntitySearchQuery  = $scope.currentEntity;
  $scope.selectOptions            = fileAPIservice.getShareOptions($scope.joinedEntities, $scope.memberList);

  $scope.selectOptionsUsers       = [$scope.member];
  $scope.selectOptionsUsers       = $scope.selectOptionsUsers.concat($scope.memberList);

  $scope.fileTypeList = fileAPIservice.generateFileTypeFilter();
  $scope.fileTypeFilter = $scope.fileTypeList[0];

  $scope.fileList = [];

  var initialLoadDone = false;

  $rootScope.$on('updateFileTypeQuery', function(event, type) {
    if (type === 'you') {
      // when 'Your Files' is clicked on 'cpanel-search__dropdown'
      $scope.fileRequest.writerId = $scope.member.id;
      $scope.fileRequest.fileType = 'all';
    }
    else {
      if (type === 'all') {
        // when 'All Files' is clicked oon 'cpanel-search__dropdown'
        $scope.fileRequest.writerId = 'all';

        //  Question.
        //  when 'All Files' is clicked,
        //  Should I search from all sharedEntity or current channel?
        $scope.sharedEntitySearchQuery = null;
      }
      $scope.fileRequest.fileType = type;
      $scope.fileTypeFilter = type;
    }
  });

  //  when file was uploaded from center panel,
  //  fileAPI broadcasts 'onChangeShared' to rootScope.
  //  right controller is listening to 'onChangeShared' and update file list.
  $rootScope.$on('onChangeShared', function() {
    preLoadingSetup();
    getFileList();
  });

  //  From profileViewerCtrl
  $rootScope.$on('updateFileWriterId', function(event, userId) {
    $scope.fileRequest.writerId = userId;
  });

  //  when sharedEntitySearchQuery is changed,
  //  1. check if value is null
  //      if null -> meaning searching for all chat rooms.
  //          else -> set to selected value.
  $scope.$watch('sharedEntitySearchQuery', function(newValue, oldValue) {
    if ($scope.sharedEntitySearchQuery === null || angular.isUndefined($scope.sharedEntitySearchQuery)) {
      $scope.fileRequest.sharedEntityId = -1;
    }
    else {
      $scope.fileRequest.sharedEntityId = $scope.sharedEntitySearchQuery.id;
    }

    //        console.log('sharedEntitySearchQuery chagned to  ' + $scope.sharedEntitySearchQuery.id + '/' + $filter('getFirstLastNameOfUser')($scope.sharedEntitySearchQuery));

    if (newValue != oldValue) {
      preLoadingSetup();
      getFileList();
    }
  });

  //  fileRequest.writerId => 작성자
  $scope.$watch('fileRequest.writerId', function(newValue, oldValue) {
    if ($scope.fileRequest.writerId === null) {
      $scope.fileRequest.writerId = 'all';
    }

    if (newValue != oldValue) {
      preLoadingSetup();
      getFileList();
    }
  });

  //  fileRequest.fileType => 파일 타입
  //  한가지라도 바뀌면 알아서 다시 api call을 한다.
  $scope.$watch('fileTypeFilter', function(newValue, oldValue) {
    if (newValue != oldValue) {
      //console.log(newValue)
      $scope.fileRequest.fileType = newValue.value;
      preLoadingSetup();
      getFileList();
    }
  }, true);


  // scope function that gets called when user hits 'enter' in '.rpanel-body-search__input'.

  $scope.onFileTitleQueryEnter = function() {
    preLoadingSetup();
    getFileList();
  };


  // Checking if initial load has been processed or not.
  // if not, load once.
  if (!initialLoadDone) {
    preLoadingSetup();
    getFileList();
  }

  // Watching joinEntities in parent scope so that currentEntity can be automatically updated.
  //  advanced search option 중 'Shared in'/ 을 변경하는 부분.
  $scope.$watch('currentEntity', function(newValue, oldValue) {
    if (newValue != oldValue) {
      updateSharedList();

      //            console.log('this is updateSharedList in right.controller')
      //            console.log($scope.currentEntity)

      //  channel could be removed/created/left
      //  update selectOptions for data syncrhonization issue.
      $scope.selectOptions            = fileAPIservice.getShareOptions($scope.joinedEntities, $scope.memberList);
      $scope.sharedEntitySearchQuery = $scope.currentEntity;
    }
  });

  // loop through list of files and update shared list of each file.
  function updateSharedList() {
    _.each($scope.fileList, function(file) {
      file.shared = fileAPIservice.getSharedEntities(file);
    });
  }


  function preLoadingSetup() {
    $scope.fileRequest.startMessageId   = -1;
    isEndOfList = false;
    $scope.isLoading = true;
  }

  var isEndOfList = false;

  $scope.loadMore = function() {
    if (isEndOfList) return;

    $scope.isScrollLoading = true;
    $scope.fileRequest.startMessageId = startMessageId;

    getFileList();
  };

  function getFileList() {
    if (!$scope.fileRequest.fileType) {
      $scope.fileRequest.fileType = 'all';
    }

    fileAPIservice.getFileList($scope.fileRequest)
      .success(function(response) {
        //console.log(response)
        var fileList = [];
        angular.forEach(response.files, function(entity, index) {

          var file = entity;
          file.shared = fileAPIservice.getSharedEntities(file);
          this.push(file);

        }, fileList);

        generateFileList(fileList, response.fileCount, response.firstIdOfReceivedList);
        initialLoadDone = true;
      })
      .error(function(response) {
        console.log(response.msg);
      });
  }

  function generateFileList(fileList, fileCount, firstIdOfReceivedList) {
    if (fileCount === 0 && $scope.isScrollLoading) {
      $('.file-list__item.loading').addClass('opac_out');

      $scope.isScrollLoading = false;
      isEndOfList = true;
      return;
    }

    startMessageId = firstIdOfReceivedList;

    if($scope.fileRequest.startMessageId === -1) {
      //  Not loading more.
      //  Replace current fileList with new fileList.
      //            $('.file-list__item').addClass('opac_out');
      $scope.fileList = fileList;

    }
    else {
      //  Loading more.
      //  Append fileList to current fileList
      _.forEach(fileList, function(item) {
        $scope.fileList.push(item);
      });
    }
    $scope.isScrollLoading = false;
    $scope.isLoading = false;

    //  when user typed title in for search, expand advanced search option panel.
    if ($scope.fileRequest.keyword != '') {
      $scope.isAdvancedOptionCollapsed = false;
    }
  }


  // there is a function listening to 'onFileSelect' in left.controller
  $scope.onFileSelect = function($files) {
    $rootScope.$broadcast('onFileSelect', $files);
  };


  $scope.openModal = function(selector) {
    // OPENING JOIN MODAL VIEW
    if (selector == 'file') {
      $modal.open({
        scope       : $scope,
        templateUrl : 'app/modal/upload.html',
        controller  : 'fileUploadModalCtrl',
        size        : 'lg'
      });
    }
    else if (selector == 'share') {
      $modal.open({
        scope       : $scope,
        templateUrl : 'app/modal/share.html',
        controller  : 'fileShareModalCtrl',
        size        : 'lg'
      });
    }
  };

  $scope.$on('openFileShare', function(event, file) {
    $scope.onClickShare(file);
  });

  $scope.onClickShare = function(file) {
    $scope.fileToShare = file;
    this.openModal('share');
  };

  $scope.onClickUnshare = function(message, entity) {
    fileAPIservice.unShareEntity(message.id, entity.id)
      .success(function() {
        // analytics
        var share_target = "";
        switch (entity.type) {
          case 'channel':
            share_target = "topic";
            break;
          case 'privateGroup':
            share_target = "private group";
            break;
          case 'user':
            share_target = "direct message";
            break;
          default:
            share_target = "invalid";
            break;
        }
        var file_meta = (message.content.type).split("/");
        var share_data = {
          "entity type"   : share_target,
          "category"      : file_meta[0],
          "extension"     : message.content.ext,
          "mime type"     : message.content.type,
          "size"          : message.content.size
        };
        analyticsService.mixpanelTrack( "File Unshare", share_data );

        fileAPIservice.broadcastChangeShared(message.id);
      })
      .error(function(err) {
        alert(err.msg);
      });
  };

  $scope.onClickSharedEntity = function(entityId) {
    var targetEntity = fileAPIservice.getEntityById($scope.totalEntities, entityId);
    if (fileAPIservice.isMember(targetEntity, $scope.member)) {
      $state.go('archives', { entityType: targetEntity.type + 's', entityId: targetEntity.id });
    } else {
      entityheaderAPIservice.joinChannel(targetEntity.id)
        .success(function(response) {
          $rootScope.$emit('updateLeftPanelCaller');
          $state.go('archives', {entityType:targetEntity.type + 's',  entityId:targetEntity.id});
          analyticsService.mixpanelTrack( "topic Join" );

        })
        .error(function(err) {
          alert(err.msg);
        });
    }
  };

  $scope.setCommentFocus = function(file) {
    if ($state.params.itemId != file.id) {
      $rootScope.setFileDetailCommentFocus = true;

      $state.go('files', {
        userName    : file.writer.name,
        itemId      : file.id
      });
    }
    else {
      fileAPIservice.broadcastCommentFocus();
    }
  };
});
