<template>
    <h2 class="mb10">消息流</h2>
    <!-- <div class="tree"> -->
    <el-button @click="handleDraw">多层布局绘制</el-button>
    <svg id='dTree-plot'>
    </svg>
    <!-- </div> -->
</template>
   
<script>
import dagreD3 from 'dagre-d3';
import * as d3 from 'd3';
import { store } from "../store/mesinfo"
import { fetchMesData, testflask, mutiDraw } from "../api/index";

export default {
    name: 'dagre',
    data() {
        return {
            nodedown: [],
            linksdown: [],

            node2Draw: [],
            link2Draw: [],

            numselect: 0


        };
    },
    mounted() {
        this.drawLayer();
    },
    computed: {
        NodeMarFromUser() {
            return store.state.MarFromUser
        },
        timeSelect() {
            return store.state.time
        }
    },

    watch: {
        NodeMarFromUser: {
            deep: true,
            handler() {
                // this.drawLayer();
                console.log(this.numselect);
                this.drawLayer(this.numselect);
                this.numselect++
            }
        },
        timeSelect: {
            deep: true,
            handler() {
                fetchMesData().then(res => {


                    const mesByTime1 = res.data.list.filter((e) => { return e.time <= store.state.time.end && e.time > store.state.time.start })
                    console.log(mesByTime1);
                    const uniqueArr = mesByTime1.filter((item, index) => {
                        return !mesByTime1.slice(0, index).some((prevItem) => {
                            return (prevItem.target === item.target && prevItem.source === item.source);
                        });
                    });
                    this.linksdown = JSON.parse(JSON.stringify(uniqueArr));
                    this.link2Draw = uniqueArr

                    const nodeset = new Set()
                    uniqueArr.forEach(function (e) {
                        nodeset.add(e.source)
                        nodeset.add(e.target)
                    })
                    const nodesDataForDraw = []
                    Array.from(nodeset).forEach((e, index) => {
                        nodesDataForDraw.push({ id: index, name: e })
                    })

                    const linkss = []
                    uniqueArr.forEach(e=>{
                        const source = nodesDataForDraw.find(ele=>ele.name == e.source ).id
                        const target = nodesDataForDraw.find(ele=>ele.name == e.target ).id
                        console.log(source,target);
                        linkss.push([source,target])
                    })
                    this.linksdown = JSON.parse(JSON.stringify(linkss));

                    this.node2Draw = nodesDataForDraw
                })
                console.log("这是初始化");
                console.log(this.node2Draw);
                console.log(this.link2Draw);

            }
        }
    },

    methods: {

        drawLayer(d) {

            const svg = d3.select('#dTree-plot');
            svg.selectAll('#plot1').remove()

            //定义长宽，padding
            const width = 500;
            const height = 500;
            const padding = 30;

            //定义marker箭头
            let defs = svg.append('defs')
            defs.append('marker')
                .attr('id', 'degreeArrowhead')
                .attr('markerWidth', 4)
                .attr('markerHeight', 4)
                .attr('viewBox', '0 -5 12 12') // Arrow head points in x direction
                .attr('refX', 20) // Horizontal offset
                .attr('refY', 0) // Vertical offset
                .attr('orient', 'auto')
                // .attr('markerUnits', "10")
                .append('path')
                .attr('fill', '#434343')
                .attr('d', 'M 0,-5 L 10,0 L 0,5')



            //图1准备数据
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
                return { 'name': v }
            })

            //图2准备数据
            let node2Draw = this.node2Draw;
            let link2Draw = this.link2Draw;

            //图1开始模拟
            this.forceDirectedSimulation(node1Draw,link1Draw,width,height)

            //图2开始模拟
            this.forceDirectedSimulation(node2Draw,link2Draw,width,height)

            //求取比例尺
            let scaleX = d3.scaleLinear()
                            .domain([
                                Math.min(Math.min(...node1Draw.map(v=>v.x)),Math.min(...node2Draw.map(v=>v.x))),
                                Math.max(Math.max(...node1Draw.map(v=>v.x)),Math.max(...node2Draw.map(v=>v.x)))
                            ])
                            .range([padding,width - padding])
            let scaleY = d3.scaleLinear()
                            .domain([
                                Math.min(Math.min(...node1Draw.map(v=>v.y)),Math.min(...node2Draw.map(v=>v.y))),
                                Math.max(Math.max(...node1Draw.map(v=>v.y)),Math.max(...node2Draw.map(v=>v.y)))
                            ])
                            .range([padding,height - padding])

            //绘图
            //图1
            this.drawGraph(1, node1Draw, link1Draw, 0 ,scaleX,scaleY,width,height)
            //图2
            if (d == 0) {
                this.drawGraph(2,
                    this.node2Draw, this.link2Draw
                    , 350,scaleX,scaleY,width,height)
            }



        },
        forceDirectedSimulation(nodes,links,width,height){//进行力导引模拟
            //配置模拟器
            let simulation = d3.forceSimulation()
                .nodes(nodes)

            let linkForce = d3.forceLink(links)
                .id((d) => { return d.name })

            simulation
                .force('charge_force', d3.forceManyBody().strength(-600))
                .force('center_force', d3.forceCenter(width / 2, height / 2))
                .force('links', linkForce)

            //启动
            simulation.stop();
            simulation.tick(3000);
            
        }
        ,
        drawGraph(d, nodes, links, bias,scaleX,scaleY,width,height) {//绘制2.5D视图
            
            //错误检测 
            if (nodes.length == 0)
                return ;

            const svg = d3.select('#dTree-plot')
            const plot = svg.append('g')
                .attr("id", `plot${d}`)


            //绘图
            let border = plot.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', height)
                .attr('width', width)
                .attr('fill', 'none')
                .style('stroke', "gray")
                .style('stroke-width', 2)

            let linkPlot = plot.append('g')
                .selectAll('line')
                .data(links)
                .join('line')
                .attr('stroke-width', 3)
                .style('stroke', "#666666")
                .attr('marker-end', 'url(#degreeArrowhead)')
                .classed(`link${bias}`, true)
                .attr('x1', (d) => { return scaleX(d.source.x) })
                .attr('y1', (d) => { return scaleY(d.source.y) })
                .attr('x2', (d) => { return scaleX(d.target.x) })
                .attr('y2', (d) => { return scaleY(d.target.y) })

            let nodePlot = plot.append('g')
                .selectAll('circle')
                .data(nodes)
                .join('circle')
                .attr('r', 10)
                .attr('fill', "#b256f0")
                .attr('stroke',"white")
                .attr('stroke-width',2)
                .classed(`node${bias}`, true)
                .attr('cx', (d) => { return scaleX(d.x) })
                .attr('cy', (d) => { return scaleY(d.y) })

            // let nodeText = plot.append('g')
            //     .selectAll('text')
            //     .data(nodes)
            //     .join('text')
            //     .text(d => d.name)
            //     .classed(`text${bias}`, true)
            //     .attr('x', function (d) {
            //         return scaleX(d.x) - 0.5 * this.getBoundingClientRect().width
            //     })
            //     .attr('y', function (d) {
            //         return scaleY(d.y) + 0.3 * this.getBoundingClientRect().height
            //     })




            //旋转
            plot.style('transform', `translate(${width * 0.7}px,${bias}px) rotateX(60deg) rotateZ(30deg)`)
            // plot.style('transform',`translate(${0}px,${bias}px)`)



        },
        handleDraw() {
            //多层绘制
            const nodeMuti = []
            this.node2Draw.forEach(e => {
                // console.log(e.name);
                nodeMuti.push(e.id+' 0 0 0 0')
            })
            const linkMuti = []
            this.linksdown.forEach(e => {
                console.log(e);
                linkMuti.push('1 '+e[0]+' '+e[1]+' 1')
            })

            mutiDraw({ node: nodeMuti, link: linkMuti }).then(res => {
                console.log(res);
            })
        }
    },
};
</script>
   
<style>
.tree {
    border: 1px solid #9e4a4a00;
    padding: 20px;
    width: 600px;
    height: 80px;
    margin: auto;
}

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
    width: 800px;
    height: 1200px;
}
</style>