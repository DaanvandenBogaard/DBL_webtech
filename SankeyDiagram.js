/*AUTHORS:
Daan van den Bogaard (1534173)
Myrte van Ginkel (1566237)
*/
//Temp branch to get merge heb with main.
var dataSet;
var tooltip;
var outOfBounds = false;
var dateRange;
var userDataLoad;


function MakeSankeyMenu(dataPath , fieldName) {
  //Read the data:
  d3.csv(dataPath).then(function(data) {
    //convert to numbers:
    data.forEach(function(d) {
      d.fromId = +d.fromId; 
      d.sentiment = +d.sentiment;
      d.toId = +d.toId; 
    });
    let userData = collectIDSInfo(data);
    userDataLoad = userData; //Make into global for later use.
    console.log(userData);
    //Now, construct the outside of the Sankey menu (its shell so to speak).
    //Retrieve a list of all professions:
    let SankeyMenuDiv = d3.select("#" + fieldName).append("div").attr("id" , "SankeyMenu").attr("class" , "SankeyMenu");
    //Append empty input field:
    let Jobs = collectJobs(data);
    let selectedIDS = new Array();
    Jobs.forEach(function(d){
      SankeyMenuDiv.append("button").attr("type", "button").attr("class" , "collapsible").html("<h3>" + d + "</h3>");
      let curDiv = SankeyMenuDiv.append("div").attr("class" , "SankeyMenuContent");
      //Now, for each user, draw the appropriate button:
      userData.forEach(function(userElement){
        //Only draw if the user has the right job
        if (d == userElement['Job']) {
          //Make an SVG for the user:
          let userSVG = curDiv.append("svg")
                              .attr("width" , 150)
                              .attr("height", 150);
          let userSelector = userSVG.append("g").attr("id" , "userSelector");

          //Append visual elements:
          userSelector.append("circle")
                      .attr("cx" , 75)
                      .attr("cy" , 75)
                      .attr("r" , 74)
                      .attr("fill" , getColor(userElement["ID"]));
          let userText = userSelector.append("text")
                      .attr("y" , 75)
                      .attr("x", 75)
                      .attr("fill", "white")
                      .attr("font-size", 20)
                      .attr('text-anchor', 'middle')
                      .attr('alignment-baseline', 'central')
                      .text(userElement['Email'].split("@")[0].replace(/\./g , " "));
          //Add events: 
          userSelector.on("click" , function(event){
            if (selectedIDS.includes(userElement['ID'])) {
              //delete element
              selectedIDS.splice(selectedIDS.indexOf(userElement['ID']),1)
              userText.attr("fill" , "white");
            }
            else {
              //add element:
              selectedIDS.push(userElement['ID']);
              userText.attr("fill" , "black");
            }
            console.log(selectedIDS);

          });
        }
      });
    });
    //Make "StartSankey" button
    let toSankeyButton = d3.select("#" + fieldName).select("#upperbar").append("button").attr("id", "toSankey" + fieldName).attr("class", "toSankey");
    let toSankeyLabel = d3.select("#" + fieldName).select("#upperbar").append("label").attr("for", "toSankey" + fieldName).attr("class", "smallButton").html("To Sankey");
    toSankeyButton.on("click" , function(d){

      makeSankey(dataPath , fieldName , selectedIDS);
      SankeyMenuDiv.remove();
      toSankeyButton.remove();
      toSankeyLabel.remove();
    });


    //"activate" collapsability:
    var coll = document.getElementById(fieldName).getElementsByClassName("collapsible");
    let randomI;

    for (randomI = 0; randomI < coll.length; randomI++) {
      coll[randomI].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
         content.style.display = "none";
        }
        else {
          content.style.display = "block";
        }
      });
    }
  });
}

//A function to collect all professtions
function collectJobs(data) {
  //All fromIDS:
  let fromJobs = data.map(function(d) {
      return d.fromJobtitle
  });
  //All toIDS:
  let toJobs = data.map(function(d) {
    return d.toJobtitle
  });
  
  //Concatenation of all IDS:
  let jobsRaw = fromJobs.concat(toJobs);
  //distinct IDs:
  return Jobs = [... new Set(jobsRaw)];
}

function findCorrespondingName(idNum){
  //Find the name to the corresponding idNum in userDataLoad
  let toolTipString;
  userDataLoad.forEach(function (d) {
    if (idNum == d['ID']) {
      console.log("Succes!" , d["Email"]);
      toolTipString = d["Email"];
    }
  });
  //if none found, return null:
  return toolTipString
}

//A function to collect all IDs and information about people.
function collectIDSInfo(data) {
  var userList = new Array();
  var userInfo = new Array();
  data.forEach( 
    function(d){
      if (!userList.includes(d.fromId) && d.fromId != d.toId) {
        userList.push(d.fromId);
        userInfo.push({"ID" : d.fromId , "Email" : d.fromEmail , "Job" : d.fromJobtitle});
      }
      if (!userList.includes(d.toId)) {
        userList.push(d.toId);
        userInfo.push({"ID" : d.toId , "Email" : d.toEmail , "Job" : d.toJobtitle});
      }
    } 
  );

  userInfo.sort(function(a,b) {
    return a.ID - b.ID
  });
  return userInfo; 
}

function makeSankey(dataPath , fieldName , idNums) {
  //Make the "GoBackButton"
   let menuButton = d3.select("#" + fieldName).select("#upperbar").append("button").attr("id", "menuButton" + fieldName).attr("class", "menuButton");
   let menuLabel = d3.select("#" + fieldName).select("#upperbar").append("Label").attr("for", "menuButton" + fieldName).attr("class", "smallButton").html("To menu");
   menuButton.on("click" , function(d){
    MakeSankeyMenu(dataPath , fieldName);
    menuButton.remove();
    menuLabel.remove();
    d3.select("#" + fieldName).selectAll("svg").remove();
    d3.select("#" + fieldName).selectAll(".tooltip").remove();	
    d3.select("#" + fieldName).selectAll("#sankeyID").remove();
   });


  //Initialise dateRange
  dateRange = findDateRange();
  //We start by making the SVG element.
  let margin = {top : 15, right : 10, bottom: 15, left: 10} //For now, hardcoded margins 
  //var width = 1500; //for now, hardcoded width
  //var height = 1000; //for now, hardcoded height*/

  var nodeWidthSankey = 80;
  let div = d3.select("#" + fieldName);
  let sankeyDiv = div.append("div").attr("id" , "sankeyID")
                                   .attr("height" , "90%");
  //Retrieve height upperbox:
  var upperBoxHeight = parseFloat(div.select("#upperbar").style("height"))

  //retrieve width and height:
  var height = parseFloat( div.style("height") ) - upperBoxHeight - 20;
  var width = parseFloat( div.style("width") ) - 20;

  tooltip = div.append("div")
               .attr("class" , "tooltip");
                           
  let svg = sankeyDiv.append("svg")
                     .attr("id" , "visualisation")
                     .attr("preserveAspectRatio", "xMinYMid meet")
                     .attr("viewBox", "-5 0 " + width +" "+height)
                     .attr("actWidth" , width)
                     .attr("actHeight" , height);

  let g =   svg.append("g")
               //.attr("width" , width)
               //.attr("height", height)
               .attr("transform" , "translate(" + margin.left  + "," + margin.top +")");

  //Import sankey package as variable:
  sankey = d3.sankey()
             .nodeWidth(nodeWidthSankey)
             .nodePadding(25)
             .nodeAlign(d3.sankeyCenter)
             .nodeSort(null)
             .nodeId(d => d.name)
             .size([width-10,height-10])
             //.extent([[1, 5], [width - 1, height - 5]])
             .iterations(125);

  //From now on, we load the data:
  d3.csv(dataPath).then(function(data) {

    //Since d3.csv is asynchronous (it is not loaded immediatly, but it is a request to the webserver) we need all our code from the data in here. 
    //Now, we must define our link and node data. This will later be something the user can choose, but for now, we simply hardcode:

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

    let upperBar = div.select("#upperbar")
    var trigger = upperBar.append('input')
                          .attr("type", "text")
                          .attr("id", "sankeyTrigger")
                          .attr('width', 350)
                          .attr('height', 100)
                          .style("display" , "none")
                          .attr("class" , "sankeyTrigger")
                          .attr("value" , "test")
                          .attr("vertical-align" , "middle");
    
    trigger.on("input", function() {
      console.log("TRIGGERED!");
      //Find new date range (update range):
      dateRange = findDateRange();
      //Execute update:
      UpdateD3(data , sankey ,dateRange ,idNums , fieldName);
    });

    let brushLinkTrigger = upperBar.append('input')
                                   .attr("type", "text")
                                   .attr("id", "brushLinkTrigger")
                                   .attr('width', 350)
                                   .attr('height', 100)
                                   .style("display" , "none")
                                   .attr("class" , "brushLinkTrigger")
                                   .attr("value" , "none")
                                   .attr("vertical-align" , "middle"); 
    
    brushLinkTrigger.on("input", function() {
      //Retrieve value from input field:
      let val = d3.select("#" + fieldName).select("#brushLinkTrigger").attr("value");
      //Highlighed selected element:
      d3.selectAll("#id" + val).raise().attr("stroke", "black");
    })
    //Brushing and linking stop
    let brushLinkStop = upperBar.append('input')
        .attr("type", "text")
        .attr("id", "brushLinkStop")
        .attr('width', 350)
        .attr('height', 100)
        .style("display" , "none")
        .attr("class" , "brushLinkStop")
        .attr("value" , "none")
        .attr("vertical-align" , "middle");
    brushLinkStop.on("input", function() {
      //Retrieve value from input field:
      let val = d3.select("#" + fieldName).select("#brushLinkStop").attr("value");
      d3.select("#id" + val).attr("stroke", null);
    })
    //Define sankey data by sankey.js
    dataSet = constrDataSet(data , idNums , dateRange);
    MakeD3(dataSet , sankey , d3.select("#" + fieldName).select("#sankeyID").select('#visualisation') , fieldName);
  }); 
}

//Input: selection of elements
//Output: updates all elements at every visblock and triggers 
//The function handling the brushing and linking selection.
function triggerBrushLinking(selected){
  d3.selectAll("#brushLinkTrigger").attr("value" , selected);
  d3.selectAll("#brushLinkTrigger").dispatch("input");
}

function stopBrushLinking(selected){
  d3.selectAll("#brushLinkStop").attr("value" , selected);
  d3.selectAll("#brushLinkStop").dispatch("input");
  d3.selectAll("#id" + selected).attr("stroke" , null);
}

function constrDataSet(data, idNums , dateRange){
  let linksDataDupRaw = data.filter(function(d){
    return idNums.includes(d.fromId);
  });

  //Get proper slice:
  let startDate = (dateRange['fromYear'] + dateRange['fromMonth'] + dateRange['fromDay']);
  let endDate = (dateRange['toYear'] + dateRange['toMonth'] + dateRange['toDay']);
  linksDataDupRaw = linksDataDupRaw.filter(function(d){
     //Check wether or not the data tuple is in our dateRange. 
     let isInRange = false;
     let date = 10000 * d.year + 100 * d.month + d.day;

     //Check whether it is on the correct year:
     if (startDate <=  date && date <= endDate) {
       isInRange = true;
     }

     return isInRange;
   });

  let linksDataDup = linksDataDupRaw.map(function(d){
    return {
      source: d.fromId,
      target: d.toJobtitle,
      value:1
    }
  });  

  let linksDataNestedFormat = d3.nest()
                                .key(function(d) { return d.source; })
                                .key(function(d) { return d.target; })
                                .rollup(function(leaves) { return d3.sum(leaves, function(d) {return parseFloat(d.value)})})
                                .entries(linksDataDup);

  //We now reformat the array into the desired data format:
  let linksData = [];
  for(i = 0; i < linksDataNestedFormat.length; i++){
    for(j = 0; j < linksDataNestedFormat[i]['values'].length; j++){
      linksData.push({
                source : linksDataNestedFormat[i]["key"],
                target : linksDataNestedFormat[i]['values'][j]['key'],
                value : linksDataNestedFormat[i]['values'][j]['value']
              });
    }
  }
  
  //Convert to numbers:
  linksData.forEach(function(d) {
    d.source = +d.source; 
  });

  //We have to add all the toJobtitles as nodes as well.
  let extraNodesRaw = linksData.map(function(d) {
    return d.target
  });

  let extraNodesDisctinct = [... new Set(extraNodesRaw)];
  extraNodesDisctinct = extraNodesDisctinct.concat(idNums);

  let nodesData = extraNodesDisctinct.map(function(d){
    return {"name" : d}
  });

  dataSet = {"nodes" : nodesData , "links" : linksData};
  return dataSet;
}

//Used to filter out all unique values.
const unique = (value, index, self) => {
  return self.indexOf(value) === index
}

function findMinMax(data, attribute) {
  var min = Number.MAX_VALUE;
  var max = Number.MIN_VALUE;

  for (let i = 0; i + 1 < data.length; i+=2) {
      //First checks 2 elements against each other
      //Then compares the highest to max and lowest to min
      if (data[i] < data[i+1]) {
          if (max < data[i+1][attribute]) {max = data[i+1][attribute];}
          if (min > data[i][attribute]) {min = data[i][attribute];}
      } else {
          if (max < data[i][attribute]) {max = data[i][attribute];}
          if (min > data[i + 1][attribute]) {min = data[i+1][attribute];}
      }
  }
  return [min, max]
}

function UpdateD3(data , sankey ,dateRange ,idNums  ,fieldName){
  //Delete old chart:
  d3.select("#" + fieldName).select("#sankeyID").select("#visualisation").selectAll("g").remove();
  //Construct new chart:
  dataSet = constrDataSet(data, idNums , dateRange);
  MakeD3(dataSet, sankey, d3.select("#" + fieldName).select("#sankeyID").select("#visualisation") , fieldName);
}

function MakeD3(dataSet , sankey , svg , fieldName){

  if (dataSet["links"].length == 0) {
    console.log("In this dataset, during this year, no mail was sent by the people involved.");
    return
  }
  let {nodes, links} = sankey(dataSet);
  let width = d3.select("#" + fieldName).select("#sankeyID").style("width");
  width = width.slice(0,-2);
  width = +width;
  var textpadding = 10;
  
  //Set functions for hover over tooltip:
  var mouseover = function(event , d) {
    tooltip = d3.select("#" + fieldName).select(".tooltip");
    tooltip.style("opacity", 1);
    d3.select(this).attr("stroke", d => d3.color(d.color) || "#BBBBBB");
  }
  var mousemove = function(event , d) {
    tooltip.html("The number of emails between " + findCorrespondingName(d.source['name']) + " (id number "+  d.source['name'] +") and " + d.target['name'] + " is "  + d.value + ".")
           .style("left", (event.x + 70) + "px")
           .style("top", (event.y) + "px");
  }
  var mouseleave = function(d) {
    tooltip.style("opacity", 0);
    d3.select(this).attr("stroke", d => d3.color(d.color) || getLinkColor());
  }
  var mousemoveNode = function(event , d) {
    //Calculate the total number of emails sent by the source (node).
    let sum = 0;
    links.forEach(function(entry){
      if (typeof(d.name) == "number") {
        if (entry.source['name'] === d.name) {
          sum += entry.value;
        }
      }
      else{
        if (entry.target['name'] == d.name) {
          sum += entry.value;
        }
      }
    });
    
    //Determine type of variable:
    if (typeof d.name === "number") {  
      tooltip.html(findCorrespondingName(d.name) + " (id number " + d.name + ") has sent " + sum + " emails.")        
    } 
    else{
      tooltip.html(d.name + " has received " + sum + " emails.")
    }
    tooltip.style("left", (event.x + 70) + "px")
           .style("top", (event.y) + "px");
  }

  //Append the links:
  var link = d3.select("#" + fieldName).select("#sankeyID").select('#visualisation').append("g")
               .attr("id","link")
               .attr("fill", "none")
               .selectAll("g")
               .data(links.sort((a, b) => b.width - a.width))
               .join("g")
               .attr("stroke", d => d3.color(d.color) || getLinkColor())
               .style("mix-blend-mode", "multiply")
               .on("mouseover", mouseover)
               .on("mousemove", mousemove)
               .on("mouseleave", mouseleave);

  link.append("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke-width", d => Math.max(1 , d.width));

  drag = d3.drag()
           .on("start", dragstarted)
           .on("drag", function dragged(event, d) {
            //Disable tooltip:
            tooltip.style("opacity", 0);
            //Check if the mouse is still in frame:
              //retrieve height and width:
              let width = d3.select("#" + fieldName).select("#sankeyID").select("#visualisation").attr("actWidth").split("px")[0];
              let height = d3.select("#" + fieldName).select("#sankeyID").select("#visualisation").attr("actHeight").split("px")[0];
              let padding = 10;
            if (event.x < padding || event.x > width - padding || event.y < padding || event.y > height - padding || outOfBounds) {
              outOfBounds = true;
              return;
            }
            
            //Update values of d:
            d.x0 += event.dx;
            d.y0 += event.dy;
            d.x1 += event.dx;
            d.y1 += event.dy;
            sankey.update(dataSet);
            //update visuals:
            d3.select(this)
              .attr("x", d.x0)
              .attr("y", d.y0); 
          
            var textVar = d3.select("#" + fieldName).select("#text").select(("#" + "ID" +  d.name).replace(/ /g,''));
            let BBox = textVar.node().getBBox();
            if (Number.isNaN((+d.name))) {
              textVar.attr("x", d.x0 < (width / 2) ? d.x1 + BBox.width + 10  : d.x0 - 10); 
            } else {
              textVar.attr("x", d.x0 < (width / 2) ? d.x1 + 10: d.x0 - BBox.width - 10);
            }
            textVar.attr("y", d => ((d.y1 + d.y0) / 2) + 10); 
          
            d3.select("#" + fieldName).selectAll("#link").selectAll("path").attr("d", d3.sankeyLinkHorizontal())
                                                   .attr("stroke-width", d => Math.max(1 , d.width));
          
          })
           .on("end", dragended);

//Append a new group for the nodes and set it's attributes:
  let node = d3.select("#" + fieldName).select("#sankeyID").select('#visualisation').append("g")
               .attr("stoke" , "#000")
               .selectAll("rect")
               .data(nodes) 
               .join("rect")
               .attr("x" , d => d.x0)
               .attr("y" , d => d.y0)
               .attr("fill" , d => getColor(d.name))
               .attr("id" , d => "id" + d.name)
               .attr("width", d => d.x1 - d.x0 - 2)
               .attr("height", d => d.y1 - d.y0)
               .call(drag)
               .on("mouseover", function(event , d) {
                  triggerBrushLinking(d.name)
                  tooltip.style("opacity", 1);
                  d3.select(this).raise().attr("stroke", "black");
               })
               .on("mousemove", mousemoveNode)
               .on("mouseleave", function(event , d) {
                  stopBrushLinking(d.name);
                  tooltip.style("opacity", 0);
                  d3.select(this).attr("stroke", null);
               })
               .append("title")
               .text(d => d.name);

    //Set text:
    //MAY CAUSE ISSUES WHEN USING NUMBERS ON THE RIGHT SIDE AND/OR TEXT ON THE LEFT SIDE!
    d3.select("#" + fieldName).select("#sankeyID").select('#visualisation').append("g")
      .attr("id" , "text")
      .style("font", "35px sans-serif") //TODO ask Thomas for right font style
      .attr("pointer-events", "none")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("id" , d => ("ID" + d.name).replace(/ /g,'') )
      .attr("y", d => ((d.y1 + d.y0) / 2) + 10) //set y coordinate
      .attr("x", d => d.x0 < width / 2 ? d.x1 + textpadding : d.x0 - textpadding) //set x coordinate based on the location of the node.
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .text(d => d.name.toString()); //set the text value
}

//Functions handling color retrival and hashing names to colours. 
function getLinkColor(){
  let color = "#dddddd";
  return color;
}

function getColor(node) {
    //Choose a color scale:
    var hash = 0;
    //If string is a number, multiply by 15481654:
    if(typeof node != "string"){
      node = node * 154815185148845648961894894894894846572;
      node = node.toString(5);
    }

    for (var i = 0; i < node.length; i++) {
        hash = node.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    var color = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 255;
        color += ('00' + value.toString(16)).substr(-2);
    }   
    return color;

}

//Functions for drag behaviour of nodes:
function dragstarted(event, d) {
  d3.select(this).raise().attr("stroke", "black");
}

function dragended(event, d) {
  d3.select(this).attr("stroke", null);
  outOfBounds = false;
}

