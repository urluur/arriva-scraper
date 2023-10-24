import puppeteer from "puppeteer";

let stations = {
    "Izola": {
        "name": "Izola",
        "id": 138335
    },
    
    "Koper": {
        "name": "Koper",
        "id": 135768
    }
}

const travelTo = async (departure, destination, time) => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
    });

    const page = await browser.newPage();
    let link = "https://arriva.si/vozni-redi/?departure-0000=" + departure.name + "&departure_id=" + departure.id + "&departure=" + departure.name + "&destination=" + destination.name + "&destination_id=" + destination.id;

    await page.goto(link, {
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
                    let h = ("0" + date.getHours()).slice(-2);
                    let m = ("0" + date.getMinutes()).slice(-2);
                    time = (h + ":" + m);
                }
                if (departure >= time) {
                    connections_array.push({ departure, arrival });
                }
            }
        }
        return connections_array;
    }, time);

    await browser.close();

    return connections;
};

function betweenTimes(arrival, departure) {
    arrival = arrival.split(":")
    departure = departure.split(":")
    let hours = parseInt(departure[0]) - parseInt(arrival[0])
    let minutes = parseInt(departure[1]) - parseInt(arrival[1])
    if (minutes < 0) {
        hours--
        minutes += 60
    }
    if (hours < 0) {
        return null
    }
    hours = ("0" + hours).slice(-2);
    minutes = ("0" + minutes).slice(-2);
    return hours + ":" + minutes
}

function getConnectionsBack (arrival, old_connections_back) {
    let new_connections_back = new Array
    for (const connection of old_connections_back) {
        let stay = betweenTimes(arrival, connection.departure)
        if (stay) {
            let departure = connection.departure
            let arrival = connection.arrival
            new_connections_back.push({ departure, arrival, stay })
        }
    }
    return new_connections_back
}


let departure = stations.Koper;
let destination = stations.Izola;

let connections = await travelTo(departure, destination);

console.log("Naslednje povezave: " + departure.name + " - " + destination.name + ":");
console.log(connections);

console.log("Za nazaj: " + destination.name + " - " + departure.name + ":");

let selected_connection = connections.at(0)

let connections_back = await travelTo(destination, departure, selected_connection.arrival);
connections_back = getConnectionsBack(selected_connection.arrival, connections_back)
console.log(connections_back)
