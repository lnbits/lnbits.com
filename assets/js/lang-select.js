(function () {
  function attachLangMixin() {
    if (!window.Vue || typeof window.Vue.createApp !== "function") {
      return;
    }
    if (window.__ln_lang_mixin_attached) {
      return;
    }
    window.__ln_lang_mixin_attached = true;

    const originalCreateApp = window.Vue.createApp;

    window.Vue.createApp = function (rootComponent, rootProps) {
      const app = originalCreateApp.call(this, rootComponent, rootProps);

      app.mixin({
        data() {
          return {
            langOptions: [],
            activeLang: null,
            langLabel: "Language"
          };
        },
        watch: {
          activeLang(newValue) {
            if (!window.LNbitsI18n || !newValue) {
              return;
            }
            const code = typeof newValue === "string" ? newValue : newValue.code;
            if (!code) {
              return;
            }
            if (window.LNbitsI18n.getLang && window.LNbitsI18n.getLang() === code) {
              return;
            }
            window.LNbitsI18n.setLanguage(code);
          }
        },
        methods: {
          refreshLangLabel() {
            if (!window.LNbitsI18n || typeof window.LNbitsI18n.t !== "function") {
              return;
            }
            const label = window.LNbitsI18n.t("language.label");
            if (label) {
              this.langLabel = label;
            }
          }
        },
        mounted() {
          if (!window.LNbitsI18n) {
            return;
          }
          if (typeof window.LNbitsI18n.getLanguages === "function") {
            this.langOptions = window.LNbitsI18n.getLanguages();
          }
          if (typeof window.LNbitsI18n.getLang === "function") {
            const code = window.LNbitsI18n.getLang();
            this.activeLang = this.langOptions.find((lang) => lang.code === code) || this.langOptions[0] || this.activeLang;
          }
          this.refreshLangLabel();
          if (typeof window.LNbitsI18n.onChange === "function") {
            window.LNbitsI18n.onChange((lang) => {
              this.activeLang = this.langOptions.find((option) => option.code === lang) || this.activeLang;
              this.refreshLangLabel();
            });
          }
        }
      });

      return app;
    };
  }

  let attempts = 0;
  function ensureMixin() {
    attempts += 1;
    attachLangMixin();
    if (!window.__ln_lang_mixin_attached && attempts < 10) {
      setTimeout(ensureMixin, 50);
    }
  }
  ensureMixin();
})();
