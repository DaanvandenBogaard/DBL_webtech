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

    let mainBlock = d3.select("#visContent");

    let newVisBlock = mainBlock.append("div")
                               .attr("id" , "vis" + index)
                               .attr("class" , "visField");                              
    newVisBlock.style("position","absolute").attr("x", 0).attr("y",0);
    CreateVisField("vis" + index); 
      
    //Use JQuery to have the blocks be draggable:    
    $( function() {
        $( "#vis" + index ).draggable({snap: true , stack: ".visField"});
      } ); 

    //Add the resizeable effect:
    $( function() {
        $( "#vis" + index ).resizable(
          {
            aspectRatio: 16 / 9//,
           // minHeight: 563,
            //minWidth: 1000
          }
          );
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
                              .attr("id", "closeButton")
                              .attr("onclick" , "changeListenerFunction('"+fieldName +"')"
                              );

    var closeLabel = upperbar.append("label")
                             .attr("for", "closeButton")
                             .attr("class", "fa fa-times closeLabel")
                             .attr("style", "font-size: 20px;");

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
                        '<button id="startHEB" type="button" name="HEB" onclick="makeHEB(localStorage.getItem(' + "'CurDataSet'" + ') ,' + "'" + fieldName + "'"   + ' )"> Start </button>' +
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
        makeMSV(localStorage.getItem('CurDataSet'), fieldName);
    }
    else {
        console.log('Sorry! We were unable to load the correct visualisation. Please submit this bug.');
    }
}

//Function handling the functional aspects of the general time manager.
function MakeGeneralTimeManager(dataset){
  //Append the HTML:
  let TimeManager = d3.select("#toolbar").append('div').style("display", "inline-block");
  TimeManager.html("<label for='from'>From</label>"
                  +"<input type='text' id='fromTime' name='from' readonly>"
                  +"<label for='to'>to</label>"
                  +"<input type='text' id='toTime' name='to' readonly>");

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
              dateFormat : "dd/mm/yy" ,
              defaultDate: new Date(minYear, minMonth, minDay),
              changeMonth: true,
              numberOfMonths: 1,
              minDate: new Date(minYear, minMonth, minDay), 
              maxDate: new Date(maxYear, maxMonth, maxDay),
              showAnim: "fadeIn",
              showWeek: true,
              firstDay: 1,
              changeYear: true,
              setDate: $.datepicker.formatDate('dd/mm/yy', new Date(minYear, minMonth, minDay))
            })
            .on( "change", function() {
              to.datepicker( "option", "minDate", fromField.value );
              AlertVisualisationsDate();
            }),
          to = $( "#toTime" ).datepicker({
            dateFormat : 'dd/mm/yy' ,
            defaultDate: new Date(maxYear, maxMonth, maxDay),
            changeMonth: true,
            numberOfMonths: 1,
            minDate: new Date(minYear, minMonth, minDay), 
            maxDate: new Date(maxYear, maxMonth, maxDay),
            showAnim: "fadeIn",
            showWeek: true,
            firstDay: 1,
            changeYear: true,
            setDate: $.datepicker.formatDate('dd/mm/yy', new Date(maxYear, maxMonth, maxDay))
          })
          .on( "change", function() {
            from.datepicker( "option", "maxDate", toField.value );
            AlertVisualisationsDate();
          });
      } );
    }) 
}

//A function which will alert all visualisations on a change of date.
function AlertVisualisationsDate() {
  //First, gather a list of all visualisations.
  var visblocks = d3.selectAll(".visField"); //D3 equivalent of document.getElementsByClassName("visField");
  //Now, per visualisation, integrate the correct call:
  //Sankey:
    //The sankey has a hidden input box with an onchange event listener.
    d3.selectAll("#sankeyTrigger").dispatch("input");
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

//A function to retrieve the date selected by the general date selector:
//Return: A dictonairy containing the correct dates of the date range.
//The return has the following form:
/*
{
"fromDay"  : fromTime[0],
"fromMonth" : fromTime[1],
"fromYear" : fromTime[2],
"toDay"    : toTime[0]  ,
"toMonth"   : toTime[1]  ,
"toYear"   : toTime[2]
}

Note that null values will be seen as infinity (or minus infinity).
*/
function findDateRange(){
  //Find new date range:
  let fromTimeString = document.getElementById("fromTime").value;
  let toTimeString = document.getElementById("toTime").value;
  let fromTime = fromTimeString.split("/");
  let toTime = toTimeString.split("/");

  //check for null:
  if (fromTimeString == null || fromTimeString == "") {
    fromTime[0] = Number.MIN_VALUE;
    fromTime[1] = Number.MIN_VALUE;
    fromTime[2] = Number.MIN_VALUE;
  }
  if (toTimeString == null || toTimeString == "") {
    toTime[0] = Number.MAX_VALUE;
    toTime[1] = Number.MAX_VALUE;
    toTime[2] = Number.MAX_VALUE;
  }

  dateRange = {
               "fromDay"  : fromTime[0],
               "fromMonth" : fromTime[1],
               "fromYear" : fromTime[2],
               "toDay"    : toTime[0]  ,
               "toMonth"   : toTime[1]  ,
               "toYear"   : toTime[2]
              };
  return dateRange
}