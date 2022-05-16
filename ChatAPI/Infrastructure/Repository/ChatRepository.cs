using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChatApp.Database;
using ChatApp.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Infrastructure.Respository
{
    public class ChatRepository : IChatRepository
    {
        private AppDbContext _ctx;

        public ChatRepository(AppDbContext ctx) => _ctx = ctx;

        public IEnumerable<User> GetFrind(string userId)
        {
            return _ctx.Users
                .Where(x => x.Id != userId);
        }

        public async Task<Message> CreateMessage(int chatId, string message, string userId, List<string> Attachments)
        {
            var Message = new Message
            {
                ChatId = chatId,
                Text = message ?? "",
                Name = _ctx.Users.Find(userId).UserName,
                UserId = userId,
                Timestamp = DateTime.Now,
            };
            if (Attachments != null && Attachments.Count > 0)
            {
                Message.Attachments = new List<MessageAttachment>();
                Message.Attachments = Attachments.Select(x => new MessageAttachment { FileName = x }).ToList();
            }
            _ctx.Messages.Add(Message);
            await _ctx.SaveChangesAsync();
            var savedMessage = _ctx.Messages.
                Include("Chat.Users.User")
                .FirstOrDefault(x => x.Id == Message.Id);
            return savedMessage;
        }

        public async Task<Models.Chat> CreatePrivateRoom(string rootId, string targetId)
        {
            var targetUser = _ctx.Users.Find(targetId);
            //_ctx.ChatUsers.Where(x => x.UserId.Equals(rootId))
            var ActiveChat = await _ctx.Chats.FirstOrDefaultAsync(x
                 => x.Users.Count(u => u.UserId == targetId || u.UserId == rootId) >= 2

             );
            if (ActiveChat != null)
                return ActiveChat;
            var chat = new Models.Chat
            {
                Type = ChatType.Private,
                Name = targetUser.UserName
            };

            chat.Users.Add(new ChatUser
            {
                UserId = targetId
            });

            chat.Users.Add(new ChatUser
            {
                UserId = rootId
            });

            _ctx.Chats.Add(chat);

            await _ctx.SaveChangesAsync();

            return chat;
        }

        public async Task CreateRoom(string name, string userId)
        {
            var chat = new Models.Chat
            {
                Name = name,
                Type = ChatType.Room
            };

            chat.Users.Add(new ChatUser
            {
                UserId = userId,
                Role = UserRole.Admin
            });

            _ctx.Chats.Add(chat);

            await _ctx.SaveChangesAsync();
        }

        public Models.Chat GetChat(int id, string userId, int PageNumber = 0)
        {
            int PageSize = 50;
            Models.Chat _chat = new();
            _chat.Messages = _ctx.Messages
                .Include(x => x.Chat)
                .Include(x => x.User)
                .Where(x => x.ChatId == id)
                .OrderByDescending(x => x.Id)
                .Skip(PageNumber * PageSize)
                .Take(PageSize)
                .Select(m => new Message
                {
                    Id = m.Id,
                    User = m.User,
                    UserId = m.UserId,
                    ChatId = m.ChatId,
                    Chat = m.Chat,
                    Name = m.Name,
                    Text = m.Text,
                    IsByMe = m.UserId == userId,
                    Timestamp = m.Timestamp,
                    Files = m.Attachments.Select(x =>x.FileName).ToList()
                })
                .ToList();

            return _chat;
        }

        public IEnumerable<Models.Chat> GetChats(string userId)
        {
            var chats = _ctx.Chats
                .Include(x => x.Users)
                .Include("Users.User")
                .Where(x => x.Users
                    .Any(y => y.UserId == userId))
                .ToList();

            chats.ForEach(
                chat =>
                {
                    chat.Users = chat.Users.Where(x => x.UserId != userId).ToList();
                });

            return chats;
        }

        public IEnumerable<Models.Chat> GetPrivateChats(string userId)
        {
            return _ctx.Chats
                   .Include(x => x.Users)
                       .ThenInclude(x => x.User)
                   .Where(x => x.Type == ChatType.Private
                       && x.Users
                           .Any(y => y.UserId == userId))
                   .ToList();
        }

        public async Task JoinRoom(int chatId, string userId)
        {
            var chatUser = new ChatUser
            {
                ChatId = chatId,
                UserId = userId,
                Role = UserRole.Member
            };

            _ctx.ChatUsers.Add(chatUser);

            await _ctx.SaveChangesAsync();
        }
    }
}