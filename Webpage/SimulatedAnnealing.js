/* AUTHORS:
Quinten van Eijsden (1529609), Mike van den Anker (1565559)

optimizeLayout: Optimizes the order of nodes to minimize or maximize a cost function
Parameters:
    data: The data object of the visualization
    IDS: An array of node IDS that make up the visualization
    costFunction: a number represenating the cost function to use for optimization 
Returns:
    IDS: the optimized layout given as an array
*/
function optimizeLayout(data, currentIDS, costFunction) {
    //Initialize the annealing parameters
    let t = 5;                      //Starting temperature variable
    let tMin = 0;              //Ending temperature 
    let decrease = 0.01;             //variable temperature is multiplied by for decreasing
    let amountIterations = 10;     //Amount of iterations per temperature
    //let perMul = 150;              //The amount of permutations done by newSolution is t*perMul

    //Calculates cost of the randomly generated first input before annealing.
    let currentEdges = getEdges(data, currentIDS);
    let currentCost = calculateCost(currentEdges);
    console.log(meanEdgeLength(currentEdges));
 //   let contribution = calculateContribution(data, currentIDS, currentEdges, costFunction);
   // let currentCost = calculateCost(data, currentIDS, costFunction);
   let smallestCost = Infinity;
   let smallestSol = currentIDS;

    while (t > tMin) {
        for (let i = 0; i < amountIterations; i++) {
            //Calulates a new solution and its cost
            let newIDS = newSolution(currentIDS,  t, currentEdges);
            let newEdges = getEdges(data, newIDS);
            let newCost = calculateCost(newEdges);
            //let newCost = calculateCost(data, newIDS, costFunction);
           

            ap = Math.pow(Math.E, (currentCost - newCost)/t);

            //If it is a more optimal solution then it is automatically accepted otherwise it only sometimes accepts it
            if ((currentCost > newCost) ) {
                currentIDS = newIDS;
                currentCost = newCost;
                currentEdges = newEdges;
                if(newCost < smallestCost){
                    smallestCost = newCost;
                    smallestSol = newIDS;
                    smallestEdges = newEdges;
                }
                //contribution = calculateContribution(data, currentIDS, currentEdges, costFunction);
              //  console.log(contribution[148][1]);
            }
            else if((ap > Math.random())) {
                if(t < 0.5){
                    console.log(ap + " temp:" + t + " costdelta:" + (currentCost - newCost));
                }
                currentIDS = newIDS;
                currentCost = newCost;
                currentEdges = newEdges;
            }
        }

        //Decreases temperature
        t -= decrease;
        //log costs for debug purposes
       console.log("Currentcost: " + currentCost);
        //console.log("Current temperature: " + t);
        //console.log(contribution[0][1]);
    }
  //  console.log(smallestCost);
    console.log(meanEdgeLength(smallestEdges));
    console.log(smallestCost / 5);

    return smallestSol;
}

/*newSolution: generates a permutation of the array given, where the amount of difference is dictated by t and perMul
Parameters:
    array: array to permute
    variance: an integer that dictates the amount of permuting
Returns:
    array: the permuted array
*/
function newSolution(array,  t, edges) {
 //   let contrArray = calculateContribution2(edges);
  let iterations = Math.ceil(t * 5); //The 5 is based on t not the number of nodes, might need to be changed depending on t
//let nodesToSwap = nodesToSwap(contrArray, iterations);

    for (let i = 0; i < iterations; i++) { 
    let j = Math.floor(Math.random() * 2); // (1)
    //  let j = Math.floor(array.length*Math.random());  //(2)
        let k = Math.floor((array.length - 1 )*Math.random())  + 1; // (1) (2)
    // let highest = contribution[contribution.length - i][0];  (3)
    //  let x = array[k];
    //  array[k] = array[j];               
    // array[j] = x;
    // let k =  nodesToSwap[i];
    if(j == 0){                             // (1)
         if(k == array.length - 1){
             k -= 1;
         }
        let x = array[k];
        array[k] = array[k + 1];
        array[k + 1] = x;
      } else {
        if(k == 0){
            k += 1;
        }
        let x = array[k];
        array[k] = array[k - 1];
        array[k - 1] = x;
      } 
    } 

    return array; 
}

//calulateContribution2: Calculates the contribution for every edge (with stdev as cost)
function calculateContribution2(edges){
    let contribution = new Array(IDS.length).fill(0);
    let mean = meanEdgeLength(edges)

    for(let i = 0; i < edges.length; i++){
        edges[i].contribution =  edges[i].length - mean;
        if(edges[i].contribution === undefined ||edges[i].contribution < 0 ){
            edges[i].contribution = 0;
        }
    }

    for (let i = 0; i < IDS.length; i++) {
        contribution[i] = [i, 0, 0]
    }

    for(let i = 0; i < edges.length; i++){
        contribution[edges[i].nodeA][1] += edges[i].contribution;
        contribution[edges[i].nodeA][2] += 1;
        contribution[edges[i].nodeB][1] += edges[i].contribution;
        contribution[edges[i].nodeB][2] += 1;
    }

    let totalcontribution = 0;
    for(let i = 0; i < contribution.length; i++){
        contribution[i][1] = contribution[i][1] / contribution[i][2]; 
        totalcontribution += contribution[i][1];
    }

    for(let i = 0; i < contribution.length; i++){
        contribution[i][1] = contribution[i][1] / totalcontribution;
    }

    return contribution;
}

//
function nodesToSwap(contrArray, iterations){
    var swapArray;
    for(let j = 0; j < iterations; j++){
        let rand = Math.random();
        let sum = 0;
        for(let i = 0; i < contrArray.length; i++){
            sum += contrArray[i][1];
            if(sum > rand){
                swapArray[j] = contrArray[i][0];
            }
        }
    }
    return swapArray;
}

/*calculateCost: calculates the cost based on the input for use in simulated annealing
Parameters:
    data: the dataset containing the edges
    IDS: solution array
    costFunction: number representing the cost function
Returns
    cost: the result of the function given the IDS input
*/
function calculateCost(edges) {
  //  var cost = 0;
  //  data.forEach(function(d) {
  //      cost += Math.abs(IDS[d.toId - 1] - IDS[d.fromId - 1]);
  //  });
   return stdevEdgeLength(edges) * 5;
   // return cost;
}

/* function calculateContribution(data, IDS, edges, costFunction) {
    //We will begin by implementing a simple minimize edge length
    let contribution = new Array(IDS.length).fill(0);

    for (let i = 0; i < IDS.length; i++) {
        contribution[i] = [i, 0]
    }

    for(let i = 0; i < data.length; i++){
        let costAdded = Math.abs(IDS[data[i].toId - 1] - IDS[data[i].fromId - 1]) / (IDS.length - 1) * 100;
        contribution[data[i].toId - 1][1] += costAdded;
        contribution[data[i].fromId - 1][1] += costAdded;
    }

    /*data.forEach(function(d) {
        let costAdded = stdevEdgeLength(edges, )
        contribution[d.toId - 1][1] += costAdded
        contribution[d.fromId - 1][1] += costAdded
    });

    return sortContribution(contribution);
}

function sortContribution(array) {
    for (let i=1; i < 1000000; i *= 10) {
        array = countingSort(array, i);
    }
    return array
}

function countingSort(array, digit) {
    let count = new Array(10).fill(0);
    let output = new Array(array.length);

    for (let i = 0; i < array.length; i++) {
        count[Math.floor(((array[i][1] % (digit*10))/digit))]++;
    }

    for (let i = 1; i < count.length; i++) {
        count[i] += count[i-1];
    }

    for (let i = array.length - 1; i >= 0; i--) {
        inputDigit = Math.floor(((array[i][1] % (digit*10))/digit));
        output[count[inputDigit] - 1] = array[i];
        count[inputDigit]--;
    }
    return output
} */

/*getEdges: Creates edge array with all edges (stored as an edge class)
*Parameters:
*   Data object with the comlumns fromID and toId
*Returns:
*   The edges that we have in this initial situation
*/
// Note: Currently the edges are being stored as an edge class, I did this in case we need the nodes of an edge, if thiss is not needed then I can easily rework it.
function getEdges(data, IDS) {
    //create empty array
    var edges = []; 

    //calculate length for each edge and store them as edge element
    for (let i = 0; i < data.length; i++){
        Math.abs(IDS[data[i].fromId ] - IDS[data[i].toId ]) / (IDS.length - 1) * 100;
        edges[i] = new Edge(IDS[data[i].fromId ], IDS[data[i].toId] , edgeLenght, 0);
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
    let m = meanEdgeLength(edges);

    edges.forEach(edge => {
        stdevSum += Math.pow(edge.length - m, 2);
    });
   
    return Math.sqrt((1 / (edges.length - 1)) * stdevSum);
}

class Edge {
    constructor(nodeA, nodeB, length, contribution){
        this.nodeA = nodeA;
        this.nodeB = nodeB;
        this.length = length;
        this.contribution = contribution;
    }
}

/* 

function getEdges(data, IDS) {
    //create empty array
    var edges = []; 

    //calculate length for each edge and store them as edge element
    for (let i = 0; i < data.length; i++){
        edgeLength = Math.abs(IDS[data[i].fromId] - IDS[data[i].toId]) / (IDS.length - 1) * 100;
        edges[i] = new Edge(IDS[data[i].fromId], IDS[data[i].toId], edgeLength);
    }
    return edges;
}


function meanEdgeLength(edges){
    var edgeSum = 0;

    edges.forEach(edge => {

        edgeSum += edge.length;
    });
    return edgeSum / edges.length;
}
*/