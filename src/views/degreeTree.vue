<template>
    <h2 class="mb10">消息流</h2>
    <!-- <div class="tree"> -->
    <svg id='d3'>
    </svg>
    <!-- </div> -->
</template>
   
<script>
import dagreD3 from 'dagre-d3';
import * as d3 from 'd3';
import { store } from "../store/mesinfo"

export default {
    name: 'dagre',
    data() {
        return {
            width: 100,


        };
    },
    mounted() {
        this.drawTree();
    },
    computed: {
        NodeMarFromUser() {
            return store.state.MarFromUser
        }

    },

    watch: {
        NodeMarFromUser: {
            deep: true,
            handler() {
                this.drawTree();
            }
        }
    },

    methods: {
        drawTree() {

            console.log(store.state.MarFromUser);
            if (store.state.MarFromUser.length > 0) {

                const rawArray = store.state.MarFromUser.map(item => ({
                    id: item.id,
                    parentId: item.parentId
                }));
                const jsonString = JSON.stringify(rawArray);
                const resultArray = JSON.parse(jsonString);


                const set = new Set(resultArray)
                const resultArray2 = Array.from(set)
                console.log(resultArray2);

                let width = 1000
                let height = 1000
                let padding = 1
                const chaos = d3.stratify()(
                    resultArray2
                    //   [{id: "Chaos"},
                    //   {id: "Gaia", parentId: "Chaos"},
                    // //   {id: "Gaia", parentId: "Chaos"},
                    //   {id: "Eros", parentId: "Chaos"},
                    //   {id: "Erebus", parentId: "Chaos"},
                    //   {id: "Tartarus", parentId: "Chaos"},
                    //   {id: "Mountains", parentId: "Gaia"},
                    //   {id: "Pontus", parentId: "Gaia"},
                    //   {id: "Uranus", parentId: "Gaia"}]
                )
                console.log("chaos" + chaos.data);

                // const hierarchy = d3.hierarchy(data)
                // 如果需要对同级数据排序
                // hierarchy.sort((a, b) => (a.height - b.height) || a.data.name.localeCompare(b.data.name))

                const dy = width / (chaos.height + 1) - 5
                const dx = 100;

                const root = d3.tree().nodeSize([dx, dy])(chaos)
                // 集群图 const root = d3.cluster()

                let min = Infinity
                let max = -min
                root.each(d => {
                    if (d.y > max) max = d.y
                    if (d.y < min) min = d.y
                })
                height = max - min + dx * 2

                const svg = d3.select('svg#d3')
                    .attr("viewBox", [min - dy * 2, -dx * padding / 2, width, height])
                    .attr("width", width)
                    .attr("height", 1000)
                    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", 10);

                svg.selectAll('*').remove();

                const link = svg.append('g')
                    .attr('fill', 'none')
                    .attr('stroke', '#83887c')
                    .attr('stroke-width', 1.5)
                    .selectAll('path')
                    .data(root.links())
                    .enter().append('path')
                    .attr('d', d => `
        M${d.target.x}, ${d.target.y}
        ${d.source.x}, ${d.source.y}
    `)
                //                 .attr('d', d => `
                //     M${d.target.y}, ${d.target.x}
                //     C${d.source.y + dy / 2}, ${d.target.x}
                //     ${d.source.y + dy / 2}, ${d.source.x}
                //     ${d.source.y}, ${d.source.x}
                // `)

                const node = svg.append('g')
                    .attr('stroke-linejoin', 'round')
                    .attr('stroke-width', 3)
                    .selectAll('g')
                    .data(root.descendants())
                    .enter().append('g')
                    .attr('transform', d => `translate(${d.x},${d.y})`)

                node.append('rect') // 将 circle 替换为 rect
                    .attr('width', 60) // 添加矩形的宽度
                    .attr('height', 30) // 添加矩形的高度
                    .attr('x', -30) // 向左平移一半的宽度
                    .attr('y', -7) // 向上平移一半的高度
                    .attr('fill', "#61b2e4");

                node.append('text')
                    .attr('dy', 13)
                    .attr('x', d => d.children ? 0 : -28)
                    .text(d => d.data.id)
                    .filter(d => d.children)
                    .attr('text-anchor', 'middle')
                    .clone(true).lower()
                    .attr('stroke', '#f2f6ed')
            }
        },
        // 绘制简单的流程图
        draw() {
            console.log(store.state.NodeMarFromUser);
            // const dataEdge = store.state.markov
            // // 创建 Graph 对象
            // const g = new dagreD3.graphlib.Graph().setGraph({
            //     rankdir: 'TB', // 流程图从下向上显示，默认'TB'，可取值'TB'、'BT'、'LR'、'RL'
            // }).setDefaultEdgeLabel(function () { return {}; });



            // const dataEdgeForDraw = [];
            // const dataNodeForDraw = [];
            // for(let index in dataEdge.markov){
            //     for(let index2 in dataEdge.markov[index].flow){
            //         let stateDrawForNode = [{id:store.state.userinfo.list.find(e=>e.name==store.state.mesinfo.list[dataEdge.markov[index].flow[index2]-1].source).id,name:store.state.userinfo.list.find(e=>e.name==store.state.mesinfo.list[dataEdge.markov[index].flow[index2]-1].source).name}]
            //         let stateDrawForNode2 = [{id:store.state.userinfo.list.find(e=>e.name==store.state.mesinfo.list[dataEdge.markov[index].flow[index2]-1].target).id,name:store.state.userinfo.list.find(e=>e.name==store.state.mesinfo.list[dataEdge.markov[index].flow[index2]-1].target).name}]
            //         let stateDraw = [store.state.userinfo.list.find(e=>e.name==store.state.mesinfo.list[dataEdge.markov[index].flow[index2]-1].source).id,store.state.userinfo.list.find(e=>e.name==store.state.mesinfo.list[dataEdge.markov[index].flow[index2]-1].target).id]
            //         dataNodeForDraw.push(stateDrawForNode,stateDrawForNode2)
            //         dataEdgeForDraw.push(stateDraw)
            //     }
            // }
            // // dataNodeForDraw = store.state.nodeMarFromUser
            // console.log(dataNodeForDraw);



            // // Graph添加节点
            // for (let index in dataNodeForDraw) {
            //     let node = dataNodeForDraw[index]
            //     // console.log(node[0].name);
            //     g.setNode(node[0].id, {
            //         // id: node[0].id,
            //         label:node[0].name,
            //         shape: 'rect',  //节点形状，可以设置rect(长方形),circle,ellipse(椭圆),diamond(菱形) 四种形状，还可以使用render.shapes()自定义形状
            //         style: 'fill:#61b2e4;stroke:#fff',  //节点样式,可设置节点的颜色填充、节点边框
            //         labelStyle: 'fill: #fff;font-weight:bold',  //节点标签样式, 可设置节点标签的文本样式（颜色、粗细、大小）
            //         rx: 5,  // 设置圆角
            //         ry: 5,  // 设置圆角
            //         paddingBottom: 15,
            //         paddingLeft: 10,
            //         paddingRight: 10,
            //         paddingTop: 15,
            //     });
            // }
            // // this.nodes.forEach(node => {
            // //     g.setNode(node.id, {
            // //         id: node.id,
            // //         label: node.nodeName,
            // //         shape: 'rect',  //节点形状，可以设置rect(长方形),circle,ellipse(椭圆),diamond(菱形) 四种形状，还可以使用render.shapes()自定义形状
            // //         style: 'fill:#61b2e4;stroke:#fff',  //节点样式,可设置节点的颜色填充、节点边框
            // //         labelStyle: 'fill: #fff;font-weight:bold',  //节点标签样式, 可设置节点标签的文本样式（颜色、粗细、大小）
            // //         rx: 5,  // 设置圆角
            // //         ry: 5,  // 设置圆角
            // //         paddingBottom: 15,
            // //         paddingLeft: 20,
            // //         paddingRight: 20,
            // //         paddingTop: 15,
            // //     });
            // // });


            // // Graph添加节点之间的连线
            // if (dataNodeForDraw.length > 1) {
            //     for (let index in dataEdgeForDraw) {
            //     let edge = dataEdgeForDraw[index]
            //     g.setEdge(edge[0], edge[1], {
            //             style: 'stroke: #0fb2cc; fill: none; stroke-width: 2px',  // 连线样式
            //             arrowheadStyle: 'fill: #0fb2cc;stroke: #0fb2cc;',  //箭头样式，可以设置箭头颜色
            //             arrowhead: 'normal',  //箭头形状，可以设置 normal,vee,undirected 三种样式，默认为 normal
            //         })
            // }
            // }

            // // 获取要绘制流程图的绘图容器
            // const container = d3.select('svg.dagre').select('g.container');

            // // 创建渲染器
            // const render = new dagreD3.render();
            // // 在绘图容器上运行渲染器绘制流程图
            // render(container, g);
        },
        drawLinkNode(){
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
                { 'name': '192.168.1.5-192.168.1.9', 'sex': 'F' },
                { 'name': '192.168.1.9-192.168.1.18', 'sex': 'F' },
            ]

            let linksData = [
                { 'id': 1, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.3', 'type': 1 },
                { 'id': 2, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.4', 'type': 2 },
                { 'id': 3, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.5', 'type': 3 },
                { 'id': 4, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.7', 'type': 4 },
                { 'id': 5, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.8', 'type': 5 },
                { 'id': 6, 'source': '192.168.1.1-192.168.1.2', 'target': '192.168.1.2-192.168.1.6', 'type': 6 },
                { 'id': 7, 'source': '192.168.1.2-192.168.1.5', 'target': '192.168.1.5-192.168.1.9', 'type': 6 },
                { 'id': 8, 'source': '192.168.1.5-192.168.1.9', 'target': '192.168.1.9-192.168.1.18', 'type': 6 },
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
                .on("click", d=>{


                    const ipRegex = /(\d+\.\d+\.\d+\.\d+)-(\d+\.\d+\.\d+\.\d+)/;
                    // if(store.state.MarFromUser.find(e=>e.))
                    // console.log(this.rootnum);
                    if (store.state.MarFromUser.length == 0) {
                        store.state.MarFromUser.push({ id: d.source.name.match(ipRegex)[1] })
                    }
                    const res1 = { id: d.source.name.match(ipRegex)[2], parentId: d.source.name.match(ipRegex)[1] }
                    const res2 = { id: d.target.name.match(ipRegex)[2], parentId: d.source.name.match(ipRegex)[2] }

                    if(store.state.MarFromUser.find(e=>e.id == res1.id && e.parentId == res1.parentId)==null){
                        store.state.MarFromUser.push(res1)
                    }

                    if(store.state.MarFromUser.find(e=>e.id == res2.id && e.parentId == res1.parentId)==null){
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
        }
    },
};
</script>
   
<style>
.tree {
    border: 1px solid #9e4a4a00;
    padding: 20px;
    width: 600px;
    height: 650px;
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
</style>