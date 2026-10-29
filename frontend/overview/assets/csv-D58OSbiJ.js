import{c as s}from"./index-Bs_ncZu6.js";/**
 * @license lucide-react v1.46.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r={name:"download",size:24,node:[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]};r.node;const i=s(r);function a(n){const c=e=>{if(e==null)return"";const t=typeof e=="number"?Number.isInteger(e)?String(e):e.toFixed(2):String(e);return/[",\n]/.test(t)?`"${t.replace(/"/g,'""')}"`:t};return n.map(e=>e.map(c).join(",")).join(`\r
`)}function u(n,c){const e=new Blob(["\uFEFF",a(c)],{type:"text/csv;charset=utf-8"}),t=URL.createObjectURL(e),o=document.createElement("a");o.href=t,o.download=n.endsWith(".csv")?n:`${n}.csv`,document.body.append(o),o.click(),o.remove(),setTimeout(()=>URL.revokeObjectURL(t),2e3)}export{i as D,u as d};
