<template>
  <div class="container">
    <el-input v-model="serachmes.source" placeholder="起点" class="handle-input mr10"></el-input>
    <el-input v-model="serachmes.target" placeholder="终点" class="handle-input mr10"></el-input>
    <el-button type="primary" :icon="Search" @click="handleSearch(serachmes.source, serachmes.target)">搜索</el-button>
    <el-button type="danger" :icon="Delete" @click="handleReset">重置</el-button>
    <div style="padding-top: 20px;"></div>
    <el-table :data="tableData" highlight-current-row border class="table" ref="multipleTable"
      header-cell-class-name="table-header">
      <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
      <el-table-column prop="source" label="起始点"></el-table-column>
      <el-table-column prop="target" label="目标点">
      </el-table-column>
      <el-table-column prop="time" label="传递时间"></el-table-column>
      <el-table-column label="操作" width="220" align="center">
        <template #default="scope">
          <el-button text :icon="Pointer" class="red" @click="handleChoose(scope.$index)" v-permiss="16">
            选择
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination background layout="total, prev, pager, next" :current-page="query.pageIndex"
        :page-size="query.pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
    </div>
  </div>
</template>

<script setup lang="ts" name="mestable">

import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit, Search, Plus, Pointer } from "@element-plus/icons-vue";
import { fetchMesData } from "../api/index";
import { store } from "../store/mesinfo"
import Usertable from "./userinfo.vue"

interface TableItem {
  id: number;
  name: string;
  money: string;
  state: string;
  date: string;
  address: string;
}
const serachmes = reactive({
  source: "",
  target: "",
});
const choosestate = reactive({
  choosemesForuser: 0,//选取消息高亮用户
});

const query = reactive({
  address: "",
  name: "",
  pageIndex: 1,
  pageSize: 10,
});
const tableData = ref<any>([]);
const pageTotal = ref(0);
const infoALL = store;
// 获取表格数据
const getData = (searchstate=0) => {
  fetchMesData().then((res) => {
    if(searchstate==1){
    tableData.value=[]
    for (let index in res.data.list){   
    if (serachmes.source == res.data.list[index].source && serachmes.target == res.data.list[index].target) {
      tableData.value.push(res.data.list[index])  
    }
    pageTotal.value = tableData.value.leghth || 0; 
  }}
  else{
    tableData.value = res.data.list.slice((query.pageIndex - 1) * query.pageSize, (query.pageIndex - 1) * query.pageSize + 10);
    // tableData.value.push(res.data.list[serachmes.source],res.data.list[serachmes.source])
    pageTotal.value = res.data.pageTotal || 50;
  }
  });
};
getData();
// 分页导航
const handlePageChange = (val: number) => {
  query.pageIndex = val;
  // console.log("val:"+val);
  getData();
};
// 选取操作
const handleChoose = (index: number) => {
  if(choosestate.choosemesForuser==0){
  let highlightId = index + (query.pageIndex - 1) * 10 + 1;
  // infoALL.state.chooseUser.soure = infoALL.state.mesinfo.list[highlightId - 1].source;
  // infoALL.state.chooseUser.target = infoALL.state.mesinfo.list[highlightId - 1].target;
  ElMessage.success("选取成功");
  for (let index in infoALL.state.userinfo.list) {
    if (infoALL.state.mesinfo.list[highlightId - 1].source == infoALL.state.userinfo.list[index].name) {
      infoALL.state.chooseUser.soure = index
    }
    if (infoALL.state.mesinfo.list[highlightId - 1].target == infoALL.state.userinfo.list[index].name) {
      infoALL.state.chooseUser.target = index
    }
  }}
  else{
    ElMessage.success("选取成功");
  }

};
// 获取表格数据
const getDataForSourceTarget = () => {
  fetchMesData().then((res) => {
    // tableData.value = res.data.list.slice((query.pageIndex - 1) * query.pageSize, (query.pageIndex - 1) * query.pageSize + 10);
    tableData.value = res.data.list[0]
    pageTotal.value = res.data.pageTotal || 50;
  });
};
// 查询操作
const handleSearch = (sourcename: string, targetname: string) => {
  ElMessage.success("检索成功");
  infoALL.state.chooseUser.soure = serachmes.source
  infoALL.state.chooseUser.target = serachmes.target
  choosestate.choosemesForuser = 1;
  getData(1);
  
};

// 重置操作
const handleReset = (sourcename: string, targetname: string) => {
  choosestate.choosemesForuser = 0;
  serachmes.source =""
  serachmes.target =""
  getData();
};
</script>

<style scoped>
.handle-box {
  margin-bottom: 20px;
}

.handle-select {
  width: 120px;
}

.handle-input {
  width: 300px;
}

.table {
  width: 100%;
  font-size: 14px;
}

.red {
  color: #f56c6c;
}

.mr10 {
  margin-right: 10px;
}

.table-td-thumb {
  display: block;
  margin: auto;
  width: 40px;
  height: 40px;
}

::v-deep .el-table__body tr.current-row>td {
  background: #f0f9eb !important;
}
</style>