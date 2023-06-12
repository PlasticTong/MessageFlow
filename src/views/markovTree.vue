<template>
    <div>
        <h2>马尔科夫链</h2>
        <el-form-item label="阶数选取">
            <div class="input-box">
                <el-input v-model="threshold" placeholder="阶数"></el-input>
                <el-button @click="handleFliter">选取</el-button>
            </div>
        </el-form-item>

        <!--第一行图表-->
        <div class="chart-row">
            <div class="chart-column">
                <svg id="markovchart1" width="450" height="450" v-show="threshold >= 1"></svg>
            </div>
            <div class="chart-column">
                <svg id="markovchart2" width="450" height="450" v-show="threshold >= 2"></svg>
            </div>
        </div>

        <!--第二行图表-->
        <div class="chart-row">
            <div class="chart-column">
                <svg id="markovchart3" width="450" height="450" v-show="threshold >= 3"></svg>
            </div>
            <div class="chart-column">
                <svg id="markovchart4" width="450" height="450" v-show="threshold >= 4"></svg>
            </div>
        </div>

    </div>
</template>
<script>
import * as d3 from 'd3'
import { store } from "../store/mesinfo"
import { linksUserCho, fetchMar2data, fetchMar3data, fetchMar4data } from "../api/index.ts"
import Login from './login.vue'
import { ElMessage, ElMessageBox } from "element-plus";
export default {
    data() {
        return {
            threshold: 1,
            rootnum: 0,

            charts: [],
            currentchoose: []
        }
    },
    mounted() {
    },
    methods: {
        handleFliter() {
            // linksUserCho({ data: store.state.filterresFromUser, param: { order: this.threshold, delta: 12 } }).then(res => {
            //     console.log(res);
            // })
            // const text = "192.168.1.1-191.168.1.13-192.168.12.3";

            // // 匹配IPv4地址的正则表达式
            // const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

            // // 使用match方法获取所有符合条件的IP地址
            // const ipList = text.match(ipPattern);

            // // 输出结果
            // console.log(ipList);

            // console.log(this.threshold);
            for (let i = 1; i <= this.threshold; i++) {
                d3.select(`#markovchart${i}`)
                this.drawMarkov(i)
            }
        },
        async drawMarkov(d) {
            let svg = d3.select(`#markovchart${d}`).attr('width', 450).attr('height', 450)
            svg.selectAll('*').remove();
            let width = svg.node().getBoundingClientRect().width
            let height = svg.node().getBoundingClientRect().height

            const plot = svg.append('g')

            // 添加defs元素
            let defs = plot.append('defs')
            
            //定义marker
            defs.append('marker')
                .attr('id', 'markovArrowhead')
                .attr('markerWidth', 3)
                .attr('markerHeight', 3)
                .attr('refX', 3 + 2.5) // Horizontal offset
                .attr('refY', 1.5) // Vertical offset
                .attr('orient', 'auto')
                .append('path')
                .attr('fill', '#434343')
                .attr('d', 'M 0,0 L 3,1.5 L 0,3')
            //定义文字背景滤镜    
            let markovTextBackground = defs.append('filter')
                .attr('id','markovTextBackground')
                .attr('x', -0.05)
                .attr('y', -0.05)
                .attr('width', 1.1)
                .attr('height', 1.1)
            markovTextBackground.append('feFlood')
                .attr('flood-color', 'orange')
                .attr('flood-opacity', 0.9)
            markovTextBackground.append('feComposite')
                .attr('in', 'SourceGraphic')
                .attr('operator', 'over')



            let nodesData = [
                { 'name': '192.168.1.2-192.168.1.4', 'sex': 'F' },
                { 'name': '192.168.1.2-192.168.1.3', 'sex': 'M' },
                { 'name': '192.168.1.1-192.168.1.2', 'sex': 'M' },
                { 'name': '192.168.1.2-192.168.1.5', 'sex': 'F' },
                { 'name': '192.168.1.2-192.168.1.6', 'sex': 'F' },
                { 'name': '192.168.1.2-192.168.1.7', 'sex': 'M' },
                { 'name': '192.168.1.2-192.168.1.8', 'sex': 'F' },
            ]

            let linksData = [
                { 'id': 1, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.3', 'type': 1 },
                { 'id': 2, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.4', 'type': 2 },
                { 'id': 3, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.5', 'type': 3 },
                { 'id': 4, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.7', 'type': 4 },
                { 'id': 5, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.8', 'type': 5 },
                { 'id': 6, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.6', 'type': 6 },
            ]





            let markovBy2 = []
            let markovBy3 = []
            let markovBy4 = []
            //获取数据
            await fetchMar2data().then(res => {
                markovBy2 = res.data.link
            })
            await fetchMar3data().then(res => {
                markovBy3 = res.data.link
            })

            await fetchMar4data().then(res => {
                markovBy4 = res.data.link
            })

            if (d == 2) {
                linksData = []
                const set = new Set();
                markovBy2.forEach((value, index) => {
                    linksData.push({ id: index, source: value.source, target: value.target,type:value.type })
                    set.add(value.source)
                    set.add(value.target)
                })
                const sourcesAndTargets = Array.from(set);
                nodesData = []
                sourcesAndTargets.forEach(item => {
                    let data = { name: item }
                    nodesData.push(data)
                })
            }

            if (d == 3) {
                linksData = []
                const set = new Set();
                markovBy3.forEach((value, index) => {
                    linksData.push({ id: index, source: value.source, target: value.target ,type:value.type})
                    set.add(value.source)
                    set.add(value.target)
                })
                const sourcesAndTargets = Array.from(set);
                nodesData = []
                sourcesAndTargets.forEach(item => {
                    let data = { name: item }
                    nodesData.push(data)
                })
            }

            if (d == 4) {
                linksData = []
                const set = new Set();
                markovBy4.forEach((value, index) => {
                    linksData.push({ id: index, source: value.source, target: value.target,type:value.type })
                    set.add(value.source)
                    set.add(value.target)
                })
                const sourcesAndTargets = Array.from(set);
                nodesData = []
                sourcesAndTargets.forEach(item => {
                    let data = { name: item }
                    nodesData.push(data)
                })
            }

            //利用力导引图模拟坐标
            let simulation = d3.forceSimulation()
                .nodes(nodesData)

            simulation
                .force('charge_force', d3.forceManyBody().strength(-600))
                .force('center_force', d3.forceCenter(width / 2, height / 2))

            let linkForce = d3.forceLink(linksData)
                .id((d) => { return d.name })
            simulation.force('links', linkForce)

            simulation.stop();
            simulation.tick(300);

            // const posXScale = d3
            //     .scaleLinear()
            //     .domain([minX, maxX])
            //     .range([padding, width - padding]);
            // const posYScale = d3
            //     .scaleLinear()
            //     .domain([minY, maxY])
            //     .range([padding, height - padding]);

            //创建元素
            let link = plot.append('g')
                .attr('class', 'links')
                .selectAll('line')
                .data(linksData)
                .enter()
                .append('line')
                .attr('id', function (data) { return `Mar${d}K${data.id}` })
                .attr('stroke-width', 4)
                .style('stroke', "#666666")
                .style('cursor', 'pointer')
                .attr('marker-end', 'url(#markovArrowhead)')
                .attr('x1', (d) => { return d.source.x })
                .attr('y1', (d) => { return d.source.y })
                .attr('x2', (d) => { return d.target.x })
                .attr('y2', (d) => { return d.target.y })
                .on("click", data => {
                    if (this.currentchoose.find(e => e == `Mar${d}K${data.id}`) == null) {
                        this.currentchoose.push(`Mar${d}K${data.id}`)


                        // 匹配IPv4地址的正则表达式
                        const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
                        // 使用match方法获取所有符合条件的IP地址
                        const ipList = data.source.name.match(ipPattern);
                        for (let i = 0; i < ipList.length - 1; i++) {
                            let flag = 0;
                            for (let j = 0; j < store.state.MarFromUser.length; j++) {
                                if (store.state.MarFromUser[j].id == ipList[i] && store.state.MarFromUser[j].parentId == ipList[i + 1]) {
                                    store.state.MarFromUser[j].k += 1
                                    flag = 1
                                }
                            }
                            if (flag == 0) {
                                store.state.MarFromUser.push({ id: ipList[i], parentId: ipList[i + 1], k: 1 })
                            }
                        }

                        // 使用match方法获取所有符合条件的IP地址
                        const ipList2 = data.target.name.match(ipPattern);
                        for (let i = 0; i < ipList2.length - 1; i++) {
                            let flag = 0;
                            for (let j = 0; j < store.state.MarFromUser.length; j++) {
                                if (store.state.MarFromUser[j].id == ipList2[i] && store.state.MarFromUser[j].parentId == ipList2[i + 1]) {
                                    store.state.MarFromUser[j].k += 1
                                    flag = 1
                                }
                            }
                            if (flag == 0) {
                                store.state.MarFromUser.push({ id: ipList2[i], parentId: ipList2[i + 1], k: 1 })
                            }
                        }

                        // const ipRegex = /(\d+\.\d+\.\d+\.\d+)-(\d+\.\d+\.\d+\.\d+)/;
                        // // if(store.state.MarFromUser.find(e=>e.))
                        // // console.log(this.rootnum);
                        // if (store.state.MarFromUser.length == 0) {
                        //     store.state.MarFromUser.push({ id: d.source.name.match(ipRegex)[1] })
                        // }
                        // const res1 = { id: d.source.name.match(ipRegex)[2], parentId: d.source.name.match(ipRegex)[1] }
                        // const res2 = { id: d.target.name.match(ipRegex)[2], parentId: d.source.name.match(ipRegex)[2] }

                        // if (store.state.MarFromUser.find(e => e.id == res1.id && e.parentId == res1.parentId) == null) {
                        //     store.state.MarFromUser.push(res1)
                        // }

                        // if (store.state.MarFromUser.find(e => e.id == res2.id && e.parentId == res1.parentId) == null) {
                        //     store.state.MarFromUser.push(res2)
                        // }

                        // console.log(store.state.MarFromUser);

                        store.state.marInfoTable.push({id:`#Mar${d}K${data.id}`,source:data.source.name,target:data.target.name,type:data.type})
                        // console.log(store.state.marInfoTable);

                        d3.select(`#Mar${d}K${data.id}`)
                            .style("stroke", "#0fb2cc")
                            .style("stroke-dasharray", 0);
                        ElMessage.success("选取成功" + `Mar${d}K${data.id}`);
                    }
                    else {
                        let index = this.currentchoose.indexOf(`Mar${d}K${data.id}`);
                        this.currentchoose.splice(index, 1)
                        let index1 = store.state.marInfoTable.indexOf({id:`#Mar${d}K${data.id}`,source:data.source.name,target:data.target.name,type:data.type});
                        store.state.marInfoTable.splice(index1, 1)
                        
                        //取消选取

                         // 匹配IPv4地址的正则表达式
                         const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
                        // 使用match方法获取所有符合条件的IP地址
                        const ipList = data.source.name.match(ipPattern);   
                        const ipList2 = data.target.name.match(ipPattern);                       
                        for (let i = 0; i < ipList.length - 1; i++) {
                            for(let j = 0; j < store.state.MarFromUser.length; j++){
                                if(store.state.MarFromUser[j].id == ipList[i] && store.state.MarFromUser[j].parentId == ipList[i + 1]){
                                    store.state.MarFromUser[j].k -= 1
                                }
                                if(store.state.MarFromUser[j].id == ipList2[i] && store.state.MarFromUser[j].parentId == ipList2[i + 1]){
                                    store.state.MarFromUser[j].k -= 1
                                }
                                if(store.state.MarFromUser[j].k == 0){
                                    store.state.MarFromUser.splice(j,1)
                                    j-=1
                                }
                            }
                        }

                        // let a = [1,2,3,4,5,6,7,8,9]
                        // for(let i =0;i<a.length;i++){
                        //     if(a[i]==3 || a[i]==4){
                        //         a.splice(i,1)
                        //         i -=1
                        //     }
                        //     console.log(i,a[i]);
                        // }
                        // console.log(a);

                        console.log(store.state.MarFromUser);




                        d3.select(`#Mar${d}K${data.id}`)
                            .style("stroke", "#666666")
                            .style("stroke-dasharray", 0);
                        ElMessage.error("取消选取" + `Mar${d}K${data.id}`);
                    }
                })

            let linkText = plot.append('g')
                .attr('class', 'linkLabels')
                .selectAll('text')
                .data(linksData)
                .join('text')
                .text(d => d.type)
                .attr("x", function (d) {
                    return (d.source.x + d.target.x) / 2;
                })
                .attr("y", function (d) {
                    return (d.source.y + d.target.y) / 2;
                })

            let node = plot.append('g')
                .attr('class', 'nodes')
                .selectAll('circle')
                .data(nodesData)
                .enter()
                .append('circle')
                .attr('r', 10)
                .attr('fill', "#b256f0")
                .attr('stroke', "white")
                .attr('stroke-width', 2)
                .attr('cx', (d) => { return d.x })
                .attr('cy', (d) => { return d.y  })
                .on('mouseover',(d)=>{
                    // console.log('over_d:',d)
                    label.dispatch('show',{'detail':d.name})
                })
                .on('mouseout',(d)=>{
                    label.dispatch('hide',{'detail':d.name})
                })

            let label = plot.append('g')
                .attr('class', 'labels')
                .selectAll('text')
                .data(nodesData)
                .join('text')
                .text(d => d.name)
                .attr('x', function (d) {
                    return d.x - 0.5 * this.getBoundingClientRect().width
                })
                .attr('y', function (d) {
                    return d.y + 0.3 * this.getBoundingClientRect().height - 20
                })
                .attr('filter','url(#markovTextBackground)')
                .on('show',function(d){
                    if(d.name == d3.event.detail){
                        d3.select(this).style('display',null)
                    }
                })
                .on('hide',function(d){
                    if(d.name == d3.event.detail){
                        d3.select(this).style('display','none')
                    }
                })



                

            //设定zoom
            function zoomed() {
                plot.select('.nodes').attr("transform", d3.event.transform);
                plot.select('.links').attr("transform", d3.event.transform);
                plot.select('.labels').attr("transform", d3.event.transform);
                plot.select('.linkLabels').attr("transform", d3.event.transform);
            }
            const zoom = d3.zoom()
                .scaleExtent([0.1, 40])
                .translateExtent([[-10000, -10000], [width + 100000, height + 10000000]])
                // .filter(filter)
                .on("zoom", zoomed);
            svg.call(zoom)


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

            //取消文本的可见性
            label.style('display','none') //在最后取消可见性是因为要保持最优缩放连文本尺寸也算在内


        },
        circleColor(d) {
            if (d.sex === 'M') {
                return 'blue'
            } else {
                return 'pink'
            }
        },
        linkColor(d) {
            if (d.type === 'A') {
                return 'green'
            } else {
                return 'red'
            }
        }
    }
}
</script>
<style scoped>
svg {
    border: 1px solid #ccc;
}
</style>
<style>
.chart-row {
    display: flex;
}

.chart-column {
    width: 50%;
    display: flex;
}

.chart-column svg {
    width: 100%;
}

.links line {
    stroke: #999;
    stroke-opacity: 0.6;
}

.nodes circle {
    stroke: #fff;
    stroke-width: 0;
}

#markovchart {
    transform: scale(4);
}

.input-box {
    display: flex;
    align-items: center;
}

.input-box el-input {
    margin-right: 12px;
    width: 200px;
}
</style>
   