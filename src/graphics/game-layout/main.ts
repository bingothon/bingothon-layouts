import Vue from 'vue';
import VueRouter from 'vue-router';
import {create, getReplicant} from "../../browser-util/state";
import * as Layouts from "./layout-list";
import {AllGameLayouts, CurrentGameLayout} from '../../../schemas';
import GameLayout from "./main.vue";

Vue.use(VueRouter);

const routes = [
    //Do not append paths with a . or things will break :)
    {name: "4p 15:9 Layout", path: "/4p-15_9-layout", component: Layouts.Layout_15x9_4p},
    {name: "2p 15:9 Layout", path: "/2p-15_9-layout", component: Layouts.Layout_15x9_2p},
    {name: "2p DS Layout", path: "/2p-DS-layout", component: Layouts.Layout_DS_2p},
    {name: "2p 3:2 Layout", path: "/2p-3_2-layout", component: Layouts.Layout_3x2_2p},
    {name: "3p 3:2 Layout", path: "/3p-3_2-layout", component: Layouts.Layout_3x2_3p},
    {name: "4p 10:9 Layout", path: "/4p-10_9-layout", component: Layouts.Layout_10x9_4p},
    {name: "4p 10:9 co-op Layout", path: "/4p-10_9-co-op-layout", component: Layouts.Layout_10x9_4p_CoOp},
    {name: "2p 10:9 Layout", path: "/2p-10_9-layout", component: Layouts.Layout_10x9_2p},
    {name: "1p 10:9 Layout", path: "/1p-10_9-layout", component: Layouts.Layout_10x9_1p},
    {name: "4p 4:3 Layout", path: "/4p-4_3-layout", component: Layouts.Layout_4x3_4p},
    {name: "4p 4:3 co-op Layout", path: "/4p-4_3-co-op-layout", component: Layouts.Layout_4x3_4p_CoOp},
    {name: "3p 4:3 Layout", path: "/3p-4_3-layout", component: Layouts.Layout_4x3_3p},
    {name: "2p 4:3 Layout", path: "/2p-4_3-layout", component: Layouts.Layout_4x3_2p},
    {name: "1p 4:3 Layout", path: "/1p-4_3-layout", component: Layouts.Layout_4x3_1p},
    {name: "6p 16:9 Layout", path: "/6p-16_9-layout", component: Layouts.Layout_16x9_6p},
    {name: "4p 16:9 co-op Layout Trackers", path: "/4p-16_9-co-op-layout-trackers", component: Layouts.Layout_16x9_4p_CoOp_Trackers},
    {name: "4p 16:9 Layout Trackers", path: "/4p-16_9-layout-trackers", component: Layouts.Layout_16x9_4p_Trackers},
    {name: "4p 16:9 co-op Layout", path: "/4p-16_9-co-op-layout", component: Layouts.Layout_16x9_4p_CoOp},
    {name: "4p 16:9 Layout", path: "/4p-16_9-layout", component: Layouts.Layout_16x9_4p},
    {name: "3p 16:9 Layout", path: "/3p-16_9-layout", component: Layouts.Layout_16x9_3p},
    {name: "3p 16:9 Layout Trackers", path: "/3p-16_9-layout-trackers", component: Layouts.Layout_16x9_3p_Trackers},
    {name: "2p 16:9 Layout", path: "/2p-16_9-layout", component: Layouts.Layout_16x9_2p},
    {name: "2p 16:9 Layout 2v2", path: "/2p-16_9-layout-2v2", component: Layouts.Layout_16x9_2p_2v2},
    {name: "1p 16:9 Layout", path: "/1p-16_9-layout", component: Layouts.Layout_16x9_1p},
    {name: "2p 4:3 16:9 Layout", path: "/2p-4_3-16_9-layout", component: Layouts.Layout_4x3_16x9},
    {name: "2p 16:10 Layout", path: "/2p-16_10-layout", component: Layouts.Layout_16x10_2p},
    {name: "1p 16:10 Layout", path: "/1p-16_10-layout", component: Layouts.Layout_16x10_1p},
    {name: "Host Bingo Layout", path: "/host-bingo", component: Layouts.Layout_Host_Bingo},
    {name: "Discord Overlay", path: "/discord", component: Layouts.Layout_Discord},
    {path: "*", redirect: "/4p-4_3-layout"},
];

// put all of the game layouts in the replicant
const allGameLayouts = routes.map(r => {
    return {name: r.name || "", path: r.path || "", id: r.path.replace('/', '')};
}).filter(r => !!r.name);
getReplicant<AllGameLayouts>('allGameLayouts').value = allGameLayouts;

const router = new VueRouter({
    routes,
});

// if the replicant changes, update the game layouts route
getReplicant<CurrentGameLayout>('currentGameLayout').on('change', newVal => {
    // don't switch to invalid layouts
    if (allGameLayouts.map(n => n.name).includes(newVal.name)) {
        console.log('switching to', newVal);
        router.push({name: newVal.name});
    } else {
        console.log('invalid layout:', newVal);
    }
});

create().then(() => {
    new Vue({
        router,
        render: (h) => h(GameLayout),
    }).$mount('#App');
});
