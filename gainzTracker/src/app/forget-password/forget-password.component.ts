import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent {
  success : boolean = false;
  error : boolean = false;
  errorcode : string | undefined;
  forgetPasswordEmail :string | undefined;

  constructor(private authService: AuthService){}

  async onSubmit(form: NgForm) {
    try {
      let response = await this.authService.resetPassword(form.value.email);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }


}
