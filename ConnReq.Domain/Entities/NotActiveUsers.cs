using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Entities
{
    public class NotActiveUsers
    {
        public int UserId { get; set; }
        public string? Name { get; set; }
        public string? CustomerType { get; set; }
        public int NotActiveDays { get; set; }
    }
}
