/* eslint no-new: off, @typescript-eslint/explicit-function-return-type: off */
import Vue from 'vue';
import App from './main.vue';
import { create } from '../../browser-util/state';
import Vuetify from "../_misc/vuetify";

create().then(() => {
  new Vue({
	Vuetify,
    el: '#App',
    render: h => h(App),
  });
});
