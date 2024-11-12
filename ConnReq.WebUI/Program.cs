using ConnReq.Domain;
using ConnReq.Domain.Abstract;
using ConnReq.Domain.Concrete;
using ConnReq.Domain.Entities;
using Microsoft.AspNetCore.Authentication.Cookies;
namespace ConnReq.WebUI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllersWithViews();
            builder.Services.AddScoped<IAuthProvider, AuthProvider>();
            builder.Services.AddScoped<IAdminProvider, AdminProvider>();
            builder.Services.AddScoped<IProviderDetail, ProviderDetail>();
            builder.Services.AddScoped<IRegistrationProvider, RegistrationProvider>();
            
            builder.Services.AddSession(options => {
                options.IdleTimeout = TimeSpan.FromMinutes(24*60);
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
            });
            builder.Services.AddMemoryCache();
            builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options => 
            {
                options.LoginPath = new PathString("/Account/Login");
                options.ExpireTimeSpan = TimeSpan.FromHours(24);
                options.SlidingExpiration = true;
            });
            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
            }
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            app.Run();
        }
    }
}
