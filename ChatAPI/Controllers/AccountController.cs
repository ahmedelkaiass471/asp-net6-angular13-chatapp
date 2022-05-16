using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Chat.Models;
using ChatApp.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Tangy_Models;

namespace ChatAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly APISettings _aPISettings;

        public AccountController(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IOptions<APISettings> options)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _aPISettings = options.Value;
        }
        [HttpPost("[action]")]

        public async Task<IActionResult> Register(SignUpRequestDTO _dto)
        {
            var user = new User
            {
                UserName = _dto.UserName
            };
            var result = await _userManager.CreateAsync(user, _dto.Password);
            if (result.Succeeded)
            {
                var _user = await _userManager.FindByNameAsync(user.UserName);
                //everything is valid and we need to login 
                var signinCredentials = GetSigningCredentials();
                var claims = await GetClaims(user);

                var tokenOptions = new JwtSecurityToken(
                    issuer: _aPISettings.ValidIssuer,
                    audience: _aPISettings.ValidAudience,
                    claims: claims,
                    expires: DateTime.Now.AddDays(30),
                    signingCredentials: signinCredentials);

                var token = new JwtSecurityTokenHandler().WriteToken(tokenOptions);

                return Ok(new SignInResponseDTO()
                {
                    IsAuthSuccessful = true,
                    Token = token,
                    UserDTO = new UserDTO()
                    {
                        Name = user.UserName,
                        Id = user.Id,
                        Email = user.Email,
                        PhoneNumber = user.PhoneNumber
                    }
                });
            }

            return Ok(result);
        }
        [HttpPost("[action]")]
        public async Task<IActionResult> SignIn([FromBody] SignInRequestDTO signInRequestDTO)
        {
            if (signInRequestDTO == null || !ModelState.IsValid)
            {
                return BadRequest();
            }

            var result = await _signInManager.PasswordSignInAsync(signInRequestDTO.UserName, signInRequestDTO.Password, false, false);
            if (result.Succeeded)
            {
                var user = await _userManager.FindByNameAsync(signInRequestDTO.UserName);
                if (user == null)
                {
                    return Unauthorized(new SignInResponseDTO
                    {
                        IsAuthSuccessful = false,
                        ErrorMessage = "Invalid Authentication"
                    });
                }

                //everything is valid and we need to login 
                var signinCredentials = GetSigningCredentials();
                var claims = await GetClaims(user);

                var tokenOptions = new JwtSecurityToken(
                    issuer: _aPISettings.ValidIssuer,
                    audience: _aPISettings.ValidAudience,
                    claims: claims,
                    expires: DateTime.Now.AddDays(30),
                    signingCredentials: signinCredentials);

                var token = new JwtSecurityTokenHandler().WriteToken(tokenOptions);

                return Ok(new SignInResponseDTO()
                {
                    IsAuthSuccessful = true,
                    Token = token,
                    UserDTO = new UserDTO()
                    {
                        Name = user.UserName,
                        Id = user.Id,
                        Email = user.Email,
                        PhoneNumber = user.PhoneNumber
                    }
                });

            }
            else
            {
                return Unauthorized(new SignInResponseDTO
                {
                    IsAuthSuccessful = false,
                    ErrorMessage = "Invalid Authentication"
                });
            }

        }
        private SigningCredentials GetSigningCredentials()
        {
            var secret = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_aPISettings.SecretKey));

            return new SigningCredentials(secret, SecurityAlgorithms.HmacSha256);
        }
        private async Task<List<Claim>> GetClaims(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name,user.UserName),
                new Claim(ClaimTypes.Email,user.UserName),
                new Claim("Id",user.Id)
            };
            var _user = await _userManager.FindByNameAsync(user.UserName);
            if (_user != null)
            {

                var roles = await _userManager.GetRolesAsync(_user);
                if (roles != null)
                    foreach (var role in roles)
                        claims.Add(new Claim(ClaimTypes.Role, role));
            }

            return claims;
        }
    }

}