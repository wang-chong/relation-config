<template>
  <el-table
    :data="tableData"
    border
    height="380"
    size="small"
    style="width: 100%">
    <el-table-column
      type="index">
    </el-table-column>
    <el-table-column
      prop="n.categoryName"
      label="分类名称">
    </el-table-column>
    <el-table-column
      prop="n.categoryID"
      label="分类ID">
    </el-table-column>
    <el-table-column
      prop="n.picture"
      label="图标">
      <template slot-scope="scope">
        <img :src="`data:image/png;base64,${scope.row.n.picture}`" />
      </template>
    </el-table-column>
    <el-table-column
      prop="n.description"
      label="描述">
    </el-table-column>
  </el-table>
</template>

<script>
import Bus from './../../assets/js/Bus'
import relationApi from '@/api/relationApi'

export default {
  data () {
    return {
      tableData: []
    }
  },
  mounted () {
    Bus.$on('nodeChange', this.getTableData)
  },
  methods: {
    // 根据所选的表查询该表所有的行数据
    async getTableData (table) {
      const vm = this
      const data = {
        find_node: {
          id: '',
          // 表名
          category: table.name,
          node_col: '',
          node_value: ''
        }
      }
      const res = await relationApi.select(data)
      if (res.statusText === 'OK') {
        vm.tableData = res.data
      }
    }
  }
}
</script>
