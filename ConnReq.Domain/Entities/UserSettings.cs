using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Entities
{
    public enum UserType { Empty = 0, Mgkx = 1, Provider = 2, Customer = 3 }
    public enum CustomerType { Empty = 0, Factory = 1, IndivEntr=2, Individual = 3 }
    public enum DateState { All = 0, Null = 1,NotNull = 2}
    [Serializable]
    public class UserSettings
    {
        public static string cookieName = "UserSettings";
        [Required(ErrorMessage = "Имя пользователя обязательно!")]
        [Display(Name = "Имя пользователя*")]
        public string? UserName { get; set; }
        [Required(ErrorMessage = "Пароль обязателен!")]
        [DataType(DataType.Password)]
        [StringLength(20, MinimumLength = 6, ErrorMessage = "Пароль должен содержать не менее 6 символов")]
        [Display(Name = "Пароль*")]
        public string? Password { get; set; }
        [Required(ErrorMessage = "Подтверждение пароля обязательно!")]
        [DataType(DataType.Password)]
        [Display(Name = "Подтверждение пароля*")]
        [Compare("Password")]
        public string? Password2 { get; set; }
        [Required(ErrorMessage = "Почтовый адрес обязателен!")]
        [EmailAddress]
        [Display(Name = "e-mail*")]
        public string? EMail { get; set; }
        [Required]
        public CustomerType Typeofcustomer { get; set; }
        [Required(ErrorMessage = "Наименование организации обязательно!")]
        [Display(Name = "Наименование организации")]
        public string? FactoryName { get; set; }
        [Display(Name ="ИНН")]
        [StringLength(12, MinimumLength = 0, ErrorMessage = "Длина ИНН 12 символов!")]
        public string? Inn { get; set; }
        public int Factory { get; set; }
        public UserType TypeOfUser { get; set; }
        public bool IsValid { get; set; }
        public int User { get; set; }
        public UserSettings() {
            IsValid = false;
            Typeofcustomer =  CustomerType.Factory;
            TypeOfUser = UserType.Customer;
        }
        public UserSettings(string name)
        {
            UserName = name;
            IsValid = false;
            Typeofcustomer = CustomerType.Factory;
            TypeOfUser = UserType.Customer;
        }
        public void Save(HttpResponse response)
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("userName=" + UserName);
            sb.Append("&email=" + EMail);
            sb.Append("&typeofcustomer=" + ((int)Typeofcustomer).ToString());
            sb.Append("&factoryname=" + FactoryName);
            sb.Append("&inn=" + Inn);
            sb.Append("&factory=" + Factory.ToString());
            sb.Append("&typeofuser=" + ((int)TypeOfUser).ToString());
            response.Cookies.Append(cookieName, sb.ToString(), new CookieOptions() { Expires = new DateTimeOffset(DateTime.Now.AddDays(365)) });
        }
        public bool Restore(HttpRequest request)
        {
            if (request != null && request.Cookies[cookieName] != null)
                {
                    string[] items = request.Cookies[cookieName].Split("&");
                    foreach (string item in items)
					{
                        string[] strings = item.Split("=");
                        switch (strings[0])
						{
							case "userName":
                                if(string.IsNullOrEmpty(strings[1])) UserName=string.Empty;
                                else UserName = strings[1];
                                break;
							case "email":
								if (string.IsNullOrEmpty(strings[1])) EMail=string.Empty;
                                else EMail = strings[1];
                                break;
							case "typeofcustomer":
                                if (!int.TryParse(strings[1], out int ct)) Typeofcustomer= CustomerType.Empty ;
                                else Typeofcustomer = (CustomerType)ct;
                                break;
							case "factoryname":
                                if (string.IsNullOrEmpty(strings[1])) FactoryName = string.Empty; 
                                else FactoryName = strings[1];
                                break;
							case "inn":
                                if (string.IsNullOrEmpty(strings[1])) Inn = string.Empty;
                                else Inn = strings[1];
                                break;
							case "factory":
                                if (!int.TryParse(strings[1], out int f)) Factory=0;     
                                else Factory = f;
                                break;
							case "typeofuser":
                                if (!int.TryParse(strings[1], out int ut)) TypeOfUser = UserType.Empty;
                                else TypeOfUser = (UserType)ut;
                                break;
                        }
                    }
					return true;
				}
			return false;
        }
    }
}
