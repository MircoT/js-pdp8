// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("pdp8", function(_config, parserConfig) {
  'use strict';
  var keywords = {};

  // Memory Reference Istructions
  keywords.mri = /^(and|AND|add|ADD|lda|LDA|sta|STA|bun|BUN|bsa|BSA|isz|ISZ)\b/;
  // Register Reference Istructions
  keywords.rri = /^(cla|CLA|cle|CLE|cma|CMA|cir|CIR|cil|CIL|inc|INC|spa|SPA|sza|SZA|sna|SNA|sze|SZE|hlt|HLT)\b/;
  // I/O Istructions
  keywords.io = /^(inp|INP|out|OUT|ion|ION|iof|IOF)\b/;

  // Preprocessor directives
  var preprocessor = /^(org|ORG|end|END)\b/;
  var hex_dec = /^(hex|HEX|dec|DEC)\b/;

  // Numbers
  var numbers = /^[\-]?[0-9a-fA-F]+\b/;

  // indirect
  var indirect = /^(i|I)\b/;


  return {
    startState: function() {
      return {
        tokenize: null
      };
    },

    token: function(stream, state) {
        
      if (stream.eatSpace()) return null;

      var w;
      
      if (stream.eat('/')) {
        if (stream.eat('/')) {
          stream.skipToEnd();
          return "comment-2";
        }
        else if (stream.eat('*')) {
          if (!stream.skipTo("*/")) {
            stream.skipToEnd();
            state.tokenize = 'comment';
          }
          return "comment-2";          
        }
      }
      else if (state.tokenize === 'comment') {
        if (!stream.skipTo("*/")) {
          stream.skipToEnd();
          state.tokenize = 'comment';
        }
        else {
          state.tokenize = null;
        }
        return "comment-2";
      }
      else if (stream.eatWhile(/[\w\-]/)) {
        w = stream.current();

        if (keywords.mri.test(w) || keywords.rri.test(w) || keywords.io.test(w)) {
          return 'keyword';
        }
        else if(preprocessor.test(w)) {
          return 'property';
        }
        else if(hex_dec.test(w)) {
          return 'variable-2';
        }
        else if(numbers.test(w) && stream.peek() !== ',') {
          return 'number';
        }
        else if(!indirect.test(w)) {
          return 'string';
        }
      }
      else {
        stream.next();
      }
      return null;
    }
  };
});

});
