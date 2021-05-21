# DBL_webtech
TUE student project year 2020-2021, Q4. Course 2IOA0
We provide a quick overview on how to use this tool.

# Provided link
We provide you with a link to our running webserver: "http://86.88.232.235:8080/Webpage/dbl_home.html".
This links leads to the server hosted on the personal network of one of our team members. We cannot guarantee at this point that the server will always be accessible (as this pc might not always be running). 

Should this link not be accessible, then we refer to the "Webserver setup" paragraph. 

# Webserver setup
We use the Apache webserver to run our tool. Furthermore, we also use PHP for the uploading of datasets to the server. For this, a PHP plugin must be installed.

[Link to Apachelounge](https://www.apachelounge.com/download/) (here you can download the webserver).

[Link to an article discussing how to get PHP working on a appache webserver](https://danielarancibia.wordpress.com/2015/09/27/installing-apache-2-4-and-php-7-for-development-on-windows/).

Should installing this lead to any difficulity, please contact us so we can make sure the webserver is running.
Contact: 
* Name: Daan van den Bogaard
* StudentID: 1534173 
* Email: d.c.l.v.d.bogaard@student.tue.nl

# General use
On loading the website, users will find themself on our home-page. 
To navigate to any other webpage, please use the buttons on the left side of the page. 
The first one (the one selected) leads to the home-page.
The second one leads to the visualisation-page which is where the actual tool is located.
The third one leads to the about-page on which you can find more information. 

On loading the visualisation-page, there are 2 "visualisation blocks" already created for you. 
You can select which visualisation you want to use. Currently there are 4 choices:
    Sankey: see "Sankey"
    HEB: see "HEB (Hierarchical Edge Bundling)"
    MSV: See "MSV (Massive Sequence View)"
    Gestalt (Not yet implemented)
If you want more than 2 visualisations active at once, you can add a new "visualisation block".
In order to do this, you must open the toolbar. This is done by clicking the "Toolbar" icon on the topright on the screen.
After you have opened the toolbar, you can click on the "Add visualisation block" button.

# Sankey 
Upon selection, the sankey will give you an alert asking you which people you want to display.
Right now, this is entered manually, but in the final product we will have a menu dedicated to deciding which users you want to display.

You must enter numbers for this to work. Note, that there are a couple of things that will cause bugs. We will not fix these bugs as this entire selection will be deleted in later versions of the tool.
For example, entering the same number twice will cause issues. 

We list a few possible combinations that we have often used while testing:

* 12,15
* 1,2,3,4,5,6,7,8,9
* 96
* 18,19

We will now list a few features of the Sankey visualisation:
Highlighting: Upon hovering over a link, this link will get a darker colour than the rest of the links. A tooltip is also displayed giving more information on this link. Hovering over the nodes (the coloured blocks) will also give you more information on these nodes.
Dragging: All sankey nodes (the coloured blocks) are fully draggable. You can reorganise the layout however you want! 
Colouring: The nodes all have a colour assigned to them by a specific colour hash. The nodes will always have the same colour, even when you look at them in the context of other nodes. 

# HEB (Hierarchical Edge Bundling)


# MSV (Massive Sequence View) 
You can select the MSV as one of the possible visualizations,
Upon selecting the MSV you'll have a few options in two drop-down selectors,
namely the MSV type selector:

- Standard: This loads the standard MSV wihtout any reordering strategies
- Degree: This loads the MSV with nodes reordered based on their degree, higher degree nodes are displayed at the bottom.
- In-degree: Same as degree but only takes in-degree into account
- Out-degree: Same as degree but only takes out-degree into account
- Activity: Orders the nodes in terms of activity, nodes that are more active at the start at the top and nodes that
	    are more active at the end are placed at the bottom. Nodes that are active throughout are places in the middle.

and the MSV colour selector:

- None: Does not colour MSV and displays standard blue colouring.
- From-To: Applies gradient colouring on the edges where from is orange and to blue. 
	   Note: It is perfomance heavy (especially on large datasets)
- Length: Applies a colour on each edge based on the length.
- Sentiment: Colours the edge according to the sentiment of the transaction.
- Blocks: Colours the n largest edge-sets, where n is the amount the user has as input in the inputbox next to the selector.

Besides the selectors there is also a checkbox, this toggles a legend for the used colouring.
(Note: there is no legend for the 'None' colouring)
