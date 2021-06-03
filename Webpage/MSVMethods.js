/*AUTHORS:
Mike van den Anker (156559)

/* outDegreeSort: sorts the IDS based on out-degree
Parameters:
    The data and list of IDS
Returns:
    the IDS sorted on out-degree
*/
function outDegreeSort(data, IDS){
    return degreeSortReturn(data, IDS, 'out');
}

/* inDegreeSort: sorts the IDS based on in-degree
Parameters:
    The data and list of IDS
Returns:
    the IDS sorted on in-degree
*/
function inDegreeSort(data, IDS){
    return degreeSortReturn(data, IDS, 'in');
}

/* degreeSort: sorts the IDS based on total degree
Parameters:
    The data and list of IDS
Returns:
    the IDS sorted on total degree
*/
function degreeSort(data, IDS){
    return degreeSortReturn(data, IDS, 'all')
}

/* degreeSort: sorts the IDS based on total degree
Parameters:
    The data, list of IDS and the type of degree sort
Returns:
    The IDS sorted on the type of degree that was passed
*/
function degreeSortReturn(data, IDS, type){
    //Create a bunch of empty arrays
    let degreeArray = new Array(IDS.length).fill(0);
    let returnArray = new Array(IDS.length).fill(0);
    let sortedArray = new Array(IDS.length).fill(0);

    //create 2 dimentional array of the index and the degree
    for (let i = 0; i < IDS.length; i++) {
        degreeArray[i] = [i, 0];
    }

    //Count the desired degree
    if(type == 'out'){
        for (let i = 0; i < data.length; i++) {
            degreeArray[data[i].fromId][1] += 1;
        }
    } 
    else if(type == 'in'){
        for (let i = 0; i < data.length; i++) {
           degreeArray[data[i].toId][1] += 1;
        }
    }
    else if(type == 'all'){
        for (let i = 0; i < data.length; i++) {
            degreeArray[data[i].toId][1] += 1;
            degreeArray[data[i].fromId][1] += 1;
         }
    }

    //Sort array increasingly
    degreeArray.sort(function(a, b){return a[1] - b[1]});

    //Let sortedArray be the first column of degreeArray
    for (let i = 0; i < degreeArray.length; i++) {
        sortedArray[i] = degreeArray[i][0];
    }

    //To correctly return the IDS we want the value of sorted array to be mapped to its index
    for (let i = 0; i < degreeArray.length; i++) {
        returnArray[i] = sortedArray.indexOf(i);
    }

    return returnArray;
}

/* activitySort: sorts the IDS based on their activity
Parameters:
    The data, list of IDS and the type of degree sort
Returns:
    The IDS sorted on the activity
*/
function activitySort(data, IDS){
    let xPosArray = new Array(IDS.length).fill(0);
    let sortedArray = new Array(IDS.length).fill(0);
    let returnArray = new Array(IDS.length).fill(0);

    //create 2 dimentional array of the index and the average x-pos
    for (let i = 0; i < IDS.length; i++) {
        xPosArray[i] = [IDS[i], 0];
    }
    console.log(xPosArray)
    //calculate the average xPos for every node
    for (let i = 0; i < xPosArray.length; i++) {
        xPosArray[i][1] = calcAverageXPos(IDS[i], data);
    }

    //Sort the array increasingly
    xPosArray.sort(function(a, b){return a[1] - b[1]});

    //Select the first column of the xPosArray
    for (let i = 0; i < xPosArray.length; i++) {
        sortedArray[i] = xPosArray[i][0];
    }

    //To correctly return the IDS we want the value of sorted array to be mapped to its index
    for (let i = 0; i < sortedArray.length; i++) {
       returnArray[i] = sortedArray.indexOf(i);
    }    

    return returnArray;
}


/* calcAverageXPos: calculates the average x of a node v
Parameters:
    The data and a node v 
Returns:
    The average x position of the node v
*/
function calcAverageXPos(v, data){
    //select edges that v goes to and goes from and combine them
    let edgesFrom = data.filter(x => x.fromId === v);
    let edgesTo = data.filter(x => x.toId === v);
    let E_v = edgesFrom.concat(edgesTo);

    let edgeSum = 0;
    for(let i = 0; i < E_v.length; i++){
        edgeSum += E_v[i].time / data.length;
    }

    //calculate mean as described in paper
    let meanX = (1 / E_v.length) * edgeSum;

    return meanX;
}

/* sentimentColouring: Creates a colouring based on sentiment
Parameters:
    The data
Returns:
    An array that represents the sentiment in a rgb colour expression, the index of the array corresponds with the index of the data
*/
function sentimentColouring(data){
    let colouring = new Array(data.length);

    for(let i = 0; i < data.length; i++){
        //Sentiment from [-1, 1] to [0, 1]
        let sentiment = (data[i].sentiment / 2) + 0.5; 
        colouring[i] = "rgb(" + (1 - sentiment) * 255 + ", " +  (1 - sentiment) * 140 +", " + sentiment * 255 + ")"; 
    }

    return colouring;
}

/* lengthColouring: Creates a colouring based on the edgelength
Parameters:
    The data and IDS list
Returns:
    An array that represents the length in a rgb colour expression, the index of the array corresponds with the index of the data
*/
function lengthColouring(data, IDS){
    let colouring = new Array(data.length);

    for(let i = 0; i < data.length; i++){
        let edgeLength = Math.abs(IDS[data[i].fromId ] - IDS[data[i].toId ]) / (IDS.length - 1);

        //for now has 2 colours, could make it an interval based thing e.g. [0, 0.33] red - greed [0.33, 0.67] green - blue [0.67, 1] blue - pink
        colouring[i] = "rgb(" + (1 - edgeLength) * 255 + ", " +  (1 - edgeLength) * 140 +", " + edgeLength * 255 + ")"; 
    }

    return colouring;
}

/* fromToColouring: Colouring that indicates the lines should be gradient fromTo
Parameters:
    The data and IDS list
Returns:
    An array with only  a first element that will indicate the colouringLines function should be used
*/
function fromToColouring(data){
    colouring = new Array(data.length);
    colouring[0] = "fromTo";
    return colouring;
}

/* blockColouring: Creates a colouring based on the edgelength
Parameters:
    The data and IDS list
Returns:
    An array that represents the colouring of the biggest edge sets
*/
function blockColouring(data, IDS, blockNumber){
    let colouring = new Array(data.length).fill("#D4D4D4");
    var messageCount = new Array();
    var arrayBlocks = new Array();

    for(let i = 0; i < data.length; i++){
        //if there does not exist an element for this nodeset yet create one and add data[i] (edge) to the edgeset of these nodes
        if(!messageCount.some(row => row.includes(IDS[data[i].fromId] + '' + IDS[data[i].toId]))){
            messageCount[messageCount.length] = [IDS[data[i].fromId] + '' + IDS[data[i].toId], [data[i]]];
        }
        else {
            //add data[i] (edge) to corresponding edgeset
            let messageArr = messageCount[messageCount.findIndex(row => row.includes(IDS[data[i].fromId] + '' + IDS[data[i].toId]))];
            messageArr[messageArr.length] = data[i];
        }
    }
    
    //create array containing the edgeset and the edgesets length
    for(let i = 0; i < messageCount.length; i++){
        arrayBlocks[arrayBlocks.length] =  [messageCount[i], messageCount[i].length];
    }
    //sort array decreasingly on the edgeset length
    arrayBlocks.sort(function(a, b){return b[1] - a[1]});

    //for the desired number of edgesets, give the edges in the sets a colour corresponding to the edgeset
    for (let i = 0; i < blockNumber; i++) {
        let stringColor = arrayBlocks[i][0];
        let color = getColor(parseInt(stringColor));
        for (let j = 0; j < arrayBlocks[i][1]; j++) {
            let index = data.indexOf(arrayBlocks[i][0][j]);
            colouring[index] = color;
        }
    }
    return colouring;
}

//Daan's colour function
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