import hl from '../microlight.mjs'
import fs from 'fs'
import path from 'path'
import mtest from 'm.test'
import dirname from './dirname.js'
import { strict } from 'assert'
import { predoc, color } from '../util.mjs'

const { test } = mtest
const { readFileSync: readFile } = fs

const read = (fp) => readFile(path.join(dirname, `testdata/${fp}`)).toString()

test('Samples', () => {
  function testFromFiles (name) {
    const text = read(name + '.txt')
    const expect = read(name + '.html')
    const jsonOpt = read(name + '.json')
    const { bg, fg } = JSON.parse(jsonOpt)
    const result = predoc(hl(text, color(fg), color(bg)), bg, fg)
    strict.equal(result, expect)
  }
  test('HTML, CSS, JS, PHP', () => {
    testFromFiles('html-css-js-php')
  })
  test('CSS', () => {
    testFromFiles('css')
  })
})

test('Core', () => {
  test('Returns empty string on empty input', () => {
    strict.equal(hl(''), '')
  })
  test('ASCII whitespaces are not wrapped in span tag', () => {
    const spaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u0085\u00A0'
    strict.equal(hl(spaces), spaces)
  })
})
