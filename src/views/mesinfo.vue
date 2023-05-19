<template>
  <div class="container" style="height: 700px;">
    <Child :user="user" ref="visiableDialog"></Child>
    <el-button type="primary" @click="openDialog">打开弹窗</el-button>
    <h2 class="mb10">筛选条件</h2>
    <el-input v-model="serachmes.source" placeholder="起点" class="handle-input mr10"></el-input>
    <el-input v-model="serachmes.target" placeholder="终点" class="handle-input mr10"></el-input>
    <el-input placeholder="内容" class="handle-input mr10"></el-input>
    <el-button type="primary" :icon="Search" @click="handleSearch(serachmes.source, serachmes.target)">搜索</el-button>
    <el-button type="danger" :icon="Delete" @click="handleReset">重置</el-button>
    <div style="padding-top: 20px;"></div>
    <h2 class="mb10">消息数据</h2>
    <el-table :data="tableData" highlight-current-row border class="table" ref="multipleTable"
      header-cell-class-name="table-header" @row-click=handleChoose>
      <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
      <el-table-column prop="source" label="起始点"></el-table-column>
      <el-table-column prop="target" label="目标点">
      </el-table-column>
      <el-table-column prop="time" label="传递时间"></el-table-column>
      <!-- <el-table-column label="操作" width="220" align="center"> -->
      <!-- <template #default="scope">
          <el-button text :icon="Pointer" class="red" @click="handleChoose(scope.$index)" v-permiss="16">
            选择
          </el-button>
        </template> -->
      <!-- </el-table-column> -->
    </el-table>
    <div class="pagination">
      <el-pagination background layout="total, prev, pager, next, jumper" :current-page="query.pageIndex"
        :page-size="query.pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
    </div>
  </div>
</template>

<script setup lang="ts" name="mestable">

import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit, Search, Plus, Pointer } from "@element-plus/icons-vue";
import { fetchMesData, testflask } from "../api/index";
import { store } from "../store/mesinfo"
import axios from 'axios'
import Child from "./filterdialog.vue"
const visiableDialog = ref()

const user = reactive({
  name: '张三',
  age: 20
})

function openDialog() {
  visiableDialog.value.dialogVisble = true
  console.log(visiableDialog.value.dialogVisble);
}



axios.get("http://localhost:5000//mesfilter/test",
  {
    //key: value  key固定写法 params 参数对象
    params: {
      //再写用户的参数
      username: "asdasdasd",
      password: 1111111
    }
  }).then(function (result) {
    console.log(result.data)
  })

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

const pagestate = reactive({
  choosemespage: 0,//分页是检索还是原始数据
  choosenum: 0,//分页数据量
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
const getData = (searchstate = 0) => {
  fetchMesData().then((res) => {
    if (searchstate == 1) {
      tableData.value = []
      pagestate.choosenum = 0
      for (let index in res.data.list) {
        if (serachmes.source == res.data.list[index].source && serachmes.target == res.data.list[index].target) {
          tableData.value.push(res.data.list[index])
          pagestate.choosenum = pagestate.choosenum + 1
        }
      }
      tableData.value = tableData.value.slice((query.pageIndex - 1) * query.pageSize, (query.pageIndex) * query.pageSize);
      pageTotal.value = pagestate.choosenum || 0;
      // console.log(pagestate.choosenum);
    }
    else {
      tableData.value = res.data.list.slice((query.pageIndex - 1) * query.pageSize, (query.pageIndex) * query.pageSize);
      // tableData.value.push(res.data.list[serachmes.source],res.data.list[serachmes.source])
      pageTotal.value = res.data.pageTotal || 50;
    }
  });
};

getData();
// 分页导航
const handlePageChange = (val: number) => {
  query.pageIndex = val;
  if (pagestate.choosemespage == 1) {
    getData(1);
  } else {
    // console.log("val:"+val);
    getData();
  }
};
// 选取操作
const handleChoose = (row: any) => {
  console.log(row.id);
  if (choosestate.choosemesForuser == 0) {
    let highlightId = row.id;
    // let highlightId = index + (query.pageIndex - 1) * query.pageSize + 1;
    // infoALL.state.chooseUser.soure = infoALL.state.mesinfo.list[highlightId - 1].source;
    // infoALL.state.chooseUser.target = infoALL.state.mesinfo.list[highlightId - 1].target;
    for (let index in infoALL.state.userinfo.list) {
      if (infoALL.state.mesinfo.list[highlightId - 1].source == infoALL.state.userinfo.list[index].name) {
        infoALL.state.chooseUser.soure = Number(index)
      }
      if (infoALL.state.mesinfo.list[highlightId - 1].target == infoALL.state.userinfo.list[index].name) {
        infoALL.state.chooseUser.target = Number(index)
      }
    }
    ElMessage.success("选取成功");
  }
  else {
    for (let index in infoALL.state.userinfo.list) {
      if (serachmes.source == infoALL.state.userinfo.list[index].name) {
        infoALL.state.chooseUser.soure = Number(index)
      }
      if (serachmes.target == infoALL.state.userinfo.list[index].name) {
        infoALL.state.chooseUser.target = Number(index)
      }
    }
    ElMessage.success("选取成功");
  }

};

// 查询操作
const handleSearch = (sourcename: string, targetname: string) => {
  if (serachmes.source == "" && serachmes.target == "") {
    ElMessage.error("检索失败，请输入数据");
    return 0;
  }
  if (serachmes.source == "") {
    serachmes.source = serachmes.target
  }
  if (serachmes.target == "") {
    serachmes.target = serachmes.source
  }
  // console.log(serachmes);

  ElMessage.success("检索成功");
  choosestate.choosemesForuser = 1;
  pagestate.choosemespage = 1;
  handleChoose(1);
  getData(1);
};

// 重置操作
const handleReset = (sourcename: string, targetname: string) => {
  choosestate.choosemesForuser = 0;
  pagestate.choosemespage = 0;
  serachmes.source = ""
  serachmes.target = ""
  getData();
};
</script>

<style  lang="scss" scoped>
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

.cat-button {
  margin-right: 10px !important;
}
</style>