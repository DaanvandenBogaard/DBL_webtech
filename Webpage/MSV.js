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
    fieldName = '#' + fieldName;
    let margin = {top : 15, right : 10, bottom: 15, left: 10} //For now, hardcoded margins 
    let width = d3.select(fieldName).style("width"); //for now, hardcoded width
    let height = d3.select(fieldName).style("height"); //for now, hardcoded height
    let textpadding = 10;
    var nodeWidthMSV = 80;
    var monthToTime = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let zoom = d3.zoom()
        .on('zoom', (event) => {
            svg.attr('transform', event.transform);
        })
    d3.select(fieldName).style("overflow", "hidden");
    let div = d3.select(fieldName)
              .append("div")
              .attr("id", "MSVID")
              .attr("width" , width)
              .attr("height" , height)
              .call(zoom)
            
    let upperBar = div.append("div").attr("id", "upperVisBox").attr("float", "left")
    let svg = div.append("svg")
               .attr("width" , width)
               .attr("height", height)
               .attr("id" , "visualisation")
               
                
    let g =   svg.append("g")
               .attr("width" , width)
               .attr("height", height)
               .attr("transform" , "translate(" + margin.left  + "," + margin.top +")")
               
    
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
        selectType(data, IDS, colouring, currentIDS, currentColouring, fieldName, minMaxDates[0]);
        selectColor(data, colouring, IDS, currentIDS, currentColouring, fieldName, minMaxDates[0]);

        //Draw edges and create buttons etc
        drawEdges(data, IDS,  colouring, fieldName, minMaxDates[0]);
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
function drawEdges(data, IDS, colouring, fieldName, firstDate){
    const max = d3.max(data, function(d) { return +d.value; });
    let selectedColouring = d3.select(fieldName).select("#MSVID").select(".selectColor").property("value");
    let tooltip = d3.select(fieldName).select("#MSVID")
                  .append("div")
                  .attr("class", "tooltip")
    let lines = d3.select(fieldName).select("#MSVID")
                  .select("svg")
                  .append("g");

    //go to function for drawing gradient if the type is fromTo
    if(selectedColouring === "From-To"){
        gradientEdges(data, IDS, fieldName, firstDate, tooltip);
    }
    else if(selectedColouring === "Blocks"){
        blockEdges(data, IDS, colouring, lines, firstDate, tooltip);
    }
    else {
        normalEdges(data, IDS, colouring, lines, firstDate, tooltip);
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
function selectType(data, IDS, colouring, currentIDS, currentColouring, fieldName, firstDate){
    var types = ["Standard", "Degree", "In-degree", "Out-degree", "Activity", "Edge Length", "Standard Deviation"]

    let select = d3.select(fieldName).select("#MSVID").select("#upperVisBox")
            .append("select")
            .attr('class', 'select')
            .attr('float', 'left')
            .on("change", function(d){
                let selected = d3.select(this).property("value")
                let selectedColouring = d3.select(fieldName).select("#MSVID").select(".selectColor").property("value")
                updateType(selected, selectedColouring, data, IDS, colouring, currentIDS, currentColouring, fieldName, firstDate)
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
function selectColor(data, colouring, IDS, currentIDS, currentColouring, fieldName, firstDate){
    var types = ['None', 'From-To', 'Length', 'Sentiment', 'Blocks']

    let selectColor = d3.select(fieldName).select("#MSVID").select("#upperVisBox")
            .append("select")
            .attr('class', 'selectColor')
            .attr('float', 'left')
            .on("change", function(d){
                let selectedColouring = d3.select(this).property("value");
                let selected = d3.select(fieldName).select("#MSVID").select(".select").property("value");
                updateType(selected, selectedColouring, data, IDS, colouring, currentIDS, currentColouring, fieldName, firstDate);
            })

    let optionsColor = selectColor
        .selectAll('option')
            .data(types)
            .enter()
        .append('option')
            .text(function(d) {return d;})
            .attr("value", function(d) {return d;})
        
}

/*updateType: Updates the type of MSV after selecting an option on the selector
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
function updateType(selected, selectedColouring, data, IDS, colouring, currentIDS, currentColouring, fieldName, firstDate){   
    //If there already is an input for blockcolouring, store its value and remove it. Otherwise set the val to the min of 5 and IDS.lenght /2.  
    let val =  Math.min(5, IDS.length / 2);
    if(document.querySelectorAll(fieldName + ' #MSVID .blockInput').length == 1){
        val = d3.select(fieldName).select("#MSVID").select(".blockInput").property("value");
        d3.select(fieldName).select("#MSVID").select(".blockInput").remove();
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
    else if(selected === "Edge Length"){
        currentIDS = optimizeLayout(data, IDS, selected);
    }
    else if(selected === "Standard Deviation"){
        currentIDS = optimizeLayout(data, IDS, selected)
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
        createBlockBox(data, currentIDS, currentColouring, val, fieldName, firstDate);
        currentColouring = blockColouring(data, currentIDS, d3.select(fieldName).select("#MSVID").select(".blockInput").property("value"));
    } 
    else {
        currentColouring = colouring;
    }

    //clear MSV
    d3.select(fieldName).select("#MSVID").select("svg").selectAll("g").remove();
    d3.select(fieldName).select("#MSVID").select("svg").selectAll("defs").remove();
    d3.select(fieldName).select("#MSVID").select("svg").selectAll("svg").remove();
    d3.select(fieldName).select("#MSVID").selectAll(".legend").remove();
    d3.select(fieldName).select("#MSVID").select("#edgeSampleBox").remove();
    d3.select(fieldName).select("#MSVID").select(".tooltip").remove();

    //draw new MSV
    drawEdges(data, currentIDS, currentColouring, fieldName, firstDate);
    createLegend(currentColouring, fieldName, currentIDS);
}


/*gradientEdges: Draws and colours the edges corresponding to the FromTo selector
Parameters:
    data: The dataset
    IDS: The standard sequential list of node appearance
    fieldName: class tag of the field the current visualization is in
Returns:
    None
*/
function gradientEdges(data, IDS, fieldName, firstDate, tooltip) {
    let svg = d3.select(fieldName).select("#MSVID").select("svg");
    let svgHeight = parseInt(d3.select(fieldName).select("#MSVID").select("svg").style("height"));
    //draw the edges with gradient, add animation if datasetis small enough        
    for(let i = 0; i < data.length; i++) {
            
        //look whether the edge needs to be from-to or to-from and colour/draw accordingly
        if(IDS[data[i].fromId] < IDS[data[i].toId]) {
            
            let line =  svg
                .append("defs").append("linearGradient")
                .attr("id", "grad" + i + "")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", "0%")
                .attr("y1", "" + IDS[data[i].fromId] / svgHeight * 100 + "%" )
                .attr("x2", "0%" )
                .attr("y2", "" + IDS[data[i].toId] / svgHeight * 100 + "%");

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
                .on("mouseover", function(event, d) {	
                    tooltip.style("opacity", .9);	
                    tooltip.style("display","inline");	
                    tooltip.html("Mail from " + data[i].fromEmail + " to " + data[i].toEmail + " on " + addDays(firstDate, data[i].time - 1) + ".")	
                        .style("left",  (event.x + 10) + "px")		
                        .style("top", (event.y - 28) + "px")
                        .style("fill", "black");
                    d3.select(this).style("stroke", "black")
                    d3.select(this).raise()
                    })					
                .on("mouseout", function(d) {		
                    tooltip.style("opacity", 0.2)
                    .style("display","none");
                    d3.select(this).style("stroke", colouring[i])
                });
        } 
        else {
            let line =  svg
                .append("defs").append("linearGradient")
                .attr("id", "grad" + i + "")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", "0%")
                .attr("y1", "" + IDS[data[i].toId] / svgHeight * 100 + "%" )
                .attr("x2", "0%" )
                .attr("y2", "" + IDS[data[i].fromId] / svgHeight * 100 + "%");

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
                .on("mouseover", function(event, d) {	
                    tooltip.style("opacity", .9);	
                    tooltip.style("display","inline");	
                    tooltip.html("Mail from " + data[i].fromEmail + " to " + data[i].toEmail + " on " + addDays(firstDate, data[i].time - 1) + ".")	
                        .style("left",  (event.x + 10) + "px")		
                        .style("top", (event.y - 28) + "px")
                        .style("fill", "black");
                    d3.select(this).style("stroke", "black")
                    d3.select(this).raise()
                    })					
                .on("mouseout", function(d) {		
                    tooltip.style("opacity", 0.2)
                    .style("display","none");
                    d3.select(this).style("stroke", colouring[i])
                });
        }
    }
}

/*blockEdges: Draws and colours the edges corresponding to the blockcolouring and makes sure the coloured edges get drawn on top
Parameters:
   data: data object of the edges
   IDS: sequential list of node appearance
   colouring: Array containing the colour of the edge corresponding to the index of the data
   lines: element in which the lines should be drawn
Returns:
    None
*/
/*function blockEdges(data, IDS, colouring, lines){
    let blockColours = new Array();
    //draw edges, with animation if dataset < 3500, otherwise without
    if(data.length < 3500){              
        for(let i = 0; i < data.length; i++) {
            //make an array of all indices that have a non #D4D4D4 colouring
            if(colouring[i] != "#D4D4D4"){
                blockColours[blockColours.length] = i;
            }

            //draw unimportant edges
            lines.append('line')
                .style("stroke",  "#D4D4D4")
                .style("stroke-width", 1)
                .attr("id", "line" + i)
                .attr("x1", data[i].time )
                .attr("y1", IDS[data[i].fromId] )
                .attr("x2", data[i].time )
                .attr("y2", IDS[data[i].toId])
        }
        //draw important edges so they will be on top
        for(let i = 0; i < blockColours.length; i++){
            //remove the edges so they wont be drawn twice
            lines.select("#line" + blockColours[i]).remove();
            //draw the coloured edges 
            lines.append('line')
                .style("stroke",  colouring[blockColours[i]])
                .style("stroke-width", 1)
                .attr("x1", data[blockColours[i]].time)
                .attr("y1", IDS[data[blockColours[i]].fromId])
                .attr("x2", data[blockColours[i]].time)
                .attr("y2", IDS[data[blockColours[i]].toId])
        }
    }
} */

/*normalEdges: Draws and colours the edges corresponding to the indicated colouring, works for any other colouring than fromTo and Block
Parameters:
   data: data object of the edges
   IDS: sequential list of node appearance
   colouring: Array containing the colour of the edge corresponding to the index of the data
   lines: element in which the lines should be drawn
Returns:
    None
*/
function normalEdges(data, IDS, colouring, lines, firstDate, tooltip){
//draw edges and add nice animation if data set is small enough, else draw it without the animation     
    for(let i = 0; i < data.length; i++) {
        lines.append('line')
            .style("stroke",  colouring[i])
            .style("stroke-width", 1)
            .attr("x1", data[i].time )
            .attr("y1", IDS[data[i].fromId])
            .attr("x2", data[i].time )
            .attr("y2", IDS[data[i].toId])
            .on("mouseover", function(event, d) {	
                tooltip.style("opacity", .9);	
                tooltip.style("display","inline");	
                tooltip.html("Mail from " + data[i].fromEmail + " to " + data[i].toEmail + " on " + addDays(firstDate, data[i].time - 1) + ".")	
                    .style("left",  (event.x + 10) + "px")		
                    .style("top", (event.y - 28) + "px")
                    .style("fill", "black");
                d3.select(this).style("stroke", "black")
                d3.select(this).raise()
                })					
            .on("mouseout", function(d) {		
                tooltip.style("opacity", 0.2)
                .style("display","none");
                d3.select(this).style("stroke", colouring[i])
            });
        }
}

/*normalEdges: Draws and colours the edges corresponding to the blockcolouring and makes sure the coloured edges get drawn on top
Parameters:
   data: data object of the edges
   IDS: sequential list of node appearance
   colouring: Array containing the colour of the edge corresponding to the index of the data
   lines: element in which the lines should be drawn
Returns:
    None
*/
function blockEdges(data, IDS, colouring, lines, firstDate, tooltip){
    let blockColours = new Array();

    //draw edges, with animation if dataset < 3500, otherwise without
       
    for(let i = 0; i < data.length; i++) {

        //make an array of all indices that have a non #D4D4D4 colouring
        if(colouring[i] != "#D4D4D4"){
            blockColours[blockColours.length] = i;
        }
        
        //draw unimportant edges
        lines.append('line')
            .style("stroke",  "#D4D4D4")
            .style("stroke-width", 1)
            .attr("id", "line" + i)
            .attr("x1", data[i].time )
            .attr("y1", IDS[data[i].fromId] )
            .attr("x2", data[i].time )
            .attr("y2", IDS[data[i].toId])
            .on("mouseover", function(event, d) {	
                tooltip.style("opacity", .9);	
                tooltip.style("display","inline");	
                tooltip.html("Mail from " + data[i].fromEmail + " to " + data[i].toEmail + " on " + addDays(firstDate, data[i].time - 1) + ".")	
                    .style("left",  (event.x + 10) + "px")		
                    .style("top", (event.y - 28) + "px")
                    .style("fill", "black");
                d3.select(this).style("stroke", "black")
                d3.select(this).raise()
                })					
            .on("mouseout", function(d) {		
                tooltip.style("opacity", 0.2)
                .style("display","none");
                d3.select(this).style("stroke", colouring[i])
            });
    }
    //draw important edges so they will be on top
    for(let i = 0; i < blockColours.length; i++){
        //remove the edges so they wont be drawn twice
        lines.select("#line" + blockColours[i]).remove();
        //draw the coloured edges 
        lines.append('line')
            .style("stroke",  colouring[blockColours[i]])
            .style("stroke-width", 1)
            .attr("x1", data[blockColours[i]].time)
            .attr("y1", IDS[data[blockColours[i]].fromId])
            .attr("x2", data[blockColours[i]].time)
            .attr("y2", IDS[data[blockColours[i]].toId])
            .on("mouseover", function(event, d) {	
                tooltip.style("opacity", .9);	
                tooltip.style("display","inline");	
                tooltip.html("Mail from " + data[blockColours[i]].fromEmail + " to " + data[blockColours[i]].toEmail + " on " + addDays(firstDate, data[blockColours[i]].time - 1) + ".")	
                    .style("left",  (event.x + 10) + "px")		
                    .style("top", (event.y - 28) + "px")
                    .style("fill", "black");
                d3.select(this).style("stroke", "black")
                d3.select(this).raise()
                })					
            .on("mouseout", function(d) {		
                tooltip.style("opacity", 0.2)
                .style("display","none");
                d3.select(this).style("stroke", colouring[blockColours[i]])
            });
    }
}

function sentimentEdges(data, IDS, colouring, lines, firstDate, tooltip){
    let sentColour = new Array();
   // meanDev 
    //draw edges, with animation if dataset < 3500, otherwise without
       
    for(let i = 0; i < data.length; i++) {

        //make an array of all indices that have a non #D4D4D4 colouring
        if(colouring[i] != "#D4D4D4"){
            sentColour[sentColour.length] = i;
        }
        
        //draw unimportant edges
        lines.append('line')
            .style("stroke",  "#D4D4D4")
            .style("stroke-width", 1)
            .attr("id", "line" + i)
            .attr("x1", data[i].time )
            .attr("y1", IDS[data[i].fromId] )
            .attr("x2", data[i].time )
            .attr("y2", IDS[data[i].toId])
            .on("mouseover", function(event, d) {	
                tooltip.style("opacity", .9);	
                tooltip.style("display","inline");	
                tooltip.html("Mail from " + data[i].fromEmail + " to " + data[i].toEmail + " on " + addDays(firstDate, data[i].time - 1) + ".")	
                    .style("left",  (event.x + 10) + "px")		
                    .style("top", (event.y - 28) + "px")
                    .style("fill", "black");
                d3.select(this).style("stroke", "black")
                d3.select(this).raise()
                })					
            .on("mouseout", function(d) {		
                tooltip.style("opacity", 0.2)
                .style("display","none");
                d3.select(this).style("stroke", colouring[i])
            });
    }
    //draw important edges so they will be on top
    for(let i = 0; i < blockColours.length; i++){
        //remove the edges so they wont be drawn twice
        lines.select("#line" + blockColours[i]).remove();
        //draw the coloured edges 
        lines.append('line')
            .style("stroke",  colouring[blockColours[i]])
            .style("stroke-width", 1)
            .attr("x1", data[blockColours[i]].time)
            .attr("y1", IDS[data[blockColours[i]].fromId])
            .attr("x2", data[blockColours[i]].time)
            .attr("y2", IDS[data[blockColours[i]].toId])
            .on("mouseover", function(event, d) {	
                tooltip.style("opacity", .9);	
                tooltip.style("display","inline");	
                tooltip.html("Mail from " + data[blockColours[i]].fromEmail + " to " + data[blockColours[i]].toEmail + " on " + addDays(firstDate, data[blockColours[i]].time - 1) + ".")	
                    .style("left",  (event.x + 10) + "px")		
                    .style("top", (event.y - 28) + "px")
                    .style("fill", "black");
                d3.select(this).style("stroke", "black")
                d3.select(this).raise()
                })					
            .on("mouseout", function(d) {		
                tooltip.style("opacity", 0.2)
                .style("display","none");
                d3.select(this).style("stroke", colouring[blockColours[i]])
            });
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
function createBlockBox( data, currentIDS, currentColouring, val, fieldName, firstDate){
    d3.select(fieldName).select("#MSVID").select("#upperVisBox")
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
            if(d3.select(fieldName).select("#MSVID").select(".blockInput").property("value") < 1){
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
            d3.select(fieldName).select("#MSVID").select(".legend").remove();
            
            //draw new edges 
            drawEdges(data, currentIDS, currentColouring, fieldName, firstDate);
            createLegend(currentColouring, fieldName, currentIDS);
        })
        .on("keyup", function(d){
            //Handle min max on display
            if(parseInt(this.value) > parseInt(currentIDS.length) - 1){ this.value =currentIDS.length - 1; }
            if(parseInt(this.value) < 1){ this.value =1;}
        });
}

/*function filterJobs(){
    list = d3.select(fieldName).select("#MSVID").select("#upperVisBox")
        .append("ul")
        .attr("class", "anchor")
        .text("Job filter")
    
    let jobs = new Array();
    for(let i = 0; i < data.length; i++){
        jobs[jobs.length] = data[i].fromJobtitle;
        jobs[jobs.length] = data[i].toJobtitle; 
    }
    let uniqueJobs = jobs.filter(self.indexOf(value) === index)
    
    for(let i = 0; i < uniqueJobs.length; i++){
        list.append("li")
            .append("input")
            .attr("type", "checkbox")
            .attr("value", "checked")
            .text("" + uniqueJobs[i])
            .on("change", function(d){

                updateType(selected, selectedColouring, data, IDS, colouring, currentIDS, currentColouring, fieldName)
            })
    }
}*/

/*normalEdges: Draws and colours the edges corresponding to the indicated colouring, works for any other colouring than fromTo and Block
Parameters:
    currentColouring: Current rray containing the colour of the edge corresponding to the index of the data
    fieldName: class tag of the field the current visualization is in
Returns:
    None
*/
function addLegend(currentColouring, fieldName){    
    let checked = false;
    //update legend if active
    if(document.querySelectorAll(fieldName + ' #MSVID #legend').length == 1){
        d3.select(fieldName).select("#MSVID").select("#legend").remove();
        checked = true;
    }
    //create (new) checkbox
    d3.select(fieldName).select("#MSVID").select("#upperVisBox")
            .append("input")
            .attr("id", "legendBox")
            .attr('type', 'checkbox')
            .on("change", function(d){ 
                //Handle toggle
                if(d3.select(this).property("checked")){
					createLegend(currentColouring, fieldName);
				} else {
                    d3.select(fieldName).select("#legend").remove();
				}	
            })
    //set checkbox active if it was active before switching
    if(checked){
        d3.select(fieldName).select("#legendBox").property("checked", true)
        createLegend(currentColouring, fieldName);
    }
}
/*normalEdges: Draws and colours the edges corresponding to the indicated colouring, works for any other colouring than fromTo and Block
Parameters:
    currentColouring: Current rray containing the colour of the edge corresponding to the index of the data
    fieldName: class tag of the field the current visualization is in
Returns:
    None
*/
function createLegend(currentColouring, fieldName, ids){
    //Get the type of the colouring
    let type = d3.select(fieldName).select('#MSVID').select(".selectColor").property("value");
    //make the legend corresponding to the type
    if(type === "From-To"){
        standardLegend(type, fieldName, ids);
    }
    else if(type === "Length"){
        standardLegend(type, fieldName, ids);
    }
    else if(type === "Sentiment"){
        standardLegend(type, fieldName, ids);
    }
    else if(type === "Blocks"){
        blockLegend(currentColouring, fieldName, ids);
    } 

}
/*standardLegend: Draws a corresponding legend to the indicated colouring, works for any other colouring than Block (and standard)
Parameters:
    type: The type of colouring used
    fieldName: class tag of the field the current visualization is in
Returns:
    None
*/
function standardLegend(type, fieldName, ids){
    let legendSVG = d3.select(fieldName).select("#MSVID").select("#visualisation");
    //create SVG that shall contain everything of the legend

    //create orange-blue linear gradient
    let LG = legendSVG.append("defs").append("linearGradient")
        .attr("id", "myGradient")
        .attr("class", "legend")
        
        LG.append("stop")
            .attr("offset", "0%")
            .style("stop-color", "rgb(255, 140, 0)")
            .style("stop-opacity", 1)
                
        LG.append("stop")
            .attr("offset", "100%")
            .style("stop-color", "rgb(0, 0, 255)")
            .style("stop-opacity", 1)
        
    //create the bar of the legend and apply the gradient. Also add the text corresponding to the type
    legendSVG.append("g").append("rect")
        .attr("x", 0.4 * parseInt(d3.select(fieldName).select("#MSVID").style("width")))
        .attr("y", ids.length * 1.2)
        .attr("width",  0.2 * parseInt(d3.select(fieldName).select("#MSVID").style("width")))
        .attr("height", 10)
        .style("fill", "url(#myGradient)") 
        .attr("class", "legend")
    legendSVG.append("text")
        .attr('x', 0.4 * parseInt(d3.select(fieldName).select("#MSVID").style("width")))
        .attr('y', 20 +  ids.length * 1.2)
        .attr("font-size", 12)  
        .text(function(d){
            if(type == "Length"){return "Shortest"}
            else if(type == "From-To"){return "From"}
            else if(type == "Sentiment"){return "Negative"}
        })
        .attr("class", "legend")
    legendSVG.append("text")
        .attr("text-anchor", "end")
        .attr('x', 0.6 *parseInt(d3.select(fieldName).select("#MSVID").style("width")))
        .attr('y', 20 + ids.length * 1.2)
        .attr("font-size", 12)  
        .text(function(d){
            if(type == "Length"){return "Longest"}
            else if(type == "From-To"){return "To"}
            else if(type == "Sentiment"){return "Positive"}
        })
        .attr("class", "legend")
}
/*blockLegend: Draws a corresponding legend to the block colouring
Parameters:
    currentColouring: Current rray containing the colour of the edge corresponding to the index of the data
    fieldName: class tag of the field the current visualization is in
Returns:
    None
*/
function blockLegend(currentColouring, fieldName, ids){
    let legendSVG = d3.select(fieldName).select("#MSVID").select("#visualisation");

    //sorts the colours based on fequency, which will decide the order in which the rects are drawn
    let rects = sortRects(currentColouring);
    //width of the rects calculated based on the usual size of the legend
    let width = (1/(rects.length - 1)) * 0.75 *  0.2 * parseInt(legendSVG.style("width"));
    //this index keeps track of the number of rects infront of the current one
    let cIndex = 0;
    for(let i = 0; i < rects.length; i++){
        if(rects[i][0] != "#D4D4D4"){
            legendSVG.append("rect")
                .attr("x", 0.4 * parseInt(legendSVG.style("width")) + cIndex * width)
                .attr('y', ids.length * 1.2)
                .attr("height", 10)
                .attr("width", width)
                .attr("fill", rects[i][0])
                .attr("class", "legend")
            cIndex++;
        } 
    }

    //draw the noise in the legend
    legendSVG.append("rect")
            .attr('x', 0.4 * parseInt(legendSVG.style("width")) + (rects.length - 1) * width)
            .attr('y', ids.length * 1.2)
            .attr("height", 10)
            .attr("width", 0.25 * 0.2 * parseInt(legendSVG.style("width")))
            .attr("fill", "#D4D4D4")
            .attr("class", "legend")
    
    legendSVG.append("text")
        .attr('x', 0.4 * parseInt(legendSVG.style("width")))
        .attr('y', 20 + ids.length * 1.2)
        .attr("font-size", 12)  
        .text("Largest")
        .attr("class", "legend")
    legendSVG.append("text")
        .attr("text-anchor", "end")
        .attr('x', 0.6 * parseInt(legendSVG.style("width")))
        .attr('y', 20 + ids.length * 1.2)
        .attr("font-size", 12)  
        .text("Noise")
        .attr("class", "legend")
}

/*blockLegend: Sorts the colours of the to be drawn rects based on frequency
Parameters:
    currentColouring: Current rray containing the colour of the edge corresponding to the index of the data
    fieldName: class tag of the field the current visualization is in
Returns:
    An array with all distinct colours and their freuncy sorted decreasingly
*/
function sortRects(currentColouring){
    //get all unique colours
    let colours = [...new Set(currentColouring)]
    let colourAmounts = new Array(colours.length);
    //create array of the colour and the number of edges with that colour
    for(let i = 0; i < colours.length; i++){
        colourAmounts[i] = [colours[i], 0];
    }

    for(let i = 0; i < currentColouring.length; i++){
        colourAmounts[colours.indexOf(currentColouring[i])][1] += 1;
    }

    //sort decreasingly
    colourAmounts.sort(function(a, b){return b[1] - a[1]});

    return colourAmounts;
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

function addDays(date, days){
    date = date + "";
    date = date.substring(0,4) + "-" +  date.substring(4,6) + "-" + date.substring(6,8);  
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    var returnDate = result.toDateString();
    console.log(returnDate)
    //returnDate = returnDate.substring(0, returnDate.indexOf("00:00:00"));
    console.log(returnDate)
    return returnDate;
}