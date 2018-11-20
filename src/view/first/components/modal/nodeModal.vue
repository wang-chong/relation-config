<!-- 新增详情等的弹窗 -->
<template>
  <el-dialog
    :visible.sync="showModal"
    :title="`关系${modalTitle}`"
    width="1000px"
    id="standardModal">
    <el-form ref="dealForm" :model="dealForm" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="18">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="源表名称" required>
                <el-select v-model="dealForm.build_rel_tables.table_name1" style="width: 100%;">
                  <el-option v-for="item in tableList" :value="item" :key="item">{{item}}</el-option>
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
                  <el-option v-for="item in tableList" :value="item" :key="item">{{item}}</el-option>
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
              v-for="(relation, idx) in relations"
              :key="relation.properties.name"
              closable
              @close="removeRelation(idx)"
              style="margin: 10px;">
              {{relation.properties.name}}
            </el-tag>
          </el-card>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer">
      <el-button class="modalBtn" type="default" @click="showModal = false" size="large">取消</el-button>
      <el-button class="modalBtn" type="primary" @click="RDBMS_to_Neo4j" size="large">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import relationApi from '@/api/relationApi'
import { handleTypes } from './../constant'

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

const modalTitles = {}
modalTitles[handleTypes.create] = '新增'
modalTitles[handleTypes.detail] = '详情'
modalTitles[handleTypes.edit] = '修改'

export default {
  data () {
    // const vm = this
    return {
      showModal: false,
      handleTypes,
      // 所有的表的名称
      tableList: [],
      // 源表的所有字段名称
      sourceIdList: [],
      // 目标表的所有字段名称
      targetIdList: [],
      handleType: '',
      relationshipProperty: '',
      dealForm: getDealForm(),
      relations: []
    }
  },
  computed: {
    modalTitle () {
      return modalTitles[this.handleType] || '新增'
    }
  },
  methods: {
    open (id, type) {
      const vm = this
      vm.selectTableList()
      vm.getAllRelations()
      vm.showModal = true
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
        vm.getAllRelations()
      } else {
        vm.$Message.info('新建关系失败，请稍后再试')
      }
    },
    // 查询所有的表的list
    async selectTableList () {
      const vm = this
      const data = {
        find_all_node_labels: 'YES'
      }
      const res = await relationApi.select(data)
      if (res.statusText === 'OK') {
        vm.tableList = res.data
        vm.dealForm.build_rel_tables.table_name1 = res.data.length > 0 ? res.data[0] : ''
        vm.dealForm.build_rel_tables.table_name2 = res.data.length > 0 ? res.data[0] : ''
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
      const to = {
        find_rel_two_table: {
          start_table_label: 'Product',
          end_table_label: 'Category'
        }
      }
      // const from = {
      //   find_rel_two_table: {
      //     start_table_label: 'Category',
      //     end_table_label: 'Product'
      //   }
      // }
      // 正向关系
      const toRelation = relationApi.select(to)
      // 反向关系（目前没有分方向）
      // const fromRelation = relationApi.select(from)
      const toResult = await toRelation
      // const fromResult = await fromRelation
      if (toResult.statusText === 'OK') {
        let arr = []
        if (toResult.data && toResult.data.length > 0) {
          arr = toResult.data
        }
        vm.relations = arr
      }
    },
    // 删除两表之间指定的关系
    async removeRelation (idx) {
      const vm = this
      const remove = await vm.$confirm('确定删除此种关系吗？', {
        title: '删除提醒',
        type: 'warning'
      })
      if (remove === 'confirm') {
        const relation = vm.relations[idx]
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
          vm.relations.splice(idx, 1)
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
