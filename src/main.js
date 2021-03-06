import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';
import {
	Container,
	Header,
	Main,
	Menu,
	MenuItem,
	Button,
	Table,
	TableColumn,
	Progress,
	Message,
	Form,
	FormItem,
	Input,
} from 'element-ui';

axios.defaults.baseURL = 'https://www.googleapis.com';
axios.defaults.headers.get['Accepts'] = 'application/json';

Vue.use( Container );
Vue.use( Header );
Vue.use( Main );
Vue.use( Menu );
Vue.use( MenuItem );
Vue.use( Button );
Vue.use( Table );
Vue.use( TableColumn );
Vue.use( Progress );
Vue.use( Form );
Vue.use( FormItem );
Vue.use( Input );

//Vue.use( Loading.directive );
Vue.prototype.$message = Message;

new Vue( {
	el:     '#app',
	render: h => h( App )
} );
