using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Entities
{
     public class RequestDoc
    {
        public int Request { get; set; }
        public int OrderNmb { get; set; }
        public string? DocName { get; set; }
        public string? FileName { get; set; }
    }
}
