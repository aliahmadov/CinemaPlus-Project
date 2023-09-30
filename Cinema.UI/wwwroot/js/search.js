// Get the form element by its ID
const form = document.getElementById('movie-search-form');

// Add an event listener to the form's submit event
form.addEventListener('submit', function (event) {
    document.getElementById("search-spinner").style.display = 'block';

    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the search input field by its class
    const searchField = form.querySelector('.search-field');
    const searchQuery = searchField.value.trim();

    if (searchQuery === '') {
        document.getElementById("search-spinner").style.display = 'none';
        return;
    }


    // Perform an AJAX request to search for movies by title
    $.ajax({
        type: "GET",
        url: "/api/Movie/SearchByTitle",
        data: { title: searchQuery },
        success: function (data) {
            // Handle the successful response here
            displaySearchResults(data);
        },
        error: function (error) {
            addNoResultHtml();
        }
    });

    // You can also clear the input field after submitting the search
    searchField.value = "";

    document.getElementById("search-spinner").style.display = 'none';
});

var searchResultsDiv = document.getElementById("search-results");
// Function to display search results in the "search-results" div
function displaySearchResults(results) {
    searchResultsDiv.classList.remove("no-result");
    document.getElementById("default-view").style.display = 'none';
    // Clear previous results
    searchResultsDiv.innerHTML = "";

    if (results.length > 0) {
        // Display each movie title in the results
        var fullHtml = '';
        results.forEach(function (movie) {
            var html = createMovieHtml(movie);
            fullHtml += html;
        });
        searchResultsDiv.innerHTML = fullHtml;
    } else {
        addNoResultHtml();
    }
}

function addNoResultHtml() {
    searchResultsDiv.classList.add("no-result");
    searchResultsDiv.innerHTML = "No movies found matching the search criteria.";
    searchResultsDiv.style.textAlign = "center";
    searchResultsDiv.style.padding = "130px 10px";
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
        selectedFormats = formats.slice(0, MAX_FORMAT_COUNT);
    }

    // Join the array of HTML strings into a single string
    const formatsString = selectedFormats.join("");

    return formatsString;
}

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