<template>
  <div id="first">
    <el-row :gutter="20" style="margin: 0;">
      <el-col :span="3">
        <div class="ele">
          <div class="ele-title">节点</div>
          <div class="ele-container">
            <div class="component"
              :id="idx"
              draggable="true"
              @dragstart="drag"
              v-for="(ele, idx) in allTables"
              :key="idx">
              <el-tag type="primary">{{ele}}</el-tag>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="15">
        <drawArea></drawArea>
      </el-col>
      <el-col :span="6">
        <div class="ele">
          <relation></relation>
        </div>
      </el-col>
    </el-row>
    <div class="table-container">
      <tableData></tableData>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import drawArea from './drawarea/drawArea.vue'
import relation from './relation/relation.vue'
import tableData from './table/tableData.vue'

export default {
  name: 'first',
  components: {
    drawArea,
    relation,
    tableData
  },
  data () {
    return {
      currentRelationIdx: 0
    }
  },
  computed: {
    ...mapState(['allTables', 'allRelations'])
  },
  mounted () {
    this.$store.dispatch('SELECT_ALL_TABLES')
  },
  methods: {
    drag (ev = window.event) {
      ev.dataTransfer.setData('Text', this.allTables[ev.target.id])
    }
  }
}
</script>

<style lang="less" scoped>
.table-container{
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin: 10px;
}
</style>

<style lang="less">
.ele{
  height: 500px;
  padding: 0 5px;
  box-sizing: border-box;
  border: 1px solid rgba(0, 0, 0, 0.1);
  .ele-title{
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding: 10px 0px;
    text-align: center;
  }
  .ele-container{
    height: 458px;
    overflow: auto;
    .component{
      cursor: move;
      margin: 10px;
      display: inline-block;
    }
  }
}
</style>
