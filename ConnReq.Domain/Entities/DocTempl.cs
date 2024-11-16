using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Entities
{
    public class DocTempl
    {
        public int OrderNmb { get; set; }
        public string Text { get; set; }
    }
    public class DocTemplList
    {
        public List<DocTempl> DocumentList { get; set; }
        public DocTemplList()
        {
            DocumentList = new List<DocTempl>();
        }
        public List<DocTempl>.Enumerator GetEnumerator()
        {
            return DocumentList.GetEnumerator();
        }
    }
}
