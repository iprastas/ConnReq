using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using ConnReq.WebUI.Infrastructure;
using ConnReq.WebUI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using System.Net;
using System.Net.Mail;

namespace ConnReq.WebUI.Controllers
{
    [AppException]
    [Authorize]
    public class NewRequestController : Controller
    {
        INewRequestProvider provider;
        public NewRequestController(INewRequestProvider p) { provider = p; }
        public IActionResult Index()
        {
            NewRequest model = new NewRequest();
            UserSettings settings = new UserSettings();
            ControlsState state = new ControlsState(){ Territory=3};
            settings.Restore(Request);
            ViewBag.User = settings.UserName;
            model.Customer = settings.User;
            return View(model);
        }
        [HttpGet]
        public JsonResult GetResourceKind()
        {
            List<ListItem> list = provider.GetResourceKind();
            return Json(list);
        }
        [HttpGet]
        public JsonResult GetProviders()
        {
            ControlsState state = new ControlsState();
            state.Restore(Request);
            List<ListItem> list = provider.GetProviders(state.ResourceKind,state.Territory);
            return Json(list);
        }
        [HttpGet]
        public JsonResult GetTerritory()
        {
            List<ListItem> list = provider.GetTerritory();
            return Json(list);
        }
        [HttpPost]
        public JsonResult PostCtrlChanged(string ctrl,string value)
        {
            ControlsState state = new();
            state.Restore(Request);
            int val = 0;string ret = string.Empty;
            if (ctrl == "resourceKind")
            {
                 if(int.TryParse(value, out val))
                    state.ResourceKind = val;
                if (value == string.Empty)
                    state.ResourceKind = 0;
                ret = "resource";
            }
            if(ctrl == "territory")
            {
                if (int.TryParse(value, out val))
                    state.Territory = val;
                ret = "territory";
            }
            if(ctrl == "providers")
            {
                 if (int.TryParse(value, out val))
                    state.Provider = val;
                ret = "provider";
            }
            state.Save(Response);
            return Json(ret);
        }
        public ActionResult CreateRequest()
        {
            UserSettings settings = new UserSettings();settings.Restore(Request);
            ControlsState state = new ControlsState();state.Restore(Request);
            int request = provider.SaveRequest(settings.User, state.Provider,settings.UserName);
            state.Request = request;
            if (request > 0)
            {
                return RedirectToRoute(new
                {
                    controller = "AttachDocs",
                    action = "CreateRequest",
                 });
            }
            else
            {
                return View();
            }
        }
        [HttpGet]
        public JsonResult GetDocuments()
        {
            UserSettings settings = new UserSettings();settings.Restore(Request);
            ControlsState state = new ControlsState();state.Restore(Request);
            int request = provider.SaveRequest(settings.User, state.Provider,settings.UserName);
            state.Request = request;
            List<DocTempl> ret = provider.GetDocuments( (int)settings.Typeofcustomer, state.Request);
            return Json(ret);
        }
        [HttpPost]
        public ActionResult SaveDocument(ICollection<IFormFile> fileUpload)
        {
            bool canSendEMail = true;
            UserSettings settings = new UserSettings();settings.Restore(Request);
            ControlsState state = new ControlsState();state.Restore(Request);
            int i = 0;
            foreach (var file in fileUpload)
            {
                if (file == null) continue;
                byte[] bytes = new byte[file.Length];
                using(MemoryStream ms = new MemoryStream())
                {
                    file.CopyTo(ms);
                    ms.Read(bytes, 0, bytes.Length);
                }
                canSendEMail = canSendEMail && provider.SaveAttachDoc(state.Request, i++, file.FileName, bytes, (int)file.Length);
             }
            if (canSendEMail)
            {
                try
                {
                    provider.SendMail(settings.EMail
                        , provider.GetFactoryEMail(state.Request)
                        , "Заявка №" + state.Request
                        , provider.GetMailBody(state.Request));
                }catch(SmtpException ex){ throw new MyException(-1, ex.Message);}
            }
            return RedirectToRoute(new
            {
                controller = "Customer",
                action = "Index",
                customer = settings.User
            });
        }

    }
}
