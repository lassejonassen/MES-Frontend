import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { TemplatesService } from '../../../../shared/services/templates.service';

@Component({
    selector: 'app-templates-list',
    imports: [TableModule, InputIconModule, IconFieldModule, InputTextModule, TreeTableModule],
    standalone: true,
    templateUrl: './templates-list.component.html',
    styleUrl: './templates-list.component.scss'
})
export class TemplatesListComponent {
    @ViewChild('filter') filter!: ElementRef;
    private templatesService = inject(TemplatesService);
    nodes = signal<TreeNode[]>(this.templatesService.treeNodes$);
    nodesLoading = signal(true);

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }
}
