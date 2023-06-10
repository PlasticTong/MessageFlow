<template>
    <div>
    <el-table :data="marInfo2" highlight-current-row border class="table" ref="multipleTable"
      header-cell-class-name="table-header">
      <el-table-column prop="source" label="起始点"></el-table-column>
      <el-table-column prop="target" label="目标点"></el-table-column>
      <el-table-column prop="type" label="权值"></el-table-column>
      </el-table>
      <el-table :data="marInfo3" highlight-current-row border class="table" ref="multipleTable"
      header-cell-class-name="table-header">
      <el-table-column prop="source" label="起始点"></el-table-column>
      <el-table-column prop="target" label="目标点"></el-table-column>
      <el-table-column prop="type" label="权值"></el-table-column>
      </el-table>
      <el-table :data="marInfo4" highlight-current-row border class="table" ref="multipleTable"
      header-cell-class-name="table-header">
      <el-table-column prop="source" label="起始点"></el-table-column>
      <el-table-column prop="target" label="目标点"></el-table-column>
      <el-table-column prop="type" label="权值"></el-table-column>
      </el-table>
    </div>
</template>

<script>
import store from "../store/mesinfo"
import { linksUserCho, fetchMar2data, fetchMar3data, fetchMar4data } from "../api/index.ts"
export default {
    data(){
        fetchMar2data().then(res=>{
            this.marInfo2 = res.data.link
        })
        fetchMar3data().then(res=>{
            this.marInfo3 = res.data.link
        })
        fetchMar4data().then(res=>{
            this.marInfo4 = res.data.link
        })
        return{
            marInfo2:[],
            marInfo3:[],
            marInfo4:[],
            // marInfo:[
            //     marInfo2,
            //     marInfo3,
            //     marInfo4
            // ]
        }
    },
    computed: {
        Obj() {
            return store.state.filtermesres
        }
    },
    methods:{
    }
}

</script>

<style lang="scss" scoped>

</style>