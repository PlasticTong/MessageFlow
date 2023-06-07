<template>
    <div class='page'>
        <!-- <div class='control'>
        <el-table :data="Mlist" style="width: 100%" highlight-current-row @current-change="handleCurrentChange" ref="table">
          <el-table-column prop="0" label="id" width="40"></el-table-column>
          <el-table-column :prop="(index).toString()" :label="(index).toString()" v-for="index of k" :key="index" />
        </el-table>
      </div> -->
        <div class='view1'>
            <!-- <el-slider v-model="store.state.filtermes" range show-stops :max="timeend" :min="timestart" /> -->

            <el-button @click="drawer = true" type="primary" style="margin-left: 16px;">
                点我打开
            </el-button>
            <el-drawer v-model="drawer" :direction="direction">
                <mestable></mestable>
                <el-form-item label="时间阈值">
                    <div class="input-box">
                        <el-input v-model="threshold" placeholder="阈值"></el-input>
                        <el-button @click="handleFliter">筛选</el-button>
                        <el-button type="danger" @click="handleReset">重置</el-button>
                        <!-- <el-button type="primary" @click="handleExport">导出</el-button> -->
                    </div>
                </el-form-item>
                <usertable></usertable>
            </el-drawer>
            <svg id="chart" width="800" height="600"></svg>
        </div>
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
import { fetchMesData, testflask, mutiDraw, mutiCross ,markovData} from "../api/index";
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
            threshold: 1, //阈值s
            drawer: false,
            direction: 'rtl',

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
        handleConnectivity() {
            // console.log("qwewqeqweqweqweqweqeqwe");
            store.state.filterresFromUser = []
            // console.log(store.state.filtermesresByhold);
            for (let j = 1; j <= this.threshold; j++) {
                for (let i = 0; i < store.state.filtermesresByhold.length; i++) {
                    if (store.state.filtermesresByhold.find(e =>
                        (e.target == store.state.filtermesresByhold[i].source && e.time == store.state.filtermesresByhold[i].time - j)
                        || (e.source == store.state.filtermesresByhold[i].target && e.time == store.state.filtermesresByhold[i].time + j)
                    ) != null) {
                        store.state.filterresFromUser.push(store.state.filtermesresByhold[i]);
                        // console.log(store.state.filtermesresByhold[i].id);
                        d3.select(`#E${store.state.filtermesresByhold[i].id}`)
                            .classed("chooseline", true)
                            .classed("unchooseline", false)
                    }
                }
            }
            ElMessage.success("连线成功！");
            // console.log(store.state.filterresFromUser);

            // this.generateVis2()
        },
        handleReset() {
            store.state.filterresFromUser = [],
                store.state.filtermesresLine = []
            store.state.filtermesresByhold = []
            ElMessage.success("重置成功！");
            this.generateVis2()
        },
        async handleFliter() {
            // this.generateVis2()
            store.state.filtermesresByhold = store.state.filtermesres
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
                let data = [item.source, item.target]
                crossmes[item.time].push(data)
                set.add(item.source);
                set.add(item.target);
            });
            const sourcesAndTargets = Array.from(set);
            console.log(sourcesAndTargets);
            console.log(crossmes);
            await mutiCross(crossmes,sourcesAndTargets).then(res => {
                console.log(res.data);
                store.state.filteruserres = res.data;
            })

            

            // const arr2WithIndex = sourcesAndTargets.map((value) => {
            //     let num = 0;
            //     filterMesData.forEach(e => {
            //         if (e.source == value) {
            //             num = num + 1
            //         }
            //         if (e.target == value) {
            //             num = num - 1
            //         }
            //     })
            //     return { value, num: num };
            // });

            // // 根据数组 arr1 中的值大小顺序进行排序
            // arr2WithIndex.sort((a, b) => a.num - b.num);

            // // 将排序后的对象数组还原回原始的值数组
            // const sortedArr2 = arr2WithIndex.map((item) => item.value);


            // const sourcesAndTargetsRes = []
            // for(let j=1;j<=sourcesAndTargets.length;j++){
            //     let data ={"ids":j,"name":sourcesAndTargets[j-1]}
            //     sourcesAndTargetsRes.push(data)
            // }
            // console.log(sortedArr2);
            // store.state.filteruserres = sortedArr2;



            ElMessage.success("筛选成功！");
            await this.generateVis2()
            await this.handleConnectivity()
        },
        handleExport() {
            var date = new Date();
            var year = date.getFullYear(); //月份从0~11，所以加一
            let month = date.getMonth();
            console.log("month", month);
            var dateArr = [
                date.getMonth() + 1,
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds(),
            ];
            //如果格式是MM则需要此步骤，如果是M格式则此循环注释掉
            for (var i = 0; i < dateArr.length; i++) {
                if (dateArr[i] >= 1 && dateArr[i] <= 9) {
                    dateArr[i] = "0" + dateArr[i];
                }
            }
            var strDate =
                year +
                "/" +
                dateArr[0] +
                "/" +
                dateArr[1] +
                " " +
                dateArr[2] +
                ":" +
                dateArr[3] +
                ":" +
                dateArr[4];
            //此处可以拿外部的变量接收，也可直接返回  strDate:2022-05-01 13:25:30
            //this.date = strDate;





            const blob = new Blob([JSON.stringify(store.state.filterresFromUser, null, 2)], {
                type: 'application/json'
            })
            // console.log(blob);
            // // FileSaver.saveAs(blob, strDate)
            // console.log("nihao");
            // linksUserCho(store.state.filterresFromUser).then(res=>{
            //     console.log(res);
            // })

            const dataSend = {
                data:store.state.filterresFromUser,
                parameter:{
                    k:3,
                    delta:7
                }
            }

            markovData(dataSend).then(res=>{
                console.log(res);
            })









        },
        generateVis2() {
            // console.log("12312312312312");
            let that = this;
            //计算最大值最小值
            let filterMesData = [];
            filterMesData = Object.values(store.state.filtermesres)
            var maxTime = 0;
            var minTime = 0;
            if (filterMesData != []) {
                maxTime = filterMesData.reduce(function (prev, curr) {
                    return prev.time > curr.time ? prev : curr;
                }, {});
                minTime = filterMesData.reduce(function (prev, curr) {
                    return prev.time < curr.time ? prev : curr;
                }, {});
            }
            this.maxx = maxTime
            this.minn = minTime

            let filterMesDataByHold = [];
            filterMesDataByHold = Object.values(store.state.filtermesresByhold)




            let filterUserData = [];
            filterUserData = Object.values(store.state.filteruserres)
            // let filterUserDataNUM = [];
            // for(let i=0;i<filterUserData.length;i++){
            //     console.log(filterUserData[i].num);
            //     filterUserDataNUM.push(filterUserData[i].ids)
            // }



            // console.log('D3开始渲染');
            const svg = d3.select('#chart').attr('width', 3000);
            svg.select("#maingroup").remove();
            const width = +svg.attr('width');
            const height = +svg.attr('height');
            const margin = { top: 10, bottom: 10, left: 10, right: 700 };
            const innerwidth = width - margin.left - margin.right;
            const innerheight = height - margin.top - margin.bottom;
            // 初始化元素
            const g = svg.append('g')
                .attr('id', 'maingroup')
                .attr('transform', `translate(${margin.left},${margin.top})`);


            let background = g.append("rect").attr("class", "bg")
            let view = g.append("g").attr("class", "view")
            let linegroup = g.append("g").attr("class", "linegroup");
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


            // 设置坐标轴
            const xScale = d3.scaleLinear()
                .domain([minTime.time, maxTime.time + 1])
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
            var defs = linegroup.append("defs");

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
                        time: d.time
                    }, {
                        name: d.target,
                        time: d.time + 1
                    }]))
                    .attr('id', `E${d.id}`)
                    .classed("chooseline", false)
                    .classed("unchooseline", true)
                    // .attr('class', `M${d.markov}`)
                    .attr('fill', 'none')
                    .attr('stroke-width', 5)
                    .attr("marker-end", "url(#arrow)")
                    // .style("stroke", that.messageColor)
                    // .style("stroke-dasharray", 6)
                    .on("click", function () {

                        if (store.state.filterresFromUser.find(user => user == d.id) == null) {
                            ElMessage.success("选取成功" + d.id);
                            store.state.filterresFromUser.push(d.id)
                            console.log("成功" + store.state.filterresFromUser);
                            d3.select(`#E${d.id}`)
                                .style("stroke", that.marColor)
                                .style("stroke-dasharray", 0);
                        } else {
                            ElMessage.error("取消选取" + d.id);
                            let index = store.state.filterresFromUser.indexOf(d.id);
                            store.state.filterresFromUser.splice(index, 1)
                            console.log("取消" + store.state.filterresFromUser);
                            d3.select(`#E${d.id}`)
                                .style("stroke", that.messageColor)
                                .style("stroke-dasharray", 6);
                        }

                        // if (d.markov != undefined) {
                        //     // 恢复上次选择的颜色
                        //     if (that.oldCurrentRow != undefined) {
                        //         d3.selectAll(`.M${that.oldCurrentRow}`)
                        //             .style("stroke", that.marColor);
                        //     }
                        //     // 弹窗当前选择
                        //     that.$message.success("选择了" + d.markov);
                        //     // 记录当前选择 以便下次选择时恢复颜色
                        //     that.oldCurrentRow = d.markov;
                        //     // 高亮当前选择
                        //     d3.selectAll(`.M${d.markov}`)
                        //         .style("stroke", that.selectColor)
                        //         .style("stroke-dasharray", 0);
                        //     // 在表格中高亮当前选择
                        //     that.$refs.table.setCurrentRow(that.$refs.table.data.find(function (e) {
                        //         return e[0] == d.markov;
                        //     }))
                        // }

                    })
                    .append('title')
                    .text(dd => {
                        return `source: ${d.source}\ntarget: ${d.target}\ntime: ${d.time}\ncontent: ${d.content}`;
                    });;

                // d3.select(`#E${44}`)
                // .classed("chooseline",true)
                // .classed("unchooseline",false)

                // 绘制点
                dotgroup.append("circle")
                    .attr("class", `T${d.time}`)
                    .attr("cy", yScale(d.source) + 0.5 * yband)
                    .attr("cx", xScale(d.time))
                    .attr("r", 8)
                    .style("fill", "black");

                dotgroup.append("circle")
                    .attr("class", `T${d.time + 1}`)
                    .attr("cy", yScale(d.target) + 0.5 * yband)
                    .attr("cx", xScale(d.time + 1))
                    .attr("r", 8)
                    .style("fill", "black");
            });



            // //加一个坐标轴的遮罩层
            let xAxisModel = svg.select('#maingroup')
                                .select('.axis')
                                .append('rect')
                                .attr('x',0)
                                .attr('y',-50)
                                .attr('width','100%')
                                .attr('height',80)
                                .attr('fill','white')
            let yAxisModel = svg.select('#maingroup')
                                .select('.axis')
                                .append('rect')
                                .attr('x',-50)
                                .attr('y',0)
                                .attr('width',160)
                                .attr('height','100%')
                                .attr('fill','white')




            const yAxis = d3.axisLeft(yScale);
            const gY = axis.append('g')
                .classed('yAxis', true)
                .call(yAxis)


            const xAxis = d3.axisTop(xScale);
            const gX = axis.append('g')
                .classed('xAxis', true)
                .call(xAxis);

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
                return appendMove
            }

            gY.attr("transform", `translate(${calAppendX()},${calAppendY()})`)
            gX.attr("transform", `translate(${calAppendX()},${calAppendY()})`)

            svg.select('.linegroup').attr("transform", `translate(${calAppendX()},${calAppendY()})`)
            svg.select('.dotgroup').attr("transform", `translate(${calAppendX()},${calAppendY()})`)

            //配置字体大小
            svg.select('.xAxis').selectAll('.tick').selectAll('text').style('font-size', 17)
            svg.select('.yAxis').selectAll('.tick').selectAll('text').style('font-size', 17)

            const zoom = d3.zoom()
                .scaleExtent([0.5, 40])
                .translateExtent([[-1000, -1000], [width + 900, height + 100]])
                // .filter(filter)
                .on("zoom", zoomed);


            svg.call(zoom)

            function zoomed() {
                const radio = 0.5
                svg.select('.linegroup').attr("transform", d3.event.transform);
                svg.select('.dotgroup').attr("transform", d3.event.transform);
                // svg.select('.linegroup').attr("transform",`translate(${d3.event.transform.x},${d3.event.transform.y}) scale(${d3.event.transform.k})`);
                // svg.select('.dotgroup').attr("transform",`translate(${d3.event.transform.x},${d3.event.transform.y}) scale(${d3.event.transform.k})`);

                //连线的粗细随缩放保持不变
                svg.select('.linegroup').selectAll('path').attr("stroke-width", 5 * 1.0 / d3.event.transform.k)
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
                svg.select('.yAxis').attr("transform", `translate(${calAppendX()},${d3.event.transform.y}) scale(${d3.event.transform.k})`)

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
        this.generateVis2();
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
  