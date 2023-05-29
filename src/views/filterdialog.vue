<template>
    <el-dialog title="筛选条件" v-model="dialogVisble" width="50%">
        <el-form label-width="70px">
            <el-form-item label="ip">
                <el-input v-model="filtermes.ip" placeholder="ip"></el-input>
            </el-form-item>
            <el-form-item label="跳数">
                <el-input v-model="filtermes.hop" placeholder="跳数"></el-input>
            </el-form-item>
            <el-form-item label="内容">
                <el-input v-model="filtermes.content" placeholder="内容"></el-input>
            </el-form-item>
            <!-- <el-form-item label="阈值">
                <el-input v-model="filtermes.threshold" placeholder="阈值"></el-input>
            </el-form-item> -->
            <!-- <el-form-item label="起始时间">
                <el-input v-model="filtermes.timestart" placeholder="起始时间"></el-input>
            </el-form-item>
            <el-form-item label="结束时间">
                <el-input v-model="filtermes.timeend" placeholder="结束时间"></el-input>
            </el-form-item> -->
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" :icon="Edit" @click="confirm">确 定</el-button>
                <el-button type="danger" :icon="Delete" @click="handleReset">重 置</el-button>
                <!-- <el-button type="primary" @click="confirm">确 定</el-button -->
            </span>
        </template>
    </el-dialog>
</template>
  
<script setup>
import { ref, reactive } from 'vue';
import { ElMessageBox } from 'element-plus'
import { Delete, Edit, Search, Plus, Pointer } from "@element-plus/icons-vue";
import store from '../store/mesinfo';

const filtermes = reactive({
    ip: "",
    hop: "",
    content: "",
    timestart: "",
    timeend: "",
    threshold:""
});
// 定义控制弹窗显隐的变量
const dialogVisble = ref(false)

const props = defineProps(['user'])

function confirm() {
    // if(store.state.filtermes.ip=="" && store.state.filtermes.hop!=null){
    //     ElMessage.error("请输入ip!");
    //     return;
    // }
    dialogVisble.value = false
    store.state.filtermes = filtermes;
    // console.log(store.state.filtermes);

    // ElMessageBox.confirm('保存筛选吗?').then(() => {
    //     console.log('你点击了确定按钮')
    //     dialogVisble.value = false
    // }).catch(() => { })
}
function handleReset() {
    filtermes.ip = '';
    filtermes.hop = '';
    filtermes.content = '';
    filtermes.timestart = '';
    filtermes.timeend = '';

    ElMessage.success("重置成功");
}
function close() {
    dialogVisble.value = false
}

// 将变量暴露出来
defineExpose({
    dialogVisble
})
</script>
<style>
.dialog-footer {
    position: sticky;
    bottom: 10px;
    text-align: center;
    background-color: #ffffff;
}

.input-red {
    color: red;
}

.dialog-message {
    line-height: 2rem;
}
</style>
  