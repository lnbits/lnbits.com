// ===== Landing page behaviors (moved from index.html) =====
window.addEventListener("DOMContentLoaded", () => {
  (function initHeroTextFit() {
    const intro = document.querySelector(".ln-hero-intro");
    const title = intro ? intro.querySelector(".ud-hero-title") : null;
    const desc = intro ? intro.querySelector(".ud-hero-desc") : null;
    if (!intro || !title || !desc) {
      return;
    }

    function fitElement(element, cssVar, maxPx, minPx) {
      document.documentElement.style.setProperty(cssVar, maxPx + "px");
      if (window.innerWidth <= 767) {
        document.documentElement.style.removeProperty(cssVar);
        return;
      }

      let size = maxPx;
      while (element.scrollWidth > element.clientWidth && size > minPx) {
        size -= 1;
        document.documentElement.style.setProperty(cssVar, size + "px");
      }
    }

    function fitHeroText() {
      fitElement(title, "--ln-hero-title-size", 57.6, 36);
      fitElement(desc, "--ln-hero-desc-size", 48, 28);
    }

    fitHeroText();
    window.addEventListener("resize", fitHeroText);

    if (window.LNbitsI18n && typeof window.LNbitsI18n.onChange === "function") {
      window.LNbitsI18n.onChange(() => {
        window.requestAnimationFrame(fitHeroText);
      });
    }
  })();

  // ==== for menu scroll
  const pageLink = document.querySelectorAll(".ud-menu-scroll");

  pageLink.forEach((elem) => {
    elem.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector(elem.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
        offsetTop: 1 - 60,
      });
    });
  });

  // section menu active
  function onScroll() {
    const sections = document.querySelectorAll(".ud-menu-scroll");
    const scrollPos =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;

    for (let i = 0; i < sections.length; i++) {
      const currLink = sections[i];
      const val = currLink.getAttribute("href");
      const refElement = document.querySelector(val);
      const scrollTopMinus = scrollPos + 73;
      if (
        refElement &&
        refElement.offsetTop <= scrollTopMinus &&
        refElement.offsetTop + refElement.offsetHeight > scrollTopMinus
      ) {
        document
          .querySelector(".ud-menu-scroll")
          .classList.remove("active");
        currLink.classList.add("active");
      } else {
        currLink.classList.remove("active");
      }
    }
  }

  window.document.addEventListener("scroll", onScroll);

  (function initHeroRotation() {
    const heroSlides = [
      {
        id: "slide1",
        img: "assets/images/hero/bitcoin-accounts.png",
        embedLink: "b7Ou7XtqtRI",
        titleKey: "hero.slide1.title",
        timeKey: "hero.slide1.time",
        titleFallback: "User/Wallet System",
        timeFallback: "(43 secs)"
      },
      {
        id: "slide2",
        img: "assets/images/hero/bitcoin-extensions.png",
        embedLink: "ymq_BXN4lu0",
        titleKey: "hero.slide2.title",
        timeKey: "hero.slide2.time",
        titleFallback: "50+ Extensions",
        timeFallback: "(38 secs)"
      },
      {
        id: "slide3",
        img: "assets/images/hero/lnbits-node-management.png",
        embedLink: "LMs4bFrvy_Y",
        titleKey: "hero.slide3.title",
        timeKey: "hero.slide3.time",
        titleFallback: "Admin Tooling",
        timeFallback: "(48 secs)"
      },
      {
        id: "slide4",
        img: "assets/images/hero/lnbits-api-sdk.png",
        embedLink: "b1a5XshX5dA",
        titleKey: "hero.slide4.title",
        timeKey: "hero.slide4.time",
        titleFallback: "Supercharged API/SDK",
        timeFallback: "(38 secs)"
      }
    ];

    let heroIndex = 0;
    let heroTimer = null;
    let videoDialogOpen = false;

    const tiles = Array.from(document.querySelectorAll(".ln-btn-tile"));

    function t(key, fallback) {
      const i18n = window.LNbitsI18n;
      if (!i18n || typeof i18n.t !== "function") {
        return fallback || key;
      }
      const value = i18n.t(key);
      return value || fallback || key;
    }

    function getHeroProxy() {
      const root = document.querySelector("#q-app");
      if (!root || !root.__vue_app__ || !root.__vue_app__._instance) {
        return null;
      }
      return root.__vue_app__._instance.proxy || null;
    }

    function stopHeroRotation() {
      if (!heroTimer) {
        return;
      }
      clearInterval(heroTimer);
      heroTimer = null;
    }

    function applyHeroSlide(index, pause) {
      if (videoDialogOpen) {
        if (pause) {
          stopHeroRotation();
        }
        return true;
      }
      if (tiles[index]) {
        tiles[index].dispatchEvent(new Event("mouseover", { bubbles: true }));
        if (pause) {
          stopHeroRotation();
        }
        return true;
      }
      const vm = getHeroProxy();
      if (!vm || !heroSlides[index]) {
        return false;
      }
      const slide = heroSlides[index];
      vm.slideimg = slide.img;
      vm.embedLink = slide.embedLink;
      vm.vidtitle = t(slide.titleKey, slide.titleFallback);
      vm.vidtime = t(slide.timeKey, slide.timeFallback);
      if (pause) {
        stopHeroRotation();
      }
      return true;
    }

    function startHeroRotation() {
      if (heroTimer || videoDialogOpen) {
        return;
      }
      heroTimer = setInterval(() => {
        if (videoDialogOpen) {
          stopHeroRotation();
          return;
        }
        heroIndex = (heroIndex + 1) % heroSlides.length;
        applyHeroSlide(heroIndex, false);
      }, 5500);
    }

    const readyCheck = setInterval(() => {
      const hasProxy = applyHeroSlide(0, false);
      if (hasProxy) {
        clearInterval(readyCheck);
        startHeroRotation();
      }
    }, 200);

    tiles.forEach((tile) => {
      tile.addEventListener("mouseenter", () => stopHeroRotation());
      tile.addEventListener("mouseleave", () => {
        if (!videoDialogOpen) {
          startHeroRotation();
        }
      });
    });

    window.addEventListener("lnbits-video-dialog", (event) => {
      videoDialogOpen = Boolean(event && event.detail && event.detail.isOpen);
      if (videoDialogOpen) {
        stopHeroRotation();
        return;
      }
      startHeroRotation();
    });

    if (window.LNbitsI18n && typeof window.LNbitsI18n.onChange === "function") {
      window.LNbitsI18n.onChange(() => {
        applyHeroSlide(heroIndex, false);
      });
    }
  })();

  (function initContributorsMarquee() {
    const track = document.getElementById("ln-contrib-track");
    const metrics = document.getElementById("ln-repo-metrics");
    if (!track) {
      return;
    }

    const metricsState = {
      stars: null,
      forks: null,
      contributors: null
    };
    const cacheTtlMs = 30 * 60 * 1000;
    const repoCacheKey = "lnbits-github-repo-cache";
    const contributorsCacheKey = "lnbits-github-contributors-cache";
    let contributorsRendered = false;

    function formatCount(value) {
      if (typeof value !== "number") {
        return "0";
      }
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
      }
      if (value >= 1000) {
        return (value / 1000).toFixed(1).replace(/\.0$/, "") + "k";
      }
      return String(value);
    }

    function setMetricsText(stars, forks, contributors) {
      if (!metrics) {
        return;
      }
      if (typeof stars === "number") {
        metricsState.stars = stars;
      }
      if (typeof forks === "number") {
        metricsState.forks = forks;
      }
      if (typeof contributors === "number") {
        metricsState.contributors = contributors;
      }

      const starsText = formatCount(metricsState.stars);
      const forksText = formatCount(metricsState.forks);
      const contributorsText = formatCount(metricsState.contributors);

      const i18n = window.LNbitsI18n;
      const translatedLabel = i18n && typeof i18n.t === "function"
        ? i18n.t("contributors.label")
        : "";
      const contributorsLabel = translatedLabel || "Contributors";

      metrics.innerHTML =
        "<span class=\"ln-metric\"><i class=\"lni lni-star-filled\"></i>" + starsText + "</span>" +
        "<span>|</span>" +
        "<span class=\"ln-metric\"><i class=\"lni lni-network\"></i>" + forksText + "</span>" +
        "<span>|</span>" +
        "<span class=\"ln-metric\">" + contributorsLabel + ":</span>";
    }

    function renderContributors(items) {
      if (contributorsRendered || !Array.isArray(items) || items.length === 0) {
        return;
      }
      contributorsRendered = true;

      const fragment = document.createDocumentFragment();
      items.forEach((item) => {
        const link = document.createElement("a");
        link.className = "ln-contrib-link";
        link.href = item.avatar_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.title = item.login;

        const img = document.createElement("img");
        img.className = "ln-contrib-avatar";
        img.src = item.avatar_url;
        img.alt = item.login + " avatar";
        img.loading = "lazy";
        img.decoding = "async";

        link.appendChild(img);
        fragment.appendChild(link);
      });

      track.appendChild(fragment);

      // Duplicate for smooth infinite scroll.
      items.forEach((item) => {
        const link = document.createElement("a");
        link.className = "ln-contrib-link";
        link.href = item.avatar_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.title = item.login;

        const img = document.createElement("img");
        img.className = "ln-contrib-avatar";
        img.src = item.avatar_url;
        img.alt = item.login + " avatar";
        img.loading = "lazy";
        img.decoding = "async";

        link.appendChild(img);
        fragment.appendChild(link);
      });

      track.appendChild(fragment);

      function parseDuration(value) {
        if (!value) {
          return null;
        }
        const trimmed = value.trim();
        if (!trimmed) {
          return null;
        }
        if (trimmed.endsWith("ms")) {
          return parseFloat(trimmed) / 1000;
        }
        if (trimmed.endsWith("s")) {
          return parseFloat(trimmed);
        }
        return parseFloat(trimmed);
      }

      function applyContribSpeed(seconds) {
        if (!seconds || Number.isNaN(seconds)) {
          return;
        }
        const slower = seconds * 1.5;
        track.style.animationDuration = slower + "s";
      }

      let duration = null;
      const rootValue = window.getComputedStyle(document.documentElement)
        .getPropertyValue("--extensions-scroll-duration");
      duration = parseDuration(rootValue);

      if (!duration) {
        duration = Math.max(40, items.length * 1.1);
      }
      applyContribSpeed(duration);

      window.addEventListener("extensions-scroll-duration", (event) => {
        if (event && event.detail && typeof event.detail.duration === "number") {
          applyContribSpeed(event.detail.duration);
        }
      });
    }

    function loadCache(key) {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) {
          return null;
        }
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") {
          return null;
        }
        return parsed;
      } catch (_error) {
        return null;
      }
    }

    function saveCache(key, data) {
      try {
        window.localStorage.setItem(key, JSON.stringify({
          timestamp: Date.now(),
          data: data
        }));
      } catch (_error) {
        // Ignore storage failures.
      }
    }

    function isFresh(entry) {
      return !!entry &&
        typeof entry.timestamp === "number" &&
        (Date.now() - entry.timestamp) < cacheTtlMs;
    }

    function applyRepoData(repo) {
      if (!repo) {
        return;
      }
      setMetricsText(repo.stargazers_count, repo.forks_count);
    }

    function applyContributorsData(data) {
      const contributors = Array.isArray(data) ? data : [];
      if (contributors.length === 0) {
        return;
      }
      setMetricsText(undefined, undefined, contributors.length);
      renderContributors(contributors);
    }

    const cachedRepo = loadCache(repoCacheKey);
    const cachedContributors = loadCache(contributorsCacheKey);

    if (cachedRepo && cachedRepo.data) {
      applyRepoData(cachedRepo.data);
    }

    if (cachedContributors && cachedContributors.data) {
      applyContributorsData(cachedContributors.data);
    }

    if (!isFresh(cachedRepo)) {
      fetch("https://api.github.com/repos/lnbits/lnbits", {
        headers: {
          "Accept": "application/vnd.github+json"
        }
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((repo) => {
          if (!repo) {
            return;
          }
          saveCache(repoCacheKey, repo);
          applyRepoData(repo);
        })
        .catch(() => {
          if (cachedRepo && cachedRepo.data) {
            applyRepoData(cachedRepo.data);
          }
        });
    }

    if (!isFresh(cachedContributors)) {
      fetch("https://api.github.com/repos/lnbits/lnbits/contributors?per_page=100", {
        headers: {
          "Accept": "application/vnd.github+json"
        }
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          const contributors = Array.isArray(data) ? data : [];
          if (contributors.length === 0) {
            return;
          }
          saveCache(contributorsCacheKey, contributors);
          applyContributorsData(contributors);
        })
        .catch(() => {
          if (cachedContributors && cachedContributors.data) {
            applyContributorsData(cachedContributors.data);
          }
        });
    }

    if (window.LNbitsI18n && typeof window.LNbitsI18n.onChange === "function") {
      window.LNbitsI18n.onChange(() => {
        setMetricsText(metricsState.stars, metricsState.forks, metricsState.contributors);
      });
    }
  })();
});
