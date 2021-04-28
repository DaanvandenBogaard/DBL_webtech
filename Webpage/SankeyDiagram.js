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
  let sankey = d3.sankey()
               .nodeWidth(40)
               .nodePadding(300)
               .size([width,height]);
              
  //Choose a color scale:
  let colorScale = d3.scaleOrdinal("d3.schemeCategory10");

  //From now on, we load the data:
  d3.csv(dataPath).then(function(data) {
        //Since d3.csv is asynchronous (it is not loaded immediatly, but it is a request to the webserver) we need all our code from the data in here. 
      
      
        
  });
}