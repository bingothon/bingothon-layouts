import Vue from 'vue';
import VueRouter from 'vue-router';
import {create, getReplicant} from "../../browser-util/state";
import * as Interviews from "./interview-list"
import {AllInterviews, CurrentInterview} from "../../../schemas";

Vue.use(VueRouter);

const routes = [
	{name: "2p Interview", path: "/interview-2p", component: Interviews.Interview_2p},
	{path: "*", redirect: "/interview-2p"},
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
