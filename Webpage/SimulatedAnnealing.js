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
    let t = 100;                      //Starting temperature variable
    let tMin = 0.000001;              //Ending temperature 
   //let tMin = 99.0;
    let decrease = 0.999;             //variable temperature is multiplied by for decreasing
    let amountIterations = 1;     //Amount of iterations per temperature

    //Calculates cost of the original input before annealing.
    let currentIDS = IDS.slice();
    let currentEdges = getEdges(data, currentIDS);
    let currentCost = calculateCost(currentEdges, costFunction);

    console.log(meanEdgeLength(currentEdges));

    let smallestCost = currentCost;
    let smallestSol = currentIDS.slice();
    let smallestEdges = currentEdges;
    console.log(currentIDS)
    let one = 0;
    let two = 0;
    while (t > tMin) {
        for (let i = 0; i < amountIterations; i++) {
            //Calulates a new solution, edges and its cost
            let newIDS = newSolution(currentIDS,  t, currentEdges);
            let newEdges = getEdges(data, newIDS);
            let newCost = calculateCost(newEdges, costFunction);         

            //If it is a more optimal solution then it is automatically accepted otherwise it only sometimes accepts it
            if (currentCost > newCost) {
                one++;
                currentIDS = newIDS.slice();
                currentCost = calculateCost(newEdges, costFunction);
                currentEdges = newEdges.slice();
              //  console.log(currentIDS == newIDS)
                //We store the absolute smallest in case the SA process doesnt get to the global minimum, we take the smallest local minimum
                if(newCost < smallestCost){
                    smallestCost = newCost;   
                    smallestSol = newIDS.slice();
                    smallestEdges = newEdges;
                    
                }
            }
            else {
                let ap = Math.pow(Math.E, (currentCost - newCost)/t); //calculates e^(delta/t) for the probability 
                two++;
                //chance of accepting the new solution
                if(ap > Math.random()){
                    currentIDS = newIDS.slice();
                    currentCost = calculateCost(newEdges, costFunction);
                    currentEdges =  newEdges.slice();
                }
            }
        }
        //Decreases temperature
        t *= decrease;
    }
    console.log(one + " " + two)
    console.log(smallestCost)
  
    return smallestSol;
}

/*newSolution: generates a permutation of the array given
Parameters:
    array: array to permute
    t: an integer that dictates the amount of permuting
    edges: array of edge objects representing the edges of the dataset in the IDS permuted order
Returns:
    array: the permuted array
*/
function newSolution(array,  t, edges) {
    let j = Math.floor(Math.random() * 2); //Pick either 0 or 1
    let k = Math.floor((array.length - 1 )*Math.random())  + 1; // Pick random position

    //Switch node with one of it's neighbours (and check extreme cases)
    if(j == 0){                             
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

