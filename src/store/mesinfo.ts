import { defineStore } from 'pinia';
import {createStore} from 'vuex';
import mestable from "../../public/tablemes3.json";
import usertable from "../../public/table.json";
import markov from "../../public/Markov.json";

export const store = createStore({
	state: () => {
		return {
			//所有时间
			timeSlect:[],
			mesinfo: mestable,
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
			MarFromUser:[
			]

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