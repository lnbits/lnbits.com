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
            slideimg: "assets/images/hero/bitcoin-accounts.png",
            ytpopup: false,
            embedLink: "b7Ou7XtqtRI",
            vidtitle: "User/Wallet System",
            vidtime: "(43 secs)",
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
    }
})
app.use(Quasar, {
    config: {
        dark: true
    }
})


app.mount('#q-app')
