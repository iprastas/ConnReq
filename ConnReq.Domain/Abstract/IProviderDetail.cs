using ConnReq.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Abstract
{
   public interface IProviderDetail
    {
        Provider GetProvider(int factory);
        List<ListItem> GetTerritory();
        int SaveProvider(Provider model);
    }
}
