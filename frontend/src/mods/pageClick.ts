interface Press {
  button: number
  ctrlKey: boolean
  metaKey: boolean
}

const MIDDLE = 1

/** Whether a press on a mod opens its web page: the middle button always, Ctrl+click only where Ctrl+click is free. */
function opensPage(press: Press, ctrlOpens: boolean): boolean {
  return (
    press.button === MIDDLE || (ctrlOpens && press.button === 0 && (press.ctrlKey || press.metaKey))
  )
}

export { MIDDLE, opensPage }
