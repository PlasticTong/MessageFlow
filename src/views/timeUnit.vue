<template>
    <div class="time-unit-container">

        <b>视图 <b style="color:green">{{data.index}}</b> 概览</b>
        <svg ref="time-unit-plot" class="time-unit-plot"></svg>
        <div class="time-unit-info">
            <el-descriptions style="width:100%" :column="1" border>
                <el-descriptions-item labelClassName="time-unit-info-label">
                    <template v-slot:label>
                        <i class="el-icon-time"></i>
                        时间范围
                    </template>
                    {{data.timeRange}}
                </el-descriptions-item>
                <el-descriptions-item>
                <template v-slot:label>
                    <i class="el-icon-mobile-phone"></i>
                    节点数
                </template>
                    {{data.nodeData.length}}
                </el-descriptions-item>
                <el-descriptions-item>
                <template v-slot:label>
                    <i class="el-icon-location-outline"></i>
                    边数
                </template>
                    {{data.linkData.length}}
                </el-descriptions-item>
            </el-descriptions>
        </div>

        <div class="time-unit-controll">
            <el-checkbox style="width:100px;height:35px" border label="选择" @change="changeSelected" v-model="data.selected"></el-checkbox>
            <el-button style="width:100px;height:35px"  @click="deleteSelf"  type="danger">删除</el-button>
        </div>

    </div>
</template>
  
<script>
import * as d3 from 'd3'
import { store } from "../store/mesinfo"
import { ElMessage, ElMessageBox,ElIcon } from "element-plus";
import { set } from 'lodash';
import { noopDirectiveTransform } from '@vue/compiler-core';
import { fetchMesData, testflask, mutiDraw,mutiCross } from "../api/index";
import axios from 'axios'
import {
  Check,
  Delete,
  Edit,
  Message,
  Search,
  Star,
} from '@element-plus/icons-vue'



export default {
    name:'timeUnit',
    props:['data'],
    data() {
        return {
        }
    },

    watch:{
        dateRange(v){
            console.log(v)
        }
    },

    methods: {
        drawLinkMap(svgDOM,nodeData,linkData){
            /**
             * 
             * svg：svg的DOM元素
             * node：点数据，格式参考simulation生成的
             * link：边数据，格式参考simulation生成的
             * 
             */
            const svg = d3.select(svgDOM)
            svg.selectAll('*').remove()

            //错误检测
            if(nodeData.length == 0)
                return;

            const width = svg.node().getBoundingClientRect().width
            const height = svg.node().getBoundingClientRect().height
            const plot = svg.append('g')

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


            let link = plot.append('g')
                .attr('class', 'links')
                .selectAll('line')
                .data(linkData)
                .join('line')
                .attr('stroke-width', 3)
                .style('stroke', "#0fb2cc")
                .attr('marker-end', 'url(#arrowhead)')
                .attr('x1', (d) => { return d.source.x})
                .attr('y1', (d) => { return d.source.y })
                .attr('x2', (d) => { return d.target.x })
                .attr('y2', (d) => { return d.target.y })

            let node = plot.append('g')
                .attr('class', 'nodes')
                .selectAll('circle')
                .data(nodeData)
                .join('circle')
                .attr('r', 10)
                .attr('fill', "#61b2e4")
                .attr('cx', (d) => { return d.x})
                .attr('cy', (d) => { return d.y })

            let label = plot.append('g')
                .attr('class', 'labels')
                .selectAll('text')
                .data(nodeData)
                .join('text')
                .text(d => d.name)
                .attr('x', function (d) {
                    return d.x - 0.5 * this.getBoundingClientRect().width
                })
                .attr('y', function (d) {
                    return d.y + 0.3 * this.getBoundingClientRect().height
                })

            const zoom = d3.zoom()
                .scaleExtent([0.1, 40])
                .translateExtent([[-10000, -10000], [width + 100000, height + 10000000]])
                // .filter(filter)
                .on("zoom", zoomed);

            svg.call(zoom)

        
            function zoomed() {
                plot.select('.nodes').attr("transform", d3.event.transform);
                plot.select('.links').attr("transform", d3.event.transform);
                plot.select('.labels').attr("transform", d3.event.transform);
            }

            //预先缩放到中心位置
            const plotWidth = plot.node().getBoundingClientRect().width;
            const plotHeight = plot.node().getBoundingClientRect().height;



            let originTransformX = -plot.node().getBBox().x
            let originTransformY = -plot.node().getBBox().y
            let originTransformK = Math.min(1.0*width/plotWidth,1.0*height/plotHeight) * 0.85

            let smallPlotWidth = plotWidth * originTransformK;
            let smallPlotHeight = plotHeight * originTransformK;

            let offsetTransformX = (0.5 * width - 0.5 * smallPlotWidth)
            let offsetTransformY = (0.5 * height - 0.5 * smallPlotHeight)


            plot
            .style('transform-origin','left top')
            .attr("transform",`translate(${offsetTransformX},${offsetTransformY}) scale(${originTransformK}) translate(${originTransformX},${originTransformY})`)
        },
        deleteSelf(){//删除数据
            this.$emit("deletePlotData",this.data)
        },
        
        changeSelected(newValue){
            if(newValue){
                 this.$emit("selectPlotData",this.data)
            }
        },

    },
    mounted(){
        this.drawLinkMap(this.$refs['time-unit-plot'],this.data.nodeData,this.data.linkData)
    }

}
</script>
<style>


.time-unit-container{
    height: 100%;
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: center;
    margin:5px;
    border:2px solid gray;
    padding:10px 20px;
}

.time-unit-plot{
    width:300px;
    height: 300px;
    border: 3px solid gray;
    margin:5px 0px;
}

.time-unit-info{
    width:300px;
    display: flex;
    flex-direction:column;
    align-items: center;
    margin-top:30px;
    margin-bottom:30px;
}

.time-unit-controll{
    width:280px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom:30px;

}

.time-unit-info-label{
    width:30%;
}

.el-range-editor.is-disabled{
    color:white;
    background-color:white;
    border-color:white;
}

.el-range-editor.is-disabled input{
    color:gray;
    background-color:white;
    border-color:white;
}

</style>
   