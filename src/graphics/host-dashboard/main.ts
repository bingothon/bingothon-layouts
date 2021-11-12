import Vue from 'vue';
import App from './main.vue';
import {create} from '../../browser-util/state';
import vuetify from "../../dashboard/_misc/vuetify";

create().then(() => {
	new Vue({
		el: '#App',
		render: h => h(App),
	});
});
