import Vue from 'vue'
import ElementUI, { Message } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import fisrtApp from './fisrtApp'
import router from './../first/router'
import store from './../store'

Vue.use(ElementUI)
Vue.prototype.$Message = Message
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#first',
  router,
  store,
  components: { fisrtApp },
  template: '<fisrtApp/>'
})
