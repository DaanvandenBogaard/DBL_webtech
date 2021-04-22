//A simple test function, hence, no documentation.
//Simply for the sake of playing around with D3 and JS.
function tempfunction() {
    LogData("Dataset.csv");

    d3.select("svg").append("rect").attr("x",150).attr("y", 200).attr("width", 50).attr("height", 140).attr('stroke', 'black')
        .attr('fill', '#69a3b2');
    
}

//A function which logs the first entry of a CSV dataset into the console. 
//Parameter: Datapath = string, path to the deserived file.
function LogData(dataPath) {
    d3.csv(dataPath).then(function(data) {
        //Since d3.csv is asynchronous (it is not loaded immediatly, but it is a request to the webserver) we need all our code from the data in here. 
        console.log(data[0]);
      });
}

//A function that toggles specific classes and the visibility of the text elements in the sidebar.
//Parameter: none
function toggleSidebar() {
    var sideHome = document.getElementById("sideTextHome");
    var visHome = sideHome.style.visibility;
    var sideVis = document.getElementById("sideTextVis");
    var sideAbout = document.getElementById("sideTextAbout");

    document.getElementById("sidebar").classList.toggle('expanded');
    document.getElementById("pageContent").classList.toggle('expanded');
    document.getElementById("line").classList.toggle('expanded');
    
    if (visHome == 'visible') {
        sideHome.style.visibility = 'hidden';
        sideVis.style.visibility = 'hidden';
        sideAbout.style.visibility = 'hidden';
    } else {
        sideHome.style.visibility = 'visible';
        sideVis.style.visibility = 'visible';
        sideAbout.style.visibility = 'visible';
    }
}