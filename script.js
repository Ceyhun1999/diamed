const menuButton = document.querySelector(".menu-button")
const canvasMenu = document.querySelector(".canvas-menu")

if (menuButton && canvasMenu) {
  const closeButton = canvasMenu.querySelector(".canvas-menu__close")
  const canHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches
  let closeTimer

  function placeMenu() {
    const header = menuButton.closest("header")
    const top = Math.max(0, header.getBoundingClientRect().bottom)
    canvasMenu.style.top = `${top}px`
    canvasMenu.style.setProperty("--menu-top", `${top}px`)
  }

  function closeMenu(restoreFocus = true) {
    window.clearTimeout(closeTimer)
    if (canvasMenu.contains(document.activeElement)) {
      if (restoreFocus) menuButton.focus()
      else document.activeElement.blur()
    }
    canvasMenu.classList.remove("is-open")
    canvasMenu.setAttribute("aria-hidden", "true")
    canvasMenu.inert = true
    menuButton.setAttribute("aria-expanded", "false")
    menuButton.setAttribute("aria-label", "Menyunu aç")
    document.body.classList.remove("menu-open")
  }

  function openMenu(focusMenu = false) {
    window.clearTimeout(closeTimer)
    placeMenu()
    canvasMenu.inert = false
    canvasMenu.setAttribute("aria-hidden", "false")
    canvasMenu.classList.add("is-open")
    menuButton.setAttribute("aria-expanded", "true")
    menuButton.setAttribute("aria-label", "Menyunu bağla")
    document.body.classList.add("menu-open")
    if (focusMenu) {
      const target = window.matchMedia("(max-width: 1279px)").matches
        ? closeButton : canvasMenu.querySelector("a")
      target.focus()
    }
  }

  menuButton.addEventListener("click", (event) => {
    // Pointer hover may already have opened the panel before the click arrives.
    if (canHover() && event.detail !== 0) {
      openMenu()
      return
    }
    canvasMenu.classList.contains("is-open") ? closeMenu() : openMenu(event.detail === 0)
  })
  menuButton.addEventListener("mouseenter", () => { if (canHover()) openMenu() })
  function scheduleClose() {
    if (canHover()) closeTimer = window.setTimeout(() => closeMenu(false), 180)
  }
  menuButton.addEventListener("mouseleave", scheduleClose)
  canvasMenu.addEventListener("mouseenter", () => window.clearTimeout(closeTimer))
  canvasMenu.addEventListener("mouseleave", scheduleClose)
  closeButton.addEventListener("click", () => closeMenu())
  canvasMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu(false)
  })
  document.addEventListener("click", (event) => {
    if (!canvasMenu.contains(event.target) && !menuButton.contains(event.target)) closeMenu(false)
  })
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && canvasMenu.classList.contains("is-open")) closeMenu()
  })
  document.addEventListener("focusin", (event) => {
    if (canvasMenu.classList.contains("is-open") && !canvasMenu.contains(event.target) && !menuButton.contains(event.target)) closeMenu(false)
  })
  window.addEventListener("resize", () => {
    if (canvasMenu.classList.contains("is-open")) placeMenu()
  })
}

// Fancybox groups gallery photos and certificates separately.
if (typeof Fancybox !== "undefined") {
  Fancybox.bind("[data-fancybox]", {})
}

// A static site sends enquiries through the visitor's email application.
const messageForm = document.querySelector(".message-form")
if (messageForm) {
  messageForm.addEventListener("submit", (event) => {
    event.preventDefault()
    const body = Array.from(messageForm.querySelectorAll("input, textarea"))
      .map((field) => `${field.getAttribute("aria-label")}: ${field.value}`)
      .join("\n")
    window.location.href = `mailto:sales@diamed.az?subject=${encodeURIComponent("Diamed Co — Sorğu")}&body=${encodeURIComponent(body)}`
  })
}

// All carousels share Swiper navigation, touch handling and autoplay.
if (typeof Swiper !== "undefined") {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
  const carousels = []

  function createCarousel(viewport, options = {}) {
    viewport.classList.add("swiper", "site-carousel")
    const slides = [...viewport.children]
    const wrapper = document.createElement("div")
    wrapper.className = "swiper-wrapper"
    slides.forEach((slide) => {
      slide.classList.add("swiper-slide")
      wrapper.append(slide)
    })
    // Swiper loop needs more slides than the largest visible group.
    const minimum = 5
    if (slides.length > 1 && options.slidesPerView !== 1) {
      while (wrapper.children.length < minimum) {
        slides.forEach((slide) => wrapper.append(slide.cloneNode(true)))
      }
    }
    viewport.append(wrapper)
    const swiper = new Swiper(viewport, {
      speed: reducedMotion.matches ? 0 : 550,
      loop: slides.length > 1,
      spaceBetween: 20,
      slidesPerView: 1.15,
      breakpoints: { 520: { slidesPerView: 2 }, 800: { slidesPerView: 3 }, 1200: { slidesPerView: 4 } },
      autoplay: { delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true },
      keyboard: { enabled: true, onlyInViewport: true },
      a11y: { prevSlideMessage: "Əvvəlki slayd", nextSlideMessage: "Növbəti slayd" },
      ...options,
    })
    swiper.userPaused = false
    carousels.push(swiper)
    if (reducedMotion.matches) swiper.autoplay.stop()
    viewport.addEventListener("focusin", () => swiper.autoplay.stop())
    viewport.addEventListener("focusout", (event) => {
      if (!viewport.contains(event.relatedTarget) && !swiper.userPaused && !reducedMotion.matches) swiper.autoplay.start()
    })
    return swiper
  }

  document.querySelectorAll(".slider-shell").forEach((shell) => {
    const buttons = shell.querySelectorAll(".arrow-button")
    createCarousel(shell.querySelector(".product-grid"), {
      navigation: { prevEl: buttons[0], nextEl: buttons[1] },
      spaceBetween: 16,
    })
  })

  document.querySelectorAll(".pharma-slider").forEach((slider) => {
    const pagination = slider.parentElement.querySelector(".pharma-pagination")
    const pageNumbers = document.createElement("div")
    pageNumbers.className = "pharma-page-numbers"
    function paginationArrow(direction, label, path) {
      const button = document.createElement("button")
      button.type = "button"
      button.className = `pharma-page-${direction}`
      button.setAttribute("aria-label", label)
      button.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`
      return button
    }
    const previousPage = paginationArrow("prev", "Əvvəlki slayd", "M20 12H4m6-6-6 6 6 6")
    const nextPage = paginationArrow("next", "Növbəti slayd", "M4 12h16m-6-6 6 6-6 6")
    pagination.replaceChildren(previousPage, pageNumbers, nextPage)
    const swiper = createCarousel(slider.querySelector(".pharma-track"), {
      navigation: { prevEl: slider.querySelector(".pharma-prev"), nextEl: slider.querySelector(".pharma-next") },
      pagination: {
        el: pageNumbers,
        clickable: true,
        renderBullet(index, className) {
          return `<button type="button" class="${className}" aria-label="${index + 1}-ci slayd">${index + 1}</button>`
        },
      },
    })
    previousPage.addEventListener("click", () => swiper.slidePrev())
    nextPage.addEventListener("click", () => swiper.slideNext())
  })

  document.querySelectorAll(".variant-gallery").forEach((gallery) => {
    const viewport = gallery.querySelector(".variant-image-slider")
    const swiper = new Swiper(viewport, {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      speed: reducedMotion.matches ? 0 : 400,
      autoplay: false,
      pagination: {
        el: gallery.querySelector(".variant-gallery-pagination"),
        clickable: true,
        renderBullet(index, className) {
          return `<button type="button" class="${className}" aria-label="${index + 1}-ci şəkil"></button>`
        },
      },
      a11y: { slideLabelMessage: "{{index}} / {{slidesLength}}" },
    })
    viewport.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault()
        if (event.key === "ArrowLeft") swiper.slidePrev()
        else swiper.slideNext()
      }
    })
  })

  document.querySelectorAll(".product-slider").forEach((slider) => createCarousel(slider))

  document.querySelectorAll(".hero-slider").forEach((hero) => {
    const dots = [...hero.querySelectorAll("[data-slide]")]
    const autoplayButton = hero.querySelector(".hero-autoplay")
    function updateDots(swiper) {
      dots.forEach((dot, index) => {
        if (index === swiper.realIndex) dot.setAttribute("aria-current", "true")
        else dot.removeAttribute("aria-current")
      })
    }
    const swiper = createCarousel(hero.querySelector(".hero-slides"), {
      slidesPerView: 1,
      spaceBetween: 0,
      breakpoints: {},
      autoplay: { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true },
      navigation: { prevEl: hero.querySelector(".hero-prev"), nextEl: hero.querySelector(".hero-next") },
      on: { slideChange: updateDots },
    })
    dots.forEach((dot) => dot.addEventListener("click", () => swiper.slideToLoop(Number(dot.dataset.slide))))
    function updateAutoplayButton() {
      const paused = !swiper.autoplay.running
      autoplayButton.setAttribute("aria-pressed", String(paused))
      autoplayButton.setAttribute("aria-label", paused ? "Avtomatik keçidi başlat" : "Avtomatik keçidi dayandır")
      autoplayButton.querySelector(".pause-icon").toggleAttribute("hidden", paused)
      autoplayButton.querySelector(".play-icon").toggleAttribute("hidden", !paused)
    }
    autoplayButton.addEventListener("click", () => {
      swiper.userPaused = !swiper.autoplay.running
      if (swiper.userPaused) swiper.autoplay.stop()
      else swiper.autoplay.start()
      updateAutoplayButton()
    })
    swiper.on("autoplayStart", updateAutoplayButton)
    swiper.on("autoplayStop", updateAutoplayButton)
    hero.querySelector(".hero-slider-controls").hidden = false
    updateAutoplayButton()
  })

  reducedMotion.addEventListener("change", () => {
    carousels.forEach((swiper) => {
      swiper.params.speed = reducedMotion.matches ? 0 : 550
      if (reducedMotion.matches || swiper.userPaused) swiper.autoplay.stop()
      else swiper.autoplay.start()
    })
  })
}
