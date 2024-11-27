using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConnReq.WebUI.Controllers
{
    [Authorize]
    public class ResponseController : Controller
    {
        private IResponseProvider provider = null;
        public ResponseController(IResponseProvider p)
        {
            provider = p;
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
                try
                {
                    provider.SendMail(settings.EMail
                        , provider.GetCustomerEMail(model.Request)
                        , "Заявка №" + model.Request
                        , provider.GetMailBody(model));
                }
                catch (Exception ex)
                {
                    //log.Error(ex.Message);
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
