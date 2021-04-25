//A function that toggles specific classes and the visibility of the text elements in the sidebar.
//Parameter: none
function toggleSidebar() {
    /*  Disabled for functionality
    var sideHome = document.getElementById("sideTextHome");
    var visHome = sideHome.style.visibility;
    var sideVis = document.getElementById("sideTextVis");
    var sideAbout = document.getElementById("sideTextAbout");
    */

    document.getElementById("sidebar").classList.toggle('expanded');
    document.getElementById("line").classList.toggle('expanded');
    document.getElementById("toolbar").classList.toggle('expanded');

    /*  Disabled for functionality
    if (visHome == 'visible') {
        sideHome.style.visibility = 'hidden';
        sideVis.style.visibility = 'hidden';
        sideAbout.style.visibility = 'hidden';
    } else {
        sideHome.style.visibility = 'visible';
        sideVis.style.visibility = 'visible';
        sideAbout.style.visibility = 'visible';
    }
    */
}

//A function that toggles the toolbar between active and non-active (Will add documentation once I have confirmed the way the toolbar should be hidden)
//Parameter: none
function toggleToolbar() {
    var toolbar = document.getElementById("toolbar");
    var visToolbar = toolbar.style.visibility;

    document.getElementById("tooltoggle").classList.toggle('toolsActive');
    document.getElementById("toolbar").classList.toggle('toolsActive');
    document.getElementById("tooltoggle").classList.toggle('fa-angle-down');
    document.getElementById("tooltoggle").classList.toggle('fa-angle-up');
    document.getElementById("pageContent").classList.toggle('expanded');

    if (visToolbar == 'visible') {
        toolbar.style.visibility = 'hidden';
    } else {
        toolbar.style.visibility = 'visible';
    }
}

function changeLabel() {
    var fileInput = document.getElementById("file_input");
    var fileChosen = document.getElementById("file_chosen");
    var submitFile = document.getElementById("submit_file");

    if (fileInput.value) {
        fileChosen.innerHTML = fileInput.value.replace(/^C:\\fakepath\\/, "");
    } else {
        fileChosen.innerHTML = "Choose a file (.csv)";
    }

    submitFile.click()
}

