using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using Npgsql;
using NpgsqlTypes;

namespace ConnReq.Domain.Concrete
{
    public class AuthProvider : IAuthProvider
    {
        public UserSettings Authenticate(LoginViewModel login)
        {
            UserSettings settings = new();
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                NpgsqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "select typeofcustomer,typeofuser,email,factory,users from resreq.users"
                    + " where login=:login and password=:password";
                cmd.CommandType = System.Data.CommandType.Text;
                string? userName = login.UserName;
                cmd.Parameters.Add("login", NpgsqlDbType.Varchar).Value = string.IsNullOrEmpty(userName) ? global::System.DBNull.Value : userName;
                cmd.Parameters.Add("password", NpgsqlDbType.Varchar).Value = string.IsNullOrEmpty(login.Password) ? DBNull.Value : login.Password;
                settings.UserName = userName ?? "";
                NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    settings.IsValid = true;
                    if (!reader.IsDBNull(0))
                        settings.Typeofcustomer = (CustomerType)reader.GetDecimal(0);
                    if (!reader.IsDBNull(1))
                        settings.TypeOfUser = (UserType)reader.GetDecimal(1);
                    if (!reader.IsDBNull(2))
                        settings.EMail = reader.GetString(2);
                    if (!reader.IsDBNull(3))
                        settings.Factory = (int)reader.GetDecimal(3);
                    if (!reader.IsDBNull(4))
                        settings.User = (int)reader.GetDecimal(4);
                    settings.IsValid = true ;
                }
                reader.Close();
                cmd.Dispose();
                return settings;
            }
        }
        public string PasswordChanged(ChangePwdModel model)
        {
            string ret=string.Empty;

            return ret;
        }
    }
}
