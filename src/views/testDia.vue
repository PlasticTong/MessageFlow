<template>
    <!-- 10.19增加测试模式 -->
    <el-dialog width="20%">
        <div style="font-size: 50px;text-align: center;">测试结果</div>
        <div style="text-align: center;">
            <el-upload action :http-request="uploadFileTest" :limit="1" style="margin-top: 10px;">
                <button
                    style="border-radius: 10px;background-color: rgb(255, 127, 127); color: rgb(252, 252, 255);width:150px;height:70px;font-size: 25px;">
                    导入答案
                </button>
            </el-upload>
        </div>
        <div style="display: flex;flex-direction: row;">
        <div class="testDia_text">目标准确度：</div>
            <el-input v-model="this.aim" style="font-size: 30px;width: 40%;margin-top: 10px;">
            </el-input>
        </div>
        
        <div class="testDia_text">当前数据：{{ this.filename }}</div>
        <div class="testDia_text">准确度：{{ this.store.state.testData.acc }}</div>
        <div class="testDia_text">用时：{{ this.timeacc }}秒
        </div>
        <div class="testDia_suc" v-if="this.store.state.testData.acc >= this.aim">测试成功！</div>
    </el-dialog>
</template>

<script>
import store from "../store/mesinfo"
import { senddata, uploadfile, readdata, uploadCsvfile, readForCsv } from "../api/index.ts"
export default {

    data() {
        return {
            filename: "",
            store: store,
            timeacc: "",
            aim: 0.8
        }
    },
    computed: {
        chooseList() {
            return store.state.testData.chooserList
        }
    },

    watch: {
        chooseList: {
            deep: true,
            handler() {
                let flag = 0
                store.state.testData.chooserList.forEach(item => {
                    if (store.state.testData.ansList.find(e => e.source == item.source && e.target == item.target)) {
                        // 找到相同的元素
                        console.log(item);
                        flag++
                    }

                });
                store.state.testData.acc = flag / store.state.testData.ansList.length
                console.log(store.state.testData);
                this.timeacc = (this.store.state.testData.endTime - this.store.state.testData.startTime) / 1000
                console.log(this.timeacc);
            }
        }

    },
    methods: {
        async uploadFileTest(item) {
            store.state.testData = {
                ansName: "",
                ansList: [],
                startTime: "",
                endTime: "",
                chooserList: [],
                acc: 0
            }
            let formdataw = new FormData()
            formdataw.append('file', item.file)
            await uploadCsvfile(formdataw).then(res => {
                this.filename = res.data
            })
            await readForCsv({ 'name': this.filename }).then(res => {
                store.state.testData.ansList = res.data
                console.log(store.state.testData);
            })
            store.state.testData.startTime = Date.parse(new Date());
        }
    }
}
</script>

<style scoped>
.testDia_text {
    font-size: 30px;
    margin-top: 10px;
}

.testDia_suc {
    font-size: 50px;
    margin-top: 10px;
    color: red;
    text-align: center;

}
</style>