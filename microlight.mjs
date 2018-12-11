/**
 * @fileoverview microlight.mjs - syntax highlightning library
 * @version based on 0.0.7, see package.json and git tags for current version number
 *
 *
 * @license MIT, see http://github.com/asvd/microlight
 * @copyright 2016 asvd <heliosframework@gmail.com>
 *
 * Modified by Ivan Trubach <mr.trubach@icloud.com>
 * All changes are public domain to the extent allowed by law.
 * For more information, please refer to <https://unlicense.org/>
 */

import { escapeHTML } from './util'

const keywords = {
  'abstract': true,
  'alias': true,
  'and': true,
  'arguments': true,
  'array': true,
  'as': true,
  'asm': true,
  'assert': true,
  'auto': true,
  'base': true,
  'begin': true,
  'bool': true,
  'boolean': true,
  'break': true,
  'byte': true,
  'case': true,
  'catch': true,
  'char': true,
  'checked': true,
  'class': true,
  'clone': true,
  'compl': true,
  'const': true,
  'continue': true,
  'debugger': true,
  'decimal': true,
  'declare': true,
  'default': true,
  'defer': true,
  'deinit': true,
  'delegate': true,
  'delete': true,
  'do': true,
  'double': true,
  'echo': true,
  'elif': true,
  'elsif': true,
  'else': true,
  'elseif': true,
  'end': true,
  'ensure': true,
  'enum': true,
  'event': true,
  'except': true,
  'exec': true,
  'explicit': true,
  'export': true,
  'extends': true,
  'extension': true,
  'extern': true,
  'fallthrough': true,
  'false': true,
  'final': true,
  'finally': true,
  'fixed': true,
  'float': true,
  'fn': true,
  'for': true,
  'foreach': true,
  'friend': true,
  'from': true,
  'fun': true,
  'func': true,
  'function': true,
  'global': true,
  'go': true,
  'goto': true,
  'guard': true,
  'if': true,
  'implements': true,
  'implicit': true,
  'import': true,
  'int': true,
  'include': true,
  'include_once': true,
  'inline': true,
  'inout': true,
  'instanceof': true,
  'interface': true,
  'internal': true,
  'is': true,
  'lambda': true,
  'let': true,
  'lock': true,
  'long': true,
  'microlight': true,
  'module': true,
  'mutable': true,
  'NaN': true,
  'namespace': true,
  'native': true,
  'next': true,
  'new': true,
  'nil': true,
  'not': true,
  'null': true,
  'object': true,
  'operator': true,
  'or': true,
  'out': true,
  'override': true,
  'package': true,
  'params': true,
  'private': true,
  'protected': true,
  'protocol': true,
  'public': true,
  'raise': true,
  'readonly': true,
  'redo': true,
  'ref': true,
  'register': true,
  'repeat': true,
  'require': true,
  'require_once': true,
  'rescue': true,
  'restrict': true,
  'retry': true,
  'return': true,
  'sbyte': true,
  'sealed': true,
  'self': true,
  'short': true,
  'signed': true,
  'sizeof': true,
  'static': true,
  'string': true,
  'struct': true,
  'subscript': true,
  'super': true,
  'synchronized': true,
  'switch': true,
  'tailrec': true,
  'template': true,
  'then': true,
  'this': true,
  'throw': true,
  'throws': true,
  'transient': true,
  'true': true,
  'try': true,
  'type': false, // TODO: update tests and enable
  'typealias': true,
  'typedef': true,
  'typeid': true,
  'typename': true,
  'typeof': true,
  'unchecked': true,
  'undef': true,
  'undefined': true,
  'union': true,
  'unless': true,
  'unsigned': true,
  'until': true,
  'use': true,
  'using': true,
  'val': true,
  'var': true,
  'virtual': true,
  'void': true,
  'volatile': true,
  'wchar_t': true,
  'when': true,
  'where': true,
  'while': true,
  'with': true,
  'xor': true,
  'yield': true,
  '': false // for diffs, because linter warns on trailing comma
}

// https://en.wikipedia.org/wiki/Alpha_compositing#Alpha_blending
// https://en.wikipedia.org/wiki/Transparency_%28graphic%29#Compositing_calculations

// combine dst (bg) and src (fg) RGBA colors
function blend (dst, src) {
  const out = { r: 0, g: 0, b: 0, a: 1 }
  if (dst.a !== 1) {
    out.a = src.a + dst.a * (1 - src.a)
  }
  if (out.a !== 0) {
    out.r = (src.r * src.a + dst.r * dst.a * (1 - src.a)) / out.a
    out.g = (src.g * src.a + dst.g * dst.a * (1 - src.a)) / out.a
    out.b = (src.b * src.a + dst.b * dst.a * (1 - src.a)) / out.a
  }
  return out
}

function hex (n) {
  return n.toString(16).padStart(2, '0').toUpperCase()
}

// convert RGBA to RGB and return CSS color
function rgba ({ r, g, b, a }) {
  [ r, g, b ] = [ Math.round(r), Math.round(g), Math.round(b) ]
  if (a === 1) {
    return `#${hex(r)}${hex(g)}${hex(b)}`
  }
  a = a.toFixed(2)
  return `rgba(${r},${g},${b},${a})`
}

const opaqueBlack = { r: 0x00, g: 0x00, b: 0x00, a: 1 }
const transparentWhite = { r: 0xFF, g: 0xFF, b: 0xFF, a: 0 }

// highlights source text using HTML spans and style attribute
export default (text, fg = opaqueBlack, bg = transparentWhite) => {
  let output = ''

  let pos = 0 // current position
  let next1 = text[0] // next character
  let chr = -1 // current character
  let prev1 // previous character
  let prev2 // the one before the previous
  let token = '' // current token content

  // current token type:
  //  0: anything else (whitespaces / newlines)
  //  1: operator or brace
  //  2: closing braces (after which '/' is division not regex)
  //  3: (key)word
  //  4: regex
  //  5: string starting with "
  //  6: string starting with '
  //  7: xml comment  <!-- -->
  //  8: multiline comment /* */
  //  9: single-line comment starting with two slashes //
  // 10: single-line comment starting with hash #
  let tokenType = 0

  // kept to determine between regex and division
  let lastTokenType
  // flag determining if token is multi-character
  let multichar = false

  const styles = computeStyles(fg, bg)

  // running through characters and highlighting
  for (;;) {
    prev2 = prev1
    // escaping if needed (with except for comments)
    // pervious character will not be therefore
    // recognized as a token finalize condition
    if (tokenType < 7 && prev1 === '\\') {
      prev1 = -1
    } else if (!chr) {
      break
    } else {
      prev1 = chr
    }
    chr = next1
    next1 = text[++pos]
    multichar = token.length > 1

    let finalize = false

    // checking if current token should be finalized
    if (!chr) {
      // end of content
      finalize = true
    } else {
      switch (tokenType) {
        case 0: // whitespaces
          // non-whitespace
          if (/\S/.test(chr)) {
            finalize = true
          }
          break
        case 1: // operators
          // consist of a single character
          finalize = true
          break
        case 2: // braces
          // consist of a single character
          finalize = true
          break
        case 3: // (key)word
          if (!/[$\w]/.test(chr)) {
            finalize = true
          }
          break
        case 4: // regex
          if (multichar && (prev1 === '/' || prev1 === '\n')) {
            finalize = true
          }
          break
        case 5: // string with "
          if (multichar && (prev1 === '"')) {
            finalize = true
          }
          break
        case 6: // string with '
          if (multichar && prev1 === "'") {
            finalize = true
          }
          break
        case 7: // xml comment
          if (text[pos - 4] + prev2 + prev1 === '-->') {
            finalize = true
          }
          break
        case 8: // multiline comment
          if (prev2 + prev1 === '*/') {
            finalize = true
          }
          break
        case 9:
        case 10:
          // types 9-10 (single-line comments) end with a newline
          if (tokenType > 8 && chr === '\n') {
            finalize = true
          }
          break
      }
    }

    if (!finalize) {
      token += chr
      continue
    }

    // appending the token to the result
    if (token) {
      // remapping token type into style
      // (some types are highlighted similarly)
      let style = ''
      switch (tokenType) {
        // not formatted
        case 0:
          break
        // punctuation
        case 1:
        case 2:
          style = styles[2]
          break
        // (key)word
        case 3:
          if (keywords[token]) {
            style = styles[1]
          } else {
            style = styles[0]
          }
          break
        // regex and strings
        case 4:
        case 5:
        case 6:
          style = styles[3]
          break
        // comments
        case 7:
        case 8:
        case 9:
        case 10:
          style = styles[4]
          break
      }
      const safeToken = escapeHTML(token)
      if (style !== '') {
        output += `<span style="${style}">${safeToken}</span>`
      } else {
        output += safeToken
      }
    }

    // saving the previous token type
    // (skipping whitespaces and comments)
    if (tokenType > 0 && tokenType < 7) {
      lastTokenType = tokenType
    }

    // initializing a new token
    token = ''

    // determining the new token type

    // 10: hash-style comment
    if (chr === '#') {
      tokenType = 10
    } else
    //  9: single-line comment
    if (chr + next1 === '//') {
      tokenType = 9
    } else
    //  8: multiline comment
    if (chr + next1 === '/*') {
      tokenType = 8
    } else
    //  7: xml comment
    if (chr + next1 + text[pos + 1] + text[pos + 2] === '<!--') {
      tokenType = 7
    } else
    //  6: string with '
    if (chr === `'`) {
      tokenType = 6
    } else
    //  5: string with "
    if (chr === `"`) {
      tokenType = 5
    } else
    //  4: regex
    if (chr === '/' &&
              // previous token was an opening brace or an operator (otherwise division, not a regex)
              (lastTokenType < 2) &&
              // workaround for xml closing tags
              prev1 !== '<') {
      tokenType = 4
    } else
    //  3: (key)word
    if (/[$\w]/.test(chr)) {
      tokenType = 3
    } else
    //  2: closing brace
    if (/[\])]/.test(chr)) {
      tokenType = 2
    } else
    //  1: operator or braces
    if (/[/{}[(\-+*=<>:;|\\.,?!&@~]/.test(chr)) {
      tokenType = 1
    } else {
      tokenType = 0
    }

    token += chr
  }
  return output
}

export function computeStyles ({ r, g, b, a }, bg) {
  const colors = {
    keywords: {
      opacity: 1.0,
      color: blend(bg, { r, g, b, a: a * 1.0 }),
      shadow: [
        { r, g, b, a: a * 0.7 * 1.0 },
        { r, g, b, a: a * 0.4 * 1.0 }
      ]
    },
    punctuation: {
      opacity: 0.6,
      color: blend(bg, { r, g, b, a: a * 0.6 }),
      shadow: [
        { r, g, b, a: a * 0.25 * 0.6 },
        { r, g, b, a: a * 0.25 * 0.6 }
      ]
    },
    strings: {
      opacity: 0.7,
      color: blend(bg, { r, g, b, a: a * 0.7 }),
      shadow: [
        { r, g, b, a: a * 0.2 * 0.7 },
        { r, g, b, a: a * 0.2 * 0.7 }
      ]
    },
    comments: {
      opacity: 0.5,
      color: blend(bg, { r, g, b, a: a * 0.5 }),
      shadow: [
        { r, g, b, a: a * 0.25 * 0.5 },
        { r, g, b, a: a * 0.25 * 0.5 }
      ]
    }
  }

  // convert to valid CSS colors
  for (const type in colors) {
    colors[type].color = rgba(colors[type].color)
    const shadows = colors[type].shadow
    for (const index in shadows) {
      shadows[index] = rgba(shadows[index])
    }
  }

  const styles = [
    // 0: not formatted
    '',
    // 1: keywords
    `color: ${colors.keywords.color}; text-shadow: 0px 0px 9px ${colors.keywords.shadow[0]}, 0px 0px 2px ${colors.keywords.shadow[1]}`,
    // 2: punctuation
    `color: ${colors.punctuation.color}; text-shadow: 0px 0px 7px ${colors.punctuation.shadow[0]}, 0px 0px 3px ${colors.punctuation.shadow[1]}`,
    // 3: strings and regexps
    `color: ${colors.strings.color}; text-shadow: 3px 0px 5px ${colors.strings.shadow[0]}, -3px 0px 5px ${colors.strings.shadow[1]}`,
    // 4: comments
    `color: ${colors.comments.color}; text-shadow: 3px 0px 5px ${colors.comments.shadow[0]}, -3px 0px 5px ${colors.comments.shadow[1]}; font-style: italic`
  ]

  return styles
}
