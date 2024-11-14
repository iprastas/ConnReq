using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using Npgsql;
using NpgsqlTypes;

namespace ConnReq.Domain.Concrete
{
    public class AdminProvider : IAdminProvider
    {
        public  List<Provider> GetFactoryList()
        {
            List<Provider> list = [];
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            { 
                using(NpgsqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = "select f.factory,f.name,f.territorywork,f.inn,f.email,f.website,f.chief,f.address,f.since,f.upto"
                    + ",(select count(*) from resreq.provider p where p.factory = f.factory and p.resourcekind =1)"
                    + ",(select count(*) from resreq.provider p where p.factory = f.factory and p.resourcekind =2),t.name"
                    + " from resreq.factory f,resreq.territory t where f.territorywork = t.territory order by f.name";
                    NpgsqlDataReader reader = null;
                    try
                    {
                        reader = cmd.ExecuteReader();
                        while (reader.Read())
                        {
                            Provider data = new Provider();
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
                            if(!reader.IsDBNull(8))
                                data.Since = reader.GetDateTime(8);
                            if (!reader.IsDBNull(9))
                                data.Upto = reader.GetDateTime(9);
                            if (!reader.IsDBNull(10))
                                data.Warm = reader.GetDecimal(10) == 1 ? true : false;
                            if (!reader.IsDBNull(11))
                                data.Water = reader.GetDecimal(11) == 1 ? true : false;
                            if (!reader.IsDBNull(12))
                                data.TerritoryName = reader.GetString(12);
                                list.Add(data);
                        }
                    }
                    catch (NpgsqlException ex)
                    {
                        throw new MyException(ex.ErrorCode, "Ошибка GetFactoryList: " + ex.ToString());
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
                }
            }
            return list;
        }
        public List<NotActiveUsers> GetNotActiveList() {
            List<NotActiveUsers> list = new List<NotActiveUsers>();
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using(NpgsqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = "select users,name"
                        + ",case when u.typeofcustomer=1 then 'Юрлицо' when u.typeofcustomer=2 then'ИП' when u.typeofcustomer=3 then'Физлицо' else '' end"
                        + " ,extract(day from now() - u.CHANGEDATE)::integer"
                        + " from resreq.users u where  u.typeofuser=3 and (select count(*) from resreq.request r where r.users = u.users ) = 0"
                        + " order by 4 desc";
                    try
                    {
                        NpgsqlDataReader reader = cmd.ExecuteReader();
                        while (reader.Read())
                        {
                            NotActiveUsers item = new NotActiveUsers();
                            if (!reader.IsDBNull(0))
                                item.UserId = (int)reader.GetDecimal(0);
                            if (!reader.IsDBNull(1))
                                item.Name = reader.GetString(1);
                            if (!reader.IsDBNull(2))
                                item.CustomerType = reader.GetString(2);
                            if (!reader.IsDBNull(3))
                                item.NotActiveDays = (int)reader.GetDecimal(3);
                            list.Add(item);
                        }
                            }
                    catch (NpgsqlException ex)
                    {
                        throw new MyException(ex.ErrorCode, "Ошибка GetNotActiveList: " + ex.ToString());
                    }
                    finally
                    {
                        cmd.Dispose();
                    }
                }
            }
            return list;
        }
        public void DeleteUser(int id)
        {
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using(NpgsqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = "delete from resreq.users where users=:id";
                    cmd.Parameters.Add("id", NpgsqlDbType.Integer).Value=id;
                    try
                    {
                        cmd.ExecuteNonQuery();
                    }
                    catch(NpgsqlException ex)
                    {
                        throw new MyException(ex.ErrorCode, "Ошибка DeleteUser: " + ex.ToString());
                    }
                    finally
                    {
                        cmd.Dispose();
                    }
                }
            }
        }
        public List<ListItem> GetResourceKind()
        {
            List<ListItem> list = new List<ListItem>();
            int kind = 0; string name = string.Empty;
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using(NpgsqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = "select resourcekind,name from resreq.resourcekind order by 1";
                    cmd.Parameters.Add("resourcekind", NpgsqlDbType.Integer).Value = kind;
                    cmd.Parameters.Add("name", NpgsqlDbType.Varchar).Value =  name;
                    ListItem item0 = new ListItem() {Value="",Text="Все", Selected = true };
                    list.Add(item0);
                    try
                    {
                        NpgsqlDataReader reader= cmd.ExecuteReader();
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
                    catch(NpgsqlException ex)
                    {
                        throw new MyException(ex.ErrorCode, "Ошибка GetResourseKind: " + ex.ToString());
                    }
                    finally
                    {
                        cmd.Dispose();
                    }
                }
            }
            return list;
        }
        public List<ListItem> GetTerritory()
        {
            List<ListItem> list = new List<ListItem>();
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using(NpgsqlCommand cmd = conn.CreateCommand())
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
        public List<int> GetStatInfo(DateTime since, DateTime upto, int resKind, int terr)
        {
            List<int> list = new List<int>() { 0, 0, 0};
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using(NpgsqlCommand cmd = conn.CreateCommand())
                {
                    string sql = "select count(*) from resreq.request r, resreq.provider p,resreq.factory f where "
                    + " r.provider = p.provider and p.factory = f.factory and f.territorywork = coalesce(:terr, f.territorywork)"
                    + " and p.resourcekind = coalesce(:resKind, p.resourcekind)"
                    + " and OUTGOINGDATE >=:since and OUTGOINGDATE<= and :upto";
                    cmd.Parameters.Add("terr", NpgsqlDbType.Integer).Value = terr;
                    cmd.Parameters.Add("resKind", NpgsqlDbType.Integer).Value = resKind;
                    cmd.Parameters.Add("since", NpgsqlDbType.Date).Value = since;
                    cmd.Parameters.Add("upto", NpgsqlDbType.Date).Value = upto;
                    if (terr <= 3) cmd.Parameters["terr"].Value = DBNull.Value;
                    else cmd.Parameters["terr"].Value = terr;
                    if (resKind == 0) cmd.Parameters["resKind"].Value = DBNull.Value;
                    else cmd.Parameters["resKind"].Value = resKind;

                    try
                    {
                        NpgsqlDataReader reader = cmd.ExecuteReader();
                        if (reader.Read()) list[0] = (int)reader.GetDecimal(0);
                        reader.Close();
                        cmd.CommandText = sql + " and r.INCOMINGDATE is not null";
                        reader = cmd.ExecuteReader();
                        if (reader.Read()) list[1] = (int)reader.GetDecimal(0);
                        reader.Close();
                        cmd.CommandText = sql + " and r.contractdate is not null";
                        reader = cmd.ExecuteReader();
                        if (reader.Read()) list[2] = (int)reader.GetDecimal(0);
                        reader.Close();
                    }
                    catch(NpgsqlException ex)
                    {
                        throw new MyException(ex.ErrorCode, "Ошибка GetStatInfo: " + ex.ToString());
                    }
                    finally
                    {
                        cmd.Dispose();
                    }
                }
            }
            return list;

        }
        public SvodForm GetForm(int terrWork,int kind,DateTime since,DateTime upto)
        {
            int cnt1 = 0, cnt2 = 0, cnt3 = 0, cnt4 = 0, cnt5 = 0;
            SvodForm form = new SvodForm("Заявки - статистика");
            form.AddHeader(new HeaderCell(0, 0, "№"));
            form.AddHeader(new HeaderCell(0, 1, "Предприятия"));
            form.AddHeader(new HeaderCell(0, 2, "Заявок"));
            form.AddHeader(new HeaderCell(0, 3, "Рассмотрено"));
            form.AddHeader(new HeaderCell(0, 4, "К закл. договора"));
            form.AddHeader(new HeaderCell(0, 5, "Просрочено"));
            form.AddHeader(new HeaderCell(0, 6, "Аннулировано"));
            using(NpgsqlConnection conn = PgDb.GetOpenConnection())
            {
                using(NpgsqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = "select distinct f.factory,f.name||', '||f.address "
                        + ",resreq.reqcount(:since,:upto,:rkind,f.factory)"
                        + ",resreq.acceptedreqcount(:since,:upto,:rkind,f.factory)"
                        + ",resreq.contractreqcount(:since,:upto,:rkind,f.factory)"
                        + ",resreq.overduereqcount(:since,:upto,:rkind,f.factory)"
                        + ",resreq.annulreqcount(:since,:upto,:rkind,f.factory)"
                        + " from resreq.factory f,resreq.provider p where f.factory=p.factory";
                    if(kind!=0) cmd.CommandText += " and p.RESOURCEKIND = :rkind";
                    if(terrWork!=3) cmd.CommandText += " and f.territorywork=:terr";
                        cmd.CommandText += " order by 2";
                        cmd.Parameters.Add("since", NpgsqlDbType.Date).Value = since;
                        cmd.Parameters.Add("upto", NpgsqlDbType.Date).Value = upto;
                        cmd.Parameters.Add("rkind", NpgsqlDbType.Integer).Value = kind;
                        cmd.Parameters.Add("terr", NpgsqlDbType.Integer).Value = terrWork;
                        try
                        {
                            NpgsqlDataReader reader = cmd.ExecuteReader();
                            int row = 0;
                            while (reader.Read())
                            {
                                if (!reader.IsDBNull(0))
                                    form.AddCell(new FormCell() { Row=row, Column=0, Type=CellType.Integer, Value = reader.GetDecimal(0).ToString()});
                                if (!reader.IsDBNull(1))
                                    form.AddCell(new FormCell() { Row = row, Column=1, Type = CellType.Text, Value = reader.GetString(1)});
                                if (!reader.IsDBNull(2))
                                {
                                    cnt1 += (int)reader.GetDecimal(2);
                                    form.AddCell(new FormCell() { Row = row, Column = 2, Type = CellType.Integer, Value = reader.GetDecimal(2).ToString() });
                                }
                        
                                if (!reader.IsDBNull(3))
                                {
                                    cnt2 += (int)reader.GetDecimal(3);
                                    form.AddCell(new FormCell() { Row = row, Column = 3, Type = CellType.Integer, Value = reader.GetDecimal(3).ToString() });
                                }
                                if (!reader.IsDBNull(4))
                                {
                                    cnt3 += (int)reader.GetDecimal(4);
                                    form.AddCell(new FormCell() { Row = row, Column = 4, Type = CellType.Integer, Value = reader.GetDecimal(4).ToString() });
                                }
                                if (!reader.IsDBNull(5))
                                {
                                    cnt4 += (int)reader.GetDecimal(5);
                                    form.AddCell(new FormCell() { Row = row, Column = 5, Type = CellType.Integer, Value = reader.GetDecimal(5).ToString() });
                                }
                                if (!reader.IsDBNull(6))
                                {
                                    cnt5 += (int)reader.GetDecimal(6);
                                    form.AddCell(new FormCell() { Row = row, Column = 6, Type = CellType.Integer, Value = reader.GetDecimal(6).ToString() });
                                }
                                row++;
                            }
                            form.AddCell(new FormCell() { Row = row, Column = 1, Type = CellType.Text, Value = "Итого"});
                            form.AddCell(new FormCell() { Row = row, Column = 2, Type = CellType.Integer, Value = cnt1.ToString() });
                            form.AddCell(new FormCell() { Row = row, Column = 3, Type = CellType.Integer, Value = cnt2.ToString() });
                            form.AddCell(new FormCell() { Row = row, Column = 4, Type = CellType.Integer, Value = cnt3.ToString() });
                            form.AddCell(new FormCell() { Row = row, Column = 5, Type = CellType.Integer, Value = cnt4.ToString() });
                            form.AddCell(new FormCell() { Row = row, Column = 6, Type = CellType.Integer, Value = cnt5.ToString() });
                        }
                        catch (NpgsqlException ex)
                        {
                            throw new MyException(ex.ErrorCode, "Ошибка GetForm: " + ex.ToString());
                        }
                        finally
                        {
                            cmd.Dispose();
                        }
                    }
                }
            return form;;
        }
    }
}
