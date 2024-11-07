using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Entities
{
    public class RequestData
    {
        public int Request { get; set; }
        [DataType(DataType.Date)]
        public DateTime OutgoingDate { get; set; }
        public int DocCount { get; set; }
        public string Organisation { get; set; }
        public string Address { get; set; }
        public string ResourceName { get; set; }
        [Required]
        [Display(Name ="Входящий № поставщика")]
        public string IncomingNum { get; set; }
        [Required]
        [Display(Name = "Дата регистрации заявки")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true)]
        public DateTime? IncomingDate { get; set; }
        [Display(Name = "Дата подписания договора")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true)]
        public DateTime? ContractDate { get; set; }
        [Display(Name ="Замечания к документам")]
        public string Remarks { get; set; }
        public string LastUpdate { get; set; }
        public bool CanDeleted { get; set; }
        public RequestData() { Remarks = string.Empty; CanDeleted = false; }
    }
}
