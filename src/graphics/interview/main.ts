import Vue from 'vue';
import VueRouter from 'vue-router';
import {create, getReplicant} from "../../browser-util/state";
import * as Interviews from "./interview-list"
import {AllInterviews, CurrentInterview} from "../../../schemas";

Vue.use(VueRouter);

const routes = [
	{name: "1p Interview", path: "/interview-1p", component: Interviews.Interview_1p},
	{name: "2p Interview", path: "/interview-2p", component: Interviews.Interview_2p},
	{name: "3p Interview", path: "/interview-3p", component: Interviews.Interview_3p},
	{name: "4p Interview", path: "/interview-4p", component: Interviews.Interview_4p},
	{name: "4p CoOp Interview", path: "/interview-4p-CoOp", component: Interviews.Interview_4p_CoOp},
	{name: "Charity Interview", path: "/interview-charity", component: Interviews.Interview_Charity},
	{name: "Var Interview", path: "/interview-var", component: Interviews.Interview_Var},
	{path: "*", redirect: "/interview-var"},
];

// put all of the interviews in the replicant
const allInterviews = routes.map(r => { return {name: r.name || "", path: r.path || ""}}).filter(r => !!r.name);
getReplicant<AllInterviews>('allInterviews').value = allInterviews;

const router = new VueRouter({
	routes,
});

// if the replicant changes, update the interviews route
getReplicant<CurrentInterview>('currentInterview').on('change',newVal => {
	console.log('switching to',newVal);
	router.push({name: newVal.name});
});

create().then(()=> {
	new Vue({
		router,
	}).$mount('#app');
});
