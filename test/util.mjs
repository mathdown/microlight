export function parseHexColor(hex) {
  const c = {
    r: Number('0x' + hex.slice(1, 3)),
    g: Number('0x' + hex.slice(3, 5)),
    b: Number('0x' + hex.slice(5, 7)),
    a: 1
  }
  const alpha = hex.slice(7, 9)
  if (alpha !== '') {
    c.a = Number('0x' + alpha) / 255
  }
  return c
}

export function formatDoc(code, bg, fg) {
  const style = `<style>
    :root
    { margin:0 auto
    ; max-width: 7in
    }
    pre
    { background-color: ${bg}
    ; color: ${fg}
    ; padding: .2in
    ; overflow: auto
    }
  </style>`
  return `<!doctype html><title>test case</title>${style}<pre>${code}</pre>\n`
}

export default {
  parseHexColor,
  formatDoc,
}
