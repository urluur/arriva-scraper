import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
});

const travelTo = async (departure, destination, time) => {

    const page = await browser.newPage();
    let homepage = "https://arriva.si/vozni-redi/";

    await page.goto(homepage, {
        waitUntil: "domcontentloaded",
    });

    page.on("dialog", async dialog => {
        console.log(dialog.message());
        await dialog.dismiss();
    });

    await page.type(".input-departure", departure, { delay: 100 });
    await page.keyboard.press("Enter");

    await page.type(".input-destination", destination, { delay: 100 });
    await page.keyboard.press("Enter");

    await page.click(".submit");

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

function getConnectionsBack(arrival, old_connections_back) {
    let new_connections_back = new Array;
    for (const connection of old_connections_back) {
        let stay = betweenTimes(arrival, connection.departure);
        if (stay) {
            let departure = connection.departure;
            let arrival = connection.arrival;
            new_connections_back.push({ departure, arrival, stay });
        }
    }
    return new_connections_back;
}


let args = process.argv.slice(2);
let stations = { departure: args[0], destination: args[1] };

if (args.length == 0) {
    console.log("Vnesi dve postaji!");
    process.exit(1);
}

let connections = await travelTo(stations.departure, stations.destination);
let selected_connection = connections.at(0);

let connections_back = await travelTo(stations.destination, stations.departure, selected_connection.arrival);
connections_back = getConnectionsBack(selected_connection.arrival, connections_back);

let travel = {
    depart: connections,
    return: connections_back
}

console.log(travel);

await browser.close();