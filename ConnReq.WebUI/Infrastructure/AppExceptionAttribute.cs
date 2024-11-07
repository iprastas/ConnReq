using ConnReq.Domain.Entities;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using ConnReq.WebUI.Models;
using System.Reflection;

namespace ConnReq.WebUI.Infrastructure
{
    public class AppExceptionAttribute : ExceptionFilterAttribute, IExceptionFilter
    {
        override public void  OnException(ExceptionContext filterContext)
        {
            string? actionName = filterContext.ActionDescriptor.DisplayName;
            string? exceptionStack = filterContext.Exception.StackTrace;
            string? exceptionMessage = filterContext.Exception.Message;
            filterContext.Result = new ContentResult
            {
                Content = $"В методе {actionName} возникло исключение: \n {exceptionMessage}"
            };
            filterContext.ExceptionHandled = true;
        }
    }
}
