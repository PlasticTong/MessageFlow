<template>
    <div class="mar-title">
        <h2 style="margin: 5px 5px;font-size: 30px;">消息流</h2>
    </div>
    <div class='page'>
        <el-tabs v-model="activeName">
            <el-tab-pane name="first">
                <template #label>
                    <span style="font-size: 20px;">
                        <span>消息流</span>
                    </span>
                </template>
                <div class="container">
                    <div style="display: flex;flex-direction: row;">
                        <el-input v-model="this.accY" placeholder="纵轴精确度" style="width: 10%;margin-right: 10px;"></el-input>
                        <el-button @click="generateVis2" type="primary"
                            style="border-radius: 10px;">绘制</el-button>
                        <el-button @click="generateVis2"
                            style="border-radius: 10px; " type="danger">修改</el-button>
                    </div>
                    <svg id="chart" width="800" height="500"></svg>
                    <!-- <el-form-item label="时间阈值">
                        <div class="input-box">
                            <el-input v-model="threshold" placeholder="阈值"></el-input>
                            <el-button @click="handleFliter">筛选</el-button>
                            <el-button type="danger" @click="handleReset">重置</el-button>
                        </div>
                    </el-form-item> -->
                </div>
            </el-tab-pane>
            <el-tab-pane name="second">
                <template #label>
                    <span style="font-size: 20px;">
                        <span>消息信息</span>
                    </span>
                </template>
                <mestable></mestable>
            </el-tab-pane>
            <el-tab-pane name="third">
                <template #label>
                    <span style="font-size: 20px;">
                        <span>用户信息</span>
                    </span>
                </template>
                <usertable></usertable>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
import mestable from "./mesinfo.vue";
import usertable from "./userinfo.vue";

import * as d3 from 'd3';
import { ElDrawer } from 'element-plus'
import Edata from '../../public/tablemes.json'
import Vdata from '../../public/table.json'
import Mdata from '../../public/Markov.json'
import store from "../store/mesinfo"
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit, Search, Plus, Pointer } from "@element-plus/icons-vue";
import FileSaver from 'file-saver'
import * as q from 'd3-quicktool';
import { objectPick } from '@vueuse/shared';
import { linksUserCho } from "../api/index.ts"
import { fetchMesData, testflask, mutiDraw, mutiCross, markovData } from "../api/index";
// require('d3-quicktool')

export default {
    components: {
        mestable,
        usertable
    },
    name: 'index',
    data() {
        return {
            selectvalue: [0, 10],
            minn: undefined,
            maxx: undefined,
            k: 4,
            Mlist: [],
            currentRow: undefined,
            marColor: "black",
            selectColor: "green",
            oldCurrentRow: undefined,
            messageColor: "#DCDCDC",
            threshold: 6, //阈值s
            drawer: false,
            direction: 'rtl',
            activeName: "first",
            accY: "",//纵轴准确度，每n个展示一个

            filterresFromUser: [], //用户选择好的数据，即导出数据

            stroke_width:3 // 10.19增加测试模式(this.stroke_width替换宽度)

        };
    },
    computed: {
        Obj() {
            return store.state.filtermesres
        }
    },
    methods: {
        // handleClose(done) {
        //     this.visible = false; done()
        // },
        // handleConnectivity() {
        //     // console.log("qwewqeqweqweqweqweqeqwe");
        //     store.state.filterresFromUser = []
        //     // console.log(store.state.filtermesresByhold);
        //     for (let j = 1; j <= this.threshold; j++) {
        //         for (let i = 0; i < store.state.filtermesresByhold.length; i++) {
        //             if (store.state.filtermesresByhold.find(e =>
        //                 (e.target == store.state.filtermesresByhold[i].source && e.time == store.state.filtermesresByhold[i].time - j)
        //                 || (e.source == store.state.filtermesresByhold[i].target && e.time == store.state.filtermesresByhold[i].time + j)
        //             ) != null) {
        //                 store.state.filterresFromUser.push(store.state.filtermesresByhold[i]);
        //                 // console.log(store.state.filtermesresByhold[i].id);
        //                 d3.select("linegroup2")
        //                     .append('path')
        //                     .attr('d', line([{
        //                         name: d.source,
        //                         time: d.time
        //                     }, {
        //                         name: d.target,
        //                         time: d.time + 1
        //                     }]))
        //                     .attr('id', `E2${d.id}`)
        //                     .style("stroke", that.marColor)
        //                     .style("stroke-dasharray", 0)
        //                     // .attr('class', `M${d.markov}`)
        //                     .attr('fill', 'none')
        //                     .attr('stroke-width', 5)
        //                     .attr("marker-end", "url(#arrow)")
        //                     .style('cursor', 'pointer')
        //                     .on("click", function () {
        //                         ElMessage.error("取消选取" + d.id);
        //                         let index = store.state.filterresFromUser.indexOf(d.id);
        //                         store.state.filterresFromUser.splice(index, 1)
        //                         console.log("取消" + store.state.filterresFromUser);
        //                         d3.select(`#E2${d.id}`)
        //                             .remove()
        //                     })
        //                 d3.select(`#E${store.state.filtermesresByhold[i].id}`)
        //                     .classed("chooseline", true)
        //                     .classed("unchooseline", false)
        //             }
        //         }
        //     }
        //     ElMessage.success("连线成功！");
        //     // console.log(store.state.filterresFromUser);

        //     // this.generateVis2()
        // },
        openAcc() {
            //直接修改坐标轴精确度，不用重新绘制
            for (let i = 0; i < this.timeAll; i++) {
                if (i % this.accY != 0) { d3.select(`#tick-${i}`).style("display", "none") }
                else { d3.select(`#tick-${i}`).style("display", "") }
            }
        },
        handleReset() {
            store.state.filterresFromUser = [],
                store.state.filtermesresLine = []
            store.state.filtermesresByhold = []
            ElMessage.success("重置成功！");
            this.generateVis2()
        },
        async handleFliter() {
            store.state.threshold = this.threshold
            // this.generateVis2()
            store.state.filtermesresByhold = store.state.filtermesres
            // console.log(store.state.filtermesresByhold);
            // console.log("阈值：" + this.threshold);
            // // console.log(this.maxx,this.minn);
            // for (let i = 0; i < store.state.filtermesres.length; i++) {
            //     // console.log(store.state.filtermesres[i].time);
            //     if ((store.state.filtermesres[i].time - this.minn.time) % this.threshold == 0) {
            //         store.state.filtermesresByhold.push(store.state.filtermesres[i])
            //     }
            // }
            // console.log(store.state.filtermesresByhold);
            //点集选择
            let filterMesData = [];
            filterMesData = Object.values(store.state.filtermesresByhold)
            const set = new Set();
            var crossmes = {}
            filterMesData.forEach((item) => {
                if (!crossmes[item.time]) {
                    crossmes[item.time] = []
                }
                let data = [item.source.name, item.target.name]
                crossmes[item.time].push(data)
                set.add(item.source.name);
                set.add(item.target.name);
            });
            const sourcesAndTargets = Array.from(set);
            // console.log(sourcesAndTargets);
            // console.log(crossmes);
            await mutiCross(crossmes, sourcesAndTargets).then(res => {
                store.state.filteruserres = res.data;
            })
            ElMessage.success("筛选成功！");
            await this.generateVis2()
            // await this.handleConnectivity()
            store.state.drawMar = true
        },
        generateVis2() {
            //纵轴精确度若没填，默认1
            if (this.accY == '') {
                this.accY = 1
            }
            let that = this;
            //重置选取数据
            this.filterresFromUser = []
            //对数据先进行处理

            //绘制的数据
            let filterMesDataByHold = store.state.linkFByTime;

            //把form表单中 IP段；IP段 分割
            let IPfromChoose = []
            if (store.state.formInline.user != "") {
                IPfromChoose = store.state.formInline.user.split(";")
            }

            //判断ip是否是该network ip段
            function isIPInNetwork(ip, network) {
                var ipParts = ip.split(".");
                var networkParts = network.split(".");
                // 判断 IP 地址是否在网络地址中
                for (var i = 0; i < 3; i++) {
                    if (ipParts[i] !== networkParts[i]) {
                        return false;
                    }
                }
                return true;
            }



            //所有ip数据，去重
            let filterUserData = new Set()
            for (let i = 0; i < filterMesDataByHold.length; i++) {
                filterUserData.add(filterMesDataByHold[i].source)
                filterUserData.add(filterMesDataByHold[i].target)
            }
            filterUserData = Array.from(filterUserData)



            // console.log('D3开始渲染');
            const svg = d3.select('#chart').attr('width', 4000);
            svg.select("#maingroup").remove();
            const width = +svg.attr('width');
            const height = +svg.attr('height');
            const margin = { top: 10, bottom: 10, left: 10, right: 700 };
            // const innerwidth = width - margin.left - margin.right;
            // const innerheight = height - margin.top - margin.bottom;
            // 初始化元素
            const g = svg.append('g')
                .attr('id', 'maingroup')
                .attr('transform', `translate(${margin.left},${margin.top})`);


            let background = g.append("rect").attr("class", "bg")
            let view = g.append("g").attr("class", "view")
            let linegroup = g.append("g").attr("class", "linegroup");
            let linegroup2 = g.append("g").attr("class", "linegroup2");
            let dotgroup = g.append("g").attr("class", "dotgroup");
            let grid = g.append("g").attr("class", "grid")
            let axis = g.append("g").attr("class", "axis")


            //     //在页面中添加svg 支持拖拽和缩放
            //    linegroup.attr("width", 3000).attr("height", 600)
            //         .call(d3.zoom().scaleExtent([1, 3]).on("zoom",
            //             function redraw(event) {
            //                 linegroup.attr("transform", d3.event.transform);
            //                 console.log(1111213);
            //             }
            //         ))
            //         // .attr("transform", "translate(" + 350 + "," + 20 + ")")
            //     // console.log(linegroup);


            // const timeX = []
            // for (let i = minTime.time; i < maxTime.time + 2; i++) {
            //     timeX.push(i)
            //     // console.log(i);
            // }
            // console.log(timeX);

            //定义时间格式
            function formatDate(date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                return formattedDate;
            }

            //计算时间片
            let timeData = new Set()
            //默认导入数据时间片，但是现在为用户输入时间片，所以用不到
            // let timeInterval = Date.parse(filterMesData.list[1].time) - Date.parse(filterMesData.list[0].time)
            if (store.state.timeSlice == null) {
                ElMessage.error("未输入时间片！")
                return
            }
            //时间片单位是10分钟
            let timeInterval = store.state.timeSlice * 60000 * 10
            //计算最大时间
            let maxTime = Date.parse(filterMesDataByHold[filterMesDataByHold.length - 1].time) + timeInterval
            //计算最小时间
            let minTime = Date.parse(filterMesDataByHold[0].time)
            console.log(Date.parse(filterMesDataByHold[filterMesDataByHold.length - 1].time));
            //timedata是横轴的数据，需要补充上没有时间的数据，所以用最大最小时间来
            for (let i = 0; i < ((maxTime - minTime) / timeInterval); i++) {
                timeData.add(formatDate(new Date(minTime + i * timeInterval)))
            }
            timeData = Array.from(timeData)
            //作图逻辑原因，需要补充最大后面一个时间
            timeData.push(formatDate(new Date(Date.parse(timeData[timeData.length - 1]) + timeInterval)))
            this.timeAll = timeData.length

            const innerwidth = timeData.length * 100
            const innerheight = filterUserData.length * 50;
            // 设置坐标轴
            const xScale = d3.scaleBand()
                // .domain([1,2,3,3.5])
                .domain(timeData)
                .range([0, innerwidth]);
            const yScale = d3.scaleBand()
                .domain(filterUserData)
                .range([0, innerheight]);
            const yband = yScale.bandwidth()

            // 定义边
            let line = d3.line()
                .y(function (d) {
                    // let res;
                    // for(let i=0;i<filterUserData.length;i++){
                    //     if(filterUserData[i].name==d.name){
                    //         res = filterUserData[i].ids
                    //         // console.log(res);
                    //     }
                    // }
                    return yScale(d.name) + 0.5 * yband;
                })
                .x(function (d) {
                    return xScale(d.time);
                });


            // 定义箭头
            var defs = svg.append("defs");

            var arrowMarker = defs.append("marker")
                .attr("id", "arrow")
                .attr("markerUnits", "strokeWidth")
                .attr("markerWidth", "12")
                .attr("markerHeight", "12")
                .attr("viewBox", "0 0 12 12")
                .attr("refX", 5)
                .attr("refY", 0)
                .attr("orient", "auto")
            // .append('path')
            // .attr('fill', 'red')
            // .attr('d', 'M 0,-5 L 10,0 L 0,5');



            // filterMesDataByHold.forEach(d=>{
            //     d.source = filterUserData.find(e=>e.name == d.source).ids;
            //     d.target = filterUserData.find(e=>e.name == d.target).ids;
            // })
            //绘制边和箭头
            filterMesDataByHold.forEach(d => {
                linegroup.append('path')
                    .attr('d', line([{
                        name: d.source,
                        time: formatDate(new Date(d.time))//格式化时间
                    }, {
                        name: d.target,
                        time: formatDate(new Date(Date.parse(d.time) + timeInterval))//格式化下一个时间
                    }]))
                    .attr('id', `E${d.id}`)
                    .style('cursor', 'pointer')
                    .classed("chooseline", false)
                    .classed("unchooseline", true)
                    // .attr('class', `M${d.markov}`)
                    // .attr('fill', 'none')

                    .attr("marker-end", "url(#arrow)")
                    // 10.19增加测试模式(this.stroke_width替换宽度)
                    .attr('stroke-width', this.stroke_width)
                    // .style("stroke", that.messageColor)
                    // .style("stroke-dasharray", 6)
                    .on("click", function () {

                        if (store.state.filterresFromUser.find(user => user == d.id) == null) {
                            ElMessage.success("选取成功" + d.id);
                            store.state.filterresFromUser.push(d.id)
                            d3.select(this)
                                .classed("chooseline", true)
                                .classed("unchooseline", false)
                        }
                        else {
                            ElMessage.error("取消选取" + d.id);
                            let index = store.state.filterresFromUser.indexOf(d.id);
                            store.state.filterresFromUser.splice(index, 1)
                            d3.select(this)
                                .classed("chooseline", false)
                                .classed("unchooseline", true)
                        }
                    })
                    .append('title')
                    .text(dd => {
                        return `source: ${d.source}\ntarget: ${d.target}\ntime: ${d.time}\n`;
                    });

                // 绘制点
                dotgroup.append("circle")
                    .attr("class", `T${d.source}`)
                    .attr("cy", yScale(d.source) + 0.5 * yband)
                    .attr("cx", xScale(formatDate(new Date(d.time))))
                    .attr("r", 8)
                    .style("fill", function () {
                        //对筛选条件进行判断，若是筛选的标红
                        if (IPfromChoose != []) {
                            for (let i = 0; i < IPfromChoose.length; i++) {
                                if (isIPInNetwork(d.source, IPfromChoose[i])) {
                                    return "red"
                                }
                            }
                            return "blue"
                        } else {
                            return "blue"
                        }
                    });

                dotgroup.append("circle")
                    .attr("class", `T${d.target}`)
                    .attr("cy", yScale(d.target) + 0.5 * yband)
                    .attr("cx", xScale(formatDate(new Date(Date.parse(d.time) + timeInterval))))
                    .attr("r", 8)
                    .style("fill", function () {
                        //对筛选条件进行判断，若是筛选的标红
                        if (IPfromChoose != []) {
                            for (let i = 0; i < IPfromChoose.length; i++) {
                                if (isIPInNetwork(d.target, IPfromChoose[i])) {
                                    return "red"
                                }
                            }
                            return "blue"
                        } else {
                            return "blue"
                        }
                    });

            });

            //通过时间阈值对原始点进行连线
            for (let i = 0; i < filterMesDataByHold.length; i++) {
                // 若在该时间阈值内，存在一条消息的起点是我的终点（我的时间之后），或者一条消息的终点是我的起点（我的时间之前），认为我们是连接一起的，消息标黑
                if (filterMesDataByHold.find(e =>
                    (e.target == filterMesDataByHold[i].source && Date.parse(filterMesDataByHold[i].time) - store.state.formInline.threshold * timeInterval <= Date.parse(e.time) && Date.parse(e.time) <= Date.parse(filterMesDataByHold[i].time))
                    || (e.source == filterMesDataByHold[i].target && Date.parse(filterMesDataByHold[i].time) <= Date.parse(e.time) && Date.parse(e.time) <= Date.parse(filterMesDataByHold[i].time) + store.state.formInline.threshold * timeInterval)
                ) != null) {
                    store.state.filterresFromUser.push(filterMesDataByHold[i].id);
                    d3.select(`#E${filterMesDataByHold[i].id}`)
                        .classed("chooseline", true)
                        .classed("unchooseline", false)
                }
            }





            // //加一个坐标轴的遮罩层
            let xAxisModel = svg.select('#maingroup')
                .select('.axis')
                .append('rect')
                .attr('x', -100)
                .attr('y', -50)
                .attr('width', '100%')
                .attr('height', 80)
                .attr('fill', 'white')
            let yAxisModel = svg.select('#maingroup')
                .select('.axis')
                .append('rect')
                .attr('x', -110)
                .attr('y', 0)
                .attr('width', 110)
                .attr('height', '100%')
                .attr('fill', 'white')

            const yAxis = d3.axisLeft(yScale);
            const gY = axis.append('g')
                .classed('yAxis', true)
                .call(yAxis)


            const xAxis = d3.axisTop(xScale);
            const gX = axis.append('g')
                .classed('xAxis', true)
                .call(xAxis);
            gX.selectAll(".tick")
                .each(function (d, i) {
                    d3.select(this).attr("id", "tick-" + i);
                    // 该点准确度不为0，省略
                    if (i % that.accY != 0) { d3.select(this).style("display", "none") }
                });

            function calAppendY() {
                let appendMove = 0;
                gX.selectAll(".tick").each(function (d) {
                    let text_width = this.getBoundingClientRect().height
                    if (appendMove < text_width)
                        appendMove = text_width
                })
                return appendMove
            }
            function calAppendX() {
                let appendMove = 0;
                gY.selectAll(".tick").each(function (d) {
                    let text_width = this.getBoundingClientRect().width
                    if (appendMove < text_width)
                        appendMove = text_width
                })
                return appendMove + 35
            }

            gY.attr("transform", `translate(${calAppendX()},${calAppendY()})`)
            gX.attr("transform", `translate(${calAppendX()},${calAppendY()})`)
            yAxisModel.attr("transform", `translate(${calAppendX()},${calAppendY()})`)
            xAxisModel.attr("transform", `translate(${calAppendX()},${calAppendY()})`)

            svg.select('.linegroup').attr("transform", `translate(${calAppendX()},${calAppendY()})`)
            svg.select('.linegroup2').attr("transform", `translate(${calAppendX()},${calAppendY()})`)
            svg.select('.dotgroup').attr("transform", `translate(${calAppendX()},${calAppendY()})`)

            //配置字体大小
            svg.select('.xAxis').selectAll('.tick').selectAll('text').style('font-size', 17)
            svg.select('.yAxis').selectAll('.tick').selectAll('text').style('font-size', 17)


            const zoom = d3.zoom()
                .scaleExtent([0.01, 40])
                // .translateExtent([[-1000, -1000], [width + innerwidth, height + innerheight]])
                // .filter(filter)
                .on("zoom", zoomed);


            svg.call(zoom)

            function zoomed() {
                const radio = 0.5
                svg.select('.linegroup').attr("transform", d3.event.transform);
                svg.select('.linegroup2').attr("transform", d3.event.transform);
                svg.select('.dotgroup').attr("transform", d3.event.transform);
                // svg.select('.linegroup').attr("transform",`translate(${d3.event.transform.x},${d3.event.transform.y}) scale(${d3.event.transform.k})`);
                // svg.select('.dotgroup').attr("transform",`translate(${d3.event.transform.x},${d3.event.transform.y}) scale(${d3.event.transform.k})`);


                // 10.19增加测试模式(this.stroke_width替换宽度)

                //连线的粗细随缩放保持不变
                svg.select('.linegroup').selectAll('path').attr("stroke-width", this.stroke_width * 1.0 / d3.event.transform.k)
                //连线的粗细随缩放保持不变
                svg.select('.linegroup2').selectAll('path').attr("stroke-width", this.stroke_width * 1.0 / d3.event.transform.k)
                //点的大小随缩放保持不变
                svg.select('.dotgroup').selectAll('circle').attr("r", `${8 * 1.0 / d3.event.transform.k}`)
                //轴的字体大小，刻度线大小，轴的粗细保持不变
                svg.select('.yAxis').selectAll('.tick').selectAll('text').attr("transform", `scale(${1.0 / d3.event.transform.k})`)
                svg.select('.yAxis').selectAll('.tick').selectAll('line').attr("transform", `scale(${1.0 / d3.event.transform.k})`)
                svg.select('.yAxis').select('path').style('stroke-width', 2.0 / d3.event.transform.k + 'px')
                svg.select('.xAxis').selectAll('.tick').selectAll('text').attr("transform", `scale(${1.0 / d3.event.transform.k})`)
                svg.select('.xAxis').selectAll('.tick').selectAll('line').attr("transform", `scale(${1.0 / d3.event.transform.k})`)
                svg.select('.xAxis').select('path').style('stroke-width', 2.0 / d3.event.transform.k + 'px')

                //位移，保持相对位置
                svg.select('.xAxis').attr("transform", `translate(${d3.event.transform.x},${calAppendY()}) scale(${d3.event.transform.k})`)
                svg.select('.yAxis').attr("transform", `translate(${calAppendX() - 50},${d3.event.transform.y}) scale(${d3.event.transform.k})`)

            }






        },
        handleCurrentChange(currentRow, oldCurrentRow) {
            let that = this;
            // console.log(currentRow, oldCurrentRow);

            // 恢复上次选择的颜色
            if (oldCurrentRow != null) {
                Mdata.markov.find(function (e) {
                    return e.id === oldCurrentRow[0]
                }).flow.forEach(d => {
                    d3.select(`#E${d}`)
                        .style("stroke", that.marColor);
                });
            }

            // 高亮当前选择的马尔科夫列
            Mdata.markov.find(function (e) {
                return e.id === currentRow[0]
            }).flow.forEach(d => {
                d3.select(`#E${d}`)
                    .style("stroke", "green")
                    .style("stroke-dasharray", 0);
            });

            // console.log(that.oldCurrentRow);
        },
    },
    watch: {
        Obj(newVal, oldVal) {
            //可以对数据执行相应的操作
            console.log("重新绘制")
            this.generateVis2()

        }
    },
    mounted() {
        // this.generateVis2();
    },
    updated() {
        // d3.select('#maingroup').remove();
        // this.generateVis2();
        //   console.log(this.selectvalue);
        //   console.log(this.currentRow);
    },
    created() {
    }
};
</script>
<style>
.mar-title {
    display: flex;
    color: white;
    background-color: #6d6d6d;
}

.input-box {
    display: flex;
    flex-direction: row;
}

.container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 2936px;
    height: 500px;

}

.page {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.control {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5%;
    padding-right: 30px;
}

.view1 {
    width: 100%;
}

.unchooseline {
    stroke: #DCDCDC;
    stroke-dasharray: 6;
}

.chooseline {
    stroke: black;
    stroke-dasharray: 0;
}
</style>
  