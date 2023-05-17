import { defineStore } from 'pinia';
import {createStore} from 'vuex';
import mestable from "../../public/tablemes.json";
import usertable from "../../public/table.json";

export const store = createStore({
	state: () => {
		return {
			mesinfo: mestable,
			userinfo: usertable,
			chooseUser: {
				soure: 1,
				target: 1

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