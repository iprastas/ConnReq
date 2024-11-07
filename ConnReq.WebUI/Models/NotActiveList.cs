using ConnReq.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ConnReq.WebUI.Models
{
    public class NotActiveList
    {
        public List<NotActiveUsers> NotActiveItems { get; set; }
        public NotActiveList()
        {
            NotActiveItems = new List<NotActiveUsers>();
        }
    }
}