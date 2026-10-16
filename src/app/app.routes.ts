
import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: 'customer/dashboard',
    loadComponent: () =>
      import('./features/customer/pages/customer-dashboard/customer-dashboard')
        .then(m => m.CustomerDashboard)
  },

  {
    path: 'officer/dashboard',
    loadComponent: () =>
      import('./features/credit-officer/pages/credit-officer-dashboard/credit-officer-dashboard')
        .then(m => m.CreditOfficerDashboard)
  },

  {
    path: '',
    redirectTo: 'customer/dashboard',
    pathMatch: 'full'
  },


  {
    path: 'loan',
    loadComponent: () =>
      import('./features/loan/pages/loan-list/loan-list')
        .then(m => m.LoanList)
  },


  {
    path: 'loan/apply',
    loadComponent: () =>
      import('./features/loan/pages/apply-loan/apply-loan')
        .then(m => m.ApplyLoan)
  },


  {
    path: 'loan/my-applications',
    loadComponent: () =>
      import('./features/loan/pages/my-applications/my-applications')
        .then(m => m.MyApplications)
  },


  {
    path: 'loan/eligibility',
    loadComponent: () =>
      import('./features/loan/pages/loan-eligibility/loan-eligibility')
        .then(m => m.LoanEligibility)
  },


  {
    path: 'loan/scorecard',
    loadComponent: () =>
      import('./features/loan/pages/scorecard/scorecard')
        .then(m => m.Scorecard)
  },


  {
    path: 'loan/sanction-letter',
    loadComponent: () =>
      import('./features/loan/pages/sanction-letter/sanction-letter')
        .then(m => m.SanctionLetter)
  },


  {
    path: 'loan/account',
    loadComponent: () =>
      import('./features/loan/pages/loan-account/loan-account')
        .then(m => m.LoanAccount)
  },

  {
    path: 'officer/pending-applications',
    loadComponent: () =>
      import('./features/credit-officer/pages/credit-officer-dashboard/pending-applications/pending-applications')
        .then(m => m.PendingApplications)
  },


  {
    path: 'officer/loan-processing',
    loadComponent: () =>
      import('./features/credit-officer/pages/loan-processing/loan-processing')
        .then(m => m.CreditOfficerLoanProcessing)
  },

  {
    path: 'officer/eligibility',
    loadComponent: () =>
      import('./features/loan/pages/loan-eligibility/loan-eligibility')
        .then(m => m.LoanEligibility)
  },
  {
    path: 'officer/scorecard',
    loadComponent: () =>
      import('./features/loan/pages/scorecard/scorecard')
        .then(m => m.Scorecard)
  },
  {
    path: '**',
    redirectTo: 'customer/dashboard'
  }

];
