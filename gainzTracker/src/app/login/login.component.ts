import { Component } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginEmail : string | undefined;
  loginPassword : string | undefined;
  errormessage : string | undefined;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(form: NgForm): void {
    this.authService.login(
      form.value.email,
      form.value.password,
    ).subscribe({
      next: ()=>{
        this.router.navigateByUrl('/home')
      },
      error: (err)=>{
         if (err.code !== 'auth/invalid-credential') {
          this.errormessage = 'Anmeldung fehlgeschlagen. Versuchen Sie es später erneut'
         }else{
          this.errormessage = 'E-Mail oder Passwort sind fehlerhaft'
         }
      }
    });
  }
}
