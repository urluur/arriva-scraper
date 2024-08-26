# Arriva Scraper

This is a JavaScript scraper that retrieves information on upcoming bus departures from the Arriva website.

## Instructions

- Make sure you have [Node.js](https://nodejs.org/en) installed
- Clone the repository: ```git clone https://github.com/urluur/arriva-scraper.git```
- Move to the directory: ```cd arriva-scraper``` 
- Install dependancies: ```npm i```

### Option 1: Run as a script

- Run `scraper.js` with stations for arguments. Example: ```node scraper.js Koper Izola```

If the station has multiple words, wrap it in double quotes.

![screenshot_cli](https://github.com/urluur/arriva-scraper/blob/main/screenshot_cli.jpg?raw=true)

### Option 2: Run as a server

- Run the server: ```node scraper.js```
- Go to the homepage in browser: `localhost:3030`

<br>

## Alternatively: Go to demo website

- Go to the [demo website](https://arriva-scraper.onrender.com) 
- Enter *valid* names of departure and destination stations
- Click on a connection to see returns

>[!note]
>Demo website is significantly slower than running the server locally.
>You can try out the project on the demo website, but you might need to wait approximately one minute for the remote server to start.
>
>[![Website monip.org](https://img.shields.io/website-up-down-green-red/http/arriva-scraper.onrender.com.svg)](http://arriva-scraper.onrender.com/)

![screenshot_web](https://github.com/urluur/arriva-scraper/blob/main/screenshot_web.jpg?raw=true)


## Why did I do this?

Official website also shows past connections, which makes the website hard to navigate. Students take a lot of buses and have to plan commutes back. Instead of searching twice and scrolling down the page, this scraper does it for you. Thank me later, University of Primorska students.


