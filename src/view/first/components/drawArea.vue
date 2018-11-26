<template>
  <div>
    <div ref="container" id='container' @drop='dropInContainer' @dragover='allowDrop'>
      <svg ref='paper'></svg>
    </div>
    <nodeModal ref="nodeModal" :nodes="nodes"></nodeModal>
  </div>
</template>
<script>
import * as d3 from 'd3'
import nodeModal from './modal/nodeModal.vue'
import Bus from './../assets/js/Bus'

const nodes = []
const links = []

export default {
  components: {
    nodeModal
  },
  name: 'container',
  data () {
    return {
      // 所有的节点，也就是所有的表
      nodes,
      // 所有的连线
      links,
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
      // 被操作节点的初始坐标
      originP: {},
      // 节点计数器
      nodeCount: 0,
      // 当前被操作的节点
      currentNode: {},
      // 右键的时候添加的线条
      tempLink: [],
      // 是否正在通过右键添加关系连线
      isDrawing: false,
      // 放大缩小的倍数，最小0.5，最大1.5
      scaleNum: 1
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
    const vm = this
    vm.$nextTick(() => {
      vm.init()
    })
  },
  methods: {
    init () {
      const vm = this
      vm.container = vm.$refs.container
      const height = vm.container.clientHeight
      const width = vm.container.clientWidth
      vm.svg = d3.select(vm.$refs.paper)
        .attr('width', width)
        .attr('height', height)
        .style('cursor', 'move')
        .on('mousemove', node => {
          vm.moveP = vm.getXY(d3.event)
          // 拖动节点
          if (vm.moving) {
            const node = vm.currentNode
            node.x = vm.originP.x + vm.offsetP.x
            node.y = vm.originP.y + vm.offsetP.y
            vm.refreshCanvas()
          }
          // 新增线条
          if (vm.isDrawing) {
            vm.tempLink.map(link => {
              link.targetX = d3.event.layerX
              link.targetY = d3.event.layerY
            })
            vm.drawTempLink()
          }
        })
        // 阻止默认的右键事件
        .on('contextmenu', () => {
          d3.event.preventDefault()
        })
      const ops = vm.svg.append('svg:g')
        .attr('id', 'ops')
        // .on('mousewheel', () => { // 放大缩小画布
        //   // 缩小
        //   if (d3.event.wheelDelta > 0) {
        //     vm.scaleNum = vm.scaleNum - 0.05
        //     if (vm.scaleNum <= 0.5) {
        //       vm.scaleNum = 0.5
        //     }
        //   } else {
        //     vm.scaleNum = vm.scaleNum + 0.05
        //     if (vm.scaleNum >= 1.5) {
        //       vm.scaleNum = 1.5
        //     }
        //   }
        //   ops.attr('transform', `scale(${vm.scaleNum})`)
        // })
      vm.initArrows(ops)
      ops.append('svg:g')
        .attr('id', 'links')
      ops.append('svg:g')
        .attr('id', 'nodes')
      vm.refreshCanvas()
    },
    // 初始化箭头
    initArrows (ops) {
      const defs = ops.append('svg:defs')
      defs.append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 0 12 12')
        .attr('markerWidth', '6')
        .attr('markerHeight', '6')
        .attr('refX', '6')
        .attr('refY', '6')
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M2,2 L10,6 L2,10 L6,6 L2,2')
        .attr('class', 'arrow')
      defs.append('marker')
        .attr('id', 'arrowActive')
        .attr('viewBox', '0 0 12 12')
        .attr('markerWidth', '6')
        .attr('markerHeight', '6')
        .attr('refX', '6')
        .attr('refY', '6')
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M2,2 L10,6 L2,10 L6,6 L2,2')
        .attr('class', 'arrow-active')
    },
    refreshCanvas () {
      const vm = this

      const allLinks = vm.svg.select('#links').selectAll('.link')
      // 获取update部分
      const updateLink = allLinks.data(links)
      // 获取enter部分
      const enterLink = updateLink.enter()
      // 获取exit部分
      const exitLink = updateLink.exit()
      // update部分的处理：更新属性值
      updateLink.attr('d', l => {
        const { sourcePoint, targetPoint } = vm.getLinkPoint(l)
        return `M ${sourcePoint.x} ${sourcePoint.y} L ${targetPoint.x} ${targetPoint.y}`
      })
        .attr('class', l => `link ${l.active ? 'active' : ''}`)
        .attr('marker-end', l => `url(#arrow${l.active ? 'Active' : ''})`)
      // enter部分的处理：添加元素后赋予属性值
      vm.drawEnterLink(enterLink)
      // 删除的线条
      exitLink.remove()

      const allNodes = vm.svg.select('#nodes').selectAll('.node')
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
    },
    // 画线
    drawEnterLink (enter) {
      const vm = this
      enter.append('path')
        .attr('class', l => `link ${l.active ? 'active' : ''}`)
        .attr('marker-end', l => `url(#arrow${l.active ? 'Active' : ''})`)
        .attr('d', l => {
          const { sourcePoint, targetPoint } = vm.getLinkPoint(l)
          return `M ${sourcePoint.x} ${sourcePoint.y} L ${targetPoint.x} ${targetPoint.y}`
        })
        .on('click', l => {
          vm.changeActiveLink(l)
          Bus.$emit('linkChange', {
            link: l,
            nodes
          })
        })
        .on('dblclick', l => {
          d3.event.preventDefault()
          vm.$refs.nodeModal.open(l)
        })
    },
    changeActiveLink (l) {
      const vm = this
      const activeLink = vm.links.find(link => link.active)
      activeLink.active = false
      l.active = true
      vm.refreshCanvas()
    },
    // 画新增的节点
    drawEnterNode (enter) {
      const vm = this
      const g = enter.append('g')
        .attr('transform', node => `translate(${node.x}, ${node.y})`)
        .attr('class', node => `node node_${node.id}`)
        .attr('id', node => node.id)
        .on('mousedown', node => {
          // 左键
          if (d3.event.button === 0) {
            // 记录鼠标的开始位置
            vm.startP = vm.getXY(d3.event)
            // 记录节点的初始位置
            vm.originP = {
              ...node
            }
            vm.moving = true
            vm.currentNode = node
          }
        })
        .on('mouseup', node => {
          // 右键
          if (d3.event.button === 2) {
            if (vm.isDrawing) {
              vm.isDrawing = false
              const { source } = vm.tempLink[0]
              vm.tempLink = []
              vm.drawTempLink()
              // 起点和终点不是一张表
              if (source !== node.id) {
                const linkInfo = {
                  source: source,
                  target: node.id,
                  active: true
                }
                vm.addLink(linkInfo)
                // 防止出现右键信息
                setTimeout(() => {
                  vm.$refs.nodeModal.open(linkInfo)
                }, 100)
              }
            } else {
              vm.tempLink.push({
                sourceX: node.x,
                sourceY: node.y,
                targetX: node.x,
                targetY: node.y,
                source: node.id
              })
              vm.isDrawing = true
              vm.drawTempLink()
            }
          }
          vm.moveEnd(node)
        })
        .on('click', node => {
          console.log('click')
        })

      // 添加方框
      g.append('rect')
        .attr('width', '50')
        .attr('height', '50')
        .attr('x', '-25')
        .attr('y', '-25')

      // 添加表名
      g.append('svg:text')
        .attr('dx', 0)
        .attr('dy', '0.4em')
        .attr('text-anchor', 'middle')
        .attr('class', 'text')
        .html(node => node.name)
    },
    // 根据线的id获取起点和终点的坐标
    getLinkPoint (link) {
      const target = nodes.find(item => item.id === link.target)
      const source = nodes.find(item => item.id === link.source)
      const sourcePoint = {
        x: source.x < target.x ? source.x + 25 : source.x - 25,
        y: source.y
      }
      const targetPoint = {
        x: source.x < target.x ? target.x - 25 : target.x + 25,
        y: target.y
      }
      return { sourcePoint, targetPoint }
    },
    // 增加关系连线
    addLink (link) {
      const vm = this
      // 同样的两个节点只能有一条线
      for (let l of links) {
        if (l.source === link.source && l.target === link.target) {
          vm.changeActiveLink(l)
          return
        }
      }
      links.push(link)
      vm.changeActiveLink(link)
    },
    // 增加节点
    addNode (node) {
      if (!node.id) {
        node.id = this.nodeCount
      }
      nodes.push(node)
      this.nodeCount++
      this.refreshCanvas()
    },
    moveEnd (node) {
      const vm = this
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
    // 画等待加入的直线
    drawTempLink () {
      const vm = this
      const tempLink = vm.svg.select('#links').selectAll('.tempLink')
      // 获取update部分
      const updateLink = tempLink.data(vm.tempLink)
      // 获取enter部分
      const enterLink = updateLink.enter()
      // 获取exit部分
      const exitLink = updateLink.exit()
      // update部分的处理：更新属性值
      updateLink.attr('d', link => {
        const { sourceX, sourceY, targetX, targetY } = link
        return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
      })
      // enter部分的处理：添加元素后赋予属性值
      enterLink.append('path')
        .attr('class', 'tempLink')
        .attr('marker-end', 'url(#arrowActive)')
        .attr('d', link => {
          const { sourceX, sourceY, targetX, targetY } = link
          return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
        })
      // 删除的线条
      exitLink.remove()
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
      const vm = this
      ev.preventDefault()
      const name = ev.dataTransfer.getData('name')
      vm.addNode({
        x: 100,
        y: 200,
        name: name,
        id: nodes.length > 0 ? String(Number(nodes[nodes.length - 1].id) + 1) : '1'
      })
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
  height: 500px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.3);
}
</style>

<style lang="less">
@activeColor: #4786D5;
path.link{
  stroke-width: 2;
  fill: none;
  stroke: #000;
  cursor: pointer;
  transition: stroke 0.5s;
  &.active{
    stroke-width: 3;
    stroke: @activeColor;
  }
}
path.tempLink{
  stroke-width: 2;
  fill: none;
  stroke: @activeColor;
}
path.arrow{
  stroke-width: 1;
  stroke: #000;
}
path.arrow-active{
  stroke-width: 1;
  fill: @activeColor;
  stroke: @activeColor;
}
text.text{
  fill: #fff;
  user-select: none;
  font-size: 12px;
}
.node rect{
  fill: rgba(0, 105, 237, 0.6);
}
</style>
