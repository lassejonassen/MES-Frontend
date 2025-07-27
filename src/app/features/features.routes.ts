import { Routes } from '@angular/router';

export default [{ path: 'templates', loadChildren: () => import('./templates/templates.routes').then((m) => m.default) }] as Routes;
