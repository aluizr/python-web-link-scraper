import{r as h,j as s}from"./vendor-react-B4qxCylN.js";import{D as x,l as f,m as b,n as u,o as w}from"./Index-DqbOjClY.js";import{l as y}from"./bookmarks-parser-CR4iA3dZ.js";import{T as v}from"./index-C5TnwAbA.js";import{aI as j,aJ as $,aK as S,B as D}from"./vendor-ui-utils-fmwYYuie.js";import"./vendor-editor-a5VVu9he.js";import"./vendor-utils-CjJzBfYE.js";import"./vendor-ui-BjJWC2Tm.js";import"./vendor-supabase-DTqiiTOY.js";import"./label-BH6sBXvo.js";function n(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function N(e){try{return new URL(e).hostname}catch{return e}}function d(e){if(!e)return"";const o=String(e);return o.includes(",")||o.includes('"')||o.includes(`
`)?`"${o.replace(/"/g,'""')}"`:o}function L(e){const o=["Title","URL","Category","Tags","Favorite","Status","Priority","Due Date","Description","Notes","Created At"],r=e.map(a=>[d(a.title),d(a.url),d(a.category),d(a.tags.join("; ")),a.isFavorite?"Yes":"No",d(a.status),d(a.priority),d(a.dueDate||""),d(a.description),d(a.notes),new Date(a.createdAt).toLocaleString("pt-BR")]),i=[o.join(","),...r.map(a=>a.join(","))].join(`
`);return new Blob([i],{type:"text/csv;charset=utf-8;"})}function C(e,o="Links"){const r={Desenvolvimento:"#3b82f6",Design:"#ec4899",Marketing:"#f59e0b",Educação:"#10b981",Entretenimento:"#8b5cf6",Notícias:"#ef4444",Produtividade:"#06b6d4",Referência:"#6366f1"},i=t=>r[t||""]||"#9ca3af",a=`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${o} - WebNest</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f9fafb;
            color: #1f2937;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 30px;
        }
        h1 {
            margin-top: 0;
            color: #1f2937;
            font-size: 28px;
        }
        .info {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
        }
        .info span {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        thead {
            background: #f3f4f6;
        }
        th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        tbody tr:hover {
            background: #f9fafb;
        }
        .url {
            color: #0066cc;
            text-decoration: none;
        }
        .url:hover {
            text-decoration: underline;
        }
        .category-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            color: white;
            font-size: 12px;
            font-weight: 500;
        }
        .favorite {
            color: #fbbf24;
            font-size: 16px;
        }
        .tags {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }
        .tag {
            background: #f3f4f6;
            padding: 2px 8px;
            border-radius: 4px;
            color: #6b7280;
            font-size: 12px;
        }
        .description {
            color: #6b7280;
            font-size: 13px;
            max-width: 400px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 ${n(o)}</h1>
        <div class="info">
            <span>📊 Total: <strong>${e.length}</strong> links</span>
            <span>⭐ Favoritos: <strong>${e.filter(t=>t.isFavorite).length}</strong></span>
            <span>📦 Categorias: <strong>${new Set(e.map(t=>t.category).filter(Boolean)).size}</strong></span>
            <span>🏷️ Tags: <strong>${new Set(e.flatMap(t=>t.tags)).size}</strong></span>
            <span>📅 Exportado: <strong>${new Date().toLocaleString("pt-BR")}</strong></span>
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width: 30%">Título</th>
                    <th style="width: 25%">URL</th>
                    <th style="width: 12%">Categoria</th>
                    <th style="width: 15%">Tags</th>
                    <th style="width: 8%">Fav</th>
                    <th style="width: 8%">Status</th>
                    <th style="width: 8%">Prioridade</th>
                    <th style="width: 10%">Prazo</th>
                    <th style="width: 15%">Descrição</th>
                    <th style="width: 15%">Notas</th>
                    <th style="width: 10%">Data</th>
                </tr>
            </thead>
            <tbody>
                ${e.map(t=>`
                    <tr>
                        <td><strong>${n(t.title)}</strong></td>
                        <td><a href="${n(t.url)}" class="url" target="_blank" rel="noopener noreferrer">${n(N(t.url))}</a></td>
                        <td>
                            ${t.category?`<span class="category-badge" style="background: ${i(t.category)}">${n(t.category)}</span>`:"-"}
                        </td>
                        <td>
                            <div class="tags">
                                ${t.tags.map(g=>`<span class="tag">${n(g)}</span>`).join("")}
                            </div>
                        </td>
                        <td>${t.isFavorite?'<span class="favorite">★</span>':"○"}</td>
                        <td>${n(t.status)}</td>
                        <td>${n(t.priority)}</td>
                        <td>${t.dueDate?new Date(t.dueDate).toLocaleDateString("pt-BR"):"-"}</td>
                        <td class="description">${n(t.description)||"-"}</td>
                        <td class="description">${n(t.notes)||"-"}</td>
                        <td>${new Date(t.createdAt).toLocaleDateString("pt-BR")}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
        <div class="footer">
            <p>Exportado por WebNest • ${new Date().toLocaleString("pt-BR")}</p>
        </div>
    </div>
</body>
</html>`;return new Blob([a],{type:"text/html;charset=utf-8;"})}function T(e){const o=JSON.stringify(e,null,2);return new Blob([o],{type:"application/json"})}function B(e,o){const r=URL.createObjectURL(e),i=document.createElement("a");i.href=r,i.download=o,i.click(),URL.revokeObjectURL(r)}function E(e,o){const r=y(e);return new Blob([r],{type:"text/html;charset=utf-8;"})}const R=[{id:"json",name:"JSON",description:"Importação/exportação completa com todos os dados",icon:s.jsx(j,{className:"h-8 w-8"}),extension:"json"},{id:"csv",name:"CSV",description:"Compatível com Excel, Google Sheets e outras ferramentas",icon:s.jsx($,{className:"h-8 w-8"}),extension:"csv"},{id:"html",name:"HTML",description:"Documento formatado e legível para visualização/impressão",icon:s.jsx(S,{className:"h-8 w-8"}),extension:"html"},{id:"bookmarks",name:"Bookmarks",description:"Importe de volta para Chrome, Firefox, Safari, Edge...",icon:s.jsx(D,{className:"h-8 w-8 text-blue-600"}),extension:"html"}];function P({isOpen:e,onClose:o,links:r,categories:i}){const[a,t]=h.useState(!1),g=async c=>{t(!0);try{let l,p;const m=new Date().toISOString().slice(0,10);switch(c){case"json":l=T(r),p=`links-${m}.json`;break;case"csv":l=L(r),p=`links-${m}.csv`;break;case"html":l=C(r,"Meus Links"),p=`links-${m}.html`;break;case"bookmarks":l=E(r,i),p=`bookmarks-${m}.html`;break}B(l,p),o()}finally{t(!1)}};return s.jsx(x,{open:e,onOpenChange:o,children:s.jsxs(f,{className:"max-w-md max-h-[80vh] overflow-y-auto",children:[s.jsxs(b,{children:[s.jsx(u,{children:"Escolha o Formato de Exportação"}),s.jsx(w,{children:"Selecione como deseja exportar seus links"})]}),s.jsx("div",{className:"grid gap-3",children:R.map(c=>s.jsxs("button",{onClick:()=>g(c.id),disabled:a,className:"flex items-start gap-4 p-4 border rounded-lg hover:bg-accent hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left",children:[s.jsx("div",{className:"flex-shrink-0 text-muted-foreground",children:c.icon}),s.jsxs("div",{className:"flex-1",children:[s.jsx("p",{className:"font-medium",children:c.name}),s.jsx("p",{className:`${v} text-muted-foreground`,children:c.description})]})]},c.id))})]})})}export{P as ExportFormatDialog};
