import Vue from 'vue';
import VueRouter from 'vue-router';
import { create, getReplicant } from '../../browser-util/state';
import * as CamNames from './name-list';
import { AllCamNames, CurrentCamNames } from '../../../schemas';
import CamNamesComponent from './main.vue';

Vue.use(VueRouter);

const routes = [
    { name: '1p CamNames', path: '/camnames-1p', component: CamNames.CamNames_1p },
    { name: '2p CamNames', path: '/camnames-2p', component: CamNames.CamNames_2p },
    { name: '3p CamNames', path: '/camnames-3p', component: CamNames.CamNames_3p },
    { name: '4p CamNames', path: '/camnames-4p', component: CamNames.CamNames_4p },
    { path: '*', redirect: '/camnames-4p' }
];

// put all of the camnames in the replicant
const allCamNames = routes
    .map((r) => {
        return { name: r.name || '', path: r.path || '' };
    })
    .filter((r) => !!r.name);
getReplicant<AllCamNames>('allCamNames').value = allCamNames;

const router = new VueRouter({
    routes
});

// if the replicant changes, update the interviews route
getReplicant<CurrentCamNames>('currentCamNames').on('change', (newVal) => {
    console.log('switching to', newVal);
    router.push({ name: newVal.name });
});

create().then(() => {
    new Vue({
        router,
        render: (h) => h(CamNamesComponent)
    }).$mount('#App');
});
