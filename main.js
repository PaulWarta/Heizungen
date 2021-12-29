const app = require('express')();
const fs = require('fs');
const internal = require('stream');
const axios = require('axios');

function getData (req, res, next) {
    fs.readFile('db.json', (err, data) => {
        if (err) {
            console.log(`Error in reading file: ${err}`);
            next("Error");
        } else {
            req.current = JSON.parse(data);
            next();
        }
    })
}

const ids = {
    "Wohnzimmer": {
        "current": 1340,
        "new": 1357
    },
    "Kueche": {
        "current": 1390,
        "new": 1407
    },
    "BadezimmerHinten": {
        "current": 1540,
        "new": 1557
    },
    "BadezimmerVorne": {
        "current": 1440,
        "new": 1457
    },
    "Schlafzimmer": {
        "current": 1490,
        "new": 1507
    }
}

app.get('/*/targetTemperature', getData, (req, res) => {
    let url = req.url;
    url = url.split('/');
    let room = url[1]
    req.current[room].temp = req.query.value;
    res.send({
        "targetHeatingCoolingState": 1,
        "targetTemperature": parseFloat(req.query.value),
        "currentHeatingCoolingState": 1,
        "currentTemperature": parseFloat(req.query.value)
    })
    axios.get(`http://192.168.0.197:8085/addons/xmlapi/statechange.cgi?ise_id=${ids[room]["new"]}&new_value=${req.query.value}`)
    fs.writeFile('db.json', JSON.stringify(req.current), (err) => {
        if (err) throw err;
    })
})

app.get('/*/status', getData, (req, res) => {
    let url = req.url;
    url = url.split('/');
    let room = url[1];
    axios.get(`http://192.168.0.197:8085/addons/xmlapi/state.cgi?datapoint_id=${ids[room]["current"]}`)
    .then(response => {
        let string = response.data;
        let value = string.slice(string.indexOf("value='") + 7, string.indexOf("value='") + 11)
        axios.get(`http://192.168.0.197:8085/addons/xmlapi/state.cgi?datapoint_id=${ids[room]["new"]}`)
        .then(response1 => {
            string = response1.data;
            let value1 = string.slice(string.indexOf("value='") + 7, string.indexOf("value='") + 11)
            res.send({
                "targetHeatingCoolingState": 1,
                "targetTemperature": value1,
                "currentHeatingCoolingState": 1,
                "currentTemperature": value
            })
        })
        .catch(err => {
            console.log(err);
        })
    })
    .catch(error => {
        console.log(error);
    })
})


app.listen(8080, '192.168.0.197')