import '@mdi/font/css/materialdesignicons.css'
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import './common.css'
import './fonts/roboto.css'
import '../../graphics/_misc/common.css'

Vue.use(Vuetify)

export default new Vuetify({
    theme: {
        dark: true,
    },
})
