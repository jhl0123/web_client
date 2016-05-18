/**
 * @fileoverview Markdown service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Markdown', Markdown);

  function Markdown() {
    var that = this;
    var regexMap = {
      bolditalic: /([*]{3})((?:[^*\s])|(?:[^*\s](?:.*?)[^*\s]))\1/g,
      bold: /([*]{2})((?:[^*\s])|(?:[^*\s](?:.*?)[^*\s]))\1/g,
      italic: /([*]{1})((?:[^*\s])|(?:[^*\s](?:.*?)[^*\s]))\1/g,
      strikethrough: /([~]{2})((?:[^~\s])|(?:[^~\s](?:.*?)[^~\s]))\1/g,
      links: /(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?((?:\([^)]*\)|[^()\s])*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g
    };

    that.getRegexMap = getRegexMap;

    /**
     * markdown regexMap 전달
     * @returns {{bolditalic: RegExp, bold: RegExp, italic: RegExp, strikethrough: RegExp, links: RegExp}}
     */
    function getRegexMap() {
      return regexMap;
    }
  }
})();
