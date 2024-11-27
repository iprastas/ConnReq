using ConnReq.Domain;
using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Npgsql;

namespace ConnReq.WebUI.Controllers
{
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
            using NpgsqlConnection checkName = PgDb.GetOpenConnection();
            using NpgsqlCommand name = checkName.CreateCommand();
            name.CommandText = $"select count(*) from resreq.users where login='{model.UserName}';";
            Npgsql.NpgsqlDataReader reader = name.ExecuteReader();
            int resN = -1;
            while (reader.Read())
            {
                resN = reader.GetInt32(0);
            }
            name.Dispose();
            checkName.Close();

            if (resN != 0)
            {
                model.ErrorMessage = $"Пользователь {model.UserName} уже зарегистрирован! Выберете другое имя.";
                return View(model);
            }
            
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
    }
}
