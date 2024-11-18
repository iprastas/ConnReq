using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Entities
{
    public class NewRequest
    {
        public int ResourcsKind { get; set; }
        public int Territory { get; set; }
        public int Provider { get; set; }
        public int Customer { get; set; }
    }
}
