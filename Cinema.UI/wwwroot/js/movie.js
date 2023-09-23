document.addEventListener("DOMContentLoaded", function () {
    const tabHeaders = document.querySelectorAll("#page_wrapper .tab_header a");
    const tabs = document.querySelectorAll("#page_wrapper .tab");

    tabHeaders.forEach((tabHeader) => {
        tabHeader.addEventListener("click", function (event) {
            event.preventDefault();

            // Hide all tabs
            tabs.forEach((tab) => {
                tab.style.display = "none";
            });

            // Show the clicked tab
            const tabId = this.getAttribute("id");
            const tabToShow = document.querySelector(`#page_wrapper .tab.${tabId}`);
            tabToShow.style.display = "block";

            // Remove active class from all tab headers
            tabHeaders.forEach((header) => {
                header.classList.remove("active");
            });

            // Add active class to the clicked tab header
            this.classList.add("active");
        });
    });
});


function hideSessionsSpinner() {
    document.getElementById("sessions-spinner").style.display = "none";
    document.getElementById("sessions-current-date").style.display = "block";
}
function showSessionsSpinner() {
    document.getElementById("sessions-spinner").style.display = "block";
    document.getElementById("sessions-current-date").style.display = "none";
}


const todayLink = document.getElementById("today-btn");
const tomorrowLink = document.getElementById("tomorrow-btn");
const dateSelect = document.querySelector("select.home_date_sessions");

const MAX_SESSION_FORMAT_COUNT = 3;
var AllCinemas = "All Cinemas";
var AllLanguages = "All Languages";
function getFormattedTime(dateString) {
    // Create a Date object from the input string
    const dateObject = new Date(dateString);

    // Get the hours and minutes from the Date object
    const hours = dateObject.getHours().toString().padStart(2, "0");
    const minutes = dateObject.getMinutes().toString().padStart(2, "0");

    // Create and return the formatted time string
    return `${hours}:${minutes}`;
}

function createFormatHtml(imageUrl, tooltip, check = true) {
    if (check &&
        imageUrl ===
        "https://media.aykhan.net/assets/images/step-it-academy/diploma-project/flags/512/not-found.png"
    )
        return "";

    const html = `
      <div class='movie-format'>    
        <span>
            <b></b>
            ${tooltip}
        </span>
        <img src="${imageUrl}" alt="#">
      </div>
    `;
    return html;
}

function getMovieFormatsHtml(movie, maxCount = 0, check = true) {
    var formats = [];

    if (movie.languages != null) {
        movie.languages.forEach((language) => {
            const format = createFormatHtml(
                language.flagUrl,
                `Movie Language : ${language.name}`,
                check
            );
            formats.push(format);
        });
    }

    if (movie.subtitles != null) {
        movie.subtitles.forEach((subtitle) => {
            const format = createFormatHtml(subtitle.imageUrl, `Movie Subtitle`, check);
            formats.push(format);
        });
    }

    formats = formats.filter(f => f != '');

    if (formats.length === 0) {
        var format = createFormatHtml("https://media.aykhan.net/assets/images/step-it-academy/diploma-project/flags/512/en.png", "Movie Subtitle : English", check)
        formats.push(format);
    }

    // Get only the first 5 formats
    var selectedFormats = [];
    if (maxCount != 0) {
        selectedFormats = formats.slice(0, maxCount);
    } else {
        selectedFormats = formats.slice(0, MAX_SESSION_FORMAT_COUNT);
    }

    // Join the array of HTML strings into a single string
    const formatsString = selectedFormats.join("");

    return formatsString;
}

function createSessionsRowHtml(session, maxFormatCount) {
    var hall = HALLS.find((h) => h.id === session.hallId);
    var theatre = THEATRES.find((t) => t.id === hall?.theatreId);
    var movie;
    if (session.movie != null) {
        movie = session.movie;
    }
    else {
        movie = MOVIES.find((m) => m.id === session?.movieId);

        const selectedLanguage = movie.languages.find(function (language) {
            return language.name === selectedSessionLanguage;
        });

        if (selectedLanguage) {
            const otherLanguages = movie.languages.filter(function (language) {
                return language.name !== selectedSessionLanguage;
            });

            movie.languages = [selectedLanguage, ...otherLanguages];
        }
    }

    var formats = getMovieFormatsHtml(movie, maxFormatCount, false);

    return `
    <tr style="display: table-row;">
      <td>
        <a href="/home/movies?id=${movie?.id}">${movie.title}</a>
      </td>
      <td>${getFormattedTime(session.startTime)}</td>
      <td>
        <a href="/home/theatres?id=${theatre.id}">${theatre.name}</a>
      </td>
      <td>
        ${hall.name}
      </td>
      <td>
        
         ${formats}
      </td> 
      <td>
        ${movie.price} AZN
      </td>
      <td> 
        <div class="zone_input" onclick="showPlaces('${session.id}')">
            <input type="text" disabled class="zone_main_input" placeholder="Places">
        </div>
      </td>
    </tr>
  `;
}



function getformattedDateTime(datetimeString) {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };

    const formattedDatetime = new Date(datetimeString).toLocaleString('en-US', options);
    return formattedDatetime.replace(',', ''); // Remove the comma from the default formatting

}



async function createPlaceHtml(sessionId) {
    let layoutBody = document.getElementById("layout-body");
    layoutBody.insertAdjacentHTML('afterbegin', `<div class="spinner-container middle-spinner" id="movies-spinner">
                    <div class="spinner-border" role="status">
                        <span class="sr-only"></span>
                    </div>
                    <h4>Opening Places</h4>
                </div>`);
    let session = await makeAjaxRequest(`/api/Session/GetSessionById/${sessionId}`);
    let spinner = document.getElementById("movies-spinner");
    spinner.remove();

    var formats = getMovieFormatsHtml(session.movie, 3);


    let content = `<div id="place-container" class="place-container">
		<div class="place-inner-container">
		<div onclick='closePlaces()' class="places-close-btn">
			<i class="fa-regular fa-circle-xmark"></i>
		</div>
			<div class="place-inner-up">
				<p>${session.movie.title}</p>
				<p>${getformattedDateTime(session.startTime)}</p>
				<p>${session.hall.name}</p>
        <div class='session-formats-container'>
         ${formats}
        </div>
			</div>

			<div class="place-inner-middle">
				<div class="seats-cont">`


    let seatCount = 0;
    let rowCount = Math.ceil(session.hall.seats.length / 14);

    for (var i = 0; i < rowCount; i++) {
        content += `<div class="seat-row">
						<div class="seat-row-number">
							<h4>${i + 1}</h4>
						</div>`;
        content += `<div style="flex-basis:90%;">
							<div class="seat-list">`;
        for (var k = 0; k < 14; k++) {

            var seatId = session.hall.seats[seatCount].id;
            if (session.hall.seats[seatCount].isAvailable == true) {

                content += `<a style="background-color:white;"  id="seat-${seatId}"  onclick="selectSeat('${session.movie.price}','${seatId}')">${k + 1}</a>`
            }
            else {
                content += `<a id="seat-${seatId}"  onclick="selectSeat('${session.movie.price}','${seatId}')" style="background-color:black;color:white;">${k + 1}</a>`
            }
            seatCount++;
        }

        content += `</div>
                        </div>
						<div class="seat-row-number">
							<h4>${i + 1}</h4>
						</div>
					</div>`;
    }

    content += `</div>
                <div class="screen-label">
					<h4>Screen</h4>
					<img alt="screen" src="/assets/images/zone_footer.png"/>
				</div>
			</div>
<div class="place-inner-down">
								<div class="place-inner-down-sec">
					<div class="seat-info-cont">
						<div class="seat-info-box"></div>
						<b>Empty seats</b>
					</div>

					<div class="seat-info-cont">
						<div class="seat-info-box" style="background-color:#00acec!important;"></div>
						<b>Selected seats</b>
					</div>

					<div class="seat-info-cont">
						<div class="seat-info-box" style="background-color:black!important;"></div>
						<b>Full seats</b>
					</div>
				</div>


				<div class="place-inner-down-sec">
					<div class="place-inner-down-bottom">

					</div>
					<div class="place-inner-down-bottom" style="flex-direction:column;">
						<b style="color:#00b0f0">Total Price:</b>
						<b id="price-display" style="color:white">AZN</b>
					</div>

					<div class="place-inner-down-bottom">
						<a class="confirm-btn">
							Confirm
						</a>
					</div>
				</div>
			</div>
		</div>`;
    layoutBody.insertAdjacentHTML('afterbegin', content);
    layoutBody.style.overflow = "hidden";
}

function showPlaces(sessionId) {
    createPlaceHtml(sessionId);
    let placeContainer = document.getElementById("place-container");


}

var totalPrice = 0;
function closePlaces() {
    totalPrice = 0;
    let placeContainer = document.getElementById("place-container");
    let layoutBody = document.getElementById("layout-body");
    layoutBody.style.overflow = "auto";
    layoutBody.style.overflowX = "hidden";
    placeContainer.remove();
}


function selectSeat(price, seatId) {
    let seatEl = document.getElementById(`seat-${seatId}`);
    let priceDisplay = document.getElementById("price-display");
    if (seatEl.style.backgroundColor != "black") {
        if (seatEl.style.backgroundColor == "white") {
            seatEl.style.backgroundColor = "rgb(0, 175, 240)";
            seatEl.style.color = "white";
            totalPrice += Number(price);
            priceDisplay.innerHTML = `${totalPrice} AZN`;
        }
        else if (seatEl.style.backgroundColor == "rgb(0, 175, 240)") {
            seatEl.style.backgroundColor = "white";
            seatEl.style.color = "black";
            totalPrice -= Number(price);
            priceDisplay.innerHTML = `${totalPrice} AZN`;

        }
    }
    //console.log(sessionData);

}

function formatDate(inputDate) {
    var parts = inputDate.split('.');
    if (parts.length === 3) {
        return parts[2] + '-' + parts[1] + '-' + parts[0];
    } else {
        // Return an error message or handle invalid input as needed.
        return 'Invalid date format';
    }
}

function areDatesOnSameDay(date1, date2) {
    // Compare year, month, and day components
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

var selectedSessionCinema = AllCinemas;
var selectedSessionLanguage = AllLanguages;
var sessionsCinemaSelectElement = document.getElementById("sessionsCinemaFilter");
var sessionsLanguageSelectElement = document.getElementById("sessionsLanguageFilter");

var tableHead = document.getElementById("table-head");

function addTableHeader() {
    tableHead.innerHTML = `
      <tr style="width: 100% !important;">
        <td>MOVIE</td>
        <td>SESSIONS</td>
        <td>CINEMA</td>
        <td>HALL</td>
        <td>FORMAT</td>
        <td>PRICE</td>
        <td>BUY NOW</td>
    </tr>`;
}

function removeTableHeader() {
    tableHead.innerHTML = '';
}

var SESSIONS = null;
var HALLS = null;
var THEATRES = null;
var MOVIES = null;
var sessionsBody = document.getElementById("movie-details-sessions");
async function addMovieSessionsToView(date) {
    if (SESSIONS === null) {
        SESSIONS = await makeAjaxRequest('/api/Session/GetAllSessions');
    }

    // Convert dateValue to a JavaScript Date object    
    var selectedDate = new Date(formatDate(date));

    var filteredSessions = SESSIONS.filter(session => {
        return areDatesOnSameDay(new Date(session.startTime), selectedDate);
    });

    var cinemaFilteredSessions = filteredSessions.filter(session => {
        if (selectedSessionCinema === AllCinemas) {
            return true;
        }
        return session.hall.theatreId === selectedSessionCinema;
    });

    var languageFilteredSessions = cinemaFilteredSessions.filter(session => {
        if (selectedSessionLanguage === AllLanguages) {
            return true;
        }
        return session.movie.languages.some(function (language) {
            return language.name === selectedSessionLanguage;
        });
    });

    if (selectedSessionLanguage != AllLanguages) {
        languageFilteredSessions = languageFilteredSessions.map(function (session) {
            const selectedLanguage = session.movie.languages.find(function (language) {
                return language.name === selectedSessionLanguage;
            });

            if (selectedLanguage) {
                const otherLanguages = session.movie.languages.filter(function (language) {
                    return language.name !== selectedSessionLanguage;
                });

                session.movie.languages = [selectedLanguage, ...otherLanguages];
            }

            return session;
        });
    }

    var resultSessions = languageFilteredSessions;

    addTableHeader();

    document.getElementById("no_sessions").style.display = 'none';
    sessionsBody.innerHTML = '';
    tableHead.style.display = 'block';
    sessionsBody.style.display = 'block';
    if (resultSessions.length > 0) {
        var allHtml = "";
        for (let i = 0; i < resultSessions.length; i++) {
            const mySession = resultSessions[i];
            var html = createSessionsRowHtml(mySession, MAX_SESSION_FORMAT_COUNT);
            //console.log(html);
            allHtml += html;
        }
        sessionsBody.innerHTML = allHtml;
    }
    else {
        //tableHead.style.display = 'none';
        sessionsBody.style.display = 'none';
        document.getElementById("no_sessions").style.display = 'block';
        removeTableHeader();
    }
}


function setDateText(text) {
    document
        .getElementById("sessions-current-date")
        .querySelector("p").innerText = text;
}

// Function to add 'active' class to the selected link
function setLinkActive(link) {
    // Remove 'active' class from both links
    todayLink.classList.remove("active");
    tomorrowLink.classList.remove("active");

    // Add 'active' class to the selected link
    if (link != null) {
        link.classList.add("active");

        var dateValue = link.getAttribute("data-value");

        addMovieSessionsToView(dateValue);

        var dateText = link.getAttribute("date-text");

        setDateText(`${dateText} (${dateValue})`);
    }
}

// Function to handle the change event for the select element
function handleSearchSelectChange() {
    const selectedOptionValue = dateSelect.value;
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    // Check if the selected date is today or tomorrow and update links accordingly
    var todayDate = todayLink.getAttribute("data-value");
    var tomorrowDate = tomorrowLink.getAttribute("data-value");
    if (selectedOptionValue === todayDate) {
        setLinkActive(todayLink);
        addMovieSessionsToView(todayDate);
    } else if (selectedOptionValue === tomorrowDate) {
        setLinkActive(tomorrowLink);
        addMovieSessionsToView(tomorrowDate);
    } else {
        setLinkActive(null);
        setDateText(selectedOptionValue);
        addMovieSessionsToView(selectedOptionValue);
    }
}


sessionsCinemaSelectElement.addEventListener("change", function () {
    selectedSessionCinema = sessionsCinemaSelectElement.value;
    handleSearchSelectChange();
});
sessionsLanguageSelectElement.addEventListener("change", function () {
    selectedSessionLanguage = sessionsLanguageSelectElement.value;
    handleSearchSelectChange();
});

// Function to handle the click event for "Today" and "Tomorrow" links
function handleLinkClick(event) {
    event.preventDefault();
    setLinkActive(event.target);

    // Update the selected date in the <select> based on the link clicked
    dateSelect.value = event.target.getAttribute("data-value");
}

// Attach event listeners   
todayLink.addEventListener("click", handleLinkClick);
tomorrowLink.addEventListener("click", handleLinkClick);
dateSelect.addEventListener("change", handleSearchSelectChange);
var anotherMoviesContainer = document.getElementById("another-movies");
const TITLE_LENGTH_LIMIT = 30;

function createMovieHtml(movie) {
    var formats = getMovieFormatsHtml(movie);

    // Truncate the movie title if it's longer than titleLimit characters
    var truncatedTitle =
        movie.title.length > TITLE_LENGTH_LIMIT
            ? movie.title.substring(0, TITLE_LENGTH_LIMIT) + "..."
            : movie.title;

    var html = `
    <div class='movie-card'>
        <div class='movie-title'>
            <a href="/home/movies?id=${movie.id}">
                ${truncatedTitle}
            </a>
        </div>
        <div class="movie-details">

            <a href="/home/movies?id=${movie.id}">
                <div class="poster">
                    <img src="${movie.posterUrl}" alt=${movie.title}>
                </div>
            </a>

            <div class="movie-formats">
                ${formats}
            </div>

            <div class="go-film">
                <a href="/home/movies?id=${movie.id}">SESSIONS</a>

                <span class='age-limit'>${movie.ageLimit}</span>
            </div>
        </div>
    </div>    
    `;
    return html;
}

function addAnotherMovies() {
    var anotherMovies = JSON.parse(localStorage.getItem('AnotherMovies'));
    if (anotherMovies != null) {
        var fullHtml = '';
        for (var i = 0; i < anotherMovies.length; i++) {
            var movie = anotherMovies[i];
            var html = createMovieHtml(movie);
            fullHtml += html;
        }
        anotherMoviesContainer.innerHTML = fullHtml;
    }
}

async function start() {
    showSessionsSpinner();

    MOVIES = await makeAjaxRequest('/api/Movie/GetAllMovies');
    THEATRES = await makeAjaxRequest('/api/Theatre/GetAllTheatres');
    HALLS = await makeAjaxRequest('/api/Hall/GetAllHalls');
    var currentMovieId = localStorage.getItem("CurrentMovieId");
    SESSIONS = await makeAjaxRequest(`/api/Session/GetMovieSessions?movieId=${currentMovieId}`);

    console.log(SESSIONS);

    if (SESSIONS != null && SESSIONS.length > 0) {
        hideSessionsSpinner();  
        handleSearchSelectChange();

        addAnotherMovies();
    }
}

start();


