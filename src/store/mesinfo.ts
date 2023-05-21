import { defineStore } from 'pinia';
import {createStore} from 'vuex';
import mestable from "../../public/tablemes.json";
import usertable from "../../public/table.json";
import markov from "../../public/Markov.json";

export const store = createStore({
	state: () => {
		return {
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
			//筛选节点结果
			filteruserres:{
			},
			//用户筛选消息结果
			filterresFromUser:[]

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