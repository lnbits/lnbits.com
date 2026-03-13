// ===== Landing page behaviors (moved from index.html) =====
window.addEventListener("DOMContentLoaded", () => {
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

    const tiles = Array.from(document.querySelectorAll(".ln-btn-tile"));
    const heroSlideMap = heroSlides.reduce((acc, slide, index) => {
      acc[slide.id] = index;
      return acc;
    }, {});

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

    function applyHeroSlide(index, pause) {
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
      const title = t(slide.titleKey, slide.titleFallback);
      const time = t(slide.timeKey, slide.timeFallback);
      vm.slideimg = slide.img;
      vm.embedLink = slide.embedLink;
      vm.vidtitle = title;
      vm.vidtime = time;
      if (pause) {
        stopHeroRotation();
      }
      return true;
    }

    function startHeroRotation() {
      if (heroTimer) {
        return;
      }
      heroTimer = setInterval(() => {
        heroIndex = (heroIndex + 1) % heroSlides.length;
        applyHeroSlide(heroIndex, false);
      }, 5500);
    }

    function stopHeroRotation() {
      if (!heroTimer) {
        return;
      }
      clearInterval(heroTimer);
      heroTimer = null;
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
      tile.addEventListener("mouseleave", () => startHeroRotation());
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
        setMetricsText(repo.stargazers_count, repo.forks_count);
      })
      .catch(() => {
        // Silently fail if rate limited or offline.
      });

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
        setMetricsText(undefined, undefined, contributors.length);
        renderContributors(contributors);
      })
      .catch(() => {
        // Silently fail if rate limited or offline.
      });

    if (window.LNbitsI18n && typeof window.LNbitsI18n.onChange === "function") {
      window.LNbitsI18n.onChange(() => {
        setMetricsText(metricsState.stars, metricsState.forks, metricsState.contributors);
      });
    }
  })();
});
