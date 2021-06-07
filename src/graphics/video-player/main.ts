import Vue from 'vue';
import App from './main.vue';
import {create} from '../../browser-util/state';

create().then(() => {
    new Vue({
        el: '#App',
        render: h => h(App),
    });
});
