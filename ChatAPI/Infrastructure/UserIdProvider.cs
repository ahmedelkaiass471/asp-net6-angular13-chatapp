using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace ChatAPI.Infrastructure
{
    public class UserIdProvider : IUserIdProvider
    {
        public string GetUserId(HubConnectionContext connection)
        {
            //return connection.User.FindFirst("Id")?.Value;
            var connectionID = connection.ConnectionId;
            var connectionI1D = connection.UserIdentifier;
            var accesstoken = connection.GetHttpContext().Request.Query["access_token"].ToString();
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(accesstoken);
            var tokenS = jsonToken as JwtSecurityToken;
            var userId = tokenS.Claims.First(claim => claim.Type == "Id").Value.ToString();
            return userId;
        }
    }
}