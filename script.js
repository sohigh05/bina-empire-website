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

    /* Safari pada iPadOS boleh melaporkan dirinya seperti komputer Mac. */
    const isAppleTouchDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent)
        || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

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
            /* Cap masa bingkai boleh sedikit lebih awal daripada masa mula. */
            const progress = Math.max(0, Math.min((currentTime - startTime) / animationTime.audioFade, 1));
            const nextVolume = startVolume + ((targetVolume - startVolume) * progress);
            backgroundMusic.volume = Math.max(0, Math.min(nextVolume, 1));

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
            /*
             * iPadOS tidak menyokong kawalan volum JavaScript dengan konsisten.
             * Untuk peranti Apple bersentuh, audio dimainkan terus tanpa fade.
             */
            if (!isAppleTouchDevice) {
                backgroundMusic.volume = 0;
            }

            await backgroundMusic.play();

            if (!isAppleTouchDevice) {
                fadeMusicTo(0.14);
            }

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
        document.removeEventListener("touchstart", startMusicOnFirstInteraction);
        document.removeEventListener("touchend", startMusicOnFirstInteraction);
        document.removeEventListener("click", startMusicOnFirstInteraction);
        document.removeEventListener("keydown", startMusicOnFirstInteraction);
    };

    document.addEventListener("pointerdown", startMusicOnFirstInteraction);
    document.addEventListener("touchstart", startMusicOnFirstInteraction, { passive: true });
    document.addEventListener("touchend", startMusicOnFirstInteraction, { passive: true });
    document.addEventListener("click", startMusicOnFirstInteraction);
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
       7. DIREKTORI DAN MODAL SUBPROJEK
       Kandungan disimpan dalam objek supaya mudah dikemas kini.
       ====================================================== */
    const projectData = {
        it: {
            number: "01", symbol: "⌘", category: "Teknologi Maklumat", title: "IT", intro: "",
            status: "Teknologi Maklumat", location: "Nor Azila Binti Aznam", phase: "Eksekutif Projek",
            overview: "", scope: [], value: "",
            note: "Pelatih Industri: Nik Muhammad Suhail Bin Nik Othman; Firdaus Sim Chong Fei."
        },
        kantin: {
            number: "02", symbol: "◫", category: "Operasi Institusi", title: "Bina Empire Kantin SMK Jati",
            intro: "", status: "", location: "", phase: "", overview: "", scope: [], value: "", note: ""
        },
        construction: {
            number: "03", symbol: "△", category: "Pembinaan", title: "Construction", intro: "",
            status: "Pembinaan", location: "Muhammad Aqil Zarif Bin Zainal Abidin", phase: "Penyelia",
            overview: "Menurap Semula Jalan di Jalan Pinggiran Perpaduan 2, Taman U.K Raya, Majlis Bandaraya Ipoh. Penyelenggaraan Jalan di Jalan Regat Kangsar 3, Jalan Pari Baru 1 dan Sekitar, Ipoh, Majlis Bandaraya Ipoh.",
            scope: ["Kerja menurap semula jalan serta kerja-kerja berkaitan.", "Kerja penyelenggaraan jalan serta kerja-kerja berkaitan."],
            value: "6 Julai - 4 Ogos 2026 (4 minggu); 6 Julai - 3 Ogos 2026 (4 minggu).", note: ""
        },
        agro: {
            number: "04", symbol: "♧", category: "Agro & Farm", title: "Agro & Farm", intro: "",
            status: "Agro & Farm", location: "Muhamad Afendi Bin Ahmad", phase: "Penyelia",
            overview: "Pelantikan sebagai Pembekal Lembu Korban bagi Program Ibadah Korban Sumbangan Kerajaan Negeri Perak Tahun 2025 dan Tahun 2026 - Kerajaan Negeri Perak / Pejabat Menteri Besar Perak.",
            scope: ["Pembekalan lembu korban."], value: "2025; 2026", note: ""
        },
        fnb: {
            number: "05", symbol: "◇", category: "Makanan & Minuman", title: "F&B", intro: "",
            status: "Makanan & Minuman", location: "Farhanah Binti Firdaus Francis", phase: "Eksekutif Projek",
            overview: "Kafeteria Kelab Golf Kinta; Beribu Bintang Cafe; Perkhidmatan Katering.",
            scope: ["Pengurusan dan operasi kafeteria.", "Operasi kafe dan penyediaan makanan serta minuman.", "Penyediaan makanan untuk majlis dan acara."],
            value: "2022 - 2025; 2024 - Kini; 2026 - Kini", note: ""
        },
        "secret-pastry": {
            number: "06", symbol: "✦", category: "Secret Pastry & Coffee", title: "Secret Pastry & Coffee",
            intro: "", status: "Secret Pastry & Coffee", location: "Muhammad Hanif Bin Zamail",
            phase: "Pengurus", overview: "", scope: [], value: "", note: "Penyelia: Nur Maisarah Binti Rosidi."
        }
    };

    /*
     * Masukkan laluan foto sebenar di sini apabila foto rasmi diterima.
     * Nama mesti sama seperti dalam profil supaya potret tidak tersalah orang.
     * Contoh: "Nama Penuh": "assets/images/personel/nama.jpg"
     */
    const staffPhotos = {
        "Ir. Ts. Saiful Azzuan Bin Aznam": "assets/images/saiful-azzuan-bin-aznam.jpg",
        "Muhamad Saiful Ilman Bin Aznam": "assets/images/muhamad-saiful-ilman.jpg",
        "Nik Muhammad Suhail Bin Nik Othman": "assets/images/nik-muhammad-suhail.png",
        "Muhammad Aqil Zarif Bin Zainal Abidin": "assets/images/muhammad-aqil-zarif.jpg",
        "Firdaus Sim Chong Fei": "assets/images/firdaus-sim-chong-fei.jpg",
        "Nur Maisarah Binti Rosidi": "assets/images/nur-maisarah-binti-rosidi.jpg",
        "Muhammad Hanif Bin Zamail": "assets/images/muhammad-hanif-bin-zamail.png",
        "Nuur Lisa Izzati Binti Ahmad": "assets/images/nuur-lisa-izzati-binti-ahmad.png"
    };
    const placeholderPortrait = "assets/images/portrait-placeholder.svg";

    const createPortrait = (name) => {
        const frame = document.createElement("span");
        const photo = document.createElement("img");
        const label = document.createElement("span");

        frame.className = "person-portrait";
        photo.src = staffPhotos[name] || placeholderPortrait;
        photo.alt = staffPhotos[name] ? `Potret ${name}` : `Ruang foto rasmi${name ? ` ${name}` : ""}`;
        photo.loading = "lazy";
        label.className = "portrait-label";
        label.textContent = staffPhotos[name] ? "" : "Ruang foto";
        frame.append(photo, label);
        return frame;
    };

    /* Bingkai foto untuk setiap individu, termasuk penyelia dan pelatih. */
    document.querySelectorAll(".org-card, .org-subordinate").forEach((card) => {
        const name = card.querySelector(":scope > h3, :scope > p").textContent.trim();
        card.prepend(createPortrait(name));
    });

    document.querySelectorAll(".subproject-card").forEach((card) => {
        const project = projectData[card.dataset.project];
        const person = document.createElement("span");
        person.className = "project-person-preview";
        person.append(createPortrait(project.location));
        card.insertBefore(person, card.querySelector(".subproject-open"));
        card.setAttribute("aria-haspopup", "dialog");
        card.setAttribute("aria-controls", "projectModal");
    });

    /* Foto sedia ada dipadankan hanya dengan kategori projeknya. */
    const projectPhotos = {
        agro: [1, 2, 3, 4, 5, 6].map((number) => ({
            src: `assets/images/projek-${String(number).padStart(2, "0")}.jpg`,
            caption: `Agro & Farm · Foto ${String(number).padStart(2, "0")}`
        }))
    };

    const photoViewer = document.getElementById("photoViewer");
    const viewerImage = document.getElementById("photoViewerImage");
    const gallery = document.getElementById("projectGallery");
    let activePhotos = [];
    let activePhotoIndex = 0;
    let galleryTrigger;
    let projectTrigger;
    let backgroundElements = [];

    const showPhoto = (index) => {
        activePhotoIndex = (index + activePhotos.length) % activePhotos.length;
        const photo = activePhotos[activePhotoIndex];
        viewerImage.src = photo.src;
        viewerImage.alt = photo.caption;
        document.getElementById("photoViewerCount").textContent = `${activePhotoIndex + 1} / ${activePhotos.length}`;
        document.getElementById("photoViewerCaption").textContent = photo.caption;
    };

    const openPhoto = (index, trigger) => {
        galleryTrigger = trigger;
        showPhoto(index);
        photoViewer.showModal();
        document.getElementById("photoViewerClose").focus();
    };

    document.getElementById("photoViewerClose").addEventListener("click", () => photoViewer.close());
    document.getElementById("photoPrevious").addEventListener("click", () => showPhoto(activePhotoIndex - 1));
    document.getElementById("photoNext").addEventListener("click", () => showPhoto(activePhotoIndex + 1));
    photoViewer.addEventListener("close", () => galleryTrigger?.focus({ preventScroll: true }));
    photoViewer.addEventListener("keydown", (event) => {
        event.stopPropagation();
        if (event.key === "ArrowLeft") showPhoto(activePhotoIndex - 1);
        if (event.key === "ArrowRight") showPhoto(activePhotoIndex + 1);
    });

    /* Leretan mendatar menukar foto pada telefon dan tablet. */
    let photoTouchStart = null;
    viewerImage.addEventListener("touchstart", (event) => {
        photoTouchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true });
    viewerImage.addEventListener("touchend", (event) => {
        if (!photoTouchStart) return;
        const dx = event.changedTouches[0].clientX - photoTouchStart.x;
        const dy = event.changedTouches[0].clientY - photoTouchStart.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            showPhoto(activePhotoIndex + (dx < 0 ? 1 : -1));
        }
        photoTouchStart = null;
    }, { passive: true });

    const renderGallery = (projectKey) => {
        activePhotos = projectPhotos[projectKey] || [];
        gallery.replaceChildren();
        document.getElementById("projectGalleryCount").textContent = activePhotos.length
            ? `${activePhotos.length} foto · Tekan untuk lihat` : "Ruang gambar projek";

        activePhotos.forEach((photo, index) => {
            const button = document.createElement("button");
            const img = document.createElement("img");
            const caption = document.createElement("span");
            button.type = "button";
            button.className = "project-photo-button";
            button.setAttribute("aria-label", `Buka ${photo.caption}`);
            button.setAttribute("aria-haspopup", "dialog");
            img.src = photo.src;
            img.alt = photo.caption;
            img.loading = "lazy";
            caption.textContent = `${String(index + 1).padStart(2, "0")} ↗`;
            button.append(img, caption);
            button.addEventListener("click", () => openPhoto(index, button));
            gallery.append(button);
        });

        if (!activePhotos.length) {
            const empty = document.createElement("p");
            empty.className = "gallery-empty";
            empty.textContent = "Gambar projek belum ditambah.";
            gallery.append(empty);
        }
    };

    const projectModal = document.getElementById("projectModal");
    const projectModalClose = document.getElementById("projectModalClose");
    const projectFields = {
        number: document.getElementById("projectModalNumber"),
        symbol: document.getElementById("projectModalSymbol"),
        category: document.getElementById("projectModalCategory"),
        title: document.getElementById("projectModalTitle"),
        intro: document.getElementById("projectModalIntro"),
        status: document.getElementById("projectModalStatus"),
        location: document.getElementById("projectModalLocation"),
        phase: document.getElementById("projectModalPhase"),
        overview: document.getElementById("projectModalOverview"),
        scope: document.getElementById("projectModalScope"),
        value: document.getElementById("projectModalValue"),
        note: document.getElementById("projectModalNote")
    };

    const openProject = (projectKey, trigger) => {
        const project = projectData[projectKey];
        if (!project) return;
        projectTrigger = trigger;

        Object.keys(projectFields).forEach((field) => {
            if (field !== "scope") projectFields[field].textContent = project[field] || "";
        });

        projectFields.scope.innerHTML = (project.scope || []).map((item) => `<li>${item}</li>`).join("");

        /* Sembunyikan petak tanpa data supaya maklumat profil kekal tepat. */
        ["overview", "scope", "value", "note"].forEach((field) => {
            const hasContent = field === "scope" ? project.scope.length > 0 : Boolean(project[field]);
            projectFields[field].closest("article").hidden = !hasContent;
        });
        const informationGrid = projectModal.querySelector(".project-information-grid");
        const visibleArticles = [...informationGrid.querySelectorAll("article:not([hidden])")];
        informationGrid.querySelectorAll("article").forEach(article => article.classList.remove("information-wide"));
        if (visibleArticles.length % 2 === 1) visibleArticles.at(-1).classList.add("information-wide");
        informationGrid.hidden = visibleArticles.length === 0;

        const leader = document.getElementById("projectLeader");
        const leaderName = document.createElement("h3");
        const leaderRole = document.createElement("small");
        leaderName.textContent = project.location;
        leaderRole.textContent = project.phase || "Ruang foto personel";
        leader.replaceChildren(createPortrait(project.location), leaderRole, leaderName);
        renderGallery(projectKey);

        /* Kekalkan fokus dalam dialog dan pulihkan keadaan asal selepas ditutup. */
        backgroundElements = [...body.children].filter((element) =>
            element !== projectModal && element !== photoViewer && !element.inert
        );
        backgroundElements.forEach((element) => { element.inert = true; });
        projectModal.classList.add("is-open");
        projectModal.setAttribute("aria-hidden", "false");
        body.classList.add("modal-open");
        projectModal.scrollTop = 0;
        projectModalClose.focus({ preventScroll: true });
    };

    const closeProject = () => {
        projectModal.classList.remove("is-open");
        projectModal.setAttribute("aria-hidden", "true");
        body.classList.remove("modal-open");
        backgroundElements.forEach((element) => { element.inert = false; });
        projectTrigger?.focus({ preventScroll: true });
    };

    document.querySelectorAll(".subproject-card").forEach((button) => {
        button.addEventListener("click", () => openProject(button.dataset.project, button));
    });

    projectModal.addEventListener("keydown", (event) => {
        if (event.key !== "Tab") return;
        const controls = [...projectModal.querySelectorAll("button, a[href]")];
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

    projectModalClose.addEventListener("click", closeProject);
    projectModal.addEventListener("click", (event) => {
        if (event.target === projectModal) closeProject();
    });

    /* ======================================================
       8. MODAL DOKUMEN RASMI
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
        if (event.key === "Escape" && projectModal.classList.contains("is-open")) {
            closeProject();
        }

        if (event.key === "Escape" && modal.classList.contains("is-open")) {
            closeDocument();
        }
    });

    /* Menghalang tindakan asas salin, seret dan menu klik kanan pada dokumen */
    modalDocument.addEventListener("contextmenu", (event) => event.preventDefault());
    modalDocument.addEventListener("dragstart", (event) => event.preventDefault());
    modalDocument.addEventListener("copy", (event) => event.preventDefault());

    /* ======================================================
       9. MAKLUMAT KAKI LAMAN
       ====================================================== */
    document.getElementById("currentYear").textContent = new Date().getFullYear();
});
