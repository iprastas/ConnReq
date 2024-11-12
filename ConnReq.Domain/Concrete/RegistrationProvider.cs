using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using Npgsql;
using NpgsqlTypes;

namespace ConnReq.Domain.Concrete
{
    public class RegistrationProvider : IRegistrationProvider
    {
        public bool Registr(UserSettings settings)
        {
            using NpgsqlConnection conn = PgDb.GetOpenConnection();
            using NpgsqlCommand cmd = conn.CreateCommand();
            cmd.CommandText = "insert into resreq.users(login,name,inn,email,password,typeofcustomer,typeofuser,changedate) "
                + " values(trim(:login),trim(:name),:inn,:email,:password,:isIndividual,:typeofuser,:changedate)";
            cmd.Parameters.Add("login", NpgsqlDbType.Varchar); cmd.Parameters["login"].Value = settings.UserName;
            cmd.Parameters.Add("name", NpgsqlDbType.Varchar); cmd.Parameters["name"].Value = settings.FactoryName;
            cmd.Parameters.Add("inn", NpgsqlDbType.Varchar); cmd.Parameters["inn"].Value = settings.Inn;
            cmd.Parameters.Add("email", NpgsqlDbType.Varchar); cmd.Parameters["email"].Value = settings.EMail;
            cmd.Parameters.Add("password", NpgsqlDbType.Varchar); cmd.Parameters["password"].Value = settings.Password;
            cmd.Parameters.Add("typeofcustomer", NpgsqlDbType.Integer);
            switch (settings.Typeofcustomer)
            {
                case CustomerType.Factory:
                    cmd.Parameters["typeofcustomer"].Value = 1;
                    break;
                case CustomerType.IndivEntr:
                    cmd.Parameters["typeofcustomer"].Value = 2;
                    break;
                case CustomerType.Individual:
                    cmd.Parameters["typeofcustomer"].Value = 3;
                    break;
                default:
                    cmd.Parameters["typeofcustomer"].Value = 0;
                    break;
            }
            cmd.Parameters.Add("typeofuser", NpgsqlDbType.Integer); cmd.Parameters["typeofuser"].Value = 3;
            cmd.Parameters.Add("changedate", NpgsqlDbType.Date); cmd.Parameters["changedate"].Value = DateTime.Now;

            try
            {
                if (cmd.ExecuteNonQuery() > 0)
                    return true;
            }
            catch (NpgsqlException ex)
            {
                throw new MyException(ex.ErrorCode, "Ошибка регистрации пользователя: " + ex.ToString());
            }
            finally
            {
                cmd.Dispose();
            }
            return false;
        }

        public bool IsUserNameValid(string user)
        {
            using NpgsqlConnection conn = PgDb.GetOpenConnection();
            using NpgsqlCommand cmd = conn.CreateCommand();
            cmd.CommandText = "select * from resreq.users where trim(login)=trim(:name)";
            cmd.Parameters.Add("name", NpgsqlDbType.Varchar);
            cmd.Parameters["name"].Value = user;

            NpgsqlDataReader reader = cmd.ExecuteReader();
            try
            {
                reader = cmd.ExecuteReader();
                reader.Read();
                if (reader.HasRows)
                    return false;
            }
            catch (NpgsqlException)
            {
                return false;
            }
            finally { cmd.Dispose(); }
            return true;
        }
    }
}
