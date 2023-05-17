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