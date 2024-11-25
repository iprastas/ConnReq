using Microsoft.Extensions.Configuration;
using Npgsql;

namespace ConnReq.Domain
{
    public static class PgDb
    {
        //static readonly string ConnectionString = "Server=127.0.0.1;Port=5432;Database=resreq;User Id=resreqapp;Password=t7k6vCJ5AGNN;Pooling=true;MinPoolSize=5;MaxPoolSize=500;Connection Idle Lifetime=30;Connection Pruning Interval=10;Command Timeout=100";
        static readonly string ConnectionString = "Server=127.0.0.1;Port=5432;Database=resreq;User Id=resreq;Password=resreq;Pooling=true;MinPoolSize=5;MaxPoolSize=500;Connection Idle Lifetime=30;Connection Pruning Interval=10;Command Timeout=100";
        public static NpgsqlConnection GetOpenConnection()
        {
            NpgsqlConnection conn = new NpgsqlConnection(ConnectionString);
            conn.Open();
            return conn;
        }
    }
}
