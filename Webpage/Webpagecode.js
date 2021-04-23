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