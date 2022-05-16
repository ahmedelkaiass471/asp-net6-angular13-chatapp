using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatApp.Models
{
    public class Message
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Text { get; set; }
        public DateTime Timestamp { get; set; }

        public int ChatId { get; set; }
        public Chat Chat { get; set; }

        public string UserId { get; set; }
        public User User { get; set; }
        public ICollection<MessageAttachment> Attachments { get; set; }
        [NotMapped]
        public List<string> Files { get; set; }

        [NotMapped]
        public bool IsByMe { get; set; }


    }
}