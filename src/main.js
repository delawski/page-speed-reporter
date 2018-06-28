import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';
import VueGoodTablePlugin from 'vue-good-table';

// Stylesheets.
import 'vue-good-table/dist/vue-good-table.css';

axios.defaults.baseURL = 'https://www.googleapis.com';
axios.defaults.headers.get['Accepts'] = 'application/json';

Vue.use( VueGoodTablePlugin );

new Vue( {
	el:     '#app',
	render: h => h( App )
} )
