# Crispy Octo Rotary Phone — v2

A **beautiful retro dialer** with more goodies:
- Rotary dial + **Keypad with DTMF** (WebAudio)
- **Contacts & Call Log** (persisted in `localStorage`)
- **Theme**: dark / light / system
- **Sound & Haptics** toggles
- **PWA**: install + offline support

## Run
Open `index.html` in your browser. No build step.  
(You can also host on GitHub Pages.)

## Structure
```
index.html
css/
  style.css
js/
  app.js        # rotary physics, call flow
  ui.js         # UI glue, contacts/log, keypad, settings
  state.js      # persistence
  dtmf.js       # WebAudio DTMF generator
assets/
  icons/        # PWA icons
  sounds/       # click.wav, ring.wav, busy.wav
manifest.json
service-worker.js
```
