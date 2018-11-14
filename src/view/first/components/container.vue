<template>
  <div id='container' @drop='dropInContainer' @dragover='allowDrop'>
    <svg ref='paper'></svg>
  </div>
</template>
<script>
import * as d3 from 'd3'
const nodes = [{
  x: 150,
  y: 100
}, {
  x: 220,
  y: 100
}]

export default {
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
      nodeCount: 0
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
      vm.container = vm.$el
      const height = vm.container.clientHeight
      const width = vm.container.clientWidth
      vm.svg = d3.select(vm.$refs.paper)
        // .attr('width', vm.container.offsetWidth)
        // .attr('height', vm.container.offsetHeight)
        .attr('width', width)
        .attr('height', height)
        .style('cursor', 'move')
      // const data = [{
      //   letter: 20,
      //   frequency: '天'
      // }]
      // // 设置x轴
      // let x = d3.scaleBand().rangeRound([0, width]).padding(0.1).domain(data.map(d => d.letter))
      // // 设置y轴
      // let y = d3.scaleLinear().rangeRound([height, 0]).domain([0, d3.max(data, d => d.frequency)])

      // // 设最外包层在总图上的相对位置
      // let g = vm.svg.append('g').attr('transform', 'translate(20, 20)')
      // g.append('g') // 设置x轴
      //   .attr('class', 'axis axis--x')
      //   .attr('transform', 'translate(0,' + height + ')')
      //   .call(d3.axisBottom(x))

      // g.append('g')// 设置y轴
      //   .attr('class', 'axis axis--y')
      //   .call(d3.axisLeft(y).ticks(10, '%'))
      //   .append('text')
      //   .attr('y', -16)
      //   .attr('dy', '.71em')
      //   .style('text-anchor', 'middle')
      //   .style('fill', '#fff')
      //   .text('空置率 (%)')

      // console.log(x)
      // console.log(y)

      // d3.select('body').style('background-color', 'black')
      // const p = d3.select(this.$el)
      //   .selectAll('p')
      //   .data([4, 8, 15, 16, 23, 42])
      //   .text(d => d)
      // p.enter().append('p')
      //   .text(d => d)
      // p.exit().remove()
      vm.drawLine()
      nodes.map(n => {
        vm.drawNode(n)
      })
    },
    // 画线
    drawLine () {
      const vm = this
      let g = vm.svg.append('g').attr('transform', 'translate(0, 0)')
      g.append('g')
        .append('path')
        .attr('class', 'link')
        .attr('d', 'M 100 100 L 200 200')
    },
    // 画节点
    drawNode (node) {
      const vm = this
      let g = vm.svg.append('g').attr('transform', 'translate(0, 0)')
      const count = vm.nodeCount
      g.append('rect')
        .attr('class', `rect1 node_${count}`)
        .attr('x', node.x)
        .attr('y', node.y)
        .attr('width', '100')
        .attr('height', '100')
        .on('click', () => {
          console.log('click')
        })
        .on('mousedown', (e = window.event) => {
          vm.startP = vm.getXY(e)
          vm.moving = true
        })
        .on('mousemove', (e = window.event) => {
          vm.moveP = vm.getXY(e)
          if (vm.moving) {
            const rect = vm.svg.select(`.node_${count}`)
            rect.attr('x', node.x + vm.offsetP.x)
          }
        })
        .on('mouseup', e => {
          vm.moveEnd(node)
        })
      vm.nodeCount++
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
  stroke-width: 1.5;
  fill: none;
  stroke: #000;
}
rect.rect1{
  fill: rgba(0, 105, 237, 0.6);
}
</style>
