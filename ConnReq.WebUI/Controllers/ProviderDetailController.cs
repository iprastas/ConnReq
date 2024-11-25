using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace ConnReq.WebUI.Controllers
{
    [Authorize]
    public class ProviderDetailController : Controller
    {
        IProviderDetail provider; 
        public ProviderDetailController(IProviderDetail p)
        {
            provider = p;
        }
        public ActionResult Edit(int? factory)
        {
            UserSettings settings = new();
            settings.Restore(Request);
            ViewBag.User = settings.UserName;
            Provider model = new Provider();
            if (factory > 0 )
            {
                model = provider.GetProvider((int)factory);
            }
            if(factory==null||factory==0)
            {
                model.TerritoryWork = new SelectList(provider.GetTerritory(), "Value", "Text");
                model.Territory = 3;
            }
            return View(model);
        }
        [HttpPost]
        public ActionResult Edit(Provider model)
        {
            if (ModelState.IsValid)
            {
                if(provider.SaveProvider(model)>0)
                {
                    return RedirectToRoute(
                        new {
                        controller = "Admin",
                        action = "Provider"
                    });
                }
            }
            return View("Edit");
        }

    }
}
