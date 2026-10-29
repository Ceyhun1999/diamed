"""Apply the shared static header/footer to every page. Run after editing partials."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent
partials = {tag: (root / 'partials' / f'{tag}.html').read_text().rstrip() for tag in ('header', 'footer')}
for page in root.glob('*.html'):
    text = page.read_text()
    for tag, markup in partials.items():
        text, count = re.subn(rf'      <{tag}\b.*?</{tag}>', lambda _: markup, text, count=1, flags=re.S)
        assert count == 1, (page, tag)
    if './site-chrome.css' not in text:
        text = text.replace('</head>', '  <link rel="stylesheet" href="./site-chrome.css">\n  </head>', 1)
    menu = (root / 'partials' / 'menu.html').read_text().rstrip()
    if '<!-- shared-menu:start -->' in text:
        text = re.sub(r'<!-- shared-menu:start -->.*?<!-- shared-menu:end -->', lambda _: menu, text, flags=re.S)
    else:
        text = text.replace('</body>', menu + '\n  </body>', 1)
    if './menu.css' not in text:
        text = text.replace('</head>', '  <link rel="stylesheet" href="./menu.css">\n  </head>', 1)
    page.write_text(text)
