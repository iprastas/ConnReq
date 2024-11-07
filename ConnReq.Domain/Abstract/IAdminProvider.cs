using ConnReq.Domain.Entities;

namespace ConnReq.Domain.Abstract
{
    public interface IAdminProvider
    {
        List<Provider> GetFactoryList();
        List<NotActiveUsers> GetNotActiveList();
        void DeleteUser(int id);
        List<ListItem> GetResourceKind();
        List<ListItem> GetTerritory();
        List<int> GetStatInfo(DateTime since, DateTime upto, int resKind, int terr);
        SvodForm GetForm(int terrWork,int kind,DateTime since,DateTime upto);
    }
}
