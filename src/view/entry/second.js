import Vue from 'vue'
import secondApp from './secondApp'
import router from './../second/router'
import store from './../store'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#second',
  router,
  store,
  components: { secondApp },
  template: '<secondApp/>'
})
