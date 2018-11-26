<template>
  <div id="first">
    <el-row :gutter="20">
      <el-col :span="3">
        <div class="ele">
          <div class="ele-title">表名</div>
          <div class="component"
            :id="idx"
            draggable="true"
            @dragstart="drag"
            v-for="(ele, idx) in allTables"
            :key="idx">
            <el-tag type="primary">{{ele}}</el-tag>
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
  </div>
</template>

<script>
import { mapState } from 'vuex'
import drawArea from './drawArea.vue'
import relation from './relation/relation.vue'

export default {
  name: 'first',
  components: {
    drawArea,
    relation
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
      ev.dataTransfer.setData('name', this.allTables[ev.target.id])
    },
    allowDrop (ev = window.event) {
      ev.preventDefault()
    }
  }
}
</script>

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
  .component{
    cursor: move;
    margin: 15px;
  }
}
</style>
