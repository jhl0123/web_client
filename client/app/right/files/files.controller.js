(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelFileTabCtrl', rPanelFileTabCtrl);

  function rPanelFileTabCtrl($scope, $rootScope, modalHelper, $state, entityheaderAPIservice, fileAPIservice, analyticsService, publicService, entityAPIservice, currentSessionHelper, logger, AnalyticsHelper) {
    var initialLoadDone = false;
    var startMessageId   = -1;
    var disabledMemberAddedOnSharedIn = false;
    var disabledMemberAddedOnSharedBy = false;

    var localCurrentEntity;
    var fileIdMap = {};
    //TODO: 활성화 된 상태 관리에 대한 리펙토링 필요
    var _isActivated = true;
    // To be used in directive('centerHelpMessageContainer')
    $scope.emptyMessageStateHelper = 'NO_FILES_UPLOADED';

    //  fileRequest.writerId - 작성자
    $scope.$watch('fileRequest.writerId', function(newValue, oldValue) {
      if ($scope.fileRequest.writerId === null) {
        $scope.fileRequest.writerId = 'all';
      }

      if (newValue != oldValue) {
        _refreshFileList();
      }
    });

    //  fileRequest.fileType - 파일 타입
    $scope.$watch('fileTypeFilter', function(newValue, oldValue) {
      if (newValue != oldValue) {
        //console.log(newValue)
        $scope.fileRequest.fileType = newValue.value;
        _refreshFileList();
      }
    }, true);

    //  when sharedEntitySearchQuery is changed,
    //  1. check if value is null
    //      if null -> meaning searching for all chat rooms.
    //          else -> set to selected value.
    $scope.$watch('sharedEntitySearchQuery', function(newValue, oldValue) {
      if (publicService.isNullOrUndefined($scope.sharedEntitySearchQuery)) {
        // 'All'
        $scope.fileRequest.sharedEntityId = -1;
      } else {
        $scope.fileRequest.sharedEntityId = $scope.sharedEntitySearchQuery;
      }

      // If it's a new value, upd©ate file list.
      if ($scope.fileRequest.sharedEntityId != oldValue) {
        _refreshFileList();
      }
    });

    $scope.$on('rightFileOnFileDeleted', function(event, param) {
      if (_isFileTabActive()) {
        if (_hasFileId(param.file.id)) {
          _refreshFileList();
        }
      }
    });

    function _hasFileId(fileId) {
      return fileIdMap[fileId];
    }

    /**
     * Joined new entity or Left current entity
     *
     *  1. Re-initialize shared in select options
     *  2. re-initialize shared in filter.
     */
    $scope.$on('onJoinedTopicListChanged_leftInitDone', function(event, param) {
      logger.log('onJoinedTopicListChanged_leftInitDone');
      _generateShareOptions();

    });

    $scope.$on('onFileDeleted', function() {
      _refreshFileList();
    });

    $scope.$on('updateFileControllerOnShareUnshare', function(event, param) {
      if (_isFileStatusChangedOnCurrentFilter(param)) {
        _refreshFileList();
      }
    });

    /**
     * Check if data.room.id(an id of entity where file is shared/unshared) is same as currently selected filter.
     *
     * @param data
     * @returns {boolean}
     * @private
     */
    function _isFileStatusChangedOnCurrentFilter(data) {
      return data.room.id === $scope.fileRequest.sharedEntityId;
    }

    $scope.$on('onrPanelFileTabSelected', function() {
      _isActivated = true;
      $scope.fileRequest.keyword = '';
      _refreshFileList();
    });
    $scope.$on('onrPanelMessageTabSelected', function() {
      _isActivated = false;
    });

    $scope.$on('onrPanelFileTitleQueryChanged', function(event, keyword) {
      $scope.fileRequest.keyword = keyword;
      _refreshFileList();
    });

    //  From profileViewerCtrl
    $rootScope.$on('updateFileWriterId', function(event, userId) {
      var entity = entityAPIservice.getEntityFromListById($scope.memberList, userId);

      _initSharedByFilter(entity);

      $scope.fileRequest.writerId = userId;
      _resetSearchStatusKeyword();

    });

    // 컨넥션이 끊어졌다 연결되었을 때, refreshFileList 를 호출한다.
    $rootScope.$on('connected', _refreshFileList);

    // Watching joinEntities in parent scope so that currentEntity can be automatically updated.
    //  advanced search option 중 'Shared in'/ 을 변경하는 부분.
    $scope.$on('onCurrentEntityChanged', function(event, currentEntity) {
      if (!_hasLocalCurrentEntityChanged(currentEntity)) {
        return;
      }
      localCurrentEntity = currentEntity;
      _setSharedInEntity(localCurrentEntity);
      _initSharedByFilter(localCurrentEntity);
    });


    function _refreshFileList() {
      if (!_isFileTabActive()) return;
      preLoadingSetup();
      getFileList();
    }

    (function() {
      _init();
    })();

    function _init() {
      $scope.searchStatus = {
        keyword: '',
        length: ''
      };

      $scope.isLoading = false;
      $scope.isScrollLoading = false;

      $scope.fileList = [];
      $scope.fileTitleQuery   = '';

      $scope.fileRequest      = {
        searchType: 'file',
        sharedEntityId: parseInt($state.params.entityId),
        startMessageId: -1,
        listCount: 10,
        keyword: ''
      };

      fileIdMap = {};

      _initFileTypeFilter();
      _initSharedInFilter();
      _initSharedByFilter(localCurrentEntity);
      _setDefaultSharedByFilter();

      localCurrentEntity = currentSessionHelper.getCurrentEntity();

      if (publicService.isNullOrUndefined(localCurrentEntity)) {
        // This may happen because file controller may be called before current entity is defined.
        // In this case, initialize options first then return from here
        return;
      }

      _setSharedInEntity(localCurrentEntity);

      // Checking if initial load has been processed or not.
      // if not, load once.
      if (!initialLoadDone) {
        _refreshFileList();
      }

    }

    /**
     * Initializing and setting 'Shared in' Options.
     * @private
     */
    function _initSharedInFilter() {

      var currentMember = localCurrentEntity;

      /*
       What 'getShareOptions' is doing is basically to 'concat' two lists.
       Since 'concat' two lists may take O(n) time complexity, I want to call 'getShareOptions' as least times as possible.
       When disabled member is added to option, to take that disabled member out, just reset the list.
       */
      if (disabledMemberAddedOnSharedIn || !$scope.selectOptions) {
        // Very default setting.
        _generateShareOptions();
        disabledMemberAddedOnSharedIn = false;
      }

      // If current member is disabled member, add current member to options just for now.
      // Set the flag to true.
      if (_isDisabledMember(currentMember)) {
        $scope.selectOptions = $scope.selectOptions.concat(currentMember);
        disabledMemberAddedOnSharedIn = true;
      }
    }

    function _generateShareOptions() {
      //console.log('generating shared options')
      $scope.selectOptions = fileAPIservice.getShareOptions($scope.joinedEntities, $scope.memberList);
    }

    function _setSharedInEntity(entity) {
      $scope.sharedEntitySearchQuery = entity.id;
    }

    /**
     * Initializing and setting 'Shared by' Options.
     * @private
     */
    function _initSharedByFilter(entity) {
      if (disabledMemberAddedOnSharedBy || !$scope.selectOptionsUsers) {
        // Very default setting.
        // Add myself to list as a default option.
        _addToSharedByOption($scope.member);
        disabledMemberAddedOnSharedBy = false;
      }

      // When accessing disabled member's file list.
      if (_isDisabledMember(entity)) {
        _addToSharedByOption(entity);
        disabledMemberAddedOnSharedBy = true;
      }
    }

    function _setDefaultSharedByFilter() {
      $scope.fileRequest.writerId = 'all';
    }

    /**
     * Helper function of 'initSharedByFilter'.
     * @param member
     * @private
     */
    function _addToSharedByOption(member) {
      $scope.selectOptionsUsers = fileAPIservice.getShareOptions([member], $scope.memberList);
    }

    /**
     * Initializing and setting 'File Type' Options.
     * @private
     */
    function _initFileTypeFilter() {
      $scope.fileTypeList = fileAPIservice.generateFileTypeFilter();
      $scope.fileTypeFilter = $scope.fileTypeList[0];
      $scope.fileRequest.fileType = $scope.fileTypeFilter.value
    }


    /**
     * When file type filter has been changed.
     */
    $rootScope.$on('updateFileTypeQuery', function(event, type) {
      _onUpdateFileTypeQuery(type);
    });

    function _onUpdateFileTypeQuery(type) {
      var newType = '';
      if (type === 'you') {
        // when 'Your Files' is clicked on 'cpanel-search__dropdown'
        $scope.fileRequest.writerId = $scope.member.id;
        newType = 'all';
      }
      else {
        if (type === 'all') {
          // when 'All Files' is clicked oon 'cpanel-search__dropdown'
          $scope.fileRequest.writerId = 'all';
          $scope.sharedEntitySearchQuery = null;
        }
        newType = type;
      }

      _updateFileType(newType);
    }

    /**
     * Iterate through fileTypelist, which is generated by default, looking for 'type'.
     * Update $scope.fileTypeFilter variable after found match.
     *
     * @param type
     */
    function _updateFileType(type) {
      var fileType = {};
      _.forEach($scope.fileTypeList, function(object, index) {
        var value = object.value;

        if (value == type) {
          fileType = object;
          return false;
        }
      });
      $scope.fileTypeFilter = fileType
    }

    function preLoadingSetup() {
      $scope.fileRequest.startMessageId   = -1;
      isEndOfList = false;
      $scope.isLoading = true;
      $scope.fileList = [];
    }

    var isEndOfList = false;

    $scope.loadMore = function() {
      if (isEndOfList || $scope.isScrollLoading) return;

      if ($scope.fileList.length==0 && $scope.fileRequest.keyword != '') {
        // No search result.
        return;
      }
      $scope.isScrollLoading = true;
      $scope.fileRequest.startMessageId = startMessageId;

      getFileList();
    };


    function getFileList() {
      _updateSearchStatusKeyword();

      fileAPIservice.getFileList($scope.fileRequest)
        .success(function(response) {
          
          var property = {};
          var PROPERTY_CONSTANT = AnalyticsHelper.PROPERTY;
          var fileList = [];

          //analytics
          if ($scope.fileRequest.keyword !== "") {
            property[PROPERTY_CONSTANT.SEARCH_KEYWORD] = $scope.fileRequest.keyword;
            property[PROPERTY_CONSTANT.RESPONSE_SUCCESS] = true; 
            AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_KEYWORD_SEARCH, property);
          }

          if (_isActivated) {
            var fileList = [];
            angular.forEach(response.files, function (entity, index) {

              var file = entity;
              file.shared = fileAPIservice.getSharedEntities(file);
              if (file.status != 'archived')
                this.push(file);
              fileIdMap[file.id] = true;

            }, fileList);


            generateFileList(fileList, response.fileCount, response.firstIdOfReceivedList);
            initialLoadDone = true;
          }
        })
        .error(function(response) {
          var property = {};
          var PROPERTY_CONSTANT = AnalyticsHelper.PROPERTY;
          //analytics
          if ($scope.fileRequest.keyword !== "") {
            property[PROPERTY_CONSTANT.ERROR_CODE] = response.code;
            property[PROPERTY_CONSTANT.RESPONSE_SUCCESS] = false; 
            AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_KEYWORD_SEARCH, property);
          }

          console.log(response.msg);
        })
        .finally(function() {
          _updateSearchStatusTotalCount();
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
    }


    function _resetSearchStatusKeyword() {
      $scope.fileRequest.keyword = '';
      $scope.searchStatus.keyword = $scope.fileRequest.keyword;
      $rootScope.$broadcast('resetRPanelSearchStatusKeyword');
    }
    function _updateSearchStatusKeyword() {
      $scope.searchStatus.keyword = $scope.fileRequest.keyword;
    }

    function _updateSearchStatusTotalCount(count) {
      $scope.searchStatus.length = $scope.fileList.length;
    }

    $scope.onClickShare = function(file) {
      fileAPIservice.openFileShareModal($scope, file);
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



    $scope.isDisabledMember = function(member) {
      return _isDisabledMember(member);
    };

    function _isDisabledMember(member) {
      return !!member && publicService.isDisabledMember(member);
    }

    function _isFileTabActive() {
      return $scope.isFileTabActive;
    }

    // _hasLocalCurrentEntityChanged 수행시 localCurrentEntity가 존재하지 않아 error 발생하므로
    // localCurrentEntity null check code 추가
    function _hasLocalCurrentEntityChanged(newCurrentEntity) {
      return !localCurrentEntity || localCurrentEntity.id !== newCurrentEntity.id;
    }


    /**
     * True if use never changed any value in file search filter.
     *
     * @returns {boolean}
     */
    $scope.isFiltered = function() {
      return  !isFileSearchQueryDefault() ||
              !_isFileTypeDefault() ||
              !_isFileWriterIdDefault();
    };

    $scope.isFileSearchQueryDefault = isFileSearchQueryDefault;
    /**
     * Returns true when there is no search query.
     * 'isSearchQueryEmpty' is defined in right.controller.
     *
     * @returns {$scope.isSearchQueryEmpty|*}
     */
    function isFileSearchQueryDefault() {
      return $scope.isSearchQueryEmpty;
    }

    /**
     * True if fileType is still default value.
     *
     * Default value is set in '_initFileTypeFilter()' function.
     * @returns {boolean}
     * @private
     */
    function _isFileTypeDefault() {
      return $scope.fileRequest.fileType === 'all';
    }

    /**
     * True if file writer id has not been changed yet.
     *
     * default value is 'all', defined in '_setDefaultSharedByFilter()' function in this 1controller.
     *
     * @returns {boolean}
     * @private
     */
    function _isFileWriterIdDefault() {
      return $scope.fileRequest.writerId === 'all';
    }
  }


})();