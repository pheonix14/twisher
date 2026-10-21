/**
 * Twisher Universal Zero-Database Client Engine
 * Created by pheonix14
 * 
 * Works 100% on GitHub Pages with zero backend or database!
 * Encodes & preserves custom settings in URL query parameters and hash,
 * allowing 100s of different users to create and receive unique customized wishes.
 * 
 * Features:
 * - Direct YouTube Shorts / Videos support for background music & popup video
 * - Zero-database URL state parser (#c=... and ?name=...&age=...)
 * - Canvas image compression and file upload support
 * - Dynamic parameter preservation across page transitions
 */

// 1. Defaults & Constants
const DEFAULT_ORDER = ["index.html", "game.html", "wish.html", "jumpscare.html", "gallery.html"];

const DEFAULT_CONFIG = {
    name: "Bestie",
    age: "Special",
    from: "pheonix14",
    wish: "HAPPY BIRTHDAY!",
    sub: "You're truly one in a million... Wishing you endless joy, laughter & adventure!",
    targetDate: "2026-12-31T00:00",
    themeColor: "#ec4899",
    bgImg: "",
    bgMusic: "https://cdn.freesound.org/previews/456/456965_5121236-lq.mp3",
    popupVid: "",
    jumpMedia: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800",
    showJumpscare: true,
    pageOrder: DEFAULT_ORDER,
    memories: [
        { src: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800", caption: "Every moment is a memory worth celebrating" },
        { src: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800", caption: "Cheers to another chapter of awesomeness" },
        { src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800", caption: "May all your dreams take flight!" }
    ]
};

// 2. YouTube URL ID Extractor (Supports Shorts, youtu.be, watch, embed)
function getYouTubeId(url) {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

// 3. Safe UTF-8 Base64 Encoders / Decoders
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

// 4. Resolve & Parse Configuration from URL, LocalStorage or Defaults
function resolveConfig() {
    let resolved = Object.assign({}, DEFAULT_CONFIG);
    const searchParams = new URLSearchParams(window.location.search);
    
    // A) Try reading packed state from URL hash (#c=... or #data=...) or query param (?c=...)
    let encodedState = null;
    if (window.location.hash) {
        const hashStr = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hashStr);
        encodedState = hashParams.get('c') || hashParams.get('data') || (hashStr.startsWith('c=') ? hashStr.slice(2) : null);
        if (!encodedState && !hashStr.includes('=')) {
            encodedState = hashStr; // Direct hash string
        }
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

    // C) Override with direct readable query params (enabling clean nameageandstufflikethis links!)
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

// 5. Build Shareable URL with Readable Params + Hash State
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

    // Build clean readable query parameters
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

// 6. Visual Theme Application
function applyVisuals(cfg) {
    if (!document.body) return;
    
    if (cfg.themeColor) {
        document.documentElement.style.setProperty('--primary-theme', cfg.themeColor);
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

// 7. Media Audio & Popup Video Engine (With YouTube Shorts Support)
let isAudioPlaying = false;

function initMedia(cfg) {
    // 7A. Background Music Logic
    if (cfg.bgMusic) {
        const ytMusicId = getYouTubeId(cfg.bgMusic);
        
        if (ytMusicId) {
            // YouTube Shorts / Video as background music
            if (!document.getElementById('twisher-yt-audio')) {
                const iframe = document.createElement('iframe');
                iframe.id = 'twisher-yt-audio';
                iframe.src = `https://www.youtube-nocookie.com/embed/${ytMusicId}?enablejsapi=1&autoplay=1&loop=1&playlist=${ytMusicId}&playsinline=1&controls=0&disablekb=1&fs=0`;
                iframe.allow = "autoplay";
                iframe.style.cssText = "position:fixed;width:1px;height:1px;left:-9999px;top:-9999px;opacity:0.001;pointer-events:none;";
                document.body.appendChild(iframe);

                const triggerYtPlay = () => {
                    try {
                        iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                        iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                        isAudioPlaying = true;
                        updateMusicBadge(true);
                    } catch(e){}
                };

                window.addEventListener('click', triggerYtPlay, { once: true });
                window.addEventListener('touchstart', triggerYtPlay, { once: true });
                setTimeout(triggerYtPlay, 800);
            }
        } else {
            // Direct MP3/OGG/WAV or data URL audio
            if (!window.__twisherAudio) {
                const audio = new Audio(cfg.bgMusic);
                audio.loop = true;
                window.__twisherAudio = audio;

                const startAudio = () => {
                    audio.play().then(() => {
                        isAudioPlaying = true;
                        updateMusicBadge(true);
                    }).catch(() => {
                        updateMusicBadge(false);
                    });
                };

                window.addEventListener('click', startAudio, { once: true });
                window.addEventListener('touchstart', startAudio, { once: true });
                startAudio();
            }
        }

        createMusicControl();
    }

    // 7B. Floating Popup Video / Mascot (With YouTube Shorts Support)
    if (cfg.popupVid && !document.getElementById('twisher-popup-widget')) {
        const ytPopupId = getYouTubeId(cfg.popupVid);
        const vidContainer = document.createElement('div');
        vidContainer.id = 'twisher-popup-widget';

        if (ytPopupId) {
            // Render YouTube Short in responsive floating container
            vidContainer.innerHTML = `
                <div style="position:fixed; bottom:60px; left:16px; width:160px; height:250px; z-index:9990; 
                            border:2px solid rgba(255,255,255,0.4); border-radius:18px; overflow:hidden; 
                            box-shadow: 0 12px 30px rgba(0,0,0,0.7); background: #000;">
                    <button onclick="this.parentElement.parentElement.remove()" style="position:absolute; top:4px; right:6px; background:rgba(0,0,0,0.7); color:white; border:none; border-radius:50%; width:22px; height:22px; font-size:11px; font-weight:bold; cursor:pointer; z-index:20;">✕</button>
                    <iframe src="https://www.youtube-nocookie.com/embed/${ytPopupId}?autoplay=1&mute=1&loop=1&playlist=${ytPopupId}&playsinline=1&controls=0&modestbranding=1" 
                            style="width:100%; height:100%; border:none;" 
                            allow="autoplay" 
                            allowfullscreen>
                    </iframe>
                </div>`;
        } else {
            const isDirectVid = cfg.popupVid.match(/\.(mp4|webm|ogg|mov)$/i) || cfg.popupVid.startsWith('data:video');
            vidContainer.innerHTML = `
                <div style="position:fixed; bottom:60px; left:16px; width:150px; z-index:9990; 
                            border:2px solid rgba(255,255,255,0.4); border-radius:16px; overflow:hidden; 
                            box-shadow: 0 10px 25px rgba(0,0,0,0.6); background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);">
                    <button onclick="this.parentElement.parentElement.remove()" style="position:absolute; top:4px; right:6px; background:rgba(0,0,0,0.6); color:white; border:none; border-radius:50%; width:20px; height:20px; font-size:11px; cursor:pointer; z-index:10;">✕</button>
                    ${isDirectVid ? 
                        `<video src="${cfg.popupVid}" autoplay loop muted playsinline style="width:100%; display:block;"></video>` :
                        `<img src="${cfg.popupVid}" style="width:100%; display:block; object-fit:cover;" onerror="this.parentElement.parentElement.remove()" />`
                    }
                </div>`;
        }

        document.body.appendChild(vidContainer);
    }
}

function createMusicControl() {
    if (document.getElementById('twisher-music-toggle')) return;
    const btn = document.createElement('button');
    btn.id = 'twisher-music-toggle';
    btn.setAttribute('title', 'Toggle Sound');
    btn.innerHTML = 'Sound: Play';
    btn.style.cssText = `
        position: fixed;
        bottom: 14px;
        left: 14px;
        z-index: 9998;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.25);
        padding: 7px 14px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        transition: transform 0.2s, background 0.2s;
    `;
    btn.onclick = () => {
        const ytIframe = document.getElementById('twisher-yt-audio');
        if (ytIframe) {
            if (isAudioPlaying) {
                ytIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                isAudioPlaying = false;
                btn.innerHTML = 'Sound: Muted';
            } else {
                ytIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                ytIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                isAudioPlaying = true;
                btn.innerHTML = 'Sound: On';
            }
            return;
        }

        const audio = window.__twisherAudio;
        if (!audio) return;
        if (audio.paused) {
            audio.play();
            isAudioPlaying = true;
            btn.innerHTML = 'Sound: On';
        } else {
            audio.pause();
            isAudioPlaying = false;
            btn.innerHTML = 'Sound: Muted';
        }
    };
    document.body.appendChild(btn);
}

function updateMusicBadge(isPlaying) {
    const btn = document.getElementById('twisher-music-toggle');
    if (btn) {
        btn.innerHTML = isPlaying ? 'Sound: On' : 'Sound: Tap to Play';
    }
}

// 8. Dynamic Navigation Across Pages (Preserves Query String + Hash!)
function navigate(dir) {
    const order = (window.config && window.config.pageOrder) ? window.config.pageOrder : DEFAULT_ORDER;
    let currentPage = window.location.pathname.split("/").pop() || "index.html";
    if (currentPage === "") currentPage = "index.html";
    
    let currentIndex = order.indexOf(currentPage);
    if (currentIndex === -1) {
        currentIndex = order.findIndex(p => p.includes(currentPage));
    }

    const stateCarry = window.location.search + window.location.hash;
    let targetPage = order[0];

    if (dir === 'next') {
        if (currentIndex !== -1 && currentIndex < order.length - 1) {
            targetPage = order[currentIndex + 1];
        } else {
            targetPage = order[0];
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

// 9. Visual UI Credit to pheonix14
function injectPhoenixCredit() {
    if (document.getElementById('pheonix14-credit-badge')) return;
    
    const badge = document.createElement('div');
    badge.id = 'pheonix14-credit-badge';
    badge.innerHTML = `
        <span style="opacity:0.75;">Twisher</span>
        <span style="opacity:0.4;">•</span>
        <span>Made by <a href="https://github.com/pheonix14" target="_blank" rel="noopener" style="color:#818cf8; font-weight:700; text-decoration:none; border-bottom:1px solid rgba(129,140,248,0.5);">pheonix14</a></span>
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

// 10. Auto-attach state preservation to any internal links
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

// 11. Canvas Image Compressor Helper for File Uploads
function compressImageFile(file, maxWidth, maxHeight, quality, callback) {
    if (!file || !file.type.startsWith('image/')) {
        callback(null);
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            let w = img.width;
            let h = img.height;
            if (w > maxWidth || h > maxHeight) {
                if (w > h) {
                    h = Math.round((h * maxWidth) / w);
                    w = maxWidth;
                } else {
                    w = Math.round((w * maxHeight) / h);
                    h = maxHeight;
                }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/jpeg', quality || 0.65);
            callback(dataUrl);
        };
        img.onerror = () => callback(null);
        img.src = e.target.result;
    };
    reader.onerror = () => callback(null);
    reader.readAsDataURL(file);
}

// 12. Bootstrap Twisher
function bootTwisher() {
    window.config = resolveConfig();
    
    const onReady = () => {
        applyVisuals(window.config);
        injectPhoenixCredit();
        attachLinkListeners();
        if (!window.location.href.includes('jumpscare.html')) {
            initMedia(window.config);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }
}

// Expose utilities on window
window.Twisher = {
    DEFAULT_CONFIG,
    DEFAULT_ORDER,
    getYouTubeId,
    resolveConfig,
    generateShareUrl,
    utf8ToBase64,
    base64ToUtf8,
    compressImageFile,
    navigate,
    applyVisuals
};

bootTwisher();

// Made by pheonix14
