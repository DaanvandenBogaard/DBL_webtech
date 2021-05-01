function makeMSV(dataPath) {
    //We start by making the SVG element.
    let margin = {top : 15, right : 10, bottom: 15, left: 10} //For now, hardcoded margins 
    let width = 1500; //for now, hardcoded width
    let height = 800; //for now, hardcoded height
    let textpadding = 10;
    var nodeWidthMSV = 80;
    var monthToTime = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

    let div = d3.select("#MSVID")
              .attr("width" , width)
              .attr("height" , height);
    let svg = div.append("svg")
               .attr("width" , width)
               .attr("height", height);
    let g =   svg.append("g")
               .attr("width" , width)
               .attr("height", height)
               .attr("transform" , "translate(" + margin.left  + "," + margin.top +")");

    //This loads the data, make sure to only use the data in this section:
    d3.csv(dataPath).then(function(data) {
        //Since d3.csv is asynchronous (it is not loaded immediatly, but it is a request to the webserver) we need all our code from the data in here. 

        //convert to numbers:
        //As well as turning date into a number
        data.forEach(function(d) {
          d.fromId = +d.fromId; 
          d.sentiment = +d.sentiment;
          d.toId = +d.toId;
          d.time = (d.date.replace('-','')).replace('-','');
        })

        //Create an array of unique ids
        let IDS = collectIDS(data);

        //Find the maximum and minimum date of the data set and parse into useable format.
        var minMaxDates = findMinMax(data, "time");
        var minDate = parseDate(minMaxDates[0])

        //Turn dates into a time variable
        data.forEach(function(d) {
            let day = d.time % 100;
            let month = (d.time % 10000 - day)/100;
            let year = (d.time - (month*100) - day)/10000 - minDate[2];
            d.time = (year*365) + monthToTime[month - 1] - monthToTime[minDate[1] - 1] + day - minDate[0];
            if (isNaN(d.time)) {
                console.log(d.date);
            }
        });

        //Draw edges
        drawEdges(data);
    }); 
}

/*drawEdges: Draws all edges on the MSV
*Parameters:
*   data object of the edges
*Returns:
*   None  
*/
function drawEdges(data){
    let colour = ["red", "green"];
    let lines = d3.select("#MSVID")
                  .select("svg")
                  .append("g");
                    
    data.forEach(function(d) {
        if (d.fromId == 1 || d.fromId == 2) {
          lines.append('line')
               .style("stroke", colour[d.fromId - 1])
               .style("stroke-width", 1)
               .attr("x1", d.time)
               .attr("y1", d.fromId * 5)
               .attr("x2", d.time)
               .attr("y2", d.toId * 5);
        }
    })
}

/*findMinMax: Find maximum and minimum
*Note: stores min max in the values minDate and maxDate to allow one function for both.
*Parameters:
*   data object with column date
*Returns:
*   Array with minimum and maximum
*/
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

/*collectIDS: goes through the ids and creates an array of distinct ids
*Parameters:
*   data object with column fromId and toId
*Returns:
*   unordered array of ids
*/
function collectIDS(data) {
    //All fromIDS:
    let fromIDS = data.map(function(d) {
        return d.fromId
    });

    //All toIDS:
    let toIDS = data.map(function(d) {
      return d.toId
    });
    
    //Concatenation of all IDS:
    let IDSraw = fromIDS.concat(toIDS);

    //distinct IDs:
    return IDS = [... new Set(IDSraw)];
}

/*parseDate: turns a concatenated date into an array of values
*Parameters:
*   concatenated date value
*Returns:
*   array with day month and year respectively indexed
*/
function parseDate(x){
    let day = x%100;
    let month = (x%10000 - day)/100;
    let year = (x - (month*100) - day)/10000;
    return [day, month, year];
}


/*getEdges: Creates edge array with all edges (stored as an edge class)
*Parameters:
*   Data object with the comlumns fromID and toId
*Returns:
*   The edges that we have in this initial situation
*/
// Note: Currently the edges are being stored as an edge class, I did this in case we need the nodes of an edge, if thiss is not needed then I can easily rework it.
function getEdges(data) {
    //create empty array
    var edges = []; 

    //calculate length for each edge and store them as edge element
    for (let i = 0; i < data.length; i++){
        edgeLenght = Math.abs(data.fromId[i] - data.fromId[i]) / (data.length - 1) * 100;
        edges[i] = new Edge(data[i].fromId, data[i].toId, length);
    }

    return edges;
}

/*meanEdgeLength: Computes the mean of the edge length
*Parameters:
*   Array of edges
*Returns:
*   Mean of the edge length
*/
function meanEdgeLength(edges){
    var edgeSum = 0;

    edges.forEach(edge => {
        edgeSum += edge.length;
    });

    return edgeSum / edges.length;
}

/*stdevEdgeLength: Computes the standard deviation of the edge length
*Parameters:
*   Array of edges
*Returns:
*   Standard deviation of the edge length
*/
function stdevEdgeLength(edges){
    var stdevSum = 0;
    var meanEdgeLength = meanEdgeLength(edges);

    edges.forEach(edge => {
        stdevSum += (edge.length - meanEdgeLength)^2;
    });

    return Math.sqrt((1 / (edges.length - 1)) * stdevSum);
}

/*Simulated annealing: Simulated annealing alogrithm to approximate the minimal edge length
*Parameters:
*   Nothing
*Returns:
*   Standard deviation of the edge length
*/
// Note: It is not finished, as there  are some things I'd like to discuss before continuing.
function simulatedAnnealing(){
    var T = 100; // I have no idea yet what to pick as starting Temprature, many get it by trial and error, tho there is a 17 page long paper just on finding the right starting temprature
    var Tmin = .001; //Same with the T0, I don't know what a good value is, will do this later by trial and error or do some research on a method to find a good value.
    var numOfIterations = 100; //Again a random number

    //For the initial solution we take the edges as they are before any reordering
    startEdges = getEdges(data);
    var currentSolution = new Solution(startEdges, stdevEdgeLength(startEdges));

    //Loop until temprature reaches minimal tempreature
    while(T > Tmin) {

        //Iterate until we decrease temprature
        for(let i = 0; i < numOfIterations; i++){

            // **generate newSolution here**

            // If cost of new solution < cost of current solution
            if( /* newSolution.cost must replace the 1*/ 1 < currentSolution.cost){
                currentSolution = 1 /* newSolution */;
            }
            // Calculate probability
            else if(Math.pow(Math.E, (/* newSolution.cost */ - currentSolution.cost) / T) > Math.random())  {
                currentSolution = 1 /* newSolution */;
            }
        }

        T *= 0.1; //I have absolute no idea what I'm doing (yet), We can go for Geometric reduction T = T*a (like it is now) or linear reduction T = T - a
    }

    return currentSolution;
}
