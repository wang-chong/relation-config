<!-- 新增详情等的弹窗 -->
<template>
  <el-dialog
    :visible.sync="showModal"
    title="关系新增"
    width="1000px"
    id="standardModal">
    <el-form ref="dealForm" :model="dealForm" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="18">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="源表名称" required>
                <el-select v-model="dealForm.build_rel_tables.table_name1" style="width: 100%;">
                  <el-option v-for="item in tableList" :value="item.name" :key="item.id">{{item.name}}</el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="源表外键" required>
                <el-select v-model="dealForm.build_rel_tables.table_col1" style="width: 100%;">
                  <el-option v-for="item in sourceIdList" :value="item" :key="item">{{item}}</el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="目标表名称" required>
                <el-select v-model="dealForm.build_rel_tables.table_name2" style="width: 100%;">
                  <el-option v-for="item in tableList" :value="item.name" :key="item.id">{{item.name}}</el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="目标表外键" required>
                <el-select v-model="dealForm.build_rel_tables.table_col2" style="width: 100%;">
                  <el-option v-for="item in targetIdList" :value="item" :key="item">{{item}}</el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="关系分类" required>
            <el-input
              v-model="dealForm.build_rel_tables.relationship"
              type="text" />
          </el-form-item>
          <el-form-item label="关系名称" required>
            <el-input
              v-model="relationshipProperty"
              type="text" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-card header="已有关系">
            <el-tag
              v-for="(r, idx) in allRelations"
              :key="r.properties.name"
              closable
              @close="removeRelation(idx)"
              style="margin: 10px;">
              {{r.properties.name}}({{r.type}})
            </el-tag>
          </el-card>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" style="text-align: center;">
      <el-button class="modalBtn" type="default" @click="showModal = false" size="large">关闭</el-button>
      <el-button class="modalBtn" type="primary" @click="RDBMS_to_Neo4j" size="large">新增</el-button>
    </div>
  </el-dialog>
</template>

<script>
import relationApi from '@/api/relationApi'
import { mapState } from 'vuex'

function getDealForm () {
  return {
    KeyID: '',
    create: {},
    create_indexes: {},
    build_rel_tables: {
      table_name1: '',
      table_name2: '',
      table_col1: '',
      table_col2: '',
      table_ID1_rel: 'n',
      table_ID2_rel: 'm',
      relationship: '',
      relationship_property: {}
    }
  }
}

export default {
  name: 'nodeModal',
  props: {
    // 所有节点的信息
    nodes: {
      type: Array,
      required: true,
      default () {
        return []
      }
    }
  },
  data () {
    // const vm = this
    return {
      showModal: false,
      // 所有的表的名称
      tableList: [],
      // 源表的所有字段名称
      sourceIdList: [],
      // 目标表的所有字段名称
      targetIdList: [],
      handleType: '',
      relationshipProperty: '',
      dealForm: getDealForm(),
      // 当前箭头的源
      source: null,
      // 当前箭头的目标
      target: null
    }
  },
  computed: {
    ...mapState(['allRelations'])
  },
  methods: {
    initForm () {
      this.relationshipProperty = ''
      this.dealForm.build_rel_tables.table_col1 = ''
      this.dealForm.build_rel_tables.table_col2 = ''
      this.dealForm.build_rel_tables.relationship = ''
    },
    open (link) {
      const vm = this
      vm.initForm()
      vm.source = vm.nodes.find(item => item.id === link.source)
      vm.target = vm.nodes.find(item => item.id === link.target)
      if (vm.source && vm.target) {
        // 初始化表的select选项
        vm.tableList = [vm.source, vm.target]
        vm.dealForm.build_rel_tables.table_name1 = vm.source.name
        vm.dealForm.build_rel_tables.table_name2 = vm.target.name
        vm.showModal = true
        vm.getAllRelations()
      }
    },
    // 建立两表之间的关系
    async RDBMS_to_Neo4j () {
      const vm = this
      const data = {
        ...vm.dealForm
      }
      data.build_rel_tables.relationship_property = `{name: "${vm.relationshipProperty}"}`
      const res = await relationApi.RDBMS_to_Neo4j(data)
      if (res.statusText === 'OK') {
        vm.$Message.success('成功新建关系')
        vm.initForm()
        vm.getAllRelations()
      } else {
        vm.$Message.info('新建关系失败，请稍后再试')
      }
    },
    // 根据所选的表查询该表所有字段的list
    async selectIdList (tableName, type) {
      const vm = this
      if (!tableName) {
        vm[`${type}IdList`] = []
        return
      }
      const data = {
        find_single_label_properties: tableName
      }
      const res = await relationApi.select(data)
      if (res.statusText === 'OK') {
        if (type) {
          vm[`${type}IdList`] = res.data
          if (type === 'source') {
            vm.dealForm.build_rel_tables.table_col1 = ''
          } else if (type === 'target') {
            vm.dealForm.build_rel_tables.table_col2 = ''
          }
        }
      }
    },
    // 获取两表之间的所有关系
    async getAllRelations () {
      const vm = this
      vm.$store.dispatch('SELECT_ALL_RELATIONS', {
        source: vm.source,
        target: vm.target
      })
    },
    // 删除两表之间指定的关系
    async removeRelation (idx) {
      const vm = this
      const remove = await vm.$confirm('确定删除此种关系吗？', {
        title: '删除提醒',
        type: 'warning'
      })
      if (remove === 'confirm') {
        const relation = vm.allRelations[idx]
        const data = {
          delete_rel_two_table: {
            start_table_label: relation.start,
            end_table_label: relation.end,
            rel_type: relation.type,
            rel_property: `{name:'${relation.properties.name}'}`
          }
        }
        const res = await relationApi.deleteRelation(data)
        if (res.statusText === 'OK') {
          vm.allRelations.splice(idx, 1)
          vm.$Message.info('关系删除成功')
        }
      }
    }
    // async getDetail () {
    //   const vm = this
    //   vm.showModal = true
    //   const res = await relationApi.dataCatalogMetadataDetail({
    //     id: vm.dealForm.id
    //   })
    //   if (res.data && res.data.data) {
    //     const data = res.data.data
    //     vm.dealForm = data
    //   } else {
    //     vm.$Message.info(res.data.errmsg)
    //   }
    // },
    // submit () {
    //   const vm = this
    //   if (vm.handleType === handleTypes.detail) {
    //     vm.showModal = false
    //     return
    //   }
    //   vm.$refs.dealForm.validate(valid => {
    //     if (valid) {
    //       vm.doSave({
    //         ...vm.dealForm
    //       })
    //     } else {
    //       vm.$Message.info('表单验证失败')
    //     }
    //   })
    // },
    // async doSave (data) {
    //   const vm = this
    //   if (vm.handleType === handleTypes.create) {
    //     const res = await relationApi.dataCatalogMetadataSave(data)
    //     if (res.data) {
    //       vm.$Message.success('保存成功！！！')
    //       vm.$emit('on-ok')
    //       vm.showModal = false
    //     }
    //   } else {
    //     const res = await relationApi.dataCatalogMetadataUpdate(data)
    //     if (res.data) {
    //       vm.$Message.success('更新成功！！！')
    //       vm.$emit('on-ok')
    //       vm.showModal = false
    //     }
    //   }
    // }
  },
  watch: {
    'dealForm.build_rel_tables.table_name1' (val, oldVal) {
      this.selectIdList(val, 'source')
    },
    'dealForm.build_rel_tables.table_name2' (val, oldVal) {
      this.selectIdList(val, 'target')
    }
  }
}
</script>
