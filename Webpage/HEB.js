/*AUTHORS:
Thomas Broers (1538705)
Bas van Hoeflaken (1556282)
*/


function makeHEB(dataPath) {
    //VARIABLES AND CONSTANTS
    //VARIABLES AND CONSTANTS
    //VARIABLES AND CONSTANTS
    let margin = { top: 15, right: 10, bottom: 15, left: 10 };
    let diameter = 1000;
    let radius = diameter / 2;
    let innerRadius = radius - 120
    let radius1 = 300;

    var i_g = 0;
    var first_i = 0;
    var bundleStrength = 0.85;
    var startDate = 0;
    var endDate = 999999999;

    var usableData = [];
    var userIndex = [];
    var group = [];
    var mail_line = [];

    var prev_title = "";

    var endYearAdjust = false;

    //The next couple variables are for the coloring of edges
    var colors = ["#4334eb", "#eb9834"];
    var colorPicker = d3.scaleLinear().range(colors).domain([1, 2]);


    //Color array for different jobtitles
    const color_arr = ["green", "blue", "chartreuse", "cyan", "darkmagenta", "deeppink", "gold", "lightseagreen", "mediumpurple", "olive", "orchid", "seagreen", "grey", "blue", "green", "blue", "green", "blue",];

    //MAIN FUNCTION
    //MAIN FUNCTION
    //MAIN FUNCTION
    //Reads the inputs for date
    var startYear = document.getElementById("startYear");
    var startMonth = document.getElementById("startMonth");
    var endYear = document.getElementById("endYear");
    var endMonth = document.getElementById("endMonth");

    //Make svg object
    let div = d3.select("#HEBFigure")
        .attr("width", diameter)
        .attr("height", diameter);
    let svg = div.append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Appends gradient
    var linearGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "linear_gradient");

    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorPicker(1));

    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorPicker(2));

    //Since d3.csv is asynchronous (it is not loaded immediatly, but it is a request to the webserver) we need all our code from the data in here. 
    d3.csv(dataPath).then(function (data) {

        //TESTING PURPOSES ONLY:
        console.log("STARTDATE" + startDate);

        //Forming array better suited for visualisation
        data.forEach(function (d) {
            //First it checks if the date is in the given interval
            if (dateFormat(d.date) >= startDate && dateFormat(d.date) <= endDate) {
                //Add all unique recipients with jobtitle and an empty array of incoming mails
                if (!usableData.some(code => code.id == d.toId)) {
                    usableData.push({ "id": d.toId, "jobtitle": d.toJobtitle, "mails": [], "dates": [] });
                    userIndex.push(d.toId);
                }
                //Add all unique incoming mails/dates to the mails/dates array
                indexOfUser = userIndex.indexOf(d.toId);
                usableData[indexOfUser]["mails"].push(d.fromId);
                usableData[indexOfUser]["dates"].push(dateFormat(d.date));
            }
        });

        //Sort usableData by jobtitle
        usableData.sort((a, b) => d3.ascending(a.jobtitle, b.jobtitle) || d3.ascending(a.toId, b.toId));

        //Get unique ids
        let unique_ids = [...new Set(usableData.map(ids => ids.id))];

        //Get unique jobtitles
        let Jobtitles_list = [...new Set(usableData.map(ids => ids.jobtitle))];

        //Creates the svg object
        var svg1 = d3.select("body").append("svg")
            .attr("width", 500)
            .attr("height", 500);

        //Creates the group object for all rows in the usableData set
        var g = svg.selectAll("g")
            .data(usableData)
            .enter()
            .append("g")

        //creates circles for all working persons
        var circle = g.append("circle")
            .attr("cx", function (d, i) {
                circ_x(radius1, i);
                return x_c;
            })
            .attr("cy", function (d, i) {
                circ_y(radius1, i);
                return y_c;
            })
            .attr("r", 5)
            //Fills the circles according to jobtitle
            .attr("fill", function (d) {
                var job_code = Jobtitles_list.indexOf(d.jobtitle);
                return color_arr[job_code];
            })

        //Creates the text for ids
        var id_text = g.append("text")
            .attr("x", function (d, i) {
                circ_x(radius1, i);
                return x_c;
            })
            .attr("y", function (d, i) {
                circ_y(radius1, i);
                return y_c;
            })
            .attr("font-size", "10px")
            .attr("text-anchor", "middle")
            .text(function (d, i) { return d.id; })

        //Creates all group points
        /*This for loops looks at where to put the groupwise meeting points for the edges.
          The loop checks where the first and last person of each jobtitle is and calculates the middle and puts this in array group[]. */
        for (p = 0; p < usableData.length; p++) {
            if (p == 0) {
                first_i = p;
            }
            else if (usableData[p].jobtitle != prev_title) {
                group[i_g] = (first_i + p) / 2;
                i_g++;
            }
            else if (p == usableData.length - 1) {
                group[i_g] = (first_i + p) / 2;
            }
            else {
                first_i = p;
            }
            prev_title = usableData[p].jobtitle;
        }
        console.log(group);

        //Creates all edges (mail-traffic)
        var edges = g.append("path")
            .attr('d', function (d, i) {
                //The x_2, y_2 coordinates are the coordinates where the edges join that come from same jobtitle
                job_code2 = Jobtitles_list.indexOf(d.jobtitle)
                circ_x(200, group[job_code2]);
                circ_y(200, group[job_code2]);
                x_2 = x_c;
                y_2 = y_c;
                //Fills array with the correct lines  
                for (k = 0; k < d.mails.length; k++) {
                    var goto_id = d.mails[k];
                    var goto_index = unique_ids.indexOf(goto_id);
                    //The x_1, y_1 coordinates are the coordinates of the recipient
                    circ_x(300, i);
                    circ_y(300, i);
                    x_1 = x_c;
                    y_1 = y_c;
                    //The last coordinates are calculated for the sender
                    circ_x(300, goto_index);
                    circ_y(300, goto_index);
                    mail_line[k] = d3.line().curve(d3.curveBundle.beta(0.85))([[x_1, y_1], [x_2, y_2], [x_c, y_c]]);
                }
                return mail_line;
            })
            .attr("stroke", "url(#linear_gradient)")
            .attr('fill', 'none')
            .attr("stroke-width", 1)
            .style("opacity", 0.3);

        //Testing logs
        console.log(usableData);
        console.log(usableData.length);
        console.log(CEO_list2);
        console.log(Jobtitles_list);
    });




    //FUNCTIONS FOR HEB:
    //FUNCTIONS FOR HEB:
    //FUNCTIONS FOR HEB:

    //Function for placement on HEB (X)
    function circ_x(width, orientation) {
        x_c = 320 + width * (Math.sin(((2 * Math.PI) / usableData.length) * orientation));
    }

    //Function for placement on HEB (Y)
    function circ_y(width, orientation) {
        y_c = 500 + width * (Math.cos(((2 * Math.PI) / usableData.length) * orientation));
    }
    //Function converting the date format to an integer
    function dateFormat(date) {
        return yearMonth = parseInt(date.replace(/-/, "").slice(0, -3), 10);
    }

};