<template>
    <div class="mar-title">
        <h2 style="margin: 5px 5px;font-size: 30px;">时间筛选器</h2>
    </div>

    <div class="time-chooser-container">

        <div class="time-select-container">
            <svg class="time-select-sketch"></svg>
            <!-- <el-slider v-model="this.value" range :max="this.max" @change="changeSlider"></el-slider> -->
            <el-slider v-model="this.timevalue" range :max="this.timemax" :min="this.timemin"
                value-format="yyyy-MM-dd HH:mm:ss" @change="changeSlider" :show-tooltip="false">
            </el-slider>
            <el-row>
                <el-col :span="12"><el-input type="datetime-local" v-model="this.datestart"
                        style="width:200px;height: 50px;font-size: 20px;" placeholder="起始时间"></el-input></el-col>
                <el-col :span="12"><el-input type="datetime-local" v-model="this.dateend"
                        style="width:200px;height: 50px;font-size: 20px;" placeholder="终止时间"></el-input></el-col>
            </el-row>
            <div class="time-inner-border"></div>
            <div style="display:flex;justify-content:space-between">
                <el-button type="primary" style="width:200px;height: 50px;font-size: 30px;"
                    @click="addPlotData">确定</el-button>
                <el-button type="danger" style="width:200px;height: 50px;font-size: 30px;"
                    @click="clearPlotData">清空</el-button>
            </div>


        </div>

        <!-- <div class="time-inner-border"></div> -->

        <div class="time-list-conatiner">
            <timeUnit @selectPlotData="selectPlotData" @deletePlotData="deletePlotData" v-for="data in plotDataArray"
                :key="data.index" :data="data"></timeUnit>
        </div>
    </div>
</template>
  
<script>
import * as d3 from 'd3'
import { store } from "../store/mesinfo"
import { ElMessage, ElMessageBox } from "element-plus";
import timeUnit from "../views/timeUnit.vue";
import { set } from 'lodash';
import { noopDirectiveTransform } from '@vue/compiler-core';
import { fetchMesData, testflask, mutiDraw, mutiCross } from "../api/index";
import axios from 'axios'
export default {
    components: { timeUnit },


    data() {
        return {
            max: 100,
            num: 0,
            timeSt: 0,
            timeEd: 0,
            value: [0, 0],
            plotDataArray: [],//候选图数据
            plotDataIndex: 0,
            datestart: "",
            dateend: "",
            timevalue: [0, 0],
            timemax: "",
            timemin: ""
        }
    },
    computed: {
        maxnum() {
            return store.state.mesinfo.list
        },
        timeread() {
            return this.timevalue
        }

    },
    watch: {
        maxnum: {
            // deep: true,
            handler() {
                console.log(store.state.mesinfo);
                this.max = store.state.mesinfo.list[store.state.mesinfo.list.length - 1].time
                this.timemax = Date.parse(new Date(this.max))
                this.timemin = Date.parse(new Date(store.state.mesinfo.list[0].time))
                this.timevalue[0] = this.timemin
                this.timevalue[1] = this.timemax
            }
        },
        timeread: {
            deep: true,
            handler() {
                this.datestart = this.formatDate(new Date(this.timevalue[0]))
                this.dateend = this.formatDate(new Date(this.timevalue[1]))
            }
        }

    },

    methods: {
        //定义时间格式
        formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
            return formattedDate;
        },
        changeSlider(v) {//slider改变

            // this.timevalue[0] = this.formatDate(new Date(v[0]))
            // this.timevalue[1] = this.formatDate(new Date(v[1]))
            // this.drawTimeSketch()

            // 10.19增加测试模式
            this.addPlotData()
        },
        drawTimeSketch() {
            /**
             * 
             * 准备数据
             * 
             */
            this.timeEd = this.timevalue[1]
            this.timeSt = this.timevalue[0]
            store.state.timeSlect = { start: this.formatDate(new Date(this.timevalue[0])), end: this.formatDate(new Date(this.timevalue[0])) }
            // console.log(this.timevalue);
            const mesByTime1 = store.state.mesinfo.list.filter((e) => { return Date.parse(e.time) <= this.timeEd && Date.parse(e.time) >= this.timeSt })
            // console.log(mesByTime1);
            // store.state.mesBytime = mesByTime1
            let uniqueArr = []
            mesByTime1.forEach((item, index) => {
                if (!mesByTime1.slice(0, index).some((prevItem) => {
                    return (prevItem.target === item.target && prevItem.source === item.source);
                })) {
                    item.weight = 10
                    uniqueArr.push(item)
                }
                else {
                    // console.log(uniqueArr.find(e=>e.source==item.source && e.source === item.source));
                    uniqueArr.find(e => e.source == item.source && e.target === item.target).weight++
                }
            });

            // const uniqueArr = mesByTime1.filter((item, index) => {
            //     return !mesByTime1.slice(0, index).some((prevItem) => {
            //         return (prevItem.target === item.target && prevItem.source === item.source);
            //     });
            // });

            const nodeset = new Set()
            uniqueArr.forEach(function (e) {
                nodeset.add(e.source)
                nodeset.add(e.target)
            })
            let nodesDataForDraw = []
            Array.from(nodeset).forEach((e, index) => {
                nodesDataForDraw.push({ id: index, name: e })
            })

            // axios.post("http://localhost:5000//mesfilter/mesSelectBytime",
            //     {
            //         nodesDataForDraw, uniqueArr

            //     }).then(function (result) {
            //         console.log(result.data)
            //     })

            //复制数据
            nodesDataForDraw = JSON.parse(JSON.stringify(nodesDataForDraw))
            uniqueArr = JSON.parse(JSON.stringify(uniqueArr))

            //模拟点的位置
            let simulation = d3.forceSimulation()
                .nodes(nodesDataForDraw)
            simulation
                .force('charge_force', d3.forceManyBody().strength(-100))
            let linkForce = d3.forceLink(uniqueArr)
                .id((d) => { return d.name })
                .strength((d) => {
                    return 1 / d.weight;
                })
            simulation.force('links', linkForce)
            // //启动
            simulation.stop();
            simulation.tick(300);


            /**
             * 
             * 绘图
             * 
             */
            this.drawLinkMap(d3.select('.time-select-sketch').node(), nodesDataForDraw, uniqueArr)


        },
        drawLinkMap(svgDOM, nodeData, linkData) {
            /**
             * 
             * svg：svg的DOM元素
             * node：点数据，格式参考simulation生成的
             * link：边数据，格式参考simulation生成的
             * 
             */
            const svg = d3.select(svgDOM)
            svg.selectAll('*').remove()


            //错误检测
            if (nodeData.length == 0)
                return;


            const width = svg.node().getBoundingClientRect().width
            const height = svg.node().getBoundingClientRect().height
            const plot = svg.append('g')



            // 添加defs元素
            let defs = svg.append('defs')

            // 定义箭头
            defs.append('marker')
                .attr('id', 'arrowhead')
                .attr('markerWidth', 4)
                .attr('markerHeight', 4)
                .attr('viewBox', '0 -5 12 12') // Arrow head points in x direction
                .attr('refX', 20) // Horizontal offset
                .attr('refY', 0) // Vertical offset
                .attr('orient', 'auto')
                // .attr('markerUnits', "10")
                .append('path')
                .attr('fill', 'red')
                .attr('d', 'M 0,-5 L 10,0 L 0,5')


            let link = plot.append('g')
                .attr('class', 'links')
                .selectAll('line')
                .data(linkData)
                .join('line')
                .attr('stroke-width', 3)
                .style('stroke', "#0fb2cc")
                .attr('marker-end', 'url(#arrowhead)')
                .attr('x1', (d) => { return d.source.x })
                .attr('y1', (d) => { return d.source.y })
                .attr('x2', (d) => { return d.target.x })
                .attr('y2', (d) => { return d.target.y })

            let node = plot.append('g')
                .attr('class', 'nodes')
                .selectAll('circle')
                .data(nodeData)
                .join('circle')
                .attr('r', 10)
                .attr('fill', "#61b2e4")
                .attr('cx', (d) => { return d.x })
                .attr('cy', (d) => { return d.y })

            let label = plot.append('g')
                .attr('class', 'labels')
                .selectAll('text')
                .data(nodeData)
                .join('text')
                .text(d => d.name)
                .attr('x', function (d) {
                    return d.x - 0.5 * this.getBoundingClientRect().width
                })
                .attr('y', function (d) {
                    return d.y + 0.3 * this.getBoundingClientRect().height
                })

            const zoom = d3.zoom()
                .scaleExtent([0.1, 40])
                .translateExtent([[-10000, -10000], [width + 100000, height + 10000000]])
                // .filter(filter)
                .on("zoom", zoomed);

            svg.call(zoom)


            function zoomed() {
                plot.select('.nodes').attr("transform", d3.event.transform);
                plot.select('.links').attr("transform", d3.event.transform);
                plot.select('.labels').attr("transform", d3.event.transform);
            }

            //预先缩放到中心位置
            const plotWidth = plot.node().getBoundingClientRect().width;
            const plotHeight = plot.node().getBoundingClientRect().height;



            let originTransformX = -plot.node().getBBox().x
            let originTransformY = -plot.node().getBBox().y
            let originTransformK = Math.min(1.0 * width / plotWidth, 1.0 * height / plotHeight) * 0.85

            let smallPlotWidth = plotWidth * originTransformK;
            let smallPlotHeight = plotHeight * originTransformK;

            let offsetTransformX = (0.5 * width - 0.5 * smallPlotWidth)
            let offsetTransformY = (0.5 * height - 0.5 * smallPlotHeight)


            plot
                .style('transform-origin', 'left top')
                .attr("transform", `translate(${offsetTransformX},${offsetTransformY}) scale(${originTransformK}) translate(${originTransformX},${originTransformY})`)
        },
        addPlotData() {
            this.drawTimeSketch()
            console.log("时间：" + this.datestart);
            /**
             * 
             * 准备数据
             * 
             */
            this.timeEd = this.timevalue[1]
            this.timeSt = this.timevalue[0]
            store.state.timeSlect = { start: this.formatDate(new Date(this.timevalue[0])), end: this.formatDate(new Date(this.timevalue[0])) }
            // console.log(this.timevalue);
            const mesByTime1 = store.state.mesinfo.list.filter((e) => { return Date.parse(e.time) <= this.timeEd && Date.parse(e.time) >= this.timeSt })
            let uniqueArr = []
            mesByTime1.forEach((item, index) => {
                item.weight = 10
                item.timesecond = Date.parse(item.time)
                if (!mesByTime1.slice(0, index).some((prevItem) => {
                    return (prevItem.target === item.target && prevItem.source === item.source);
                })) {
                    uniqueArr.push(item)
                }
                else {
                    uniqueArr.find(e => e.source == item.source && e.target === item.target).weight++
                }
            });

            const nodeset = new Set()
            uniqueArr.forEach(function (e) {
                nodeset.add(e.source)
                nodeset.add(e.target)
            })
            let nodesDataForDraw = []
            Array.from(nodeset).forEach((e, index) => {
                nodesDataForDraw.push({ id: index, name: e })
            })

            //复制数据
            nodesDataForDraw = JSON.parse(JSON.stringify(nodesDataForDraw))
            uniqueArr = JSON.parse(JSON.stringify(uniqueArr))
            let uniqueArr2 = JSON.parse(JSON.stringify(uniqueArr))

            //模拟点的位置
            let simulation = d3.forceSimulation()
                .nodes(nodesDataForDraw)
            simulation
                .force('charge_force', d3.forceManyBody().strength(-100))
            let linkForce = d3.forceLink(uniqueArr)
                .id((d) => { return d.name })
                .strength((d) => {
                    return 1 / d.weight;
                })
            simulation.force('links', linkForce)
            //启动
            simulation.stop();
            simulation.tick(300);

            this.plotDataArray.push({
                'index': this.plotDataIndex++,
                'timeRange': this.datestart + '  至  ' + this.dateend,
                'nodeData': nodesDataForDraw,
                'linkData': uniqueArr,
                'linkDataForDraw': uniqueArr2,
                'linkDataAll': mesByTime1,
                'selected': false,
                "time": {
                    "start": this.timeSt,
                    'end': this.timeEd
                }
            })
        },
        deletePlotData(data) {

            let findIndex = this.plotDataArray.indexOf(data)
            this.plotDataArray.splice(findIndex, 1);
        },
        selectPlotData(data) {
            //清空其他数据的选择状态
            for (let value of this.plotDataArray) {
                if (data !== value) {
                    value.selected = false
                }
            }
            //上传选中的数据
            store.state.time = data.time
            store.state.linkFByTime = data.linkData
            store.state.linkFByTimeAll = data.linkDataAll
            store.state.nodeFByTime = data.nodeData
            store.state.linkFByTimeDraw = data.linkDataForDraw
            // console.log(data);

        },
        clearPlotData() {
            this.plotDataArray.length = 0
        }

    },

}
</script>
<style scoped>
.mar-title {
    display: flex;
    color: white;
    background-color: #6d6d6d;
}

.time-chooser-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    /* border: 1px solid black; */
}

.time-select-container {
    display: flex;
    flex-direction: column;
    margin: 5px;
}

.time-inner-border {
    margin: 5px 20px;
    flex: 2px 0 0;
    background-color: #d9d9d9
}

.time-list-conatiner {
    height: 500px;
    /* flex:1 1 0; */
    display: flex;
    overflow: auto;
    flex-direction: column;

}

.time-select-sketch {
    width: 560px;
    height: 560px;
    border: 3px solid #9fc5e8;
    margin: auto;
}

.chart-column {
    display: flex;
}

.chart-column svg {
    width: 100%;
}

.chart-row svg {
    border: 1px solid black;
}

/* svg{
    height:100%;
    width:100%;
} */
</style>
   