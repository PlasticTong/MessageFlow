<template>
  <div class="container">
    <h2 class="mb10">所选用户</h2>
    <el-table
      :data="[infoALL.state.userinfo.list[infoALL.state.chooseUser.soure], infoALL.state.userinfo.list[infoALL.state.chooseUser.target]]"
      border class="table" ref="multipleTable" header-cell-class-name="table-header">
      <!-- <el-table-column prop="source" label="起点">
      </el-table-column>
      <el-table-column prop="target" label="终点"></el-table-column> -->
      <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
      <el-table-column prop="name" label="用户名"></el-table-column>
      <el-table-column prop="state" label="身份">
      </el-table-column>
      <el-table-column prop="address" label="地址"></el-table-column>
    </el-table>
    <h2 class="mb10">用户数据</h2>
    <el-table
      :data="infoALL.state.userinfo.list.slice((query.pageIndex - 1) * query.pageSize, (query.pageIndex - 1) * query.pageSize + 10)"
      :sortable="'state'" border class="table" ref="multipleTable" header-cell-class-name="table-header"
      :row-class-name="tableRowClassName">
      <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
      <el-table-column prop="name" label="用户名"></el-table-column>
      <el-table-column prop="state" label="身份">
      </el-table-column>
      <el-table-column prop="address" label="地址"></el-table-column>
      <el-table-column label="操作" width="220" align="center">
        <template #default="scope">
          <el-button text :icon="Pointer" class="red" @click="" v-permiss="16">
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


  <el-dialog title="编辑" v-model="editVisible" width="30%">
    <el-form label-width="70px">
      <el-form-item label="用户名">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="地址">
        <el-input v-model="form.address"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEdit">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="usertable">

import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit, Search, Plus, Pointer } from "@element-plus/icons-vue";
import { fetchData } from "../api/index";
import { store } from "../store/mesinfo"

interface TableItem {
  id: number;
  name: string;
  money: string;
  state: string;
  date: string;
  address: string;
  thumb: string;
}
const infoALL = store;
const query = reactive({
  address: "",
  name: "",
  pageIndex: 1,
  pageSize: 10,
});
let tableData = ref<TableItem[]>([]);
let tableDataChoose = ref<TableItem[]>([]);
let tableDataChoose2: Object[];
const pageTotal = ref(0);
pageTotal.value = infoALL.state.userinfo.pageTotal || 50;
let sourceid: number = -1;
let targetid: number = -1;
// // 获取表格数据
// const getData = () => {
//   fetchData().then((res) => {
//     tableDataChoose.value = [res.data.list[infoALL.state.chooseUser.soure-1], res.data.list[infoALL.state.chooseUser.soure-1]]
//     tableData.value = res.data.list.slice((query.pageIndex - 1) * query.pageSize, (query.pageIndex - 1) * query.pageSize + 10);
//   });
// };
// getData();

const test = () => {
  console.log(111111111111);

}

const tableRowClassName = (row) => {
  if (row.row.id - 1 == infoALL.state.chooseUser.soure) {
    infoALL.state.userinfo.list[row.row.id - 1].state = 1;
    // sourceid = row.row.id - 1
    // getData();
    return 'current-row';
  } else if (row.row.id - 1 == infoALL.state.chooseUser.target) {
    infoALL.state.userinfo.list[row.row.id - 1].state = 1;
    // targetid = row.row.id - 1
    // getData();
    return 'current-row';
  }
  else {
    infoALL.state.userinfo.list[row.row.id - 1].state = 0;
  }
  return '';
}

// 查询操作
const handleSearch = () => {
  query.pageIndex = 1;
};
// 分页导航
const handlePageChange = (val: number) => {
  query.pageIndex = val;
};

// 删除操作
const handleDelete = (index: number) => {
  // 二次确认删除
  ElMessageBox.confirm("确定要删除吗？", "提示", {
    type: "warning",
  })
    .then(() => {
      ElMessage.success("删除成功");
      tableData.value.splice(index, 1);
    })
    .catch(() => { });
};

// 表格编辑时弹窗和保存
const editVisible = ref(false);
let form = reactive({
  name: "",
  address: "",
});
let idx: number = -1;
const handleEdit = (index: number, row: any) => {
  idx = index;
  form.name = row.name;
  form.address = row.address;
  editVisible.value = true;
};
const saveEdit = () => {
  editVisible.value = false;
  ElMessage.success(`修改第 ${idx + 1} 行成功`);
  tableData.value[idx].name = form.name;
  tableData.value[idx].address = form.address;
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

.el-table .row-row {
  background-color: #FFFF00 !important;
}</style>