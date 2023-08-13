<template>
  <div class="fortest-importname">
    <label style="font-size: 50px;">组织结构挖掘</label>
    <button class="button-common-large" @click="importall"
      style="border-radius: 10px;margin-left: 30px;background-color: aquamarine; color: blue;">导入</button>
  </div>


  <el-dialog v-model="this.dialogVisble" width="500px">
    <div class="fortest-dialog">

      <el-upload action :http-request="uploadFileTest" :limit="1" show-file-list="false">
        <button class="button-common-large"
          style="border-radius: 10px; margin-left: 10px;background-color: aquamarine; color: blue;">导入文件</button>
      </el-upload>

      <!-- <el-upload action :http-request="uploadFileTestAns" :limit="1" show-file-list="false">
        <button class="button-common-large"
          style="border-radius: 10px; margin:auto;background-color: aquamarine; color: blue;">导入答案</button>
      </el-upload> -->

    </div>
  </el-dialog>
  <!-- <button class="button-common button-common-large" @click="importFile()">导入</button>
  <el-upload action :http-request="uploadFile">
    <el-button size="small" type="primary">点击上传</el-button>
  </el-upload> -->


  <div class="fortest-importcon">
    <h2 style="font-size: 30px;">当前数据：{{ this.dataname1 }}</h2>
    <!-- <h2 style="font-size: 30px; margin-right: 20px;">当前答案：{{ this.dataname2 }}</h2> -->

  </div>



  <div class="fortest-all" v-loading="this.loadval">
    <div class="timechooser">
      <timechooser></timechooser>
    </div>
    <div>
      <div class="mtree">
        <mtree></mtree>
      </div>
      <div class="fortest">
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

<script>
import dagre from "../views/degreeTree.vue"
import martree from "../views/markovTree.vue"
import mtree from "../views/mestree.vue"
import timechooser from "./timechooser.vue";
import store from "../store/mesinfo"
import { senddata, uploadfile, readdata } from "../api/index.ts"

export default {
  components: {
    martree, mtree, timechooser, dagre

  },
  data() {
    return {
      dataname1: '暂无',
      loadval: false,
      forteststore: store,
      dialogVisble: false,
      selectFile: null
    }
  },
  computed: {
    loadname() {
      return store.state.mesinfo
    },
    fileNameAll() {
      return store.state.filename
    },
    // fileANsAll() {
    //   return store.state.ansname
    // }
  },
  watch: {
    loadname: {
      deep: true,
      handler() {
        this.loadval = false
      }
    },
    fileNameAll: {
      deep: true,
      handler() {
        this.dataname1 = store.state.filename
      }
    }
  },
  methods: {
    importall() {
      this.dialogVisble = true
    },
    async uploadFileTest(item) {
      this.loadval = true
      let formdataw = new FormData()
      formdataw.append('file', item.file)
      await uploadfile(formdataw).then(res => {
        store.state.filename = res.data
      })
      await readdata({ 'name': store.state.filename }).then(res => {
        store.state.mesinfo = res.data
      })
    }
  }

}


</script>

<style  scoped>
.el-input {
  width: 10;
  height: 10
}

.fortest {
  display: flex;
  flex-direction: row;
}

.fortest-all {
  display: flex;
  flex-direction: row;
  /* // background-color: #8ac9e2; */
  height: 1710px;
}

.timechooser {
  margin: 4px;
  /* // border: 1px solid #eebb55; */
  height: 1620px;
  background-color: white;
}

.mtree {
  margin: 4px;
  background-color: white;
  height: 700px;
  width:3000px
}

.martree {
  margin: 4px;
  flex-grow: 1;
  width: 10%;
  background-color: white;
}

.dagre {
  margin: 4px;
  flex-grow: 1;
  width: 10%;
  background-color: white;
}

.button-common-large {
  font-size: 20px;
  padding: 10px 20px;
}

.fortest-import {
  display: flex;
  flex-direction: row;
}

.fortest-importname {
  display: flex;
  color: white;
  background-color: #6d6d6d;
  width: 3600px;
}

.fortest-dialog {
  display: flex;
  flex-direction: row;
}

.fortest-importcon {
  display: flex;
  flex-direction: row;
}
</style>