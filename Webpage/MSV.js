/*AUTHORS:
Quinten van Eijsden (1529609)

makeMSV: Creates an MSV visualization in the #MSVID division
Parameters:
    dataPath: path to the dataset
Returns:
    None
*/
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
        console.log(IDS);
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

        //Optimize layout
        IDS = optimizeLayout(data, IDS, 1)      

        //Draw edges
        drawEdges(data, IDS);
    }); 
}

/*drawEdges: Draws all edges on the MSV
Parameters:
   data: data object of the edges
   IDS: sequential list of node appearance
Returns:
   None  
*/
function drawEdges(data, IDS){
    let colour = ["red", "green"];
    let lines = d3.select("#MSVID")
                  .select("svg")
                  .append("g");
                    
    data.forEach(function(d) {
        lines.append('line')
               .style("stroke", "red")
          //     .style("opacity", 0.1)
               .style("stroke-width", 1)
               .attr("x1", d.time )
               .attr("y1", IDS[d.fromId - 1] * 5)
               .attr("x2", d.time )
               .attr("y2", IDS[d.toId - 1] * 5);
    })
}

/*findMinMax: Find maximum and minimum
Note: stores min max in the values minDate and maxDate to allow one function for both.
Parameters:
   data object with column date
Returns:
   Array with minimum and maximum
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
Parameters:
   data object with column fromId and toId
Returns:
   unordered array of ids
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
Parameters:
   concatenated date value
Returns:
   array with day month and year respectively indexed
*/
function parseDate(x){
    let day = x%100;
    let month = (x%10000 - day)/100;
    let year = (x - (month*100) - day)/10000;
    return [day, month, year];
}