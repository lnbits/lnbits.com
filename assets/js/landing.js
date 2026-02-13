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
        img: "assets/images/hero/bitcoin-accounts.png",
        embedLink: "b7Ou7XtqtRI",
        title: "User/Wallet System",
        time: "(43 secs)"
      },
      {
        img: "assets/images/hero/bitcoin-extensions.png",
        embedLink: "ymq_BXN4lu0",
        title: "50+ Extensions",
        time: "(38 secs)"
      },
      {
        img: "assets/images/hero/lnbits-node-management.png",
        embedLink: "LMs4bFrvy_Y",
        title: "Admin Toolting",
        time: "(48 secs)"
      },
      {
        img: "assets/images/hero/lnbits-api-sdk.png",
        embedLink: "b1a5XshX5dA",
        title: "Supercharged API/SDK",
        time: "(38 secs)"
      }
    ];

    let heroIndex = 0;
    let heroTimer = null;

    const tiles = Array.from(document.querySelectorAll(".ln-btn-tile"));

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
      vm.slideimg = slide.img;
      vm.embedLink = slide.embedLink;
      vm.vidtitle = slide.title;
      vm.vidtime = slide.time;
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
      if (applyHeroSlide(0, false)) {
        clearInterval(readyCheck);
        startHeroRotation();
      }
    }, 200);

    tiles.forEach((tile) => {
      tile.addEventListener("mouseenter", () => stopHeroRotation());
      tile.addEventListener("mouseleave", () => startHeroRotation());
    });
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

      metrics.innerHTML =
        "<span class=\"ln-metric\"><i class=\"lni lni-star-filled\"></i>" + starsText + "</span>" +
        "<span>|</span>" +
        "<span class=\"ln-metric\"><i class=\"lni lni-network\"></i>" + forksText + "</span>" +
        "<span>|</span>" +
        "<span class=\"ln-metric\">Contributors:</span>";
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

      const duration = Math.max(40, items.length * 1.1);
      track.style.animationDuration = duration + "s";
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
  })();
});
