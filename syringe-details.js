// Scale only the reference product artwork; surrounding copy and controls reflow normally.
(() => {
  const observer = new ResizeObserver(entries => {
    for (const { target } of entries) {
      const inner = target.firstElementChild;
      inner.style.transform = 'scale(' + (target.clientWidth / Number(target.dataset.artWidth)) + ')';
    }
  });
  document.querySelectorAll('[data-art-width]').forEach(frame => observer.observe(frame));
})();
