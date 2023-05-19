<template>
    <el-dialog title="筛选条件" v-model="dialogVisble" width="30%">
        <span>这是一段信息</span>
        <template #footer>
            <span class="dialog-footer">
                <div>ip</div>
                <el-input v-model="filtermes.ipname" placeholder="IP地址" class="handle-input mr10"></el-input>
                <div>内容</div>
                <el-input v-model="filtermes.content" placeholder="内容" class="handle-input mr10"></el-input>
                <el-button @click="close">取 消</el-button>
                <el-button type="primary" @click="confirm">确 定</el-button>
            </span>
        </template>
    </el-dialog>
</template>
  
<script setup>
import { ref,reactive } from 'vue';
import { ElMessageBox } from 'element-plus'

const filtermes = reactive({
    ip:"",
    hop:1,
    content:"",
    timestart:"",
    timeend:"",
});

// 定义控制弹窗显隐的变量
const dialogVisble = ref(false)

const props = defineProps(['user'])

function confirm() {
    dialogVisble.value = false
    console.log(filtermes.content);

    // ElMessageBox.confirm('保存筛选吗?').then(() => {
    //     console.log('你点击了确定按钮')
    //     dialogVisble.value = false
    // }).catch(() => { })
}

function close() {
    dialogVisble.value = false
}

// 将变量暴露出来
defineExpose({
    dialogVisble
})
</script>
  