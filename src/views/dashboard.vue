<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="4">
      <el-card shadow="hover">
          <timeselect></timeselect>
        </el-card>
      </el-col>
      <el-col :span="20">
      <el-card shadow="hover">
          <timebrush></timebrush>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="4">
        <mestable></mestable>
      </el-col>
      <el-col :span="4">
        <usertable></usertable>
      </el-col>
      <el-col :span="16">
        <timebrush></timebrush>
      </el-col>
    </el-row>
    <el-row>
      <!-- <el-col :span="12"> -->
        <el-card shadow="hover">
          <mtree></mtree>
        </el-card>
      <!-- </el-col> -->
      <!-- <el-col :span="12">
        <el-card shadow="hover">
        <dagre></dagre>
        </el-card>
      </el-col> -->
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
        <martree></martree>
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
import martree from "../views/markovTree.vue"
import mtree from "../views/mestree.vue"
import timebrush from "../views/timebrush.vue"
import timeselect from "./timeselect.vue";

import Schart from "vue-schart";
import { ref, reactive } from "vue";
import imgurl from "../assets/img/img.jpg";
import { Delete, Edit, Search, Plus } from "@element-plus/icons-vue";
import { fetchData } from "../api/index";
import { ElMessage, ElMessageBox } from "element-plus";


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
