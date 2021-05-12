<!DOCTYPE html>
<html>
	<script>
		//All global hardcoded variables:
		var visualisations = ["Sankey" , "HEB" , "MSV" , "Gestalt"];
	</script>
	<head>
		<meta charset="utf-8" />
		<meta name="viewpoint" content="width=device-width, initial-scale=1.0" />
		<link rel="stylesheet" type="text/css" href="dbl.css" />
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
		<script src="https://d3js.org/d3.v6.min.js"></script>
		<script src="Webpagecode.js"></script>
		<title> dbl/visualisation </title> 
		<script src="D3Functions.js"></script>
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

		<!--Sidebar-->
		<div id="sidebar", class="sidebar">
			<div class="fa fa-bars" id=toggle style="font-size: 36px;" onclick="toggleSidebar()">  </div>
			<hr class="line" id="line">
			<a href="dbl_home.html" class="fa fa-home" style="font-size:36px;"> <span class="sideText" id="sideTextHome" style="visibility: hidden;"> Home </span> </a>
			<a href="dbl_vis.php" class="fa fa-pie-chart" id="selected" style="font-size:36px;"> <span class="sideText" id="sideTextVis" style="visibility: hidden;"> Visualisation </span> </a>
			<a href="dbl_about.html" class="fa fa-info-circle" style="font-size:36px;"> <span class="sideText" id="sideTextAbout" style="visibility: hidden;"> About </span> </a>
		</div>
		
		<!--Toolbox-->
		<div id="toolbar" class="toolbar">
			<button> test </button>
		</div>
		<div class="fa fa-angle-down" id="tooltoggle" onclick="toggleToolbar()"> <span class="tooltext"> Toolbar </span> </div>	

		<!--pagecontent-->
		<div id="pageContent" class="pageContent">

			<!--temp text-->
		<div id = "upload">
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
		</div>
			<div id = "Vis1" class = "visField"> </div>
			<div id = "Vis2" class = "visField"> </div>
			<!--Visualisation-->
			<!-- Imports Sankey -->
			<script src="https://unpkg.com/d3-array@1"></script>
			<script src="https://unpkg.com/d3-collection@1"></script>
			<script src="https://unpkg.com/d3-path@1"></script>
			<script src="https://unpkg.com/d3-shape@1"></script>
			<script src="https://unpkg.com/d3-sankey@0"></script>
			<script src="https://unpkg.com/d3-simple-slider"></script>
			<script src="https://d3js.org/d3-dispatch.v2.min.js"></script>
			<script src="https://d3js.org/d3-selection.v2.min.js"></script>
			<script src="https://d3js.org/d3-drag.v2.min.js"></script>
			<script src= "SankeyDiagram.js"></script>

			
			<script> 
			if (localStorage.getItem('DataSet') != 'null') {
				var uploadHTML = d3.select("#upload");
				uploadHTML.style("display" , "none");
				CreateVisField('Vis1');
				CreateVisField('Vis2');
			}

			//A function handling the creationg of new visualisation fields:
			//Input:
			//Changes:
			function CreateVisField(fieldName){
				//Decide what type of visualisation the user wants to use (in this specific div). 
				
				var vis = d3.select("#" + fieldName);
				var innervis = vis.append("div")
									.attr("id" , "sankeyID");								
				var upperbar = innervis.append("div")
										.attr("class" , "upperVisBox")
										.attr("float" , "left")
										.attr("id" , "upperbar");

				//define ('hardcode') the possible visualisations:
			
				let select = upperbar.append("select")
									 .attr("id" , "selector" + fieldName)				 
								 	 .attr("class" , "test")
									 .attr("onchange" , "onChangeSelect("+ "'"  + fieldName + "'" +")");
								
				var selector = document.getElementById("selector" + fieldName);
				visualisations.forEach(function(d){
					let newOption = document.createElement("option");
					newOption.text = d;
					selector.add(newOption);
				});

				//set invisible option:					
				select.append("option")
					  .attr("selected" , "true")
					  .attr("hidden" , "true")
					  .text("Choose a visualisation");		
			
			}

			//A function handling the change of option for visualisations.
			function onChangeSelect(fieldName){
				//First clean html:
				d3.select("#" + fieldName).selectAll("svg").remove();
				d3.select("#" + fieldName).selectAll(".tooltip").remove();	

				//Now add new visualisation:	
				selectValue = d3.select("#" + fieldName).select('select').property('value');
				if (selectValue == "Sankey") {
					makeSankey(localStorage.getItem('DataSet') , fieldName);
				} 
			}
			</script>
			
		</div>
	</body>
</html>