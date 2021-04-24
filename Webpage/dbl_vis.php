<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta name="viewpoint" content="width=device-width, initial-scale=1.0" />
		<link rel="stylesheet" type="text/css" href="dbl.css" />
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
		<script src="https://d3js.org/d3.v6.min.js"></script>
		<script src="Webpagecode.js"></script>
		<title> dbl/visualisation </title> 
		
	</head>
	<body>	
	
    <?php 
    #Load localstorage:
    if (isset($_GET["DataSet"])){
		$filename = $_GET["DataSet"];
        #Set file name into local storage (needs to happen in JS):
        echo "<script type='text/javascript'>  
        localStorage.setItem('DataSet', '".$filename."'); 
        </script>";
    }
    ?>

		<div id="sidebar", class="sidebar">
			<div class="fa fa-bars" id=toggle style="font-size: 36px;" onclick="toggleSidebar()">  </div>
			<hr class="line" id="line">
			<a href="dbl_home.html" class="fa fa-home" style="font-size:36px;"> <span class="sideText" id="sideTextHome" style="visibility:hidden;"> Home </span> </a>
			<a href="dbl_vis.php" class="fa fa-pie-chart" id="selected" style="font-size:36px;"> <span class="sideText" id="sideTextVis" style="visibility:hidden;"> Visualisation </span> </a>
			<a href="dbl_about.html" class="fa fa-info-circle" style="font-size:36px;"> <span class="sideText" id="sideTextAbout" style="visibility:hidden;"> About </span> </a>
		</div>
		
		<div id="pageContent" class="pageContent">

		<p class="title">Visualisation</p>
		<p>Upload a dataset to start the visualisation</p>

		<!--Upload/replace dataset: -->
		<form action="upload.php" method="POST" enctype="multipart/form-data" >
			<input id="file_input" type="file" name="dataset" accept=".csv" onchange="changeLabel()">
			<label id="upload_button" for="file_input">
				<i class="fa fa-upload" id="upload_icon" style="font-size: 20px;"></i>
				Upload dataset
			</label>
			<span id="file_chosen"> Choose a file (.csv) </span>
			<button id="submit_file" type="submit" name="submit"> Submit </button>
		</form>


		<!--Visualisation-->
		<script src="D3Functions.js"></script>
		<script>

		</script>

		<svg id="SVG1" height="400px" , width="800px"></svg>
		
		</div>
	</body>
</html>