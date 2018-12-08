/* gentest (re)generates some of the files in testdata */

import highlight from '.'
import { predoc } from './util'
import fs from 'fs'

const f = process.argv[2]
const j = process.argv[3]

const text = fs.readFileSync(f, 'utf8')
const opts = JSON.parse(fs.readFileSync(j, 'utf8'))
const { bg, fg } = opts
const [ r, g, b, a ] = opts.color.map(Number)

const hl = highlight(text, r, g, b, a)
process.stdout.write(predoc(hl, bg, fg))
