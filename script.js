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
    var states = {}
    people.forEach(function(person){
        var state = person.location.state;
        if(!(state in states)){
            states[state] = 0
        }
        states[state] += 1;
    })

    var items = Object.keys(states).map(function(key){
        return [key, states[key]];
    })

    items.sort(function(first, second) {
        return second[1] - first[1];
    });
    var ret = items.slice(0, 10);
    for (i = 0; i < ret.length; i++){
        ret[i] = ret[i][0];
    }
    return ret;
}

function returnStateCounts(people, states){
    var counts = [];
    var stateList = [];
    for (i = 0; i < states.length; i++) {
        counts.push(0);
    }
    people.forEach(function(person){
        var state = person.location.state;
        var index = states.indexOf(state);
        if(index != -1){
            counts[index] += 1;
        }
    })
    return counts;
}

function returnFemales(people){
    var females = []
    people.forEach(function(person){
        var gender = person.gender;
        if(gender == "female"){
            females.push(person);
        }
    })
    return females;
}

function returnMales(people){
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
    var ages = [[],[],[],[],[],[]]
    people.forEach(function(person){
        var birth = new Date(person.dob.toString()).getTime();
        var ageDay = Date.now() - birth;
        var ageMill = new Date(ageDay);
        var age = ageMill.getUTCFullYear() - 1970;
        var placement = Math.floor(age/20);
        if(placement < 120) {
            ages[placement].push(person);
        }else{
            ages[5].push(person);
        }
    })
    return ages;
}

function groupFirstName(people){
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

function groupLastName(people){
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
        newPerson.location = newPerson.location;
        newContent.results.push(newPerson);
    })
    console.log(newContent);
    return JSON.stringify(newContent)

}

function processFileContent(fileContent){

    var essentialDataString = getEssentialData(fileContent);

    var dataText = "";

    function loadXMLDoc(theURL)
    {
        if (window.XMLHttpRequest)
        {// code for IE7+, Firefox, Chrome, Opera, Safari, SeaMonkey
            xmlhttp=new XMLHttpRequest();
        }
        else
        {// code for IE6, IE5
            xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange=function()
        {
            if (xmlhttp.readyState==4 && xmlhttp.status==200)
            {
                console.log(xmlhttp.responseText);
            }
        }
        xmlhttp.open("GET", theURL, false);
        xmlhttp.send();
    }

    var xmlhttp=false;
    loadXMLDoc("https://majestic-olympic-33142.herokuapp.com/getData?data=" + essentialDataString + "&fileType=json");
    if(xmlhttp==false){
        console.log("No response")
    }
    else {
        /* assign `xmlhttp.responseText` to some var */
        dataText = xmlhttp.responseText
        console.log(dataText)
    }

    var data = JSON.parse(dataText)[0];
    console.log(data);

    var genders = [data.femalePercent, data.malePercent];
    var genderLabels = ['Female', 'Male'];
    console.log(genders);
    console.log(genderLabels);

    var firstNames = [data.firstNamesAM, data.firstNamesNZ];
    var firstNamesLabels = ["A-M", "N-Z"];
    console.log(firstNames);
    console.log(firstNamesLabels);

    var lastNames = [data.LastNamesAM, data.LastNamesNZ];
    var lastNamesLabels = ["A-M", "N-Z"];
    console.log(lastNames);
    console.log(lastNamesLabels);

    var states = data.mostPopulousStates;
    var statePops = [];
    var stateLabels = [];
    Object.keys(states).forEach(function(key){
        statePops.push(states[key]);
        stateLabels.push(key);
    })
    console.log(statePops)
    console.log(stateLabels)

    var femaleStates = data.mostPopulousStatesFemale;
    var femaleStatePops = [];
    var femaleStateLabels = [];
    Object.keys(femaleStates).forEach(function(key){
        femaleStatePops.push(femaleStates[key]);
        femaleStateLabels.push(key);
    })
    console.log(femaleStatePops)
    console.log(femaleStateLabels)

    var maleStates = data.mostPopulousStatesMale;
    var maleStatePops = [];
    var maleStateLabels = [];
    Object.keys(maleStates).forEach(function(key){
        maleStatePops.push(maleStates[key]);
        maleStateLabels.push(key);
    })
    console.log(maleStatePops)
    console.log(maleStateLabels)

    var agesGroups = data.AgeGroups;
    var ageCounts = [];
    var ageLabels = [];
    Object.keys(agesGroups).forEach(function(key){
        ageCounts.push(agesGroups[key]);
        ageLabels.push(key);
    })
    console.log(ageCounts);
    console.log(ageLabels);

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
