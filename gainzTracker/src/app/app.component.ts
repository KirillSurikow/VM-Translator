import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { User } from './interfaces/user';
import { DbService } from './services/db/db.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'gainzTracker';
  user: User | null | undefined;

  constructor(
    private authService: AuthService,
    private db: DbService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(async (user) => {
      if(user){
        const userData = await this.db.getUserData(user.uid);
        if (userData) {
          this.user = {
            email: userData['email'],
            firstName: userData['firstName'],
            lastName: userData['lastName'],
            uid: userData['uid'],
            username: userData['username'],
          };
          this.router.navigateByUrl('/home');
        }
      } else if(!user && this.router.url == '/signUp'){
        this.router.navigateByUrl('/signUp')
      } else if(!user && this.router.url == '/forgetPassword'){
        this.router.navigateByUrl('/forgetPassword')
      } else{
        this.router.navigateByUrl('/login')
      }
    });
  }
}
