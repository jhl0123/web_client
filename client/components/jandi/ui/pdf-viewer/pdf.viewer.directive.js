/**
 * @fileoverview pdf-viewer 디렉티브
 * @author Soonyoung Park <young.park@tosslab.com>
 * @requires https://github.com/mozilla/pdfjs-dist
 * @see https://github.com/mozilla/pdf.js
 */
(function() {
  'use strict';

  angular
    .module('jandi.ui.pdfViewer')
    .directive('pdfViewer', pdfViewer);

  function pdfViewer($timeout, JndUtil, PdfViewer) {
    return {
      restrict: 'AE',
      replace: true,
      templateUrl : 'components/jandi/ui/pdf-viewer/pdf.viewer.html',
      link: link
    };

    function link(scope, el) {
      /**
       * PDFJS 의 이미지 및 cmap 리소스에 접근하기 위한 설치 경로 
       * @type {string}
       */
      var PDFJS_PATH = '/bower_components/pdfjs-dist/';

      /**
       * 기본 배율 값
       * 문자일 경우 page-actual|page-width|page-height|page-fit 중 하나의 값.
       * @type {string|number}
       */
      var DEFAULT_SCALE = 'page-fit';
      
      /**
       * scale 기본 연산 배율
       * @type {number}
       */
      var DEFAULT_SCALE_DELTA = 1.1;

      /**
       * 최소 배율
       * @type {number}
       */
      var MIN_SCALE = 0.25;

      /**
       * 최대 배율
       * @type {number}
       */
      var MAX_SCALE = 10.0;

      /**
       * 
       */
      var _timer;
      var _pdfViewer;
      var _request;
      var _currentPage = 1;
      var _totalPage = 1;

      var _isMouseDownOnDim = false;

      _init();

      /**
       * 초기화 메서드
       * @private
       */
      function _init() {
        if (!PDFJS) {
          throw new Error('PDFJS is not found.');
        } else {
          _initPdfViewer();
          _attachScopeEvents();
          _attachDomEvents();
          el.hide();
        }
      }

      /**
       * pdf viewer 를 초기화 한다.
       * @private
       */
      function _initPdfViewer() {
        PDFJS.imageResourcesPath = PDFJS_PATH + 'web/images/';
        PDFJS.workerSrc = PDFJS_PATH + 'build/pdf.worker.js';
        PDFJS.cMapUrl = PDFJS_PATH + 'cmaps/';
        PDFJS.cMapPacked = true;
        PDFJS.disableWorker = false;
        PDFJS.externalLinkTarget = PDFJS.LinkTarget.BLANK;
        
        _pdfViewer = new PDFJS.PDFViewer({
          container: el.find('._container')[0]
        });
        _resetOptions();
      }

      /**
       * option 값들을 초기화 한다.
       * @private
       */
      function _resetOptions() {
        _currentPage = 1;
        _totalPage = 1;
      }

      /**
       * scope 이벤트 핸들러를 바인딩 한다.
       * @private
       */
      function _attachScopeEvents() {
        scope.$on('$destroy', _onDestroy);
        scope.$on('PdfViewer:load', _load);
        scope.$on('PdfViewer:unload', _unload);
        
        scope.$on('PdfViewer:setScale', _onSetScale);
        scope.$on('PdfViewer:zoomIn', _zoomIn);
        scope.$on('PdfViewer:zoomOut', _zoomOut);
        scope.$on('PdfViewer:zoomDefault', _zoomDefault);
        scope.$on('PdfViewer:zoomToggle', _zoomToggle);
        
        scope.$on('PdfViewer:goToPage', _onGoToPage);
        scope.$on('PdfViewer:nextPage', _nextPage);
        scope.$on('PdfViewer:prevPage', _prevPage);
      }

      /**
       * dom 이벤트를 바인딩 한다.
       * @private
       */
      function _attachDomEvents() {
        el.find('._container').on('scroll', _onScroll);
        el.on('mousedown', _onMouseDown)
          .on('mouseup', _onMouseUp);
      }

      /**
       * dom 이벤트를 해제한다.
       * @private
       */
      function _detachDomEvents() {
        el.find('._container').off('scroll', _onScroll);
        el.off('mousedown', _onMouseDown)
          .off('mouseup', _onMouseUp);
      }

      /**
       * mousedown 이벤트 핸들러
       * @param {object} mouseEvent
       * @private
       */
      function _onMouseDown(mouseEvent) {
        var jqTarget = $(mouseEvent.target);
        _isMouseDownOnDim = jqTarget.hasClass('_viewer');
      }

      /**
       * mouseup 이벤트 핸들러
       * @param {object} mouseEvent
       * @private
       */
      function _onMouseUp(mouseEvent) {
        var jqTarget = $(mouseEvent.target);
        if (_isMouseDownOnDim && jqTarget.hasClass('_viewer')) {
          _unload();
        }
        _isMouseDownOnDim = false;
      }

      /**
       * scroll 이벤트 핸들러
       * @private
       */
      function _onScroll() {
        $timeout.cancel(_timer);
        _timer = $timeout(_setCurrentPageNum, 10);
      }

      /**
       * 
       * @param {object} angularEvent
       * @param {string} url
       * @private
       */
      function _load(angularEvent, url) {
        _resetOptions();
        _cancelRequest();

        el.show();

        _request = PDFJS.getDocument(url);
        _request.onProgress = _onProgress;
        _request.then(function(pdfDoc) {
          scope.totalPage = pdfDoc.numPages;
          _pdfViewer.setDocument(pdfDoc).then(_onLoadSuccess);
          PdfViewer.pub('PdfViewer:load:success');
        }, function() {
          PdfViewer.pub('PdfViewer:load:error');
        });
      }

      /**
       * load 진행 중일 경우 이벤트를 트리거 한다. 
       * 
       * @param {object} progressStatus
       *    @param {number}  progressStatus.loaded - load 된 bytes 
       *    @param {number}  progressStatus.total - 전체 bytes
       * @private
       */
      function _onProgress(progressStatus) {
        PdfViewer.pub('PdfViewer:load:progress', progressStatus);
      }
      
      /**
       * load 성공 이벤트 핸들러
       * @private
       */
      function _onLoadSuccess() {
        JndUtil.safeApply(scope, function() {
          _zoomDefault();
          _setCurrentPageNum();
        });
        el.find('._container > input').focus();
      }

      /**
       * 현재 pdf에 대한 request 가 있다면 request 를 모두 취소한다.
       * @private
       */
      function _cancelRequest() {
        if (_request && !_request.destroyed) {
          _request.destroy();
        }
      }

      /**
       * scale 값 변경 이벤트 콜백 
       * @param {object} angularEvent
       * @param {number|string} newScale - 확대 배율. 문자일 경우 page-actual|page-width|page-height|page-fit 중 하나의 값.
       * @private
       */
      function _onSetScale(angularEvent, newScale) {
        _setScale(newScale);
      }

      /**
       * pageNum 에 해당하는 페이지로 이동한다.
       * @param {object} angularEvent
       * @param {number} pageNum
       * @private
       */
      function _onGoToPage(angularEvent, pageNum) {
        _goPage(pageNum);
      }
      
      /**
       * 배율을 지정한다.
       * @param {number|string} newScale - 확대 배율. 문자일 경우 page-actual|page-width|page-height|page-fit 중 하나의 값.
       * @private
       */
      function _setScale(newScale) {
        if (_pdfViewer && newScale) {
          _pdfViewer.currentScaleValue = newScale;
          PdfViewer.pub('PdfViewer:scale', newScale);
        }
      }

      /**
       * zoom 을 토글한다.
       * @private
       */
      function _zoomToggle() {
        if (_pdfViewer) {
          if (_pdfViewer.currentScaleValue === 'page-width') {
            _pdfViewer.currentScaleValue = 'page-fit';
          } else {
            _pdfViewer.currentScaleValue = 'page-width';
          }
        }
      }
      
      /**
       * 기본 배율로 설정한다.
       * @private
       */
      function _zoomDefault() {
        _setScale(DEFAULT_SCALE);
      }

      /**
       * zoom in 한다.
       * @private
       */
      function _zoomIn() {
        var newScale;
        if (_pdfViewer) {
          newScale = _pdfViewer.currentScale;
          newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
          newScale = Math.ceil(newScale * 10) / 10;
          newScale = Math.min(MAX_SCALE, newScale);
          _setScale(newScale);
        }
      }

      /**
       * zoom out 한다.
       * @private
       */
      function _zoomOut() {
        var newScale;
        if (_pdfViewer) {
          newScale = _pdfViewer.currentScale;
          newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
          newScale = Math.floor(newScale * 10) / 10;
          newScale = Math.max(MIN_SCALE, newScale);
          _setScale(newScale);
        }
      }

      /**
       * 다음 페이지 이동
       * @private
       */
      function _nextPage() {
        if (_pdfViewer) {
          _goPage(_pdfViewer.currentPageNumber + 1);
        }
      }

      /**
       * 이전 페이지 이동
       * @private
       */
      function _prevPage() {
        if (_pdfViewer) {
          _goPage(_pdfViewer.currentPageNumber - 1);
        }
      }

      /**
       * pageNum 에 해당하는 page 로 이동한다.
       * @param {number} pageNum
       * @private
       */
      function _goPage(pageNum) {
        if (_pdfViewer) {
          _pdfViewer.currentPageNumber = pageNum;
          _setCurrentPageNum();
        }
      }
      
      /**
       * 현재 페이지 정보를 저장한다. 
       * @private
       */
      function _setCurrentPageNum() {
        var currentPage = _currentPage;
        var totalPage = _totalPage;

        if (_pdfViewer) {
          _currentPage = _pdfViewer.currentPageNumber;
          _totalPage = _pdfViewer.pagesCount;
          if (currentPage !== _currentPage || totalPage !== _totalPage){
            PdfViewer.pub('PdfViewer:pageChange', _currentPage, _totalPage);
          }
        }
      }

      /**
       * pdf viewer 를 unload 한다.
       * @private
       */
      function _unload() {
        _cancelRequest();
        if (_pdfViewer) {
          _pdfViewer.cleanup();
          _pdfViewer.setDocument();
        }
        _resetOptions();
        PdfViewer.pub('PdfViewer:unload:success');
        el.hide();
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _detachDomEvents();
        _unload();
      }
    }
  }
})();
