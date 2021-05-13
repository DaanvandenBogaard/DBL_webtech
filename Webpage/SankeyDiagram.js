/*AUTHORS:
Daan van den Bogaard (1534173)
Myrte van Ginkel (1566237)
*/

var dataSet;
var tooltip;
var outOfBounds = false;

function makeSankey(dataPath , fieldName) {
  //Ask the user for the desired ID numbers:
  var idInput = window.prompt("Enter ID-numbers (seperated by commas):")
  let idNums = JSON.parse("[" + idInput + "]");
  //We start by making the SVG element.
  let margin = {top : 15, right : 10, bottom: 15, left: 10} //For now, hardcoded margins 
  var width = 1500; //for now, hardcoded width
  var height = 1000; //for now, hardcoded height*/

  var nodeWidthSankey = 80;
  let div = d3.select("#" + fieldName);
  let sankeyDiv = div.select("#localBox").append("div").attr("id" , "sankeyID");
  //retrieve width and height:
  console.log(parseFloat( div.style("height") ));
  //var height = parseFloat( d3.select("#pageContent").style("height") );
  //var width = parseFloat( d3.select("#pageContent").style("width") );

  sankeyDiv.style("height" , height)
           .style("width" , width);

  tooltip = div.append("div")
               .style("opacity", 0)
               .style("position" , "absolute")
               .attr("class" , "tooltip")
               .style("background-color" , "white")
               .style("border" , "solid")
               .style("border-width" , "2px")
               .style("border-radius" , "5px")
               .style("padding" , "5px");

  let sliderHTML = div.select("#upperbar")
                      .append('svg')
                      .attr('width', 350)
                      .attr('height', 100)
                      .attr("display" , "inline")
                      .attr("class" , "test")
                      .attr("vertical-align" , "middle")
                      .append('g')
                      .attr('transform', 'translate(30,30)');
                           
  let svg = sankeyDiv.append("svg")
                     .attr("id" , "visualisation")
                     .attr("width" , width + 50)
                     .attr("height", height + 50);
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
               .size([width,height])
               .extent([[1, 5], [width - 1, height - 5]])
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

    let minMaxDates = findMinMax(data, "year");

    //Slider:
    let sliderVal = minMaxDates[0];
    var slider = d3
    .sliderHorizontal()
    .min(minMaxDates[0])
    .max(minMaxDates[1])
    .step(1)
    .tickValues([1998,1999,2000,2001,2002]) //TODO, define dynamically
    .ticks(minMaxDates[1] - minMaxDates[0] + 1)
    .width(300)
    .tickFormat(x => x) 
    .displayValue(false)
    .on('onchange', (val) => {
      sliderVal = val;
      UpdateD3(data , sankey ,sliderVal ,idNums , fieldName);
    });

    sliderHTML.call(slider); 

    //Define sankey data by sankey.js
    dataSet = constrDataSet(data , idNums , sliderVal);
    MakeD3(dataSet , sankey , d3.select("#" + fieldName).select("#sankeyID").select('#visualisation') , fieldName);


  }); 
}

function constrDataSet(data, idNums , sliderVal){
  let linksDataDupRaw = data.filter(function(d){
    return idNums.includes(d.fromId);
  });
  
  //Get proper slice:
  linksDataDupRaw = linksDataDupRaw.filter(function(d){
    return d.year == sliderVal
  });

  let linksDataDup = linksDataDupRaw.map(function(d){
    return {
      source: d.fromId,
      target: d.toJobtitle,
      value:1
    }
  });  

  let linksDataNestedFormat = d3.nest()
                                .key(function(d) { return d. source; })
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

function UpdateD3(data , sankey ,sliderVal ,idNums  ,fieldName){
  //Delete old chart:
  d3.select("#" + fieldName).select("#sankeyID").select("#visualisation").selectAll("g").remove();
  //Construct new chart:
  dataSet = constrDataSet(data, idNums , sliderVal);
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
  var mouseover = function(d) {
    tooltip.style("opacity", 1);
    d3.select(this).attr("stroke", d => d3.color(d.color) || "#BBBBBB");
  }
  var mousemove = function(event , d) {
    tooltip.html("The number of emails between " + d.source['name'] + " and " + d.target['name'] + " is "  + d.value + ".")
           .style("left", (event.x + 70) + "px")
           .style("top", (event.y) + "px");
  }
  var mouseleave = function(d) {
    tooltip.style("opacity", 0);
    d3.select(this).attr("stroke", d => d3.color(d.color) || getLinkColor());
  }
  var mousemoveNode = function(event , d) {
    //Calculate the total number of emails sent by the source (node).
    //Determine type of variable:
    if (typeof d.name === "number") {
      let sum = 0;
      links.forEach(function(entry){
        if (entry.source['name'] === d.name) {
          sum += entry.value;
        }
      });
      tooltip.html(d.name + " has sent " + sum + " emails.")
             .style("left", (event.x + 70) + "px")
             .style("top", (event.y) + "px");
    } 
    else{
      let sum = 0;
      links.forEach(function(entry){
        if (entry.target['name'] === d.name) {
          sum += entry.value;
        }
      });
      tooltip.html(d.name + " has received " + sum + " emails.")
             .style("left", (event.x + 70) + "px")
             .style("top", (event.y) + "px");
    }
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
            //Check if the mouse is still in frame:
              //retrieve height and width:
              let width = d3.select("#" + fieldName).select("#sankeyID").select("#visualisation").attr("width");
              let height = d3.select("#" + fieldName).select("#sankeyID").select("#visualisation").attr("height");
              let padding = 10;
            if (event.x < padding || event.x > width - padding || event.y < padding || event.y > height -padding || outOfBounds) {
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
                .attr("width", d => d.x1 - d.x0 - 2)
                .attr("height", d => d.y1 - d.y0)
                .call(drag)
                .on("mouseover", function(d) {
                  tooltip.style("opacity", 1);
                  d3.select(this).raise().attr("stroke", "black");
                })
                .on("mousemove", mousemoveNode)
                .on("mouseleave", function(d) {
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

