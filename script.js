const menuButton = document.querySelector(".menu-button")
const canvasMenu = document.querySelector(".canvas-menu")

const navDropdowns = [...document.querySelectorAll(".navigation .nav-dropdown")]
navDropdowns.forEach((dropdown) => {
  dropdown.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return
    navDropdowns.forEach((item) => { item.open = item === dropdown })
  })
  dropdown.addEventListener("pointerleave", () => {
    if (!dropdown.contains(document.activeElement)) dropdown.open = false
  })
  dropdown.addEventListener("toggle", () => {
    if (dropdown.open) navDropdowns.forEach((item) => { if (item !== dropdown) item.open = false })
  })
  dropdown.addEventListener("focusout", (event) => {
    if (!dropdown.contains(event.relatedTarget)) dropdown.open = false
  })
  dropdown.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => { dropdown.open = false }))
})
document.addEventListener("click", (event) => {
  navDropdowns.forEach((dropdown) => { if (!dropdown.contains(event.target)) dropdown.open = false })
})
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return
  navDropdowns.forEach((dropdown) => {
    if (!dropdown.open) return
    if (dropdown.contains(document.activeElement)) dropdown.querySelector("summary").focus()
    dropdown.open = false
  })
})

// Reveal the product history in order when it scrolls into view.
document.querySelectorAll(".timeline").forEach((timeline) => {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
  if (motion.matches || !("IntersectionObserver" in window) || !Element.prototype.animate) return

  const cards = [...timeline.querySelectorAll(".milestone")]
  const compact = window.matchMedia("(max-width: 520px)").matches
  const animations = cards.map((card, index) => {
    const direction = index % 2 === 0 ? -40 : 40
    const animation = card.animate([
      { opacity: 0, transform: `translateY(${direction}px)` },
      { opacity: 1, transform: "translateY(0)" },
    ], {
      duration: 700,
      delay: compact ? 0 : index * 280,
      easing: "cubic-bezier(.22, 1, .36, 1)",
      fill: "both",
    })
    animation.pause()
    animation.finished.then(() => animation.cancel()).catch(() => {})
    return animation
  })

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      if (compact) animations[cards.indexOf(entry.target)].play()
      else animations.forEach((animation) => animation.play())
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.15 })

  if (compact) cards.forEach((card) => observer.observe(card))
  else observer.observe(timeline)

  motion.addEventListener("change", () => {
    if (!motion.matches) return
    observer.disconnect()
    animations.forEach((animation) => animation.cancel())
  })
})

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
    if (!autoplayButton) return
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

// Two documents: the selected one is centered, the other fills both side slots.
document.querySelectorAll(".certificate-card").forEach((card) => {
  const sheets = [...card.querySelectorAll(".certificate-images > button")]
  const center = sheets.find((sheet) => sheet.classList.contains("certificate-middle"))
  const side = sheets.find((sheet) => sheet.classList.contains("certificate-front"))
  const openLink = card.querySelector(".certificate-open")
  if (!center || !side || !openLink) return
  const documents = [center, side].map((sheet) => ({
    title: sheet.dataset.title,
    name: sheet.dataset.name,
    src: sheet.querySelector("img").getAttribute("src"),
    alt: sheet.querySelector("img").alt,
  }))
  let selected = 0
  function openDocument(event) {
    event.preventDefault()
    const document = documents[selected]
    if (typeof Fancybox !== "undefined") {
      Fancybox.show([{ src: document.src, type: "image", caption: document.alt }], { Hash: false })
    } else window.location.assign(document.src)
  }
  function render() {
    sheets.forEach((sheet) => {
      const isCenter = sheet === center
      const document = documents[isCenter ? selected : 1 - selected]
      const image = sheet.querySelector("img")
      image.src = document.src
      image.alt = document.alt
      sheet.dataset.title = document.title
      sheet.dataset.name = document.name
      sheet.setAttribute("aria-pressed", String(isCenter))
      sheet.setAttribute("aria-label", `${document.title} — ${isCenter ? "böyüt" : "seç"}`)
    })
    const document = documents[selected]
    card.querySelector(".certificate-copy > strong").textContent = document.title
    card.querySelector(".certificate-copy h3").textContent = document.name
    card.querySelector(".gmp").hidden = document.title !== "GMP"
    openLink.href = document.src
  }
  sheets.forEach((sheet) => sheet.addEventListener("click", (event) => {
    if (sheet === center) openDocument(event)
    else {
      sheets.forEach((item) => item.getAnimations().forEach((animation) => animation.cancel()))
      const fromCenter = center.getBoundingClientRect()
      const fromSide = sheet.getBoundingClientRect()
      selected = 1 - selected
      render()
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      sheets.forEach((item) => {
        const origin = item === center ? fromSide : fromCenter
        const target = item.getBoundingClientRect()
        const transform = getComputedStyle(item).transform
        const resting = transform === "none" ? "" : transform
        const dx = origin.left + origin.width / 2 - target.left - target.width / 2
        const dy = origin.top + origin.height / 2 - target.top - target.height / 2
        item.animate([
          { transform: `translate(${dx}px, ${dy}px) scale(${origin.width / target.width}, ${origin.height / target.height}) ${resting}`, opacity: .65 },
          { transform: resting || "none", opacity: 1 },
        ], { duration: 450, easing: "cubic-bezier(.22, 1, .36, 1)" })
      })
    }
  }))
  openLink.addEventListener("click", openDocument)
  render()
})


const searchableProducts = [
  {
    "name": "Şprislər",
    "href": "./syringes.html"
  },
  {
    "name": "Kosmetoloji iynə",
    "href": "./cosmetic-needle.html"
  },
  {
    "name": "Vazofix",
    "href": "./vazofix.html"
  },
  {
    "name": "Kəpənək",
    "href": "./butterfly.html"
  },
  {
    "name": "Steril cərrahi əlcəklər",
    "href": "./surgical-gloves.html"
  },
  {
    "name": "İynə ucluğu (steril)",
    "href": "./sterile-needle.html"
  },
  {
    "name": "Sidik torbası",
    "href": "./urine-bag.html"
  },
  {
    "name": "Steril stəkan",
    "href": "./sterile-cup.html"
  },
  {
    "name": "Vakuumlu qan alma tüpləri",
    "href": "./vacuum-tubes.html"
  },
  {
    "name": "İnfuziya dəsti",
    "href": "./infusion-set.html"
  },
  {
    "name": "Cytobrush",
    "href": "./cytobrush.html"
  },
  {
    "name": "Lateks əlcəklər",
    "href": "./latex-gloves.html"
  },
  {
    "name": "İnsulin 1 ml",
    "href": "./insulin-syringe.html"
  },
  {
    "name": "Jane şprisi",
    "href": "./jane-syringe.html"
  },
  {
    "name": "Vaksin üçün özünüməhv edən şpris 0,5 ml",
    "href": "./vaccine-syringe.html"
  },
  {
    "name": "Vakuumlu tüp növləri",
    "href": "./vacuum-tube-details.html"
  },
  {
    "name": "Özünüməhv edən şpris 0,05 ml",
    "href": "./syringe-005ml.html"
  },
  {
    "name": "10 ml şpris",
    "href": "./syringe-10ml.html"
  },
  {
    "name": "1 ml şpris",
    "href": "./syringe-1ml.html"
  },
  {
    "name": "20 ml şpris",
    "href": "./syringe-20ml.html"
  },
  {
    "name": "2 ml şpris",
    "href": "./syringe-2ml.html"
  },
  {
    "name": "50 ml şpris",
    "href": "./syringe-50ml.html"
  },
  {
    "name": "5 ml şpris",
    "href": "./syringe-5ml.html"
  }
]

function normalizeProductQuery(value) {
  return value.toLocaleLowerCase("az").replace(/ı/g, "i").replace(/ə/g, "e")
    .replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g")
    .replace(/ö/g, "o").replace(/ü/g, "u").replace(/,/g, ".")
    .replace(/(\d)\s+(ml|mm|g)\b/g, "$1$2").trim()
}

if (document.querySelector(".header .search")) {
  const searchDialog = document.createElement("dialog")
  searchDialog.className = "product-search"
  searchDialog.setAttribute("aria-labelledby", "product-search-title")
  searchDialog.innerHTML = `
    <button class="product-search-close" type="button" aria-label="Axtarışı bağla">×</button>
    <h2 id="product-search-title">Məhsul axtarışı</h2>
    <form class="product-search-form" role="search">
      <input type="search" aria-label="Məhsulun adı və ya həcmi" placeholder="Məhsulun adını və ya həcmini yazın" autocomplete="off">
      <button type="submit">Axtar</button>
    </form>
    <p class="product-search-status" role="status">Məhsulun adını və ya həcmini daxil edin.</p>
    <div class="product-search-results"></div>`
  document.body.append(searchDialog)
  const input = searchDialog.querySelector("input")
  const status = searchDialog.querySelector(".product-search-status")
  const results = searchDialog.querySelector(".product-search-results")
  function searchProducts() {
    const query = normalizeProductQuery(input.value)
    results.replaceChildren()
    if (!query) {
      status.textContent = "Məhsulun adını və ya həcmini daxil edin."
      return
    }
    const words = query.split(/\s+/)
    const matches = searchableProducts.filter((product) => {
      const name = normalizeProductQuery(product.name)
      return words.every((word) => name.includes(word))
    })
    status.textContent = matches.length ? `${matches.length} məhsul tapıldı.` : "Uyğun məhsul tapılmadı. Başqa ad və ya həcm yazın."
    matches.forEach((product) => {
      const link = document.createElement("a")
      link.href = product.href
      link.textContent = product.name
      results.append(link)
    })
  }
  document.querySelectorAll(".header .search").forEach((button) => {
    button.setAttribute("aria-haspopup", "dialog")
    button.addEventListener("click", () => {
      navDropdowns.forEach((dropdown) => { dropdown.open = false })
      if (!searchDialog.open) searchDialog.showModal()
      document.body.classList.add("product-search-open")
      input.focus()
    })
  })
  searchDialog.querySelector(".product-search-close").addEventListener("click", () => searchDialog.close())
  searchDialog.addEventListener("click", (event) => {
    const bounds = searchDialog.getBoundingClientRect()
    if (event.target === searchDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) searchDialog.close()
  })
  searchDialog.addEventListener("close", () => document.body.classList.remove("product-search-open"))
  searchDialog.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault()
    searchProducts()
  })
  input.addEventListener("input", searchProducts)
}

const photoGrid = document.querySelector(".photo-grid")
const galleryPagination = document.querySelector(".gallery-pagination")
if (photoGrid && galleryPagination) {
  const photos = [...photoGrid.querySelectorAll(".photo-card")]
  const pageSize = 6
  const totalPages = Math.ceil(photos.length / pageSize)
  let currentPage = 1
  function renderGalleryPage(page, scroll = false) {
    currentPage = Math.min(totalPages, Math.max(1, page))
    photos.forEach((photo, index) => {
      photo.hidden = index < (currentPage - 1) * pageSize || index >= currentPage * pageSize
    })
    galleryPagination.replaceChildren()
    function addButton(label, page, disabled, active = false) {
      const button = document.createElement("button")
      button.type = "button"
      button.textContent = label
      button.disabled = disabled
      if (active) button.setAttribute("aria-current", "page")
      button.setAttribute("aria-label", label === "←" ? "Əvvəlki səhifə" : label === "→" ? "Növbəti səhifə" : `Səhifə ${page}`)
      button.addEventListener("click", () => {
        renderGalleryPage(page, true)
        galleryPagination.querySelector('[aria-current="page"]').focus({ preventScroll: true })
      })
      galleryPagination.append(button)
    }
    addButton("←", currentPage - 1, currentPage === 1)
    for (let page = 1; page <= totalPages; page++) addButton(String(page), page, false, currentPage === page)
    addButton("→", currentPage + 1, currentPage === totalPages)
    if (scroll) document.querySelector("#foto-qalereya").scrollIntoView({ block: "start" })
  }
  renderGalleryPage(1)
}
