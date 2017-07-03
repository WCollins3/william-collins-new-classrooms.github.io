function createChart(inputData, labels, headLabel){
    //document.createElement("div").setAttribute("id", "chartContainer").setAttribute("style", "height: 300px; width: 100%;");
    document.getElementById("chartContainer").setAttribute("style", "height: 300px; width: 100%;");
    formattedData = []
    for(i = 0; i < inputData.length; i++){
        dataPoint = {"y": inputData[i], "label": labels[i]};
        formattedData.push(dataPoint);
    }
    var chart = new CanvasJS.Chart("chartContainer", {

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
    chart.render();
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

function processFileContent(fileContent){
    var people = JSON.parse(fileContent).results;
    console.log(people);
    var mostPopStates = getMostPopStates(people);
    var stateCounts = returnStateCounts(people, mostPopStates);
    var females = returnFemales(people);
    var femaleStateCounts = returnStateCounts(females, mostPopStates);
    var males = returnMales(people);
    var maleStateCounts = returnStateCounts(males, mostPopStates);
    var ageCounts = groupAges(people);
    var firstNames = groupFirstName(people);
    var lastNames = groupLastName(people);

    //get gender stats
    var gender = [females.length/people.length, males.length/people.length];
    var genderLabels = ["Female", "Male"];

    //get first name stats
    var first = [firstNames[0].length/people.length, firstNames[1].length/people.length];
    var firstLabels = ["A-M", "N-Z"];

    //get last name stats
    var last = [lastNames[0].length/people.length, lastNames[1].length/people.length];
    var lastLabels = ["A-M", "N-Z"];

    //get state stats
    var stateTotal = 0;
    stateCounts.forEach(function(count){
        stateTotal += count;
    })
    var state = [];
    stateCounts.forEach(function(count){
        state.push(count/stateTotal);
    })
    console.log(state);
    console.log(mostPopStates);

    //get female state stats
    var femaleStateTotal = 0;
    femaleStateCounts.forEach(function(count){
        femaleStateTotal += count;
    })
    var femaleState = [];
    femaleStateCounts.forEach(function(count){
        femaleState.push(count/femaleStateTotal);
    })
    console.log(femaleState);
    console.log(mostPopStates);

    //get male state stats
    var maleStateTotal = 0;
    maleStateCounts.forEach(function(count){
        maleStateTotal += count;
    })
    var maleState = [];
    maleStateCounts.forEach(function(count){
        maleState.push(count/maleStateTotal);
    })
    console.log(maleState);
    console.log(mostPopStates);

    //get age stats
    var ages = [];
    console.log(ageCounts);
    ageCounts.forEach(function(group){
        ages.push(group.length/people.length);
    })
    var ageLabels = ["0-20", "21-40", "41-60", "61-80", "81-100", "100+"];
    console.log(ages);
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

    createChart(gender, genderLabels, "Gender");

    //draw buttons
    d3.select("body").append("button").attr("class", "gender").text("Gender");
    d3.select("body").append("button").attr("class", "firstNames").text("First Names");
    d3.select("body").append("button").attr("class", "lastNames").text("Last Names");
    d3.select("body").append("button").attr("class", "statePop").text("State Populations");
    d3.select("body").append("button").attr("class", "femaleStatePop").text("Female State Populations");
    d3.select("body").append("button").attr("class", "maleStatePop").text("Male State Populations");
    d3.select("body").append("button").attr("class", "ages").text("Ages");

    d3.select(".gender")
        .on("click", function () {
            createChart(gender, genderLabels, "Gender");
        });

    d3.select(".firstNames")
        .on("click", function () {
            createChart(first, firstLabels, "First Names");
        });

    d3.select(".lastNames")
        .on("click", function () {
            createChart(last, lastLabels, "Last Names");
        });

    d3.select(".statePop")
        .on("click", function () {
            createChart(state, mostPopStates, "State Classifications");
        });

    d3.select(".femaleStatePop")
        .on("click", function () {
            createChart(femaleState, mostPopStates, "Female State Classifications");
        });

    d3.select(".maleStatePop")
        .on("click", function () {
            createChart(maleState, mostPopStates, "Male State Classifications");
        });

    d3.select(".ages")
        .on("click", function () {
            createChart(ages, ageLabels, "Age Classifications");
        });

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
