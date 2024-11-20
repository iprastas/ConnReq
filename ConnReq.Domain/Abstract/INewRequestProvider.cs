using ConnReq.Domain.Entities;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Abstract
{
    public interface INewRequestProvider
    {
        List<ListItem> GetResourceKind();
        List<ListItem> GetProviders(int resourceKind, int territory);
        List<ListItem> GetTerritory();
        List<DocTempl> GetDocuments(int customerType, int request);
        int SaveRequest(int customer,int provider,string userName);
        bool SaveAttachDoc(int request, int ordernmb, string docName, byte[] buffer, int len);
        string GetFactoryEMail(int request);
        string GetMailBody(int request);
        void SendMail(string from, string to, string subject, string body, string? host, int port, string? user, string? pwd);
    }
}
