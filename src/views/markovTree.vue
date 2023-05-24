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
            <svg id="markovchart1" width="960" height="600" v-show="threshold >= 1"></svg>
            <svg id="markovchart2" width="960" height="600" v-show="threshold >= 2"></svg>
        </div>

        <!--第二行图表-->
        <div class="chart-row">
            <svg id="markovchart3" width="960" height="600" v-show="threshold >= 3"></svg>
            <svg id="markovchart4" width="960" height="600" v-show="threshold >= 4"></svg>
        </div>

    </div>
</template>
<script>
import * as d3 from 'd3'
export default {
    data() {
        return {
            threshold: 1,
            charts: [],
        }
    },
    mounted() {
    },
    methods: {
        handleFliter() {
            console.log(this.threshold);
            for (let i = 1; i <= this.threshold; i++) {
                d3.select(`#markovchart${i}`)
                this.drawMarkov(i)
            }
        },
        drawMarkov(d) {
            let svg = d3.select(`#markovchart${d}`).attr('width', 450).attr('height', 450)
            let width = +svg.attr('width')
            let height = +svg.attr('height')

            // 添加defs元素
            let defs = svg.append('defs')

            // 定义箭头
            defs.append('marker')
                .attr('id', 'arrowhead')
                .attr('markerWidth', 7)
                .attr('markerHeight', 7)
                .attr('viewBox', '0 -5 12 12') // Arrow head points in x direction
                .attr('refX', 25) // Horizontal offset
                .attr('refY', 0) // Vertical offset
                .attr('orient', 'auto')
                // .attr('markerUnits', "10")
                .append('path')
                .attr('fill', 'red')
                .attr('d', 'M 0,-5 L 10,0 L 0,5')

            let nodesData = [
                { 'name': 'Lillian', 'sex': 'F' },
                { 'name': 'Gordon', 'sex': 'M' },
                { 'name': 'Sylvester', 'sex': 'M' },
                { 'name': 'Mary', 'sex': 'F' },
                { 'name': 'Helen', 'sex': 'F' },
                { 'name': 'Jamie', 'sex': 'M' },
                { 'name': 'Jessie', 'sex': 'F' },
            ]

            let linksData = [
                { 'source': 'Sylvester', 'target': 'Gordon', 'type': 'A' },
                { 'source': 'Sylvester', 'target': 'Lillian', 'type': 'A' },
                { 'source': 'Sylvester', 'target': 'Mary', 'type': 'A' },
                { 'source': 'Sylvester', 'target': 'Jamie', 'type': 'A' },
                { 'source': 'Sylvester', 'target': 'Jessie', 'type': 'A' },
                { 'source': 'Sylvester', 'target': 'Helen', 'type': 'A' },
                { 'source': 'Helen', 'target': 'Gordon', 'type': 'A' },
            ]

            let simulation = d3.forceSimulation()
                .nodes(nodesData)

            simulation
                .force('charge_force', d3.forceManyBody().strength(-600))
                .force('center_force', d3.forceCenter(width / 2, height / 2))





            simulation.on('tick', tickAction)

            function tickAction() {
                node
                    .attr('cx', (d) => { return d.x })
                    .attr('cy', (d) => { return d.y })

                link
                    .attr('x1', (d) => { return d.source.x })
                    .attr('y1', (d) => { return d.source.y })
                    .attr('x2', (d) => { return d.target.x })
                    .attr('y2', (d) => { return d.target.y })
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
                .attr('stroke-width', 1)
                .style('stroke', "#0fb2cc")
                .attr('marker-end', 'url(#arrowhead)')// 引用箭头定义

            let node = svg.append('g')
                .attr('class', 'nodes')
                .selectAll('circle')
                .data(nodesData)
                .enter()
                .append('circle')
                .attr('r', 10)
                .attr('fill', "#61b2e4")
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
   