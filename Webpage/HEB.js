/*AUTHORS:
Thomas Broers (1538705)
Bas van Hoeflaken (1556282)
*/

var usableData = [];
var userIndex = [];
var jobGroupIndex = [];
var drawnEdges = [];

function makeHEB(dataPath) {

    //Link elements in dbl_vis.php to variables
    var startYear = document.getElementById("startYear");
    var startMonth = document.getElementById("startMonth");
    var endYear = document.getElementById("endYear");
    var endMonth = document.getElementById("endMonth");
    var animToggle = document.getElementById("animateToggle");
    var pauseIcon = document.getElementById("pauseIcon");
    var togglePause = document.getElementById("togglePause");

    var endYearAdjust = false;
    var startDate = 0;
    var endDate = 0;

    var doAnimate = animToggle.checked;
    var isPaused = true;
    var frameTime = 1000;

    //Check if startYear is outside of allowed values
    if(startYear.value < 1998) {
        startYear.value = 1998;
    } else if(startYear.value > 2002) {
        startYear.value = 2002;
    } 

    //Check if startMonth is outside of allowed values
    if(startMonth.value < 1) {
        startMonth.value = 1;
    } else if(startMonth.value > 12) {
        startMonth.value = 12;
    }

    //If startMonth is 1-9 add 0 in front to match date format
    if(startMonth.value.length == 1) {
        startMonth.value = 0 + startMonth.value;
    }  

    //Check if endYear is outside of allowed values or below startYear
    if(endYear.value < 1998) {
        endYear.value = 1998;
    } else if(endYear.value > 2002) {
        endYear.value = 2002;
    } else if(endYear.value < startYear.value){
        endYear.value = startYear.value;
        endYearAdjust = true;
    }

    //Check if endMonth is outside of allowed value or if endDate is before startDate
    if(endMonth.value < 1) {
        endMonth.value = 1;
    } else if(endMonth.value > 12) {
        endMonth.value = 12;
    } else if((endYearAdjust == true || startYear.value == endYear.value) && endMonth.value < startMonth.value) {
        endMonth.value = startMonth.value;
    }

    //If endMonth is 1-9 add 0 in front to match date format
    if(endMonth.value.length == 1) {
        endMonth.value = 0 + endMonth.value;
    }

    //Set dates to right format and set curDate to startDate for start of animation
    startDate = parseInt(startYear.value + startMonth.value);
    endDate = parseInt(endYear.value + endMonth.value);
    var curYear = parseInt(startYear.value);
    var curDate = startDate;

    //Set dimensions
    let margin = { top: 15, right: 10, bottom: 15, left: 10 };
    let figureSize = 1000;
    let diameter = 600;
    let radius = diameter / 2;
    let innerRadius = radius / 10;

    //Set the strength of the line curves
    var bundleStrength = 0.90;

    //Delete previous object
    d3.select("#HEBFigure").select("svg").remove();

    //Make svg object
    let div = d3.select("#HEBFigure")
        .attr("width", figureSize)
        .attr("height", figureSize);
    let svg = div.append("svg")
        .attr("width", figureSize)
        .attr("height", figureSize)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip;
    var mails_amount = 0;
    
        tooltip = div.append("div")
        .style("opacity", 0)
        .style("position", "absolute")
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    d3.csv(dataPath).then(function (data) {
        //Since d3.csv is asynchronous (it is not loaded immediatly, but it is a request to the webserver) we need all our code from the data in here. 

        //Construct array with data in a usable order 

        data.forEach(function (d) {
            //Check wheter the toId is already an object, if not create object with first found fromId
            if (!usableData.some(code => code.id == d.toId)) {
                usableData.push({ "id": d.toId, "jobtitle": d.toJobtitle, "mails": [{"from": d.fromId, "date": dateFormat(d.date)}] });
                userIndex.push(d.toId);
            }
            //Check wheter fromId is already in mails array, if not add it
            if (notInMails(d.fromId, d.toId, dateFormat(d.date))) {
                var indexOfUser = userIndex.indexOf(d.toId);
                usableData[indexOfUser]["mails"].push({"from": d.fromId, "date": dateFormat(d.date)});
            }
        });

        //Sort array by jobtitle
        usableData.sort((a, b) => d3.ascending(a.jobtitle, b.jobtitle) || d3.ascending(a.toId, b.toId));
        var angleStep = Math.PI * 2 / usableData.length;

        //Creating color array
        const color_arr = ["green", "blue","chartreuse", "cyan","darkmagenta", "deeppink","gold", "lightseagreen","mediumpurple", "olive","orchid", "seagreen","grey", "blue","green", "blue","green", "blue",];

        //Get unique ids
        let unique_ids = [...new Set(usableData.map(ids => ids.id))];

        //Get unique jobtitles
        let Jobtitles_list = [...new Set(usableData.map(ids => ids.jobtitle))];
        
        //Creates the group object for all rows in the usableData set
        var g = svg.selectAll("g")
            .data(usableData)
            .enter()
            .append("g")

        var circle_clicked = false;

        //creates circles for all working persons
        var circle = g.append("circle")
            .attr("cx", function(d,i){
                return circ_x(300,i);
            })
            .attr("cy", function(d,i){
                return circ_y(300,i);
            })
            .attr("r", 5)
            //Fills the circles according to jobtitle
            .attr("fill", function (d) {
               var job_code = Jobtitles_list.indexOf(d.jobtitle);
               return color_arr[job_code];
            })
            .on("click", function (d) {
            if (!circle_clicked) {
                d3.select(this)
                  .attr("", function (d) { line_class_sel = ".id" + d.id; });
                d3.selectAll(line_class_sel)
                  .attr("stroke-width", 5);
                circle_clicked = true;
            }
            else{
                d3.select(this)
                  .attr("", function (d) { line_class_sel = ".id" + d.id; });
                d3.selectAll(line_class_sel)
                  .attr("stroke-width", 1);
                circle_clicked = false;
                }            
            })
            .on("mouseover", function () {
                d3.select(this)
                  .attr("", function (d) {
                        mails_amount = 0;
                        for (p = 0; p < d.mails.length; p++) {
                            if ((doAnimate == false && (d.mails[p]["date"] >= startDate && d.mails[p]["date"] <= endDate)) ||
                                (doAnimate == true && d.mails[p]["date"] == curDate)) {
                                    var goto_id = d.mails[k]["from"];
                                    if (notDrawn(d["id"], goto_id)) {
                                        mails_amount++;
                                    }
                            }
                        }
                        tooltip_string = d.id + " is a(n) " + d.jobtitle + " has recieved mails from " + mails_amount + " people in this period.";
                    });
                tooltip.html(tooltip_string)
                       .style("left", (event.x + 5) + "px")
                       .style("top", (event.y) + "px");
                tooltip.style("opacity", 1);
                d3.select(this).raise().attr("stroke", "#5c5c5c");
            })
            .on("mouseleave", function (d) {
                tooltip.style("opacity", 0);
                d3.select(this).attr("stroke", null);
            });

        //Creates the text for ids
        var id_text = g.append("text")
            .attr("transform", function(d, i) {
                //Check if the angle is passed treshold to see if we need to flip it
                if ((angle = i * angleStep >  Math.PI * 0.5) && (angle = i * angleStep <  Math.PI * 1.5)) {
                    var angle = angleStep * i * 180 / Math.PI - 180;
                } else {
                    var angle = angleStep * i * 180 / Math.PI;
                }
                //Translate it on the circle with small increase in radius as to not overlap node circles, rotate in the same "transform"
                return "translate(" + (320 + (radius + 6) * (Math.cos(((2 * Math.PI) / 149) * i))) + ", " + (500 + (radius + 6) * (Math.sin(((2 * Math.PI) / 149) * i))) + ") rotate(" + angle + ")"
            })
            .attr("text-anchor", function(d, i) {
                //Check if achor needs to be left or right depending on if the text has been flipped
                if ((angle = i * angleStep >  Math.PI * 0.5) && (angle = i * angleStep <  Math.PI * 1.5)) {
                    return "end";
                } else {
                    return "start";
                }
            })
            .attr("font-size", "10px")
            .attr("dominant-baseline", "central")
            .text(function (d, i) { return d.id; });
        
        //Make an array with its "index" in the middle of all circles so the paths can group in the center
        Jobtitles_list.forEach(function(d){
            startIndex = findIndex(usableData, d, "front");
            endIndex = findIndex(usableData, d, "back");
            jobGroupIndex.push([d, startIndex + ((endIndex - startIndex) / 2)]);
        })

        //Set color scale for gradient
        var colors = ["#4334eb", "#eb9834"];
        var colorPicker = d3.scaleLinear().range(colors).domain([1, 2]);

        //Make gradient
        var linearGradient = svg.append("defs")
                                .append("linearGradient")
                                .attr("id", "linear_gradient");
        
        //Set first color of gradient
        linearGradient.append("stop")
                      .attr("offset", "0%")
                      .attr("stop-color", colorPicker(1));
      
        //Set last color of gradient
        linearGradient.append("stop")
                      .attr("offset", "100%")
                      .attr("stop-color", colorPicker(2));

        //Edges need to be generated on first pass but need to be able to be redrawn later for animation
        generateEdges();

        //Function that can generate the edges based on mail traffic
        function generateEdges() {
        
        //Make a path for each node
        var edges = g.append("path")
                     .attr("d", function(d,i) {
                    
            //Empty drawnEdges
            drawnEdges = [];
            
            //Array in which all paths that need to be drawn will be passed
            var mail_lines = [];
            
            //Do checks for each mail in mailbox of reciever
            for (k = 0; k < d.mails.length; k++) { 

                //If animation is not selected check for mails between dates, if animation is selected check for mails in specific month
                if ((doAnimate == false && (d.mails[k]["date"] >= startDate && d.mails[k]["date"] <= endDate)) ||
                    (doAnimate == true  && d.mails[k]["date"] == curDate)) {
                    var goto_id = d.mails[k]["from"];

                    //Check if the same edges (but in a different month) has already been drawn
                    if (notDrawn(d["id"], goto_id)) {

                        //Add adresses to drawnEdges so the same path does not get drawn twice
                        drawnEdges.push([d["id"], goto_id]);

                        //Find the job for sender
                        targetJob = findJobtitle(goto_id);

                        //Find coordinates of source of path
                        x_source  = circ_x(radius, i);
                        y_source = circ_y(radius, i);

                        //Find coordinates of jobtitle group point
                        x_1 = circ_x(radius/2, findJobIndex(d["jobtitle"]));
                        y_1 = circ_y(radius/2, findJobIndex(d["jobtitle"]));

                        //Find coordinates on innercircle of jobtitle
                        x_2 = circ_x(innerRadius, findJobIndex(d["jobtitle"]));
                        y_2 = circ_y(innerRadius, findJobIndex(d["jobtitle"]));

                        //Find coordinates on innercircle of jobtitle of target
                        x_3 = circ_x(innerRadius, findJobIndex(targetJob));
                        y_3 = circ_y(innerRadius, findJobIndex(targetJob));

                        //Find coordinates of jobtitle group point of target
                        x_4 = circ_x(radius/2, findJobIndex(targetJob));
                        y_4 = circ_y(radius/2, findJobIndex(targetJob));

                        //Find coordinates of target
                        x_target = circ_x(radius, unique_ids.indexOf(goto_id));
                        y_target = circ_y(radius, unique_ids.indexOf(goto_id));

                        //Save coordinates in array
                        var coords = [{"xcoord": x_source, "ycoord": y_source},
                                      {"xcoord": x_1, "ycoord": y_1},
                                      {"xcoord": x_2, "ycoord": y_2},
                                      {"xcoord": x_3, "ycoord": y_3},
                                      {"xcoord": x_4, "ycoord": y_4},
                                      {"xcoord": x_target, "ycoord": y_target}];

                        //Make line with x and y mapped to the coordinates
                        var line = d3.line()
                                     .x((c) => c.xcoord)
                                     .y((c) => c.ycoord)
                                     //Add a curve to the line, curve depends on bundleStrength
                                     .curve(d3.curveBundle.beta(bundleStrength));

                        //Add lines to array that gets added to the data of the <path> per node
                        mail_lines.push(line(coords));
                        
                    } 
                }
            }

            //Return array of lines to the path data
            return mail_lines;

                    })
                    .attr("id", "path")
                    .attr("stroke", "url(#linear_gradient)")
                    .attr("fill", "none")
                    .attr("stroke-width", 1)
                    .style("opacity", 0.75)
                    //Make line wide when selected
                    .attr("class", function (d) {
                        line_class = "id" + d.id;
                        return line_class;
                    });

        }

        //Check if pausebutton has been clicked 
        togglePause.addEventListener("click", function() {
            if (isPaused == false) {
                isPaused = true;
                pauseIcon.className = "fa fa-play";
                togglePause.innerHTML = "Play";
                clearTimeout(animTimer);
            } else {
                isPaused = false;
                pauseIcon.className = "fa fa-pause";
                togglePause.innerHTML = "Pause";
                //Draw next frame when unpaused
                nextFrame();
            }
        })

        var animTimer;

        //If animation is selected and not paused on first pass, draw next frame
        if (doAnimate == true && isPaused == false) {
            animTimer = setTimeout(function(){ nextFrame() }, frameTime);
            animTimer;
        }

        //Function to draw next frame
        function nextFrame() {

            //If animation has not reached the endDate, go to next month
            if (curDate != endDate && isPaused != true){ 
                if (curDate % 100 < 12) {
                    curDate++;
                } else {
                    curYear++;
                    curDate = parseInt(curYear.toString() + "01", 10);
                }

                //Remove all paths from previous month and draw new paths of current month
                d3.selectAll("#path").remove();
                generateEdges();

                //If animation has not been paused, wait set time and load next frame
                if (isPaused != true) {
                    animTimer = setTimeout(function(){ nextFrame() }, frameTime);
                }
            }            
        }

        //Testing logs
        console.log(usableData);
        console.log(usableData.length);
        console.log(Jobtitles_list);
        console.log(counter);
    });

}

//Function for checking if a mail from the same person in the same month is already in the mails array of the reciever
function notInMails(curFromId, curToId, date) {
    indexOfUser = userIndex.indexOf(curToId);
    for (i = 0; i < usableData[indexOfUser]["mails"].length; i++) {
        if (((usableData[indexOfUser]["mails"][i]["from"] == curFromId) &&
             usableData[indexOfUser]["mails"][i]["date"] == date) || 
             curToId == curFromId) {
            return false;
        }
    }
    return true;
}

//Function for getting the date in the right format (yyyymm)
function dateFormat(date) {
    return yearMonth = parseInt(date.replace(/-/, "").slice(0, -3), 10);
 }

//Function for placement on HEB (X)
function circ_x(radius, index){
    return 320 + radius * (Math.cos(((2 * Math.PI) / 149) * index));
}

//Function for placement on HEB (Y)
function circ_y(radius, index) {
    return 500 + radius * (Math.sin(((2 * Math.PI) / 149) * index));
} 

//Function that finds the index of the first or last job that has the searched for jobtitle depending on the direction selected
function findIndex(array, jobtitle, direction) {
    if (direction == "front"){
        for (i = 0; i < array.length; i++) {
            if (array[i]["jobtitle"] == jobtitle) {
                return i;
            }
        }
    } else {
        for (i = array.length - 1; i > 0; i--) {
            if (array[i]["jobtitle"] == jobtitle) {
                return i;
            }
        }
    }
}

//Find the index for the group point of the jobtitle for the target
function findJobIndex(jobtitle) {
    for (i = 0; i < jobGroupIndex.length; i++) {
        if (jobGroupIndex[i][0] == jobtitle){
            return jobGroupIndex[i][1];
        }
    }
}

//Finds the jobtitle for the selected id
function findJobtitle(id) {
    for (i = 0; i < usableData.length; i++) {
        if (usableData[i]["id"] == id){
            return usableData[i]["jobtitle"];
        }
    }
}

//Function to check if the fromId, toId combination has already been drawn
function notDrawn(from, to) {
    for(i = 0; i < drawnEdges.length; i++) {
        if(drawnEdges[i][0] == from &&
           drawnEdges[i][1] == to) {
               return false;
           }
    }
    return true;
}
