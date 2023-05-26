<template>
    <div>
        <h2>时间段</h2>
        <el-table border class="table" ref="multipleTable" header-cell-class-name="table-header">
            <el-table-column prop="name" label="时间段"></el-table-column>
            <el-table-column prop="name" label="操作"></el-table-column>
        </el-table>
    </div>
</template>

<script>
import store from '../store/mesinfo';
export default {
    data() {

    },
    computed: {
        Obj() {
            return store.state.timeSlect
        }
    },
    methods: {

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