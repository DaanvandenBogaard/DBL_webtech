/*AUTHORS:
Thomas Broers (1538705)
Bas van Hoeflaken (1556282)
*/

function makeHEB(dataPath) {

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

    if(startYear.value < 1998) {
        startYear.value = 1998;
    } else if(startYear.value > 2002) {
        startYear.value = 2002;
    } 

    if(startMonth.value < 1) {
        startMonth.value = 1;
    } else if(startMonth.value > 12) {
        startMonth.value = 12;
    }

    if(startMonth.value.length == 1) {
        startMonth.value = 0 + startMonth.value;
    }

    if(endYear.value < 1998) {
        endYear.value = 1998;
    } else if(endYear.value > 2002) {
        endYear.value = 2002;
    } else if(endYear.value < startYear.value){
        endYear.value = startYear.value;
        endYearAdjust = true;
    }

    if(endMonth.value < 1) {
        endMonth.value = 1;
    } else if(endMonth.value > 12) {
        endMonth.value = 12;
    } else if((endYearAdjust == true || startYear.value == endYear.value) && endMonth.value < startMonth.value) {
        endMonth.value = startMonth.value;
    }

    if(endMonth.value.length == 1) {
        endMonth.value = 0 + endMonth.value;
    }

    startDate = parseInt(startYear.value + startMonth.value);
    endDate = parseInt(endYear.value + endMonth.value);
    var curYear = parseInt(startYear.value);
    var curDate = startDate;

    //Variables and constants
    let margin = { top: 15, right: 10, bottom: 15, left: 10 };
    let figureSize = 1000;
    let diameter = 600;
    let radius = diameter / 2;
    let innerRadius = radius / 10;

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

    d3.csv(dataPath).then(function (data) {
        //Since d3.csv is asynchronous (it is not loaded immediatly, but it is a request to the webserver) we need all our code from the data in here. 

        //Construct array with data in a usable order 

        var usableData = [];
        var userIndex = [];

        //Function for placement on HEB (X)
        function circ_x(radius, index){
            return 320 + radius * (Math.cos(((2 * Math.PI) / 149) * index));
        }

        //Function for placement on HEB (Y)
        function circ_y(radius, index) {
            return 500 + radius * (Math.sin(((2 * Math.PI) / 149) * index));
        } 

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

        function notInMails(curFromId, curToId, curDate) {
            indexOfUser = userIndex.indexOf(curToId);
            for (i = 0; i < usableData[indexOfUser]["mails"].length; i++) {
                if (((usableData[indexOfUser]["mails"][i]["from"] == curFromId) &&
                     usableData[indexOfUser]["mails"][i]["date"] == curDate) || 
                     curToId == curFromId) {
                    return false;
                }
            }
            return true;
        }

        function dateFormat(date) {
           return yearMonth = parseInt(date.replace(/-/, "").slice(0, -3), 10);
        }

        //Sort array by jobtitle
        usableData.sort((a, b) => d3.ascending(a.jobtitle, b.jobtitle) || d3.ascending(a.toId, b.toId));
        var angleStep = Math.PI * 2 / usableData.length;

        //TEMPORARILY array of CEO's
        function ceo_check(d) {
            return d.jobtitle == "CEO"
        }
        const CEO_list2 = usableData.filter(ceo_check);
        var CEO_ids = CEO_list2.map(function (item) { return item.id; });

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
            });

        //Creates the text for ids
        var id_text = g.append("text")
            .attr("transform", function(d, i) {
                if ((angle = i * angleStep >  Math.PI * 0.5) && (angle = i * angleStep <  Math.PI * 1.5)) {
                    var angle = angleStep * i * 180 / Math.PI - 180;
                } else {
                    var angle = angleStep * i * 180 / Math.PI;
                }
                return "translate(" + (320 + (radius + 6) * (Math.cos(((2 * Math.PI) / 149) * i))) + ", " + (500 + (radius + 6) * (Math.sin(((2 * Math.PI) / 149) * i))) + ") rotate(" + angle + ")"
            })
            .attr("text-anchor", function(d, i) {
                if ((angle = i * angleStep >  Math.PI * 0.5) && (angle = i * angleStep <  Math.PI * 1.5)) {
                    return "end";
                } else {
                    return "start";
                }
            })
            .attr("font-size", "10px")
            .attr("dominant-baseline", "central")
            .text(function (d, i) { return d.id; });
            
        //Creates all group points

        var jobGroupIndex = [];

        Jobtitles_list.forEach(function(d){
            startIndex = findIndex(usableData, d, "front");
            endIndex = findIndex(usableData, d, "back");
            jobGroupIndex.push([d, startIndex + ((endIndex - startIndex) / 2)]);
        })

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

        var colors = ["#4334eb", "#eb9834"];
        var colorPicker = d3.scaleLinear().range(colors).domain([1, 2]);

        var linearGradient = svg.append("defs")
                                .append("linearGradient")
                                .attr("id", "linear_gradient");

                  linearGradient.append("stop")
                                .attr("offset", "0%")
                                .attr("stop-color", colorPicker(1));
      
                  linearGradient.append("stop")
                                .attr("offset", "100%")
                                .attr("stop-color", colorPicker(2));

        var drawnEdges = [];

        generateEdges();

        function generateEdges() {

        var edges = g.append("path")
                     .attr("d", function(d,i) {

            if (doAnimate == false) { 
                for (k = 0; k < d.mails.length; k++) { 
                    if ((d.mails[k]["date"] >= startDate) && (d.mails[k]["date"] <= endDate)) {
                        var goto_id = d.mails[k]["from"];
                        if (notDrawn(d["id"], goto_id)) {
                            drawnEdges.push([d["id"], goto_id]);
                            targetJob = findJobtitle(goto_id);
                            x_source  = circ_x(radius, i);
                            y_source = circ_y(radius, i);
                            x_1 = circ_x(radius/2, findJobIndex(d["jobtitle"]));
                            y_1 = circ_y(radius/2, findJobIndex(d["jobtitle"]));
                            x_2 = circ_x(innerRadius, findJobIndex(d["jobtitle"]));
                            y_2 = circ_y(innerRadius, findJobIndex(d["jobtitle"]));
                            x_3 = circ_x(innerRadius, findJobIndex(targetJob));
                            y_3 = circ_y(innerRadius, findJobIndex(targetJob));
                            x_4 = circ_x(radius/2, findJobIndex(targetJob));
                            y_4 = circ_y(radius/2, findJobIndex(targetJob));
                            x_target = circ_x(radius, unique_ids.indexOf(goto_id));
                            y_target = circ_y(radius, unique_ids.indexOf(goto_id));

                            var coords = [{"xcoord": x_source, "ycoord": y_source},
                                          {"xcoord": x_1, "ycoord": y_1},
                                          {"xcoord": x_2, "ycoord": y_2},
                                          {"xcoord": x_3, "ycoord": y_3},
                                          {"xcoord": x_4, "ycoord": y_4},
                                          {"xcoord": x_target, "ycoord": y_target}];

                            var line = d3.line()
                                         .x((c) => c.xcoord)
                                         .y((c) => c.ycoord)
                                         .curve(d3.curveBundle.beta(bundleStrength))

                            return line(coords);
                            
                        } 
                    }
                }
            } else {
                for (k = 0; k < d.mails.length; k++) {
                    if (d.mails[k]["date"] == curDate) {
                        var goto_id = d.mails[k]["from"];
                        if (notDrawn(d["id"], goto_id)) {
                            drawnEdges.push([d["id"], goto_id]);
                            targetJob = findJobtitle(goto_id);
                            x_source  = circ_x(radius, i);
                            y_source = circ_y(radius, i);
                            x_1 = circ_x(radius/2, findJobIndex(d["jobtitle"]));
                            y_1 = circ_y(radius/2, findJobIndex(d["jobtitle"]));
                            x_2 = circ_x(innerRadius, findJobIndex(d["jobtitle"]));
                            y_2 = circ_y(innerRadius, findJobIndex(d["jobtitle"]));
                            x_3 = circ_x(innerRadius, findJobIndex(targetJob));
                            y_3 = circ_y(innerRadius, findJobIndex(targetJob));
                            x_4 = circ_x(radius/2, findJobIndex(targetJob));
                            y_4 = circ_y(radius/2, findJobIndex(targetJob));
                            x_target = circ_x(radius, unique_ids.indexOf(goto_id));
                            y_target = circ_y(radius, unique_ids.indexOf(goto_id));

                            var coords = [{"xcoord": x_source, "ycoord": y_source},
                                          {"xcoord": x_1, "ycoord": y_1},
                                          {"xcoord": x_2, "ycoord": y_2},
                                          {"xcoord": x_3, "ycoord": y_3},
                                          {"xcoord": x_4, "ycoord": y_4},
                                          {"xcoord": x_target, "ycoord": y_target}];

                            var line = d3.line()
                                         .x((c) => c.xcoord)
                                         .y((c) => c.ycoord)
                                         .curve(d3.curveBundle.beta(bundleStrength))

                            return line(coords);
                        }
                    }
                }
            }
                    })
                    .attr("id", "path")
                    .attr("stroke", "url(#linear_gradient)")
                    .attr("fill", "none")
                    .attr("stroke-width", 1)
                    .style("opacity", 0.75);

            function findJobIndex(jobtitle) {
                for (i = 0; i < jobGroupIndex.length; i++) {
                    if (jobGroupIndex[i][0] == jobtitle){
                        return jobGroupIndex[i][1];
                    }
                }
            }

            function findJobtitle(id) {
                for (i = 0; i < usableData.length; i++) {
                    if (usableData[i]["id"] == id){
                        return usableData[i]["jobtitle"];
                    }
                }
            }
        
            function notDrawn(from, to) {
                for(i = 0; i < drawnEdges.length; i++) {
                    if(drawnEdges[i][0] == from &&
                       drawnEdges[i][1] == to) {
                           return false;
                       }
                }
                return true;
            }

            console.log(curDate);
        }

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
                nextFrame();
                console.log("test");
            }
        })

        var animTimer;

        if (doAnimate == true && isPaused == false) {
            animTimer = setTimeout(function(){ nextFrame() }, frameTime);
            animTimer;
        }

        function nextFrame() {
            if (curDate != endDate && isPaused != true){ 
                if (curDate % 100 < 12) {
                    curDate++;
                } else {
                    curYear++;
                    curDate = parseInt(curYear.toString() + "01", 10);
                }

                d3.selectAll("#path").remove();
                generateEdges();

                if (isPaused != true) {
                    animTimer = setTimeout(function(){ nextFrame() }, frameTime);
                }
            }            
        }

            //Testing logs
        console.log(usableData);
        console.log(usableData.length);
        console.log(CEO_list2);
        console.log(Jobtitles_list);
    });

}

