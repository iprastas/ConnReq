using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Entities
{
    public class ListItem
    {
        public string? Text { get; set; }
        public string? Value { get; set; }
        public bool Selected { get; set; }
        public bool Enabled { get; set; }
        public ListItem() { Empty(); }
        public void Empty() { Text = ""; Value = ""; Selected = false; Enabled = true; }
    }
    public class Territory
    {
        public int Value { get; set; }
        public string? Text { get; set; }
    }
}
