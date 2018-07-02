<template>
	<div class="container">
		<h1 class="title">Page Speed Reporter</h1>
		<nav class="actions">
			<el-button
					plain
					icon="el-icon-download"
					@click.prevent="$emit( 'export' )">Export</el-button>
			<template v-if="isUploadEnabled">
				<el-button
						plain
						icon="el-icon-upload2"
						@click.prevent="triggerFileUpload">Import</el-button>
				<input type="file" accept="application/json" ref="fileUpload" @change="uploadFile">
			</template>
			<el-button
					type="primary"
					:icon="icon"
					class="button"
					@click.prevent="$emit( 'start' )">Run Test</el-button>
		</nav>
	</div>
</template>

<script>
	export default {
		props: [ 'isInProgress' ],
		methods: {
			triggerFileUpload( e ) {
				e.target.blur();
				this.$refs.fileUpload.click();
			},
			uploadFile( e ) {
				const { currentTarget } = e;

				if ( 0 === currentTarget.files.length ) {
					return;
				}

				const reader = new FileReader();
				reader.onload = ( { target } ) => {
					if ( 2 !== target.readyState ) {
						return;
					}

					if ( target.error ) {
						console.error( 'Error while reading file.' );
						return;
					}

					this.$emit( 'import', target.result );
				};

				reader.readAsText( currentTarget.files[0] );
			},
		},
		computed: {
			isUploadEnabled() {
				return undefined !== window.FileReader;
			},
			icon() {
				return this.isInProgress ? 'el-icon-loading' : 'el-icon-caret-right';
			}
		},
	}
</script>

<style scoped>
	.container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-height: 100%;
		border-bottom: 1px solid #efefef;
		padding-bottom: 5px;
	}

	.button {
		margin-left: 10px;
	}

	input[type='file'] {
		display: none;
	}
</style>
