"use strict"


async function start(){
    let movieContainer = document.getElementById("movie-container");

    movieContainer.insertAdjacentHTML('afterbegin', `<div class="spinner-container middle-spinner" id="movies-spinner">
                    <div class="spinner-border" role="status">
                        <span class="sr-only"></span>
                    </div>
                    <h4>Opening Movie List</h4>
                </div>`);
    let movies = await makeAjaxRequest('/api/Movie/GetAllMovies');
    let spinner = document.getElementById("movies-spinner");
    spinner.remove();

    let content = ``;
    for (var i = 0; i < movies.length; i++) {
        let movie = movies[i];
        content += ` <div class="movie-box">
                <p>${movie.title}</p>
            </div>`;
    }

    movieContainer.insertAdjacentHTML('afterbegin', content);
}



start();