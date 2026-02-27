// ---------- Logo glitch + sparkle ----------
const logo = document.getElementById('logo');
const sparkleLayer = document.getElementById('sparkleLayer');

let running = true;
logo.classList.add('glow');

function randomGlitchLoop() {
    if (!running) return;

    const strongCount = Math.floor(Math.random() * 4) + 2;
    let i = 0;

    function strongBurst() {
        if (!running) return;

        if (i < strongCount) {
            logo.style.transform = `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`;
            i++;
            setTimeout(strongBurst, 40 + Math.random() * 60);
        } else {
            logo.style.transform = 'translate(0,0)';
            softPhase();
        }
    }

    function softPhase() {
        const duration = 500 + Math.random() * 1500;
        const start = Date.now();

        function softMove() {
            if (!running) return;

            logo.style.transform = `translate(${(Math.random() - 0.5) * 2}px, ${(Math.random() - 0.5) * 2}px)`;

            if (Date.now() - start < duration) {
                requestAnimationFrame(softMove);
            } else {
                logo.style.transform = 'translate(0,0)';
                setTimeout(randomGlitchLoop, 800 + Math.random() * 2000);
            }
        }

        softMove();
    }

    strongBurst();
}
randomGlitchLoop();

function createSparkle() {
    if (!running) return;

    const span = document.createElement('span');
    span.style.top = Math.random() * 100 + '%';
    span.style.left = Math.random() * 100 + '%';
    span.style.animationDuration = 1 + Math.random() * 2 + 's';
    sparkleLayer.appendChild(span);
    setTimeout(() => span.remove(), 3000);
}
setInterval(createSparkle, 300);

logo.addEventListener('mouseenter', () => {
    running = false;
    logo.style.transform = 'translate(0,0)';
    logo.src = logo.dataset.hover;
});

logo.addEventListener('mouseleave', () => {
    running = true;
    logo.src = logo.dataset.default;
    randomGlitchLoop();
});

// ---------- Staff animation ----------
const staff = document.getElementById('staff');
const notes = Array.from(document.querySelectorAll('.note'));

const overlayWrapper = document.getElementById('overlayWrapper');
const tabsContainer = document.getElementById('tabs');
const contentsContainer = document.getElementById('tabContents');
const homeBtn = document.getElementById('homeBtn');
const musicBar = document.getElementById('musicBar');

const rightMargin = 80;
const noteWidth = 40;

const state = new Map();

function resetNoteState(note) {
    const staffWidth = staff.offsetWidth;
    const usableWidth = Math.max(0, staffWidth - rightMargin - noteWidth);

    state.set(note, {
        x: Math.random() * usableWidth,
        baseY: 40 + Math.random() * 20,
        amplitude: 15 + Math.random() * 15,
        frequency: 0.01 + Math.random() * 0.02,
        speed: 0.22 + Math.random() * 0.35,
        paused: false,
    });
}

notes.forEach(resetNoteState);

function animateNotes() {
    const staffWidth = staff.offsetWidth;
    const usableWidth = Math.max(0, staffWidth - rightMargin - noteWidth);

    for (const note of notes) {
        const s = state.get(note);
        if (!s) continue;

        if (note.style.position === 'fixed') continue;
        if (s.paused) continue;

        s.x += s.speed;

        if (s.x > usableWidth) {
            s.x = 0;
            s.amplitude = 15 + Math.random() * 20;
            s.frequency = 0.01 + Math.random() * 0.02;
            s.speed = 0.22 + Math.random() * 0.35;
            s.baseY = 40 + Math.random() * 20;
        }

        const y = s.baseY + Math.sin(s.x * s.frequency) * s.amplitude;
        note.style.transform = `translate(${s.x}px, ${y}px)`;
    }

    requestAnimationFrame(animateNotes);
}
requestAnimationFrame(animateNotes);

// ---------- Hover ----------
notes.forEach((note) => {
    note.addEventListener('mouseenter', () => {
        const s = state.get(note);
        if (!s) return;
        s.paused = true;
        note.classList.add('is-hover');
    });

    note.addEventListener('mouseleave', () => {
        const s = state.get(note);
        if (!s) return;
        s.paused = false;
        note.classList.remove('is-hover');
    });
});

// ---------- Overlay ----------
function buildOverlay(activeIndex) {
    tabsContainer.innerHTML = '';

    const pages = document.querySelectorAll('.tab-content');

    pages.forEach((p) => p.classList.remove('active'));

    notes.forEach((note, index) => {
        const tab = document.createElement('div');
        tab.className = 'tab';

        const originalImg = note.querySelector('img');
        const img = document.createElement('img');
        img.src = originalImg.src;
        tab.appendChild(img);

        if (index === activeIndex) {
            tab.classList.add('active');
            pages[index].classList.add('active');
        }

        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
            pages.forEach((p) => p.classList.remove('active'));

            tab.classList.add('active');
            pages[index].classList.add('active');
        });

        tabsContainer.appendChild(tab);
    });
}

function openOverlay(activeIndex) {
    overlayWrapper.classList.add('is-open');
    musicBar.style.display = 'none';
    logo.style.display = 'none';
    buildOverlay(activeIndex);
}

function closeOverlay() {
    overlayWrapper.classList.remove('is-open');
    musicBar.style.display = 'flex';
    logo.style.display = 'block';

    notes.forEach((note) => {
        note.style.position = '';
        note.style.left = '';
        note.style.top = '';
        note.style.margin = '';
        note.style.transform = '';
        note.style.transition = '';
        note.style.zIndex = '';
        resetNoteState(note);
    });
}

notes.forEach((note, index) => {
    note.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (overlayWrapper.classList.contains('is-open')) {
            buildOverlay(index);
            return;
        }

        const s = state.get(note);
        if (s) s.paused = true;

        note.classList.remove('is-hover');

        const rect = note.getBoundingClientRect();
        const startLeft = rect.left;
        const startTop = rect.top;

        const centerLeft = window.innerWidth / 2 - rect.width / 2;
        const centerTop = window.innerHeight / 2 - rect.height / 2;

        note.style.position = 'fixed';
        note.style.left = startLeft + 'px';
        note.style.top = startTop + 'px';
        note.style.margin = '0';
        note.style.zIndex = '5000';

        requestAnimationFrame(() => {
            note.style.transition = 'transform 0.6s ease';
            note.style.transform = `translate(${centerLeft - startLeft}px, ${centerTop - startTop}px) scale(4)`;
        });

        setTimeout(() => {
            openOverlay(index);
        }, 600);
    });
});

homeBtn.addEventListener('click', closeOverlay);

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlayWrapper.classList.contains('is-open')) {
        closeOverlay();
    }
});
