/* AUTHORS:
Quinten van Eijsden (1529609), Mike van den Anker (1565559)
*/

class Edge {
    constructor(nodeA, nodeB, length){
        this.nodeA = nodeA;
        this.nodeB = nodeB;
        this.length = length;
    }
}

/*optimizeLayout: Optimizes the order of nodes to minimize or maximize a cost function
Parameters:
    data: The data object of the visualization
    IDS: An array of node IDS that make up the visualization
    costFunction: a number represenating the cost function to use for optimization 
Returns:
    IDS: the optimized layout given as an array
*/
function optimizeLayout(data, IDS, costFunction) {
    //Initialize the annealing parameters
    let t = 100                      //Starting temperature variable
    let tMin = 0.00001;              //Ending temperature 
   //let tMin = 99.0;
    let decrease = 0.999;             //variable temperature is multiplied by for decreasing
    let amountIterations = 1;     //Amount of iterations per temperature

    //Calculates cost of the original input before annealing.
    let currentIDS = Array.from(IDS);
    let currentEdges = getEdges(data, currentIDS);
    let currentCost = calculateCost(currentEdges, costFunction);

    console.log(meanEdgeLength(currentEdges));
     currentEdges = getEdges(data, currentIDS);
     console.log(meanEdgeLength(currentEdges));
    let smallestCost = currentCost;
    let smallestSol = Array.from(currentIDS);
    let smallestEdges = currentEdges;
    console.log(currentIDS)

    while (t > tMin) {
        for (let i = 0; i < amountIterations; i++) {
            //Calulates a new solution, edges and its cost
            let newIDS = newSolution(currentIDS,  t, currentEdges);
            let newEdges = getEdges(data, newIDS);
            let newCost = calculateCost(newEdges, costFunction);         

            //If it is a more optimal solution then it is automatically accepted otherwise it only sometimes accepts it
            if (currentCost > newCost && currentCost != newCost) {
                
                currentIDS = newIDS;
                currentCost = calculateCost(newEdges, costFunction);
                currentEdges = newEdges;
                console.log(currentIDS == newIDS)
                //We store the absolute smallest in case the SA process doesnt get to the global minimum, we take the smallest local minimum
                if(newCost < smallestCost){
                    smallestCost = calculateCost(newEdges, costFunction);   
                    smallestSol = newIDS.slice();
                    smallestEdges = newEdges;


                        console.log(smallestSol)
                        console.log(newIDS)
                        console.log(newEdges) 
                        console.log(newCost)
                        edgeUwU = getEdges(data, smallestSol);
                        console.log(edgeUwU);
                    
                }
             //   
            }
            else {
                let ap = Math.pow(Math.E, (currentCost - newCost)/t); //calculates e^(delta/t) for the probability 

                //chance of accepting the new solution
                if(ap > Math.random()){
                    currentIDS = newIDS;
                    currentCost = calculateCost(newEdges, costFunction);
                    currentEdges =  newEdges;
                }
            }
        }
        //Decreases temperature
        t *= decrease;
     //   console.log("Currentcost: " + currentCost);
    }
    console.log(currentIDS == smallestSol)
    console.log(meanEdgeLength(smallestEdges));
    console.log(smallestEdges );
    console.log(smallestSol[data[0].fromId] + " " + data[0].fromId)

    console.log(smallestSol)

    currentEdges = getEdges(data, smallestSol);
    console.log(meanEdgeLength(currentEdges) == meanEdgeLength(smallestEdges));

    let returnArray = new Array(smallestSol);
    for (let i = 0; i < smallestSol.length; i++) {
        returnArray[i] = smallestSol.indexOf(i);
    }    
    return smallestSol;
}

/*newSolution: generates a permutation of the array given, where the amount of difference is dictated by t and perMul
Parameters:
    array: array to permute
    t: an integer that dictates the amount of permuting
    edges: array of edge objects representing the edges of the dataset in the IDS permuted order
Returns:
    array: the permuted array
*/
function newSolution(array,  t, edges) {
  //let iterations = Math.ceil(t * 5); //The 5 is based on t not the number of nodes, might need to be changed depending on t
    let j =  Math.floor((array.length - 1 )*Math.random());
    let k = Math.floor((array.length - 1 )*Math.random()) ; //choose random element
   // console.log(array + " j:" +j + " k: " + k)
    //do the switcheroo
    let x = array[k];
    array[k] = array[j];               
    array[j] = x;
   // console.log(array)

    return array; 
}

/*calculateCost: calculates the cost based on the input for use in simulated annealing
Parameters:
    edges: array of edge objects representing the edges of the dataset in the IDS permuted order
    costFunction: string representing the cost function
Returns
    cost: the result of the function given the IDS input
*/
function calculateCost(edges, costFunction) {
    if(costFunction === "Edge Length"){
        return meanEdgeLength(edges) ;
    }
    else if(costFunction === "Standard Deviation"){
        return stdevEdgeLength(edges) ;
    }
    //block overlap goes here
}

/*getEdges: Creates edge array with all edges (stored as an edge class) and calculates its lenght
*Parameters:
*   Data object with the comlumns fromID and toId
    IDS: An array of node IDS that make up the visualization
*Returns:
*   The edges that we have in this initial situation
*/
function getEdges(data, IDS) {
    //create empty array
    var edges = new Array(data.length); 
    
    //calculate length for each edge (after permutation) and store them as edge element
    for (let i = 0; i < data.length; i++){
        let edgeLength = (Math.abs(IDS[data[i].fromId] - IDS[data[i].toId]) / (IDS.length - 1)) * 100;
        //Math.abs(IDS[data[i].fromId ] - IDS[data[i].toId ]) / (IDS.length - 1) * 100;
        edges[i] = new Edge(IDS[data[i].fromId ], IDS[data[i].toId] , edgeLength);
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
*   edges: Array of edges
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

