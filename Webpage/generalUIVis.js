//All global hardcoded variables:
var visualisations = ["Sankey" , "HEB" , "MSV" , "Gestalt"];
var index = 0;

function AddVisualisationBlock(){
    //Check if dataset is loaded (only works because this file is directely loaded into dbl_vis.php!!!)
    if (localStorage.getItem('DataSet') == 'null') {
        console.log("Please load a dataset first!");
        return
    }

    console.log("add new block! name = vis" + index);
    let mainBlock = d3.select("#visContent");
    let newVisBlock = mainBlock.append("div")
                               .attr("id" , "vis" + index)
                               .attr("class" , "visField")
                               .style("height" , "800px");
    CreateVisField("vis" + index); 
           
    index += 1;                
}

//A function handling the creationg of new visualisation fields:
			//Input:
			//Changes:
function CreateVisField(fieldName){
//Decide what type of visualisation the user wants to use (in this specific div). 
	var vis = d3.select("#" + fieldName);
							
	var upperbar = vis.append("div")
						   .attr("class" , "upperVisBox")
						   .attr("float" , "left")
						   .attr("id" , "upperbar");

	//define ('hardcode') the possible visualisations:	
    let select = upperbar.append("select")
						 .attr("id" , "selector" + fieldName)				 
						 .attr("class" , "selectorUI")
						 .attr("onchange" , "OnChangeSelect("+ "'"  + fieldName + "'" +")");
	
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
function OnChangeSelect(fieldName){
    
    //First clean html:
    d3.select("#" + fieldName).selectAll("svg").remove();
    d3.select("#" + fieldName).selectAll(".tooltip").remove();	
    d3.select("#" + fieldName).selectAll("#sankeyID").remove();
    d3.select("#" + fieldName).selectAll("#hebUIBox").remove();
    d3.select("#" + fieldName).selectAll("#MSVID").remove();

    //Now add new visualisation:	
    selectValue = d3.select("#" + fieldName).select('select').property('value');
    if (selectValue == "Sankey") {
        makeSankey(localStorage.getItem('DataSet') , fieldName);
    } 
    else if (selectValue == "HEB") {
        /*TO THOMAS&BAS: hier zetten wij jullie UI weg, wil je deze later weghalen uit het bestand, aanpassen, of iets aan toevoegen? Doe dat hier!
        
        Deze UI elementen worden in de "upperbar" gezet. Dit is een flex element wat bovenin de visualisation box zit.
        (zie documentation over de general UI handling voor meer info) */
        console.log("test");
        d3.select("#" + fieldName).append('div').attr("id", "HEBFigure");
        let hebUIBox = d3.select('#' + fieldName).select("#upperbar").append('div').attr("id" , "hebUIBox");
        hebUIBox.html('<span> From (year-month) </span>' +
                      '<input id="startYear" class="yearInput" type="number" name="startYear" placeholder=1998>' + 
                      '<input id="startMonth" class="monthInput"  type="number" name="startMonth" placeholder=01>' +
                      '<span> to (year-month) </span>' + 
                      '<input id="endYear" class="yearInput" type="number" name="endYear" placeholder=2002>' + 
                      '<input id="endMonth" class="monthInput type="number" name="endMonth" placeholder=12>' + 
                      '<div>' +
                        '<input id="animateToggle" class="animToggle" type="checkbox">' +
                        '<label for="animateToggle"> animation </label>' +
                        '<button id="startHEB" type="button" name="HEB" onclick="makeHEB(localStorage.getItem(' + "'DataSet'" + ') ,' + "'" + fieldName + "'"   + ' )"> Start </button>' +
                        '<label for="startHEB" class="startButton HEBButtons"> Start </label>' + 
                      '</div>' + 
                      '<button id="togglePause" type="button" name="togglePause"> Play </button>' +
                      '<label for="togglePause" class="pauseButton HEBButtons"> Play </label>' + 
                      '<label for="togglePause" id="pauseIcon" class="fa fa-play"></label>' + 
                      '<label for="strengthSlider" class="inputLabel"> Bundle strength </label>' + 
                      '<input id="strengthSlider" class="strengthSlider" type="range" name="strengthSlider" min="0.00" max="1.00" value="0.85" step="0.05">' + 
                      '<label for="edgeColor" class="inputLabel"> Edge color </label>' +
                      '<select id="edgeColor" class="edgeColor" name="edgeColor">' + 
                        '<option value="none"> None </option>' + 
                        '<option value="gradient"> From-to </option>' + 
                        '<option value="sentiment"> Sentiment </option>' +
                      '</select>' 
                      );
    }
    else if(selectValue == "MSV"){
        console.log(fieldName)
        makeMSV(localStorage.getItem('DataSet'), fieldName);
    }
    else {
        console.log('Sorry! We were unable to load the correct visualisation. Please submit this bug.');
    }
}

