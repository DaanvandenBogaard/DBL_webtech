//All global hardcoded variables:
var visualisations = ["Sankey" , "HEB" , "MSV" , "Gestalt"];
var index = 0;

//A function handling the creationg of new visualisation fields:
			//Input:
			//Changes:
function CreateVisField(fieldName){
//Decide what type of visualisation the user wants to use (in this specific div). 
	console.log(fieldName);		
	var vis = d3.select("#" + fieldName);
	var innervis = vis.append("div")
					  .attr("id" , "localBox");								
	var upperbar = innervis.append("div")
						   .attr("class" , "upperVisBox")
						   .attr("float" , "left")
						   .attr("id" , "upperbar");

	//define ('hardcode') the possible visualisations:	
    let select = upperbar.append("select")
						 .attr("id" , "selector" + fieldName)				 
						 .attr("class" , "selectorUI")
						 .attr("onchange" , "onChangeSelect("+ "'"  + fieldName + "'" +")");
	
    //Must be defined again as we define it here as a DOM element!
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
    //Check if dataset is loaded (only works because this file is directely loaded into dbl_vis.php!!!)
    if (localStorage.getItem('DataSet') == 'null') {
        console.log("Please load a dataset first!");
        return
    }
    
    //First clean html:
    d3.select("#" + fieldName).selectAll("svg").remove();
    d3.select("#" + fieldName).selectAll(".tooltip").remove();	
    d3.select("#" + fieldName).selectAll("#sankeyID").remove();

    //Now add new visualisation:	
    selectValue = d3.select("#" + fieldName).select('select').property('value');
    if (selectValue == "Sankey") {
        makeSankey(localStorage.getItem('DataSet') , fieldName);
    } 
    else if (selectValue == "HEB") {
        /*TO THOMAS&BAS: hier zetten wij jullie UI weg, wil je deze later weghalen uit het bestand, aanpassen, of iets aan toevoegen? Doe dat hier!
        
        Deze UI elementen worden in de "upperbar" gezet. Dit is een flex element wat bovenin de visualisation box zit.
        (zie documentation over de general UI handling voor meer info) */
        d3.select('#' + fieldName).select("#upperbar").html('<span> From (year-month) </span><input id="startYear" type="number" name="startYear" default=1998><input id="startMonth" type="number" name="startMonth" default=01><span> to (year-month) </span><input id="endYear" type="number" name="endYear" default=2002><input id="endMonth" type="number" name="endMonth" default=12><div><input id="animateToggle" type="checkbox"><label for="animateToggle"> animation </label><button id="startHEB" type="button" name="HEB" onclick="makeHEB(localStorage.getItem(' + "'DataSet'" + '))"> Start </button></div><button id="togglePause" type="button" name="togglePause"> Play </button><label for="togglePause" id="pauseIcon" class="fa fa-play"></label><div id="HEBFigure"> </div>');
    }
    else {
        console.log('Sorry! We were unable to load the correct visualisation. Please submit this bug.');
    }
}

function AddVisualisationBlock(){
    console.log("add new block! name = vis" + index);
    let mainBlock = d3.select("#pageContent");
    let newVisBlock = mainBlock.append("div")
                               .attr("id" , "vis" + index)
                               .attr("class" , "visField");
    CreateVisField("vis" + index); 
           
    index += 1;                
}
