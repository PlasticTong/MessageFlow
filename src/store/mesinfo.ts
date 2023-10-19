import { defineStore } from 'pinia';
import {createStore} from 'vuex';
import mestable from "../../public/tablemes4.json";
import usertable from "../../public/table.json";
import markov from "../../public/Markov.json";

export const store = createStore({
	state: () => {
		return {
			check:false,
			//所有时间
			timeSlect:[],
			//选取的时间
			time:{
				start:0,
				end:0
			},
			//选取时间后的信息
			linkFByTime:[],
			nodeFByTime:[],
			linkFByTimeAll:[],
			linkFByTimeDraw:[],



			
			// mesinfo2: mestable,
			mesinfo: [],
			userinfo: usertable,
			markov:markov,
			chooseUser: {
				soure: 0,
				target: 0
			},
			//筛选条件
			filtermes:{
				isempty:"true",
				ip: "",
				hop: "",
				content: "",
				timestart: "",
				timeend: "",
				thereshold:""
			},
			//筛选消息结果
			filtermesres:{
			},
			//再通过阈值筛选消息结果
			filtermesresByhold:[],
			//连线
			filtermesresLine:[],
			//筛选节点结果
			filteruserres:{
			},
			//用户筛选消息结果
			filterresFromUser:[],
			//用户筛选马尔可夫结果
			nodeMarFromUser:[],
			//用户筛选马尔可夫结果
			NodeMarFromUser:[],
			//用户筛选马尔可夫结果
			MarFromUser:[],

			//用户选取了马尔科夫链，在表格中展示出来
			marInfoTable:[],

			marcal2:[],
			marcal3:[],
			marcal4:[],
			clealF:0,
			filename:null,

			//绘制马尔科夫链
			drawMar:false,

			mar2:[],
			mar3:[],
			mar4:[],

			//用户在表里面选择的信息
			infoChoose:null,
			threshold:6,
			formInline: {//表单数据
                user: '',//IP
                hop: '',//跳数
                datastart: '',//起始时间
                dataend: '',//终止时间
                threshold: 1,//阈值
                timestart: '',//换算成毫秒的时间
                timeend: '',//换算成毫秒的时间
                thresholdByTime: '',//换算成毫秒的阈值
            },

			timeSlice:null,


			// 10.19增加测试模式
			testData:{
				ansName:"",
				ansList:[],
				startTime:"",
				endTime:"",
				chooserList:[],
				acc:""
			}



		}
	},
	getters: {
	},
	actions: {
		// increment(a: number) {
		//   this.count += a
		// }
	}
});

export default store