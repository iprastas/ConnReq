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
    public class RequestDocProvider : IRequestDocProvider
    {
        public List<RequestDoc> GetRequestDocs(int request, int resourceKind, int typeOfCustomer)
        {
            List<RequestDoc> list = new List<RequestDoc>();
            using NpgsqlConnection conn = PgDb.GetOpenConnection();
            using NpgsqlCommand cmd = conn.CreateCommand();
            cmd.CommandText = "select ordernmb,name,resreq.getrequestdocnum(:request,ordernmb)"
                + " from resreq.requestdoctempl where RESOURCEKIND=:rkind and TYPEOFCUSTOMER=:ctype order by ordernmb";
            cmd.CommandType = CommandType.Text;
            cmd.Parameters.Add("request", NpgsqlDbType.Integer).Value = request;
            cmd.Parameters.Add("rkind", NpgsqlDbType.Integer).Value = resourceKind;
            cmd.Parameters.Add("ctype", NpgsqlDbType.Integer).Value = typeOfCustomer;
            NpgsqlDataReader reader = null;
            try
            {
                reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    RequestDoc doc = new RequestDoc() { Request = request };
                    if (!reader.IsDBNull(0))
                        doc.OrderNmb = (int)reader.GetDecimal(0);
                    if (!reader.IsDBNull(1))
                        doc.DocName = reader.GetString(1);
                    if (!reader.IsDBNull(2))
                        doc.FileName = reader.GetString(2);
                    list.Add(doc);
                }
            }
            catch (NpgsqlException ex)
            {
                throw new MyException(ex.ErrorCode, "Ошибка GetRequestDocs: " + ex.ToString());
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
        public void UpdateDocument(int request, int ordernmb, string fileName, byte[] buffer, int len)
        {
            //using NpgsqlConnection conn = PgDb.GetOpenConnection();
            //using NpgsqlCommand cmd = conn.CreateCommand();
            //cmd.CommandText = "update resreq.requestdoc set document=:doc,docname=:fileName where request=:request and ordernmb=:ordernmb";
            //OracleBlob blob = new OracleBlob(connection);
            //blob.Write(buffer, 0, len);
            //cmd.Parameters.Add("doc", blob);
            //cmd.Parameters.Add("fileName", NpgsqlDbType.Varchar).Value = fileName;
            //cmd.Parameters.Add("request", NpgsqlDbType.Integer).Value = request;
            //cmd.Parameters.Add("ordernmb", NpgsqlDbType.Integer).Value = ordernmb;
            //try
            //{
            //    if (cmd.ExecuteNonQuery() == 0)
            //        if (SaveAttachDoc(request, ordernmb, fileName, buffer, len))
            //            UpdateRequest(request);
            //}
            //catch (NpgsqlException ex)
            //{
            //    throw new MyException(ex.ErrorCode, "Ошибка UpdateDocument: " + ex.ToString());
            //}
            //finally
            //{
            //    blob.Close();
            //    cmd.Dispose();
            //}
        }
        public int GetResourceKind(int request)
        {
            int kind = 0;
            using NpgsqlConnection conn = PgDb.GetOpenConnection();
            using NpgsqlCommand cmd = conn.CreateCommand();
            cmd.CommandText = "select p.resourcekind from resreq.provider p,resreq.request r where r.request=:request and r.provider=p.provider";
            cmd.Parameters.Add("request", NpgsqlDbType.Integer).Value = request;
            NpgsqlDataReader reader = null;
            try
            {
                reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        kind = reader.GetInt32(0);
                }
            }
            catch (NpgsqlException ex)
            {
                throw new MyException(ex.ErrorCode, "Ошибка GetResourceKind: " + ex.ToString());
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
            return kind;
        }
        public string GetRequestName(int request)
        {
            return DB.GetRequestName(request);
        }
    }
}
