import hl from '../microlight.mjs'
import util from './util.mjs'

import mtest from 'm.test'
import snapshot from '@mathdown/snapshot'
import { strict } from 'assert'

import fs from 'fs'
import path from 'path'
import url from 'url'

const dirname = path.dirname(url.fileURLToPath(import.meta.url))

mtest.test('Snapshots', () => {
  const snapshots = [
    [ '#293c41', '#B5F7FF', 'html-css-js-php' ],
    [ '#1F2F33', '#B5F7FF', 'css' ],
  ]
  for (const [bg, fg, name] of snapshots) {
    mtest.test(name, () => {
      const [ input, output ] = [ `${name}.txt`, `${name}.html` ]
      const filepath = path.join(dirname, 'testdata', input)
      const text = fs.readFileSync(filepath).toString()
      const code = hl(text, util.parseHexColor(fg), util.parseHexColor(bg))
      const value = util.formatDoc(code, bg, fg)
      snapshot(value, output, { dirname })
    })
  }
})

mtest.test('Behavior', () => {
  mtest.test('Returns empty string on empty input', () => {
    strict.equal(hl(''), '')
  })
  mtest.test('ASCII whitespaces are not wrapped in span tag', () => {
    const spaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u0085\u00A0'
    strict.equal(hl(spaces), spaces)
  })
})
