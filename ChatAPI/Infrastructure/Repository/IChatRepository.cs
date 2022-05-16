using System.Collections.Generic;
using System.Threading.Tasks;
using ChatApp.Models;

namespace ChatApp.Infrastructure.Respository
{
    public interface IChatRepository
    {
        Models.Chat GetChat(int id, string userId, int PageNumber=0);
        Task CreateRoom(string name, string userId);
        Task JoinRoom(int chatId, string userId);
        IEnumerable<Models.Chat> GetChats(string userId);
        Task<Models.Chat> CreatePrivateRoom(string rootId, string targetId);
        IEnumerable<Models.Chat> GetPrivateChats(string userId);
        IEnumerable<Models.User> GetFrind(string userId);

        Task<Message> CreateMessage(int chatId, string message, string userId, List<string> Attachments);
    }
}