<template>
	<div id="app">
		<vue-good-table
				:columns="setupColumns"
				:rows="pages">
			<div slot="table-actions">
				<button @click.prevent="runPageSpeedTest">Run PageSpeed Insights Test</button>
				<button @click.prevent="exportData">Export Data</button>
				<template v-if="isUploadEnabled">
					<button @click.prevent="triggerFileUpload">Import Data</button>
					<input type="file" accept="application/json" ref="fileUpload" @change="uploadFile">
				</template>
			</div>
		</vue-good-table>
		<br><br>
		<vue-good-table
				:columns="columns"
				:rows="rows"
				:groupOptions="{
				enabled: true
			}">
		</vue-good-table>
	</div>
</template>

<script>
	import axios from 'axios';

	export default {
		name: 'app',
		methods: {
			runPageSpeedTest() {
				const testPages = this.pages;

				testPages.map( testPage => {
					axios.all( [ this.getScoreRequest( testPage.page, 'mobile' ), this.getScoreRequest( testPage.page, 'desktop' ) ] )
						.then( axios.spread( ( mobile, desktop ) => {
							this.parsePageSpeedResults( mobile.data, desktop.data, testPage.template );
						} ) );
				} );
			},
			getScoreRequest( url, strategy ) {
				return axios.get( '/pagespeedonline/v4/runPagespeed', {
					params: { url, strategy }
				} );
			},
			parsePageSpeedResults( mobileData, desktopData, template = '' ) {
				const data = {
					mode:     'span',
					label:    this.formatRowHeader( mobileData.id, template ),
					html:     true,
					children: [
						{
							date:                            this.formatDateString(),
							notes:                           '',
							strategy:                        'mobile',
							mobileSpeed:                     this.formatScoreString( mobileData ),
							mobileScore:                     mobileData.ruleGroups.SPEED.score,
							desktopSpeed:                    this.formatScoreString( desktopData ),
							desktopScore:                    desktopData.ruleGroups.SPEED.score,
							mobilePrioritizeVisibleContent:  this.getPrioritizeVisibleContentFlag( mobileData ),
							desktopPrioritizeVisibleContent: this.getPrioritizeVisibleContentFlag( desktopData ),
						}
					],
				};

				const rowIndex = this.rows.findIndex( row => row.label === mobileData.id );

				if ( -1 < rowIndex ) {
					this.rows.splice( rowIndex, 1, data );
				} else {
					this.rows.push( data );
				}
			},
			formatRowHeader( url, template ) {
				return `<span class="domain-name">${ url.match( /\/\/([^/]*)/ )[1] }</span> ${ template }<br>
					<small><a href="${ url }">${ url }</a></small>`;
			},
			formatDateString( date = new Date() ) {
				return [
					date.getFullYear(),
					( '0' + ( date.getMonth() + 1 ) ).slice( -2 ),
					( '0' + date.getDate() ).slice( -2 ),
				].join( '-' );
			},
			formatScoreString( data ) {
				return `
					${ data.loadingExperience.overall_category }<br>
					${ ( data.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.median / 100 ).toFixed( 1 ) }s&nbsp;FCP
					${ ( data.loadingExperience.metrics.DOM_CONTENT_LOADED_EVENT_FIRED_MS.median / 100 ).toFixed( 1 ) }s&nbsp;DCL`;
			},
			getPrioritizeVisibleContentFlag( data ) {
				return 0 === data.formattedResults.ruleResults.PrioritizeVisibleContent.ruleImpact ? 'Yes' : 'No';
			},
			exportData() {
				const now = new Date().toISOString();
				const data = {
					createdAt: now,
					setup:     this.setupRows,
					columns:   this.columns,
					rows:      this.rows,
				};
				const a    = document.createElement( 'a' );
				const file = new Blob( [ JSON.stringify( data ) ], { type: 'text/plain' } );
				a.href     = URL.createObjectURL( file );
				a.download = `reporter-${ now.slice( 0, 10 ) }.json`;
				a.click();
			},
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

					this.importData( target.result );
				};

				reader.readAsText( currentTarget.files[0] );
			},
			importData( rawData ) {
				const data = JSON.parse( rawData );

				if ( data.setup && 0 < data.setup.length ) {
					this.pages = data.setup;
				}
				if ( data.columns && 0 < data.columns.length ) {
					this.columns = data.columns;
				}
				if ( data.rows && 0 < data.rows.length ) {
					this.rows = data.rows;
				}
			},
		},
		computed: {
			isUploadEnabled() {
				return undefined !== window.FileReader;
			}
		},
		data() {
			return {
				columns: [
					{
						label: 'Tested Date',
						field: 'date',
						type: 'date',
						dateInputFormat: 'YYYY-MM-DD',
						dateOutputFormat: 'MM/DD/YYYY',
					},
					{
						label: 'Test notes',
						field: 'notes',
					},
					{
						label: 'Mobile Speed',
						field: 'mobileSpeed',
						html: true,
					},
					{
						label: 'Mobile Optimization',
						field: 'mobileScore',
						type: 'number',
					},
					{
						label: 'Desktop Speed',
						field: 'desktopSpeed',
						html: true,
					},
					{
						label: 'Desktop Optimization',
						field: 'desktopScore',
						type: 'number',
					},
					{
						label: 'Mobile Prioritize Visible Content',
						field: 'mobilePrioritizeVisibleContent',
					},
					{
						label: 'Desktop Prioritize Visible Content',
						field: 'desktopPrioritizeVisibleContent',
					},
				],
				rows: [],
				setupColumns: [
					{
						label: 'Page',
						field: 'page',
					},
					{
						label: 'Template',
						field: 'template',
					},
				],
				pages: [],
			}
		},
	}
</script>

<style>
	#app {
		font-family: Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
		margin-top: 60px;
	}

	h1, h2 {
		font-weight: normal;
	}

	ul {
		list-style-type: none;
		padding: 0;
	}

	li {
		display: inline-block;
		margin: 0 10px;
	}

	a {
		color: #42b983;
	}
	
	.domain-name {
		display: inline-block;
		padding: 1px 4px;
		border-radius: 2px;
		letter-spacing: 0.5px;
		font-size: 66%;
		text-transform: uppercase;
		background-color: #DCDFE6;
		opacity: 0.6;
	}

	input[type='file'] {
		display: none;
	}
</style>
