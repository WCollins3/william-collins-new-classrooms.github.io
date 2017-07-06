//------Functions used to generate data -----

function createChart(inputData, labels, headLabel, htmlElementID){ //Credit: CanvasJS.com
    document.getElementById(htmlElementID).setAttribute("style", "height: 300px; width: 100%;");
    this.formattedData = []
    for(i = 0; i < inputData.length; i++){
        dataPoint = {"y": inputData[i], "label": labels[i]};
        this.formattedData.push(dataPoint);
    }
    this.chart = new CanvasJS.Chart(htmlElementID, {

        title:{
            text:headLabel
        },
        animationEnabled: true,
        axisX:{
            interval: 1,
            gridThickness: 0,
            labelFontSize: 10,
            labelFontStyle: "normal",
            labelFontWeight: "normal",
            labelFontFamily: "Lucida Sans Unicode"
        },
        axisY2:{
            interlacedColor: "rgba(1,77,101,.2)",
            gridColor: "rgba(1,77,101,.1)"

        },
        data: [
            {
                type: "bar",
                name: "labels",
                axisYType: "secondary",
                color: "#014D65",
                dataPoints: formattedData
            }
        ]

    })
    this.chart.render();
    return this;
}

function getMostPopStates(people){
    var stateCounts = {};
    var states = [];
    var counts = [];
    people.forEach(function(person){
        try { //Try: Get state
            var state = person.location.state
            if (!(state in states)) {
                states.push(state);
                counts.push(0);
            }
            counts[states.indexOf(state)] += 1;
        }
        catch (err){ //Catch: No State
            console.log("Person Missing Location.State");
        }
    })
    if(states.length < 10){
        for (i = 0; i < states.length; i++){
            stateCounts[states[i]] = (counts[i] / people.length) * 100;
        }
    }else{
        var currTop = -1;
        var currTopIndex = -1;
        for(count = 0; count < 10; count++){
            for(i = 0; i < states.length; i++){
                if(counts[i] > currTop){
                    currTop = counts[i];
                    currTopIndex = i;
                }
            }
            stateCounts[states[currTopIndex]] = (currTop / people.length) * 100;
            states.splice(currTopIndex, 1);
            counts.splice(currTopIndex, 1);
            currTopIndex = -1;
            currTop = -1;
        }
    }
    return stateCounts;
}

function getFemales(people){
    var females = []
    people.forEach(function(person){
        try { //Try: Get gender
            var gender = person.gender;
            if (gender == "female") {
                females.push(person);
            }
        }
        catch (err){ //Catch: No gender
            console.log("Person Missing Gender");
        }
    })
    return females;
}

function getMales(people){
    var males = []
    people.forEach(function(person){
        try {//Try: Get gender
            var gender = person.gender;
            if (gender == "male") {
                males.push(person);
            }
        }
        catch (err){//Catch: No gender
            console.log("Person Missing Gender");
        }
    })
    return males;
}

function groupAges(people){
    var ages = [0,0,0,0,0,0]
    var ageLabels = ["0-20", "21-40", "41-60", "61-80", "81-100", "100+"]
    people.forEach(function(person){
        try { //Try: Get DOB
            var birth = new Date(person.dob.toString()).getTime();
            var ageDay = Date.now() - birth;
            var ageMill = new Date(ageDay);
            var age = ageMill.getUTCFullYear() - 1970;
            var placement = Math.floor(age / 20);
            if (placement < 120) {
                ages[placement] += 1;
            } else {
                ages[5].push += 1;
            }
        }
        catch (err){ //Catch: No DOB
            console.log("Person Missing Date of Birth");
        }
    })
    ageGroups = {};
    for(i =0; i < ages.length; i++){
        ageGroups[ageLabels[i]] = (ages[i] / people.length) * 100;
    }
    return ageGroups;
}

function getFirstNames(people){
    var firstNames = [[], []];
    var nCharCode = "n".charCodeAt(0);
    people.forEach(function(person){
        try { //Try: Get First Name
            var name = person.name.first.toLowerCase();
            var letter = name.charCodeAt(0);
            if (letter < nCharCode) {
                firstNames[0].push(person)
            } else {
                firstNames[1].push(person)
            }
        }
        catch (err){ //Catch: No First Name
            console.log("Person Missing First Name");
        }
    })
    return firstNames;
}

function getLastNames(people){
    var lastNames = [[], []];
    var nCharCode = "n".charCodeAt(0);
    people.forEach(function(person){
        try { //Try: Get Last Name
            var name = person.name.last.toLowerCase();
            var letter = name.charCodeAt(0);
            if (letter < nCharCode) {
                lastNames[0].push(person)
            } else {
                lastNames[1].push(person)
            }
        }
        catch (err){//Catch: No Last Name
            console.log("Person Missing Last Name");
        }
    })
    return lastNames;
}

// Pulls out data only essential to this project (gender, name, DOB, location)
// Returns string to be sent to API
function getEssentialData(fileContent){
    content = JSON.parse(fileContent).results;
    console.log(content)
    var newContent = {results: []};
    content.forEach(function(person){
        var newPerson = {}
        try { //Try: Get Gender
            newPerson.gender = person.gender;
        }
        catch (err){
            console.log("Person Missing Gender");
        }
        try { //Try: Get Name
            newPerson.name = person.name;
        }
        catch (err){
            console.log("Person Missing Name");
        }
        try { //Try: Get DOB
            newPerson.dob = person.dob;
        }
        catch (err){
            console.log("Person Missing Date of Birth");
        }
        try {
            newPerson.location = person.location;
        }
        catch (err){ //Try: Get Location
            console.log("Person Missing location");
        }
        newContent.results.push(newPerson);
    })
    console.log(newContent);
    return JSON.stringify(newContent)
}

// Returns String size in bytes
function getByteCountOfString(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

//------Functions Linked to Buttons -----

function processFileContent(fileContent){
    var essentialDataString = getEssentialData(fileContent); // Data essential to this project
    var stringSize = getByteCountOfString(essentialDataString); // Size of data string
    var dataText = "";
    var data = {};

    if (stringSize < 7900) { //If the data can fit into a GET request
        console.log("API call")

        // Call API as web page
        function loadXMLDoc(theURL) {
            if (window.XMLHttpRequest) {// IE7 and up, Firefox, Chrome, Opera
                xmlhttp = new XMLHttpRequest();
            }
            else {// IE6, IE5
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    console.log(xmlhttp.responseText);
                }
            }
            xmlhttp.open("GET", theURL, false);
            xmlhttp.send();
        }

        //use function to call api as web page
        var xmlhttp = false;
        loadXMLDoc("https://majestic-olympic-33142.herokuapp.com/getData?data=" + essentialDataString + "&fileType=json");
        if (xmlhttp == false) { //If variable hasn't changed
            console.log("Did not receive from API")
        }
        else { //If variable has changed, set dataText
            dataText = xmlhttp.responseText
        }
        var data = JSON.parse(dataText)[0];
    }
    else{ // Data will not fit into an API call. Use internal functions instead
        console.log("Internal Functions")

        // Get information from internal functions
        var people = JSON.parse(fileContent).results;
        var females = getFemales(people)
        var males = getMales(people);
        var firstNames = getFirstNames(people);
        var lastNames = getLastNames(people);
        var mostPopStates = getMostPopStates(people);
        var mostPopStatesFemale = getMostPopStates(females);
        var mostPopStatesMale = getMostPopStates(males);
        var ageGroups = groupAges(people);

        // Put information into data object
        data.femalePercent = (females.length / people.length) * 100;
        data.malePercent = (males.length / people.length) * 100;
        data.firstNamesAM = (firstNames[0].length / people.length) * 100;
        data.firstNamesNZ = (firstNames[1].length / people.length) * 100;
        data.lastNamesAM = (lastNames[0].length / people.length) * 100;
        data.lastNamesNZ = (lastNames[1].length / people.length) * 100;
        data.mostPopulousStates = mostPopStates;
        data.mostPopulousStatesFemale = mostPopStatesFemale;
        data.mostPopulousStatesMale = mostPopStatesMale;
        data.AgeGroups = ageGroups;

    }

    //--Process information for charts--
    var genders = [data.femalePercent, data.malePercent];
    var genderLabels = ['Female', 'Male'];

    var firstNames = [data.firstNamesAM, data.firstNamesNZ];
    var firstNamesLabels = ["A-M", "N-Z"];

    var lastNames = [data.lastNamesAM, data.lastNamesNZ];
    var lastNamesLabels = ["A-M", "N-Z"];

    var states = data.mostPopulousStates;
    var statePops = [];
    var stateLabels = [];
    Object.keys(states).forEach(function(key){
        statePops.push(states[key]);
        stateLabels.push(key);
    })

    var femaleStates = data.mostPopulousStatesFemale;
    var femaleStatePops = [];
    var femaleStateLabels = [];
    Object.keys(femaleStates).forEach(function(key){
        femaleStatePops.push(femaleStates[key]);
        femaleStateLabels.push(key);
    })

    var maleStates = data.mostPopulousStatesMale;
    var maleStatePops = [];
    var maleStateLabels = [];
    Object.keys(maleStates).forEach(function(key){
        maleStatePops.push(maleStates[key]);
        maleStateLabels.push(key);
    })

    var agesGroups = data.AgeGroups;
    var ageCounts = [];
    var ageLabels = [];
    Object.keys(agesGroups).forEach(function(key){
        ageCounts.push(agesGroups[key]);
        ageLabels.push(key);
    })

    //--remove data-entry elements--
    var parent = document.getElementById("div1");
    var children = [];
    children.push(document.getElementById("file"));
    children.push(document.getElementById("parTag"));
    children.push(document.getElementById("text"));
    children.push(document.getElementById("fileSub"));
    children.push(document.getElementById("textSub"));
    children.push(document.getElementById("get25Users"));
    children.push(document.getElementById("get100Users"));
    children.forEach(function(child){
        parent.removeChild(child);
    })

    //--create charts--
    createChart(genders, genderLabels, "Gender", "chartContainerGender");
    createChart(firstNames, firstNamesLabels, "First Names", "chartContainerFirstNames");
    createChart(lastNames, lastNamesLabels, "Last Names", "chartContainerLastNames");
    createChart(statePops, stateLabels, "State Populations", "chartContainerStates");
    createChart(femaleStatePops, femaleStateLabels, "State Populations (Female)", "chartContainerFemaleStates");
    createChart(maleStatePops, maleStateLabels, "State Populations (Male)", "chartContainerMaleStates");
    createChart(ageCounts, ageLabels, "Ages", "chartContainerAges");
}

function fileSub(){
    var file = document.getElementById("file");
    var fileName = file.value;
    if (file){
        var reader = new FileReader();
        reader.readAsText(file.files[0], "UTF-8");
        reader.onload = function (evt) {
            var fileContent = evt.target.result;
            processFileContent(fileContent)
        }
    }
}

function textSub(){
    var text = document.getElementById("text").value;
    processFileContent(text);
}

function getUsers(amount){
    var people = "";
    $.ajax({
        url: 'https://randomuser.me/api/?results=' + amount.toString(),
        dataType: 'json',
        success: function(data) {
            people += JSON.stringify(data)
            console.log(people)
            document.getElementById("text").value = people;
        }
    });
}
