<template>
    <div>
        <el-tabs v-model="activeName" type="card">
            <el-tab-pane label="已选取" name="first">
                <el-table :data="tableDataListFor" highlight-current-row border class="table" ref="multipleTable"
                    header-cell-class-name="table-header">
                    <el-table-column prop="source" label="起始点"></el-table-column>
                    <el-table-column prop="target" label="目标点"></el-table-column>
                    <!-- <el-table-column prop="weight" label="权值"></el-table-column> -->
                </el-table>
                <!-- <div class="pagination">
                    <el-pagination background layout="total, prev, pager, next, jumper" :current-page="query2.pageIndex"
                        :page-size="query2.pageSize" :total="marInfo2.length"
                        @current-change="handleCurrentChangeFor2"></el-pagination>
                </div> -->
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import store from "../store/mesinfo"
import { linksUserCho, fetchMar2data, fetchMar3data, fetchMar4data } from "../api/index.ts"
export default{
    data() {
        return {
            activeName: 'first',
            tableDataListFor:[]
        }
    },
    computed: {
        Obj() {
            return store.state.marInfoTable
        }
    },
    watch:{
        Obj: {
            deep: true,
            handler() {
                this.tableDataListFor = store.state.marInfoTable
                // console.log(store.state.marInfoTable);
            }
        },
    }

}

</script>

<style lang="scss" scoped>
.table{
    width:80%
}
</style>