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

        //Create an array of unique ids and a subset array that reassigns values to ids ranging from 0 to n
        let idList = collectIDS(data);
        idList = subsetList(idList);

        //Find the maximum and minimum date of the data set and parse into useable format.
        var minMaxDates = findMinMax(data, "time");
        var minDate = parseDate(minMaxDates[0])

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

        //Optimize layout
        let IDS = Array.apply(null, {length: idList.length}).map(Number.call, Number)
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
               .attr("y1", IDS[d.fromId] * 5)
               .attr("x2", d.time )
               .attr("y2", IDS[d.toId] * 5);
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