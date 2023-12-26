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

function getDepartures() {
  const departure = document.getElementById("departure").value;
  const arrival = document.getElementById("arrival").value;

  document.getElementById("loading").hidden = false;
  document.getElementById("results").hidden = true;
  document.getElementById("search").disabled = true;

  axios.get('https://arriva-scraper.onrender.com/scrape?departure=' + departure + '&destination=' + arrival)
    .then(response => response.data)
    .then(data => {
      console.log(data);
      const departures = data.depart;
      const returns = data.return;

      if (departures.length == 0) {
        alert("No departures found");
        document.getElementById("loading").hidden = true;
        document.getElementById("results").hidden = true;
        document.getElementById("search").disabled = false;
        return;
      }

      const departuresTable = document.getElementById("departures_table");
      const returnsTable = document.getElementById("returns_table");

      departuresTable.innerHTML = "";
      returnsTable.innerHTML = "";

      departures.forEach(departure => {
        const row = document.createElement("tr");
        row.onclick = () => {

          document.querySelectorAll('#departures_table tr').forEach((tableRow) => {
            tableRow.classList.remove('table-active');
          });
          row.classList.add('table-active');

          returnsTable.innerHTML = "";
          returns.forEach(returnItem => {
            console.log(returnItem.departure + " " + departure.arrival);
            if (returnItem.departure > departure.arrival) {
              let row_tr = document.createElement("tr");
              let departure_td = document.createElement("td");
              let arrival_td = document.createElement("td");
              let stay = document.createElement("td");

              stay.innerHTML = betweenTimes(departure.arrival, returnItem.departure);
              departure_td.innerHTML = returnItem.departure;
              arrival_td.innerHTML = returnItem.arrival;

              row_tr.appendChild(stay);
              row_tr.appendChild(departure_td);
              row_tr.appendChild(arrival_td);

              returnsTable.appendChild(row_tr);
            }
          });
        };

        const departureCell = document.createElement("td");
        const arrivalCell = document.createElement("td");

        departureCell.innerHTML = departure.departure;
        arrivalCell.innerHTML = departure.arrival;

        row.appendChild(departureCell);
        row.appendChild(arrivalCell);

        departuresTable.appendChild(row);
        document.getElementById("loading").hidden = true;
        document.getElementById("results").hidden = false;
        document.getElementById("search").disabled = false;

      });
    })
    .catch(error => {
      console.log(error);
      document.getElementById("loading").hidden = true;
      document.getElementById("results").hidden = true;
      document.getElementById("search").disabled = false;

    });
}
