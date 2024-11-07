using ConnReq.Domain.Entities;

namespace ConnReq.WebUI.Models
{
    public class RequestList
    {
        public List<RequestData> RequestItems { get; set; }
        public RequestList() { RequestItems = new List<RequestData>(); }
    }
}