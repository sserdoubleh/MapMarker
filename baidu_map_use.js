var map = null;
var mapv = null;
var geocoder = null;
var layer = null;
var gap_time = 2000;
var point_list = [];
var results = [];
var old_results = [];
var opened = false;

function initMap() {
	map = new BMap.Map("map");
	map.centerAndZoom(new BMap.Point(114.166, 22.301), 13);
	geocoder = new BMap.Geocoder();
	map.enableScrollWheelZoom(true);

	mapv = new Mapv({
		drawTypeControl: true,
		 map: map
	});
}

window.onload = function() {
	initMap();
}

// 提交csv文件
function loadCSVFile()
{
	var files = $('input[name="inputCSV"]').prop('files');
	handleCSVFiles(files);
}

// 生成json文件
function toJSONFile()
{
	var data = JSON.stringify(results);
	var url = 'data:text/json;charset=utf8,' + encodeURIComponent(data);
	window.open(url, '_blank');
	window.focus();
}
function appendResults(new_results) {
	results = results.concat(new_results);
	changeLayer(layer != null);
	alert("JSON update ok! Now have " + results.length + " itmes.");
}

// 从服务器载入json文件
function loadJSONFileFromSever(file_name, show)
{
	$.getJSON(file_name, function(response){
		appendResults(response);
		if (show) markLocations();
	}).error(function() { alert("error"); })
	.complete(function() { alert("complete"); });
}

// 从客户端载入json文件
function loadJSONFile()
{
	var files = $('input[name="inputJSON"]').prop('files');
	handleJSONFiles(files);
}

function loadSample()
{
	loadJSONFileFromSever("sample.json", false);
}

function getPointSets()
{
	var point_sets = [];
	results.forEach(function(item) {
		if (item.status != "OK") return;
		var is_exist = false;
		var point = new BMap.Point(item.location.lng, item.location.lat);
		point_sets.forEach(function(server_points) {
			if (item.car_id == server_points.car_id) {
				is_exist = true;
				server_points.data.push(point);
			}
		});
		if (!is_exist) {
			point_sets.push({car_id: item.car_id, data:[point]});
		}
	});
	return point_sets;
}

function getRandomColor() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

var index = 0;
var address_list;
var car_id_list;
function handleCSVFiles(files)
{
	if (files.length == 0) {
		alert("No csv file!");
		return;
	}
	var file = files[0];

	address_list = [];
	car_id_list = [];
	Papa.parse(file, {
		complete: function(results) {
			var data = results.data;
			var column = data[0].length;
			for (var i = 1; i < data.length; i++) {
				if (column == data[i].length) {
					var address = "";
					var car_id = data[i][9];
					for (var j = 0; j < data[i][4].length; j++) {
						if (data[i][4][j] == '(') break;
						address = address + data[i][4][j];
					}
					address_list.push(address);
					car_id_list.push(car_id);
				}
			}
			alert("CSV file upload ok!");
		}
	});
	index = 0;
}

function handleJSONFiles(files)
{
	if (files.length == 0) {
		alert("No json file!");
		return;
	}
	var file = files[0];

	var reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function(){
		var text = reader.result;
		appendResults(JSON.parse(text));
	};
}

function baiduGEO()
{
	if (index == address_list.length) {
		alert("Search over!");
		return;
	}
	var address = address_list[index];
	var car_id = car_id_list[index];
	geocodeSearch(address, car_id);
	index++;
}

function geocodeSearch(address, car_id)
{
	geocoder.getPoint(address, function(point){
		if (point) {
			console.log(index + " : " + address + " ok!");
			point_list.push({
				location:point,
				carid:car_id,
			});
			results.push({
				address:address,
				location:point,
				car_id:car_id,
				status:"OK",
			});
		}
	});
	setTimeout(baiduGEO, gap_time);
}

// function markLocationsByRandom()
// {
// 	if (document.createElement('canvas').getContext) {
// 		if (!opened) {
// 			var point_sets = getPointSets();
// 			point_sets.forEach(function(server_points) {
// 				var options = {
// 					size: BMAP_POINT_SIZE_BIG,
// 				shape: BMAP_POINT_SHAPE_STAR,
// 				color: getRandomColor(),
// 				};
// 				var pointCollection = new BMap.PointCollection(server_points.data,
// 					options);
// 				map.addOverlay(pointCollection);
// 			});
// 			opened = true;
// 		} else {
// 			map.clearOverlays();
// 			map.closeInfoWindow();
// 			opened = false;
// 		}
// 	}
// }

// 标记位置
function changeLayer(have)
{
	var point_sets = getPointSets();
	var total = 0;
	var data = [];
	var splitList = {};
	point_sets.forEach(function(server_points) {
		splitList[server_points.car_id] = randomColor();
		server_points.data.forEach(function(point) {
			data.push({
				lng: point.lng,
				lat: point.lat,
				count: server_points.car_id
			});
		});
		total++;
	});

	if (have) {
		layer.setData(data);
		layer.setDrawOptions({
			size: 5,
			splitList: splitList,
		});
	} else {
		layer = new Mapv.Layer({
			mapv: mapv,
			zIndex: 1,
			dataType: 'point',
			drawType: 'category',
			data: data,
			drawOptions: {
				size: 5, splitList: splitList
			},
		});
	}

	opened = true;
}

function markLocations()
{
	if (!opened) {
		if (layer == null) {
			changeLayer(false);
		} else {
			layer.canvasLayer.show();
			layer.dataRangeControl.show();
			opened = true;
		}
	}
}
function closeLocations()
{
	if (opened) {
		if (layer != null) {
			layer.canvasLayer.hide();
			layer.dataRangeControl.hide();
			opened = false;
		}
	}
}
