<template>
  <div id="first">
    <el-row :gutter="20">
      <el-col :span="3">
        <div class="ele">
          <div class="component"
            :id="idx"
            draggable="true"
            @dragstart="drag"
            v-for="(ele, idx) in eleData"
            :key="idx">
            <el-tag type="primary">{{ele}}</el-tag>
          </div>
        </div>
      </el-col>
      <el-col :span="21">
        <drawArea></drawArea>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import relationApi from '@/api/relationApi'
import drawArea from './drawArea.vue'

export default {
  components: {
    drawArea
  },
  data () {
    return {
      eleData: [],
      currentEleInfo: null
    }
  },
  computed: {
    userName () {
      return this.$store.state.name
    }
  },
  mounted () {
    this.selectTableList()
  },
  methods: {
    // 查询所有的表的list
    async selectTableList () {
      const vm = this
      const data = {
        find_all_node_labels: 'YES'
      }
      const res = await relationApi.select(data)
      if (res.statusText === 'OK') {
        vm.eleData = res.data
      }
    },
    drag (ev = window.event) {
      ev.dataTransfer.setData('name', this.eleData[ev.target.id])
    },
    allowDrop (ev = window.event) {
      ev.preventDefault()
    }
  }
}
</script>

<style lang="less" scoped>
#button{
  position: absolute;
}
.ele{
  // position: relative;
  height: 300px;
  padding: 15px;
  box-sizing: border-box;
  border: 1px solid rgba(0, 0, 0, 0.1);
  .component{
    cursor: move;
    margin: 15px;
  }
}
</style>
