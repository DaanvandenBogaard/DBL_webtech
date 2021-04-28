/*AUTHORS:
Daan van den Bogaard (1534173)
Myrte van Ginkel (1566237)
*/

//Import sankey package as variable:
var sankey = d3.sankey();

function makeSankey(dataPath) {
    d3.csv(dataPath).then(function(data) {
        //Since d3.csv is asynchronous (it is not loaded immediatly, but it is a request to the webserver) we need all our code from the data in here. 
      

        
      });
}