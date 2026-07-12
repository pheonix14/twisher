const defaultOrder = ["index.html", "game.html", "wish.html", "jumpscare.html", "gallery.html"];
const order = JSON.parse(localStorage.getItem('pageOrder')) || defaultOrder;
const bgColor = localStorage.getItem('themeColor') || "#000000";
const bgImg = localStorage.getItem('bgImg');

// 1. Global Visual Setup
document.body.style.backgroundColor = bgColor;
if (bgImg) {
    document.body.style.backgroundImage = `url(${bgImg})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
}

// 2. Navigation Logic
function navigate(dir) {
    const page = window.location.pathname.split("/").pop() || "index.html";
    const pos = order.indexOf(page);
    if(dir === 'next' && pos < order.length - 1) window.location.href = order[pos + 1];
    else if(dir === 'prev' && pos > 0) window.location.href = order[pos - 1];
}

// 3. Audio & Video Engine
window.addEventListener('DOMContentLoaded', () => {
    const isJumpscare = window.location.href.includes('jumpscare.html');

    // Floating Video Popup
    const popupData = localStorage.getItem('popupVid');
    if (popupData && !isJumpscare) {
        const vid = document.createElement('div');
        vid.innerHTML = `<div style="position:fixed; bottom:20px; left:20px; width:180px; z-index:999; border:2px solid white; border-radius:10px; overflow:hidden;">
            <video src="${popupData}" autoplay loop muted playsinline style="width:100%;"></video>
        </div>`;
        document.body.appendChild(vid);
    }

    // Background Music
    const musicData = localStorage.getItem('bgMusic');
    if (musicData && !isJumpscare) {
        const audio = new Audio(musicData);
        audio.loop = true;
        window.onclick = () => audio.play();
    }
});

// made by pheonix14
