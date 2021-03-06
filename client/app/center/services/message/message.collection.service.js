/**
 * @fileoverview 메세지 콜렉션 클래스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('MessageCollection', MessageCollection);

  /* @ngInject */
  function MessageCollection($q, $filter, $injector, $rootScope, RoomTopicList, CoreUtil, markerService, jndPubSub, memberService,
                             currentSessionHelper, centerService, MessageComment, MessageText, DateFormatter, EntityFilterMember,
                             messageAPIservice, MessageQuery, JndUtil, NetInterceptor) {
    /**
     * 한번에 조회할 기본 메시지 개수
     * @type {number}
     */
    var DEFAULT_MESSAGE_UPDATE_COUNT = 50;

    /**
     * 검색으로 질의할 경우, 한번에 조회할 메시지 개수
     * @type {number}
     */
    var DEFAULT_MESSAGE_SEARCH_COUNT = 150;

    /**
     * 캐시에 저장할 MAX 메시지 값
     * @type {number}
     */
    var MAX_CACHE_MESSAGE_COUNT = 100;
    var EntityHandler;

    /**
     * 메시지 콜랙션 클래스
     * @constructor
     */
    var MessageCollectionClass = CoreUtil.defineClass({
      /**
       * 생성자
       * @param {object} options
       *    @param {number|string} options.id - 식별할 id 값.
       */
      init: function(options) {
        var id = CoreUtil.pick(options, 'id');

        EntityHandler = EntityHandler || $injector.get('EntityHandler');
        this.setOwnProperties({
          id: id || 0,
          list: [],
          roomData: {
            firstLinkId: -1,
            lastLinkId: -1,
            globalLastLinkId: -1,
            lastReadLinkId: -1
          },
          status: {
            isInitialized: false,
            isInitialRequestSuccess: false,
            isLoading: false
          },         

          _scope: $rootScope.$new(),
          _systemMessageCount: 0,
          _linkId: {
            first: -1,
            last: -1
          },
          _map: {
            messageId: {},
            id: {},
            feedback: {}
          },
          _deferred: null,
          _requestPromise: null
        });
        this._attachScopeEvents();
        this.initialRequest();
      },
      
      /**
       * 데이터 초기화 후 현재 로그인 한 User 의 Marker 기준으로 데이터를 request 한다. 
       * @returns {*}
       */
      initialRequest: function() {
        var linkId = this.roomData.lastReadLinkId = memberService.getLastReadMessageMarker(this._getCurrentRoomId());

        this.reset();
        this._requestPromise = this.request({
          linkId: linkId,
          count: DEFAULT_MESSAGE_UPDATE_COUNT
        });
        return this._requestPromise;
      },

      /**
       * request promise 객체를 반환한다.
       * @returns {*}
       */
      getRequestPromise: function() {
        return this._requestPromise;
      },

      /**
       * 해당 collection 이 보이지 않게 되었을 경우 Background 에서 로직을 수행할 수 있도록 설정한다
       */
      toBackground: function() {
        if (!this.hasLastMessage()) {
          this.initialRequest();
        } else {
          this._cutByMaxCacheCount();
        }
      },

      /**
       * 현재 객체에 종속적인 속성들을 할당한다.
       * @param {object} properties
       * @returns {MessageCollectionClass}
       */
      setOwnProperties: function(properties) {
        _.forEach(properties, function(value, name) {
          this[name] = value;
        }, this);
        return this;
      },

      /**
       * 랜더링을 요청한다.
       */
      render: function() {
        this._pub('MessageCollection:render');
      },
      
      /**
       * scope 이벤트를 바인딩 한다.
       * @private
       */
      _attachScopeEvents: function() {
        this._scope.$on('jndWebSocketMessage:messageCreated', _.bind(this._onMessageCreated, this));
        this._scope.$on('jndWebSocketMessage:messageDeleted', _.bind(this._onMessageDeleted, this));
        this._scope.$on('jndWebSocketFile:commentDeleted', _.bind(this._onFileCommentDeleted, this));
        this._scope.$on('jndWebSocketFile:commentCreated', _.bind(this._onFileCommentCreated, this));

        this._scope.$on('jndWebSocketFile:fileShared', _.bind(this._onFileShared, this));
        this._scope.$on('jndWebSocketFile:fileUnshared', _.bind(this._onFileUnshared, this));
        this._scope.$on('jndWebSocketFile:fileDeleted', _.bind(this._onFileDeleted, this));
        
        this._scope.$on('externalFile:fileShareChanged', _.bind(this._onExternalFileShareChanged, this));
        this._scope.$on('jndWebSocketMessage:starred', _.bind(this._onStarred, this));
        this._scope.$on('jndWebSocketMessage:unStarred', _.bind(this._onUnStarred, this));        
        
        this._scope.$on('NetInterceptor:connect', _.bind(this._check, this));
        this._scope.$on('NetInterceptor:disconnect', _.bind(this._cancelRequest, this));
        this._scope.$on('NetInterceptor:onGatewayTimeoutError', _.bind(this._check, this));
        this._scope.$on('jndWebSocket:connect', _.bind(this._check, this));
        
        this._scope.$on('MessageCacheCollection:getEventHistoryError', _.bind(this.initialRequest, this));
        
        this._scope.$on('jndWebSocketFile:externalFileShared', _.bind(this._onExternalFileStatusChange, this));
        this._scope.$on('jndWebSocketFile:externalFileUnShared', _.bind(this._onExternalFileStatusChange, this));
      },

      /**
       * 현재 캐시 상태를 체크하고, 데이터가 없다면 다시 initialRequest 를 요청한다.
       * @private
       */
      _check: function() {
        var status = this.status;
        if (!status.isInitialRequestSuccess && !status.isLoading) {
          this.initialRequest();
        }
      },

      /**
       * request 를 cancel 한다.
       * @private
       */
      _cancelRequest: function() {
        if (this._deferred) {
          this._deferred.resolve();
        }
      },
      
      /**
       * message created 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} socketEvent
       *    @param {object} socketEvent.data
       *    @param {object} socketEvent.data.linkMessage  - 메시지 데이터
       * @private
       */
      _onMessageCreated: function(angularEvent, socketEvent) {
        var message = CoreUtil.pick(socketEvent, 'data', 'linkMessage');
        var toEntities = CoreUtil.pick(message, 'toEntity');
        var isCurrentRoomMessage =_.contains(toEntities, this._getCurrentRoomId());

        if (isCurrentRoomMessage) {
          if (this.hasLastMessage()) {
            this.append(message, true);
          }
          if (this._isSystemMessage(message)) {
            this._pub('MessageCollection:newSystemMessageArrived', message);
          } else {
            this._pub('MessageCollection:newMessageArrived', message);
          }
        }
      },

      /**
       * 외부 파일 공유 해제 시 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} socketEvent
       * @private
       */
      _onExternalFileStatusChange: function(angularEvent, socketEvent) {
        var messageId = socketEvent.data.messageId;
        var fileData = socketEvent.data.fileData;
        var msg = this.getByMessageId(messageId);
        var comments = this.getByFeedbackId(messageId);

        if (msg) {
          _.extend(msg.message.content, fileData);
        }
        _.forEach(comments, function(comment) {
          _.extend(comment.feedback.content, fileData);
        }, this);
      },
      
      /**
       * message 삭제 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} socketEvent
       * @private
       */
      _onMessageDeleted: function(angularEvent, socketEvent) {
        if (socketEvent.room.id === this._getCurrentRoomId()) {
          this.removeByMessageId(socketEvent.messageId, true);
        }
        this._pub('MessageCollection:messageDeleted', socketEvent.messageId);
      },

      /**
       * file comment 삭제 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} socketEvent
       * @private
       */
      _onFileCommentDeleted: function(angularEvent, socketEvent) {
        var fileId = socketEvent.file.id;
        var commentCount = socketEvent.file.commentCount;
        var currentRoomId = this._getCurrentRoomId();
        var isCurrentRoomComment = _.some(socketEvent.rooms, {
          id: currentRoomId
        });

        if (isCurrentRoomComment) {
          this.removeByMessageId(socketEvent.comment.id, true);
          this._pub('MessageCollection:commentDeleted', socketEvent.comment.id);
        }
        this._updateFileCommentCount(fileId, commentCount);
      },

      /**
       * file comment 생성 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} socketEvent
       * @private
       */
      _onFileCommentCreated: function(angularEvent, socketEvent) {
        var fileId = socketEvent.file.id;
        var commentCount = socketEvent.file.commentCount;
        this._updateFileCommentCount(fileId, commentCount);
      },

      /**
       * file comment 숫자를 업데이트 한다.
       * @param {number} fileId
       * @param {number} commentCount
       * @private
       */
      _updateFileCommentCount: function(fileId, commentCount) {
        this._updateMessagesWithComments(fileId, {
          commentCount: commentCount
        }, true);
        this._pub('MessageCollection:refresh:commentCount', fileId, commentCount);
      },

      /**
       * file 공유 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} socketEvent
       * @private
       */
      _onFileShared: function(angularEvent, socketEvent) {
        var fileId = socketEvent.file.id;
        var shareEntities = socketEvent.file.shareEntities;
        this._updateMessagesWithComments(fileId, {
          shareEntities: shareEntities
        });
      },

      /**
       * file unshare 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} socketEvent
       * @private
       */
      _onFileUnshared: function(angularEvent, socketEvent) {
        var fileId = socketEvent.file.id;
        var unshareRoomId = socketEvent.room.id;
        var shareEntities;
        var msg = this.getByMessageId(fileId);
        var comments = this.getByFeedbackId(fileId);

        if (msg) {
          shareEntities = _.reject(msg.message.shareEntities, function(roomId) {
            return unshareRoomId === roomId; 
          });
        } else if (comments.length) {
          shareEntities = _.reject(comments[0].feedback.shareEntities, function(roomId) {
            return unshareRoomId === roomId;
          });
        }
        if (shareEntities) {
          this._updateMessagesWithComments(fileId, {
            shareEntities: shareEntities
          });
        }
      },

      /**
       * file 삭제 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} socketEvent
       * @private
       */
      _onFileDeleted: function(angularEvent, socketEvent) {
        var fileId = socketEvent.file.id;
        this._updateMessagesWithComments(fileId, {
          status: 'archived'
        });
      },

      /**
       * 코멘트가 달린 메시지에 대해 데이터 업데이트를 하고 각각의 메시지에 대해 refresh 이벤트를 trigger 한다. 
       * @param {number} messageId
       * @param {object} obj - 확장할 데이터
       * @param {boolean} isPreventEvent - refresh 이벤트를 트리거 할지 여부
       * @private
       */
      _updateMessagesWithComments: function(messageId, obj, isPreventEvent) {
        var msg = this.getByMessageId(messageId);
        var comments = this.getByFeedbackId(messageId);

        if (msg) {
          _.extend(msg.message, obj);
          if (!isPreventEvent) {
            this._pub('MessageCollection:refresh', msg);
          }
        }
        _.forEach(comments, function(comment) {
          _.extend(comment.feedback, obj);
          if (!isPreventEvent) {
            this._pub('MessageCollection:refresh', comment);
          }
        }, this);
      },

      /**
       * star 소켓 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      _onStarred: function(angularEvent, data) {
        var teamId = memberService.getTeamId();
        if (teamId.toString() === data.teamId.toString()) {
          this._setStarred(data.messageId, true);
        }
      },

      /**
       * unstar 소켓 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      _onUnStarred: function(angularEvent, data) {
        var teamId = memberService.getTeamId();
        if (teamId.toString() === data.teamId.toString()) {
          this._setStarred(data.messageId, false);
        }
      },

      /**
       * star 표시를 한다.
       * @param {number} messageId
       * @param {boolean} isStarred
       * @private
       */
      _setStarred: function(messageId, isStarred) {
        var msg = this.getByMessageId(messageId);
        var comments = this.getByFeedbackId(messageId);
        if (msg) {
          _.extend(msg.message, {
            isStarred: isStarred
          });
          this._pub('MessageCollection:refresh:star', msg.id, msg.message.id, isStarred);
        }
        _.forEach(comments, function(comment) {
          _.extend(comment.feedback,  {
            isStarred: isStarred
          });
          this._pub('MessageCollection:refresh:star', comment.id, comment.feedback.id, isStarred);
        }, this);
      },
      
      
      /**
       * 외부 파일 공유 상태 변경시 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      _onExternalFileShareChanged: function(angularEvent, data) {
        var msg;
        if (data.roomId === this.id) {
          msg = this.getByMessageId(data.id);
          if (msg && msg.message.contentType === 'file') {
            msg.message.content.externalShared = data.content.externalShared;
          }
        } 
      },
      
      /**
       * 서버로 질의를 요청한다.
       * @param {object} [query] - 없을 경우 MessageQuery 에 저장된 값을 사용한다.
       *    @param {number} query.count 
       *    @param {number} query.linkId
       *    @param {number} [query.type]
       * @returns {*}
       */
      request: function(query) {
        var id = this.id;
        var room = EntityHandler.get(id);
        var type = CoreUtil.pick(room, 'type');
        if (type == 'bots') {
          type = 'users';
        }

        if (this._deferred) {
          this._deferred.resolve();
        }
        this._deferred = $q.defer();

        if (NetInterceptor.isConnected()) {
          this.status.isLoading = true;

          query = query || MessageQuery.get();
          query = _.cloneDeep(query);



          return messageAPIservice.getMessages(type, id, query, this._deferred)
            .then(
              _.bind(this._onSuccessRequest, this, query),
              _.bind(this._onErrorRequest, this, query));
        } else {
          this._deferred.reject();
          return this._deferred.promise;
        }

      },

      /**
       * request 가 끝났을 때의 이벤트 핸들러
       * @private
       */
      _onDoneRequest: function() {
        _.extend(this.status, {
          isLoading: false,
          isInitialized: true
        });
      },

      /**
       * request 성공 이벤트 핸들러
       * @param {object} query  - 성공시 질의했던 request query
       * @param {object} result - 응답
       *    @param {object} result.data - 응답 데이터
       * @private
       */
      _onSuccessRequest: function(query, result) {
        var response = result.data;
        var messageList = response.records;
        this.status.isInitialRequestSuccess = true;
        this._onDoneRequest();
        _.extend(this.roomData, {
          firstLinkId: response.firstLinkId,
          lastLinkId: response.lastLinkId,
          globalLastLinkId: response.globalLastLinkId
        });
        
        if (query.type === 'old') {
          this.prepend(messageList);
        } else {
          this.append(messageList);
        }

        this._pub('MessageCollection:requestSuccess', response, query);
      },

      /**
       * request 실패시 핸들러
       * @param query
       * @param result
       * @private
       */
      _onErrorRequest: function(query, result) {
        this._onDoneRequest();
        if (this._isCurrentRoom()) {
          JndUtil.alertUnknownError(result.data, result.status);
        }
        this._pub('MessageCollection:requestError', result, query);
      },
      
      /**
       * 번수를 초기화 한다.
       */
      reset: function() {
        if (this.status.isInitialized) {
          this.list = [];
          this._map = {
            messageId: {},
            id: {},
            feedback: {}
          };
          this._linkId = {
            first: -1,
            last: -1
          };
          this.roomData = {
            firstLinkId: -1,
            lastLinkId: -1,
            globalLastLinkId: -1,
            lastReadLinkId: -1
          };
          this.status.isInitialized = false;
          this.status.isInitialRequestSuccess = false;
          this.status.isLoading = false;

          this._pub('MessageCollection:reset');
        }
      },

      /**
       * for each
       * @param {function} iteratee
       * @param {object} [context]
       */
      forEach: function(iteratee, context) {
        _.forEach(this.list, iteratee, context);
      },

      /**
       * messageList 를 append 한다.
       * @param {array|object} messageList
       * @param {boolean} [isAllowEmbed=false] - messageList 값을 현재 메시지 중간에 끼워넣는 것을 허용할지 여부 
       */
      append: function(messageList, isAllowEmbed) {
        var list = this.list;
        var length = list.length;
        var lastId = list[length - 1] && list[length - 1].id || -1;
        var appendList = [];
        var index;

        if (this.status.isInitialRequestSuccess) {
          messageList = this.beforeAddMessages(messageList);
          _.forEach(messageList, function (msg) {
            if (lastId < msg.id) {
              msg = this.getFormattedMessage(msg);
              list.push(msg);
              appendList.push(msg);
              //작성자의 marker 정보를 업데이트 한다
              this._updateMarker(msg);

              //linkId 가 중간에 끼워야 하는 값이라면
            } else if (isAllowEmbed && !this._map.id[msg.id]) {
              msg = this.getFormattedMessage(msg);
              index = this._getEmbedPosition(msg);
              if (index > 0) {
                list.splice(index + 1, 0, msg);
                this._setLinkId([msg]);
                this._addIndexMap([msg]);
                this._updateMarker(msg);
                this._pub('MessageCollection:embed', msg, index + 1);
              }
            }
          }, this);


          this._addIndexMap(appendList);
          this._setLinkId(appendList);

          if (!this._isCurrentRoom()) {
            this._cutByMaxCacheCount();
            appendList = this.list;
          }
          this._pub('MessageCollection:append', appendList);
        }
      },

      /**
       * 인자로 받은 메시지가 중간에 들아갈 index 값을 반환한다.
       * @param {object} msg
       * @returns {number}
       * @private
       */
      _getEmbedPosition: function(msg) {
        var list = this.list;
        var index = -1;
        _.forEachRight(list, function(message, i) {
          if (message.id < msg.id) {
            index = i;
            return false;
          }
        });
        return index;
      },

      /**
       * max cache 세팅값에 따라 list 를 자른다.
       * @private
       */
      _cutByMaxCacheCount: function() {
        var list = this.list;
        var length = list.length;
        var difference = length - MAX_CACHE_MESSAGE_COUNT;
        var i;
        var lastReadLinkId = memberService.getLastReadMessageMarker(this._getCurrentRoomId());
        var lastReadIndex = this.at(lastReadLinkId);
        var threshold = Math.floor((MAX_CACHE_MESSAGE_COUNT - 1) / 2);
        var startIdx = Math.max(0, lastReadIndex - threshold);
        var endIdx = Math.min(lastReadIndex + threshold, length);
        var removeIds = [];

        if (difference > 0) {
          for (i = 0; i < startIdx; i++) {
            removeIds.push(list[i].id);
          }
          for (i = endIdx; i < length; i ++) {
            removeIds.push(list[i].id);
          }

          _.forEach(removeIds, function(removeId) {
            this.remove(removeId);
          }, this);
          this._setLinkId(list);
        }
      },

      /**
       * 작성자의 marker 정보를 업데이트 한다.
       * @param {object} msg
       * @private
       */
      _updateMarker: function(msg) {
        var markerId;
        var writerId = CoreUtil.pick(msg, 'extWriter', 'id') || CoreUtil.pick(msg, 'message', 'writerId');
        if (this._isCurrentRoom()) {
          markerId = markerService.getLastLinkIdOfMemberId(writerId);
          if (!markerId || markerId < msg.id) {
            markerService.updateMarker(writerId, msg.id);
          }
        }
        
      },

      /**
       * id 와 messageId 로 index 된 Map 에 데이터를 추가한다.
       * @param {Array} list
       * @private
       */
      _addIndexMap: function(list) {
        var map = this._map;
        var feedbackMessageId;
        _.forEach(list, function(msg) {
          map.id[msg.id] = msg;
          map.messageId[msg.messageId] = msg;
          if (msg && msg.feedback && msg.feedback.id) {
            feedbackMessageId = msg.feedback.id;
            map.feedback[feedbackMessageId] = map.feedback[feedbackMessageId] || [];
            map.feedback[feedbackMessageId].push(msg);
          }
        }, this);

      },

      /**
       * id 와 messageId 로 index 된 Map 에서 msg 에 해당하는 데이터를 제거한다.
       * @param {object} msg
       * @private
       */
      _removeIndexMap: function (msg) {
        var map = this._map;
        var feedbackMessageId = msg && msg.feedback && msg.feedback.id;
        map.id[msg.id] = null;
        delete map.id[msg.id];
        map.messageId[msg.messageId] = null;
        delete map.messageId[msg.messageId];
        if (feedbackMessageId && map.feedback[feedbackMessageId]) {
          _.forEach(map.feedback[feedbackMessageId], function(feedbackMsg, index) {
            if (msg.id === feedbackMsg.id) {
              map.feedback[feedbackMessageId].splice(index, 1);
              return false;
            }
          });
        }
      },

      /**
       * messageList 를 prepend 한다.
       * @param {array|object} messageList
       */
      prepend: function(messageList) {
        var list = this.list;
        var firstId = list[0] && list[0].id || -1;
        var prependList = [];
        if (this.status.isInitialRequestSuccess) {
          messageList = this.beforeAddMessages(messageList);
          _.forEachRight(messageList, function (msg) {
            if (firstId === -1 || firstId > msg.id) {
              msg = this.getFormattedMessage(msg);
              list.unshift(msg);
              prependList.unshift(msg);
              this._updateMarker(msg);
            }
          }, this);

          this._setLinkId(prependList);
          this._addIndexMap(prependList);
          if (!this._isCurrentRoom()) {
            this._cutByMaxCacheCount();
            prependList = this.list;
          }
          this._pub('MessageCollection:prepend', prependList);
        }
      },

      /**
       * 메세지를 삭제한다.
       * @param {number} linkId
       * @param {boolean} [isReversal] 역순으로 순회할지 여부
       * @returns {boolean} 삭제에 성공했는지 여부
       */
      remove: function(linkId, isReversal) {
        var targetIdx = this.at(linkId, isReversal);
        
        if (targetIdx !== -1) {
          this._pub('MessageCollection:beforeRemove', targetIdx);
          this._removeIndexMap(this.get(linkId));
          this.list.splice(targetIdx, 1);
          this._pub('MessageCollection:remove', targetIdx);
        }
        return targetIdx !== -1;
      },

      /**
       * 메세지 id 로 메시지를 삭제한다.
       * @param {number|string} messageId 메세지 id
       * @param {boolean} [isReversal] 역순으로 순회할지 여부
       * @returns {boolean} 삭제에 성공했는지 여부
       */
      removeByMessageId: function(messageId, isReversal) {
        var targetIdx = this.atByMessageId(messageId, isReversal);

        if (targetIdx !== -1) {
          this._pub('MessageCollection:beforeRemove', targetIdx);
          this._removeIndexMap(this.getByMessageId(messageId));
          this.list.splice(targetIdx, 1);
          this._pub('MessageCollection:remove', targetIdx);
        }
        return targetIdx !== -1;
      },

      /**
       * messageId 에 해당하는 message 를 반환한다.
       * @param {number|string} messageId messageId 메세지 id
       * @returns {*}
       */
      getByMessageId: function(messageId) {
        return this._map.messageId[messageId];
      },

      /**
       * feedback id ( =fileId =messageId) 를 가진 메시지들을 반환한다.
       * @param {number} feedbackId
       * @returns {Array} feedbackId 를 가지고 있는 메시지 리스트
       */
      getByFeedbackId: function(feedbackId) {
        return this._map.feedback[feedbackId] || [];
      },

      /**
       * id 에 해당하는 message 를 반환한다.
       * @param {number|string} id 메세지 id
       * @returns {*}
       */
      get: function(id) {
        return this._map.id[id];
      },

      /**
       * messageId 에 해당하는 message 가 몇번째 index 인지 반환한다.
       * @param {number|string} messageId messageId 메세지 id
       * @param {boolean} [isReversal=false] 역순으로 순회할지 여부
       * @returns {number}
       */
      atByMessageId: function(messageId, isReversal) {
        return this._at('messageId', messageId, isReversal);
      },

      /**
       * linkId 에 해당하는 message 가 몇번째 index 인지 반환한다.
       * @param {number|string} id - linkId
       * @param {boolean} [isReversal=false] - 역순으로 순회할지 여부
       * @returns {number}
       */
      at: function(id, isReversal) {
        return this._at('id', id, isReversal);
      },

      /**
       * key, value 에 해당하는 message 가 몇번째 index 인지 반환한다.
       * @param {string} key - 조회할 속성명
       * @param {number|string} value - linkId
       * @param {boolean} [isReversal=false] - 역순으로 순회할지 여부
       * @returns {number}
       */
      _at: function(key, value, isReversal) {
        var targetIdx = -1;
        var list = this.list;
        var iterator = isReversal ? _.forEachRight : _.forEach;
        if (value) {
          iterator(list, function (message, index) {
            if (message[key].toString() === value.toString()) {
              targetIdx = index;
              return false;
            }
          });
        }

        return targetIdx;
      },

      /**
       * text 인지 여부를 반환한다.
       * @param {number} index
       * @returns {*|boolean}
       */
      isText: function(index) {
        var contentType = this.getContentType(index);
        return centerService.isTextType(contentType);
      },
      
      /**
       * comment 인지 여부를 반환한다.
       * @param {number} index
       * @returns {*|boolean}
       */
      isComment: function(index) {
        var contentType = this.getContentType(index);
        return centerService.isCommentType(contentType);
      },
      
      /**
       * child text 인지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      isChildText: function(index) {
        var contentType = this.getContentType(index);
        return !!(centerService.isTextType(contentType) && MessageText.isChild(index, this.list));
      },

      /**
       * child text 가지고 있는지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      hasChildText: function(index) {
        var contentType = this.getContentType(index);
        return !!(centerService.isTextType(contentType) && MessageText.isChild(index + 1, this.list));
      },
      
      /**
       * child comment 인지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      isChildComment: function(index) {
        var contentType = this.getContentType(index);
        var message = this.list[index - 1];
        var isLastMarker = false;

        if (message && message.id == this.roomData.lastReadLinkId) {
          isLastMarker = true;
        }
  
        return !!(centerService.isCommentType(contentType) &&
          !isLastMarker &&
          MessageComment.isChild(index, this.list));
      },

      /**
       * child comment 가지고 있는지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      hasChildComment: function(index) {
        var contentType = this.getContentType(index);
        var message = this.list[index];
        var isLastMarker = false;

        if (message && message.id == this.roomData.lastReadLinkId) {
          isLastMarker = true;
        }
  
        return !!(centerService.isCommentType(contentType) &&
          !isLastMarker &&
          MessageComment.isChild(index + 1, this.list));
      },
      
      /**
       * 파일에 달린 comment 목록에서 첫번째 인지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      isFirstComment: function(index) {
        var contentType = this.getContentType(index);
        return !!(centerService.isCommentType(contentType) && MessageComment.isFirst(index, this.list));
      },
      
      /**
       * 파일에 달린 comment 목록에서 마지막 인지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      isLastComment: function(index) {
        var contentType = this.getContentType(index);
        return !!(centerService.isCommentType(contentType) && MessageComment.isLast(index, this.list));
      },
      
      /**
       * title comment 인지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      isTitleComment: function(index) {
        var contentType = this.getContentType(index);
  
        return !!(centerService.isCommentType(contentType) &&
          (this.isNewDate(index) || MessageComment.isTitle(index, this.list)));
      },

      /**
       * link preview 가 존재하는지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      hasLinkPreview: function(index) {
        return !_.isEmpty(this.list[index].message.linkPreview);
      },

      /**
       * integration message에 대한 preview가 존재하는지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      hasConnectPreview: function(index) {
        return !_.isEmpty(this.list[index].message.content.connectInfo);
      },

      /**
       * 새로운 날짜의 시작인지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      isNewDate: function(index) {
        var messages = this.list;
        var prevMsg;
        var msg = messages[index];

        if (index > 0) {
          prevMsg = messages[index - 1];
          if (msg.date !== prevMsg.date) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      },

      /**
       * 해당 메세지의 content type 을 확인한다.
       * @param index 확인할 대상 메세지 인덱스
       * @returns {string} 메세지의 contentType
       */
      getContentType: function(index) {
        var data = this.list[index];
        return data && data.message && data.message.contentType;
      },

      /**
       * message 를 더하기 전 선 처리한다.
       * @param {array} messageList
       * @returns {*}
       * @private
       */
      beforeAddMessages: function(messageList) {
        messageList = _.isArray(messageList) ? _.sortBy(messageList, 'id') : [messageList];

        _.forEach(messageList, function(msg) {
          this.manipulateMessage(msg);
        }, this);
        return messageList;
      },

      /**
       * mark-up에서 사용하기쉽게 msg object를 가공한다.
       * @private
       */
      manipulateMessage: function(msg) {
        var fromEntityId = msg.fromEntity;
        var writer = EntityHandler.get(fromEntityId);

        if (writer) {
          msg.extFromEntityId = fromEntityId;
          msg.extWriter = writer;
          msg.extWriterName = $filter('getName')(writer);
          msg.exProfileImg = memberService.getProfileImage(writer.id, 'small');
          msg.extTime = $filter('gethmmaFormat')(msg.time);
        }
      },

      /**
       * 첫번째 id 를 반환한다.
       * @returns {number}
       */
      getFirstLinkId: function() {
        return this._linkId.first;
      },

      /**
       * 마지막 id 를 반환한다.
       * @returns {number}
       */
      getLastLinkId: function() {
        return this._linkId.last;
      },

      /**
       * 현재 messages중 system message가 몇 개 있는지 리턴한다.
       * @returns {number}
       */
      getSystemMessageCount: function() {
        return this._systemMessageCount;
      },

      /**
       * 기본 메세지에 랜더링에 필요한 추가 정보를 더하여 반환한다.
       * @param {object} msg
       * @returns {object}
       */
      getFormattedMessage: function(msg) {
        if (!msg.extIsFormatted) {
          msg.extIsFormatted = true;
          msg.date = this._getDateKey(msg.time);
          if (this._isSystemMessage(msg)) {
            msg = this._getFormattedSystemMsg(msg);
          } else {
            // parse HTML, URL code
            msg.message.content._body = msg.message.content.body;
            this._filterContentBody(msg);
          }
          this._setMessageFlag(msg);
        }
        return msg;
      },

      /**
       * time 을 받아 key 값을 생성한다.
       * @param {number} time
       * @returns {*}
       * @private
       */
      _getDateKey: function(time) {
        return DateFormatter.getFormattedDate(time);
      },

      /**
       * message 의 기본 flag를 설정한다.
       * @param {object} msg
       * @private
       */
      _setMessageFlag: function(msg) {
        var contentType;
        var message = msg.message;
        contentType = message.contentType;
        if (contentType === 'file') {
          message.isFile = true;
        } else if (centerService.isTextType(contentType)) {
          message.isText = true;
        } else if (centerService.isCommentType(contentType)) {
          message.isComment = true;
        }
        //todo: remove this (for test)
        message.isStarred = message.isStarred || false;
        return msg;
      },

      /**
       * formatted 된 system message 를 반환한다.
       * @param {object} msg
       * @returns {*}
       * @private
       */
      _getFormattedSystemMsg: function(msg) {
        var newMsg = msg;
        var action = '';
        var entity;

        newMsg.eventType = '/' + msg.info.eventType;
        newMsg.message = {};
        newMsg.message.contentType = 'systemEvent';
        newMsg.message.content = {};
        newMsg.message.writer = EntityHandler.get(msg.fromEntity);

        switch(msg.info.eventType) {
          case 'announcement_created':
            newMsg.announceWriterName = memberService.getNameById(msg.info.eventInfo.writerId);
            break;
          case 'announcement_deleted':
            action = $filter('translate')('@system-msg-announcement-deleted');
            break;
          case 'join' :
            action = $filter('translate')('@msg-joined');
            break;
          case 'leave' :
            action = $filter('translate')('@msg-left');
            break;
          case 'create' :
            if (msg.info.entityType == 'channel') {
              action = $filter('translate')('@msg-create-ch');
            } else {
              action = $filter('translate')('@msg-create-pg');
            }
            break;
          case 'bookmark':
            action = '여기까지 읽음.';
            break;

        }

        newMsg.message.content.actionOwner = memberService.getNameById(msg.fromEntity);
        newMsg.message.content.body = action;
        this._systemMessageCount++;
        return newMsg;
      },

      /**
       * 시스템 메세지인지 여부를 반환한다.
       * @param {object} msg 메세지
       * @returns {boolean} 시스템 메세지 여부
       * @private
       */
      _isSystemMessage: function(msg) {
        var sysMap = {
          'event': true
        };
        return !!(msg && sysMap[msg.status]);
      },

      /**
       * 메세지를 노출하기 알맞게 가공한다.
       * @param {object} msg 메세지
       * @private
       */
      _filterContentBody: function(msg) {
        var body = msg.message.content.body;

        if (body !== undefined && body !== "") {
          body = $filter('mention')(body, msg.message.mentions);
          body = $filter('parseAnchor')(body);
          body = $filter('mentionHtmlDecode')(body);
          body = $filter('markdown')(body);
        }
        msg.message.content.body = body;
      },

      /**
       * unread count 를 업데이트 한다.
       */
      updateUnreadCount: function() {
        var list = this.list;
        var globalUnreadCount;
        var lastLinkIdToCount = markerService.getLastLinkIdToCountMap();
        var markerOffset = markerService.getMarkerOffset();
        var currentUnread;
        var isChat = centerService.isChat();

        if (isChat) {
          globalUnreadCount = 2;
        } else {
          globalUnreadCount = RoomTopicList.getUserLength(currentSessionHelper.getCurrentEntity().id);
        }

        globalUnreadCount = globalUnreadCount - markerOffset;
        _.forEachRight(list, function(message, index) {
          currentUnread = message.unreadCount;

          if (!!lastLinkIdToCount[message.id]) {
            var currentObj = lastLinkIdToCount[message.id];
            var currentObjCount = currentObj.count;

            globalUnreadCount = globalUnreadCount - currentObjCount;
          }

          if (message.unreadCount === '') {
            // if message.unreadCount is an 'empty string', then globalUnreadCount for current message has reached ZERO!!!
            // There is no need to increment unread count for any type of message.
            // So just leave as it is. as ZERO.
            globalUnreadCount = 0;
          } else if (message.unreadCount < globalUnreadCount) {
            globalUnreadCount = message.unreadCount;
          }

          if (globalUnreadCount < 0) globalUnreadCount = 0;
          if (isChat) {
            globalUnreadCount = Math.min(globalUnreadCount, 1);
          }
          if (globalUnreadCount === 0) {
            message.unreadCount = '';
          } else {
            message.unreadCount = globalUnreadCount;
          }

          if (currentUnread !== message.unreadCount) {
            this._pub('MessageCollection:updateUnread', {
              msg: message,
              index: index
            });
          }
          //message.unreadCount = globalUnreadCount === 0 ? '' : globalUnreadCount;
          list[index] = message;
        }, this);
      },

      /**
       * 
       * @returns {Array}
       */
      getList: function() {
        return this.list;
      },

      /**
       * 
       * @param list
       */
      setList: function(list) {
        if (this.status.isInitialRequestSuccess) {
          this.list = list;
          this._setLinkId(list);
          this._addIndexMap(list);
          this._pub('MessageCollection:set', list);
        }
      },

      /**
       * linkId 를 설정한다.
       * @param {Array} list
       * @private
       */
      _setLinkId: function(list) {
        var roomData = this.roomData;
        var messageList = this.list;
        var first = messageList.length ? messageList[0].id : -1;
        var last = messageList.length ? messageList[messageList.length - 1].id : -1;
        if (list.length) {
          first = list[0].id < first ? list[0].id : first;
          last = list[list.length - 1].id > last ? list[list.length - 1].id : last;
        }

        this._linkId = {
          first: first,
          last: last
        };
        if (roomData.firstLinkId === -1 || roomData.firstLinkId > first) {
          roomData.firstLinkId = first;
        } 
        
        if (roomData.lastLinkId < last) {
          roomData.lastLinkId = last;
        }

        if (roomData.globalLastLinkId < last) {
          roomData.globalLastLinkId = last;
        }
      },

      /**
       * system event 들을 제외하고 맨 마지막 메세지의 link id를 리턴한다.
       * 리턴값이 -1 일때는 file share/unshare 혹은 message created 가 없을때이다.
       * @returns {number}
       */
      getLastActiveLinkId: function() {
        var linkId = -1;
        _.forEachRight(this.list, function(msg) {
          if (msg.status !== 'event') {
            linkId = msg.id;
            return false;
          }
        });
        return linkId;
      },

      /**
       * 현재 collection 에 가장 최근 Message 가 존재하는지 여부를 반환한다.
       * @returns {boolean}
       */
      hasLastMessage: function() {
        return this.getLastLinkId() >= this.roomData.lastLinkId;
      },

      /**
       * 현재 활성화 된 방인지 여부를 확인한다.
       * @returns {boolean}
       * @private
       */
      _isCurrentRoom: function() {
        return currentSessionHelper.getCurrentEntityId() === this.id;
      },

      /**
       * 현재 방의 room id 를 조회한다.
       * @returns {*}
       * @private
       */
      _getCurrentRoomId: function() {
        var id = this.id;
        var member;
        var roomId;
        if (RoomTopicList.isExist(id)) {
          roomId = id;
        } else {
          member = EntityFilterMember.get(id);
          roomId = CoreUtil.pick(member, 'entityId');
        }
        return roomId;
      },

      /**
       * 현재 보고 있는 방일 경우에만 이벤트를 publish 한다.
       * @private
       */
      _pub: function() {
        if (this._isCurrentRoom()) {
          jndPubSub.pub.apply(this, arguments);
        }
      }
    });
    
    return MessageCollectionClass;
  }
})();
