<template>
    <div class="mar-title">
        <h2 style="margin: 5px 5px;font-size: 30px;">马尔科夫链</h2>
    </div>
    <div>
        <el-tabs v-model="activeName">
            <el-tab-pane label="马尔科夫链" name="first">
                <el-button @click="handleFliter"><label style="font-size:20px">选取</label></el-button>
                <el-button type="danger" @click="clearAll()"><label style="font-size: 20px;">重置</label></el-button>
                <el-tabs v-model="activeName2" type="card">
                    <!-- <el-tabs v-model="activeName2" type="card" @tab-click="plotswitch"> -->
                    <el-tab-pane label="k=2" name="first">
                        <!-- <div v-loading="loading"> -->
                        <svg id="markovchart2" width="1450" height="800"></svg>
                        <!-- </div> -->
                    </el-tab-pane>
                    <el-tab-pane label="k=3" name="second">
                        <!-- <div v-loading="loading" > -->
                        <svg id="markovchart3" width="1450" height="800"></svg>
                        <!-- </div> -->
                    </el-tab-pane>
                    <el-tab-pane label="k=4" name="third">
                        <!-- <div v-loading="loading"> -->
                        <svg id="markovchart4" width="1450" height="800"></svg>
                        <!-- </div> -->

                    </el-tab-pane>
                </el-tabs>
                <!-- <div>
                <div class="chart-row">
                    <div class="chart-column">
                        <svg id="markovchart1" width="200" height="450" v-show="threshold >= 1"></svg>
                    </div>
                    <div class="chart-column">
                        <svg id="markovchart2" width="200" height="450" v-show="threshold >= 2"></svg>
                    </div>
                </div>
                <div class="chart-row">
                    <div class="chart-column">
                        <svg id="markovchart3" width="450" height="450" v-show="threshold >= 3"></svg>
                    </div>
                    <div class="chart-column">
                        <svg id="markovchart3" width="450" height="450" v-show="threshold >= 3"></svg>
                    </div>
                </div>
            </div> -->
            </el-tab-pane>
            <el-tab-pane label="详细信息" name="second">
                <marInfoTable></marInfoTable>
            </el-tab-pane>
            <el-tab-pane label="选取信息" name="third">
                <marChoose></marChoose>
            </el-tab-pane>
        </el-tabs>

    </div>
</template>
<script>
import * as d3 from 'd3'
import { store } from "../store/mesinfo"
import { linksUserCho, fetchMar2data, fetchMar3data, fetchMar4data, selectG, markovData, filIp } from "../api/index.ts"
import Login from './login.vue'
import { ElMessage, ElMessageBox } from "element-plus";
import marInfoTable from "../views/marInfoTable.vue"
import marChoose from "../views/marChoose.vue"
// import { fa } from 'element-plus/es/locale';
export default {
    components: { marInfoTable, marChoose },
    data() {
        return {
            threshold: 4,
            rootnum: 0,

            charts: [],
            currentchoose: [],
            activeName: "first",
            activeName2: "first",
            sum: true,
            marinfo2: [],
            marinfo3: [],
            marinfo4: [],
            k: [false, false, false],
            loading: true,

            stroke_width: 4 // 10.19增加测试模式 (stroke_width是宽度)
        }
    },

    mounted() {
    },
    methods: {
        clearAll() {
            store.state.clearF += 1
            store.state.MarFromUser = []
            ElMessage.error("清除成功！")
            for (let data in this.currentchoose) {
                console.log(this.currentchoose[data]);
                d3.select(`#${this.currentchoose[data]}`)
                    .style("stroke", "#666666")
                    .style("storke-dasharray", 0);
            } this.currentchoose = []
        },

        async handleFliter() {
            // 10.20分开绘制 重写绘制
            console.log(this.activeName2);
            let threshold = store.state.threshold
            let dataForchoose = []
            for (let i in store.state.filterresFromUser) {
                // console.log(store.state.mesinfo.list[store.state.filterresFromUser[i]-1]);
                dataForchoose.push(store.state.mesinfo.list[store.state.filterresFromUser[i] - 1])
                dataForchoose[i].timeForMar = (dataForchoose[i].timesecond - store.state.mesinfo.list[store.state.filterresFromUser[0] - 1].timesecond) / (store.state.timeSlice * 60000 * 10)
            }
            switch (this.activeName2) {

                case "first":
                    let markovBy_real = []
                    const dataSend = {
                        data: dataForchoose,
                        parameter: {
                            k: 2,
                            delta: store.state.formInline.threshold
                        }
                    }
                    await markovData(dataSend).then(res => {
                        markovBy_real = res.data
                        store.state.marcal2 = JSON.parse(JSON.stringify(res.data))
                    })
                    this.marinfo2 = markovBy_real
                    this.drawMarkov(2, markovBy_real, 1)
                    store.state.mar2 = markovBy_real
                    break;
                case "second":
                    let markovBy_real3 = []
                    const dataSend3 = {
                        data: dataForchoose,
                        parameter: {
                            k: 3,
                            delta: store.state.formInline.threshold
                        }
                    }
                    await markovData(dataSend3).then(res => {
                        markovBy_real3 = res.data
                        store.state.marcal3 = JSON.parse(JSON.stringify(res.data))
                    })
                    this.marinfo3 = markovBy_real3
                    this.drawMarkov(3, markovBy_real3, 1)
                    store.state.mar3 = markovBy_real3
                    break;
                case "third":
                    let markovBy_real4 = []
                    const dataSend4 = {
                        data: dataForchoose,
                        parameter: {
                            k: 4,
                            delta: store.state.formInline.threshold
                        }
                    }
                    await markovData(dataSend4).then(res => {
                        markovBy_real4 = res.data
                        store.state.marcal4 = JSON.parse(JSON.stringify(res.data))
                    })
                    this.marinfo4 = markovBy_real4
                    this.drawMarkov(4, markovBy_real4, 1)
                    store.state.mar4 = markovBy_real4
                    break;
            }
            // const dataSend = {
            //     data: dataForchoose,
            //     parameter: {
            //         k: 2,
            //         delta: store.state.formInline.threshold
            //     }
            // }
            // await markovData(dataSend).then(res => {
            //     markovBy_real = res.data
            //     store.state.marcal2 = JSON.parse(JSON.stringify(res.data))
            // })

            // let markovBy_real3 = []
            // const dataSend3 = {
            //     data: dataForchoose,
            //     parameter: {
            //         k: 3,
            //         delta: store.state.formInline.threshold
            //     }
            // }
            // await markovData(dataSend3).then(res => {
            //     markovBy_real3 = res.data
            //     store.state.marcal3 = JSON.parse(JSON.stringify(res.data))
            // })

            // let markovBy_real4 = []
            // const dataSend4 = {
            //     data: dataForchoose,
            //     parameter: {
            //         k: 4,
            //         delta: store.state.formInline.threshold
            //     }
            // }
            // await markovData(dataSend4).then(res => {
            //     markovBy_real4 = res.data
            //     store.state.marcal4 = JSON.parse(JSON.stringify(res.data))
            // })

            // this.marinfo2 = markovBy_real
            // this.marinfo3 = markovBy_real3
            // this.marinfo4 = markovBy_real4

            // this.drawMarkov(2, markovBy_real, 1)
            // this.drawMarkov(3, markovBy_real3, 1)
            // this.drawMarkov(4, markovBy_real4, 1)
            // store.state.mar2 = markovBy_real
            // store.state.mar3 = markovBy_real3
            // store.state.mar4 = markovBy_real4
        },
        plotswitch(tab) {
            console.log(tab.props.name);
            const d = tab.props.name == 'first' ? 2 :
                tab.props.name == 'second' ? 3 :
                    tab.props.name == 'third' ? 4 : 0;
            if (this.k[d - 2] == false) {
                this.drawMarkov(d)
                this.k[d - 2] = true
            }


        },
        async drawMarkov(d, markovBy_real, num) {
            ElMessage.success("开始绘制")
            // this.loading = true
            // console.log(`绘制#markovchart${d}`);
            let svg = d3.select(`#markovchart${d}`).attr('width', 1450).attr('height', 800)
            svg.selectAll('*').remove();
            let width = 1450
            let height = 804

            const plot = svg.append('g')
            // .attr('id', `markovchartplot${d}`)

            // 添加defs元素
            let defs = svg.append('defs')



            //定义marker
            defs.append('marker')
                // 10.20分开绘制 增加箭头id
                .attr('id', `markovhead${d}`)
                .attr('markerWidth', 4)
                .attr('markerHeight', 40)
                .attr('viewBox', '0 -5 12 12')
                .attr('refX', 25)
                .attr('refY', 0)
                .attr('orient', 'auto')
                .append('path')
                .attr('fill', '#666666')
                .attr('d', 'M 0,-5 L 10,0 L 0,5')
            // console.log(defs);

            //定义文字背景滤镜    
            let markovTextBackground = svg.append('filter')
                .attr('id', `markovTextBackground${d}`)
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
            // //获取数据
            // await fetchMar2data().then(res => {
            //     markovBy2 = res.data.link
            // })
            // await fetchMar3data().then(res => {
            //     markovBy3 = res.data.link
            // })

            // await fetchMar4data().then(res => {
            //     markovBy4 = res.data.link
            // })


            linksData = []
            const set = new Set();
            markovBy_real.forEach((value, index) => {
                // 10.19增加测试模式 bug(type的值按照给的数据来)
                linksData.push({ id: index, source: value.source, target: value.target, type: value.weight })
                set.add(value.source)
                set.add(value.target)
            })
            // store.state.mar2 = linksData
            const sourcesAndTargets = Array.from(set);
            nodesData = []
            sourcesAndTargets.forEach(item => {
                let data = { name: item }
                nodesData.push(data)
            })
            //利用力导引图模拟坐标
            let simulation = d3.forceSimulation()
                .nodes(nodesData)

            simulation
                .force('charge_force', d3.forceManyBody().strength(-60))
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
            let that = this
            let link = plot.append('g')
                .attr('class', 'links')
                .selectAll('line')
                .data(linksData)
                .enter()
                .append('line')
                .attr('id', function (data) { return `Mar${d}K${data.id}` })

                // 10.19增加测试模式 bug(stroke_width是宽度)
                .attr('stroke-width', function (d) {
                    return Math.log(parseInt(d.type) * parseInt(that.stroke_width));
                })
                .style('stroke', "#666666")
                .style('cursor', 'pointer')
                // 10.20分开绘制 增加箭头id
                .attr('marker-end', `url(#markovhead${d})`)
                .attr('x1', (d) => { return d.source.x })
                .attr('y1', (d) => { return d.source.y })
                .attr('x2', (d) => { return d.target.x })
                .attr('y2', (d) => { return d.target.y })
                .on("contextmenu", async data => {
                    event.preventDefault();
                    let mes = {
                        name: data.target.name,
                        data: linksData,
                        node: nodesData
                    }
                    let result = []
                    await selectG(mes).then(res => {
                        res.data.forEach(e => {
                            result.push(linksData[e])
                            d3.select(`#Mar${d}K${e}`)
                                .style("stroke", "#0fb2cc")
                                .style("stroke-dasharray", 0);
                        })
                    })
                    if (this.currentchoose.find(e => e == `Mar${d}K${data.id}`) == null) {
                        result.forEach(dataAll => {
                            this.currentchoose.push(`Mar${d}K${dataAll.id}`)
                            // 匹配IPv4地址的正则表达式
                            const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
                            // 使用match方法获取所有符合条件的IP地址
                            const ipList = dataAll.source.name.match(ipPattern);
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
                            const ipList2 = dataAll.target.name.match(ipPattern);
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
                            store.state.marInfoTable.push({ id: `#Mar${d}K${dataAll.id}`, source: dataAll.source.name, target: dataAll.target.name, type: dataAll.type })
                            ElMessage.success("选取成功" + `Mar${d}K${dataAll.id}`);

                        })
                    } else {
                        result.forEach(dataAll => {
                            let index = this.currentchoose.indexOf(`Mar${d}K${dataAll.id}`);
                            this.currentchoose.splice(index, 1)

                            let index1 = store.state.marInfoTable.indexOf({ id: `#Mar${d}K${dataAll.id}`, source: dataAll.source.name, target: dataAll.target.name, type: dataAll.type });
                            store.state.marInfoTable.splice(index1, 1)
                            //取消选取
                            // 匹配IPv4地址的正则表达式
                            const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
                            // 使用match方法获取所有符合条件的IP地址
                            const ipList = dataAll.source.name.match(ipPattern);
                            const ipList2 = dataAll.target.name.match(ipPattern);
                            for (let i = 0; i < ipList.length - 1; i++) {
                                for (let j = 0; j < store.state.MarFromUser.length; j++) {
                                    if (store.state.MarFromUser[j].id == ipList[i] && store.state.MarFromUser[j].parentId == ipList[i + 1]) {
                                        store.state.MarFromUser[j].k -= 1
                                    }
                                    if (store.state.MarFromUser[j].id == ipList2[i] && store.state.MarFromUser[j].parentId == ipList2[i + 1]) {
                                        store.state.MarFromUser[j].k -= 1
                                    }
                                    if (store.state.MarFromUser[j].k == 0) {
                                        store.state.MarFromUser.splice(j, 1)
                                        j -= 1
                                    }
                                }
                            }
                            console.log(store.state.MarFromUser);
                            d3.select(`#Mar${d}K${dataAll.id}`)
                                .style("stroke", "#666666")
                                .style("stroke-dasharray", 0);
                            ElMessage.error("取消选取" + `Mar${d}K${dataAll.id}`);
                        })
                    }

                })
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
                        store.state.marInfoTable.push({ id: `#Mar${d}K${data.id}`, source: data.source.name, target: data.target.name, type: data.type })


                        d3.select(`#Mar${d}K${data.id}`)
                            .style("stroke", "#0fb2cc")
                            .style("stroke-dasharray", 0);
                        ElMessage.success("选取成功" + `Mar${d}K${data.id}`);
                    }
                    else {
                        let index = this.currentchoose.indexOf(`Mar${d}K${data.id}`);
                        console.log(index);
                        this.currentchoose.splice(index, 1)
                        let index1 = store.state.marInfoTable.indexOf({ id: `#Mar${d}K${data.id}`, source: data.source.name, target: data.target.name, type: data.type });
                        console.log(index1);
                        store.state.marInfoTable.splice(index1, 1)
                        //取消选取
                        // 匹配IPv4地址的正则表达式
                        const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
                        // 使用match方法获取所有符合条件的IP地址
                        const ipList = data.source.name.match(ipPattern);
                        const ipList2 = data.target.name.match(ipPattern);
                        for (let i = 0; i < ipList.length - 1; i++) {
                            for (let j = 0; j < store.state.MarFromUser.length; j++) {
                                if (store.state.MarFromUser[j].id == ipList[i] && store.state.MarFromUser[j].parentId == ipList[i + 1]) {
                                    store.state.MarFromUser[j].k -= 1
                                }
                                if (store.state.MarFromUser[j].id == ipList2[i] && store.state.MarFromUser[j].parentId == ipList2[i + 1]) {
                                    store.state.MarFromUser[j].k -= 1
                                }
                                if (store.state.MarFromUser[j].k == 0) {
                                    store.state.MarFromUser.splice(j, 1)
                                    j -= 1
                                }
                            }
                        }
                        console.log(store.state.MarFromUser);
                        console.log(d3.select(`#Mar${d}K${data.id}`));
                        d3.select(`#Mar${d}K${data.id}`)
                            .style("stroke", "#666666")
                            .style("stroke-dasharray", 0);
                        ElMessage.error("取消选取" + `Mar${d}K${data.id}`);
                    }
                })
                .on('mouseover', (d) => {
                    // console.log('over_d:',d)
                    linkText.dispatch('show', { 'detail': d.id })
                })
                .on('mouseout', (d) => {
                    linkText.dispatch('hide', { 'detail': d.id })
                })



            let linkText = plot.append('g')
                .attr('class', 'linkLabels')
                .selectAll('text')
                .data(linksData)
                .join('text')
                .text(d => d.type)
                .style('display', 'none')
                .attr("x", function (d) {
                    return (d.source.x + d.target.x) / 2;
                })
                .attr("y", function (d) {
                    return (d.source.y + d.target.y) / 2;
                })
                .on('show', function (d) {
                    if (d.id == d3.event.detail) {
                        d3.select(this).style('display', null)
                    }
                })
                .on('hide', function (d) {
                    if (d.id == d3.event.detail) {
                        d3.select(this).style('display', 'none')
                    }
                })


            // function drag(simulation) {

            //     function dragstarted(event) {
            //         console.log(event);
            //         if (!event.active) simulation.alphaTarget(0.3).restart();
            //         event.vx = event.x;
            //         event.vy = event.y;
            //     }

            //     function dragged(event) {
            //         event.vx = event.x;
            //         event.vy = event.y;
            //     }

            //     function dragended(event) {
            //         if (!event.active) simulation.alphaTarget(0);
            //         event.vx = null;
            //         event.vy = null;
            //     }

            //     return d3.drag()
            //         .on("start", dragstarted)
            //         .on("drag", dragged)
            //         .on("end", dragended);
            // }


            function started(d) {
                // simulation.on('tick', ticked)
                console.log(d);
                if (!d3.event.active) {
                    simulation.alphaTarget(.2).restart()
                }
                d.fx = d.x // fx fy 表示节点一下次节点被固定的位置
                d.fy = d.y
            }

            function dragged(d) {
                // simulation.on('tick', ticked)
                d.fx = d3.event.x
                d.fy = d3.event.y
            }

            function ended(d) {
                // simulation.on('tick', ticked)
                if (!d3.event.active) {
                    simulation.alphaTarget(0)
                }
                d.fx = d.x
                d.fy = d.y
            }

            //把form表单中 IP段；IP段 分割
            let IPfromChoose = []
            if (store.state.formInline.user != "") {
                IPfromChoose = store.state.formInline.user.split(";")
            }

            let node = plot.append('g')
                .attr('class', 'nodes')
                .selectAll('circle')
                .data(nodesData)
                .enter()
                .append('circle')
                .attr('r', 5)
                // .attr('fill', "#b256f0")
                .attr("fill", function (d) {
                    //对筛选条件进行判断，若是筛选的标红
                    if (IPfromChoose != []) {
                        for (let i = 0; i < IPfromChoose.length; i++) {
                            let ip = IPfromChoose[i].split(".")[0] + '.' + IPfromChoose[i].split(".")[1] + '.' + IPfromChoose[i].split(".")[2]
                            if (d.name.match(ip)) {
                                return "red"
                            }
                        }
                        return "#b256f0"
                    } else {
                        return "#b256f0"
                    }
                })

                // .attr('fill',(d)=>{
                //     if(d.name.match(store.state.filtermes.ip)){
                //         return 'red'
                //     }else{
                //         return "#b256f0"
                //     }
                // })
                // .attr('stroke', "white")
                // .attr('stroke-width', 2)
                .attr('cx', (d) => { return d.x })
                .attr('cy', (d) => { return d.y })
                .on('mouseover', (d) => {
                    // console.log('over_d:',d)
                    label.dispatch('show', { 'detail': d.name })
                })
                .on('mouseout', (d) => {
                    label.dispatch('hide', { 'detail': d.name })
                })
                .call(d3.drag()
                    .on('start', started)
                    .on('drag', dragged)
                    .on('end', ended))

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
                .attr('filter', `url(#markovTextBackground${d})`)
                .on('show', function (d) {
                    if (d.name == d3.event.detail) {
                        d3.select(this).style('display', null)
                    }
                })
                .on('hide', function (d) {
                    if (d.name == d3.event.detail) {
                        d3.select(this).style('display', 'none')
                    }
                })

            // simulation.on('tick', ticked)

            // function ticked() {
            //     link.attr('x1', d => d.source.x)
            //         .attr('y1', d => d.source.y)
            //         .attr('x2', d => d.target.x)
            //         .attr('y2', d => d.target.y)

            //     node.attr('cx', d => d.x)
            //         .attr('cy', d => d.y)

            //     label.attr('x', d => d.x)
            //         .attr('y', d => d.y)
            // }





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

            // //取消文本的可见性
            label.style('display', 'none') //在最后取消可见性是因为要保持最优缩放连文本尺寸也算在内

            this.loading = false




            //   invalidation.then(() => simulation.stop());


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
    },
    computed: {
        fil() {
            return this.sum
        },
        clearFF() {
            return store.state.clearF
        },
        // draw() {
        //     return store.state.drawMar
        // }
    },
    watch: {
        // draw: {
        //     deep: true,
        //     handler() {
        //         if (store.state.drawMar == true && this.k[0] == false) {
        //             this.drawMarkov(2)
        //             this.k[0] = true

        //         }
        //     }
        // }
        fil: {
            deep: true,
            handler() {
                if (this.sum -= true) {
                    this.drawMarkov(2, this.marinfo2, 1)
                    this.drawMarkov(3, this.marinfo3, 1)
                    this.drawMarkov(4, this.marinfo4, 1)
                } else {
                    this.drawMarkov(2, this.marinfo2, 0)
                    this.drawMarkov(3, this.marinfo3, 0)
                    this.drawMarkov(4, this.marinfo4, 0)
                }
            }
        }

    }
}
</script>
<style scoped>
svg {
    border: 1px solid #ccc;
}

::v-deep .el-tabs_item {
    font-size: 20px !important;
}

.chart-row {
    display: flex;
    justify-content: center;
}

.chart-column {
    width: 30%;
    height: 30%;
    display: flex;
}

.chart-column svg {
    width: 100%;
}

/* .links line {
    stroke: #999;
    stroke-opacity: 0.6;
} */

/* .nodes circle {
    stroke: #fff;
    stroke-width: 0;
} */

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

.mar-title {
    display: flex;
    color: white;
    background-color: #6d6d6d;
}
</style>
   