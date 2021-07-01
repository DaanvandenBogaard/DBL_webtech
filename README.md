# DBL_webtech
TUE student project year 2020-2021, Q4. Course 2IOA0
We provide a quick overview on how to use this tool.

* Team 2
	* Daan van den Bogaard
	* Myrte van Ginkel
	* Mike van den Anker
	* Quinten van Eijsden
	* Bas van Hoeflaken
	* Thomas Broers

# Provided link
Click [here](https://hebsjankeymsv.herokuapp.com/) to directly visit the web page! 

We provide you with a link to our running webserver: "https://hebsjankeymsv.herokuapp.com/".

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

# Uploading datasets
When you first log into the site, you will be asked to upload a dataset. In the toolbar at the top, there will be a selector to select different datasets. (Note that on the heroku (online) version of our site, since this is a free hosting site, the datasets do not remain uploaded for very long. If you encounter any bugs please click on the "delete datasets" button in the toolbar and reupload your dataset.)

# General use
On loading the website, users will find themself on our home-page. 
To navigate to any other webpage, please use the buttons on the left side of the page. 
The first one (the one selected) leads to the home-page.
The second one leads to the visualisation-page which is where the actual tool is located.
The third one leads to the about-page on which you can find more information. 

On loading the visualisation-page, there is an empty canvas. You can create new visualisation blocks by pressing the "add visualisation block" button in the toolbar.  
You can select which visualisation you want to use. There are 3 choices:
    Sankey: see "Sankey"
    HEB: see "HEB (Hierarchical Edge Bundling)"
    MSV: See "MSV (Massive Sequence View)"

In order to do this, you must open the toolbar. This is done by clicking the "Toolbar" icon on the topright on the screen.
After you have opened the toolbar, you can click on the "Add visualisation block" button.

# Sankey 
Upon selecting the Sankey as visualisation, the sankey menu will be openned. Here you can select a subset of people of which you want to have their email data analysed. 
These people are all under tabs of different job groups. You can click on these names to open the selection for that specific occupation. Once you are happy with your selection, click the "to Sankey" button. Of course, if you want to go back to the menu, there is always a "To menu" button!

We will now list a few features of the Sankey visualisation:
Highlighting: Upon hovering over a link, this link will get a darker colour than the rest of the links. A tooltip is also displayed giving more information on this link. Hovering over the nodes (the coloured blocks) will also give you more information on these nodes.
Dragging: All sankey nodes (the coloured blocks) are fully draggable. You can reorganise the layout however you want! 
Colouring: The nodes all have a colour assigned to them by a specific colour hash. The nodes will always have the same colour, even when you look at them in the context of other nodes. 

# HEB (Hierarchical Edge Bundling)
When hierarchical is selected the user is presented with the option to select the 
time frame in which the user would like to view the data. When the animation option is selected
the diagram will go month by month through the selected time period. 

When the start button is pressed the diagram will appear below. Note, the start button can currently
only be pressed once. The animation is paused by default so the user needs to press 
play to start the animation.

After generation the user kan adjust the bundle strength with the slider above. If the animation
was selected it can be paused with the pause button.

When looking at the diagram the user can hover over the user nodes to view their jobtitle and 
the number of people that sent and recieved mails to/from this employee. Note, the outgoin edges
are not yet highlighted on top and the two-way highlight is not yet functional

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
- Edge length: This loads the MSV with nodes reordered in such a way that the edge length is minimized. This is done by the simuleated annealing algorighm.
- Standard deviation: This loads the MSV with nodes reordered in such a way that the edge length is minimized. This is done by the simuleated annealing algorighm.

and the MSV colour selector:

- None: Does not colour MSV and displays standard blue colouring.
- From-To: Applies gradient colouring on the edges where from is orange and to blue. 
	   Note: It is perfomance heavy (especially on large datasets)
- Length: Applies a colour on each edge based on the length.
- Sentiment: Colours the edge according to the sentiment of the transaction.
- Blocks: Colours the n largest edge-sets, where n is the amount the user has as input in the inputbox next to the selector.

Besides these there are also other interaction techniques, such as a tooltip that upon hovering over an edge displays the sender, receiver and the date of a message. When applying the 'sentiment' colouring, it will also show the sentiment. 
Furthermore the MSV has brushing and linking between other MSV's, upon hovering on an edge it will highlight the same edge in other MSV's. The colour of this edge can be selected with the colour selecter in the global toolbar. 
Another interaction technique the MSV has is zooming by using the scroll wheel and moving it around by dragging the mouse while holding the left mouse button.
Finally, the time of the MSV can be filtered by using the global time selector.
