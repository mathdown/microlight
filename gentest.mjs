/* gentest (re)generates some of the files in testdata */

import highlight from '.'
import { predoc, color } from './util'
import fs from 'fs'

const f = process.argv[2]
const j = process.argv[3]

const text = fs.readFileSync(f, 'utf8')
const opts = JSON.parse(fs.readFileSync(j, 'utf8'))
const { bg, fg } = opts
const hl = highlight(text, color(fg), color(bg))
process.stdout.write(predoc(hl, bg, fg))
