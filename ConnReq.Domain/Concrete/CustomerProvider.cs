using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Concrete
{
    public class CustomerProvider : ICustomerProvider
    {
        public List<RequestData> ReadCustomerRequest(int customer)
        {
            List<RequestData> list = new List<RequestData>();
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
            NpgsqlDataReader reader = null;
            try
            {
                reader = cmd.ExecuteReader();
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
                }
            }
            catch (NpgsqlException ex)
            {
                throw new MyException(ex.ErrorCode, "Ошибка чтения заявок: " + ex.ToString());
            }
            finally
            {
                if (reader != null)
                {
                    reader.Close();
                    reader.Dispose();
                }
                cmd.Dispose();
            }

            return list;
        }
        public void RemoveRequest(int request)
        {
            using NpgsqlConnection conn = PgDb.GetOpenConnection();
            using NpgsqlCommand cmd = conn.CreateCommand();
            cmd.CommandText = "resreq.removerequest";
            cmd.CommandType = CommandType.StoredProcedure;
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
