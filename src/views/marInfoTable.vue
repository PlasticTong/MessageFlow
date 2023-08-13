<template>
    <div>
        <el-tabs v-model="activeName" type="card">
            <el-tab-pane label="k=2" name="first">
                <el-table :data="tableDataListFor2" @row-click=handleRowClick highlight-current-row border class="table" ref="multipleTable"
                    header-cell-class-name="table-header">
                    <el-table-column prop="id" label="ID"></el-table-column>
                    <el-table-column prop="source.name" label="起始点"></el-table-column>
                    <el-table-column prop="target.name" label="目标点"></el-table-column>
                    <el-table-column prop="type" label="权值"></el-table-column>
                </el-table>
                <div class="pagination">
                    <el-pagination background layout="total, prev, pager, next, jumper" :current-page="query2.pageIndex"
                        :page-size="query2.pageSize" :total="marInfo2.length"
                        @current-change="handleCurrentChangeFor2"></el-pagination>
                </div>
            </el-tab-pane>
            <el-tab-pane label="k=3" name="second">
                <el-table :data="tableDataListFor3" highlight-current-row border class="table" ref="multipleTable"
                    header-cell-class-name="table-header">
                    <el-table-column prop="id" label="ID"></el-table-column>
                    <el-table-column prop="source.name" label="起始点"></el-table-column>
                    <el-table-column prop="target.name" label="目标点"></el-table-column>
                    <el-table-column prop="type" label="权值"></el-table-column>
                </el-table>
                <div class="pagination">
                    <el-pagination background layout="total, prev, pager, next, jumper" :current-page="query3.pageIndex"
                        :page-size="query3.pageSize" :total="marInfo3.length"
                        @current-change="handleCurrentChangeFor3"></el-pagination>
                </div>
            </el-tab-pane>
            <el-tab-pane label="k=4" name="third"><el-table :data="tableDataListFor4" highlight-current-row border
                    class="table" ref="multipleTable" header-cell-class-name="table-header">
                    <el-table-column prop="id" label="ID"></el-table-column>
                    <el-table-column prop="source.name" label="起始点"></el-table-column>
                    <el-table-column prop="target.name" label="目标点"></el-table-column>
                    <el-table-column prop="type" label="权值"></el-table-column>
                </el-table>
                <div class="pagination">
                    <el-pagination background layout="total, prev, pager, next, jumper" :current-page="query4.pageIndex"
                        :page-size="query4.pageSize" :total="marInfo4.length"
                        @current-change="handleCurrentChangeFor4"></el-pagination>
                </div>
            </el-tab-pane>
        </el-tabs>




    </div>
</template>

<script>
import store from "../store/mesinfo"
import { linksUserCho, fetchMar2data, fetchMar3data, fetchMar4data } from "../api/index.ts"
export default {
    data() {
        // fetchMar2data().then(res => {
        //     this.marInfo2 = res.data.link
        // })
        // fetchMar3data().then(res => {
        //     this.marInfo3 = res.data.link
        // })
        // fetchMar4data().then(res => {
        //     this.marInfo4 = res.data.link
        // })
        return {
            marInfo2: [],
            marInfo3: [],
            marInfo4: [],
            activeName: 'first',
            //三组马尔科夫链
            query2: {
                pageIndex: 1,
                pageSize: 10
            },
            query3: {
                pageIndex: 1,
                pageSize: 10
            },
            query4: {
                pageIndex: 1,
                pageSize: 10
            }
            // marInfo:[
            //     marInfo2,
            //     marInfo3,
            //     marInfo4
            // ]
        }
    },
    computed: {
        tableDataListFor2() {
            return this.marInfo2.slice((this.query2.pageIndex - 1) * this.query2.pageSize, (this.query2.pageIndex) * this.query2.pageSize)
        },
        tableDataListFor3() {
            return this.marInfo3.slice((this.query3.pageIndex - 1) * this.query3.pageSize, (this.query3.pageIndex) * this.query3.pageSize)
        },
        tableDataListFor4() {
            return this.marInfo4.slice((this.query4.pageIndex - 1) * this.query4.pageSize, (this.query4.pageIndex) * this.query4.pageSize)
        },
        Obj() {
            return store.state.filtermesres
        },
        mar2inf(){
            return store.state.mar2
        },
        mar3inf(){
            return store.state.mar3
        },
        mar4inf(){
            return store.state.mar4
        }
    },
    watch:{
        mar2inf:{
            deep: true,
            handler() {
                this.marInfo2 = store.state.mar2
            }
        },
        mar3inf:{
            deep: true,
            handler() {
                this.marInfo3 = store.state.mar3
            }
        },
        mar4inf:{
            deep: true,
            handler() {
                this.marInfo4 = store.state.mar4
            }
        }

    },
    methods: {
        handleCurrentChangeFor2(currentPage) {
            this.query2.pageIndex = currentPage;
        },
        handleCurrentChangeFor3(currentPage) {
            this.query3.pageIndex = currentPage;
        },
        handleCurrentChangeFor4(currentPage) {
            this.query4.pageIndex = currentPage;
        },
        handleRowClick(row) {
            // store.state.infoChoose = row.data.id
            console.log(row.id); // 输出选中行的信息
        }
    }
}

</script>

<style lang="scss" scoped>
.table {
    width: 80%;
}
</style>