/**
 * @fileoverview 특정 text에 대한 link 생성 Service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('LinkText', LinkText);

  function LinkText() {
    // Url, Email 식별 정규식
    // https://github.com/twitter/twitter-text/blob/master/js/twitter-text.js#L225-L373
    // 참조함
    var txt = {
      regexen: {}
    };

    var escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    };

    txt.htmlEscape = htmlEscape;

    function htmlEscape(str) {
      return str.replace(/[&<>'"]/g, function($1) {
        return escapeMap[$1];
      });
    }

    txt.regexSupplant = regexSupplant;

    function regexSupplant(regex, flags) {
      flags = flags || "";
      if (typeof regex !== "string") {
        if (regex.global && flags.indexOf("g") < 0) {
          flags += "g";
        }
        if (regex.ignoreCase && flags.indexOf("i") < 0) {
          flags += "i";
        }
        if (regex.multiline && flags.indexOf("m") < 0) {
          flags += "m";
        }

        regex = regex.source;
      }

      return new RegExp(regex.replace(/#\{(\w+)\}/g, function(match, name) {
        var newRegex = txt.regexen[name] || "";
        if (typeof newRegex !== "string") {
          newRegex = newRegex.source;
        }
        return newRegex;
      }), flags);
    }

    txt.stringSupplant = stringSupplant;

    // simple string interpolation
    function stringSupplant(str, values) {
      return str.replace(/#\{(\w+)\}/g, function(match, name) {
        return values[name] || "";
      });
    }

    txt.addCharsToCharClass = addCharsToCharClass;

    function addCharsToCharClass(charClass, start, end) {
      var s = String.fromCharCode(start);
      if (end !== start) {
        s += "-" + String.fromCharCode(end);
      }
      charClass.push(s);
      return charClass;
    }

    // Simple object cloning function for simple objects
    function clone(o) {
      var r = {};
      for (var k in o) {
        if (o.hasOwnProperty(k)) {
          r[k] = o[k];
        }
      }

      return r;
    }

    function decodeUri( str ) {
      try {
        str = decodeURI( str );
      } catch( err ) {}

      return str;
    }

    // Space is more than %20, U+3000 for example is the full-width space used with Kanji. Provide a short-hand
    // to access both the list of characters and a pattern suitible for use with String#split
    // Taken from: ActiveSupport::Multibyte::Handlers::UTF8Handler::UNICODE_WHITESPACE
    var fromCode = String.fromCharCode;
    var UNICODE_SPACES = [
      fromCode(0x0020), // White_Space # Zs       SPACE
      fromCode(0x0085), // White_Space # Cc       <control-0085>
      fromCode(0x00A0), // White_Space # Zs       NO-BREAK SPACE
      fromCode(0x1680), // White_Space # Zs       OGHAM SPACE MARK
      fromCode(0x180E), // White_Space # Zs       MONGOLIAN VOWEL SEPARATOR
      fromCode(0x2028), // White_Space # Zl       LINE SEPARATOR
      fromCode(0x2029), // White_Space # Zp       PARAGRAPH SEPARATOR
      fromCode(0x202F), // White_Space # Zs       NARROW NO-BREAK SPACE
      fromCode(0x205F), // White_Space # Zs       MEDIUM MATHEMATICAL SPACE
      fromCode(0x3000)  // White_Space # Zs       IDEOGRAPHIC SPACE
    ];
    addCharsToCharClass(UNICODE_SPACES, 0x009, 0x00D); // White_Space # Cc   [5] <control-0009>..<control-000D>
    addCharsToCharClass(UNICODE_SPACES, 0x2000, 0x200A); // White_Space # Zs  [11] EN QUAD..HAIR SPACE

    var INVALID_CHARS = [
      fromCode(0xFFFE),
      fromCode(0xFEFF), // BOM
      fromCode(0xFFFF) // Special
    ];
    addCharsToCharClass(INVALID_CHARS, 0x202A, 0x202E); // Directional change

    var GOOD_IRI_CHARS = [];
    addCharsToCharClass(GOOD_IRI_CHARS, 0x00A0, 0xD7FF);
    addCharsToCharClass(GOOD_IRI_CHARS, 0xF900, 0xFDCF);
    addCharsToCharClass(GOOD_IRI_CHARS, 0xFDF0, 0xFFEF);

    txt.regexen.punct = /\!'#%&'\(\)*\+,\\\-\.\/:;<=>\?@\[\]\^_{|}~\$/;
    txt.regexen.spaces_group = regexSupplant(UNICODE_SPACES.join(''));
    txt.regexen.invalid_chars_group = regexSupplant(INVALID_CHARS.join(''));
    txt.regexen.good_iri_chars = regexSupplant(GOOD_IRI_CHARS.join(''))

    // URL related regex collection
    txt.regexen.invalidDomainChars = stringSupplant("#{punct}#{spaces_group}#{invalid_chars_group}", txt.regexen);
    txt.regexen.validGeneralUrlPathChars = stringSupplant("#{good_iri_chars}", txt.regexen);
    txt.regexen.validDomainChars = regexSupplant(/[^#{invalidDomainChars}]/);
    txt.regexen.validSubdomain = regexSupplant(/(?:(?:#{validDomainChars}(?:[_-]|#{validDomainChars})*)?#{validDomainChars}\.)/);
    txt.regexen.validDomainName = regexSupplant(/(?:(?:#{validDomainChars}(?:-|#{validDomainChars})*)?#{validDomainChars}\.)/);

    txt.regexen.validGTLD = regexSupplant(RegExp(
      '(?:(?:' +
      'abbott|abogado|academy|accountant|accountants|active|actor|ads|adult|aero|afl|agency|airforce|' +
      'allfinanz|alsace|amsterdam|android|apartments|aquarelle|archi|army|arpa|asia|associates|' +
      'attorney|auction|audio|autos|axa|band|bank|bar|barclaycard|barclays|bargains|bauhaus|bayern|bbc|' +
      'beer|berlin|best|bid|bike|bingo|bio|biz|black|blackfriday|bloomberg|blue|bmw|bnpparibas|boats|' +
      'bond|boo|boutique|brussels|budapest|build|builders|business|buzz|bzh|cab|cafe|cal|camera|camp|' +
      'cancerresearch|canon|capetown|capital|caravan|cards|care|career|careers|cartier|casa|cash|' +
      'casino|cat|catering|cbn|center|ceo|cern|cfd|channel|chat|cheap|chloe|christmas|chrome|church|' +
      'citic|city|claims|cleaning|click|clinic|clothing|club|coach|codes|coffee|college|cologne|com|' +
      'community|company|computer|condos|construction|consulting|contractors|cooking|cool|coop|country|' +
      'courses|credit|creditcard|cricket|crs|cruises|cuisinella|cymru|cyou|dabur|dad|dance|date|dating|' +
      'datsun|day|dclk|deals|degree|delivery|democrat|dental|dentist|desi|design|dev|diamonds|diet|' +
      'digital|direct|directory|discount|dnp|docs|doha|domains|doosan|download|durban|dvag|eat|edu|' +
      'education|email|emerck|energy|engineer|engineering|enterprises|epson|equipment|erni|esq|estate|' +
      'eurovision|eus|events|everbank|exchange|expert|exposed|express|fail|faith|fan|fans|farm|fashion|' +
      'feedback|film|finance|financial|firmdale|fish|fishing|fit|fitness|flights|florist|flowers|' +
      'flsmidth|fly|foo|football|forex|forsale|foundation|frl|frogans|fund|furniture|futbol|gal|' +
      'gallery|garden|gbiz|gdn|gent|ggee|gift|gifts|gives|glass|gle|global|globo|gmail|gmo|gmx|gold|' +
      'goldpoint|golf|goo|goog|google|gop|gov|graphics|gratis|green|gripe|guge|guide|guitars|guru|' +
      'hamburg|hangout|haus|healthcare|help|here|hermes|hiphop|hiv|holdings|holiday|homes|horse|host|' +
      'hosting|house|how|ibm|ifm|immo|immobilien|industries|infiniti|info|ing|ink|institute|insure|int|' +
      'international|investments|irish|iwc|java|jcb|jetzt|jewelry|jobs|joburg|juegos|kaufen|kddi|kim|' +
      'kitchen|kiwi|koeln|komatsu|krd|kred|kyoto|lacaixa|land|lat|latrobe|lawyer|lds|lease|leclerc|' +
      'legal|lgbt|lidl|life|lighting|limited|limo|link|loan|loans|london|lotte|lotto|love|ltda|luxe|' +
      'luxury|madrid|maif|maison|management|mango|market|marketing|markets|marriott|media|meet|' +
      'melbourne|meme|memorial|menu|miami|mil|mini|mma|mobi|moda|moe|monash|money|mormon|mortgage|' +
      'moscow|motorcycles|mov|movie|mtn|mtpc|museum|nagoya|name|navy|net|network|neustar|new|news|' +
      'nexus|ngo|nhk|nico|ninja|nissan|nra|nrw|ntt|nyc|okinawa|one|ong|onl|online|ooo|org|organic|' +
      'osaka|otsuka|ovh|page|panerai|paris|partners|parts|party|pharmacy|photo|photography|photos|' +
      'physio|piaget|pics|pictet|pictures|pink|pizza|place|plumbing|plus|pohl|poker|porn|post|praxi|' +
      'press|pro|prod|productions|prof|properties|property|pub|qpon|quebec|racing|realtor|recipes|red|' +
      'redstone|rehab|reise|reisen|reit|ren|rentals|repair|report|republican|rest|restaurant|review|' +
      'reviews|rich|rio|rip|rocks|rodeo|rsvp|ruhr|ryukyu|saarland|sale|samsung|sap|sarl|saxo|sca|scb|' +
      'schmidt|scholarships|school|schule|schwarz|science|scot|seat|services|sew|sex|sexy|shiksha|' +
      'shoes|show|shriram|singles|site|sky|social|software|sohu|solar|solutions|sony|soy|space|spiegel|' +
      'spreadbetting|study|style|sucks|supplies|supply|support|surf|surgery|suzuki|sydney|systems|' +
      'taipei|tatar|tattoo|tax|team|tech|technology|tel|temasek|tennis|tickets|tienda|tips|tires|tirol|' +
      'today|tokyo|tools|top|toshiba|tours|town|toys|trade|trading|training|travel|trust|tui|' +
      'university|uno|uol|vacations|vegas|ventures|vermögensberater|vermögensberatung|versicherung|vet|' +
      'viajes|video|villas|vision|vlaanderen|vodka|vote|voting|voto|voyage|wales|wang|watch|webcam|' +
      'website|wed|wedding|weir|whoswho|wien|wiki|williamhill|win|wme|work|works|world|wtc|wtf|xerox|' +
      'xin|xxx|xyz|yachts|yandex|yodobashi|yoga|yokohama|youtube|zip|zone|zuerich|дети|москва|онлайн|' +
      'орг|рус|сайт|بازار|شبكة|موقع|संगठन|みんな|グーグル|世界|中信|中文网|企业|佛山|信息|健康|八卦|公司|公益|商城|商店|商标|在线|广东|慈善|' +
      '我爱你|手机|政务|政府|时尚|机构|淡马锡|游戏|移动|组织机构|网址|网店|网络|谷歌|集团|飞利浦|삼성|onion' +
      ')(?=[^0-9a-zA-Z@]|$))'));
    txt.regexen.validCCTLD = regexSupplant(RegExp(
      '(?:(?:' +
      'ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bl|bm|bn|bo|bq|' +
      'br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|' +
      'ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|' +
      'gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|' +
      'la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mf|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|' +
      'my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|' +
      'rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|' +
      'tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw|' +
      'бел|мкд|мон|рф|срб|укр|қаз|հայ|الاردن|الجزائر|السعودية|المغرب|امارات|ایران|بھارت|تونس|سودان|' +
      'سورية|عراق|عمان|فلسطين|قطر|مصر|مليسيا|پاکستان|भारत|বাংলা|ভারত|ਭਾਰਤ|ભારત|இந்தியா|இலங்கை|' +
      'சிங்கப்பூர்|భారత్|ලංකා|ไทย|გე|中国|中國|台湾|台灣|新加坡|澳門|香港|한국' +
      ')(?=[^0-9a-zA-Z@]|$))'));
    txt.regexen.validPunycode = /(?:xn--[0-9a-z]+)/;
    txt.regexen.invalidUrlWithoutProtocolPrecedingChars = /[-_.\/]$/;
    txt.regexen.validAsciiDomain = regexSupplant(/(?:(?:[\-a-z0-9#{validGeneralUrlPathChars}]+)\.)+(?:#{validGTLD}|#{validCCTLD}|#{validPunycode})/gi);
    txt.regexen.validSpecialCCTLD = regexSupplant(RegExp('(?:(?:co|tv)(?=[^0-9a-zA-Z@]|$))'));

    txt.regexen.invalidShortDomain = regexSupplant(/^#{validDomainName}#{validCCTLD}$/i);
    txt.regexen.validSpecialShortDomain = regexSupplant(/^#{validDomainName}#{validSpecialCCTLD}$/i);
    txt.regexen.validUrlPrecedingChars = regexSupplant(/(?:[^A-Za-z0-9@＠$#＃#{invalid_chars_group}]|^)/);

    txt.regexen.validHexFF = /(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/;
    txt.regexen.validIPv4 = regexSupplant(/(?:(?:(?!0)#{validHexFF})\.#{validHexFF}\.#{validHexFF}\.#{validHexFF})/);

    txt.regexen.validDomain = regexSupplant(/(?:#{validSubdomain}*#{validDomainName}(?:#{validGTLD}|#{validCCTLD}|#{validPunycode})|#{validIPv4})/);
    txt.regexen.validPortNumber = /[0-9]+/;
    txt.regexen.validUrlPath = regexSupplant(/(?:\/(?:(?:[a-zA-Z0-9#{validGeneralUrlPathChars};\?:@&=#~.+!*'\(\),-_])|(?:%[a-fA-F0-9]{2}))*)?(?:\b)(?:\/)?/);

    txt.regexen.extractUrl = regexSupplant(
      '('                                                            + // $1 total match
        '(#{validUrlPrecedingChars})'                                + // $2 Preceeding chracter
        '('                                                          + // $3 URL
          '(https?:\\/\\/)?'                                         + // $4 Protocol (optional)
          '(#{validDomain})'                                         + // $5 Domain(s)
          '(?::(#{validPortNumber}))?'                               + // $6 Port number (optional)
          '(#{validUrlPath})'                                        + // $7 URL Path & Query String
        ')|'                                                         +
        '((?:@)'                                                     + // $8 Email Full Text
          '([a-zA-Z0-9\\+\\.\\_\\%\\-\\+]{1,256}'                    + // $9 Email
          '\\@'                                                      +
          '[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}'                          +
          '(?:'                                                      +
          '\\.'                                                      +
          '[a-zA-Z0-9][a-zA-Z0-9\\-]{0,25}'                          +
          '))+'                                                      +
        ')'                                                          +
      ')'
    , 'gi');
    txt.regexen.urlHasProtocol = /^https?:\/\//i;
    txt.regexen.validMentionPrecedingChars = /(?:^|[^a-zA-Z0-9_!#$%&*@＠]|(?:^|[^a-zA-Z0-9_+~.-])(?:rt|RT|rT|Rt):?)/;
    txt.regexen.atSigns = /[@＠]/;
    txt.regexen.validMentionOrList = regexSupplant(
      '(#{validMentionPrecedingChars})' +  // $1: Preceding character
      '(#{atSigns})' +                     // $2: At mark
      '([a-zA-Z0-9_]{1,20})' +             // $3: Screen name
      '(\/[a-zA-Z][a-zA-Z0-9_\-]{0,24})?'  // $4: List (optional)
      , 'g');
    txt.extractUrlsWithIndices = function(text, options) {
      var urls = [];
      var before;
      var url;
      var protocol;
      var domain;
      var port;
      var pathQuery;
      var emailFullText;
      var email;
      var endPosition;
      var startPosition;

      var lastUrl;
      var asciiEndPosition;

      if (!options) {
        options = {extractUrlsWithoutProtocol: true};
      }

      while (txt.regexen.extractUrl.exec(text)) {
        before = RegExp.$2;
        url = RegExp.$3;
        protocol = RegExp.$4;
        domain = RegExp.$5;
        port = RegExp.$6;
        pathQuery = RegExp.$7;
        emailFullText = RegExp.$8;
        email = RegExp.$9;

        endPosition = txt.regexen.extractUrl.lastIndex;
        if (email && emailFullText === email) {
          startPosition = endPosition - email.length;

          urls.push({
            email: email,
            indices: [startPosition, endPosition]
          });
        } else {
          startPosition = endPosition - url.length;

          // console.log('before : ', before, 'url : ', url, 'protocol : ', protocol, 'domain : ', domain, 'pathQuery : ', pathQuery);
          // if protocol is missing and domain contains non-ASCII characters,
          // extract ASCII-only domains.
          if (!protocol) {
            if (options.extractUrlsWithoutProtocol && !before.match(txt.regexen.invalidUrlWithoutProtocolPrecedingChars)) {
              lastUrl = null;
              asciiEndPosition = 0;

              domain.replace(txt.regexen.validAsciiDomain, function(asciiDomain) {
                var asciiStartPosition;
                var asciiEndPosition;

                if (port) {
                  domain += (':' + port);
                  asciiDomain += (':' + port);
                }

                asciiStartPosition = domain.indexOf(asciiDomain, asciiEndPosition);
                asciiEndPosition = asciiStartPosition + asciiDomain.length;

                lastUrl = {
                  url: asciiDomain,
                  indices: [startPosition + asciiStartPosition, startPosition + asciiEndPosition]
                };

                if (pathQuery || asciiDomain.match(txt.regexen.validSpecialShortDomain) || !asciiDomain.match(txt.regexen.invalidShortDomain)) {
                  urls.push(lastUrl);
                }
              });

              // lastUrl only contains domain. Need to add path and query if they exist.
              if (lastUrl && pathQuery) {
                lastUrl.url = url.replace(domain, lastUrl.url);
                lastUrl.indices[1] = endPosition;
              }
            }
          } else {
            urls.push({
              url: url,
              indices: [startPosition, endPosition]
            });
          }
        }
      }

      return urls;
    };

    var BOOLEAN_ATTRIBUTES = {'disabled':true, 'readonly':true, 'multiple':true, 'checked':true};
    txt.tagAttrs = function(attributes) {
      var htmlAttrs = '';
      var k;
      var v;

      for (k in attributes) {
         v = attributes[k];
        if (BOOLEAN_ATTRIBUTES[k]) {
          v = v ? k : null;
        }
        if (v != null) {
          htmlAttrs += ' ' + txt.htmlEscape(k) + '="' + txt.htmlEscape(v.toString()) + '"';
        }
      }
      return htmlAttrs;
    };

    txt.linkToUrl = function(entity, text, options) {
      var url = entity.url;
      var displayUrl = url;
      var linkText = txt.htmlEscape(displayUrl);
      var attrs = clone(options.htmlAttrs || {});

      if (!url.match(txt.regexen.urlHasProtocol)) {
        url = "http://" + url;
      }
      attrs.href = url;

      if (options.targetBlank) {
        attrs.target = '_blank';
      }

      // set class only if urlClass is specified.
      if (options.urlClass) {
        attrs["class"] = options.urlClass;
      }

      // set target only if urlTarget is specified.
      if (options.urlTarget) {
        attrs.target = options.urlTarget;
      }

      return txt.linkToText(entity, linkText, attrs, options);
    };

    txt.linkToEmail = function(entity, text, options) {
      var email = entity.email;
      var displayEmail = email;
      var linkText = txt.htmlEscape(displayEmail);
      var attrs = clone(options.htmlAttrs || {});

      attrs.href = 'mailto:' + email;

      if (options.emailClass) {
        attrs["class"] = options.urlClass;
      }

      return txt.linkToText(entity, linkText, attrs, options);
    };

    txt.linkToText = function(entity, text, attributes, options) {
      if (!options.suppressNoFollow) {
        attributes.rel = "nofollow";
      }
      // if linkAttributeBlock is specified, call it to modify the attributes
      if (options.linkAttributeBlock) {
        options.linkAttributeBlock(entity, attributes);
      }
      // if linkTextBlock is specified, call it to get a new/modified link text
      if (options.linkTextBlock) {
        text = options.linkTextBlock(entity, text);
      }

      return stringSupplant('<a#{attr}>#{text}</a>', {
        text: text,
        attr: txt.tagAttrs(attributes)
      });
    };

    txt.autoLinkEntities = function(text, entities, options) {
      var entity;
      var i;
      var len;
      var result;
      var beginIndex = 0;

      options = clone(options || {});

      entities.sort(function(a,b) { return a.indices[0] - b.indices[0]; });
      result = '';
      for (i = 0, len = entities.length; i < len; ++i) {
        entity = entities[i];

        result += txt.htmlEscape(text.substring(beginIndex, entity.indices[0]));
        if (entity.url) {
          result += txt.linkToUrl(entity, text, options);
        } else if (entity.email) {
          result += txt.linkToEmail(entity, text, options);
        }

        beginIndex = entity.indices[1];
      }

      result += txt.htmlEscape(text.substring(beginIndex, text.length));
      return result;
    };

    txt.autoLink = function(text, options) {
      var entities = txt.extractUrlsWithIndices(text, {extractUrlsWithoutProtocol: true});
      return txt.autoLinkEntities(text, entities, options);
    };

    var e;
    for ( e in txt) {
      if (txt.hasOwnProperty(e)) {
        this[e] = txt[e];
      }
    }
  }
})();
