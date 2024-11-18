using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using ConnReq.WebUI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConnReq.WebUI.Controllers
{
    [Authorize]
    public class RequestDocController : Controller
    {
        IRequestDocProvider provider;
        public RequestDocController(IRequestDocProvider p)
        {
            provider = p;
        }
        public ActionResult Index(int request)
        {
            ControlsState state = new ControlsState();
            state.Restore(Request);
            state.Request = request;
            state.ResourceKind = provider.GetResourceKind(request);
            state.Save(Response);
            UserSettings settings = new UserSettings();
            settings.Restore(Request);
            ViewBag.User = settings.UserName;
            RequestDocList model = new RequestDocList();
            model.DocList = provider.GetRequestDocs(state.Request, state.ResourceKind, (int)settings.Typeofcustomer);
            ViewBag.Message = provider.GetRequestName(request);
            return View(model);
        }
        public ActionResult SaveDocument(int ordernmb, IFormFile fileUpload)
        {
            ControlsState state = new();
            state.Restore(Request);
            int request = state.Request;
            byte[] bytes = new byte[fileUpload.Length];
            using(MemoryStream ms = new MemoryStream()) { 
                fileUpload.CopyTo(ms);
                ms.Read(bytes, 0, bytes.Length);
            }
            provider.UpdateDocument(request, ordernmb, fileUpload.FileName, bytes, (int)fileUpload.Length);
            return RedirectToRoute(new
            {
                controller = "RequestDoc",
                action = "Index",
                request = state.Request
            }); ;
        }
    }
}
