<template>
  <div v-loading="isLoading" ref="multi_layer_container" class="multi_layer_container">
    
    <!--画布-->
    <svg xmlns="http://www.w3.org/2000/svg" class="multi_layer_canva"></svg>

    <!--控制器-->
    <!-- <div v-for="(item,index) in innerGraphs" :key="index" ref="multi_layer_controllerBox" :class="`multi_layer_controllerBox-${index}`" style="position:absolute;display:flex;flex-direction:column;align-items:center">
        <el-popover
          placement="left"
          width="300"
          trigger="click">
          <el-row type="flex" justify="center">
            <b>第{{index+1}}层-设置</b>
          </el-row>
          <hr style="margin-bottom:20px;border:2px solid lightgray;height: 0;"/>
          <el-row type="flex" align="center" style="margin-bottom:20px">
            <el-col :offset="2" :span="10" style="display:flex;align-items:center">模式：</el-col>
            <el-col :offset="0" :span="10" style="display:flex;justify-content:center">
              <el-radio-group size="mini" v-model="drag_mode[index]" @input="handleDragModeChange(index)">
                <el-radio-button label="缩放"></el-radio-button>
                <el-radio-button label="圈选"></el-radio-button>
              </el-radio-group>
            </el-col>
          </el-row>
          <el-row type="flex" align="center" style="margin-bottom:20px">
            <el-col :offset="2" :span="10" style="display:flex;align-items:center">信息展示：</el-col>
            <el-col :offset="0" :span="10" style="display:flex;justify-content:center">
              <el-radio-group size="mini" v-model="InfoShowMode[index]" @input="handleInfoShowModeChange(index)">
                <el-radio-button label="显示"></el-radio-button>
                <el-radio-button label="隐藏"></el-radio-button>
              </el-radio-group>
            </el-col>
          </el-row>
          <el-row type="flex" align="center" style="margin-bottom:20px">
            <el-col :offset="2" :span="10" style="display:flex;align-items:center">点基准半径：</el-col>
            <el-col :offset="0" :span="10" style="display:flex;justify-content:center">
              <el-input-number 
                size="mini" 
                v-model="baseRadius[index]"
                :min="0.5"
                :step="0.5"
                @change="handleRadiusChange(index)"
                ></el-input-number>
            </el-col>
          </el-row>
          <el-row v-show="index != innerGraphs.length-1" type="flex" align="center">
            <el-col :offset="2" :span="10" style="display:flex;align-items:center">跨层线宽(下层)：</el-col>
            <el-col :offset="0" :span="10" style="display:flex;justify-content:center">
              <el-input-number 
                size="mini" 
                v-model="outerLinkWidth[index]"
                :min="0.5"
                :step="0.5"
                @change="handleOutLinkWidthChange(index)"
                ></el-input-number>
            </el-col>
          </el-row>
          <el-button slot="reference" type="primary" icon="el-icon-s-tools" circle></el-button>
        </el-popover>
        <el-button type="primary" icon="el-icon-full-screen" circle @click="resetPos(index)" style="margin-top:10px;"></el-button>
        <el-button type="primary" icon="el-icon-delete" circle @click="resetChosen(index)" style="margin-top:10px;margin-left:0px;"></el-button>

    </div> -->

    <!--悬浮信息版-->
    <!-- <InfoPanel :style="InfoPanelStyle" v-show="InfoPanelVisible" ref="infoPanel"/> -->
  </div>




</template>



<script>

/**
 * 
 * 事件：
 *      @exportChosenData:导出一个数组，每一个元素是每层的id数组。这些元素依层次排列
 * 
 * 
 */




import * as d3 from 'd3'
import {nanoid} from 'nanoid'
// import {Button,Popover,Row,Col,InputNumber,Loading,RadioButton,RadioGroup} from 'element-ui';
import InfoPanel from '../views/InfoPanel.vue';
// import Vue from 'vue'
// import 'element-ui/lib/theme-chalk/index.css';
import axios from "axios"
import lasso from "./d3-lasso";
import { getwangzixiao } from "../api/index.ts"

// Vue.component(Button.name, Button);
// Vue.component(Popover.name, Popover);
// Vue.component(Row.name, Row);
// Vue.component(Col.name, Col);
// Vue.component(InputNumber.name, InputNumber);
// Vue.component(RadioButton.name, RadioButton);
// Vue.component(RadioGroup.name, RadioGroup);
// Vue.use(Loading.directive);

export default {
  name: 'MultiLayer',
  components:{InfoPanel},
  data () {
    return {
      //标识数据
      nanoid:undefined,//组件的id标识符


      //根本数据
      innerGraphs:[],//每层的内部数据
      // [
      //   {
      //     'nodes':[{'id':1},...],
      //     'links':[{'source':1,'target':2},...],
      //   },
      //   {
      //     'nodes':[{'id':17},...],
      //     'links':[{'source':23,'target':46,'type':'dir'},...],//type表示方向性，dir为有向，undir为无向
      //   },
      //   ...
      // ]
      // 注意：不同层的nodes的id也必须保持独特性
      outerLinks:[],//层之间的连接数据
      // [
      //   {'links':[{'source':1,'target':17,'type':'undir'},...],},//source是上层,target是下层，//type表示方向性，dir为有向，undir为无向
      //   {...},
      //   ...
      // ]


      //innerGraphs和outerLinks的每个点和边的数据对象还可以附着一个键值为message的对象，用于展示消息面板
      //格式如下：
      //    message:



      //主要数据
      layoutData:[],//层内点和边布局位置信息
      // [
      //   {
      //     'nodes':[{'id':1,'x':15.2,'y':16.9,type:'undir'},...],
      //     'links':[{'source':{'id':3,'x':14.1,'y':14.4,type:'dir'},'target':{'id':2,'x':9.145,'y':0.421,'type':'undir'}},...]
      //   },
      //   ...
      // ]


      //配置项，可人为修改
      outerPadding:{//svg的padding
          'bottom': 40,
          'top': 40,
          'left': 40,
          'right': 120,
      },
      borderSkew:20,//辅助平面的倾斜角度（平面上的倾斜），单位deg
      plotSkew:45,//图像的倾斜角度（空间上的倾斜），单位deg
      WHRadio:0.5,//边框BBox的长宽比
      unitMargin:40,//边框之间的上下间距
      initRadius:12,//点的初始基准半径
      initOuterLinkWidth:3.5,//初始的跨层连线宽度
      initInnerPadding:30,//每层的plot在初始的适应状态下相对于initArea的padding（水平方向准，垂直方向不一定准）
      innerArrowSizeRadio:1.7,//层内连线的箭头尺寸对半径的比例
      innerCircleStrokeRadio:0.3,//层内点的stroke-width对半径的比例
      innerLinkStrokeRadio:0.5,//层内的link的宽度对半径的比例
      innerTextSizeRadio:3,//层内文本大小对半径的比例
      initDragMode:'缩放',//初始的drag模式 圈选/缩放
      initInfoShowMode:'显示',//初始的信息版显示模式 显示，隐藏


      //尺寸数据
      svgWidth:0,//svg的宽度
      partWidth:0,//边框BBox的宽度
      partHeight:0,//边框的BBox的高度
      borderWidth:0,//边框的宽度
      initAreaWidth:0,//initArea：在折叠前，plot应该占据的空间，initArea的宽度
      initAreaHeight:0,//initArea的高度

      //其他数据
      isLoading:false,//是否加入加载页面
      chosenData:[],//被选择的数据，每层的选择数据的id构成的一个Set，这些数组依序列在chosenData中：[[1,3,4],[22,24],...]
      outerLinkWidth:[],//跨层连线的宽度
      baseRadius:[],//点的基准半径 [radius1,radius2,...]
      drag_mode:[],//点的拖动交互代表的模式，['缩放','圈选',...]
      InfoShowMode:[],//信息显示模式，['显示','隐藏',...]
      zooms:[],//zoom工具（缩放）
      lassos:[],//lasso工具（圈选）
      InfoPanelVisible:false,//信息板的可见变量
      InfoPanelStyle:{
        top:'0px',
        left:'0px'
      },//信息版的动态style
    }
  },


  methods:{
    /**
     * 
     * 外部接口
     * 
     */
    setData(innerGraphs,outerLinks){//绑定数据
      //绑定数据
      this.innerGraphs = JSON.parse(JSON.stringify(innerGraphs));
      this.outerLinks = JSON.parse(JSON.stringify(outerLinks));
      
      // console.log('innerGraphs',this.innerGraphs)
      // console.log('outerLinks:',this.outerLinks)

      //清理之前的数据，并且初始化一些数据
      this.baseRadius.length = 0;//baseRadius
      for(let i in this.innerGraphs){
        this.baseRadius.push(this.initRadius);
      }
      for(let i in this.outerLinks){//outerLinkWidth
        this.outerLinkWidth.push(this.initOuterLinkWidth);
      }
      this.layoutData = [];//layoutData
      this.chosenData.length = 0;//chosenData
      for(let i in this.innerGraphs){
        this.chosenData.push(new Set())
      }
      this.drag_mode.length = 0;//drag_mode
      for(let i in this.innerGraphs){
        this.drag_mode.push(this.initDragMode)
      }
      this.InfoShowMode.length = 0;//drag_mode
      for(let i in this.innerGraphs){
        this.InfoShowMode.push(this.initInfoShowMode)
      }
      this.zooms.length = 0;//zooms
      for(let i in this.innerGraphs){
        this.zooms.push(undefined)
      }
      this.lassos.length = 0;//lassos
      for(let i in this.innerGraphs){
        this.lassos.push(undefined)
      }
      this.InfoPanelVisible = false;//InfoPanelVisible
      this.InfoPanelStyle = {//InfoPanelStyle
        top:'0px',
        left:'0px',
      };
    },

    async draw(){//重绘整张图

      if(this.innerGraphs === undefined || this.innerGraphs === null || this.innerGraphs.length == 0)
        return;

      //启用加载遮罩
      this.isLoading = true;

      //清理
      const svg = d3.select(this.$refs['multi_layer_container']).select('.multi_layer_canva');
      svg.selectAll('*').remove();

      //创建绘图结构，并设置层的优先级
      const plot = svg.append('g').classed('multi_layer_plot',true);
      for(let layer in this.innerGraphs){
        //从后往前添加
        const layerArea = plot.append('g').classed(`multi_layer_layerArea-${this.innerGraphs.length - 1 - layer}`,true)
        layerArea.append('g').classed(`multi_layer_outerArea-${this.innerGraphs.length - 1 - layer}`,true)
        layerArea.append('g').classed(`multi_layer_borderArea-${this.innerGraphs.length - 1 - layer}`,true)
        layerArea.append('g').classed(`multi_layer_innerArea-${this.innerGraphs.length - 1 - layer}`,true)
        layerArea.append('defs').classed(`multi_layer_innerDefs-${this.innerGraphs.length - 1 - layer}`,true)
      }

      //适应容器大小
      this.fitSize();

      //设置布局
      await this.setLayout();


      //绘图
      for(let layer in this.innerGraphs){//层内
        this.drawSingleLayer(parseInt(layer));
      }

      for(let start_layer in this.outerLinks){//跨层连接边
        this.drawSingleOuterLinks(parseInt(start_layer));
      }

      //关闭加载遮罩
      this.isLoading = false;

      
    },


    /**
     * 
     * 内部方法
     * 
     */

    fitSize(){//使得组件适应容器大小（计算单元的各个尺寸，元件位置，以及svg的高度）
      const svg = d3.select(this.$refs['multi_layer_container']).select('.multi_layer_canva');

      //设置长度
      this.svgWidth = svg.node().getBoundingClientRect().width;
      this.partWidth = this.svgWidth - this.outerPadding.left - this.outerPadding.right;
      this.partHeight = this.WHRadio * this.partWidth;
      this.borderWidth = this.partWidth - this.partHeight * Math.tan(this.borderSkew * Math.PI / 180);
      this.initAreaWidth =  this.partWidth - 2 * this.partHeight * Math.tan(this.borderSkew * Math.PI / 180);
      this.initAreaHeight = this.partHeight / Math.cos(this.plotSkew * Math.PI / 180);


      //设置svg高度
      svg.style('height',this.outerPadding.top + this.outerPadding.bottom + this.innerGraphs.length * (this.partHeight + this.unitMargin))
      
      //调整控制器位置
      this.$nextTick(()=>{//防止v-for的渲染延迟
        for(let layer_index in this.innerGraphs){
          const controllerBox = d3.select(this.$refs['multi_layer_container']).select(`.multi_layer_controllerBox-${layer_index}`)
          controllerBox.style('top',`${this.outerPadding.top + layer_index * (this.partHeight + this.unitMargin)}px`)
                       .style('right','20px')
        }
      })

    },

    async setLayout(){//布局算法入口


        /**
         * 
         * 布局算法需要给layoutData传入innerGraph类似结构的数据，但是
         * 每个点对象有x,y属性，被条边有类似simulation的links的source
         * 和target数据
         * 
         */

        this.getForceDirectedLayout();//力导引布局

        // await this.getWangZixiaoLayout();//王子潇布局

    },

    async getWangZixiaoLayout(){//王子潇布局
      /**
       *
       * 恰好适应边框，布局的左上角(0,0)在画布中对应borderAnchor
       * 
       * 要求:1.跨层有连接关系的点必须是一对一的关系
       *      2.下层点多于上层点
       * 
       */

      

      let layer_data = ['layerID layerLabel']
      let layer_map = []
      let node_data = ['nodeID nodeAge nodeTenure nodeLevel nodeDepartment']
      let edge_data = []
      for(let layer_index in this.innerGraphs){
        layer_data.push(`${parseInt(layer_index)+1} layer_name`);//构建layer data
        //初始化layer_map
        layer_map.push({})  
      }
      let whole_id_set = new Set()
      this.innerGraphs[this.innerGraphs.length-1].nodes.forEach((v,i)=>{
        layer_map[this.innerGraphs.length-1][String(v.id)] = (i + 1)
        whole_id_set.add((i + 1))
        node_data.push(`${(i + 1)} 0 0 0 0`)
      })
      for(let layer_index in this.outerLinks){
        //倒序给layer_map赋值
        let ol = this.outerLinks[this.outerLinks.length - parseInt(layer_index) - 1].links;
        let upper = layer_map[this.outerLinks.length - parseInt(layer_index) - 1];//上层
        let lower = layer_map[this.outerLinks.length - parseInt(layer_index)];//下层
        
        let new_id_set = new Set(whole_id_set) //保存了所有的布局用id
        let raw_upper_id_queue = this.innerGraphs[this.outerLinks.length - parseInt(layer_index) - 1].nodes.map(v=>v.id)//保存了上层的innerGrah中的id
        ol.forEach((v,i)=>{//利用边建立关系
          upper[String(v.source)] = lower[String(v.target)]
          new_id_set.delete(lower[String(v.target)])
          raw_upper_id_queue.splice(raw_upper_id_queue.indexOf(parseInt(v.source)),1)
        })
        //给set中的剩余项赋值
        for(let remain_id of Array.from(new_id_set)){
          if(raw_upper_id_queue.length != 0){//raw_upper_id_queue还有剩余
            upper[String(raw_upper_id_queue.pop())] = remain_id;
          }
          else{//raw_upper_id_queue无剩余
            upper[String(remain_id)] = remain_id;
          }
        }
      }
      //添加edge_data
      this.innerGraphs.forEach((v,layer_index)=>{
        let links = v.links;
        links.forEach((l)=>{
            edge_data.push(`${layer_index+1} ${layer_map[layer_index][String(l.source)]} ${layer_map[layer_index][String(l.target)]} 1`)
        })
        
      })
      
      // console.log('layer_map:',JSON.parse(JSON.stringify(layer_map)))
      // console.log('layer_data:',layer_data)
      // console.log('node_data:',node_data)
      // console.log('edge_data:',edge_data)

      // await axios({
      //   url:'http:/127.0.0.1:5000/api/getWangZixiaoLayout',
      //   method:"POST",
      //   data:{
      //     'layer_data':layer_data,
      //     'node_data':node_data,
      //     'edge_data':edge_data,
      //   }
      // }).

      await getwangzixiao({
          'layer_data':layer_data,
          'node_data':node_data,
          'edge_data':edge_data,
        }).
      then((response)=>{
        const data = response.data
        for(let layer_index = 0;layer_index < data.length;layer_index++){
          this.layoutData.push({
            'nodes':[],
            'links':[],
          })
          //装填点
          this.innerGraphs[layer_index].nodes.forEach(v=>{
            let posNode = JSON.parse(JSON.stringify(v))
            posNode['x'] = data[layer_index][layer_map[layer_index][String(v.id)] - 1][0];
            posNode['y'] = data[layer_index][layer_map[layer_index][String(v.id)] - 1][1];
            this.layoutData[layer_index].nodes.push(posNode)
          })

          /**
           * 
           * 变换点坐标到中心为(0.5*initAreaWidth,0.5*initAreaHeight)，边界适应边框。
           * 
           */
          const maxX = Math.max(...this.layoutData[layer_index].nodes.map(v=>v.x))
          const minX = Math.min(...this.layoutData[layer_index].nodes.map(v=>v.x))
          const maxY = Math.max(...this.layoutData[layer_index].nodes.map(v=>v.y))
          const minY = Math.min(...this.layoutData[layer_index].nodes.map(v=>v.y))
          //变换
          const xScale = d3.scaleLinear()
            .domain([minX,maxX])
            .range([this.baseRadius[layer_index] + this.initInnerPadding,this.initAreaWidth - this.baseRadius[layer_index] - this.initInnerPadding])
          const yScale = d3.scaleLinear()
            .domain([minY,maxY])
            .range([this.baseRadius[layer_index] + this.initInnerPadding,this.initAreaHeight - this.baseRadius[layer_index] - this.initInnerPadding])
          
          this.layoutData[layer_index].nodes.forEach((v,i)=>{
            this.layoutData[layer_index].nodes[i].x = xScale(this.layoutData[layer_index].nodes[i].x)
            this.layoutData[layer_index].nodes[i].y = yScale(this.layoutData[layer_index].nodes[i].y)
          })

          //装填边
          this.innerGraphs[layer_index].links.forEach(l=>{
              let tempLink = JSON.parse(JSON.stringify(l))
              this.layoutData[layer_index].nodes.forEach(v=>{
                if(parseInt(v.id)==parseInt(l.source)){//source
                  tempLink['source']={
                    'id':v.id,
                    'x':v.x,
                    'y':v.y,
                  }
                }
                else if(parseInt(v.id)==parseInt(l.target)){//target
                  tempLink['target']={
                    'id':v.id,
                    'x':v.x,
                    'y':v.y
                  }
                }
              })
              this.layoutData[layer_index].links.push(tempLink)
          })
          
        }
        // console.log('layout:',this.layoutData)
      }).catch((err)=>{
        console.log('err:',err)
      })

    },

    getForceDirectedLayout(){//力导引布局

        /**
         * 
         * 恰好适应边框，布局的左上角(0,0)在画布中对应borderAnchor
         * 
         * 要求:无要求
         * 
         */

      for(let layer_index in this.innerGraphs){
          let _nodes = JSON.parse(JSON.stringify(this.innerGraphs[layer_index].nodes));
          let _links = JSON.parse(JSON.stringify(this.innerGraphs[layer_index].links));


          let simulation = d3.forceSimulation()
                              .nodes(_nodes)


          let linkForce = d3.forceLink(_links).id(d=>d.id)

          simulation.force('charge_force', d3.forceManyBody().strength(-50))
                    .force('center_force', d3.forceCenter(0,0))//中心点为原点
                    .force('links', linkForce)

          simulation.stop();
          simulation.tick(300);



          /**
           * 
           * 变换坐标到中心为(0.5*initAreaWidth,0.5*initAreaHeight)，边界适应边框。
           * 
           */
          const maxX = Math.max(..._nodes.map(v=>v.x))
          const minX = Math.min(..._nodes.map(v=>v.x))
          const maxY = Math.max(..._nodes.map(v=>v.y))
          const minY = Math.min(..._nodes.map(v=>v.y))
          //变换
          const xScale = d3.scaleLinear()
            .domain([minX,maxX])
            .range([this.baseRadius[layer_index] + this.initInnerPadding,this.initAreaWidth - this.baseRadius[layer_index] - this.initInnerPadding])
          const yScale = d3.scaleLinear()
            .domain([minY,maxY])
            .range([this.baseRadius[layer_index] + this.initInnerPadding,this.initAreaHeight - this.baseRadius[layer_index] - this.initInnerPadding])
          
          _nodes.forEach((v,i)=>{
            _nodes[i].x = xScale(_nodes[i].x)
            _nodes[i].y = yScale(_nodes[i].y)
          })


          /**
           * 
           * 打包布局结果
           * 
           */
          let result = {
            'nodes':_nodes.map(v=>{
                      return JSON.parse(JSON.stringify(v))
                    }),
            'links':_links.map(v=>{
                      return JSON.parse(JSON.stringify(v))
                    }),
          }

          this.layoutData.push(result)
          
      }
    },

    drawSingleLayer(layer_index){//绘制/更新单层
        /**
         * params：
         *    layer_index:平面的层次，
         * 
         */
        const self = this;

        const svg = d3.select(this.$refs['multi_layer_container']).select('.multi_layer_canva');
        const layerArea = svg.select(`.multi_layer_layerArea-${layer_index}`)
        const innerArea = layerArea.select(`.multi_layer_innerArea-${layer_index}`)
        const borderArea = layerArea.select(`.multi_layer_borderArea-${layer_index}`)
        const innerDefs = layerArea.select(`.multi_layer_innerDefs-${layer_index}`)

        //清理
        innerArea.selectAll('*').remove();
        borderArea.selectAll('*').remove();
        innerDefs.selectAll('*').remove();


        const anchor = [
          this.outerPadding.left,
          this.outerPadding.top + layer_index * (this.partHeight + this.unitMargin)
        ]//边框BBox左上角的点坐标
        const borderAnchor = [
          this.outerPadding.left + this.partHeight * Math.tan(this.borderSkew * Math.PI / 180),
          this.outerPadding.top + layer_index * (this.partHeight + this.unitMargin)
        ]//边框左上角的点坐标


        /**
         * 
         * 绘制本层边框
         * 
         */
        const border = borderArea.append('path')
            .attr('d', `M ${borderAnchor[0]} ${borderAnchor[1]} `
                      +`L ${borderAnchor[0] + this.borderWidth} ${borderAnchor[1]} ` 
                      +`L ${anchor[0] + this.borderWidth} ${anchor[1] + this.partHeight} `
                      +`L ${anchor[0]} ${anchor[1] + this.partHeight} `
                      +`L ${borderAnchor[0]} ${borderAnchor[1]}`)
            .attr('fill', '#1f8bd4')
            .attr('fill-opacity', 0.7)
            .style('stroke', "lightgray")
            .style('stroke-width', 3)
            .classed(`multi_layer-border-${layer_index}`,true)
        
        /**
         * 
         * 绘制层内图（点和边）
         * 
         */
        //  console.log(this.layoutData);
        // let nodes = this.innerGraphs[layer_index].nodes;
        // let innerLinks = this.innerGraphs[layer_index].links;
        let nodesPos = this.layoutData[layer_index].nodes
        let innerLinksPos = this.layoutData[layer_index].links
        

        //定义遮罩
        innerDefs.append('clipPath').attr("id",`multi_layer_clip-${layer_index}-${this.nanoid}`)//使用nanoid是为了组件被复用的时候重复
            .append('path')
            .attr('d', `M ${borderAnchor[0]} ${borderAnchor[1]} `
                      +`L ${borderAnchor[0] + this.borderWidth} ${borderAnchor[1]} ` 
                      +`L ${anchor[0] + this.borderWidth} ${anchor[1] + this.partHeight} `
                      +`L ${anchor[0]} ${anchor[1] + this.partHeight} `
                      +`L ${borderAnchor[0]} ${borderAnchor[1]}`)
        //定义arrow
        let innerArrowSize = this.innerArrowSizeRadio * this.baseRadius[layer_index]
        innerDefs.append('marker')
                .attr('id', `multi_layer_inner_arrow-${layer_index}-${this.nanoid}`)
                .attr('markerWidth', innerArrowSize)
                .attr('markerHeight', innerArrowSize)
                .attr('refX', innerArrowSize + this.baseRadius[layer_index])
                .attr('refY', 0.5 * innerArrowSize)
                .attr("markerUnits","userSpaceOnUse")
                .attr('orient', 'auto')
                .append('path')
                .attr('fill', '#434343')
                .attr('d', `M 0,0 L ${innerArrowSize},${0.5*innerArrowSize} L 0,${innerArrowSize}`)
                // .attr('d', 'M 0,0 L 10,5 L 0,10')

        //添加范围遮罩（用于裁剪）
        const clipG = innerArea.append('g').attr('clip-path',`url(#multi_layer_clip-${layer_index}-${this.nanoid})`)
        //添加zoom层（用于被zoom位移）
        const zoomG = clipG.append('g').classed(`multi_layer_zoomG-${layer_index}`,true)
        //添加innerPlot层（用于容纳图元、倾斜）
        const innerPlot = zoomG.append('g')
                               .classed(`multi_layer_innerPlot-${layer_index}`,true)
                       
        //边
        innerPlot.append('g')
          .selectAll('*')
          .data(innerLinksPos)
          .join('line')
          .attr('stroke-width', this.baseRadius[layer_index] * this.innerLinkStrokeRadio)
          .style('stroke', "#666666")
          .attr('marker-end',(d)=>{
            if(d.type == 'dir')
              return `url(#multi_layer_inner_arrow-${layer_index}-${this.nanoid})`
            else if(d.type == 'undir')
              return null
          })
          .attr('x1', (d) => d.source.x + borderAnchor[0])
          .attr('y1', (d) => d.source.y + borderAnchor[1])
          .attr('x2', (d) => d.target.x + borderAnchor[0])
          .attr('y2', (d) => d.target.y + borderAnchor[1])
          .classed(`multi_layer_innerLinks-${layer_index}`,true)
          .on('mousemove',function(d){//更新和显示信息板
              self.InfoPanelVisible = true;//显示
              self.$refs['infoPanel'].setMessageData(d.message);//更新信息
              /**
               * 更新位置
               */
              self.InfoPanelStyle['top'] = `${d3.event.pageY - svg.node().getBoundingClientRect().y + 10}px`
              self.InfoPanelStyle['left'] = `${d3.event.pageX - svg.node().getBoundingClientRect().x + 10}px`
          })
          .on('mouseleave',(d)=>{//隐藏信息板
              this.InfoPanelVisible = false;//隐藏
          })
        //圆点
        innerPlot.append('g')
          .selectAll('*')
          .data(nodesPos)
          .join('circle')
          .attr("r",this.baseRadius[layer_index])
          .attr('fill', "#b256f0")
          .attr('stroke', "white")
          .attr('stroke-width', this.innerCircleStrokeRadio * this.baseRadius[layer_index])
          .attr("cx",(d)=>d.x + borderAnchor[0])
          .attr("cy",(d)=>d.y + borderAnchor[1])
          .classed(`multi_layer_innerCircles-${layer_index}`,true)
          .style('cursor','pointer')
          .on('click',(d,i)=>{//点击选择和取消选择
            if(this.chosenData[layer_index].has(d.id)){
              this.chosenData[layer_index].delete(d.id)
            }
            else{
              this.chosenData[layer_index].add(d.id);
            }
            this.exportChosenData();
            this.updateInnerInfo(layer_index)
          })
          .on('mousemove',function(d){//更新和显示信息板
              self.InfoPanelVisible = true;//显示
              self.$refs['infoPanel'].setMessageData(d.message);//更新信息
              /**
               * 更新位置
               */
              self.InfoPanelStyle['top'] = `${d3.event.pageY - svg.node().getBoundingClientRect().y + 5}px`
              self.InfoPanelStyle['left'] = `${d3.event.pageX - svg.node().getBoundingClientRect().x + 5}px`
          })
          .on('mouseleave',(d)=>{//隐藏信息板
              this.InfoPanelVisible = false;//隐藏
          })
          .on('contextmenu',(d)=>{
            d3.event.preventDefault();
            let nodes = this.innerGraphs[layer_index].nodes.map(n=>n.id)
            let links = this.innerGraphs[layer_index].links.map(l=>[l.source,l.target])
            let to_find_node = d.id;
            this.isLoading = true;
            axios({
              url:'api/getConnectedSubGraph',
              method:"POST",
              data:{
                'nodes':nodes,
                'links':links,
                'to_find_node':to_find_node,
              }
            }).then((response)=>{
              const data = response.data
              for(let id of data){
                this.chosenData[layer_index].add(id)
              }
              this.updateInnerInfo(layer_index);
              this.isLoading = false;
            }).catch(err=>{
              console.log('err:',err);
              this.isLoading = false;
            })
          })
        //文本
        innerPlot.append('g')
          .selectAll('*')
          .data(nodesPos)
          .join('text')
          .style('font-size',this.innerTextSizeRadio * this.baseRadius[layer_index])
          .text(d=>d.message.title)
          .attr('x',function(d){
            return d.x + borderAnchor[0] - 0.5 * this.getBoundingClientRect().width;
          })
          .attr('y',function(d){
            return d.y + borderAnchor[1] - 2 * self.baseRadius[layer_index]
          })
          .classed(`multi_layer_innerText-${layer_index}`,true)


        //倾斜
        innerPlot.style('transform-origin',`${borderAnchor[0]}px ${borderAnchor[1]}px`)
        innerPlot.style('transform', `rotateX(${this.plotSkew}deg)`)
        


        /**
         * 
         * 绑定整个图层面上的交互
         * 
         */

        //创建新的zoom工具，并且绑定zoom事件
        const zoom = d3.zoom()
                       .scaleExtent([0.1, 40])
                       .translateExtent([[-10000, -10000], [10000, 10000]])
                       .on("zoom",()=>{
                            zoomG.attr("transform",d3.event.transform)                                              
                            this.drawSingleOuterLinks(layer_index)
                            this.drawSingleOuterLinks(layer_index-1)
                        })
        this.zooms[layer_index] = zoom;

        //创建新的套索工具
        const ls = lasso()
              .closePathSelect(true)
              .closePathDistance(2000)
              .items(innerPlot.selectAll(`.multi_layer_innerCircles-${layer_index}`))
              .targetArea(borderArea)
              .on("start", ()=>{})
              .on("draw", ()=>{
                ls.possibleItems().classed("multi_layer_lasso_possible", true);
              })
              .on("end", ()=>{//圈选选择
                ls.selectedItems().classed("multi_layer_lasso_possible", false)
                ls.selectedItems().each((d)=>{
                  this.chosenData[layer_index].add(d.id);
                })
                this.exportChosenData();
                this.updateInnerInfo(layer_index);
              });
        this.lassos[layer_index] = ls;  

        if(this.drag_mode[layer_index] == '缩放'){
            border.call(this.zooms[layer_index])
        }
        else if(this.drag_mode[layer_index] == '圈选'){
            borderArea.call(this.lassos[layer_index])
        }

        //更新修改信息
        this.updateInnerInfo(layer_index)

                     
      
      
    },

    drawSingleOuterLinks(layer_index){// 绘制/更新外部的连接边，这个函数必须在drawSingleLayer之后调用     

      const self = this;

      //判断异常
      if(layer_index < 0 || layer_index >= this.outerLinks.length)
        return;

      let drawLinks = this.outerLinks[layer_index]['links'];

      const svg = d3.select(this.$refs['multi_layer_container']).select('.multi_layer_canva');
      const layerArea1 = svg.select(`.multi_layer_layerArea-${layer_index}`)
      const layerArea2 = svg.select(`.multi_layer_layerArea-${layer_index+1}`)
      const outerArea = layerArea1.select(`.multi_layer_outerArea-${layer_index}`)
      const border1 = layerArea1.select(`.multi_layer-border-${layer_index}`)
      const border2 = layerArea2.select(`.multi_layer-border-${layer_index+1}`)


      outerArea.selectAll('*').remove();

      const nodes1 = layerArea1.selectAll(`.multi_layer_innerCircles-${layer_index}`)//上层点
      const nodes2 = layerArea2.selectAll(`.multi_layer_innerCircles-${layer_index+1}`)//下层点

      const links = outerArea.append('g')
                  .selectAll('*')
                  .data(drawLinks)
                  .join('line')
                  .attr("x1",function(d){//1为上层点，2为下层点
                      let node1 = nodes1.filter((v, i) => {
                          return d.source == v.id
                      })
                      return node1.node().getBoundingClientRect().x - svg.node().getBoundingClientRect().x + 0.5 * node1.node().getBoundingClientRect().width;
                  })
                  .attr("y1",function(d){//1为上层点，2为下层点
                      let node1 = nodes1.filter((v, i) => {
                          return d.source == v.id
                      })
                      return node1.node().getBoundingClientRect().y - svg.node().getBoundingClientRect().y + 0.5 * node1.node().getBoundingClientRect().height;
                  })
                  .attr("x2",function(d){//1为上层点，2为下层点
                      let node2 = nodes2.filter((v, i) => {
                          return d.target == v.id
                      })
                      return node2.node().getBoundingClientRect().x - svg.node().getBoundingClientRect().x + 0.5 * node2.node().getBoundingClientRect().width;
                  })
                  .attr("y2",function(d){//1为上层点，2为下层点
                      let node2 = nodes2.filter((v, i) => {
                          return d.target == v.id
                      })
                      return node2.node().getBoundingClientRect().y - svg.node().getBoundingClientRect().y + 0.5 * node2.node().getBoundingClientRect().height;
                  })
                  .attr('stroke', 'black')
                  .attr('stroke-width', this.outerLinkWidth[layer_index])
                  .attr('opacity', 0.7)
                  .classed(`multi_layer_outerLinks-${layer_index}`,true)
                  .style('display',(d,i)=>{
                      //node1为上层点 //node2为下层点
                      let node1 = nodes1.filter((v, i) => {
                          return d.source == v.id
                      })
                      let node2 = nodes2.filter((v, i) => {
                          return d.target == v.id
                      })
                      //检测端点是否溢出
                      const point1 = svg.node().createSVGPoint();
                      point1.x = node1.node().getBoundingClientRect().x - svg.node().getBoundingClientRect().x + 0.5 * node1.node().getBoundingClientRect().width;
                      point1.y = node1.node().getBoundingClientRect().y - svg.node().getBoundingClientRect().y + 0.5 * node1.node().getBoundingClientRect().height
                      const point2 = svg.node().createSVGPoint();
                      point2.x = node2.node().getBoundingClientRect().x - svg.node().getBoundingClientRect().x + 0.5 * node2.node().getBoundingClientRect().width;
                      point2.y = node2.node().getBoundingClientRect().y - svg.node().getBoundingClientRect().y + 0.5 * node2.node().getBoundingClientRect().height

                      if(!border1.node().isPointInFill(point1) && !border1.node().isPointInStroke(point1))
                        return 'none'

                      if(!border2.node().isPointInFill(point2) && !border2.node().isPointInStroke(point2))
                        return 'none'
                      
                      return null
                  })      
                .on('mousemove',function(d){//更新和显示信息板
                    self.InfoPanelVisible = true;//显示
                    self.$refs['infoPanel'].setMessageData(d.message);//更新信息
                    /**
                     * 更新位置
                     */
                    self.InfoPanelStyle['top'] = `${d3.event.pageY - svg.node().getBoundingClientRect().y + 15}px`
                    self.InfoPanelStyle['left'] = `${d3.event.pageX - svg.node().getBoundingClientRect().x + 15}px`
                })
                .on('mouseleave',(d)=>{
                    this.InfoPanelVisible = false;//隐藏信息板
                })

    },

    resetPos(layer_index){//对某层进行复位
      this.drawSingleLayer(layer_index);
      // this.updateInnerInfo(layer_index);
      this.drawSingleOuterLinks(layer_index-1);
      this.drawSingleOuterLinks(layer_index)
    },

    resetChosen(layer_index){//清理某层的选中点
      this.chosenData[layer_index].clear();
      this.updateInnerInfo(layer_index);
      this.exportChosenData();
    },

    updateInnerInfo(layer_index){//更新某一层内部元素的修改信息（即用户通过交互添加的信息）
      const svg = d3.select(this.$refs['multi_layer_container']).select('.multi_layer_canva');
      const layerArea = svg.select(`.multi_layer_layerArea-${layer_index}`)
      const innerArea = layerArea.select(`.multi_layer_innerArea-${layer_index}`)
      const borderArea = layerArea.select(`.multi_layer_borderArea-${layer_index}`)
      const innerPlot = innerArea.select(`.multi_layer_innerPlot-${layer_index}`);
      const border = borderArea.select(`.multi_layer-border-${layer_index}`)
      const circles = innerPlot.selectAll(`.multi_layer_innerCircles-${layer_index}`)
      const zoomG = innerArea.select(`.multi_layer_zoomG-${layer_index}`);
      
      //更新点的选中样式
      circles.attr('stroke',(d,i)=>{
        if(this.chosenData[layer_index].has(d.id))
          return 'black';
        return 'white';
      })
      //更新drag_mode的事件绑定
      if(this.drag_mode[layer_index] == '缩放'){
        borderArea.on('.drag',null);
        border.call(this.zooms[layer_index])
      }
      else if(this.drag_mode[layer_index] == '圈选'){ 
        border.on('.zoom',null)
        borderArea.call(this.lassos[layer_index])
      }
      //更改层内文本的显示状态
      innerPlot.selectAll(`.multi_layer_innerText-${layer_index}`)
               .style('display',()=>{
                  if(this.InfoShowMode[layer_index] == '显示')
                    return null
                  else if(this.InfoShowMode[layer_index] == '隐藏')
                    return 'none'
                  return null;
               })


    },

    handleRadiusChange(layer_index){//某一层的radius被修改（通过设置中的计数器）后的回调函数
      
      const self = this
      
      const svg = d3.select(this.$refs['multi_layer_container']).select('.multi_layer_canva');
      const layerArea = svg.select(`.multi_layer_layerArea-${layer_index}`)
      const innerArea = layerArea.select(`.multi_layer_innerArea-${layer_index}`)
      const borderArea = layerArea.select(`.multi_layer_borderArea-${layer_index}`)
      const innerDefs = layerArea.select(`.multi_layer_innerDefs-${layer_index}`)




      //修改defs的marker
      let innerArrowSize = this.innerArrowSizeRadio * this.baseRadius[layer_index]
      const markerDefs = innerDefs.select(`#multi_layer_inner_arrow-${layer_index}-${this.nanoid}`)
      markerDefs.attr('markerWidth', innerArrowSize)
                .attr('markerHeight', innerArrowSize)
                .attr('refX', innerArrowSize + this.baseRadius[layer_index])
                .attr('refY', 0.5 * innerArrowSize)


      markerDefs.select('path')
                .attr('d', `M 0,0 L ${innerArrowSize},${0.5*innerArrowSize} L 0,${innerArrowSize}`)


      //修改层内点的半径和stroke-width
      const innerCircles = layerArea.selectAll(`.multi_layer_innerCircles-${layer_index}`);
      innerCircles.attr("r",this.baseRadius[layer_index])
                  .attr('stroke-width', this.innerCircleStrokeRadio * this.baseRadius[layer_index])
      

      //修改层内的文本大小和位置
      const innerText = layerArea.selectAll(`.multi_layer_innerText-${layer_index}`);
      innerText.style('font-size',this.innerTextSizeRadio * this.baseRadius[layer_index])
          .attr('x',function(d){
            return d.x + self.outerPadding.left + self.partHeight * Math.tan(self.borderSkew * Math.PI / 180) - 0.5 * this.getBoundingClientRect().width;
          })
          .attr('y',function(d){
            return d.y + self.outerPadding.top + layer_index * (self.partHeight + self.unitMargin) - 2 * self.baseRadius[layer_index]
          })


      //修改连接线的stroke-width
      const innerLinks = layerArea.selectAll(`.multi_layer_innerLinks-${layer_index}`);
      innerLinks.attr('stroke-width', this.baseRadius[layer_index] * this.innerLinkStrokeRadio)
    },

    handleOutLinkWidthChange(layer_index){//某一层OuterLinks的宽度被修改（通过设置中的计数器）后的回调函数
      const svg = d3.select(this.$refs['multi_layer_container']).select('.multi_layer_canva');
      const layerArea = svg.select(`.multi_layer_layerArea-${layer_index}`)
      const outerArea = layerArea.select(`.multi_layer_outerArea-${layer_index}`)
      const outerLinks = outerArea.selectAll(`.multi_layer_outerLinks-${layer_index}`)
      outerLinks.attr('stroke-width', this.outerLinkWidth[layer_index])
    },

    handleDragModeChange(layer_index){//drag_mode被改变后（通过设置中的单选按钮）的回调函数
      this.updateInnerInfo(layer_index)
    },

    handleInfoShowModeChange(layer_index){//InfoShowMode被改变后的回调函数
      this.updateInnerInfo(layer_index)

    },

    exportChosenData(){//导出选择数据
      //绑定事件：@exportChosenData
      let result = []
      for(let v of this.chosenData){
        result.push(Array.from(v))
      }
      this.$emit('exportChosenData',result)
    },
  },




  mounted(){
    this.nanoid = nanoid();

  }

}
</script>



<style scoped>
  /* 容器样式 */
  .multi_layer_container{
    height:100%;
    width: 1500px;
    overflow: auto;
    display: flex;
    position:relative;
  }
  .multi_layer_canva{
    width:100%;
  }
  .multi_layer_info_panel{
    position:absolute;
    z-index: 999;
    width:200px;
    height: 200px;
    border: 2px solid black;
  }



  /* 动态样式 */





</style>

<style>
  /* lasso样式 */
  .lasso path{
    fill-opacity: 0.6;
    stroke: #ffffff;
    stroke-width: 2px;
  }

  .lasso .drawn{
    fill-opacity: 0.05;
  }

  .lasso .loop_close{
    fill: none;
    stroke-dasharray: 4, 4;
  }

  .lasso .origin{
    fill: lightgray;
    fill-opacity: 0.5;
  }

  .multi_layer_lasso_possible{/**被拉索套中，但是还未确定的圆点样式 */
        fill-opacity: 1;
        stroke: black;
  }

</style>
