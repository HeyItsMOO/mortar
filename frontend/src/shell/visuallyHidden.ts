// Text for assistive technology that takes no room on screen. Sizes are strings: sx reads a number up to 1 as a
// fraction, so width: 1 would be 100%.
export const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const
