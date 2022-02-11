var Ze=Object.defineProperty;var et=(e,t,r)=>t in e?Ze(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var v=(e,t,r)=>(et(e,typeof t!="symbol"?t+"":t,r),r);import{_ as D,a as O,b as P,c as j,d as tt,e as pe,f as W,g as rt,h as nt,r as g,j as ve,s as ot,i as it}from"./vendor.b793522a.js";const ut=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const u of i.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&n(u)}).observe(document,{childList:!0,subtree:!0});function r(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerpolicy&&(i.referrerPolicy=o.referrerpolicy),o.crossorigin==="use-credentials"?i.credentials="include":o.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(o){if(o.ep)return;o.ep=!0;const i=r(o);fetch(o.href,i)}};ut();function f(e){return typeof e=="function"}function X(e){var t=function(n){Error.call(n),n.stack=new Error().stack},r=e(t);return r.prototype=Object.create(Error.prototype),r.prototype.constructor=r,r}var Q=X(function(e){return function(r){e(this),this.message=r?r.length+` errors occurred during unsubscription:
`+r.map(function(n,o){return o+1+") "+n.toString()}).join(`
  `):"",this.name="UnsubscriptionError",this.errors=r}});function Z(e,t){if(e){var r=e.indexOf(t);0<=r&&e.splice(r,1)}}var G=function(){function e(t){this.initialTeardown=t,this.closed=!1,this._parentage=null,this._teardowns=null}return e.prototype.unsubscribe=function(){var t,r,n,o,i;if(!this.closed){this.closed=!0;var u=this._parentage;if(u)if(this._parentage=null,Array.isArray(u))try{for(var a=D(u),s=a.next();!s.done;s=a.next()){var c=s.value;c.remove(this)}}catch(p){t={error:p}}finally{try{s&&!s.done&&(r=a.return)&&r.call(a)}finally{if(t)throw t.error}}else u.remove(this);var l=this.initialTeardown;if(f(l))try{l()}catch(p){i=p instanceof Q?p.errors:[p]}var d=this._teardowns;if(d){this._teardowns=null;try{for(var m=D(d),x=m.next();!x.done;x=m.next()){var M=x.value;try{be(M)}catch(p){i=i!=null?i:[],p instanceof Q?i=O(O([],P(i)),P(p.errors)):i.push(p)}}}catch(p){n={error:p}}finally{try{x&&!x.done&&(o=m.return)&&o.call(m)}finally{if(n)throw n.error}}}if(i)throw new Q(i)}},e.prototype.add=function(t){var r;if(t&&t!==this)if(this.closed)be(t);else{if(t instanceof e){if(t.closed||t._hasParent(this))return;t._addParent(this)}(this._teardowns=(r=this._teardowns)!==null&&r!==void 0?r:[]).push(t)}},e.prototype._hasParent=function(t){var r=this._parentage;return r===t||Array.isArray(r)&&r.includes(t)},e.prototype._addParent=function(t){var r=this._parentage;this._parentage=Array.isArray(r)?(r.push(t),r):r?[r,t]:t},e.prototype._removeParent=function(t){var r=this._parentage;r===t?this._parentage=null:Array.isArray(r)&&Z(r,t)},e.prototype.remove=function(t){var r=this._teardowns;r&&Z(r,t),t instanceof e&&t._removeParent(this)},e.EMPTY=function(){var t=new e;return t.closed=!0,t}(),e}(),me=G.EMPTY;function ye(e){return e instanceof G||e&&"closed"in e&&f(e.remove)&&f(e.add)&&f(e.unsubscribe)}function be(e){f(e)?e():e.unsubscribe()}var N={onUnhandledError:null,onStoppedNotification:null,Promise:void 0,useDeprecatedSynchronousErrorHandling:!1,useDeprecatedNextContext:!1},H={setTimeout:function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];var r=H.delegate;return((r==null?void 0:r.setTimeout)||setTimeout).apply(void 0,O([],P(e)))},clearTimeout:function(e){var t=H.delegate;return((t==null?void 0:t.clearTimeout)||clearTimeout)(e)},delegate:void 0};function ge(e){H.setTimeout(function(){var t=N.onUnhandledError;if(t)t(e);else throw e})}function ee(){}var st=function(){return te("C",void 0,void 0)}();function at(e){return te("E",void 0,e)}function ct(e){return te("N",e,void 0)}function te(e,t,r){return{kind:e,value:t,error:r}}var Y=null;function K(e){if(N.useDeprecatedSynchronousErrorHandling){var t=!Y;if(t&&(Y={errorThrown:!1,error:null}),e(),t){var r=Y,n=r.errorThrown,o=r.error;if(Y=null,n)throw o}}else e()}var re=function(e){j(t,e);function t(r){var n=e.call(this)||this;return n.isStopped=!1,r?(n.destination=r,ye(r)&&r.add(n)):n.destination=ht,n}return t.create=function(r,n,o){return new z(r,n,o)},t.prototype.next=function(r){this.isStopped?oe(ct(r),this):this._next(r)},t.prototype.error=function(r){this.isStopped?oe(at(r),this):(this.isStopped=!0,this._error(r))},t.prototype.complete=function(){this.isStopped?oe(st,this):(this.isStopped=!0,this._complete())},t.prototype.unsubscribe=function(){this.closed||(this.isStopped=!0,e.prototype.unsubscribe.call(this),this.destination=null)},t.prototype._next=function(r){this.destination.next(r)},t.prototype._error=function(r){try{this.destination.error(r)}finally{this.unsubscribe()}},t.prototype._complete=function(){try{this.destination.complete()}finally{this.unsubscribe()}},t}(G),lt=Function.prototype.bind;function ne(e,t){return lt.call(e,t)}var ft=function(){function e(t){this.partialObserver=t}return e.prototype.next=function(t){var r=this.partialObserver;if(r.next)try{r.next(t)}catch(n){q(n)}},e.prototype.error=function(t){var r=this.partialObserver;if(r.error)try{r.error(t)}catch(n){q(n)}else q(t)},e.prototype.complete=function(){var t=this.partialObserver;if(t.complete)try{t.complete()}catch(r){q(r)}},e}(),z=function(e){j(t,e);function t(r,n,o){var i=e.call(this)||this,u;if(f(r)||!r)u={next:r!=null?r:void 0,error:n!=null?n:void 0,complete:o!=null?o:void 0};else{var a;i&&N.useDeprecatedNextContext?(a=Object.create(r),a.unsubscribe=function(){return i.unsubscribe()},u={next:r.next&&ne(r.next,a),error:r.error&&ne(r.error,a),complete:r.complete&&ne(r.complete,a)}):u=r}return i.destination=new ft(u),i}return t}(re);function q(e){ge(e)}function dt(e){throw e}function oe(e,t){var r=N.onStoppedNotification;r&&H.setTimeout(function(){return r(e,t)})}var ht={closed:!0,next:ee,error:dt,complete:ee},ie=function(){return typeof Symbol=="function"&&Symbol.observable||"@@observable"}();function _(e){return e}function pt(e){return e.length===0?_:e.length===1?e[0]:function(r){return e.reduce(function(n,o){return o(n)},r)}}var b=function(){function e(t){t&&(this._subscribe=t)}return e.prototype.lift=function(t){var r=new e;return r.source=this,r.operator=t,r},e.prototype.subscribe=function(t,r,n){var o=this,i=mt(t)?t:new z(t,r,n);return K(function(){var u=o,a=u.operator,s=u.source;i.add(a?a.call(i,s):s?o._subscribe(i):o._trySubscribe(i))}),i},e.prototype._trySubscribe=function(t){try{return this._subscribe(t)}catch(r){t.error(r)}},e.prototype.forEach=function(t,r){var n=this;return r=Se(r),new r(function(o,i){var u=new z({next:function(a){try{t(a)}catch(s){i(s),u.unsubscribe()}},error:i,complete:o});n.subscribe(u)})},e.prototype._subscribe=function(t){var r;return(r=this.source)===null||r===void 0?void 0:r.subscribe(t)},e.prototype[ie]=function(){return this},e.prototype.pipe=function(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];return pt(t)(this)},e.prototype.toPromise=function(t){var r=this;return t=Se(t),new t(function(n,o){var i;r.subscribe(function(u){return i=u},function(u){return o(u)},function(){return n(i)})})},e.create=function(t){return new e(t)},e}();function Se(e){var t;return(t=e!=null?e:N.Promise)!==null&&t!==void 0?t:Promise}function vt(e){return e&&f(e.next)&&f(e.error)&&f(e.complete)}function mt(e){return e&&e instanceof re||vt(e)&&ye(e)}function yt(e){return f(e==null?void 0:e.lift)}function S(e){return function(t){if(yt(t))return t.lift(function(r){try{return e(r,this)}catch(n){this.error(n)}});throw new TypeError("Unable to lift unknown Observable type")}}function y(e,t,r,n,o){return new bt(e,t,r,n,o)}var bt=function(e){j(t,e);function t(r,n,o,i,u,a){var s=e.call(this,r)||this;return s.onFinalize=u,s.shouldUnsubscribe=a,s._next=n?function(c){try{n(c)}catch(l){r.error(l)}}:e.prototype._next,s._error=i?function(c){try{i(c)}catch(l){r.error(l)}finally{this.unsubscribe()}}:e.prototype._error,s._complete=o?function(){try{o()}catch(c){r.error(c)}finally{this.unsubscribe()}}:e.prototype._complete,s}return t.prototype.unsubscribe=function(){var r;if(!this.shouldUnsubscribe||this.shouldUnsubscribe()){var n=this.closed;e.prototype.unsubscribe.call(this),!n&&((r=this.onFinalize)===null||r===void 0||r.call(this))}},t}(re),gt=X(function(e){return function(){e(this),this.name="ObjectUnsubscribedError",this.message="object unsubscribed"}}),ue=function(e){j(t,e);function t(){var r=e.call(this)||this;return r.closed=!1,r.observers=[],r.isStopped=!1,r.hasError=!1,r.thrownError=null,r}return t.prototype.lift=function(r){var n=new we(this,this);return n.operator=r,n},t.prototype._throwIfClosed=function(){if(this.closed)throw new gt},t.prototype.next=function(r){var n=this;K(function(){var o,i;if(n._throwIfClosed(),!n.isStopped){var u=n.observers.slice();try{for(var a=D(u),s=a.next();!s.done;s=a.next()){var c=s.value;c.next(r)}}catch(l){o={error:l}}finally{try{s&&!s.done&&(i=a.return)&&i.call(a)}finally{if(o)throw o.error}}}})},t.prototype.error=function(r){var n=this;K(function(){if(n._throwIfClosed(),!n.isStopped){n.hasError=n.isStopped=!0,n.thrownError=r;for(var o=n.observers;o.length;)o.shift().error(r)}})},t.prototype.complete=function(){var r=this;K(function(){if(r._throwIfClosed(),!r.isStopped){r.isStopped=!0;for(var n=r.observers;n.length;)n.shift().complete()}})},t.prototype.unsubscribe=function(){this.isStopped=this.closed=!0,this.observers=null},Object.defineProperty(t.prototype,"observed",{get:function(){var r;return((r=this.observers)===null||r===void 0?void 0:r.length)>0},enumerable:!1,configurable:!0}),t.prototype._trySubscribe=function(r){return this._throwIfClosed(),e.prototype._trySubscribe.call(this,r)},t.prototype._subscribe=function(r){return this._throwIfClosed(),this._checkFinalizedStatuses(r),this._innerSubscribe(r)},t.prototype._innerSubscribe=function(r){var n=this,o=n.hasError,i=n.isStopped,u=n.observers;return o||i?me:(u.push(r),new G(function(){return Z(u,r)}))},t.prototype._checkFinalizedStatuses=function(r){var n=this,o=n.hasError,i=n.thrownError,u=n.isStopped;o?r.error(i):u&&r.complete()},t.prototype.asObservable=function(){var r=new b;return r.source=this,r},t.create=function(r,n){return new we(r,n)},t}(b),we=function(e){j(t,e);function t(r,n){var o=e.call(this)||this;return o.destination=r,o.source=n,o}return t.prototype.next=function(r){var n,o;(o=(n=this.destination)===null||n===void 0?void 0:n.next)===null||o===void 0||o.call(n,r)},t.prototype.error=function(r){var n,o;(o=(n=this.destination)===null||n===void 0?void 0:n.error)===null||o===void 0||o.call(n,r)},t.prototype.complete=function(){var r,n;(n=(r=this.destination)===null||r===void 0?void 0:r.complete)===null||n===void 0||n.call(r)},t.prototype._subscribe=function(r){var n,o;return(o=(n=this.source)===null||n===void 0?void 0:n.subscribe(r))!==null&&o!==void 0?o:me},t}(ue),V=function(e){j(t,e);function t(r){var n=e.call(this)||this;return n._value=r,n}return Object.defineProperty(t.prototype,"value",{get:function(){return this.getValue()},enumerable:!1,configurable:!0}),t.prototype._subscribe=function(r){var n=e.prototype._subscribe.call(this,r);return!n.closed&&r.next(this._value),n},t.prototype.getValue=function(){var r=this,n=r.hasError,o=r.thrownError,i=r._value;if(n)throw o;return this._throwIfClosed(),i},t.prototype.next=function(r){e.prototype.next.call(this,this._value=r)},t}(ue),xe=new b(function(e){return e.complete()});function St(e){return e&&f(e.schedule)}function se(e){return e[e.length-1]}function Ce(e){return f(se(e))?e.pop():void 0}function U(e){return St(se(e))?e.pop():void 0}function wt(e,t){return typeof se(e)=="number"?e.pop():t}var Ee=function(e){return e&&typeof e.length=="number"&&typeof e!="function"};function ke(e){return f(e==null?void 0:e.then)}function $e(e){return f(e[ie])}function Ie(e){return Symbol.asyncIterator&&f(e==null?void 0:e[Symbol.asyncIterator])}function Ae(e){return new TypeError("You provided "+(e!==null&&typeof e=="object"?"an invalid object":"'"+e+"'")+" where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.")}function xt(){return typeof Symbol!="function"||!Symbol.iterator?"@@iterator":Symbol.iterator}var Oe=xt();function Pe(e){return f(e==null?void 0:e[Oe])}function je(e){return tt(this,arguments,function(){var r,n,o,i;return pe(this,function(u){switch(u.label){case 0:r=e.getReader(),u.label=1;case 1:u.trys.push([1,,9,10]),u.label=2;case 2:return[4,W(r.read())];case 3:return n=u.sent(),o=n.value,i=n.done,i?[4,W(void 0)]:[3,5];case 4:return[2,u.sent()];case 5:return[4,W(o)];case 6:return[4,u.sent()];case 7:return u.sent(),[3,2];case 8:return[3,10];case 9:return r.releaseLock(),[7];case 10:return[2]}})})}function _e(e){return f(e==null?void 0:e.getReader)}function k(e){if(e instanceof b)return e;if(e!=null){if($e(e))return Ct(e);if(Ee(e))return Et(e);if(ke(e))return kt(e);if(Ie(e))return Le(e);if(Pe(e))return $t(e);if(_e(e))return It(e)}throw Ae(e)}function Ct(e){return new b(function(t){var r=e[ie]();if(f(r.subscribe))return r.subscribe(t);throw new TypeError("Provided object does not correctly implement Symbol.observable")})}function Et(e){return new b(function(t){for(var r=0;r<e.length&&!t.closed;r++)t.next(e[r]);t.complete()})}function kt(e){return new b(function(t){e.then(function(r){t.closed||(t.next(r),t.complete())},function(r){return t.error(r)}).then(null,ge)})}function $t(e){return new b(function(t){var r,n;try{for(var o=D(e),i=o.next();!i.done;i=o.next()){var u=i.value;if(t.next(u),t.closed)return}}catch(a){r={error:a}}finally{try{i&&!i.done&&(n=o.return)&&n.call(o)}finally{if(r)throw r.error}}t.complete()})}function Le(e){return new b(function(t){At(e,t).catch(function(r){return t.error(r)})})}function It(e){return Le(je(e))}function At(e,t){var r,n,o,i;return rt(this,void 0,void 0,function(){var u,a;return pe(this,function(s){switch(s.label){case 0:s.trys.push([0,5,6,11]),r=nt(e),s.label=1;case 1:return[4,r.next()];case 2:if(n=s.sent(),!!n.done)return[3,4];if(u=n.value,t.next(u),t.closed)return[2];s.label=3;case 3:return[3,1];case 4:return[3,11];case 5:return a=s.sent(),o={error:a},[3,11];case 6:return s.trys.push([6,,9,10]),n&&!n.done&&(i=r.return)?[4,i.call(r)]:[3,8];case 7:s.sent(),s.label=8;case 8:return[3,10];case 9:if(o)throw o.error;return[7];case 10:return[7];case 11:return t.complete(),[2]}})})}function C(e,t,r,n,o){n===void 0&&(n=0),o===void 0&&(o=!1);var i=t.schedule(function(){r(),o?e.add(this.schedule(null,n)):this.unsubscribe()},n);if(e.add(i),!o)return i}function Me(e,t){return t===void 0&&(t=0),S(function(r,n){r.subscribe(y(n,function(o){return C(n,e,function(){return n.next(o)},t)},function(){return C(n,e,function(){return n.complete()},t)},function(o){return C(n,e,function(){return n.error(o)},t)}))})}function Te(e,t){return t===void 0&&(t=0),S(function(r,n){n.add(e.schedule(function(){return r.subscribe(n)},t))})}function Ot(e,t){return k(e).pipe(Te(t),Me(t))}function Pt(e,t){return k(e).pipe(Te(t),Me(t))}function jt(e,t){return new b(function(r){var n=0;return t.schedule(function(){n===e.length?r.complete():(r.next(e[n++]),r.closed||this.schedule())})})}function _t(e,t){return new b(function(r){var n;return C(r,t,function(){n=e[Oe](),C(r,t,function(){var o,i,u;try{o=n.next(),i=o.value,u=o.done}catch(a){r.error(a);return}u?r.complete():r.next(i)},0,!0)}),function(){return f(n==null?void 0:n.return)&&n.return()}})}function Ne(e,t){if(!e)throw new Error("Iterable cannot be null");return new b(function(r){C(r,t,function(){var n=e[Symbol.asyncIterator]();C(r,t,function(){n.next().then(function(o){o.done?r.complete():r.next(o.value)})},0,!0)})})}function Lt(e,t){return Ne(je(e),t)}function Mt(e,t){if(e!=null){if($e(e))return Ot(e,t);if(Ee(e))return jt(e,t);if(ke(e))return Pt(e,t);if(Ie(e))return Ne(e,t);if(Pe(e))return _t(e,t);if(_e(e))return Lt(e,t)}throw Ae(e)}function R(e,t){return t?Mt(e,t):k(e)}function A(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];var r=U(e);return R(e,r)}var Tt=X(function(e){return function(){e(this),this.name="EmptyError",this.message="no elements in sequence"}});function Nt(e,t){var r=typeof t=="object";return new Promise(function(n,o){var i=new z({next:function(u){n(u),i.unsubscribe()},error:o,complete:function(){r?n(t.defaultValue):o(new Tt)}});e.subscribe(i)})}function w(e,t){return S(function(r,n){var o=0;r.subscribe(y(n,function(i){n.next(e.call(t,i,o++))}))})}var Vt=Array.isArray;function Ut(e,t){return Vt(t)?e.apply(void 0,O([],P(t))):e(t)}function Rt(e){return w(function(t){return Ut(e,t)})}var Bt=Array.isArray,Ft=Object.getPrototypeOf,Dt=Object.prototype,Gt=Object.keys;function Ht(e){if(e.length===1){var t=e[0];if(Bt(t))return{args:t,keys:null};if(Yt(t)){var r=Gt(t);return{args:r.map(function(n){return t[n]}),keys:r}}}return{args:e,keys:null}}function Yt(e){return e&&typeof e=="object"&&Ft(e)===Dt}function Kt(e,t){return e.reduce(function(r,n,o){return r[n]=t[o],r},{})}function L(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];var r=U(e),n=Ce(e),o=Ht(e),i=o.args,u=o.keys;if(i.length===0)return R([],r);var a=new b(zt(i,r,u?function(s){return Kt(u,s)}:_));return n?a.pipe(Rt(n)):a}function zt(e,t,r){return r===void 0&&(r=_),function(n){Ve(t,function(){for(var o=e.length,i=new Array(o),u=o,a=o,s=function(l){Ve(t,function(){var d=R(e[l],t),m=!1;d.subscribe(y(n,function(x){i[l]=x,m||(m=!0,a--),a||n.next(r(i.slice()))},function(){--u||n.complete()}))},n)},c=0;c<o;c++)s(c)},n)}}function Ve(e,t,r){e?C(r,e,t):t()}function qt(e,t,r,n,o,i,u,a){var s=[],c=0,l=0,d=!1,m=function(){d&&!s.length&&!c&&t.complete()},x=function(p){return c<n?M(p):s.push(p)},M=function(p){i&&t.next(p),c++;var he=!1;k(r(p,l++)).subscribe(y(t,function(T){o==null||o(T),i?x(T):t.next(T)},function(){he=!0},void 0,function(){if(he)try{c--;for(var T=function(){var F=s.shift();u?C(t,u,function(){return M(F)}):M(F)};s.length&&c<n;)T();m()}catch(F){t.error(F)}}))};return e.subscribe(y(t,x,function(){d=!0,m()})),function(){a==null||a()}}function J(e,t,r){return r===void 0&&(r=1/0),f(t)?J(function(n,o){return w(function(i,u){return t(n,i,o,u)})(k(e(n,o)))},r):(typeof t=="number"&&(r=t),S(function(n,o){return qt(n,o,e,r)}))}function Ue(e){return e===void 0&&(e=1/0),J(_,e)}function Jt(){return Ue(1)}function Re(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return Jt()(R(e,U(e)))}function B(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];var r=U(e),n=wt(e,1/0),o=e;return o.length?o.length===1?k(o[0]):Ue(n)(R(o,r)):xe}function Wt(e,t){return S(function(r,n){var o=0;r.subscribe(y(n,function(i){return e.call(t,i,o++)&&n.next(i)}))})}function Xt(e,t,r,n,o){return function(i,u){var a=r,s=t,c=0;i.subscribe(y(u,function(l){var d=c++;s=a?e(s,l,d):(a=!0,l),n&&u.next(s)},o&&function(){a&&u.next(s),u.complete()}))}}function Be(e){return e<=0?function(){return xe}:S(function(t,r){var n=0;t.subscribe(y(r,function(o){++n<=e&&(r.next(o),e<=n&&r.complete())}))})}function Fe(e,t){return t===void 0&&(t=_),e=e!=null?e:Qt,S(function(r,n){var o,i=!0;r.subscribe(y(n,function(u){var a=t(u);(i||!e(o,a))&&(i=!1,o=a,n.next(u))}))})}function Qt(e,t){return e===t}function Zt(){return S(function(e,t){var r,n=!1;e.subscribe(y(t,function(o){var i=r;r=o,n&&t.next([i,o]),n=!0}))})}function ae(e,t){return S(Xt(e,t,arguments.length>=2,!0))}function De(e){return Wt(function(t,r){return e<=r})}function Ge(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];var r=U(e);return S(function(n,o){(r?Re(e,n,r):Re(e,n)).subscribe(o)})}function ce(e,t){return S(function(r,n){var o=null,i=0,u=!1,a=function(){return u&&!o&&n.complete()};r.subscribe(y(n,function(s){o==null||o.unsubscribe();var c=0,l=i++;k(e(s,l)).subscribe(o=y(n,function(d){return n.next(t?t(s,d,l,c++):d)},function(){o=null,a()}))},function(){u=!0,a()}))})}function er(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];var r=Ce(e);return S(function(n,o){for(var i=e.length,u=new Array(i),a=e.map(function(){return!1}),s=!1,c=function(d){k(e[d]).subscribe(y(o,function(m){u[d]=m,!s&&!a[d]&&(a[d]=!0,(s=a.every(_))&&(a=null))},ee))},l=0;l<i;l++)c(l);n.subscribe(y(o,function(d){if(s){var m=O([d],P(u));o.next(r?r.apply(void 0,O([],P(m))):m)}}))})}function le(){return g.exports.createContext(new Proxy({},{get(){throw new Error("Missing Context dependencies")}}))}function tr(e,t,r){const n=g.exports.useMemo(()=>new ue,r);return g.exports.useEffect(()=>{const o=n.pipe(er(...t)).subscribe(i=>{e(...i)});return()=>o.unsubscribe()},r),o=>()=>n.next(o)}const He="RxReactNoValue";function $(e){const t=g.exports.useRef(null);let r=He,n=!1;if(t.current!==e&&(t.current=e,n=!0,e.subscribe(u=>r=u).unsubscribe(),r===He))throw Nt(e);const[o,i]=g.exports.useState(r);return g.exports.useEffect(()=>{const u=e.subscribe(i);return()=>u.unsubscribe()},[e]),n?r:o}class rr{constructor(){v(this,"contents$");v(this,"candidates");this.contents$=new V(null),this.candidates=E.reduce((t,r)=>(t[r]=new V(!1),t),{})}}class fe{constructor(t){v(this,"occurrences");const r=B(...t.map(n=>n.contents$.pipe(J(o=>o===null?A([1,0]):B(A([o,1]),n.contents$.pipe(De(1),Be(1),w(()=>[o,-1])))))));this.occurrences=E.reduce((n,o)=>Object.assign(n,{[o]:r.pipe(ae((i,[u,a])=>u===o?i+a:i,0))}),{})}}class nr{constructor(t,r,n){v(this,"gridCell");v(this,"contents$");v(this,"candidates");v(this,"isLocked");v(this,"slices");this.gridCell=t,this.slices=r,this.contents$=t.contents$.pipe(ce(o=>o===null?A(null):L([A(o),Ye(r,o).pipe(w(i=>Math.max(...i)===1))]))),this.candidates=E.reduce((o,i)=>Object.assign(o,{[i]:t.candidates[i].pipe(ce(u=>u?Ye(r,i).pipe(w(a=>Math.max(...a)===0)):A(null)))}),{}),this.isLocked=n}toggleContents(t){this.gridCell.contents$.next(this.gridCell.contents$.value===t?null:t)}toggleCandidate(t){this.gridCell.candidates[t].next(!this.gridCell.candidates[t].value)}}function Ye(e,t){return L(e.map(r=>r.occurrences[t]))}const or=[0,3,6,27,30,33,54,57,60];class ir{constructor(t){v(this,"cells");v(this,"isEmpty$");v(this,"isValid$");v(this,"isSolved$");v(this,"gridCells");this.gridCells=Array.from({length:81}).map(()=>new rr),t&&t.forEach((s,c)=>this.gridCells[c].contents$.next(s));const r=E.map(s=>new fe(this.gridCells.slice(s*9-9,s*9))),n=E.map(s=>new fe(lr(s-1).map(c=>this.gridCells[c]))),o=or.map(s=>new fe(dr(s).map(c=>this.gridCells[c])));this.cells=Array.from({length:81}).map((s,c)=>new nr(this.gridCells[c],[r[sr(c)],n[cr(c)],o[fr(c)]],!!(t==null?void 0:t[c])));const i=this.gridCells.map(s=>s.contents$.pipe(J(c=>c===null?A(0):B(A(1),s.contents$.pipe(De(1),Be(1),w(()=>-1)))))),u=B(...i).pipe(ae((s,c)=>s+c,0));this.isEmpty$=u.pipe(w(s=>s===0));const a=B(...[...r,...n,...o].flatMap(s=>E.map(c=>s.occurrences[c].pipe(Ge(0),Fe(),Zt())))).pipe(ae((s,[c,l])=>l>c&&l>1?s+1:l<c&&l>0?s-1:s,0),Fe(),Ge(0));this.isValid$=a.pipe(w(s=>s===0)),this.isSolved$=L([u,this.isValid$]).pipe(w(([s,c])=>s===81&&c))}getContents(){return this.gridCells.map(t=>t.contents$.value)}}function ur(e){return Math.floor(e/9)*9}function sr(e){return Math.floor(ur(e)/9)}function ar(e){return e%9}function cr(e){return ar(e)}function lr(e){const t=e%9;return Array.from({length:9}).map((r,n)=>t+n*9)}function Ke(e){return Math.floor(e/27)*27+e%9-e%3}function fr(e){const t=Ke(e);return t<9?Math.floor(t/3):t<36?Math.floor(3+(t-27)/3):Math.floor(6+(t-54)/3)}function dr(e){const t=Ke(e);return[t,t+1,t+2,t+9,t+10,t+11,t+18,t+19,t+20]}const E=[1,2,3,4,5,6,7,8,9];function ze(e){return new ir(e)}class hr{constructor(){v(this,"status$");v(this,"game$");v(this,"canStart$");this.status$=new V(I.Creating),this.game$=new V(ze()),this.canStart$=this.game$.pipe(ce(t=>L([t.isEmpty$,t.isValid$])),w(([t,r])=>!t&&r))}startGame(){const t=this.game$.value.getContents();this.game$.next(ze(t)),this.status$.next(I.Solving)}}var I;(function(e){e[e.Creating=0]="Creating",e[e.Solving=1]="Solving",e[e.Solved=2]="Solved"})(I||(I={}));function pr(){return new hr}const h=ve.exports.jsx,de=ve.exports.jsxs;let qe={enable(){}};navigator.userAgent.includes("jsdom")||(qe=new ot);const Je=le();function vr(){const{app:e}=g.exports.useContext(Je),t=$(e.status$),r=$(e.canStart$),n=t===I.Creating;function o(){e.startGame(),qe.enable()}return h("div",{className:"ButtonBar",children:n&&h("button",{disabled:!r,onClick:o,children:"Start"})})}const We=le();function mr(){const{selectedNumber$:e}=g.exports.useContext(We),t=$(e);return de("div",{className:"NumberPicker",children:[h("div",{style:{"--selected":t},className:"--Selection","data-testid":"number-picker-selection"}),h("ul",{className:"--Values",children:E.map(r=>h("li",{onClick:()=>e.next(r),style:{"--value":r},children:r},r))})]})}const Xe=le();var Qe;(function(e){e[e.Click=0]="Click",e[e.DblClick=1]="DblClick"})(Qe||(Qe={}));function yr(){const{selectedNumber$:e,sudokuGrid:t,app:r}=g.exports.useContext(Xe),n=g.exports.useMemo(()=>t.map(o=>({highlightCell$:L([o.contents$,e]).pipe(w(([i,u])=>!!i&&i[0]===u)),highlightCandidate:E.reduce((i,u)=>Object.assign(i,{[u]:L([o.candidates[u],e]).pipe(w(([a,s])=>a!==null&&u===s))}),{})})),[t]);return h("div",{className:"SudokuGrid","data-testid":"sudoku-grid",children:t.map((o,i)=>h(br,{cell:o,selectedNumber$:e,app:r,highlights:n[i]},i))})}function br({cell:e,selectedNumber$:t,app:r,highlights:n}){const[o,i]=$(e.contents$)||[null,!0],u=$(n.highlightCell$),a=tr((s,c,l)=>{e.isLocked||(l===I.Creating&&s===0||l===I.Solving&&s===1?e.toggleContents(c):l===I.Solving&&s===0&&e.toggleCandidate(c))},[t,r.status$],[e,e.isLocked]);return de("div",{className:`--Cell ${e.isLocked?"-Locked":""} ${u?"-Highlight":""} ${o?`-ShowingContents ${i?"-Valid":"-Invalid"}`:"-ShowingCandidates"}`,onClick:a(0),onDoubleClick:a(1),children:[h("div",{className:"--Candidates",children:E.map(s=>h(gr,{candidate:s,status$:e.candidates[s],isHighlighted$:n.highlightCandidate[s]},s))}),h("div",{className:"--Contents",children:o})]})}function gr({candidate:e,status$:t,isHighlighted$:r}){const n=$(t),o=$(r);return h("div",{className:`--Candidate ${o?"-Highlight":""} ${n!==null?n?"-Valid":"-Invalid":""}`,children:n!==null?e:" "})}function Sr(){const e=g.exports.useMemo(()=>new V(1),[]),t=g.exports.useMemo(()=>pr(),[]),r=$(t.game$);return de("div",{className:"SudokuApp",children:[h(Xe.Provider,{value:{selectedNumber$:e,app:t,sudokuGrid:r.cells},children:h(yr,{})}),h(We.Provider,{value:{selectedNumber$:e},children:h(mr,{})}),h(Je.Provider,{value:{app:t},children:h(vr,{})})]})}it.exports.render(h(Sr,{}),document.getElementById("root"));
