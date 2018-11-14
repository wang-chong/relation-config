<template>
  <div id="first">
    <el-row :gutter="20">
      <el-col :span="3">
        <div class="ele" @drop="dropInEle" @dragover="allowDrop">
          <div class="component"
            :id="ele.id"
            draggable="true"
            @dragstart="drag"
            v-for="ele in eleData"
            :key="ele.id"
            :ref="ele.id"
            @mousedown="mousedown"
            @mousemove="mousemove"
            @mouseup="mouseup"
            :style="{'transform': `translate3d(${ele.x}, ${ele.y}, 0)`}">
            <el-button type="primary">按钮</el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="21">
        <container></container>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import container from './container.vue'

const eleData = [
  {
    id: 'button1',
    name: '按钮',
    inRelation: false,
    x: 0,
    y: 0
  }, {
    id: 'button2',
    name: '按钮',
    inRelation: false,
    x: 0,
    y: 0
  }
]

export default {
  components: {
    container
  },
  data () {
    return {
      eleData,
      currentEleInfo: null
    }
  },
  computed: {
    eleMap () {
      const map = new Map()
      eleData.map((item, idx) => {
        map.set(item.id, {
          _index: idx,
          ...item
        })
      })
      return map
    },
    userName () {
      return this.$store.state.name
    }
  },
  methods: {
    drag (ev = window.event) {
      ev.dataTransfer.setData('id', ev.target.id)
    },
    allowDrop (ev = window.event) {
      ev.preventDefault()
    },
    // 放入画布（右侧区域）
    dropInContainer (ev = window.event) {
      const vm = this
      ev = ev || window.event
      ev.preventDefault()
      const data = ev.dataTransfer.getData('id')
      // const ele = vm.eleMap.get(data)
      ev.target.appendChild(vm.$refs[data][0])
      // ele.inRelation = true
    },
    // 放入元素列表项（左侧区域）
    dropInEle (ev = window.event) {
      const vm = this
      ev.preventDefault()
      const data = ev.dataTransfer.getData('id')
      const ele = vm.eleMap.get(data)
      // 在关系中不能拖动到其他位置
      if (ele.inRelation) {
        console.log('在关系中不能拖动')
        return
      }
      vm.eleReset(ele)
      ev.target.appendChild(vm.$refs[data][0])
    },
    // 重置元素的状态
    eleReset (ele) {
      ele = {
        ...ele,
        ...eleData[ele._index]
      }
    },
    // 按下鼠标，获取鼠标的当前位置,设置当前被设置的元素
    mousedown (ev = window.event) {
      const vm = this
      const id = ev.target.id
      vm.currentEleInfo = vm.eleMap.get(id)
      const x = ev.clientX
      const y = ev.clientY
      console.log(x)
      console.log(y)
    },
    // 移动鼠标，实时计算鼠标的偏移量，设置元素的为偏移量
    mousemove (ev = window.event) {},
    // 松开鼠标，将当前正在被设置的元素信息设置为null
    mouseup (ev = window.event) {
      this.currentEleInfo = null
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
}
</style>
