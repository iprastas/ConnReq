using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.IO.Compression;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Concrete
{
    public class ProviderRepository : IProviderRepository
    {
        public List<RequestData> GetProviderRequests(int factory)
        {
            List<RequestData> list = [];
            using(NpgsqlConnection conn = PgDb.GetOpenConnection()) {
                using(NpgsqlCommand cmd = conn.CreateCommand()) {
                    cmd.CommandText = "select r.request,r.OUTGOINGDATE,k.NAME,u.NAME,r.INCOMINGNUM,r.INCOMINGDATE,r.CONTRACTDATE,r.REMARKS"
                        + ",(select count(*) from resreq.requestdoc d where d.REQUEST = r.request)"
                        + ",(select to_char(max(changedate),'DD.MM.YYYY') from resreq.requestdoc where request=r.request),resreq.candelete(r.request)"
                        + " from resreq.request r, resreq.provider p, resreq.resourcekind k, resreq.users u"
                        + " where r.provider = p.provider and p.resourcekind = k.RESOURCEKIND and r.users = u.users and p.factory =:factory"
                        + " and r.deleted=0 order by r.request desc";
                        cmd.Parameters.Add(":factory", NpgsqlDbType.Integer).Value = factory;
                    try
                    {
                        NpgsqlDataReader reader = cmd.ExecuteReader();
                        while (reader.Read())
                        {
                            RequestData request = new RequestData();
                            if (!reader.IsDBNull(0))
                                request.Request = (int)reader.GetDecimal(0);
                            if (!reader.IsDBNull(1))
                                request.OutgoingDate = reader.GetDateTime(1);
                            if (!reader.IsDBNull(2))
                                request.ResourceName = reader.GetString(2);
                            if (!reader.IsDBNull(3))
                                request.Organisation = reader.GetString(3);
                            if (!reader.IsDBNull(4))
                                request.IncomingNum = reader.GetString(4);
                            if (!reader.IsDBNull(5))
                                request.IncomingDate = reader.GetDateTime(5);
                            if (!reader.IsDBNull(6))
                                request.ContractDate = reader.GetDateTime(6);
                            if (!reader.IsDBNull(7))
                                request.Remarks = reader.GetString(7);
                            if (!reader.IsDBNull(8))
                                request.DocCount = (int)reader.GetDecimal(8);
                            if (!reader.IsDBNull(9))
                                request.LastUpdate = reader.GetString(9);
                            if (!reader.IsDBNull(10))
                                request.CanDeleted = (int)reader.GetDecimal(10) == 0 ? false : true;
                            list.Add(request);
                        }
                    }
                    catch (NpgsqlException ex)
                    {
                        throw new MyException(ex.ErrorCode, "Ошибка чтения GetProviderRequests: " + ex.ToString());
                    }
                    finally
                    {
                        cmd.Dispose();
                    }
                }
            }
            return list;
        }
        public byte[] GetDocumentsStream(int request)
        {
            int nmb = 0;
            string name = string.Empty;
            using (NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using (NpgsqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = "select ordernmb,docname,document from resreq.requestdoc where request=:request";
                    cmd.Parameters.Add(":request", NpgsqlDbType.Integer).Value = request;
                    var os = new MemoryStream();
                    try
                    {
                        int maxlen =1024*1024*10;
                        byte[]? bytes = new byte[maxlen];
                        NpgsqlDataReader reader = cmd.ExecuteReader();
                        long bytesRead=0;
                        //var zip = ZipFile(Encoding.UTF8);
                        //{
                            //zip.AlternateEncoding = Encoding.GetEncoding(Console.OutputEncoding.CodePage);
                            //zip.AlternateEncodingUsage = ZipOption.AsNecessary;
                            while (reader.Read())
                            {
                                if (!reader.IsDBNull(0))
                                    nmb = (int)reader.GetDecimal(0);
                                if (!reader.IsDBNull(1))
                                    name = reader.GetString(1);
                                if (!reader.IsDBNull(2))
                                    bytesRead = reader.GetBytes(2,0,bytes,0,maxlen);
                                //blob.Flush();
                                string fname = string.Format("{0}_{1}_{2}", request, nmb, name);
                                //zip.AddEntry(fname, new MemoryStream(blob.Value));
                            }
                            //zip.Save(os);
                            os.Position = 0;
                            //byte[] bytes = new byte[os.Length];
                            bytes = os.ToArray();
                            os.Dispose();
                            return bytes;
                        //}
                    }
                    catch (NpgsqlException ex)
                    {
                        throw new MyException(ex.ErrorCode, "Ошибка GetDocumentsStream: " + ex.ToString());
                    }
                    finally
                    {
                        cmd.Dispose();
                    }
                }
            }
               
        }
        public string GetCustomerName(int request)
        {
            return "";//DB.GetCustomerName(request);
        }
        public void Delete(int request)
        {
            //DB.DeleteRequest(request);
        }
    }
}
