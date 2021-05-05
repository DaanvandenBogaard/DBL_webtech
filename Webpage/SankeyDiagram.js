/*AUTHORS:
Daan van den Bogaard (1534173)
Myrte van Ginkel (1566237)
*/

/*
Mapping for date user selection:
SLICE ON (userTimeIntervalSelector):
    days: 0
    months: 1
    years: 2
*/


function makeSankey(dataPath) {

  //We start by making the SVG element.
  let margin = {top : 15, right : 10, bottom: 15, left: 10} //For now, hardcoded margins 
  var width = 1500; //for now, hardcoded width
  var height = 800; //for now, hardcoded height
  var nodeWidthSankey = 80;
  let div = d3.select("#sankeyID")
              .attr("width" , width + 25)
              .attr("height" , height + 25);
  let svg = div.append("svg")
               .attr("width" , width + 25)
               .attr("height", height + 25);
  let g =   svg.append("g")
               .attr("width" , width)
               .attr("height", height)
               .attr("transform" , "translate(" + margin.left  + "," + margin.top +")");

  //Import sankey package as variable:
  var sankey = d3.sankey()
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
    let sliderDiv = div.append("div");
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
      UpdateD3(data , sankey ,sliderVal ,idNums);
    });

  sliderDiv
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)')
    .call(slider);

    //Ask the user for the desired ID numbers:
    var idInput = window.prompt("Enter ID-numbers (seperated by commas):")
    let idNums = JSON.parse("[" + idInput + "]");

    //Define sankey data by sankey.js
    dataSet = constrDataSet(data , idNums , sliderVal);
    MakeD3(dataSet , sankey , svg);


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

function UpdateD3(data , sankey ,sliderVal ,idNums){
  //Delete old chart:
  d3.select("#sankeyID").select("svg").selectAll("g").remove();
  //Construct new chart:
  dataSet = constrDataSet(data, idNums , sliderVal);
  MakeD3(dataSet, sankey, d3.select("#sankeyID").select("svg"));
}

function MakeD3(dataSet , sankey , svg){
  let {nodes, links} = sankey(dataSet);
  let width = d3.select("#sankeyID").style("width");
  width = width.slice(0,-2);
  width = +width;
  var textpadding = 10;
  console.log(width);
  //Append a new group for the nodes and set it's attributes:
  //TODO: fix colors and possible names
  let node = svg.append("g")
                .attr("stoke" , "#000")
                .selectAll("rect")
                .data(nodes) 
                .join("rect")
                .attr("x" , d => d.x0)
                .attr("y" , d => d.y0)
                .attr("fill" , "#314f7d")
                .attr("width", d => d.x1 - d.x0 - 2)
                .attr("height", d => d.y1 - d.y0)
                .append("title")
                .text(d => d.name);

    //Append the links:
  let link = svg.append("g")
                .attr("fill", "none")
                .selectAll("g")
                .data(links.sort((a, b) => b.width - a.width))
                .join("g")
                 .attr("stroke", d => d3.color(d.color) || getColor())
                 .style("mix-blend-mode", "multiply");

  link.append("path")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke-width", d => Math.max(1 , d.width));

    //Set text:
  svg.append("g")
     .style("font", "35px sans-serif") //TODO ask Thomas for right font style
     .attr("pointer-events", "none")
     .selectAll("text")
     .data(nodes)
     .join("text")
     .attr("y", d => ((d.y1 + d.y0) / 2) + 17.5) //set y coordinate
     .attr("x", d => d.x0 < width / 2 ? d.x1 + textpadding : d.x0 - textpadding) //set x coordinate based on the location of the node.
     .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
     .text(d => d.name); //set the text value
}

function getColor() {
    //Choose a color scale:
    let color = "#dddddd";
    return color;
}