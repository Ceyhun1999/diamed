const tubeTabs = [...document.querySelectorAll('[data-tube-tab]')]
if (tubeTabs.length) {
  function selectTube(key, focus = false) {
    const selected = tubeTabs.find(tab => tab.dataset.tubeTab === key) || tubeTabs[0]
    tubeTabs.forEach(tab => {
      const active = tab === selected
      tab.setAttribute('aria-selected', String(active))
      tab.tabIndex = active ? 0 : -1
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active
    })
    if (focus) selected.focus()
    return selected.dataset.tubeTab
  }
  tubeTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      const key = selectTube(tab.dataset.tubeTab)
      history.replaceState(null, '', `#${key}`)
    })
    tab.addEventListener('keydown', event => {
      let next
      if (event.key === 'ArrowRight') next = (index + 1) % tubeTabs.length
      if (event.key === 'ArrowLeft') next = (index - 1 + tubeTabs.length) % tubeTabs.length
      if (event.key === 'Home') next = 0
      if (event.key === 'End') next = tubeTabs.length - 1
      if (next === undefined) return
      event.preventDefault()
      const key = selectTube(tubeTabs[next].dataset.tubeTab, true)
      history.replaceState(null, '', `#${key}`)
    })
  })
  selectTube(location.hash.slice(1))
  window.addEventListener('hashchange', () => selectTube(location.hash.slice(1)))
}
