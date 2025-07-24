import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';
import { Template } from '../models/template.model';

@Injectable({
    providedIn: 'root'
})
export class TemplatesService {
    private http = inject(HttpClient);

    private templates = new BehaviorSubject<Template[]>([]);
    readonly templates$ = this.templates.asObservable();
    private treeNodes = new BehaviorSubject<TreeNode[]>([]);
    readonly treeNodes$ = this.treeNodes.asObservable();
}
