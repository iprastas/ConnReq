using ConnReq.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Abstract
{
    public interface IRequestDocProvider
    {
        List<RequestDoc> GetRequestDocs(int request, int resourceKind, int typeOfCustomer);
        void UpdateDocument(int request, int ordernmb, string fileName, byte[] buffer, int len);
        int GetResourceKind(int request);
        string GetRequestName(int request);
    }
}
