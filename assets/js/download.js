window.addEventListener("DOMContentLoaded", () => {
  const link = document.getElementById("ln-download-link");
  const label = document.getElementById("ln-download-label");
  const status = document.getElementById("ln-download-status");
  const options = Array.from(document.querySelectorAll("[data-download]"));
  if (!link || !label || !status) return;

  const releasesUrl = "https://github.com/lnbits/lnbits/releases";
  const formats = { linux: "AppImage", windows: "EXE", mac: "DMG" };
  const assets = {};
  const platform = navigator.userAgentData?.platform || navigator.platform || "";
  const mobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (/Mac/i.test(platform) && navigator.maxTouchPoints > 1);
  let selected = null;
  if (!mobile) {
    if (/Win/i.test(platform)) selected = "windows";
    else if (/Mac/i.test(platform)) selected = "mac";
    else if (/Linux/i.test(platform)) selected = "linux";
  }
  let state = "loading";

  // The label depends on the selection as well as the current language.
  label.removeAttribute("data-i18n");

  function t(key, fallback) {
    return window.LNbitsI18n?.t(key) || fallback;
  }

  function render() {
    const asset = assets[selected];
    link.href = asset?.browser_download_url || releasesUrl;
    const unavailable = selected && state === "ready" && !asset;

    if (!selected) {
      label.textContent = t("download.choose", "Choose download");
    } else if (unavailable) {
      label.textContent = t("download.releases", "View releases");
    } else {
      label.textContent = t("download.button", "Download {format}").replace(
        "{format}", formats[selected]
      );
    }

    status.textContent = "";
    if (state === "error") {
      status.textContent = t("download.fallback", "Find available installers on GitHub releases.");
    } else if (unavailable) {
      status.textContent = t(
        "download.unavailable",
        "This installer is not available yet. Check releases or build from source."
      );
    } else if (asset?.prerelease) {
      status.textContent = t("download.preview", "Pre-release");
    }

    options.forEach((option) => {
      const key = option.dataset.download;
      option.href = assets[key]?.browser_download_url || releasesUrl;
      option.classList.toggle("active", key === selected);
      if (key === selected) option.setAttribute("aria-current", "true");
      else option.removeAttribute("aria-current");
    });
  }

  options.forEach((option) => {
    option.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      selected = option.dataset.download;
      render();
      link.focus();
    });
  });
  window.LNbitsI18n?.onChange(render);
  render();

  // Resolve versioned filenames from published releases, preferring stable builds.
  // Some releases have no installers, so inspect recent releases per format.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  fetch("https://api.github.com/repos/lnbits/lnbits/releases?per_page=10", {
    signal: controller.signal,
    headers: { Accept: "application/vnd.github+json" }
  })
    .then((response) => {
      if (!response.ok) throw new Error("Could not load releases");
      return response.json();
    })
    .then((releases) => {
      if (!Array.isArray(releases)) throw new Error("Invalid releases");
      const published = releases.filter((release) => !release.draft);
      const ordered = published.filter((release) => !release.prerelease)
        .concat(published.filter((release) => release.prerelease));
      Object.entries(formats).forEach(([key, format]) => {
        for (const release of ordered) {
          const asset = (release.assets || []).find((candidate) =>
            candidate.name?.toLowerCase().endsWith("." + format.toLowerCase()) &&
            candidate.browser_download_url?.startsWith(releasesUrl + "/download/")
          );
          if (asset) {
            assets[key] = { ...asset, prerelease: release.prerelease };
            break;
          }
        }
      });
      state = "ready";
    })
    .catch(() => { state = "error"; })
    .finally(() => {
      clearTimeout(timeout);
      render();
    });
});
