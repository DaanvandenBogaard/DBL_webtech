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
    //First clean html:
    d3.select("#" + fieldName).selectAll("svg").remove();
    d3.select("#" + fieldName).selectAll(".tooltip").remove();	
    d3.select("#" + fieldName).selectAll("#sankeyID").remove();

    //Now add new visualisation:	
    selectValue = d3.select("#" + fieldName).select('select').property('value');
    if (selectValue == "Sankey") {
        makeSankey(localStorage.getItem('DataSet') , fieldName);
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
