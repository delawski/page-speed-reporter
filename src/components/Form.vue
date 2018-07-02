<template>
	<el-form size="small" ref="pageForm" :model="pageForm" :rules="rules" label-position="right" label-width="120px">
		<h3>Add New Page</h3>
		<el-form-item label="Page URL" prop="page">
			<el-input v-model="pageForm.page"></el-input>
		</el-form-item>
		<el-form-item label="Template Name" prop="template">
			<el-input v-model="pageForm.template"></el-input>
		</el-form-item>
		<el-form-item>
			<el-button type="primary" @click="onSubmit">Add Page</el-button>
		</el-form-item>
	</el-form>
</template>

<script>
	export default {
		data() {
			return {
				pageForm: {
					page:     '',
					template: '',
				},
				rules: {
					page: [
						{ required: true, message: 'Please provide page URL.', trigger: 'blur' },
						{ type: 'url', message: 'Please provide valid URL.', trigger: 'blur' },
					],
					template: [
						{ required: true, message: 'Please provide template name.', trigger: 'blur' },
					],
				},
			};
		},
		methods: {
			onSubmit() {
				this.$refs['pageForm'].validate( ( valid ) => {
					if ( ! valid ) {
						return false;
					}

					this.$emit( 'addPage', {
						page: this.pageForm.page,
						template: this.pageForm.template,
					} );

					this.$refs['pageForm'].resetFields();
				} );
			}
		}
	}
</script>
