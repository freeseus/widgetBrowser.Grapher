var apiKey = '147e280bf158656f15b498dcf66aac3f';
var dataURL = ''; //'http://api.stlouisfed.org/fred/series/observations?series_id=GNPCA&realtime_start=1776-07-04&api_key=' + apiKey + '&realtime_start=2013-05-25';
var dataSet = {};
var urlData = {};
var browser = {};
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var console;

//dataURL = 'http://data.treasury.gov/feed.svc/DailyTreasuryYieldCurveRateData?$filter=year(NEW_DATE)%20eq%202013';

function processData(data){
	//console.log(data.query.results.feed);
	//console.log(data.query.results.observations);

	//console.log(urlData);

	dataSet = data;
	dataSet.chart = {};
	dataSet.chart = dataSet.observations;
	dataSet.chart.settings = {};
	dataSet.chart.settings.title = urlData.title;
	dataSet.chart.settings.subtitle = urlData.subtitle;
	dataSet.chart.settings.graphType = urlData.graphtype;
	dataSet.chart.settings.colors = ['#bb6d82', '#ecafaf', '#d7706c', '#76acb8', '#736e7e', '#94826b', '#936971', '#819e9a', '#c1b8b4', '#eed485'],
	dataSet.chart.settings.opacity = .25;
	dataSet.chart.settings.yAxis = {};
	dataSet.chart.settings.yAxis.min = null,
	dataSet.chart.settings.yAxis.max = null;
	dataSet.chart.settings.tooltip = {};
	dataSet.chart.settings.tooltip.fontColor = '#333';
	dataSet.chart.settings.tooltip.backgroundColor = '#fff';
	dataSet.chart.settings.tooltip.borderColor = null;
	dataSet.chart.settings.tooltip.ie8BackgroundColor = '#fff';
	dataSet.chart.settings.tooltip.ie8FontColor = '#333';
	dataSet.chart.settings.legend = {};
	dataSet.chart.settings.animTime = 1000;
	dataSet.chart.settings.isStacking = false;
	dataSet.chart.settings.stretchgraph = urlData.stretchgraph;
	dataSet.chart.settings.additionalHoverDetails = {}; //only used in some circumstances with categories

	//console.log(dataSet.chart.observation);
	dataSet.chart.observation = urlData.data;

	createHighchart(dataSet.chart.settings.graphType);
}

function createHighchart(graphType){
	var htmlChartLocation = 'chart';

	$('.content').append('<div id="' + htmlChartLocation + '" style="position:relative; top:-14px; width:' + urlData.width + '; height:' + urlData.height + '; opacity:0;"></div>');
	
	var mArr = {Jan: 0,Feb: 1,Mar: 2,Apr: 3,May: 4,Jun: 5,Jul: 6,Aug: 7,Sep: 8,Oct: 9,Nov: 10,Dec: 11};
	var FT = {};FT.interactive = {};

	FT.interactive.options = {
		chart:{
			renderTo: htmlChartLocation,
			ignoreHiddenSeries: false,
			polar: urlData.isPolar,
			marginTop: 60,
			marginBottom: 45,
			marginRight: 150
		},
		title:{
			text: dataSet.chart.settings.title
		},

		credits:{
			enabled: true,
			text: urlData.sourcetext ? 'Source: ' + urlData.sourcetext : '',
			href: null, //urlData.sourceurl <--- this won't work open in a new window
			position: sourcePosition(urlData.sourcetext, urlData.sourceloc),
			style:{
				color: '#74736c',
				font: '10px BentonSans, Arial, Helvetica, sans-serif',
				fontStyle: 'italic',
				fontFamily: 'Arial',
				fontSize: '10px'
			}
		},
		xAxis:{
			y: 0,
			offset: 10, //vertical spacing pushing the x-axis down/up
			lineWidth: 1,
			tickWidth: 1,
			tickLength: 1,
			tickPosition: 'outside',
			labels:{
				style:{
					color: '#74736c',
					font: '10px BentonSans, Arial, Helvetica, sans-serif',
					fontFamily: 'Arial',
					fontSize: '10px'
				}
			}
		},
		plotOptions:{
			series:{
				animation:{
					duration: dataSet.chart.settings.animTime
				},
				connectNulls: false,
				shadow: false,
				marker:{
					enabled: true,
					radius: 0,
					lineColor: null,
					fillColor: null,
					symbol: 'circle',
					states:{
						hover:{
							radius: 5,
							fillColor: '#fff1e0',
							lineColor: null,
							lineWidth: 2,
							shadow: false
						}
					}
				}
			}
		},
		exporting:{
			enabled: false
		}
	};

	FT.interactive.data = [];	 
	FT.interactive.options.xAxis = {
		plotBands:[],
		dateTimeLabelFormats:{
			month: '%b' + " '" + '%y',
			week: '%b %e',
			day: '%b %e',
			hour: '%l %P',
			minute: '%l:%M %P'
		}
	};

	FT.interactive.options.tooltip = {
		useHTML: true,
		borderRadius: 4,
		borderWidth: 0,
		shadow: true,
		formatter: function(e){
			$(e.label.div).css('pointer-events','none'); //hide the mouse selector when over the hover caption

			if(!urlData.unitsBefore || urlData.unitsBefore === null || urlData.unitsBefore === undefined){
				urlData.unitsBefore = '';
			}

			if(!urlData.unitsAfter || urlData.unitsAfter === null || urlData.unitsAfter === undefined){
				urlData.unitsAfter = '';
			}

			if(urlData.unitsAfter === 'per cent'){
				urlData.unitsAfter = ' per cent';
			}

			if(Array.isArray(this.point.options.total)){
				var date = '';
				var series = '';

				if(String(this.point.options.total[0]).indexOf('/') > -1){ //if it's a date
					date = interpretDate(this.point.options.total[0]) + ': ';
				}else{
					date = this.point.options.total[0] + ': '; //not a date, but still showing it?
				}

				var indexOfPeriod = String(this.point.options.total[1]).indexOf('.');

				if(indexOfPeriod > 0){
					if(this.point.options.total[1].length - indexOfPeriod > 3){
						//console.log('long decimal');
						this.point.options.total[1] = this.point.options.total[1].substring(0, indexOfPeriod + 4);
						this.point.options.total[1] = Number(this.point.options.total[1]);
					}
				}

				if(this.point.options.total[2]){
					series = '<b>' + this.point.options.total[2] + '</b><br/>';
				}

				return series + date + '<b>' + urlData.unitsBefore + prettyNumber(this.point.options.total[1]) + urlData.unitsAfter + '</b>';
			}else if(this.point.stackTotal){
				console.log('stacked column!', this);
				var date = '';

				if(String(this.total[0]).indexOf('/') > -1){ //if it's a date
					date = interpretDate(this.total[0]) + ': ';
				}else{
					date = this.total[0] + ': '; //not a date, but still showing it?
				}

				console.log(date);

				return '';
			}else{
				//console.log('here?', this);
				//return this.percentage ? '<b>' + this.percentage + '</b><br/>' + this.key + ': <b>' + urlData.unitsBefore + prettyNumber(this.y) + urlData.unitsAfter + '</b>' : this.key + ': <b>' + urlData.unitsBefore + prettyNumber(this.y) + urlData.unitsAfter + '</b>';
				
			}
		}
	};
	
	if(graphType){
		dataSet.chart.settings.graphType = graphType;
	}
	
	if(dataSet.chart.settings.graphType === 'line'){
		//dataSet.chart.settings.graphType = 'spline'; //Eric wanted this disabled
	}

	dataSet.chart.sections = [];
	var categoryItems = [];

	if(dataSet.isSingleDataSet === true){
		var i = 0;
		var section = {
			name: dataSet.chart.sections[i],
			data: [],
			type: dataSet.chart.settings.graphType,
			lineWidth: 2,
			fillOpacity: dataSet.chart.settings.opacity,
			fillcolor: Highcharts.getOptions().colors[i],
			shadow: false,
			connectNulls: false
		};

		for(i = 0; i < dataSet.chart.observation.length; i += Math.floor(dataSet.chart.observation.length / 1000) + 1){
		//for(var i = 0; i < dataSet.chart.observation.length; i++){
			var date = dataSet.chart.observation[i].date;
			var value = Number(dataSet.chart.observation[i].value);
			var dateArray = date.split('-');

			if(dataSet.chart.observation[i].value === null || dataSet.chart.observation[i].value === undefined){
				value = null;
			}

			if(dataSet.chart.settings.yAxis.min == null){
				dataSet.chart.settings.yAxis.min = value;
			}else if(value < dataSet.chart.settings.yAxis.min){
				dataSet.chart.settings.yAxis.min = value;
			}

			if(dataSet.chart.settings.yAxis.max == null){
				dataSet.chart.settings.yAxis.max = value;
			}else if(value > dataSet.chart.settings.yAxis.max){
				dataSet.chart.settings.yAxis.max = value;
			}

			if(date == '.' || value == '.'){
				date = null;
				value = null;
			}else{
				date = Date.parse(dateArray[1] + '/' + dateArray[2] + '/' + dateArray[0]);
			}

			if(dataSet.chart.observation[i].date.length > 0){ //ignore blank values in csv files
				if(!$.isNumeric(dataSet.chart.observation[i].date) && dataSet.chart.observation[i].date.indexOf('/') === -1){ //a category
					section.data.push(Math.round(value * 100) / 100);
					categoryItems.push(dataSet.chart.observation[i].date);
				}else{ //not a category
					section.data.push({
						x: $.isNumeric(dataSet.chart.observation[i].date) ? parseFloat(dataSet.chart.observation[i].date) : date,
						y: Math.round(value * 100) / 100,
						total: [dataSet.chart.observation[i].date,value]
					});
				}

				if(dataSet.chart.observation[i].value === undefined || dataSet.chart.observation[i].date === undefined){
					section.data.pop();
				}
			}
		}

		var verticalAdjustment = 2.5 * (dataSet.chart.settings.yAxis.max - dataSet.chart.settings.yAxis.min) / parseFloat(urlData.height);

		dataSet.chart.settings.yAxis.min -= verticalAdjustment;
		dataSet.chart.settings.yAxis.max += verticalAdjustment;

		//console.log(section);

		FT.interactive.data.push(section);
		FT.interactive.options.series = FT.interactive.data;

		if(categoryItems.length > 0){
			FT.interactive.options.xAxis.categories = categoryItems;
		}else if(!$.isNumeric(dataSet.chart.observation[0].date)){
			FT.interactive.options.xAxis.type = 'datetime';
		}

		//var dateInterval = 30  * 24 * 3600;		
	}else{ //multiple data sets
		var hasDates = false;

		for(var i = 0; i < dataSet.chart.observation.length; i++){
			var section = {
				name: dataSet.chart.observation[i].label,
				data: [],
				type: dataSet.chart.observation[i].graphType === 'stacked' ? 'column' : dataSet.chart.observation[i].graphType,
				lineWidth: 2,
				fillOpacity: dataSet.chart.settings.opacity,
				fillcolor: Highcharts.getOptions().colors[i],
				shadow: false,
			};

			if(dataSet.chart.observation[i].graphType === 'stacked'){
				dataSet.chart.settings.isStacking = 'normal';
				//console.log('stacking columns');
			}

			for(var j = 0; j < dataSet.chart.observation[i].data.length; j++){
				if(!$.isNumeric(dataSet.chart.observation[i].data[j].x) && dataSet.chart.observation[i].data[j].x.indexOf('/') === -1 && dataSet.chart.observation[i].data[j].x.indexOf('-') === -1){ //a category
					var value = Number(dataSet.chart.observation[i].data[j].y);
					section.data.push({y:Math.round(value * 100) / 100, percentage:dataSet.chart.observation[i].label});
					categoryItems.push(dataSet.chart.observation[i].data[j].x);
				}else{
					if(dataSet.chart.observation[i].data[j].x.charAt(dataSet.chart.observation[i].data[j].x.length - 1) === '-'){
						dataSet.chart.observation[i].data[j].x = dataSet.chart.observation[i].data[j].x.substring(0, dataSet.chart.observation[i].data[j].x.length - 1);
						//console.log(dataSet.chart.observation[i].data[j].x);
					}else{
						//console.log(dataSet.chart.observation[i].data[j].x);
					}

					if(dataSet.chart.observation[i].data[j].x === Number(dataSet.chart.observation[i].data[j].x)){
						section.data.push({
							x: String(dataSet.chart.observation[i].data[j].x / 3),
							y: dataSet.chart.observation[i].data[j].y,
							total: [dataSet.chart.observation[i].data[j].x, dataSet.chart.observation[i].data[j].y, dataSet.chart.observation[i].label]
						});
					}else{
						var aDate = new Date(dataSet.chart.observation[i].data[j].x);
							aDate = aDate.getTime(dataSet.chart.observation[i].data[j].x);

						section.data.push({
							x: aDate,
							y: dataSet.chart.observation[i].data[j].y,
							total: [dataSet.chart.observation[i].data[j].x, dataSet.chart.observation[i].data[j].y, dataSet.chart.observation[i].label]
						});
					}

					if(!$.isNumeric(dataSet.chart.observation[i].data[j].x)){
						hasDates = true;
					}
				}
			}

			FT.interactive.data.push(section);
		}

		//console.log(FT.interactive.data);

		FT.interactive.options.series = FT.interactive.data;

		if(hasDates){
			FT.interactive.options.xAxis.type = 'datetime';
		}else if(categoryItems.length > 0){
			FT.interactive.options.xAxis.categories = categoryItems;

			//console.log(FT.interactive.options.xAxis.categories);
		}
	}

	applyTheme();
	
	var highchart = new Highcharts.Chart(FT.interactive.options, function(c){chartLoaded(c)});
	
	function convertDate(string){
		array = string.split(',');
		
		if(array.length == 1){
			while(array.length < 3){
				array.push(0);
			}
			
			array[2] = 1;
		}else if(array.length == 2){
			array.push(1);
			array[1] -= 1;
		}else if(array.length > 2){
			array[1] -= 1;
		}
		
		return Date.UTC(array[0],array[1], array[2]);
	}

	function prettyNumber(x){
    	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	
	function applyTheme(){
		//console.log(FT.interactive.options.series);
		//console.log(dataSet.chart.settings.yAxis.min, console.log(dataSet.chart.settings.yAxis.max);
		Highcharts.theme = {
			//colors: ['#9e2f50', '#4781aa', '#eda45e', '#a6a471', '#736e7e', '#94826b', '#936971', '#c36256', '#8ab5cd'],
			//colors:['#c36256', '#75a5c2', '#eda45e', '#a6a471', '#736e7e', '#94826b', '#936971', '#819e9a', '#c1b8b4', '#eed485'],
			colors:dataSet.chart.settings.colors,
			chart:{
				backgroundColor: 'none',
				borderWidth: 0,
				plotBackgroundColor: 'none',
				plotShadow: false,
				plotBorderWidth: 0,
				spacingRight: 3,
				spacingLeft: 5,
				spacingBottom: 0
			},
			
			title:{
				align: 'left',
				floating: false,
				x: 0,
				y: 12,
				style:{ 
					color: '#43423e',
					font: '18px BentonSans, Arial, Helvetica, sans-serif',
					fontFamily: 'Arial',
					fontSize: '18px',
				}
			},
			subtitle: {
	            text: dataSet.chart.settings.subtitle,
	            floating: false,
	            align: 'left',
	            x: 0,
	            y: 30,
	            style:{ 
					color: '#74736c',
					font: '12px BentonSans, Arial, Helvetica, sans-serif',
					fontFamily: 'Arial',
					fontSize: '12px'
				}
	        },
	        xAxis:{
				lineColor: '#74736c',
				lineWidth: 1,
				tickColor: 'rgba(0,0,0,.15)',
				minPadding: 0.01, //this is the spacing of the drawn chart from the left-hand edge
				maxPadding: 250 / parseFloat(urlData.width) / 15, //.01, //this is the spacing of the drawn chart from right-hand edge
				tickPosition: 'inside',
				tickLength: -8,
				labels:{
					x:-2,
					y:20,
					style:{
						color: '#74736c',
						font: '10px BentonSans, Arial, Helvetica, sans-serif',
						fontFamily: 'Arial',
						fontSize: '10px'
					}
				}
			},
			yAxis: {
				title: '',
				min:dataSet.chart.settings.yAxis.min,
				max:dataSet.chart.settings.yAxis.max,
				startOnTick: true, //bottom
				offset: 26,
				tickLength: 26,
				tickWidth: 1,
				reversed: dataSet.reverseY,
	            endOnTick: dataSet.chart.settings.stretchgraph === true ? true : false, //top
				lineColor: 'rgba(0,0,0,.15)',
	        	tickColor: 'rgba(0,0,0,.15)',
	        	tickPosition: 'inside',
	        	gridLineColor: 'rgba(0,0,0,.15)',
	        	gridLineDashStyle: 'ShortDot',
				labels:{
	                align: 'left',
	                x: 0,
	                y: -2,
	                style:{
						color: '#74736c',
						font: '10px BentonSans, Arial, Helvetica, sans-serif',
						fontFamily: 'Arial',
						fontSize: '10px'
					}
	            }
			},
			plotOptions:{
				column:{
					stacking: dataSet.chart.settings.isStacking,
					borderWidth: 0,
					shadow: false,
					animation: false,
					series:{
						connectNulls: false
					}
				},	
				bar:{
					borderWidth: 0,
					shadow: false,
					animation: false,
					series:{
						connectNulls: false
					}
				},
				spline:{
					borderWidth: 4,
					bordercolor: '#fff1e0',
					shadow: false,
					lineWidth:3,
					series:{
						connectNulls: false,
						shadow:false,
						marker:{
							radius: 1,
						},
						states:{
							hover:{
								enabled: true,
								lineWidth: 2, //change this for multi-colored graphs
								halo:{
									size: 10
								}
							}
						}
					}
				},
				line:{
					borderWidth: 4,
					bordercolor: '#fff1e0',
					shadow: false,
					lineWidth:3,
					series:{
						connectNulls: false,
						shadow:false,
						marker:{
							radius: 1,
						},
						states:{
							hover:{
								enabled: true,
								lineWidth: 2, //change this for multi-colored graphs
								halo:{
									size: 10
								}
							}
						}
					}
				},
				pie:{
					lineWidth:1,
					slicedOffset:15,
					shadow:false,
					showInLegend:true,
					center: ['50%', '45%'],
					size: '85%',
					series:{
						showCheckbox: true,
					},
					dataLabels:{
						enabled: false,
						color: '#74736c',		
						softConnector: false,					
						connectorColor: '#74736c',
						style:{
							font: '12px BentonSans, Arial, Helvetica, sans-serif',
							fontFamily: 'Arial',
							fontSize: '12px'
						},	
					}
				}
			},
			legend:{
				enabled: dataSet.isSingleDataSet === true ? false : true,
				layout: 'vertical',
				backgroundColor: null,
				borderColor: 'rgba(0,0,0,0)',
				align: 'right',
				verticalAlign: 'middle',
				floating: false,
				shadow: false,
				padding: 10,
				symbolWidth: 30,
				itemMarginBottom: 10,
				itemMarginTop: 10,
				itemMarginBottom: 0,
				itemDistance: 0,
				itemStyle:{
					lineHeight: '14px',
					font: '10px BentonSans, Arial, Helvetica, sans-serif',
					fontFamily: 'Arial',
					fontSize: '10px',
					color: '#74736c'
				},
				itemHiddenStyle:{
					color: '#74736c'
				},
				itemHoverStyle:{
					color: '#4781aa'
				}
			},
			labels:{
				style:{
					color: '#74736c',
				}
			},
			tooltip:{
				style:{
					color: browser.type == 'Internet Explorer' && parseFloat(browser.version) < 9 ? dataSet.chart.settings.tooltip.ie8FontColor : dataSet.chart.settings.tooltip.fontColor, //#fff9f1 for hack to do dark background
					font: '12px Arial, Helvetica, sans-serif',
					fontFamily: 'Arial',
					fontSize: '12px'
				},
				backgroundColor: browser.type == 'Internet Explorer' && parseFloat(browser.version) < 9 ? dataSet.chart.settings.tooltip.ie8BackgroundColor : dataSet.chart.settings.tooltip.backgroundColor,
				borderColor: dataSet.chart.settings.tooltip.borderColor,
				borderRadius: 4,
				borderWidth: 0,
				shadow: true,
			}
		};
		
		var highchartsOptions = Highcharts.setOptions(Highcharts.theme);

		if(urlData.updatedText){
			$('body').append('<div id="updatedText" style="position:absolute; top:2px; color:#74736c; font-size:10px; font-family:BentonSans, Arial, Helvetica, sans-serif; font-style:italic;">Updated: ' + urlData.updatedText + '</div>');
			$('#updatedText').css('pointer-events','none').css('left', (parseInt(urlData.width) - ($('#updatedText').width() + 5)) + 'px');
		}
	}
		
	$('#' + htmlChartLocation).stop().animate({opacity: 1}, 
		250, function(){}
	)
}

if(/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ //test for MSIE x.x;
	var ieversion = new Number(RegExp.$1); // capture x.x portion and store as a number
	if(ieversion <= 9){
		browser.version = 8;
		browser.type = 'Internet Explorer';
		console = {};
		console.log = function(t){/* alert(t); */};
	}
}else{
	browser.type = 'Chrome';
}

if(document.URL.indexOf('?') > -1){	
	var str = document.URL.slice(document.URL.indexOf('?') + 1, document.URL.length).split('✈').join('%E2%9C%88');
	var arr = str.split('&');
	var isJSON = false;

	urlData.sourceloc = false;
	urlData.isPolar = false;
	
	for(var i = 0; i < arr.length; i++){
		if(arr[i].indexOf('g0r1a2p3h4t5y6p7e8') > -1){
			urlData.graphtype = arr[i].split('g0r1a2p3h4t5y6p7e8').join('').substring(1).split('%20').join(' ');
		}else if(arr[i].indexOf('i0s1p2o3l4a5r6=true') > -1){
			urlData.isPolar = true;
		}else if(arr[i].indexOf('t0i1t2l3e4') > -1){
			urlData.title = convertSpecialCharacters(arr[i].split('t0i1t2l3e4').join('').substring(1).split('%20').join(' '));
		}else if(arr[i].indexOf('y0a1x2i3s4') > -1){
			urlData.subtitle = convertSpecialCharacters(arr[i].split('y0a1x2i3s4').join('').substring(1).split('%20').join(' '));
		}else if(arr[i].indexOf('w0i1d2t3h4') > -1){
			urlData.width = arr[i].split('w0i1d2t3h4').join('').substring(1);			
		}else if(arr[i].indexOf('h0e1i2g3h4t5') > -1){
			urlData.height = arr[i].split('h0e1i2g3h4t5').join('').substring(1);
		}else if(arr[i].indexOf('s0o1u2r3c4e5t6e7x8t9') > -1){
			urlData.sourcetext = convertSpecialCharacters(arr[i].split('s0o1u2r3c4e5t6e7x8t9').join('').substring(1).split('%20').join(' '));
		}else if(arr[i].indexOf('s0o1u2r3c4e5l6o7c8') > -1){
			urlData.sourceloc = true;
		}else if(arr[i].indexOf('s0o1u2r3c4e5u6r7l8') > -1){
			urlData.sourceurl = arr[i].split('s0o1u2r3c4e5u6r7l8').join('').substring(1);
		}else if(arr[i].indexOf('s0t1r2e3t4c5h6') > -1){
			//urlData.stretchgraph = Boolean(arr[i].split('stretch').join('').substring(1));
		}else if(arr[i].indexOf('f0e1e2d3') > -1){
			dataURL = arr[i].split('f0e1e2d3').join('').substring(1);
			dataURL = 'http://api.stlouisfed.org/fred/series/observations?series_id=' + arr[i].split('f0e1e2d3').join('').substring(1) + '&api_key=147e280bf158656f15b498dcf66aac3f';
			//console.log(dataURL);
		}else if(arr[i].indexOf('u0p1d2a3t4e5d6') > -1){
			urlData.updatedText = convertSpecialCharacters(arr[i].split('u0p1d2a3t4e5d6').join('').substring(1).split('%20').join(' '));
		}else if(arr[i].indexOf('r0e1a2l3t4i5m6e7_8s9t0a1r2t3') > -1){
			var date = arr[i].split('r0e1a2l3t4i5m6e7_8s9t0a1r2t3').join('').substring(1);
			var dateArray = date.split('-');

			if(date == '.'){
				date = null;
			}else{
				date = Date.parse(dateArray[1] + '/' + dateArray[2] + '/' + dateArray[0]);
				//console.log(date);
			}

			urlData.startDate = date;
		}else if(arr[i].indexOf('r0e1a2l3t4i5m6e7_8e9n0d1') > -1){
			var date = arr[i].split('r0e1a2l3t4i5m6e7_8e9n0d1').join('').substring(1);
			var dateArray = date.split('-');

			if(date == '.'){
				date = null;
			}else{
				date = Date.parse(dateArray[1] + '/' + dateArray[2] + '/' + dateArray[0]);
				//console.log(date);
			}

			urlData.endDate = date;
		}else if(arr[i].indexOf('g0u1n2i3t4b') > -1){
			urlData.unitsBefore = convertSpecialCharacters(arr[i].split('g0u1n2i3t4b').join('').substring(1));
		}else if(arr[i].indexOf('g0u1n2i3t4a') > -1){
			urlData.unitsAfter = convertSpecialCharacters(arr[i].split('g0u1n2i3t4a').join('').substring(1));
		}else if(arr[i].indexOf('u0s1e2r3d4a5t6a7') > -1){
			urlData.data = convertSpecialCharacters(arr[i].split('u0s1e2r3d4a5t6a7').join('').substring(1));
			urlData.data = $.parseJSON(urlData.data);
		}else if(arr[i].indexOf('y0q1l2') > -1){
			isJSON = true;
		}else if(arr[i].indexOf('s0i1n2g3l4e5D6a7t8a9S0e1t2') > -1){
			urlData.isSingleDataSet = (arr[i].split('s0i1n2g3l4e5D6a7t8a9S0e1t2').join('').substring(1) === 'true');
		}else if(arr[i].indexOf('r0e1v2e3r4s5e6y7') > -1){
			urlData.reverseY = (arr[i].split('r0e1v2e3r4s5e6y7').join('').substring(1) === 'true');
		}
	}

	if(!urlData.graphtype){
		urlData.graphtype = 'spline';
	}

	if(!isJSON){
		$.getJSON('http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent("select * from xml where url='" + dataURL + "'") + '&format=json&diagnostics=true&callback=?', function(ds){}).success(processData);
	}else{
		//console.log('JSON');
		//console.log(urlData.data);

		var d = urlData;
			d.observations = urlData.data;

		//console.log(d);

		processData(d);
	}
}else{
	$('#chart').remove();
	$('.content').append('<div>No feed specified</div>');
}

function sourcePosition(t, l){
	return t && !l ? {align: 'left', x: 5, verticalAlign: 'bottom', y: -3} : {align: 'right', x: -5, verticalAlign: 'top', y: 18};
}

function captureChart(){
	highchart.exportChart({scale:1, type:'image/png'});
}

function convertSpecialCharacters(s){
	return s.split('%C2%A3').join('£')
			.split('[$pound]').join('£')
			.split('%E2%82%AC').join('€')
			.split('[$euro]').join('€')
			.split('%C2%A5').join('¥')
			.split('[$yen]').join('¥')
			.split('%C2%A2').join('¢')
			.split('[$cent]').join('¢')
			.split('[$amperand]').join('&')
			.split('%3C').join('<')
			.split('[$lessthan]').join('<')
			.split('%3E').join('<')
			.split('[$greaterthan]').join('<')
			.split('%C2%A9').join('©')
			.split('[$copyright]').join('©')
			.split('%C2%AE').join('®')
			.split('[$registeredtrademark]').join('®')
			.split('%E2%84%A2').join('™')
			.split('[$trademark]').join('™')
			.split('%C2%B0').join('°')
			.split('[$degree]').join('°')
			.split('%C2%B5').join('µ')
			.split('[$micro]').join('µ')
			.split('%20').join(' ')
			.split('%E2%9C%88').join('"')
			.split('%27').join("'")
			;
}

function chartLoaded(chart){
	//console.log('chart has loaded');
	//console.log('drawing stuff');

	/*
	chart.renderer.path(['M', 0, 0, 'L', 100, 100, 200, 50, 300, 100])
		.attr({
			'stroke-width': 1,
			stroke: 'red'
		}).add();
	*/

	$('.highcharts-axis:eq(1)').children().attr('stroke-dasharray', '1,1');

	if(!urlData.reverseY){
		$('.highcharts-axis:eq(1)').children('path:last-child').attr('stroke-dasharray', '').css('stroke', '#74736c').attr('stroke-opacity',1);
	}
}

function interpretDate(d){ // yyyy/mm/dd or yyyy/mm or mm/dd/yyyy
	var p = d.split('/');

	if(p.length > 2){ //full date
		if(p[2].length === 4){
			d = months[Number(p[0]) - 1] + ' ' + p[1] + ', ' + p[2]; //month, day, year
		}else{
			d = months[Number(p[1]) - 1] + ' ' + p[2] + ', ' + p[0]; //year, month, day
		}
	}else if(p.length === 2){ //year and month
		d = months[Number(p[1]) - 1] + ' ' + p[0];
	}

	return d;
}