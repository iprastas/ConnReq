using ConnReq.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Abstract
{
    public interface IRegistrationProvider
    {
        bool Registr(UserSettings model);
        bool IsUserNameValid(string user);
    }
}
