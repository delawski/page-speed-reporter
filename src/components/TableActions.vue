<template>
	<div>
		<button @click.prevent="$emit( 'start' )">Run PageSpeed Insights Test</button>
		<button @click.prevent="$emit( 'export' )">Export Data</button>
		<template v-if="isUploadEnabled">
			<button @click.prevent="triggerFileUpload">Import Data</button>
			<input type="file" accept="application/json" ref="fileUpload" @change="uploadFile">
		</template>
	</div>
</template>

<script>
	export default {
		data: {},
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

					//this.importData( target.result );
					this.$emit( 'import', target.result );
				};

				reader.readAsText( currentTarget.files[0] );
			},
		},
		computed: {
			isUploadEnabled() {
				return undefined !== window.FileReader;
			},
		},
	}
</script>
