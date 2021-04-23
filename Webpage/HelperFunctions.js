//A function which logs the first entry of a CSV dataset into the console. 
//Parameter: Datapath = string, path to the deserived file.
function LogData(dataPath) {
    d3.csv(dataPath).then(function(data) {
        //Since d3.csv is asynchronous (it is not loaded immediatly, but it is a request to the webserver) we need all our code from the data in here. 
        console.log(data[0]);
      });
}
