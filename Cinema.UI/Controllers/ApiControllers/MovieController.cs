﻿using Cinema.Business.Abstraction;
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

        [HttpGet(Routes.SearchMovies)]
        public async Task<IActionResult> SearchMovies([FromQuery] string title)
        {
            try
            {
                var searchResults = await _movieService.SearchByTitleAsync(title);

                if (searchResults != null)
                {
                    foreach (var movie in searchResults)
                    {
                        movie.Languages = (await _languageService.GetMovieLanguagesAsync(movie.Id)).ToList();
                        movie.Subtitles = (await _subtitleService.GetMovieSubtitlesAsync(movie.Id)).ToList();
                    }

                    return Ok(searchResults);
                }

                return NotFound();  
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
