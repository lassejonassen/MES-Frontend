import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
import { Template } from '../../shared/models/template.model';

import _orderBy from 'lodash/orderBy';
import _sortBy from 'lodash/sortBy';

const templateRootSorterReversed = [(x: TreeNode) => x.label === 'Function', (x: TreeNode) => x.label === 'FunctionalBlock', (x: TreeNode) => x.label === 'SubArea', (x: TreeNode) => x.label === 'Area', (x: TreeNode) => x.label === 'Site'];

@Injectable({
    providedIn: 'root'
})
export class TemplatesService {
    private http = inject(HttpClient);
    private readonly apiUrl = 'http://localhost:5271/Templates';
    private templates = new BehaviorSubject<Template[]>([]);
    readonly templates$ = this.templates.asObservable();
    private treeNodes = new BehaviorSubject<TreeNode[]>([]);
    readonly treeNodes$ = this.treeNodes.asObservable();

    getAll(): Observable<Template[]> {
        return this.http.get<Template[]>(this.apiUrl).pipe(
            map((templates) => _orderBy(templates, ['name'], ['asc'])),
            tap((templates) => {
                this.templates.next(templates);
                this.createTreeNodes(templates);
            })
        );
    }

    get(id: string): Observable<Template | null> {
        return this.http.get<Template>(`${this.apiUrl}/${id}`);
    }

    create(name: string, description?: string): Observable<Template | null> {
        const request = { name, description };
        return this.http.post<Template>(this.apiUrl, request).pipe(
            tap((result) => {
                this.templates.next([...this.templates.getValue(), result]);
                const nodes = this.treeNodes.value;
                nodes.push(this.toTreeNode(name, result));
                this.treeNodes.next(_orderBy(nodes, templateRootSorterReversed));
            })
        );
    }

    createDerivedTemplate(baseTemplateId: string, name: string, description: string): Observable<Template> {
        const request = { baseTemplateId, name, description };
        return this.http.post<Template>(`${this.apiUrl}/${baseTemplateId}/Derived`, request).pipe(
            tap((result) => {
                this.templates.next([...this.templates.getValue(), result]);
                const nodes = this.treeNodes.value;
                if (baseTemplateId) {
                    const parent = this.findNode(nodes, baseTemplateId);
                    parent!.children = parent!.children || [];
                    parent!.children.push(this.toTreeNode(name, result));
                    parent!.children = _orderBy(parent!.children, templateRootSorterReversed);
                } else {
                    nodes.push(this.toTreeNode(name, result));
                }
                this.treeNodes.next(_orderBy(nodes, templateRootSorterReversed));
            })
        );
    }

    update(template: Template): Observable<Template> {
        return this.http.put<Template>(`${this.apiUrl}/${template.id}`, template).pipe(
            tap((result) => {
                const templates = this.templates.getValue();
                const index = templates.findIndex((t) => t.id === result.id);
                if (index !== -1) {
                    templates[index] = result;
                    this.templates.next(templates);
                }

                const nodes = this.treeNodes.value;
                const node = this.findNode(nodes, result.id!);
                if (node) {
                    node.data = result;
                    node.label = result.name;
                    this.treeNodes.next(_orderBy(nodes, templateRootSorterReversed));
                }
            })
        );
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                const templates = this.templates.getValue().filter((t) => t.id !== id);
                this.templates.next(templates);

                const nodes = this.treeNodes.value;
                const nodeIndex = nodes.findIndex((node) => node.data.id === id);
                if (nodeIndex !== -1) {
                    nodes.splice(nodeIndex, 1);
                    this.treeNodes.next(_orderBy(nodes, templateRootSorterReversed));
                }
            })
        );
    }

    private createTreeNodes(templates: Template[]) {
        const nodes: TreeNode[] = [];
        const lookup: { [key: string]: TreeNode } = {};

        // Initialize nodes and lookup object
        templates.forEach((template) => {
            lookup[template.id!] = this.toTreeNode(template.name!, template);
        });

        templates.forEach((template) => {
            const treeNode = lookup[template.id!];
            if (template.baseTemplateId) {
                const parentTreeNode = lookup[template.baseTemplateId];
                if (parentTreeNode) {
                    parentTreeNode.children!.push(treeNode);
                    parentTreeNode.children = _sortBy(parentTreeNode.children, (x) => x.label);
                }
            } else {
                nodes.push(treeNode); // Root node
            }
        });

        // Sort the root nodes
        // this.treeNodes.next(_orderBy(nodes, templateRootSorterReversed));
        this.treeNodes.next(nodes);
    }

    private toTreeNode(name: string, template: Template): TreeNode {
        const treeNode: TreeNode = {
            label: name,
            data: template,
            children: []
        };

        return treeNode;
    }

    private findNode(nodes: TreeNode[], id: string): TreeNode | undefined {
        let result: TreeNode | undefined;

        nodes.some((node) => {
            result = this.findRecursive(node, id);
            return result;
        });

        return result;
    }

    findRecursive(node: TreeNode, id: string): TreeNode | undefined {
        let result: TreeNode | undefined;

        if (node.data.id === id) {
            result = node;
        } else if (node.children) {
            node.children.some((child) => {
                result = this.findRecursive(child, id);
                return result;
            });
        }
        return result;
    }
}
