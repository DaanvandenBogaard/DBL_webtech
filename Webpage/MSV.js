/*AUTHORS:
Quinten van Eijsden (1529609), Mike van den Anker (1565559)

makeMSV: Creates an MSV visualization in the #MSVID division
Parameters:
    dataPath: path to the dataset
Returns:
    None
*/
function makeMSV(dataPath, fieldName) {
    //We start by making the SVG element.
    let margin = {top : 15, right : 10, bottom: 15, left: 10} //For now, hardcoded margins 
    let width = 1500; //for now, hardcoded width
    let height = 800; //for now, hardcoded height
    let textpadding = 10;
    var nodeWidthMSV = 80;
    var monthToTime = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    fieldName = '#' + fieldName;
    let div = d3.select(fieldName)
              .append("div")
              .attr("id", "MSVID")
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

        //Create an array of unique ids and a subset array that reassigns values to ids ranging from 0 to n
        let idList = collectIDS(data);
        idList = subsetList(idList);

        //Find the maximum and minimum date of the data set and parse into useable format.
        var minMaxDates = findMinMax(data, "time");
        var minDate = parseDate(minMaxDates[0]);

        //Turn dates into a time variable and change the ids
        data.forEach(function(d) {
            let day = d.time % 100;
            let month = (d.time % 10000 - day)/100;
            let year = (d.time - (month*100) - day)/10000 - minDate[2];
            d.time = (year*365) + monthToTime[month - 1] - monthToTime[minDate[1] - 1] + day - minDate[0];

            //Update id's
            d.fromId = getIndex(d.fromId, idList);
            d.toId = getIndex(d.toId, idList);
        });

        //create IDS list
        let IDS = Array.apply(null, {length: idList.length}).map(Number.call, Number);
        let colouring = new Array(data.length).fill("#0000FF");
        let currentIDS = IDS;
        let currentColouring = colouring;

        //select the type of MSV and colouring 
        selectType(data, IDS, colouring, currentIDS, currentColouring, fieldName);
        selectColor(data, colouring, IDS, currentIDS, currentColouring, fieldName);

        //Draw edges
        drawEdges(data, IDS,  colouring, fieldName);
    }); 
}

/*drawEdges: Draws all edges on the MSV
Parameters:
   data: data object of the edges
   IDS: sequential list of node appearance
   colouring: Array containing the colour of the edge corresponding to the index of the data
   fieldName: class tag of the field the current visualization is in
Returns:
   None  
*/
function drawEdges(data, IDS, colouring, fieldName){
    const max = d3.max(data, function(d) { return +d.value; });
    let lines = d3.select(fieldName).select("#MSVID")
                  .select("svg")
                  .append("g");

    //go to function for drawing gradient
    if(colouring[0] === "fromTo"){
        colourLines(data, IDS, fieldName);
    }

    //draw edges and add nice animation if data set is small enough, else draw it without the animation
    if(data.length < 3500){              
        for(let i = 0; i < data.length; i++) {
        lines.append('line')
            .style("stroke",  colouring[i])
            .style("stroke-width", 1)
            .attr("x1", data[i].time )
            .attr("y1", IDS[data[i].fromId] )
            .attr("x2", data[i].time )
            .transition()
            .duration(2000)
            .attr("y2", IDS[data[i].toId])
        }
    }
    else{
        for(let i = 0; i < data.length; i++) {
            lines.append('line')
            .style("stroke",  colouring[i])
            .style("stroke-width", 1)
            .attr("x1", data[i].time )
            .attr("y1", IDS[data[i].fromId] )
            .attr("x2", data[i].time )
            .attr("y2", IDS[data[i].toId])
        }
    }
}

/*selectType: Creates a selector and adds options for selecting the type of MSV
Parameters:
    data: The dataset
    IDS: The standard sequential list of node appearance
    colouring: The standard array containing the colour of the edge corresponding to the index of the data, containing all blue edges
    currentIDS: The current sequential list of node appearance
    currentColouring: The current array containing the colour of the edge corresponding to the index of the data
    fieldName: class tag of the field the current visualization is in
Returns:
    None
*/
function selectType(data, IDS, colouring, currentIDS, currentColouring, fieldName){
    var types = ["Standard", "Degree", "In-degree", "Out-degree", "Activity"]

    let select = d3.select(fieldName).select("#MSVID")
            .append("select")
            .attr('class', 'select')
            .attr('float', 'left')
            .on("change", function(d){
                let selected = d3.select(this).property("value")
                let selectedColouring = d3.select(fieldName).select("#MSVID").select(".selectColor").property("value")
                updateType(selected, selectedColouring, data, IDS, colouring, currentIDS, currentColouring, fieldName)
            });

    let options = select
        .selectAll('option')
            .data(types)
            .enter()
        .append('option')
            .text(function(d) {return d;})
            .attr("value", function(d) {return d;})
        
}

/*selectColor: Creates a selector and adds options for selecting the type of colouring
Parameters:
    data: The dataset
    IDS: The standard sequential list of node appearance
    colouring: The standard array containing the colour of the edge corresponding to the index of the data, containing all blue edges
    currentIDS: The current sequential list of node appearance
    currentColouring: The current array containing the colour of the edge corresponding to the index of the data
    fieldName: class tag of the field the current visualization is in
Returns:
    None
*/
function selectColor(data, colouring, IDS, currentIDS, currentColouring, fieldName){
    var types = ['None', 'From-To', 'Length', 'Sentiment', 'Blocks']

    let selectColor = d3.select(fieldName).select("#MSVID")
            .append("select")
            .attr('class', 'selectColor')
            .attr('float', 'left')
            .on("change", function(d){
                let selectedColouring = d3.select(this).property("value")
                let selected = d3.select(fieldName).select("#MSVID").select(".select").property("value")
                updateType(selected, selectedColouring, data, IDS, colouring, currentIDS, currentColouring, fieldName)
            })

    let optionsColor = selectColor
        .selectAll('option')
            .data(types)
            .enter()
        .append('option')
            .text(function(d) {return d;})
            .attr("value", function(d) {return d;})
        
}

/*selectType: Updates the type of MSV after selecting an option on the selector
Parameters:
    selected: String of the currently selected type of MSV
    selectedColouring: String of the currently selected type of colouring
    data: The dataset
    IDS: The standard sequential list of node appearance
    colouring: The standard array containing the colour of the edge corresponding to the index of the data, containing all blue edges
    currentIDS: The current sequential list of node appearance
    currentColouring: The current array containing the colour of the edge corresponding to the index of the data
    fieldName: class tag of the field the current visualization is in
Returns:
    None
*/
function updateType(selected, selectedColouring, data, IDS, colouring, currentIDS, currentColouring, fieldName){   
    //If there already is an input for blockcolouring, store its value and remove it. Otherwise set the val to the min of 5 and IDS.lenght /2.  
    let val =  Math.min(5, IDS.length / 2);
    if(document.querySelectorAll(fieldName + ' #MSVID .blockInput').length == 1){
        val = d3.select(fieldName).select("#MSVID").select(".blockInput").property("value");
        d3.select(fieldName).select("#MSVID").select("input").remove();
    }

    //select the right type of MSV
    if(selected === "Degree"){
        currentIDS = degreeSort(data, IDS);
    }
    else if(selected === "In-degree"){
        currentIDS = inDegreeSort(data, IDS);
    }
    else if(selected === "Out-degree"){
        currentIDS = outDegreeSort(data, IDS);
    }
    else if(selected === "Activity"){
        currentIDS = activitySort(data, IDS);
    } 
    else {
        currentIDS = IDS;
    }

    //select the right colouring
    if(selectedColouring === "From-To"){
        currentColouring = fromToColouring(data);
    }
    else if(selectedColouring === "Length"){
        currentColouring = lengthColouring(data, currentIDS);
    }
    else if(selectedColouring === "Sentiment"){
        currentColouring = sentimentColouring(data);
    }
    else if(selectedColouring === "Blocks"){
        //create new input
        createBlockBox(data, currentIDS, currentColouring, val, fieldName);
        currentColouring = blockColouring(data, currentIDS, d3.select(fieldName).select("#MSVID").select(".blockInput").property("value"));
    } 
    else {
        currentColouring = colouring;
    }

    //clear MSV
    d3.select(fieldName).select("#MSVID").select("svg").selectAll("g").remove();
    d3.select(fieldName).select("#MSVID").select("svg").selectAll("defs").remove();

    //draw new MSV
    drawEdges(data, currentIDS, currentColouring, fieldName);
}


/*selectType: Updates the type of colouring after selecting an option on the selector
Parameters:
    data: The dataset
    IDS: The standard sequential list of node appearance
    fieldName: class tag of the field the current visualization is in
Returns:
    None
*/
function colourLines(data, IDS, fieldName) {
    let svg = d3.select(fieldName).select("#MSVID").select("svg");
    
    //draw the edges with gradient, add animation if datasetis small enough
    if(data.length < 3500) {              
        for(let i = 0; i < data.length; i++) {
            
            //look whether the edge needs to be from-to or to-from and colour/draw accordingly
            if(IDS[data[i].fromId] < IDS[data[i].toId]) {
        
                let line =  svg
                    .append("defs").append("linearGradient")
                    .attr("id", "grad" + i + "")
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", "0%")
                    .attr("y1", "" + IDS[data[i].fromId] / 800 * 100 + "%" )
                    .attr("x2", "0%" )
                    .attr("y2", "" + IDS[data[i].toId] / 800 * 100 + "%");

                line.append("stop")
                    .attr("offset", "0%")
                    .style("stop-color", "rgb(255, 140, 0)")
                    .style("stop-opacity", 1)
                
                line.append("stop")
                    .attr("offset", "100%")
                    .style("stop-color", "rgb(0, 0, 255)")
                    .style("stop-opacity", 1)
            
                    svg.select("g").append("line")
                    .attr("stroke", "url(#grad" + i + ")")
                    .style("stroke-width", 1)
                    .attr("x1", data[i].time )
                    .attr("y1", IDS[data[i].fromId] )
                    .attr("x2", data[i].time )
                    .transition()
                    .duration(2000)
                    .attr("y2", IDS[data[i].toId])

            } 
            else {

                let line =  svg
                    .append("defs").append("linearGradient")
                    .attr("id", "grad" + i + "")
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", "0%")
                    .attr("y1", "" + IDS[data[i].toId] / 800 * 100 + "%" )
                    .attr("x2", "0%" )
                    .attr("y2", "" + IDS[data[i].fromId] / 800 * 100 + "%");

                line.append("stop")
                    .attr("offset", "0%")
                    .style("stop-color", "rgb(0, 0, 255)")
                    .style("stop-opacity", 1)
                
                line.append("stop")
                    .attr("offset", "100%")
                    .style("stop-color", "rgb(255, 140, 0)")
                    .style("stop-opacity", 1)
            
                svg.select("g").append("line")
                    .attr("stroke", "url(#grad" + i + ")")
                    .style("stroke-width", 1)
                    .attr("x1", data[i].time )
                    .attr("y1", IDS[data[i].toId] )
                    .attr("x2", data[i].time )
                    .transition()
                    .duration(2000)
                    .attr("y2", IDS[data[i].fromId])
            }
        }
    }
    else{
        for(let i = 0; i < data.length; i++) {  
            if(IDS[data[i].fromId] < IDS[data[i].toId]) {

                let line = svg
                    .append("defs").append("linearGradient")
                    .attr("id", "grad" + i + "")
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", "0%")
                    .attr("y1", "" + IDS[data[i].fromId] / 800 * 100 + "%" )
                    .attr("x2", "0%" )
                    .attr("y2", "" + IDS[data[i].toId] / 800 * 100 + "%");

                line.append("stop")
                    .attr("offset", "0%")
                    .style("stop-color", "rgb(255, 140, 0)")
                    .style("stop-opacity", 1)
                
                line.append("stop")
                    .attr("offset", "100%")
                    .style("stop-color", "rgb(0, 0, 255)")
                    .style("stop-opacity", 1)
            
                svg.select("g").append("line")
                    .attr("stroke", "url(#grad" + i + ")")
                    .style("stroke-width", 1)
                    .attr("x1", data[i].time )
                    .attr("y1", IDS[data[i].fromId] )
                    .attr("x2", data[i].time )
                    .attr("y2", IDS[data[i].toId])

            } 
            else {

                let line = svg
                    .append("defs").append("linearGradient")
                    .attr("id", "grad" + i + "")
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", "0%")
                    .attr("y1", "" + IDS[data[i].toId] / 800 * 100 + "%" )
                    .attr("x2", "0%" )
                    .attr("y2", "" + IDS[data[i].fromId] / 800 * 100 + "%");

                line.append("stop")
                    .attr("offset", "0%")
                    .style("stop-color", "rgb(0, 0, 255)")
                    .style("stop-opacity", 1)
                
                line.append("stop")
                    .attr("offset", "100%")
                    .style("stop-color", "rgb(255, 140, 0)")
                    .style("stop-opacity", 1)
            
                svg.select("g").append("line")
                    .attr("stroke", "url(#grad" + i + ")")
                    .style("stroke-width", 1)
                    .attr("x1", data[i].time )
                    .attr("y1", IDS[data[i].toId] )
                    .attr("x2", data[i].time )
                    .attr("y2", IDS[data[i].fromId])
            }
        }
    }
}

/*createBlockBox: Creates input box for block colouring
Parameters:
    data: The dataset
    currentIDS: The current sequential list of node appearance
    currentColouring: The current array containing the colour of the edge corresponding to the index of the data
    val = the value the inputbox should contain initially
    fieldName: class tag of the field the current visualization is in
Returns:
   None
*/
function createBlockBox( data, currentIDS, currentColouring, val, fieldName){
    d3.select(fieldName).select("#MSVID")
            .append("input")
            .attr('type', 'number')
            .attr('min', "" + 1)
            .attr('max', "" + currentIDS.length)
            .attr('class', 'blockInput')
            .attr('float', 'left')
            .attr('value', val)
            .on("change", function(d){ 
                let newVal = 5;
                //handle min, max
                if(d3.select(fieldName).select("#MSVID").select(".blockInput").property("value") <= 0){
                    newVal = 1;
                }
                else if(d3.select(fieldName).select("#MSVID").select(".blockInput").property("value") > currentIDS.length){
                    newVal = currentIDS.length -1;
                } 
                else{
                    newVal = d3.select(fieldName).select("#MSVID").select(".blockInput").property("value");
                }
                //update colouring
                currentColouring = blockColouring(data, currentIDS, newVal);
                //remove old edges
                d3.select(fieldName).select("#MSVID").select("svg").selectAll("g").remove();
                //draw new edges
                drawEdges(data, currentIDS, currentColouring, fieldName);
            });
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

/* subsetList: creates a list of IDS and their new index, sorted on the IDS
Parameters:
    list of IDS
Returns:
    A nested list of ID index tuples sorted on ID
*/
function subsetList(IDS) {
    let idList = new Array(IDS.length);
    for (let i = 0; i < IDS.length; i++) {
        idList[i] = [IDS[i], i]
    }
    return sortNestedArray(idList, 0);
}

/* getIndex: Takes the subsetlist and assigns each id its new index using binary search
Parameters:
    the id to find the new index of
    the subset list
Returns:
    the index in the subset list corresponding to the id
*/
function getIndex(id, idList) {
    let mindex = 0
    let maxdex = idList.length - 1

    return idList[idBinarySearch(id, idList, mindex, maxdex)][1];
}

function idBinarySearch(id, idList, mindex, maxdex) {
    let i = Math.ceil((maxdex - mindex)/2) + mindex
    if (idList[i][0] == id) {
        return i
    } else if (idList[i][0] > id) {
        return idBinarySearch(id, idList, mindex, (i - 1))
    } else {
        return idBinarySearch(id, idList, i + 1, maxdex)
    }
}

/* sortNestedArray: sorts a nested array on the value in the indexth position of the nested arrays
Parameters:
    nested array to sort
    desired index value
Returns:
    the nested array sorted on the index value
*/
function sortNestedArray(array, index) {
    for (let i=1; i < 1000000; i *= 10) {
        array = countingSort(array, i, index);
    }
    return array
}

function countingSort(array, digit, index) {
    let count = new Array(10).fill(0);
    let output = new Array(array.length);

    for (let i = 0; i < array.length; i++) {
        count[Math.floor(((array[i][index] % (digit*10))/digit))]++;
    }

    for (let i = 1; i < count.length; i++) {
        count[i] += count[i-1];
    }

    for (let i = array.length - 1; i >= 0; i--) {
        inputDigit = Math.floor(((array[i][index] % (digit*10))/digit));
        output[count[inputDigit] - 1] = array[i];
        count[inputDigit]--;
    }
    return output
}