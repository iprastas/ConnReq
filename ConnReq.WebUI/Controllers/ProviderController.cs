using ConnReq.Domain.Abstract;
using ConnReq.Domain.Entities;
using ConnReq.WebUI.Models;
using Microsoft.AspNetCore.Mvc;

namespace ConnReq.WebUI.Controllers
{
    public class ProviderController : Controller
    {
        IProviderRepository repository ;
        public ProviderController(IProviderRepository r)
        {
            repository = r;
        }
        public ActionResult Index()
        {
            UserSettings settings = new UserSettings();
            settings.Restore(Request);
            if (settings.TypeOfUser!= UserType.Provider)
            {
                return RedirectToRoute(new
                {
                    controller = "Account",
                    action = "Login"
                });
            }
            RequestList model = new RequestList();
            model.RequestItems = repository.GetProviderRequests(settings.Factory);
            return View(model);
        }
        public ActionResult Remove(int request)
        {
            repository.Delete(request);
            return RedirectToAction("Index");
        }
        public FileResult DownloadFiles(int request)
        {
            string file = repository.GetCustomerName(request) + ".zip";
            return File(repository.GetDocumentsStream(request), "application/zip", file);
        }
    }
}
