using ConnReq.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Abstract
{
    public interface IProviderRepository
    {
         List<RequestData> GetProviderRequests(int factory);
         byte[] GetDocumentsStream(int request);
        string GetCustomerName(int request);
        void Delete(int request);
    }
}
