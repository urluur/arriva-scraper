import puppeteer from "puppeteer";

let links = {
    "Koper": "https://arriva.si/vozni-redi/?departure-4095=Izola&departure_id=138335&departure=Izola&destination=Koper&destination_id=135768",
    "Izola": "https://arriva.si/vozni-redi/?departure-1059=Koper&departure_id=135768&departure=Koper&destination=Izola&destination_id=138335"
}

const travelTo = async (destination) => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
    });

    const page = await browser.newPage();
    let link;

    switch (destination) {
        case "Koper":
            link = links.Koper;
            break;
        case "Izola":
            link = links.Izola;
            break;
        default:
            console.log("Invalid destination");
            await browser.close();
            return;
    }

    console.log("Naslednji busi za " + destination + ":");

    await page.goto(link, {
        waitUntil: "domcontentloaded",
    });

    let connections = await page.evaluate(() => {
        let dom_connections = document.querySelectorAll(".connection");
        let connections_array = new Array;
        dom_connections.forEach(connection => {
            let departure, arrival;
            if (!connection.classList.contains("connection-header")) {

                departure = connection.querySelector(".departure > td > span").innerText;
                arrival = connection.querySelector(".arrival > td > span").innerText;
                
                let date = new Date();
                if (departure >= (date.getHours() + ":" + date.getMinutes()))
                    connections_array.push({ departure, arrival });
            }
        });
        return connections_array;
    });

    await browser.close();

    return connections;
};

let connections = await travelTo("Koper");
console.log(connections);