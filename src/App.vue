<template>
	<el-container id="app">
		<el-header>
			<app-header
					:isInProgress="progress < 100"
					@start="start"
					@export="exportData"
					@import="importData"/>
		</el-header>
		<el-main>
			<el-table
					:data="results"
					class="results">
				<el-table-column
						fixed
						prop="date"
						label="Tested Date">
				</el-table-column>
				<el-table-column
						prop="page"
						label="Page">
				</el-table-column>
				<el-table-column
						prop="template"
						label="Template">
				</el-table-column>
				<el-table-column label="Mobile">
					<el-table-column
							label="Speed">
						<template slot-scope="scope">
							{{ scope.row.mobile.category }}<br>
							{{ scope.row.mobile.fcp }}s FCP
							{{ scope.row.mobile.dcl }}s DCL
						</template>
					</el-table-column>
					<el-table-column
							prop="mobile.score"
							label="Optimization">
					</el-table-column>
					<el-table-column
							prop="mobile.prioritizeVisibleContent"
							label="Prioritize Visible Content">
					</el-table-column>
				</el-table-column>
				<el-table-column label="Desktop">
					<el-table-column
							label="Speed">
						<template slot-scope="scope">
							{{ scope.row.desktop.category }}<br>
							{{ scope.row.desktop.fcp }}s FCP
							{{ scope.row.desktop.dcl }}s DCL
						</template>
					</el-table-column>
					<el-table-column
							prop="desktop.score"
							label="Optimization">
					</el-table-column>
					<el-table-column
							prop="desktop.prioritizeVisibleContent"
							label="Prioritize Visible Content">
					</el-table-column>
				</el-table-column>
			</el-table>
		</el-main>
		<el-progress
				:percentage="progress"
				:showText="false"
				:strokeWidth="4"></el-progress>
	</el-container>
</template>

<script>
	import axios from 'axios';
	import Header from './components/Header.vue';

	export default {
		name: 'app',
		components: {
			appHeader: Header,
		},
		methods: {
			start() {
				this.requestsTotal = 0;
				this.requestsResolved = 0;

				this.pages.map( testPage => {
					this.requestsTotal++;

					axios.all( [ this.getScoreRequest( testPage.page, 'mobile' ), this.getScoreRequest( testPage.page, 'desktop' ) ] )
						.then( axios.spread( ( mobile, desktop ) => {
							this.requestsResolved++;
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
					date:     this.formatDateString(),
					page:     mobileData.id,
					template: template,
					mobile:   this.getFormattedMetrics( mobileData ),
					desktop:  this.getFormattedMetrics( desktopData ),
				};

				const index = this.results.findIndex( result => result.page === mobileData.id );

				if ( -1 < index ) {
					this.results.splice( index, 1, data );
				} else {
					this.results.push( data );
				}
			},
			formatDateString( date = new Date() ) {
				return [
					date.getFullYear(),
					( '0' + ( date.getMonth() + 1 ) ).slice( -2 ),
					( '0' + date.getDate() ).slice( -2 ),
				].join( '-' );
			},
			getFormattedMetrics( data ) {
				return {
					score:                    data.ruleGroups.SPEED.score,
					category:                 data.loadingExperience.overall_category,
					fcp:                      (data.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.median / 100).toFixed( 1 ),
					dcl:                      (data.loadingExperience.metrics.DOM_CONTENT_LOADED_EVENT_FIRED_MS.median / 100).toFixed( 1 ),
					prioritizeVisibleContent: 0 === data.formattedResults.ruleResults.PrioritizeVisibleContent.ruleImpact ? 'Yes' : 'No',
				}
			},
			exportData() {
				const now = new Date().toISOString();
				const data = {
					createdAt: now,
					pages:     this.pages,
					results:   this.results,
				};
				const a    = document.createElement( 'a' );
				const file = new Blob( [ JSON.stringify( data ) ], { type: 'text/plain' } );
				a.href     = URL.createObjectURL( file );
				a.download = `reporter-${ now.slice( 0, 10 ) }.json`;
				a.click();
			},
			importData( rawData ) {
				const data = JSON.parse( rawData );

				if ( data.pages && 0 < data.pages.length ) {
					this.pages = data.pages;
				}
				if ( data.results && 0 < data.results.length ) {
					this.results = data.results;
				}
			},
		},
		data() {
			return {
				pages: [
					{
						page: 'https://heavy.com',
						template: 'Home',
					},
					{
						page: 'https://ahoramismo.com',
						template: 'Home',
					},
				],
				results: [],
				requestsTotal: 0,
				requestsResolved: 0,
			}
		},
		computed: {
			progress() {
				let progress;

				if ( 0 === this.requestsTotal ) {
					progress = 100;
				} else {
					progress = Math.round( this.requestsResolved / this.requestsTotal * 100 );
				}
				if ( 0 === progress ) {
					progress = 1;
				}

				return progress;
			},
		},
	}
</script>

<style scoped lang="scss">
	#app {
		font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.results {
		width: 100%;
	}

	.el-progress {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
	}
</style>
