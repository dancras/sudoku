var Ze=Object.defineProperty;var qe=(t,e,n)=>e in t?Ze(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var y=(t,e,n)=>(qe(t,typeof e!="symbol"?e+"":e,n),n),me=(t,e,n)=>{if(!e.has(t))throw TypeError("Cannot "+n)};var C=(t,e,n)=>(me(t,e,"read from private field"),n?n.call(t):e.get(t)),T=(t,e,n)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,n)},S=(t,e,n,o)=>(me(t,e,"write to private field"),o?o.call(t,n):e.set(t,n),n);import{K as Xe,B as q,m as I,a as le,s as ee,o as _,b as V,t as be,c as x,d as j,e as E,f as W,g as de,p as Je,S as H,j as ue,h as Qe,w as te,i as Pe,k as he,E as et,r as U,l as tt,n as nt,q as ot,I as it,u as rt,v as st,x as at,y as ct,z as lt,A as dt,C as ut,D as ht,N as pt,F as ft,G as gt,H as mt,J as ye,L as bt,M as yt}from"./vendor.3d5ab6ca.js";const wt=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))o(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function n(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerpolicy&&(r.referrerPolicy=i.referrerpolicy),i.crossorigin==="use-credentials"?r.credentials="include":i.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(i){if(i.ep)return;i.ep=!0;const r=n(i);fetch(i.href,r)}};wt();function X(t=0,e=0){const n=document.createElement("canvas");return n.width=t,n.height=e,n}function we(t,e){return Array.from({length:e-t}).map((n,o)=>t+o)}function Ct(t){let e=[];for(const n of t)n.length>e.length&&(e=n);return e}const xt=["1","2","3","4","5","6","7","8","9"],vt=["Andale Mono, Menlo","Arial","Cambria, Gill Sans","Comic Sans MS, Chalkboard SE","Courier","Impact, Avenir Next Condensed","Times New Roman","Trebuchet MS","Verdana"],$t=["bold",""];async function kt(t,e,n,o,i){const r=[n,n-1,n-2,n-3];let s=[];await i({step:"Generating Font Combinations"});for(const l of xt)for(const f of vt)for(const h of $t)for(const b of r){const w=X(t,e),g=w.getContext("2d");g.fillStyle="white",g.fillRect(0,0,t,e),g.fillStyle="black";const G=St(g,h,f,b);g.font=`${h} ${G}px ${f}`;const M=g.measureText(l),ae=M.actualBoundingBoxLeft+M.actualBoundingBoxRight,ce=M.actualBoundingBoxLeft+Math.round((t-ae)/2),F=Math.round((e-b)/2);g.fillText(l,ce,e-F),s.push([w,parseInt(l,10)])}await i({step:"Generating Training Set"}),s=s.flatMap(([l,f])=>[[l,f],[ne(l,1,0),f],[ne(l,-1,0),f],[ne(l,0,1),f],[ne(l,0,-1),f]]),await i({step:"Training KNN Model"});const a=s.map(l=>l[1]),c=s.map(l=>Ce(l[0])),p=new Xe(c,a);await i({step:"Running KNN Model"});const u=o.map(Ce);return p.predict(u)}function ne(t,e,n){const i=t.getContext("2d").getImageData(0,0,t.width,t.height),r=X(t.width,t.height),s=r.getContext("2d");return s.fillStyle="white",s.fillRect(0,0,t.width,t.height),s.putImageData(i,e,n),r}function Ce(t){const n=t.getContext("2d").getImageData(0,0,t.width,t.height),o=[];for(let i=0;i<n.data.length;i+=4)o.push(n.data[i]);return o}function St(t,e,n,o){let i=o,r=0;for(;r<o;)t.font=`${e} ${i}px ${n}`,r=t.measureText("8").actualBoundingBoxAscent,r<o&&i++;return i}function xe(t){let e;return typeof t=="object"?(e=t[0],typeof e=="object"?[t.length,e.length]:[t.length]):[]}function ve(t,e,n,o){if(n===e.length-1)return o(t);let i;const r=e[n],s=Array(r);for(i=r-1;i>=0;i--)s[i]=ve(t[i],e,n+1,o);return s}function Ut(t){const e=t.length;let n;const o=Array(e);for(n=e-1;n!==-1;--n)o[n]=t[n];return o}function Gt(t){if(typeof t!="object")return t;const e=Ut,n=xe(t);return ve(t,n,0,e)}function Mt(t){let e,n,o;const i=t.length,r=Array(i);let s;for(e=i-1;e>=0;e--){for(s=Array(i),n=e+2,o=i-1;o>=n;o-=2)s[o]=0,s[o-1]=0;for(o>e&&(s[o]=0),s[e]=t[e],o=e-1;o>=1;o-=2)s[o]=0,s[o-1]=0;o===0&&(s[0]=0),r[e]=s}return r}function $e(t,e,n){typeof n=="undefined"&&(n=0);const o=t[n],i=Array(o);let r;if(n===t.length-1){for(r=o-2;r>=0;r-=2)i[r+1]=e,i[r]=e;return r===-1&&(i[0]=e),i}for(r=o-1;r>=0;r--)i[r]=$e(t,e,n+1);return i}function It(t){return Mt($e([t],1))}function At(t){const e=xe(t),n=Math.abs,o=e[0],i=e[1],r=Gt(t);let s,a;const c=It(o);let p,u,l,f,h,b;for(f=0;f<i;++f){let w=-1,g=-1;for(l=f;l!==o;++l)h=n(r[l][f]),h>g&&(w=l,g=h);for(a=r[w],r[w]=r[f],r[f]=a,u=c[w],c[w]=c[f],c[f]=u,b=a[f],h=f;h!==i;++h)a[h]/=b;for(h=i-1;h!==-1;--h)u[h]/=b;for(l=o-1;l!==-1;--l)if(l!==f){for(s=r[l],p=c[l],b=s[f],h=f+1;h!==i;++h)s[h]-=a[h]*b;for(h=i-1;h>0;--h)p[h]-=u[h]*b,--h,p[h]-=u[h]*b;h===0&&(p[0]-=u[0]*b)}}return c}function ke(t,e){let n,o,i,r,s,a,c;const p=t.length,u=e.length,l=e[0].length,f=Array(p);for(n=p-1;n>=0;n--){for(r=Array(l),s=t[n],i=l-1;i>=0;i--){for(a=s[u-1]*e[u-1][i],o=u-2;o>=1;o-=2)c=o-1,a+=s[o]*e[o][i]+s[c]*e[c][i];o===0&&(a+=s[0]*e[0][i]),r[i]=a}f[n]=r}return f}function Bt(t,e){const n=t.length;let o;const i=Array(n);for(o=n-1;o>=0;o--)i[o]=_t(t[o],e);return i}function _t(t,e){let n;const o=t.length;let i,r=t[o-1]*e[o-1];for(n=o-2;n>=1;n-=2)i=n-1,r+=t[n]*e[n]+t[i]*e[i];return n===0&&(r+=t[0]*e[0]),r}function Se(t){let e,n;const o=t.length,i=t[0].length,r=Array(i);let s,a,c;for(n=0;n<i;n++)r[n]=Array(o);for(e=o-1;e>=1;e-=2){for(a=t[e],s=t[e-1],n=i-1;n>=1;--n)c=r[n],c[e]=a[n],c[e-1]=s[n],--n,c=r[n],c[e]=a[n],c[e-1]=s[n];n===0&&(c=r[0],c[e]=a[0],c[e-1]=s[0])}if(e===0){for(s=t[0],n=i-1;n>=1;--n)r[n][0]=s[n],--n,r[n][0]=s[n];n===0&&(r[0][0]=s[0])}return r}function Rt(t){return Math.round(t*1e10)/1e10}function Lt(t,e,n){if(n){const g=e;e=t,t=g}const o=[t[0],t[1],1,0,0,0,-1*e[0]*t[0],-1*e[0]*t[1]],i=[0,0,0,t[0],t[1],1,-1*e[1]*t[0],-1*e[1]*t[1]],r=[t[2],t[3],1,0,0,0,-1*e[2]*t[2],-1*e[2]*t[3]],s=[0,0,0,t[2],t[3],1,-1*e[3]*t[2],-1*e[3]*t[3]],a=[t[4],t[5],1,0,0,0,-1*e[4]*t[4],-1*e[4]*t[5]],c=[0,0,0,t[4],t[5],1,-1*e[5]*t[4],-1*e[5]*t[5]],p=[t[6],t[7],1,0,0,0,-1*e[6]*t[6],-1*e[6]*t[7]],u=[0,0,0,t[6],t[7],1,-1*e[7]*t[6],-1*e[7]*t[7]],l=[o,i,r,s,a,c,p,u],f=e;let h;try{h=At(ke(Se(l),l))}catch{return[1,0,0,0,1,0,0,0]}const b=ke(h,Se(l)),w=Bt(b,f);for(let g=0;g<w.length;g++)w[g]=Rt(w[g]);return w[8]=1,w}function Nt(t,e,n){const[o,i,r,s,a,c,p,u]=t,l=(c-n)/(u*n-a+p*n-s),f=(e*u*l+e-i*l-r)/(o-e*p),h=(r-e)/(p*e-o+u*e-i),b=(n*p*h+n-s*h-c)/(a-n*u);return[f,b]}function Ue(t,e=255){const{w:n}=t,o=[-n-1,-n,1-n,-1],i=[],r=new Set;for(const s of t.pixels)if(s.r===e){let a={members:[s],mergeWith(c){const[p,u]=c.members.length>this.members.length?[c,this]:[this,c];for(const l of u.members)p.members.push(l),i[l.i]=p;return r.delete(u),p}};r.add(a),i[s.i]=a;for(const c of o){const p=i[s.i+c];p&&p!==a&&(a=a.mergeWith(p))}}return Array.from(r).map(s=>s.members)}function Tt(t){let e=t[0],n=t[0],o=t[0],i=t[0];for(const r of t)e=e.x*e.y<r.x*r.y?e:r,n=n.rx*n.y<r.rx*r.y?n:r,o=o.x*o.ry<r.x*r.ry?o:r,i=i.rx*i.ry<r.rx*r.ry?i:r;return[e,n,i,o]}function Ge(t,e){let n=999999,o=0,i=999999,r=0;for(const s of e)n=Math.min(n,s.x),o=Math.max(o,s.x),i=Math.min(i,s.y),r=Math.max(r,s.y);return[t.pixel(n,i),t.pixel(o,i),t.pixel(o,r),t.pixel(n,r)]}const O=Symbol();var Y,K,B,D,Z;const se=class{constructor(e,n,o){T(this,Y,void 0);T(this,K,void 0);T(this,B,void 0);T(this,D,void 0);T(this,Z,void 0);y(this,"w");y(this,"h");S(this,Y,e),S(this,K,e(n,o)),S(this,B,C(this,K).getContext("2d")),S(this,D,C(this,B).getImageData(0,0,n,o)),this.w=n,this.h=o,S(this,Z,we(0,this.w*this.h).map(i=>new Ot(this,i)))}get canvas(){return C(this,B).putImageData(C(this,D),0,0),C(this,K)}drawImage(e,n=0,o=0){C(this,B).drawImage(e,n,o),S(this,D,C(this,B).getImageData(0,0,this.w,this.h))}get pixels(){return C(this,Z)}pixel(e,n){return C(this,Z)[n*this.w+e]}get[O](){return C(this,D).data}clone(){const e=new se(C(this,Y),this.w,this.h);return e.drawImage(this.canvas),e}crop(e,n){const{x:o,y:i}=e,r=n.x-o+1,s=n.y-i+1,a=new se(C(this,Y),r,s);return a.drawImage(this.canvas,-o,-i),a}fill(e){C(this,B).fillStyle=e,C(this,B).fillRect(0,0,this.w,this.h),S(this,D,C(this,B).getImageData(0,0,this.w,this.h))}};let oe=se;Y=new WeakMap,K=new WeakMap,B=new WeakMap,D=new WeakMap,Z=new WeakMap;class Ot{constructor(e,n){y(this,"easyCanvas");y(this,"i");this.easyCanvas=e,this.i=n}get x(){return this.i%this.easyCanvas.w}get rx(){return this.easyCanvas.w-this.x}get y(){return Math.floor(this.i/this.easyCanvas.w)}get ry(){return this.easyCanvas.h-this.y}get xy(){return[this.x,this.y]}get r(){return this.easyCanvas[O][this.i*4]}get g(){return this.easyCanvas[O][this.i*4+1]}get b(){return this.easyCanvas[O][this.i*4+2]}setRGB(e){const n=this.easyCanvas[O],o=this.i*4;typeof e=="number"?n[o]=n[o+1]=n[o+2]=e:(n[o]=e[0],n[o+1]=e[1],n[o+2]=e[2])}get rgb(){const e=this.easyCanvas[O],n=this.i*4;return[e[n],e[n+1],e[n+2]]}set a(e){const n=this.easyCanvas[O],o=this.i*4;n[o+3]=e}get a(){const e=this.easyCanvas[O],n=this.i*4;return e[n+3]}}function Dt(t,e,n,o){const i=n-e.w,r=o-e.h,s=new oe(t,n,o);return s.fill("white"),s.drawImage(e.canvas,Math.round(i/2),Math.round(r/2)),s}function Me(t){for(const e of t.pixels){const n=.3*e.r+.3*e.g+.4*e.b;e.setRGB(n)}return t}function jt(t){for(const e of t.pixels){const n=e.r<126?0:255;e.setRGB(n)}return t}function Et(t,e){const n=e.map(o=>t.pixels[o]);for(const o of t.pixels)o.a=0;for(const o of n)o.a=255;for(const o of t.pixels)o.a===0&&(o.a=255,o.setRGB(255));return t}function zt(t){return t<.5?4*t*t*t:1-(-2*t+2)**3/2}function Ft(t){let e=255;for(const o of t.pixels)e=Math.min(e,o.r);const n=255-e;for(const o of t.pixels){const i=o.r-e,r=zt(1-i/n);o.setRGB(o.r-Math.round(e*r))}return t}function Vt(t){const e={};function n(o,i){e[o]=e[o]||[],e[o].push(i)}for(const o of t.pixels)if(o.r<255){const i=t.pixels[o.i-t.w],r=t.pixels[o.i+t.w],s=t.pixels[o.i-1],a=t.pixels[o.i+1];i&&n(i.i,o.r),r&&n(r.i,o.r),s&&n(s.i,o.r),a&&n(a.i,o.r)}for(const o in e){const i=Math.min(...e[o]);t.pixels[o].setRGB(i)}return t}const Wt=10;function Ht(t,e){const n=Math.floor(e/2)*t;return[Math.floor(t*.25)+n,Math.floor(t*.75)+n]}async function Yt(t,e){await e({step:"Preparing image"});const n=t.width,o=t.height,i=new oe(X,n,o);i.fill("white"),i.drawImage(t);const r=i.clone();await e({step:"Applying Filters"}),jt(Me(r)),await e({step:"Finding Connected Pixels"});const s=Ue(r,0);await e({step:"Finding Grid"});const a=we(...Ht(n,o)),c=s.filter(k=>k.findIndex(N=>a.includes(N.i))!==-1),p=Ct(c),u=s.filter(k=>k.length<Wt).flat().concat(p);for(const k of u)k.setRGB(255);const l=Tt(p),f=Ge(r,l),h=l.flatMap(k=>k.xy),b=f.flatMap(k=>k.xy),w=Kt(h,b);await e({step:"Transforming Grid Perspective"});const g=w(r);Vt(g),await e({step:"Finding Digits"});const G=Ue(g,0);await e({step:"Transforming Perspective Again"});const M=w(i);await e({step:"Applying Filters Again"}),Me(M),Ft(M),await e({step:"Applying Digit Mask"}),Et(M,G.flat().map(k=>k.i));const ae=M.w/9,ce=M.h/9;let F=0,Q=0,ge=0;await e({step:"Creating Digit Canvases"});const We=G.map(k=>{const N=Ge(M,k),P=M.crop(N[0],N[2]),Ye=Math.floor(N[0].y/ce),Ke=Math.floor(N[0].x/ae);return F=Math.max(F,P.w),Q=Math.max(Q,P.h),ge+=P.h,[Ye*9+Ke,P]});await e({step:"Padding Canvases"});const He=Math.round(ge/G.length);return[We.map(([k,N])=>[k,Dt(X,N,F,Q)]),F,Q,He]}function Kt(t,e){const n=Lt(t,e,!1),o=e[2]-e[0],i=e[5]-e[1],r=e[0],s=e[1];return a=>{const c=new oe(X,o,i);for(const p of c.pixels){const[u,l]=Nt(n,p.x+r,p.y+s),f=a.pixel(Math.round(u),Math.round(l));p.setRGB(f!==void 0?f.rgb:255),p.a=255}return c}}const Ie=600;async function Zt(t,e){const[n,o,i,r]=await Yt(t,e),s=n.map(p=>p[1].canvas),a=await kt(o,i,r,s,e),c=Array.from({length:81}).fill(null);return n.forEach(([p],u)=>{c[p]=a[u]}),Promise.resolve(c)}function qt(t){return new Promise(e=>{const n=new Image;n.onload=function(){const o=document.createElement("canvas"),i=Ie/n.width;o.width=Ie,o.height=n.height*i,o.getContext("2d").drawImage(n,0,0,o.width,o.height),URL.revokeObjectURL(n.src),e(o)},n.src=URL.createObjectURL(t)})}class Xt{constructor(){y(this,"contents$");y(this,"candidates");this.contents$=new q(null),this.candidates=R.reduce((e,n)=>(e[n]=new q(!1),e),{})}}class pe{constructor(e){y(this,"occurrences");const n=I(...e.map(o=>o.contents$.pipe(le(i=>i===null?_([1,0]):I(_([i,1]),o.contents$.pipe(V(1),be(1),x(()=>[i,-1])))))));this.occurrences=R.reduce((o,i)=>Object.assign(o,{[i]:n.pipe(ee((r,[s,a])=>s===i?r+a:r,0))}),{})}}class Jt{constructor(e,n,o){y(this,"gridCell");y(this,"contents$");y(this,"candidates");y(this,"isLocked");y(this,"slices");this.gridCell=e,this.slices=n,this.contents$=e.contents$.pipe(j(i=>i===null?_(null):E([_(i),Ae(n,i).pipe(x(r=>Math.max(...r)===1))]))),this.candidates=R.reduce((i,r)=>Object.assign(i,{[r]:e.candidates[r].pipe(j(s=>s?Ae(n,r).pipe(x(a=>Math.max(...a)===0)):_(null)))}),{}),this.isLocked=o}toggleContents(e){this.gridCell.contents$.next(this.gridCell.contents$.value===e?null:e)}toggleCandidate(e){this.gridCell.candidates[e].next(!this.gridCell.candidates[e].value)}}function Ae(t,e){return E(t.map(n=>n.occurrences[e]))}const Qt=[0,3,6,27,30,33,54,57,60];class Pt{constructor(e=[],n=!0){y(this,"cells");y(this,"isEmpty$");y(this,"isValid$");y(this,"isSolved$");y(this,"updates$");y(this,"gridCells");this.gridCells=Array.from({length:81}).map(()=>new Xt),e.forEach((u,l)=>this.gridCells[l].contents$.next(u));const o=R.map(u=>new pe(this.gridCells.slice(u*9-9,u*9))),i=R.map(u=>new pe(rn(u-1).map(l=>this.gridCells[l]))),r=Qt.map(u=>new pe(an(u).map(l=>this.gridCells[l])));this.cells=Array.from({length:81}).map((u,l)=>new Jt(this.gridCells[l],[o[tn(l)],i[on(l)],r[sn(l)]],!!e[l]&&n)),this.updates$=I(...this.gridCells.map((u,l)=>I(u.contents$.pipe(V(1),x(f=>({type:"CellUpdate",cellIndex:l,contents:f}))),...R.map(f=>u.candidates[f].pipe(V(1),x(h=>({type:"CandidateUpdate",cellIndex:l,candidate:f,isShowing:h})))))));const s=this.gridCells.map(u=>u.contents$.pipe(le(l=>l===null?_(0):I(_(1),u.contents$.pipe(V(1),be(1),x(()=>-1)))))),a=I(...s).pipe(ee((u,l)=>u+l,0)),c=n?e.filter(u=>!!u).length:0;this.isEmpty$=a.pipe(x(u=>u===c));const p=I(...[...o,...i,...r].flatMap(u=>R.map(l=>u.occurrences[l].pipe(W(0),de(),Je())))).pipe(ee((u,[l,f])=>f>l&&f>1?u+1:f<l&&f>0?u-1:u,0),de(),W(0));this.isValid$=p.pipe(x(u=>u===0)),this.isSolved$=E([a,this.isValid$]).pipe(x(([u,l])=>u===81&&l))}getContents(){return this.gridCells.map(e=>e.contents$.value)}}function en(t){return Math.floor(t/9)*9}function tn(t){return Math.floor(en(t)/9)}function nn(t){return t%9}function on(t){return nn(t)}function rn(t){const e=t%9;return Array.from({length:9}).map((n,o)=>e+o*9)}function Be(t){return Math.floor(t/27)*27+t%9-t%3}function sn(t){const e=Be(t);return e<9?Math.floor(e/3):e<36?Math.floor(3+(e-27)/3):Math.floor(6+(e-54)/3)}function an(t){const e=Be(t);return[e,e+1,e+2,e+9,e+10,e+11,e+18,e+19,e+20]}const R=[1,2,3,4,5,6,7,8,9];function J(t,e){return new Pt(t,e)}class cn{constructor(){y(this,"status$");y(this,"game$");y(this,"canStart$");y(this,"canReset$");y(this,"updates$");this.status$=new q(v.Creating),this.game$=new q(J()),this.canStart$=this.game$.pipe(j(e=>E([e.isEmpty$,e.isValid$])),x(([e,n])=>!e&&n)),this.canReset$=this.game$.pipe(j(e=>E([e.isEmpty$,e.isSolved$])),x(([e,n])=>!e&&!n)),this.updates$=new H}startGame(){const e=this.game$.value.getContents();this.game$.next(J(e)),this.status$.next(v.Solving),this.updates$.next({type:"StartGameUpdate"})}newGame(){this.game$.next(J()),this.status$.next(v.Creating),this.updates$.next({type:"NewGameUpdate"})}resetGame(){const e=this.game$.value.getContents().map((n,o)=>this.game$.value.cells[o].isLocked?n:null);this.game$.next(J(e)),this.updates$.next({type:"ResetGameUpdate"})}loadGame(e,n=!0){this.game$.next(J(e,n)),n&&this.status$.next(v.Solving),this.updates$.next({type:"LoadGameUpdate",contents:e,startGame:n})}}var v;(function(t){t[t.Creating=0]="Creating",t[t.Solving=1]="Solving",t[t.Solved=2]="Solved"})(v||(v={}));function ln(){return new cn}const d=ue.exports.jsx,m=ue.exports.jsxs,$=ue.exports.Fragment;function ie(){return window.matchMedia("(hover: none)").matches}function dn(t,e,n){var f;const o=((f=t.get())==null?void 0:f.seen)||{};function i(h,b,w){o[h]||e.next({body:b,mustDismiss:!0,arrow:w,onRender:()=>{o[h]=!0,t.set({seen:o})}})}const r=n.game$.pipe(j(h=>h.updates$),x(h=>({type:"GameUpdate",detail:h}))),s=n.game$.pipe(j(h=>h.isValid$)),a=n.updates$.pipe(x(h=>({type:"AppUpdate",detail:h}))),c=d("i",{children:ie()?"Tap":"Click"}),p=d("i",{children:ie()?"Double Tap":"Double Click"}),u=d("i",{children:ie()?"Tapping":"Clicking"}),l=ie()?"phone or tablet":"computer";i("welcome",m($,{children:[d("p",{children:"Welcome to my Sudoku app."}),d("p",{children:"I'll be sharing a few details the first time you encounter things."}),m("p",{children:[c," anywhere to dismiss a message."]})]})),i("about",m($,{children:[d("p",{children:"The app has no puzzles of its own."}),d("p",{children:"Instead you can use it to play puzzles from newspapers, sudoku books or other websites."})]})),I(a,r).pipe(W({type:"InitialUpdate"}),Qe(0),te(n.status$,s)).subscribe(([h,b,w])=>{let g,G;h.type==="AppUpdate"?g=h.detail:h.type==="GameUpdate"&&(G=h.detail),b===v.Creating&&(i("create_start",m($,{children:[m("p",{children:["Right now you're in ",d("b",{children:"Create Mode"}),"."]}),d("p",{children:"Here you can add a puzzle to play and share."})]})),i("photo_import",m($,{children:[m("p",{children:["The easiest way is by ",d("b",{children:"Photo Import"}),"."]}),d("p",{children:"You can take a photo or choose an image of a Sudoku Grid."}),d("p",{children:"The entire grid must be in the photo or stange things might happen.."})]})),i("photo_import_button",m("p",{children:[c," the camera icon to use it."]}),{target:"ButtonBar",button:2}),i("create_manual",d("p",{children:"Otherwise you can edit the grid manually."})),i("create_choose_number",m("p",{children:["Start by ",u," a number to select it."]}),{target:"NumberPicker"}),i("create_toggle_cell",m("p",{children:["Then ",c," a cell to add or remove that number."]}),{target:"SudokuGrid"})),g&&g.type==="LoadGameUpdate"&&g.startGame===!1&&(i("photo_import_complete",d($,{children:m("p",{children:["Your ",l," has just trained a simple AI to understand the photo in real time."]})})),w?(i("photo_import_promising",d($,{children:d("p",{children:"It does looks promising but it's best to check it over."})})),i("photo_import_take_again",d($,{children:d("p",{children:"If it's miles off you can try taking the photo again."})}))):i("photo_import_take_again",d($,{children:d("p",{children:"It seems you have some errors. Maybe try taking the photo again."})})),i("photo_import_errors_advice",m($,{children:[d("p",{children:"For best results keep the grid straight and centered."}),d("p",{children:"If it's from a screen, try zooming in and taking the photo from further away."})]})),i("photo_import_errors_fix",d("p",{children:"Sometimes it's quicker to correct a few numbers manually."}))),(w&&g&&g.type==="LoadGameUpdate"&&g.startGame===!1||w&&G!==void 0&&b===v.Creating)&&i("start_game_button",m("p",{children:["This is the ",d("b",{children:"Start Game Button"})," for when you are done creating."]}),{target:"ButtonBar",button:1}),G!==void 0&&i("undo_redo",m($,{children:[m("p",{children:["The ",d("b",{children:"Undo and Redo Buttons"})," are available to correct errors."]}),d("p",{children:"They even work if you start or clear the game."})]}),{target:"ButtonBar",button:0,otherButton:3}),g&&g.type==="LoadGameUpdate"&&g.startGame===!0&&i("arrive_from_link",d("p",{children:"You've arrived from a shared puzzle link so you can start solving right away."})),g&&g.type==="StartGameUpdate"&&i("start_game",m("p",{children:["The puzzle cells are now locked and you're in ",d("b",{children:"Solve Mode"}),"."]})),b===v.Solving&&(i("solving_choose_number",m("p",{children:["Start by ",u," a number to select it."]}),{target:"NumberPicker"}),i("solving_toggle_cell_candidate",d($,{children:m("p",{children:[c," a cell to add or remove the chosen number as a Candidate."]})}),{target:"SudokuGrid"}),i("solving_toggle_cell_solution",d($,{children:m("p",{children:[p," to add or remove the chosen number as a Solution."]})}),{target:"SudokuGrid"})),G!==void 0&&G.type==="CellUpdate"&&b===v.Solving&&(i("reset_button",m($,{children:[m("p",{children:["The ",d("b",{children:"Reset Button"})," will start the puzzle again."]}),m("p",{children:[c," it twice to go back to Create Mode."]}),d("p",{children:"These actions can be undone."})]}),{target:"ButtonBar",button:1}),i("save_progress",m($,{children:[d("p",{children:"Your progress is being saved so you can continue later if you need to."}),d("p",{children:"You can even play when you are offline."})]})),i("share_button",m($,{children:[m("p",{children:[c," the ",d("b",{children:"Share Button"})," any time to share puzzles with friends."]}),d("p",{children:"Shared puzzles won't include any of your current progress."}),d("p",{children:"I'll leave you in peace now. Enjoy!"})]}),{target:"ButtonBar",button:2})),b===v.Solved&&(i("complete",m($,{children:[d("p",{children:"All done. I hope this first puzzle was a smooth experience."}),m("p",{children:["The ",d("b",{children:"Bin Button"})," will clear the grid and return to Create Mode."]})]}),{target:"ButtonBar",button:1}),i("final_share",m("p",{children:["Maybe you want to ",d("b",{children:"Share"})," the puzzle before you do that?"]}),{target:"ButtonBar",button:2}))})}function un(t){return I(t.updates$.pipe(x(e=>({type:"AppUpdate",detail:e}))),t.game$.pipe(j(e=>e.updates$),x(e=>({type:"GridUpdate",detail:e}))))}function hn(t){const e=[...t].reverse(),n=e.findIndex(i=>i.type==="AppUpdate"&&i.detail.type==="NewGameUpdate");if(n!==-1)return e.slice(0,n).reverse();const o=e.findIndex(i=>i.type==="AppUpdate"&&i.detail.type==="LoadGameUpdate");return o!==-1?e.slice(0,o+1).reverse():t}function _e(t,e){_(...e).pipe(te(t.game$)).subscribe(([n,o])=>{Re(t,o,n)})}function Re(t,e,n){switch(n.type){case"AppUpdate":pn(t,n.detail);break;case"GridUpdate":fn(e,n.detail);break;default:console.error("Unhandled replayUpdate",(o=>o)(n))}}function pn(t,e){switch(e.type){case"LoadGameUpdate":t.loadGame(e.contents,e.startGame);break;case"NewGameUpdate":t.newGame();break;case"ResetGameUpdate":t.resetGame();break;case"StartGameUpdate":t.startGame();break;default:console.error("Unhandled replayAppUpdate",(n=>n)(e))}}function fn(t,e){switch(e.type){case"CellUpdate":t.cells[e.cellIndex].toggleContents(e.contents);break;case"CandidateUpdate":t.cells[e.cellIndex].toggleCandidate(e.candidate);break;default:console.error("Unhandled replayGridUpdate",(n=>n)(e))}}function gn(t,e,n,o){switch(o.type){case"AppUpdate":mn(t,n);break;case"GridUpdate":bn(e,n,o.detail);break;default:console.error("Unhandled rollbackUpdate",(i=>i)(o))}}function mn(t,e){const n=[...e].reverse(),o=n.findIndex(s=>s.type==="AppUpdate"&&["NewGameUpdate","LoadGameUpdate"].includes(s.detail.type)),i=o===-1?n.length:o+1,r=n.slice(0,i).reverse();o===-1&&t.newGame(),_e(t,r)}function bn(t,e,n){switch(n.type){case"CellUpdate":yn(t,e,n.cellIndex);break;case"CandidateUpdate":t.cells[n.cellIndex].toggleCandidate(n.candidate);break;default:console.error("Unhandled replayGridUpdate",(o=>o)(n))}}function yn(t,e,n){const o=[...e].reverse(),i=o.findIndex(a=>a.type==="AppUpdate"||wn(a,n)),r=o[i];let s=null;r&&r.type==="GridUpdate"&&r.detail.type==="CellUpdate"?s=r.detail.contents:r&&r.type==="AppUpdate"&&r.detail.type==="LoadGameUpdate"&&(s=r.detail.contents[n]),t.cells[n].toggleContents(s)}function wn(t,e){return t.type==="GridUpdate"&&t.detail.type==="CellUpdate"&&t.detail.cellIndex===e}var z,L;class Cn{constructor(e,n){T(this,z,void 0);T(this,L,void 0);y(this,"collection$");y(this,"updates$");S(this,z,new H),S(this,L,!1);const o=e.pipe(Pe(()=>!C(this,L))),i=I(o,C(this,z)).pipe(ee((r,s)=>{if(s==="SaveLoadUndoAction_Undo"){const[[a,c]]=r,p=a.pop();return p===void 0?r:(c.push(p),[[a,c],s,p])}else if(s==="SaveLoadUndoAction_Redo"){const[[a,c]]=r,p=c.pop();return p===void 0?r:(a.push(p),[[a,c],s,p])}else{const[[a]]=r;return[[a.concat(s),[]],null,null]}},[n,null,null]),W([n,null,null]),de(),he(1));this.collection$=i.pipe(V(1),x(r=>r[0])),this.updates$=i.pipe(V(1),le(([[r],s,a])=>s!==null&&a!==null?_({type:s==="SaveLoadUndoAction_Undo"?"Undo":"Redo",affected:a,history:r}):et))}undo(){S(this,L,!0),C(this,z).next("SaveLoadUndoAction_Undo"),S(this,L,!1)}redo(){S(this,L,!0),C(this,z).next("SaveLoadUndoAction_Redo"),S(this,L,!1)}}z=new WeakMap,L=new WeakMap;var Le;(function(t){t[t.One=0]="One"})(Le||(Le={}));function xn(t,e){var s;const n=((s=t.get())==null?void 0:s.data)||[[],[]],o=new H,i=hn(n[0]),r=new Cn(o,[i,n[1]]);return{undo(){r.undo()},redo(){r.redo()},setup(){_e(e,i),un(e).subscribe(o),r.collection$.subscribe(a=>{t.set({version:0,data:a})}),r.updates$.pipe(te(e.game$)).subscribe(([a,c])=>{a.type==="Undo"?gn(e,c,a.history,a.affected):Re(e,c,a.affected)})}}}function vn(t){let e=BigInt(t).toString(16);e.length%2&&(e="0"+e);const n=[];let o=0,i,r;for(;o<e.length;)i=parseInt(e.slice(o,o+2),16),r=String.fromCharCode(i),n.push(r),o+=2;return btoa(n.join(""))}function $n(t){const e=atob(t),n=[];return e.split("").forEach(function(o){let i=o.charCodeAt(0).toString(16);i.length%2&&(i="0"+i),n.push(i)}),BigInt("0x"+n.join(""))}function kn(t){return t.replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")}function Sn(t){const e=t.length%4;return e===2?t+="==":e===3&&(t+="="),t.replace(/-/g,"+").replace(/_/g,"/")}const Ne=[["000000000","_9"],["00000000","_8"],["0000000","_7"],["000000","_6"],["00000","_5"],["0000","_4"],["000","_3"],["00","_2"],["0","_1"],["_","0"]],Un=[...Ne].reverse();function Gn(t){const e=t.map(i=>i===null?0:i).join(""),n=BigInt(e).toString(),o=Ne.reduce((i,[r,s])=>i.replaceAll(r,s),n);return kn(vn(o))}function Mn(t){const e=$n(Sn(t)).toString();return Un.reduce((i,[r,s])=>i.replaceAll(s,r),e).padStart(81,"0").split("").map(i=>i==="0"?null:parseInt(i,10))}var fe;(function(t){t[t.Mobile=0]="Mobile",t[t.Clipboard=1]="Clipboard"})(fe||(fe={}));function In(t){if(window.location.hash){const e=Mn(window.location.hash.substring(1));t.loadGame(e,!0),history.replaceState(null,"",".")}}function An(t){const e=new URL(window.location.href);return e.hash=Gn(t.getContents()),typeof navigator.share=="function"?(navigator.share({url:e.toString()}),0):(navigator.clipboard.writeText(e.toString()),1)}function re(){return U.exports.createContext(new Proxy({},{get(){throw new Error("Missing Context dependencies")}}))}function Te(){return t=>{const e=t.pipe(nt(ot)).subscribe(()=>e.unsubscribe());return t}}function Bn(t,e,n){const o=U.exports.useMemo(()=>new H,n);return U.exports.useEffect(()=>{const i=o.pipe(te(...e)).subscribe(r=>{t(...r)});return()=>i.unsubscribe()},n),i=>()=>o.next(i)}const Oe="RxReactNoValue";function A(t){const e=U.exports.useRef(null);let n=Oe,o=!1;if(e.current!==t&&(e.current=t,o=!0,t.subscribe(s=>n=s).unsubscribe(),n===Oe))throw tt(t);const[i,r]=U.exports.useState(n);return U.exports.useEffect(()=>{const s=t.subscribe(r);return()=>s.unsubscribe()},[t]),o?n:i}const De=re();function _n(){const{app:t,share:e,saveLoadUndo:n,gridFromImage:o}=U.exports.useContext(De),i=A(t.status$),r=A(t.canStart$),s=A(t.canReset$),a=A(t.game$),c=i===v.Creating,p=i!==v.Creating&&!s,u=i!==v.Creating&&s,l=i!==v.Creating;function f(h){const b=h.target.files?h.target.files[0]:null;b&&qt(b).then(o)}return m("div",{className:"ButtonBar",children:[d("button",{onClick:()=>n.undo(),children:d(it,{})}),c&&d("button",{disabled:!r,onClick:()=>t.startGame(),"data-testid":"button-bar-start",children:d(rt,{})}),p&&d("button",{onClick:()=>t.newGame(),"data-testid":"button-bar-new",children:d(st,{})}),u&&d("button",{onClick:()=>t.resetGame(),"data-testid":"button-bar-reset",children:d(at,{})}),!l&&m($,{children:[d("input",{hidden:!0,type:"file",accept:"image/*",onChange:f}),d("button",{onClick:h=>h.currentTarget.previousSibling.click(),children:d(ct,{})})]}),l&&d("button",{onClick:()=>e(a),"data-testid":"button-bar-share",children:d(lt,{})}),d("button",{onClick:()=>n.redo(),children:d(dt,{})})]})}const je=re();function Rn(){var i,r;const{message$:t,dismiss$:e}=U.exports.useContext(je),n=A(t);U.exports.useEffect(()=>{n&&n.onRender&&n.onRender()},[n]);const o=n&&n.arrow&&n.arrow.target==="ButtonBar"?{"--arrow-button":n.arrow.button,"--arrow-other-button":n.arrow.otherButton}:void 0;return d("div",{className:`Messages ${n?"-ShowingMessage":""}`,onClick:()=>e.next(),"data-testid":"messages",children:n&&d("div",{className:`--Message ${n.arrow?"-Indicating":""}`,"data-arrow-target":n.arrow&&n.arrow.target,style:o,"data-arrow-other-button":((i=n==null?void 0:n.arrow)==null?void 0:i.target)==="ButtonBar"?(r=n==null?void 0:n.arrow)==null?void 0:r.otherButton:void 0,"data-testid":"messages-message",children:n.body})})}function Ln(){const t=new H,e=new H,n=t.pipe(x(o=>Tn({a:o,b$:o.mustDismiss?e:I(e,Nn(t)),c:void 0})),gt(),W(void 0),he(1),Te());return{messages$:t,message$:n,dismiss$:e}}function Nn(t){return t.pipe(ut(),he(1),Te())}function Tn({a:t,b$:e,c:n}){return ht(pt.pipe(W(t),ft(e)),_(n))}const Ee=re();function On(){const{selectedNumber$:t}=U.exports.useContext(Ee),e=A(t);return m("div",{className:"NumberPicker",children:[d("div",{style:{"--selected":e},className:"--Selection","data-testid":"number-picker-selection"}),d("ul",{className:"--Values",children:R.map(n=>d("li",{onClick:()=>t.next(n),style:{"--value":n},children:n},n))})]})}const ze=re();var Fe;(function(t){t[t.Click=0]="Click",t[t.DblClick=1]="DblClick"})(Fe||(Fe={}));function Dn(){const{selectedNumber$:t,app:e}=U.exports.useContext(ze),n=A(e.game$),o=U.exports.useMemo(()=>n.cells.map(i=>({highlightCell$:E([i.contents$,t]).pipe(x(([r,s])=>!!r&&r[0]===s)),highlightCandidate:R.reduce((r,s)=>Object.assign(r,{[s]:E([i.candidates[s],t]).pipe(x(([a,c])=>a!==null&&s===c))}),{})})),[n.cells]);return d("div",{className:"SudokuGrid","data-testid":"sudoku-grid",children:n.cells.map((i,r)=>d(jn,{cell:i,selectedNumber$:t,app:e,highlights:o[r]},r))})}function jn({cell:t,selectedNumber$:e,app:n,highlights:o}){const[i,r]=A(t.contents$)||[null,!0],s=A(o.highlightCell$),a=Bn((c,p,u)=>{t.isLocked||(u===v.Creating&&c===0||u===v.Solving&&c===1?t.toggleContents(p):u===v.Solving&&c===0&&t.toggleCandidate(p))},[e,n.status$],[t,t.isLocked]);return m("div",{className:`--Cell ${t.isLocked?"-Locked":""} ${s?"-Highlight":""} ${i?`-ShowingContents ${r?"-Valid":"-Invalid"}`:"-ShowingCandidates"}`,onClick:a(0),onDoubleClick:a(1),children:[d("div",{className:"--Candidates",children:R.map(c=>d(En,{candidate:c,status$:t.candidates[c],isHighlighted$:o.highlightCandidate[c]},c))}),d("div",{className:"--Contents",children:i})]})}function En({candidate:t,status$:e,isHighlighted$:n}){const o=A(e),i=A(n);return d("div",{className:`--Candidate ${i?"-Highlight":""} ${o!==null?o?"-Valid":"-Invalid":""}`,children:o!==null?t:" "})}let Ve={enable(){}};navigator.userAgent.includes("jsdom")||(Ve=new mt);function zn(){const t=new q(1),e=ln(),n=ye("SaveLoadUndo"),o=ye("Onboarding"),i=xn(n,e),{messages$:r,message$:s,dismiss$:a}=Ln();U.exports.useEffect(()=>{i.setup(),dn(o,r,e),In(e)},[]);function c(){Ve.enable()}function p(l){return Zt(l,f=>new Promise(h=>{r.next({body:d("p",{children:f.step}),onRender:h})})).then(f=>{a.next(),e.loadGame(f,!1)})}function u(l){An(l)===fe.Clipboard&&r.next({body:d("p",{children:"Copied Link To Clipboard."})})}return m("div",{className:"SudokuApp",onClick:c,children:[d(je.Provider,{value:{message$:s,dismiss$:a},children:d(Rn,{})}),d(ze.Provider,{value:{selectedNumber$:t,app:e},children:d(Dn,{})}),d(Ee.Provider,{value:{selectedNumber$:t},children:d(On,{})}),d(De.Provider,{value:{app:e,share:u,saveLoadUndo:i,gridFromImage:p},children:d(_n,{})})]})}function Fn(t={}){const{immediate:e=!1,onNeedRefresh:n,onOfflineReady:o,onRegistered:i,onRegisterError:r}=t;let s;const a=async(c=!0)=>{};return"serviceWorker"in navigator&&(s=new bt("/sudoku/sw.js",{scope:"/sudoku/",type:"classic"}),s.addEventListener("activated",c=>{c.isUpdate?window.location.reload():o==null||o()}),s.register({immediate:e}).then(c=>{i==null||i(c)}).catch(c=>{r==null||r(c)})),a}Fn();yt.exports.render(d(zn,{}),document.getElementById("root"));
