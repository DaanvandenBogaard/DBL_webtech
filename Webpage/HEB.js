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
                return 320 + 300 * (Math.sin(((2 * Math.PI) / 149) * i));
            })
            .attr("cy", function (d, i) {
                return 500 + 300 * (Math.cos(((2 * Math.PI) / 149) * i));
            })
            .attr("r", 5)
            //Fills the circles according to jobtitle
            .attr("fill", function (d) {
                if (d.jobtitle == "CEO") { return "green" }
                else { return "red" }
            })
        //Creates the text for ids
        var id_text = g.append("text")
            .attr("x", function (d, i) {
                return 320 + 300 * (Math.sin(((2 * Math.PI) / 149) * i));
            })
            .attr("y", function (d, i) {
                return 500 + 300 * (Math.cos(((2 * Math.PI) / 149) * i));
            })
            .attr("font-size", "10px")
            .attr("text-anchor", "middle")
            .text(function (d, i) { return d.id; })
        //Creates all edges (mail-traffic)

        var edges = g.append("path")
            .attr('d', function (d, i) {
                var mail_line = []
                for (k = 0; k < 1; k++) {
                    var goto_id = d.mails[0];
                    var goto_index = unique_ids.indexOf(goto_id);
                    mail_line = d3.line()([[320 + 300 * (Math.sin(((2 * Math.PI) / 149) * i)), 500 + 300 * (Math.cos(((2 * Math.PI) / 149) * i))],
                    [320 + 300 * (Math.sin(((2 * Math.PI) / 149) * goto_index)), 500 + 300 * (Math.cos(((2 * Math.PI) / 149) * goto_index))]]);
                }
                //Only for testing reasons
                console.log([i, goto_index]);
                return mail_line;
            })
            .attr('stroke', 'purple')
            .attr('fill', 'none')
            .attr("stroke-width", 1)
            .style("opacity", 0.2);


        console.log(usableData);
        console.log(usableData.length);
        console.log(CEO_list2);
        console.log(Jobtitles_list);
    });



};


