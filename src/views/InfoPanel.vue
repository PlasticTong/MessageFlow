<template>
  <div ref="info-panel-container" class="info-panel-container">  
    <el-card>
      <div v-if="messageData.title!==undefined" slot="header">
        <b>{{messageData.title}}</b>
      </div>
      <div v-for="(m,index) in messageData.data" :key="index">
        <b>{{`${m[0]}：`}}</b><span>{{m[1]}}</span>
      </div>
    </el-card>
  </div>
</template>



<script>
import * as d3 from 'd3';

export default {
  name: 'InfoPanel',
  data () {
    return {
      /**
       * messageData:
       * {
       *    title:'title1',
       *    data:[
       *       ['InfoName1','InfoData1'],
       *       ['InfoName2','InfoData2'],
       *        ...
       *    ]
       * 
       * }
       * 
       */
      messageData:{//用于显示的message数据
        'title':'',
        'data':[

        ]
      },
    }
  },

  methods:{

    setMessageData(message){
      this.messageData = message;
    },
  }

}
</script>



<style scoped>
  .info-panel-container{
    position:absolute;
  }

</style>