using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ConnReq.Domain.Entities;
namespace ConnReq.WebUI.Models
{
    public class RequestDocList
    {
        public List<RequestDoc> DocList { get; set; }
        public RequestDocList()
        {
            DocList = new List<RequestDoc>();
        }
    }
}