/**
 * axiosApi封装，接口属于mock，可以修改
 * author：liuguangrui
 */
/* eslint-disable */
import store from '@/view/store'
// import '@static/login'

//请求拦截器配置
axios.interceptors.request.use(config => {
    return config
}, error => {
    return Promise.reject(error)
})

// 返回拦截器配置
axios.interceptors.response.use(response => {
	// if(response.data.errcode == '-9999'){//已退出登陆
	// 	loginController.emptyLoginUserInfo();
	// 	loginController.loginFlow();
	// }
	if(response.data && response.data.data && response.data.data.total){
		response.data.data.total = Number(response.data.data.total);
	}
    return response
}, error => {
    return Promise.resolve(error.response)
})

// 错误返回
function errorState(response) {
    //加入loading  
    // 如果http状态码正常，则直接返回数据  
    if (response && response.data.errcode == 0) {
        return response
    // token过期失效码，重新向安卓请求
    } else if (response && (response.data["errcode"] == 40001 || response.data["errcode"] == 40003 || response.data["errcode"] == 40005)) {
        store.commit('SET_USER_INFO');//重新获取userId和token
    }
}

// http请求
const httpServer = (opts, data) => {
  // var userInfo = {}//loginController.getLoginUserInfo();
  var userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    userInfo.token = 'Dv2Gxr68Pk4.ta8qZl6hBzVIbaHqNc0ijHBw2UrzLklqdNxAJdxynFdY27XJzJ6f4uHuNi4ilcFIxPJlV3fTtA5DrjJMr9HM67XM8S0Y2oLf5cfcdSva26BfVeD3JeJohinTl72qT6DhTnHgd.rnNfrvPsjXnBFi03pJXnraf9Dvd569ter88ALPfCLjldDe0HB9fyNij6hEhqNVD0Pqr_nNvH0Uv.XMrLVR8YfhvShfdirtRf5A4ifoDSZKTFdmFBvtbuxyDlxphVVjrclpXxrDLLjt5ih7Tgpa2XvuraTwpIxpdudKfQfUzqDPb4Vc2rN3JrjkN_lRLqPPTu6LBv08jMjCVwtjZVd1zwvuBeNlT.xobWlWdgRb5tzkViHARCPqj1Px4zFUjO4bD5bvFn0_0YLpBzjxxm5MVvRAfqhIRb0g4cPqt4JltkvsT.J9p7tNTjhzRsXrLFNwpppkhUZnPY4JRjtwB1xcHTnF0AvtR2Dwz4RhpgrjzavvtY4qVsn05GpaRL2.tAXapzPpNox22LjPlA2ynqvL0NpydXbTpb4uR4Ni2Gz8VZf9LmTqV.rYzeFydy6t8ilQ4bvPvoNSz7br8lvOnE4gtu8BbLpLbarobjznznTa65jlnhfppcbgncnopuj4vtBzz5Hf6ytf6oly8bj6dxrNDrFmxf8exgvjzTXp5U3qgf.fneY.gwGowygw.d.u9gnw.gfS97ik8ko7r7uy77y7mW9H7S44_7Z3YG97k_7x_y_1ZsJsJy5rzk77WO4r5o3_q1.g.eJ4_PsWVwP.X.565ny4CLA'
    // userInfo.userId = userInfo.userid;
    let HYtimestamp = (new Date()).getTime();
    let Public = { //公共参数  
        'HYtimestamp': HYtimestamp
    }
    let httpDefaultOpts = { //http默认配置  
        method: opts.method,
        baseURL:'/',
        url: opts.url,
        timeout: 10000,
        params: Object.assign(Public, data),
        data: Object.assign(Public, data),
        headers: opts.method == 'get' ? { //配置请求头数据
            'X-Requested-With': 'XMLHttpRequest',
            "Accept": "application/json",
            "Content-Type": "application/json; charset=UTF-8",
            "token": userInfo.token,
            role: userInfo.name === '张耀明' ? '1' : '2'
        } : {
                // '_user_id': userInfo.userId,
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': opts.contentType || 'application/json',
                "token": userInfo.token,
                role: userInfo.name === '张耀明' ? '1' : '2'
            }
    }
    // 转为formdata
    if (opts.contentType === 'application/x-www-form-urlencoded; charset=UTF-8') {
        httpDefaultOpts.transformRequest = [function (data) {
            let ret = []
            for (let prop in data) {
                if (Array.isArray(data[prop])) {
                    data[prop].map(p => {
                        ret.push(`${encodeURIComponent(prop)}[]=${encodeURIComponent(p)}`)
                    })
                } else {
                    ret.push(`${encodeURIComponent(prop)}=${encodeURIComponent(data[prop])}`)
                }
            }
            return ret.join('&')
        }]
    }

    if (opts.method == 'get' || opts.method == 'delete') {
        delete httpDefaultOpts.data
    } else {
        httpDefaultOpts.url = httpDefaultOpts.url + '?HYtimestamp=' + HYtimestamp 
        if (opts.contentType && opts.contentType !== 'application/x-www-form-urlencoded; charset=UTF-8'){ // 判断post请求条件下是否有特殊设置
            delete httpDefaultOpts.data
        }else{
            delete httpDefaultOpts.params
        }
    }

    let promise = new Promise((resolve, reject) => {
        axios(httpDefaultOpts).then(res => {
            resolve(res)
        }).catch(response => {
            if (response.data["errcode"] == 40001 || response.data["errcode"] == 40003 || response.data["errcode"] == 40005) {
                store.commit('SET_USER_INFO');//重新获取userId和token
                return 
            }
            errorState(response)
            reject(response)
        })
    })
    return promise
}

export default httpServer
