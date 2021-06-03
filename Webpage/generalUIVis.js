//All global hardcoded variables:
var visualisations = ["Sankey" , "HEB" , "MSV" , "Gestalt"];
var index = 0;

//A function to handle the choosing of uploaded datasets:
//Input: JSON string of the datasets
//Output: A button appended to the toolbar.
function MakeDataSetSelector(dataSets) {
    //Retrieve info on user datasets:
    dataSets = JSON.parse(dataSets);
    
    //First, we check whether there is a curdataset, if not, we select one:
    if (RetrieveLocalStorage("CurDataSet") == "null") {
        ChangeLocalStorage("CurDataSet", dataSets[0]);
    }

    let select = d3.select("#toolbar")
                   .append("select")
                   .attr("id" , "DataSetSelector")
                   .attr("onchange" , "OnChangeDataSetSelector()");
                   
    //Append options:
    var selector = document.getElementById("DataSetSelector");
    let newOption = document.createElement("option");
    newOption.text = RetrieveLocalStorage("CurDataSet");
    selector.add(newOption);
    dataSets.forEach(function(d){ 
        if(d != RetrieveLocalStorage("CurDataSet")){
            let newOption = document.createElement("option");
            newOption.text = d;
            selector.add(newOption);
        }
    }); 
}

//ActionListener for DataSetSelector:
function OnChangeDataSetSelector() {
    //Call function in main file to change this value as we are not allowed to edit this form this file!
    DataSetSwitch(document.getElementById("DataSetSelector").value);
}

//Changelisterner of close buttons:
function changeListenerFunction(name){
    d3.select("#" + name).remove();
}

function AddVisualisationBlock() {
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
    newVisBlock.style("position","absolute").attr("x", 0).attr("y",0);
    CreateVisField("vis" + index); 
      
    //Use JQuery to have the blocks be draggable:
    console.log("added UI JQuery!");
    
    $( function() {
        $( "#vis" + index ).draggable({snap: true , stack: ".visField"});
      } ); 

    //Add the resizeable effect:
    $( function() {
        $( "#vis" + index ).resizable();
      } );

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

    //Add close button to upperbar:
    var closeButton = upperbar.append("button")
                              .style("width" , "50px")
                              .style("height" , "50px")
                              .attr("onclick" , "changeListenerFunction('"+fieldName +"')"
                              );

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
        makeSankey(localStorage.getItem('CurDataSet') , fieldName);
    } 
    else if (selectValue == "HEB") {
        /*TO THOMAS&BAS: hier zetten wij jullie UI weg, wil je deze later weghalen uit het bestand, aanpassen, of iets aan toevoegen? Doe dat hier!
        
        Deze UI elementen worden in de "upperbar" gezet. Dit is een flex element wat bovenin de visualisation box zit.
        (zie documentation over de general UI handling voor meer info) */
        console.log("test");
        d3.select("#" + fieldName).append('div').attr("id", "HEBFigure");
        let hebUIBox = d3.select('#' + fieldName).select("#upperbar").append('div').attr("id" , "hebUIBox");

        hebUIBox.html('<span> From (year-month) </span>' +
                      '<input id="startYear" type="number" name="startYear" default=1998>' + 
                      '<input id="startMonth" type="number" name="startMonth" default=01>' +
                      '<span> to (year-month) </span>' + 
                      '<input id="endYear" type="number" name="endYear" default=2002>' + 
                      '<input id="endMonth" type="number" name="endMonth" default=12>' + 
                      '<div>' +
                        '<input id="animateToggle" type="checkbox">' +
                        '<label for="animateToggle"> animation </label>' +
                        '<button id="startHEB" type="button" name="HEB" onclick="makeHEB(localStorage.getItem(' + "'CurDataSet'" + ') ,' + "'" + fieldName + "'"   + ' )"> Start </button>' + 
                      '</div>' + 
                      '<button id="togglePause" type="button" name="togglePause"> Play </button>' +
                      '<label for="togglePause" id="pauseIcon" class="fa fa-play"></label>' + 
                      '<input id="strengthSlider" type="range" name="strengthSlider" min="0.00" max="1.00" value="0.85" step="0.05">' + 
                      '<label for="strengthSlider"> Bundle strength </label>' + 
                      '<select id="edgeColor" name="edgeColor">' + 
                        '<option value="none"> None </option>' + 
                        '<option value="gradient"> From-to </option>' + 
                        '<option value="sentiment"> Sentiment </option>' +
                      '</select>' 
                      );
    }

    else if(selectValue == "MSV"){
        console.log(fieldName)
        makeMSV(localStorage.getItem('CurDataSet'), fieldName);
    }
    else {
        console.log('Sorry! We were unable to load the correct visualisation. Please submit this bug.');
    }
}

//Function handling the functional aspects of the general time manager.
function MakeGeneralTimeManager(dataset){
    //Retrieve date range from curent dataset:
    d3.csv(dataset).then(function(data) {
      //convert to numbers:
      data.forEach(function(d) {
        d.fromId = +d.fromId; 
        d.sentiment = +d.sentiment;
        d.toId = +d.toId; 
  
        //Add the d.time to get a representative variable for slicing:
        let timeData = d.date.split("-");
        d.year = +timeData[0];
        d.month = +timeData[1];
        d.day = +timeData[2];
      });
  
      //now, find min and max dates:
      //We take the maximum (safe) integers in order to make sure our comparisons will pass all tests.
      let minDay = Number.MAX_SAFE_INTEGER;
      let minMonth = Number.MAX_SAFE_INTEGER;
      let minYear = Number.MAX_SAFE_INTEGER;
      //Similairly, we take the minimum (safe) integers for the max:
      let maxDay = Number.MIN_SAFE_INTEGER;
      let maxMonth = Number.MIN_SAFE_INTEGER;
      let maxYear = Number.MIN_SAFE_INTEGER; 
  
      data.forEach(function(d) {
        //Check for minimum
        //Check years:
        if (d.year < minYear) {
          minYear = d.year;
          //Check months:
          if (d.month < minMonth) {
            minMonth = d.month;
            //Check days:
            if (d.day < minDay) {
              minDay = d.day;
            }
          }
        }
  
        //Check for maximum
        //Check years:
        if (d.year > maxYear) {
          maxYear = d.year;
          //Check months:
          if (d.month > maxMonth) {
            maxMonth = d.month;
            //Check days:
            if (d.day > maxDay) {
              maxDay = d.day;
            }
          }
        }
      });
      
      //Load the HTML elements:
      let fromField = document.getElementById("fromTime");
      let toField = document.getElementById("toTime");

      $( function() {
        var dateFormat = "dd/mm/yy",
          from = $( "#fromTime" )
            .datepicker({
              dateFormat : "d M, y" ,
              defaultDate: new Date(minYear, minMonth, minDay),
              changeMonth: true,
              numberOfMonths: 1,
              minDate: new Date(minYear, minMonth, minDay), 
              maxDate: new Date(maxYear, maxMonth, maxDay),
              showAnim: "fadeIn",
              setDate: $.datepicker.formatDate('d M y', new Date(minYear, minMonth, minDay))
            })
            .on( "change", function() {
              to.datepicker( "option", "minDate", fromField.value );
              AlertVisualisationsDate();
            }),
          to = $( "#toTime" ).datepicker({
            dateFormat : "d M, y" ,
            defaultDate: new Date(maxYear, maxMonth, maxDay),
            changeMonth: true,
            numberOfMonths: 1,
            minDate: new Date(minYear, minMonth, minDay), 
            maxDate: new Date(maxYear, maxMonth, maxDay),
            showAnim: "fadeIn",
            setDate: $.datepicker.formatDate('d M y', new Date(maxYear, maxMonth, maxDay))
          })
          .on( "change", function() {
            from.datepicker( "option", "maxDate", toField.value );
            AlertVisualisationsDate();
          });
      } );
      //Set standard values:  
      //$( "#toTime" ).datepicker( "setDate", $.datepicker.formatDate('d M y', new Date(maxYear, maxMonth, maxDay)));
      //$( "#fromTime" ).datepicker( "setDate", "00/00/00");
    }) 
}

//A function which will alert all visualisations on a change of date.
function AlertVisualisationsDate() {
  //First, gather a list of all visualisations.
  var visblocks = d3.selectAll("visField");
  console.log(visblocks);
}

//ASYNCHRONOUS!!!
//Function handling the retrieval of minimal and maximum date.
//Input: Location of the dataset to read. 
//Output: An array in the form  [min,max], where each date is a tuple: '{day,month,year}'
function GetMinMaxDate(dataset){
  d3.csv(dataset).then(function(data) {
    //convert to numbers:
    data.forEach(function(d) {
      d.fromId = +d.fromId; 
      d.sentiment = +d.sentiment;
      d.toId = +d.toId; 

      //Add the d.time to get a representative variable for slicing:
      let timeData = d.date.split("-");
      d.year = +timeData[0];
      d.month = +timeData[1];
      d.day = +timeData[2];
    });

    //now, find min and max dates:
    //We take the maximum (safe) integers in order to make sure our comparisons will pass all tests.
    let minDay = Number.MAX_SAFE_INTEGER;
    let minMonth = Number.MAX_SAFE_INTEGER;
    let minYear = Number.MAX_SAFE_INTEGER;
    //Similairly, we take the minimum (safe) integers for the max:
    let maxDay = Number.MIN_SAFE_INTEGER;
    let maxMonth = Number.MIN_SAFE_INTEGER;
    let maxYear = Number.MIN_SAFE_INTEGER; 

    data.forEach(function(d) {
      //Check for minimum
      //Check years:
      if (d.year < minYear) {
        minYear = d.year;
        //Check months:
        if (d.month < minMonth) {
          minMonth = d.month;
          //Check days:
          if (d.day < minDay) {
            minDay = d.day;
          }
        }
      }

      //Check for maximum
      //Check years:
      if (d.year > maxYear) {
        maxYear = d.year;
        //Check months:
        if (d.month > maxMonth) {
          maxMonth = d.month;
          //Check days:
          if (d.day > maxDay) {
            maxDay = d.day;
          }
        }
      }
    });
    console.log({minDay , minMonth , minYear , maxDay , maxMonth , maxYear});
    return {minDay , minMonth , minYear , maxDay , maxMonth , maxYear};
  })
}

