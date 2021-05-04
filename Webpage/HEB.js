/*AUTHORS:
Thomas Broers (1538705)
Bas van Hoeflaken (1556282)
*/

function makeHEB(dataPath) {

    //Variables and constants
    let margin = { top: 15, right: 10, bottom: 15, left: 10 };
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
        function circ_x(width, orientation){
            x_c = 320 + width * (Math.sin(((2 * Math.PI) / 149) * orientation));
        }

        //Function for placement on HEB (Y)
        function circ_y(width, orientation) {
            y_c = 500 + width * (Math.cos(((2 * Math.PI) / 149) * orientation));
        } 

        data.forEach(function (d) {
            //Check wheter the toId is already an object, if not create object with first found fromId
            if (!usableData.some(code => code.id == d.toId)) {
                usableData.push({ "id": d.toId, "jobtitle": d.toJobtitle, "mails": [d.fromId] });
                userIndex.push(d.toId);
            }
            //Check wheter fromId is already in mails array, if not add it
            if (notInMails(d.fromId, d.toId)) {
                indexOfUser = userIndex.indexOf(d.toId);
                usableData[indexOfUser]["mails"].push(d.fromId);
            }
        });

        function notInMails(curFromId, curToId) {
            indexOfUser = userIndex.indexOf(curToId);
            for (i = 0; i < usableData[indexOfUser]["mails"].length; i++) {
                if (usableData[indexOfUser]["mails"][i] == curFromId) {
                    return false;
                }
            }
            return true;
        }

        //Sort array by jobtitle
        usableData.sort((a, b) => d3.ascending(a.jobtitle, b.jobtitle) || d3.ascending(a.toId, b.toId));



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
            })

        //Creates the text for ids
        var id_text = g.append("text")
            .attr("x", function (d, i) {
                circ_x(300,i);
                return x_c;
            })
            .attr("y", function (d, i) {
                circ_y(300,i);
                return y_c;
            })
            .attr("font-size", "10px")
            .attr("text-anchor", "middle")
            .text(function (d, i) { return d.id; })
            
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

        //Creates all edges (mail-traffic)
        var edges = g.append("path")
            .attr('d', function (d, i) {
        //Creates empty array per worker
                var mail_line = []   

                job_code2 = Jobtitles_list.indexOf(d.jobtitle)
                circ_x(150,group[job_code2]);
                circ_y(150,group[job_code2]);
                    x_2 = x_c;
                    y_2 = y_c;
        //Fills array with the correct lines  
                for (k = 0; k < 1; k++) {
                    var goto_id = d.mails[k];
                    var goto_index = unique_ids.indexOf(goto_id);
                    circ_x(300,i);
                    circ_y(300,i);
                    x_1 = x_c;
                    y_1 = y_c;

                    

                    circ_x(300,goto_index);
                    circ_y(300,goto_index);
                    mail_line[k] = d3.line()([[x_1, y_1],[x_2,y_2],[x_c, y_c]]);
                }
                //Only for testing reasons
                //console.log([i, goto_index]);
                var prev_title = d.jobtitle;
                return mail_line;
            })
            .attr('stroke', 'black')
            .attr('fill', 'none')
            .attr("stroke-width", 1)
            .style("opacity", 0.2);

            //Testing logs
        console.log(usableData);
        console.log(usableData.length);
        console.log(CEO_list2);
        console.log(Jobtitles_list);
    });



};


