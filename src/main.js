import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VueGtag from 'vue-gtag';

Vue.config.productionTip = false
Vue.use(VueAxios, axios);
Vue.use(VueGtag,{
  config:{id: 'G-7HJRY0FFFS'}
});

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
