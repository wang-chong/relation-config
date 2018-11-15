<!-- 新增详情等的弹窗 -->
<template>
  <el-dialog
    :visible.sync="showModal"
    :title="`关系${modalTitle}`"
    width="800px"
    id="standardModal">
    <el-form ref="dealForm" :model="dealForm" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="源表名称" required>
            <el-select v-model="dealForm.build_rel_tables.table_name1" style="width: 100%;">
              <el-option v-for="item in tableList" :value="item.name" :key="item.name">{{item.name}}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="源表外键" required>
            <el-select v-model="dealForm.build_rel_tables.table_col1" style="width: 100%;">
              <el-option v-for="item in idList" :value="item.id" :key="item.id">{{item.id}}</el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="目标表名称" required>
            <el-select v-model="dealForm.build_rel_tables.table_name2" style="width: 100%;">
              <el-option v-for="item in tableList" :value="item.name" :key="item.name">{{item.name}}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="目标表外键" required>
            <el-select v-model="dealForm.build_rel_tables.table_col2" style="width: 100%;">
              <el-option v-for="item in idList" :value="item.id" :key="item.id">{{item.id}}</el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="关系分类" required>
        <el-input
          v-model="dealForm.relationship"
          type="text" />
      </el-form-item>
      <el-form-item label="关系名称" required>
        <el-input
          v-model="relationshipProperty"
          type="text" />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button class="modalBtn" type="default" @click="showModal = false" size="large">取消</el-button>
      <el-button class="modalBtn" type="primary" @click="RDBMS_to_Neo4j" size="large">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import relationApi from '@/api/relationApi'
import { handleTypes } from './../constant'

function getDealForm () {
  return {
    KeyID: '',
    create: {},
    create_indexes: {},
    build_rel_tables: {
      table_name1: 'Product',
      table_name2: 'Category',
      table_col1: 'categoryID',
      table_col2: 'categoryID',
      table_ID1_rel: 'n',
      table_ID2_rel: 'm',
      relationship: 'relationship',
      relationship_property: {}
    }
  }
}

const modalTitles = {}
modalTitles[handleTypes.create] = '新增'
modalTitles[handleTypes.detail] = '详情'
modalTitles[handleTypes.edit] = '修改'

const tableList = [{
  name: 'Product'
}, {
  name: 'Category'
}]
const idList = [{
  id: 'categoryID'
}]

export default {
  data () {
    // const vm = this
    return {
      showModal: false,
      handleTypes,
      tableList,
      idList,
      handleType: '',
      relationshipProperty: '',
      dealForm: getDealForm()
    }
  },
  computed: {
    modalTitle () {
      return modalTitles[this.handleType] || '新增'
    },
    ...mapState(['dataResourceList'])
  },
  mounted () {
    // this.getDataResourceList()
  },
  methods: {
    async RDBMS_to_Neo4j () {
      const vm = this
      const property = {
        name: vm.relationshipProperty
      }
      const data = {
        ...vm.dealForm,
        relationship_property: JSON.stringify(property)
      }
      // {
      //   KeyID: 'c6ed3db8-e2fa-11e8-90e6-005056c00008',
      //   create: {},
      //   create_indexes: {},
      //   build_rel_tables: {
      //     table_name1: 'Product',
      //     table_name2: 'Category',
      //     table_col1: 'categoryID',
      //     table_col2: 'categoryID',
      //     table_ID1_rel: 'n',
      //     table_ID2_rel: 'm',
      //     relationship: 'relationship',
      //     relationship_property: JSON.stringify(property)
      //   }
      // }
      // const data = {
      //   'KeyID': 'c6ed3db8-e2fa-11e8-90e6-005056c00008',
      //   'create': {},
      //   'create_indexes': {},
      //   'build_rel_tables': {
      //     'table_name1':'Product',
      //     'table_col1':'supplierID',
      //     'table_name2':'Supplier',
      //     'table_col2':'supplierID',
      //     'table_ID1_rel':'n',
      //     'relationship':'SUPPLIES',
      //     'relationship_property':{},
      //     'table_ID2_rel':'m'
      //   }
      // }
      const res = await relationApi.RDBMS_to_Neo4j(data)
      console.log(res)
    },
    open (id, type) {
      const vm = this
      // vm.dealForm = getDealForm()
      // vm.handleType = type
      // vm.$refs.dealForm.resetFields()
      // // 不是新增
      // if (type !== handleTypes.create) {
      //   vm.dealForm.id = id
      //   vm.getDetail()
      // }
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
    },
    ...mapActions([])
  }
}
</script>
