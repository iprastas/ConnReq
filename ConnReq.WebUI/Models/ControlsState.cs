using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ConnReq.WebUI.Models
{
    public class ControlsState
    { 
        public int ResourceKind { get; set; }
        public int Territory { get; set; }
        public int Provider { get; set; }
        public int Request { get; set; }
        public ControlsState() { ResourceKind = 0;Territory = 0; Provider = 0; Request = 0; }
    }
}