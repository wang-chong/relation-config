import Vue from 'vue'
import fisrtApp from './fisrtApp'
import router from './../first/router'
import store from './../store'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#first',
  router,
  store,
  components: { fisrtApp },
  template: '<fisrtApp/>'
})
