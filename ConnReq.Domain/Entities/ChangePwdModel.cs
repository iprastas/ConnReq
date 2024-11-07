using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Entities
{
    public class ChangePwdModel
    {
        [Required(ErrorMessage = "Заполните поле")]
        [Display(Name = "Имя пользователя*")]
        public string? UserName { get; set; }
        [Required(ErrorMessage = "Заполните поле")]
        [DataType(DataType.Password)]
        [StringLength(20, MinimumLength = 6, ErrorMessage = "Пароль должен содержать не менее 6 символов")]
        [Display(Name = "Пароль*")]
        public string? Password { get; set; }
        [Required(ErrorMessage = "Заполните поле")]
        [Display(Name = "Новый пароль*")]
        [DataType(DataType.Password)]
        [StringLength(20, MinimumLength = 6, ErrorMessage = "Пароль должен содержать не менее 6 символов")]
        public string? NewPassword { get; set; }
        [Required(ErrorMessage = "Заполните поле")]
        [DataType(DataType.Password)]
        [Display(Name = "Подтверждение пароля*")]
        [Compare("NewPassword")]
        public string? Password2 { get; set; }
        public string? ErrorMsg { get; set; }
    }
}
