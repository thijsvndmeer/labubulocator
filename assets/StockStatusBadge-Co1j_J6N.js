import{c as n,r as s,j as t,a as o,O as u}from"./index-BwG2CMxR.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=n("Ban",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m4.9 4.9 14.2 14.2",key:"1m5liu"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=n("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=n("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=n("CircleX",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=n("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=n("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]),f=s.forwardRef(({className:e,...r},a)=>t.jsx("div",{ref:a,className:o("rounded-lg border bg-card text-card-foreground shadow-sm transition-colors duration-300",e),...r}));f.displayName="Card";const p=s.forwardRef(({className:e,...r},a)=>t.jsx("div",{ref:a,className:o("flex flex-col space-y-1.5 p-6",e),...r}));p.displayName="CardHeader";const k=s.forwardRef(({className:e,...r},a)=>t.jsx("h3",{ref:a,className:o("text-2xl font-semibold leading-none tracking-tight",e),...r}));k.displayName="CardTitle";const N=s.forwardRef(({className:e,...r},a)=>t.jsx("p",{ref:a,className:o("text-sm text-muted-foreground",e),...r}));N.displayName="CardDescription";const h=s.forwardRef(({className:e,...r},a)=>t.jsx("div",{ref:a,className:o("p-6 pt-0",e),...r}));h.displayName="CardContent";const C=s.forwardRef(({className:e,...r},a)=>t.jsx("div",{ref:a,className:o("flex items-center p-6 pt-0",e),...r}));C.displayName="CardFooter";const v=u("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",{variants:{variant:{default:"border-transparent bg-primary text-primary-foreground hover:bg-primary/80",secondary:"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",destructive:"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",outline:"text-foreground"}},defaultVariants:{variant:"default"}});function i({className:e,variant:r,...a}){return t.jsx("div",{className:o(v({variant:r}),e),...a})}const R=({rarity:e,className:r})=>{const c={common:{label:"Labubu",className:"bg-rarity-common/20 text-rarity-common border-rarity-common/30"},uncommon:{label:"Zimomo",className:"bg-rarity-uncommon/20 text-rarity-uncommon border-rarity-uncommon/30"},rare:{label:"Mokoko",className:"bg-rarity-rare/20 text-rarity-rare border-rarity-rare/30"},epic:{label:"Plush Labubu",className:"bg-rarity-epic/20 text-rarity-epic border-rarity-epic/30"},legendary:{label:"Legendary",className:"bg-rarity-legendary/20 text-rarity-legendary border-rarity-legendary/30"},secret:{label:"Secret",className:"bg-rarity-secret/20 text-rarity-secret border-rarity-secret/30"}}[e];return t.jsx(i,{variant:"outline",className:o("font-semibold border",c.className,r),children:c.label})},B=({volatility:e})=>{const r=()=>e<20?"bg-green-500":e<50?"bg-yellow-500":"bg-red-500",a=()=>e<20?"Low":e<50?"Medium":"High";return t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx("span",{className:"text-sm text-muted-foreground",children:"Volatility:"}),t.jsx(i,{className:`${r()} text-white`,children:a()})]})},V=({status:e})=>{const a={aftermarketorbb:{label:"Aftermarket or Blind Box",icon:d,className:"bg-rarity-uncommon/10 text-rarity-uncommon border-rarity-uncommon/20"},aftermarketorstore:{label:"Aftermarket or in Store",icon:d,className:"bg-rarity-uncommon/10 text-rarity-uncommon border-rarity-uncommon/20"},aftermarket:{label:"Only on Aftermarket",icon:l,className:"bg-rarity-legendary/10 text-rarity-legendary border-rarity-legendary/20"},out_of_stock:{label:"Out of Stock",icon:g,className:"bg-destructive/10 text-destructive border-destructive/20"},pre_order:{label:"Pre-Order",icon:x,className:"bg-primary/10 text-primary border-primary/20"},discontinued:{label:"Discontinued",icon:b,className:"bg-muted text-muted-foreground border-border"}}[e]||{label:"Unknown",icon:l,className:"bg-muted text-muted-foreground border-border"},{label:c,icon:m,className:y}=a;return t.jsxs(i,{variant:"outline",className:`${y}`,children:[t.jsx(m,{className:"h-3 w-3 mr-1"}),c]})};export{i as B,f as C,w as E,R,V as S,B as V};
