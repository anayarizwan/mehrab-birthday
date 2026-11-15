# Mehrab ♥  ✨

A password-protected, personal birthday website made for Mehrab, with a warm pink/lilac palette, friendship memories and a heartfelt letter. Dreamy pink & lavender aesthetic,
animated cake, scrapbook gallery, friendship timeline, flip-cards
for "10 Reasons", an envelope letter with typing animation, and a
fireworks finale.

Built with **Flask + vanilla JS/CSS/HTML** — no React, no Bootstrap,
no heavy frameworks.

---

## Table of Contents

1. [Features](#features)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Changing the Password](#changing-the-password)
5. [Replacing the Placeholder Photos](#replacing-the-placeholder-photos)
6. [Editing the Letter, Reasons & Captions](#editing-the-letter-reasons--captions)
7. [Adding Background Music](#adding-background-music)
8. [Deploying Securely](#deploying-securely)
9. [Security Notes & Limitations](#security-notes--limitations)
10. [Troubleshooting](#troubleshooting)

---

## Features

- **Password entry screen** with animated stars, floating hearts,
  glowing envelope, glowing unlock button, show/hide password,
  friendly error animation, CSRF protection.
- **Hero section** with animated "Happy Birthday, Mehrab!", floating
  hearts, twinkling stars, butterflies, animated gift box, and a
  call-to-action that scrolls to the cake.
- **Interactive birthday cake** with 5 flickering candles. Tap a
  candle or press "Make A Wish" to blow them out → confetti + hearts
  + a sweet wish message.
- **Scrapbook memory gallery** — 8 personal photo memories with random
  rotation, hover lift, captions, and a click-to-zoom **lightbox**
  with keyboard (←/→/Esc) and swipe navigation.
- **Friendship timeline** with a central gradient line, alternating
  cards, glowing markers, date chips, descriptions, and optional
  photos.
- **10 Reasons flip cards** — tap each numbered card to flip it and
  reveal a heartfelt reason.
- **"Things Only We Understand"** — playful cards with wiggling
  emoji and a "TOP SECRET" sticker.
- **Personal letter** in a soft pink envelope. Tap to open → letter
  paper slides in with a per-character typing animation.
- **Full vocal Happy Birthday recording** — the complete sung track starts after the first hero interaction, loops as background music, and has play/pause + volume controls. The recording is credited in the footer.
- **Final surprise** — a glowing gift box that, when clicked, opens
  with **canvas fireworks**, confetti, floating hearts, and a final
  message ending in a glowing "My Lakshmi, Always".
- **Premium navigation** — pill-shaped glassmorphism bar, active-link
  tracking, smooth scrolling, mobile hamburger menu, back-to-top
  button, loading overlay, custom scrollbar.
- **Wide editorial layout** — 50px desktop gutters, plus a full-bleed edge-to-edge hero, tightened automatically for tablet and mobile.
- **Fully responsive** — works on desktop, laptop, tablet, Android
  and iPhone. Tested at 1280px, 768px, 390px, 420px viewports.
- **Accessible** — keyboard navigation, ARIA labels, focus styles,
  `prefers-reduced-motion` support.

---

## Quick Start

### Prerequisites

- Python 3.9+ (tested on 3.12)
- pip

### Install & run

```bash
# 1. Unzip the project (if you downloaded a zip)
unzip mehrab-birthday.zip
cd mehrab-birthday

# 2. (Recommended) create a virtual environment
python -m venv venv
source venv/bin/activate         # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create your .env file from the example
cp .env.example .env

# 5. (Recommended) generate a strong secret key and put it in .env
python -c "import secrets; print(secrets.token_hex(32))"
# Copy that string into .env as SECRET_KEY=...

# 6. Run the app
python app.py
# -> open http://127.0.0.1:5000 in your browser
```

**Password for this ZIP:** `Mehrab@Lakshmi#Forever26!`. It is stored as a Werkzeug password hash in `.env`.

---

## Project Structure

```
mehrab-birthday/
│
├── app.py                  # Flask app: routes, auth, image serving
├── config.py               # Configuration (env vars, security headers)
├── requirements.txt        # Python deps (Flask, Werkzeug, python-dotenv)
├── .env.example            # Copy to .env and fill in real values
├── .gitignore
├── README.md               # this file
│
├── templates/
│   ├── login.html          # Password entry screen
│   └── index.html          # Main birthday site (all 10+ sections)
│
├── static/
│   ├── css/
│   │   ├── style.css       # Main premium styles
│   │   ├── responsive.css  # Mobile/tablet overrides
│   │   ├── custom.css      # Full-width hero, editorial story and footer
│   │   └── animations.css  # Confetti, fireworks, butterflies
│   │
│   ├── js/
│   │   ├── main.js         # Nav, music, cake, gift, scroll, reveal
│   │   ├── animations.js   # Particle/firework/heart engine
│   │   ├── gallery.js      # Polaroid gallery + lightbox
│   │   └── content.js      # <-- EDIT EVERYTHING HERE
│   │
│   ├── images/
│   │   └── placeholders/    # 15 cute SVG placeholders (8 memories
│   │                       #     + 5 timeline images)
│   │
│   └── audio/
│       └── README.txt      # Background melody notes
│
└── private_uploads/        # <-- DROP YOUR REAL PHOTOS HERE
    └── .gitkeep            # (git-ignored, served only when logged in)
```

---

## Changing the Password

The password is stored as a **Werkzeug hash** — never in plain text
in the source code. Two ways to set it:

### Option A — plain password (easiest)

Edit `.env`:

```bash
BIRTHDAY_PASSWORD=your-new-password
```

Restart the app. Done.

### Option B — pre-hashed password (more secure)

Generate a hash:

```bash
python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('your-new-password'))"
```

Edit `.env`:

```bash
BIRTHDAY_PASSWORD_HASH=pbkdf2:sha256:260000$XXXXXXXX$...
```

Restart the app. This hash overrides `BIRTHDAY_PASSWORD`.

> **Always restart the app** after changing the password so the new
> value is re-hashed and reloaded.

The password for this prepared project is `Mehrab@Lakshmi#Forever26!`. The `.env` file contains only the Werkzeug hash, not the plain password.

---

## Replacing the Placeholder Photos

The gallery and timeline use cute SVG placeholders so the site
looks complete from day one. To swap in real photos:

### Step 1 — drop your photos into `private_uploads/`

```bash
cp ~/Pictures/us-at-cafe.jpg        private_uploads/us-at-cafe.jpg
cp ~/Pictures/first-adventure.jpg   private_uploads/first-adventure.jpg
# ... etc.
```

Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`

### Step 2 — edit `static/js/content.js`

Find the `memories` array and change the `img` field for each item:

```js
memories: [
  { img: "us-at-cafe.jpg",       placeholder: false, cap: "One of my favourite days." },
  { img: "first-adventure.jpg",  placeholder: false, cap: "Our random crazy moments." },
  // ...
],
```

Do the same for the `timeline` array (each item has an `img` field).

> The `placeholder: true/false` flag is for your own bookkeeping —
> the app serves any image from either `private_uploads/` (real
> photos) or `static/images/placeholders/` (dummy SVGs) through the
> same protected `/image/<filename>` route.

### Why two folders?

- `private_uploads/` — **never exposed publicly**. The Flask route
  `/image/<filename>` checks the session and refuses to serve
  anything from here unless you're logged in.
- `static/images/placeholders/` — public dummy images that ship
  with the project.

This means even if someone guessed a URL like
`https://yoursite.com/image/us-at-cafe.jpg` while logged out, they
would get a **403 Forbidden**.

---

## Editing the Letter, Reasons & Captions

Everything user-editable lives in **`static/js/content.js`** — one
file, no other code touched:

```js
window.MEHRAB_CONTENT = {
  memories:    [ /* scrapbook items: { img, cap } */ ],
  timeline:    [ /* { date, title, desc, img } */ ],
  reasons:     [ /* { icon, front, text } */ ],
  funny:       [ /* { emoji, sticker, text } */ ],
  letter:      { greeting, paragraphs: [...], signature },
  finalMessage: "...",
  cakeMessage:  "...",
};
```

### Letter

Edit `letter.greeting`, `letter.paragraphs` (an array of strings —
each becomes its own paragraph), and `letter.signature`.

### 10 Reasons

Each card has an `icon` (any [Lucide icon name](https://lucide.dev/icons)),
a `front` (the number 1–10), and `text` (revealed when flipped).

### Funny section

Each card has an `emoji`, an optional `sticker` (the little badge in
the corner), and `text`.

### Cake & final surprise messages

Edit `cakeMessage` (shown after candles are blown out) and
`finalMessage` (revealed when the final gift opens). `\n\n` in the
final message becomes a paragraph break.

---

## Background Music

The website uses a full vocal Happy Birthday recording hosted on Wikimedia Commons. It plays after the first intentional click/tap on the hero and loops while she explores the site. The floating player controls play/pause and volume.

The recording is by Alexander Stephens, uploaded by Sselmer, and is licensed under Creative Commons Attribution-ShareAlike 3.0. Attribution and source links are included in the website footer. Internet access is required to stream the audio. Browsers block reliable autoplay before user interaction, so the first click starts it.

---

## Deploying Securely

The dev server (`python app.py`) is fine for showing Mehrab on your
own machine, but for sharing the link, use a production WSGI server
behind HTTPS:

### Using gunicorn + a reverse proxy (recommended)

```bash
pip install gunicorn
gunicorn -b 127.0.0.1:8000 -w 4 app:app
```

Then put Nginx or Caddy in front of it for HTTPS. Example Caddyfile:

```
mehrab.example.com {
  reverse_proxy 127.0.0.1:8000
}
```

Caddy issues free Let's Encrypt certificates automatically.

### Required production settings in `.env`

```bash
SECRET_KEY=<64-char random string>
BIRTHDAY_PASSWORD_HASH=<hashed password>     # safer than plain
FLASK_DEBUG=false
SESSION_COOKIE_SECURE=true                    # only over HTTPS
SESSION_LIFETIME_HOURS=12                     # or shorter
```

### Other production checklist

- ✅ Set `SESSION_COOKIE_SECURE=true` so the session cookie is only
  sent over HTTPS.
- ✅ Set `FLASK_DEBUG=false` to disable the Werkzeug debugger.
- ✅ Use the pre-hashed `BIRTHDAY_PASSWORD_HASH` so the plain
  password isn't in any file.
- ✅ Make sure `private_uploads/` is **not** served by Nginx as a
  static directory — only the Flask `/image/<filename>` route should
  expose personal photos, and it always checks authentication.
- ✅ Set a strong `SECRET_KEY` — if it leaks, session cookies can
  be forged.
- ✅ Behind a reverse proxy, also send `X-Forwarded-Proto` so Flask
  knows the original scheme (use `ProxyFix` middleware if needed).

---

## Security Notes & Limitations

This site is **password-protected**, not encrypted end-to-end. It
stops casual visitors and search engines, but it cannot stop a
determined attacker or even a legitimate logged-in user from:

- **Saving or screenshotting** a photo while viewing it.
- **Sharing the password** with others.
- **Inspecting the page source** (the JS/CSS are public — only the
  backend auth + protected image routes keep things private).

That is a fundamental limit of any client-side experience. If you
need true confidentiality for specific photos, don't put them
online — share them privately instead.

Other notes:

- Sessions expire after `SESSION_LIFETIME_HOURS` (default 12h).
- Logout is available in the nav bar and the footer.
- The dev password is shown as a hint on the login page — **remove
  the hint** in `templates/login.html` before sharing.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, a CSP) are applied in
  the `after_request` hook in `app.py`.

---

## Troubleshooting

### "Music doesn't play"
- Make sure the file is at `static/audio/song.mp3` (exact name).
- Browsers block audio that starts without a user click — click the
  play button. There is no fix for this; it's by design.
- Check the browser console for a 404 on the audio file.

### "My real photos don't show up"
- Are they in `private_uploads/` (not `static/images/`)?
- Is the filename in `content.js` spelled exactly the same (case
  sensitive)?
- Are you logged in? `/image/...` returns 403 if you're not.
- Open the Network tab in dev tools — what status code does the
  image return?

### "I changed the password but the old one still works"
- Restart `python app.py` — the password is hashed at startup.

### "Confetti/fireworks look laggy"
- Close other tabs, reduce browser zoom. The effects are pure
  Canvas/DOM and very lightweight; they should run smoothly on any
  modern device.

### "On mobile the nav links overlap the content"
- Try a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) — your browser
  may be caching an old CSS file.

### "I want to disable the loading overlay"
- In `templates/index.html`, remove the `<div class="loader">`
  block. Or in `static/js/main.js`, change `hideLoader()` to a no-op.

### Where do I report bugs?
- This is a personal project — feel free to fix things in the code
  directly. The codebase is heavily commented and designed to be
  hacked on.

---

## Credits

- Fonts: [Poppins](https://fonts.google.com/specimen/Poppins),
  [Playfair Display](https://fonts.google.com/specimen/Playfair+Display),
  [Dancing Script](https://fonts.google.com/specimen/Dancing+Script) — Google Fonts.
- Icons: [Lucide](https://lucide.dev) — MIT licensed.
- Backend: [Flask](https://flask.palletsprojects.com/), Werkzeug.
- Made with love, just for Mehrab. 💗


## Photo privacy

All personal photographs supplied with this ZIP are stored in `private_uploads/`, outside Flask static assets. They are served only through the authenticated `/image/<filename>` route. Do not move them into `static/` or publish the `private_uploads/` folder separately. Anyone with the website password can still view and save images while logged in, so use a strong unique password and share it only with the intended person.

## Birthday audio attribution

The full vocal birthday recording is by Alexander Stephens, uploaded by Sselmer to Wikimedia Commons, and licensed under Creative Commons Attribution-ShareAlike 3.0. Source: https://commons.wikimedia.org/wiki/File:Happy_birthday.ogg


## Photo privacy

All personal photographs supplied with this ZIP are stored in `private_uploads/`, outside Flask static assets. They are served only through the authenticated `/image/<filename>` route. Image responses use private, no-store caching headers. Photo EXIF metadata is stripped before delivery. Do not move personal photos into `static/` or publish `private_uploads/` separately. Anyone with the website password can still view and save images while logged in, so share the password only with the intended person.

## Birthday audio attribution

The full vocal recording is by Alexander Stephens, uploaded by Sselmer to Wikimedia Commons, and licensed under Creative Commons Attribution-ShareAlike 3.0. Source: https://commons.wikimedia.org/wiki/File:Happy_birthday.ogg
