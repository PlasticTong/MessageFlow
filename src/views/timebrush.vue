<template>
    <div>
        <div class="chart-row">
            <svg id="timechart1" width="500" height="220"></svg>
            <svg id="timechart2" width="500" height="220"></svg>
            <svg id="timechart3" width="500" height="220"></svg>
            <svg id="timechart4" width="500" height="220"></svg>
            <svg id="timechart5" width="500" height="220"></svg>
            <svg id="timechart6" width="500" height="220"></svg>
        </div>
        <el-slider v-model="value" range :max="max" :marks="marks">
        </el-slider>
        <el-button @click="handleChoose">选择</el-button>
    </div>
</template>
  
<script>
import * as d3 from 'd3'
import { store } from "../store/mesinfo"
import { ElMessage, ElMessageBox } from "element-plus";
import { set } from 'lodash';
import { noopDirectiveTransform } from '@vue/compiler-core';
import axios from 'axios'
export default {
    data() {
        const lastItem = store.state.mesinfo.list[store.state.mesinfo.list.length - 1];


        return {
            max: lastItem.time,
            num: 0,
            timeSt: 0,
            timeEd: 0,
            value: [0, 0],
            marks: {
            }
        }
    },

    methods: {
        handleChoose() {
            this.num += 1
            if (this.num > 6) {
                ElMessage.error("图片过多")
            }
            else {
                console.log(this.value);
                let a = +this.value[0]
                let b = +this.value[1]
                this.marks = {
                    ...this.marks,
                    [a]: `${this.value[0]}`,
                    [b]: `${this.value[1]}`
                }
                this.timeEd = this.value[1]
                this.timeSt = this.value[0]
                store.state.timeSlect.push({ start: this.value[0], end: this.value[1] })
                this.value[0] = this.value[1]
                console.log(store.state.timeSlect);


                this.drawTimeChart(this.num)
            }

        },
        drawTimeChart(d) {


            //寻找数据
            // console.log(store.state.mesinfo.list);
            const mesByTime1 = store.state.mesinfo2.list.filter((e) => { return e.time <= this.timeEd && e.time > this.timeSt })
            store.state.mesBytime = mesByTime1
            const uniqueArr = []
            mesByTime1.forEach((item, index) => {
                if (!mesByTime1.slice(0, index).some((prevItem) => {
                    return (prevItem.target === item.target && prevItem.source === item.source);
                })) {
                    item.weight = 1
                    uniqueArr.push(item)
                }
                else {
                    // console.log(uniqueArr.find(e=>e.source==item.source && e.source === item.source));
                    uniqueArr.find(e => e.source == item.source && e.target === item.target).weight++
                }
            });
            uniqueArr.forEach(e => console.log(e))

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
            const nodesDataForDraw = []
            Array.from(nodeset).forEach((e, index) => {
                nodesDataForDraw.push({ id: index, name: e })
            })

            // axios.post("http://localhost:5000//mesfilter/mesSelectBytime",
            //     {
            //         nodesDataForDraw, uniqueArr

            //     }).then(function (result) {
            //         console.log(result.data)
            //     })




            //画图

            let svg = d3.select(`#timechart${d}`).attr("width", 400).attr('height', 300)
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

            // let nodesData = [
            //     { 'name': '192.168.1.2-192.168.1.4', 'sex': 'F' },
            //     { 'name': '192.168.1.2-192.168.1.3', 'sex': 'M' },
            //     { 'name': '192.168.1.1-192.168.1.2', 'sex': 'M' },
            //     { 'name': '192.168.1.2-192.168.1.5', 'sex': 'F' },
            //     { 'name': '192.168.1.2-192.168.1.6', 'sex': 'F' },
            //     { 'name': '192.168.1.2-192.168.1.7', 'sex': 'M' },
            //     { 'name': '192.168.1.2-192.168.1.8', 'sex': 'F' },
            // ]

            // let linksData =
            //     [
            //         { 'id': 1, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.3', 'type': 1 },
            //         { 'id': 2, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.4', 'type': 2 },
            //         { 'id': 3, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.5', 'type': 3 },
            //         { 'id': 4, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.7', 'type': 4 },
            //         { 'id': 5, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.8', 'type': 5 },
            //         { 'id': 6, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.6', 'type': 6 },
            //     ]

            let simulation = d3.forceSimulation()
                .nodes(nodesDataForDraw)

            simulation
                .force('charge_force', d3.forceManyBody().strength(-100))
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

                // linkText
                //     .attr("x", function (d) {
                //         return (d.source.x + d.target.x) / 2 + len;
                //     })
                //     .attr("y", function (d) {
                //         return (d.source.y + d.target.y) / 2 + len;
                //     })

            }

            let linkForce = d3.forceLink(uniqueArr)
                .id((d) => { return d.name })
                // .strength((d)=>{
                //     return d.weight / Math.min(count(link.source), count(link.target));
                // })

            simulation.force('links', linkForce)

            // const weightExtent = d3.extent(uniqueArr, d => d.weight);
            // const weightScale = d3.scaleLinear()
            //     .domain(weightExtent)
            //     .range([0, height]);

            //     const y = d3.forceY().y(d => weightScale(d.weight));
            //     simulation.force('y', y);




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
                .data(uniqueArr)
                .enter()
                .append('line')
                .attr('id', function (d) { return `Mar${d.id}` })
                .attr('stroke-width', 3)
                .style('stroke', "#0fb2cc")
                .attr('marker-end', 'url(#arrowhead)')
            // 引用箭头定义




            let node = svg.append('g')
                .attr('class', 'nodes')
                .selectAll('circle')
                .data(nodesDataForDraw)
                .enter()
                .append('circle')
                .attr('r', 10)
                .attr('fill', "#61b2e4")

            let label = svg.append('g')
                .attr('class', 'labels')
                .selectAll('text')
                .data(nodesDataForDraw)
                .join('text')
                .text(d => d.name)



            const zoom = d3.zoom()
                .scaleExtent([0.1, 40])
                .translateExtent([[-1000, -1000], [width + 100000, height + 10000000]])
                // .filter(filter)
                .on("zoom", zoomed);

            svg.call(zoom)

            function zoomed() {
                svg.select('.nodes').attr("transform", d3.event.transform);
                svg.select('.links').attr("transform", d3.event.transform);
                svg.select('.labels').attr("transform", d3.event.transform);
            }

        }
    },
    updated() {
        // console.log(this.value);
        //   console.log(this.currentRow);
    },
}
</script>
<style>
svg {
    display: block;
    margin: auto;
}
</style>
   