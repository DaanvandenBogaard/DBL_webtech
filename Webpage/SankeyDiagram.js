/*AUTHORS:
Daan van den Bogaard (1534173)
Myrte van Ginkel (1566237)
*/

//TODO: update hardcoded parameters
function makeSankey(dataPath) {

  //We start by making the SVG element.
  let margin = {top : 15, right : 10, bottom: 15, left: 10} //For now, hardcoded margins 
  let width = 1500; //for now, hardcoded width
  let height = 800; //for now, hardcoded height
  let textpadding = 10;
  var nodeWidthSankey = 80;
  let div = d3.select("#sankeyID")
              .attr("width" , width)
              .attr("height" , height);
  let svg = div.append("svg")
               .attr("width" , width)
               .attr("height", height);
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
               .iterations(50);

              
  //Choose a color scale:
  let color = "#dddddd"
  //From now on, we load the data:
  d3.csv(dataPath).then(function(data) {
    //Since d3.csv is asynchronous (it is not loaded immediatly, but it is a request to the webserver) we need all our code from the data in here. 
    //Now, we must define our link and node data. This will later be something the user can choose, but for now, we simply hardcode:

    //convert to numbers:
    data.forEach(function(d) {
      d.fromId = +d.fromId; 
      d.sentiment = +d.sentiment;
      d.toId = +d.toId; 
    });

    //For now, we will hardcode the ID number who's contact we want to see.
    let idNums = [64,9];

    let linksDataRaw = data.filter( function(el) {
      return idNums.includes(el.fromId);
    });

    let linksData = linksDataRaw.map(function(d){
      return {
        source:d.fromId,
        target:d.toJobtitle,
        value:1
      }
    });
    console.log(data);
    //TEMP: we'll take a small slice of the LINKSDATA
    //linksData = linksData.slice(10,100);

    //We have to add all the toJobtitles as nodes as well.
    let extraNodesRaw = linksData.map(function(d) {
      return d.target
    });

    let extraNodesDisctinct = [... new Set(extraNodesRaw)];
    extraNodesDisctinct = extraNodesDisctinct.concat(idNums);

    let nodesData = extraNodesDisctinct.map(function(d){
      return {"name" : d}
    });
    

    //Debug dataset:
    
    /*
    dataSet = 
    {
      "nodes":[
      {"name":"Barry"},
      {"name":"Frodo"},
      {"name":"Elvis"},
      {"name":"Sarah"},
      {"name":"Alice"},
      {"name":"Paulus de boskabouter"}
      ],
      "links":[
      {"source":0,"target":2,"value":2},
      {"source":1,"target":2,"value":2},
      {"source":1,"target":3,"value":2},
      {"source":0,"target":4,"value":2},
      {"source":2,"target":3,"value":2},
      {"source":2,"target":4,"value":2},
      {"source":3,"target":4,"value":4},
      {"source":0,"target":5,"value":4},
      {"source":4,"target":5,"value":4}
      ]};
    */
     
    dataSet = {"nodes" : nodesData , "links" : linksData};
    console.log(dataSet);
    //Define sankey data by sankey.js
    let {nodes, links} = sankey(dataSet);

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
                   .attr("stroke", d => d3.color(d.color) || color)
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
       .attr("y", d => (d.y1 + d.y0) / 2) //set x coordinate
       .attr("x", d => d.x0 < width / 2 ? d.x1 + textpadding : d.x0 - textpadding) //set y coordinate based on the location of the node.
       .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
       .text(d => d.name) //set the text value
  }); 
}

//Used to filter out all unique values.
const unique = (value, index, self) => {
  return self.indexOf(value) === index
}


