<template>
    <h2 class="mb10">消息流</h2>
    <el-checkbox v-model="showline" @change="connect">显示连线</el-checkbox>
    <svg id='dTree-plot'>
    </svg>
</template>
   
<script>
import dagreD3 from 'dagre-d3';
import * as d3 from 'd3';
import { store } from "../store/mesinfo"
import { fetchMesData, testflask, mutiDraw } from "../api/index";
import { createWebHistory } from 'vue-router';

export default {
    name: 'dagre',
    data() {
        return {
            nodedown: [],
            linksdown: [],

            node2Draw: [],
            link2Draw: [],
            node1Draw: [],
            link1Draw: [],

            numselect: 0,
            showline: true,
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
            return store.state.linkFByTime
        }
    },

    watch: {
        NodeMarFromUser: {
            deep: true,
            handler() {
                // this.drawLayer();
                // console.log(this.numselect);
                this.drawLayer();
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
                    .attr('opacity', 0.7)
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
        drawGraph(name, nodes, links, origin, width, height, finalScale, plotSkew) {//绘制2.5D视图（不含边框）

            //错误检测 
            if (nodes.length == 0)
                return;

            const svg = d3.select('#dTree-plot')
            const plot = svg.select(`.${name}Plot`)
                .attr("id", `plot-${name}`)


            let linkPlot = plot.append('g')
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

            let nodePlot = plot.append('g')
                .selectAll('circle')
                .data(nodes)
                .join('circle')
                .attr('r', 10)
                .attr('fill', "#b256f0")
                .attr('stroke', "white")
                .attr('stroke-width', 2)
                .classed(`degreeNode-${name}`, true)
                .attr('cx', (d) => { return d.x })
                .attr('cy', (d) => { return d.y })
                .on('mouseover', function (d, i) {
                    //添加标注文本
                    const annoPlot = svg.append('g').classed('anno', true)
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
                    svg.select('.anno').remove()
                })



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
   
<style>
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
</style>