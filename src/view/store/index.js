/* eslint-disable */
import Vue from 'vue'
import Vuex from 'vuex'
import relationApi from '@/api/relationApi'
import * as mutations from './mutations'
import * as actions from './actions'

Vue.use(Vuex)
const apiSet = new Set()
const store = new Vuex.Store({
  state: {
    // 两表之间的所有关系
    allRelations: [],
    // 所有的表
    allTables: []
  },
  mutations: {
    [mutations.SET_ALL_RELATIONS] (state, relations) {
      state.allRelations = relations
    },
    [mutations.SET_ALL_TABLES] (state, tables) {
      state.allTables = tables
    }
  },
  actions: {
    // 查询两表之间所有的关系
    async [actions.SELECT_ALL_RELATIONS] ({ commit }, data) {
      // 防止重复请求
      if (apiSet.has('actions.SELECT_ALL_RELATIONS')) return
      apiSet.add('actions.SELECT_ALL_RELATIONS')
      const to = {
        find_rel_two_table: {
          start_table_label: data.source.name,
          end_table_label: data.target.name
        }
      }
      // 正向关系
      const toRelation = relationApi.select(to)
      const toResult = await toRelation
      apiSet.delete('actions.SELECT_ALL_RELATIONS')
      if (toResult.statusText === 'OK') {
        let arr = []
        if (toResult.data && toResult.data.length > 0) {
          arr = toResult.data
        }
        commit(mutations.SET_ALL_RELATIONS, arr)
      }
    },
    // 查询所有的表
    async [actions.SELECT_ALL_TABLES] () {
      const vm = this
      const data = {
        find_all_node_labels: 'YES'
      }
      const res = await relationApi.select(data)
      if (res.statusText === 'OK') {
        store.commit(mutations.SET_ALL_TABLES, res.data)
      }
    }
  }
})

export default store
