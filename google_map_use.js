var map;
var successNumber;
var geocoder;
var resultList = [];

// 提交csv文件
function submitQuery()
{
	var files = $('input[name="inputCSV"]').prop('files');
	handleFiles(files);
}

// 生成json文件
function toJSONFile()
{
	debug(resultList);
}

function debug(obj)
{
	var data = JSON.stringify(obj);
	var url = 'data:text/json;charset=utf8,' + encodeURIComponent(data);
	window.open(url, '_blank');
	window.focus();
}

// 载入json文件
function loadJSONFile()
{
	$.getJSON('result.json', function(response){
		resultList = response;
	})
	.error(function() { alert("error"); })
		.complete(function() { alert("complete"); });
}

function getMyPoints()
{
	var ret = [];
	for (var i = 0; i < resultList.length; i++)
	{
		if (resultList[i].status != "OK") continue;
		var location = resultList[i].location;
		var latlng = new google.maps.LatLng(location.lat, location.lng);
		ret.push({location:latlng, weight:10});
		var marker = new google.maps.Marker({
			position: location,
			map: map
		});
		console.log(i + " " + location.lat + " , " + location.lng + " " + marker);
	}
	return ret;
}

// 标记位置
function markLocations()
{
	var heatmapData = getMyPoints();
	alert(heatmapData.length);
	var heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatmapData,
		map: map
	});
	heatmap.set('radius', 50);
}

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		center: {lat: 22.301, lng: 114.166 },
		//		mapTypeId: google.maps.MapTypeId.SATELLITE,
	});
	geocoder = new google.maps.Geocoder();
}

function worker(address, carId) {
	return function() {
		geocodeAddress(address, carId);
	}
}
function handleFiles(files)
{
	if (files.length > 0)
	{
		var file = files[0];
		var gap_time = 10000;
		Papa.parse(file, {
			complete: function(results) {
				var data = results.data;
				var column = data[0].length;
				for (var i = 1; i < data.length; i++) {
					if (column == data[i].length) {
						var address = data[i][4], carId = data[i][9];
						setTimeout(worker(address, carId), i * gap_time);
					}
				}
			}
		});
	}
}

function geocodeAddress(address, carId) {
	geocoder.geocode({'address': address}, function(results, status) {
		if (status === google.maps.GeocoderStatus.OK) {
			successNumber = successNumber + 1;
			var location = results[0].geometry.location;
			resultList.push({address: address, location:location, status:status});
			console.log(address + " : " + location);
		} else if (status != google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
			resultList.push({address: address, location:"", status:status});
			console.log(address + " : error " + status);
		} else console.log("OVER_QUERY_LIMIT!!!");
	});
}
