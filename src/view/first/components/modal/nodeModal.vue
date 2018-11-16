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
              v-for="relation in relations"
              :key="relation.name"
              closable>
              {{relation.name}}
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
      relations: [{
        name: '关系1'
      }]
    }
  },
  computed: {
    modalTitle () {
      return modalTitles[this.handleType] || '新增'
    }
  },
  methods: {
    // 建立两表之间的关系
    async RDBMS_to_Neo4j () {
      const vm = this
      // const property = {
      // }
      const data = {
        ...vm.dealForm
      }
      data.build_rel_tables.relationship_property = `{name: "${vm.relationshipProperty}"}`// JSON.stringify(property)
      const res = await relationApi.RDBMS_to_Neo4j(data)
      console.log(res)
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
    open (id, type) {
      const vm = this
      vm.selectTableList()
      vm.showModal = true
    },
    async getDetail () {
      const vm = this
      vm.showModal = true
      const res = await relationApi.dataCatalogMetadataDetail({
        id: vm.dealForm.id
      })
      if (res.data && res.data.data) {
        const data = res.data.data
        vm.dealForm = data
      } else {
        vm.$Message.info(res.data.errmsg)
      }
    },
    submit () {
      const vm = this
      if (vm.handleType === handleTypes.detail) {
        vm.showModal = false
        return
      }
      vm.$refs.dealForm.validate(valid => {
        if (valid) {
          vm.doSave({
            ...vm.dealForm
          })
        } else {
          vm.$Message.info('表单验证失败')
        }
      })
    },
    async doSave (data) {
      const vm = this
      if (vm.handleType === handleTypes.create) {
        const res = await relationApi.dataCatalogMetadataSave(data)
        if (res.data) {
          vm.$Message.success('保存成功！！！')
          vm.$emit('on-ok')
          vm.showModal = false
        }
      } else {
        const res = await relationApi.dataCatalogMetadataUpdate(data)
        if (res.data) {
          vm.$Message.success('更新成功！！！')
          vm.$emit('on-ok')
          vm.showModal = false
        }
      }
    }
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
