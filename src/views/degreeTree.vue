<template>
    
    <h2 class="mb10">消息流</h2>
    <div class="tree">
        <svg class="dagre" width="600" height="500">
            <g class="container"></g>
        </svg>
    </div>
</template>
   
<script>
import dagreD3 from 'dagre-d3';
import * as d3 from 'd3';
import { store } from "../store/mesinfo"

export default {
    name: 'dagre',
    data() {
        return {
            
        };
    },
    mounted() {
        this.draw();
    },
    methods: {
        // 绘制简单的流程图
        draw() {
            const dataEdge = store.state.markov
            // 创建 Graph 对象
            const g = new dagreD3.graphlib.Graph().setGraph({
                rankdir: 'TB', // 流程图从下向上显示，默认'TB'，可取值'TB'、'BT'、'LR'、'RL'
            }).setDefaultEdgeLabel(function () { return {}; });



            const dataEdgeForDraw = [];
            const dataNodeForDraw = [];
            for(let index in dataEdge.markov){
                for(let index2 in dataEdge.markov[index].flow){
                    let stateDrawForNode = [{id:store.state.userinfo.list.find(e=>e.name==store.state.mesinfo.list[dataEdge.markov[index].flow[index2]-1].source).id,name:store.state.userinfo.list.find(e=>e.name==store.state.mesinfo.list[dataEdge.markov[index].flow[index2]-1].source).name}]
                    let stateDrawForNode2 = [{id:store.state.userinfo.list.find(e=>e.name==store.state.mesinfo.list[dataEdge.markov[index].flow[index2]-1].target).id,name:store.state.userinfo.list.find(e=>e.name==store.state.mesinfo.list[dataEdge.markov[index].flow[index2]-1].target).name}]
                    let stateDraw = [store.state.userinfo.list.find(e=>e.name==store.state.mesinfo.list[dataEdge.markov[index].flow[index2]-1].source).id,store.state.userinfo.list.find(e=>e.name==store.state.mesinfo.list[dataEdge.markov[index].flow[index2]-1].target).id]
                    dataNodeForDraw.push(stateDrawForNode,stateDrawForNode2)
                    dataEdgeForDraw.push(stateDraw)
                }
            }
            // console.log(dataNodeForDraw);



            // Graph添加节点
            for (let index in dataNodeForDraw) {
                let node = dataNodeForDraw[index]
                // console.log(node[0].name);
                g.setNode(node[0].id, {
                    id: node[0].id,
                    label:node[0].name,
                    shape: 'rect',  //节点形状，可以设置rect(长方形),circle,ellipse(椭圆),diamond(菱形) 四种形状，还可以使用render.shapes()自定义形状
                    style: 'fill:#61b2e4;stroke:#fff',  //节点样式,可设置节点的颜色填充、节点边框
                    labelStyle: 'fill: #fff;font-weight:bold',  //节点标签样式, 可设置节点标签的文本样式（颜色、粗细、大小）
                    rx: 5,  // 设置圆角
                    ry: 5,  // 设置圆角
                    paddingBottom: 15,
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingTop: 15,
                });
            }
            // this.nodes.forEach(node => {
            //     g.setNode(node.id, {
            //         id: node.id,
            //         label: node.nodeName,
            //         shape: 'rect',  //节点形状，可以设置rect(长方形),circle,ellipse(椭圆),diamond(菱形) 四种形状，还可以使用render.shapes()自定义形状
            //         style: 'fill:#61b2e4;stroke:#fff',  //节点样式,可设置节点的颜色填充、节点边框
            //         labelStyle: 'fill: #fff;font-weight:bold',  //节点标签样式, 可设置节点标签的文本样式（颜色、粗细、大小）
            //         rx: 5,  // 设置圆角
            //         ry: 5,  // 设置圆角
            //         paddingBottom: 15,
            //         paddingLeft: 20,
            //         paddingRight: 20,
            //         paddingTop: 15,
            //     });
            // });
           
            
            // Graph添加节点之间的连线
            if (dataNodeForDraw.length > 1) {
                for (let index in dataEdgeForDraw) {
                let edge = dataEdgeForDraw[index]
                g.setEdge(edge[0], edge[1], {
                        style: 'stroke: #0fb2cc; fill: none; stroke-width: 2px',  // 连线样式
                        arrowheadStyle: 'fill: #0fb2cc;stroke: #0fb2cc;',  //箭头样式，可以设置箭头颜色
                        arrowhead: 'normal',  //箭头形状，可以设置 normal,vee,undirected 三种样式，默认为 normal
                    })
            }
            }

            // 获取要绘制流程图的绘图容器
            const container = d3.select('svg.dagre').select('g.container');

            // 创建渲染器
            const render = new dagreD3.render();
            // 在绘图容器上运行渲染器绘制流程图
            render(container, g);
        },
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
</style>