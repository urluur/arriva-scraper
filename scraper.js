const express = require('express');
const puppeteer = require('puppeteer');
const cors = require("cors")
const path = require('path');

const PORT = process.env.PORT || 3030;

const app = express();
let browser;

async function initializePuppeteer() {
    browser = await puppeteer.launch({
        headless: true
    });
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    methods: ["GET", "POST"],
}))


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function scrapeTravel(stations) {
    console.log('Getting connections from ' + stations.departure + ' to ' + stations.destination)

    // TODO: check if stations are valid
    let connections = await travelTo(stations.departure, stations.destination);

    if (connections.length == 0) {
        return { "departures": [] };
    }

    let selected_connection = connections.at(0);
    let connections_back = await travelTo(stations.destination, stations.departure, selected_connection.arrival);

    connections_back = getConnectionsBack(selected_connection.arrival, connections_back);

    let travel = {
        depart: connections,
        return: connections_back
    }
    return travel;

}

app.get('/scrape', async (req, res) => {
    let { departure, destination } = req.query;
    let stations = { departure: departure, destination: destination };
    let travel = await scrapeTravel(stations);
    res.json(travel);
});

function getConnectionsBack(arrival, old_connections_back) {
    let new_connections_back = new Array;
    for (let connection of old_connections_back) {
        let stay = betweenTimes(arrival, connection.departure);
        if (stay) {
            let departure = connection.departure;
            let arrival = connection.arrival;
            new_connections_back.push({ departure, arrival, stay });
        }
    }
    return new_connections_back;
}

const travelTo = async (departure, destination, time) => {

    const page = await browser.newPage();
    let homepage = "https://arriva.si/vozni-redi/";

    await page.goto(homepage, {
        waitUntil: "domcontentloaded",
    });

    page.on("dialog", async (dialog) => {
        let error = dialog.message();
        // TODO: find some way of catching a "wrong destination" error
        await dialog.dismiss();
    });

    const DELAY = 100;
    // TODO: type without delay
    await page.type(".input-departure", departure, { delay: DELAY });
    await page.keyboard.press("Enter");
    await page.type(".input-destination", destination, { delay: DELAY });
    await page.keyboard.press("Enter");

    await page.evaluate(() => {
        document.querySelector(".submit").click();
    });

    await page.waitForNavigation({
        waitUntil: "domcontentloaded",
    });

    let connections = await page.evaluate((time) => {
        let dom_connections = document.querySelectorAll(".connection");
        let connections_array = new Array;
        for (const connection of dom_connections) {
            let departure, arrival;
            if (!connection.classList.contains("connection-header")) {

                departure = connection.querySelector(".departure > td > span").innerText;
                arrival = connection.querySelector(".arrival > td > span").innerText;

                if (!time) {
                    let date = new Date();
                    date.setUTCHours(date.getUTCHours() + 1); // Set the time to UTC+1
                    let h = ("0" + date.getUTCHours()).slice(-2);
                    let m = ("0" + date.getUTCMinutes()).slice(-2);
                    time = (h + ":" + m);
                }
                if (departure >= time) {
                    connections_array.push({ departure, arrival });
                }
            }
        }
        return connections_array;
    }, time);
    page.close();

    return connections;
};

function betweenTimes(arrival, departure) {
    arrival = arrival.split(":")
    departure = departure.split(":")
    let hours = parseInt(departure[0]) - parseInt(arrival[0])
    let minutes = parseInt(departure[1]) - parseInt(arrival[1])
    if (minutes < 0) {
        hours--;
        minutes += 60;
    }
    if (hours < 0) {
        return null;
    }
    hours = ("0" + hours).slice(-2);
    minutes = ("0" + minutes).slice(-2);
    return hours + ":" + minutes;
}

async function main() {

    await initializePuppeteer();

    let args = process.argv.slice(2);
    let stations = { departure: args[0], destination: args[1] };
    if (args.length == 0) {
        app.listen(PORT, () => console.log('Server is running on port ' + PORT));
    } else {
        let travel = await scrapeTravel(stations);
        console.log(travel);
        await browser.close();
    }
}

main();