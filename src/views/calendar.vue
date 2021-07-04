<template>
    <a-calendar>
        <div
            slot="dateCellRender"
            slot-scope="value"
            class="events"
            v-html="getListData(value)"
        >
        </div>
        <template
            v-slot:monthCellRender="value"
            
        >
            <div
                v-if="getMonthData(value)"
                class="notes-month"
            >
                <section>
                    {{ getMonthData(value) }}
                </section>
                <span>Backlog number</span>
            </div>
        </template>
    </a-calendar>
</template>
<script>
import moment from 'moment'
export default {
    props: ['cycle'],
    methods: {                //日历列表
        getListData (value) {
            const currentData = moment(value)
            let plantStartdate,
                plantEndDate,
                GrowStartDate,
                GrowEndDate,
                harvestStartDate,
                harvestEndDate,
                airDyingStartDate,
                airDyingEndDate
            this.cycle.forEach(i => {
                if(i.lifeCycleCode === 1) {
                    plantStartdate =  moment(i.startdate)
                    plantEndDate = moment(i.enddate)
                }
                if(i.lifeCycleCode === 2) {
                    GrowStartDate =  moment(i.startdate)
                    GrowEndDate = moment(i.enddate)
                }
                if(i.lifeCycleCode === 3) {
                    harvestStartDate =  moment(i.startdate)
                    harvestEndDate = moment(i.enddate)
                }
                if(i.lifeCycleCode === 4) {
                    airDyingStartDate =  moment(i.startdate)
                    airDyingEndDate = moment(i.enddate)
                }
            })
            if (currentData <  plantEndDate && currentData > plantStartdate) {
                return '<div class="custome-value "><div class="plant">&nbsp;</div></div>'
            }
            if (currentData <  GrowEndDate && currentData > GrowStartDate) {
                return '<div class="custome-value "><div class="grow">&nbsp;</div></div>'
            }
            if (currentData <  harvestEndDate && currentData > harvestStartDate) {
                return '<div class="custome-value "><div class="harveset">&nbsp;</div></div>'
            }
            if (currentData <  airDyingEndDate && currentData > airDyingStartDate) {
                return '<div class="custome-value "><div class="airdying">&nbsp;</div></div>'
            }
        },

        getMonthData (value) {
            if (value.month() === 8) {
                return 1394;
            }
        },
    },
}
</script>
<style lang="less">
.custome-value {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    padding: 5px;
    .plant {
        background: #79d15e;
    }
    .grow {
        background: #2cc158;
    }
    .harveset {
        background: #f0cf2b;
    }
    .airdying {
        background: #f0a52b;
    }
}
.custome-value div{
    width: 100%;
    height: 100%;

}
.ant-fullcalendar-fullscreen .ant-fullcalendar-value  {
    position: absolute;
    right: 0;
    margin: 0 12px;
    z-index: 999;
}
</style>