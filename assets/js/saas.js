const {
    useQuasar
} = Quasar
const {
    ref
} = Vue
const $q = useQuasar()
const app = Vue.createApp({
    el: '#q-app',
    data() {
        return {
            slideimg: "assets/images/hero/1.webp",
            ytpopup: false,
            embedLink: "b7Ou7XtqtRI",
            vidtitle: "User/Wallet System",
            vidtime: "(43 secs)",
            activeHeroSlide: "slide1",
            dynamicExtensionTitle: "50+ Extensions",
            extensionCount: null,
            url: "https://api.lnbits.com",
            prompt: false,
            instanceDialog: false,
            loginDialogue: false,
            signUpDialogue: false,
            signupErrors: [],
            access_token: "",
            logged: false,
            login_details: {
                email: "",
                password: "",
            },
            signup_details: {
                email: "",
                password: "",
                password_repeat: "",
            },
            subdomain: "",
            email: "",
            password: "",
            active_instance: {},
            active_instance_id: null,
            interval: null,
            instances: {}
        }
    },
    methods: {
        date: function (date) {
          return moment.unix(date).format('YYYY-MM-DD, hh:mm');
        },
        updateDynamicExtensionTitle: function(count) {
            const numericCount = Number(count);
            if (!numericCount || numericCount <= 0) {
                return;
            }
            this.extensionCount = numericCount;

            const i18n = window.LNbitsI18n;
            const translated = i18n && typeof i18n.t === "function"
                ? i18n.t("hero.slide2.title")
                : "";
            const fallback = numericCount + " Extensions";
            const title = translated && /\d+\+?/.test(translated)
                ? translated.replace(/\d+\+?/, String(numericCount))
                : fallback;

            this.dynamicExtensionTitle = title;
            if (this.embedLink === "ymq_BXN4lu0") {
                this.vidtitle = title;
            }
        },
        activateHeroSlide: function(slideId) {
            const i18n = window.LNbitsI18n;
            const t = (key, fallback) => {
                if (!i18n || typeof i18n.t !== "function") {
                    return fallback;
                }
                return i18n.t(key) || fallback;
            };
            const slides = {
                slide1: {
                    img: "assets/images/hero/1.webp",
                    embedLink: "b7Ou7XtqtRI",
                    title: t("hero.slide1.title", "User/Wallet System"),
                    time: t("hero.slide1.time", "(43 secs)")
                },
                slide2: {
                    img: "assets/images/hero/2.webp",
                    embedLink: "ymq_BXN4lu0",
                    title: this.dynamicExtensionTitle,
                    time: t("hero.slide2.time", "(38 secs)")
                },
                slide3: {
                    img: "assets/images/hero/3.webp",
                    embedLink: "LMs4bFrvy_Y",
                    title: t("hero.slide3.title", "Admin Tooling"),
                    time: t("hero.slide3.time", "(48 secs)")
                },
                slide4: {
                    img: "assets/images/hero/4.webp",
                    embedLink: "b1a5XshX5dA",
                    title: t("hero.slide4.title", "Supercharged API/SDK"),
                    time: t("hero.slide4.time", "(38 secs)")
                }
            };
            const slide = slides[slideId];
            if (!slide) {
                return false;
            }
            this.activeHeroSlide = slideId;
            this.slideimg = slide.img;
            this.embedLink = slide.embedLink;
            this.vidtitle = slide.title;
            this.vidtime = slide.time;
            return true;
        },
        openHeroVideo: function() {
            this.notifyVideoDialog(true);
            this.ytpopup = true;
        },
        notifyVideoDialog: function (isOpen) {
            window.dispatchEvent(
                new CustomEvent("lnbits-video-dialog", {
                    detail: {
                        isOpen: Boolean(isOpen)
                    }
                })
            );
        },
        showPrompt: function() {
            if (this.logged) {
                this.createInstance();
            } else {
                this.loginDialogue = true;
            }
        },
        signup: function() {
            let that = this;
            axios({
              method: "POST",
              url: this.url + "/signup",
              data: this.signup_details,
            })
              .then(function (response) {
                that.$q.notify({
                    type: 'positive',
                    message: "signup successful!"
                });
                that.signUpDialogue = false;
                that.loginDialogue = true;
              })
              .catch(function (error) {
                if (error.response) {
                  that.signupErrors = error.response.data.detail
                  that.$q.notify({
                      type: 'negative',
                      message: "signup failed."
                  });
                }
              });
        },
        login: function() {
            let that = this;
            let data = new FormData();
            data.append('username', this.login_details.email);
            data.append('password', this.login_details.password);
            axios({
              method: "POST",
              url: this.url + "/login",
              data: data,
              headers: { "Content-Type": "multipart/form-data" },
            })
              .then(function (response) {
                that.access_token = response.data.access_token;
                that.$q.notify({
                    type: 'positive',
                    message: "login successful!"
                });
                that.logged = true;
                that.loginDialogue = false;
                that.getInstances();
                that.interval = setInterval(function() {
                    that.getInstances();
                }, 15000)
              })
              .catch(function (error) {
                if (error.response) {
                  // msg = error.response.data.detail
                  that.$q.notify({
                      type: 'negative',
                      message: "login failed"
                  });
                }
              });
        },
        showInstance: function(id) {
            this.active_instance_id = id;
            this.setActiveInstance(id);
        },
        setActiveInstance: function(new_id) {
            let id = new_id || this.active_instance_id;
            if (id) {
                this.active_instance = this.instances.filter(instance => {
                  return instance.id === id
                }).pop();
            }
            if (new_id) {
                this.instanceDialog = true;
            }
        },
        qrUrl: function() {
            return "https://demo.lnbits.com/api/v1/qrcode/" + this.active_instance.lnurl;
        },
        openAdminUrl: function() {
            let url = "https://" + this.active_instance.domain + "/wallet?usr=" + this.active_instance.adminuser;
            window.open(url, '_blank');

        },
        downloadBackup: function() {
            let url = "https://" + this.active_instance.domain + "/admin/api/v1/backup/?usr=" + this.active_instance.adminuser;
            window.open(url, '_blank');

        },
        createInstance: function() {
            let that = this;
            axios({
              method: "POST",
              url: this.url + "/instance",
              headers: {
                "Authorization": "Bearer " + this.access_token,
              },
            }).then(function (response) {
                that.$q.notify({
                    type: 'positive',
                    message: "created instance!"
                });
                that.getInstances(function() {
                    that.showInstance(response.data.id);
                });
              })
              .catch(function (error) {
                if (error.response) {
                  msg = error.response.data.detail
                  that.$q.notify({
                      type: 'negative',
                      message: msg
                  });
                }
              });
        },
        confirmDialog(message) {
            return Quasar.Dialog.create({
                message: message,
                ok: {
                    flat: true,
                    color: 'deep-purple'
                },
                cancel: {
                    flat: true,
                    color: 'grey'
                }
            });
        },
        updateInstance: function(action) {
            let that = this;
            let update = () => {
                axios({
                  method: "PUT",
                  url: this.url + "/instance",
                  data: {
                    action: action,
                    instance_id: this.active_instance.id
                  },
                  headers: {
                    "Authorization": "Bearer " + this.access_token,
                  },
                }).then(function (response) {
                    that.getInstances();
                    that.$q.notify({
                        type: 'positive',
                        message: "ran action: " + action
                    });
                    if (action == "destroy") {
                        that.instanceDialog = false;
                    }
                  })
                  .catch(function (error) {
                    let msg = "run action FAILED: " + action;
                    if (error.response && error.response.data) {
                      msg += ", " + error.response.data
                    }
                    that.$q.notify({
                        type: 'negative',
                        message: msg
                    });
                  });
            };
            let message = undefined;
            if (action == "destroy") {
                message = "are you sure you want to destroy? destroying will delete your instance and every bit of data.";
            }
            if (action == "reset") {
                message = "are you sure you want to reset? resetting will delete all your admin settings including your super user.";
            }
            if (action == "disable") {
                message = "are you sure you want to disable? disabling will make your instance unavailable.";
            }
            if (action == "restart") {
                message = "are you sure you want to restart? restarting will make your instance temporarly unavailable.";
            }
            if (message) {
                this.confirmDialog(message).onOk(update);
            } else {
                update();
            }
        },
        getInstances: function(cb) {
            let that = this;
            if (that.logged) {
                axios({
                  method: "GET",
                  url: this.url + "/instance",
                  headers: {
                    "Authorization": "Bearer " + this.access_token,
                  },
                }).then(function (response) {
                    that.instances = response.data;
                    that.setActiveInstance();
                    if (cb) {
                        cb()
                    }
                  })
                  .catch(function (error) {
                    if (error.response) {
                      msg = error.response.data.detail
                      that.$q.notify({
                          type: 'negative',
                          message: msg
                      });
                    }
                    if (error.response.status == 401) {
                        let msg = "api_key timout...";
                        that.logged = false;
                        clearInterval(that.interval);
                        that.$q.notify({
                            type: 'negative',
                            message: msg
                        });
                    }
                  });
            }
        },
        copyInvoice: function() {
            Quasar.copyToClipboard(this.active_instance.lnurl)
            this.$q.notify({
                message: "Copied to clipboard",
            })
        },
        logout: function() {
            this.logged = false;
        }
    },
    created() {
        let that = this;

        window.addEventListener("lnbits-extension-count", function(event) {
            const count = event && event.detail ? event.detail.count : null;
            that.updateDynamicExtensionTitle(count);
        });

        if (window.LNbitsI18n && typeof window.LNbitsI18n.onChange === "function") {
            window.LNbitsI18n.onChange(function() {
                if (that.extensionCount) {
                    that.updateDynamicExtensionTitle(that.extensionCount);
                }
            });
        }
    }
})
app.use(Quasar, {
    config: {
        dark: true
    }
})


window.lnbitsLandingApp = app.mount('#q-app')
