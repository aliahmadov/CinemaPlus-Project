using Cinema.Business.Abstraction;
using Cinema.Business.Abstraction.Extensions;
using Cinema.Entities.Models;
using Cinema.UI.Helpers.ConstantHelpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;

namespace Cinema.UI.Controllers.ApiControllers
{
    [Route(Routes.MovieAPI)]
    [ApiController]
    public class MovieController : ControllerBase
    {
        private readonly IExtendedMovieService _movieService;

        private readonly IExtendedLanguageService _languageService;

        private readonly IExtendedSubtitleService _subtitleService;

        public MovieController(IExtendedMovieService movieService, IExtendedLanguageService languageService, IExtendedSubtitleService subtitleService)
        {
            _movieService = movieService;
            _languageService = languageService;
            _subtitleService = subtitleService;
        }

        [HttpGet(Routes.GetAllMovies)]
        public async Task<IActionResult> GetAllMovies()
        {
            try
            {
                var movies = (await _movieService.GetAllAsync()).ToList();

                if (movies != null)
                {
                    movies.ForEach(async movie =>
                    {
                        movie.Languages = (await _languageService.GetMovieLanguagesAsync(movie.Id)).ToList();

                        movie.Subtitles = (await _subtitleService.GetMovieSubtitlesAsync(movie.Id)).ToList();
                    });

                    return Ok(movies);
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet(Routes.SearchByTitle)]
        public async Task<ActionResult<List<Movie>>> SearchByTitleAsync(string title)
        {

            try
            {
                var movies = await _movieService.GetAllAsync();

                if (movies == null || !movies.Any())
                {
                    // Handle the case where no movies are available (e.g., return an empty list or throw an exception)
                    return new List<Movie>();
                }

                // Filter the movies based on the title
                var matchingMovies = movies
                    .Where(movie => movie.Title.Contains(title, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                foreach (var movie in matchingMovies)
                {
                    movie.Subtitles = (await _subtitleService.GetMovieSubtitlesAsync(movie.Id)).ToList();
                    movie.Languages = (await _languageService.GetMovieLanguagesAsync(movie.Id)).ToList();
                }

                return matchingMovies;
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet(Routes.GetMoviesInRange)]
        public async Task<ActionResult<List<Movie>>> GetMoviesInRange(int start, int end)
        {
            try
            {
                var movies = await _movieService.GetMoviesInRange(start, end);

                if (movies != null)
                {
                    movies.ForEach(async movie =>
                    {
                        movie.Languages = (await _languageService.GetMovieLanguagesAsync(movie.Id)).ToList();

                        movie.Subtitles = (await _subtitleService.GetMovieSubtitlesAsync(movie.Id)).ToList();
                    });

                    return Ok(movies);
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet(Routes.GetMoviesCount)]
        public async Task<ActionResult<int>> GetMoviesCount()
        {
            try
            {
                var movies = await _movieService.GetAllAsync();

                return movies.Count();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
