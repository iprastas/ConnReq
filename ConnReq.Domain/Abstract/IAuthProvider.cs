using ConnReq.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Abstract
{
    public interface IAuthProvider
    {
        UserSettings Authenticate(LoginViewModel login);
        string PasswordChanged(ChangePwdModel model);
    }
}
