using ConnReq.Domain.Entities;
using ConnReq.WebUI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace ConnReq.WebUI.Controllers
{
     [Authorize]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public ActionResult Index()
        {
            UserSettings settings = new();
            settings.Restore(Request);
            if (settings != null)
            {
                switch (settings.TypeOfUser)
                {
                    case UserType.Customer:
                        return RedirectToRoute(new
                        {
                            controller = "Customer",
                            action = "Index",
                            customer = settings.User
                        });
                    case UserType.Provider:
                        return RedirectToRoute(new
                        {
                            controller = "Provider",
                            action = "Index"
                        });
                    case UserType.Mgkx:
                        return RedirectToRoute(new
                        {
                            controller = "Admin",
                            action = "Index"
                        });
                    default:
                        return RedirectToRoute(new
                        {
                            controller = "Account",
                            action = "Login"
                        });
                }
            }
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Краткое руководство.";

            return View();
        }

        public ActionResult Contact()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
