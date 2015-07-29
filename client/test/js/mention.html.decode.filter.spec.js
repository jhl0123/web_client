(function() {
  'use strict';

  //@JiHoon 291
  //@Young Park 11153801
  //@mak pak 3017772

  describe('mention.html.decode.filter', function() {
    var $filter;

    beforeEach(module('jandiApp'));
    beforeEach(inject(function(_$filter_) {
      $filter = _$filter_;
    }));

    it('mention 만 적절히 치환하는지 확인한다.', function() {
      var filter = $filter('mentionHtmlDecode');
      var message1 = '&lt;a mention-view=&quot;11153801&quot;&gt;@Young Park&lt;/a&gt; Check this out, @Hugo, &lt;a mention-view=&quot;291&quot;&gt;@JiHoon&lt;/a&gt;,&lt;a mention-view=&quot;3017772&quot;&gt;@mak pak&lt;/a&gt;!important!';
      var expectStr = '<a mention-view="11153801">@Young Park</a> Check this out, @Hugo, <a mention-view="291">@JiHoon</a>,<a mention-view="3017772">@mak pak</a>!important!';
      expect(filter(message1)).toEqual(expectStr);
    });
  });
})();
