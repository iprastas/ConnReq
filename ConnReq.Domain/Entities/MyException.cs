namespace ConnReq.Domain.Entities
{
    public class MyException(int code, string message) : Exception(message)
    {
        public int Code { get; set; } = code;
    }
    public class ErrorData
    {
        public string? Message { get; set; }
        public int Code { get; set; }
    }
}
