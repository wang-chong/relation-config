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
  }
}
const relationApiList = { ...apiList }

export default relationApiList
