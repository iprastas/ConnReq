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
        IRequestDocProvider provider = null;
        public RequestDocController(IRequestDocProvider p)
        {
            provider = p;
        }
        public ActionResult Index(int request)
        {
            //if (HttpContext.Session["ControlState"] == null)
            //    HttpContext.Session["ControlState"] = new ControlsState() { Request = request };
            //ControlsState state = (ControlsState)HttpContext.Session["ControlState"];
            //state.Request = request;
            //state.ResourceKind = provider.GetResourceKind(request);
            //UserSettings settings = (UserSettings)HttpContext.Session["UserSettings"];
            //ViewBag.User = settings.UserName;
            RequestDocList model = new RequestDocList();
            //model.DocList = provider.GetRequestDocs(state.Request, state.ResourceKind, (int)settings.Typeofcustomer);
            //ViewBag.Message = provider.GetRequestName(request);
            return View(model);
        }
        //public ActionResult SaveDocument(int ordernmb, HttpPostedFileBase fileUpload)
        //{
        //    ControlsState state = (ControlsState)HttpContext.Session["ControlState"];
        //    int request = state.Request;
        //    byte[] bytes = new byte[fileUpload.ContentLength];
        //    fileUpload.InputStream.Read(bytes, 0, fileUpload.ContentLength);
        //    provider.UpdateDocument(request, ordernmb, fileUpload.FileName, bytes, fileUpload.ContentLength);
        //    //return View();
        //    return RedirectToRoute(new
        //    {
        //        controller = "RequestDoc",
        //        action = "Index",
        //        request = state.Request
        //    }); ;
        //}
    }
}
