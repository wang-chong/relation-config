<template>
  <div class="relation">
    <slot name="title">
      <div class="ele-title">关系</div>
    </slot>
    <template v-if="allRelations.length > 0">
      <div class="relation-container">
        <div class="component" @click="changeTag(idx)" v-for="(r, idx) in allRelations" :key="idx">
          <el-tag
            :type="currentRelationIdx === idx ? '' : 'info'">
            {{r.properties ? r.properties.name : ''}}({{r.type}})
          </el-tag>
        </div>
      </div>
      <div class="relation-detail">
        <el-form :model="detail" label-width="100px">
          <el-form-item label="源表名称">
            <el-input
              :value="detail.start"
              type="text"
              disabled />
          </el-form-item>
          <el-form-item label="目标表名称">
            <el-input
              :value="detail.end"
              type="text"
              disabled />
          </el-form-item>
          <el-form-item label="关系分类">
            <el-input
              :value="detail.type"
              type="text"
              disabled />
          </el-form-item>
          <el-form-item label="关系名称">
            <el-input
              :value="detail.properties.name"
              type="text"
              disabled />
          </el-form-item>
        </el-form>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Bus from './../../assets/js/Bus'

export default {
  name: 'relation',
  data () {
    return {
      currentRelationIdx: 0,
      // 源节点信息
      source: null,
      // 目标节点信息
      target: null
    }
  },
  computed: {
    // 关系的详情
    detail () {
      return this.allRelations.length > 0 ? this.allRelations[this.currentRelationIdx] : { properties: {} }
    },
    ...mapState(['allRelations'])
  },
  mounted () {
    Bus.$on('linkChange', this.getRelation)
  },
  methods: {
    changeTag (idx) {
      this.currentRelationIdx = idx
    },
    getRelation ({link, nodes}) {
      const vm = this
      vm.currentRelationIdx = 0
      vm.source = nodes.find(item => item.id === link.source)
      vm.target = nodes.find(item => item.id === link.target)
      if (vm.source && vm.target) {
        vm.$store.dispatch('SELECT_ALL_RELATIONS', {
          source: vm.source,
          target: vm.target
        })
      }
    }
  },
  watch: {
    allRelations () {
      this.currentRelationIdx = 0
    }
  }
}
</script>

<style lang="less" scoped>
.relation-container{
  border-bottom: 1px solid rgba(0, 0, 0, .1);
  .component{
    cursor: pointer;
    display: inline-block;
  }
}
.relation-detail{
  margin-top: 20px;
}
</style>
