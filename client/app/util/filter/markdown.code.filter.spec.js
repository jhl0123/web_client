(function() {
  'use strict';

  describe('markdown.code.filter', function() {
    var $filter;

    beforeEach(module('jandiApp'));
    beforeEach(inject(function(_$filter_) {
      $filter = _$filter_('markdown');

    }));
    describe('italic', function() {
      it('여러가지 케이스를 테스트 한다.', function() {
        var markdownString1 = $filter('*텍스트* 입니다.');
        var expectString1 = '<i>텍스트</i> 입니다.';

        var markdownString2 = $filter('*텍스트 * 입니다.');
        var expectString2 = '*텍스트 * 입니다.';

        var markdownString3 = $filter('* 텍스트* 입니다.');
        var expectString3 = '* 텍스트* 입니다.';

        var markdownString4 = $filter('* 텍스트 * 입니다.');
        var expectString4 = '* 텍스트 * 입니다.';

        var markdownString5 = $filter('중간 *텍스트* 입니다.');
        var expectString5 = '중간 <i>텍스트</i> 입니다.';

        var markdownString6 = $filter('중간 *텍스트 * 입니다.');
        var expectString6 = '중간 *텍스트 * 입니다.';

        var markdownString7 = $filter('중간 * 텍스트* 입니다.');
        var expectString7 = '중간 * 텍스트* 입니다.';

        var markdownString8 = $filter('중간 * 텍스트 * 입니다.');
        var expectString8 = '중간 * 텍스트 * 입니다.';

        var markdownString9 = $filter('중간 *텍스트*');
        var expectString9 = '중간 <i>텍스트</i>';

        var markdownString10 = $filter('중간 *텍스트 *');
        var expectString10 = '중간 *텍스트 *';

        var markdownString11 = $filter('중간 * 텍스트*');
        var expectString11 = '중간 * 텍스트*';

        var markdownString12 = $filter('중간 * 텍스트 *');
        var expectString12 = '중간 * 텍스트 *';

        expect(markdownString1).toEqual(expectString1);
        expect(markdownString2).toEqual(expectString2);
        expect(markdownString3).toEqual(expectString3);
        expect(markdownString4).toEqual(expectString4);
        expect(markdownString5).toEqual(expectString5);
        expect(markdownString6).toEqual(expectString6);
        expect(markdownString7).toEqual(expectString7);
        expect(markdownString8).toEqual(expectString8);
        expect(markdownString9).toEqual(expectString9);
        expect(markdownString10).toEqual(expectString10);
        expect(markdownString11).toEqual(expectString11);
        expect(markdownString12).toEqual(expectString12);
      });
    });

    describe('bold', function() {
      it('여러가지 케이스를 테스트 한다.', function() {
        var markdownString1 = $filter('**텍스트** 입니다.');
        var expectString1 = '<b>텍스트</b> 입니다.';

        var markdownString2 = $filter('**텍스트 ** 입니다.');
        var expectString2 = '**텍스트 ** 입니다.';

        var markdownString3 = $filter('** 텍스트** 입니다.');
        var expectString3 = '** 텍스트** 입니다.';

        var markdownString4 = $filter('** 텍스트 ** 입니다.');
        var expectString4 = '** 텍스트 ** 입니다.';

        var markdownString5 = $filter('중간 **텍스트** 입니다.');
        var expectString5 = '중간 <b>텍스트</b> 입니다.';

        var markdownString6 = $filter('중간 **텍스트 ** 입니다.');
        var expectString6 = '중간 **텍스트 ** 입니다.';

        var markdownString7 = $filter('중간 ** 텍스트** 입니다.');
        var expectString7 = '중간 ** 텍스트** 입니다.';

        var markdownString8 = $filter('중간 ** 텍스트 ** 입니다.');
        var expectString8 = '중간 ** 텍스트 ** 입니다.';

        var markdownString9 = $filter('중간 **텍스트**');
        var expectString9 = '중간 <b>텍스트</b>';

        var markdownString10 = $filter('중간 **텍스트 **');
        var expectString10 = '중간 **텍스트 **';

        var markdownString11 = $filter('중간 ** 텍스트**');
        var expectString11 = '중간 ** 텍스트**';

        var markdownString12 = $filter('중간 ** 텍스트 **');
        var expectString12 = '중간 ** 텍스트 **';

        var markdownString13 = $filter('중간 ~*텍스트 *~');
        var expectString13 = '중간 ~*텍스트 *~';

        var markdownString14 = $filter('중간 ~* 텍스트*~');
        var expectString14 = '중간 ~* 텍스트*~';

        var markdownString15 = $filter('중간 ~* 텍스트 *~');
        var expectString15 = '중간 ~* 텍스트 *~';

        var markdownString16 = $filter('오늘 **3**개의 일정이 있습니다.');
        var expectString16 = '오늘 <b>3</b>개의 일정이 있습니다.';

        expect(markdownString1).toEqual(expectString1);
        expect(markdownString2).toEqual(expectString2);
        expect(markdownString3).toEqual(expectString3);
        expect(markdownString4).toEqual(expectString4);
        expect(markdownString5).toEqual(expectString5);
        expect(markdownString6).toEqual(expectString6);
        expect(markdownString7).toEqual(expectString7);
        expect(markdownString8).toEqual(expectString8);
        expect(markdownString9).toEqual(expectString9);
        expect(markdownString10).toEqual(expectString10);
        expect(markdownString11).toEqual(expectString11);
        expect(markdownString12).toEqual(expectString12);
        expect(markdownString13).toEqual(expectString13);
        expect(markdownString14).toEqual(expectString14);
        expect(markdownString15).toEqual(expectString15);
        expect(markdownString16).toEqual(expectString16);
      });
    });


    describe('bold-italic', function() {
      it('여러가지 케이스를 테스트 한다.', function() {
        var markdownString1 = $filter('***텍스트*** 입니다.');
        var expectString1 = '<i><b>텍스트</b></i> 입니다.';

        var markdownString2 = $filter('***텍스트 *** 입니다.');
        var expectString2 = '***텍스트 *** 입니다.';

        var markdownString3 = $filter('*** 텍스트*** 입니다.');
        var expectString3 = '*** 텍스트*** 입니다.';

        var markdownString4 = $filter('*** 텍스트 *** 입니다.');
        var expectString4 = '*** 텍스트 *** 입니다.';

        var markdownString5 = $filter('중간 ***텍스트*** 입니다.');
        var expectString5 = '중간 <i><b>텍스트</b></i> 입니다.';

        var markdownString6 = $filter('중간 ***텍스트 *** 입니다.');
        var expectString6 = '중간 ***텍스트 *** 입니다.';

        var markdownString7 = $filter('중간 *** 텍스트*** 입니다.');
        var expectString7 = '중간 *** 텍스트*** 입니다.';

        var markdownString8 = $filter('중간 *** 텍스트 *** 입니다.');
        var expectString8 = '중간 *** 텍스트 *** 입니다.';

        var markdownString9 = $filter('중간 ***텍스트***');
        var expectString9 = '중간 <i><b>텍스트</b></i>';

        var markdownString10 = $filter('중간 ***텍스트 ***');
        var expectString10 = '중간 ***텍스트 ***';

        var markdownString11 = $filter('중간 *** 텍스트***');
        var expectString11 = '중간 *** 텍스트***';

        var markdownString12 = $filter('중간 *** 텍스트 ***');
        var expectString12 = '중간 *** 텍스트 ***';

        var markdownString13 = $filter('중간 *~* 텍스트 *~*');
        var expectString13 = '중간 <i>~</i> 텍스트 <i>~</i>';

        expect(markdownString1).toEqual(expectString1);
        expect(markdownString2).toEqual(expectString2);
        expect(markdownString3).toEqual(expectString3);
        expect(markdownString4).toEqual(expectString4);
        expect(markdownString5).toEqual(expectString5);
        expect(markdownString6).toEqual(expectString6);
        expect(markdownString7).toEqual(expectString7);
        expect(markdownString8).toEqual(expectString8);
        expect(markdownString9).toEqual(expectString9);
        expect(markdownString10).toEqual(expectString10);
        expect(markdownString11).toEqual(expectString11);
        expect(markdownString12).toEqual(expectString12);
        expect(markdownString13).toEqual(expectString13);
      });
      it('공백 테스트', function() {
        var markdownString1 = $filter('***텍스트 입니다.');
        var expectString1 = '***텍스트 입니다.';

        expect(markdownString1).toEqual(expectString1);
      });
    });

    describe('strike-through', function() {
      it('여러가지 케이스를 테스트 한다.', function() {
        var markdownString1 = $filter('~~텍스트~~ 입니다.');
        var expectString1 = '<del>텍스트</del> 입니다.';

        var markdownString2 = $filter('~~텍스트 ~~ 입니다.');
        var expectString2 = '~~텍스트 ~~ 입니다.';

        var markdownString3 = $filter('~~ 텍스트~~ 입니다.');
        var expectString3 = '~~ 텍스트~~ 입니다.';

        var markdownString4 = $filter('~~ 텍스트 ~~ 입니다.');
        var expectString4 = '~~ 텍스트 ~~ 입니다.';

        var markdownString5 = $filter('~~텍 스 트~~ 입니다.');
        var expectString5 = '<del>텍 스 트</del> 입니다.';

        var markdownString6 = $filter('~~텍 스 트 ~~ 입니다.');
        var expectString6 = '~~텍 스 트 ~~ 입니다.';

        var markdownString7 = $filter('~~ 텍 스 트~~ 입니다.');
        var expectString7 = '~~ 텍 스 트~~ 입니다.';

        var markdownString8 = $filter('~~ 텍 스 트 ~~ 입니다.');
        var expectString8 = '~~ 텍 스 트 ~~ 입니다.';

        var markdownString9 = $filter('~~텍 ~~ 스 ~~ 트~~ 입니다.');
        var expectString9 = '<del>텍 ~~ 스 ~~ 트</del> 입니다.';

        var markdownString10 = $filter('~~텍 ~~ 스 ~~ 트 ~~ 입니다.');
        var expectString10 = '~~텍 ~~ 스 ~~ 트 ~~ 입니다.';

        var markdownString11 = $filter('~~ 텍 ~~ 스 ~~ 트~~ 입니다.');
        var expectString11 = '~~ 텍 ~~ 스 ~~ 트~~ 입니다.';

        var markdownString12 = $filter('~~ 텍 ~~ 스 ~~ 트 ~~ 입니다.');
        var expectString12 = '~~ 텍 ~~ 스 ~~ 트 ~~ 입니다.';

        expect(markdownString1).toEqual(expectString1);
        expect(markdownString2).toEqual(expectString2);
        expect(markdownString3).toEqual(expectString3);
        expect(markdownString4).toEqual(expectString4);
        expect(markdownString5).toEqual(expectString5);
        expect(markdownString6).toEqual(expectString6);
        expect(markdownString7).toEqual(expectString7);
        expect(markdownString8).toEqual(expectString8);
        expect(markdownString9).toEqual(expectString9);
        expect(markdownString10).toEqual(expectString10);
        expect(markdownString11).toEqual(expectString11);
        expect(markdownString12).toEqual(expectString12);

      });
      it('공백 테스트', function() {
        var markdownString1 = $filter('~~텍스트 입니다.');
        var expectString1 = '~~텍스트 입니다.';

        expect(markdownString1).toEqual(expectString1);
      });
    });
    describe('link-anchor', function() {
      it('여러가지 케이스를 테스트 한다.', function() {
        var markdownString1 = $filter('[링크](http://naver.com) 입니다.');
        var expectString1 = '<a href="http://naver.com" target="_blank" rel="nofollow">링크</a> 입니다.';

        var markdownString2 = $filter('중간 [링크](http://naver.com) 입니다.');
        var expectString2 = '중간 <a href="http://naver.com" target="_blank" rel="nofollow">링크</a> 입니다.';

        var markdownString3 = $filter('중간 [링크](http://naver.com)');
        var expectString3 = '중간 <a href="http://naver.com" target="_blank" rel="nofollow">링크</a>';

        var markdownString4 = $filter('중간 [링크1](http://naver.com)하하[링크2](http://google.com)');
        var expectString4 = '중간 <a href="http://naver.com" target="_blank" rel="nofollow">링크1</a>하하<a href="http://google.com" target="_blank" rel="nofollow">링크2</a>';

        var markdownString5 = $filter('중간 [링크1](http://naver.com) 하하 [링크2](http://google.com)');
        var expectString5 = '중간 <a href="http://naver.com" target="_blank" rel="nofollow">링크1</a> 하하 <a href="http://google.com" target="_blank" rel="nofollow">링크2</a>';

        var markdownString6 = $filter('새 카드 &quot;[<a href="http://google.com" target="_blank" rel="nofollow">google.com</a>](<a href="https://www.trello.com/c/iOL2J7j1" target="_blank" rel="nofollow">https://www.trello.com/c/iOL2J7j1</a>)&quot; (이)가 &quot;[dkfslkf](<a href="https://www.trello.com/b/VgAGh9hF" target="_blank" rel="nofollow">https://www.trello.com/b/VgAGh9hF</a>)&quot; 리스트에 추가되었습니다.');
        var expectString6 = '새 카드 &quot;<a href="https://www.trello.com/c/iOL2J7j1" target="_blank" rel="nofollow">google.com</a>&quot; (이)가 &quot;<a href="https://www.trello.com/b/VgAGh9hF" target="_blank" rel="nofollow">dkfslkf</a>&quot; 리스트에 추가되었습니다.';

        var markdownString7 = $filter('링크[#93: [DESIGN] company, main 페이지수정](https://github.com/tosslab/web_landing/pull/93)가 종료되었습니다.');
        var expectString7 = '링크<a href="https://github.com/tosslab/web_landing/pull/93" target="_blank" rel="nofollow">#93: [DESIGN] company, main 페이지수정</a>가 종료되었습니다.';

        var markdownString8 = $filter('[tosslab/web_landing] [ted-jihoon-kim](https://github.com/ted-jihoon-kim)님의 풀 리퀘스트 [#93: [DESIGN] company, main 페이지수정](https://github.com/tosslab/web_landing/pull/93)가 종료되었습니다.');
        var expectString8 = '[tosslab/web_landing] <a href="https://github.com/ted-jihoon-kim" target="_blank" rel="nofollow">ted-jihoon-kim</a>님의 풀 리퀘스트 <a href="https://github.com/tosslab/web_landing/pull/93" target="_blank" rel="nofollow">#93: [DESIGN] company, main 페이지수정</a>가 종료되었습니다.';

        expect(markdownString1).toEqual(expectString1);
        expect(markdownString2).toEqual(expectString2);
        expect(markdownString3).toEqual(expectString3);
        expect(markdownString4).toEqual(expectString4);
        expect(markdownString5).toEqual(expectString5);
        expect(markdownString6).toEqual(expectString6);
        expect(markdownString7).toEqual(expectString7);
        expect(markdownString8).toEqual(expectString8);
      });

      //현재 꺽쇠 스펙은 지원하지 않음
      xdescribe('꺽쇠 <> 포멧의 경우 지원하는지 확인한다.', function() {
        it('일반 꺽쇠', function() {
          var markdownString1 = $filter('중간 [링크1](<>) 하하 [링크2](<>)');
          var expectString1 = '중간 <a href="" target="_blank" rel="nofollow">링크1</a> 하하 <a href="" target="_blank" rel="nofollow">링크2</a>';

          var markdownString2 = $filter('중간 [링크1](<http://naver.com>) 하하 [링크2](<http://google.com>)');
          var expectString2 = '중간 <a href="http://naver.com" target="_blank" rel="nofollow">링크1</a> 하하 <a href="http://google.com" target="_blank" rel="nofollow">링크2</a>';

          expect(markdownString1).toEqual(expectString1);
          expect(markdownString2).toEqual(expectString2);
        });
        it('html encode 된 꺽쇠', function() {
          var markdownString1 = $filter('중간 [링크1](&lt;&gt;) 하하 [링크2](&lt;&gt;)');
          var expectString1 = '중간 <a href="" target="_blank" rel="nofollow">링크1</a> 하하 <a href="" target="_blank" rel="nofollow">링크2</a>';

          var markdownString2 = $filter('중간 [링크1](&lt;http://naver.com&gt;) 하하 [링크2](&lt;http://google.com&gt;)');
          var expectString2 = '중간 <a href="http://naver.com" target="_blank" rel="nofollow">링크1</a> 하하 <a href="http://google.com" target="_blank" rel="nofollow">링크2</a>';

          expect(markdownString1).toEqual(expectString1);
          expect(markdownString2).toEqual(expectString2);
        });
      });

      it('pre link parser 에 의해 선 파싱되었을 경우에도 정상 동작하는지 확인한다.', function() {
        var markdownString1 = $filter('중간 [링크1](<a href="http://naver.com" target="_blank" rel="nofollow">http://naver.com</a>) 하하 [링크2](<a href="http://google.com" target="_blank" rel="nofollow">http://google.com</a>)');
        var expectString1 = '중간 <a href="http://naver.com" target="_blank" rel="nofollow">링크1</a> 하하 <a href="http://google.com" target="_blank" rel="nofollow">링크2</a>';
        expect(markdownString1).toEqual(expectString1);
      });
      it('img(!) 가 들어갔을 경우를 테스트 한다. 현재 스펙은 링크 그대로 반환한다.', function() {
        //TODO: img 태그 지원가능한 스펙이 된다면 img tag 로 변환이 잘 되는지를 테스트해야함.
        var markdownString1 = $filter('![링크](http://naver.com) 입니다.');
        var expectString1 = '!<a href="http://naver.com" target="_blank" rel="nofollow">링크</a> 입니다.';

        var markdownString2 = $filter('중간 ![링크](http://naver.com) 입니다.');
        var expectString2 = '중간 !<a href="http://naver.com" target="_blank" rel="nofollow">링크</a> 입니다.';

        var markdownString3 = $filter('중간 ![링크](http://naver.com)');
        var expectString3 = '중간 !<a href="http://naver.com" target="_blank" rel="nofollow">링크</a>';

        var markdownString4 = $filter('중간 ![링크1](http://naver.com)하하![링크2](http://google.com)');
        var expectString4 = '중간 !<a href="http://naver.com" target="_blank" rel="nofollow">링크1</a>하하!<a href="http://google.com" target="_blank" rel="nofollow">링크2</a>';

        var markdownString5 = $filter('중간 ![링크1](http://naver.com) 하하 ![링크2](http://google.com)');
        var expectString5 = '중간 !<a href="http://naver.com" target="_blank" rel="nofollow">링크1</a> 하하 !<a href="http://google.com" target="_blank" rel="nofollow">링크2</a>';

        expect(markdownString1).toEqual(expectString1);
        expect(markdownString2).toEqual(expectString2);
        expect(markdownString3).toEqual(expectString3);
        expect(markdownString4).toEqual(expectString4);
        expect(markdownString5).toEqual(expectString5);

      });

    });

    describe('혼합 테스트', function() {
      describe('계층 구조의 텍스트도 잘 변환하는지 확인한다.', function() {
        it('복잡한 마크다운 1', function() {
          var markdownString1 = $filter('일반 *기울임 **굵게 기울임 ~~그리고 취소선~~을 해본다**텍스트의 끝*');
          var expectString1 = '일반 <i>기울임 <b>굵게 기울임 <del>그리고 취소선</del>을 해본다</b>텍스트의 끝</i>';
          expect(markdownString1).toEqual(expectString1);
        });
        it('띄어쓰기 없는 복잡한 마크다운 1', function() {
          var markdownString1 = $filter('일반*기울임**굵게기울임~~그리고취소선~~을해본다**텍스트의끝*');
          var expectString1 = '일반<i>기울임<b>굵게기울임<del>그리고취소선</del>을해본다</b>텍스트의끝</i>';
          expect(markdownString1).toEqual(expectString1);
        });
      });
      describe('Anchor 가 포함된 텍스트도 잘 변환하는지 확인한다.', function() {
        it('복잡한 마크다운 1', function() {
          var markdownString1 = $filter('일반 *기울임 **굵게 기울임 ~~그리고 <a href="http://www.jandi.com/test">취소선</a>~~을 해본다**텍스트의 끝*');
          var expectString1 = '일반 <i>기울임 <b>굵게 기울임 <del>그리고 <a href="http://www.jandi.com/test">취소선</a></del>을 해본다</b>텍스트의 끝</i>';
          expect(markdownString1).toEqual(expectString1);
        });
        it('복잡한 마크다운 2', function() {
          var markdownString1 = $filter('일반 *기울임 **굵게 기울임 ~~그리고 취소선~~을 <a href="http://www.jandi.com/test">해본다</a>**텍스트의 끝*');
          var expectString1 = '일반 <i>기울임 <b>굵게 기울임 <del>그리고 취소선</del>을 <a href="http://www.jandi.com/test">해본다</a></b>텍스트의 끝</i>';
          expect(markdownString1).toEqual(expectString1);
        });
        it('띄어쓰기 없는 복잡한 마크다운 1', function() {
          var markdownString1 = $filter('일반*기울임**굵게기울임~~그리고<a href="http://www.jandi.com/test">취소선</a>~~을해본다**텍스트의끝*');
          var expectString1 = '일반<i>기울임<b>굵게기울임<del>그리고<a href="http://www.jandi.com/test">취소선</a></del>을해본다</b>텍스트의끝</i>';
          expect(markdownString1).toEqual(expectString1);
        });
      });
      describe('link markdown 까지 잘 변환하는지 확인한다.', function() {
        it('복잡한 마크다운 1 - link 에 상대 경로/절대경로 적용시', function() {
          var markdownString1 = $filter('일반 *기울임 **굵게 기울임 ~~그리고 <a href="http://www.jandi.com/test">취소선</a>[링크1](/index.html)~~을 [링크2](./index.html) 해본다**텍스트의 끝*');
          var expectString1 = '일반 <i>기울임 <b>굵게 기울임 <del>그리고 <a href="http://www.jandi.com/test">취소선</a><a href="/index.html" target="_blank" rel="nofollow">링크1</a></del>을 <a href="./index.html" target="_blank" rel="nofollow">링크2</a> 해본다</b>텍스트의 끝</i>';
          expect(markdownString1).toEqual(expectString1);
        });

        it('복잡한 마크다운 2 - link 에 url 적용시', function() {
          var markdownString1 = $filter('일반 *기울임 **굵게 기울임 ~~그리고 <a href="http://www.jandi.com/test">취소선</a>[링크1](http://www.jandi.com/index.html)~~을 [링크2](http://www.jandi.com/index2.html) 해본다**텍스트의 끝*');
          var expectString1 = '일반 <i>기울임 <b>굵게 기울임 <del>그리고 <a href="http://www.jandi.com/test">취소선</a><a href="http://www.jandi.com/index.html" target="_blank" rel="nofollow">링크1</a></del>을 <a href="http://www.jandi.com/index2.html" target="_blank" rel="nofollow">링크2</a> 해본다</b>텍스트의 끝</i>';
          expect(markdownString1).toEqual(expectString1);
        });
      });

      describe('mention 이 있을때 mention 을 잘 보존하는지 테스트 한다', function() {
        it('mention 만 존재할 경우', function() {
          var markdownString1 = $filter('<a mention-view="11151636" mention-type="member" mention-active="on">@DennisDennisDennisDennisDennis</a> <a mention-view="283" mention-type="member" mention-active="on">@Jane</a>');
          var expectString1 = '<a mention-view="11151636" mention-type="member" mention-active="on">@DennisDennisDennisDennisDennis</a> <a mention-view="283" mention-type="member" mention-active="on">@Jane</a>';

          expect(markdownString1).toEqual(expectString1);
        });
        it('연속된 2개의 mention 이후 link 마크다운이 있을 경우', function() {
          var markdownString1 = $filter('<a mention-view="307" mention-type="member" mention-active="on">@Support</a> <a mention-view="9179540" mention-type="member" mention-active="on">@Andrew Park</a> [LINK](<a href="https://www.jandi.com" target="_blank" rel="nofollow">https://www.jandi.com</a>)');
          var expectString1 = '<a mention-view="307" mention-type="member" mention-active="on">@Support</a> <a mention-view="9179540" mention-type="member" mention-active="on">@Andrew Park</a> <a href="https://www.jandi.com" target="_blank" rel="nofollow">LINK</a>';

          expect(markdownString1).toEqual(expectString1);
        });
        it('동일한 멘션이 여러 개 존재할 경우', function() {
          var markdownString1 = $filter('<a mention-view="11538562" mention-type="member" mention-active="on">@Mr. J</a> qwerqwreiqwreqw [@Mr. J] qwerqwer] <a mention-view="11538562" mention-type="member" mention-active="on">@Mr. J</a>');
          var expectString1 = '<a mention-view="11538562" mention-type="member" mention-active="on">@Mr. J</a> qwerqwreiqwreqw [@Mr. J] qwerqwer] <a mention-view="11538562" mention-type="member" mention-active="on">@Mr. J</a>';
          expect(markdownString1).toEqual(expectString1);
        });
      });

      describe('특수 장애 건에 대한 테스트', function() {
        it('$&, $`, $\' 문자열이 들어갔을 경우', function() {
          var markdownString1 = $filter('새 카드 &quot;[create symmetric key ChangeData with algorithm = AES_256 encryption by password = N&#39;dkaghghk12#$&#39;](<a href="https://www.trello.com/c/rCAfAHwp" target="_blank" rel="nofollow">https://www.trello.com/c/rCAfAHwp</a>)&quot; (이)가 &quot;[Certification](<a href="https://www.trello.com/b/2c2fxTtz" target="_blank" rel="nofollow">https://www.trello.com/b/2c2fxTtz</a>)&quot; 리스트에 추가되었습니다.');
          var expectString1 = '새 카드 &quot;<a href="https://www.trello.com/c/rCAfAHwp" target="_blank" rel="nofollow">create symmetric key ChangeData with algorithm = AES_256 encryption by password = N&#39;dkaghghk12#$&#39;</a>&quot; (이)가 &quot;<a href="https://www.trello.com/b/2c2fxTtz" target="_blank" rel="nofollow">Certification</a>&quot; 리스트에 추가되었습니다.';
          expect(markdownString1).toEqual(expectString1);
        })
      });
    });
  });
})();
