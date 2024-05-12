import { Component } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  firstName: string | undefined;
  lastName: string | undefined;
  signUpEmail: string | undefined;
  userName: string | undefined;
  password: string | undefined;
  required: any;
  minlength: any;
  pattern: any;
  form: HTMLElement | undefined;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(form: NgForm): void {
    this.authService.register(
      form.value.email,
      form.value.username,
      form.value.password,
      form.value.firstName,
      form.value.lastName

    ).subscribe({
      next: ()=>{
        this.router.navigateByUrl('/home')
      },
      error: (err)=>{
         console.log(err)
      }
    })
  }
}
