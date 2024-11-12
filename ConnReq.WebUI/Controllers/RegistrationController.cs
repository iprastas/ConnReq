using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConnReq.WebUI.Controllers
{
    //[Authorize]
    public class RegistrationController : Controller
    {
        // GET: Registration
        IRegistrationProvider provider;
        public RegistrationController(IRegistrationProvider p)
        {
            provider = p;
        }
        public ActionResult Index()
        {
            UserSettings model = new UserSettings("");
            model.Typeofcustomer = CustomerType.Factory;
            return View(model);
        }
        [HttpPost]
        public ActionResult Index(UserSettings model)
        {
            if (ModelState.IsValid && provider.Registr(model))
            {
                return RedirectToRoute(new
                {
                    controller = "Account",
                    action = "Login",
                });
            }
            else
            {
                return View(model);
            }
        }
        [HttpPost]
        public string CheckUser(string user)
        {
            if (provider.IsUserNameValid(user))
                return string.Empty;
            else return "Пользователь " + user + " уже зарегистрирован! Выберете другое имя.";
        }
    }
}
