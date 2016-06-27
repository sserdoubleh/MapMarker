<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
		<link rel="stylesheet" type="text/css" href="user.css"/>
		<script type="text/javascript" src="http://api.map.baidu.com/api?v=2.0&ak=pBLCTGR9KCTucqkU61XlHI9L"></script>
		<script type="text/javascript" src="http://api.map.baidu.com/library/Heatmap/2.0/src/Heatmap_min.js"></script>
		<script type="text/javascript" src="Mapv.js"></script>
		<script type="text/javascript" src="jquery.min.js"></script>
		<script type="text/javascript" src="papaparse.js"></script>
		<script type="text/javascript" src="random_color.js"></script>
		<script type="text/javascript" src="baidu_map_use.js"></script>
		<title>地址解析</title>
	</head>
	<body>
		<div id="floating-panel1">
			选择csv文件:
			<input name="inputCSV" type="file">
			<button onclick=loadCSVFile()>提交</button>
			<button onclick=baiduGEO()>开始搜索!</button>
			<button onclick=toJSONFile()>生成json文件</button>
		</div>
		<div id="floating-panel2">
			选择json文件:
			<input name="inputJSON" type="file">
			<button onclick=loadJSONFile()>提交</button>
			<br/>
			<button onclick=markLocations()>显示标记</button>
			<button onclick=closeLocations()>隐藏标记</button>
			<button onclick=loadSample()>导入测试样本</button>
		</div>
		<div id="map"></div>
	</body>
</html>
