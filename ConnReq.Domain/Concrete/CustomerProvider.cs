using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using Npgsql;
using NpgsqlTypes;
using System.Data;

namespace ConnReq.Domain.Concrete
{
    public class CustomerProvider : ICustomerProvider
    {
        public List<RequestData> ReadCustomerRequest(int customer)
        {
            List<RequestData> list = [];
            using NpgsqlConnection conn = PgDb.GetOpenConnection();
            using NpgsqlCommand cmd = conn.CreateCommand();
            cmd.CommandText = "select r.request,r.outgoingdate,r.incomingnum,r.incomingdate,r.contractdate,"
                + "k.name,f.name,f.address ,(select count(*) from resreq.requestdoc d where d.REQUEST = r.request)"
                + ",r.remarks,(select to_char(max(changedate),'DD.MM.YYYY') from resreq.requestdoc where request=r.request) "
                + " from resreq.request r, resreq.provider p, resreq.resourcekind k, resreq.factory f"
                + " where r.provider = p.provider and p.RESOURCEKIND = k.RESOURCEKIND and p.factory = f.factory and users =:customer"
                + " and r.deleted=0 order by r.request desc";
            cmd.CommandType = CommandType.Text;
            cmd.Parameters.Add("customer", NpgsqlDbType.Integer).Value = customer;
            try
            {
                NpgsqlDataReader  reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    RequestData request = new RequestData();
                    if (!reader.IsDBNull(0))
                        request.Request = (int)reader.GetDecimal(0);
                    if (!reader.IsDBNull(1))
                        request.OutgoingDate = reader.GetDateTime(1);
                    if (!reader.IsDBNull(2))
                        request.IncomingNum = reader.GetString(2);
                    if (!reader.IsDBNull(3))
                        request.IncomingDate = reader.GetDateTime(3);
                    if (!reader.IsDBNull(4))
                        request.ContractDate = reader.GetDateTime(4);
                    if (!reader.IsDBNull(5))
                        request.ResourceName = reader.GetString(5);
                    if (!reader.IsDBNull(6))
                        request.Organisation = reader.GetString(6);
                    if (!reader.IsDBNull(7))
                        request.Address = reader.GetString(7);
                    if (!reader.IsDBNull(8))
                        request.DocCount = (int)reader.GetDecimal(8);
                    if (!reader.IsDBNull(9))
                        request.Remarks = reader.GetString(9);
                    if (!reader.IsDBNull(10))
                        request.LastUpdate = reader.GetString(10);
                    list.Add(request);
                } reader.Close();
            }
            catch (NpgsqlException ex)
            {
                throw new MyException(ex.ErrorCode, "Ошибка чтения заявок: " + ex.ToString());
            }
            finally
            {
                cmd.Dispose();
            }

            return list;
        }
        public void RemoveRequest(int request)
        {
            using NpgsqlConnection conn = PgDb.GetOpenConnection();
            using NpgsqlCommand cmd = conn.CreateCommand();
            cmd.CommandText = "call resreq.removerequest(:request)";
            cmd.Parameters.Add("request", NpgsqlDbType.Integer).Value = request;
            try
            {
                cmd.ExecuteNonQuery();
            }
            catch (NpgsqlException ex)
            {
                throw new MyException(ex.ErrorCode, "Ошибка RemoveRequest: " + ex.ToString());
            }
            finally
            {
                cmd.Dispose();
            }
        }
    }
}
