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
import { linksUserCho } from "../api/index.ts"
export default {
    data() {
        return {
            threshold: 1,
            rootnum: 0,

            charts: [],
        }
    },
    mounted() {
    },
    methods: {
        handleFliter() {
            linksUserCho({ data: store.state.filterresFromUser, param: { order: this.threshold, delta: 12 } }).then(res => {
                console.log(res);
            })
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
        drawMarkov(d) {
            let svg = d3.select(`#markovchart${d}`).attr('width', 450).attr('height', 450)
            svg.selectAll('*').remove();
            let width = +svg.attr('width')
            let height = +svg.attr('height')

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

            let simulation = d3.forceSimulation()
                .nodes(nodesData)

            simulation
                .force('charge_force', d3.forceManyBody().strength(-600))
                .force('center_force', d3.forceCenter(width / 2, height / 2))

            const len = 0

            simulation.on('tick', tickAction)

            function tickAction() {
                node
                    .attr('cx', (d) => { return d.x + len })
                    .attr('cy', (d) => { return d.y + len })

                link
                    .attr('x1', (d) => { return d.source.x + len })
                    .attr('y1', (d) => { return d.source.y + len })
                    .attr('x2', (d) => { return d.target.x + len })
                    .attr('y2', (d) => { return d.target.y + len })

                label
                    .attr('x', function (d) {
                        return d.x + len - 0.5 * this.getBoundingClientRect().width
                    })
                    .attr('y', function (d) {
                        return d.y + len + 0.3 * this.getBoundingClientRect().height
                    })

                linkText
                    .attr("x", function (d) {
                        return (d.source.x + d.target.x) / 2 + len;
                    })
                    .attr("y", function (d) {
                        return (d.source.y + d.target.y) / 2 + len;
                    })

            }

            let linkForce = d3.forceLink(linksData)
                .id((d) => { return d.name })

            simulation.force('links', linkForce)



            // const posXScale = d3
            //     .scaleLinear()
            //     .domain([minX, maxX])
            //     .range([padding, width - padding]);
            // const posYScale = d3
            //     .scaleLinear()
            //     .domain([minY, maxY])
            //     .range([padding, height - padding]);

            let link = svg.append('g')
                .attr('class', 'links')
                .selectAll('line')
                .data(linksData)

                .enter()
                .append('line')
                .attr('id', function (d) { return `Mar${d.id}` })
                .attr('stroke-width', 3)
                .style('stroke', "#0fb2cc")
                .attr('marker-end', 'url(#arrowhead)')
                .on("click", d => {


                    const ipRegex = /(\d+\.\d+\.\d+\.\d+)-(\d+\.\d+\.\d+\.\d+)/;
                    // if(store.state.MarFromUser.find(e=>e.))
                    // console.log(this.rootnum);
                    if (store.state.MarFromUser.length == 0) {
                        store.state.MarFromUser.push({ id: d.source.name.match(ipRegex)[1] })
                    }
                    const res1 = { id: d.source.name.match(ipRegex)[2], parentId: d.source.name.match(ipRegex)[1] }
                    const res2 = { id: d.target.name.match(ipRegex)[2], parentId: d.source.name.match(ipRegex)[2] }

                    if (store.state.MarFromUser.find(e => e.id == res1.id && e.parentId == res1.parentId) == null) {
                        store.state.MarFromUser.push(res1)
                    }

                    if (store.state.MarFromUser.find(e => e.id == res2.id && e.parentId == res1.parentId) == null) {
                        store.state.MarFromUser.push(res2)
                    }


                    console.log(store.state.MarFromUser);

                    d3.select(`#Mar${d.id}`)
                        .style("stroke", "red")
                        .style("stroke-dasharray", 0);
                })
            // 引用箭头定义

            let linkText = svg.append('g')
                .attr('class', 'linkLabels')
                .selectAll('text')
                .data(linksData)
                .join('text')
                .text(d => d.type)


            let node = svg.append('g')
                .attr('class', 'nodes')
                .selectAll('circle')
                .data(nodesData)
                .enter()
                .append('circle')
                .attr('r', 10)
                .attr('fill', "#61b2e4")

            let label = svg.append('g')
                .selectAll('text')
                .data(nodesData)
                .join('text')
                .text(d => d.name)

            //启动
            simulation.stop();
            simulation.tick(300);
            tickAction()


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
   