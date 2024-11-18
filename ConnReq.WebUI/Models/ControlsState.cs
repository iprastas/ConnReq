using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace ConnReq.WebUI.Models
{
    [Serializable]
    public class ControlsState
    { 
        public int ResourceKind { get; set; }
        public int Territory { get; set; }
        public int Provider { get; set; }
        public int Request { get; set; }
        public ControlsState() { ResourceKind = 0;Territory = 0; Provider = 0; Request = 0; }
        public void Save(HttpResponse response)
        {
            StringBuilder sb = new();
            sb.Append("ResourceKind=" + ResourceKind.ToString());
            sb.Append("&Territory=" + Territory.ToString());
            sb.Append("&Provider=" +  Provider.ToString());
            sb.Append("&Request=" +  Request.ToString());
            response.Cookies.Append("controlState",sb.ToString(), new CookieOptions(){ Expires = new DateTimeOffset(DateTime.Now.AddDays(30))});
        }
        public bool Restore(HttpRequest request)
        {
            if (request != null && request.Cookies["controlState"] != null)
            {
                string[] items = request.Cookies["controlState"].Split("&");
                foreach (string item in items)
                {
                    string[] strings = item.Split("=");
                    switch (strings[0])
                    {
                        case "ResourceKind":
                            if(!string.IsNullOrEmpty(strings[1])) ResourceKind = int.Parse(strings[1]);
                            break;
                        case "Territory":
                            if(!string.IsNullOrEmpty(strings[1])) Territory = int.Parse(strings[1]);
                            break;
                        case "Provider":
                            if(!string.IsNullOrEmpty(strings[1])) Provider = int.Parse(strings[1]);
                            break;
                        case "Request":
                            if(!string.IsNullOrEmpty(strings[1])) Request = int.Parse(strings[1]);
                            break;
                    }
                }
                return true;
            }
            return false;
        }
    }
}