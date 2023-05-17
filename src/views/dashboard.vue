<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <mestable></mestable>
      </el-col>
      <el-col :span="12">
        <usertable></usertable>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <mtree></mtree>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
        <dagre></dagre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="dashboard">
import mestable from "../views/mesinfo.vue";
import usertable from "../views/userinfo.vue";
import dagre from "../views/degreeTree.vue"
import mtree from "../views/mestree.vue"

import Schart from "vue-schart";
import { ref, reactive } from "vue";
import imgurl from "../assets/img/img.jpg";
import { Delete, Edit, Search, Plus } from "@element-plus/icons-vue";
import { fetchData } from "../api/index";
import { ElMessage, ElMessageBox } from "element-plus";

interface TableItem {
  id: number;
  name: string;
  money: string;
  state: string;
  date: string;
  address: string;
}
const tableData = ref<TableItem[]>([]);

const query = reactive({
  address: "",
  name: "",
  pageIndex: 1,
  pageSize: 10,
});

const name = localStorage.getItem("ms_username");
const role: string = name === "admin" ? "超级管理员" : "普通用户";
const pageTotal = ref(0);
// 获取表格数据
const getData = () => {
  fetchData().then((res) => {
    tableData.value = res.data.list;
    pageTotal.value = res.data.pageTotal || 50;
  });
};
getData();

// 查询操作
const handleSearch = () => {
  query.pageIndex = 1;
  getData();
};
// 分页导航
const handlePageChange = (val: number) => {
  query.pageIndex = val;
  getData();
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
    .catch(() => {});
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

const options = {
  type: "bar",
  title: {
    text: "最近一周各品类销售图",
  },
  xRorate: 25,
  labels: ["周一", "周二", "周三", "周四", "周五"],
  datasets: [
    {
      label: "家电",
      data: [234, 278, 270, 190, 230],
    },
    {
      label: "百货",
      data: [164, 178, 190, 135, 160],
    },
    {
      label: "食品",
      data: [144, 198, 150, 235, 120],
    },
  ],
};
const options2 = {
  type: "line",
  title: {
    text: "最近几个月各品类销售趋势图",
  },
  labels: ["6月", "7月", "8月", "9月", "10月"],
  datasets: [
    {
      label: "家电",
      data: [234, 278, 270, 190, 230],
    },
    {
      label: "百货",
      data: [164, 178, 150, 135, 160],
    },
    {
      label: "食品",
      data: [74, 118, 200, 235, 90],
    },
  ],
};
const todoList = reactive([
  {
    title: "今天要修复100个bug",
    status: false,
  },
  {
    title: "今天要修复100个bug",
    status: false,
  },
  {
    title: "今天要写100行代码加几个bug吧",
    status: false,
  },
  {
    title: "今天要修复100个bug",
    status: false,
  },
  {
    title: "今天要修复100个bug",
    status: true,
  },
  {
    title: "今天要写100行代码加几个bug吧",
    status: true,
  },
]);
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}

.grid-content {
  display: flex;
  align-items: center;
  height: 100px;
}

.grid-cont-right {
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: #999;
}

.grid-num {
  font-size: 30px;
  font-weight: bold;
}

.grid-con-icon {
  font-size: 50px;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
  color: #fff;
}

.grid-con-1 .grid-con-icon {
  background: rgb(45, 140, 240);
}

.grid-con-1 .grid-num {
  color: rgb(45, 140, 240);
}

.grid-con-2 .grid-con-icon {
  background: rgb(100, 213, 114);
}

.grid-con-2 .grid-num {
  color: rgb(100, 213, 114);
}

.grid-con-3 .grid-con-icon {
  background: rgb(242, 94, 67);
}

.grid-con-3 .grid-num {
  color: rgb(242, 94, 67);
}

.user-info {
  display: flex;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 2px solid #ccc;
  margin-bottom: 20px;
}

.user-info-cont {
  padding-left: 50px;
  flex: 1;
  font-size: 14px;
  color: #999;
}

.user-info-cont div:first-child {
  font-size: 30px;
  color: #222;
}

.user-info-list {
  font-size: 14px;
  color: #999;
  line-height: 25px;
}

.user-info-list span {
  margin-left: 70px;
}

.mgb20 {
  margin-bottom: 20px;
}

.todo-item {
  font-size: 14px;
}

.todo-item-del {
  text-decoration: line-through;
  color: #999;
}

.schart {
  width: 100%;
  height: 300px;
}
</style>
