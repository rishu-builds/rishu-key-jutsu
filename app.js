// KeyJutsu website interactive controls

document.addEventListener("DOMContentLoaded", function () {
    // 1. Mobile Navigation Drawer & Body Lock
    const mobileToggle = document.getElementById("mobile-toggle");
    const navLinks = document.getElementById("nav-links");

    if (mobileToggle && navLinks) {
        function toggleNav() {
            const isActive = navLinks.classList.toggle("active");
            mobileToggle.setAttribute("aria-expanded", isActive);
            document.body.style.overflow = isActive ? "hidden" : "";
        }

        mobileToggle.addEventListener("click", toggleNav);

        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                mobileToggle.setAttribute("aria-expanded", "false");
                document.body.style.overflow = "";
            });
        });
    }

    // 2. Interactive Ninja Rank Calculator
    const wpmSlider = document.getElementById("calc-wpm-slider");
    const accSlider = document.getElementById("calc-acc-slider");
    const wpmVal = document.getElementById("calc-wpm-val");
    const accVal = document.getElementById("calc-acc-val");
    const rankLetter = document.getElementById("calc-rank-letter");
    const rankTitle = document.getElementById("calc-rank-title");

    if (wpmSlider && accSlider) {
        function updateRank() {
            const wpm = parseInt(wpmSlider.value);
            const acc = parseInt(accSlider.value);

            if (wpmVal) wpmVal.textContent = wpm;
            if (accVal) accVal.textContent = acc + "%";

            // Formula: 40% WPM + 40% Accuracy + 20% Consistency (Fixed at 100.0)
            const score = (wpm * 0.40) + (acc * 0.40) + 20.0;
            let rank = "F";
            let title = "F - WEAK";
            let color = "#A6A6B3";

            if (score >= 90) { rank = "S"; title = "S - SUPREME GRANDMASTER"; color = "#FFD700"; }
            else if (score >= 80) { rank = "A"; title = "A - EXCELLENT STRIKER"; color = "#42E88A"; }
            else if (score >= 70) { rank = "B"; title = "B - GOOD ADEPT"; color = "#00E5FF"; }
            else if (score >= 60) { rank = "C"; title = "C - AVERAGE NINJA"; color = "#EBC026"; }
            else if (score >= 50) { rank = "D"; title = "D - DEVELOPING INITIATE"; color = "#FFB020"; }
            else if (score >= 40) { rank = "E"; title = "E - LOW NOVICE"; color = "#F25959"; }

            if (rankLetter) {
                rankLetter.textContent = rank;
                rankLetter.style.color = color;
            }
            if (rankTitle) rankTitle.textContent = title;

            // Highlight corresponding card in Matrix
            document.querySelectorAll(".rank-matrix-card").forEach(card => {
                if (card.getAttribute("data-rank") === rank) {
                    card.style.borderColor = color;
                    card.style.boxShadow = `0 0 20px ${color}40`;
                    card.style.transform = "translateY(-4px)";
                } else {
                    card.style.borderColor = "var(--color-border)";
                    card.style.boxShadow = "none";
                    card.style.transform = "none";
                }
            });
        }

        wpmSlider.addEventListener("input", updateRank);
        accSlider.addEventListener("input", updateRank);
        updateRank();
    }

    // 3. 11 Arenas Filter Tabs
    const tabBtns = document.querySelectorAll(".tab-btn");
    const arenaCards = document.querySelectorAll(".arena-card");

    if (tabBtns.length > 0 && arenaCards.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener("click", function () {
                tabBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const filter = btn.getAttribute("data-filter");

                arenaCards.forEach(card => {
                    const tier = card.getAttribute("data-tier");
                    if (filter === "all" || filter === tier) {
                        card.style.display = "block";
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        });
    }

    // 4. FAQ Accordion Toggle
    const faqQuestions = document.querySelectorAll(".faq-question");
    faqQuestions.forEach(q => {
        q.addEventListener("click", function () {
            const item = q.parentElement;
            const isActive = item.classList.contains("active");

            document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("active"));

            if (!isActive) {
                item.classList.add("active");
            }
        });
    });

    // 5. Accessible Screenshot Lightbox Viewer
    const galleryItems = Array.from(document.querySelectorAll(".gallery-card img, .arena-img-box img, .feature-panel-img img"));
    const lightboxModal = document.getElementById("lightbox-modal");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxClose = document.getElementById("lightbox-close");
    const lightboxPrev = document.getElementById("lightbox-prev");
    const lightboxNext = document.getElementById("lightbox-next");

    let currentIndex = 0;

    function openLightbox(index) {
        if (!galleryItems[index] || !lightboxModal) return;
        currentIndex = index;
        const target = galleryItems[currentIndex];
        lightboxImg.src = target.src;
        lightboxImg.alt = target.alt;
        lightboxModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        if (!lightboxModal) return;
        lightboxModal.classList.remove("active");
        document.body.style.overflow = "";
    }

    function showNext() {
        openLightbox((currentIndex + 1) % galleryItems.length);
    }

    function showPrev() {
        openLightbox((currentIndex - 1 + galleryItems.length) % galleryItems.length);
    }

    galleryItems.forEach((img, idx) => {
        img.addEventListener("click", () => openLightbox(idx));
    });

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener("click", showNext);
    if (lightboxPrev) lightboxPrev.addEventListener("click", showPrev);

    if (lightboxModal) {
        lightboxModal.addEventListener("click", (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });
    }

    // Keyboard Shortcuts (ESC, ArrowLeft, ArrowRight)
    document.addEventListener("keydown", function (e) {
        if (lightboxModal && lightboxModal.classList.contains("active")) {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") showNext();
            if (e.key === "ArrowLeft") showPrev();
        }

        if (e.key === "Escape") {
            if (navLinks && navLinks.classList.contains("active")) {
                navLinks.classList.remove("active");
                document.body.style.overflow = "";
            }
            document.querySelectorAll(".modal-overlay.active").forEach(m => {
                m.classList.remove("active");
                document.body.style.overflow = "";
            });
        }
    });

    // 7. Launch Countdown & Automatic State Switcher
    const LAUNCH_TIMESTAMP = new Date("2026-09-03T17:00:00+05:30").getTime();
    const ITCH_URL = "download.html";

    const cdDays = document.getElementById("cd-days");
    const cdHours = document.getElementById("cd-hours");
    const cdMinutes = document.getElementById("cd-minutes");
    const cdSeconds = document.getElementById("cd-seconds");
    const countdownTimer = document.getElementById("countdown-timer");
    const launchLiveStatus = document.getElementById("launch-live-status");
    const downloadSectionLabel = document.getElementById("download-section-label");
    const downloadSectionTitle = document.getElementById("download-section-title");
    const heroBadgeLabel = document.getElementById("hero-badge-label");
    const heroBadgeTime = document.getElementById("hero-badge-time");

    const allDownloadCTAs = document.querySelectorAll(".download-cta");

    let isLaunched = false;

    function handleDisabledCTAClick(e) {
        if (!isLaunched) {
            e.preventDefault();
            const downloadSection = document.getElementById("download");
            if (downloadSection) {
                downloadSection.scrollIntoView({ behavior: "smooth" });
            }
        }
    }

    function setPreLaunchState(diffMs) {
        isLaunched = false;
        
        const totalSec = Math.floor(diffMs / 1000);
        const days = Math.floor(totalSec / (3600 * 24));
        const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;

        if (cdDays) cdDays.textContent = String(days).padStart(2, "0");
        if (cdHours) cdHours.textContent = String(hours).padStart(2, "0");
        if (cdMinutes) cdMinutes.textContent = String(minutes).padStart(2, "0");
        if (cdSeconds) cdSeconds.textContent = String(seconds).padStart(2, "0");

        if (countdownTimer) countdownTimer.style.display = "flex";
        if (launchLiveStatus) launchLiveStatus.style.display = "none";

        if (downloadSectionLabel) downloadSectionLabel.textContent = "KEYJUTSU LAUNCH COUNTDOWN";
        if (downloadSectionTitle) downloadSectionTitle.textContent = "September 3, 2026 — 5:00 PM IST";

        if (heroBadgeLabel) heroBadgeLabel.textContent = "KEYJUTSU LAUNCHES IN";
        if (heroBadgeTime) heroBadgeTime.textContent = `${days}D ${hours}H ${minutes}M ${seconds}S`;

        allDownloadCTAs.forEach(cta => {
            cta.classList.add("btn-disabled");
            cta.setAttribute("aria-disabled", "true");
            cta.setAttribute("title", "KeyJutsu launches September 3, 2026 at 5:00 PM IST");
            
            if (cta.id === "nav-download-btn") {
                cta.textContent = "LAUNCHING SOON";
            } else if (cta.id === "hero-download-btn") {
                cta.textContent = "LAUNCHING SEPT 3";
            } else if (cta.id === "placement-download-btn") {
                cta.textContent = "LAUNCHING SEPT 3";
            } else {
                cta.textContent = "DOWNLOAD AVAILABLE AT LAUNCH";
            }

            cta.removeAttribute("target");
            cta.removeAttribute("rel");
            cta.setAttribute("href", "#download");
            cta.removeEventListener("click", handleDisabledCTAClick);
            cta.addEventListener("click", handleDisabledCTAClick);
        });
    }

    function setLiveState() {
        isLaunched = true;

        if (countdownTimer) countdownTimer.style.display = "none";
        if (launchLiveStatus) launchLiveStatus.style.display = "inline-flex";

        if (downloadSectionLabel) downloadSectionLabel.textContent = "100% FREE GAME DOWNLOAD";
        if (downloadSectionTitle) downloadSectionTitle.textContent = "RISHU KEY JUTSU IS LIVE";

        if (heroBadgeLabel) heroBadgeLabel.textContent = "OFFICIAL RELEASE";
        if (heroBadgeTime) heroBadgeTime.textContent = "BY CODE WITH RISHABH";

        allDownloadCTAs.forEach(cta => {
            cta.classList.remove("btn-disabled");
            cta.removeAttribute("aria-disabled");
            cta.removeAttribute("title");
            
            if (cta.id === "nav-download-btn" || cta.id === "placement-download-btn") {
                cta.textContent = "DOWNLOAD FREE";
            } else {
                cta.textContent = "DOWNLOAD FREE FOR WINDOWS";
            }

            cta.setAttribute("href", ITCH_URL);
            cta.removeAttribute("target");
            cta.removeAttribute("rel");
            cta.removeEventListener("click", handleDisabledCTAClick);
        });
    }

    function updateCountdownState() {
        const now = Date.now();
        const diff = LAUNCH_TIMESTAMP - now;

        if (diff <= 0) {
            setLiveState();
            return false;
        } else {
            setPreLaunchState(diff);
            return true;
        }
    }

    if (allDownloadCTAs.length > 0) {
        const shouldContinue = updateCountdownState();
        if (shouldContinue) {
            const timerInterval = setInterval(() => {
                const keepGoing = updateCountdownState();
                if (!keepGoing) {
                    clearInterval(timerInterval);
                }
            }, 1000);
        }
    }
});

// 6. Legal Modal Helper Functions
function openLegalModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
}

function closeLegalModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
}
