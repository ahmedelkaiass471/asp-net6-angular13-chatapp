import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserRegister } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: FormGroup = new FormGroup({
    userName: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
  });
  constructor(private _authService: AuthService, private _router: Router) {}

  ngOnInit(): void {
    if(this._authService.LocalUser()?.token){
      this._router.navigate(['/chat']);

    }
  }
  login() {
    if (this.form.valid) {
      let dto: UserRegister = this.form.value;
      this._authService.login(dto).subscribe((res) => {
        this._authService.SaveToken(res);
        this._router.navigate(['/chat']);
      });
    }
  }
}
