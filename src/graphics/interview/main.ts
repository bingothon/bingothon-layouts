import Vue from 'vue';
import VueRouter from 'vue-router';
import { create, getReplicant } from '../../browser-util/state';
import * as Interviews from './interview-list';
import { AllInterviews, CurrentInterview } from '../../../schemas';
import Interview from './main.vue';

Vue.use(VueRouter);

//TODO get rid of router and make interview-var the only interview
const routes = [
    { name: 'Var Interview', path: '/interview-var', component: Interviews.Interview_Var },
    { path: '*', redirect: '/interview-var' }
];

// put all of the interviews in the replicant
const allInterviews = routes
    .map((r) => {
        return { name: r.name || '', path: r.path || '' };
    })
    .filter((r) => !!r.name);
getReplicant<AllInterviews>('allInterviews').value = allInterviews;

const router = new VueRouter({
    routes
});

// if the replicant changes, update the interviews route
getReplicant<CurrentInterview>('currentInterview').on('change', (newVal) => {
    console.log('switching to', newVal);
    router.push({ name: newVal.name });
});

create().then(() => {
    new Vue({
        router,
        render: (h) => h(Interview)
    }).$mount('#App');
});
