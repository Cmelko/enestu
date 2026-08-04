from pathlib import Path
import re

root = Path(r"C:\Users\patos\Projects\web\enestu")
pages = [
    "bezpecnost.html",
    "cenik.html",
    "dekujeme.html",
    "jak-to-funguje.html",
    "kontakt.html",
    "ochrana-udaju.html",
    "pro-remeslniky.html",
]

pat = re.compile(
    r'(<div class="container nav" id="nav">\s*)'
    r'(<a class="logo"[^>]*>.*?</a>\s*)'
    r'(<nav class="nav-links".*?</nav>\s*)'
    r'(<div class="nav-actions">\s*)'
    r'(.*?)'
    r'(<button class="nav-toggle".*?</button>\s*)'
    r'(</div>\s*</div>)',
    re.S,
)

toggle = (
    '<button class="nav-toggle" type="button" aria-label="Menu" '
    'aria-expanded="false" aria-controls="nav-drawer">\n'
    "        <span></span><span></span><span></span>\n"
    "      </button>\n"
)

for name in pages:
    path = root / name
    text = path.read_text(encoding="utf-8")
    m = pat.search(text)
    if not m:
        print("NO MATCH", name)
        continue
    logo = m.group(2)
    nav = m.group(3).strip()
    actions_inner = re.sub(
        r'<button class="nav-toggle".*?</button>\s*',
        "",
        m.group(5),
        flags=re.S,
    ).strip()
    new = (
        f'{m.group(1)}{logo}{toggle}'
        f'      <div class="nav-drawer" id="nav-drawer">\n'
        f"        {nav}\n"
        f'        <div class="nav-actions">\n'
        f"          {actions_inner}\n"
        f"        </div>\n"
        f"      </div>\n"
        f"    </div>"
    )
    text = pat.sub(new, text, count=1)
    path.write_text(text, encoding="utf-8")
    print("OK", name)
