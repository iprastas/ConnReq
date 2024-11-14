using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using ConnReq.WebUI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting.Internal;

namespace ConnReq.WebUI.Controllers
{
    [Authorize]
    public class CustomerController : Controller
    {
        // GET: Customer
        ICustomerProvider provider = null;

        public CustomerController(ICustomerProvider p)
        {
            provider = p;
        }
        public ActionResult Index(int customer)
        {
            UserSettings settings = new();
            settings.Restore(Request);
            ViewBag.User = settings.UserName;
            if (settings.TypeOfUser != UserType.Customer)
            {
                return RedirectToRoute(new
                {
                    controller = "Account",
                    action = "Login"
                });
            }
            RequestList model = new RequestList();
            model.RequestItems = provider.ReadCustomerRequest(customer);
            return View(model);
        }
        public ActionResult RemoveRequest(int request)
        {
            provider.RemoveRequest(request);
            UserSettings settings = new();
            settings.Restore(Request);
            return RedirectToAction("Index", new { customer = settings.User });
        }
        //public FileResult Download()
        //{
        //    byte[] buffer = System.IO.File.ReadAllBytes(HostingEnvironment.MapPath(@"~/Documents/ЗАЯВКА_ЮЛ_ИП_ФЛ.doc"));
        //    return File(buffer, "application/octet-stream", "Заявки.doc");
        //}
    }
}
