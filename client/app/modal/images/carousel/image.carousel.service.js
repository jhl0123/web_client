/**
 * @fileoverview image carousel service
 */
(function() {
  'use strict';

  angular
      .module('jandiApp')
      .service('ImageCarousel', ImageCarousel);

  /* @ngInject */
  function ImageCarousel($rootScope, $compile, $timeout, jndKeyCode, config) {
    var that = this;

    // image item의 최소 크기
    var MIN_WIDTH = 400;
    var MIN_HEIGHT = 400;

    // image load 상태
    var INIT = 'init';
    var PREV = 'prev';
    var NEXT = 'next';

    var jqWindow;
    var jqModal;
    var jqViewerBody;
    var jqImageList;

    var jqPrevBtn;
    var jqNextBtn;

    // image load timer
    var timerImageLoad;

    // getList 호출 제어
    var lockerGetList;

    // 현재 출력된 image item
    var pivot;
    // image item 목록
    var imageList;
    // image item의 정보 모음
    var imageMap;

    var slide = {};

    that.init = init;
    that.close = close;

    /**
     * Image Carousel Object 초기 설정자
     * @param {object} target
     * @param {string} target.userName    - 최초 출력될 file upload 사용자 명
     * @param {number} target.uploadDate  - 최초 출력될 file upload date
     * @param {string} target.fileTitle   - 최초 출력될 file title
     * @param {string} target.fileUrl     - 최초 사용될 file url
     * @param {object} options
     * @param {string} options.imageItemTemplate  - image item template
     * @param {number} options.messageId          - 현재 출력될 message id
     * @param {number} options.entityId           - 현재 출력될 entity id
     * @param {function} options.onClose          - image carousel의 close callback
     * @param {function} options.onRender         - image item의 render callback
     * @param {function} options.onButtonStatus   - image carousel의 button 상태 변경 callback
     * @param {number} [options.count=20]         - 한번 get시 load할 image item 수
     */
    function init(target, options) {
      pivot = target;
      imageList = [];
      imageMap = {};

      that.options = {
        // 한번 get시 load할 image item 수
        count: 20
      };
      _.extend(that.options, options);

      jqWindow = $(window);
      jqViewerBody = $('.viewer-body');
      jqImageList = $('.image-list');

      jqPrevBtn = $('#viewer_prev_btn');
      jqNextBtn = $('#viewer_next_btn');

      $timeout(function() {
        jqModal = $('.image-carousel-modal').focus();

        // event 연결
        _on();

        // 최초 image item 추가
        _pushImage(that.options.messageId, INIT, pivot);

        // 최초 image item 기준으로 출력해야할 image list get
        _getList(INIT, function() {
          // image list get 후 prev, next button 상태 변경
          _setButtonStatus();
        });

        // 최초 image item 출력
        _load(that.options.messageId, pivot);
      });
    }

    /**
     * image carousel 닫기
     */
    function close() {
      $timeout(function() {
        that.options.onClose();
      });

      // events off
      jqWindow.off('reisze.imageCarousel');
      jqModal
        .off('keydown.imageCarousel')
        .off('click.imageCarousel')
        .off('mouseleave.imageCarousel')
        .off('mousemove.imageCarousel');
    }

    /**
     * 이전 image item 출력
     * @name prev
     */
    /**
     * 다음 image item 출력
     * @name next
     */
    _.each([PREV, NEXT], function(name) {
      slide[name] = (function(name) {
        var offset = name === PREV ? -1 : 1;
        return function() {
          var currentMessageId = that.options.messageId;
          var messageId;
          var index;

          // set button focus
          name === PREV ? jqPrevBtn.focus() : jqNextBtn.focus();

          // 다음 출력 해야할 image item의 index를 얻음
          index = imageList.indexOf(currentMessageId) + offset;

          // getList를 호출하여 imageList에 추가된 image item 이라면
          // imageMap에 해당 image item의 정보가 있음
          if (index > -1 && imageList[index] != null) {
            that.options.messageId = messageId = imageList[index];

            // 이전 image item이 출력되어 있다면 숨김
            if (currentMessageId != null && imageMap[currentMessageId].jqElement) {
              imageMap[currentMessageId].jqElement.hide();
              imageMap[currentMessageId].jqElement.children('.image-item-footer').css('opacity', 0);
            }

            // image list에서 이동시 마다 _load를 호출하여
            // image를 출력하는 canvas element 생성을 방지하기 위해서 timeout 사용
            if (timerImageLoad != null) {
              $timeout.cancel(timerImageLoad);
              timerImageLoad = null;
            }
            timerImageLoad = $timeout((function(messageId) {
              return function() {
                // image item을 출력함
                _load(messageId, imageMap[messageId]);
              };
            }(messageId)), timerImageLoad == null ? 0 : 500);
          }

          // 출력할 image item 이동 후 prev, next button 상태 설정
          _setButtonStatus();

          // getList를 호출하여 server에서 image list를 얻어와야 하는지 여부 확인
          if (_isMore(index, offset) && !lockerGetList) {
            // getList transaction begin
            lockerGetList = true;

            _getList(name, function(data) {
              if (data.hasEndPoint) {
                _setButtonStatus();
              }

              // getList transaction end
              lockerGetList = false;
            });
          }
        };
      }(name));
    });

    /**
     * event 연결
     * @private
     */
    function _on() {
      var keyHandlerMap = {};
      var timerResize;

      // window reisze event handling
      jqWindow.on('resize.imageCarousel', function() {
        $timeout.cancel(timerResize);
        timerResize = $timeout(function() {
          var jqImageItem;

          if (that.options.messageId != null && (jqImageItem = imageMap[that.options.messageId].jqElement)) {
            _setPosition(jqImageItem);
          }
        }, 50);
      });

      // key event handler map
      keyHandlerMap[jndKeyCode.keyCodeMap.ESC] = function() {
        that.close();
      };
      keyHandlerMap[jndKeyCode.keyCodeMap.LEFT_ARROW] = function() {
        slide.prev();
      };
      keyHandlerMap[jndKeyCode.keyCodeMap.RIGHT_ARROW] = function() {
        slide.next();
      };

      jqModal
        // key down event handling
        .on('keydown.imageCarousel', function(event) {
          var fn;
          event.preventDefault();
          event.stopPropagation();

          (fn = keyHandlerMap[event.which]) && fn();
        })
        // click event handling at '.button'
        .on('click.imageCarousel', 'button', function(event) {
          var currentTarget = event.currentTarget;
          event.stopPropagation();

          currentTarget.className.indexOf(PREV) > -1 ? slide.prev() : slide.next();
        })
        // click event handling at '.viewer-body'
        .on('click.imageCarousel', '.viewer-body', function(event) {
          event.stopPropagation();

          event.currentTarget === event.target && close();
        })
        // mouse leave event handing at '.image-item'
        .on('mouseleave.imageCarousel', '.image-item', function(event) {
          event.stopPropagation();

          // 하단에 file 정보를 숨김
          $(event.currentTarget).children('.image-item-footer').css('opacity', 0);
        })
        // mouse move event handling at '.image-item'
        .on('mousemove.imageCarousel', '.image-item', function(event) {
          event.stopPropagation();

          // 하단에 file 정보를 출력
          $(event.currentTarget).children('.image-item-footer').css('opacity', 1);
        });
    }

    /**
     * image element의 position 설정
     * image carousel에서 image item element의 size의 크기와 비율에 따라 canvas element가 가지는 size가 달라짐
     * @param {object} jqImageItem - position 설정할 image item element
     * @param {object} [img] - image item에 포함되어 image를 출력할 canvas element
     * @private
     */
    function _setPosition(jqImageItem, img) {
      // image를 정중앙에 출력할때 필요로 하는 여백
      var ratio = [];
      var margin = 56 * 2;

      var maxWidth = jqViewerBody.width() - margin;
      var maxHeight = jqViewerBody.height() - margin;
      var imageWidth;
      var imageHeight;
      var marginLeft;
      var marginTop;
      var minWidth;
      var minHeight;
      var lineHeight;

      img = img ? $(img) : jqImageItem.children(':first-child');
      imageWidth = parseInt(img[0].getAttribute('width'), 10);
      imageHeight = parseInt(img[0].getAttribute('height'), 10);

      if (maxWidth < imageWidth || maxHeight < imageHeight) {
        // maxWidth, maxHeight 보다 imageWidth, imageHeight가 크다면 비율 조정 필요함.
        ratio = [maxWidth / imageWidth, maxHeight / imageHeight];
        ratio = Math.min(ratio[0], ratio[1]);
      } else {
        ratio = 1;
      }

      // canvas element가 가질 수 있는 size
      imageWidth = imageWidth * ratio;
      imageHeight = imageHeight * ratio;

      // image item element가 가질 수 있는 최소 size
      minWidth = imageWidth < MIN_WIDTH ? MIN_WIDTH : imageWidth;
      minHeight = imageHeight < MIN_HEIGHT ? MIN_HEIGHT : imageHeight;

      if (maxWidth < MIN_WIDTH) {
        marginLeft = maxWidth / 2 * -1;
        minWidth = maxWidth;
      } else {
        marginLeft = minWidth / 2 * -1;
        minWidth = MIN_WIDTH;
      }
      if (maxHeight < MIN_HEIGHT) {
        marginTop = maxHeight / 2 * -1;
        minHeight = maxHeight;
        lineHeight = maxHeight + 'px';
      } else {
        marginTop = minHeight / 2 * -1;
        minHeight = MIN_HEIGHT;
        lineHeight = MIN_HEIGHT + 'px';
      }

      jqImageItem.css({marginLeft: marginLeft, marginTop: marginTop, minWidth: minWidth, minHeight: minHeight, lineHeight: lineHeight});
      img.css({maxWidth: imageWidth, maxHeight: imageHeight});
    }

    /**
     * server로 부터 image list를 get
     * @param {string} type - get할 방향을 old 또는 new, both 중 설정
     * @param {function} success - success callback
     * @private
     */
    function _getList(type, success) {
      var searchType = undefined;
      var count = that.options.count;

      if (!that.options.isSingle) {
        if (type !== INIT) {
          // messageId 보다 오래된/새로운 목록 대상
          searchType = type === PREV ? 'old' : 'new';
          count = Math.ceil(count / 2);
        }

        that.options.getImage({
          entityId: that.options.entityId,
          messageId: that.options.messageId,
          type: searchType,
          count: count,
          q: that.options.keyword,
          writerId:that.options.writerId
        })
        .success(function(data) {
          data.records != null && (data = data.records);

          var messageId = that.options.messageId;
          var index = imageList.indexOf(messageId);
          var hasEndPoint = false;
          if (index === 0 || index === imageList.length - 1) {
            hasEndPoint = true;
          }

          _pushImages(messageId, type, data);
          success && success({
            hasEndPoint: hasEndPoint
          });
        });
      }
    }

    /**
     * server로 부터 전달받은 image list를 image carousel에서 관리하는 image list에 추가
     * @param {string} messageId - 현재 출력중인 image item의 index
     * @param {string} type - get할 방향을 old 또는 new, both
     * @param {array} data - server로 부터 전달받은 image list
     * @private
     */
    function _pushImages(messageId, type, data) {
      var message;
      var imageItem;
      var i;
      var cal;

      if (data) {
        // prev, next, init에 따라 data 시작점 달라짐
        if (type === PREV) {
          i = data.length - 1;
          cal = -1;
        } else {
          i = 0;
          cal = 1;
        }

        for (; message = data[i]; i += cal) {
          if (type === INIT && message.id === messageId) {
            imageList.splice(imageList.indexOf(messageId), 1);
            imageItem = imageMap[messageId];
            imageMap[messageId] = undefined;
          } else {
            imageItem = {
              userName: message.writer.name,
              uploadDate: message.createTime,
              fileTitle: message.content.title,
              fileUrl: message.content.fileUrl
            };
          }

          _pushImage(message.id, type, imageItem);
        }
      }
    }

    /**
     * image list에 추가 image item 추가
     * @param {string} messageId - 현재 출력중인 image item의 index
     * @param {string} type - get할 방향을 old 또는 new, both
     * @param {array} data - server로 부터 전달받은 image list
     * @private
     */
    function _pushImage(messageId, type, data) {
      if (imageMap[messageId] == null) {
        // type에 따라 image list에 추가되는 방향이 다름
        type === PREV ? imageList.unshift(messageId) : imageList.push(messageId);
        imageMap[messageId] = data;
      }
    }

    /**
     * server로 부터 image list를 요청해야 하는지 여부
     * @param {number} index - 현재 출력된 image item의 image list상 index
     * @param {number} offset - next, prev 방향에 따라 달라지는 offset
     * @returns {boolean}
     * @private
     */
    function _isMore(index, offset) {
      return (offset === -1 ? index : (imageList.length + index * -1)) < 4;
    }

    /**
     * image item을 출력하거나 image item element를 만듬
     * @param {number} currMessageId - 출력할 image item의 id
     * @param {object} imageItem
     * @private
     */
    function _load(currMessageId, imageItem) {
      var jqImageItem;
      var fullFileUrl;
      var $scope;

      if (jqImageItem = imageItem.jqElement) {
        // 이미 생성된 image item element가 존재한다면 바로 출력
        jqImageItem.show();
        _setPosition(jqImageItem);
      } else {
        // 생성된 image item element가 존재하지 않는다면 생성함
        that.options.messageId = currMessageId;

        $scope = $rootScope.$new(true);

        that.options.onRender($scope, that.options.messageId, imageItem);
        jqImageItem = $($compile(that.options.imageItemTemplate)($scope));
        jqImageItem.css({marginLeft: MIN_WIDTH / 2 * -1, marginTop: MIN_HEIGHT / 2 * -1});

        jqImageList.append(jqImageItem[0]);

        // image item element에 loading screen 출력
        jqImageItem.addClass('icon-loading loading');

        fullFileUrl = config.server_uploaded + imageItem.fileUrl;
        _imageLoad(jqImageItem, fullFileUrl);

        // jqImageItem cashing
        imageItem.jqElement = jqImageItem;
      }
    }

    /**
     * image carousel button 상태 설정
     * @private
     */
    function _setButtonStatus() {
      var pivotIndex = imageList.indexOf(that.options.messageId);

      that.options.onButtonStatus({
        hasPrev: imageList[pivotIndex - 1] != null,
        hasNext: imageList[pivotIndex + 1] != null
      });
    }

    /**
     * 특정 url에 해당하는 image data(blob)을 load하여 canvas element를 생성
     * @param {object} jqImageItem - image item element
     * @param {string} fullFileUrl - url
     * @private
     */
    function _imageLoad(jqImageItem, fullFileUrl) {
      var xhr = new XMLHttpRequest();

      xhr.open('GET', fullFileUrl, true);
      xhr.responseType = 'blob';
      xhr.onload = function() {
        var that = this;
        var blob = that.response;

        if (that.status === 200) {
          // loadImage library를 사용하여 blob에 포함된 meta data를 긁음
          loadImage.parseMetaData(blob, function (data) {
            var imageOptions = {
              maxWidth: '100%'
            };

            // 필요한 정보가 있을 경우
            if (!!data.exif) {
              // image 회전
              imageOptions['orientation'] = _getImageOrientation(data);
            }

            // image options와 함께 blob data를 이용해서 canvas element를 만든다.
            loadImage(blob, function(img) {
              // image item에 출력된 loading screen 제거
              jqImageItem.removeClass('icon-loading loading');

              if (img.type === 'error') {
                // img가 존재하지 않기 때문에 error image 출력
                jqImageItem.addClass('no-image-carousel').prepend('<img src="assets/images/no_image_available.png" style="opacity: 1;" />');
              } else {
                // img position 설정하고 출력
                _setPosition(jqImageItem, img);

                jqImageItem.prepend(img);
                $(img).css('opacity', 1);
              }
            }, imageOptions);
          });
        }
      };

      xhr.send();
    }

    /**
     * data 가 들고 있는 정보중에서 orientation 정보다 추출한다.
     * @param {object} data - 'loadImage.parseMetaData'를 이용해서 추출해낸 데이터
     * @returns {*}
     */
    function _getImageOrientation(data) {
      return data.exif.get('Orientation');
    }
  }
}());
