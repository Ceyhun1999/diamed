// One ordered reveal sequence per section, including the product timeline.
(() => {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
  if (motion.matches || !("IntersectionObserver" in window) || !Element.prototype.animate) return

  const sections = [...document.querySelectorAll(".about-page main > section")]
  const pending = new Map()
  const nextStart = new Map()
  const selector = [
    ".hero-copy", ".hero-media", ".section-heading",
    ".stats-grid > article", ".goal-list > article", ".milestone",
    ".process-grid > article", ".tech-grid > *", ".made-strip",
    ".values-grid > article", ".contact-panel",
  ].join(",")

  const observer = new IntersectionObserver((entries) => {
    // Observer callbacks need not arrive in document order.
    entries.filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
      .forEach(({ target }) => {
        const item = pending.get(target)
        if (!item) return
        const now = performance.now()
        const start = Math.max(now, nextStart.get(item.section) || 0)
        item.animation.effect.updateTiming({ delay: start - now })
        item.animation.play()
        // Give the heading a lead, then reveal cards at a steady pace.
        nextStart.set(item.section, start + (target.matches(".section-heading, .hero-copy") ? 550 : 340))
        observer.unobserve(target)
        item.animation.finished.then(() => {
          item.animation.cancel()
          pending.delete(target)
        }).catch(() => {})
      })
  }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" })

  sections.forEach((section) => {
    section.querySelectorAll(selector).forEach((target) => {
      if (target.matches(".hero-copy .section-heading")) return
      const animation = target.animate([
        { opacity: 0, transform: "translateY(36px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 1300, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "both" })
      animation.pause()
      pending.set(target, { section, animation })
      observer.observe(target)
    })
  })

  function showAll() {
    observer.disconnect()
    pending.forEach(({ animation }) => animation.cancel())
    pending.clear()
  }
  motion.addEventListener("change", () => { if (motion.matches) showAll() })
  // Keyboard navigation should never land on an invisible control.
  document.querySelector(".about-page main")?.addEventListener("focusin", showAll, { once: true })
})()
