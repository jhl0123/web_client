(function() {
  'use strict';

  describe('markdown.strip.filter', function() {
    var stripMarkdown;

    beforeEach(module('jandiApp'));
    beforeEach(inject(function(_$filter_) {
      stripMarkdown = _$filter_('stripMarkdown');

    }));
    describe('italic', function() {
      it('여러가지 케이스를 테스트 한다.', function() {
        var markdownString1 = stripMarkdown('*텍스트* 입니다.');
        var expectString1 = '텍스트 입니다.';

        var markdownString2 = stripMarkdown('* 텍스트 * 입니다.');
        var expectString2 = '* 텍스트 * 입니다.';

        var markdownString3 = stripMarkdown('중간 *텍스트* 입니다.');
        var expectString3 = '중간 텍스트 입니다.';

        var markdownString4 = stripMarkdown('중간 * 텍스트 * 입니다.');
        var expectString4 = '중간 * 텍스트 * 입니다.';

        var markdownString5 = stripMarkdown('중간 *텍스트*');
        var expectString5 = '중간 텍스트';

        var markdownString6 = stripMarkdown('중간 * 텍스트 *');
        var expectString6 = '중간 * 텍스트 *';

        expect(markdownString1).toEqual(expectString1);
        expect(markdownString2).toEqual(expectString2);
        expect(markdownString3).toEqual(expectString3);
        expect(markdownString4).toEqual(expectString4);
        expect(markdownString5).toEqual(expectString5);
        expect(markdownString6).toEqual(expectString6);
      });
    });

    describe('bold', function() {
      it('여러가지 케이스를 테스트 한다.', function() {
        var markdownString1 = stripMarkdown('**텍스트** 입니다.');
        var expectString1 = '텍스트 입니다.';

        var markdownString2 = stripMarkdown('** 텍스트 ** 입니다.');
        var expectString2 = '** 텍스트 ** 입니다.';

        var markdownString3 = stripMarkdown('중간 **텍스트** 입니다.');
        var expectString3 = '중간 텍스트 입니다.';

        var markdownString4 = stripMarkdown('중간 ** 텍스트 ** 입니다.');
        var expectString4 = '중간 ** 텍스트 ** 입니다.';

        var markdownString5 = stripMarkdown('중간 **텍스트**');
        var expectString5 = '중간 텍스트';

        var markdownString6 = stripMarkdown('중간 ** 텍스트 **');
        var expectString6 = '중간 ** 텍스트 **';

        var markdownString7 = stripMarkdown('중간 ~* 텍스트 *~');
        var expectString7 = '중간 ~* 텍스트 *~';

        var markdownString8 = stripMarkdown('오늘 **3**개의 일정이 있습니다.');
        var expectString8 = '오늘 3개의 일정이 있습니다.';

        expect(markdownString1).toEqual(expectString1);
        expect(markdownString2).toEqual(expectString2);
        expect(markdownString3).toEqual(expectString3);
        expect(markdownString4).toEqual(expectString4);
        expect(markdownString5).toEqual(expectString5);
        expect(markdownString6).toEqual(expectString6);
        expect(markdownString7).toEqual(expectString7);
        expect(markdownString8).toEqual(expectString8);
      });
    });


    describe('bold-italic', function() {
      it('여러가지 케이스를 테스트 한다.', function() {
        var markdownString1 = stripMarkdown('***텍스트*** 입니다.');
        var expectString1 = '텍스트 입니다.';

        var markdownString2 = stripMarkdown('*** 텍스트 *** 입니다.');
        var expectString2 = '*** 텍스트 *** 입니다.';

        var markdownString3 = stripMarkdown('중간 ***텍스트*** 입니다.');
        var expectString3 = '중간 텍스트 입니다.';

        var markdownString4 = stripMarkdown('중간 *** 텍스트 *** 입니다.');
        var expectString4 = '중간 *** 텍스트 *** 입니다.';

        var markdownString5 = stripMarkdown('중간 ***텍스트***');
        var expectString5 = '중간 텍스트';

        var markdownString6 = stripMarkdown('중간 *** 텍스트 ***');
        var expectString6 = '중간 *** 텍스트 ***';

        var markdownString7 = stripMarkdown('중간 *~* 텍스트 *~*');
        var expectString7 = '중간 ~ 텍스트 ~';

        expect(markdownString1).toEqual(expectString1);
        expect(markdownString2).toEqual(expectString2);
        expect(markdownString3).toEqual(expectString3);
        expect(markdownString4).toEqual(expectString4);
        expect(markdownString5).toEqual(expectString5);
        expect(markdownString6).toEqual(expectString6);
        expect(markdownString7).toEqual(expectString7);
      });
      it('공백 테스트', function() {
        var markdownString1 = stripMarkdown('***텍스트 입니다.');
        var expectString1 = '***텍스트 입니다.';

        expect(markdownString1).toEqual(expectString1);
      });
    });

    describe('strike-through', function() {
      it('여러가지 케이스를 테스트 한다.', function() {
        var markdownString1 = stripMarkdown('~~텍스트~~ 입니다.');
        var expectString1 = '텍스트 입니다.';

        expect(markdownString1).toEqual(expectString1);
      });
      it('공백 테스트', function() {
        var markdownString1 = stripMarkdown('~~텍스트 입니다.');
        var expectString1 = '~~텍스트 입니다.';

        expect(markdownString1).toEqual(expectString1);
      });
    });
    describe('link-anchor', function() {
      it('여러가지 케이스를 테스트 한다.', function() {
        var markdownString1 = stripMarkdown('[링크](http://naver.com) 입니다.');
        var expectString1 = '링크 입니다.';

        var markdownString2 = stripMarkdown('중간 [링크](http://naver.com) 입니다.');
        var expectString2 = '중간 링크 입니다.';

        var markdownString3 = stripMarkdown('중간 [링크](http://naver.com)');
        var expectString3 = '중간 링크';

        var markdownString4 = stripMarkdown('중간 [링크1](http://naver.com)하하[링크2](http://google.com)');
        var expectString4 = '중간 링크1하하링크2';

        var markdownString5 = stripMarkdown('중간 [링크1](http://naver.com) 하하 [링크2](http://google.com)');
        var expectString5 = '중간 링크1 하하 링크2';

        var markdownString6 = stripMarkdown('새 카드 &quot;[<a href="http://google.com" target="_blank" rel="nofollow">google.com</a>](<a href="https://www.trello.com/c/iOL2J7j1" target="_blank" rel="nofollow">https://www.trello.com/c/iOL2J7j1</a>)&quot; (이)가 &quot;[dkfslkf](<a href="https://www.trello.com/b/VgAGh9hF" target="_blank" rel="nofollow">https://www.trello.com/b/VgAGh9hF</a>)&quot; 리스트에 추가되었습니다.');
        var expectString6 = '새 카드 &quot;[<a href="http://google.com" target="_blank" rel="nofollow">google.com</a>](<a href="https://www.trello.com/c/iOL2J7j1" target="_blank" rel="nofollow">https://www.trello.com/c/iOL2J7j1</a>)&quot; (이)가 &quot;[dkfslkf](<a href="https://www.trello.com/b/VgAGh9hF" target="_blank" rel="nofollow">https://www.trello.com/b/VgAGh9hF</a>)&quot; 리스트에 추가되었습니다.';

        var markdownString7 = stripMarkdown('링크[#93: [DESIGN] company, main 페이지수정](https://github.com/tosslab/web_landing/pull/93)가 종료되었습니다.');
        var expectString7 = '링크#93: [DESIGN] company, main 페이지수정가 종료되었습니다.';

        var markdownString8 = stripMarkdown('[tosslab/web_landing] [ted-jihoon-kim](https://github.com/ted-jihoon-kim)님의 풀 리퀘스트 [#93: [DESIGN] company, main 페이지수정](https://github.com/tosslab/web_landing/pull/93)가 종료되었습니다.');
        var expectString8 = '[tosslab/web_landing] ted-jihoon-kim님의 풀 리퀘스트 #93: [DESIGN] company, main 페이지수정가 종료되었습니다.';

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
          var markdownString1 = stripMarkdown('중간 [링크1](<>) 하하 [링크2](<>)');
          var expectString1 = '중간 링크1 하하 링크2';

          var markdownString2 = stripMarkdown('중간 [링크1](<http://naver.com>) 하하 [링크2](<http://google.com>)');
          var expectString2 = '중간 링크1 하하 링크2';

          expect(markdownString1).toEqual(expectString1);
          expect(markdownString2).toEqual(expectString2);
        });
        it('html encode 된 꺽쇠', function() {
          var markdownString1 = stripMarkdown('중간 [링크1](&lt;&gt;) 하하 [링크2](&lt;&gt;)');
          var expectString1 = '중간 링크1 하하 링크2';

          var markdownString2 = stripMarkdown('중간 [링크1](&lt;http://naver.com&gt;) 하하 [링크2](&lt;http://google.com&gt;)');
          var expectString2 = '중간 링크1 하하 링크2';

          expect(markdownString1).toEqual(expectString1);
          expect(markdownString2).toEqual(expectString2);
        });
      });

      it('img(!) 가 들어갔을 경우를 테스트 한다. 현재 스펙은 링크 그대로 반환한다.', function() {
        //TODO: img 태그 지원가능한 스펙이 된다면 img tag 로 변환이 잘 되는지를 테스트해야함.
        var markdownString1 = stripMarkdown('![링크](http://naver.com) 입니다.');
        var expectString1 = '!링크 입니다.';

        var markdownString2 = stripMarkdown('중간 ![링크](http://naver.com) 입니다.');
        var expectString2 = '중간 !링크 입니다.';

        var markdownString3 = stripMarkdown('중간 ![링크](http://naver.com)');
        var expectString3 = '중간 !링크';

        var markdownString4 = stripMarkdown('중간 ![링크1](http://naver.com)하하![링크2](http://google.com)');
        var expectString4 = '중간 !링크1하하!링크2';

        var markdownString5 = stripMarkdown('중간 ![링크1](http://naver.com) 하하 ![링크2](http://google.com)');
        var expectString5 = '중간 !링크1 하하 !링크2';

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
          var markdownString1 = stripMarkdown('일반 *기울임 **굵게 기울임 ~~그리고 취소선~~을 해본다**텍스트의 끝*');
          var expectString1 = '일반 기울임 굵게 기울임 그리고 취소선을 해본다텍스트의 끝';
          expect(markdownString1).toEqual(expectString1);
        });
        it('띄어쓰기 없는 복잡한 마크다운 1', function() {
          var markdownString1 = stripMarkdown('일반*기울임**굵게기울임~~그리고취소선~~을해본다**텍스트의끝*');
          var expectString1 = '일반기울임굵게기울임그리고취소선을해본다텍스트의끝';
          expect(markdownString1).toEqual(expectString1);
        });
      });
      describe('Anchor 가 포함된 텍스트도 잘 변환하는지 확인한다.', function() {
        it('복잡한 마크다운 1', function() {
          var markdownString1 = stripMarkdown('일반 *기울임 **굵게 기울임 ~~그리고 <a href="http://www.jandi.com/test">취소선</a>~~을 해본다**텍스트의 끝*');
          var expectString1 = '일반 기울임 굵게 기울임 그리고 <a href="http://www.jandi.com/test">취소선</a>을 해본다텍스트의 끝';
          expect(markdownString1).toEqual(expectString1);
        });
        it('복잡한 마크다운 2', function() {
          var markdownString1 = stripMarkdown('일반 *기울임 **굵게 기울임 ~~그리고 취소선~~을 <a href="http://www.jandi.com/test">해본다</a>**텍스트의 끝*');
          var expectString1 = '일반 기울임 굵게 기울임 그리고 취소선을 <a href="http://www.jandi.com/test">해본다</a>텍스트의 끝';
          expect(markdownString1).toEqual(expectString1);
        });
        it('띄어쓰기 없는 복잡한 마크다운 1', function() {
          var markdownString1 = stripMarkdown('일반*기울임**굵게기울임~~그리고<a href="http://www.jandi.com/test">취소선</a>~~을해본다**텍스트의끝*');
          var expectString1 = '일반기울임굵게기울임그리고<a href="http://www.jandi.com/test">취소선</a>을해본다텍스트의끝';
          expect(markdownString1).toEqual(expectString1);
        });
      });
      describe('link markdown 까지 잘 변환하는지 확인한다.', function() {
        it('복잡한 마크다운 1 - link 에 상대 경로/절대경로 적용시', function() {
          var markdownString1 = stripMarkdown('일반 *기울임 **굵게 기울임 ~~그리고 <a href="http://www.jandi.com/test">취소선</a>[링크1](/index.html)~~을 [링크2](./index.html) 해본다**텍스트의 끝*');
          var expectString1 = '일반 기울임 굵게 기울임 그리고 <a href="http://www.jandi.com/test">취소선</a>링크1을 링크2 해본다텍스트의 끝';
          expect(markdownString1).toEqual(expectString1);
        });

        it('복잡한 마크다운 2 - link 에 url 적용시', function() {
          var markdownString1 = stripMarkdown('일반 *기울임 **굵게 기울임 ~~그리고 <a href="http://www.jandi.com/test">취소선</a>[링크1](http://www.jandi.com/index.html)~~을 [링크2](http://www.jandi.com/index2.html) 해본다**텍스트의 끝*');
          var expectString1 = '일반 기울임 굵게 기울임 그리고 <a href="http://www.jandi.com/test">취소선</a>링크1을 링크2 해본다텍스트의 끝';
          expect(markdownString1).toEqual(expectString1);
        });
      });

      describe('mention 이 있을때 mention 을 잘 보존하는지 테스트 한다', function() {
        it('mention 만 존재할 경우우', function() {
          var markdownString1 = stripMarkdown('<a mention-view="11151636" mention-type="member" mention-active="on">@DennisDennisDennisDennisDennis</a> <a mention-view="283" mention-type="member" mention-active="on">@Jane</a>');
          var expectString1 = '<a mention-view="11151636" mention-type="member" mention-active="on">@DennisDennisDennisDennisDennis</a> <a mention-view="283" mention-type="member" mention-active="on">@Jane</a>';
          expect(markdownString1).toEqual(expectString1);
        });
      });
    });
  });
})();
