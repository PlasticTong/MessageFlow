<template>
    <div>
        <div class="chart-row">
            <svg id="timechart1" width="16%" height="220"></svg>
            <svg id="timechart2" width="16%" height="220"></svg>
            <svg id="timechart3" width="16%" height="220"></svg>
            <svg id="timechart4" width="16%" height="220"></svg>
            <svg id="timechart5" width="16%" height="220"></svg>
            <svg id="timechart6" width="16%" height="220"></svg>
        </div>
        <el-slider v-model="value" range :max="100" :marks="marks">
        </el-slider>
        <el-button @click="handleChoose">选择</el-button>
    </div>
</template>
  
<script>
import * as d3 from 'd3'
import { store } from "../store/mesinfo"
export default {
    data() {
        return {
            mesBytime: [],
            num: 0,
            value: [0, 0],
            marks: {
            }
        }
    },

    methods: {
        handleChoose() {
            console.log(this.value);
            let a = +this.value[0]
            let b = +this.value[1]
            this.marks = {
                ...this.marks,
                [a]: `${this.value[0]}`,
                [b]: `${this.value[1]}`
            }
            this.value[0] = this.value[1]
            this.num += 1
            this.drawTimeChart(this.num)
        },
        drawTimeChart(d) {
            let svg = d3.select(`#timechart${d}`)
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

            console.log(d);

        }
    },
    updated() {
        // console.log(this.value);
        //   console.log(this.currentRow);
    },
}
</script>
   