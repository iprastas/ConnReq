using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using ConnReq.WebUI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConnReq.WebUI.Controllers
{
    [Authorize]
    public class AdminController : Controller
    {
        // GET: Admin
        IAdminProvider provider ;
        public AdminController(IAdminProvider p)
        {
            provider = p;
        }
        public ActionResult Index()
        {
            UserSettings settings = new();
            settings.Restore(Request);
            ViewBag.User = settings.UserName;
            if(settings.TypeOfUser!= UserType.Mgkx)
            {
                return RedirectToRoute(new
                {
                    controller = "Account",
                    action = "Login"
                });
            }
            return View();
        }
        [HttpGet]
        public ActionResult Provider()
        {
            UserSettings settings = new();
            settings.Restore(Request);
            ViewBag.User = settings.UserName;
            FactoryList model = new FactoryList();
            model.FactoryItems = provider.GetFactoryList();
            return View(model);
        }
        [HttpGet]
        public ActionResult Users()
        {
            UserSettings settings = new();
            settings.Restore(Request);
            ViewBag.User = settings.UserName;
            NotActiveList model = new NotActiveList();
            model.NotActiveItems = provider.GetNotActiveList();
            return View(model);
        }
        public ActionResult Delete(int user)
        {
            provider.DeleteUser(user);
            UserSettings settings = new();
            settings.Restore(Request);
            ViewBag.User = settings.UserName;
            NotActiveList model = new NotActiveList();
            model.NotActiveItems = provider.GetNotActiveList();
            return View("Users",model);
        }
        public ActionResult RequestStat()
        {
            UserSettings settings = new();
            settings.Restore(Request);
            ViewBag.User = settings.UserName;
            return View();
        }
        [HttpGet]
        public JsonResult GetResourceKind()
        {
            return Json(provider.GetResourceKind());
        }
        [HttpGet]
        public JsonResult GetTerritory()
        {
            return Json(provider.GetTerritory());
        }
        [HttpGet]
        public JsonResult GetForm(int t = 0, int kind = 0, string snc="", string upt="" )
        {
            DateTime d1 = new DateTime(DateTime.Now.Year, 1,1), d2 = new DateTime(DateTime.Now.Year,12,31);
            if(snc!=string.Empty) DateTime.TryParse(snc, out d1);
            if (upt != string.Empty) DateTime.TryParse(upt, out d2);
            var ret = Json(provider.GetForm(t,kind,d1,d2));
            return ret;
        }
    }
}
