<template>
    <div>
        <h2>时间段</h2>
        <el-table :data=time border class="table" ref="multipleTable" header-cell-class-name="table-header">
            <el-table-column prop="start" label="起始"></el-table-column>
            <el-table-column prop="end" label="结束"></el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button @click="handleChoose(scope.row)">选择</el-button>
                </template>
            </el-table-column>

        </el-table>
    </div>
</template>

<script>
import store from '../store/mesinfo';
export default {
    data() {
        return {
            time: store.state.timeSlect
        }

    },
    computed: {
        Obj() {
            return store.state.timeSlect
        }
    },
    methods: {
        handleChoose(row) {
            this.selectedRow = row;  // 将当前行的数据对象存储到 selectedRow 变量中
            console.log(this.selectedRow.end);  // 打印选中的数据对象
            store.state.time.start = this.selectedRow.start
            store.state.time.end = this.selectedRow.end
        }

    },
    watch: {
        Obj(newVal, oldVal) {
            //可以对数据执行相应的操作
            console.log(store.state.timeSlect)

        }
    },
}

</script>

<style lang="scss" scoped></style>