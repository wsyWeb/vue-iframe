module.exports = {
    local: {
        mode: 'local',
        DEBUG: false,
        BASE_API_URL: '/api',
        BASE_API: 'http://11.1.1.130:9091',
        MAP_API: '',
        TODAY_QUICK_REPORT_REFRESH_INTERVAL_TIME: 10 * 60 * 1000, // 10m.
        INTERNAL_PHONE_NUMBERS: [],
    },
    prod: {
        mode: 'prod',
        DEBUG: false,
        BASE_API_URL: '/api',
        BASE_API: 'http://11.1.1.130:9091',
        MAP_API: '',
        TODAY_QUICK_REPORT_REFRESH_INTERVAL_TIME: 3 * 1000, // 3s.
    },
}
