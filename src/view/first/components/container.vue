<template>
  <div>
    <div ref="container" id='container' @drop='dropInContainer' @dragover='allowDrop'>
      <svg ref='paper'></svg>
    </div>
    <nodeModal ref="nodeModal"></nodeModal>
  </div>
</template>
<script>
import * as d3 from 'd3'
import nodeModal from './modal/nodeModal.vue'

const nodes = []
const links = []

export default {
  components: {
    nodeModal
  },
  name: 'container',
  data () {
    return {
      // svg的容器
      container: null,
      // d3选择的画布
      svg: null,
      // 节点是否在移动中
      moving: false,
      // 开始移动时的坐标
      startP: {
        x: 0,
        y: 0
      },
      // 移动过程中的坐标
      moveP: {
        x: 0,
        y: 0
      },
      // 节点计数器
      nodeCount: 0,
      // 当前被操作的节点
      currentNode: {}
    }
  },
  computed: {
    offsetP () {
      const vm = this
      return {
        x: vm.moveP.x - vm.startP.x,
        y: vm.moveP.y - vm.startP.y
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.init()
    })
  },
  methods: {
    init () {
      const vm = this
      vm.container = vm.$refs.container
      const height = vm.container.clientHeight
      const width = vm.container.clientWidth
      vm.svg = d3.select(vm.$refs.paper)
        // .attr('width', vm.container.offsetWidth)
        // .attr('height', vm.container.offsetHeight)
        .attr('width', width)
        .attr('height', height)
        .style('cursor', 'move')
        .on('mousemove', node => {
          vm.moveP = vm.getXY(window.event)
          if (vm.moving) {
            const node = vm.currentNode
            console.log(node)
            const rect = vm.svg.select(`.node_${node.id}`)
            rect.attr('transform', `translate(${node.x + vm.offsetP.x}, ${node.y + vm.offsetP.y})`)
          }
        })
      vm.addNode({
        x: 150,
        y: 100,
        id: '11'
      })
      vm.addNode({
        x: 300,
        y: 80,
        id: '12'
      })
      vm.addLink({
        target: '12',
        source: '11'
      })
      vm.refreshCanvas()
    },
    refreshCanvas () {
      const vm = this
      const allNodes = vm.svg.selectAll('.node')
      // 获取update部分
      const update = allNodes.data(nodes)
      // 获取enter部分
      const enter = update.enter()
      // 获取exit部分
      const exit = update.exit()
      // update部分的处理：更新属性值
      update.attr('transform', n => {
        return `translate(${n.x}, ${n.y})`
      })

      // enter部分的处理：添加元素后赋予属性值
      vm.drawEnterNode(enter)

      // 删除的节点
      exit.remove()

      // nodes.map(n => {
      //   vm.drawNode(n)
      // })
      links.map(l => {
        vm.drawLine(l)
      })
    },
    // 增加关系连线
    addLink (link) {
      links.push(link)
    },
    // 画线
    drawLine (link) {
      const vm = this
      const target = nodes.find(item => item.id === link.target)
      const source = nodes.find(item => item.id === link.source)
      const sourcePoint = {
        x: source.x + 75,
        y: source.y + 25
      }
      const targetPoint = {
        x: target.x - 25,
        y: target.y + 25
      }
      let g = vm.svg.append('g').attr('transform', 'translate(0, 0)')
      g.append('g')
        .append('path')
        .attr('class', 'link')
        .attr('d', `M ${sourcePoint.x} ${sourcePoint.y} L ${targetPoint.x} ${targetPoint.y}`)
        .on('click', () => {
          vm.$refs.nodeModal.open()
        })
    },
    // 增加节点
    addNode (node) {
      if (!node.id) {
        node.id = this.nodeCount
      }
      nodes.push(node)
      this.nodeCount++
    },
    // 画新增的节点
    drawEnterNode (enter) {
      const vm = this
      enter.append('g')
        .attr('transform', node => `translate(${node.x}, ${node.y})`)
        .attr('class', node => `node node_${node.id}`)
        .attr('id', node => node.id)
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', '50')
        .attr('height', '50')
        .append('rect')
        .attr('width', '50')
        .attr('height', '50')
        .attr('x', '-25')
        .attr('y', '-25')
        .on('click', () => {
          console.log('click')
          // vm.$refs.nodeModal.open()
        })
        .on('mousedown', node => {
          vm.startP = vm.getXY(window.event)
          vm.moving = true
          vm.currentNode = node
        })
        .on('mouseup', node => {
          vm.moveEnd(node)
        })
    },
    moveEnd (node) {
      const vm = this
      node.x = node.x + vm.offsetP.x
      node.y = node.y + vm.offsetP.x
      vm.moveP = {
        x: 0,
        y: 0
      }
      vm.startP = {
        x: 0,
        y: 0
      }
      vm.moving = false
    },
    // 获取鼠标坐标
    getXY (e) {
      const { clientX, clientY } = e
      return {
        x: clientX,
        y: clientY
      }
    },
    // 放入画布（右侧区域）
    dropInContainer (ev = window.event) {
      // const vm = this
      ev = ev || window.event
      ev.preventDefault()
      const data = ev.dataTransfer.getData('id')
      // const ele = vm.eleMap.get(data)
      ev.target.appendChild(document.getElementById(data))
      // ele.inRelation = true
    },
    allowDrop (ev = window.event) {
      ev.preventDefault()
    }
  }
}
</script>

<style lang='less' scoped>
#container{
  position: relative;
  height: 300px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  .component{
    position: absolute;
  }
}
</style>

<style lang="less">
path.link{
  stroke-width: 2;
  fill: none;
  stroke: #000;
  cursor: pointer;
}
.node rect{
  fill: rgba(0, 105, 237, 0.6);
}
</style>
