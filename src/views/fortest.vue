<template>
    <div class="container">
        <!-- <el-row>
        <el-col :span = "6">
        <el-card  style="height:100%" shadow="hover">
            <timechooser></timechooser>
        </el-card>
      </el-col>
      <el-col :span = "18">
        <el-row>
        <el-card shadow="hover">
            <mtree></mtree>
          </el-card>
        </el-row>
        <el-row>
          <el-col :span = "12">
            <el-card shadow="hover">
          <martree></martree>
          </el-card>
          </el-col>
          <el-col :span = "12"><el-card shadow="hover">
            <dagre></dagre> 
          </el-card></el-col>
        </el-row>
      </el-col>
      </el-row> -->
        <div class="timechooser">
            <timechooser></timechooser>
        </div>
        <div>
            <div class="mtree">
                <mtree></mtree>
            </div>
                <div class = "container2">
                    <div class="martree">
                        <martree></martree>
                    </div>
                    <div class="dagre">
                        <dagre></dagre>
                    </div>
                </div>
        </div>
    </div>
</template>

<script setup>
import dagre from "../views/degreeTree.vue"
import martree from "../views/markovTree.vue"
import mtree from "../views/mestree.vue"
import timechooser from "./timechooser.vue";
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    // width: 100%; // 把容器宽度设置为 300px;没有设置高度。
}
.container2 {
    display: flex;
    flex-direction: row;
}

.timechooser {
    margin: 4px;
    // border: 1px solid #eebb55;
    height: 1620px;
}

.mtree {
    margin: 4px;
    border: 1px solid #eebb55;
}
.martree{
    margin: 4px;
    border: 1px solid #eebb55;
    flex-grow: 1;
    width: 10%;
}

.dagre{
    margin: 4px;
    border: 1px solid #eebb55;
    flex-grow: 1;
    width: 10%;
}

//   .container :nth-child(1) {
//     background-color: #E3ABB3;
//     height: 100px; // 第一个项目给定固定高度 100px；
//   }
//   .container :nth-child(2) {
//     background-color: #9DC54B;

//   }
//   .container :nth-child(3) {
//     background-color: #1FBEE7;
//     height: 300px;

//   }</style>