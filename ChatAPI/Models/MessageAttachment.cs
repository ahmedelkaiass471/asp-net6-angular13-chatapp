using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatApp.Models
{
    public class MessageAttachment
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        
        [ForeignKey("Message")]
        public int MessageId { get; set; }
        public Message Message{ get; set; }

    }
}
