/*AUTHORS:
Daan van den Bogaard (1534173)
Myrte van Ginkel (1566237)
*/

//TODO: update hardcoded parameters
function makeSankey(dataPath) {

  //We start by making the SVG element.
  let margin = {top : 15, right : 10, bottom: 15, left: 10} //For now, hardcoded margins 
  let width = 500; //for now, hardcoded width
  let height = 500; //for now, hardcoded height
  let div = d3.select("#sankeyID");
  let svg = div.append("svg")
               .attr("width" , width)
               .attr("height", height)
               .append("g")
               .attr("transform" , "translate(" + margin.left  + "," + margin.top +")");
  //Import sankey package as variable:
  var sankeyVis = d3.sankey()
               .nodeWidth(40)
               .nodePadding(300)
               .size([width,height]);
              
  //Choose a color scale:
  let colorScale = d3.scaleOrdinal("d3.schemeCategory10");

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

    //Construct the nodes:
    let fromIDs = data.map(function(d) {
     return  d.fromId
    });

    let toIDs = data.map(function(d) {
      return  d.toId
     });
    
    let IDs = fromIDs.concat(toIDs);
    let nodesRaw = IDs.filter(unique); //List of unique IDs   
    let nodes = nodesRaw.map(function(d){
      return {node : d , name: "node" + d}
    });

    //Construct the links:
    let links = data.map(function(d){
      return{
        source : d.fromId,
        target : d.toId,
        value  : 2
      }
    });

    //Add nodes and links to sankey:
    sankeyVis
      .nodes(nodes)
      .links(links)
      .iterations(1);
      
  }); 
}

//Used to filter out all unique values.
const unique = (value, index, self) => {
  return self.indexOf(value) === index
}

