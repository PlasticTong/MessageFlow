<template>
    <div class="mar-title">
        <h2 style="margin: 5px 5px;font-size: 30px;">指挥结构</h2>
    </div>
    <div>
        <!-- <el-checkbox v-model="showline" @change="connect">显示连线</el-checkbox> -->
        <el-button @click="exportData"><label style="font-size:20px">导出</label></el-button>
    </div>
    <!-- <el-button @click="drawLink">连线</el-button> -->
    <el-tabs v-model="activeName2" type="card" @tab-click="plotswitch">
        <el-tab-pane label="单层" name="first">
            <div v-loading="loading" class='chart-column'>
                <svg id='dTree-plot-one' height="800" width="1497px"></svg>
            </div>
        </el-tab-pane>
        <el-tab-pane label="多层" name="second">
            <div id="mutil">
                <div style="width:800px;height:1000px">
                    <MultiLayer @exportChosenData="handleExportChoseData" ref="MultiLayer" />
                </div>
            </div>
        </el-tab-pane>
        <!-- <el-tab-pane label="三层" name="third">
            <div v-loading="loading" class='chart-column'>

            </div>

        </el-tab-pane> -->
    </el-tabs>
</template>
   
<script>
import dagreD3 from 'dagre-d3';
import * as d3 from 'd3';
import { store } from "../store/mesinfo"
import { fetchMesData, testflask, mutiDraw, fetchMutiLinks, fetchMutiNodes } from "../api/index";
import { createWebHistory } from 'vue-router';
import { groupSort, group, sort } from 'd3-array'
import MultiLayer from '../views/MultiLayer.vue'
// import {  sort } from 'd3-array'

export default {
    name: 'dagre',
    components: {
        MultiLayer
    },
    data() {
        return {
            nodedown: [],
            linksdown: [],

            node2Draw: [],
            link2Draw: [],
            node1Draw: [],
            link1Draw: [],
            activeName2: 'first',

            numselect: 0,
            showline: true,
            loading: false,
            flag: 0,
            nodeForchoose: {
                "time_range": [],
                // "nodes": [],
                "links": [],
                // "linksindex": [],
            }
        };
    },
    mounted() {
        // this.drawLayer();
        // const svg = d3.select('#dTree-plot');
        // console.log(svg.attr('width'));
    },
    computed: {
        NodeMarFromUser() {
            return store.state.MarFromUser
        },
        timeSelect() {
            return store.state.linkFByTime
        }
    },

    watch: {
        NodeMarFromUser: {
            deep: true,
            handler() {
                // this.drawLayer();
                // console.log(this.numselect);
                // this.drawLayer();
                this.drawOne()
                this.flag = 0
                this.nodeForchoose =  {
                "time_range": [],
                // "nodes": [],
                "links": [],
                // "linksindex": [],
            }

            }
        },
        timeSelect: {
            deep: true,
            handler() {
                this.link2Draw = JSON.parse(JSON.stringify(store.state.linkFByTimeDraw));
                const nodesDataForDraw = []
                store.state.nodeFByTime.forEach((e, index) => {
                    let str = e.name.replace(/\./g, '');
                    nodesDataForDraw.push({ id: index, nameRe: str, name: e.name })
                })
                this.node2Draw = nodesDataForDraw
                this.flag = 0
                // fetchMesData().then(res => {


                //     const mesByTime1 = res.data.list.filter((e) => { return e.time <= store.state.time.end && e.time > store.state.time.start })
                //     const uniqueArr = mesByTime1.filter((item, index) => {
                //         return !mesByTime1.slice(0, index).some((prevItem) => {
                //             return (prevItem.target === item.target && prevItem.source === item.source);
                //         });
                //     });
                //     this.linksdown = JSON.parse(JSON.stringify(uniqueArr));
                //     this.link2Draw = uniqueArr

                //     const nodeset = new Set()
                //     uniqueArr.forEach(function (e) {
                //         nodeset.add(e.source)
                //         nodeset.add(e.target)
                //     })
                //     const nodesDataForDraw = []
                //     Array.from(nodeset).forEach((e, index) => {
                //         let str = e.replace(/\./g, '');

                //         nodesDataForDraw.push({ id: index, nameRe: str, name: e })
                //     })
                //     const linkss = []
                //     uniqueArr.forEach(e => {
                //         const source = nodesDataForDraw.find(ele => ele.name == e.source).id
                //         const target = nodesDataForDraw.find(ele => ele.name == e.target).id
                //         linkss.push([source, target])
                //     })
                //     this.linksdown = JSON.parse(JSON.stringify(linkss));
                //     this.node2Draw = nodesDataForDraw
                // })

            }
        }
    },

    methods: {
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
        exportData() {
            this.nodeForchoose.time_range = store.state.timeSlect
            console.log(this.nodeForchoose);
        },
        drawMutiLayers() {
            let nodeForMuti = []
            let linkForMuti = []
            // console.log(store.state.MarFromUser);
            // console.log(store.state.linkFByTime);
            // 组织结构数据
            // console.log(store.state.MarFromUser);
            let nodeset = new Set()
            let nameset = new Set()
            for (let n in store.state.userinfo.list) {
                nameset.add(store.state.userinfo.list[n].dept)
            }


            for (let n in store.state.MarFromUser) {
                nodeset.add(store.state.MarFromUser[n].id)
                nodeset.add(store.state.MarFromUser[n].parentId)
                // nameset.add(store.state.userinfo.list.find(e=>e.name == store.state.MarFromUser[n].id && e.name == store.state.MarFromUser[n].parentId).dept)
                // 第1层连线 dept
                linkForMuti.push([store.state.userinfo.list.find(e => e.name == store.state.MarFromUser[n].id).dept, store.state.userinfo.list.find(e => e.name == store.state.MarFromUser[n].parentId).dept, "dir"])
                // 第2层连线 address
                linkForMuti.push([store.state.userinfo.list.find(e => e.name == store.state.MarFromUser[n].id).address, store.state.userinfo.list.find(e => e.name == store.state.MarFromUser[n].parentId).address, "dir"])
                // 第3层连线 IP
                linkForMuti.push([store.state.MarFromUser[n].id, store.state.MarFromUser[n].parentId, "dir"])

            }
            nodeset = Array.from(nodeset)
            nameset = Array.from(nameset)
            for (let n in nodeset) {
                nodeForMuti.push({ "index": nodeset[n], "layer": 2 }, { "index": store.state.userinfo.list.find(e => e.name == nodeset[n]).address, "layer": 1 })
                linkForMuti.push([store.state.userinfo.list.find(e => e.name == nodeset[n]).address, nodeset[n], "undir"])
                linkForMuti.push([store.state.userinfo.list.find(e => e.name == nodeset[n]).dept, store.state.userinfo.list.find(e => e.name == nodeset[n]).address, "undir"])

            }

            for (let n in nameset) {
                nodeForMuti.push({ "index": nameset[n], "layer": 0 })


            }
            console.log(linkForMuti, nodeForMuti);

            //nodes : [{'index':'1',layer:1,...},{'index':'2',layer:0,...},...]
            //links : [[index1,index2],...]


            // let nodesa = [{ "index": "192.68.1.1", "layer": 0 }, { "index": 1, "layer": 0 }, { "index": 2, "layer": 0 }, { "index": 3, "layer": 0 }, { "index": 4, "layer": 0 }, { "index": 5, "layer": 0 }, { "index": 6, "layer": 0 }, { "index": 7, "layer": 0 }, { "index": 8, "layer": 0 }, { "index": 9, "layer": 0 }, { "index": 10, "layer": 1 }, { "index": 11, "layer": 1 }, { "index": 12, "layer": 1 }, { "index": 13, "layer": 1 }, { "index": 14, "layer": 1 }, { "index": 15, "layer": 1 }, { "index": 16, "layer": 1 }, { "index": 17, "layer": 1 }, { "index": 18, "layer": 1 }, { "index": 19, "layer": 1 }, { "index": 20, "layer": 1 }, { "index": 21, "layer": 1 }, { "index": 22, "layer": 1 }, { "index": 23, "layer": 1 }, { "index": 24, "layer": 1 }, { "index": 25, "layer": 1 }, { "index": 26, "layer": 1 }, { "index": 27, "layer": 1 }, { "index": 28, "layer": 1 }, { "index": 29, "layer": 1 }, { "index": 30, "layer": 2 }, { "index": 31, "layer": 2 }, { "index": 32, "layer": 2 }, { "index": 33, "layer": 2 }, { "index": 34, "layer": 2 }, { "index": 35, "layer": 2 }, { "index": 36, "layer": 2 }, { "index": 37, "layer": 2 }, { "index": 38, "layer": 2 }, { "index": 39, "layer": 2 }, { "index": 40, "layer": 2 }, { "index": 41, "layer": 2 }, { "index": 42, "layer": 2 }, { "index": 43, "layer": 2 }, { "index": 44, "layer": 2 }, { "index": 45, "layer": 2 }, { "index": 46, "layer": 2 }, { "index": 47, "layer": 2 }, { "index": 48, "layer": 2 }, { "index": 49, "layer": 2 }, { "index": 50, "layer": 2 }, { "index": 51, "layer": 2 }, { "index": 52, "layer": 2 }, { "index": 53, "layer": 2 }, { "index": 54, "layer": 2 }, { "index": 55, "layer": 2 }, { "index": 56, "layer": 2 }, { "index": 57, "layer": 2 }, { "index": 58, "layer": 2 }, { "index": 59, "layer": 2 }, { "index": 60, "layer": 2 }, { "index": 61, "layer": 2 }, { "index": 62, "layer": 2 }, { "index": 63, "layer": 2 }, { "index": 64, "layer": 2 }, { "index": 65, "layer": 2 }, { "index": 66, "layer": 2 }, { "index": 67, "layer": 2 }, { "index": 68, "layer": 2 }, { "index": 69, "layer": 2 }, { "index": 70, "layer": 3 }, { "index": 71, "layer": 3 }, { "index": 72, "layer": 3 }, { "index": 73, "layer": 3 }, { "index": 74, "layer": 3 }, { "index": 75, "layer": 3 }, { "index": 76, "layer": 3 }, { "index": 77, "layer": 3 }, { "index": 78, "layer": 3 }, { "index": 79, "layer": 3 }, { "index": 80, "layer": 3 }, { "index": 81, "layer": 3 }, { "index": 82, "layer": 3 }, { "index": 83, "layer": 3 }, { "index": 84, "layer": 3 }, { "index": 85, "layer": 3 }, { "index": 86, "layer": 3 }, { "index": 87, "layer": 3 }, { "index": 88, "layer": 3 }, { "index": 89, "layer": 3 }, { "index": 90, "layer": 3 }, { "index": 91, "layer": 3 }, { "index": 92, "layer": 3 }, { "index": 93, "layer": 3 }, { "index": 94, "layer": 3 }, { "index": 95, "layer": 3 }, { "index": 96, "layer": 3 }, { "index": 97, "layer": 3 }, { "index": 98, "layer": 3 }, { "index": 99, "layer": 3 }, { "index": 100, "layer": 3 }, { "index": 101, "layer": 3 }, { "index": 102, "layer": 3 }, { "index": 103, "layer": 3 }, { "index": 104, "layer": 3 }, { "index": 105, "layer": 3 }, { "index": 106, "layer": 3 }, { "index": 107, "layer": 3 }, { "index": 108, "layer": 3 }, { "index": 109, "layer": 3 }, { "index": 110, "layer": 3 }, { "index": 111, "layer": 3 }, { "index": 112, "layer": 3 }, { "index": 113, "layer": 3 }, { "index": 114, "layer": 3 }, { "index": 115, "layer": 3 }, { "index": 116, "layer": 3 }, { "index": 117, "layer": 3 }, { "index": 118, "layer": 3 }, { "index": 119, "layer": 3 }, { "index": 120, "layer": 3 }, { "index": 121, "layer": 3 }, { "index": 122, "layer": 3 }, { "index": 123, "layer": 3 }, { "index": 124, "layer": 3 }, { "index": 125, "layer": 3 }, { "index": 126, "layer": 3 }, { "index": 127, "layer": 3 }, { "index": 128, "layer": 3 }, { "index": 129, "layer": 3 }, { "index": 130, "layer": 3 }, { "index": 131, "layer": 3 }, { "index": 132, "layer": 3 }, { "index": 133, "layer": 3 }, { "index": 134, "layer": 3 }, { "index": 135, "layer": 3 }, { "index": 136, "layer": 3 }, { "index": 137, "layer": 3 }, { "index": 138, "layer": 3 }, { "index": 139, "layer": 3 }, { "index": 140, "layer": 3 }, { "index": 141, "layer": 3 }, { "index": 142, "layer": 3 }, { "index": 143, "layer": 3 }, { "index": 144, "layer": 3 }, { "index": 145, "layer": 3 }, { "index": 146, "layer": 3 }, { "index": 147, "layer": 3 }, { "index": 148, "layer": 3 }, { "index": 149, "layer": 3 }]
            // let linksa = [["192.68.1.1", 4, "undir"], [2, 8, "undir"], [3, 7, "dir"], [10, 19, "undir"], [15, 19, "dir"], [15, 29, "undir"], [16, 19, "dir"], [21, 22, "undir"], [30, 39, "undir"], [31, 49, "dir"], [33, 37, "dir"], [33, 45, "dir"], [33, 59, "undir"], [33, 62, "undir"], [34, 63, "dir"], [35, 66, "undir"], [36, 53, "dir"], [37, 38, "undir"], [37, 40, "undir"], [37, 45, "undir"], [38, 40, "undir"], [38, 55, "undir"], [38, 69, "dir"], [40, 49, "dir"], [40, 62, "dir"], [42, 60, "undir"], [44, 51, "undir"], [45, 64, "dir"], [51, 61, "undir"], [59, 62, "dir"], [59, 65, "dir"], [61, 65, "undir"], [62, 65, "undir"], [70, 133, "undir"], [71, 109, "undir"], [71, 112, "undir"], [72, 87, "undir"], [73, 75, "dir"], [73, 88, "dir"], [73, 102, "dir"], [73, 127, "dir"], [73, 135, "dir"], [74, 88, "dir"], [74, 144, "dir"], [75, 102, "undir"], [75, 134, "dir"], [76, 125, "dir"], [77, 81, "dir"], [77, 86, "dir"], [77, 116, "dir"], [77, 141, "undir"], [78, 122, "undir"], [79, 97, "undir"], [80, 84, "dir"], [80, 91, "undir"], [80, 107, "dir"], [81, 85, "dir"], [83, 92, "undir"], [83, 140, "undir"], [83, 142, "dir"], [84, 91, "undir"], [84, 107, "dir"], [85, 93, "undir"], [85, 103, "undir"], [86, 95, "undir"], [86, 116, "dir"], [86, 141, "undir"], [87, 121, "dir"], [87, 124, "dir"], [88, 127, "dir"], [88, 135, "undir"], [88, 144, "dir"], [89, 118, "undir"], [89, 148, "undir"], [91, 107, "undir"], [91, 138, "undir"], [92, 140, "undir"], [92, 142, "undir"], [93, 103, "dir"], [93, 116, "undir"], [95, 116, "dir"], [95, 141, "dir"], [96, 105, "dir"], [96, 138, "undir"], [97, 110, "undir"], [97, 123, "dir"], [97, 143, "dir"], [98, 129, "undir"], [99, 149, "undir"], [102, 104, "dir"], [102, 134, "dir"], [104, 128, "dir"], [106, 115, "undir"], [106, 125, "undir"], [107, 138, "undir"], [108, 147, "undir"], [110, 143, "undir"], [115, 125, "undir"], [116, 141, "undir"], [118, 136, "undir"], [118, 148, "undir"], [121, 124, "undir"], [121, 139, "undir"], [124, 139, "undir"], [127, 144, "undir"], [132, 137, "undir"], [132, 142, "undir"], [134, 135, "undir"], [136, 148, "dir"], [139, 147, "dir"], [1, 17, "undir"], [2, 21, "dir"], [13, 63, "dir"], [23, 66, "dir"], [27, 31, "dir"], [13, 68, "dir"], [39, 140, "dir"], [66, 146, "undir"], [62, 74, "undir"], [56, 72, "undir"], [41, 149, "dir"], [38, 95, "dir"], [49, 118, "undir"], [52, 88, "undir"]]
            // nodesa = nodesa.map(node => ({ ...node, name: 111 }));
            // console.log(nodesa);
            fetchMutiLinks().then(res => {
                let links1 = linkForMuti
                fetchMutiNodes().then(res => {
                    let nodes = nodeForMuti
                    //处理数据
                    let outerLinks = []
                    let innerGraphs = []
                    let node_to_layer_map = new Map()
                    console.log(node_to_layer_map);
                    for (let n of nodes) {
                        node_to_layer_map.set(n['index'], n['layer'], n['name'])
                    }
                    let node_groups = Array.from(group(nodes, d => d.layer));
                    node_groups = sort(node_groups, (a, b) => {
                        return parseInt(a[0]) - parseInt(b[0])
                    });
                    node_groups.forEach((n, i) => {
                        let iGraph = {
                            'nodes': n[1].map(v => {
                                return {
                                    'id': v.index,
                                    'message': {
                                        'title': `${v.index}`,
                                        'data': [
                                            ['id', v.index]
                                        ]
                                    },
                                }
                            }),
                            'links': [],
                        }


                        //获取innerLinks
                        for (let l of links1) {
                            if (node_to_layer_map.get(l[0]) == i && node_to_layer_map.get(l[1]) == i) {
                                iGraph.links.push({
                                    'source': l[0],
                                    'target': l[1],
                                    'type': l[2],
                                    'message': {
                                        'title': l[2] == 'dir' ? `指向：${l[0]} -> ${l[1]}` : `连接：${l[0]} - ${l[1]}`,
                                        'data': [
                                            l[2] == 'dir' ? ['指向', `${l[0]} -> ${l[1]}`] : ['连接', `${l[0]} - ${l[1]}`]
                                        ]
                                    }
                                })
                            }
                        }

                        innerGraphs.push(iGraph)
                    })
                    for (let i = 0; i < innerGraphs.length - 1; i++) {
                        outerLinks.push({
                            'links': []
                        })
                    }
                    console.log(outerLinks);
                    //获取outerLinks
                    for (let l of links1) {
                        if (node_to_layer_map.get(l[0]) != node_to_layer_map.get(l[1])) {
                            console.log(l);
                            console.log(node_to_layer_map.get(l[0]), node_to_layer_map.get(l[1]));
                            console.log(outerLinks[Math.min(node_to_layer_map.get(l[0]), node_to_layer_map.get(l[1]))]);
                            outerLinks[Math.min(node_to_layer_map.get(l[0]), node_to_layer_map.get(l[1]))].links.push({
                                'source': l[0],
                                'target': l[1],
                                'type': 'undir',
                                'message': {
                                    'title': l[2] == 'dir' ? `指向：${l[0]} -> ${l[1]}` : `连接：${l[0]} - ${l[1]}`,
                                    'data': [
                                        ['连接', `${l[0]} - ${l[1]}`]
                                    ]
                                }
                            })
                        }
                    }

                    // console.log(innerGraphs, outerLinks);
                    this.$refs['MultiLayer'].setData(innerGraphs, outerLinks)
                    this.$refs['MultiLayer'].draw()
                })
            })
        },
        handleExportChoseData(val) {
            console.log('chosen:', val)
        },
        plotswitch(tab) {
            console.log(this.flag);
            if (tab.props.name == 'second' && this.flag == 0) {
                this.flag = 1
                this.drawMutiLayers()
            }


        },
        drawOne() {
            const svg = d3.select('#dTree-plot-one');
            svg.selectAll('*').remove()
            let width = 1472
            let height = 804
            const plot = svg.append('g')
            let defs = svg.append('defs')
            //定义marker箭头
            defs.append('marker')
                .attr('id', 'degreeArrowhead')
                .attr('markerWidth', 4)
                .attr('markerHeight', 4)
                .attr('viewBox', '0 -5 12 12')
                .attr('refX', 25)
                .attr('refY', 0)
                .attr('orient', 'auto')
                .append('path')
                .attr('fill', '#434343')
                .attr('d', 'M 0,-5 L 10,0 L 0,5')


            /**
             * 
             * 准备数据
             * 
             */
            //local准备数据
            const data1 = store.state.MarFromUser;
            let node1Draw = new Set()
            let link1Draw = []
            let n = 0
            for (let link of data1) {
                if (link['id'] !== undefined && link['parentId'] !== undefined) {
                    link1Draw.push({ 'source': link['id'], 'target': link['parentId'], "index": n })
                    n++
                    node1Draw.add(link['id'])
                    node1Draw.add(link['parentId'])
                }
            }
            node1Draw = Array.from(node1Draw).map(v => {
                let str = v.replace(/\./g, ''); // 使用正则表达式替换掉所有的"."字符
                return { 'name': v, 'nameRe': str }
            })








            //创建元素
            let link = plot.append('g')
                .attr('class', 'links')
                .selectAll('line')
                .data(link1Draw)
                .enter()
                .append('line')
                .attr('id', (data) => { return `Deg${data.index}` })
                .attr('stroke-width', 4)
                .style('stroke', "#666666")
                .style('cursor', 'pointer')
                .attr('marker-end', `url(#degreeArrowhead)`)
                .attr('x1', (d) => { return d.source.x })
                .attr('y1', (d) => { return d.source.y })
                .attr('x2', (d) => { return d.target.x })
                .attr('y2', (d) => { return d.target.y })
                .on("contextmenu", data => {
                    event.preventDefault();
                    // console.log(data);
                    d3.select(`#Deg${data.index}`).style('display', 'none')
                })
                .on("click", data => {
                    console.log(data);
                    
                    if (this.nodeForchoose.links.find(e => e.index == data.index) == null) {
                        d3.select(`#Deg${data.index}`).style('stroke', "red")
                        this.nodeForchoose.links.push({'source':data.source.name,'target':data.target.name,"index":data.index})
                        console.log(this.nodeForchoose.links);
                    }else{
                        d3.select(`#Deg${data.index}`).style('stroke', "#666666")
                        let index = this.nodeForchoose.links.indexOf({'source':data.source.name,'target':data.target.name,"index":data.index});
                        this.nodeForchoose.links.splice(index, 1)
                        console.log(this.nodeForchoose.links);
                    }

                })




            let node = plot.append('g')
                .attr('class', 'nodes')
                .selectAll('circle')
                .data(node1Draw)
                .enter()
                .append('circle')
                .attr('id', (data) => { return `DegNode${data.nameRe}` })
                .attr('r', 20)
                .attr('fill', "#b256f0")
                .attr('stroke', "white")
                .attr('stroke-width', 2)
                .attr('cx', (d) => { return d.x })
                .attr('cy', (d) => { return d.y })
                // .on('mouseover', (d) => {
                //     // console.log('over_d:',d)
                //     label.dispatch('show', { 'detail': d.name })
                // })
                // .on('mouseout', (d) => {
                //     label.dispatch('hide', { 'detail': d.name })
                // })
                .call(d3.drag()
                    .on('start', started)
                    .on('drag', dragged)
                    .on('end', ended))
            // .on("contextmenu", data => {
            //     event.preventDefault();
            //     console.log(data);
            //     d3.select(`#DegNode${data.nameRe}`).attr('fill', "red")
            // })
            let label = plot.append('g')
                .attr('class', 'labels')
                .selectAll('text')
                .data(node1Draw)
                .join('text')
                .text(function (d) { return store.state.userinfo.list.find(e => e.name == d.name).address })
                .attr('x', function (d) {
                    return d.x - 0.5 * this.getBoundingClientRect().width
                })
                .attr('y', function (d) {
                    return d.y + 0.3 * this.getBoundingClientRect().height - 20
                })
                // .attr('filter', `url(#markovTextBackground${d})`)
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
                // .on("contextmenu", data => {
                //     event.preventDefault();
                //     d3.select(`#DegNode${data.nameRe}`).attr('fill', "red")
                //     this.nodeForchoose.nodes.push(data.name)
                // })
                .call(d3.drag()
                    .on('start', started)
                    .on('drag', dragged)
                    .on('end', ended))

            //利用力导引图模拟坐标
            let simulation = d3.forceSimulation()
                .nodes(node1Draw)

            simulation
                .force('charge_force', d3.forceManyBody().strength(-600))
                .force('center_force', d3.forceCenter(width / 2, height / 2))

            let linkForce = d3.forceLink(link1Draw)
                .id((d) => { return d.name })
            simulation.force('links', linkForce)

            function started(d) {
                // simulation.on('tick', ticked)
                console.log(d);
                if (!d3.event.active) {
                    simulation.alphaTarget(.02).restart()
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
                // if (!d3.event.active) {
                //     simulation.alphaTarget(0)
                // }
                d.fx = d.x
                d.fy = d.y
                simulation.stop()
            }


            simulation.on('tick', ticked)

            function ticked() {
                link.attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y)

                node.attr('cx', d => d.x)
                    .attr('cy', d => d.y)

                label.attr('x', d => d.x - 50)
                    .attr('y', d => d.y + 5)
            }
            // simulation.stop();
            // simulation.tick(300);
            //设定zoom
            function zoomed() {
                plot.select('.nodes').attr("transform", d3.event.transform);
                plot.select('.links').attr("transform", d3.event.transform);
                plot.select('.labels').attr("transform", d3.event.transform);
            }
            const zoom = d3.zoom()
                .scaleExtent([0.1, 40])
                .translateExtent([[-10000, -10000], [width + 100000, height + 10000000]])
                // .filter(filter)
                .on("zoom", zoomed);
            svg.call(zoom)


            //预先缩放到中心位置
            // const plotWidth = plot.node().getBoundingClientRect().width;
            // const plotHeight = plot.node().getBoundingClientRect().height;
            // let originTransformX = -plot.node().getBBox().x
            // let originTransformY = -plot.node().getBBox().y
            // let originTransformK = Math.min(1.0 * width / plotWidth, 1.0 * height / plotHeight) * 0.85
            // let smallPlotWidth = plotWidth * originTransformK;
            // let smallPlotHeight = plotHeight * originTransformK;
            // let offsetTransformX = (0.5 * width - 0.5 * smallPlotWidth)
            // let offsetTransformY = (0.5 * height - 0.5 * smallPlotHeight)
            // plot
            //     .style('transform-origin', 'left top')
            //     .attr("transform", `translate(${offsetTransformX},${offsetTransformY}) scale(${originTransformK}) translate(${originTransformX},${originTransformY})`)

            // label.style('display', 'none') //在最后取消可见性是因为要保持最优缩放连文本尺寸也算在内




        },

        drawLayer() {

            /**
             * 
             * 定义
             * 
             */
            const svg = d3.select('#dTree-plot');
            svg.selectAll('*').remove()



            const svgWidth = svg.node().getBoundingClientRect().width
            const svgHeight = svg.node().getBoundingClientRect().height

            //定义和计算长度属性
            const padding = {//外围padding
                'bottom': 40,
                'top': 40,
                'left': 40,
                'right': 40,
            };
            const borderSkew = 20;//边框的倾斜角度（平面上的倾斜），单位deg
            const plotSkew = 45;//图像的倾斜角度（空间上的倾斜），单位deg
            const middleMargin = 40; //上下两区域的间距，也是两个边框的上下间距

            const partWidth = svgWidth - padding.right - padding.left;//分层画布的宽度
            const partHeight = 0.5 * (svgHeight - padding.top - padding.bottom - middleMargin);//分层画布的高度

            const innerWidth = partWidth - 2 * partHeight * Math.tan(borderSkew * Math.PI / 180)//边框内画布的宽度
            const innerHeight = partHeight;//边框内画布的高度
            const _innerHeight = innerHeight / Math.cos(plotSkew * Math.PI / 180) //折叠前边框内画布高度

            let defs = svg.append('defs')
            //定义marker箭头
            defs.append('marker')
                .attr('id', 'degreeArrowhead')
                .attr('markerWidth', 4)
                .attr('markerHeight', 4)
                .attr('viewBox', '0 -5 12 12')
                .attr('refX', 20)
                .attr('refY', 0)
                .attr('orient', 'auto')
                .append('path')
                .attr('fill', '#434343')
                .attr('d', 'M 0,-5 L 10,0 L 0,5')
            //定义文字背景滤镜    
            let degreeTextBackground = defs.append('filter')
                .attr('id', 'degreeTextBackground')
                .attr('x', -0.05)
                .attr('y', -0.05)
                .attr('width', 1.1)
                .attr('height', 1.1)
            degreeTextBackground.append('feFlood')
                .attr('flood-color', 'orange')
                .attr('flood-opacity', 0.9)
            degreeTextBackground.append('feComposite')
                .attr('in', 'SourceGraphic')
                .attr('operator', 'over')

            //构造重叠的层次关系
            svg.append('g').classed('globalBorder', true)
            svg.append('g').classed('globalPlot', true)
            svg.append('g').classed('outerLink', true)
            svg.append('g').classed('localBorder', true)
            svg.append('g').classed('localPlot', true)


            /**
             * 
             * 准备数据
             * 
             */
            //local准备数据
            const data1 = store.state.MarFromUser;
            let node1Draw = new Set()
            let link1Draw = []
            for (let link of data1) {
                if (link['id'] !== undefined && link['parentId'] !== undefined) {
                    link1Draw.push({ 'source': link['id'], 'target': link['parentId'] })
                    node1Draw.add(link['id'])
                    node1Draw.add(link['parentId'])
                }
            }
            node1Draw = Array.from(node1Draw).map(v => {
                let str = v.replace(/\./g, ''); // 使用正则表达式替换掉所有的"."字符
                return { 'name': v, 'nameRe': str }
            })

            this.node1Draw = node1Draw
            this.link1Draw = link1Draw

            //global准备数据
            let node2Draw = this.node2Draw;
            let link2Draw = this.link2Draw;


            //图1开始模拟坐标
            this.forceDirectedSimulation(node1Draw, link1Draw, innerWidth, _innerHeight)

            //图2开始模拟坐标
            this.forceDirectedSimulation(node2Draw, link2Draw, innerWidth, _innerHeight)




            //绑定外部连接边数据 TODO 也许可以在速度方面优化一下
            let graphLink = []
            for (let i = 0; i < node1Draw.length; i++)
                for (let j = 0; j < node2Draw.length; j++) {
                    if (node1Draw[i].name == node2Draw[j].name) {
                        graphLink.push(node1Draw[i].name)
                    }
                }

            //求取缩放比例
            const data2Size = {
                'width': Math.max(...node2Draw.map(v => v.x)) - Math.min(...node2Draw.map(v => v.x)),
                'height': Math.max(...node2Draw.map(v => v.y)) - Math.min(...node2Draw.map(v => v.y)),
            }
            const data2Scale = Math.min(innerWidth / (data2Size.width + 20), _innerHeight / (data2Size.height + 20)) //20 = cellSize * 2 所以点半径改的时候这里也要一起改
            const finalScale = data2Scale * 0.8


            /**
             * 
             * 绘制border
             * 
             */
            svg.select('.localBorder').append('path') //local边界
                .attr('d', `M ${padding.left + partHeight * Math.tan(borderSkew * Math.PI / 180)} ${padding.top}
                           L ${padding.left + partWidth} ${padding.top} 
                           L ${padding.left + partHeight * Math.tan(borderSkew * Math.PI / 180) + innerWidth} ${padding.top + partHeight} 
                           L ${padding.left} ${padding.top + partHeight}
                           L ${padding.left + partHeight * Math.tan(borderSkew * Math.PI / 180)} ${padding.top}`)
                .attr('fill', '#59db1b')
                .attr('fill-opacity', 0.7)
                .style('stroke', "#c2ff00")
                .style('stroke-width', 4)

            svg.select('.globalBorder').append('path') //global边界
                .attr('d', `M ${padding.left + partHeight * Math.tan(borderSkew * Math.PI / 180)} ${padding.top}
                           L ${padding.left + partWidth} ${padding.top} 
                           L ${padding.left + partHeight * Math.tan(borderSkew * Math.PI / 180) + innerWidth} ${padding.top + partHeight} 
                           L ${padding.left} ${padding.top + partHeight}
                           L ${padding.left + partHeight * Math.tan(borderSkew * Math.PI / 180)} ${padding.top}`)
                .attr('fill', '#59db1b')
                .attr('fill-opacity', 0.7)
                .style('stroke', "#c2ff00")
                .style('stroke-width', 2)
                .style("transform", `translate(${0}px,${middleMargin + partHeight}px)`)



            /**
             * 
             * 绘制内部点和连接线
             * 
             */
            //图1
            this.drawGraph('local',
                node1Draw,
                link1Draw,
                { 'x': padding.left + partHeight * Math.tan(borderSkew * Math.PI / 180), 'y': padding.top },
                innerWidth,
                _innerHeight,
                finalScale,
                plotSkew)
            //图2
            this.drawGraph('global',
                this.node2Draw,
                this.link2Draw,
                { 'x': padding.left + partHeight * Math.tan(borderSkew * Math.PI / 180), 'y': padding.top + middleMargin + partHeight },
                innerWidth,
                _innerHeight,
                finalScale,
                plotSkew)

            this.autofit(
                innerWidth,
                _innerHeight,
                { 'x': padding.left + partHeight * Math.tan(borderSkew * Math.PI / 180), 'y': padding.top },
                { 'x': padding.left + partHeight * Math.tan(borderSkew * Math.PI / 180), 'y': padding.top + middleMargin + partHeight },
                finalScale,
                plotSkew,
            );



            /**
             * 
             * 绘制外部连接线
             * 
             */
            const linkPlot = svg.select('.outerLink')
            for (let link_name of graphLink) {
                const globalNode = d3.selectAll(`.degreeNode-global`).filter((d, i) => {
                    return d.name == link_name
                }).node()
                const localNode = d3.selectAll(`.degreeNode-local`).filter((d, i) => {
                    return d.name == link_name
                }).node()


                // console.log(globalNode)

                const globalNodePos = {
                    'x': globalNode.getBoundingClientRect().x - svg.node().getBoundingClientRect().x + 0.5 * globalNode.getBoundingClientRect().width,
                    'y': globalNode.getBoundingClientRect().y - svg.node().getBoundingClientRect().y + 0.5 * globalNode.getBoundingClientRect().height,
                }
                const localNodePos = {
                    'x': localNode.getBoundingClientRect().x - svg.node().getBoundingClientRect().x + 0.5 * localNode.getBoundingClientRect().width,
                    'y': localNode.getBoundingClientRect().y - svg.node().getBoundingClientRect().y + 0.5 * localNode.getBoundingClientRect().height,
                }

                linkPlot.append('line')
                    .attr('x1', globalNodePos.x)
                    .attr('y1', globalNodePos.y)
                    .attr('x2', localNodePos.x)
                    .attr('y2', localNodePos.y)
                    .attr('stroke', '#156dc1')
                    .attr('stroke-width', 6 * finalScale)
                    .attr('opacity', 0.4)
                // .on('mouseover',function(d,i){
                //     d3.select(this).attr('stroke','#cc4125')
                // })
                // .on('mouseout',function(d,i){
                //     d3.select(this).attr('stroke','#156dc1')
                // })
            }





        },
        drawLink() {
            console.log(123123123);

            const svg = d3.select('#dTree-plot');
            svg.select('.outerLink').remove();
            const svgWidth = svg.node().getBoundingClientRect().width
            const svgHeight = svg.node().getBoundingClientRect().height

            //定义和计算长度属性
            const padding = {//外围padding
                'bottom': 40,
                'top': 40,
                'left': 40,
                'right': 40,
            };
            const borderSkew = 20;//边框的倾斜角度（平面上的倾斜），单位deg
            const plotSkew = 45;//图像的倾斜角度（空间上的倾斜），单位deg
            const middleMargin = 40; //上下两区域的间距，也是两个边框的上下间距

            const partWidth = svgWidth - padding.right - padding.left;//分层画布的宽度
            const partHeight = 0.5 * (svgHeight - padding.top - padding.bottom - middleMargin);//分层画布的高度

            const innerWidth = partWidth - 2 * partHeight * Math.tan(borderSkew * Math.PI / 180)//边框内画布的宽度
            const innerHeight = partHeight;//边框内画布的高度
            const _innerHeight = innerHeight / Math.cos(plotSkew * Math.PI / 180) //折叠前边框内画布高度


            svg.append('g').classed('outerLink', true)
            /**
            * 
            * 准备数据
            * 
            */
            //local准备数据
            const data1 = store.state.MarFromUser;
            let node1Draw = new Set()
            let link1Draw = []
            for (let link of data1) {
                if (link['id'] !== undefined && link['parentId'] !== undefined) {
                    link1Draw.push({ 'source': link['id'], 'target': link['parentId'] })
                    node1Draw.add(link['id'])
                    node1Draw.add(link['parentId'])
                }
            }
            node1Draw = Array.from(node1Draw).map(v => {
                let str = v.replace(/\./g, ''); // 使用正则表达式替换掉所有的"."字符
                return { 'name': v, 'nameRe': str }
            })

            this.node1Draw = node1Draw
            this.link1Draw = link1Draw

            //global准备数据
            let node2Draw = this.node2Draw;
            let link2Draw = this.link2Draw;

            //绑定外部连接边数据 TODO 也许可以在速度方面优化一下
            let graphLink = []
            for (let i = 0; i < node1Draw.length; i++)
                for (let j = 0; j < node2Draw.length; j++) {
                    if (node1Draw[i].name == node2Draw[j].name) {
                        graphLink.push(node1Draw[i].name)
                    }
                }

            //求取缩放比例
            const data2Size = {
                'width': Math.max(...node2Draw.map(v => v.x)) - Math.min(...node2Draw.map(v => v.x)),
                'height': Math.max(...node2Draw.map(v => v.y)) - Math.min(...node2Draw.map(v => v.y)),
            }
            const data2Scale = Math.min(innerWidth / (data2Size.width + 20), _innerHeight / (data2Size.height + 20)) //20 = cellSize * 2 所以点半径改的时候这里也要一起改
            const finalScale = data2Scale * 0.8




            /**
            * 
            * 绘制外部连接线
            * 
            */
            const linkPlot = svg.select('.outerLink')
            for (let link_name of graphLink) {
                const globalNode = d3.selectAll(`.degreeNode-global`).filter((d, i) => {
                    return d.name == link_name
                }).node()
                const localNode = d3.selectAll(`.degreeNode-local`).filter((d, i) => {
                    return d.name == link_name
                }).node()


                const globalNodePos = {
                    'x': globalNode.getBoundingClientRect().x - svg.node().getBoundingClientRect().x + 0.5 * globalNode.getBoundingClientRect().width,
                    'y': globalNode.getBoundingClientRect().y - svg.node().getBoundingClientRect().y + 0.5 * globalNode.getBoundingClientRect().height,
                }
                const localNodePos = {
                    'x': localNode.getBoundingClientRect().x - svg.node().getBoundingClientRect().x + 0.5 * localNode.getBoundingClientRect().width,
                    'y': localNode.getBoundingClientRect().y - svg.node().getBoundingClientRect().y + 0.5 * localNode.getBoundingClientRect().height,
                }

                linkPlot.append('line')
                    .attr('x1', globalNodePos.x)
                    .attr('y1', globalNodePos.y)
                    .attr('x2', localNodePos.x)
                    .attr('y2', localNodePos.y)
                    .attr('stroke', '#156dc1')
                    .attr('stroke-width', 6 * finalScale)
                    .attr('opacity', 0.4)
                // .on('mouseover',function(d,i){
                //     d3.select(this).attr('stroke','#cc4125')
                // })
                // .on('mouseout',function(d,i){
                //     d3.select(this).attr('stroke','#156dc1')
                // })
            }
        },
        forceDirectedSimulation(nodes, links, width, height) {//进行力导引模拟
            //配置模拟器
            let simulation = d3.forceSimulation()
                .nodes(nodes)

            let linkForce = d3.forceLink(links)
                .id((d) => { return d.name })
            // console.log(links);

            simulation
                .force('charge_force', d3.forceManyBody().strength(-100))
                .force('center_force', d3.forceCenter(width / 2, height / 2))
                .force('links', linkForce)

            //启动
            simulation.stop();
            simulation.tick(300);

        }
        ,
        drawGraph(name, nodes, links, origin, width2, height2, finalScale, plotSkew) {//绘制2.5D视图（不含边框）

            //错误检测 
            if (nodes.length == 0)
                return;

            const svg = d3.select('#dTree-plot')
            const plot = svg.select(`.${name}Plot`)
                .attr("id", `plot-${name}`)


            let linkPlot = plot.append('g')
                .attr('class', 'links')
                .selectAll('line')
                .data(links)
                .join('line')
                .attr('stroke-width', 3)
                .style('stroke', "#666666")
                .attr('marker-end', 'url(#degreeArrowhead)')
                .attr('x1', (d) => { return d.source.x })
                .attr('y1', (d) => { return d.source.y })
                .attr('x2', (d) => { return d.target.x })
                .attr('y2', (d) => { return d.target.y })
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

            const that = this




            if (name == "local") {
                let nodePlot = plot.append('g')
                    .attr('class', 'nodes')
                    .selectAll('circle')
                    .data(nodes)
                    .join('circle')
                    .attr('r', 10)
                    .attr('fill', "#b256f0")
                    .attr('stroke', "white")
                    .attr('stroke-width', 2)
                    .attr('marker-end', 'url(#arrowhead)')
                    .classed(`degreeNode-${name}`, true)
                    .attr('cx', (d) => { return d.x })
                    .attr('cy', (d) => { return d.y })

                let label = plot.append('g')
                    .attr('class', 'labels2')
                    .classed('anno', true)
                    .selectAll('text')
                    .data(nodes)
                    .join('text')
                    .text(d => d.name)
                    .attr('x', function (d) {
                        return d.x - 0.5 * this.getBoundingClientRect().width
                    })
                    .attr('y', function (d) {
                        return d.y + 0.3 * this.getBoundingClientRect().height
                    })


                const width = svg.node().getBoundingClientRect().width
                const height = svg.node().getBoundingClientRect().height
                const zoom = d3.zoom()
                    .scaleExtent([0.1, 40])
                    .translateExtent([[-10000, -10000], [width + 100000, height + 10000000]])
                    // .filter(filter)
                    .on("zoom", zoomed);

                plot.call(zoom)
                function zoomed() {
                    plot.select('.nodes').attr("transform", d3.event.transform);
                    plot.select('.links').attr("transform", d3.event.transform);
                    plot.select('.labels2').attr("transform", d3.event.transform);
                    that.drawLink()
                    // svg.select('.outerLink').remove();
                }
            } else {
                let nodePlot = plot.append('g')
                    .attr('class', 'nodes')
                    .selectAll('circle')
                    .data(nodes)
                    .join('circle')
                    .attr('r', 10)
                    .attr('fill', "#b256f0")
                    .attr('stroke', "white")
                    .attr('stroke-width', 2)
                    .attr('marker-end', 'url(#arrowhead)')
                    .classed(`degreeNode-${name}`, true)
                    .attr('cx', (d) => { return d.x })
                    .attr('cy', (d) => { return d.y })
                    .on('mouseover', function (d, i) {
                        //添加标注文本
                        const annoPlot = svg.append('g').attr('class', 'labels').classed('anno', true)
                        const node = this
                        annoPlot.append('text')
                            .text(d.name)
                            .style('font-size', 30)
                            .attr("x", function () {
                                return node.getBoundingClientRect().x - svg.node().getBoundingClientRect().x + 0.5 * node.getBoundingClientRect().width - 0.5 * this.getBBox().width
                            })
                            .attr("y", function () {
                                return node.getBoundingClientRect().y - svg.node().getBoundingClientRect().y - 10
                            })
                            .attr('filter', 'url(#degreeTextBackground)')
                    })
                    .on('mouseout', () => {
                        svg.select('.labels').remove()
                    })


                const width = svg.node().getBoundingClientRect().width
                const height = svg.node().getBoundingClientRect().height
                const zoom = d3.zoom()
                    .scaleExtent([0.1, 40])
                    .translateExtent([[-10000, -10000], [width + 100000, height + 10000000]])
                    // .filter(filter)
                    .on("zoom", zoomed);

                plot.call(zoom)
                function zoomed() {
                    plot.select('.nodes').attr("transform", d3.event.transform);
                    plot.select('.links').attr("transform", d3.event.transform);
                    plot.select('.labels').attr("transform", d3.event.transform);
                    that.drawLink()
                    // svg.select('.outerLink').remove();
                }
            }




        },

        autofit(width, height, localOrigin, globalOrigin, finalScale, plotSkew) {//移动缩放2.5D图元素，使得其位置自适应在边界中央，并且保持上下相对位置

            const globalPlot = d3.select('#dTree-plot').select(`.globalPlot`)
            const localPlot = d3.select('#dTree-plot').select(`.localPlot`)


            // //计算左上角对齐
            let originTransformX = -globalPlot.node().getBBox().x + globalOrigin.x;
            let originTransformY = -globalPlot.node().getBBox().y + globalOrigin.y;

            let smallPlotWidth = globalPlot.node().getBBox().width * finalScale;
            let smallPlotHeight = globalPlot.node().getBBox().height * finalScale;

            let offsetTransformX = 0.5 * width - 0.5 * smallPlotWidth //偏移量，使得居中
            let offsetTransformY = 0.5 * height - 0.5 * smallPlotHeight


            //global变换
            globalPlot.style('transform-origin', `${globalOrigin.x}px ${globalOrigin.y}px`)
            globalPlot.style('transform', `rotateX(${plotSkew}deg) translate(${offsetTransformX}px,${offsetTransformY}px) scale(${finalScale}) translate(${originTransformX}px,${originTransformY}px)`)
            // globalPlot.style('transform', `skewX(${-20}deg) scale(${finalScale}) translate(${originTransformX}px,${originTransformY}px)`)

            //local变换
            localPlot.style('transform-origin', `${localOrigin.x}px ${localOrigin.y}px`)
            localPlot.style('transform', `rotateX(${plotSkew}deg) translate(${offsetTransformX}px,${offsetTransformY}px) scale(${finalScale}) translate(${originTransformX - globalOrigin.x + localOrigin.x}px,${originTransformY - globalOrigin.y + localOrigin.y}px)`)
            // localPlot.style('transform', `skewX(${-20}deg) scale(${finalScale}) translate(${originTransformX - globalOrigin.x + localOrigin.x}px,${originTransformY - globalOrigin.y + localOrigin.y}px)`)

        },


        connect(e, x) {
            const svg = d3.select('#dTree-plot')
            const linkPlot = svg.select('.outerLink')
            if (this.showline) {
                linkPlot.style('display', null)
            }
            else {
                linkPlot.style('display', 'none')
            }
        },
        // handleDraw() {
        //     //多层绘制
        //     const nodeMuti = []
        //     this.node2Draw.forEach(e => {
        //         // console.log(e.name);
        //         nodeMuti.push(e.id + ' 0 0 0 0')
        //     })
        //     const linkMuti = []
        //     this.linksdown.forEach(e => {
        //         linkMuti.push('1 ' + e[0] + ' ' + e[1] + ' 1')
        //     })

        //     let node_data = []
        //     mutiDraw({ node: nodeMuti, link: linkMuti }).then(res => {
        //         // console.log("点集是：", this.node2Draw);
        //         // console.log("连线是：", this.linksdown);
        //         // console.log("坐标是：", res.data);
        //         node_data = res.data
        //     })

        //     const svg = d3.select('#dTree-plot');
        //     d3.selectAll('#plot2').remove()

        //     const padding = 10;
        //     const link_data = this.linksdown;
        //     let minX = Math.min(...node_data.map(d => d.x));
        //     let maxX = Math.max(...node_data.map(d => d.x));
        //     let minY = Math.min(...node_data.map(d => d.y));
        //     let maxY = Math.max(...node_data.map(d => d.y));


        //     const posXScale = d3
        //         .scaleLinear()
        //         .domain([minX, maxX])
        //         .range([padding, width - padding]);
        //     const posYScale = d3
        //         .scaleLinear()
        //         .domain([minY, maxY])
        //         .range([padding, height - padding]);
        //     //箭头
        //     let defs = svg.append('defs')

        //     defs.append('marker')
        //         .attr('id', 'arrowhead')
        //         .attr('markerWidth', 4)
        //         .attr('markerHeight', 4)
        //         .attr('viewBox', '0 -5 12 12') // Arrow head points in x direction
        //         .attr('refX', 20) // Horizontal offset
        //         .attr('refY', 0) // Vertical offset
        //         .attr('orient', 'auto')
        //         // .attr('markerUnits', "10")
        //         .append('path')
        //         .attr('fill', 'red')
        //         .attr('d', 'M 0,-5 L 10,0 L 0,5')

        //     const width = 450;
        //     const height = 450;
        //     const plot = svg.append('g')
        //         .attr("id", `plot${d}`)

        //     let border = plot.append('rect')
        //         .attr('x', 0)
        //         .attr('y', 0)
        //         .attr('height', height)
        //         .attr('width', width)
        //         .attr('fill', 'none')
        //         .style('stroke', "gray")
        //         .style('stroke-width', 2)

        //     let linkPlot = plot.append('g')
        //         .selectAll('line')
        //         .data(links)
        //         .join('line')
        //         .attr('stroke-width', 3)
        //         .style('stroke', "#0fb2cc")
        //         .attr('marker-end', 'url(#arrowhead)')
        //         .classed(`link${bias}`, true)

        //     let nodePlot = plot.append('g')
        //         .selectAll('circle')
        //         .data(nodes)
        //         .join('circle')
        //         .attr('r', 10)
        //         .attr('fill', "#61b2e4")
        //         .classed(`node${bias}`, true)

        //     let nodeText = plot.append('g')
        //         .selectAll('text')
        //         .data(nodes)
        //         .join('text')
        //         .text(d => d.name)
        //         .classed(`text${bias}`, true)


        //     //旋转
        //     plot.style('transform', `translate(${width}px,${bias}px) rotateX(45deg) rotateZ(45deg)`)



        // }
    },
};
</script>
   
<style scoped>
.mar-title {
    display: flex;
    color: white;
    background-color: #6d6d6d;
}

/* .tree {
    border: 1px solid #9e4a4a00;
    padding: 20px;
    width: 600px;
    height: 80px;
    margin: auto;
} */

.node circle {
    fill: #fff;
    stroke: steelblue;
    stroke-width: 2px;
}

.node text {
    font: 12px sans-serif;
}

.link {
    fill: none;
    stroke: #ccc;
    stroke-width: 2px;
}

#dTree-plot {
    width: 100%;
    height: 900px;
}

#mutil {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>