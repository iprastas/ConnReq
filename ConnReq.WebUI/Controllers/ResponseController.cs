using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConnReq.WebUI.Controllers
{
    [Authorize]
    public class ResponseController : Controller
    {
        private IResponseProvider provider;
        private IConfiguration configuration;
        public ResponseController(IResponseProvider p,IConfiguration conf)
        {
            provider = p;
            configuration = conf;
        }

        public ActionResult Index(int request)
        {
            UserSettings settings = new();
            settings.Restore(Request);
            ViewBag.User = settings.UserName;
            RequestData model = provider.GetRequestData(request);
            model.IncomingDate = DateTime.Now;
            return View(model);
        }
        [HttpPost]
        public ActionResult Index(RequestData model)
        {
            UserSettings settings = new();
            settings.Restore(Request);
            if (ModelState.IsValid && provider.UpdateRequestData(model, settings.UserName))
            {
                string? host="", sport = "25", user="", password = "";
                var section = configuration.GetSection("Mail");
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
                    provider.SendMail(settings.EMail
                        , provider.GetCustomerEMail(model.Request)
                        , "Заявка №" + model.Request
                        , provider.GetMailBody(model)
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
