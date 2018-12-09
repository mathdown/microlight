import hl from '..'
import fs from 'fs'
import path from 'path'
import mtest from 'm.test'
import dirname from './dirname'
import { strict } from 'assert'
import { predoc } from '../util'

const { test } = mtest
const { readFileSync: readFile } = fs

const read = (fp) => readFile(path.join(dirname, `testdata/${fp}`)).toString()

test('Samples', () => {
  test('HTML, CSS, JS, PHP', () => {
    const text = read('html-css-js-php.txt')
    const expect = read('html-css-js-php.html')
    const jsonOpt = read('html-css-js-php.json')
    const options = JSON.parse(jsonOpt)
    const [ r, g, b, a ] = options.color.map(Number)
    const result = predoc(hl(text, r, g, b, a), options.bg, options.fg)
    strict.equal(result, expect)
  })
  test('CSS', () => {
    const text = read('css.txt')
    const expect = read('css.html')
    const jsonOpt = read('css.json')
    const options = JSON.parse(jsonOpt)
    const [ r, g, b, a ] = options.color.map(Number)
    const result = predoc(hl(text, r, g, b, a), options.bg, options.fg)
    strict.equal(result, expect)
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
