using Cinema.Core.Abstract;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cinema.Entities.UserEntities
{
    public class CustomIdentityUser:IdentityUser,IEntity
    {
    }
}
