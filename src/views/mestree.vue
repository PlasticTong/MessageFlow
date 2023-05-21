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
            <svg id="chart" width="800" height="600"></svg>
            <el-form-item label="时间阈值">
                <el-input v-model=threshold placeholder="阈值"></el-input>
                <el-button @click="handleFliter">筛选</el-button>
            </el-form-item>
            <el-button type="warning" @click="handleReset">连线</el-button>
            <el-button type="danger" @click="handleReset">重置</el-button>
            <el-button type="primary" @click="handleExport">导出</el-button>
        </div>
    </div>
</template>
<script>
import * as d3 from 'd3';
import Edata from '../../public/tablemes.json'
import Vdata from '../../public/table.json'
import Mdata from '../../public/Markov.json'
import store from "../store/mesinfo"
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit, Search, Plus, Pointer } from "@element-plus/icons-vue";
import FileSaver from 'file-saver'

export default {
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
            threshold: 1 //阈值
        };
    },
    computed: {
        Obj() {
            return store.state.filtermesres
        }
    },

    methods: {
        handleReset() {
            store.state.filterresFromUser = [],
                this.generateVis2()
        },
        handleFliter() {
            // this.generateVis2()
            store.state.filtermesresByhold = []
            console.log("阈值：" + this.threshold);
            // console.log(this.maxx,this.minn);
            for (let i = 0; i < store.state.filtermesres.length; i++) {
                // console.log(store.state.filtermesres[i].time);
                if ((store.state.filtermesres[i].time - this.minn.time) % this.threshold == 0) {
                    store.state.filtermesresByhold.push(store.state.filtermesres[i])
                }
            }
            // console.log(store.state.filtermesresByhold);
            this.generateVis2()
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
            console.log("strDate", strDate);
            const blob = new Blob([JSON.stringify(store.state.filterresFromUser, null, 2)], {
                type: 'application/json'
            })
            FileSaver.saveAs(blob, strDate)
        },
        generateVis2() {
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
            console.log(filterMesDataByHold);
            console.log(that.threshold);



            let filterUserData = [];
            // console.log(Object.values(store.state.filteruserres));
            filterUserData = Object.values(store.state.filteruserres)



            // console.log('D3开始渲染');
            const svg = d3.select('#chart');
            svg.select("#maingroup").remove();
            const width = +svg.attr('width');
            const height = +svg.attr('height');
            const margin = { top: 50, bottom: 10, left: 80, right: 50 };
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

            // 设置坐标轴
            const xScale = d3.scaleLinear()
                .domain([minTime.time, maxTime.time + 1])
                .range([0, innerwidth]);
            const yScale = d3.scaleBand()
                .domain(filterUserData)
                .range([0, innerheight]);
            const yAxis = d3.axisLeft(yScale);
            axis.append('g')
                .call(yAxis);
            const xAxis = d3.axisTop(xScale);
            axis.append('g')
                .call(xAxis);
            // 定义边
            let line = d3.line()
                .y(function (d) {
                    return yScale(d.name) + 0.5 * yScale.bandwidth();
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
                .attr("refX", "6")
                .attr("refY", "6")
                .attr("orient", "auto");

            //绘制边和箭头
            filterMesDataByHold.forEach(d => {
                linegroup.append('path')
                    .attr('d', line([{
                        name: d.source,
                        time: d.time
                    }, {
                        name: d.target,
                        time: d.time + Number(this.threshold)
                    }]))
                    .attr('id', `E${d.id}`)
                    // .attr('class', `M${d.markov}`)
                    .attr('fill', 'none')
                    .attr('stroke-width', 5)
                    // .attr("marker-end", "url(#arrow)")
                    .style("stroke", that.messageColor)
                    .style("stroke-dasharray", 6)
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
                        return `source: ${d.source}\ntarget: ${d.target}\ntime: ${d.time}`;
                    });;

                // 绘制点
                dotgroup.append("circle")
                    .attr("class", `T${d.time}`)
                    .attr("cy", yScale(d.source) + 0.5 * yScale.bandwidth())
                    .attr("cx", xScale(d.time))
                    .attr("r", 8)
                    .style("fill", "black");

                dotgroup.append("circle")
                    .attr("class", `T${d.time + Number(this.threshold)}`)
                    .attr("cy", yScale(d.target) + 0.5 * yScale.bandwidth())
                    .attr("cx", xScale(d.time + Number(this.threshold)))
                    .attr("r", 8)
                    .style("fill", "black");
            });

            // // 高亮所有马尔科夫列
            // Mdata.markov.forEach(mar => {
            //     mar.flow.forEach(flow => {
            //         console.log(flow);
            //         d3.select(`#E${flow}`)
            //             .style("stroke", that.marColor)
            //             .style("stroke-dasharray", 0);
            //     })
            // });

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
        d3.select('#maingroup').remove();
        this.generateVis2();
        //   console.log(this.selectvalue);
        //   console.log(this.currentRow);
    },
    created() {
        //   console.log(Edata);
        //   console.log(Vdata);
        //   console.log(Mdata);
        //   console.log(Mdata.list);

        // let that = this;
        // // 
        // console.log(111111111111111111111111111);

        // Edata.list.forEach(d => {
        //     if (that.minn === undefined) {
        //         that.minn = d.time
        //     }
        //     if (that.maxx === undefined) {
        //         that.maxx = d.time + 1
        //     }
        //     that.minn = Math.min(that.minn, d.time);
        //     that.maxx = Math.max(that.maxx, d.time + 1);
        // });
        // //   console.log(that.maxx, that.minn);
        // that.selectvalue = [that.minn, that.maxx];
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
</style>
  