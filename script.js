function createChart(inputData, labels, headLabel, htmlElementID){
    //document.createElement("div").setAttribute("id", "chartContainer").setAttribute("style", "height: 300px; width: 100%;");
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
        var state = person.location.state
        if(!(state in states)){
            states.push(state);
            counts.push(0);
        }
        counts[states.indexOf(state)] += 1;
    })
    if(states.length < 10){
        for (i = 0; i < states.length; i++){
            stateCounts[states[i]] = counts[i];
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
            stateCounts[states[currTopIndex]] = currTop;
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
        var gender = person.gender;
        if(gender == "female"){
            females.push(person);
        }
    })
    return females;
}

function getMales(people){
    var males = []
    people.forEach(function(person){
        var gender = person.gender;
        if(gender == "male"){
            males.push(person);
        }
    })
    return males;
}

function groupAges(people){
    var ages = [0,0,0,0,0,0]
    var ageLabels = ["0-20", "21-40", "41-60", "61-80", "81-100", "100+"]
    people.forEach(function(person){
        var birth = new Date(person.dob.toString()).getTime();
        var ageDay = Date.now() - birth;
        var ageMill = new Date(ageDay);
        var age = ageMill.getUTCFullYear() - 1970;
        var placement = Math.floor(age/20);
        if(placement < 120) {
            ages[placement] += 1;
        }else{
            ages[5].push += 1;
        }
    })
    ageGroups = {};
    for(i =0; i < ages.length; i++){
        ageGroups[ageLabels[i]] = ages[i];
    }
    return ageGroups;
}

function getFirstNames(people){
    var firstNames = [[], []];
    var nCharCode = "n".charCodeAt(0);
    people.forEach(function(person){
        var name = person.name.first.toLowerCase();
        var letter = name.charCodeAt(0);
        if(letter < nCharCode){
            firstNames[0].push(person)
        }else{
            firstNames[1].push(person)
        }
    })
    return firstNames;
}

function getLastNames(people){
    var lastNames = [[], []];
    var nCharCode = "n".charCodeAt(0);
    people.forEach(function(person){
        var name = person.name.last.toLowerCase();
        var letter = name.charCodeAt(0);
        if(letter < nCharCode){
            lastNames[0].push(person)
        }else{
            lastNames[1].push(person)
        }
    })
    return lastNames;
}

function getEssentialData(fileContent){
    content = JSON.parse(fileContent).results;
    console.log(content)
    var newContent = {results: []};
    content.forEach(function(person){
        var newPerson = {}
        newPerson.gender = person.gender;
        newPerson.name = person.name;
        newPerson.dob = person.dob;
        newPerson.location = person.location;
        newContent.results.push(newPerson);
    })
    console.log(newContent);
    return JSON.stringify(newContent)

}

function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

function processFileContent(fileContent){

    var essentialDataString = getEssentialData(fileContent);
    var stringSize = byteCount(essentialDataString);

    var dataText = "";
    var data = {};

    if (stringSize < 7900) {
        console.log("API call")

        function loadXMLDoc(theURL) {
            if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari, SeaMonkey
                xmlhttp = new XMLHttpRequest();
            }
            else {// code for IE6, IE5
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

        var xmlhttp = false;
        loadXMLDoc("https://majestic-olympic-33142.herokuapp.com/getData?data=" + essentialDataString + "&fileType=json");
        if (xmlhttp == false) {
            console.log("No response")
        }
        else {
            /* assign `xmlhttp.responseText` to some var */
            dataText = xmlhttp.responseText
        }
        var data = JSON.parse(dataText)[0];
    }
    else{
        console.log("Internal Functions")

        var people = JSON.parse(fileContent).results;
        var females = getFemales(people)
        var males = getMales(people);
        var firstNames = getFirstNames(people);
        var lastNames = getLastNames(people);
        var mostPopStates = getMostPopStates(people);
        var mostPopStatesFemale = getMostPopStates(females);
        var mostPopStatesMale = getMostPopStates(males);
        var ageGroups = groupAges(people);

        data.femalePercent = (females.length / people.length) * 100;
        data.malePercent = (males.length / people.length) * 100;
        data.firstNamesAM = firstNames[0].length;
        data.firstNamesNZ = firstNames[1].length;
        data.lastNamesAM = lastNames[0].length;
        data.lastNamesNZ = lastNames[1].length;
        data.mostPopulousStates = mostPopStates;
        data.mostPopulousStatesFemale = mostPopStatesFemale;
        data.mostPopulousStatesMale = mostPopStatesMale;
        data.AgeGroups = ageGroups;

    }

    console.log(data);

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


    var parent = document.getElementById("div1");
    var children = [];
    children.push(document.getElementById("file"));
    children.push(document.getElementById("parTag"));
    children.push(document.getElementById("text"));
    children.push(document.getElementById("fileSub"));
    children.push(document.getElementById("textSub"));
    children.forEach(function(child){
        parent.removeChild(child);
    })

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
