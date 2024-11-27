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
    public class ResponseProvider : IResponseProvider
    {
        public RequestData GetRequestData(int request)
        {
            RequestData data = new RequestData() { Request = request };
            using NpgsqlConnection conn = PgDb.GetOpenConnection();
            using NpgsqlCommand cmd = conn.CreateCommand();
            cmd.CommandText = "select incomingnum,incomingdate,contractdate,remarks from resreq.request r where r.request=:request";
            cmd.Parameters.Add("request", NpgsqlDbType.Integer).Value = request;
            NpgsqlDataReader reader = null;
            try
            {
                reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        data.IncomingNum = reader.GetString(0);
                    if (!reader.IsDBNull(1))
                        data.IncomingDate = reader.GetDateTime(1);
                    if (!reader.IsDBNull(2))
                        data.ContractDate = reader.GetDateTime(2);
                    if (!reader.IsDBNull(3))
                        data.Remarks = reader.GetString(3);
                }
            }
            catch (NpgsqlException ex)
            {
                throw new MyException(ex.ErrorCode, "Ошибка GetRequestData: " + ex.ToString());
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
            return data;
        }
        public bool UpdateRequestData(RequestData data, string userName)
        {
            using NpgsqlConnection conn = PgDb.GetOpenConnection();
            using NpgsqlCommand cmd = conn.CreateCommand();
            cmd.CommandText = "update resreq.request r set incomingnum=:num,incomingdate=:indate,contractdate=:contrdate,remarks=:rem"
                + ",username=:userName where r.request=:request";
            NpgsqlParameter _num = new("num", NpgsqlDbType.Varchar)
            {
                Value = data.IncomingNum
            };
            cmd.Parameters.Add(_num);

            NpgsqlParameter _indate = new("indate", NpgsqlDbType.Date)
            {
                Value = data.IncomingDate
            };
            cmd.Parameters.Add(_indate);

            NpgsqlParameter _contrdate = new("contrdate", NpgsqlDbType.Date)
            {
                Value = data.ContractDate
            };
            cmd.Parameters.Add(_contrdate);

            NpgsqlParameter _rem = new("rem", NpgsqlDbType.Text)
            {
                Value = data.Remarks
            };
            cmd.Parameters.Add(_rem);

            cmd.Parameters.AddWithValue("userName", NpgsqlTypes.NpgsqlDbType.Varchar, userName);
            cmd.Parameters.AddWithValue("request", NpgsqlTypes.NpgsqlDbType.Varchar, data.Request);
            try
            {
                if (cmd.ExecuteNonQuery() > 0) return true;
            }
            catch (NpgsqlException ex)
            {
                throw new MyException(ex.ErrorCode, "Ошибка UpdateRequestData: " + ex.ToString());
            }
            finally { cmd.Dispose(); }
            return false;
        }
        public string GetCustomerEMail(int request)
        {
            string ret = "";
            using NpgsqlConnection conn = PgDb.GetOpenConnection();
            using NpgsqlCommand cmd = conn.CreateCommand();
            cmd.CommandText = "select u.email from resreq.request r,resreq.users u where r.users=u.users and r.request=:request";
            cmd.Parameters.Add("request", NpgsqlDbType.Integer).Value = request;
            NpgsqlDataReader reader = null;
            try
            {
                reader = cmd.ExecuteReader();
                if (reader.Read()) ret = reader.GetString(0);
            }
            catch (NpgsqlException ex)
            {
                throw new MyException(ex.ErrorCode, "Ошибка GetCustomerEMail: " + ex.ToString());
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
        public string GetMailBody(RequestData model)
        {
            StringBuilder sb = new StringBuilder();
            if (model.Remarks != null && model.Remarks.Length > 0)
            {
                sb.Append("<!DOCTYPE HTML><html><header></header><body><p><i>");
                sb.Append("Ваша заявка рассмотрена.</i></p>");
                sb.Append("<p>Замечания по заявке: ");
                sb.Append(model.Remarks);
                sb.Append(".</p><hr/>");
                sb.Append("<p style=\"color: lightgray\">УВЕДОМЛЕНИЕ: Это электронное сообщение сформировано автоматически и не требует ответа.</p></body></html>");
            }
            else
            {
                sb.Append("<!DOCTYPE HTML><html><header></header><body><p><i>");
                sb.Append("Ваша заявка рассмотрена.</i></p>");
                sb.Append("<p>Замечаний нет, о дате заключения договора сообщим дополнительно");
                sb.Append(".</p><hr/>");
                sb.Append("<p style=\"color: lightgray\">УВЕДОМЛЕНИЕ: Это электронное сообщение сформировано автоматически и не требует ответа.</p></body></html>");
            }
            if (model.ContractDate != null)
            {
                sb.Append("<!DOCTYPE HTML><html><header></header><body><p><i>");
                sb.Append("Ваша заявка №" + model.Request + " от " + model.OutgoingDate.ToShortDateString() + " принята, назначена дата подписания договора на  ");
                sb.Append(((DateTime)model.ContractDate).ToShortDateString() + ". ");
                sb.Append("Для подписания договора необходимы оригиналы заявки и прилагаемых документов.</i></p><hr/>");
                sb.Append("<p style=\"color: lightgray\">УВЕДОМЛЕНИЕ: Это электронное сообщение сформировано автоматически и не требует ответа.</p></body></html>");
            }
            return sb.ToString();
        }
        public void SendMail(string from, string to, string subject, string body)
        {
                //string host = WebConfigurationManager.AppSettings["smtpHost"];
                //string sport = WebConfigurationManager.AppSettings["smtpPort"];
                //int port = 25;
                //int.TryParse(sport, out port);
                //string user = WebConfigurationManager.AppSettings["smtpUser"];
                //string password = WebConfigurationManager.AppSettings["smtpPassword"];
                //DB.SendMail(from, to, subject, body, host, port, user, password);
            /*MailMessage message = new MailMessage(from, to, subject, body);
            message.IsBodyHtml = true;
            using (var smtp = new SmtpClient())
            {
                var credential = new System.Net.NetworkCredential
                {
                    UserName = user,
                    Password = password
                };
                smtp.Credentials = credential;
                smtp.Host = host;
                smtp.Port = port;
                smtp.EnableSsl = true;
                await smtp.SendMailAsync(message);
            }*/
        }
    }
}
