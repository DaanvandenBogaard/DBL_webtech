//A simple test function, hence, no documentation.
//Simply for the sake of playing around with D3 and JS.
function myfunction() {
    console.log("Executed");
    var SVG1 = d3.select('SVG1');
    SVG1.innerHTML = "test";
    LogData('Dataset.csv');
}

//A function which logs the first entry of a CSV dataset into the console. 
//Parameter: Datapath = string, path to the deserived file.
function LogData(dataPath) {
    d3.csv(dataPath).then(function(data) {
        //Since d3.csv is asynchronous (it is not loaded immediatly, but it is a request to the webserver) we need all our code from the data in here. 
        console.log(data[0]);
      });
}

//Function is not documented. Please add documentation -Daan <3. 
function toggleSidebar() {
    var sideHome = document.getElementById("sideTextHome");
    var visHome = sideHome.style.visibility;
    var sideVis = document.getElementById("sideTextVis");
    var visVis = sideVis.style.visibility;
    var sideAbout = document.getElementById("sideTextAbout");
    var visAbout = sideAbout.style.visibility;

    document.getElementById("sidebar").classList.toggle('expanded');
    document.getElementById("pageContent").classList.toggle('expanded');
    
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