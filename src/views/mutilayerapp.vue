<template>
  <div id="app">
    <div style="width:800px;height:1000px">
      <MultiLayer @exportChosenData="handleExportChoseData" ref="MultiLayer"/>
    </div>
  </div>
</template>

<script>
import MultiLayer from '../view/MultiLayer'
import * as d3 from 'd3';
import {groupSort,group,sort} from 'd3-array'
export default {
  name: 'mutilayerapp',
  components: {
    MultiLayer
  },
  methods:{
    handleExportChoseData(val){
      console.log('chosen:',val)
    }
  },
  mounted(){
      //nodes : [{'index':'1',layer:1,...},{'index':'2',layer:0,...},...]
      //links : [[index1,index2],...]

      d3.json('static/links.json').then(links=>{
        d3.json('static/nodes.json').then(nodes=>{
          console.log('links:',links)
          console.log('nodes:',nodes)
          //处理数据
          let outerLinks = []
          let innerGraphs = []
          let node_to_layer_map = new Map()
          for(let n of nodes){
            node_to_layer_map.set(n['index'],n['layer'])
          }
          let node_groups = Array.from(group(nodes,d=>d.layer));
          node_groups = sort(node_groups,(a,b)=>{
            return parseInt(a[0])-parseInt(b[0])
          });
          node_groups.forEach((n,i)=>{
            let iGraph = {
              'nodes':n[1].map(v=>{
                return {
                  'id':v.index,
                  'message':{
                    'title':`点${v.index}`,
                    'data':[
                      ['id',v.index]
                    ]
                   },
                }
              }),
              'links':[],
            }
            
            //获取innerLinks
            for(let l of links){
              if(node_to_layer_map.get(l[0])==i && node_to_layer_map.get(l[1])==i){
                iGraph.links.push({
                  'source':l[0],
                  'target':l[1],
                  'type':l[2],
                  'message':{
                    'title':l[2]=='dir' ? `指向：${l[0]} -> ${l[1]}` : `连接：${l[0]} - ${l[1]}`,
                    'data':[
                      l[2]=='dir'?['指向',`${l[0]} -> ${l[1]}`]:['连接',`${l[0]} - ${l[1]}`]
                    ]
                  }
                })
              }
            }
            innerGraphs.push(iGraph)
          })
          for(let i = 0;i < innerGraphs.length-1;i++){
            outerLinks.push({
              'links':[]
            })
          }
          //获取outerLinks
          for(let l of links){
            if(node_to_layer_map.get(l[0]) != node_to_layer_map.get(l[1])){
              outerLinks[Math.min(node_to_layer_map.get(l[0]),node_to_layer_map.get(l[1]))].links.push({
                'source':l[0],
                'target':l[1],
                'type':'undir',
                'message':{
                  'title':l[2]=='dir' ? `指向：${l[0]} -> ${l[1]}` : `连接：${l[0]} - ${l[1]}`,
                  'data':[
                     ['连接',`${l[0]} - ${l[1]}`]
                  ]
                }
              })
            }
          }
          this.$refs['MultiLayer'].setData(innerGraphs,outerLinks)
          this.$refs['MultiLayer'].draw()
      })
    })
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
