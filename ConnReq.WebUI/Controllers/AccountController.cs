﻿using ConnReq.Domain.Abstract;
using ConnReq.Domain.Concrete;
using ConnReq.Domain.Entities;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;

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
        //[HttpPost]
        //[ValidateAntiForgeryToken]
        //public ActionResult LogOff()
        //{
        //    log.Info("LogOff user: " + User.Identity.Name + " , sessionId - " + HttpContext.Session.SessionID);
        //    Request.Cookies.Clear();
        //    FormsAuthentication.SignOut();
        //    Session.Clear();
        //    Session.Abandon();
        //    return RedirectToAction("Login", "Account");
        //}

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
