using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using Microsoft.AspNetCore.Mvc.Rendering;
using Npgsql;
using NpgsqlTypes;
using System.Data;
using System.Text;

namespace ConnReq.Domain.Concrete
{
    public class ProviderDetail : IProviderDetail
    {
        public Provider GetProvider(int factory)
        {
            Provider data = new Provider();
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using (NpgsqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = "select f.factory,f.name,f.territorywork,f.inn,f.email,f.website,f.chief,f.address"
                   + ",f.since,f.upto"
                    + ",(select count(*) from resreq.provider p where p.factory = f.factory and p.resourcekind =1)"
                    + ",(select count(*) from resreq.provider p where p.factory = f.factory and p.resourcekind =2)"
                    + ",f.territorywork"
                    + " from resreq.factory f,resreq.territory t where f.territorywork = t.territory and f.factory=:factory order by 1";
                    cmd.Parameters.Add(":factory", NpgsqlDbType.Integer).Value = factory;
                    try
                    {
                        NpgsqlDataReader  reader = cmd.ExecuteReader();
                        while (reader.Read())
                        {
                            if (!reader.IsDBNull(0))
                                data.FactoryId = (int)reader.GetDecimal(0);
                            if (!reader.IsDBNull(1))
                                data.Name = reader.GetString(1);
                            if (!reader.IsDBNull(2))
                                data.Territory = (int)reader.GetDecimal(2);
                            if (!reader.IsDBNull(3))
                                data.INN = reader.GetString(3);
                            if (!reader.IsDBNull(4))
                                data.EMail = reader.GetString(4);
                            if (!reader.IsDBNull(5))
                                data.WebSite = reader.GetString(5);
                            if (!reader.IsDBNull(6))
                                data.Chief = reader.GetString(6);
                            if (!reader.IsDBNull(7))
                                data.Address = reader.GetString(7);
                            if (!reader.IsDBNull(8))
                                data.Since = reader.GetDateTime(8);
                            if (!reader.IsDBNull(9))
                                data.Upto = reader.GetDateTime(9);
                            if (!reader.IsDBNull(10))
                                data.Warm = reader.GetDecimal(10) == 1 ? true : false;
                            if (!reader.IsDBNull(11))
                                data.Water = reader.GetDecimal(11) == 1 ? true : false;
                            if (!reader.IsDBNull(12))
                            {
                                data.TerritoryWork = new SelectList(GetTerritory(), "Value", "Text", data.Territory);
                            }
                        }
                    }
                    catch (NpgsqlException ex)
                    {
                        throw new MyException(ex.ErrorCode, "Ошибка GetFactoryList: " + ex.ToString());
                    }
                    finally
                    {
                        cmd.Dispose();
                    }
                }
            }
            return data;
        }
        public int SaveProvider(Provider p)
        {
            int warm = 0, water = 0;
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using (NpgsqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = "call resreq.updatefactoryprovider(:nfactory,:vname,:nterritory,:vinn,:vemail,:vwebsite,:vchief,:vaddress,:dsince,:dupto,:nwarm,:nwater)";
                    NpgsqlParameter f = new NpgsqlParameter("nfactory", NpgsqlDbType.Integer); f.Value = p.FactoryId;
                    f.Direction = ParameterDirection.InputOutput;
                    cmd.Parameters.Add(f);
                    cmd.Parameters.Add("vname", NpgsqlDbType.Varchar).Value = string.IsNullOrEmpty(p.Name) ? DBNull.Value : p.Name;
                    cmd.Parameters.Add("nterritory", NpgsqlDbType.Integer).Value = p.Territory;
                    cmd.Parameters.Add("vinn", NpgsqlDbType.Varchar).Value = string.IsNullOrEmpty(p.INN) ? DBNull.Value : p.INN;
                    cmd.Parameters.Add("vemail", NpgsqlDbType.Varchar).Value = string.IsNullOrEmpty(p.EMail) ? DBNull.Value : p.EMail;
                    cmd.Parameters.Add("vwebsite", NpgsqlDbType.Varchar).Value = string.IsNullOrEmpty(p.WebSite) ? DBNull.Value : p.WebSite;
                    cmd.Parameters.Add("vchief", NpgsqlDbType.Varchar).Value = string.IsNullOrEmpty(p.Chief) ? DBNull.Value : p.Chief;
                    cmd.Parameters.Add("vaddress",  NpgsqlDbType.Varchar).Value = string.IsNullOrEmpty(p.Address) ? DBNull.Value : p.Address;
                    cmd.Parameters.Add("dsince", NpgsqlDbType.Date).Value = p.Since;
                    cmd.Parameters.Add("dupto", NpgsqlDbType.Date).Value = p.Upto is null ? DBNull.Value : p.Upto;
                    if (p.Warm) warm = 1;   else warm=0;
                    NpgsqlParameter pwarm = new NpgsqlParameter("nwarm", NpgsqlDbType.Integer); pwarm.Value = warm;
                    cmd.Parameters.Add(pwarm);
                    if (p.Water) water = 1; else water=0;
                    NpgsqlParameter pwater = new NpgsqlParameter("nwater",NpgsqlDbType.Integer); pwater.Value = water;
                    cmd.Parameters.Add(pwater);
                    try
                    {
                        cmd.ExecuteNonQuery();
                        p.FactoryId = (int)cmd.Parameters["nfactory"].Value;
                    }
                    catch(NpgsqlException ex)
                    {
                        throw new MyException(ex.ErrorCode, "Ошибка SaveProvider: " + ex.ToString());
                    }
                    finally
                    {
                        cmd.Dispose();
                    }
                }
            }
            return p.FactoryId;

        }
        public List<ListItem> GetTerritory()
        {
            List<ListItem> list = new List<ListItem>();
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using (NpgsqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = "select t.territory,t.name from resreq.territory t order by nmb";
                    try
                    {
                        NpgsqlDataReader reader = cmd.ExecuteReader();
                        while (reader.Read())
                        {
                            ListItem item = new ListItem();
                            if (!reader.IsDBNull(0))
                                item.Value = reader.GetDecimal(0).ToString();
                            if (!reader.IsDBNull(1))
                                item.Text = reader.GetString(1);
                            list.Add(item);
                        }
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
            }
            return list;
        }
    }
}
