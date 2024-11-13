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
            cmd.CommandText = @"set search_path to resreq;INSERT INTO resreq.users(login,name,inn,email,password,typeofcustomer,typeofuser,factory) VALUES(@login,@name,@inn,@email,@password,@tc,3,null)";
            cmd.Parameters.Add("login", NpgsqlDbType.Varchar).Value = settings.UserName;
            cmd.Parameters.Add("name", NpgsqlDbType.Varchar).Value = settings.FactoryName;
            cmd.Parameters.Add("inn", NpgsqlDbType.Varchar).Value = settings.Inn != null ? settings.Inn : DBNull.Value;
            cmd.Parameters.Add("email", NpgsqlDbType.Varchar).Value = settings.EMail;
            cmd.Parameters.Add("password", NpgsqlDbType.Varchar).Value = settings.Password;
            cmd.Parameters.Add("tc", NpgsqlDbType.Integer);
            switch (settings.Typeofcustomer)
            {
                case CustomerType.Factory:
                    cmd.Parameters["tc"].Value = 1;
                    break;
                case CustomerType.IndivEntr:
                    cmd.Parameters["tc"].Value = 2;
                    break;
                case CustomerType.Individual:
                    cmd.Parameters["tc"].Value = 3;
                    break;
                default:
                    cmd.Parameters["tc"].Value = 0;
                    break;
            }

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
