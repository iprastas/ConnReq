using ConnReq.Domain.Abstract;
using ConnReq.Domain.Concrete;
using ConnReq.Domain.Entities;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using ConnReq.Domain;
using Npgsql;
using NpgsqlTypes;

namespace ConnReq.WebUI.Controllers
{
    public class AccountController : Controller
    {
        IAuthProvider authProvider;
        public AccountController(IAuthProvider auth)
        {
            authProvider = auth;
        }
        public IActionResult Login()
        {
            LoginViewModel model = new LoginViewModel();
            return View(model);
        }
        [HttpPost]
        public ActionResult Login(LoginViewModel model)
        {
            UserSettings settings = authProvider.Authenticate(model);
            if (ModelState.IsValid && settings.IsValid)
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimsIdentity.DefaultNameClaimType, model.UserName)
                };
                var claimsIdentity = new ClaimsIdentity( claims, CookieAuthenticationDefaults.AuthenticationScheme);

                var authProperties = new AuthenticationProperties { AllowRefresh = true };
                HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties);

                settings.Save(HttpContext.Response);
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
                            controller = "Home",
                            action = "Index"
                        });
                }
             }
            else
            {
                return View(model);
            }
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> LogOff()
        {
            await HttpContext.SignOutAsync();
            return RedirectToAction("Login", "Account");
        }
        [HttpGet]
        public ActionResult ChangePwd()
        {
            ChangePwdModel model = new ChangePwdModel();
            return View(model);
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ChangePwd(ChangePwdModel model)
        {
            model.ErrorMsg = authProvider.PasswordChanged(model);
            if (ModelState.IsValid && model.ErrorMsg == string.Empty)
            {
                using (NpgsqlConnection conn = PgDb.GetOpenConnection())
                {
                    using NpgsqlCommand cmd = conn.CreateCommand();
                    cmd.CommandText = "update resreq.users SET password=:pwd,changedate=:chdt where login=:lg;";
                    cmd.Parameters.Add(":pwd", NpgsqlDbType.Varchar).Value = model.Password2;
                    cmd.Parameters.Add(":chdt", NpgsqlDbType.Date).Value = DateTime.Now;
                    cmd.Parameters.Add(":lg", NpgsqlDbType.Varchar).Value = model.UserName;

                    cmd.ExecuteNonQuery();

                    conn.Close();
                }
                 return RedirectToRoute(new
                 {
                    controller = "Account",
                    action = "Login"
                 });
            }
            else
            {
                model.ErrorMsg = "Пользователь не зарегистрирован в БД!";
				return View(model);
            }
        }
    }
}
