using Cinema.Entities.Models;

namespace Cinema.UI.Models
{
	public class SessionSeatsViewModel
	{
        public Session? Session { get; set; }

		public List<Seat> Seats { get; set;} = new List<Seat>();
    }
}
