/**
 * @fileoverview search messages controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightMessagesCtrl', RightMessagesCtrl);

  /* @ngInject */
  function RightMessagesCtrl($scope, $timeout, AnalyticsHelper, currentSessionHelper, fileAPIservice, JndUtil,
                             messageAPIservice, RoomTopicList, TopicFolderModel) {
    var DEFAULT_PAGE = 1;
    var DEFAULT_PER_PAGE = 10;

    var _localCurrentEntity;
    var _timerSearch;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.messageList = [];

      $scope.searchStatus = {
        q: '',
        entityId: '',
        writerId: '',
        page: DEFAULT_PAGE,
        perPage: DEFAULT_PER_PAGE,

        isApiError: false,
        isSearching: false,
        isScrollLoading: false,
        isEndOfList: false,
        isInitDone: false,
        isKeywordFocus: false,

        length: '',
        type: ''
      };
      $scope.searchStatus.type = _getSearchStatusType();
      $scope.isConnected = true;

      // Methods
      $scope.loadMore = loadMore;

      $scope.onKeywordChange = onKeywordChange;
      $scope.onResetQuery = onResetQuery;

      $scope.isEmpty = isEmpty;
      $scope.isKeywordEmpty = isKeywordEmpty;
      $scope.setKeywordFocus = setKeywordFocus;

      _localCurrentEntity = currentSessionHelper.getCurrentEntity()

      _initChatRoomOption();
      _setChatRoom(_localCurrentEntity);

      _initChatWriterOption();
      _setDefaultWriter();

      _attachScopeEvents();
    }

    /**
     * attach scope events
     * @private
     */
    function _attachScopeEvents() {
      $scope.$on('EntityHandler:parseLeftSideMenuDataDone', _initChatRoomOption);

      $scope.$on('rightPanelStatusChange', _onRightPanelStatusChange);
      $scope.$on('topic-folder:update', _initChatRoomOption);
      $scope.$on('onCurrentEntityChanged', _onCurrentEntityChanged);

      $scope.$watch('searchStatus.entityId', _onSearchEntityChange);
      $scope.$watch('searchStatus.writerId', _onSearchWriterChange);

      // 컨넥션이 끊어졌다 연결되었을 때, refreshFileList 를 호출한다.
      $scope.$on('connected', _onConnected);
      $scope.$on('disconnected', _onDisconnected);
      $scope.$on('NetInterceptor:onGatewayTimeoutError', _refreshView);
      $scope.$on('Auth:refreshTokenSuccess', _refreshView);
    }

    /**
     * '작성된 곳' 옵션 초기화
     * @private
     */
    function _initChatRoomOption() {
      var newOptions = fileAPIservice.getShareOptionsWithoutMe(
        RoomTopicList.toJSON(true),
        currentSessionHelper.getCurrentTeamUserList()
      );
      var newMessageLocation = _getMessageLocation(newOptions);
      $scope.chatRoomOptions = TopicFolderModel.getNgOptions(newOptions);

      if (newMessageLocation) {
        _setChatRoom(newMessageLocation);
      } else {
        _setChatRoom();
      }
    }

    /**
     * '작성자' 옵션 초기화
     * @private
     */
    function _initChatWriterOption() {
      $scope.chatWriterOptions = fileAPIservice.getShareOptions(currentSessionHelper.getCurrentTeamUserList());
    }

    /**
     * '작성된 곳' 값 변경 이벤트 핸들러
     * @param {number} newValue
     * @param {number} oldValue
     * @private
     */
    function _onSearchEntityChange(newValue, oldValue) {
      if (newValue !== oldValue) {
        _refreshMessageList();
      }
    }

    /**
     * '작성자' 값 변경 이벤트 핸들러
     * @param {number} newValue
     * @param {number} oldValue
     * @private
     */
    function _onSearchWriterChange(newValue, oldValue) {
      if (newValue !== oldValue) {
        _refreshMessageList();
      }
    }

    /**
     * 오른쪽 패널의 텝 열림 이벤트 핸들러
     * @private
     */
    function _onRightPanelStatusChange() {
      if ($scope.status.isActive && !$scope.searchStatus.isInitDone) {
        // 아직 초기화가 진행되어 있지 않다면 전체 갱신한다.

        _refreshMessageList();
      }
    }

    /**
     * 사용자가 센터에 보고 있는 room에 변경사항에 대한 이벤트 핸들러
     * @param {object} $event
     * @param {object} currentEntity
     * @private
     */
    function _onCurrentEntityChanged(event, currentEntity) {
      if ($scope.status.isActive && _hasLocalCurrentEntityChanged(currentEntity) && !_hasSearchResult()) {
        _localCurrentEntity = currentEntity;

        // 검색 결과를 유지할 이유가 없으므로 초기화 한다.
        $scope.messageList = [];
        $scope.searchStatus.page = DEFAULT_PAGE;

        // search keyword reset
        _setChatRoom(_localCurrentEntity);

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
      return _isValidSearchKeyword() &&
        $scope.messageList.length > 0;
    }

    /**
     * 검색 키워드 변경 이벤트 핸들러
     * @param {string} keyword
     */
    function onKeywordChange(keyword) {
      if (_isValidSearchKeyword()) {
        $scope.searchStatus.keyword = keyword;
        _refreshMessageList();
      }
    }

    /**
     * 타당한 검색 키워드 인지 여부
     * @returns {boolean}
     * @private
     */
    function _isValidSearchKeyword() {
      var keyword = $scope.searchStatus.q;
      return keyword !== '' && keyword.length > 1;
    }

    /**
     * 검색 조건(작성된 곳, 작성자) 초기화
     * @private
     */
    function onResetQuery() {
      _setChatRoom();
      _setDefaultWriter();
    }

    /**
     * 메시지 리스트 전체를 갱신
     * @private
     */
    function _refreshMessageList() {
      if ($scope.status.isActive && $scope.isConnected) {
        _setRefreshStatus();

        if (_isValidSearchKeyword()) {
          _showLoading();

          _doGetMessageList();
        }
      }
    }

    /**
     * refresh 상태 설정
     * @private
     */
    function _setRefreshStatus() {
      $scope.searchStatus.page = DEFAULT_PAGE;
      $scope.searchStatus.isApiError = false;
      $scope.searchStatus.isEndOfList = false;
    }

    /**
     * scrolling시 메시지 목록 불러오기
     */
    function loadMore() {
      if (_isValidLoadMore()) {
        $scope.searchStatus.isScrollLoading = true;

        _doGetMessageList();
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
          (!!$scope.messageList.length && $scope.searchStatus.keyword !== '') &&
          $scope.isConnected &&
          !isEmpty();
    }

    /**
     * _getMessageList를 수행함
     * 메세지 리스트 갱신 또는 더 불러오기시 마지막에 수행된 _getMessageList를 수행하기 위함
     * 더 불러오기 수행중 메세지 리스트 갱신 또는 이반대 경우에 잘못된 메시지 리스트 갱신이 발생할 수 있음.
     * @private
     */
    function _doGetMessageList() {
      /*
       rightPanelStatusChange 이벤트 및 모든 request payload의 파라미터의 watcher 에서 호출하기 때문에
       중복 호출을 방지하기 위하여 timeout 을 사용한다
       */
      $timeout.cancel(_timerSearch);
      _timerSearch = $timeout(function() {

        // 100ms 만큼 지난후 response가 도착하여 잘못된 list를 출력할 수 있으므로 식별자로 _timerSearch를 전달한다.
        _getMessageList(_timerSearch);
      }, 100);
    }

    /**
     * 메시지 목록 전달
     * @param {number} timerSearch
     */
    function _getMessageList(timerSearch) {
      $scope.searchStatus.keyword = $scope.searchStatus.q;

      messageAPIservice.searchMessages($scope.searchStatus)
        .success(function(response) {
          if (_isValidResponse(timerSearch)) {
            _analyticsSearchSuccess();
            _onSuccessMessageList(response);
          }
        })
        .error(function(response, status) {
          if (_isValidResponse(timerSearch)) {
            _analyticsSearchError(response);
            _onErrorMessageList(response, status);
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
     * 메시지 리스트 불러오기 성공
     * @param {object} response
     * @private
     */
    function _onSuccessMessageList(response) {
      var cursor = response.cursor;

      if ($scope.searchStatus.page === DEFAULT_PAGE) {
        $scope.messageList = [];
      }

      if (_isFirstPage(cursor)) {
        $scope.messageList = response.records;
      } else {
        $scope.messageList = $scope.messageList.concat(response.records);
      }

      _setSearchStatus(cursor);
    }

    /**
     * 파일 리스트 갱신이 발생한 직후 상태 설정
     * @param {object} cursor
     */
    function _setSearchStatus(cursor) {
      $scope.searchStatus.isSearching = false;
      $scope.searchStatus.isScrollLoading = false;
      $scope.searchStatus.isEndOfList = _isLastPage(cursor) && $scope.messageList.length > 0;
      $scope.searchStatus.isInitDone = true;

      $scope.searchStatus.type = _getSearchStatusType();
      $scope.searchStatus.length = cursor.totalCount;
      $scope.searchStatus.page = cursor.page + 1;
    }

    /**
     * Check if current page is first page by checking 'page' in cursor
     * @param cursor
     * @returns {boolean}
     * @private
     */
    function _isFirstPage(cursor) {
      return cursor.page == 1;
    }

    /**
     * 현재 검색하고 있는 페이지가 결과물의 마지막인지 확인한다.
     * @param {object} cursor - 서버로부터 내려온 결과물
     * @returns {boolean} isLastPage - true, if it is a last page
     * @private
     */
    function _isLastPage(cursor) {
      return cursor.page >= cursor.pageCount;
    }

    /**
     * 메시지 리스트 불러오기 실패
     * @param {object} response
     * @param {number} status - http 상태 코드
     * @private
     */
    function _onErrorMessageList(response, status) {
      $scope.searchStatus.isApiError = true;
      JndUtil.alertUnknownError(response, status);
    }

    /**
     * 오른쪽 상단에 있는 search input box 에 focus 를 맞춘다.
     * @type {setSearchInputFocus}
     */
    function setKeywordFocus() {
      $scope.searchStatus.isKeywordFocus = true;
    }

    /**
     * 새로 만들어진 list 에서 이전에 선택되어있던 value 를 찾는다.
     * 이렇게 하는 이유는 angular 에서 list 를 만들때 hash 를 사용한다.
     * 그래서 같은 토픽방이라도 이전 리스트에 있던 a 토픽과 새로운 리스트의 a 토픽은 서로 다른 hash 값을 가져서 단순 비교하면 새로운 리스트에서 찾지 못한다.
     * 그래서 리스트를 돌며 토픽의 id 값으로 비교해서 찾아야한다.
     * @param {array} newOptions - 새로운 'sent in' option
     * @returns {object} topic - 새로운 리스트에 있는 이전 토픽방
     * @private
     */
    function _getMessageLocation(newOptions) {
      var entityId = $scope.searchStatus.entityId;

      var length = newOptions.length;
      var i;

      if (entityId) {
        for (i = 0; i < length; i++) {
          if (entityId === newOptions[i].id) {
            return newOptions[i];
          }
        }
      }
    }

    /**
     * '작성자' 기본값 설정
     * @private
     */
    function _setDefaultWriter() {
      $scope.searchStatus.writerId = 'all';
    }

    /**
     * 로딩스크린을 보여준다.
      * @private
     */
    function _showLoading() {
      $scope.searchStatus.isSearching = true;
      $scope.searchStatus.type = _getSearchStatusType();
      $scope.searchStatus.isScrollLoading = false;
    }

    /**
     * 로딩바를 숨긴다.
     * @private
     */
    function _hideLoading() {
      $scope.searchStatus.isSearching = false;
      $scope.searchStatus.type = _getSearchStatusType();
    }

    /**
     * message 작성된 entity 설정
     * @param {object} [entity]
     * @private
     */
    function _setChatRoom(entity) {
      $scope.searchStatus.entityId = entity ? entity.id : '';
    }

    /**
     * search status의 search하는 keyword 초기화
     * @private
     */
    function _resetSearchStatusKeyword() {
      $scope.searchStatus.q = $scope.searchStatus.keyword = '';
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
        if ($scope.messageList.length > 0) {
          if (!isKeywordEmpty()) {
            type = 'keywordSearch'
          } else {
            type = 'search';
          }
        }
      }

      return type || '';
    }

    /**
     * 파일 리스트가 비어있는지 여부
     * @returns {boolean}
     */
    function isEmpty() {
      return !$scope.messageList.length &&
        $scope.searchStatus.isInitDone &&
        !$scope.searchStatus.isSearching;
    }

    /**
     * 키워드가 비어있는지 여부
     * @returns {boolean}
     */
    function isKeywordEmpty() {
      return !$scope.searchStatus.keyword && !$scope.messageList.length;
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
        _refreshMessageList();
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

    /////////////////////////////////////////// analytics ////////////////////////////////////////////////

    function _analyticsSearchSuccess() {
      //analytics
      try {
        AnalyticsHelper.track(AnalyticsHelper.EVENT.MESSAGE_KEYWORD_SEARCH, {
          'RESPONSE_SUCCESS': true,
          'SEARCH_KEYWORD': encodeURIComponent($scope.searchStatus.keyword)
        });
      } catch (e) {
      }
    }

    function _analyticsSearchError(err) {
      try {
        //analytics
        AnalyticsHelper.track(AnalyticsHelper.EVENT.MESSAGE_KEYWORD_SEARCH, {
          'RESPONSE_SUCCESS': true,
          'ERROR_CODE': err.code
        });
      } catch (e) {
      }
    }
  }
})();
