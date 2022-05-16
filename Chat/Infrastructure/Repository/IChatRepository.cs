using System.Collections.Generic;
using System.Threading.Tasks;
using ChatApp.Models;

namespace ChatApp.Infrastructure.Respository
{
    public interface IChatRepository
    {
        Models.Chat GetChat(int id);
        Task CreateRoom(string name, string userId);
        Task JoinRoom(int chatId, string userId);
        IEnumerable<Models.Chat> GetChats(string userId);
        Task<int> CreatePrivateRoom(string rootId, string targetId);
        IEnumerable<Models.Chat> GetPrivateChats(string userId);

        Task<Message> CreateMessage(int chatId, string message, string userId);
    }
}