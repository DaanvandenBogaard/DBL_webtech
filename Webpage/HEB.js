/*AUTHORS:
Thomas Broers (1538705)
Bas van Hoeflaken (1556282)
*/

function makeHEB(dataPath) {
    
    //Variables and constants
    let margin = {top : 15, right : 10, bottom: 15, left: 10};
    let diameter = 1000;
    let radius = diameter / 2;
    let innerRadius = radius - 120;

    var bundleStrength = 0.85;

    //Make svg object
    let div = d3.select("#HEBFigure")
                .attr("width", diameter)
                .attr("height", diameter);
    let svg = div.append("svg")
                 .attr("width", diameter)
                 .attr("height", diameter)
                 .attr("transform" , "translate(" + margin.left  + "," + margin.top +")");

    d3.csv(dataPath).then(function(data) {
        //Since d3.csv is asynchronous (it is not loaded immediatly, but it is a request to the webserver) we need all our code from the data in here. 
        
        //Set by which object to group, hardcoded for now
        filteredData = d3.nest()
                         .key(function(d) { return d.fromJobtitle; })
                         .key(function(d) { return d.fromId; })
                         .entries(data);
        
        usableData = {"id": "", "mails": []};

        data.forEach()
        
        //Draw nodes 
        /*
        let node = svg.append("g")
                      .selectAll("g")
                      .data(filteredData)
                      .join("g")
                      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
                      .append("text")
                      .attr("dy", "0.31em")
                      .attr("x", d => d.x < Math.PI ? 6 : -6)
                      .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
                      .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
                      .text(d => d.name);
        */

        console.log(usableData);
    });
    
    
}