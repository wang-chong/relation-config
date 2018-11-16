/**
 * 共用接口文档地址
 */

import api from './axiosApi'

const apiList = {
  // 设置两张表的关系
  RDBMS_to_Neo4j (data) {
    return api({
      url: '/api/RDBMS_to_Neo4j',
      method: 'post'
    }, data || {})
  },
  select (data) {
    return api({
      url: '/api/select',
      method: 'post'
    }, {
      KeyID: '',
      find_all_node: '',
      find_all_relationship: '',
      find_node: {},
      find_single_relationship: {},
      find_muti_relationship: {},
      find_all_node_labels: '',
      find_single_label_properties: '',
      ...data
    })
  }
}
const relationApiList = { ...apiList }

export default relationApiList
