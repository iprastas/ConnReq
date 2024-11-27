using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using Npgsql;
using NpgsqlTypes;
using System.Text;

namespace ConnReq.Domain.Concrete
{
    public class NewRequestProvider : INewRequestProvider
        {
        public List<ListItem> GetResourceKind()
        {
            List<ListItem> list = [];
            int kind = 0; string name = string.Empty;
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using NpgsqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "select resourcekind,name from resreq.resourcekind order by 1";
                cmd.Parameters.Add("resourcekind", NpgsqlDbType.Integer).Value = kind;
                cmd.Parameters.Add("name", NpgsqlDbType.Varchar).Value = name;
                NpgsqlDataReader reader;
                try
                {
                    ListItem item0 = new() { Value = "", Text = "Все", Selected = true };
                    list.Add(item0);
                    reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        ListItem item = new();
                        if (!reader.IsDBNull(0))
                            item.Value = reader.GetDecimal(0).ToString();
                        if (!reader.IsDBNull(1))
                            item.Text = reader.GetString(1);
                        list.Add(item);
                    }
                }
                catch (NpgsqlException ex)
                {
                    throw new MyException(ex.ErrorCode, "Ошибка GetResourseKind: " + ex.ToString());
                }
                finally
                {
                    cmd.Dispose();
                }
            }
            return list;
        }
        public List<ListItem> GetProviders(int resourceKind,int territory)
        {
            List<ListItem> list = [];
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using NpgsqlCommand cmd = conn.CreateCommand();
                StringBuilder sb = new("select p.provider,f.name||' ('||k.name||')' from resreq.provider p,resreq.factory f, resreq.resourceKind k ");
                sb.Append(" where p.factory = f.factory and p.resourcekind = k.resourcekind and current_date between coalesce(f.since,current_date) and coalesce(f.upto,current_date)");
                if (resourceKind > 0)
                {
                    sb.Append(" and p.resourcekind = :resourcekind");
                    cmd.Parameters.Add("resourcekind", NpgsqlDbType.Integer).Value = resourceKind;
                }
                if (territory > 0)
                {
                    sb.Append(" and f.TERRITORYWORK=:territory");
                    cmd.Parameters.Add("territory", NpgsqlDbType.Integer).Value = territory;
                }
                sb.Append(" order by 2");
                cmd.CommandText = sb.ToString();
                try
                {
                    list.Add(new ListItem() { Value = "", Text = "Выберите поставщика", Selected = true });
                    NpgsqlDataReader reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        ListItem item = new();
                        if (!reader.IsDBNull(0))
                            item.Value = reader.GetDecimal(0).ToString();
                        if (!reader.IsDBNull(1))
                            item.Text = reader.GetString(1);
                        list.Add(item);
                    }
                    reader.Close();
                }
                catch (NpgsqlException ex)
                {
                    throw new MyException(ex.ErrorCode, "Ошибка GetProviders: " + ex.ToString());
                }
                finally
                {
                    cmd.Dispose();
                }
            }
            return list;
        }
        public List<ListItem> GetTerritory()
        {
            List<ListItem> list = [];
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using NpgsqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "select t.territory,t.name from resreq.territory t order by nmb";
                try
                {
                    NpgsqlDataReader reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        ListItem item = new();
                        if (!reader.IsDBNull(0))
                            item.Value = reader.GetDecimal(0).ToString();
                        if (!reader.IsDBNull(1))
                            item.Text = reader.GetString(1);
                        list.Add(item);
                    }
                    reader.Close();
                }
                catch (NpgsqlException ex)
                {
                    throw new MyException(ex.ErrorCode, "Ошибка GetTerritory: " + ex.ToString());
                }
                finally
                {
                    cmd.Dispose();
                }
            }
            return list;
        }
        public List<DocTempl> GetDocuments( int customerType, int request)
        {
            List<DocTempl> documents = [];
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using NpgsqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "select d.ordernmb,d.name from resreq.REQUESTDOCTEMPL d,resreq.request r,resreq.provider p "
                    + " where r.provider = p.provider and d.resourcekind = p.resourcekind and r.request = :request "
                    + " and d.typeofcustomer = :typeOfCustomer order by d.ordernmb";
                cmd.Parameters.Add("request", NpgsqlDbType.Integer).Value = request;
                cmd.Parameters.Add("typeOfCustomer", NpgsqlDbType.Integer).Value = customerType;
                try
                {
                    NpgsqlDataReader reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        DocTempl item = new();
                        if (!reader.IsDBNull(0))
                            item.OrderNmb = (int)reader.GetDecimal(0);
                        if (!reader.IsDBNull(1))
                            item.Text = reader.GetString(1);
                        documents.Add(item);
                    }
                    reader.Close();
                }
                catch (NpgsqlException ex)
                {
                    throw new MyException(ex.ErrorCode, "Ошибка GetDocumentsList: " + ex.ToString());
                }
                finally
                {
                    cmd.Dispose();
                }
            }
            return documents;

        }
        public int SaveRequest(int customer,int provider,string userName)
        {
            using NpgsqlConnection conn = PgDb.GetOpenConnection();
            using NpgsqlCommand cmd = conn.CreateCommand();
            cmd.CommandText = "set search_path to resreq;insert into resreq.request(outgoingdate,provider,users,username) values(current_date,:provider,:customer,:userName)"
                + " returning request";
            cmd.Parameters.Add("provider", NpgsqlDbType.Integer).Value = provider;
            cmd.Parameters.Add("customer", NpgsqlDbType.Integer).Value = customer;
            cmd.Parameters.Add("userName", NpgsqlDbType.Varchar).Value = userName;
            try
            {
                var ret = cmd.ExecuteScalar();
                if (ret != null) return (int)ret;
                else return 0;
            }
            catch (NpgsqlException ex)
            {
                throw new MyException(ex.ErrorCode, "Ошибка SaveRequest: " + ex.ToString());
            }
            finally
            {
                cmd.Dispose();
            }
        }
        public bool SaveAttachDoc(int request, int ordernmb, string docName, byte[] buffer, int len)
        {
            using NpgsqlConnection conn = PgDb.GetOpenConnection();
            using NpgsqlCommand cmd = conn.CreateCommand();
            cmd.CommandText = "insert into resreq.requestdoc(request,ordernmb,docname,document)"
                + " values(:request,:ordernmb,:docname,:document)";
            cmd.Parameters.Add("request", NpgsqlDbType.Integer).Value = request;
            cmd.Parameters.Add("ordernmb", NpgsqlDbType.Integer).Value = ordernmb;
            cmd.Parameters.Add("docname", NpgsqlDbType.Varchar).Value = docName;
            cmd.Parameters.Add("document", NpgsqlDbType.Bytea).Value = buffer;
            try
            {
                if (cmd.ExecuteNonQuery() > 0)
                    return true;
            }
            catch (NpgsqlException ex)
            {
                throw new MyException(ex.ErrorCode, "Ошибка SaveAttachDoc: " + ex.ToString());
            }
            finally
            {
                cmd.Dispose();
            }
            return false;
        }
        public string GetFactoryEMail(int request)
        {
            string email = string.Empty;
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using NpgsqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "select email from resreq.factory f, resreq.provider p ,resreq.request r "
                    + " where f.factory = p.factory and p.provider = r.provider and r.request = :request";
                cmd.Parameters.Add("request", NpgsqlDbType.Integer).Value = request;
                try
                {
                    NpgsqlDataReader reader = cmd.ExecuteReader();
                    if (reader.Read()) email = reader.GetString(0);
                    reader.Close();
                }
                catch (NpgsqlException ex)
                {
                    throw new MyException(ex.ErrorCode, "Ошибка GetFactoryEMail: " + ex.ToString());
                }
                finally
                {
                    cmd.Dispose();
                }
            }
            return email;
        }
        public string GetMailBody(int request)
        {
            string CustomerName=string.Empty;
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using NpgsqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "select trim(substr(u.login,1,30)) from resreq.request r,resreq.users u where r.USERS=u.USERS and r.request=:request";
                cmd.Parameters.Add("request", NpgsqlDbType.Integer).Value = request;
                try
                {
                    NpgsqlDataReader reader = cmd.ExecuteReader();
                    if (reader.Read()) CustomerName = reader.GetString(0);
                    reader.Close();
                }
                catch (NpgsqlException ex)
                {
                    throw new MyException(ex.ErrorCode, "Ошибка GetCustomerName: " + ex.ToString());
                }
            }
            StringBuilder sb = new();
            sb.Append("<!DOCTYPE HTML><html><header></header><body><p><i>Поступила электронная заявка №");
            sb.Append(request);
            sb.Append(" от ");
            sb.Append(DateTime.Now.ToShortDateString() + ".</i></p><p>Заказчик: ");
            sb.Append(CustomerName);
            sb.Append(".</p><hr/>");
            sb.Append("<p style=\"color: lightgray\">УВЕДОМЛЕНИЕ: Это электронное сообщение сформировано автоматически и не требует ответа.</p></body></html>");
            return sb.ToString();
        }
        public void SendMail(string from, string to, string subject, string body, string? host, int port, string? user, string? pwd)
        {
            //string? host, sport="25", user, password;
            //var section = configuration.GetSection("Mail");
            //foreach (var el in section.GetChildren())
            //{
            //    switch(el.Key)
            //    {
            //        case "smtpHost": host = el.Value; break; 
            //        case "smtpPort": sport = el.Value; break;
            //        case "smtpUser": user = el.Value; break;
            //        case "smtpPassword": password = el.Value; break;
            //    }
            //}
            //int port = 25;
            //_ = int.TryParse(sport, out port);
            
            //DB.SendMail(from, to, subject, body, host, port, user, password);

        }
    }
}
