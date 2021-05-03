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
        
        //Construct array with data in a usable order 

        //Filtered data unused
        filteredData = d3.nest()
                         .key(function(d) { return d.fromJobtitle; })
                         .key(function(d) { return d.fromId; })
                         .entries(data);
                         
        var usableData = [];
        var userIndex = [];

        data.forEach(function(d) {
            //Check wheter the toId is already an object, if not create object with first found fromId
            if(!usableData.some(code => code.id == d.toId)) {
                usableData.push({"id": d.toId, "jobtitle": d.toJobtitle, "mails": [d.fromId]});
                userIndex.push(d.toId);
            }
            //Check wheter fromId is already in mails array, if not add it
            if(notInMails(d.fromId, d.toId)) {
                indexOfUser = userIndex.indexOf(d.toId);
                usableData[indexOfUser]["mails"].push(d.fromId);
            }
        });

        function notInMails(curFromId, curToId) {
            indexOfUser = userIndex.indexOf(curToId);
            for (i = 0; i < usableData[indexOfUser]["mails"].length; i++ ) {
                if (usableData[indexOfUser]["mails"][i] == curFromId) {
                    return false;
                }
            }
            return true;
        }
        
        //Sort array by jobtitle
        usableData.sort((a, b) => d3.ascending(a.jobtitle, b.jobtitle) || d3.ascending(a.toId, b.toId));

        //Draw nodes 
        let unique_ids = [...new Set(usableData.map(ids => ids.id))];

        console.log(usableData);
    });
    

}