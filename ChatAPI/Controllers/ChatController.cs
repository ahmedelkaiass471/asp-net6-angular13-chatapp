using ChatAPI.Models;
using ChatApp.Hubs;
using ChatApp.Infrastructure;
using ChatApp.Infrastructure.Respository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.SignalR;

namespace ChatAPI.Controllers
{
    public class ChatController : _BaseController
    {
        private readonly IChatRepository _repo;
        private readonly IWebHostEnvironment _environment;

        public ChatController(
            IChatRepository repo,
            IWebHostEnvironment environment
            )
        {
            _repo = repo;
            _environment = environment;
        }
        [HttpGet("[action]")]
        public IActionResult Get()
        {
            var chats = _repo.GetChats(GetUserId());
            return Ok(chats);
        }

        [HttpGet("[action]")]
        public IActionResult GetOthers()
        {
            return Ok(_repo.GetFrind(GetUserId()));
        }
        [HttpGet("[action]")]
        public IActionResult Private()
        {
            var chats = _repo.GetPrivateChats(GetUserId());

            return Ok(chats);
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> CreatePrivateRoom(string userId)
        {
            var id = await _repo.CreatePrivateRoom(GetUserId(), userId);
            return Ok(id);
        }

        [HttpGet("ChatMessages/{id}/{PageNumber}")]
        public IActionResult ChatMessages(int id, int PageNumber)
        {
            return Ok(_repo.GetChat(id, GetUserId(), PageNumber));
        }

        [HttpPost("[action]")]
        public async Task<IActionResult> CreateRoom(string name)
        {
            await _repo.CreateRoom(name, GetUserId());
            return Ok();
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> JoinRoom(int id)
        {
            await _repo.JoinRoom(id, GetUserId());
            return Ok();
        }

        [HttpPost("[action]")]
        public async Task<IActionResult> SendMessage(
            [FromForm] SendMessageDTO message,
            [FromServices] IHubContext<ChatHub> chat)
        {
            message.Message = Request.Form["Message"];
            message.ToUserId = Request.Form["ToUserId"];
            message.RoomId = Convert.ToInt32(Request.Form["RoomId"]);
            message.Files = Request.Form.Files;
            List<string> Attachments = new List<string>();
            if (message.Files.Count > 0)
            {
                foreach (var file in message.Files)
                {
                    FileInfo info = new(file.FileName);
                    string fileName = $"{Guid.NewGuid()}{info.Extension}";
                    string RelativePath = Path.Combine("Uploads", "chats", fileName);
                    string uploadDirectory = Path.Combine(_environment.WebRootPath, "Uploads", "chats");
                    if (!Directory.Exists(uploadDirectory))
                        Directory.CreateDirectory(uploadDirectory);
                    string filePath = Path.Combine(uploadDirectory, fileName);
                    await using var stream = new FileStream(filePath, FileMode.Create);
                    await file.OpenReadStream().CopyToAsync(stream);
                    Attachments.Add(RelativePath);
                }
            }
            var Message = await _repo.CreateMessage(message.RoomId, message.Message, GetUserId(), Attachments);

            await chat.Clients.Users(message.ToUserId)
                .SendCoreAsync("notifyMessage",

                    new object[]
                    {
                        new
                        {
                            Text = Message.Text,
                            Name = Message.Name,
                            Timestamp = Message.Timestamp,
                            isByMe = Message.IsByMe,
                            userId = Message.UserId,
                            chatId = Message.ChatId,
                            chat = Message.Chat,
                            files=Attachments
                        }
                    }
                    );

            await chat.Clients.Group(message.RoomId.ToString())
                .SendCoreAsync("RecieveMessage",

                        new object[]
                        {
                             new
                        {
                            Text = Message.Text,
                            Name = Message.Name,
                            Timestamp = Message.Timestamp,
                            isByMe = Message.IsByMe,
                            chat = Message.Chat,
                            userId = Message.UserId,
                            chatId = Message.ChatId,
                            files=Attachments
                        }
                        }
                    );

            return Ok();
        }
    }
}
