using ConnReq.Domain;
using ConnReq.Domain.Abstract;
using ConnReq.Domain.Concrete;
using ConnReq.Domain.Entities;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel;

namespace ConnReq.WebUI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddDataProtection().UseCryptographicAlgorithms(
                new AuthenticatedEncryptorConfiguration {
                    EncryptionAlgorithm = EncryptionAlgorithm.AES_256_CBC,
                    ValidationAlgorithm = ValidationAlgorithm.HMACSHA256
                }
            );

            builder.Services.AddControllersWithViews();
            builder.Services.AddScoped<IAuthProvider, AuthProvider>();
            builder.Services.AddScoped<IAdminProvider, AdminProvider>();
            builder.Services.AddScoped<IProviderDetail, ProviderDetail>();
            builder.Services.AddScoped<IRegistrationProvider, RegistrationProvider>();
            builder.Services.AddScoped<IProviderRepository, ProviderRepository>();
            builder.Services.AddScoped<ICustomerProvider, CustomerProvider>();
            builder.Services.AddScoped<IRequestDocProvider, RequestDocProvider>();
            builder.Services.AddScoped<INewRequestProvider,NewRequestProvider>();

            builder.Services.AddSession(options => {
                options.IdleTimeout = TimeSpan.FromMinutes(24*60);
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
            });
            builder.Services.AddMemoryCache();
             builder.Services.AddMvc().AddJsonOptions(o =>
                {
                    o.JsonSerializerOptions.PropertyNamingPolicy = null;
                    o.JsonSerializerOptions.IncludeFields = true;
                    o.JsonSerializerOptions.DictionaryKeyPolicy =  System.Text.Json.JsonNamingPolicy.CamelCase;
                });
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
