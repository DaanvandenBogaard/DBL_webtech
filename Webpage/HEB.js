/*AUTHORS:
Thomas Broers (1538705)
Bas van Hoeflaken (1556282)
*/

function makeHEB(dataPath) {

    //Variables and constants
    let margin = { top: 15, right: 10, bottom: 15, left: 10 };
    let figureSize = 1000;
    let diameter = 600;
    let radius = diameter / 2;

    var bundleStrength = 0.85;
    var startDate = 199811;
    var endDate = 200106;

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

        //Filtered data unused
        filteredData = d3.nest()
            .key(function (d) { return d.fromJobtitle; })
            .key(function (d) { return d.fromId; })
            .entries(data);

        var usableData = [];
        var userIndex = [];

        //Function for placement on HEB (X)
        function circ_x(radius, index){
            x_c = 320 + radius * (Math.cos(((2 * Math.PI) / 149) * index));
        }

        //Function for placement on HEB (Y)
        function circ_y(radius, index) {
            y_c = 500 + radius * (Math.sin(((2 * Math.PI) / 149) * index));
        } 

        data.forEach(function (d) {
            //Check wheter the toId is already an object, if not create object with first found fromId
            if (!usableData.some(code => code.id == d.toId)) {
                usableData.push({ "id": d.toId, "jobtitle": d.toJobtitle, "mails": [{"from": d.fromId, "date": dateFormat(d.date)}] });
                userIndex.push(d.toId);
            }
            //Check wheter fromId is already in mails array, if not add it
            if (notInMails(d.fromId, d.toId, dateFormat(d.date))) {
                indexOfUser = userIndex.indexOf(d.toId);
                usableData[indexOfUser]["mails"].push({"from": d.fromId, "date": dateFormat(d.date)});
            }
        });

        function notInMails(curFromId, curToId, curDate) {
            indexOfUser = userIndex.indexOf(curToId);
            for (i = 0; i < usableData[indexOfUser]["mails"].length; i++) {
                if ((usableData[indexOfUser]["mails"][i]["from"] == curFromId) &&
                     usableData[indexOfUser]["mails"][i]["date"] == curDate) {
                    return false;
                }
            }
            return true;
        }

        function dateFormat(date) {
           return yearMonth = date.replace(/-/, "").slice(0, -3);
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
            .attr("cx", function(d,i){
                circ_x(300,i);
                return x_c;
            })
            .attr("cy", function(d,i){
                circ_y(300,i);
                return y_c;
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
            .text(function (d, i) { return d.id; });
            
        //Creates all group points
        var group = [];
        var i_g = 0;
        var first_i = 0;
        var prev_title = "";

        for(p = 0; p < usableData.length; p++){
        if(p==0){
            first_i = p;
        }
        else if(usableData[p].jobtitle != prev_title){
            group[i_g] = (first_i + p)/2;
            i_g++;
        }
        else if(p == usableData.length - 1){
            group[i_g] = (first_i + p)/2;
        }
        else{
            first_i = p;
        }
        prev_title = usableData[p].jobtitle;
    }
    console.log(group);

        var colors = ["#4334eb", "#eb9834"];
        var colorPicker = d3.scaleLinear().range(colors).domain([1, 2]);

        var linearGradient = svg.append("defs")
                                .append("linearGradient")
                                .attr("id", "linear_gradient")

            linearGradient.append("stop")
                          .attr("offset", "0%")
                          .attr("stop-color", colorPicker(1));

            linearGradient.append("stop")
                          .attr("offset", "100%")
                          .attr("stop-color", colorPicker(2));

        //Creates all edges (mail-traffic)
        var edges = g.append("path")
            .attr('d', function (d, i) {
        //Creates empty array per worker
                var mail_line = []   

                job_code2 = Jobtitles_list.indexOf(d.jobtitle)
                circ_x(200,group[job_code2]);
                circ_y(200,group[job_code2]);
                    x_2 = x_c;
                    y_2 = y_c;
        //Fills array with the correct lines  
                for (k = 0; k < d.mails.length; k++) {
                    if((d.mails[k]["date"] >= startDate) && (d.mails[k]["date"] <= endDate)) {
                        var goto_id = d.mails[k]["from"];
                        if (!mail_line.includes(goto_id)) {
                            var goto_index = unique_ids.indexOf(goto_id);
                            circ_x(300,i);
                            circ_y(300,i);
                            x_1 = x_c;
                            y_1 = y_c;

                            circ_x(300,goto_index);
                            circ_y(300,goto_index);
                            mail_line[k] = d3.line().curve(d3.curveBundle.beta(bundleStrength))([[x_1, y_1],[x_2,y_2],[x_c, y_c]]);
                        }
                    }
                }
                //Only for testing reasons
                //console.log([i, goto_index]);
                var prev_title = d.jobtitle;
                return mail_line;
            })
            .attr("stroke", "url(#linear_gradient)")
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .style("opacity", 0.75);

            //Testing logs
        console.log(usableData);
        console.log(usableData.length);
        console.log(CEO_list2);
        console.log(Jobtitles_list);
    });



};


