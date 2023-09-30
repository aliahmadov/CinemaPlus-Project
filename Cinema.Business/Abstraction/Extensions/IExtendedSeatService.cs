using Cinema.Entities.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cinema.Business.Abstraction.Extensions
{
    public interface IExtendedSeatService : ISeatService
    {
		Task<IEnumerable<Seat>> GetSessionSeatsAsync(string sessionId);

	}
}
