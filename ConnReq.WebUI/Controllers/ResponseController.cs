using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConnReq.WebUI.Controllers
{
    [Authorize]
    public class ResponseController(IResponseProvider p, IConfiguration conf) : Controller
    {
        public ActionResult Index(int request)
        {
            UserSettings settings = new();
            settings.Restore(Request);
            ViewBag.User = settings.UserName;
            RequestData model = p.GetRequestData(request);
            model.IncomingDate = DateTime.Now;
            return View(model);
        }
        [HttpPost]
        public ActionResult Index(RequestData model)
        {
            UserSettings settings = new();
            settings.Restore(Request);
            if (ModelState.IsValid && p.UpdateRequestData(model, settings.UserName))
            {
                string? host="", sport = "587", user="", password = "";
                var section = conf.GetSection("Mail");
                foreach (var el in section.GetChildren())
                {
                    switch (el.Key)
                    {
                        case "smtpHost": host = el.Value; break;
                        case "smtpPort": sport = el.Value; break;
                        case "smtpUser": user = el.Value; break;
                        case "smtpPassword": password = el.Value; break;
                    }
                }
                _ = int.TryParse(sport, out int port);
                try
                {
                    p.SendMail(settings.EMail
                        , p.GetCustomerEMail(model.Request)
                        , "Заявка №" + model.Request
                        , p.GetMailBody(model)
                        , host, port, user, password);
                }
                catch (Exception ex)
                {
                    throw new MyException(-1, ex.Message); 
                }
                return RedirectToRoute(new
                {
                    controller = "Provider",
                    action = "Index",
                    factory = settings.Factory
                });
            }
            return View();
        }
    }
}
