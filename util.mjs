const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
}

export function escapeHTML (s) {
  return s.replace(/[&<>"'`=/]/g, (s) => {
    return entityMap[s]
  })
}

export function predoc (code, bg, fg) {
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
