import axios from 'axios'
import store from '../store'
import { errorCode } from './errorCode'
import router from '@/router'

let instance = axios.create({
    baseURL: process.env.BASE_API,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
    },
})

instance.interceptors.request.use(
    (config) => {
        config.headers.common['token'] = store.state.token
        return config
    },
    (err) => {
        return Promise.reject(err)
    }
)

let LAST_TIME = 0

instance.interceptors.response.use(
    (response) => {
        let result = response.data

        store.commit('hiddenLoading')

        if (result.code === 200) {
            //如果返回的是文件流需进一步操作
            if (response.headers['content-disposition']) {
                const fileName = replace(response.headers['content-disposition'].split(';')[1].split('=')[1], /"/g, '')

                const a = document.createElement('a')
                a.download = fileName
                a.href = URL.createObjectURL(new Blob([response.data])) // blob内容
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
            }
            return result
        } else {
            window.$vue.$notification.error({ message: errorCode[result.code] || '服务器繁忙！' })
            console.dir(instance)
            return Promise.reject(result)
        }
    },
    (error) => {
        store.commit('hiddenLoading')

        let time = new Date().getTime()
        if (time - LAST_TIME > 500) {
            LAST_TIME = time
            switch (error.response.status) {
                case 401:
                    // window.$vue.$notification.error({message: "登录超时！"});
                    router.replace('/login')
                    store.commit('LOGIN_OUT')
                    break
                default:
                    window.$vue.$notification.error({ message: '服务器繁忙！' })
            }
        } else {
            switch (error.response.status) {
                case 400:
                    if (error.response.config.url.indexOf('/export') !== -1) {
                        window.$vue.$notification.error({ message: '未查询到记录' })
                    } else {
                        window.$vue.$notification.error({ message: data.message })
                    }
                    break
                case 401:
                    if (isInternal) {
                        window.$vue.$notification.error({ message: '页面已过期，请刷新页面' })
                    } else if (error.response.config.url.lastIndexOf('/auth/logout') === -1 && !tokenExpiredErrorShowed) {
                        // tokenExpiredErrorShowed = true
                        // Modal.error({
                        //     title: '登录已过期',
                        //     content: data.message,
                        //     okText: '重新登录',
                        //     mask: false,
                        //     onOk: () => {
                        //         tokenExpiredErrorShowed = false
                        //         if (Vue.ls.get(ACCESS_TOKEN)) {
                        //             store.dispatch('Logout').then(() => {
                        //                 Vue.ls.remove(ACCESS_TOKEN)
                        //                 if (!['/', '/user/login'].includes(window.location.pathname)) {
                        //                     window.location.reload()
                        //                 }
                        //             })
                        //         }
                        //     },
                        // })
                    }
                    break
                case 403:
                    window.$vue.$notification.error({ message: '拒绝访问' })
                    break
                case 404:
                    window.$vue.$notification.error({ message: '很抱歉，资源未找到' })
                    break
                case 500:
                    window.$vue.$notification.error({ message: '系统错误' })
                    break
                default:
                    window.$vue.$notification.error({ message: data.message })
                    break
            }
        }
        return Promise.reject(error.response.status)
    }
)

async function request(options) {
    if (!options.url) new Error('请求必须要有url地址')
    if (!options.method) options.method = 'get'
    if (!options.params) options.params = {}
    // deleteNullKey(options.params);

    store.commit('showLoading')

    let params = {
        url: options.url,
        method: options.method.toLowerCase(),
    }
    if (options.method.toLowerCase() === 'get') {
        params['params'] = options.params
    } else {
        // params['data'] = options.params == '' ? '' : qs.stringify(options.params);
        params['data'] = options.params
    }

    return await instance(params)
}

export default request
