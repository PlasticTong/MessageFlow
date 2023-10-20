<template>
    <div class="mar-title">
        <h2 style="margin: 5px 5px;font-size: 30px;">条件筛选器</h2>
    </div>
    <div class="formchooser-container">
        <el-form :inline="true" :model="this.formInline">
            <el-form-item>
                <div>
                    <label style="font-size:30px;margin-right: 10px;">IP段</label>
                    <el-input v-model="this.formInline.user" placeholder="IP段"
                        style="width: 400px;height: 80px;font-size: 30px;"></el-input>
                </div>
            </el-form-item>
            <el-form-item>
                <div>
                    <label style="font-size:30px;margin-right: 10px;">跳数</label>
                    <el-input v-model="this.formInline.hop" placeholder="跳数"
                        style="width: 400px;height: 80px;font-size: 30px;"></el-input>
                </div>
            </el-form-item>
            <el-form-item>
                <div style="display: flex;flex-direction: row;">
                    <label style="font-size:30px;margin-right: 10px;margin-top: 20px;">时间阈值</label>
                    <el-input v-model="this.formInline.threshold" placeholder="时间阈值"
                        style="width: 200px;height: 80px;font-size: 30px;">
                    </el-input>
                    <div style="font-size: 30px;margin-top: 20px;">*{{ this.store.state.timeSlice * 10 }}分钟</div>
                </div>
            </el-form-item>
            <el-form-item>
                <div style="display:flex;justify-content:space-between">
                    <el-button type="primary" @click="onSubmit"
                        style="width:200px;height: 50px;font-size: 30px;">查询</el-button>
                    <el-button type="danger" @click="clear" style="width:200px;height: 50px;font-size: 30px;">重置</el-button>
                </div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { ElMessage, ElMessageBox } from "element-plus";
import { searchData } from "../api/index";
import { store } from "../store/mesinfo"
import * as d3 from 'd3'
// import { ElMessage, ElMessageBox } from "element-plus";
export default {
    data() {
        return {
            formInline: {//表单数据
                user: '192.168.1.2',//IP
                hop: '2',//跳数
                datastart: '',//起始时间
                dataend: '',//终止时间
                threshold: 1,//阈值
                timestart: '',//换算成毫秒的时间
                timeend: '',//换算成毫秒的时间
                thresholdByTime: '',//换算成毫秒的阈值
            },
            timeSlice: "",//用户自己填写的时间片
            store:store
        }
    },
    methods: {
        async onSubmit() {
            // console.log(this.formInline);
            // console.log(store.state.linkFByTime);
            //数据检索，提交数据和表单数据到后台进行检索
            //先把时间改成毫秒
            this.formInline.timestart = store.state.time.start
            this.formInline.timeend = store.state.time.end
            if (this.formInline.user == '') {
                ElMessage.error("请输入IP")
            } else if (this.formInline.hop == '') {
                ElMessage.error("请输入跳数")
            } 
            // else if (this.formInline.datastart == '') {
            //     ElMessage.error("请输入起始时间")
            // } 
            // else if (this.formInline.dataend == '') {
            //     ElMessage.error("请输入终止时间")
            // } 
            else {
                //传入后台\
                await searchData({
                   
                        data: store.state.linkFByTimeAll,
                        form: this.formInline
                    
                    
                }).then(res => {
                    console.log(res.data);
                    store.state.linkFByTime = res.data
                })
                // await axios({
                //     url: 'http://127.0.0.1:5002/mesBE/searchData',
                //     method: "POST",
                //     data: {
                //         data: this.tabledataOri,
                //         form: this.formInline
                //     }
                // }).then(res => {
                //     this.tabledata = res.data
                // })
                //检索完毕，数据分页
                // this.tableDataForShow = this.tabledata.slice((this.page.index - 1) * this.page.size, (this.page.index) * this.page.size)
                // this.page.total = this.tabledata.length
                
                ElMessage.success("筛选成功")
                //把原始数据的作图给删掉
                d3.select("#maingroup").remove()
                store.state.formInline = this.formInline
            }
        },
    }

};

</script>

<style scoped>
.mar-title {
    display: flex;
    color: white;
    background-color: #6d6d6d;
}

.formchooser-container {
    width: 100%;
    height: 500px;
    /* border: 1px solid black; */
}

.formclass {
    display: flex;
    flex-direction: column;
}
</style>