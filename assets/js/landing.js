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
    const heroSlides = ["slide1", "slide2", "slide3", "slide4"];

    let heroIndex = 0;
    let heroTimer = null;
    let videoDialogOpen = false;

    const tiles = Array.from(document.querySelectorAll(".ln-bootstrap-tile"));
    const extensionCountEls = Array.from(document.querySelectorAll("[data-extension-count]"));
    let extensionCount = null;

    function t(key, fallback) {
      const i18n = window.LNbitsI18n;
      if (!i18n || typeof i18n.t !== "function") {
        return fallback || key;
      }
      const value = i18n.t(key);
      return value || fallback || key;
    }

    function getHeroProxy() {
      return window.lnbitsLandingApp || null;
    }

    function buildExtensionTitle(count) {
      const fallback = count ? count + " Extensions" : "50+ Extensions";
      const baseTitle = t("hero.slide2.title", "50+ Extensions");
      if (!count) {
        return baseTitle || fallback;
      }
      if (baseTitle && /\d+\+?/.test(baseTitle)) {
        return baseTitle.replace(/\d+\+?/, String(count));
      }
      return fallback;
    }

    function applyExtensionCount(count) {
      if (typeof count !== "number" || count <= 0) {
        return;
      }
      extensionCount = count;
      const display = String(count);
      extensionCountEls.forEach((el) => {
        el.textContent = display;
      });

      const vm = getHeroProxy();
      const title = buildExtensionTitle(count);
      if (vm) {
        vm.dynamicExtensionTitle = title;
        if (vm.embedLink === "ymq_BXN4lu0") {
          vm.vidtitle = title;
        }
      }
    }

    function stopHeroRotation() {
      if (!heroTimer) {
        return;
      }
      clearTimeout(heroTimer);
      heroTimer = null;
    }

    function applyHeroSlide(index, pause) {
      if (videoDialogOpen) {
        if (pause) {
          stopHeroRotation();
        }
        return true;
      }
      const vm = getHeroProxy();
      const slideId = heroSlides[index];
      if (!vm || !slideId) {
        return false;
      }
      if (slideId === "slide2") {
        vm.dynamicExtensionTitle = vm.dynamicExtensionTitle || buildExtensionTitle(extensionCount);
      }
      vm.activateHeroSlide(slideId);
      if (pause) {
        stopHeroRotation();
      }
      return true;
    }

    function queueHeroRotation() {
      if (heroTimer || videoDialogOpen) {
        return;
      }
      heroTimer = setTimeout(() => {
        heroTimer = null;
        if (videoDialogOpen) {
          return;
        }
        heroIndex = (heroIndex + 1) % heroSlides.length;
        applyHeroSlide(heroIndex, false);
        queueHeroRotation();
      }, 5500);
    }

    function startHeroRotation() {
      if (videoDialogOpen) {
        return;
      }
      stopHeroRotation();
      queueHeroRotation();
    }

    const readyCheck = setInterval(() => {
      const hasProxy = applyHeroSlide(0, false);
      if (hasProxy) {
        if (extensionCount) {
          applyExtensionCount(extensionCount);
        }
        clearInterval(readyCheck);
        startHeroRotation();
      }
    }, 200);

    tiles.forEach((tile, index) => {
      const setCurrentIndex = () => {
        heroIndex = index;
      };
      tile.addEventListener("mouseenter", () => {
        setCurrentIndex();
        stopHeroRotation();
      });
      tile.addEventListener("focus", () => {
        setCurrentIndex();
        stopHeroRotation();
      });
      tile.addEventListener("click", setCurrentIndex);
      tile.addEventListener("mouseleave", () => {
        if (!videoDialogOpen) {
          startHeroRotation();
        }
      });
      tile.addEventListener("blur", () => {
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

    window.addEventListener("lnbits-extension-count", (event) => {
      const count = event && event.detail ? Number(event.detail.count) : NaN;
      if (!Number.isNaN(count)) {
        applyExtensionCount(count);
      }
    });

    if (window.LNbitsI18n && typeof window.LNbitsI18n.onChange === "function") {
      window.LNbitsI18n.onChange(() => {
        if (extensionCount) {
          applyExtensionCount(extensionCount);
        }
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

  (function initExtensionsWall() {
    const track = document.getElementById("ln-extensions-track");
    if (!track) {
      return;
    }

    const sourceUrl = "https://raw.githubusercontent.com/lnbits/lnbits-extensions/main/extensions.json";

    function normalizeVersion(version) {
      if (!version) {
        return "0.0.0";
      }
      return String(version).replace(/^v/i, "").trim();
    }

    function compareVersions(a, b) {
      const pa = normalizeVersion(a).split(".").map(Number);
      const pb = normalizeVersion(b).split(".").map(Number);

      for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
        const na = pa[i] || 0;
        const nb = pb[i] || 0;
        if (na !== nb) {
          return na - nb;
        }
      }

      return 0;
    }

    function pickLatestExtensions(list) {
      const byId = {};
      list.forEach((item) => {
        if (!item || !item.id) {
          return;
        }

        const current = byId[item.id];
        if (!current || compareVersions(item.version, current.version) >= 0) {
          byId[item.id] = item;
        }
      });

      return Object.keys(byId).map((key) => byId[key]);
    }

    function buildCard(ext) {
      const card = document.createElement("a");
      card.className = "ln-extension-card";
      card.href = "https://extensions.lnbits.com/" + encodeURIComponent(ext.id);
      card.target = "_blank";
      card.rel = "noopener noreferrer";

      const icon = document.createElement("div");
      icon.className = "ln-extension-card__icon";
      if (ext.icon) {
        const img = document.createElement("img");
        img.src = ext.icon;
        img.alt = ext.name || ext.id;
        img.loading = "lazy";
        img.decoding = "async";
        icon.appendChild(img);
      } else {
        icon.textContent = (ext.name || ext.id || "?").charAt(0).toUpperCase();
      }

      const text = document.createElement("div");
      text.className = "ln-extension-card__text";

      const name = document.createElement("div");
      name.className = "ln-extension-card__name";
      name.textContent = ext.name || ext.id;

      text.appendChild(name);
      card.appendChild(icon);
      card.appendChild(text);

      return card;
    }

    function buildTrack(extensions) {
      const inner = document.createElement("div");
      inner.className = "ln-extensions-wall__grid";
      extensions.forEach((ext) => {
        inner.appendChild(buildCard(ext));
      });

      const clone = inner.cloneNode(true);
      track.innerHTML = "";
      track.appendChild(inner);
      track.appendChild(clone);

      const cardCount = extensions.length || 1;
      const duration = Math.max(28, Math.min(90, Math.ceil(cardCount / 2) * 6));
      track.style.setProperty("--scroll-duration", duration + "s");
      document.documentElement.style.setProperty("--extensions-scroll-duration", duration + "s");
      window.dispatchEvent(new CustomEvent("extensions-scroll-duration", { detail: { duration } }));
      window.dispatchEvent(new CustomEvent("lnbits-extension-count", { detail: { count: extensions.length } }));
    }

    function loadExtensions() {
      fetch(sourceUrl)
        .then((resp) => resp.json())
        .then((data) => {
          const list = data && data.extensions ? data.extensions : [];
          const unique = pickLatestExtensions(list);
          unique.sort((a, b) => {
            const an = (a.name || a.id || "").toLowerCase();
            const bn = (b.name || b.id || "").toLowerCase();
            return an.localeCompare(bn);
          });

          const padded = unique.slice();
          if (padded.length) {
            const remainder = padded.length % 4;
            if (remainder !== 0) {
              const needed = 4 - remainder;
              for (let i = 0; i < needed; i += 1) {
                padded.push(padded[i % padded.length]);
              }
            }
          }

          buildTrack(padded);
        })
        .catch(() => {
          track.innerHTML = "";
        });
    }

    loadExtensions();
  })();
});
