using Cinema.Business.Abstraction.Extensions;
using Cinema.DataAccess.Abstract;
using Cinema.Entities.Models;

namespace Cinema.Business.Concrete
{
    public class MovieService : IExtendedMovieService
    {
        private readonly IMovieDal _movieDal;

        public MovieService(IMovieDal movieDal)
        {
            _movieDal = movieDal;
        }

        public async Task AddAsync(Movie entity)
        {
            await _movieDal.AddAsync(entity);
        }

        public async Task DeleteAsync(Movie entity)
        {
            await _movieDal.DeleteAsync(entity);
        }

        public async Task<IEnumerable<Movie>> GetAllAsync()
        {
            return await _movieDal.GetListAsync();
        }

        public async Task<Movie> GetByIdAsync(string id)
        {
            return await _movieDal.GetAsync(m => m.Id == id);
        }

        public async Task<List<Movie>> SearchByTitleAsync(string title)
        {
            var movies = await _movieDal.GetListAsync(); 

            if (movies == null || !movies.Any())
            {
                return new List<Movie>();
            }

            // Filter the movies based on the title
            var matchingMovies = movies
                .Where(movie => movie.Title.Contains(title, StringComparison.OrdinalIgnoreCase))
                .ToList();

            return matchingMovies;
        }


        public async Task UpdateAsync(Movie entity)
        {
            await _movieDal.UpdateAsync(entity);
        }
    }
}
