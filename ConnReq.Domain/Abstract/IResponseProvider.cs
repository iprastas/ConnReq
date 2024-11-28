using ConnReq.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Abstract
{
    public interface IResponseProvider
    {
        RequestData GetRequestData(int request);
        bool UpdateRequestData(RequestData data, string userName);
        string GetCustomerEMail(int request);
        string GetMailBody(RequestData model);
        void SendMail(string from, string to, string subject, string body, string? host, int port, string? user, string? pwd);
    }
}
