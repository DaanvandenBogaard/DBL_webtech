/*AUTHORS:
Thomas Broers (1538705)
Bas van Hoeflaken (1556282)
*/

//Global arrays
var usableData = [];
var userIndex = [];
var allEdges = [];
var drawnEdges = [];
var wrong_Jobtitles = [];
var jobGroupIndex = [];

//Set default stroke color
var colorSelected = "black";

//Datapath is the location of the user's dataset. 
//FieldName is the name (id) of the visualisationBox the dataset is currently in.
function makeHEB(dataPath, fieldName) {

    d3.select("#" + fieldName).select("#HEBFigure").select("#HEBdiagram").remove();

    //Variables
    var dateRange_HEB;
    //Link elements in dbl_vis.php to variables
    var animToggle = d3.select("#" + fieldName).select("#animateToggle");
    var pauseIcon = d3.select("#" + fieldName).select("#pauseIcon");
    var pauseText = d3.select("#" + fieldName).select(".pauseButton");
    var togglePause = d3.select("#" + fieldName).select("#togglePause");
    var strengthSlider = d3.select("#" + fieldName).select("#strengthSlider");
    var edgeColor = d3.select("#" + fieldName).select("#edgeColor");

    //Date variables
    var endYearAdjust = false;
    var startDate = 0;
    var endDate = 0;

    //The number of the HEB
    var HEB_nr = fieldName.match(/(\d+)/)[0];

    //Check if a wrong jobtitles array exists, if not make an empty one
    if (wrong_Jobtitles.length < (parseInt(HEB_nr) + 1)) {
        wrong_Jobtitles[HEB_nr] = [];
    }

    //Animation variables
    var doAnimate = animToggle.property("checked");
    var isPaused = true;
    var frameTime = 1000;

    //Set selected stroke color
    colorSelected = edgeColor.property("value");

    //Set dimensions
    let margin = { top: 15, right: 10, bottom: 15, left: 10 };
    let figureHeight = 450; //changed this because it was too big for the current fieldsize, but ultimately this should not be hardcoded -Daan
    let figureWidth = 800; //changed this because it was too big for the current fieldsize, but ultimately this should not be hardcoded -Daan
    let diameter = 360;
    let radius = diameter / 2;
    let innerRadius = radius / 10;

    //Reset the job group index
    jobGroupIndex = [];

    //Creating color array
    const color_arr = ["green", "blue", "chartreuse", "cyan", "darkmagenta", "deeppink", "gold", "lightseagreen", "mediumpurple", "olive", "orchid", "seagreen", "grey", "blue", "green", "blue", "green", "blue",];

    //Variables for lines
    var bundleStrength = strengthSlider.property("value");
    var lineOpacity = 1;


    //Processing data

    d3.csv(dataPath).then(function (data) {
        //Since d3.csv is asynchronous (it is not loaded immediatly, but it is a request to the webserver) we need all our code from the data in here. 

        usableData = [];

        //Get the univwersal date range
        dateRange_HEB = findDateRange();
        var startYear = dateRange_HEB['fromYear'];
        var startMonth = dateRange_HEB['fromMonth'];
        var startDay = dateRange_HEB['fromDay'];
        var endYear = dateRange_HEB['toYear'];
        var endMonth = dateRange_HEB['toMonth'];
        var endDay = dateRange_HEB['toDay'];

        //Set dates to right format and set curDate to startDate for start of animation
        startDate = parseInt(startYear + startMonth + startDay);
        endDate = parseInt(endYear + endMonth + endDay);
        var curYear = parseInt(startYear);
        var curDate = startDate;
        console.log(startDate);
        //Construct array with data in a usable order 
        data.forEach(function (d) {
            //Check wheter the toId is already an object, if not create object with first found fromId
            if (!usableData.some(code => code.id == d.toId)) {
                usableData.push({ "id": d.toId, "jobtitle": d.toJobtitle, "mails": [{ "from": d.fromId, "date": dateFormat(d.date), "sent": d.sentiment }] });
                userIndex.push(d.toId);
            }
            //Check wheter fromId is already in mails array, if not add it
            if (notInMails(d.fromId, d.toId, dateFormat(d.date))) {
                var indexOfUser = userIndex.indexOf(d.toId);
                usableData[indexOfUser]["mails"].push({ "from": d.fromId, "date": dateFormat(d.date), "sent": d.sentiment });
            }
        });

        //Sort array by jobtitle
        usableData.sort((a, b) => d3.ascending(a.jobtitle, b.jobtitle) || d3.ascending(a.toId, b.toId));

        //Get unique jobtitles
        let Jobtitles_list = [...new Set(usableData.map(ids => ids.jobtitle))];

        //Deleting all incoming mails from jobtitles that arent included.
        for (k = 0; k < usableData.length; k++) {
            for (j = 0; j < usableData[k].mails.length; j++) {
                var job_offf = findJobtitle(usableData[k].mails[j].from);
                if (wrong_Jobtitles[HEB_nr].includes(job_offf)) {
                    (usableData[k].mails).splice(j, 1);
                    j--;
                }
            }
        }

        //Deleting all users with jobtitles that arent included.
        for (k = 0; k < usableData.length; k++) {
            if (wrong_Jobtitles[HEB_nr].includes(usableData[k].jobtitle)) {
                usableData.splice(k, 1);
                k--;
            }
        }

        //Set angle step
        var angleStep = Math.PI * 2 / usableData.length;

        //Get unique ids
        let unique_ids = [...new Set(usableData.map(ids => ids.id))];

        //Creation HEB

        //Make svg object
        let div = d3.select("#" + fieldName).select("#HEBFigure")
            .append("div")
            .attr("id", "HEBdiagram")
            .attr("Fakewidth", figureWidth)
            .attr("Fakeheight", figureHeight);

        //retrieve width and height:
        var height_HEB = parseFloat(div.attr("Fakeheight")) -20  ;
        var width_HEB = parseFloat(div.attr("Fakewidth")) - 20;
        console.log(div.attr("Fakeheight"));
        let svg = div.append("svg")
        .attr("preserveAspectRatio", "xMinYMid meet")
        .attr("viewBox", "-5 0 " + width_HEB +" "+height_HEB)
        .attr("actWidth" , width_HEB)
        .attr("actHeight" , height_HEB)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //Create tooltip
        var tooltip = div.append("div")
            .attr("class", "tooltip");

        //Creates the group object for all rows in the usableData set
        var g = svg.selectAll("g")
            .data(usableData)
            .enter()
            .append("g");

        g.on("mouseover", function () {
            d3.select(this)
                //Create tooltip
                .attr("", function (d) {
                    //Set incoming and outcoming class
                    incoming = ".to" + d.id;
                    outgoing = ".from" + d.id;
                    tooltip_string = d.id + " is a(n) " + d.jobtitle + "\n Recieved mails from " + d3.selectAll(incoming).size() + " people \n Sent mails to " + d3.selectAll(outgoing).size() + " people";
                });
            tooltip.html(tooltip_string)
                .style("left", (event.x + 5) + "px")
                .style("top", (event.y) + "px");

            d3.select(this).attr("", function () {

                tooltip.style("opacity", 1);
                //Change width color and opacity for incoming selected mails
                d3.selectAll(incoming)
                    .style("opacity", 1)
                    .attr("stroke", "#eb4034")
                    .attr("stroke-width", 2)
                    //Find two way edges for all incoming edges
                    .each(function () {
                        //get  from and to for current path
                        var classes = String(d3.select(this).attr("class"));
                        var from = parseInt(classes.substr(0, classes.indexOf(" ")).replace("from", ""));
                        var to = parseInt(classes.substr(classes.indexOf(" ") + 1, classes.length - 1).replace("to", ""));
                        isTwoWay(from, to);
                    });
                //Make a copy of all outgoing edges
                d3.selectAll(outgoing)
                    .each(function () {
                        var path = d3.select(this).attr("d");
                        svg.append("path")
                            .attr("id", "outgoing")
                            .attr("d", function () { return path })
                            .attr("fill", "none")
                            .attr("stroke", "#40c7d6")
                            .attr("stroke-width", 2);
                    })

                //Raise incoming edges above non selected edges
                d3.select(this).raise().attr("stroke", "#5c5c5c");

                d3.selectAll(".two-way")
                    .each(function () {
                        var path = d3.select(this).attr("d");
                        svg.append("path")
                            .attr("id", "two-way")
                            .attr("d", function () { return path })
                            .attr("fill", "none")
                            .attr("stroke", "#8be667")
                            .attr("stroke-width", 2);
                    })

                //Place tooltip above other elements
                d3.select(tooltip).raise();
            })

        })
            .on("mouseleave", function (d) {
                //Remove tooltip
                tooltip.style("opacity", 0);
                d3.select(this).attr("stroke", null)
                    //Return selected lines to normal
                    .attr("", function (d) {
                        incoming = ".to" + d.id;
                        outgoing = ".from" + d.id;
                    });
                //Reset previously selected paths to normal
                d3.selectAll(incoming)
                    .style("opacity", lineOpacity)
                    .attr("stroke", function (d) { return getStroke(d); })
                    .attr("stroke-width", 1);
                //Delete the copies of outgoing and two-way edges
                d3.selectAll("#outgoing").remove();
                d3.selectAll("#two-way").remove();

                //Remove the two-way class from all paths
                d3.selectAll("path").classed("two-way", false);
            }
            );

        //creates circles for all working persons
        var circle = g.append("circle")
            .attr("cx", function (d, i) {
                return circ_x(radius, i);
            })
            .attr("cy", function (d, i) {
                return circ_y(radius, i);
            })
            .attr("r", 2.5)
            //Fills the circles according to jobtitle
            .attr("fill", function (d) {
                var job_code = Jobtitles_list.indexOf(d.jobtitle);
                return color_arr[job_code];
            });

        //Creates the text for ids
        var id_text = g.append("text")
            .attr("transform", function (d, i) {
                //Check if the angle is passed treshold to see if we need to flip it
                if ((angle = i * angleStep > Math.PI * 0.5) && (angle = i * angleStep < Math.PI * 1.5)) {
                    var angle = angleStep * i * 180 / Math.PI - 180;
                } else {
                    var angle = angleStep * i * 180 / Math.PI;
                }
                //Translate it on the circle with small increase in radius as to not overlap node circles, rotate in the same "transform"
                return "translate(" + (350 + (radius + 6) * (Math.cos(((2 * Math.PI) / usableData.length) * i))) + ", " + (205 + (radius + 6) * (Math.sin(((2 * Math.PI) / usableData.length) * i))) + ") rotate(" + angle + ")"
            })
            .attr("text-anchor", function (d, i) {
                //Check if achor needs to be left or right depending on if the text has been flipped
                if ((angle = i * angleStep > Math.PI * 0.5) && (angle = i * angleStep < Math.PI * 1.5)) {
                    return "end";
                } else {
                    return "start";
                }
            })
            .attr("font-size", "4pt")
            .attr("dominant-baseline", "central")
            .text(function (d, i) { return d.id; });

        //Make an array with its "index" in the middle of all circles so the paths can group in the center
        Jobtitles_list.forEach(function (d) {
            startIndex = findIndex(usableData, d, "front");
            endIndex = findIndex(usableData, d, "back");
            jobGroupIndex.push([d, startIndex + ((endIndex - startIndex) / 2)]);
        })

        //Set colors for gradient
        var gradientColors = ["#4334eb", "#eb9834"];
        var gradientPicker = d3.scaleLinear().range(gradientColors).domain([1, 2]);

        //Set colors for sentiment legend
        var sentColors = ["red", "blue"];
        var sentPicker = d3.scaleLinear().range(sentColors).domain([1, 2]);

        //Edges need to be generated on first pass but need to be able to be redrawn later for animation
        generateEdges();

        //Function that can generate the edges based on mail traffic
        function generateEdges() {
            if (curMonthDisplay != null) {
                curMonthDisplay.attr("opacity", function () {
                    if (doAnimate) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                console.log("yes");
                curMonthText.text("Current month: " + String(curDate).substr(0, 4) + "-" + String(curDate).substr(4, 6));
            }

            svg.selectAll("g")
                .data(usableData)
            allEdges = [];
            console.log(usableData);
            //Make a path for each node
            var edges = g.selectAll("path")
                .data(function (d, i) {

                    //Empty drawnEdges
                    drawnEdges = [];

                    //Array in which all paths that need to be drawn will be passed
                    var mail_lines = [];

                    //Do checks for each mail in mailbox of reciever
                    for (k = 0; k < d.mails.length; k++) {

                        //If animation is not selected check for mails between dates, if animation is selected check for mails in specific month
                        if ((!doAnimate && (d.mails[k]["date"] >= startDate && d.mails[k]["date"] <= endDate)) ||
                            (doAnimate && d.mails[k]["date"] == curDate)) {
                            var fromId = d.mails[k]["from"];
                            var toId = d["id"];
                            var senti = d.mails[k]["sent"];

                            //Check if the same edges (but in a different month) has already been drawn
                            if (notDrawn(d["id"], fromId)) {
                                //Add adresses to drawnEdges so the same path does not get drawn twice
                                drawnEdges.push([d["id"], fromId]);
                                allEdges.push([parseInt(d["id"]), parseInt(fromId)]);

                                //Find the job for sender
                                targetJob = findJobtitle(fromId);

                                //Find coordinates of source of path
                                x_source = circ_x(radius, i);
                                y_source = circ_y(radius, i);

                                //Find coordinates of jobtitle group point
                                x_1 = circ_x(radius / 2, findJobIndex(d["jobtitle"]));
                                y_1 = circ_y(radius / 2, findJobIndex(d["jobtitle"]));

                                //Find coordinates on innercircle of jobtitle
                                x_2 = circ_x(innerRadius, findJobIndex(d["jobtitle"]));
                                y_2 = circ_y(innerRadius, findJobIndex(d["jobtitle"]));

                                //Find coordinates on innercircle of jobtitle of target
                                x_3 = circ_x(innerRadius, findJobIndex(targetJob));
                                y_3 = circ_y(innerRadius, findJobIndex(targetJob));

                                //Find coordinates of jobtitle group point of target
                                x_4 = circ_x(radius / 2, findJobIndex(targetJob));
                                y_4 = circ_y(radius / 2, findJobIndex(targetJob));

                                //Find coordinates of target
                                x_target = circ_x(radius, unique_ids.indexOf(fromId));
                                y_target = circ_y(radius, unique_ids.indexOf(fromId));

                                //Find coordinates of jobtitle group point if both have the same job
                                x_s = circ_x(radius - 100, findJobIndex(d["jobtitle"]));
                                y_s = circ_y(radius - 100, findJobIndex(d["jobtitle"]));

                                //Save coordinates in array
                                var coords = [{ "xcoord": x_source, "ycoord": y_source },
                                { "xcoord": x_1, "ycoord": y_1 },
                                { "xcoord": x_2, "ycoord": y_2 },
                                { "xcoord": x_3, "ycoord": y_3 },
                                { "xcoord": x_4, "ycoord": y_4 },
                                { "xcoord": x_target, "ycoord": y_target }];

                                var shortCoords = [{ "xcoord": x_source, "ycoord": y_source },
                                { "xcoord": x_s, "ycoord": y_s },
                                { "xcoord": x_target, "ycoord": y_target }];

                                //Make line with x and y mapped to the coordinates
                                var line = d3.line()
                                    .x((c) => c.xcoord)
                                    .y((c) => c.ycoord)
                                    //Add a curve to the line, curve depends on bundleStrength
                                    .curve(d3.curveBundle.beta(bundleStrength));

                                //Add lines to array that gets added to the data of the <path> per node and push to incoming of reciever
                                if (d["jobtitle"] == targetJob) {
                                    mail_lines.push({ "from": fromId, "to": d["id"], "path": line(shortCoords), "sent": senti });
                                } else {
                                    mail_lines.push({ "from": fromId, "to": d["id"], "path": line(coords), "sent": senti });
                                }

                                var angle = Math.atan2(y_target - y_source, x_target - x_source) * 180 / Math.PI;

                                //Make gradient (Not functional yet)
                                var linearGradient = d3.select(this).append("defs")
                                    .append("linearGradient")
                                    .attr("id", function (d) {
                                        return "gradient_" + fromId + "_" + toId;
                                    })
                                    .attr("gradientTransform", function (d) {
                                        return "rotate(" + angle + ")";
                                    });

                                //Set first color of gradient
                                linearGradient.append("stop")
                                    .attr("offset", "0%")
                                    .attr("stop-color", gradientPicker(1));

                                //Set last color of gradient
                                linearGradient.append("stop")
                                    .attr("offset", "100%")
                                    .attr("stop-color", gradientPicker(2));
                            }
                        }
                    }

                    //Return array of lines to the path data
                    return mail_lines;

                })
                .enter()
                .append("path")
                .attr("d", function (d) { return d.path; })
                .attr("id", function (d) {
                    return "from_" + d.from + "to_" + d.to + ")";
                })
                .attr("stroke", function (d) {
                    return getStroke(d);
                })
                .attr("fill", "none")
                .attr("stroke-width", 1)
                .style("opacity", lineOpacity)
                .attr("class", function (d) {
                    return "from" + d.from + " to" + d.to;
                });
        }

        //Element that displays the current month for the animation
        var curMonthDisplay = svg.append("g")
            .attr("id", "curMonthDisplay")
            .attr("opacity", function () {
                if (doAnimate) {
                    return 1;
                } else {
                    return 0;
                }
            });

        //Text for current month display
        var curMonthText = curMonthDisplay.append("text")
            .attr("font-size", "11pt")
            .attr("x", 280)
            .attr("y", 12)
            .text("Current month: " + String(curDate).substr(0, 4) + "-" + String(curDate).substr(4, 6));

        //Make array for legend content
        let edgeLegendContent = [{ "item": "incoming", "color": "#eb4034" }, { "item": "outgoing", "color": "#40c7d6" }, { "item": "two-way", "color": "#8be667" }];

        //Create edge legend
        var edgeLegend = svg.selectAll("entries")
            .data(edgeLegendContent)
            .enter()
            .append("g")
            .attr("id", "edgeLegend");

        //Example line for item
        edgeLegend.append("line")
            .attr("x1", 10)
            .attr("x2", 35)
            .attr("y1", function (d, i) {
                return 12 + 18 * i;
            })
            .attr("y2", function (d, i) {
                return 12 + 18 * i;
            })
            .attr("stroke", function (d) {
                return d.color;
            })
            .attr("stroke-width", 2);

        //Text for item
        edgeLegend.append("text")
            .attr("font-size", "11pt")
            .attr("x", 40)
            .attr("y", function (d, i) {
                return 15 + 18 * i;
            })
            .text(function (d) {
                return d.item;
            });

        //Create jobs legend
        var jobLegend = svg.selectAll("entries")
            .data(Jobtitles_list)
            .enter()
            .append("g")
            .attr("id", "jobLegend")
            .attr("style", "cursor: pointer;")
            .on("click", function (d) {
                //When clicking on the legend circles the jobtitle is removed or added back again.
                d3.select(this).attr("", function (d) {
                    if (!wrong_Jobtitles[HEB_nr].includes(d)) {
                        //If it was not removed, it will be removed
                        wrong_Jobtitles[HEB_nr].push(d);
                    }
                    else {
                        //If it was removed, it will be added back
                        wrong_Jobtitles[HEB_nr].splice(wrong_Jobtitles[HEB_nr].indexOf(d), 1);
                    }
                })
                d3.select(this).select("text").attr("text-decoration", function (d) {
                    //Puts a line through when jobtitle is removed.
                    if (wrong_Jobtitles[HEB_nr].includes(d)) {
                        return "line-through";
                    }
                    else { return ""; }
                })
            })
            .on("mouseover", function (d) {
                d3.select(this).raise().attr("stroke", "#5c5c5c");
            })
            .on("mouseleave", function (d) {
                d3.select(this).attr("stroke", null);
            });

        //Example line for item
        jobLegend.append("circle")
            .attr("cx", width_HEB - 150)
            .attr("cy", function (d, i) {
                return 12 + 18 * i;
            })
            .attr("r", 5)
            //Fills the circles according to jobtitle
            .attr("fill", function (d, i) {
                return color_arr[i];
            });


        //Text for item
        jobLegend.append("text")
            .attr("font-size", "11pt")
            .attr("x", width_HEB - 140)
            .attr("y", function (d, i) {
                return 15 + 18 * i;
            })
            .text(function (d, i) { return d; })
            .attr("text-decoration", function (d) {
                //Puts a line through when jobtitle is removed.
                if (wrong_Jobtitles[HEB_nr].includes(d)) {
                    return "line-through";
                }
                else { return ""; }
            });

        //Check if pausebutton has been clicked 
        togglePause.on("click", function () {
            if (!isPaused && doAnimate) {
                isPaused = true;
                pauseIcon.attr("class", "fa fa-play");
                togglePause.text("Play");
                pauseText.text("Play");
                clearTimeout(animTimer);
            } else if (isPaused && doAnimate) {
                isPaused = false;
                pauseIcon.attr("class", "fa fa-pause");
                togglePause.text("Pause");
                pauseText.text("Pause");
                //Draw next frame when unpaused
                nextFrame();
            }
        });

        //Event handler that changes the bundlestrength when changed at slider
        strengthSlider.on("input", function () {
            bundleStrength = strengthSlider.property("value");
            d3.select("#" + fieldName).selectAll("path").remove();
            generateEdges();
        });

        //Make gradient legend gradient
        var linearGradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "linearGradient");
        //Set first color of gradient
        linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", gradientPicker(1));
        //Set last color of gradient
        linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", gradientPicker(2));

        //Make sentiment legend gradient
        var sentGradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "sentGradient");
        //Set first color of gradient
        sentGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", sentPicker(1));
        //Set last color of gradient
        sentGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", sentPicker(2));

        //Draw legend for selected coloring method
        var colorLegend = svg.append("g")
            .attr("id", "colorLegend")
            .attr("font-size", "11pt")
            .attr("opacity", function () {
                if (colorSelected == "none") {
                    return 0;
                } else {
                    return 1;
                }
            });

        var colorLegendTextF = colorLegend.append("text")
            .attr("y", height_HEB - 4)
            .attr("x", function () {
                if (colorSelected == "gradient") {
                    return 163;
                } else if (colorSelected == "sentiment") {
                    return 182;
                }
            })
            .text(function () {
                if (colorSelected == "gradient") {
                    return "From";
                } else if (colorSelected == "sentiment") {
                    return "-1";
                }
            });

        var colorLegendRect = colorLegend.append("rect")
            .attr("y", height_HEB - 15)
            .attr("x", 200)
            .attr("width", 300)
            .attr("height", 15)
            .attr("fill", function () {
                if (colorSelected == "gradient") {
                    return "url(#linearGradient)";
                } else if (colorSelected == "sentiment") {
                    return "url(#sentGradient)";
                }
            });

        var colorLegendTextB = colorLegend.append("text")
            .attr("y", height_HEB - 4)
            .attr("x", 505)
            .text(function () {
                if (colorSelected == "gradient") {
                    return "To";
                } else if (colorSelected == "sentiment") {
                    return "1";
                }
            });

        //Event handler for the selected edge color
        edgeColor.on("change", function () {
            colorSelected = edgeColor.property("value");
            d3.select("#" + fieldName)
                .selectAll("path")
                .attr("stroke", function (d) { return getStroke(d); });

            if (colorSelected == "none") {
                colorLegend.attr("opacity", 0);
            } else if (colorSelected == "gradient") {
                colorLegend.attr("opacity", 1);
                colorLegendTextF.attr("x", 163)
                    .text("From");
                colorLegendRect.attr("fill", "url(#linearGradient)");
                colorLegendTextB.text("To");
            } else if (colorSelected == "sentiment") {
                colorLegend.attr("opacity", 1);
                colorLegendTextF.attr("x", 182)
                    .text("-1");
                colorLegendRect.attr("fill", "url(#sentGradient)");
                colorLegendTextB.text("1");
            }
        });

        var animTimer;

        //If animation is selected and not paused on first pass, draw next frame
        if (doAnimate && !isPaused) {
            animTimer = setTimeout(function () { nextFrame() }, frameTime);
            animTimer;
        }

        //Function to draw next frame
        function nextFrame() {

            //If animation has not reached the endDate, go to next month
            if (curDate != endDate && !isPaused) {
                if (curDate % 100 < 12) {
                    curDate++;
                } else {
                    curYear++;
                    curDate = parseInt(curYear.toString() + "01", 10);
                }

                d3.select("#" + fieldName).selectAll("path").remove();

                generateEdges();

                //If animation has not been paused, wait set time and load next frame
                if (!isPaused) {
                    animTimer = setTimeout(function () { nextFrame() }, frameTime);
                }
            }
        }
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

//Function for getting the date in the right format (yyyymmdd)
function dateFormat(date) {
    u_date = date.split("-")

    return yearMonth = parseInt(u_date[0] + u_date[1] + u_date[2]);
}

//Function for placement on HEB (X)
function circ_x(radius, index) {
    return 350 + radius * (Math.cos(((2 * Math.PI) / usableData.length) * index));
}

//Function for placement on HEB (Y)
function circ_y(radius, index) {
    return 205 + radius * (Math.sin(((2 * Math.PI) / usableData.length) * index));
}

//Function that finds the index of the first or last job that has the searched for jobtitle depending on the direction selected
function findIndex(array, jobtitle, direction) {
    if (direction == "front") {
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
        if (jobGroupIndex[i][0] == jobtitle) {
            return jobGroupIndex[i][1];
        }
    }
}

//Finds the jobtitle for the selected id
function findJobtitle(id) {
    for (i = 0; i < usableData.length; i++) {
        if (usableData[i]["id"] == id) {
            return usableData[i]["jobtitle"];
        }
    }
}

//Function to check if the fromId, toId combination has already been drawn
function notDrawn(from, to) {
    for (i = 0; i < drawnEdges.length; i++) {
        if (drawnEdges[i][0] == from &&
            drawnEdges[i][1] == to) {
            return false;
        }
    }
    return true;
}

//Function to check if two nodes have two-way mail traffic (non functional yet)
function isTwoWay(from, to) {
    //From and to selected from incoming so reverse for outgoing
    var outgoing = ".to" + from;
    var fromOut = "";
    var toOut = "";
    d3.selectAll(outgoing)
        .each(function () {
            var classes = String(d3.select(this).attr("class"));
            fromOut = parseInt(classes.substr(0, classes.indexOf(" ")).replace("from", ""));
            toOut = parseInt(classes.substr(classes.indexOf(" ") + 1, classes.length - 1).replace("to", ""));
            if (from == toOut && to == fromOut) {
                d3.select(this).classed("two-way", true);
            }
        })
}

//Function to determine what stroke to use based on the edgeColor selecter
function getStroke(d) {
    if (colorSelected == "gradient") {
        //Set stroke to link to fitting gradient
        return "url(#gradient_" + d.from + "_" + d.to + ")";
    } else if (colorSelected == "sentiment") {
        //Calculate what color to give stroke based on sentiment
        if (d.sent < 0) {
            return "rgb(" + (122.5 - Math.sqrt(-d.sent) * 122.5) + ", 0, " + (122.5 + (Math.sqrt(-d.sent) * 122.5)) + ")";
        }
        else {
            return "rgb(" + (122.5 - (Math.sqrt(d.sent) * 122.5)) + ", 0," + (122.5 + Math.sqrt(d.sent) * 122.5) + ")";
        }
    } else {
        //If none match set stroke to black
        return "black"
    }
}

