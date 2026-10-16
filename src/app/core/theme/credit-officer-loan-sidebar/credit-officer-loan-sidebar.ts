
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-credit-officer-loan-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './credit-officer-loan-sidebar.html',
  styleUrl: './credit-officer-loan-sidebar.css'
})
export class CreditOfficerLoanSidebar { }
