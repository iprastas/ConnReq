using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Entities
{
    public class LoginViewModel
    {
        [Required(ErrorMessage = "Имя пользователя обязательно!")]
        [Display(Name = "Имя пользователя")]
        public string? UserName { get; set; }
        [Required(ErrorMessage = "Пароль обязателен!")]
        [DataType(DataType.Password)]
        [Display(Name = "Пароль")]
        public string? Password { get; set; }
    }
}
