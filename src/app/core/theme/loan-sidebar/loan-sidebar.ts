
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-loan-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './loan-sidebar.html',
  styleUrl: './loan-sidebar.css'
})
export class LoanSidebar {
  loanMenuExpanded = true;

  toggleLoanMenu(): void {
    this.loanMenuExpanded = !this.loanMenuExpanded;
  }
}
