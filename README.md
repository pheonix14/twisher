# Twisher 🎉

> **Wishes you and people you want with a fully customizable surprise.**  
> Crafted with 💖 by **[pheonix14](https://github.com/pheonix14)**

🌐 **Live GitHub Pages URL:** [https://pheonix14.github.io/twisher/](https://pheonix14.github.io/twisher/)

---

## ⚡ Zero-Database URL Architecture (Designed for 100s of Users)

Twisher runs **100% statically on GitHub Pages** without requiring any external database, backend server, or cloud storage:
- **No Database Needed:** Each surprise is encoded directly into the shareable link (via human-readable query parameters and compressed URL-safe base64 state).
- **No Data Loss Across Browsers:** When someone receives a link on a new browser, incognito tab, or mobile device, their custom configuration loads instantly from the link without depending on `localStorage`.
- **Supports 100s of Independent Users:** 100s or thousands of creators can simultaneously generate and send unique links (`?name=Alex&age=21...`) with zero chance of data collisions or overwriting.
- **Seamless State Navigation:** As the recipient clicks through the journey (`index.html` → `game.html` → `wish.html` → `jumpscare.html` → `gallery.html`), the engine automatically carries over all URL parameters and hash state across page transitions.

---

## 🚀 Features

- ⏱️ **Live Countdown Timer (`index.html`):** Unlocks on the recipient's birthday or milestone.
- 🎮 **Retro Pixel Cake Mini-Game (`game.html`):** Tap to light the candle on a handheld pixel console.
- 🎂 **Confetti & Floating Hearts Wish (`wish.html`):** Vibrant animations with personalized celebration headline and subtext.
- 💀 **Surprise Jumpscare (`jumpscare.html`):** Heart-pounding surprise with suspense delay and screen shake (can also be toggled off).
- 📸 **Polaroid Memories Showcase (`gallery.html` & `surprises.html`):** Interactive polaroids with custom captions and images.
- ⚙️ **Twisher Studio Admin (`admin.html`):** Live configuration editor, preset palette picker, memory manager, draggable journey order, profile manager, and 1-click shareable link generator with WhatsApp integration.

---

## 🔗 Quick URL Parameters

You can also craft or modify links directly:

| Parameter | Example | Description |
|---|---|---|
| `name` | `?name=Sarah` | Recipient's name |
| `age` | `&age=21` | Recipient's age or milestone |
| `from` | `&from=Alex` | Sender name |
| `wish` | `&wish=Happy+Birthday!` | Custom celebration headline |
| `theme` | `&theme=ec4899` | Primary theme hex color code |
| `date` | `&date=2026-12-31T00:00` | Countdown target date |
| `music` | `&music=https://...` | Background audio MP3 URL |
| `popup` | `&popup=https://...` | Floating video/GIF mascot URL |
| `scare` | `&scare=https://...` | Custom jumpscare image/video |
| `jumpscare` | `&jumpscare=false` | Disable jumpscare feature |
| `c` | `#c=eyJuYW1lIj...` | Packed rich JSON state (memories, custom order, etc.) |

---

## 🛠️ Credits & Author

Created and maintained by **pheonix14**.  
Licensed under MIT.
