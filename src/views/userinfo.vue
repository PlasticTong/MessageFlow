<template>
  <div class="container" style="height: 50%;">
    <!-- <h2 class="mb10">所选用户</h2>
    <el-table
      :data="[infoALL.state.userinfo.list[infoALL.state.chooseUser.soure], infoALL.state.userinfo.list[infoALL.state.chooseUser.target]]"
      border class="table" ref="multipleTable" header-cell-class-name="table-header">
      <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
      <el-table-column prop="name" label="用户名"></el-table-column>
      <el-table-column prop="state" label="身份">
      </el-table-column>
      <el-table-column prop="address" label="地址"></el-table-column>
    </el-table> -->
    <!-- <div style="padding-top: 75px;"></div> -->
    <h2 class="mb10">用户数据</h2>
    <el-table
      :data="infoALL.state.userinfo.list.slice((query.pageIndex - 1) * query.pageSize, (query.pageIndex ) * query.pageSize )"
      highlight-current-row
      :sortable="'state'" border class="table" ref="multipleTable" header-cell-class-name="table-header">
      <!-- :row-class-name="tableRowClassName"> -->
      <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
      <el-table-column prop="name" label="用户名"></el-table-column>
      <el-table-column prop="state" label="身份">
      </el-table-column>
      <el-table-column prop="address" label="地址"></el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination background layout="total, prev, pager, next,jumper" :current-page="query.pageIndex"
        :page-size="query.pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>     
    </div>
  </div>
</template>

<script setup lang="ts" name="usertable">

import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit, Search, Plus, Pointer } from "@element-plus/icons-vue";
import { fetchData } from "../api/index";
import { store } from "../store/mesinfo"

const infoALL = store;
const query = reactive({
  address: "",
  name: "",
  pageIndex: 1,
  pageSize: 8,
});
const pageTotal = ref(0);
pageTotal.value = infoALL.state.userinfo.pageTotal || 50;

// const tableRowClassName = (row:any) => {
//   if (row.row.id - 1 == infoALL.state.chooseUser.soure) {
//     infoALL.state.userinfo.list[row.row.id - 1].state = 1;
//     return 'current-row';
//   } else if (row.row.id - 1 == infoALL.state.chooseUser.target) {
//     infoALL.state.userinfo.list[row.row.id - 1].state = 1;
//     return 'current-row';
//   }
//   else {
//     infoALL.state.userinfo.list[row.row.id - 1].state = 0;
//   }
//   return '';
// }

// 分页导航
const handlePageChange = (val: number) => {
  query.pageIndex = val;
};
</script>

<style scoped>
.handle-box {
  margin-bottom: 20px;
}

.handle-select {
  width: 120px;
}




.container {
  height: 100%;
}






.handle-input {
  width: 300px;
}

.table {
  width: 100%;
  font-size: 3px;
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

.el-table .row-row {
  background-color: #FFFF00 !important;
}</style>