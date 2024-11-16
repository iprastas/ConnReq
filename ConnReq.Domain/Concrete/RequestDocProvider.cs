using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using Npgsql;
using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection.Metadata;
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
            try
            {
                NpgsqlDataReader reader = cmd.ExecuteReader();
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
                reader.Close();
            }
            catch (NpgsqlException ex)
            {
                throw new MyException(ex.ErrorCode, "Ошибка GetRequestDocs: " + ex.ToString());
            }
            finally
            {
                cmd.Dispose();
            }
            return list;
        }
        public void UpdateDocument(int request, int ordernmb, string fileName, byte[] buffer, int len)
        {
            using(NpgsqlConnection conn = PgDb.GetOpenConnection()) 
            { 
               using(NpgsqlCommand cmd = conn.CreateCommand()) 
               {
                    cmd.CommandText = "update resreq.requestdoc set document=:doc,docname=:fileName where request=:request and ordernmb=:ordernmb";
                    
                    cmd.Parameters.Add(":doc",NpgsqlDbType.Bytea).Value = buffer; 
                    cmd.Parameters.Add("fileName", NpgsqlDbType.Varchar).Value = fileName;
                    cmd.Parameters.Add("request", NpgsqlDbType.Integer).Value = request;
                    cmd.Parameters.Add("ordernmb", NpgsqlDbType.Integer).Value = ordernmb;
                    try
                    {
                        //if (cmd.ExecuteNonQuery() == 0)
 //                           if (SaveAttachDoc(request, ordernmb, fileName, buffer, len))
   //                             UpdateRequest(request);
                    }
                    catch (NpgsqlException ex)
                    {
                        throw new MyException(ex.ErrorCode, "Ошибка UpdateDocument: " + ex.ToString());
                    }
                            finally
                    {
 //                       blob.Close();
                        cmd.Dispose();
                    }
               }
            }
            //using NpgsqlConnection conn = PgDb.GetOpenConnection();
            //using NpgsqlCommand cmd = conn.CreateCommand();
            //cmd.CommandText = "update resreq.requestdoc set document=:doc,docname=:fileName where request=:request and ordernmb=:ordernmb";
            //OracleBlob blob = new OracleBlob(connection);
            //blob.Write(buffer, 0, len);
            //cmd.Parameters.Add("doc", blob);

            
        }
        /*
                public bool SaveAttachDoc(int request, int ordernmb, string docName, byte[] buffer, int len)
        {
            CheckConnection();
            OracleCommand cmd = connection.CreateCommand();
            cmd.CommandText = "insert into resreq.requestdoc(request,ordernmb,docname,document)"
                + " values(:request,:ordernmb,:docname,:document)";
            cmd.Parameters.Add("request", request);
            cmd.Parameters.Add("ordernmb", ordernmb);
            cmd.Parameters.Add("docname", docName);
            OracleBlob blob = new OracleBlob(connection);
            blob.Write(buffer, 0, len);
            cmd.Parameters.Add("document", blob);
            try
            {
                if (cmd.ExecuteNonQuery() > 0)
                    return true;
            }
            catch(OracleException ex) {
                throw new MyException(ex.Number, "Ошибка SaveAttachDoc: " + ex.ToString());
            }
            finally
            {
                blob.Close();
                cmd.Dispose();
            }
            return false;
        }
 
         */
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
            string ret = string.Empty;
            using NpgsqlConnection conn = PgDb.GetOpenConnection();
            using NpgsqlCommand cmd = conn.CreateCommand();
            cmd.CommandText = "select ' №'||request||' от '||to_char(outgoingdate,'DD.MM.YYYY')  from resreq.request r where request=:request";
            cmd.Parameters.Add("request", NpgsqlDbType.Integer).Value = request;
            NpgsqlDataReader reader = null;
            try
            {
                reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    ret = reader.GetString(0);
                }
            }
            catch (NpgsqlException ex)
            {
                throw new MyException(ex.ErrorCode, "Ошибка GetRequestName: " + ex.ToString());
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
            return ret;
        }
    }
}
