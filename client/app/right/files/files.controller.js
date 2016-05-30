/**
 * @fileoverview files controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightFilesCtrl', RightFilesCtrl);

  function RightFilesCtrl($scope, $filter, $q, $state, $timeout, AnalyticsHelper, analyticsService, CoreUtil,
                          currentSessionHelper, Dialog, EntityHandler, fileAPIservice, FileDetail, JndUtil, modalHelper,
                          publicService, RoomTopicList, TopicFolderModel, UserList) {
    var _disabledMemberAddedOnSharedIn = false;
    var _disabledMemberAddedOnSharedBy = false;

    var _localCurrentEntity;
    var _fileMap = {};
    var _timerSearch;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.fileList = [];

      $scope.searchStatus = {
        q: '',
        sharedEntityId: parseInt($state.params.entityId),
        writerId: 'all',
        fileType: 'all',
        startMessageId: -1,
        listCount: 20,

        isSearching: false,
        isScrollLoading: false,
        isEndOfList: false,
        isInitDone: false,

        length: '',
        type: ''
      };

      _fileMap = {};
      $scope.searchStatus.type = _getSearchStatusType();
      $scope.isConnected = true;

      $scope.isEmpty = isEmpty;
      $scope.isFiltered = isFiltered;
      $scope.isKeywordEmpty = isKeywordEmpty;

      $scope.onKeywordChange = onKeywordChange;
      $scope.onResetQuery = onResetQuery;

      $scope.loadMore = loadMore;
      $scope.onClickShare = onClickShare;
      $scope.onClickUnshare = onClickUnshare;
  
      _localCurrentEntity = currentSessionHelper.getCurrentEntity();

      _initSharedInFilter();
      _setSharedInEntity(_localCurrentEntity);

      _initSharedByFilter(_localCurrentEntity);
      _setDefaultSharedBy();

      _initFileTypeFilter();
      _setDefaultFileType();

      _attachScopeEvents();
    }

    /**
     * attach scope events
     * @private
     */
    function _attachScopeEvents() {
      $scope.$on('externalFile:fileShareChanged', _onFileShareChanged);

      $scope.$on('topic-folder:update', _generateShareOptions);
      $scope.$on('onCurrentEntityChanged', _onCurrentEntityChanged);
      $scope.$on('updateFileWriterId', _onFileWriterIdChange);

      $scope.$on('rightPanelStatusChange', _onRightPanelStatusChange);
      $scope.$on('rightFileOnFileDeleted', _onFileDelete);
      $scope.$on('onFileDeleted', _onFileDelete);

      $scope.$on('onChangeShared', _onChangeShared);

      // 컨넥션이 끊어졌다 연결되었을 때, refreshFileList 를 호출한다.
      $scope.$on('NetInterceptor:connect', _onConnected);
      $scope.$on('NetInterceptor:disconnect', _onDisconnected);
      $scope.$on('NetInterceptor:onGatewayTimeoutError', _refreshView);
      $scope.$on('Auth:refreshTokenSuccess', _refreshView);

      $scope.$watch('searchStatus.sharedEntityId', _onSearchEntityChange);
      $scope.$watch('searchStatus.writerId', _onSearchWriterChange);
      $scope.$watch('searchStatus.fileType', _onSearchFileTypeChange);
    }

    /**
     * Initializing and setting 'Shared in' Options.
     * @private
     */
    function _initSharedInFilter() {
      var currentMember = _localCurrentEntity;

      /*
       What 'getShareOptions' is doing is basically to 'concat' two lists.
       Since 'concat' two lists may take O(n) time complexity, I want to call 'getShareOptions' as least times as possible.
       When disabled member is added to option, to take that disabled member out, just reset the list.
       */
      if (_disabledMemberAddedOnSharedIn || !$scope.selectOptions) {
        // Very default setting.
        _generateShareOptions();
        _disabledMemberAddedOnSharedIn = false;
      }

      // If current member is disabled member, add current member to options just for now.
      // Set the flag to true.
      if (_isDisabledMember(currentMember)) {
        $scope.selectOptions = TopicFolderModel.getNgOptions($scope.selectOptions.concat(currentMember));
        _disabledMemberAddedOnSharedIn = true;
      }
    }

    /**
     * Initializing and setting 'Shared by' Options.
     * @private
     */
    function _initSharedByFilter(entity) {
      if (_disabledMemberAddedOnSharedBy || !$scope.selectOptionsUsers) {
        // Very default setting.
        // Add myself to list as a default option.
        _addToSharedByOption();
        _disabledMemberAddedOnSharedBy = false;
      }

      // When accessing disabled member's file list.
      if (_isDisabledMember(entity)) {
        _addToSharedByOption();
        _disabledMemberAddedOnSharedBy = true;
      }
    }

    /**
     * Initializing and setting 'File Type' Options.
     * @private
     */
    function _initFileTypeFilter() {
      $scope.fileTypeList = fileAPIservice.generateFileTypeFilter();
    }

    /**
     * '공유된 곳' 값 변경 이벤트 핸들러
     * @param {number|object} newValue
     * @param {number|object} oldValue
     * @private
     */
    function _onSearchEntityChange(newValue, oldValue) {
      if (newValue === null) {
        // newValue가 null 이면 모든 대화방인 '-1' 값을 뜻한다.
        newValue = -1;
      }

      if (newValue !== oldValue) {
        _refreshFileList();
      }
    }

    /**
     * '업로드한 멤버' 값 변경 이벤트 핸들러
     * @param {number} newValue
     * @param {number} oldValue
     * @private
     */
    function _onSearchWriterChange(newValue, oldValue) {
      if (newValue !== oldValue) {
        _refreshFileList();
      }
    }

    /**
     * '파일 타입' 값 변경 이벤트 핸들러
     * @param {string} newValue
     * @param {string} oldValue
     * @private
     */
    function _onSearchFileTypeChange(newValue, oldValue) {
      if (newValue !== oldValue) {
        _refreshFileList();
      }
    }

    /**
     * 해당 유저의 파일 정보 열람 이벤트 핸들러
     * @param {object} $event
     * @param {number} userId
     * @private
     */
    function _onFileWriterIdChange($event, userId) {
      var entity = UserList.get(userId);

      $scope.searchStatus.writerId = userId;

      _initSharedByFilter(entity);
      _resetSearchStatusKeyword();
    }

    /**
     * 오른쪽 패널의 텝 열림 이벤트 핸들러
     * @private
     */
    function _onRightPanelStatusChange() {
      if ($scope.status.isActive && !$scope.searchStatus.isInitDone) {
        // 아직 초기화가 진행되어 있지 않다면 전체 갱신한다.

        _refreshFileList();
      }
    }

    /**
     * 사용자가 센터에 보고 있는 room에 변경사항에 대한 이벤트 핸들러
     * @param {object} $event
     * @param {object} currentEntity
     * @private
     */
    function _onCurrentEntityChanged($event, currentEntity) {
      if ($scope.status.isActive && _hasLocalCurrentEntityChanged(currentEntity) && !_hasSearchResult()) {
        // 텝이 활성화 상태이고 room이 변경 되었으며 결과 값이 존재하지 않을때 변경된 room 값으로 '공유된 곳'의 값을 변견한다.
  
        _localCurrentEntity = currentEntity;
        _setSharedInEntity(_localCurrentEntity);
        _initSharedByFilter(_localCurrentEntity);

        // search keyword reset
        _resetSearchStatusKeyword();
      }
    }

    /**
     * room이 변경되었는지 여부
     * @param {object} newCurrentEntity
     * @returns {boolean}
     * @private
     */
    function _hasLocalCurrentEntityChanged(newCurrentEntity) {
      return !_localCurrentEntity || _localCurrentEntity.id !== newCurrentEntity.id;
    }

    /**
     * 검색에 대한 결과를 가지고 있는지 여부
     * @returns {boolean}
     * @private
     */
    function _hasSearchResult() {
      return $scope.searchStatus.q.length > 1 &&
        $scope.fileList.length > 0;
    }

    /**
     * 검색 키워드 변경 이벤트 핸들러
     * @param {string} keyword
     */
    function onKeywordChange(keyword) {
      if (_isValidSearchKeyword()) {
        $scope.searchStatus.keyword = keyword;
        _refreshFileList();
      }
    }

    /**
     * 타당한 검색 키워드 인지 여부
     * @returns {boolean}
     * @private
     */
    function _isValidSearchKeyword() {
      var keyword = $scope.searchStatus.q;
      return keyword === '' || keyword.length > 1;
    }

    /**
     * 검색 조건(공유된 곳, 업로드 멤버, 파일 타입) 초기화
     * @private
     */
    function onResetQuery() {
      _setSharedInEntity();
      _setDefaultSharedBy();
      _setDefaultFileType();
    }

    /**
     * 공유 정보 변경 이벤트 핸들러
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _onChangeShared($event, data) {
      if (data) {
        if (_isFileStatusChangedOnCurrentFilter(data)) {
          // 전달된 data가 '공유된 곳'을 가리킨다.

          // file_share와 file_unshare에 대한 처리를 file socket 이벤트로 처리해야 하지만 전달되는 data가 부족하므로
          // message 이벤트로 처리한다.
          if (data.messageType === 'file_share') {
            _onFileShared(data);
          } else if (data.messageType === 'file_unshare') {
            _onFileUnshared(data);
          } else {
            _refreshFileList();
          }
        }
      }
    }

    /**
     * Check if data.room.id(an id of entity where file is shared/unshared) is same as currently selected filter.
     * @param {object} data
     * @returns {boolean}
     * @private
     */
    function _isFileStatusChangedOnCurrentFilter(data) {
      var result = false;
      var joinedEntity;
      var sharePropertyName;

      if ($scope.searchStatus.sharedEntityId === -1) {
        // 참여중인 모든 대화방
        result = true;
      } else if (data.room) {
        if (joinedEntity = EntityHandler.get(data.room.id)) {

          // room이 DM일 경우 'companionId'와 custom selector의 'sharedEntityId'를 비교하여야 한다.
          sharePropertyName = RoomTopicList.isExist(joinedEntity.id) ? 'id' : 'companionId';
          if (joinedEntity[sharePropertyName] === $scope.searchStatus.sharedEntityId) {
            result = true;
          }
        }
      }

      return result;
    }

    /**
     * 파일 공유 이벤트 핸들러
     * @param {object} data
     * @private
     */
    function _onFileShared(data) {
      var fileId = data.file.id;

      if ($scope.searchStatus.isInitDone) {
        _getValidFile(fileId)
          .then(function(file) {
            _addFile(file, true);
            _setSearchStatus(file.id, 1);
          });
      }
    }

    /**
     * 검색조건에 타당한 파일 전달
     * @param {number} fileId
     * @returns {*}
     * @private
     */
    function _getValidFile(fileId) {
      var defer = $q.defer();

      FileDetail.get(fileId)
        .success(function(response) {
          var file = _getFile(response.messageDetails);

          if (file && _isValidFile(file)) {
            defer.resolve(file);
          }
        });

      return defer.promise;
    }

    /**
     * 검색조건(키워드, 업로드 멤버, 파일 타입)에 맞는 파일인지 여부
     * @param {object} file
     * @returns {boolean}
     * @private
     */
    function _isValidFile(file) {
      return ($scope.searchStatus.writerId === 'all' || $scope.searchStatus.writerId === file.writerId) &&
        ($scope.searchStatus.fileType === 'all' || $scope.searchStatus.fileType === file.content.filterType) &&
        ($scope.searchStatus.q === '' || file.content.title.indexOf($scope.searchStatus.q) > -1);
    }

    /**
     * 파일상세 정보 전달
     * @param messageDetails
     * @returns {*}
     * @private
     */
    function _getFile(messageDetails) {
      var file;

      _.each(messageDetails, function(item) {
        if (item.contentType === 'file') {
          file = item;
          return false;
        }
      });

      return file;
    }

    /**
     * 파일 삭제 이벤트 핸들러
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _onFileDelete($event, data) {
      var fileId = _.isNumber(data) ? data : data.file.id;

      _updateUnsharedFile(fileId);
    }

    /**
     * 파일 공유 해제 이벤트 핸들러
     * @param {object} data
     * @private
     */
    function _onFileUnshared(data) {
      var fileId = data.file.id;

      _updateUnsharedFile(fileId);
    }

    /**
     * 공유 해제된 파일을 갱신
     * @param {number} fileId
     * @private
     */
    function _updateUnsharedFile(fileId) {
      var file = _fileMap[fileId];
      var fileList;

      if (file) {
        fileList = $scope.fileList;

        fileList.splice(fileList.indexOf(file), 1);
        delete _fileMap[fileId];

        if (!fileList.length) {
          _refreshFileList();
        }
      }
    }

    /**
     * 파일 리스트 전체를 갱신
     * @private
     */
    function _refreshFileList() {
      if ($scope.status.isActive && $scope.isConnected) {
        _setRefreshStatus();

        if (_isValidSearchKeyword()) {
          _showLoading();
          _doGetFileList();
        }
      }
    }

    /**
     * refresh 상태 설정
     * @private
     */
    function _setRefreshStatus() {
      $scope.searchStatus.startMessageId = -1;
      $scope.searchStatus.isEndOfList = false;
    }

    /**
     * scrolling시 파일 목록 불러오기
     */
    function loadMore() {
      if (_isValidLoadMore()) {

        $scope.searchStatus.isScrollLoading = true;

        _doGetFileList();
      }
    }

    /**
     * load more 가능한지 여부
     * @returns {boolean}
     * @private
     */
    function _isValidLoadMore() {
      return !$scope.searchStatus.isSearching &&
          !$scope.searchStatus.isEndOfList &&
          !$scope.searchStatus.isScrollLoading &&
          !!$scope.fileList.length &&
          $scope.isConnected &&
          !isEmpty();
    }

    /**
     * getFileList를 수행함
     * 파일 리스트 갱신 또는 더 불러오기시 마지막에 수행된 getFileList를 수행하기 위함
     * 더 불러오기 수행중 파일 리스트 갱신 또는 이반대 경우에 잘못된 파일 리스트 갱신이 발생할 수 있음.
     * @private
     */
    function _doGetFileList() {
      /*
       rightPanelStatusChange 이벤트 및 모든 request payload의 파라미터의 watcher 에서 호출하기 때문에
       중복 호출을 방지하기 위하여 timeout 을 사용한다
       */
      $timeout.cancel(_timerSearch);
      _timerSearch = $timeout(function() {
        // 100ms 만큼 지난후 response가 도착하여 잘못된 list를 출력할 수 있으므로 식별자로 _timerSearch를 전달한다.
        _getFileList(_timerSearch);
      }, 100);
    }

    /**
     * 파일 목록 전달
     * @param {number} timerSearch
     */
    function _getFileList(timerSearch) {
      fileAPIservice.getFileList($scope.searchStatus)
        .success(function(response) {
          if (_isValidResponse(timerSearch)) {
            _analyticsFileListSuccess();
            _onSuccessFileList(response);
          }
        })
        .error(function(response, status) {
          if (_isValidResponse(timerSearch)) {
            _analyticsFileListError(response);
            _onErrorFileList(response, status);
          }
        })
        .finally(function() {
          if (_isValidResponse(timerSearch)) {
            _hideLoading();
          }
        });
    }

    /**
     * response가 타당한지 여부
     * @param {number} timerSearch
     * @returns {boolean}
     * @private
     */
    function _isValidResponse(timerSearch) {
      return timerSearch == null || _timerSearch === timerSearch;
    }

    /**
     * 파일 리스트 불러오기 성공
     * @param {object} response
     * @private
     */
    function _onSuccessFileList(response) {
      if ($scope.searchStatus.startMessageId === -1) {
        //  Not loading more.
        //  Replace current fileList with new fileList.
        $scope.fileList = [];
        _fileMap = {};
      }

      _.each(response.files, function(file) {
        _addFile(file);
      });

      _setSearchStatus(response.firstIdOfReceivedList, response.fileCount);
    }

    /**
     * 파일 리스트 불러오기 실패
     * @param {object} response
     * @param {number} status - http 상태 코드
     * @private
     */
    function _onErrorFileList(response, status) {
      JndUtil.alertUnknownError(response, status);
    }

    /**
     * 파일 리스트에 파일 추가
     * @param {object} file
     * @param {boolean} [isUnshift] - true이면 앞에 넣음
     * @private
     */
    function _addFile(file, isUnshift) {
      if (!_fileMap[file.id]) {
        file.shared = fileAPIservice.getSharedEntities(file);

        if (file.status !== 'archived') {
          if (!isUnshift) {
            $scope.fileList.push(file);
          } else {
            $scope.fileList.unshift(file);
          }
          _fileMap[file.id] = file;
        }
      }
    }

    /**
     * 파일 리스트 갱신이 발생한 직후 상태 설정
     * @param {number} firstIdOfReceivedList
     * @param {number} fileCount
     * @param {number} isInitDone
     */
    function _setSearchStatus(firstIdOfReceivedList, fileCount) {
      // 마지막 list id를 local varidable에 설정
      $scope.searchStatus.startMessageId = firstIdOfReceivedList;
      $scope.searchStatus.isEndOfList = $scope.fileList.length > 0 && $scope.searchStatus.listCount > fileCount;

      $scope.searchStatus.isSearching = false;
      $scope.searchStatus.isScrollLoading = false;
      $scope.searchStatus.isInitDone = true;

      $scope.searchStatus.type = _getSearchStatusType();
      $scope.searchStatus.length = $scope.fileList.length;
    }

    /**
     * 외부 파일공유 상태 변경 이벤트 핸들러
     * @param {object} $event
     * @param {object} data
     * @private
     */
    function _onFileShareChanged($event, data) {
      var fileId = data.id;
      var file = _fileMap[fileId];

      if (file) {
        file.content.externalUrl = data.content.externalUrl;
        file.content.externalCode = data.content.externalCode;
        file.content.externalShared = data.content.externalShared;
      }
    }

    /**
     * '공유된 곳' options 생성
     * @private
     */
    function _generateShareOptions() {
      $scope.selectOptions = TopicFolderModel.getNgOptions(
        fileAPIservice.getShareOptionsWithoutMe(RoomTopicList.toJSON(true), currentSessionHelper.getCurrentTeamUserList())
      );
    }

    /**
     * '공유된 곳' 값 설정
     * @param {object} [entity]
     * @private
     */
    function _setSharedInEntity(entity) {
      $scope.searchStatus.sharedEntityId = entity ? entity.id : -1;
    }

    /**
     * '업로드 멤버' 기본값 설정
     * @private
     */
    function _setDefaultSharedBy() {
      $scope.searchStatus.writerId = 'all';
    }

    /**
     * '파일 타입' 기본값 설정
     * @private
     */
    function _setDefaultFileType() {
      $scope.searchStatus.fileType = $scope.fileTypeList[0].value;
    }

    /**
     * Helper function of 'initSharedByFilter'.
     * @private
     */
    function _addToSharedByOption() {
      $scope.selectOptionsUsers = fileAPIservice.getShareOptions(currentSessionHelper.getCurrentTeamUserList());
    }

    /**
     * show loading
     * @private
     */
    function _showLoading() {
      $scope.searchStatus.isSearching = true;
      $scope.searchStatus.type = _getSearchStatusType();
      $scope.searchStatus.isScrollLoading = false;
    }

    /**
     * hide loading
     * @private
     */
    function _hideLoading() {
      $scope.searchStatus.isSearching = false;
      $scope.searchStatus.type = _getSearchStatusType();
    }

    /**
     * search status의 search하는 keyword 초기화
     * @private
     */
    function _resetSearchStatusKeyword() {
      $scope.searchStatus.q = $scope.searchStatus.keyword = '';
    }

    /**
     * '공유하기' 이벤트 핸들러
     * @param {object} file
     */
    function onClickShare(file) {
      modalHelper.openFileShareModal($scope, file);
    }

    /**
     * '공유해제하기' 이벤트 핸들러
     * @param {object} message
     * @param {object} entity
     */
    function onClickUnshare(message, entity) {
      fileAPIservice.unShareEntity(message.id, entity.id)
        .success(function() {
          _analyticsUnshareSuccess();

          Dialog.success({
            title: $filter('translate')('@success-file-unshare').replace('{{filename}}', message.content.title)
          });
        });
    }

    /**
     * 비활성 member 여부
     * @param {object} member
     * @returns {boolean|*}
     * @private
     */
    function _isDisabledMember(member) {
      return !!member && publicService.isDisabledMember(member);
    }

    /**
     * 파일 리스트가 비어있는지 여부
     * @returns {boolean}
     */
    function isEmpty() {
      return !$scope.fileList.length &&
          $scope.searchStatus.isInitDone &&
          !$scope.searchStatus.isSearching;
    }

    /**
     * True if use never changed any value in file search filter.
     * @returns {boolean}
     */
    function isFiltered() {
      return !isKeywordEmpty() ||
          !($scope.searchStatus.fileType === 'all') ||
          !($scope.searchStatus.writerId === 'all');
    }

    /**
     * 키워드가 비어있는지 여부
     * @returns {boolean}
     */
    function isKeywordEmpty() {
      return !$scope.searchStatus.keyword;
    }

    /**
     * 네트워크 활성 이벤트 핸들러
     * @private
     */
    function _onConnected() {
      _refreshView();
    }

    /**
     * view 갱신
     * @private
     */
    function _refreshView() {
      $scope.isConnected = true;

      if($scope.status.isActive) {
        _refreshFileList();
      } else {
        $scope.searchStatus.isInitDone = false;
      }
    }

    /**
     * 네크워크 비활성 이벤트 핸들러
     * @private
     */
    function _onDisconnected() {
      $scope.isConnected = false;
    }

    /**
     * 검색 상태 타입 전달
     * @returns {*|string}
     * @private
     */
    function _getSearchStatusType() {
      var type;

      if ($scope.searchStatus.isSearching) {
        type = 'progress';
      } else {
        if ($scope.fileList.length > 0) {
          if (!isKeywordEmpty()) {
            type = 'keywordSearch'
          } else {
            type = 'search';
          }
        }
      }

      return type || '';
    }

    /////////////////////////////////////////// analytics ////////////////////////////////////////////////

    /**
     * 파일 목록 성공 analytics
     * @private
     */
    function _analyticsFileListSuccess() {
      if ($scope.searchStatus.q !== "") {
        try {
          AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_KEYWORD_SEARCH, {
            'RESPONSE_SUCCESS': true,
            'SEARCH_KEYWORD': encodeURIComponent($scope.searchStatus.q)
          });
        } catch (e) {
        }
      }
    }

    /**
     * 파일 목록 에러 analytics
     * @param {object} error
     * @private
     */
    function _analyticsFileListError(error) {
      if ($scope.searchStatus.q !== "") {
        try {
          AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_KEYWORD_SEARCH, {
            'RESPONSE_SUCCESS': false,
            'ERROR_CODE': error.code
          });
        } catch (e) {
        }
      }
    }

    /**
     * 공유 해제성공 analytics
     * @private
     */
    function _analyticsUnshareSuccess() {
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
    }
  }
})();
