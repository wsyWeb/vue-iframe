import request from './axios'

// 装备信息
export function apiGetList(params) {
    return request({
        url: '/app/jobSpot/findList',
        method: 'POST',
        params: params,
    })
}
