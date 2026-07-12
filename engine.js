// 1. Configuration Constants
const DEFAULT_ORDER = ["index.html", "game.html", "wish.html", "jumpscare.html", "gallery.html"];
const API_URL = '/.netlify/functions/update-config';

// 2. The Sync Engine: Fetches your Admin settings from the cloud
async function loadSync() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Cloud Sync Failed");
        
        const config = await res.json();
        window.config = config; // Make config global for navigation

        // Apply Visuals
        applyVisuals(config);

        // Initialize Media (Music/Popups)
        if (!window.location.href.includes('jumpscare.html')) {
            initMedia(config);
        }
    } catch (err) {
        console.error("Sync Error:", err);
        // Fallback to defaults if cloud is offline
        window.config = { pageOrder: DEFAULT_ORDER, themeColor: "#000000" };
        applyVisuals(window.config);
    }
}

// 3. Visual Application Logic
function applyVisuals(config) {
    document.body.style.backgroundColor = config.themeColor || "#000000";
    
    if (config.bgImg) {
        document.body.style.backgroundImage = `url(${config.bgImg})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
    }
}

// 4. Media Engine (Audio & Video)
function initMedia(config) {
    // Background Music Logic
    if (config.bgMusic) {
        const audio = new Audio(config.bgMusic);
        audio.loop = true;
        // Browsers require a click to start audio
        window.addEventListener('click', () => {
            audio.play().catch(e => console.log("Audio play blocked"));
        }, { once: true });
    }

    // Floating Popup Video Logic
    if (config.popupVid) {
        const vidContainer = document.createElement('div');
        vidContainer.innerHTML = `
            <div style="position:fixed; bottom:20px; left:20px; width:180px; z-index:999; 
                        border:2px solid white; border-radius:15px; overflow:hidden; shadow: 0 10px 15px rgba(0,0,0,0.3)">
                <video src="${config.popupVid}" autoplay loop muted playsinline style="width:100%;"></video>
            </div>`;
        document.body.appendChild(vidContainer);
    }
}

// 5. Navigation Logic (Uses your Draggable Order)
function navigate(dir) {
    const order = (window.config && window.config.pageOrder) ? window.config.pageOrder : DEFAULT_ORDER;
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const currentIndex = order.indexOf(currentPage);

    if (dir === 'next' && currentIndex < order.length - 1) {
        window.location.href = order[currentIndex + 1];
    } else if (dir === 'prev' && currentIndex > 0) {
        window.location.href = order[currentIndex - 1];
    } else if (dir === 'next' && currentIndex === order.length - 1) {
        window.location.href = order[0]; // Loop back to home
    }
}

// Start the engine
loadSync();

// made by pheonix14
