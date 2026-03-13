(function () {
  const LANGS = [
    { code: "en", label: "English", flag: "🇺🇸", dir: "ltr" },
    { code: "es", label: "Español", flag: "🇪🇸", dir: "ltr" },
    { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
    { code: "de", label: "Deutsch", flag: "🇩🇪", dir: "ltr" },
    { code: "pt", label: "Português", flag: "🇧🇷", dir: "ltr" },
    { code: "it", label: "Italiano", flag: "🇮🇹", dir: "ltr" },
    { code: "nl", label: "Nederlands", flag: "🇳🇱", dir: "ltr" },
    { code: "ru", label: "Русский", flag: "🇷🇺", dir: "ltr" },
    { code: "zh", label: "中文", flag: "🇨🇳", dir: "ltr" },
    { code: "ja", label: "日本語", flag: "🇯🇵", dir: "ltr" },
    { code: "ko", label: "한국어", flag: "🇰🇷", dir: "ltr" },
    { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" }
  ];

  const DEFAULT_LANG = "en";
  const STORAGE_KEY = "lnbits_lang";
  const LANG_MAP = LANGS.reduce((acc, lang) => {
    acc[lang.code] = lang;
    return acc;
  }, {});
  const cache = {};

  let currentLang = DEFAULT_LANG;
  let messages = {};
  let fallbackMessages = {};
  const listeners = [];

  function normalize(code) {
    if (!code) {
      return null;
    }
    return code.toLowerCase().split("-")[0];
  }

  function resolveLang(code) {
    const normalized = normalize(code);
    if (normalized && LANG_MAP[normalized]) {
      return normalized;
    }
    return null;
  }

  function readStoredLang() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function writeStoredLang(code) {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (error) {
      // Ignore storage errors (private mode, etc.)
    }
  }

  function getBrowserLang() {
    const list = Array.isArray(navigator.languages) ? navigator.languages : [];
    for (let i = 0; i < list.length; i += 1) {
      const resolved = resolveLang(list[i]);
      if (resolved) {
        return resolved;
      }
    }
    return resolveLang(navigator.language);
  }

  function getInitialLang() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = resolveLang(params.get("lang"));
    if (fromQuery) {
      return fromQuery;
    }
    const fromStorage = resolveLang(readStoredLang());
    if (fromStorage) {
      return fromStorage;
    }
    const fromBrowser = getBrowserLang();
    if (fromBrowser) {
      return fromBrowser;
    }
    return DEFAULT_LANG;
  }

  function loadMessages(lang) {
    if (cache[lang]) {
      return Promise.resolve(cache[lang]);
    }
    return fetch("assets/i18n/" + lang + ".json")
      .then((response) => (response.ok ? response.json() : {}))
      .then((data) => {
        cache[lang] = data || {};
        return cache[lang];
      })
      .catch(() => {
        cache[lang] = {};
        return cache[lang];
      });
  }

  function t(key) {
    if (messages && Object.prototype.hasOwnProperty.call(messages, key)) {
      return messages[key];
    }
    if (fallbackMessages && Object.prototype.hasOwnProperty.call(fallbackMessages, key)) {
      return fallbackMessages[key];
    }
    return "";
  }

  function applyTranslations() {
    const langMeta = LANG_MAP[currentLang] || LANG_MAP[DEFAULT_LANG];
    document.documentElement.lang = currentLang;
    document.documentElement.dir = langMeta.dir || "ltr";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) {
        return;
      }
      const value = t(key);
      if (!value) {
        return;
      }
      if (el.getAttribute("data-i18n-html") === "true") {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const mapping = el.getAttribute("data-i18n-attr");
      if (!mapping) {
        return;
      }
      mapping.split(",").forEach((pair) => {
        const parts = pair.split(":");
        if (parts.length < 2) {
          return;
        }
        const attr = parts[0].trim();
        const key = parts.slice(1).join(":").trim();
        if (!attr || !key) {
          return;
        }
        const value = t(key);
        if (value) {
          el.setAttribute(attr, value);
        }
      });
    });
  }

  function updateUrlLang(lang) {
    const url = new URL(window.location.href);
    if (lang === DEFAULT_LANG) {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", lang);
    }
    window.history.replaceState({}, "", url.toString());
  }

  function buildSelector() {
    const select = document.getElementById("ln-lang-select");
    if (!select) {
      return;
    }
    if (select.options.length === 0) {
      LANGS.forEach((lang) => {
        const option = document.createElement("option");
        option.value = lang.code;
        option.textContent = lang.flag;
        option.title = lang.label;
        option.setAttribute("aria-label", lang.label);
        select.appendChild(option);
      });
    }
    select.addEventListener("change", (event) => {
      const lang = resolveLang(event.target.value) || DEFAULT_LANG;
      setLanguage(lang);
    });
  }

  function updateSelector() {
    const select = document.getElementById("ln-lang-select");
    if (!select) {
      return;
    }
    select.value = currentLang;
  }

  function notifyListeners() {
    listeners.forEach((listener) => {
      try {
        listener(currentLang);
      } catch (error) {
        // Ignore listener errors.
      }
    });
  }

  function setLanguage(lang, options) {
    const opts = options || {};
    const resolved = resolveLang(lang) || DEFAULT_LANG;
    currentLang = resolved;

    const fallbackPromise = loadMessages(DEFAULT_LANG);
    const langPromise = resolved === DEFAULT_LANG ? Promise.resolve(null) : loadMessages(resolved);

    return Promise.all([fallbackPromise, langPromise]).then(([fallback, selected]) => {
      fallbackMessages = fallback || {};
      messages = selected || fallbackMessages;
      applyTranslations();
      updateSelector();
      if (!opts.skipStore) {
        writeStoredLang(resolved);
      }
      if (!opts.skipHistory) {
        updateUrlLang(resolved);
      }
      notifyListeners();
    });
  }

  window.LNbitsI18n = {
    t,
    setLanguage,
    getLanguages: () => LANGS.slice(),
    onChange: (callback) => {
      if (typeof callback === "function") {
        listeners.push(callback);
      }
    },
    getLang: () => currentLang
  };

  function init() {
    buildSelector();
    setLanguage(getInitialLang(), { skipHistory: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
