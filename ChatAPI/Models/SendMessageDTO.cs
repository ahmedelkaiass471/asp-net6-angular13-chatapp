using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatAPI.Models
{
    public class SendMessageDTO
    {
        // chat id 
        public int RoomId{ get; set; }
        public string? Message { get; set; }

        public string? ToUserId { get; set; }

        public IFormFileCollection? Files { get; set; }
    }
}
