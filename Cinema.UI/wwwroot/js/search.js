// Get the form element by its ID
const form = document.getElementById('movie-search-form');

var searchResultsDiv = document.getElementById("search-results");
// Add an event listener to the form's submit event
form.addEventListener('submit', function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    showSearchSpinner();

    // Get the search input field by its class
    const searchField = form.querySelector('.search-field');
    const searchQuery = searchField.value.trim();

    if (searchQuery === '') {
        return;
    }

    // Perform an AJAX request to search for movies by title
    $.ajax({
        type: "GET",
        url: "/api/Movie/SearchMovies",
        data: { title: searchQuery },
        success: function (data) {
            // Handle the successful response here
            console.log(data);
            displaySearchResults(data);
        },
        error: function (error) {
            addNoSearchResultHtml();
        }
    });

    // You can also clear the input field after submitting the search
    //searchField.value = "";

    hideSearchSpinner();
});

function addNoSearchResultHtml() {
    // Display a message when no results are found
    var element = document.createElement("p");
    var noResultsMessage = "No movies found matching the search criteria.";
    element.innerHTML = noResultsMessage;
    element.classList.add("no-result-text");
    searchResultsDiv.innerHTML = '';
    searchResultsDiv.appendChild(element);
}

// Function to display search results in the "search-results" div
function displaySearchResults(results) {
    searchResultsDiv.style.flexDirection = "row";
    if (results.length > 0) {
        // Display each movie title in the results
        var allHtml = '';
        results.forEach(function (movie) {
            var movieHtml = getMovieHtml(movie);
            allHtml += movieHtml;
        });
        searchResultsDiv.innerHTML = allHtml; 
    } else {
        addNoSearchResultHtml();
    }
}

const MY_MAX_FORMAT_COUNT = 5;
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
        selectedFormats = formats.slice(0, MY_MAX_FORMAT_COUNT);
    }

    // Join the array of HTML strings into a single string
    const formatsString = selectedFormats.join("");

    return formatsString;
}

const MY_TITLE_LENGTH_LIMIT = 30;

function getMovieHtml(movie) {
    var formats = getMovieFormatsHtml(movie);

    // Truncate the movie title if it's longer than titleLimit characters
    var truncatedTitle =
        movie.title.length > MY_TITLE_LENGTH_LIMIT
            ? movie.title.substring(0, MY_TITLE_LENGTH_LIMIT) + "..."
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

function showSearchSpinner() {
    document.getElementById("movies-search-spinner").style.display = 'block';
}

function hideSearchSpinner() {
    document.getElementById("movies-search-spinner").style.display = 'none';
}

hideSearchSpinner();