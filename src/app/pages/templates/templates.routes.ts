import { Routes } from '@angular/router';
import { TemplatesListComponent } from './components/templates-list/templates-list.component';
import { TemplateDetailsComponent } from './components/template-details/template-details.component';

export default [
    {
        path: '',
        component: TemplatesListComponent
    },
    {
        path: ':id',
        component: TemplateDetailsComponent
    }
] as Routes;
