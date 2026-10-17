// The narrow-screen menu: the button shows or hides the full link list under the nav.
const button = document.querySelector('.nav-menu')
const drawer = document.getElementById('nav-drawer')

function setOpen(open) {
  drawer.hidden = !open
  button.setAttribute('aria-expanded', String(open))
}

button.addEventListener('click', () => setOpen(drawer.hidden))
document.addEventListener('click', (e) => {
  if (!(drawer.hidden || drawer.contains(e.target) || button.contains(e.target))) {
    setOpen(false)
  }
})
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !drawer.hidden) {
    setOpen(false)
    button.focus()
  }
})
// Widening past the narrow layout hides the button, so the list must not stay open behind it.
matchMedia('(min-width: 40.0625rem)').addEventListener('change', (e) => {
  if (e.matches) {
    setOpen(false)
  }
})
