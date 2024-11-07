using Microsoft.AspNetCore.Mvc.Rendering;
using System.ComponentModel.DataAnnotations;

namespace ConnReq.Domain.Entities
{
    public class Provider
    {
        public int FactoryId { get; set; }
        [Required]
        [Display(Name="Предприятие*")]
	    public string? Name { get; set; }
        //[Display(Name="Работает в*")]
        //[Required]
        //public SelectListItem TerritoryWork { get; set; }
        public int Territory { get; set; }
        public string? TerritoryName { get; set; }
        [Required]
        [Display(Name="ИНН*")]
        public string? INN { get; set; }
        [Required]
        [EmailAddress]
        [Display(Name = "e-mail*")]
        public string? EMail { get; set; }
        [Required]
        [Display(Name="Веб сайт*")]
        public string? WebSite { get; set; }
        [Display(Name="Руководитель")]
        public string? Chief { get; set; }
        [Required]
        [Display(Name="Адрес*")]
        public string? Address { get; set; }
        [Required]
        [Display(Name="Работает с*")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true)]
        public DateTime Since { get; set; }
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true)]
        [Display(Name ="Закрыто с")]
        public DateTime? Upto {get;set;} 
        [Display(Name ="Теплоснабжение")]
        public bool Warm { get; set; }
        [Display(Name = "Водоснабжение")]
        public bool Water { get; set; }
    }
}
