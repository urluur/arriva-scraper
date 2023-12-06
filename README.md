# Arriva Scraper

This is a JavaScript scraper that retrieves information on upcoming bus departures from the Arriva website.

## Instructions

- Clone the repository: ```git clone https://github.com/urluur/arriva-scraper.git```
- Move to the directory: ```cd arriva-scraper``` 
- Install dependancies: ```npm i```

### Option 1: Run as a script

- Run `index.js` with stations for arguments. Example: ```node index.js Koper Izola```

If the station has multiple words, wrap it in double quotes.

![screenshot](https://github.com/urluur/arriva-scraper/blob/main/screenshot.jpg?raw=true)

### Option 2: Run as a server

- Run the server: ```node index.js```
- Go to the homepage in browser: `localhost:3000`



## Why did I do this?

Official website also shows past connections, which makes the website hard to navigate. Students take a lot of buses and have to plan commutes back. Instead of searching twice and scrolling down the page, this scraper does it for you. Thank me later, University of Primorska students.


