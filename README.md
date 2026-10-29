# Diamed

A responsive, multi-page website for Diamed Co, presenting the company, medical products, certificates, news, and contact information. The website content is in Azerbaijani.

## Technology

- HTML, CSS, and vanilla JavaScript
- Locally bundled Swiper for product carousels
- Python helper for synchronizing shared page elements

No build step or package installation is required.

## Run locally

From the project directory, start a static server:

```sh
python3 -m http.server 5500
```

Open [http://localhost:5500](http://localhost:5500) in your browser. Alternatively, use the VS Code Live Server extension.

## Pages

- Home and company information
- Product catalog and product detail pages
- Syringe category overview with ten linked product pages
- Certificates, partners, and gallery
- News and individual articles
- Contact page

## Project structure

```text
index.html             Home page
products.html          Product catalog
syringes.html          Syringe category overview
*.html                 Additional pages and product details
*.css                  Shared and page-specific styles
*.js                   Navigation, carousels, and product behavior
assets/                Images, icons, and bundled vendor files
partials/              Shared header, footer, and menu markup
scripts/sync-chrome.py  Shared markup synchronization helper
```

## Editing shared elements

After changing the markup in `partials/`, synchronize it across the HTML pages:

```sh
python3 scripts/sync-chrome.py
```

Review the resulting changes before committing.

## Deployment

Upload the project to any static web host. Keep the directory structure intact so relative links and local assets resolve correctly. `index.html` is the entry point.

The contact form opens the visitor's email application using a `mailto:` link; there is no backend service.
