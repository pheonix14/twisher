/**
 * Twisher Universal Zero-Database Client Engine
 * Created by pheonix14
 * 
 * Works 100% on GitHub Pages with zero backend or database!
 * Encodes & preserves custom settings in URL query parameters and hash,
 * allowing 100s of different users to create and receive unique customized wishes.
 */

// 1. Defaults & Constants
const DEFAULT_ORDER = ["index.html", "game.html", "wish.html", "jumpscare.html", "gallery.html"];

const DEFAULT_CONFIG = {
    name: "Bestie",
    age: "Special",
    from: "pheonix14",
    wish: "HAPPY BIRTHDAY! 🎉",
    sub: "You're truly one in a million... Wishing you endless joy, laughter & adventure!",
    targetDate: "2026-12-31T00:00",
    themeColor: "#6366f1",
    bgImg: "",
    bgMusic: "https://cdn.freesound.org/previews/456/456965_5121236-lq.mp3", // Happy celebratory chime/melody
    popupVid: "",
    jumpMedia: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800",
    showJumpscare: true,
    pageOrder: DEFAULT_ORDER,
    memories: [
        { src: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800", caption: "Every moment is a memory worth celebrating ✨" },
        { src: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800", caption: "Cheers to another chapter of awesomeness 🎂" },
        { src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800", caption: "May all your dreams take flight! 🎈" }
    ]
};

// 2. Safe UTF-8 Base64 Encoders / Decoders
function utf8ToBase64(str) {
    try {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
        console.error("Base64 encode error:", e);
        return "";
    }
}

function base64ToUtf8(str) {
    if (!str) return null;
    try {
        let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        const binary = atob(b64);
        const bytes = Array.prototype.map.call(binary, c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('');
        return decodeURIComponent(bytes);
    } catch (e) {
        console.warn("Base64 decode warning:", e);
        return null;
    }
}

// 3. Resolve & Parse Configuration from URL, LocalStorage or Defaults
function resolveConfig() {
    let resolved = Object.assign({}, DEFAULT_CONFIG);
    const searchParams = new URLSearchParams(window.location.search);
    
    // A) Try reading packed state from URL hash (#c=... or #data=...) or query param (?c=...)
    let encodedState = null;
    if (window.location.hash) {
        const hashStr = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hashStr);
        encodedState = hashParams.get('c') || hashParams.get('data') || (hashStr.startsWith('c=') ? hashStr.slice(2) : null);
    }
    if (!encodedState && searchParams.has('c')) {
        encodedState = searchParams.get('c');
    }

    if (encodedState) {
        const decodedJson = base64ToUtf8(encodedState);
        if (decodedJson) {
            try {
                const parsed = JSON.parse(decodedJson);
                resolved = Object.assign(resolved, parsed);
            } catch (err) {
                console.warn("Error parsing packed JSON:", err);
            }
        }
    } else {
        // B) Try LocalStorage fallback if on creator's device without URL params
        try {
            const savedLocal = localStorage.getItem('twisher_active_config');
            if (savedLocal) {
                const parsedLocal = JSON.parse(savedLocal);
                resolved = Object.assign(resolved, parsedLocal);
            }
        } catch (e) {}
    }

    // C) Override with direct readable query params (enabling nameageandstufflikethis links!)
    if (searchParams.has('name')) resolved.name = searchParams.get('name').trim();
    if (searchParams.has('age')) resolved.age = searchParams.get('age').trim();
    if (searchParams.has('from')) resolved.from = searchParams.get('from').trim();
    if (searchParams.has('wish')) resolved.wish = searchParams.get('wish').trim();
    if (searchParams.has('sub')) resolved.sub = searchParams.get('sub').trim();
    if (searchParams.has('theme')) resolved.themeColor = '#' + searchParams.get('theme').replace(/^#/, '');
    if (searchParams.has('themeColor')) resolved.themeColor = '#' + searchParams.get('themeColor').replace(/^#/, '');
    if (searchParams.has('date')) resolved.targetDate = searchParams.get('date').trim();
    if (searchParams.has('targetDate')) resolved.targetDate = searchParams.get('targetDate').trim();
    if (searchParams.has('bg')) resolved.bgImg = searchParams.get('bg').trim();
    if (searchParams.has('music')) resolved.bgMusic = searchParams.get('music').trim();
    if (searchParams.has('popup')) resolved.popupVid = searchParams.get('popup').trim();
    if (searchParams.has('scare')) resolved.jumpMedia = searchParams.get('scare').trim();
    if (searchParams.has('jumpscare')) {
        const js = searchParams.get('jumpscare').toLowerCase();
        resolved.showJumpscare = (js !== 'false' && js !== '0' && js !== 'off' && js !== 'none');
    }

    // Ensure pageOrder is an array
    if (!Array.isArray(resolved.pageOrder) || resolved.pageOrder.length === 0) {
        resolved.pageOrder = DEFAULT_ORDER;
    }

    // If jumpscare is disabled, remove jumpscare.html from order
    if (resolved.showJumpscare === false) {
        resolved.pageOrder = resolved.pageOrder.filter(p => p !== 'jumpscare.html');
    }

    return resolved;
}

// 4. Build Shareable URL with Readable Params + Hash State
function generateShareUrl(cfg, targetPage = 'index.html') {
    const origin = window.location.origin;
    let path = window.location.pathname;
    
    // Replace current html file in pathname with targetPage
    const lastSlash = path.lastIndexOf('/');
    if (lastSlash !== -1) {
        path = path.substring(0, lastSlash + 1) + targetPage;
    } else {
        path = '/' + targetPage;
    }

    // Build clean readable query parameters (user's request: nameageandstufflikethis in link)
    const params = new URLSearchParams();
    if (cfg.name && cfg.name !== DEFAULT_CONFIG.name) params.set('name', cfg.name);
    if (cfg.age && cfg.age !== DEFAULT_CONFIG.age) params.set('age', cfg.age);
    if (cfg.from && cfg.from !== DEFAULT_CONFIG.from) params.set('from', cfg.from);
    if (cfg.wish && cfg.wish !== DEFAULT_CONFIG.wish) params.set('wish', cfg.wish);
    if (cfg.themeColor && cfg.themeColor !== DEFAULT_CONFIG.themeColor) params.set('theme', cfg.themeColor.replace('#', ''));
    if (cfg.targetDate && cfg.targetDate !== DEFAULT_CONFIG.targetDate) params.set('date', cfg.targetDate);

    // Pack rich data (like memories, order, custom media) into URL hash
    const packed = utf8ToBase64(JSON.stringify(cfg));
    const qs = params.toString() ? '?' + params.toString() : '';
    const hash = packed ? '#c=' + packed : '';

    return `${origin}${path}${qs}${hash}`;
}

// 5. Visual Theme Application
function applyVisuals(cfg) {
    if (!document.body) return;
    
    if (cfg.themeColor) {
        document.documentElement.style.setProperty('--primary-theme', cfg.themeColor);
        // If no background image, apply nice dark tinted background
        if (!cfg.bgImg) {
            document.body.style.backgroundColor = cfg.themeColor === "#000000" ? "#0a0a0c" : cfg.themeColor;
        }
    }
    
    if (cfg.bgImg) {
        document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url("${cfg.bgImg}")`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
    }
}

// 6. Media Audio & Popup Video Engine
let globalAudio = null;
function initMedia(cfg) {
    if (!cfg.bgMusic) return;

    // Check if music already playing in window
    if (!window.__twisherAudio) {
        const audio = new Audio(cfg.bgMusic);
        audio.loop = true;
        window.__twisherAudio = audio;

        // Try playing, fallback to gentle interaction
        const startAudio = () => {
            audio.play().then(() => {
                updateMusicBadge(true);
            }).catch(() => {
                updateMusicBadge(false);
            });
        };

        window.addEventListener('click', startAudio, { once: true });
        window.addEventListener('touchstart', startAudio, { once: true });
        startAudio();
    }

    // Add floating music controller button
    createMusicControl();

    // Floating Popup Video/GIF if provided
    if (cfg.popupVid && !document.getElementById('twisher-popup-widget')) {
        const vidContainer = document.createElement('div');
        vidContainer.id = 'twisher-popup-widget';
        vidContainer.innerHTML = `
            <div style="position:fixed; bottom:60px; left:16px; width:150px; z-index:9990; 
                        border:2px solid rgba(255,255,255,0.4); border-radius:16px; overflow:hidden; 
                        box-shadow: 0 10px 25px rgba(0,0,0,0.6); background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);">
                <button onclick="this.parentElement.remove()" style="position:absolute; top:4px; right:6px; background:rgba(0,0,0,0.6); color:white; border:none; border-radius:50%; width:20px; height:20px; font-size:11px; cursor:pointer; z-index:10;">✕</button>
                ${cfg.popupVid.match(/\.(mp4|webm|ogg|mov)$/i) ? 
                    `<video src="${cfg.popupVid}" autoplay loop muted playsinline style="width:100%; display:block;"></video>` :
                    `<img src="${cfg.popupVid}" style="width:100%; display:block; object-fit:cover;" />`
                }
            </div>`;
        document.body.appendChild(vidContainer);
    }
}

function createMusicControl() {
    if (document.getElementById('twisher-music-toggle')) return;
    const btn = document.createElement('button');
    btn.id = 'twisher-music-toggle';
    btn.setAttribute('title', 'Toggle Music');
    btn.innerHTML = '🎵';
    btn.style.cssText = `
        position: fixed;
        bottom: 14px;
        left: 14px;
        z-index: 9998;
        background: rgba(0, 0, 0, 0.65);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 8px 12px;
        border-radius: 9999px;
        font-size: 13px;
        cursor: pointer;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        transition: transform 0.2s, background 0.2s;
    `;
    btn.onclick = () => {
        const audio = window.__twisherAudio;
        if (!audio) return;
        if (audio.paused) {
            audio.play();
            btn.innerHTML = '🎵 Playing';
        } else {
            audio.pause();
            btn.innerHTML = '🔇 Muted';
        }
    };
    document.body.appendChild(btn);
}

function updateMusicBadge(isPlaying) {
    const btn = document.getElementById('twisher-music-toggle');
    if (btn) {
        btn.innerHTML = isPlaying ? '🎵 Playing' : '🎵 Tap to Play';
    }
}

// 7. Dynamic Navigation Across Pages (Preserves Query String + Hash!)
function navigate(dir) {
    const order = (window.config && window.config.pageOrder) ? window.config.pageOrder : DEFAULT_ORDER;
    let currentPage = window.location.pathname.split("/").pop() || "index.html";
    if (currentPage === "") currentPage = "index.html";
    
    let currentIndex = order.indexOf(currentPage);
    if (currentIndex === -1) {
        // Fallback search
        currentIndex = order.findIndex(p => p.includes(currentPage));
    }

    const stateCarry = window.location.search + window.location.hash;
    let targetPage = order[0];

    if (dir === 'next') {
        if (currentIndex !== -1 && currentIndex < order.length - 1) {
            targetPage = order[currentIndex + 1];
        } else {
            targetPage = order[0]; // Loop back to home
        }
    } else if (dir === 'prev') {
        if (currentIndex > 0) {
            targetPage = order[currentIndex - 1];
        } else {
            targetPage = order[0];
        }
    }

    window.location.href = targetPage + stateCarry;
}

// 8. Visual UI Credit to pheonix14 (User explicit requirement!)
function injectPhoenixCredit() {
    if (document.getElementById('pheonix14-credit-badge')) return;
    
    const badge = document.createElement('div');
    badge.id = 'pheonix14-credit-badge';
    badge.innerHTML = `
        <span style="opacity:0.75;">Twisher</span>
        <span style="opacity:0.4;">•</span>
        <span>Made with 💖 by <a href="https://github.com/pheonix14" target="_blank" rel="noopener" style="color:#818cf8; font-weight:700; text-decoration:none; border-bottom:1px solid rgba(129,140,248,0.5);">pheonix14</a></span>
    `;
    badge.style.cssText = `
        position: fixed;
        bottom: 12px;
        right: 14px;
        z-index: 9995;
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #f8fafc;
        padding: 6px 14px;
        border-radius: 9999px;
        font-size: 11px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        letter-spacing: 0.02em;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
        display: flex;
        align-items: center;
        gap: 6px;
        transition: transform 0.2s, background 0.2s;
    `;
    badge.onmouseenter = () => { badge.style.transform = 'scale(1.04)'; badge.style.background = 'rgba(15, 23, 42, 0.9)'; };
    badge.onmouseleave = () => { badge.style.transform = 'scale(1)'; badge.style.background = 'rgba(15, 23, 42, 0.75)'; };
    
    document.body.appendChild(badge);
}

// 9. Auto-attach state preservation to any internal links
function attachLinkListeners() {
    const stateCarry = window.location.search + window.location.hash;
    if (!stateCarry) return;
    
    document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
            if (!href.includes('?') && !href.includes('#')) {
                a.setAttribute('href', href + stateCarry);
            }
        }
    });
}

// 10. Bootstrap the Twisher Engine
function bootTwisher() {
    window.config = resolveConfig();
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyVisuals(window.config);
            injectPhoenixCredit();
            attachLinkListeners();
            if (!window.location.href.includes('jumpscare.html')) {
                initMedia(window.config);
            }
        });
    } else {
        applyVisuals(window.config);
        injectPhoenixCredit();
        attachLinkListeners();
        if (!window.location.href.includes('jumpscare.html')) {
            initMedia(window.config);
        }
    }
}

// Expose utilities on window for pages
window.Twisher = {
    DEFAULT_CONFIG,
    DEFAULT_ORDER,
    resolveConfig,
    generateShareUrl,
    utf8ToBase64,
    base64ToUtf8,
    navigate,
    applyVisuals
};

// Start immediately
bootTwisher();

// Made by pheonix14
