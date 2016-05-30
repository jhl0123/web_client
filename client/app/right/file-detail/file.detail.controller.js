/**
 * @fileoverview file detail controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('FileDetailCtrl', FileDetailCtrl);

  /* @ngInject */
  function FileDetailCtrl($scope, $filter, $q, $state, $timeout, FileDetail, jndPubSub, JndMessageStorage, CoreUtil,
                          memberService, publicService,RightPanel, Sticker, Tutorial, UserList, JndUtil) {
    var _fileId;
    var _requestFile;
    var _timerFileDetail;

    $scope.onMemberClick = onMemberClick;
    $scope.postComment = postComment;
    $scope.setMentionsGetter = setMentionsGetter;
    $scope.backToPrevState = backToPrevState;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      if (_isRedirectFileDetail()) {
        _setRightPanelTail(true);
        $state.go('messages.detail.' + (RightPanel.getTail() || 'files') + '.item', $state.params);
      } else {
        _setRightPanelTail(false);
        if (_fileId = $state.params.itemId) {
          _resetVariables();
          _setFileDetail();
          _attachEvents();
        }
      }
      Tutorial.hideTooltip('filetab');
    }

    /**
     * 내부에서 사용하는 변수를 초기화 한다.
     * @private
     */
    function _resetVariables() {
      $scope.hasInitialLoaded = false;
      // comment 작성 되지 않은 모음
      $scope.errorComments = [];
    }

    /**
     * attach events
     * @private
     */
    function _attachEvents() {
      $scope.$on('fileDetail:updateFile', _requestFileDetail);
      $scope.$on('fileDetail:updateComments', _requestFileDetail);
      $scope.$on('Router:fileChanged', _onFileChange);
      $scope.$on('rightFileDetailOnFileDeleted', _onRightFileDetailOnFileDeleted);
      $scope.$on('jndWebSocketMember:memberUpdated', _onUpdateMemberProfile);
    }


    /**
     * file 정보가 변경되었을 때 이벤트 핸들러
     * @param {object} angularEvent
     * @param {number} fileId
     * @private
     */
    function _onFileChange(angularEvent, fileId) {
      _fileId = fileId;
      _resetVariables();
      _setFileDetail();
    }

    /**
     * file detail을 설정한다.
     * @private
     */
    function _setFileDetail() {
      var fileDetail = FileDetail.getFileDetail();

      if (CoreUtil.pick(fileDetail, 'file', 'id') === _fileId) {
        // request하지 않아도 출력할 file object가 이미 존재함
        _onSuccessFileDetail(fileDetail);
      } else {
       _requestFileDetail();
      }
    }

    /**
     * request file detail
     * @private
     */
    function _requestFileDetail() {
      if (_isFileDetailActive()) {
        $timeout.cancel(_timerFileDetail);
        _timerFileDetail = $timeout(function() {
          _requestFile && _requestFile.abort();
          _requestFile = FileDetail.get(_fileId)
            .success(_onSuccessFileDetail)
            .error(_onErrorFileDetail)
        });
      }
    }

    /**
     * success file detail
     * @param {object} response
     * @private
     */
    function _onSuccessFileDetail(response) {
      var messageDetails;
      var fileDetail;
      
      if (response) {
        messageDetails = response.messageDetails;
        fileDetail = _getFileDetailData(messageDetails);
        _setFile(fileDetail.file);
        _setComments(fileDetail.comments);
      }

      $scope.hasInitialLoaded = true;
    }

    /**
     * file과 comments를 분류하여 전달한다.
     * @param {array} messageDetails
     * @returns {{file: *, comments: Array}}
     * @private
     */
    function _getFileDetailData(messageDetails) {
      var file;
      var comments = [];

      _.each(messageDetails, function(item) {
        if (item.contentType === 'file') {
          // file
          file = item;
          _setExtraData(item, item.writerId);
          $scope.isArchivedFile = _isArchivedFile(item);
        } else if (!_isArchivedFile(item)) {
          // etc
          _pushComment(item, comments);
        }
      });

      return {
        file: file,
        comments: comments
      };
    }

    /**
     * 삭제 상태인지 확인한다.
     * @param {object} file
     * @returns {boolean}
     * @private
     */
    function _isArchivedFile(file) {
      return file.status == 'archived';
    }

    /**
     * file 설정한다.
     * @param {object} file
     * @private
     */
    function _setFile(file) {
      $scope.file = file;

      // integrate file 여부
      $scope.isIntegrateFile = FileDetail.isIntegrateFile(file.content.serverUrl);

      // 관리자 인지 여부
      $scope.isAdmin = memberService.isAdmin();

      _setFileDownLoad();
    }

    /**
     * comments 설정한다.
     * @param {array} comments
     * @private
     */
    function _setComments(comments) {
      comments = _.sortBy(comments, 'createTime');
      _setCreateTime(comments);
      $scope.comments = comments;
    }

    /**
     * comments에 comment를 추가한다.
     * @param {object} item
     * @param {array} comments
     * @private
     */
    function _pushComment(item, comments) {
      var type = item.contentType;

      if (type === 'comment' || type === 'comment_sticker') {
        if (item.content && item.content.body) {
          item.content.body = _getSafeBody(item);
        }

        item.extIsSticker = type === 'comment_sticker';
        _setExtraData(item, item.writerId);

        comments.push(item);
      }
    }

    /**
     * safeBody 를 반환한다.
     * @param {object} item
     * @returns {*}
     * @private
     */
    function _getSafeBody(item) {
      var body = item.content.body;

      if (_.isObject(body)) {
        body = body.valueOf();
      }

      if (item.mentions && item.mentions.length > 0) {
        body = $filter('mention')(body, item.mentions);
        body = $filter('parseAnchor')(body);
        body = $filter('mentionHtmlDecode')(body);
      } else {
        body = $filter('parseAnchor')(body);
      }
      body = $filter('markdown')(body);
      return body;
    }

    /**
     * message에 추가 데이터를 가공하여 설정한다.
     * @param {object} target - 덧붙일 대상 message
     * @param {number|string} writerId - 작성자 ID
     * @private
     */
    function _setExtraData(target, writerId) {
      var writer = UserList.get(writerId);
      if (_.isObject(target)) {
        target.extWriter = writer;
        target.extWriterName = $filter('getName')(writer);
        target.extProfileImg = memberService.getProfileImage(writerId);
        target.extIsDisabledMember = publicService.isDisabledMember(writer);
      }
    }

    /**
     * error file detail
     * @private
     */
    function _onErrorFileDetail(data, status) {
      if (status === 403) {
        // permission error(비공개 file에 접근했다가 까임)

        $scope.hasInitialLoaded = $scope.isInvalidRequest = true;
        $state.go('messages.detail.files.item', $state.params);
      } else {
        // 에러 발생시 이전 상태로 이동하여 아무것도 출력되지 않는걸 방지한다.
        backToPrevState();
      }
    }

    /**
     * file detail을 출력하는 하도록 redirect 해야하는지 여부
     * @returns {boolean}
     * @private
     */
    function _isRedirectFileDetail() {
      return /redirect/.test($state.current.name);
    }

    /**
     * file detail에서 뒤로가야할 상태를 설정한다.
     * @param {boolean} isRedirect
     * @private
     */
    function _setRightPanelTail(isRedirect) {
      var activeMenu;

      if (isRedirect) {
        // 왼쪽 상단에 표시되는 back to list해야되는 target
        if ($state.params.tail != null) {
          RightPanel.setTail($state.params.tail);
        }
      } else if (activeMenu = RightPanel.getStateName($state.current)) {
        RightPanel.setTail(activeMenu);
      }
    }

    /**
     * user image click event handler
     * @param {object} user
     */
    function onMemberClick(member) {
      if (_.isNumber(member)) {
        member = UserList.get(member);
      }
      jndPubSub.pub('onMemberClick', member);
    }

    /**
     * comment가 작성된 날짜를 전달한다.
     * @param {number} index - current index
     * @param {object} comment - current comment
     * @returns {string} comment 작성 날짜
     */
    function _setCreateTime(comments) {
      var prevComment;

      _.each(comments, function(comment, index) {
        var createTime;

        comment.extCreateTime = new Date(comment.createTime);
        prevComment = comments[index -1];

        if (!prevComment ||
          prevComment.extCreateTime.getYear() !== comment.extCreateTime.getYear() ||
          prevComment.extCreateTime.getMonth() !== comment.extCreateTime.getMonth() ||
          prevComment.extCreateTime.getDate() !== comment.extCreateTime.getDate()) {
          createTime = $filter('getyyyyMMddformat')(comment.createTime);
        } else {
          createTime = $filter('date')(comment.createTime, 'h:mm a');
        }

        comment.extCreateTimeView = createTime;
      });
    }

    /**
     * updateMemberProfile event handler
     * @param {object} angularEvent
     * @param {{event: object, member: object}} data
     * @private
     */
    function _onUpdateMemberProfile(angularEvent, data) {
      var file = $scope.file;
      var comments = $scope.comments;
      var id = data.member.id;

      if (file && file.writerId === id) {
        _setExtraData(file, id);
      }

      _.forEach(comments, function(comment) {
        if (comment.writerId === id) {
          _setExtraData(comment, id);
        }
      });
    }

    /**
     * file 삭제 event handler
     * @param angularEvent
     * @param param
     * @private
     */
    function _onRightFileDetailOnFileDeleted(angularEvent, param) {
      var deletedFileId = param.file.id;

      if (_fileId == deletedFileId) {
        _setFileDetail();
      }

      // file 삭제 된다면 comment input 삭제
      JndMessageStorage.removeCommentInput(deletedFileId);
    }

    /**
     * 현재 file detail tab 을 보고있는지 안 보고있는지 알려준다.
     * @returns {boolean} true - file deatil tab 을 보고 있을 경우
     * @private
     */
    function _isFileDetailActive() {
      return _fileId && $state.params.itemId != null && $state.params.itemId !== '';
    }

    /**
     * comment 입력이 끝나 post 중이고 comments 갱신 중인 comment를 추가한다.
     * @param {object} data
     * @returns {{sticker: *, comment: *}}
     * @private
     */
    function _addSendingComment(data) {
      var comments = $scope.comments;
      var sendingComment;
      var sendingSticker;
      var sticker;
      var comment;

      // sticker와 comment가 같이 존재한다면 sticker가 먼저 입력되도록 한다.

      if (sticker = data.sticker) {
        sendingSticker = _getSendingComment('comment_sticker', sticker);
        _pushComment(sendingSticker, comments);
      }

      if (comment = data.comment) {
        sendingComment = _getSendingComment('comment', comment);
        _pushComment(sendingComment, comments);
      }

      // comments에 추가함
      _setComments(comments);

      return {
        sticker: sendingSticker,
        comment: sendingComment
      };
    }

    /**
     * post 중인 comment를 전달한다.
     * @param {string} type
     * @param {object} value
     * @returns {{writerId: *, contentType: *, createTime: Date, isSendingComment: boolean}}
     * @private
     */
    function _getSendingComment(type, value) {
      var currentMember = memberService.getMember();
      var sendingComment = {
        writerId: currentMember.id,
        contentType: type,
        createTime: new Date(),
        isSendingComment: true
      };

      if (type === 'comment') {
        sendingComment.content = {body: value};
      } else if (type === 'comment_sticker') {
        sendingComment.content = {url: Sticker.getRetinaStickerUrl(value.url)};
        sendingComment.originSticker = value;
      }

      return sendingComment;
    }

    /**
     * comment를 post 한다.
     * @param {string} comment
     * @param {object} sticker
     * @returns {deferred.promise|{then, always}}
     */
    function postComment(comment, sticker) {
      var deferred = $q.defer();
      var fileId = $scope.file.id;
      var content;
      var mentions;

      var result;

      if (comment || sticker) {
        if ($scope.getMentions) {
          if (content = $scope.getMentions()) {
            comment = content.msg;
            mentions = content.mentions;
          }
        }

        _requestFile && _requestFile.abort();

        result = _addSendingComment({comment: comment, sticker: sticker});
        FileDetail.postComment(fileId, comment, sticker, mentions)
          .error(function() {
            result.comment && _setErrorComments(result.comment);
            result.sticker && _setErrorComments(result.sticker);
          })
          .finally(function() {
            JndMessageStorage.removeCommentInput(fileId);
            deferred.resolve();
          });
      }

      return deferred.promise;
    }

    /**
     * comment 작성 error handler
     * @param {object} comment
     * @private
     */
    function _setErrorComments(comment) {
      var index = $scope.comments.indexOf(comment);

      if (index > -1) {
        $scope.comments.splice(index, 1);
      }
      $scope.errorComments.push(comment);
    }

    /**
     * mention getter 설정한다.
     * @param {function} getter
     */
    function setMentionsGetter(getter) {
      $scope.getMentions = getter;
    }

    /**
     * Redirect user back to prev state.
     */
    function backToPrevState() {
      $state.go('messages.detail.' + (RightPanel.getTail() || 'files'));
    }

    /**
     * file download 값을 설정한다.
     * @private
     */
    function _setFileDownLoad() {
      var file = $scope.file;
      var value = $filter('downloadFile')($scope.isIntegrateFile, file.content.name, file.content.fileUrl);

      $scope.downloadUrl = value.downloadUrl;
      $scope.originalUrl = value.originalUrl;
    }
  }
})();
