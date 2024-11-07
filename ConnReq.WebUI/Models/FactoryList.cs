using ConnReq.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ConnReq.WebUI.Models
{
    public class FactoryList
    {
        public List<Provider> FactoryItems { get; set; }
        public FactoryList() { FactoryItems = new List<Provider>(); }
    }
}