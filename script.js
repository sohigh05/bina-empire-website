/* ==========================================================
   BINA EMPIRE ENTERPRISE - FUNGSI INTERAKTIF
   JavaScript digunakan untuk menu, animasi, kesan 3D dan modal.
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    /* ======================================================
       1. TETAPAN MASA DAN ELEMEN UTAMA
       Semua tempoh menggunakan unit milisaat (ms).
       ====================================================== */
    const animationTime = {
        openingScreen: 2850,
        sectionChange: 980,
        transitionEnd: 1820,
        counter: 1300,
        modalReset: 350,
        audioFade: 1200
    };

    const body = document.body;
    const loader = document.getElementById("loader");
    const header = document.getElementById("siteHeader");
    const menuButton = document.getElementById("menuButton");
    const mobileMenu = document.getElementById("mobileMenu");
    const cursorGlow = document.getElementById("cursorGlow");
    const pageTransition = document.getElementById("pageTransition");
    const transitionLabel = document.getElementById("transitionLabel");
    const backgroundMusic = document.getElementById("backgroundMusic");
    const musicToggle = document.getElementById("musicToggle");
    const musicStatus = document.getElementById("musicStatus");
    let transitionRunning = false;
    let audioFadeFrame;
    let userPausedAudio = false;

    /* ======================================================
       2. SKRIN PEMBUKAAN DAN NAVIGASI
       ====================================================== */
    window.addEventListener("load", () => {
        window.setTimeout(() => {
            loader.classList.add("is-hidden");
        }, animationTime.openingScreen);
    });

    /* ======================================================
       3. MUZIK LATAR DAN KAWALAN AUDIO
       Audio dimainkan perlahan supaya tidak mengganggu bacaan.
       ====================================================== */
    const updateMusicButton = (isPlaying) => {
        if (isPlaying) {
            musicToggle.classList.add("is-ready");
        }

        musicToggle.classList.toggle("is-playing", isPlaying);
        musicToggle.setAttribute("aria-pressed", String(isPlaying));
        musicToggle.setAttribute("aria-label", isPlaying
            ? "Hentikan muzik latar"
            : "Muzik latar telah dihentikan");
        musicStatus.textContent = isPlaying ? "Rentak Pendekar" : "Muzik dihentikan";
    };

    const fadeMusicTo = (targetVolume) => {
        cancelAnimationFrame(audioFadeFrame);

        const startVolume = backgroundMusic.volume;
        const startTime = performance.now();

        const changeVolume = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / animationTime.audioFade, 1);
            backgroundMusic.volume = startVolume + ((targetVolume - startVolume) * progress);

            if (progress < 1) {
                audioFadeFrame = requestAnimationFrame(changeVolume);
            }
        };

        audioFadeFrame = requestAnimationFrame(changeVolume);
    };

    const playBackgroundMusic = async () => {
        /* Elakkan fungsi dimulakan semula jika audio sedang dimainkan. */
        if (!backgroundMusic.paused) {
            updateMusicButton(true);
            return;
        }

        try {
            backgroundMusic.volume = 0;
            await backgroundMusic.play();
            fadeMusicTo(0.14);
            updateMusicButton(true);
            removeFirstInteractionListeners();
        } catch (error) {
            updateMusicButton(false);
        }
    };

    const startMusicOnFirstInteraction = (event) => {
        if (event.target.closest("#musicToggle")) return;
        playBackgroundMusic();
    };

    const removeFirstInteractionListeners = () => {
        document.removeEventListener("pointerdown", startMusicOnFirstInteraction);
        document.removeEventListener("keydown", startMusicOnFirstInteraction);
    };

    document.addEventListener("pointerdown", startMusicOnFirstInteraction);
    document.addEventListener("keydown", startMusicOnFirstInteraction);

    /* Cubaan pertama dibuat terus selepas struktur halaman tersedia. */
    playBackgroundMusic();

    /* Cuba semula sebaik sahaja pelayar mengesahkan audio boleh dimainkan. */
    backgroundMusic.addEventListener("canplay", () => {
        if (!userPausedAudio) {
            playBackgroundMusic();
        }
    }, { once: true });

    backgroundMusic.addEventListener("loadeddata", () => {
        if (!userPausedAudio) {
            playBackgroundMusic();
        }
    }, { once: true });

    musicToggle.addEventListener("click", () => {
        if (backgroundMusic.paused) return;

        backgroundMusic.pause();
        userPausedAudio = true;
        updateMusicButton(false);
        musicToggle.disabled = true;
    });

    /* Cuba sekali lagi selepas opening; pelayar mungkin meminta interaksi pengguna. */
    window.setTimeout(playBackgroundMusic, animationTime.openingScreen + 150);

    /* Cuba semula apabila halaman dipulihkan daripada cache pelayar. */
    window.addEventListener("pageshow", () => {
        playBackgroundMusic();
    });

    /* Sambung semula apabila pengguna kembali ke tab website. */
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && backgroundMusic.paused && !userPausedAudio) {
            playBackgroundMusic();
        }
    });

    /* Menukar rupa navigasi semasa halaman diskrol */
    const updateHeader = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 30);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    /* Membuka dan menutup menu versi telefon bimbit */
    const toggleMenu = () => {
        const menuIsOpen = mobileMenu.classList.toggle("is-open");

        menuButton.classList.toggle("is-active", menuIsOpen);
        menuButton.setAttribute("aria-expanded", String(menuIsOpen));
        mobileMenu.setAttribute("aria-hidden", String(!menuIsOpen));
        body.classList.toggle("menu-open", menuIsOpen);
    };

    menuButton.addEventListener("click", toggleMenu);

    mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", toggleMenu);
    });

    /* Transisi logo semasa pengguna memilih bahagian lain */
    const sectionNames = {
        utama: "Halaman Utama",
        tentang: "Tentang Bina Empire",
        kepakaran: "Bidang Kepakaran",
        nilai: "Visi & Nilai Teras",
        projek: "Projek & Pengalaman",
        dokumen: "Dokumen Rasmi",
        hubungi: "Hubungi Kami"
    };

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href").slice(1);
            const targetSection = document.getElementById(targetId);

            if (!targetSection) return;

            /* Menghalang klik berulang ketika animasi masih berjalan. */
            if (transitionRunning) {
                event.preventDefault();
                return;
            }

            event.preventDefault();
            transitionRunning = true;
            transitionLabel.textContent = sectionNames[targetId] || "Bina Empire Enterprise";
            pageTransition.classList.remove("is-leaving");
            pageTransition.classList.add("is-entering");
            pageTransition.setAttribute("aria-hidden", "false");

            window.setTimeout(() => {
                targetSection.scrollIntoView({ behavior: "auto", block: "start" });
                history.replaceState(null, "", `#${targetId}`);
                pageTransition.classList.remove("is-entering");
                pageTransition.classList.add("is-leaving");
            }, animationTime.sectionChange);

            window.setTimeout(() => {
                pageTransition.classList.remove("is-leaving");
                pageTransition.setAttribute("aria-hidden", "true");
                transitionRunning = false;
            }, animationTime.transitionEnd);
        });
    });

    /* Menutup menu jika tablet dipusing atau skrin dibesarkan semula */
    window.addEventListener("resize", () => {
        if (window.innerWidth > 1050 && mobileMenu.classList.contains("is-open")) {
            toggleMenu();
        }
    });

    /* ======================================================
       4. EFEK MOTION, PARALLAX DAN KAD 3D
       ====================================================== */
    /* Cahaya lembut yang mengikut pergerakan tetikus. */
    window.addEventListener("pointermove", (event) => {
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
    }, { passive: true });

    /* Parallax berlapis memberi ilusi ruang 3D mengikut posisi tetikus */
    const motionScene = document.getElementById("motionScene");

    if (motionScene && window.matchMedia("(pointer: fine)").matches) {
        const motionLayers = motionScene.querySelectorAll("[data-depth]");

        window.addEventListener("pointermove", (event) => {
            const mouseX = event.clientX / window.innerWidth - 0.5;
            const mouseY = event.clientY / window.innerHeight - 0.5;

            motionLayers.forEach((layer) => {
                const depth = Number(layer.dataset.depth);
                const moveX = mouseX * depth;
                const moveY = mouseY * depth;

                layer.style.translate = `${moveX}px ${moveY}px`;
            });
        }, { passive: true });
    }

    /* Pergerakan skrol perlahan pada visual hero dan kolaj projek */
    const scrollMotionElements = document.querySelectorAll(".hero-card, .project-collage");
    let scrollTicking = false;

    const updateScrollMotion = () => {
        scrollMotionElements.forEach((element) => {
            const area = element.getBoundingClientRect();
            const screenCentre = window.innerHeight / 2;
            const distance = (area.top + area.height / 2 - screenCentre) / window.innerHeight;
            const offset = Math.max(-18, Math.min(18, distance * -22));

            element.style.setProperty("--scroll-shift", `${offset}px`);
        });

        scrollTicking = false;
    };

    window.addEventListener("scroll", () => {
        if (!scrollTicking) {
            requestAnimationFrame(updateScrollMotion);
            scrollTicking = true;
        }
    }, { passive: true });

    updateScrollMotion();

    /* ======================================================
       5. ANIMASI KANDUNGAN DAN NOMBOR STATISTIK
       ====================================================== */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;

                window.setTimeout(() => {
                    entry.target.classList.add("is-visible");
                }, Number(delay));

                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.14 });

    document.querySelectorAll(".reveal").forEach((element) => {
        revealObserver.observe(element);
    });

    /* Animasi nombor statistik */
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const counter = entry.target;
            const target = Number(counter.dataset.target);
            const prefix = counter.dataset.prefix || "";
            const suffix = counter.dataset.suffix || "";
            const duration = animationTime.counter;
            const startingTime = performance.now();

            const countUp = (currentTime) => {
                const progress = Math.min((currentTime - startingTime) / duration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const value = Math.floor(target * easedProgress);

                counter.textContent = `${prefix}${value.toLocaleString("ms-MY")}${suffix}`;

                if (progress < 1) requestAnimationFrame(countUp);
            };

            requestAnimationFrame(countUp);
            counterObserver.unobserve(counter);
        });
    }, { threshold: 0.6 });

    document.querySelectorAll(".counter").forEach((counter) => {
        counterObserver.observe(counter);
    });

    /* Kesan kad 3D apabila tetikus bergerak di atas kad */
    if (window.matchMedia("(pointer: fine)").matches) {
        document.querySelectorAll(".tilt-card").forEach((card) => {
            card.addEventListener("mousemove", (event) => {
                const area = card.getBoundingClientRect();
                const x = (event.clientX - area.left) / area.width - 0.5;
                const y = (event.clientY - area.top) / area.height - 0.5;
                const isHero = card.id === "heroCard";
                const rotateAmount = isHero ? 13 : 4;

                card.style.transform = `rotateY(${x * rotateAmount}deg) rotateX(${-y * rotateAmount}deg)`;
            });

            card.addEventListener("mouseleave", () => {
                card.style.transform = card.id === "heroCard"
                    ? "rotateY(-10deg) rotateX(4deg)"
                    : "rotateY(0deg) rotateX(0deg)";
            });
        });
    }

    /* ======================================================
       6. PENUNJUK BAHAGIAN AKTIF
       ====================================================== */
    const pageSections = document.querySelectorAll("main section[id]");
    const desktopLinks = document.querySelectorAll(".desktop-nav a");

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            desktopLinks.forEach((link) => {
                const activeSection = link.getAttribute("href") === `#${entry.target.id}`;
                link.classList.toggle("is-active", activeSection);
            });
        });
    }, { rootMargin: "-35% 0px -55% 0px" });

    pageSections.forEach((section) => sectionObserver.observe(section));

    /* ======================================================
       7. MODAL DOKUMEN RASMI
       ====================================================== */
    const modal = document.getElementById("documentModal");
    const modalImage = document.getElementById("modalImage");
    const modalTitle = document.getElementById("modalTitle");
    const modalClose = document.getElementById("modalClose");
    const modalDocument = document.getElementById("modalDocument");

    const openDocument = (button) => {
        const source = button.dataset.document;
        const title = button.dataset.title;

        modalImage.src = source;
        modalImage.alt = title;
        modalTitle.textContent = title;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        body.classList.add("modal-open");
        modalClose.focus();
    };

    const closeDocument = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        body.classList.remove("modal-open");

        window.setTimeout(() => {
            modalImage.removeAttribute("src");
        }, animationTime.modalReset);
    };

    document.querySelectorAll(".document-card").forEach((button) => {
        button.addEventListener("click", () => openDocument(button));
    });

    modalClose.addEventListener("click", closeDocument);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("is-open")) {
            closeDocument();
        }
    });

    /* Menghalang tindakan asas salin, seret dan menu klik kanan pada dokumen */
    modalDocument.addEventListener("contextmenu", (event) => event.preventDefault());
    modalDocument.addEventListener("dragstart", (event) => event.preventDefault());
    modalDocument.addEventListener("copy", (event) => event.preventDefault());

    /* ======================================================
       8. MAKLUMAT KAKI LAMAN
       ====================================================== */
    document.getElementById("currentYear").textContent = new Date().getFullYear();
});
