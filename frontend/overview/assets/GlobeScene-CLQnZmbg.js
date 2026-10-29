import{r as ie,bM as rS,ah as Te,bN as sS,bO as oS,bP as aS,bQ as _u,bR as lS,bS as yu,bT as cS}from"./index-Bs_ncZu6.js";/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const nl="169",uS={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},hS={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Gv=0,jd=1,Wv=2,fS=3,Xv=0,lh=1,Ta=2,Ti=3,mr=0,In=1,ri=2,pr=0,ws=1,Fa=2,Zd=3,Jd=4,Yv=5,kr=100,qv=101,jv=102,Zv=103,Jv=104,Kv=200,Qv=201,$v=202,e_=203,xu=204,Su=205,t_=206,n_=207,i_=208,r_=209,s_=210,o_=211,a_=212,l_=213,c_=214,Mu=0,wu=1,Eu=2,Rs=3,Au=4,Tu=5,bu=6,Cu=7,il=0,u_=1,h_=2,qi=0,f_=1,d_=2,p_=3,dp=4,m_=5,g_=6,v_=7,Kd="attached",__="detached",ch=300,gr=301,Vr=302,Oa=303,Ba=304,No=306,Ps=1e3,_i=1001,za=1002,dn=1003,pp=1004,dS=1004,wo=1005,pS=1005,rn=1006,ba=1007,mS=1007,Xi=1008,gS=1008,Ci=1009,mp=1010,gp=1011,Po=1012,uh=1013,vr=1014,qn=1015,Fo=1016,hh=1017,fh=1018,Is=1020,vp=35902,_p=1021,yp=1022,Pn=1023,xp=1024,Sp=1025,Es=1026,Ls=1027,dh=1028,rl=1029,Mp=1030,ph=1031,vS=1032,mh=1033,Ca=33776,Ra=33777,Pa=33778,Ia=33779,Ru=35840,Pu=35841,Iu=35842,Lu=35843,Du=36196,Uu=37492,Nu=37496,Fu=37808,Ou=37809,Bu=37810,zu=37811,ku=37812,Hu=37813,Vu=37814,Gu=37815,Wu=37816,Xu=37817,Yu=37818,qu=37819,ju=37820,Zu=37821,La=36492,Ju=36494,Ku=36495,wp=36283,Qu=36284,$u=36285,eh=36286,y_=2200,x_=2201,S_=2202,ka=2300,th=2301,pu=2302,ys=2400,xs=2401,Ha=2402,gh=2500,Ep=2501,_S=0,yS=1,xS=2,M_=3200,w_=3201,SS=3202,MS=3203,Wr=0,E_=1,hr="",Xn="srgb",yr="srgb-linear",vh="display-p3",sl="display-p3-linear",Va="linear",zt="srgb",Ga="rec709",Wa="p3",wS=0,gs=7680,ES=7681,AS=7682,TS=7683,bS=34055,CS=34056,RS=5386,PS=512,IS=513,LS=514,DS=515,US=516,NS=517,FS=518,Qd=519,A_=512,T_=513,b_=514,Ap=515,C_=516,R_=517,P_=518,I_=519,Xa=35044,OS=35048,BS=35040,zS=35045,kS=35049,HS=35041,VS=35046,GS=35050,WS=35042,XS="100",$d="300 es",Yi=2e3,Ya=2001;class Ji{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const i=this._listeners[e];if(i!==void 0){const s=i.indexOf(t);s!==-1&&i.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let s=0,a=i.length;s<a;s++)i[s].call(this,e);e.target=null}}}const bn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let zg=1234567;const As=Math.PI/180,Io=180/Math.PI;function oi(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(bn[r&255]+bn[r>>8&255]+bn[r>>16&255]+bn[r>>24&255]+"-"+bn[e&255]+bn[e>>8&255]+"-"+bn[e>>16&15|64]+bn[e>>24&255]+"-"+bn[t&63|128]+bn[t>>8&255]+"-"+bn[t>>16&255]+bn[t>>24&255]+bn[n&255]+bn[n>>8&255]+bn[n>>16&255]+bn[n>>24&255]).toLowerCase()}function jt(r,e,t){return Math.max(e,Math.min(t,r))}function Tp(r,e){return(r%e+e)%e}function YS(r,e,t,n,i){return n+(r-e)*(i-n)/(t-e)}function qS(r,e,t){return r!==e?(t-r)/(e-r):0}function Da(r,e,t){return(1-t)*r+t*e}function jS(r,e,t,n){return Da(r,e,1-Math.exp(-t*n))}function ZS(r,e=1){return e-Math.abs(Tp(r,e*2)-e)}function JS(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*(3-2*r))}function KS(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*r*(r*(r*6-15)+10))}function QS(r,e){return r+Math.floor(Math.random()*(e-r+1))}function $S(r,e){return r+Math.random()*(e-r)}function eM(r){return r*(.5-Math.random())}function tM(r){r!==void 0&&(zg=r);let e=zg+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function nM(r){return r*As}function iM(r){return r*Io}function rM(r){return(r&r-1)===0&&r!==0}function sM(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function oM(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function aM(r,e,t,n,i){const s=Math.cos,a=Math.sin,c=s(t/2),u=a(t/2),h=s((e+n)/2),f=a((e+n)/2),p=s((e-n)/2),m=a((e-n)/2),g=s((n-e)/2),y=a((n-e)/2);switch(i){case"XYX":r.set(c*f,u*p,u*m,c*h);break;case"YZY":r.set(u*m,c*f,u*p,c*h);break;case"ZXZ":r.set(u*p,u*m,c*f,c*h);break;case"XZX":r.set(c*f,u*y,u*g,c*h);break;case"YXY":r.set(u*g,c*f,u*y,c*h);break;case"ZYZ":r.set(u*y,u*g,c*f,c*h);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function zn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function pt(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}const L_={DEG2RAD:As,RAD2DEG:Io,generateUUID:oi,clamp:jt,euclideanModulo:Tp,mapLinear:YS,inverseLerp:qS,lerp:Da,damp:jS,pingpong:ZS,smoothstep:JS,smootherstep:KS,randInt:QS,randFloat:$S,randFloatSpread:eM,seededRandom:tM,degToRad:nM,radToDeg:iM,isPowerOfTwo:rM,ceilPowerOfTwo:sM,floorPowerOfTwo:oM,setQuaternionFromProperEuler:aM,normalize:pt,denormalize:zn};class pe{constructor(e=0,t=0){pe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(jt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*i+e.x,this.y=s*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class dt{constructor(e,t,n,i,s,a,c,u,h){dt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,c,u,h)}set(e,t,n,i,s,a,c,u,h){const f=this.elements;return f[0]=e,f[1]=i,f[2]=c,f[3]=t,f[4]=s,f[5]=u,f[6]=n,f[7]=a,f[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,a=n[0],c=n[3],u=n[6],h=n[1],f=n[4],p=n[7],m=n[2],g=n[5],y=n[8],M=i[0],x=i[3],_=i[6],E=i[1],w=i[4],T=i[7],U=i[2],P=i[5],L=i[8];return s[0]=a*M+c*E+u*U,s[3]=a*x+c*w+u*P,s[6]=a*_+c*T+u*L,s[1]=h*M+f*E+p*U,s[4]=h*x+f*w+p*P,s[7]=h*_+f*T+p*L,s[2]=m*M+g*E+y*U,s[5]=m*x+g*w+y*P,s[8]=m*_+g*T+y*L,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],c=e[5],u=e[6],h=e[7],f=e[8];return t*a*f-t*c*h-n*s*f+n*c*u+i*s*h-i*a*u}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],c=e[5],u=e[6],h=e[7],f=e[8],p=f*a-c*h,m=c*u-f*s,g=h*s-a*u,y=t*p+n*m+i*g;if(y===0)return this.set(0,0,0,0,0,0,0,0,0);const M=1/y;return e[0]=p*M,e[1]=(i*h-f*n)*M,e[2]=(c*n-i*a)*M,e[3]=m*M,e[4]=(f*t-i*u)*M,e[5]=(i*s-c*t)*M,e[6]=g*M,e[7]=(n*u-h*t)*M,e[8]=(a*t-n*s)*M,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,a,c){const u=Math.cos(s),h=Math.sin(s);return this.set(n*u,n*h,-n*(u*a+h*c)+a+e,-i*h,i*u,-i*(-h*a+u*c)+c+t,0,0,1),this}scale(e,t){return this.premultiply(qf.makeScale(e,t)),this}rotate(e){return this.premultiply(qf.makeRotation(-e)),this}translate(e,t){return this.premultiply(qf.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const qf=new dt;function D_(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}const lM={Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array};function Eo(r,e){return new lM[r](e)}function qa(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function U_(){const r=qa("canvas");return r.style.display="block",r}const kg={};function mu(r){r in kg||(kg[r]=!0,console.warn(r))}function cM(r,e,t){return new Promise(function(n,i){function s(){switch(r.clientWaitSync(e,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:i();break;case r.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}function uM(r){const e=r.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function hM(r){const e=r.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Hg=new dt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Vg=new dt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),ca={[yr]:{transfer:Va,primaries:Ga,luminanceCoefficients:[.2126,.7152,.0722],toReference:r=>r,fromReference:r=>r},[Xn]:{transfer:zt,primaries:Ga,luminanceCoefficients:[.2126,.7152,.0722],toReference:r=>r.convertSRGBToLinear(),fromReference:r=>r.convertLinearToSRGB()},[sl]:{transfer:Va,primaries:Wa,luminanceCoefficients:[.2289,.6917,.0793],toReference:r=>r.applyMatrix3(Vg),fromReference:r=>r.applyMatrix3(Hg)},[vh]:{transfer:zt,primaries:Wa,luminanceCoefficients:[.2289,.6917,.0793],toReference:r=>r.convertSRGBToLinear().applyMatrix3(Vg),fromReference:r=>r.applyMatrix3(Hg).convertLinearToSRGB()}},fM=new Set([yr,sl]),Dt={enabled:!0,_workingColorSpace:yr,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(r){if(!fM.has(r))throw new Error(`Unsupported working color space, "${r}".`);this._workingColorSpace=r},convert:function(r,e,t){if(this.enabled===!1||e===t||!e||!t)return r;const n=ca[e].toReference,i=ca[t].fromReference;return i(n(r))},fromWorkingColorSpace:function(r,e){return this.convert(r,this._workingColorSpace,e)},toWorkingColorSpace:function(r,e){return this.convert(r,e,this._workingColorSpace)},getPrimaries:function(r){return ca[r].primaries},getTransfer:function(r){return r===hr?Va:ca[r].transfer},getLuminanceCoefficients:function(r,e=this._workingColorSpace){return r.fromArray(ca[e].luminanceCoefficients)}};function Ro(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function jf(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}let eo;class N_{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{eo===void 0&&(eo=qa("canvas")),eo.width=e.width,eo.height=e.height;const n=eo.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=eo}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=qa("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let a=0;a<s.length;a++)s[a]=Ro(s[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Ro(t[n]/255)*255):t[n]=Ro(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let dM=0;class Ss{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:dM++}),this.uuid=oi(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let a=0,c=i.length;a<c;a++)i[a].isDataTexture?s.push(Zf(i[a].image)):s.push(Zf(i[a]))}else s=Zf(i);n.url=s}return t||(e.images[this.uuid]=n),n}}function Zf(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?N_.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let pM=0;class Zt extends Ji{constructor(e=Zt.DEFAULT_IMAGE,t=Zt.DEFAULT_MAPPING,n=_i,i=_i,s=rn,a=Xi,c=Pn,u=Ci,h=Zt.DEFAULT_ANISOTROPY,f=hr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:pM++}),this.uuid=oi(),this.name="",this.source=new Ss(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=a,this.anisotropy=h,this.format=c,this.internalFormat=null,this.type=u,this.offset=new pe(0,0),this.repeat=new pe(1,1),this.center=new pe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new dt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ch)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ps:e.x=e.x-Math.floor(e.x);break;case _i:e.x=e.x<0?0:1;break;case za:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ps:e.y=e.y-Math.floor(e.y);break;case _i:e.y=e.y<0?0:1;break;case za:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Zt.DEFAULT_IMAGE=null;Zt.DEFAULT_MAPPING=ch;Zt.DEFAULT_ANISOTROPY=1;class xt{constructor(e=0,t=0,n=0,i=1){xt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s;const u=e.elements,h=u[0],f=u[4],p=u[8],m=u[1],g=u[5],y=u[9],M=u[2],x=u[6],_=u[10];if(Math.abs(f-m)<.01&&Math.abs(p-M)<.01&&Math.abs(y-x)<.01){if(Math.abs(f+m)<.1&&Math.abs(p+M)<.1&&Math.abs(y+x)<.1&&Math.abs(h+g+_-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const w=(h+1)/2,T=(g+1)/2,U=(_+1)/2,P=(f+m)/4,L=(p+M)/4,O=(y+x)/4;return w>T&&w>U?w<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(w),i=P/n,s=L/n):T>U?T<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(T),n=P/i,s=O/i):U<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(U),n=L/s,i=O/s),this.set(n,i,s,t),this}let E=Math.sqrt((x-y)*(x-y)+(p-M)*(p-M)+(m-f)*(m-f));return Math.abs(E)<.001&&(E=1),this.x=(x-y)/E,this.y=(p-M)/E,this.z=(m-f)/E,this.w=Math.acos((h+g+_-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class F_ extends Ji{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new xt(0,0,e,t),this.scissorTest=!1,this.viewport=new xt(0,0,e,t);const i={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:rn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const s=new Zt(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let c=0;c<a;c++)this.textures[c]=s.clone(),this.textures[c].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,i=e.textures.length;n<i;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Ss(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ri extends F_{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class _h extends Zt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=dn,this.minFilter=dn,this.wrapR=_i,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class mM extends Ri{constructor(e=1,t=1,n=1,i={}){super(e,t,i),this.isWebGLArrayRenderTarget=!0,this.depth=n,this.texture=new _h(null,e,t,n),this.texture.isRenderTargetTexture=!0}}class bp extends Zt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=dn,this.minFilter=dn,this.wrapR=_i,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class gM extends Ri{constructor(e=1,t=1,n=1,i={}){super(e,t,i),this.isWebGL3DRenderTarget=!0,this.depth=n,this.texture=new bp(null,e,t,n),this.texture.isRenderTargetTexture=!0}}class jn{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,a,c){let u=n[i+0],h=n[i+1],f=n[i+2],p=n[i+3];const m=s[a+0],g=s[a+1],y=s[a+2],M=s[a+3];if(c===0){e[t+0]=u,e[t+1]=h,e[t+2]=f,e[t+3]=p;return}if(c===1){e[t+0]=m,e[t+1]=g,e[t+2]=y,e[t+3]=M;return}if(p!==M||u!==m||h!==g||f!==y){let x=1-c;const _=u*m+h*g+f*y+p*M,E=_>=0?1:-1,w=1-_*_;if(w>Number.EPSILON){const U=Math.sqrt(w),P=Math.atan2(U,_*E);x=Math.sin(x*P)/U,c=Math.sin(c*P)/U}const T=c*E;if(u=u*x+m*T,h=h*x+g*T,f=f*x+y*T,p=p*x+M*T,x===1-c){const U=1/Math.sqrt(u*u+h*h+f*f+p*p);u*=U,h*=U,f*=U,p*=U}}e[t]=u,e[t+1]=h,e[t+2]=f,e[t+3]=p}static multiplyQuaternionsFlat(e,t,n,i,s,a){const c=n[i],u=n[i+1],h=n[i+2],f=n[i+3],p=s[a],m=s[a+1],g=s[a+2],y=s[a+3];return e[t]=c*y+f*p+u*g-h*m,e[t+1]=u*y+f*m+h*p-c*g,e[t+2]=h*y+f*g+c*m-u*p,e[t+3]=f*y-c*p-u*m-h*g,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,s=e._z,a=e._order,c=Math.cos,u=Math.sin,h=c(n/2),f=c(i/2),p=c(s/2),m=u(n/2),g=u(i/2),y=u(s/2);switch(a){case"XYZ":this._x=m*f*p+h*g*y,this._y=h*g*p-m*f*y,this._z=h*f*y+m*g*p,this._w=h*f*p-m*g*y;break;case"YXZ":this._x=m*f*p+h*g*y,this._y=h*g*p-m*f*y,this._z=h*f*y-m*g*p,this._w=h*f*p+m*g*y;break;case"ZXY":this._x=m*f*p-h*g*y,this._y=h*g*p+m*f*y,this._z=h*f*y+m*g*p,this._w=h*f*p-m*g*y;break;case"ZYX":this._x=m*f*p-h*g*y,this._y=h*g*p+m*f*y,this._z=h*f*y-m*g*p,this._w=h*f*p+m*g*y;break;case"YZX":this._x=m*f*p+h*g*y,this._y=h*g*p+m*f*y,this._z=h*f*y-m*g*p,this._w=h*f*p-m*g*y;break;case"XZY":this._x=m*f*p-h*g*y,this._y=h*g*p-m*f*y,this._z=h*f*y+m*g*p,this._w=h*f*p+m*g*y;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],s=t[8],a=t[1],c=t[5],u=t[9],h=t[2],f=t[6],p=t[10],m=n+c+p;if(m>0){const g=.5/Math.sqrt(m+1);this._w=.25/g,this._x=(f-u)*g,this._y=(s-h)*g,this._z=(a-i)*g}else if(n>c&&n>p){const g=2*Math.sqrt(1+n-c-p);this._w=(f-u)/g,this._x=.25*g,this._y=(i+a)/g,this._z=(s+h)/g}else if(c>p){const g=2*Math.sqrt(1+c-n-p);this._w=(s-h)/g,this._x=(i+a)/g,this._y=.25*g,this._z=(u+f)/g}else{const g=2*Math.sqrt(1+p-n-c);this._w=(a-i)/g,this._x=(s+h)/g,this._y=(u+f)/g,this._z=.25*g}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(jt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,s=e._z,a=e._w,c=t._x,u=t._y,h=t._z,f=t._w;return this._x=n*f+a*c+i*h-s*u,this._y=i*f+a*u+s*c-n*h,this._z=s*f+a*h+n*u-i*c,this._w=a*f-n*c-i*u-s*h,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,s=this._z,a=this._w;let c=a*e._w+n*e._x+i*e._y+s*e._z;if(c<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,c=-c):this.copy(e),c>=1)return this._w=a,this._x=n,this._y=i,this._z=s,this;const u=1-c*c;if(u<=Number.EPSILON){const g=1-t;return this._w=g*a+t*this._w,this._x=g*n+t*this._x,this._y=g*i+t*this._y,this._z=g*s+t*this._z,this.normalize(),this}const h=Math.sqrt(u),f=Math.atan2(h,c),p=Math.sin((1-t)*f)/h,m=Math.sin(t*f)/h;return this._w=a*p+this._w*m,this._x=n*p+this._x*m,this._y=i*p+this._y*m,this._z=s*p+this._z*m,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class D{constructor(e=0,t=0,n=0){D.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Gg.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Gg.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,s=e.x,a=e.y,c=e.z,u=e.w,h=2*(a*i-c*n),f=2*(c*t-s*i),p=2*(s*n-a*t);return this.x=t+u*h+a*p-c*f,this.y=n+u*f+c*h-s*p,this.z=i+u*p+s*f-a*h,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,s=e.z,a=t.x,c=t.y,u=t.z;return this.x=i*u-s*c,this.y=s*a-n*u,this.z=n*c-i*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Jf.copy(this).projectOnVector(e),this.sub(Jf)}reflect(e){return this.sub(Jf.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(jt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Jf=new D,Gg=new jn;class pn{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(wi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(wi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=wi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,c=s.count;a<c;a++)e.isMesh===!0?e.getVertexPosition(a,wi):wi.fromBufferAttribute(s,a),wi.applyMatrix4(e.matrixWorld),this.expandByPoint(wi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),gc.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),gc.copy(n.boundingBox)),gc.applyMatrix4(e.matrixWorld),this.union(gc)}const i=e.children;for(let s=0,a=i.length;s<a;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,wi),wi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ua),vc.subVectors(this.max,ua),to.subVectors(e.a,ua),no.subVectors(e.b,ua),io.subVectors(e.c,ua),Ir.subVectors(no,to),Lr.subVectors(io,no),is.subVectors(to,io);let t=[0,-Ir.z,Ir.y,0,-Lr.z,Lr.y,0,-is.z,is.y,Ir.z,0,-Ir.x,Lr.z,0,-Lr.x,is.z,0,-is.x,-Ir.y,Ir.x,0,-Lr.y,Lr.x,0,-is.y,is.x,0];return!Kf(t,to,no,io,vc)||(t=[1,0,0,0,1,0,0,0,1],!Kf(t,to,no,io,vc))?!1:(_c.crossVectors(Ir,Lr),t=[_c.x,_c.y,_c.z],Kf(t,to,no,io,vc))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,wi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(wi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(sr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),sr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),sr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),sr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),sr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),sr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),sr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),sr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(sr),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const sr=[new D,new D,new D,new D,new D,new D,new D,new D],wi=new D,gc=new pn,to=new D,no=new D,io=new D,Ir=new D,Lr=new D,is=new D,ua=new D,vc=new D,_c=new D,rs=new D;function Kf(r,e,t,n,i){for(let s=0,a=r.length-3;s<=a;s+=3){rs.fromArray(r,s);const c=i.x*Math.abs(rs.x)+i.y*Math.abs(rs.y)+i.z*Math.abs(rs.z),u=e.dot(rs),h=t.dot(rs),f=n.dot(rs);if(Math.max(-Math.max(u,h,f),Math.min(u,h,f))>c)return!1}return!0}const vM=new pn,ha=new D,Qf=new D;class mn{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):vM.setFromPoints(e).getCenter(n);let i=0;for(let s=0,a=e.length;s<a;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ha.subVectors(e,this.center);const t=ha.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(ha,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Qf.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ha.copy(e.center).add(Qf)),this.expandByPoint(ha.copy(e.center).sub(Qf))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const or=new D,$f=new D,yc=new D,Dr=new D,ed=new D,xc=new D,td=new D;class Oo{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,or)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=or.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(or.copy(this.origin).addScaledVector(this.direction,t),or.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){$f.copy(e).add(t).multiplyScalar(.5),yc.copy(t).sub(e).normalize(),Dr.copy(this.origin).sub($f);const s=e.distanceTo(t)*.5,a=-this.direction.dot(yc),c=Dr.dot(this.direction),u=-Dr.dot(yc),h=Dr.lengthSq(),f=Math.abs(1-a*a);let p,m,g,y;if(f>0)if(p=a*u-c,m=a*c-u,y=s*f,p>=0)if(m>=-y)if(m<=y){const M=1/f;p*=M,m*=M,g=p*(p+a*m+2*c)+m*(a*p+m+2*u)+h}else m=s,p=Math.max(0,-(a*m+c)),g=-p*p+m*(m+2*u)+h;else m=-s,p=Math.max(0,-(a*m+c)),g=-p*p+m*(m+2*u)+h;else m<=-y?(p=Math.max(0,-(-a*s+c)),m=p>0?-s:Math.min(Math.max(-s,-u),s),g=-p*p+m*(m+2*u)+h):m<=y?(p=0,m=Math.min(Math.max(-s,-u),s),g=m*(m+2*u)+h):(p=Math.max(0,-(a*s+c)),m=p>0?s:Math.min(Math.max(-s,-u),s),g=-p*p+m*(m+2*u)+h);else m=a>0?-s:s,p=Math.max(0,-(a*m+c)),g=-p*p+m*(m+2*u)+h;return n&&n.copy(this.origin).addScaledVector(this.direction,p),i&&i.copy($f).addScaledVector(yc,m),g}intersectSphere(e,t){or.subVectors(e.center,this.origin);const n=or.dot(this.direction),i=or.dot(or)-n*n,s=e.radius*e.radius;if(i>s)return null;const a=Math.sqrt(s-i),c=n-a,u=n+a;return u<0?null:c<0?this.at(u,t):this.at(c,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,a,c,u;const h=1/this.direction.x,f=1/this.direction.y,p=1/this.direction.z,m=this.origin;return h>=0?(n=(e.min.x-m.x)*h,i=(e.max.x-m.x)*h):(n=(e.max.x-m.x)*h,i=(e.min.x-m.x)*h),f>=0?(s=(e.min.y-m.y)*f,a=(e.max.y-m.y)*f):(s=(e.max.y-m.y)*f,a=(e.min.y-m.y)*f),n>a||s>i||((s>n||isNaN(n))&&(n=s),(a<i||isNaN(i))&&(i=a),p>=0?(c=(e.min.z-m.z)*p,u=(e.max.z-m.z)*p):(c=(e.max.z-m.z)*p,u=(e.min.z-m.z)*p),n>u||c>i)||((c>n||n!==n)&&(n=c),(u<i||i!==i)&&(i=u),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,or)!==null}intersectTriangle(e,t,n,i,s){ed.subVectors(t,e),xc.subVectors(n,e),td.crossVectors(ed,xc);let a=this.direction.dot(td),c;if(a>0){if(i)return null;c=1}else if(a<0)c=-1,a=-a;else return null;Dr.subVectors(this.origin,e);const u=c*this.direction.dot(xc.crossVectors(Dr,xc));if(u<0)return null;const h=c*this.direction.dot(ed.cross(Dr));if(h<0||u+h>a)return null;const f=-c*Dr.dot(td);return f<0?null:this.at(f/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class rt{constructor(e,t,n,i,s,a,c,u,h,f,p,m,g,y,M,x){rt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,c,u,h,f,p,m,g,y,M,x)}set(e,t,n,i,s,a,c,u,h,f,p,m,g,y,M,x){const _=this.elements;return _[0]=e,_[4]=t,_[8]=n,_[12]=i,_[1]=s,_[5]=a,_[9]=c,_[13]=u,_[2]=h,_[6]=f,_[10]=p,_[14]=m,_[3]=g,_[7]=y,_[11]=M,_[15]=x,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new rt().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/ro.setFromMatrixColumn(e,0).length(),s=1/ro.setFromMatrixColumn(e,1).length(),a=1/ro.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,s=e.z,a=Math.cos(n),c=Math.sin(n),u=Math.cos(i),h=Math.sin(i),f=Math.cos(s),p=Math.sin(s);if(e.order==="XYZ"){const m=a*f,g=a*p,y=c*f,M=c*p;t[0]=u*f,t[4]=-u*p,t[8]=h,t[1]=g+y*h,t[5]=m-M*h,t[9]=-c*u,t[2]=M-m*h,t[6]=y+g*h,t[10]=a*u}else if(e.order==="YXZ"){const m=u*f,g=u*p,y=h*f,M=h*p;t[0]=m+M*c,t[4]=y*c-g,t[8]=a*h,t[1]=a*p,t[5]=a*f,t[9]=-c,t[2]=g*c-y,t[6]=M+m*c,t[10]=a*u}else if(e.order==="ZXY"){const m=u*f,g=u*p,y=h*f,M=h*p;t[0]=m-M*c,t[4]=-a*p,t[8]=y+g*c,t[1]=g+y*c,t[5]=a*f,t[9]=M-m*c,t[2]=-a*h,t[6]=c,t[10]=a*u}else if(e.order==="ZYX"){const m=a*f,g=a*p,y=c*f,M=c*p;t[0]=u*f,t[4]=y*h-g,t[8]=m*h+M,t[1]=u*p,t[5]=M*h+m,t[9]=g*h-y,t[2]=-h,t[6]=c*u,t[10]=a*u}else if(e.order==="YZX"){const m=a*u,g=a*h,y=c*u,M=c*h;t[0]=u*f,t[4]=M-m*p,t[8]=y*p+g,t[1]=p,t[5]=a*f,t[9]=-c*f,t[2]=-h*f,t[6]=g*p+y,t[10]=m-M*p}else if(e.order==="XZY"){const m=a*u,g=a*h,y=c*u,M=c*h;t[0]=u*f,t[4]=-p,t[8]=h*f,t[1]=m*p+M,t[5]=a*f,t[9]=g*p-y,t[2]=y*p-g,t[6]=c*f,t[10]=M*p+m}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(_M,e,yM)}lookAt(e,t,n){const i=this.elements;return ni.subVectors(e,t),ni.lengthSq()===0&&(ni.z=1),ni.normalize(),Ur.crossVectors(n,ni),Ur.lengthSq()===0&&(Math.abs(n.z)===1?ni.x+=1e-4:ni.z+=1e-4,ni.normalize(),Ur.crossVectors(n,ni)),Ur.normalize(),Sc.crossVectors(ni,Ur),i[0]=Ur.x,i[4]=Sc.x,i[8]=ni.x,i[1]=Ur.y,i[5]=Sc.y,i[9]=ni.y,i[2]=Ur.z,i[6]=Sc.z,i[10]=ni.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,a=n[0],c=n[4],u=n[8],h=n[12],f=n[1],p=n[5],m=n[9],g=n[13],y=n[2],M=n[6],x=n[10],_=n[14],E=n[3],w=n[7],T=n[11],U=n[15],P=i[0],L=i[4],O=i[8],k=i[12],b=i[1],C=i[5],W=i[9],q=i[13],J=i[2],re=i[6],j=i[10],fe=i[14],z=i[3],ae=i[7],ee=i[11],le=i[15];return s[0]=a*P+c*b+u*J+h*z,s[4]=a*L+c*C+u*re+h*ae,s[8]=a*O+c*W+u*j+h*ee,s[12]=a*k+c*q+u*fe+h*le,s[1]=f*P+p*b+m*J+g*z,s[5]=f*L+p*C+m*re+g*ae,s[9]=f*O+p*W+m*j+g*ee,s[13]=f*k+p*q+m*fe+g*le,s[2]=y*P+M*b+x*J+_*z,s[6]=y*L+M*C+x*re+_*ae,s[10]=y*O+M*W+x*j+_*ee,s[14]=y*k+M*q+x*fe+_*le,s[3]=E*P+w*b+T*J+U*z,s[7]=E*L+w*C+T*re+U*ae,s[11]=E*O+w*W+T*j+U*ee,s[15]=E*k+w*q+T*fe+U*le,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],a=e[1],c=e[5],u=e[9],h=e[13],f=e[2],p=e[6],m=e[10],g=e[14],y=e[3],M=e[7],x=e[11],_=e[15];return y*(+s*u*p-i*h*p-s*c*m+n*h*m+i*c*g-n*u*g)+M*(+t*u*g-t*h*m+s*a*m-i*a*g+i*h*f-s*u*f)+x*(+t*h*p-t*c*g-s*a*p+n*a*g+s*c*f-n*h*f)+_*(-i*c*f-t*u*p+t*c*m+i*a*p-n*a*m+n*u*f)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],c=e[5],u=e[6],h=e[7],f=e[8],p=e[9],m=e[10],g=e[11],y=e[12],M=e[13],x=e[14],_=e[15],E=p*x*h-M*m*h+M*u*g-c*x*g-p*u*_+c*m*_,w=y*m*h-f*x*h-y*u*g+a*x*g+f*u*_-a*m*_,T=f*M*h-y*p*h+y*c*g-a*M*g-f*c*_+a*p*_,U=y*p*u-f*M*u-y*c*m+a*M*m+f*c*x-a*p*x,P=t*E+n*w+i*T+s*U;if(P===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const L=1/P;return e[0]=E*L,e[1]=(M*m*s-p*x*s-M*i*g+n*x*g+p*i*_-n*m*_)*L,e[2]=(c*x*s-M*u*s+M*i*h-n*x*h-c*i*_+n*u*_)*L,e[3]=(p*u*s-c*m*s-p*i*h+n*m*h+c*i*g-n*u*g)*L,e[4]=w*L,e[5]=(f*x*s-y*m*s+y*i*g-t*x*g-f*i*_+t*m*_)*L,e[6]=(y*u*s-a*x*s-y*i*h+t*x*h+a*i*_-t*u*_)*L,e[7]=(a*m*s-f*u*s+f*i*h-t*m*h-a*i*g+t*u*g)*L,e[8]=T*L,e[9]=(y*p*s-f*M*s-y*n*g+t*M*g+f*n*_-t*p*_)*L,e[10]=(a*M*s-y*c*s+y*n*h-t*M*h-a*n*_+t*c*_)*L,e[11]=(f*c*s-a*p*s-f*n*h+t*p*h+a*n*g-t*c*g)*L,e[12]=U*L,e[13]=(f*M*i-y*p*i+y*n*m-t*M*m-f*n*x+t*p*x)*L,e[14]=(y*c*i-a*M*i-y*n*u+t*M*u+a*n*x-t*c*x)*L,e[15]=(a*p*i-f*c*i+f*n*u-t*p*u-a*n*m+t*c*m)*L,this}scale(e){const t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),s=1-n,a=e.x,c=e.y,u=e.z,h=s*a,f=s*c;return this.set(h*a+n,h*c-i*u,h*u+i*c,0,h*c+i*u,f*c+n,f*u-i*a,0,h*u-i*c,f*u+i*a,s*u*u+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,a){return this.set(1,n,s,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,s=t._x,a=t._y,c=t._z,u=t._w,h=s+s,f=a+a,p=c+c,m=s*h,g=s*f,y=s*p,M=a*f,x=a*p,_=c*p,E=u*h,w=u*f,T=u*p,U=n.x,P=n.y,L=n.z;return i[0]=(1-(M+_))*U,i[1]=(g+T)*U,i[2]=(y-w)*U,i[3]=0,i[4]=(g-T)*P,i[5]=(1-(m+_))*P,i[6]=(x+E)*P,i[7]=0,i[8]=(y+w)*L,i[9]=(x-E)*L,i[10]=(1-(m+M))*L,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let s=ro.set(i[0],i[1],i[2]).length();const a=ro.set(i[4],i[5],i[6]).length(),c=ro.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),e.x=i[12],e.y=i[13],e.z=i[14],Ei.copy(this);const h=1/s,f=1/a,p=1/c;return Ei.elements[0]*=h,Ei.elements[1]*=h,Ei.elements[2]*=h,Ei.elements[4]*=f,Ei.elements[5]*=f,Ei.elements[6]*=f,Ei.elements[8]*=p,Ei.elements[9]*=p,Ei.elements[10]*=p,t.setFromRotationMatrix(Ei),n.x=s,n.y=a,n.z=c,this}makePerspective(e,t,n,i,s,a,c=Yi){const u=this.elements,h=2*s/(t-e),f=2*s/(n-i),p=(t+e)/(t-e),m=(n+i)/(n-i);let g,y;if(c===Yi)g=-(a+s)/(a-s),y=-2*a*s/(a-s);else if(c===Ya)g=-a/(a-s),y=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+c);return u[0]=h,u[4]=0,u[8]=p,u[12]=0,u[1]=0,u[5]=f,u[9]=m,u[13]=0,u[2]=0,u[6]=0,u[10]=g,u[14]=y,u[3]=0,u[7]=0,u[11]=-1,u[15]=0,this}makeOrthographic(e,t,n,i,s,a,c=Yi){const u=this.elements,h=1/(t-e),f=1/(n-i),p=1/(a-s),m=(t+e)*h,g=(n+i)*f;let y,M;if(c===Yi)y=(a+s)*p,M=-2*p;else if(c===Ya)y=s*p,M=-1*p;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+c);return u[0]=2*h,u[4]=0,u[8]=0,u[12]=-m,u[1]=0,u[5]=2*f,u[9]=0,u[13]=-g,u[2]=0,u[6]=0,u[10]=M,u[14]=-y,u[3]=0,u[7]=0,u[11]=0,u[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const ro=new D,Ei=new rt,_M=new D(0,0,0),yM=new D(1,1,1),Ur=new D,Sc=new D,ni=new D,Wg=new rt,Xg=new jn;class ai{constructor(e=0,t=0,n=0,i=ai.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,s=i[0],a=i[4],c=i[8],u=i[1],h=i[5],f=i[9],p=i[2],m=i[6],g=i[10];switch(t){case"XYZ":this._y=Math.asin(jt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-f,g),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(m,h),this._z=0);break;case"YXZ":this._x=Math.asin(-jt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(c,g),this._z=Math.atan2(u,h)):(this._y=Math.atan2(-p,s),this._z=0);break;case"ZXY":this._x=Math.asin(jt(m,-1,1)),Math.abs(m)<.9999999?(this._y=Math.atan2(-p,g),this._z=Math.atan2(-a,h)):(this._y=0,this._z=Math.atan2(u,s));break;case"ZYX":this._y=Math.asin(-jt(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(m,g),this._z=Math.atan2(u,s)):(this._x=0,this._z=Math.atan2(-a,h));break;case"YZX":this._z=Math.asin(jt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(-f,h),this._y=Math.atan2(-p,s)):(this._x=0,this._y=Math.atan2(c,g));break;case"XZY":this._z=Math.asin(-jt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(m,h),this._y=Math.atan2(c,s)):(this._x=Math.atan2(-f,g),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Wg.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Wg,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Xg.setFromEuler(this),this.setFromQuaternion(Xg,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ai.DEFAULT_ORDER="XYZ";class Ts{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let xM=0;const Yg=new D,so=new jn,ar=new rt,Mc=new D,fa=new D,SM=new D,MM=new jn,qg=new D(1,0,0),jg=new D(0,1,0),Zg=new D(0,0,1),Jg={type:"added"},wM={type:"removed"},oo={type:"childadded",child:null},nd={type:"childremoved",child:null};class Ct extends Ji{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:xM++}),this.uuid=oi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ct.DEFAULT_UP.clone();const e=new D,t=new ai,n=new jn,i=new D(1,1,1);function s(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new rt},normalMatrix:{value:new dt}}),this.matrix=new rt,this.matrixWorld=new rt,this.matrixAutoUpdate=Ct.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ct.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ts,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return so.setFromAxisAngle(e,t),this.quaternion.multiply(so),this}rotateOnWorldAxis(e,t){return so.setFromAxisAngle(e,t),this.quaternion.premultiply(so),this}rotateX(e){return this.rotateOnAxis(qg,e)}rotateY(e){return this.rotateOnAxis(jg,e)}rotateZ(e){return this.rotateOnAxis(Zg,e)}translateOnAxis(e,t){return Yg.copy(e).applyQuaternion(this.quaternion),this.position.add(Yg.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(qg,e)}translateY(e){return this.translateOnAxis(jg,e)}translateZ(e){return this.translateOnAxis(Zg,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ar.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Mc.copy(e):Mc.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),fa.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ar.lookAt(fa,Mc,this.up):ar.lookAt(Mc,fa,this.up),this.quaternion.setFromRotationMatrix(ar),i&&(ar.extractRotation(i.matrixWorld),so.setFromRotationMatrix(ar),this.quaternion.premultiply(so.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Jg),oo.child=e,this.dispatchEvent(oo),oo.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(wM),nd.child=e,this.dispatchEvent(nd),nd.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ar.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ar.multiply(e.parent.matrixWorld)),e.applyMatrix4(ar),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Jg),oo.child=e,this.dispatchEvent(oo),oo.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fa,e,SM),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fa,MM,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(c=>({boxInitialized:c.boxInitialized,boxMin:c.box.min.toArray(),boxMax:c.box.max.toArray(),sphereInitialized:c.sphereInitialized,sphereRadius:c.sphere.radius,sphereCenter:c.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function s(c,u){return c[u.uuid]===void 0&&(c[u.uuid]=u.toJSON(e)),u.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);const c=this.geometry.parameters;if(c!==void 0&&c.shapes!==void 0){const u=c.shapes;if(Array.isArray(u))for(let h=0,f=u.length;h<f;h++){const p=u[h];s(e.shapes,p)}else s(e.shapes,u)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const c=[];for(let u=0,h=this.material.length;u<h;u++)c.push(s(e.materials,this.material[u]));i.material=c}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let c=0;c<this.children.length;c++)i.children.push(this.children[c].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let c=0;c<this.animations.length;c++){const u=this.animations[c];i.animations.push(s(e.animations,u))}}if(t){const c=a(e.geometries),u=a(e.materials),h=a(e.textures),f=a(e.images),p=a(e.shapes),m=a(e.skeletons),g=a(e.animations),y=a(e.nodes);c.length>0&&(n.geometries=c),u.length>0&&(n.materials=u),h.length>0&&(n.textures=h),f.length>0&&(n.images=f),p.length>0&&(n.shapes=p),m.length>0&&(n.skeletons=m),g.length>0&&(n.animations=g),y.length>0&&(n.nodes=y)}return n.object=i,n;function a(c){const u=[];for(const h in c){const f=c[h];delete f.metadata,u.push(f)}return u}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}Ct.DEFAULT_UP=new D(0,1,0);Ct.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ct.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Ai=new D,lr=new D,id=new D,cr=new D,ao=new D,lo=new D,Kg=new D,rd=new D,sd=new D,od=new D,ad=new xt,ld=new xt,cd=new xt;class Yn{constructor(e=new D,t=new D,n=new D){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),Ai.subVectors(e,t),i.cross(Ai);const s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){Ai.subVectors(i,t),lr.subVectors(n,t),id.subVectors(e,t);const a=Ai.dot(Ai),c=Ai.dot(lr),u=Ai.dot(id),h=lr.dot(lr),f=lr.dot(id),p=a*h-c*c;if(p===0)return s.set(0,0,0),null;const m=1/p,g=(h*u-c*f)*m,y=(a*f-c*u)*m;return s.set(1-g-y,y,g)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,cr)===null?!1:cr.x>=0&&cr.y>=0&&cr.x+cr.y<=1}static getInterpolation(e,t,n,i,s,a,c,u){return this.getBarycoord(e,t,n,i,cr)===null?(u.x=0,u.y=0,"z"in u&&(u.z=0),"w"in u&&(u.w=0),null):(u.setScalar(0),u.addScaledVector(s,cr.x),u.addScaledVector(a,cr.y),u.addScaledVector(c,cr.z),u)}static getInterpolatedAttribute(e,t,n,i,s,a){return ad.setScalar(0),ld.setScalar(0),cd.setScalar(0),ad.fromBufferAttribute(e,t),ld.fromBufferAttribute(e,n),cd.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(ad,s.x),a.addScaledVector(ld,s.y),a.addScaledVector(cd,s.z),a}static isFrontFacing(e,t,n,i){return Ai.subVectors(n,t),lr.subVectors(e,t),Ai.cross(lr).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ai.subVectors(this.c,this.b),lr.subVectors(this.a,this.b),Ai.cross(lr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Yn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Yn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return Yn.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return Yn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Yn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,s=this.c;let a,c;ao.subVectors(i,n),lo.subVectors(s,n),rd.subVectors(e,n);const u=ao.dot(rd),h=lo.dot(rd);if(u<=0&&h<=0)return t.copy(n);sd.subVectors(e,i);const f=ao.dot(sd),p=lo.dot(sd);if(f>=0&&p<=f)return t.copy(i);const m=u*p-f*h;if(m<=0&&u>=0&&f<=0)return a=u/(u-f),t.copy(n).addScaledVector(ao,a);od.subVectors(e,s);const g=ao.dot(od),y=lo.dot(od);if(y>=0&&g<=y)return t.copy(s);const M=g*h-u*y;if(M<=0&&h>=0&&y<=0)return c=h/(h-y),t.copy(n).addScaledVector(lo,c);const x=f*y-g*p;if(x<=0&&p-f>=0&&g-y>=0)return Kg.subVectors(s,i),c=(p-f)/(p-f+(g-y)),t.copy(i).addScaledVector(Kg,c);const _=1/(x+M+m);return a=M*_,c=m*_,t.copy(n).addScaledVector(ao,a).addScaledVector(lo,c)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const O_={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Nr={h:0,s:0,l:0},wc={h:0,s:0,l:0};function ud(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}class Ue{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Xn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Dt.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=Dt.workingColorSpace){return this.r=e,this.g=t,this.b=n,Dt.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=Dt.workingColorSpace){if(e=Tp(e,1),t=jt(t,0,1),n=jt(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=ud(a,s,e+1/3),this.g=ud(a,s,e),this.b=ud(a,s,e-1/3)}return Dt.toWorkingColorSpace(this,i),this}setStyle(e,t=Xn){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=i[1],c=i[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(c))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(c))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(c))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=i[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Xn){const n=O_[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ro(e.r),this.g=Ro(e.g),this.b=Ro(e.b),this}copyLinearToSRGB(e){return this.r=jf(e.r),this.g=jf(e.g),this.b=jf(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Xn){return Dt.fromWorkingColorSpace(Cn.copy(this),e),Math.round(jt(Cn.r*255,0,255))*65536+Math.round(jt(Cn.g*255,0,255))*256+Math.round(jt(Cn.b*255,0,255))}getHexString(e=Xn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Dt.workingColorSpace){Dt.fromWorkingColorSpace(Cn.copy(this),t);const n=Cn.r,i=Cn.g,s=Cn.b,a=Math.max(n,i,s),c=Math.min(n,i,s);let u,h;const f=(c+a)/2;if(c===a)u=0,h=0;else{const p=a-c;switch(h=f<=.5?p/(a+c):p/(2-a-c),a){case n:u=(i-s)/p+(i<s?6:0);break;case i:u=(s-n)/p+2;break;case s:u=(n-i)/p+4;break}u/=6}return e.h=u,e.s=h,e.l=f,e}getRGB(e,t=Dt.workingColorSpace){return Dt.fromWorkingColorSpace(Cn.copy(this),t),e.r=Cn.r,e.g=Cn.g,e.b=Cn.b,e}getStyle(e=Xn){Dt.fromWorkingColorSpace(Cn.copy(this),e);const t=Cn.r,n=Cn.g,i=Cn.b;return e!==Xn?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Nr),this.setHSL(Nr.h+e,Nr.s+t,Nr.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Nr),e.getHSL(wc);const n=Da(Nr.h,wc.h,t),i=Da(Nr.s,wc.s,t),s=Da(Nr.l,wc.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Cn=new Ue;Ue.NAMES=O_;let EM=0;class Ln extends Ji{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:EM++}),this.uuid=oi(),this.name="",this.type="Material",this.blending=ws,this.side=mr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=xu,this.blendDst=Su,this.blendEquation=kr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ue(0,0,0),this.blendAlpha=0,this.depthFunc=Rs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Qd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=gs,this.stencilZFail=gs,this.stencilZPass=gs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==ws&&(n.blending=this.blending),this.side!==mr&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==xu&&(n.blendSrc=this.blendSrc),this.blendDst!==Su&&(n.blendDst=this.blendDst),this.blendEquation!==kr&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Rs&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Qd&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==gs&&(n.stencilFail=this.stencilFail),this.stencilZFail!==gs&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==gs&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){const a=[];for(const c in s){const u=s[c];delete u.metadata,a.push(u)}return a}if(t){const s=i(e.textures),a=i(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Pi extends Ln{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ue(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ai,this.combine=il,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const fr=AM();function AM(){const r=new ArrayBuffer(4),e=new Float32Array(r),t=new Uint32Array(r),n=new Uint32Array(512),i=new Uint32Array(512);for(let u=0;u<256;++u){const h=u-127;h<-27?(n[u]=0,n[u|256]=32768,i[u]=24,i[u|256]=24):h<-14?(n[u]=1024>>-h-14,n[u|256]=1024>>-h-14|32768,i[u]=-h-1,i[u|256]=-h-1):h<=15?(n[u]=h+15<<10,n[u|256]=h+15<<10|32768,i[u]=13,i[u|256]=13):h<128?(n[u]=31744,n[u|256]=64512,i[u]=24,i[u|256]=24):(n[u]=31744,n[u|256]=64512,i[u]=13,i[u|256]=13)}const s=new Uint32Array(2048),a=new Uint32Array(64),c=new Uint32Array(64);for(let u=1;u<1024;++u){let h=u<<13,f=0;for(;!(h&8388608);)h<<=1,f-=8388608;h&=-8388609,f+=947912704,s[u]=h|f}for(let u=1024;u<2048;++u)s[u]=939524096+(u-1024<<13);for(let u=1;u<31;++u)a[u]=u<<23;a[31]=1199570944,a[32]=2147483648;for(let u=33;u<63;++u)a[u]=2147483648+(u-32<<23);a[63]=3347054592;for(let u=1;u<64;++u)u!==32&&(c[u]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:i,mantissaTable:s,exponentTable:a,offsetTable:c}}function Wn(r){Math.abs(r)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),r=jt(r,-65504,65504),fr.floatView[0]=r;const e=fr.uint32View[0],t=e>>23&511;return fr.baseTable[t]+((e&8388607)>>fr.shiftTable[t])}function Ea(r){const e=r>>10;return fr.uint32View[0]=fr.mantissaTable[fr.offsetTable[e]+(r&1023)]+fr.exponentTable[e],fr.floatView[0]}const TM={toHalfFloat:Wn,fromHalfFloat:Ea},tn=new D,Ec=new pe;class Ft{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Xa,this.updateRanges=[],this.gpuType=qn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ec.fromBufferAttribute(this,t),Ec.applyMatrix3(e),this.setXY(t,Ec.x,Ec.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)tn.fromBufferAttribute(this,t),tn.applyMatrix3(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)tn.fromBufferAttribute(this,t),tn.applyMatrix4(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)tn.fromBufferAttribute(this,t),tn.applyNormalMatrix(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)tn.fromBufferAttribute(this,t),tn.transformDirection(e),this.setXYZ(t,tn.x,tn.y,tn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=zn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=pt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=zn(t,this.array)),t}setX(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=zn(t,this.array)),t}setY(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=zn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=zn(t,this.array)),t}setW(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),i=pt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),i=pt(i,this.array),s=pt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Xa&&(e.usage=this.usage),e}}class bM extends Ft{constructor(e,t,n){super(new Int8Array(e),t,n)}}class CM extends Ft{constructor(e,t,n){super(new Uint8Array(e),t,n)}}class RM extends Ft{constructor(e,t,n){super(new Uint8ClampedArray(e),t,n)}}class PM extends Ft{constructor(e,t,n){super(new Int16Array(e),t,n)}}class Cp extends Ft{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class IM extends Ft{constructor(e,t,n){super(new Int32Array(e),t,n)}}class Rp extends Ft{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class LM extends Ft{constructor(e,t,n){super(new Uint16Array(e),t,n),this.isFloat16BufferAttribute=!0}getX(e){let t=Ea(this.array[e*this.itemSize]);return this.normalized&&(t=zn(t,this.array)),t}setX(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize]=Wn(t),this}getY(e){let t=Ea(this.array[e*this.itemSize+1]);return this.normalized&&(t=zn(t,this.array)),t}setY(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+1]=Wn(t),this}getZ(e){let t=Ea(this.array[e*this.itemSize+2]);return this.normalized&&(t=zn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+2]=Wn(t),this}getW(e){let t=Ea(this.array[e*this.itemSize+3]);return this.normalized&&(t=zn(t,this.array)),t}setW(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+3]=Wn(t),this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array)),this.array[e+0]=Wn(t),this.array[e+1]=Wn(n),this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),i=pt(i,this.array)),this.array[e+0]=Wn(t),this.array[e+1]=Wn(n),this.array[e+2]=Wn(i),this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),i=pt(i,this.array),s=pt(s,this.array)),this.array[e+0]=Wn(t),this.array[e+1]=Wn(n),this.array[e+2]=Wn(i),this.array[e+3]=Wn(s),this}}class je extends Ft{constructor(e,t,n){super(new Float32Array(e),t,n)}}let DM=0;const vi=new rt,hd=new Ct,co=new D,ii=new pn,da=new pn,fn=new D;class vt extends Ji{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:DM++}),this.uuid=oi(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(D_(e)?Rp:Cp)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new dt().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return vi.makeRotationFromQuaternion(e),this.applyMatrix4(vi),this}rotateX(e){return vi.makeRotationX(e),this.applyMatrix4(vi),this}rotateY(e){return vi.makeRotationY(e),this.applyMatrix4(vi),this}rotateZ(e){return vi.makeRotationZ(e),this.applyMatrix4(vi),this}translate(e,t,n){return vi.makeTranslation(e,t,n),this.applyMatrix4(vi),this}scale(e,t,n){return vi.makeScale(e,t,n),this.applyMatrix4(vi),this}lookAt(e){return hd.lookAt(e),hd.updateMatrix(),this.applyMatrix4(hd.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(co).negate(),this.translate(co.x,co.y,co.z),this}setFromPoints(e){const t=[];for(let n=0,i=e.length;n<i;n++){const s=e[n];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new je(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new pn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const s=t[n];ii.setFromBufferAttribute(s),this.morphTargetsRelative?(fn.addVectors(this.boundingBox.min,ii.min),this.boundingBox.expandByPoint(fn),fn.addVectors(this.boundingBox.max,ii.max),this.boundingBox.expandByPoint(fn)):(this.boundingBox.expandByPoint(ii.min),this.boundingBox.expandByPoint(ii.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new mn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){const n=this.boundingSphere.center;if(ii.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){const c=t[s];da.setFromBufferAttribute(c),this.morphTargetsRelative?(fn.addVectors(ii.min,da.min),ii.expandByPoint(fn),fn.addVectors(ii.max,da.max),ii.expandByPoint(fn)):(ii.expandByPoint(da.min),ii.expandByPoint(da.max))}ii.getCenter(n);let i=0;for(let s=0,a=e.count;s<a;s++)fn.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(fn));if(t)for(let s=0,a=t.length;s<a;s++){const c=t[s],u=this.morphTargetsRelative;for(let h=0,f=c.count;h<f;h++)fn.fromBufferAttribute(c,h),u&&(co.fromBufferAttribute(e,h),fn.add(co)),i=Math.max(i,n.distanceToSquared(fn))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ft(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),c=[],u=[];for(let O=0;O<n.count;O++)c[O]=new D,u[O]=new D;const h=new D,f=new D,p=new D,m=new pe,g=new pe,y=new pe,M=new D,x=new D;function _(O,k,b){h.fromBufferAttribute(n,O),f.fromBufferAttribute(n,k),p.fromBufferAttribute(n,b),m.fromBufferAttribute(s,O),g.fromBufferAttribute(s,k),y.fromBufferAttribute(s,b),f.sub(h),p.sub(h),g.sub(m),y.sub(m);const C=1/(g.x*y.y-y.x*g.y);isFinite(C)&&(M.copy(f).multiplyScalar(y.y).addScaledVector(p,-g.y).multiplyScalar(C),x.copy(p).multiplyScalar(g.x).addScaledVector(f,-y.x).multiplyScalar(C),c[O].add(M),c[k].add(M),c[b].add(M),u[O].add(x),u[k].add(x),u[b].add(x))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let O=0,k=E.length;O<k;++O){const b=E[O],C=b.start,W=b.count;for(let q=C,J=C+W;q<J;q+=3)_(e.getX(q+0),e.getX(q+1),e.getX(q+2))}const w=new D,T=new D,U=new D,P=new D;function L(O){U.fromBufferAttribute(i,O),P.copy(U);const k=c[O];w.copy(k),w.sub(U.multiplyScalar(U.dot(k))).normalize(),T.crossVectors(P,k);const C=T.dot(u[O])<0?-1:1;a.setXYZW(O,w.x,w.y,w.z,C)}for(let O=0,k=E.length;O<k;++O){const b=E[O],C=b.start,W=b.count;for(let q=C,J=C+W;q<J;q+=3)L(e.getX(q+0)),L(e.getX(q+1)),L(e.getX(q+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ft(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let m=0,g=n.count;m<g;m++)n.setXYZ(m,0,0,0);const i=new D,s=new D,a=new D,c=new D,u=new D,h=new D,f=new D,p=new D;if(e)for(let m=0,g=e.count;m<g;m+=3){const y=e.getX(m+0),M=e.getX(m+1),x=e.getX(m+2);i.fromBufferAttribute(t,y),s.fromBufferAttribute(t,M),a.fromBufferAttribute(t,x),f.subVectors(a,s),p.subVectors(i,s),f.cross(p),c.fromBufferAttribute(n,y),u.fromBufferAttribute(n,M),h.fromBufferAttribute(n,x),c.add(f),u.add(f),h.add(f),n.setXYZ(y,c.x,c.y,c.z),n.setXYZ(M,u.x,u.y,u.z),n.setXYZ(x,h.x,h.y,h.z)}else for(let m=0,g=t.count;m<g;m+=3)i.fromBufferAttribute(t,m+0),s.fromBufferAttribute(t,m+1),a.fromBufferAttribute(t,m+2),f.subVectors(a,s),p.subVectors(i,s),f.cross(p),n.setXYZ(m+0,f.x,f.y,f.z),n.setXYZ(m+1,f.x,f.y,f.z),n.setXYZ(m+2,f.x,f.y,f.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)fn.fromBufferAttribute(e,t),fn.normalize(),e.setXYZ(t,fn.x,fn.y,fn.z)}toNonIndexed(){function e(c,u){const h=c.array,f=c.itemSize,p=c.normalized,m=new h.constructor(u.length*f);let g=0,y=0;for(let M=0,x=u.length;M<x;M++){c.isInterleavedBufferAttribute?g=u[M]*c.data.stride+c.offset:g=u[M]*f;for(let _=0;_<f;_++)m[y++]=h[g++]}return new Ft(m,f,p)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new vt,n=this.index.array,i=this.attributes;for(const c in i){const u=i[c],h=e(u,n);t.setAttribute(c,h)}const s=this.morphAttributes;for(const c in s){const u=[],h=s[c];for(let f=0,p=h.length;f<p;f++){const m=h[f],g=e(m,n);u.push(g)}t.morphAttributes[c]=u}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let c=0,u=a.length;c<u;c++){const h=a[c];t.addGroup(h.start,h.count,h.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const u=this.parameters;for(const h in u)u[h]!==void 0&&(e[h]=u[h]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const u in n){const h=n[u];e.data.attributes[u]=h.toJSON(e.data)}const i={};let s=!1;for(const u in this.morphAttributes){const h=this.morphAttributes[u],f=[];for(let p=0,m=h.length;p<m;p++){const g=h[p];f.push(g.toJSON(e.data))}f.length>0&&(i[u]=f,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const c=this.boundingSphere;return c!==null&&(e.data.boundingSphere={center:c.center.toArray(),radius:c.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const i=e.attributes;for(const h in i){const f=i[h];this.setAttribute(h,f.clone(t))}const s=e.morphAttributes;for(const h in s){const f=[],p=s[h];for(let m=0,g=p.length;m<g;m++)f.push(p[m].clone(t));this.morphAttributes[h]=f}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let h=0,f=a.length;h<f;h++){const p=a[h];this.addGroup(p.start,p.count,p.materialIndex)}const c=e.boundingBox;c!==null&&(this.boundingBox=c.clone());const u=e.boundingSphere;return u!==null&&(this.boundingSphere=u.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Qg=new rt,ss=new Oo,Ac=new mn,$g=new D,Tc=new D,bc=new D,Cc=new D,fd=new D,Rc=new D,e0=new D,Pc=new D;class Qt extends Ct{constructor(e=new vt,t=new Pi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const c=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[c]=s}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const c=this.morphTargetInfluences;if(s&&c){Rc.set(0,0,0);for(let u=0,h=s.length;u<h;u++){const f=c[u],p=s[u];f!==0&&(fd.fromBufferAttribute(p,e),a?Rc.addScaledVector(fd,f):Rc.addScaledVector(fd.sub(t),f))}t.add(Rc)}return t}raycast(e,t){const n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ac.copy(n.boundingSphere),Ac.applyMatrix4(s),ss.copy(e.ray).recast(e.near),!(Ac.containsPoint(ss.origin)===!1&&(ss.intersectSphere(Ac,$g)===null||ss.origin.distanceToSquared($g)>(e.far-e.near)**2))&&(Qg.copy(s).invert(),ss.copy(e.ray).applyMatrix4(Qg),!(n.boundingBox!==null&&ss.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ss)))}_computeIntersections(e,t,n){let i;const s=this.geometry,a=this.material,c=s.index,u=s.attributes.position,h=s.attributes.uv,f=s.attributes.uv1,p=s.attributes.normal,m=s.groups,g=s.drawRange;if(c!==null)if(Array.isArray(a))for(let y=0,M=m.length;y<M;y++){const x=m[y],_=a[x.materialIndex],E=Math.max(x.start,g.start),w=Math.min(c.count,Math.min(x.start+x.count,g.start+g.count));for(let T=E,U=w;T<U;T+=3){const P=c.getX(T),L=c.getX(T+1),O=c.getX(T+2);i=Ic(this,_,e,n,h,f,p,P,L,O),i&&(i.faceIndex=Math.floor(T/3),i.face.materialIndex=x.materialIndex,t.push(i))}}else{const y=Math.max(0,g.start),M=Math.min(c.count,g.start+g.count);for(let x=y,_=M;x<_;x+=3){const E=c.getX(x),w=c.getX(x+1),T=c.getX(x+2);i=Ic(this,a,e,n,h,f,p,E,w,T),i&&(i.faceIndex=Math.floor(x/3),t.push(i))}}else if(u!==void 0)if(Array.isArray(a))for(let y=0,M=m.length;y<M;y++){const x=m[y],_=a[x.materialIndex],E=Math.max(x.start,g.start),w=Math.min(u.count,Math.min(x.start+x.count,g.start+g.count));for(let T=E,U=w;T<U;T+=3){const P=T,L=T+1,O=T+2;i=Ic(this,_,e,n,h,f,p,P,L,O),i&&(i.faceIndex=Math.floor(T/3),i.face.materialIndex=x.materialIndex,t.push(i))}}else{const y=Math.max(0,g.start),M=Math.min(u.count,g.start+g.count);for(let x=y,_=M;x<_;x+=3){const E=x,w=x+1,T=x+2;i=Ic(this,a,e,n,h,f,p,E,w,T),i&&(i.faceIndex=Math.floor(x/3),t.push(i))}}}}function UM(r,e,t,n,i,s,a,c){let u;if(e.side===In?u=n.intersectTriangle(a,s,i,!0,c):u=n.intersectTriangle(i,s,a,e.side===mr,c),u===null)return null;Pc.copy(c),Pc.applyMatrix4(r.matrixWorld);const h=t.ray.origin.distanceTo(Pc);return h<t.near||h>t.far?null:{distance:h,point:Pc.clone(),object:r}}function Ic(r,e,t,n,i,s,a,c,u,h){r.getVertexPosition(c,Tc),r.getVertexPosition(u,bc),r.getVertexPosition(h,Cc);const f=UM(r,e,t,n,Tc,bc,Cc,e0);if(f){const p=new D;Yn.getBarycoord(e0,Tc,bc,Cc,p),i&&(f.uv=Yn.getInterpolatedAttribute(i,c,u,h,p,new pe)),s&&(f.uv1=Yn.getInterpolatedAttribute(s,c,u,h,p,new pe)),a&&(f.normal=Yn.getInterpolatedAttribute(a,c,u,h,p,new D),f.normal.dot(n.direction)>0&&f.normal.multiplyScalar(-1));const m={a:c,b:u,c:h,normal:new D,materialIndex:0};Yn.getNormal(Tc,bc,Cc,m.normal),f.face=m,f.barycoord=p}return f}class Xr extends vt{constructor(e=1,t=1,n=1,i=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:a};const c=this;i=Math.floor(i),s=Math.floor(s),a=Math.floor(a);const u=[],h=[],f=[],p=[];let m=0,g=0;y("z","y","x",-1,-1,n,t,e,a,s,0),y("z","y","x",1,-1,n,t,-e,a,s,1),y("x","z","y",1,1,e,n,t,i,a,2),y("x","z","y",1,-1,e,n,-t,i,a,3),y("x","y","z",1,-1,e,t,n,i,s,4),y("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(u),this.setAttribute("position",new je(h,3)),this.setAttribute("normal",new je(f,3)),this.setAttribute("uv",new je(p,2));function y(M,x,_,E,w,T,U,P,L,O,k){const b=T/L,C=U/O,W=T/2,q=U/2,J=P/2,re=L+1,j=O+1;let fe=0,z=0;const ae=new D;for(let ee=0;ee<j;ee++){const le=ee*C-q;for(let Pe=0;Pe<re;Pe++){const Ne=Pe*b-W;ae[M]=Ne*E,ae[x]=le*w,ae[_]=J,h.push(ae.x,ae.y,ae.z),ae[M]=0,ae[x]=0,ae[_]=P>0?1:-1,f.push(ae.x,ae.y,ae.z),p.push(Pe/L),p.push(1-ee/O),fe+=1}}for(let ee=0;ee<O;ee++)for(let le=0;le<L;le++){const Pe=m+le+re*ee,Ne=m+le+re*(ee+1),ne=m+(le+1)+re*(ee+1),me=m+(le+1)+re*ee;u.push(Pe,Ne,me),u.push(Ne,ne,me),z+=6}c.addGroup(g,z,k),g+=z,m+=fe}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xr(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Lo(r){const e={};for(const t in r){e[t]={};for(const n in r[t]){const i=r[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function Bn(r){const e={};for(let t=0;t<r.length;t++){const n=Lo(r[t]);for(const i in n)e[i]=n[i]}return e}function NM(r){const e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function B_(r){const e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Dt.workingColorSpace}const nh={clone:Lo,merge:Bn};var FM=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,OM=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Zn extends Ln{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=FM,this.fragmentShader=OM,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Lo(e.uniforms),this.uniformsGroups=NM(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class ol extends Ct{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new rt,this.projectionMatrix=new rt,this.projectionMatrixInverse=new rt,this.coordinateSystem=Yi}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Fr=new D,t0=new pe,n0=new pe;class nn extends ol{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Io*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(As*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Io*2*Math.atan(Math.tan(As*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Fr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Fr.x,Fr.y).multiplyScalar(-e/Fr.z),Fr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Fr.x,Fr.y).multiplyScalar(-e/Fr.z)}getViewSize(e,t){return this.getViewBounds(e,t0,n0),t.subVectors(n0,t0)}setViewOffset(e,t,n,i,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(As*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const u=a.fullWidth,h=a.fullHeight;s+=a.offsetX*i/u,t-=a.offsetY*n/h,i*=a.width/u,n*=a.height/h}const c=this.filmOffset;c!==0&&(s+=e*c/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const uo=-90,ho=1;class z_ extends Ct{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new nn(uo,ho,e,t);i.layers=this.layers,this.add(i);const s=new nn(uo,ho,e,t);s.layers=this.layers,this.add(s);const a=new nn(uo,ho,e,t);a.layers=this.layers,this.add(a);const c=new nn(uo,ho,e,t);c.layers=this.layers,this.add(c);const u=new nn(uo,ho,e,t);u.layers=this.layers,this.add(u);const h=new nn(uo,ho,e,t);h.layers=this.layers,this.add(h)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,s,a,c,u]=t;for(const h of t)this.remove(h);if(e===Yi)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),c.up.set(0,1,0),c.lookAt(0,0,1),u.up.set(0,1,0),u.lookAt(0,0,-1);else if(e===Ya)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),c.up.set(0,-1,0),c.lookAt(0,0,1),u.up.set(0,-1,0),u.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const h of t)this.add(h),h.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,c,u,h,f]=this.children,p=e.getRenderTarget(),m=e.getActiveCubeFace(),g=e.getActiveMipmapLevel(),y=e.xr.enabled;e.xr.enabled=!1;const M=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,a),e.setRenderTarget(n,2,i),e.render(t,c),e.setRenderTarget(n,3,i),e.render(t,u),e.setRenderTarget(n,4,i),e.render(t,h),n.texture.generateMipmaps=M,e.setRenderTarget(n,5,i),e.render(t,f),e.setRenderTarget(p,m,g),e.xr.enabled=y,n.texture.needsPMREMUpdate=!0}}class al extends Zt{constructor(e,t,n,i,s,a,c,u,h,f){e=e!==void 0?e:[],t=t!==void 0?t:gr,super(e,t,n,i,s,a,c,u,h,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class k_ extends Ri{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new al(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:rn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Xr(5,5,5),s=new Zn({name:"CubemapFromEquirect",uniforms:Lo(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:In,blending:pr});s.uniforms.tEquirect.value=t;const a=new Qt(i,s),c=t.minFilter;return t.minFilter===Xi&&(t.minFilter=rn),new z_(1,10,this).update(e,a),t.minFilter=c,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,i){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(s)}}const dd=new D,BM=new D,zM=new dt;class zr{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=dd.subVectors(n,t).cross(BM.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(dd),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||zM.getNormalMatrix(e),i=this.coplanarPoint(dd).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const os=new mn,Lc=new D;class ll{constructor(e=new zr,t=new zr,n=new zr,i=new zr,s=new zr,a=new zr){this.planes=[e,t,n,i,s,a]}set(e,t,n,i,s,a){const c=this.planes;return c[0].copy(e),c[1].copy(t),c[2].copy(n),c[3].copy(i),c[4].copy(s),c[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Yi){const n=this.planes,i=e.elements,s=i[0],a=i[1],c=i[2],u=i[3],h=i[4],f=i[5],p=i[6],m=i[7],g=i[8],y=i[9],M=i[10],x=i[11],_=i[12],E=i[13],w=i[14],T=i[15];if(n[0].setComponents(u-s,m-h,x-g,T-_).normalize(),n[1].setComponents(u+s,m+h,x+g,T+_).normalize(),n[2].setComponents(u+a,m+f,x+y,T+E).normalize(),n[3].setComponents(u-a,m-f,x-y,T-E).normalize(),n[4].setComponents(u-c,m-p,x-M,T-w).normalize(),t===Yi)n[5].setComponents(u+c,m+p,x+M,T+w).normalize();else if(t===Ya)n[5].setComponents(c,p,M,w).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),os.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),os.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(os)}intersectsSprite(e){return os.center.set(0,0,0),os.radius=.7071067811865476,os.applyMatrix4(e.matrixWorld),this.intersectsSphere(os)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(Lc.x=i.normal.x>0?e.max.x:e.min.x,Lc.y=i.normal.y>0?e.max.y:e.min.y,Lc.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Lc)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function H_(){let r=null,e=!1,t=null,n=null;function i(s,a){t(s,a),n=r.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(i),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function kM(r){const e=new WeakMap;function t(c,u){const h=c.array,f=c.usage,p=h.byteLength,m=r.createBuffer();r.bindBuffer(u,m),r.bufferData(u,h,f),c.onUploadCallback();let g;if(h instanceof Float32Array)g=r.FLOAT;else if(h instanceof Uint16Array)c.isFloat16BufferAttribute?g=r.HALF_FLOAT:g=r.UNSIGNED_SHORT;else if(h instanceof Int16Array)g=r.SHORT;else if(h instanceof Uint32Array)g=r.UNSIGNED_INT;else if(h instanceof Int32Array)g=r.INT;else if(h instanceof Int8Array)g=r.BYTE;else if(h instanceof Uint8Array)g=r.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)g=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:m,type:g,bytesPerElement:h.BYTES_PER_ELEMENT,version:c.version,size:p}}function n(c,u,h){const f=u.array,p=u.updateRanges;if(r.bindBuffer(h,c),p.length===0)r.bufferSubData(h,0,f);else{p.sort((g,y)=>g.start-y.start);let m=0;for(let g=1;g<p.length;g++){const y=p[m],M=p[g];M.start<=y.start+y.count+1?y.count=Math.max(y.count,M.start+M.count-y.start):(++m,p[m]=M)}p.length=m+1;for(let g=0,y=p.length;g<y;g++){const M=p[g];r.bufferSubData(h,M.start*f.BYTES_PER_ELEMENT,f,M.start,M.count)}u.clearUpdateRanges()}u.onUploadCallback()}function i(c){return c.isInterleavedBufferAttribute&&(c=c.data),e.get(c)}function s(c){c.isInterleavedBufferAttribute&&(c=c.data);const u=e.get(c);u&&(r.deleteBuffer(u.buffer),e.delete(c))}function a(c,u){if(c.isInterleavedBufferAttribute&&(c=c.data),c.isGLBufferAttribute){const f=e.get(c);(!f||f.version<c.version)&&e.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}const h=e.get(c);if(h===void 0)e.set(c,t(c,u));else if(h.version<c.version){if(h.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(h.buffer,c,u),h.version=c.version}}return{get:i,remove:s,update:a}}class Bo extends vt{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const s=e/2,a=t/2,c=Math.floor(n),u=Math.floor(i),h=c+1,f=u+1,p=e/c,m=t/u,g=[],y=[],M=[],x=[];for(let _=0;_<f;_++){const E=_*m-a;for(let w=0;w<h;w++){const T=w*p-s;y.push(T,-E,0),M.push(0,0,1),x.push(w/c),x.push(1-_/u)}}for(let _=0;_<u;_++)for(let E=0;E<c;E++){const w=E+h*_,T=E+h*(_+1),U=E+1+h*(_+1),P=E+1+h*_;g.push(w,T,P),g.push(T,U,P)}this.setIndex(g),this.setAttribute("position",new je(y,3)),this.setAttribute("normal",new je(M,3)),this.setAttribute("uv",new je(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Bo(e.width,e.height,e.widthSegments,e.heightSegments)}}var HM=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,VM=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,GM=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,WM=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,XM=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,YM=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,qM=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,jM=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,ZM=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,JM=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,KM=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,QM=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,$M=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,e1=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,t1=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,n1=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,i1=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,r1=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,s1=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,o1=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,a1=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,l1=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,c1=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,u1=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,h1=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,f1=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,d1=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,p1=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,m1=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,g1=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,v1="gl_FragColor = linearToOutputTexel( gl_FragColor );",_1=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,y1=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,x1=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,S1=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,M1=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,w1=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,E1=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,A1=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,T1=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,b1=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,C1=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,R1=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,P1=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,I1=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,L1=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,D1=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,U1=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,N1=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,F1=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,O1=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,B1=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,z1=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,k1=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,H1=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,V1=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,G1=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,W1=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,X1=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Y1=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,q1=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,j1=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Z1=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,J1=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,K1=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Q1=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,$1=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ew=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,tw=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,nw=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,iw=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,rw=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,sw=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,ow=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,aw=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,lw=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,cw=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,uw=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,hw=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,fw=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,dw=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,pw=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,mw=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,gw=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,vw=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,_w=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,yw=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,xw=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Sw=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Mw=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,ww=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Ew=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Aw=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Tw=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,bw=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Cw=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Rw=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Pw=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Iw=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Lw=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Dw=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Uw=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Nw=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Fw=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Ow=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Bw=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,zw=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const kw=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Hw=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Vw=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Gw=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ww=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Xw=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Yw=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,qw=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,jw=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Zw=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Jw=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Kw=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Qw=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,$w=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,eE=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,tE=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,nE=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,iE=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rE=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,sE=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,oE=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,aE=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,lE=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,cE=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,uE=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,hE=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fE=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,dE=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,pE=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,mE=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,gE=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,vE=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,_E=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,yE=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,mt={alphahash_fragment:HM,alphahash_pars_fragment:VM,alphamap_fragment:GM,alphamap_pars_fragment:WM,alphatest_fragment:XM,alphatest_pars_fragment:YM,aomap_fragment:qM,aomap_pars_fragment:jM,batching_pars_vertex:ZM,batching_vertex:JM,begin_vertex:KM,beginnormal_vertex:QM,bsdfs:$M,iridescence_fragment:e1,bumpmap_pars_fragment:t1,clipping_planes_fragment:n1,clipping_planes_pars_fragment:i1,clipping_planes_pars_vertex:r1,clipping_planes_vertex:s1,color_fragment:o1,color_pars_fragment:a1,color_pars_vertex:l1,color_vertex:c1,common:u1,cube_uv_reflection_fragment:h1,defaultnormal_vertex:f1,displacementmap_pars_vertex:d1,displacementmap_vertex:p1,emissivemap_fragment:m1,emissivemap_pars_fragment:g1,colorspace_fragment:v1,colorspace_pars_fragment:_1,envmap_fragment:y1,envmap_common_pars_fragment:x1,envmap_pars_fragment:S1,envmap_pars_vertex:M1,envmap_physical_pars_fragment:D1,envmap_vertex:w1,fog_vertex:E1,fog_pars_vertex:A1,fog_fragment:T1,fog_pars_fragment:b1,gradientmap_pars_fragment:C1,lightmap_pars_fragment:R1,lights_lambert_fragment:P1,lights_lambert_pars_fragment:I1,lights_pars_begin:L1,lights_toon_fragment:U1,lights_toon_pars_fragment:N1,lights_phong_fragment:F1,lights_phong_pars_fragment:O1,lights_physical_fragment:B1,lights_physical_pars_fragment:z1,lights_fragment_begin:k1,lights_fragment_maps:H1,lights_fragment_end:V1,logdepthbuf_fragment:G1,logdepthbuf_pars_fragment:W1,logdepthbuf_pars_vertex:X1,logdepthbuf_vertex:Y1,map_fragment:q1,map_pars_fragment:j1,map_particle_fragment:Z1,map_particle_pars_fragment:J1,metalnessmap_fragment:K1,metalnessmap_pars_fragment:Q1,morphinstance_vertex:$1,morphcolor_vertex:ew,morphnormal_vertex:tw,morphtarget_pars_vertex:nw,morphtarget_vertex:iw,normal_fragment_begin:rw,normal_fragment_maps:sw,normal_pars_fragment:ow,normal_pars_vertex:aw,normal_vertex:lw,normalmap_pars_fragment:cw,clearcoat_normal_fragment_begin:uw,clearcoat_normal_fragment_maps:hw,clearcoat_pars_fragment:fw,iridescence_pars_fragment:dw,opaque_fragment:pw,packing:mw,premultiplied_alpha_fragment:gw,project_vertex:vw,dithering_fragment:_w,dithering_pars_fragment:yw,roughnessmap_fragment:xw,roughnessmap_pars_fragment:Sw,shadowmap_pars_fragment:Mw,shadowmap_pars_vertex:ww,shadowmap_vertex:Ew,shadowmask_pars_fragment:Aw,skinbase_vertex:Tw,skinning_pars_vertex:bw,skinning_vertex:Cw,skinnormal_vertex:Rw,specularmap_fragment:Pw,specularmap_pars_fragment:Iw,tonemapping_fragment:Lw,tonemapping_pars_fragment:Dw,transmission_fragment:Uw,transmission_pars_fragment:Nw,uv_pars_fragment:Fw,uv_pars_vertex:Ow,uv_vertex:Bw,worldpos_vertex:zw,background_vert:kw,background_frag:Hw,backgroundCube_vert:Vw,backgroundCube_frag:Gw,cube_vert:Ww,cube_frag:Xw,depth_vert:Yw,depth_frag:qw,distanceRGBA_vert:jw,distanceRGBA_frag:Zw,equirect_vert:Jw,equirect_frag:Kw,linedashed_vert:Qw,linedashed_frag:$w,meshbasic_vert:eE,meshbasic_frag:tE,meshlambert_vert:nE,meshlambert_frag:iE,meshmatcap_vert:rE,meshmatcap_frag:sE,meshnormal_vert:oE,meshnormal_frag:aE,meshphong_vert:lE,meshphong_frag:cE,meshphysical_vert:uE,meshphysical_frag:hE,meshtoon_vert:fE,meshtoon_frag:dE,points_vert:pE,points_frag:mE,shadow_vert:gE,shadow_frag:vE,sprite_vert:_E,sprite_frag:yE},be={common:{diffuse:{value:new Ue(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new dt},alphaMap:{value:null},alphaMapTransform:{value:new dt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new dt}},envmap:{envMap:{value:null},envMapRotation:{value:new dt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new dt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new dt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new dt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new dt},normalScale:{value:new pe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new dt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new dt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new dt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new dt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ue(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ue(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new dt},alphaTest:{value:0},uvTransform:{value:new dt}},sprite:{diffuse:{value:new Ue(16777215)},opacity:{value:1},center:{value:new pe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new dt},alphaMap:{value:null},alphaMapTransform:{value:new dt},alphaTest:{value:0}}},bi={basic:{uniforms:Bn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.fog]),vertexShader:mt.meshbasic_vert,fragmentShader:mt.meshbasic_frag},lambert:{uniforms:Bn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new Ue(0)}}]),vertexShader:mt.meshlambert_vert,fragmentShader:mt.meshlambert_frag},phong:{uniforms:Bn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new Ue(0)},specular:{value:new Ue(1118481)},shininess:{value:30}}]),vertexShader:mt.meshphong_vert,fragmentShader:mt.meshphong_frag},standard:{uniforms:Bn([be.common,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.roughnessmap,be.metalnessmap,be.fog,be.lights,{emissive:{value:new Ue(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:mt.meshphysical_vert,fragmentShader:mt.meshphysical_frag},toon:{uniforms:Bn([be.common,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.gradientmap,be.fog,be.lights,{emissive:{value:new Ue(0)}}]),vertexShader:mt.meshtoon_vert,fragmentShader:mt.meshtoon_frag},matcap:{uniforms:Bn([be.common,be.bumpmap,be.normalmap,be.displacementmap,be.fog,{matcap:{value:null}}]),vertexShader:mt.meshmatcap_vert,fragmentShader:mt.meshmatcap_frag},points:{uniforms:Bn([be.points,be.fog]),vertexShader:mt.points_vert,fragmentShader:mt.points_frag},dashed:{uniforms:Bn([be.common,be.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:mt.linedashed_vert,fragmentShader:mt.linedashed_frag},depth:{uniforms:Bn([be.common,be.displacementmap]),vertexShader:mt.depth_vert,fragmentShader:mt.depth_frag},normal:{uniforms:Bn([be.common,be.bumpmap,be.normalmap,be.displacementmap,{opacity:{value:1}}]),vertexShader:mt.meshnormal_vert,fragmentShader:mt.meshnormal_frag},sprite:{uniforms:Bn([be.sprite,be.fog]),vertexShader:mt.sprite_vert,fragmentShader:mt.sprite_frag},background:{uniforms:{uvTransform:{value:new dt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:mt.background_vert,fragmentShader:mt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new dt}},vertexShader:mt.backgroundCube_vert,fragmentShader:mt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:mt.cube_vert,fragmentShader:mt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:mt.equirect_vert,fragmentShader:mt.equirect_frag},distanceRGBA:{uniforms:Bn([be.common,be.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:mt.distanceRGBA_vert,fragmentShader:mt.distanceRGBA_frag},shadow:{uniforms:Bn([be.lights,be.fog,{color:{value:new Ue(0)},opacity:{value:1}}]),vertexShader:mt.shadow_vert,fragmentShader:mt.shadow_frag}};bi.physical={uniforms:Bn([bi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new dt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new dt},clearcoatNormalScale:{value:new pe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new dt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new dt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new dt},sheen:{value:0},sheenColor:{value:new Ue(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new dt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new dt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new dt},transmissionSamplerSize:{value:new pe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new dt},attenuationDistance:{value:0},attenuationColor:{value:new Ue(0)},specularColor:{value:new Ue(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new dt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new dt},anisotropyVector:{value:new pe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new dt}}]),vertexShader:mt.meshphysical_vert,fragmentShader:mt.meshphysical_frag};const Dc={r:0,b:0,g:0},as=new ai,xE=new rt;function SE(r,e,t,n,i,s,a){const c=new Ue(0);let u=s===!0?0:1,h,f,p=null,m=0,g=null;function y(E){let w=E.isScene===!0?E.background:null;return w&&w.isTexture&&(w=(E.backgroundBlurriness>0?t:e).get(w)),w}function M(E){let w=!1;const T=y(E);T===null?_(c,u):T&&T.isColor&&(_(T,1),w=!0);const U=r.xr.getEnvironmentBlendMode();U==="additive"?n.buffers.color.setClear(0,0,0,1,a):U==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(r.autoClear||w)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function x(E,w){const T=y(w);T&&(T.isCubeTexture||T.mapping===No)?(f===void 0&&(f=new Qt(new Xr(1,1,1),new Zn({name:"BackgroundCubeMaterial",uniforms:Lo(bi.backgroundCube.uniforms),vertexShader:bi.backgroundCube.vertexShader,fragmentShader:bi.backgroundCube.fragmentShader,side:In,depthTest:!1,depthWrite:!1,fog:!1})),f.geometry.deleteAttribute("normal"),f.geometry.deleteAttribute("uv"),f.onBeforeRender=function(U,P,L){this.matrixWorld.copyPosition(L.matrixWorld)},Object.defineProperty(f.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(f)),as.copy(w.backgroundRotation),as.x*=-1,as.y*=-1,as.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(as.y*=-1,as.z*=-1),f.material.uniforms.envMap.value=T,f.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,f.material.uniforms.backgroundBlurriness.value=w.backgroundBlurriness,f.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,f.material.uniforms.backgroundRotation.value.setFromMatrix4(xE.makeRotationFromEuler(as)),f.material.toneMapped=Dt.getTransfer(T.colorSpace)!==zt,(p!==T||m!==T.version||g!==r.toneMapping)&&(f.material.needsUpdate=!0,p=T,m=T.version,g=r.toneMapping),f.layers.enableAll(),E.unshift(f,f.geometry,f.material,0,0,null)):T&&T.isTexture&&(h===void 0&&(h=new Qt(new Bo(2,2),new Zn({name:"BackgroundMaterial",uniforms:Lo(bi.background.uniforms),vertexShader:bi.background.vertexShader,fragmentShader:bi.background.fragmentShader,side:mr,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),Object.defineProperty(h.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(h)),h.material.uniforms.t2D.value=T,h.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,h.material.toneMapped=Dt.getTransfer(T.colorSpace)!==zt,T.matrixAutoUpdate===!0&&T.updateMatrix(),h.material.uniforms.uvTransform.value.copy(T.matrix),(p!==T||m!==T.version||g!==r.toneMapping)&&(h.material.needsUpdate=!0,p=T,m=T.version,g=r.toneMapping),h.layers.enableAll(),E.unshift(h,h.geometry,h.material,0,0,null))}function _(E,w){E.getRGB(Dc,B_(r)),n.buffers.color.setClear(Dc.r,Dc.g,Dc.b,w,a)}return{getClearColor:function(){return c},setClearColor:function(E,w=1){c.set(E),u=w,_(c,u)},getClearAlpha:function(){return u},setClearAlpha:function(E){u=E,_(c,u)},render:M,addToRenderList:x}}function ME(r,e){const t=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},i=m(null);let s=i,a=!1;function c(b,C,W,q,J){let re=!1;const j=p(q,W,C);s!==j&&(s=j,h(s.object)),re=g(b,q,W,J),re&&y(b,q,W,J),J!==null&&e.update(J,r.ELEMENT_ARRAY_BUFFER),(re||a)&&(a=!1,T(b,C,W,q),J!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(J).buffer))}function u(){return r.createVertexArray()}function h(b){return r.bindVertexArray(b)}function f(b){return r.deleteVertexArray(b)}function p(b,C,W){const q=W.wireframe===!0;let J=n[b.id];J===void 0&&(J={},n[b.id]=J);let re=J[C.id];re===void 0&&(re={},J[C.id]=re);let j=re[q];return j===void 0&&(j=m(u()),re[q]=j),j}function m(b){const C=[],W=[],q=[];for(let J=0;J<t;J++)C[J]=0,W[J]=0,q[J]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:W,attributeDivisors:q,object:b,attributes:{},index:null}}function g(b,C,W,q){const J=s.attributes,re=C.attributes;let j=0;const fe=W.getAttributes();for(const z in fe)if(fe[z].location>=0){const ee=J[z];let le=re[z];if(le===void 0&&(z==="instanceMatrix"&&b.instanceMatrix&&(le=b.instanceMatrix),z==="instanceColor"&&b.instanceColor&&(le=b.instanceColor)),ee===void 0||ee.attribute!==le||le&&ee.data!==le.data)return!0;j++}return s.attributesNum!==j||s.index!==q}function y(b,C,W,q){const J={},re=C.attributes;let j=0;const fe=W.getAttributes();for(const z in fe)if(fe[z].location>=0){let ee=re[z];ee===void 0&&(z==="instanceMatrix"&&b.instanceMatrix&&(ee=b.instanceMatrix),z==="instanceColor"&&b.instanceColor&&(ee=b.instanceColor));const le={};le.attribute=ee,ee&&ee.data&&(le.data=ee.data),J[z]=le,j++}s.attributes=J,s.attributesNum=j,s.index=q}function M(){const b=s.newAttributes;for(let C=0,W=b.length;C<W;C++)b[C]=0}function x(b){_(b,0)}function _(b,C){const W=s.newAttributes,q=s.enabledAttributes,J=s.attributeDivisors;W[b]=1,q[b]===0&&(r.enableVertexAttribArray(b),q[b]=1),J[b]!==C&&(r.vertexAttribDivisor(b,C),J[b]=C)}function E(){const b=s.newAttributes,C=s.enabledAttributes;for(let W=0,q=C.length;W<q;W++)C[W]!==b[W]&&(r.disableVertexAttribArray(W),C[W]=0)}function w(b,C,W,q,J,re,j){j===!0?r.vertexAttribIPointer(b,C,W,J,re):r.vertexAttribPointer(b,C,W,q,J,re)}function T(b,C,W,q){M();const J=q.attributes,re=W.getAttributes(),j=C.defaultAttributeValues;for(const fe in re){const z=re[fe];if(z.location>=0){let ae=J[fe];if(ae===void 0&&(fe==="instanceMatrix"&&b.instanceMatrix&&(ae=b.instanceMatrix),fe==="instanceColor"&&b.instanceColor&&(ae=b.instanceColor)),ae!==void 0){const ee=ae.normalized,le=ae.itemSize,Pe=e.get(ae);if(Pe===void 0)continue;const Ne=Pe.buffer,ne=Pe.type,me=Pe.bytesPerElement,Ce=ne===r.INT||ne===r.UNSIGNED_INT||ae.gpuType===uh;if(ae.isInterleavedBufferAttribute){const Ae=ae.data,tt=Ae.stride,nt=ae.offset;if(Ae.isInstancedInterleavedBuffer){for(let Ze=0;Ze<z.locationSize;Ze++)_(z.location+Ze,Ae.meshPerAttribute);b.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=Ae.meshPerAttribute*Ae.count)}else for(let Ze=0;Ze<z.locationSize;Ze++)x(z.location+Ze);r.bindBuffer(r.ARRAY_BUFFER,Ne);for(let Ze=0;Ze<z.locationSize;Ze++)w(z.location+Ze,le/z.locationSize,ne,ee,tt*me,(nt+le/z.locationSize*Ze)*me,Ce)}else{if(ae.isInstancedBufferAttribute){for(let Ae=0;Ae<z.locationSize;Ae++)_(z.location+Ae,ae.meshPerAttribute);b.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let Ae=0;Ae<z.locationSize;Ae++)x(z.location+Ae);r.bindBuffer(r.ARRAY_BUFFER,Ne);for(let Ae=0;Ae<z.locationSize;Ae++)w(z.location+Ae,le/z.locationSize,ne,ee,le*me,le/z.locationSize*Ae*me,Ce)}}else if(j!==void 0){const ee=j[fe];if(ee!==void 0)switch(ee.length){case 2:r.vertexAttrib2fv(z.location,ee);break;case 3:r.vertexAttrib3fv(z.location,ee);break;case 4:r.vertexAttrib4fv(z.location,ee);break;default:r.vertexAttrib1fv(z.location,ee)}}}}E()}function U(){O();for(const b in n){const C=n[b];for(const W in C){const q=C[W];for(const J in q)f(q[J].object),delete q[J];delete C[W]}delete n[b]}}function P(b){if(n[b.id]===void 0)return;const C=n[b.id];for(const W in C){const q=C[W];for(const J in q)f(q[J].object),delete q[J];delete C[W]}delete n[b.id]}function L(b){for(const C in n){const W=n[C];if(W[b.id]===void 0)continue;const q=W[b.id];for(const J in q)f(q[J].object),delete q[J];delete W[b.id]}}function O(){k(),a=!0,s!==i&&(s=i,h(s.object))}function k(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:c,reset:O,resetDefaultState:k,dispose:U,releaseStatesOfGeometry:P,releaseStatesOfProgram:L,initAttributes:M,enableAttribute:x,disableUnusedAttributes:E}}function wE(r,e,t){let n;function i(h){n=h}function s(h,f){r.drawArrays(n,h,f),t.update(f,n,1)}function a(h,f,p){p!==0&&(r.drawArraysInstanced(n,h,f,p),t.update(f,n,p))}function c(h,f,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,h,0,f,0,p);let g=0;for(let y=0;y<p;y++)g+=f[y];t.update(g,n,1)}function u(h,f,p,m){if(p===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let y=0;y<h.length;y++)a(h[y],f[y],m[y]);else{g.multiDrawArraysInstancedWEBGL(n,h,0,f,0,m,0,p);let y=0;for(let M=0;M<p;M++)y+=f[M];for(let M=0;M<m.length;M++)t.update(y,n,m[M])}}this.setMode=i,this.render=s,this.renderInstances=a,this.renderMultiDraw=c,this.renderMultiDrawInstances=u}function EE(r,e,t,n){let i;function s(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const L=e.get("EXT_texture_filter_anisotropic");i=r.getParameter(L.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(L){return!(L!==Pn&&n.convert(L)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function c(L){const O=L===Fo&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(L!==Ci&&n.convert(L)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&L!==qn&&!O)}function u(L){if(L==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";L="mediump"}return L==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let h=t.precision!==void 0?t.precision:"highp";const f=u(h);f!==h&&(console.warn("THREE.WebGLRenderer:",h,"not supported, using",f,"instead."),h=f);const p=t.logarithmicDepthBuffer===!0,m=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(m===!0){const L=e.get("EXT_clip_control");L.clipControlEXT(L.LOWER_LEFT_EXT,L.ZERO_TO_ONE_EXT)}const g=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),y=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),M=r.getParameter(r.MAX_TEXTURE_SIZE),x=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),_=r.getParameter(r.MAX_VERTEX_ATTRIBS),E=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),w=r.getParameter(r.MAX_VARYING_VECTORS),T=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),U=y>0,P=r.getParameter(r.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:u,textureFormatReadable:a,textureTypeReadable:c,precision:h,logarithmicDepthBuffer:p,reverseDepthBuffer:m,maxTextures:g,maxVertexTextures:y,maxTextureSize:M,maxCubemapSize:x,maxAttributes:_,maxVertexUniforms:E,maxVaryings:w,maxFragmentUniforms:T,vertexTextures:U,maxSamples:P}}function AE(r){const e=this;let t=null,n=0,i=!1,s=!1;const a=new zr,c=new dt,u={value:null,needsUpdate:!1};this.uniform=u,this.numPlanes=0,this.numIntersection=0,this.init=function(p,m){const g=p.length!==0||m||n!==0||i;return i=m,n=p.length,g},this.beginShadows=function(){s=!0,f(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(p,m){t=f(p,m,0)},this.setState=function(p,m,g){const y=p.clippingPlanes,M=p.clipIntersection,x=p.clipShadows,_=r.get(p);if(!i||y===null||y.length===0||s&&!x)s?f(null):h();else{const E=s?0:n,w=E*4;let T=_.clippingState||null;u.value=T,T=f(y,m,w,g);for(let U=0;U!==w;++U)T[U]=t[U];_.clippingState=T,this.numIntersection=M?this.numPlanes:0,this.numPlanes+=E}};function h(){u.value!==t&&(u.value=t,u.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function f(p,m,g,y){const M=p!==null?p.length:0;let x=null;if(M!==0){if(x=u.value,y!==!0||x===null){const _=g+M*4,E=m.matrixWorldInverse;c.getNormalMatrix(E),(x===null||x.length<_)&&(x=new Float32Array(_));for(let w=0,T=g;w!==M;++w,T+=4)a.copy(p[w]).applyMatrix4(E,c),a.normal.toArray(x,T),x[T+3]=a.constant}u.value=x,u.needsUpdate=!0}return e.numPlanes=M,e.numIntersection=0,x}}function TE(r){let e=new WeakMap;function t(a,c){return c===Oa?a.mapping=gr:c===Ba&&(a.mapping=Vr),a}function n(a){if(a&&a.isTexture){const c=a.mapping;if(c===Oa||c===Ba)if(e.has(a)){const u=e.get(a).texture;return t(u,a.mapping)}else{const u=a.image;if(u&&u.height>0){const h=new k_(u.height);return h.fromEquirectangularTexture(r,a),e.set(a,h),a.addEventListener("dispose",i),t(h.texture,a.mapping)}else return null}}return a}function i(a){const c=a.target;c.removeEventListener("dispose",i);const u=e.get(c);u!==void 0&&(e.delete(c),u.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}class Ns extends ol{constructor(e=-1,t=1,n=1,i=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let s=n-e,a=n+e,c=i+t,u=i-t;if(this.view!==null&&this.view.enabled){const h=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=h*this.view.offsetX,a=s+h*this.view.width,c-=f*this.view.offsetY,u=c-f*this.view.height}this.projectionMatrix.makeOrthographic(s,a,c,u,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Ao=4,i0=[.125,.215,.35,.446,.526,.582],_s=20,pd=new Ns,r0=new Ue;let md=null,gd=0,vd=0,_d=!1;const vs=(1+Math.sqrt(5))/2,fo=1/vs,s0=[new D(-vs,fo,0),new D(vs,fo,0),new D(-fo,0,vs),new D(fo,0,vs),new D(0,vs,-fo),new D(0,vs,fo),new D(-1,1,-1),new D(1,1,-1),new D(-1,1,1),new D(1,1,1)];class ep{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){md=this._renderer.getRenderTarget(),gd=this._renderer.getActiveCubeFace(),vd=this._renderer.getActiveMipmapLevel(),_d=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,i,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=l0(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=a0(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(md,gd,vd),this._renderer.xr.enabled=_d,e.scissorTest=!1,Uc(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===gr||e.mapping===Vr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),md=this._renderer.getRenderTarget(),gd=this._renderer.getActiveCubeFace(),vd=this._renderer.getActiveMipmapLevel(),_d=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:rn,minFilter:rn,generateMipmaps:!1,type:Fo,format:Pn,colorSpace:yr,depthBuffer:!1},i=o0(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=o0(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=bE(s)),this._blurMaterial=CE(s,e,t)}return i}_compileMaterial(e){const t=new Qt(this._lodPlanes[0],e);this._renderer.compile(t,pd)}_sceneToCubeUV(e,t,n,i){const c=new nn(90,1,t,n),u=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],f=this._renderer,p=f.autoClear,m=f.toneMapping;f.getClearColor(r0),f.toneMapping=qi,f.autoClear=!1;const g=new Pi({name:"PMREM.Background",side:In,depthWrite:!1,depthTest:!1}),y=new Qt(new Xr,g);let M=!1;const x=e.background;x?x.isColor&&(g.color.copy(x),e.background=null,M=!0):(g.color.copy(r0),M=!0);for(let _=0;_<6;_++){const E=_%3;E===0?(c.up.set(0,u[_],0),c.lookAt(h[_],0,0)):E===1?(c.up.set(0,0,u[_]),c.lookAt(0,h[_],0)):(c.up.set(0,u[_],0),c.lookAt(0,0,h[_]));const w=this._cubeSize;Uc(i,E*w,_>2?w:0,w,w),f.setRenderTarget(i),M&&f.render(y,c),f.render(e,c)}y.geometry.dispose(),y.material.dispose(),f.toneMapping=m,f.autoClear=p,e.background=x}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===gr||e.mapping===Vr;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=l0()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=a0());const s=i?this._cubemapMaterial:this._equirectMaterial,a=new Qt(this._lodPlanes[0],s),c=s.uniforms;c.envMap.value=e;const u=this._cubeSize;Uc(t,0,0,3*u,2*u),n.setRenderTarget(t),n.render(a,pd)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodPlanes.length;for(let s=1;s<i;s++){const a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),c=s0[(i-s-1)%s0.length];this._blur(e,s-1,s,a,c)}t.autoClear=n}_blur(e,t,n,i,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",s),this._halfBlur(a,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,a,c){const u=this._renderer,h=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const f=3,p=new Qt(this._lodPlanes[i],h),m=h.uniforms,g=this._sizeLods[n]-1,y=isFinite(s)?Math.PI/(2*g):2*Math.PI/(2*_s-1),M=s/y,x=isFinite(s)?1+Math.floor(f*M):_s;x>_s&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${x} samples when the maximum is set to ${_s}`);const _=[];let E=0;for(let L=0;L<_s;++L){const O=L/M,k=Math.exp(-O*O/2);_.push(k),L===0?E+=k:L<x&&(E+=2*k)}for(let L=0;L<_.length;L++)_[L]=_[L]/E;m.envMap.value=e.texture,m.samples.value=x,m.weights.value=_,m.latitudinal.value=a==="latitudinal",c&&(m.poleAxis.value=c);const{_lodMax:w}=this;m.dTheta.value=y,m.mipInt.value=w-n;const T=this._sizeLods[i],U=3*T*(i>w-Ao?i-w+Ao:0),P=4*(this._cubeSize-T);Uc(t,U,P,3*T,2*T),u.setRenderTarget(t),u.render(p,pd)}}function bE(r){const e=[],t=[],n=[];let i=r;const s=r-Ao+1+i0.length;for(let a=0;a<s;a++){const c=Math.pow(2,i);t.push(c);let u=1/c;a>r-Ao?u=i0[a-r+Ao-1]:a===0&&(u=0),n.push(u);const h=1/(c-2),f=-h,p=1+h,m=[f,f,p,f,p,p,f,f,p,p,f,p],g=6,y=6,M=3,x=2,_=1,E=new Float32Array(M*y*g),w=new Float32Array(x*y*g),T=new Float32Array(_*y*g);for(let P=0;P<g;P++){const L=P%3*2/3-1,O=P>2?0:-1,k=[L,O,0,L+2/3,O,0,L+2/3,O+1,0,L,O,0,L+2/3,O+1,0,L,O+1,0];E.set(k,M*y*P),w.set(m,x*y*P);const b=[P,P,P,P,P,P];T.set(b,_*y*P)}const U=new vt;U.setAttribute("position",new Ft(E,M)),U.setAttribute("uv",new Ft(w,x)),U.setAttribute("faceIndex",new Ft(T,_)),e.push(U),i>Ao&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function o0(r,e,t){const n=new Ri(r,e,t);return n.texture.mapping=No,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Uc(r,e,t,n,i){r.viewport.set(e,t,n,i),r.scissor.set(e,t,n,i)}function CE(r,e,t){const n=new Float32Array(_s),i=new D(0,1,0);return new Zn({name:"SphericalGaussianBlur",defines:{n:_s,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Pp(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:pr,depthTest:!1,depthWrite:!1})}function a0(){return new Zn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Pp(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:pr,depthTest:!1,depthWrite:!1})}function l0(){return new Zn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Pp(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:pr,depthTest:!1,depthWrite:!1})}function Pp(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function RE(r){let e=new WeakMap,t=null;function n(c){if(c&&c.isTexture){const u=c.mapping,h=u===Oa||u===Ba,f=u===gr||u===Vr;if(h||f){let p=e.get(c);const m=p!==void 0?p.texture.pmremVersion:0;if(c.isRenderTargetTexture&&c.pmremVersion!==m)return t===null&&(t=new ep(r)),p=h?t.fromEquirectangular(c,p):t.fromCubemap(c,p),p.texture.pmremVersion=c.pmremVersion,e.set(c,p),p.texture;if(p!==void 0)return p.texture;{const g=c.image;return h&&g&&g.height>0||f&&g&&i(g)?(t===null&&(t=new ep(r)),p=h?t.fromEquirectangular(c):t.fromCubemap(c),p.texture.pmremVersion=c.pmremVersion,e.set(c,p),c.addEventListener("dispose",s),p.texture):null}}}return c}function i(c){let u=0;const h=6;for(let f=0;f<h;f++)c[f]!==void 0&&u++;return u===h}function s(c){const u=c.target;u.removeEventListener("dispose",s);const h=e.get(u);h!==void 0&&(e.delete(u),h.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function PE(r){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&mu("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function IE(r,e,t,n){const i={},s=new WeakMap;function a(p){const m=p.target;m.index!==null&&e.remove(m.index);for(const y in m.attributes)e.remove(m.attributes[y]);for(const y in m.morphAttributes){const M=m.morphAttributes[y];for(let x=0,_=M.length;x<_;x++)e.remove(M[x])}m.removeEventListener("dispose",a),delete i[m.id];const g=s.get(m);g&&(e.remove(g),s.delete(m)),n.releaseStatesOfGeometry(m),m.isInstancedBufferGeometry===!0&&delete m._maxInstanceCount,t.memory.geometries--}function c(p,m){return i[m.id]===!0||(m.addEventListener("dispose",a),i[m.id]=!0,t.memory.geometries++),m}function u(p){const m=p.attributes;for(const y in m)e.update(m[y],r.ARRAY_BUFFER);const g=p.morphAttributes;for(const y in g){const M=g[y];for(let x=0,_=M.length;x<_;x++)e.update(M[x],r.ARRAY_BUFFER)}}function h(p){const m=[],g=p.index,y=p.attributes.position;let M=0;if(g!==null){const E=g.array;M=g.version;for(let w=0,T=E.length;w<T;w+=3){const U=E[w+0],P=E[w+1],L=E[w+2];m.push(U,P,P,L,L,U)}}else if(y!==void 0){const E=y.array;M=y.version;for(let w=0,T=E.length/3-1;w<T;w+=3){const U=w+0,P=w+1,L=w+2;m.push(U,P,P,L,L,U)}}else return;const x=new(D_(m)?Rp:Cp)(m,1);x.version=M;const _=s.get(p);_&&e.remove(_),s.set(p,x)}function f(p){const m=s.get(p);if(m){const g=p.index;g!==null&&m.version<g.version&&h(p)}else h(p);return s.get(p)}return{get:c,update:u,getWireframeAttribute:f}}function LE(r,e,t){let n;function i(m){n=m}let s,a;function c(m){s=m.type,a=m.bytesPerElement}function u(m,g){r.drawElements(n,g,s,m*a),t.update(g,n,1)}function h(m,g,y){y!==0&&(r.drawElementsInstanced(n,g,s,m*a,y),t.update(g,n,y))}function f(m,g,y){if(y===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,g,0,s,m,0,y);let x=0;for(let _=0;_<y;_++)x+=g[_];t.update(x,n,1)}function p(m,g,y,M){if(y===0)return;const x=e.get("WEBGL_multi_draw");if(x===null)for(let _=0;_<m.length;_++)h(m[_]/a,g[_],M[_]);else{x.multiDrawElementsInstancedWEBGL(n,g,0,s,m,0,M,0,y);let _=0;for(let E=0;E<y;E++)_+=g[E];for(let E=0;E<M.length;E++)t.update(_,n,M[E])}}this.setMode=i,this.setIndex=c,this.render=u,this.renderInstances=h,this.renderMultiDraw=f,this.renderMultiDrawInstances=p}function DE(r){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,c){switch(t.calls++,a){case r.TRIANGLES:t.triangles+=c*(s/3);break;case r.LINES:t.lines+=c*(s/2);break;case r.LINE_STRIP:t.lines+=c*(s-1);break;case r.LINE_LOOP:t.lines+=c*s;break;case r.POINTS:t.points+=c*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function UE(r,e,t){const n=new WeakMap,i=new xt;function s(a,c,u){const h=a.morphTargetInfluences,f=c.morphAttributes.position||c.morphAttributes.normal||c.morphAttributes.color,p=f!==void 0?f.length:0;let m=n.get(c);if(m===void 0||m.count!==p){let k=function(){L.dispose(),n.delete(c),c.removeEventListener("dispose",k)};m!==void 0&&m.texture.dispose();const g=c.morphAttributes.position!==void 0,y=c.morphAttributes.normal!==void 0,M=c.morphAttributes.color!==void 0,x=c.morphAttributes.position||[],_=c.morphAttributes.normal||[],E=c.morphAttributes.color||[];let w=0;g===!0&&(w=1),y===!0&&(w=2),M===!0&&(w=3);let T=c.attributes.position.count*w,U=1;T>e.maxTextureSize&&(U=Math.ceil(T/e.maxTextureSize),T=e.maxTextureSize);const P=new Float32Array(T*U*4*p),L=new _h(P,T,U,p);L.type=qn,L.needsUpdate=!0;const O=w*4;for(let b=0;b<p;b++){const C=x[b],W=_[b],q=E[b],J=T*U*4*b;for(let re=0;re<C.count;re++){const j=re*O;g===!0&&(i.fromBufferAttribute(C,re),P[J+j+0]=i.x,P[J+j+1]=i.y,P[J+j+2]=i.z,P[J+j+3]=0),y===!0&&(i.fromBufferAttribute(W,re),P[J+j+4]=i.x,P[J+j+5]=i.y,P[J+j+6]=i.z,P[J+j+7]=0),M===!0&&(i.fromBufferAttribute(q,re),P[J+j+8]=i.x,P[J+j+9]=i.y,P[J+j+10]=i.z,P[J+j+11]=q.itemSize===4?i.w:1)}}m={count:p,texture:L,size:new pe(T,U)},n.set(c,m),c.addEventListener("dispose",k)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)u.getUniforms().setValue(r,"morphTexture",a.morphTexture,t);else{let g=0;for(let M=0;M<h.length;M++)g+=h[M];const y=c.morphTargetsRelative?1:1-g;u.getUniforms().setValue(r,"morphTargetBaseInfluence",y),u.getUniforms().setValue(r,"morphTargetInfluences",h)}u.getUniforms().setValue(r,"morphTargetsTexture",m.texture,t),u.getUniforms().setValue(r,"morphTargetsTextureSize",m.size)}return{update:s}}function NE(r,e,t,n){let i=new WeakMap;function s(u){const h=n.render.frame,f=u.geometry,p=e.get(u,f);if(i.get(p)!==h&&(e.update(p),i.set(p,h)),u.isInstancedMesh&&(u.hasEventListener("dispose",c)===!1&&u.addEventListener("dispose",c),i.get(u)!==h&&(t.update(u.instanceMatrix,r.ARRAY_BUFFER),u.instanceColor!==null&&t.update(u.instanceColor,r.ARRAY_BUFFER),i.set(u,h))),u.isSkinnedMesh){const m=u.skeleton;i.get(m)!==h&&(m.update(),i.set(m,h))}return p}function a(){i=new WeakMap}function c(u){const h=u.target;h.removeEventListener("dispose",c),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:s,dispose:a}}class Ip extends Zt{constructor(e,t,n,i,s,a,c,u,h,f=Es){if(f!==Es&&f!==Ls)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&f===Es&&(n=vr),n===void 0&&f===Ls&&(n=Is),super(null,i,s,a,c,u,f,n,h),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=c!==void 0?c:dn,this.minFilter=u!==void 0?u:dn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const V_=new Zt,c0=new Ip(1,1),G_=new _h,W_=new bp,X_=new al,u0=[],h0=[],f0=new Float32Array(16),d0=new Float32Array(9),p0=new Float32Array(4);function zo(r,e,t){const n=r[0];if(n<=0||n>0)return r;const i=e*t;let s=u0[i];if(s===void 0&&(s=new Float32Array(i),u0[i]=s),e!==0){n.toArray(s,0);for(let a=1,c=0;a!==e;++a)c+=t,r[a].toArray(s,c)}return s}function an(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function ln(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function yh(r,e){let t=h0[e];t===void 0&&(t=new Int32Array(e),h0[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function FE(r,e){const t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function OE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(an(t,e))return;r.uniform2fv(this.addr,e),ln(t,e)}}function BE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(an(t,e))return;r.uniform3fv(this.addr,e),ln(t,e)}}function zE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(an(t,e))return;r.uniform4fv(this.addr,e),ln(t,e)}}function kE(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(an(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),ln(t,e)}else{if(an(t,n))return;p0.set(n),r.uniformMatrix2fv(this.addr,!1,p0),ln(t,n)}}function HE(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(an(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),ln(t,e)}else{if(an(t,n))return;d0.set(n),r.uniformMatrix3fv(this.addr,!1,d0),ln(t,n)}}function VE(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(an(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),ln(t,e)}else{if(an(t,n))return;f0.set(n),r.uniformMatrix4fv(this.addr,!1,f0),ln(t,n)}}function GE(r,e){const t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function WE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(an(t,e))return;r.uniform2iv(this.addr,e),ln(t,e)}}function XE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(an(t,e))return;r.uniform3iv(this.addr,e),ln(t,e)}}function YE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(an(t,e))return;r.uniform4iv(this.addr,e),ln(t,e)}}function qE(r,e){const t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function jE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(an(t,e))return;r.uniform2uiv(this.addr,e),ln(t,e)}}function ZE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(an(t,e))return;r.uniform3uiv(this.addr,e),ln(t,e)}}function JE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(an(t,e))return;r.uniform4uiv(this.addr,e),ln(t,e)}}function KE(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i);let s;this.type===r.SAMPLER_2D_SHADOW?(c0.compareFunction=Ap,s=c0):s=V_,t.setTexture2D(e||s,i)}function QE(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||W_,i)}function $E(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||X_,i)}function eA(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||G_,i)}function tA(r){switch(r){case 5126:return FE;case 35664:return OE;case 35665:return BE;case 35666:return zE;case 35674:return kE;case 35675:return HE;case 35676:return VE;case 5124:case 35670:return GE;case 35667:case 35671:return WE;case 35668:case 35672:return XE;case 35669:case 35673:return YE;case 5125:return qE;case 36294:return jE;case 36295:return ZE;case 36296:return JE;case 35678:case 36198:case 36298:case 36306:case 35682:return KE;case 35679:case 36299:case 36307:return QE;case 35680:case 36300:case 36308:case 36293:return $E;case 36289:case 36303:case 36311:case 36292:return eA}}function nA(r,e){r.uniform1fv(this.addr,e)}function iA(r,e){const t=zo(e,this.size,2);r.uniform2fv(this.addr,t)}function rA(r,e){const t=zo(e,this.size,3);r.uniform3fv(this.addr,t)}function sA(r,e){const t=zo(e,this.size,4);r.uniform4fv(this.addr,t)}function oA(r,e){const t=zo(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function aA(r,e){const t=zo(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function lA(r,e){const t=zo(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function cA(r,e){r.uniform1iv(this.addr,e)}function uA(r,e){r.uniform2iv(this.addr,e)}function hA(r,e){r.uniform3iv(this.addr,e)}function fA(r,e){r.uniform4iv(this.addr,e)}function dA(r,e){r.uniform1uiv(this.addr,e)}function pA(r,e){r.uniform2uiv(this.addr,e)}function mA(r,e){r.uniform3uiv(this.addr,e)}function gA(r,e){r.uniform4uiv(this.addr,e)}function vA(r,e,t){const n=this.cache,i=e.length,s=yh(t,i);an(n,s)||(r.uniform1iv(this.addr,s),ln(n,s));for(let a=0;a!==i;++a)t.setTexture2D(e[a]||V_,s[a])}function _A(r,e,t){const n=this.cache,i=e.length,s=yh(t,i);an(n,s)||(r.uniform1iv(this.addr,s),ln(n,s));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||W_,s[a])}function yA(r,e,t){const n=this.cache,i=e.length,s=yh(t,i);an(n,s)||(r.uniform1iv(this.addr,s),ln(n,s));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||X_,s[a])}function xA(r,e,t){const n=this.cache,i=e.length,s=yh(t,i);an(n,s)||(r.uniform1iv(this.addr,s),ln(n,s));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||G_,s[a])}function SA(r){switch(r){case 5126:return nA;case 35664:return iA;case 35665:return rA;case 35666:return sA;case 35674:return oA;case 35675:return aA;case 35676:return lA;case 5124:case 35670:return cA;case 35667:case 35671:return uA;case 35668:case 35672:return hA;case 35669:case 35673:return fA;case 5125:return dA;case 36294:return pA;case 36295:return mA;case 36296:return gA;case 35678:case 36198:case 36298:case 36306:case 35682:return vA;case 35679:case 36299:case 36307:return _A;case 35680:case 36300:case 36308:case 36293:return yA;case 36289:case 36303:case 36311:case 36292:return xA}}class MA{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=tA(t.type)}}class wA{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=SA(t.type)}}class EA{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let s=0,a=i.length;s!==a;++s){const c=i[s];c.setValue(e,t[c.id],n)}}}const yd=/(\w+)(\])?(\[|\.)?/g;function m0(r,e){r.seq.push(e),r.map[e.id]=e}function AA(r,e,t){const n=r.name,i=n.length;for(yd.lastIndex=0;;){const s=yd.exec(n),a=yd.lastIndex;let c=s[1];const u=s[2]==="]",h=s[3];if(u&&(c=c|0),h===void 0||h==="["&&a+2===i){m0(t,h===void 0?new MA(c,r,e):new wA(c,r,e));break}else{let p=t.map[c];p===void 0&&(p=new EA(c),m0(t,p)),t=p}}}class gu{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const s=e.getActiveUniform(t,i),a=e.getUniformLocation(t,s.name);AA(s,a,this)}}setValue(e,t,n,i){const s=this.map[t];s!==void 0&&s.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,a=t.length;s!==a;++s){const c=t[s],u=n[c.id];u.needsUpdate!==!1&&c.setValue(e,u.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,s=e.length;i!==s;++i){const a=e[i];a.id in t&&n.push(a)}return n}}function g0(r,e,t){const n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}const TA=37297;let bA=0;function CA(r,e){const t=r.split(`
`),n=[],i=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=i;a<s;a++){const c=a+1;n.push(`${c===e?">":" "} ${c}: ${t[a]}`)}return n.join(`
`)}function RA(r){const e=Dt.getPrimaries(Dt.workingColorSpace),t=Dt.getPrimaries(r);let n;switch(e===t?n="":e===Wa&&t===Ga?n="LinearDisplayP3ToLinearSRGB":e===Ga&&t===Wa&&(n="LinearSRGBToLinearDisplayP3"),r){case yr:case sl:return[n,"LinearTransferOETF"];case Xn:case vh:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",r),[n,"LinearTransferOETF"]}}function v0(r,e,t){const n=r.getShaderParameter(e,r.COMPILE_STATUS),i=r.getShaderInfoLog(e).trim();if(n&&i==="")return"";const s=/ERROR: 0:(\d+)/.exec(i);if(s){const a=parseInt(s[1]);return t.toUpperCase()+`

`+i+`

`+CA(r.getShaderSource(e),a)}else return i}function PA(r,e){const t=RA(e);return`vec4 ${r}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function IA(r,e){let t;switch(e){case f_:t="Linear";break;case d_:t="Reinhard";break;case p_:t="Cineon";break;case dp:t="ACESFilmic";break;case g_:t="AgX";break;case v_:t="Neutral";break;case m_:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Nc=new D;function LA(){Dt.getLuminanceCoefficients(Nc);const r=Nc.x.toFixed(4),e=Nc.y.toFixed(4),t=Nc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function DA(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Aa).join(`
`)}function UA(r){const e=[];for(const t in r){const n=r[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function NA(r,e){const t={},n=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const s=r.getActiveAttrib(e,i),a=s.name;let c=1;s.type===r.FLOAT_MAT2&&(c=2),s.type===r.FLOAT_MAT3&&(c=3),s.type===r.FLOAT_MAT4&&(c=4),t[a]={type:s.type,location:r.getAttribLocation(e,a),locationSize:c}}return t}function Aa(r){return r!==""}function _0(r,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function y0(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const FA=/^[ \t]*#include +<([\w\d./]+)>/gm;function tp(r){return r.replace(FA,BA)}const OA=new Map;function BA(r,e){let t=mt[e];if(t===void 0){const n=OA.get(e);if(n!==void 0)t=mt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return tp(t)}const zA=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function x0(r){return r.replace(zA,kA)}function kA(r,e,t,n){let i="";for(let s=parseInt(e);s<parseInt(t);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function S0(r){let e=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?e+=`
#define HIGH_PRECISION`:r.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function HA(r){let e="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===lh?e="SHADOWMAP_TYPE_PCF":r.shadowMapType===Ta?e="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===Ti&&(e="SHADOWMAP_TYPE_VSM"),e}function VA(r){let e="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case gr:case Vr:e="ENVMAP_TYPE_CUBE";break;case No:e="ENVMAP_TYPE_CUBE_UV";break}return e}function GA(r){let e="ENVMAP_MODE_REFLECTION";if(r.envMap)switch(r.envMapMode){case Vr:e="ENVMAP_MODE_REFRACTION";break}return e}function WA(r){let e="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case il:e="ENVMAP_BLENDING_MULTIPLY";break;case u_:e="ENVMAP_BLENDING_MIX";break;case h_:e="ENVMAP_BLENDING_ADD";break}return e}function XA(r){const e=r.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function YA(r,e,t,n){const i=r.getContext(),s=t.defines;let a=t.vertexShader,c=t.fragmentShader;const u=HA(t),h=VA(t),f=GA(t),p=WA(t),m=XA(t),g=DA(t),y=UA(s),M=i.createProgram();let x,_,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(x=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,y].filter(Aa).join(`
`),x.length>0&&(x+=`
`),_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,y].filter(Aa).join(`
`),_.length>0&&(_+=`
`)):(x=[S0(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,y,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+f:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+u:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Aa).join(`
`),_=[S0(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,y,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.envMap?"#define "+f:"",t.envMap?"#define "+p:"",m?"#define CUBEUV_TEXEL_WIDTH "+m.texelWidth:"",m?"#define CUBEUV_TEXEL_HEIGHT "+m.texelHeight:"",m?"#define CUBEUV_MAX_MIP "+m.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+u:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==qi?"#define TONE_MAPPING":"",t.toneMapping!==qi?mt.tonemapping_pars_fragment:"",t.toneMapping!==qi?IA("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",mt.colorspace_pars_fragment,PA("linearToOutputTexel",t.outputColorSpace),LA(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Aa).join(`
`)),a=tp(a),a=_0(a,t),a=y0(a,t),c=tp(c),c=_0(c,t),c=y0(c,t),a=x0(a),c=x0(c),t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,x=[g,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+x,_=["#define varying in",t.glslVersion===$d?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===$d?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+_);const w=E+x+a,T=E+_+c,U=g0(i,i.VERTEX_SHADER,w),P=g0(i,i.FRAGMENT_SHADER,T);i.attachShader(M,U),i.attachShader(M,P),t.index0AttributeName!==void 0?i.bindAttribLocation(M,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(M,0,"position"),i.linkProgram(M);function L(C){if(r.debug.checkShaderErrors){const W=i.getProgramInfoLog(M).trim(),q=i.getShaderInfoLog(U).trim(),J=i.getShaderInfoLog(P).trim();let re=!0,j=!0;if(i.getProgramParameter(M,i.LINK_STATUS)===!1)if(re=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,M,U,P);else{const fe=v0(i,U,"vertex"),z=v0(i,P,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(M,i.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+W+`
`+fe+`
`+z)}else W!==""?console.warn("THREE.WebGLProgram: Program Info Log:",W):(q===""||J==="")&&(j=!1);j&&(C.diagnostics={runnable:re,programLog:W,vertexShader:{log:q,prefix:x},fragmentShader:{log:J,prefix:_}})}i.deleteShader(U),i.deleteShader(P),O=new gu(i,M),k=NA(i,M)}let O;this.getUniforms=function(){return O===void 0&&L(this),O};let k;this.getAttributes=function(){return k===void 0&&L(this),k};let b=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=i.getProgramParameter(M,TA)),b},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(M),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=bA++,this.cacheKey=e,this.usedTimes=1,this.program=M,this.vertexShader=U,this.fragmentShader=P,this}let qA=0;class jA{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new ZA(e),t.set(e,n)),n}}class ZA{constructor(e){this.id=qA++,this.code=e,this.usedTimes=0}}function JA(r,e,t,n,i,s,a){const c=new Ts,u=new jA,h=new Set,f=[],p=i.logarithmicDepthBuffer,m=i.reverseDepthBuffer,g=i.vertexTextures;let y=i.precision;const M={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(b){return h.add(b),b===0?"uv":`uv${b}`}function _(b,C,W,q,J){const re=q.fog,j=J.geometry,fe=b.isMeshStandardMaterial?q.environment:null,z=(b.isMeshStandardMaterial?t:e).get(b.envMap||fe),ae=z&&z.mapping===No?z.image.height:null,ee=M[b.type];b.precision!==null&&(y=i.getMaxPrecision(b.precision),y!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",y,"instead."));const le=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,Pe=le!==void 0?le.length:0;let Ne=0;j.morphAttributes.position!==void 0&&(Ne=1),j.morphAttributes.normal!==void 0&&(Ne=2),j.morphAttributes.color!==void 0&&(Ne=3);let ne,me,Ce,Ae;if(ee){const gn=bi[ee];ne=gn.vertexShader,me=gn.fragmentShader}else ne=b.vertexShader,me=b.fragmentShader,u.update(b),Ce=u.getVertexShaderID(b),Ae=u.getFragmentShaderID(b);const tt=r.getRenderTarget(),nt=J.isInstancedMesh===!0,Ze=J.isBatchedMesh===!0,Re=!!b.map,he=!!b.matcap,N=!!z,we=!!b.aoMap,xe=!!b.lightMap,ve=!!b.bumpMap,Se=!!b.normalMap,Je=!!b.displacementMap,Le=!!b.emissiveMap,F=!!b.metalnessMap,R=!!b.roughnessMap,Z=b.anisotropy>0,ce=b.clearcoat>0,de=b.dispersion>0,ue=b.iridescence>0,qe=b.sheen>0,Ee=b.transmission>0,ke=Z&&!!b.anisotropyMap,St=ce&&!!b.clearcoatMap,_e=ce&&!!b.clearcoatNormalMap,He=ce&&!!b.clearcoatRoughnessMap,at=ue&&!!b.iridescenceMap,lt=ue&&!!b.iridescenceThicknessMap,Ve=qe&&!!b.sheenColorMap,Mt=qe&&!!b.sheenRoughnessMap,ut=!!b.specularMap,Nt=!!b.specularColorMap,V=!!b.specularIntensityMap,Be=Ee&&!!b.transmissionMap,se=Ee&&!!b.thicknessMap,ge=!!b.gradientMap,Fe=!!b.alphaMap,ze=b.alphaTest>0,wt=!!b.alphaHash,Gt=!!b.extensions;let Mn=qi;b.toneMapped&&(tt===null||tt.isXRRenderTarget===!0)&&(Mn=r.toneMapping);const Et={shaderID:ee,shaderType:b.type,shaderName:b.name,vertexShader:ne,fragmentShader:me,defines:b.defines,customVertexShaderID:Ce,customFragmentShaderID:Ae,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:y,batching:Ze,batchingColor:Ze&&J._colorsTexture!==null,instancing:nt,instancingColor:nt&&J.instanceColor!==null,instancingMorph:nt&&J.morphTexture!==null,supportsVertexTextures:g,outputColorSpace:tt===null?r.outputColorSpace:tt.isXRRenderTarget===!0?tt.texture.colorSpace:yr,alphaToCoverage:!!b.alphaToCoverage,map:Re,matcap:he,envMap:N,envMapMode:N&&z.mapping,envMapCubeUVHeight:ae,aoMap:we,lightMap:xe,bumpMap:ve,normalMap:Se,displacementMap:g&&Je,emissiveMap:Le,normalMapObjectSpace:Se&&b.normalMapType===E_,normalMapTangentSpace:Se&&b.normalMapType===Wr,metalnessMap:F,roughnessMap:R,anisotropy:Z,anisotropyMap:ke,clearcoat:ce,clearcoatMap:St,clearcoatNormalMap:_e,clearcoatRoughnessMap:He,dispersion:de,iridescence:ue,iridescenceMap:at,iridescenceThicknessMap:lt,sheen:qe,sheenColorMap:Ve,sheenRoughnessMap:Mt,specularMap:ut,specularColorMap:Nt,specularIntensityMap:V,transmission:Ee,transmissionMap:Be,thicknessMap:se,gradientMap:ge,opaque:b.transparent===!1&&b.blending===ws&&b.alphaToCoverage===!1,alphaMap:Fe,alphaTest:ze,alphaHash:wt,combine:b.combine,mapUv:Re&&x(b.map.channel),aoMapUv:we&&x(b.aoMap.channel),lightMapUv:xe&&x(b.lightMap.channel),bumpMapUv:ve&&x(b.bumpMap.channel),normalMapUv:Se&&x(b.normalMap.channel),displacementMapUv:Je&&x(b.displacementMap.channel),emissiveMapUv:Le&&x(b.emissiveMap.channel),metalnessMapUv:F&&x(b.metalnessMap.channel),roughnessMapUv:R&&x(b.roughnessMap.channel),anisotropyMapUv:ke&&x(b.anisotropyMap.channel),clearcoatMapUv:St&&x(b.clearcoatMap.channel),clearcoatNormalMapUv:_e&&x(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:He&&x(b.clearcoatRoughnessMap.channel),iridescenceMapUv:at&&x(b.iridescenceMap.channel),iridescenceThicknessMapUv:lt&&x(b.iridescenceThicknessMap.channel),sheenColorMapUv:Ve&&x(b.sheenColorMap.channel),sheenRoughnessMapUv:Mt&&x(b.sheenRoughnessMap.channel),specularMapUv:ut&&x(b.specularMap.channel),specularColorMapUv:Nt&&x(b.specularColorMap.channel),specularIntensityMapUv:V&&x(b.specularIntensityMap.channel),transmissionMapUv:Be&&x(b.transmissionMap.channel),thicknessMapUv:se&&x(b.thicknessMap.channel),alphaMapUv:Fe&&x(b.alphaMap.channel),vertexTangents:!!j.attributes.tangent&&(Se||Z),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,pointsUvs:J.isPoints===!0&&!!j.attributes.uv&&(Re||Fe),fog:!!re,useFog:b.fog===!0,fogExp2:!!re&&re.isFogExp2,flatShading:b.flatShading===!0,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:p,reverseDepthBuffer:m,skinning:J.isSkinnedMesh===!0,morphTargets:j.morphAttributes.position!==void 0,morphNormals:j.morphAttributes.normal!==void 0,morphColors:j.morphAttributes.color!==void 0,morphTargetsCount:Pe,morphTextureStride:Ne,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numSpotLightMaps:C.spotLightMap.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numSpotLightShadowsWithMaps:C.numSpotLightShadowsWithMaps,numLightProbes:C.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:b.dithering,shadowMapEnabled:r.shadowMap.enabled&&W.length>0,shadowMapType:r.shadowMap.type,toneMapping:Mn,decodeVideoTexture:Re&&b.map.isVideoTexture===!0&&Dt.getTransfer(b.map.colorSpace)===zt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===ri,flipSided:b.side===In,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:Gt&&b.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Gt&&b.extensions.multiDraw===!0||Ze)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return Et.vertexUv1s=h.has(1),Et.vertexUv2s=h.has(2),Et.vertexUv3s=h.has(3),h.clear(),Et}function E(b){const C=[];if(b.shaderID?C.push(b.shaderID):(C.push(b.customVertexShaderID),C.push(b.customFragmentShaderID)),b.defines!==void 0)for(const W in b.defines)C.push(W),C.push(b.defines[W]);return b.isRawShaderMaterial===!1&&(w(C,b),T(C,b),C.push(r.outputColorSpace)),C.push(b.customProgramCacheKey),C.join()}function w(b,C){b.push(C.precision),b.push(C.outputColorSpace),b.push(C.envMapMode),b.push(C.envMapCubeUVHeight),b.push(C.mapUv),b.push(C.alphaMapUv),b.push(C.lightMapUv),b.push(C.aoMapUv),b.push(C.bumpMapUv),b.push(C.normalMapUv),b.push(C.displacementMapUv),b.push(C.emissiveMapUv),b.push(C.metalnessMapUv),b.push(C.roughnessMapUv),b.push(C.anisotropyMapUv),b.push(C.clearcoatMapUv),b.push(C.clearcoatNormalMapUv),b.push(C.clearcoatRoughnessMapUv),b.push(C.iridescenceMapUv),b.push(C.iridescenceThicknessMapUv),b.push(C.sheenColorMapUv),b.push(C.sheenRoughnessMapUv),b.push(C.specularMapUv),b.push(C.specularColorMapUv),b.push(C.specularIntensityMapUv),b.push(C.transmissionMapUv),b.push(C.thicknessMapUv),b.push(C.combine),b.push(C.fogExp2),b.push(C.sizeAttenuation),b.push(C.morphTargetsCount),b.push(C.morphAttributeCount),b.push(C.numDirLights),b.push(C.numPointLights),b.push(C.numSpotLights),b.push(C.numSpotLightMaps),b.push(C.numHemiLights),b.push(C.numRectAreaLights),b.push(C.numDirLightShadows),b.push(C.numPointLightShadows),b.push(C.numSpotLightShadows),b.push(C.numSpotLightShadowsWithMaps),b.push(C.numLightProbes),b.push(C.shadowMapType),b.push(C.toneMapping),b.push(C.numClippingPlanes),b.push(C.numClipIntersection),b.push(C.depthPacking)}function T(b,C){c.disableAll(),C.supportsVertexTextures&&c.enable(0),C.instancing&&c.enable(1),C.instancingColor&&c.enable(2),C.instancingMorph&&c.enable(3),C.matcap&&c.enable(4),C.envMap&&c.enable(5),C.normalMapObjectSpace&&c.enable(6),C.normalMapTangentSpace&&c.enable(7),C.clearcoat&&c.enable(8),C.iridescence&&c.enable(9),C.alphaTest&&c.enable(10),C.vertexColors&&c.enable(11),C.vertexAlphas&&c.enable(12),C.vertexUv1s&&c.enable(13),C.vertexUv2s&&c.enable(14),C.vertexUv3s&&c.enable(15),C.vertexTangents&&c.enable(16),C.anisotropy&&c.enable(17),C.alphaHash&&c.enable(18),C.batching&&c.enable(19),C.dispersion&&c.enable(20),C.batchingColor&&c.enable(21),b.push(c.mask),c.disableAll(),C.fog&&c.enable(0),C.useFog&&c.enable(1),C.flatShading&&c.enable(2),C.logarithmicDepthBuffer&&c.enable(3),C.reverseDepthBuffer&&c.enable(4),C.skinning&&c.enable(5),C.morphTargets&&c.enable(6),C.morphNormals&&c.enable(7),C.morphColors&&c.enable(8),C.premultipliedAlpha&&c.enable(9),C.shadowMapEnabled&&c.enable(10),C.doubleSided&&c.enable(11),C.flipSided&&c.enable(12),C.useDepthPacking&&c.enable(13),C.dithering&&c.enable(14),C.transmission&&c.enable(15),C.sheen&&c.enable(16),C.opaque&&c.enable(17),C.pointsUvs&&c.enable(18),C.decodeVideoTexture&&c.enable(19),C.alphaToCoverage&&c.enable(20),b.push(c.mask)}function U(b){const C=M[b.type];let W;if(C){const q=bi[C];W=nh.clone(q.uniforms)}else W=b.uniforms;return W}function P(b,C){let W;for(let q=0,J=f.length;q<J;q++){const re=f[q];if(re.cacheKey===C){W=re,++W.usedTimes;break}}return W===void 0&&(W=new YA(r,C,b,s),f.push(W)),W}function L(b){if(--b.usedTimes===0){const C=f.indexOf(b);f[C]=f[f.length-1],f.pop(),b.destroy()}}function O(b){u.remove(b)}function k(){u.dispose()}return{getParameters:_,getProgramCacheKey:E,getUniforms:U,acquireProgram:P,releaseProgram:L,releaseShaderCache:O,programs:f,dispose:k}}function KA(){let r=new WeakMap;function e(a){return r.has(a)}function t(a){let c=r.get(a);return c===void 0&&(c={},r.set(a,c)),c}function n(a){r.delete(a)}function i(a,c,u){r.get(a)[c]=u}function s(){r=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:s}}function QA(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function M0(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function w0(){const r=[];let e=0;const t=[],n=[],i=[];function s(){e=0,t.length=0,n.length=0,i.length=0}function a(p,m,g,y,M,x){let _=r[e];return _===void 0?(_={id:p.id,object:p,geometry:m,material:g,groupOrder:y,renderOrder:p.renderOrder,z:M,group:x},r[e]=_):(_.id=p.id,_.object=p,_.geometry=m,_.material=g,_.groupOrder=y,_.renderOrder=p.renderOrder,_.z=M,_.group=x),e++,_}function c(p,m,g,y,M,x){const _=a(p,m,g,y,M,x);g.transmission>0?n.push(_):g.transparent===!0?i.push(_):t.push(_)}function u(p,m,g,y,M,x){const _=a(p,m,g,y,M,x);g.transmission>0?n.unshift(_):g.transparent===!0?i.unshift(_):t.unshift(_)}function h(p,m){t.length>1&&t.sort(p||QA),n.length>1&&n.sort(m||M0),i.length>1&&i.sort(m||M0)}function f(){for(let p=e,m=r.length;p<m;p++){const g=r[p];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:i,init:s,push:c,unshift:u,finish:f,sort:h}}function $A(){let r=new WeakMap;function e(n,i){const s=r.get(n);let a;return s===void 0?(a=new w0,r.set(n,[a])):i>=s.length?(a=new w0,s.push(a)):a=s[i],a}function t(){r=new WeakMap}return{get:e,dispose:t}}function eT(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new D,color:new Ue};break;case"SpotLight":t={position:new D,direction:new D,color:new Ue,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new Ue,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new Ue,groundColor:new Ue};break;case"RectAreaLight":t={color:new Ue,position:new D,halfWidth:new D,halfHeight:new D};break}return r[e.id]=t,t}}}function tT(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}let nT=0;function iT(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function rT(r){const e=new eT,t=tT(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)n.probe.push(new D);const i=new D,s=new rt,a=new rt;function c(h){let f=0,p=0,m=0;for(let k=0;k<9;k++)n.probe[k].set(0,0,0);let g=0,y=0,M=0,x=0,_=0,E=0,w=0,T=0,U=0,P=0,L=0;h.sort(iT);for(let k=0,b=h.length;k<b;k++){const C=h[k],W=C.color,q=C.intensity,J=C.distance,re=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)f+=W.r*q,p+=W.g*q,m+=W.b*q;else if(C.isLightProbe){for(let j=0;j<9;j++)n.probe[j].addScaledVector(C.sh.coefficients[j],q);L++}else if(C.isDirectionalLight){const j=e.get(C);if(j.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){const fe=C.shadow,z=t.get(C);z.shadowIntensity=fe.intensity,z.shadowBias=fe.bias,z.shadowNormalBias=fe.normalBias,z.shadowRadius=fe.radius,z.shadowMapSize=fe.mapSize,n.directionalShadow[g]=z,n.directionalShadowMap[g]=re,n.directionalShadowMatrix[g]=C.shadow.matrix,E++}n.directional[g]=j,g++}else if(C.isSpotLight){const j=e.get(C);j.position.setFromMatrixPosition(C.matrixWorld),j.color.copy(W).multiplyScalar(q),j.distance=J,j.coneCos=Math.cos(C.angle),j.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),j.decay=C.decay,n.spot[M]=j;const fe=C.shadow;if(C.map&&(n.spotLightMap[U]=C.map,U++,fe.updateMatrices(C),C.castShadow&&P++),n.spotLightMatrix[M]=fe.matrix,C.castShadow){const z=t.get(C);z.shadowIntensity=fe.intensity,z.shadowBias=fe.bias,z.shadowNormalBias=fe.normalBias,z.shadowRadius=fe.radius,z.shadowMapSize=fe.mapSize,n.spotShadow[M]=z,n.spotShadowMap[M]=re,T++}M++}else if(C.isRectAreaLight){const j=e.get(C);j.color.copy(W).multiplyScalar(q),j.halfWidth.set(C.width*.5,0,0),j.halfHeight.set(0,C.height*.5,0),n.rectArea[x]=j,x++}else if(C.isPointLight){const j=e.get(C);if(j.color.copy(C.color).multiplyScalar(C.intensity),j.distance=C.distance,j.decay=C.decay,C.castShadow){const fe=C.shadow,z=t.get(C);z.shadowIntensity=fe.intensity,z.shadowBias=fe.bias,z.shadowNormalBias=fe.normalBias,z.shadowRadius=fe.radius,z.shadowMapSize=fe.mapSize,z.shadowCameraNear=fe.camera.near,z.shadowCameraFar=fe.camera.far,n.pointShadow[y]=z,n.pointShadowMap[y]=re,n.pointShadowMatrix[y]=C.shadow.matrix,w++}n.point[y]=j,y++}else if(C.isHemisphereLight){const j=e.get(C);j.skyColor.copy(C.color).multiplyScalar(q),j.groundColor.copy(C.groundColor).multiplyScalar(q),n.hemi[_]=j,_++}}x>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=be.LTC_FLOAT_1,n.rectAreaLTC2=be.LTC_FLOAT_2):(n.rectAreaLTC1=be.LTC_HALF_1,n.rectAreaLTC2=be.LTC_HALF_2)),n.ambient[0]=f,n.ambient[1]=p,n.ambient[2]=m;const O=n.hash;(O.directionalLength!==g||O.pointLength!==y||O.spotLength!==M||O.rectAreaLength!==x||O.hemiLength!==_||O.numDirectionalShadows!==E||O.numPointShadows!==w||O.numSpotShadows!==T||O.numSpotMaps!==U||O.numLightProbes!==L)&&(n.directional.length=g,n.spot.length=M,n.rectArea.length=x,n.point.length=y,n.hemi.length=_,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.pointShadow.length=w,n.pointShadowMap.length=w,n.spotShadow.length=T,n.spotShadowMap.length=T,n.directionalShadowMatrix.length=E,n.pointShadowMatrix.length=w,n.spotLightMatrix.length=T+U-P,n.spotLightMap.length=U,n.numSpotLightShadowsWithMaps=P,n.numLightProbes=L,O.directionalLength=g,O.pointLength=y,O.spotLength=M,O.rectAreaLength=x,O.hemiLength=_,O.numDirectionalShadows=E,O.numPointShadows=w,O.numSpotShadows=T,O.numSpotMaps=U,O.numLightProbes=L,n.version=nT++)}function u(h,f){let p=0,m=0,g=0,y=0,M=0;const x=f.matrixWorldInverse;for(let _=0,E=h.length;_<E;_++){const w=h[_];if(w.isDirectionalLight){const T=n.directional[p];T.direction.setFromMatrixPosition(w.matrixWorld),i.setFromMatrixPosition(w.target.matrixWorld),T.direction.sub(i),T.direction.transformDirection(x),p++}else if(w.isSpotLight){const T=n.spot[g];T.position.setFromMatrixPosition(w.matrixWorld),T.position.applyMatrix4(x),T.direction.setFromMatrixPosition(w.matrixWorld),i.setFromMatrixPosition(w.target.matrixWorld),T.direction.sub(i),T.direction.transformDirection(x),g++}else if(w.isRectAreaLight){const T=n.rectArea[y];T.position.setFromMatrixPosition(w.matrixWorld),T.position.applyMatrix4(x),a.identity(),s.copy(w.matrixWorld),s.premultiply(x),a.extractRotation(s),T.halfWidth.set(w.width*.5,0,0),T.halfHeight.set(0,w.height*.5,0),T.halfWidth.applyMatrix4(a),T.halfHeight.applyMatrix4(a),y++}else if(w.isPointLight){const T=n.point[m];T.position.setFromMatrixPosition(w.matrixWorld),T.position.applyMatrix4(x),m++}else if(w.isHemisphereLight){const T=n.hemi[M];T.direction.setFromMatrixPosition(w.matrixWorld),T.direction.transformDirection(x),M++}}}return{setup:c,setupView:u,state:n}}function E0(r){const e=new rT(r),t=[],n=[];function i(f){h.camera=f,t.length=0,n.length=0}function s(f){t.push(f)}function a(f){n.push(f)}function c(){e.setup(t)}function u(f){e.setupView(t,f)}const h={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:h,setupLights:c,setupLightsView:u,pushLight:s,pushShadow:a}}function sT(r){let e=new WeakMap;function t(i,s=0){const a=e.get(i);let c;return a===void 0?(c=new E0(r),e.set(i,[c])):s>=a.length?(c=new E0(r),a.push(c)):c=a[s],c}function n(){e=new WeakMap}return{get:t,dispose:n}}class Lp extends Ln{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=M_,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Dp extends Ln{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const oT=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,aT=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function lT(r,e,t){let n=new ll;const i=new pe,s=new pe,a=new xt,c=new Lp({depthPacking:w_}),u=new Dp,h={},f=t.maxTextureSize,p={[mr]:In,[In]:mr,[ri]:ri},m=new Zn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new pe},radius:{value:4}},vertexShader:oT,fragmentShader:aT}),g=m.clone();g.defines.HORIZONTAL_PASS=1;const y=new vt;y.setAttribute("position",new Ft(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const M=new Qt(y,m),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=lh;let _=this.type;this.render=function(P,L,O){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||P.length===0)return;const k=r.getRenderTarget(),b=r.getActiveCubeFace(),C=r.getActiveMipmapLevel(),W=r.state;W.setBlending(pr),W.buffers.color.setClear(1,1,1,1),W.buffers.depth.setTest(!0),W.setScissorTest(!1);const q=_!==Ti&&this.type===Ti,J=_===Ti&&this.type!==Ti;for(let re=0,j=P.length;re<j;re++){const fe=P[re],z=fe.shadow;if(z===void 0){console.warn("THREE.WebGLShadowMap:",fe,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;i.copy(z.mapSize);const ae=z.getFrameExtents();if(i.multiply(ae),s.copy(z.mapSize),(i.x>f||i.y>f)&&(i.x>f&&(s.x=Math.floor(f/ae.x),i.x=s.x*ae.x,z.mapSize.x=s.x),i.y>f&&(s.y=Math.floor(f/ae.y),i.y=s.y*ae.y,z.mapSize.y=s.y)),z.map===null||q===!0||J===!0){const le=this.type!==Ti?{minFilter:dn,magFilter:dn}:{};z.map!==null&&z.map.dispose(),z.map=new Ri(i.x,i.y,le),z.map.texture.name=fe.name+".shadowMap",z.camera.updateProjectionMatrix()}r.setRenderTarget(z.map),r.clear();const ee=z.getViewportCount();for(let le=0;le<ee;le++){const Pe=z.getViewport(le);a.set(s.x*Pe.x,s.y*Pe.y,s.x*Pe.z,s.y*Pe.w),W.viewport(a),z.updateMatrices(fe,le),n=z.getFrustum(),T(L,O,z.camera,fe,this.type)}z.isPointLightShadow!==!0&&this.type===Ti&&E(z,O),z.needsUpdate=!1}_=this.type,x.needsUpdate=!1,r.setRenderTarget(k,b,C)};function E(P,L){const O=e.update(M);m.defines.VSM_SAMPLES!==P.blurSamples&&(m.defines.VSM_SAMPLES=P.blurSamples,g.defines.VSM_SAMPLES=P.blurSamples,m.needsUpdate=!0,g.needsUpdate=!0),P.mapPass===null&&(P.mapPass=new Ri(i.x,i.y)),m.uniforms.shadow_pass.value=P.map.texture,m.uniforms.resolution.value=P.mapSize,m.uniforms.radius.value=P.radius,r.setRenderTarget(P.mapPass),r.clear(),r.renderBufferDirect(L,null,O,m,M,null),g.uniforms.shadow_pass.value=P.mapPass.texture,g.uniforms.resolution.value=P.mapSize,g.uniforms.radius.value=P.radius,r.setRenderTarget(P.map),r.clear(),r.renderBufferDirect(L,null,O,g,M,null)}function w(P,L,O,k){let b=null;const C=O.isPointLight===!0?P.customDistanceMaterial:P.customDepthMaterial;if(C!==void 0)b=C;else if(b=O.isPointLight===!0?u:c,r.localClippingEnabled&&L.clipShadows===!0&&Array.isArray(L.clippingPlanes)&&L.clippingPlanes.length!==0||L.displacementMap&&L.displacementScale!==0||L.alphaMap&&L.alphaTest>0||L.map&&L.alphaTest>0){const W=b.uuid,q=L.uuid;let J=h[W];J===void 0&&(J={},h[W]=J);let re=J[q];re===void 0&&(re=b.clone(),J[q]=re,L.addEventListener("dispose",U)),b=re}if(b.visible=L.visible,b.wireframe=L.wireframe,k===Ti?b.side=L.shadowSide!==null?L.shadowSide:L.side:b.side=L.shadowSide!==null?L.shadowSide:p[L.side],b.alphaMap=L.alphaMap,b.alphaTest=L.alphaTest,b.map=L.map,b.clipShadows=L.clipShadows,b.clippingPlanes=L.clippingPlanes,b.clipIntersection=L.clipIntersection,b.displacementMap=L.displacementMap,b.displacementScale=L.displacementScale,b.displacementBias=L.displacementBias,b.wireframeLinewidth=L.wireframeLinewidth,b.linewidth=L.linewidth,O.isPointLight===!0&&b.isMeshDistanceMaterial===!0){const W=r.properties.get(b);W.light=O}return b}function T(P,L,O,k,b){if(P.visible===!1)return;if(P.layers.test(L.layers)&&(P.isMesh||P.isLine||P.isPoints)&&(P.castShadow||P.receiveShadow&&b===Ti)&&(!P.frustumCulled||n.intersectsObject(P))){P.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,P.matrixWorld);const q=e.update(P),J=P.material;if(Array.isArray(J)){const re=q.groups;for(let j=0,fe=re.length;j<fe;j++){const z=re[j],ae=J[z.materialIndex];if(ae&&ae.visible){const ee=w(P,ae,k,b);P.onBeforeShadow(r,P,L,O,q,ee,z),r.renderBufferDirect(O,null,q,ee,P,z),P.onAfterShadow(r,P,L,O,q,ee,z)}}}else if(J.visible){const re=w(P,J,k,b);P.onBeforeShadow(r,P,L,O,q,re,null),r.renderBufferDirect(O,null,q,re,P,null),P.onAfterShadow(r,P,L,O,q,re,null)}}const W=P.children;for(let q=0,J=W.length;q<J;q++)T(W[q],L,O,k,b)}function U(P){P.target.removeEventListener("dispose",U);for(const O in h){const k=h[O],b=P.target.uuid;b in k&&(k[b].dispose(),delete k[b])}}}const cT={[Mu]:wu,[Eu]:bu,[Au]:Cu,[Rs]:Tu,[wu]:Mu,[bu]:Eu,[Cu]:Au,[Tu]:Rs};function uT(r){function e(){let V=!1;const Be=new xt;let se=null;const ge=new xt(0,0,0,0);return{setMask:function(Fe){se!==Fe&&!V&&(r.colorMask(Fe,Fe,Fe,Fe),se=Fe)},setLocked:function(Fe){V=Fe},setClear:function(Fe,ze,wt,Gt,Mn){Mn===!0&&(Fe*=Gt,ze*=Gt,wt*=Gt),Be.set(Fe,ze,wt,Gt),ge.equals(Be)===!1&&(r.clearColor(Fe,ze,wt,Gt),ge.copy(Be))},reset:function(){V=!1,se=null,ge.set(-1,0,0,0)}}}function t(){let V=!1,Be=!1,se=null,ge=null,Fe=null;return{setReversed:function(ze){Be=ze},setTest:function(ze){ze?Ce(r.DEPTH_TEST):Ae(r.DEPTH_TEST)},setMask:function(ze){se!==ze&&!V&&(r.depthMask(ze),se=ze)},setFunc:function(ze){if(Be&&(ze=cT[ze]),ge!==ze){switch(ze){case Mu:r.depthFunc(r.NEVER);break;case wu:r.depthFunc(r.ALWAYS);break;case Eu:r.depthFunc(r.LESS);break;case Rs:r.depthFunc(r.LEQUAL);break;case Au:r.depthFunc(r.EQUAL);break;case Tu:r.depthFunc(r.GEQUAL);break;case bu:r.depthFunc(r.GREATER);break;case Cu:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}ge=ze}},setLocked:function(ze){V=ze},setClear:function(ze){Fe!==ze&&(r.clearDepth(ze),Fe=ze)},reset:function(){V=!1,se=null,ge=null,Fe=null}}}function n(){let V=!1,Be=null,se=null,ge=null,Fe=null,ze=null,wt=null,Gt=null,Mn=null;return{setTest:function(Et){V||(Et?Ce(r.STENCIL_TEST):Ae(r.STENCIL_TEST))},setMask:function(Et){Be!==Et&&!V&&(r.stencilMask(Et),Be=Et)},setFunc:function(Et,gn,li){(se!==Et||ge!==gn||Fe!==li)&&(r.stencilFunc(Et,gn,li),se=Et,ge=gn,Fe=li)},setOp:function(Et,gn,li){(ze!==Et||wt!==gn||Gt!==li)&&(r.stencilOp(Et,gn,li),ze=Et,wt=gn,Gt=li)},setLocked:function(Et){V=Et},setClear:function(Et){Mn!==Et&&(r.clearStencil(Et),Mn=Et)},reset:function(){V=!1,Be=null,se=null,ge=null,Fe=null,ze=null,wt=null,Gt=null,Mn=null}}}const i=new e,s=new t,a=new n,c=new WeakMap,u=new WeakMap;let h={},f={},p=new WeakMap,m=[],g=null,y=!1,M=null,x=null,_=null,E=null,w=null,T=null,U=null,P=new Ue(0,0,0),L=0,O=!1,k=null,b=null,C=null,W=null,q=null;const J=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let re=!1,j=0;const fe=r.getParameter(r.VERSION);fe.indexOf("WebGL")!==-1?(j=parseFloat(/^WebGL (\d)/.exec(fe)[1]),re=j>=1):fe.indexOf("OpenGL ES")!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(fe)[1]),re=j>=2);let z=null,ae={};const ee=r.getParameter(r.SCISSOR_BOX),le=r.getParameter(r.VIEWPORT),Pe=new xt().fromArray(ee),Ne=new xt().fromArray(le);function ne(V,Be,se,ge){const Fe=new Uint8Array(4),ze=r.createTexture();r.bindTexture(V,ze),r.texParameteri(V,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(V,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let wt=0;wt<se;wt++)V===r.TEXTURE_3D||V===r.TEXTURE_2D_ARRAY?r.texImage3D(Be,0,r.RGBA,1,1,ge,0,r.RGBA,r.UNSIGNED_BYTE,Fe):r.texImage2D(Be+wt,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,Fe);return ze}const me={};me[r.TEXTURE_2D]=ne(r.TEXTURE_2D,r.TEXTURE_2D,1),me[r.TEXTURE_CUBE_MAP]=ne(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),me[r.TEXTURE_2D_ARRAY]=ne(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),me[r.TEXTURE_3D]=ne(r.TEXTURE_3D,r.TEXTURE_3D,1,1),i.setClear(0,0,0,1),s.setClear(1),a.setClear(0),Ce(r.DEPTH_TEST),s.setFunc(Rs),xe(!1),ve(jd),Ce(r.CULL_FACE),N(pr);function Ce(V){h[V]!==!0&&(r.enable(V),h[V]=!0)}function Ae(V){h[V]!==!1&&(r.disable(V),h[V]=!1)}function tt(V,Be){return f[V]!==Be?(r.bindFramebuffer(V,Be),f[V]=Be,V===r.DRAW_FRAMEBUFFER&&(f[r.FRAMEBUFFER]=Be),V===r.FRAMEBUFFER&&(f[r.DRAW_FRAMEBUFFER]=Be),!0):!1}function nt(V,Be){let se=m,ge=!1;if(V){se=p.get(Be),se===void 0&&(se=[],p.set(Be,se));const Fe=V.textures;if(se.length!==Fe.length||se[0]!==r.COLOR_ATTACHMENT0){for(let ze=0,wt=Fe.length;ze<wt;ze++)se[ze]=r.COLOR_ATTACHMENT0+ze;se.length=Fe.length,ge=!0}}else se[0]!==r.BACK&&(se[0]=r.BACK,ge=!0);ge&&r.drawBuffers(se)}function Ze(V){return g!==V?(r.useProgram(V),g=V,!0):!1}const Re={[kr]:r.FUNC_ADD,[qv]:r.FUNC_SUBTRACT,[jv]:r.FUNC_REVERSE_SUBTRACT};Re[Zv]=r.MIN,Re[Jv]=r.MAX;const he={[Kv]:r.ZERO,[Qv]:r.ONE,[$v]:r.SRC_COLOR,[xu]:r.SRC_ALPHA,[s_]:r.SRC_ALPHA_SATURATE,[i_]:r.DST_COLOR,[t_]:r.DST_ALPHA,[e_]:r.ONE_MINUS_SRC_COLOR,[Su]:r.ONE_MINUS_SRC_ALPHA,[r_]:r.ONE_MINUS_DST_COLOR,[n_]:r.ONE_MINUS_DST_ALPHA,[o_]:r.CONSTANT_COLOR,[a_]:r.ONE_MINUS_CONSTANT_COLOR,[l_]:r.CONSTANT_ALPHA,[c_]:r.ONE_MINUS_CONSTANT_ALPHA};function N(V,Be,se,ge,Fe,ze,wt,Gt,Mn,Et){if(V===pr){y===!0&&(Ae(r.BLEND),y=!1);return}if(y===!1&&(Ce(r.BLEND),y=!0),V!==Yv){if(V!==M||Et!==O){if((x!==kr||w!==kr)&&(r.blendEquation(r.FUNC_ADD),x=kr,w=kr),Et)switch(V){case ws:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Fa:r.blendFunc(r.ONE,r.ONE);break;case Zd:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Jd:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}else switch(V){case ws:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Fa:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case Zd:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Jd:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}_=null,E=null,T=null,U=null,P.set(0,0,0),L=0,M=V,O=Et}return}Fe=Fe||Be,ze=ze||se,wt=wt||ge,(Be!==x||Fe!==w)&&(r.blendEquationSeparate(Re[Be],Re[Fe]),x=Be,w=Fe),(se!==_||ge!==E||ze!==T||wt!==U)&&(r.blendFuncSeparate(he[se],he[ge],he[ze],he[wt]),_=se,E=ge,T=ze,U=wt),(Gt.equals(P)===!1||Mn!==L)&&(r.blendColor(Gt.r,Gt.g,Gt.b,Mn),P.copy(Gt),L=Mn),M=V,O=!1}function we(V,Be){V.side===ri?Ae(r.CULL_FACE):Ce(r.CULL_FACE);let se=V.side===In;Be&&(se=!se),xe(se),V.blending===ws&&V.transparent===!1?N(pr):N(V.blending,V.blendEquation,V.blendSrc,V.blendDst,V.blendEquationAlpha,V.blendSrcAlpha,V.blendDstAlpha,V.blendColor,V.blendAlpha,V.premultipliedAlpha),s.setFunc(V.depthFunc),s.setTest(V.depthTest),s.setMask(V.depthWrite),i.setMask(V.colorWrite);const ge=V.stencilWrite;a.setTest(ge),ge&&(a.setMask(V.stencilWriteMask),a.setFunc(V.stencilFunc,V.stencilRef,V.stencilFuncMask),a.setOp(V.stencilFail,V.stencilZFail,V.stencilZPass)),Je(V.polygonOffset,V.polygonOffsetFactor,V.polygonOffsetUnits),V.alphaToCoverage===!0?Ce(r.SAMPLE_ALPHA_TO_COVERAGE):Ae(r.SAMPLE_ALPHA_TO_COVERAGE)}function xe(V){k!==V&&(V?r.frontFace(r.CW):r.frontFace(r.CCW),k=V)}function ve(V){V!==Gv?(Ce(r.CULL_FACE),V!==b&&(V===jd?r.cullFace(r.BACK):V===Wv?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):Ae(r.CULL_FACE),b=V}function Se(V){V!==C&&(re&&r.lineWidth(V),C=V)}function Je(V,Be,se){V?(Ce(r.POLYGON_OFFSET_FILL),(W!==Be||q!==se)&&(r.polygonOffset(Be,se),W=Be,q=se)):Ae(r.POLYGON_OFFSET_FILL)}function Le(V){V?Ce(r.SCISSOR_TEST):Ae(r.SCISSOR_TEST)}function F(V){V===void 0&&(V=r.TEXTURE0+J-1),z!==V&&(r.activeTexture(V),z=V)}function R(V,Be,se){se===void 0&&(z===null?se=r.TEXTURE0+J-1:se=z);let ge=ae[se];ge===void 0&&(ge={type:void 0,texture:void 0},ae[se]=ge),(ge.type!==V||ge.texture!==Be)&&(z!==se&&(r.activeTexture(se),z=se),r.bindTexture(V,Be||me[V]),ge.type=V,ge.texture=Be)}function Z(){const V=ae[z];V!==void 0&&V.type!==void 0&&(r.bindTexture(V.type,null),V.type=void 0,V.texture=void 0)}function ce(){try{r.compressedTexImage2D.apply(r,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function de(){try{r.compressedTexImage3D.apply(r,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function ue(){try{r.texSubImage2D.apply(r,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function qe(){try{r.texSubImage3D.apply(r,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Ee(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function ke(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function St(){try{r.texStorage2D.apply(r,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function _e(){try{r.texStorage3D.apply(r,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function He(){try{r.texImage2D.apply(r,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function at(){try{r.texImage3D.apply(r,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function lt(V){Pe.equals(V)===!1&&(r.scissor(V.x,V.y,V.z,V.w),Pe.copy(V))}function Ve(V){Ne.equals(V)===!1&&(r.viewport(V.x,V.y,V.z,V.w),Ne.copy(V))}function Mt(V,Be){let se=u.get(Be);se===void 0&&(se=new WeakMap,u.set(Be,se));let ge=se.get(V);ge===void 0&&(ge=r.getUniformBlockIndex(Be,V.name),se.set(V,ge))}function ut(V,Be){const ge=u.get(Be).get(V);c.get(Be)!==ge&&(r.uniformBlockBinding(Be,ge,V.__bindingPointIndex),c.set(Be,ge))}function Nt(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),h={},z=null,ae={},f={},p=new WeakMap,m=[],g=null,y=!1,M=null,x=null,_=null,E=null,w=null,T=null,U=null,P=new Ue(0,0,0),L=0,O=!1,k=null,b=null,C=null,W=null,q=null,Pe.set(0,0,r.canvas.width,r.canvas.height),Ne.set(0,0,r.canvas.width,r.canvas.height),i.reset(),s.reset(),a.reset()}return{buffers:{color:i,depth:s,stencil:a},enable:Ce,disable:Ae,bindFramebuffer:tt,drawBuffers:nt,useProgram:Ze,setBlending:N,setMaterial:we,setFlipSided:xe,setCullFace:ve,setLineWidth:Se,setPolygonOffset:Je,setScissorTest:Le,activeTexture:F,bindTexture:R,unbindTexture:Z,compressedTexImage2D:ce,compressedTexImage3D:de,texImage2D:He,texImage3D:at,updateUBOMapping:Mt,uniformBlockBinding:ut,texStorage2D:St,texStorage3D:_e,texSubImage2D:ue,texSubImage3D:qe,compressedTexSubImage2D:Ee,compressedTexSubImage3D:ke,scissor:lt,viewport:Ve,reset:Nt}}function hT(r,e){const t=r.image&&r.image.width?r.image.width/r.image.height:1;return t>e?(r.repeat.x=1,r.repeat.y=t/e,r.offset.x=0,r.offset.y=(1-r.repeat.y)/2):(r.repeat.x=e/t,r.repeat.y=1,r.offset.x=(1-r.repeat.x)/2,r.offset.y=0),r}function fT(r,e){const t=r.image&&r.image.width?r.image.width/r.image.height:1;return t>e?(r.repeat.x=e/t,r.repeat.y=1,r.offset.x=(1-r.repeat.x)/2,r.offset.y=0):(r.repeat.x=1,r.repeat.y=t/e,r.offset.x=0,r.offset.y=(1-r.repeat.y)/2),r}function dT(r){return r.repeat.x=1,r.repeat.y=1,r.offset.x=0,r.offset.y=0,r}function np(r,e,t,n){const i=pT(n);switch(t){case _p:return r*e;case xp:return r*e;case Sp:return r*e*2;case dh:return r*e/i.components*i.byteLength;case rl:return r*e/i.components*i.byteLength;case Mp:return r*e*2/i.components*i.byteLength;case ph:return r*e*2/i.components*i.byteLength;case yp:return r*e*3/i.components*i.byteLength;case Pn:return r*e*4/i.components*i.byteLength;case mh:return r*e*4/i.components*i.byteLength;case Ca:case Ra:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case Pa:case Ia:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Pu:case Lu:return Math.max(r,16)*Math.max(e,8)/4;case Ru:case Iu:return Math.max(r,8)*Math.max(e,8)/2;case Du:case Uu:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case Nu:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Fu:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Ou:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case Bu:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case zu:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case ku:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case Hu:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case Vu:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case Gu:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case Wu:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case Xu:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case Yu:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case qu:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case ju:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case Zu:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case La:case Ju:case Ku:return Math.ceil(r/4)*Math.ceil(e/4)*16;case wp:case Qu:return Math.ceil(r/4)*Math.ceil(e/4)*8;case $u:case eh:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function pT(r){switch(r){case Ci:case mp:return{byteLength:1,components:1};case Po:case gp:case Fo:return{byteLength:2,components:1};case hh:case fh:return{byteLength:2,components:4};case vr:case uh:case qn:return{byteLength:4,components:1};case vp:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${r}.`)}const mT={contain:hT,cover:fT,fill:dT,getByteLength:np};function gT(r,e,t,n,i,s,a){const c=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,u=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new pe,f=new WeakMap;let p;const m=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(F,R){return g?new OffscreenCanvas(F,R):qa("canvas")}function M(F,R,Z){let ce=1;const de=Le(F);if((de.width>Z||de.height>Z)&&(ce=Z/Math.max(de.width,de.height)),ce<1)if(typeof HTMLImageElement<"u"&&F instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&F instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&F instanceof ImageBitmap||typeof VideoFrame<"u"&&F instanceof VideoFrame){const ue=Math.floor(ce*de.width),qe=Math.floor(ce*de.height);p===void 0&&(p=y(ue,qe));const Ee=R?y(ue,qe):p;return Ee.width=ue,Ee.height=qe,Ee.getContext("2d").drawImage(F,0,0,ue,qe),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+de.width+"x"+de.height+") to ("+ue+"x"+qe+")."),Ee}else return"data"in F&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+de.width+"x"+de.height+")."),F;return F}function x(F){return F.generateMipmaps&&F.minFilter!==dn&&F.minFilter!==rn}function _(F){r.generateMipmap(F)}function E(F,R,Z,ce,de=!1){if(F!==null){if(r[F]!==void 0)return r[F];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+F+"'")}let ue=R;if(R===r.RED&&(Z===r.FLOAT&&(ue=r.R32F),Z===r.HALF_FLOAT&&(ue=r.R16F),Z===r.UNSIGNED_BYTE&&(ue=r.R8)),R===r.RED_INTEGER&&(Z===r.UNSIGNED_BYTE&&(ue=r.R8UI),Z===r.UNSIGNED_SHORT&&(ue=r.R16UI),Z===r.UNSIGNED_INT&&(ue=r.R32UI),Z===r.BYTE&&(ue=r.R8I),Z===r.SHORT&&(ue=r.R16I),Z===r.INT&&(ue=r.R32I)),R===r.RG&&(Z===r.FLOAT&&(ue=r.RG32F),Z===r.HALF_FLOAT&&(ue=r.RG16F),Z===r.UNSIGNED_BYTE&&(ue=r.RG8)),R===r.RG_INTEGER&&(Z===r.UNSIGNED_BYTE&&(ue=r.RG8UI),Z===r.UNSIGNED_SHORT&&(ue=r.RG16UI),Z===r.UNSIGNED_INT&&(ue=r.RG32UI),Z===r.BYTE&&(ue=r.RG8I),Z===r.SHORT&&(ue=r.RG16I),Z===r.INT&&(ue=r.RG32I)),R===r.RGB_INTEGER&&(Z===r.UNSIGNED_BYTE&&(ue=r.RGB8UI),Z===r.UNSIGNED_SHORT&&(ue=r.RGB16UI),Z===r.UNSIGNED_INT&&(ue=r.RGB32UI),Z===r.BYTE&&(ue=r.RGB8I),Z===r.SHORT&&(ue=r.RGB16I),Z===r.INT&&(ue=r.RGB32I)),R===r.RGBA_INTEGER&&(Z===r.UNSIGNED_BYTE&&(ue=r.RGBA8UI),Z===r.UNSIGNED_SHORT&&(ue=r.RGBA16UI),Z===r.UNSIGNED_INT&&(ue=r.RGBA32UI),Z===r.BYTE&&(ue=r.RGBA8I),Z===r.SHORT&&(ue=r.RGBA16I),Z===r.INT&&(ue=r.RGBA32I)),R===r.RGB&&Z===r.UNSIGNED_INT_5_9_9_9_REV&&(ue=r.RGB9_E5),R===r.RGBA){const qe=de?Va:Dt.getTransfer(ce);Z===r.FLOAT&&(ue=r.RGBA32F),Z===r.HALF_FLOAT&&(ue=r.RGBA16F),Z===r.UNSIGNED_BYTE&&(ue=qe===zt?r.SRGB8_ALPHA8:r.RGBA8),Z===r.UNSIGNED_SHORT_4_4_4_4&&(ue=r.RGBA4),Z===r.UNSIGNED_SHORT_5_5_5_1&&(ue=r.RGB5_A1)}return(ue===r.R16F||ue===r.R32F||ue===r.RG16F||ue===r.RG32F||ue===r.RGBA16F||ue===r.RGBA32F)&&e.get("EXT_color_buffer_float"),ue}function w(F,R){let Z;return F?R===null||R===vr||R===Is?Z=r.DEPTH24_STENCIL8:R===qn?Z=r.DEPTH32F_STENCIL8:R===Po&&(Z=r.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):R===null||R===vr||R===Is?Z=r.DEPTH_COMPONENT24:R===qn?Z=r.DEPTH_COMPONENT32F:R===Po&&(Z=r.DEPTH_COMPONENT16),Z}function T(F,R){return x(F)===!0||F.isFramebufferTexture&&F.minFilter!==dn&&F.minFilter!==rn?Math.log2(Math.max(R.width,R.height))+1:F.mipmaps!==void 0&&F.mipmaps.length>0?F.mipmaps.length:F.isCompressedTexture&&Array.isArray(F.image)?R.mipmaps.length:1}function U(F){const R=F.target;R.removeEventListener("dispose",U),L(R),R.isVideoTexture&&f.delete(R)}function P(F){const R=F.target;R.removeEventListener("dispose",P),k(R)}function L(F){const R=n.get(F);if(R.__webglInit===void 0)return;const Z=F.source,ce=m.get(Z);if(ce){const de=ce[R.__cacheKey];de.usedTimes--,de.usedTimes===0&&O(F),Object.keys(ce).length===0&&m.delete(Z)}n.remove(F)}function O(F){const R=n.get(F);r.deleteTexture(R.__webglTexture);const Z=F.source,ce=m.get(Z);delete ce[R.__cacheKey],a.memory.textures--}function k(F){const R=n.get(F);if(F.depthTexture&&F.depthTexture.dispose(),F.isWebGLCubeRenderTarget)for(let ce=0;ce<6;ce++){if(Array.isArray(R.__webglFramebuffer[ce]))for(let de=0;de<R.__webglFramebuffer[ce].length;de++)r.deleteFramebuffer(R.__webglFramebuffer[ce][de]);else r.deleteFramebuffer(R.__webglFramebuffer[ce]);R.__webglDepthbuffer&&r.deleteRenderbuffer(R.__webglDepthbuffer[ce])}else{if(Array.isArray(R.__webglFramebuffer))for(let ce=0;ce<R.__webglFramebuffer.length;ce++)r.deleteFramebuffer(R.__webglFramebuffer[ce]);else r.deleteFramebuffer(R.__webglFramebuffer);if(R.__webglDepthbuffer&&r.deleteRenderbuffer(R.__webglDepthbuffer),R.__webglMultisampledFramebuffer&&r.deleteFramebuffer(R.__webglMultisampledFramebuffer),R.__webglColorRenderbuffer)for(let ce=0;ce<R.__webglColorRenderbuffer.length;ce++)R.__webglColorRenderbuffer[ce]&&r.deleteRenderbuffer(R.__webglColorRenderbuffer[ce]);R.__webglDepthRenderbuffer&&r.deleteRenderbuffer(R.__webglDepthRenderbuffer)}const Z=F.textures;for(let ce=0,de=Z.length;ce<de;ce++){const ue=n.get(Z[ce]);ue.__webglTexture&&(r.deleteTexture(ue.__webglTexture),a.memory.textures--),n.remove(Z[ce])}n.remove(F)}let b=0;function C(){b=0}function W(){const F=b;return F>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+F+" texture units while this GPU supports only "+i.maxTextures),b+=1,F}function q(F){const R=[];return R.push(F.wrapS),R.push(F.wrapT),R.push(F.wrapR||0),R.push(F.magFilter),R.push(F.minFilter),R.push(F.anisotropy),R.push(F.internalFormat),R.push(F.format),R.push(F.type),R.push(F.generateMipmaps),R.push(F.premultiplyAlpha),R.push(F.flipY),R.push(F.unpackAlignment),R.push(F.colorSpace),R.join()}function J(F,R){const Z=n.get(F);if(F.isVideoTexture&&Se(F),F.isRenderTargetTexture===!1&&F.version>0&&Z.__version!==F.version){const ce=F.image;if(ce===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ce.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Ne(Z,F,R);return}}t.bindTexture(r.TEXTURE_2D,Z.__webglTexture,r.TEXTURE0+R)}function re(F,R){const Z=n.get(F);if(F.version>0&&Z.__version!==F.version){Ne(Z,F,R);return}t.bindTexture(r.TEXTURE_2D_ARRAY,Z.__webglTexture,r.TEXTURE0+R)}function j(F,R){const Z=n.get(F);if(F.version>0&&Z.__version!==F.version){Ne(Z,F,R);return}t.bindTexture(r.TEXTURE_3D,Z.__webglTexture,r.TEXTURE0+R)}function fe(F,R){const Z=n.get(F);if(F.version>0&&Z.__version!==F.version){ne(Z,F,R);return}t.bindTexture(r.TEXTURE_CUBE_MAP,Z.__webglTexture,r.TEXTURE0+R)}const z={[Ps]:r.REPEAT,[_i]:r.CLAMP_TO_EDGE,[za]:r.MIRRORED_REPEAT},ae={[dn]:r.NEAREST,[pp]:r.NEAREST_MIPMAP_NEAREST,[wo]:r.NEAREST_MIPMAP_LINEAR,[rn]:r.LINEAR,[ba]:r.LINEAR_MIPMAP_NEAREST,[Xi]:r.LINEAR_MIPMAP_LINEAR},ee={[A_]:r.NEVER,[I_]:r.ALWAYS,[T_]:r.LESS,[Ap]:r.LEQUAL,[b_]:r.EQUAL,[P_]:r.GEQUAL,[C_]:r.GREATER,[R_]:r.NOTEQUAL};function le(F,R){if(R.type===qn&&e.has("OES_texture_float_linear")===!1&&(R.magFilter===rn||R.magFilter===ba||R.magFilter===wo||R.magFilter===Xi||R.minFilter===rn||R.minFilter===ba||R.minFilter===wo||R.minFilter===Xi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(F,r.TEXTURE_WRAP_S,z[R.wrapS]),r.texParameteri(F,r.TEXTURE_WRAP_T,z[R.wrapT]),(F===r.TEXTURE_3D||F===r.TEXTURE_2D_ARRAY)&&r.texParameteri(F,r.TEXTURE_WRAP_R,z[R.wrapR]),r.texParameteri(F,r.TEXTURE_MAG_FILTER,ae[R.magFilter]),r.texParameteri(F,r.TEXTURE_MIN_FILTER,ae[R.minFilter]),R.compareFunction&&(r.texParameteri(F,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(F,r.TEXTURE_COMPARE_FUNC,ee[R.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(R.magFilter===dn||R.minFilter!==wo&&R.minFilter!==Xi||R.type===qn&&e.has("OES_texture_float_linear")===!1)return;if(R.anisotropy>1||n.get(R).__currentAnisotropy){const Z=e.get("EXT_texture_filter_anisotropic");r.texParameterf(F,Z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(R.anisotropy,i.getMaxAnisotropy())),n.get(R).__currentAnisotropy=R.anisotropy}}}function Pe(F,R){let Z=!1;F.__webglInit===void 0&&(F.__webglInit=!0,R.addEventListener("dispose",U));const ce=R.source;let de=m.get(ce);de===void 0&&(de={},m.set(ce,de));const ue=q(R);if(ue!==F.__cacheKey){de[ue]===void 0&&(de[ue]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,Z=!0),de[ue].usedTimes++;const qe=de[F.__cacheKey];qe!==void 0&&(de[F.__cacheKey].usedTimes--,qe.usedTimes===0&&O(R)),F.__cacheKey=ue,F.__webglTexture=de[ue].texture}return Z}function Ne(F,R,Z){let ce=r.TEXTURE_2D;(R.isDataArrayTexture||R.isCompressedArrayTexture)&&(ce=r.TEXTURE_2D_ARRAY),R.isData3DTexture&&(ce=r.TEXTURE_3D);const de=Pe(F,R),ue=R.source;t.bindTexture(ce,F.__webglTexture,r.TEXTURE0+Z);const qe=n.get(ue);if(ue.version!==qe.__version||de===!0){t.activeTexture(r.TEXTURE0+Z);const Ee=Dt.getPrimaries(Dt.workingColorSpace),ke=R.colorSpace===hr?null:Dt.getPrimaries(R.colorSpace),St=R.colorSpace===hr||Ee===ke?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,R.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,R.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,R.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,St);let _e=M(R.image,!1,i.maxTextureSize);_e=Je(R,_e);const He=s.convert(R.format,R.colorSpace),at=s.convert(R.type);let lt=E(R.internalFormat,He,at,R.colorSpace,R.isVideoTexture);le(ce,R);let Ve;const Mt=R.mipmaps,ut=R.isVideoTexture!==!0,Nt=qe.__version===void 0||de===!0,V=ue.dataReady,Be=T(R,_e);if(R.isDepthTexture)lt=w(R.format===Ls,R.type),Nt&&(ut?t.texStorage2D(r.TEXTURE_2D,1,lt,_e.width,_e.height):t.texImage2D(r.TEXTURE_2D,0,lt,_e.width,_e.height,0,He,at,null));else if(R.isDataTexture)if(Mt.length>0){ut&&Nt&&t.texStorage2D(r.TEXTURE_2D,Be,lt,Mt[0].width,Mt[0].height);for(let se=0,ge=Mt.length;se<ge;se++)Ve=Mt[se],ut?V&&t.texSubImage2D(r.TEXTURE_2D,se,0,0,Ve.width,Ve.height,He,at,Ve.data):t.texImage2D(r.TEXTURE_2D,se,lt,Ve.width,Ve.height,0,He,at,Ve.data);R.generateMipmaps=!1}else ut?(Nt&&t.texStorage2D(r.TEXTURE_2D,Be,lt,_e.width,_e.height),V&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,_e.width,_e.height,He,at,_e.data)):t.texImage2D(r.TEXTURE_2D,0,lt,_e.width,_e.height,0,He,at,_e.data);else if(R.isCompressedTexture)if(R.isCompressedArrayTexture){ut&&Nt&&t.texStorage3D(r.TEXTURE_2D_ARRAY,Be,lt,Mt[0].width,Mt[0].height,_e.depth);for(let se=0,ge=Mt.length;se<ge;se++)if(Ve=Mt[se],R.format!==Pn)if(He!==null)if(ut){if(V)if(R.layerUpdates.size>0){const Fe=np(Ve.width,Ve.height,R.format,R.type);for(const ze of R.layerUpdates){const wt=Ve.data.subarray(ze*Fe/Ve.data.BYTES_PER_ELEMENT,(ze+1)*Fe/Ve.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,se,0,0,ze,Ve.width,Ve.height,1,He,wt,0,0)}R.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,se,0,0,0,Ve.width,Ve.height,_e.depth,He,Ve.data,0,0)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,se,lt,Ve.width,Ve.height,_e.depth,0,Ve.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ut?V&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,se,0,0,0,Ve.width,Ve.height,_e.depth,He,at,Ve.data):t.texImage3D(r.TEXTURE_2D_ARRAY,se,lt,Ve.width,Ve.height,_e.depth,0,He,at,Ve.data)}else{ut&&Nt&&t.texStorage2D(r.TEXTURE_2D,Be,lt,Mt[0].width,Mt[0].height);for(let se=0,ge=Mt.length;se<ge;se++)Ve=Mt[se],R.format!==Pn?He!==null?ut?V&&t.compressedTexSubImage2D(r.TEXTURE_2D,se,0,0,Ve.width,Ve.height,He,Ve.data):t.compressedTexImage2D(r.TEXTURE_2D,se,lt,Ve.width,Ve.height,0,Ve.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ut?V&&t.texSubImage2D(r.TEXTURE_2D,se,0,0,Ve.width,Ve.height,He,at,Ve.data):t.texImage2D(r.TEXTURE_2D,se,lt,Ve.width,Ve.height,0,He,at,Ve.data)}else if(R.isDataArrayTexture)if(ut){if(Nt&&t.texStorage3D(r.TEXTURE_2D_ARRAY,Be,lt,_e.width,_e.height,_e.depth),V)if(R.layerUpdates.size>0){const se=np(_e.width,_e.height,R.format,R.type);for(const ge of R.layerUpdates){const Fe=_e.data.subarray(ge*se/_e.data.BYTES_PER_ELEMENT,(ge+1)*se/_e.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,ge,_e.width,_e.height,1,He,at,Fe)}R.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,_e.width,_e.height,_e.depth,He,at,_e.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,lt,_e.width,_e.height,_e.depth,0,He,at,_e.data);else if(R.isData3DTexture)ut?(Nt&&t.texStorage3D(r.TEXTURE_3D,Be,lt,_e.width,_e.height,_e.depth),V&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,_e.width,_e.height,_e.depth,He,at,_e.data)):t.texImage3D(r.TEXTURE_3D,0,lt,_e.width,_e.height,_e.depth,0,He,at,_e.data);else if(R.isFramebufferTexture){if(Nt)if(ut)t.texStorage2D(r.TEXTURE_2D,Be,lt,_e.width,_e.height);else{let se=_e.width,ge=_e.height;for(let Fe=0;Fe<Be;Fe++)t.texImage2D(r.TEXTURE_2D,Fe,lt,se,ge,0,He,at,null),se>>=1,ge>>=1}}else if(Mt.length>0){if(ut&&Nt){const se=Le(Mt[0]);t.texStorage2D(r.TEXTURE_2D,Be,lt,se.width,se.height)}for(let se=0,ge=Mt.length;se<ge;se++)Ve=Mt[se],ut?V&&t.texSubImage2D(r.TEXTURE_2D,se,0,0,He,at,Ve):t.texImage2D(r.TEXTURE_2D,se,lt,He,at,Ve);R.generateMipmaps=!1}else if(ut){if(Nt){const se=Le(_e);t.texStorage2D(r.TEXTURE_2D,Be,lt,se.width,se.height)}V&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,He,at,_e)}else t.texImage2D(r.TEXTURE_2D,0,lt,He,at,_e);x(R)&&_(ce),qe.__version=ue.version,R.onUpdate&&R.onUpdate(R)}F.__version=R.version}function ne(F,R,Z){if(R.image.length!==6)return;const ce=Pe(F,R),de=R.source;t.bindTexture(r.TEXTURE_CUBE_MAP,F.__webglTexture,r.TEXTURE0+Z);const ue=n.get(de);if(de.version!==ue.__version||ce===!0){t.activeTexture(r.TEXTURE0+Z);const qe=Dt.getPrimaries(Dt.workingColorSpace),Ee=R.colorSpace===hr?null:Dt.getPrimaries(R.colorSpace),ke=R.colorSpace===hr||qe===Ee?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,R.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,R.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,R.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,ke);const St=R.isCompressedTexture||R.image[0].isCompressedTexture,_e=R.image[0]&&R.image[0].isDataTexture,He=[];for(let ge=0;ge<6;ge++)!St&&!_e?He[ge]=M(R.image[ge],!0,i.maxCubemapSize):He[ge]=_e?R.image[ge].image:R.image[ge],He[ge]=Je(R,He[ge]);const at=He[0],lt=s.convert(R.format,R.colorSpace),Ve=s.convert(R.type),Mt=E(R.internalFormat,lt,Ve,R.colorSpace),ut=R.isVideoTexture!==!0,Nt=ue.__version===void 0||ce===!0,V=de.dataReady;let Be=T(R,at);le(r.TEXTURE_CUBE_MAP,R);let se;if(St){ut&&Nt&&t.texStorage2D(r.TEXTURE_CUBE_MAP,Be,Mt,at.width,at.height);for(let ge=0;ge<6;ge++){se=He[ge].mipmaps;for(let Fe=0;Fe<se.length;Fe++){const ze=se[Fe];R.format!==Pn?lt!==null?ut?V&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Fe,0,0,ze.width,ze.height,lt,ze.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Fe,Mt,ze.width,ze.height,0,ze.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ut?V&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Fe,0,0,ze.width,ze.height,lt,Ve,ze.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Fe,Mt,ze.width,ze.height,0,lt,Ve,ze.data)}}}else{if(se=R.mipmaps,ut&&Nt){se.length>0&&Be++;const ge=Le(He[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,Be,Mt,ge.width,ge.height)}for(let ge=0;ge<6;ge++)if(_e){ut?V&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,He[ge].width,He[ge].height,lt,Ve,He[ge].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,Mt,He[ge].width,He[ge].height,0,lt,Ve,He[ge].data);for(let Fe=0;Fe<se.length;Fe++){const wt=se[Fe].image[ge].image;ut?V&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Fe+1,0,0,wt.width,wt.height,lt,Ve,wt.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Fe+1,Mt,wt.width,wt.height,0,lt,Ve,wt.data)}}else{ut?V&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,lt,Ve,He[ge]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,Mt,lt,Ve,He[ge]);for(let Fe=0;Fe<se.length;Fe++){const ze=se[Fe];ut?V&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Fe+1,0,0,lt,Ve,ze.image[ge]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Fe+1,Mt,lt,Ve,ze.image[ge])}}}x(R)&&_(r.TEXTURE_CUBE_MAP),ue.__version=de.version,R.onUpdate&&R.onUpdate(R)}F.__version=R.version}function me(F,R,Z,ce,de,ue){const qe=s.convert(Z.format,Z.colorSpace),Ee=s.convert(Z.type),ke=E(Z.internalFormat,qe,Ee,Z.colorSpace);if(!n.get(R).__hasExternalTextures){const _e=Math.max(1,R.width>>ue),He=Math.max(1,R.height>>ue);de===r.TEXTURE_3D||de===r.TEXTURE_2D_ARRAY?t.texImage3D(de,ue,ke,_e,He,R.depth,0,qe,Ee,null):t.texImage2D(de,ue,ke,_e,He,0,qe,Ee,null)}t.bindFramebuffer(r.FRAMEBUFFER,F),ve(R)?c.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,ce,de,n.get(Z).__webglTexture,0,xe(R)):(de===r.TEXTURE_2D||de>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&de<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,ce,de,n.get(Z).__webglTexture,ue),t.bindFramebuffer(r.FRAMEBUFFER,null)}function Ce(F,R,Z){if(r.bindRenderbuffer(r.RENDERBUFFER,F),R.depthBuffer){const ce=R.depthTexture,de=ce&&ce.isDepthTexture?ce.type:null,ue=w(R.stencilBuffer,de),qe=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,Ee=xe(R);ve(R)?c.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Ee,ue,R.width,R.height):Z?r.renderbufferStorageMultisample(r.RENDERBUFFER,Ee,ue,R.width,R.height):r.renderbufferStorage(r.RENDERBUFFER,ue,R.width,R.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,qe,r.RENDERBUFFER,F)}else{const ce=R.textures;for(let de=0;de<ce.length;de++){const ue=ce[de],qe=s.convert(ue.format,ue.colorSpace),Ee=s.convert(ue.type),ke=E(ue.internalFormat,qe,Ee,ue.colorSpace),St=xe(R);Z&&ve(R)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,St,ke,R.width,R.height):ve(R)?c.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,St,ke,R.width,R.height):r.renderbufferStorage(r.RENDERBUFFER,ke,R.width,R.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function Ae(F,R){if(R&&R.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(r.FRAMEBUFFER,F),!(R.depthTexture&&R.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(R.depthTexture).__webglTexture||R.depthTexture.image.width!==R.width||R.depthTexture.image.height!==R.height)&&(R.depthTexture.image.width=R.width,R.depthTexture.image.height=R.height,R.depthTexture.needsUpdate=!0),J(R.depthTexture,0);const ce=n.get(R.depthTexture).__webglTexture,de=xe(R);if(R.depthTexture.format===Es)ve(R)?c.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ce,0,de):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ce,0);else if(R.depthTexture.format===Ls)ve(R)?c.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ce,0,de):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ce,0);else throw new Error("Unknown depthTexture format")}function tt(F){const R=n.get(F),Z=F.isWebGLCubeRenderTarget===!0;if(R.__boundDepthTexture!==F.depthTexture){const ce=F.depthTexture;if(R.__depthDisposeCallback&&R.__depthDisposeCallback(),ce){const de=()=>{delete R.__boundDepthTexture,delete R.__depthDisposeCallback,ce.removeEventListener("dispose",de)};ce.addEventListener("dispose",de),R.__depthDisposeCallback=de}R.__boundDepthTexture=ce}if(F.depthTexture&&!R.__autoAllocateDepthBuffer){if(Z)throw new Error("target.depthTexture not supported in Cube render targets");Ae(R.__webglFramebuffer,F)}else if(Z){R.__webglDepthbuffer=[];for(let ce=0;ce<6;ce++)if(t.bindFramebuffer(r.FRAMEBUFFER,R.__webglFramebuffer[ce]),R.__webglDepthbuffer[ce]===void 0)R.__webglDepthbuffer[ce]=r.createRenderbuffer(),Ce(R.__webglDepthbuffer[ce],F,!1);else{const de=F.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ue=R.__webglDepthbuffer[ce];r.bindRenderbuffer(r.RENDERBUFFER,ue),r.framebufferRenderbuffer(r.FRAMEBUFFER,de,r.RENDERBUFFER,ue)}}else if(t.bindFramebuffer(r.FRAMEBUFFER,R.__webglFramebuffer),R.__webglDepthbuffer===void 0)R.__webglDepthbuffer=r.createRenderbuffer(),Ce(R.__webglDepthbuffer,F,!1);else{const ce=F.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,de=R.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,de),r.framebufferRenderbuffer(r.FRAMEBUFFER,ce,r.RENDERBUFFER,de)}t.bindFramebuffer(r.FRAMEBUFFER,null)}function nt(F,R,Z){const ce=n.get(F);R!==void 0&&me(ce.__webglFramebuffer,F,F.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),Z!==void 0&&tt(F)}function Ze(F){const R=F.texture,Z=n.get(F),ce=n.get(R);F.addEventListener("dispose",P);const de=F.textures,ue=F.isWebGLCubeRenderTarget===!0,qe=de.length>1;if(qe||(ce.__webglTexture===void 0&&(ce.__webglTexture=r.createTexture()),ce.__version=R.version,a.memory.textures++),ue){Z.__webglFramebuffer=[];for(let Ee=0;Ee<6;Ee++)if(R.mipmaps&&R.mipmaps.length>0){Z.__webglFramebuffer[Ee]=[];for(let ke=0;ke<R.mipmaps.length;ke++)Z.__webglFramebuffer[Ee][ke]=r.createFramebuffer()}else Z.__webglFramebuffer[Ee]=r.createFramebuffer()}else{if(R.mipmaps&&R.mipmaps.length>0){Z.__webglFramebuffer=[];for(let Ee=0;Ee<R.mipmaps.length;Ee++)Z.__webglFramebuffer[Ee]=r.createFramebuffer()}else Z.__webglFramebuffer=r.createFramebuffer();if(qe)for(let Ee=0,ke=de.length;Ee<ke;Ee++){const St=n.get(de[Ee]);St.__webglTexture===void 0&&(St.__webglTexture=r.createTexture(),a.memory.textures++)}if(F.samples>0&&ve(F)===!1){Z.__webglMultisampledFramebuffer=r.createFramebuffer(),Z.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,Z.__webglMultisampledFramebuffer);for(let Ee=0;Ee<de.length;Ee++){const ke=de[Ee];Z.__webglColorRenderbuffer[Ee]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,Z.__webglColorRenderbuffer[Ee]);const St=s.convert(ke.format,ke.colorSpace),_e=s.convert(ke.type),He=E(ke.internalFormat,St,_e,ke.colorSpace,F.isXRRenderTarget===!0),at=xe(F);r.renderbufferStorageMultisample(r.RENDERBUFFER,at,He,F.width,F.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ee,r.RENDERBUFFER,Z.__webglColorRenderbuffer[Ee])}r.bindRenderbuffer(r.RENDERBUFFER,null),F.depthBuffer&&(Z.__webglDepthRenderbuffer=r.createRenderbuffer(),Ce(Z.__webglDepthRenderbuffer,F,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(ue){t.bindTexture(r.TEXTURE_CUBE_MAP,ce.__webglTexture),le(r.TEXTURE_CUBE_MAP,R);for(let Ee=0;Ee<6;Ee++)if(R.mipmaps&&R.mipmaps.length>0)for(let ke=0;ke<R.mipmaps.length;ke++)me(Z.__webglFramebuffer[Ee][ke],F,R,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,ke);else me(Z.__webglFramebuffer[Ee],F,R,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,0);x(R)&&_(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(qe){for(let Ee=0,ke=de.length;Ee<ke;Ee++){const St=de[Ee],_e=n.get(St);t.bindTexture(r.TEXTURE_2D,_e.__webglTexture),le(r.TEXTURE_2D,St),me(Z.__webglFramebuffer,F,St,r.COLOR_ATTACHMENT0+Ee,r.TEXTURE_2D,0),x(St)&&_(r.TEXTURE_2D)}t.unbindTexture()}else{let Ee=r.TEXTURE_2D;if((F.isWebGL3DRenderTarget||F.isWebGLArrayRenderTarget)&&(Ee=F.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(Ee,ce.__webglTexture),le(Ee,R),R.mipmaps&&R.mipmaps.length>0)for(let ke=0;ke<R.mipmaps.length;ke++)me(Z.__webglFramebuffer[ke],F,R,r.COLOR_ATTACHMENT0,Ee,ke);else me(Z.__webglFramebuffer,F,R,r.COLOR_ATTACHMENT0,Ee,0);x(R)&&_(Ee),t.unbindTexture()}F.depthBuffer&&tt(F)}function Re(F){const R=F.textures;for(let Z=0,ce=R.length;Z<ce;Z++){const de=R[Z];if(x(de)){const ue=F.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:r.TEXTURE_2D,qe=n.get(de).__webglTexture;t.bindTexture(ue,qe),_(ue),t.unbindTexture()}}}const he=[],N=[];function we(F){if(F.samples>0){if(ve(F)===!1){const R=F.textures,Z=F.width,ce=F.height;let de=r.COLOR_BUFFER_BIT;const ue=F.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,qe=n.get(F),Ee=R.length>1;if(Ee)for(let ke=0;ke<R.length;ke++)t.bindFramebuffer(r.FRAMEBUFFER,qe.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ke,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,qe.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+ke,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,qe.__webglMultisampledFramebuffer),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,qe.__webglFramebuffer);for(let ke=0;ke<R.length;ke++){if(F.resolveDepthBuffer&&(F.depthBuffer&&(de|=r.DEPTH_BUFFER_BIT),F.stencilBuffer&&F.resolveStencilBuffer&&(de|=r.STENCIL_BUFFER_BIT)),Ee){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,qe.__webglColorRenderbuffer[ke]);const St=n.get(R[ke]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,St,0)}r.blitFramebuffer(0,0,Z,ce,0,0,Z,ce,de,r.NEAREST),u===!0&&(he.length=0,N.length=0,he.push(r.COLOR_ATTACHMENT0+ke),F.depthBuffer&&F.resolveDepthBuffer===!1&&(he.push(ue),N.push(ue),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,N)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,he))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),Ee)for(let ke=0;ke<R.length;ke++){t.bindFramebuffer(r.FRAMEBUFFER,qe.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ke,r.RENDERBUFFER,qe.__webglColorRenderbuffer[ke]);const St=n.get(R[ke]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,qe.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+ke,r.TEXTURE_2D,St,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,qe.__webglMultisampledFramebuffer)}else if(F.depthBuffer&&F.resolveDepthBuffer===!1&&u){const R=F.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[R])}}}function xe(F){return Math.min(i.maxSamples,F.samples)}function ve(F){const R=n.get(F);return F.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&R.__useRenderToTexture!==!1}function Se(F){const R=a.render.frame;f.get(F)!==R&&(f.set(F,R),F.update())}function Je(F,R){const Z=F.colorSpace,ce=F.format,de=F.type;return F.isCompressedTexture===!0||F.isVideoTexture===!0||Z!==yr&&Z!==hr&&(Dt.getTransfer(Z)===zt?(ce!==Pn||de!==Ci)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",Z)),R}function Le(F){return typeof HTMLImageElement<"u"&&F instanceof HTMLImageElement?(h.width=F.naturalWidth||F.width,h.height=F.naturalHeight||F.height):typeof VideoFrame<"u"&&F instanceof VideoFrame?(h.width=F.displayWidth,h.height=F.displayHeight):(h.width=F.width,h.height=F.height),h}this.allocateTextureUnit=W,this.resetTextureUnits=C,this.setTexture2D=J,this.setTexture2DArray=re,this.setTexture3D=j,this.setTextureCube=fe,this.rebindTextures=nt,this.setupRenderTarget=Ze,this.updateRenderTargetMipmap=Re,this.updateMultisampleRenderTarget=we,this.setupDepthRenderbuffer=tt,this.setupFrameBufferTexture=me,this.useMultisampledRTT=ve}function Y_(r,e){function t(n,i=hr){let s;const a=Dt.getTransfer(i);if(n===Ci)return r.UNSIGNED_BYTE;if(n===hh)return r.UNSIGNED_SHORT_4_4_4_4;if(n===fh)return r.UNSIGNED_SHORT_5_5_5_1;if(n===vp)return r.UNSIGNED_INT_5_9_9_9_REV;if(n===mp)return r.BYTE;if(n===gp)return r.SHORT;if(n===Po)return r.UNSIGNED_SHORT;if(n===uh)return r.INT;if(n===vr)return r.UNSIGNED_INT;if(n===qn)return r.FLOAT;if(n===Fo)return r.HALF_FLOAT;if(n===_p)return r.ALPHA;if(n===yp)return r.RGB;if(n===Pn)return r.RGBA;if(n===xp)return r.LUMINANCE;if(n===Sp)return r.LUMINANCE_ALPHA;if(n===Es)return r.DEPTH_COMPONENT;if(n===Ls)return r.DEPTH_STENCIL;if(n===dh)return r.RED;if(n===rl)return r.RED_INTEGER;if(n===Mp)return r.RG;if(n===ph)return r.RG_INTEGER;if(n===mh)return r.RGBA_INTEGER;if(n===Ca||n===Ra||n===Pa||n===Ia)if(a===zt)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===Ca)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ra)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Pa)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ia)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===Ca)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ra)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Pa)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ia)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ru||n===Pu||n===Iu||n===Lu)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===Ru)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Pu)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Iu)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Lu)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Du||n===Uu||n===Nu)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Du||n===Uu)return a===zt?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===Nu)return a===zt?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Fu||n===Ou||n===Bu||n===zu||n===ku||n===Hu||n===Vu||n===Gu||n===Wu||n===Xu||n===Yu||n===qu||n===ju||n===Zu)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===Fu)return a===zt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ou)return a===zt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Bu)return a===zt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===zu)return a===zt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ku)return a===zt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Hu)return a===zt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Vu)return a===zt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Gu)return a===zt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Wu)return a===zt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Xu)return a===zt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Yu)return a===zt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===qu)return a===zt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ju)return a===zt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Zu)return a===zt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===La||n===Ju||n===Ku)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===La)return a===zt?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ju)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ku)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===wp||n===Qu||n===$u||n===eh)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===La)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Qu)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===$u)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===eh)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Is?r.UNSIGNED_INT_24_8:r[n]!==void 0?r[n]:null}return{convert:t}}class q_ extends nn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class To extends Ct{constructor(){super(),this.isGroup=!0,this.type="Group"}}const vT={type:"move"};class xd{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new To,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new To,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new To,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,s=null,a=null;const c=this._targetRay,u=this._grip,h=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(h&&e.hand){a=!0;for(const M of e.hand.values()){const x=t.getJointPose(M,n),_=this._getHandJoint(h,M);x!==null&&(_.matrix.fromArray(x.transform.matrix),_.matrix.decompose(_.position,_.rotation,_.scale),_.matrixWorldNeedsUpdate=!0,_.jointRadius=x.radius),_.visible=x!==null}const f=h.joints["index-finger-tip"],p=h.joints["thumb-tip"],m=f.position.distanceTo(p.position),g=.02,y=.005;h.inputState.pinching&&m>g+y?(h.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!h.inputState.pinching&&m<=g-y&&(h.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else u!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(u.matrix.fromArray(s.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,s.linearVelocity?(u.hasLinearVelocity=!0,u.linearVelocity.copy(s.linearVelocity)):u.hasLinearVelocity=!1,s.angularVelocity?(u.hasAngularVelocity=!0,u.angularVelocity.copy(s.angularVelocity)):u.hasAngularVelocity=!1));c!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(c.matrix.fromArray(i.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,i.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(i.linearVelocity)):c.hasLinearVelocity=!1,i.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(i.angularVelocity)):c.hasAngularVelocity=!1,this.dispatchEvent(vT)))}return c!==null&&(c.visible=i!==null),u!==null&&(u.visible=s!==null),h!==null&&(h.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new To;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const _T=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,yT=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class xT{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const i=new Zt,s=e.properties.get(i);s.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Zn({vertexShader:_T,fragmentShader:yT,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Qt(new Bo(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class ST extends Ji{constructor(e,t){super();const n=this;let i=null,s=1,a=null,c="local-floor",u=1,h=null,f=null,p=null,m=null,g=null,y=null;const M=new xT,x=t.getContextAttributes();let _=null,E=null;const w=[],T=[],U=new pe;let P=null;const L=new nn;L.layers.enable(1),L.viewport=new xt;const O=new nn;O.layers.enable(2),O.viewport=new xt;const k=[L,O],b=new q_;b.layers.enable(1),b.layers.enable(2);let C=null,W=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ne){let me=w[ne];return me===void 0&&(me=new xd,w[ne]=me),me.getTargetRaySpace()},this.getControllerGrip=function(ne){let me=w[ne];return me===void 0&&(me=new xd,w[ne]=me),me.getGripSpace()},this.getHand=function(ne){let me=w[ne];return me===void 0&&(me=new xd,w[ne]=me),me.getHandSpace()};function q(ne){const me=T.indexOf(ne.inputSource);if(me===-1)return;const Ce=w[me];Ce!==void 0&&(Ce.update(ne.inputSource,ne.frame,h||a),Ce.dispatchEvent({type:ne.type,data:ne.inputSource}))}function J(){i.removeEventListener("select",q),i.removeEventListener("selectstart",q),i.removeEventListener("selectend",q),i.removeEventListener("squeeze",q),i.removeEventListener("squeezestart",q),i.removeEventListener("squeezeend",q),i.removeEventListener("end",J),i.removeEventListener("inputsourceschange",re);for(let ne=0;ne<w.length;ne++){const me=T[ne];me!==null&&(T[ne]=null,w[ne].disconnect(me))}C=null,W=null,M.reset(),e.setRenderTarget(_),g=null,m=null,p=null,i=null,E=null,Ne.stop(),n.isPresenting=!1,e.setPixelRatio(P),e.setSize(U.width,U.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ne){s=ne,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ne){c=ne,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return h||a},this.setReferenceSpace=function(ne){h=ne},this.getBaseLayer=function(){return m!==null?m:g},this.getBinding=function(){return p},this.getFrame=function(){return y},this.getSession=function(){return i},this.setSession=async function(ne){if(i=ne,i!==null){if(_=e.getRenderTarget(),i.addEventListener("select",q),i.addEventListener("selectstart",q),i.addEventListener("selectend",q),i.addEventListener("squeeze",q),i.addEventListener("squeezestart",q),i.addEventListener("squeezeend",q),i.addEventListener("end",J),i.addEventListener("inputsourceschange",re),x.xrCompatible!==!0&&await t.makeXRCompatible(),P=e.getPixelRatio(),e.getSize(U),i.renderState.layers===void 0){const me={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:s};g=new XRWebGLLayer(i,t,me),i.updateRenderState({baseLayer:g}),e.setPixelRatio(1),e.setSize(g.framebufferWidth,g.framebufferHeight,!1),E=new Ri(g.framebufferWidth,g.framebufferHeight,{format:Pn,type:Ci,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil})}else{let me=null,Ce=null,Ae=null;x.depth&&(Ae=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,me=x.stencil?Ls:Es,Ce=x.stencil?Is:vr);const tt={colorFormat:t.RGBA8,depthFormat:Ae,scaleFactor:s};p=new XRWebGLBinding(i,t),m=p.createProjectionLayer(tt),i.updateRenderState({layers:[m]}),e.setPixelRatio(1),e.setSize(m.textureWidth,m.textureHeight,!1),E=new Ri(m.textureWidth,m.textureHeight,{format:Pn,type:Ci,depthTexture:new Ip(m.textureWidth,m.textureHeight,Ce,void 0,void 0,void 0,void 0,void 0,void 0,me),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:m.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(u),h=null,a=await i.requestReferenceSpace(c),Ne.setContext(i),Ne.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return M.getDepthTexture()};function re(ne){for(let me=0;me<ne.removed.length;me++){const Ce=ne.removed[me],Ae=T.indexOf(Ce);Ae>=0&&(T[Ae]=null,w[Ae].disconnect(Ce))}for(let me=0;me<ne.added.length;me++){const Ce=ne.added[me];let Ae=T.indexOf(Ce);if(Ae===-1){for(let nt=0;nt<w.length;nt++)if(nt>=T.length){T.push(Ce),Ae=nt;break}else if(T[nt]===null){T[nt]=Ce,Ae=nt;break}if(Ae===-1)break}const tt=w[Ae];tt&&tt.connect(Ce)}}const j=new D,fe=new D;function z(ne,me,Ce){j.setFromMatrixPosition(me.matrixWorld),fe.setFromMatrixPosition(Ce.matrixWorld);const Ae=j.distanceTo(fe),tt=me.projectionMatrix.elements,nt=Ce.projectionMatrix.elements,Ze=tt[14]/(tt[10]-1),Re=tt[14]/(tt[10]+1),he=(tt[9]+1)/tt[5],N=(tt[9]-1)/tt[5],we=(tt[8]-1)/tt[0],xe=(nt[8]+1)/nt[0],ve=Ze*we,Se=Ze*xe,Je=Ae/(-we+xe),Le=Je*-we;if(me.matrixWorld.decompose(ne.position,ne.quaternion,ne.scale),ne.translateX(Le),ne.translateZ(Je),ne.matrixWorld.compose(ne.position,ne.quaternion,ne.scale),ne.matrixWorldInverse.copy(ne.matrixWorld).invert(),tt[10]===-1)ne.projectionMatrix.copy(me.projectionMatrix),ne.projectionMatrixInverse.copy(me.projectionMatrixInverse);else{const F=Ze+Je,R=Re+Je,Z=ve-Le,ce=Se+(Ae-Le),de=he*Re/R*F,ue=N*Re/R*F;ne.projectionMatrix.makePerspective(Z,ce,de,ue,F,R),ne.projectionMatrixInverse.copy(ne.projectionMatrix).invert()}}function ae(ne,me){me===null?ne.matrixWorld.copy(ne.matrix):ne.matrixWorld.multiplyMatrices(me.matrixWorld,ne.matrix),ne.matrixWorldInverse.copy(ne.matrixWorld).invert()}this.updateCamera=function(ne){if(i===null)return;let me=ne.near,Ce=ne.far;M.texture!==null&&(M.depthNear>0&&(me=M.depthNear),M.depthFar>0&&(Ce=M.depthFar)),b.near=O.near=L.near=me,b.far=O.far=L.far=Ce,(C!==b.near||W!==b.far)&&(i.updateRenderState({depthNear:b.near,depthFar:b.far}),C=b.near,W=b.far);const Ae=ne.parent,tt=b.cameras;ae(b,Ae);for(let nt=0;nt<tt.length;nt++)ae(tt[nt],Ae);tt.length===2?z(b,L,O):b.projectionMatrix.copy(L.projectionMatrix),ee(ne,b,Ae)};function ee(ne,me,Ce){Ce===null?ne.matrix.copy(me.matrixWorld):(ne.matrix.copy(Ce.matrixWorld),ne.matrix.invert(),ne.matrix.multiply(me.matrixWorld)),ne.matrix.decompose(ne.position,ne.quaternion,ne.scale),ne.updateMatrixWorld(!0),ne.projectionMatrix.copy(me.projectionMatrix),ne.projectionMatrixInverse.copy(me.projectionMatrixInverse),ne.isPerspectiveCamera&&(ne.fov=Io*2*Math.atan(1/ne.projectionMatrix.elements[5]),ne.zoom=1)}this.getCamera=function(){return b},this.getFoveation=function(){if(!(m===null&&g===null))return u},this.setFoveation=function(ne){u=ne,m!==null&&(m.fixedFoveation=ne),g!==null&&g.fixedFoveation!==void 0&&(g.fixedFoveation=ne)},this.hasDepthSensing=function(){return M.texture!==null},this.getDepthSensingMesh=function(){return M.getMesh(b)};let le=null;function Pe(ne,me){if(f=me.getViewerPose(h||a),y=me,f!==null){const Ce=f.views;g!==null&&(e.setRenderTargetFramebuffer(E,g.framebuffer),e.setRenderTarget(E));let Ae=!1;Ce.length!==b.cameras.length&&(b.cameras.length=0,Ae=!0);for(let nt=0;nt<Ce.length;nt++){const Ze=Ce[nt];let Re=null;if(g!==null)Re=g.getViewport(Ze);else{const N=p.getViewSubImage(m,Ze);Re=N.viewport,nt===0&&(e.setRenderTargetTextures(E,N.colorTexture,m.ignoreDepthValues?void 0:N.depthStencilTexture),e.setRenderTarget(E))}let he=k[nt];he===void 0&&(he=new nn,he.layers.enable(nt),he.viewport=new xt,k[nt]=he),he.matrix.fromArray(Ze.transform.matrix),he.matrix.decompose(he.position,he.quaternion,he.scale),he.projectionMatrix.fromArray(Ze.projectionMatrix),he.projectionMatrixInverse.copy(he.projectionMatrix).invert(),he.viewport.set(Re.x,Re.y,Re.width,Re.height),nt===0&&(b.matrix.copy(he.matrix),b.matrix.decompose(b.position,b.quaternion,b.scale)),Ae===!0&&b.cameras.push(he)}const tt=i.enabledFeatures;if(tt&&tt.includes("depth-sensing")){const nt=p.getDepthInformation(Ce[0]);nt&&nt.isValid&&nt.texture&&M.init(e,nt,i.renderState)}}for(let Ce=0;Ce<w.length;Ce++){const Ae=T[Ce],tt=w[Ce];Ae!==null&&tt!==void 0&&tt.update(Ae,me,h||a)}le&&le(ne,me),me.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:me}),y=null}const Ne=new H_;Ne.setAnimationLoop(Pe),this.setAnimationLoop=function(ne){le=ne},this.dispose=function(){}}}const ls=new ai,MT=new rt;function wT(r,e){function t(x,_){x.matrixAutoUpdate===!0&&x.updateMatrix(),_.value.copy(x.matrix)}function n(x,_){_.color.getRGB(x.fogColor.value,B_(r)),_.isFog?(x.fogNear.value=_.near,x.fogFar.value=_.far):_.isFogExp2&&(x.fogDensity.value=_.density)}function i(x,_,E,w,T){_.isMeshBasicMaterial||_.isMeshLambertMaterial?s(x,_):_.isMeshToonMaterial?(s(x,_),p(x,_)):_.isMeshPhongMaterial?(s(x,_),f(x,_)):_.isMeshStandardMaterial?(s(x,_),m(x,_),_.isMeshPhysicalMaterial&&g(x,_,T)):_.isMeshMatcapMaterial?(s(x,_),y(x,_)):_.isMeshDepthMaterial?s(x,_):_.isMeshDistanceMaterial?(s(x,_),M(x,_)):_.isMeshNormalMaterial?s(x,_):_.isLineBasicMaterial?(a(x,_),_.isLineDashedMaterial&&c(x,_)):_.isPointsMaterial?u(x,_,E,w):_.isSpriteMaterial?h(x,_):_.isShadowMaterial?(x.color.value.copy(_.color),x.opacity.value=_.opacity):_.isShaderMaterial&&(_.uniformsNeedUpdate=!1)}function s(x,_){x.opacity.value=_.opacity,_.color&&x.diffuse.value.copy(_.color),_.emissive&&x.emissive.value.copy(_.emissive).multiplyScalar(_.emissiveIntensity),_.map&&(x.map.value=_.map,t(_.map,x.mapTransform)),_.alphaMap&&(x.alphaMap.value=_.alphaMap,t(_.alphaMap,x.alphaMapTransform)),_.bumpMap&&(x.bumpMap.value=_.bumpMap,t(_.bumpMap,x.bumpMapTransform),x.bumpScale.value=_.bumpScale,_.side===In&&(x.bumpScale.value*=-1)),_.normalMap&&(x.normalMap.value=_.normalMap,t(_.normalMap,x.normalMapTransform),x.normalScale.value.copy(_.normalScale),_.side===In&&x.normalScale.value.negate()),_.displacementMap&&(x.displacementMap.value=_.displacementMap,t(_.displacementMap,x.displacementMapTransform),x.displacementScale.value=_.displacementScale,x.displacementBias.value=_.displacementBias),_.emissiveMap&&(x.emissiveMap.value=_.emissiveMap,t(_.emissiveMap,x.emissiveMapTransform)),_.specularMap&&(x.specularMap.value=_.specularMap,t(_.specularMap,x.specularMapTransform)),_.alphaTest>0&&(x.alphaTest.value=_.alphaTest);const E=e.get(_),w=E.envMap,T=E.envMapRotation;w&&(x.envMap.value=w,ls.copy(T),ls.x*=-1,ls.y*=-1,ls.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(ls.y*=-1,ls.z*=-1),x.envMapRotation.value.setFromMatrix4(MT.makeRotationFromEuler(ls)),x.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,x.reflectivity.value=_.reflectivity,x.ior.value=_.ior,x.refractionRatio.value=_.refractionRatio),_.lightMap&&(x.lightMap.value=_.lightMap,x.lightMapIntensity.value=_.lightMapIntensity,t(_.lightMap,x.lightMapTransform)),_.aoMap&&(x.aoMap.value=_.aoMap,x.aoMapIntensity.value=_.aoMapIntensity,t(_.aoMap,x.aoMapTransform))}function a(x,_){x.diffuse.value.copy(_.color),x.opacity.value=_.opacity,_.map&&(x.map.value=_.map,t(_.map,x.mapTransform))}function c(x,_){x.dashSize.value=_.dashSize,x.totalSize.value=_.dashSize+_.gapSize,x.scale.value=_.scale}function u(x,_,E,w){x.diffuse.value.copy(_.color),x.opacity.value=_.opacity,x.size.value=_.size*E,x.scale.value=w*.5,_.map&&(x.map.value=_.map,t(_.map,x.uvTransform)),_.alphaMap&&(x.alphaMap.value=_.alphaMap,t(_.alphaMap,x.alphaMapTransform)),_.alphaTest>0&&(x.alphaTest.value=_.alphaTest)}function h(x,_){x.diffuse.value.copy(_.color),x.opacity.value=_.opacity,x.rotation.value=_.rotation,_.map&&(x.map.value=_.map,t(_.map,x.mapTransform)),_.alphaMap&&(x.alphaMap.value=_.alphaMap,t(_.alphaMap,x.alphaMapTransform)),_.alphaTest>0&&(x.alphaTest.value=_.alphaTest)}function f(x,_){x.specular.value.copy(_.specular),x.shininess.value=Math.max(_.shininess,1e-4)}function p(x,_){_.gradientMap&&(x.gradientMap.value=_.gradientMap)}function m(x,_){x.metalness.value=_.metalness,_.metalnessMap&&(x.metalnessMap.value=_.metalnessMap,t(_.metalnessMap,x.metalnessMapTransform)),x.roughness.value=_.roughness,_.roughnessMap&&(x.roughnessMap.value=_.roughnessMap,t(_.roughnessMap,x.roughnessMapTransform)),_.envMap&&(x.envMapIntensity.value=_.envMapIntensity)}function g(x,_,E){x.ior.value=_.ior,_.sheen>0&&(x.sheenColor.value.copy(_.sheenColor).multiplyScalar(_.sheen),x.sheenRoughness.value=_.sheenRoughness,_.sheenColorMap&&(x.sheenColorMap.value=_.sheenColorMap,t(_.sheenColorMap,x.sheenColorMapTransform)),_.sheenRoughnessMap&&(x.sheenRoughnessMap.value=_.sheenRoughnessMap,t(_.sheenRoughnessMap,x.sheenRoughnessMapTransform))),_.clearcoat>0&&(x.clearcoat.value=_.clearcoat,x.clearcoatRoughness.value=_.clearcoatRoughness,_.clearcoatMap&&(x.clearcoatMap.value=_.clearcoatMap,t(_.clearcoatMap,x.clearcoatMapTransform)),_.clearcoatRoughnessMap&&(x.clearcoatRoughnessMap.value=_.clearcoatRoughnessMap,t(_.clearcoatRoughnessMap,x.clearcoatRoughnessMapTransform)),_.clearcoatNormalMap&&(x.clearcoatNormalMap.value=_.clearcoatNormalMap,t(_.clearcoatNormalMap,x.clearcoatNormalMapTransform),x.clearcoatNormalScale.value.copy(_.clearcoatNormalScale),_.side===In&&x.clearcoatNormalScale.value.negate())),_.dispersion>0&&(x.dispersion.value=_.dispersion),_.iridescence>0&&(x.iridescence.value=_.iridescence,x.iridescenceIOR.value=_.iridescenceIOR,x.iridescenceThicknessMinimum.value=_.iridescenceThicknessRange[0],x.iridescenceThicknessMaximum.value=_.iridescenceThicknessRange[1],_.iridescenceMap&&(x.iridescenceMap.value=_.iridescenceMap,t(_.iridescenceMap,x.iridescenceMapTransform)),_.iridescenceThicknessMap&&(x.iridescenceThicknessMap.value=_.iridescenceThicknessMap,t(_.iridescenceThicknessMap,x.iridescenceThicknessMapTransform))),_.transmission>0&&(x.transmission.value=_.transmission,x.transmissionSamplerMap.value=E.texture,x.transmissionSamplerSize.value.set(E.width,E.height),_.transmissionMap&&(x.transmissionMap.value=_.transmissionMap,t(_.transmissionMap,x.transmissionMapTransform)),x.thickness.value=_.thickness,_.thicknessMap&&(x.thicknessMap.value=_.thicknessMap,t(_.thicknessMap,x.thicknessMapTransform)),x.attenuationDistance.value=_.attenuationDistance,x.attenuationColor.value.copy(_.attenuationColor)),_.anisotropy>0&&(x.anisotropyVector.value.set(_.anisotropy*Math.cos(_.anisotropyRotation),_.anisotropy*Math.sin(_.anisotropyRotation)),_.anisotropyMap&&(x.anisotropyMap.value=_.anisotropyMap,t(_.anisotropyMap,x.anisotropyMapTransform))),x.specularIntensity.value=_.specularIntensity,x.specularColor.value.copy(_.specularColor),_.specularColorMap&&(x.specularColorMap.value=_.specularColorMap,t(_.specularColorMap,x.specularColorMapTransform)),_.specularIntensityMap&&(x.specularIntensityMap.value=_.specularIntensityMap,t(_.specularIntensityMap,x.specularIntensityMapTransform))}function y(x,_){_.matcap&&(x.matcap.value=_.matcap)}function M(x,_){const E=e.get(_).light;x.referencePosition.value.setFromMatrixPosition(E.matrixWorld),x.nearDistance.value=E.shadow.camera.near,x.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function ET(r,e,t,n){let i={},s={},a=[];const c=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function u(E,w){const T=w.program;n.uniformBlockBinding(E,T)}function h(E,w){let T=i[E.id];T===void 0&&(y(E),T=f(E),i[E.id]=T,E.addEventListener("dispose",x));const U=w.program;n.updateUBOMapping(E,U);const P=e.render.frame;s[E.id]!==P&&(m(E),s[E.id]=P)}function f(E){const w=p();E.__bindingPointIndex=w;const T=r.createBuffer(),U=E.__size,P=E.usage;return r.bindBuffer(r.UNIFORM_BUFFER,T),r.bufferData(r.UNIFORM_BUFFER,U,P),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,w,T),T}function p(){for(let E=0;E<c;E++)if(a.indexOf(E)===-1)return a.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function m(E){const w=i[E.id],T=E.uniforms,U=E.__cache;r.bindBuffer(r.UNIFORM_BUFFER,w);for(let P=0,L=T.length;P<L;P++){const O=Array.isArray(T[P])?T[P]:[T[P]];for(let k=0,b=O.length;k<b;k++){const C=O[k];if(g(C,P,k,U)===!0){const W=C.__offset,q=Array.isArray(C.value)?C.value:[C.value];let J=0;for(let re=0;re<q.length;re++){const j=q[re],fe=M(j);typeof j=="number"||typeof j=="boolean"?(C.__data[0]=j,r.bufferSubData(r.UNIFORM_BUFFER,W+J,C.__data)):j.isMatrix3?(C.__data[0]=j.elements[0],C.__data[1]=j.elements[1],C.__data[2]=j.elements[2],C.__data[3]=0,C.__data[4]=j.elements[3],C.__data[5]=j.elements[4],C.__data[6]=j.elements[5],C.__data[7]=0,C.__data[8]=j.elements[6],C.__data[9]=j.elements[7],C.__data[10]=j.elements[8],C.__data[11]=0):(j.toArray(C.__data,J),J+=fe.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,W,C.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function g(E,w,T,U){const P=E.value,L=w+"_"+T;if(U[L]===void 0)return typeof P=="number"||typeof P=="boolean"?U[L]=P:U[L]=P.clone(),!0;{const O=U[L];if(typeof P=="number"||typeof P=="boolean"){if(O!==P)return U[L]=P,!0}else if(O.equals(P)===!1)return O.copy(P),!0}return!1}function y(E){const w=E.uniforms;let T=0;const U=16;for(let L=0,O=w.length;L<O;L++){const k=Array.isArray(w[L])?w[L]:[w[L]];for(let b=0,C=k.length;b<C;b++){const W=k[b],q=Array.isArray(W.value)?W.value:[W.value];for(let J=0,re=q.length;J<re;J++){const j=q[J],fe=M(j),z=T%U,ae=z%fe.boundary,ee=z+ae;T+=ae,ee!==0&&U-ee<fe.storage&&(T+=U-ee),W.__data=new Float32Array(fe.storage/Float32Array.BYTES_PER_ELEMENT),W.__offset=T,T+=fe.storage}}}const P=T%U;return P>0&&(T+=U-P),E.__size=T,E.__cache={},this}function M(E){const w={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(w.boundary=4,w.storage=4):E.isVector2?(w.boundary=8,w.storage=8):E.isVector3||E.isColor?(w.boundary=16,w.storage=12):E.isVector4?(w.boundary=16,w.storage=16):E.isMatrix3?(w.boundary=48,w.storage=48):E.isMatrix4?(w.boundary=64,w.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),w}function x(E){const w=E.target;w.removeEventListener("dispose",x);const T=a.indexOf(w.__bindingPointIndex);a.splice(T,1),r.deleteBuffer(i[w.id]),delete i[w.id],delete s[w.id]}function _(){for(const E in i)r.deleteBuffer(i[E]);a=[],i={},s={}}return{bind:u,update:h,dispose:_}}class j_{constructor(e={}){const{canvas:t=U_(),context:n=null,depth:i=!0,stencil:s=!1,alpha:a=!1,antialias:c=!1,premultipliedAlpha:u=!0,preserveDrawingBuffer:h=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:p=!1}=e;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=a;const g=new Uint32Array(4),y=new Int32Array(4);let M=null,x=null;const _=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Xn,this.toneMapping=qi,this.toneMappingExposure=1;const w=this;let T=!1,U=0,P=0,L=null,O=-1,k=null;const b=new xt,C=new xt;let W=null;const q=new Ue(0);let J=0,re=t.width,j=t.height,fe=1,z=null,ae=null;const ee=new xt(0,0,re,j),le=new xt(0,0,re,j);let Pe=!1;const Ne=new ll;let ne=!1,me=!1;const Ce=new rt,Ae=new rt,tt=new D,nt=new xt,Ze={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Re=!1;function he(){return L===null?fe:1}let N=n;function we(I,G){return t.getContext(I,G)}try{const I={alpha:!0,depth:i,stencil:s,antialias:c,premultipliedAlpha:u,preserveDrawingBuffer:h,powerPreference:f,failIfMajorPerformanceCaveat:p};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${nl}`),t.addEventListener("webglcontextlost",ge,!1),t.addEventListener("webglcontextrestored",Fe,!1),t.addEventListener("webglcontextcreationerror",ze,!1),N===null){const G="webgl2";if(N=we(G,I),N===null)throw we(G)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(I){throw console.error("THREE.WebGLRenderer: "+I.message),I}let xe,ve,Se,Je,Le,F,R,Z,ce,de,ue,qe,Ee,ke,St,_e,He,at,lt,Ve,Mt,ut,Nt,V;function Be(){xe=new PE(N),xe.init(),ut=new Y_(N,xe),ve=new EE(N,xe,e,ut),Se=new uT(N),ve.reverseDepthBuffer&&Se.buffers.depth.setReversed(!0),Je=new DE(N),Le=new KA,F=new gT(N,xe,Se,Le,ve,ut,Je),R=new TE(w),Z=new RE(w),ce=new kM(N),Nt=new ME(N,ce),de=new IE(N,ce,Je,Nt),ue=new NE(N,de,ce,Je),lt=new UE(N,ve,F),_e=new AE(Le),qe=new JA(w,R,Z,xe,ve,Nt,_e),Ee=new wT(w,Le),ke=new $A,St=new sT(xe),at=new SE(w,R,Z,Se,ue,m,u),He=new lT(w,ue,ve),V=new ET(N,Je,ve,Se),Ve=new wE(N,xe,Je),Mt=new LE(N,xe,Je),Je.programs=qe.programs,w.capabilities=ve,w.extensions=xe,w.properties=Le,w.renderLists=ke,w.shadowMap=He,w.state=Se,w.info=Je}Be();const se=new ST(w,N);this.xr=se,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){const I=xe.get("WEBGL_lose_context");I&&I.loseContext()},this.forceContextRestore=function(){const I=xe.get("WEBGL_lose_context");I&&I.restoreContext()},this.getPixelRatio=function(){return fe},this.setPixelRatio=function(I){I!==void 0&&(fe=I,this.setSize(re,j,!1))},this.getSize=function(I){return I.set(re,j)},this.setSize=function(I,G,Q=!0){if(se.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}re=I,j=G,t.width=Math.floor(I*fe),t.height=Math.floor(G*fe),Q===!0&&(t.style.width=I+"px",t.style.height=G+"px"),this.setViewport(0,0,I,G)},this.getDrawingBufferSize=function(I){return I.set(re*fe,j*fe).floor()},this.setDrawingBufferSize=function(I,G,Q){re=I,j=G,fe=Q,t.width=Math.floor(I*Q),t.height=Math.floor(G*Q),this.setViewport(0,0,I,G)},this.getCurrentViewport=function(I){return I.copy(b)},this.getViewport=function(I){return I.copy(ee)},this.setViewport=function(I,G,Q,$){I.isVector4?ee.set(I.x,I.y,I.z,I.w):ee.set(I,G,Q,$),Se.viewport(b.copy(ee).multiplyScalar(fe).round())},this.getScissor=function(I){return I.copy(le)},this.setScissor=function(I,G,Q,$){I.isVector4?le.set(I.x,I.y,I.z,I.w):le.set(I,G,Q,$),Se.scissor(C.copy(le).multiplyScalar(fe).round())},this.getScissorTest=function(){return Pe},this.setScissorTest=function(I){Se.setScissorTest(Pe=I)},this.setOpaqueSort=function(I){z=I},this.setTransparentSort=function(I){ae=I},this.getClearColor=function(I){return I.copy(at.getClearColor())},this.setClearColor=function(){at.setClearColor.apply(at,arguments)},this.getClearAlpha=function(){return at.getClearAlpha()},this.setClearAlpha=function(){at.setClearAlpha.apply(at,arguments)},this.clear=function(I=!0,G=!0,Q=!0){let $=0;if(I){let Y=!1;if(L!==null){const Me=L.texture.format;Y=Me===mh||Me===ph||Me===rl}if(Y){const Me=L.texture.type,Oe=Me===Ci||Me===vr||Me===Po||Me===Is||Me===hh||Me===fh,Ge=at.getClearColor(),We=at.getClearAlpha(),st=Ge.r,ot=Ge.g,Ke=Ge.b;Oe?(g[0]=st,g[1]=ot,g[2]=Ke,g[3]=We,N.clearBufferuiv(N.COLOR,0,g)):(y[0]=st,y[1]=ot,y[2]=Ke,y[3]=We,N.clearBufferiv(N.COLOR,0,y))}else $|=N.COLOR_BUFFER_BIT}G&&($|=N.DEPTH_BUFFER_BIT,N.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),Q&&($|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear($)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ge,!1),t.removeEventListener("webglcontextrestored",Fe,!1),t.removeEventListener("webglcontextcreationerror",ze,!1),ke.dispose(),St.dispose(),Le.dispose(),R.dispose(),Z.dispose(),ue.dispose(),Nt.dispose(),V.dispose(),qe.dispose(),se.dispose(),se.removeEventListener("sessionstart",vl),se.removeEventListener("sessionend",_l),Qi.stop()};function ge(I){I.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),T=!0}function Fe(){console.log("THREE.WebGLRenderer: Context Restored."),T=!1;const I=Je.autoReset,G=He.enabled,Q=He.autoUpdate,$=He.needsUpdate,Y=He.type;Be(),Je.autoReset=I,He.enabled=G,He.autoUpdate=Q,He.needsUpdate=$,He.type=Y}function ze(I){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",I.statusMessage)}function wt(I){const G=I.target;G.removeEventListener("dispose",wt),Gt(G)}function Gt(I){Mn(I),Le.remove(I)}function Mn(I){const G=Le.get(I).programs;G!==void 0&&(G.forEach(function(Q){qe.releaseProgram(Q)}),I.isShaderMaterial&&qe.releaseShaderCache(I))}this.renderBufferDirect=function(I,G,Q,$,Y,Me){G===null&&(G=Ze);const Oe=Y.isMesh&&Y.matrixWorld.determinant()<0,Ge=Bh(I,G,Q,$,Y);Se.setMaterial($,Oe);let We=Q.index,st=1;if($.wireframe===!0){if(We=de.getWireframeAttribute(Q),We===void 0)return;st=2}const ot=Q.drawRange,Ke=Q.attributes.position;let Tt=ot.start*st,Rt=(ot.start+ot.count)*st;Me!==null&&(Tt=Math.max(Tt,Me.start*st),Rt=Math.min(Rt,(Me.start+Me.count)*st)),We!==null?(Tt=Math.max(Tt,0),Rt=Math.min(Rt,We.count)):Ke!=null&&(Tt=Math.max(Tt,0),Rt=Math.min(Rt,Ke.count));const Ut=Rt-Tt;if(Ut<0||Ut===1/0)return;Nt.setup(Y,$,Ge,Q,We);let _t,$e=Ve;if(We!==null&&(_t=ce.get(We),$e=Mt,$e.setIndex(_t)),Y.isMesh)$.wireframe===!0?(Se.setLineWidth($.wireframeLinewidth*he()),$e.setMode(N.LINES)):$e.setMode(N.TRIANGLES);else if(Y.isLine){let Ye=$.linewidth;Ye===void 0&&(Ye=1),Se.setLineWidth(Ye*he()),Y.isLineSegments?$e.setMode(N.LINES):Y.isLineLoop?$e.setMode(N.LINE_LOOP):$e.setMode(N.LINE_STRIP)}else Y.isPoints?$e.setMode(N.POINTS):Y.isSprite&&$e.setMode(N.TRIANGLES);if(Y.isBatchedMesh)if(Y._multiDrawInstances!==null)$e.renderMultiDrawInstances(Y._multiDrawStarts,Y._multiDrawCounts,Y._multiDrawCount,Y._multiDrawInstances);else if(xe.get("WEBGL_multi_draw"))$e.renderMultiDraw(Y._multiDrawStarts,Y._multiDrawCounts,Y._multiDrawCount);else{const Ye=Y._multiDrawStarts,At=Y._multiDrawCounts,ct=Y._multiDrawCount,sn=We?ce.get(We).bytesPerElement:1,Kn=Le.get($).currentProgram.getUniforms();for(let Ot=0;Ot<ct;Ot++)Kn.setValue(N,"_gl_DrawID",Ot),$e.render(Ye[Ot]/sn,At[Ot])}else if(Y.isInstancedMesh)$e.renderInstances(Tt,Ut,Y.count);else if(Q.isInstancedBufferGeometry){const Ye=Q._maxInstanceCount!==void 0?Q._maxInstanceCount:1/0,At=Math.min(Q.instanceCount,Ye);$e.renderInstances(Tt,Ut,At)}else $e.render(Tt,Ut)};function Et(I,G,Q){I.transparent===!0&&I.side===ri&&I.forceSinglePass===!1?(I.side=In,I.needsUpdate=!0,Hs(I,G,Q),I.side=mr,I.needsUpdate=!0,Hs(I,G,Q),I.side=ri):Hs(I,G,Q)}this.compile=function(I,G,Q=null){Q===null&&(Q=I),x=St.get(Q),x.init(G),E.push(x),Q.traverseVisible(function(Y){Y.isLight&&Y.layers.test(G.layers)&&(x.pushLight(Y),Y.castShadow&&x.pushShadow(Y))}),I!==Q&&I.traverseVisible(function(Y){Y.isLight&&Y.layers.test(G.layers)&&(x.pushLight(Y),Y.castShadow&&x.pushShadow(Y))}),x.setupLights();const $=new Set;return I.traverse(function(Y){if(!(Y.isMesh||Y.isPoints||Y.isLine||Y.isSprite))return;const Me=Y.material;if(Me)if(Array.isArray(Me))for(let Oe=0;Oe<Me.length;Oe++){const Ge=Me[Oe];Et(Ge,Q,Y),$.add(Ge)}else Et(Me,Q,Y),$.add(Me)}),E.pop(),x=null,$},this.compileAsync=function(I,G,Q=null){const $=this.compile(I,G,Q);return new Promise(Y=>{function Me(){if($.forEach(function(Oe){Le.get(Oe).currentProgram.isReady()&&$.delete(Oe)}),$.size===0){Y(I);return}setTimeout(Me,10)}xe.get("KHR_parallel_shader_compile")!==null?Me():setTimeout(Me,10)})};let gn=null;function li(I){gn&&gn(I)}function vl(){Qi.stop()}function _l(){Qi.start()}const Qi=new H_;Qi.setAnimationLoop(li),typeof self<"u"&&Qi.setContext(self),this.setAnimationLoop=function(I){gn=I,se.setAnimationLoop(I),I===null?Qi.stop():Qi.start()},se.addEventListener("sessionstart",vl),se.addEventListener("sessionend",_l),this.render=function(I,G){if(G!==void 0&&G.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(T===!0)return;if(I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),G.parent===null&&G.matrixWorldAutoUpdate===!0&&G.updateMatrixWorld(),se.enabled===!0&&se.isPresenting===!0&&(se.cameraAutoUpdate===!0&&se.updateCamera(G),G=se.getCamera()),I.isScene===!0&&I.onBeforeRender(w,I,G,L),x=St.get(I,E.length),x.init(G),E.push(x),Ae.multiplyMatrices(G.projectionMatrix,G.matrixWorldInverse),Ne.setFromProjectionMatrix(Ae),me=this.localClippingEnabled,ne=_e.init(this.clippingPlanes,me),M=ke.get(I,_.length),M.init(),_.push(M),se.enabled===!0&&se.isPresenting===!0){const Me=w.xr.getDepthSensingMesh();Me!==null&&zs(Me,G,-1/0,w.sortObjects)}zs(I,G,0,w.sortObjects),M.finish(),w.sortObjects===!0&&M.sort(z,ae),Re=se.enabled===!1||se.isPresenting===!1||se.hasDepthSensing()===!1,Re&&at.addToRenderList(M,I),this.info.render.frame++,ne===!0&&_e.beginShadows();const Q=x.state.shadowsArray;He.render(Q,I,G),ne===!0&&_e.endShadows(),this.info.autoReset===!0&&this.info.reset();const $=M.opaque,Y=M.transmissive;if(x.setupLights(),G.isArrayCamera){const Me=G.cameras;if(Y.length>0)for(let Oe=0,Ge=Me.length;Oe<Ge;Oe++){const We=Me[Oe];yl($,Y,I,We)}Re&&at.render(I);for(let Oe=0,Ge=Me.length;Oe<Ge;Oe++){const We=Me[Oe];ks(M,I,We,We.viewport)}}else Y.length>0&&yl($,Y,I,G),Re&&at.render(I),ks(M,I,G);L!==null&&(F.updateMultisampleRenderTarget(L),F.updateRenderTargetMipmap(L)),I.isScene===!0&&I.onAfterRender(w,I,G),Nt.resetDefaultState(),O=-1,k=null,E.pop(),E.length>0?(x=E[E.length-1],ne===!0&&_e.setGlobalState(w.clippingPlanes,x.state.camera)):x=null,_.pop(),_.length>0?M=_[_.length-1]:M=null};function zs(I,G,Q,$){if(I.visible===!1)return;if(I.layers.test(G.layers)){if(I.isGroup)Q=I.renderOrder;else if(I.isLOD)I.autoUpdate===!0&&I.update(G);else if(I.isLight)x.pushLight(I),I.castShadow&&x.pushShadow(I);else if(I.isSprite){if(!I.frustumCulled||Ne.intersectsSprite(I)){$&&nt.setFromMatrixPosition(I.matrixWorld).applyMatrix4(Ae);const Oe=ue.update(I),Ge=I.material;Ge.visible&&M.push(I,Oe,Ge,Q,nt.z,null)}}else if((I.isMesh||I.isLine||I.isPoints)&&(!I.frustumCulled||Ne.intersectsObject(I))){const Oe=ue.update(I),Ge=I.material;if($&&(I.boundingSphere!==void 0?(I.boundingSphere===null&&I.computeBoundingSphere(),nt.copy(I.boundingSphere.center)):(Oe.boundingSphere===null&&Oe.computeBoundingSphere(),nt.copy(Oe.boundingSphere.center)),nt.applyMatrix4(I.matrixWorld).applyMatrix4(Ae)),Array.isArray(Ge)){const We=Oe.groups;for(let st=0,ot=We.length;st<ot;st++){const Ke=We[st],Tt=Ge[Ke.materialIndex];Tt&&Tt.visible&&M.push(I,Oe,Tt,Q,nt.z,Ke)}}else Ge.visible&&M.push(I,Oe,Ge,Q,nt.z,null)}}const Me=I.children;for(let Oe=0,Ge=Me.length;Oe<Ge;Oe++)zs(Me[Oe],G,Q,$)}function ks(I,G,Q,$){const Y=I.opaque,Me=I.transmissive,Oe=I.transparent;x.setupLightsView(Q),ne===!0&&_e.setGlobalState(w.clippingPlanes,Q),$&&Se.viewport(b.copy($)),Y.length>0&&Di(Y,G,Q),Me.length>0&&Di(Me,G,Q),Oe.length>0&&Di(Oe,G,Q),Se.buffers.depth.setTest(!0),Se.buffers.depth.setMask(!0),Se.buffers.color.setMask(!0),Se.setPolygonOffset(!1)}function yl(I,G,Q,$){if((Q.isScene===!0?Q.overrideMaterial:null)!==null)return;x.state.transmissionRenderTarget[$.id]===void 0&&(x.state.transmissionRenderTarget[$.id]=new Ri(1,1,{generateMipmaps:!0,type:xe.has("EXT_color_buffer_half_float")||xe.has("EXT_color_buffer_float")?Fo:Ci,minFilter:Xi,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Dt.workingColorSpace}));const Me=x.state.transmissionRenderTarget[$.id],Oe=$.viewport||b;Me.setSize(Oe.z,Oe.w);const Ge=w.getRenderTarget();w.setRenderTarget(Me),w.getClearColor(q),J=w.getClearAlpha(),J<1&&w.setClearColor(16777215,.5),w.clear(),Re&&at.render(Q);const We=w.toneMapping;w.toneMapping=qi;const st=$.viewport;if($.viewport!==void 0&&($.viewport=void 0),x.setupLightsView($),ne===!0&&_e.setGlobalState(w.clippingPlanes,$),Di(I,Q,$),F.updateMultisampleRenderTarget(Me),F.updateRenderTargetMipmap(Me),xe.has("WEBGL_multisampled_render_to_texture")===!1){let ot=!1;for(let Ke=0,Tt=G.length;Ke<Tt;Ke++){const Rt=G[Ke],Ut=Rt.object,_t=Rt.geometry,$e=Rt.material,Ye=Rt.group;if($e.side===ri&&Ut.layers.test($.layers)){const At=$e.side;$e.side=In,$e.needsUpdate=!0,xl(Ut,Q,$,_t,$e,Ye),$e.side=At,$e.needsUpdate=!0,ot=!0}}ot===!0&&(F.updateMultisampleRenderTarget(Me),F.updateRenderTargetMipmap(Me))}w.setRenderTarget(Ge),w.setClearColor(q,J),st!==void 0&&($.viewport=st),w.toneMapping=We}function Di(I,G,Q){const $=G.isScene===!0?G.overrideMaterial:null;for(let Y=0,Me=I.length;Y<Me;Y++){const Oe=I[Y],Ge=Oe.object,We=Oe.geometry,st=$===null?Oe.material:$,ot=Oe.group;Ge.layers.test(Q.layers)&&xl(Ge,G,Q,We,st,ot)}}function xl(I,G,Q,$,Y,Me){I.onBeforeRender(w,G,Q,$,Y,Me),I.modelViewMatrix.multiplyMatrices(Q.matrixWorldInverse,I.matrixWorld),I.normalMatrix.getNormalMatrix(I.modelViewMatrix),Y.onBeforeRender(w,G,Q,$,I,Me),Y.transparent===!0&&Y.side===ri&&Y.forceSinglePass===!1?(Y.side=In,Y.needsUpdate=!0,w.renderBufferDirect(Q,G,$,Y,I,Me),Y.side=mr,Y.needsUpdate=!0,w.renderBufferDirect(Q,G,$,Y,I,Me),Y.side=ri):w.renderBufferDirect(Q,G,$,Y,I,Me),I.onAfterRender(w,G,Q,$,Y,Me)}function Hs(I,G,Q){G.isScene!==!0&&(G=Ze);const $=Le.get(I),Y=x.state.lights,Me=x.state.shadowsArray,Oe=Y.state.version,Ge=qe.getParameters(I,Y.state,Me,G,Q),We=qe.getProgramCacheKey(Ge);let st=$.programs;$.environment=I.isMeshStandardMaterial?G.environment:null,$.fog=G.fog,$.envMap=(I.isMeshStandardMaterial?Z:R).get(I.envMap||$.environment),$.envMapRotation=$.environment!==null&&I.envMap===null?G.environmentRotation:I.envMapRotation,st===void 0&&(I.addEventListener("dispose",wt),st=new Map,$.programs=st);let ot=st.get(We);if(ot!==void 0){if($.currentProgram===ot&&$.lightsStateVersion===Oe)return Ml(I,Ge),ot}else Ge.uniforms=qe.getUniforms(I),I.onBeforeCompile(Ge,w),ot=qe.acquireProgram(Ge,We),st.set(We,ot),$.uniforms=Ge.uniforms;const Ke=$.uniforms;return(!I.isShaderMaterial&&!I.isRawShaderMaterial||I.clipping===!0)&&(Ke.clippingPlanes=_e.uniform),Ml(I,Ge),$.needsLights=kh(I),$.lightsStateVersion=Oe,$.needsLights&&(Ke.ambientLightColor.value=Y.state.ambient,Ke.lightProbe.value=Y.state.probe,Ke.directionalLights.value=Y.state.directional,Ke.directionalLightShadows.value=Y.state.directionalShadow,Ke.spotLights.value=Y.state.spot,Ke.spotLightShadows.value=Y.state.spotShadow,Ke.rectAreaLights.value=Y.state.rectArea,Ke.ltc_1.value=Y.state.rectAreaLTC1,Ke.ltc_2.value=Y.state.rectAreaLTC2,Ke.pointLights.value=Y.state.point,Ke.pointLightShadows.value=Y.state.pointShadow,Ke.hemisphereLights.value=Y.state.hemi,Ke.directionalShadowMap.value=Y.state.directionalShadowMap,Ke.directionalShadowMatrix.value=Y.state.directionalShadowMatrix,Ke.spotShadowMap.value=Y.state.spotShadowMap,Ke.spotLightMatrix.value=Y.state.spotLightMatrix,Ke.spotLightMap.value=Y.state.spotLightMap,Ke.pointShadowMap.value=Y.state.pointShadowMap,Ke.pointShadowMatrix.value=Y.state.pointShadowMatrix),$.currentProgram=ot,$.uniformsList=null,ot}function Sl(I){if(I.uniformsList===null){const G=I.currentProgram.getUniforms();I.uniformsList=gu.seqWithValue(G.seq,I.uniforms)}return I.uniformsList}function Ml(I,G){const Q=Le.get(I);Q.outputColorSpace=G.outputColorSpace,Q.batching=G.batching,Q.batchingColor=G.batchingColor,Q.instancing=G.instancing,Q.instancingColor=G.instancingColor,Q.instancingMorph=G.instancingMorph,Q.skinning=G.skinning,Q.morphTargets=G.morphTargets,Q.morphNormals=G.morphNormals,Q.morphColors=G.morphColors,Q.morphTargetsCount=G.morphTargetsCount,Q.numClippingPlanes=G.numClippingPlanes,Q.numIntersection=G.numClipIntersection,Q.vertexAlphas=G.vertexAlphas,Q.vertexTangents=G.vertexTangents,Q.toneMapping=G.toneMapping}function Bh(I,G,Q,$,Y){G.isScene!==!0&&(G=Ze),F.resetTextureUnits();const Me=G.fog,Oe=$.isMeshStandardMaterial?G.environment:null,Ge=L===null?w.outputColorSpace:L.isXRRenderTarget===!0?L.texture.colorSpace:yr,We=($.isMeshStandardMaterial?Z:R).get($.envMap||Oe),st=$.vertexColors===!0&&!!Q.attributes.color&&Q.attributes.color.itemSize===4,ot=!!Q.attributes.tangent&&(!!$.normalMap||$.anisotropy>0),Ke=!!Q.morphAttributes.position,Tt=!!Q.morphAttributes.normal,Rt=!!Q.morphAttributes.color;let Ut=qi;$.toneMapped&&(L===null||L.isXRRenderTarget===!0)&&(Ut=w.toneMapping);const _t=Q.morphAttributes.position||Q.morphAttributes.normal||Q.morphAttributes.color,$e=_t!==void 0?_t.length:0,Ye=Le.get($),At=x.state.lights;if(ne===!0&&(me===!0||I!==k)){const Dn=I===k&&$.id===O;_e.setState($,I,Dn)}let ct=!1;$.version===Ye.__version?(Ye.needsLights&&Ye.lightsStateVersion!==At.state.version||Ye.outputColorSpace!==Ge||Y.isBatchedMesh&&Ye.batching===!1||!Y.isBatchedMesh&&Ye.batching===!0||Y.isBatchedMesh&&Ye.batchingColor===!0&&Y.colorTexture===null||Y.isBatchedMesh&&Ye.batchingColor===!1&&Y.colorTexture!==null||Y.isInstancedMesh&&Ye.instancing===!1||!Y.isInstancedMesh&&Ye.instancing===!0||Y.isSkinnedMesh&&Ye.skinning===!1||!Y.isSkinnedMesh&&Ye.skinning===!0||Y.isInstancedMesh&&Ye.instancingColor===!0&&Y.instanceColor===null||Y.isInstancedMesh&&Ye.instancingColor===!1&&Y.instanceColor!==null||Y.isInstancedMesh&&Ye.instancingMorph===!0&&Y.morphTexture===null||Y.isInstancedMesh&&Ye.instancingMorph===!1&&Y.morphTexture!==null||Ye.envMap!==We||$.fog===!0&&Ye.fog!==Me||Ye.numClippingPlanes!==void 0&&(Ye.numClippingPlanes!==_e.numPlanes||Ye.numIntersection!==_e.numIntersection)||Ye.vertexAlphas!==st||Ye.vertexTangents!==ot||Ye.morphTargets!==Ke||Ye.morphNormals!==Tt||Ye.morphColors!==Rt||Ye.toneMapping!==Ut||Ye.morphTargetsCount!==$e)&&(ct=!0):(ct=!0,Ye.__version=$.version);let sn=Ye.currentProgram;ct===!0&&(sn=Hs($,G,Y));let Kn=!1,Ot=!1,Sr=!1;const Ht=sn.getUniforms(),xi=Ye.uniforms;if(Se.useProgram(sn.program)&&(Kn=!0,Ot=!0,Sr=!0),$.id!==O&&(O=$.id,Ot=!0),Kn||k!==I){ve.reverseDepthBuffer?(Ce.copy(I.projectionMatrix),uM(Ce),hM(Ce),Ht.setValue(N,"projectionMatrix",Ce)):Ht.setValue(N,"projectionMatrix",I.projectionMatrix),Ht.setValue(N,"viewMatrix",I.matrixWorldInverse);const Dn=Ht.map.cameraPosition;Dn!==void 0&&Dn.setValue(N,tt.setFromMatrixPosition(I.matrixWorld)),ve.logarithmicDepthBuffer&&Ht.setValue(N,"logDepthBufFC",2/(Math.log(I.far+1)/Math.LN2)),($.isMeshPhongMaterial||$.isMeshToonMaterial||$.isMeshLambertMaterial||$.isMeshBasicMaterial||$.isMeshStandardMaterial||$.isShaderMaterial)&&Ht.setValue(N,"isOrthographic",I.isOrthographicCamera===!0),k!==I&&(k=I,Ot=!0,Sr=!0)}if(Y.isSkinnedMesh){Ht.setOptional(N,Y,"bindMatrix"),Ht.setOptional(N,Y,"bindMatrixInverse");const Dn=Y.skeleton;Dn&&(Dn.boneTexture===null&&Dn.computeBoneTexture(),Ht.setValue(N,"boneTexture",Dn.boneTexture,F))}Y.isBatchedMesh&&(Ht.setOptional(N,Y,"batchingTexture"),Ht.setValue(N,"batchingTexture",Y._matricesTexture,F),Ht.setOptional(N,Y,"batchingIdTexture"),Ht.setValue(N,"batchingIdTexture",Y._indirectTexture,F),Ht.setOptional(N,Y,"batchingColorTexture"),Y._colorsTexture!==null&&Ht.setValue(N,"batchingColorTexture",Y._colorsTexture,F));const Mr=Q.morphAttributes;if((Mr.position!==void 0||Mr.normal!==void 0||Mr.color!==void 0)&&lt.update(Y,Q,sn),(Ot||Ye.receiveShadow!==Y.receiveShadow)&&(Ye.receiveShadow=Y.receiveShadow,Ht.setValue(N,"receiveShadow",Y.receiveShadow)),$.isMeshGouraudMaterial&&$.envMap!==null&&(xi.envMap.value=We,xi.flipEnvMap.value=We.isCubeTexture&&We.isRenderTargetTexture===!1?-1:1),$.isMeshStandardMaterial&&$.envMap===null&&G.environment!==null&&(xi.envMapIntensity.value=G.environmentIntensity),Ot&&(Ht.setValue(N,"toneMappingExposure",w.toneMappingExposure),Ye.needsLights&&zh(xi,Sr),Me&&$.fog===!0&&Ee.refreshFogUniforms(xi,Me),Ee.refreshMaterialUniforms(xi,$,fe,j,x.state.transmissionRenderTarget[I.id]),gu.upload(N,Sl(Ye),xi,F)),$.isShaderMaterial&&$.uniformsNeedUpdate===!0&&(gu.upload(N,Sl(Ye),xi,F),$.uniformsNeedUpdate=!1),$.isSpriteMaterial&&Ht.setValue(N,"center",Y.center),Ht.setValue(N,"modelViewMatrix",Y.modelViewMatrix),Ht.setValue(N,"normalMatrix",Y.normalMatrix),Ht.setValue(N,"modelMatrix",Y.matrixWorld),$.isShaderMaterial||$.isRawShaderMaterial){const Dn=$.uniformsGroups;for(let Un=0,Hh=Dn.length;Un<Hh;Un++){const wl=Dn[Un];V.update(wl,sn),V.bind(wl,sn)}}return sn}function zh(I,G){I.ambientLightColor.needsUpdate=G,I.lightProbe.needsUpdate=G,I.directionalLights.needsUpdate=G,I.directionalLightShadows.needsUpdate=G,I.pointLights.needsUpdate=G,I.pointLightShadows.needsUpdate=G,I.spotLights.needsUpdate=G,I.spotLightShadows.needsUpdate=G,I.rectAreaLights.needsUpdate=G,I.hemisphereLights.needsUpdate=G}function kh(I){return I.isMeshLambertMaterial||I.isMeshToonMaterial||I.isMeshPhongMaterial||I.isMeshStandardMaterial||I.isShadowMaterial||I.isShaderMaterial&&I.lights===!0}this.getActiveCubeFace=function(){return U},this.getActiveMipmapLevel=function(){return P},this.getRenderTarget=function(){return L},this.setRenderTargetTextures=function(I,G,Q){Le.get(I.texture).__webglTexture=G,Le.get(I.depthTexture).__webglTexture=Q;const $=Le.get(I);$.__hasExternalTextures=!0,$.__autoAllocateDepthBuffer=Q===void 0,$.__autoAllocateDepthBuffer||xe.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),$.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(I,G){const Q=Le.get(I);Q.__webglFramebuffer=G,Q.__useDefaultFramebuffer=G===void 0},this.setRenderTarget=function(I,G=0,Q=0){L=I,U=G,P=Q;let $=!0,Y=null,Me=!1,Oe=!1;if(I){const We=Le.get(I);if(We.__useDefaultFramebuffer!==void 0)Se.bindFramebuffer(N.FRAMEBUFFER,null),$=!1;else if(We.__webglFramebuffer===void 0)F.setupRenderTarget(I);else if(We.__hasExternalTextures)F.rebindTextures(I,Le.get(I.texture).__webglTexture,Le.get(I.depthTexture).__webglTexture);else if(I.depthBuffer){const Ke=I.depthTexture;if(We.__boundDepthTexture!==Ke){if(Ke!==null&&Le.has(Ke)&&(I.width!==Ke.image.width||I.height!==Ke.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");F.setupDepthRenderbuffer(I)}}const st=I.texture;(st.isData3DTexture||st.isDataArrayTexture||st.isCompressedArrayTexture)&&(Oe=!0);const ot=Le.get(I).__webglFramebuffer;I.isWebGLCubeRenderTarget?(Array.isArray(ot[G])?Y=ot[G][Q]:Y=ot[G],Me=!0):I.samples>0&&F.useMultisampledRTT(I)===!1?Y=Le.get(I).__webglMultisampledFramebuffer:Array.isArray(ot)?Y=ot[Q]:Y=ot,b.copy(I.viewport),C.copy(I.scissor),W=I.scissorTest}else b.copy(ee).multiplyScalar(fe).floor(),C.copy(le).multiplyScalar(fe).floor(),W=Pe;if(Se.bindFramebuffer(N.FRAMEBUFFER,Y)&&$&&Se.drawBuffers(I,Y),Se.viewport(b),Se.scissor(C),Se.setScissorTest(W),Me){const We=Le.get(I.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+G,We.__webglTexture,Q)}else if(Oe){const We=Le.get(I.texture),st=G||0;N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,We.__webglTexture,Q||0,st)}O=-1},this.readRenderTargetPixels=function(I,G,Q,$,Y,Me,Oe){if(!(I&&I.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ge=Le.get(I).__webglFramebuffer;if(I.isWebGLCubeRenderTarget&&Oe!==void 0&&(Ge=Ge[Oe]),Ge){Se.bindFramebuffer(N.FRAMEBUFFER,Ge);try{const We=I.texture,st=We.format,ot=We.type;if(!ve.textureFormatReadable(st)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ve.textureTypeReadable(ot)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}G>=0&&G<=I.width-$&&Q>=0&&Q<=I.height-Y&&N.readPixels(G,Q,$,Y,ut.convert(st),ut.convert(ot),Me)}finally{const We=L!==null?Le.get(L).__webglFramebuffer:null;Se.bindFramebuffer(N.FRAMEBUFFER,We)}}},this.readRenderTargetPixelsAsync=async function(I,G,Q,$,Y,Me,Oe){if(!(I&&I.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ge=Le.get(I).__webglFramebuffer;if(I.isWebGLCubeRenderTarget&&Oe!==void 0&&(Ge=Ge[Oe]),Ge){const We=I.texture,st=We.format,ot=We.type;if(!ve.textureFormatReadable(st))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ve.textureTypeReadable(ot))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(G>=0&&G<=I.width-$&&Q>=0&&Q<=I.height-Y){Se.bindFramebuffer(N.FRAMEBUFFER,Ge);const Ke=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,Ke),N.bufferData(N.PIXEL_PACK_BUFFER,Me.byteLength,N.STREAM_READ),N.readPixels(G,Q,$,Y,ut.convert(st),ut.convert(ot),0);const Tt=L!==null?Le.get(L).__webglFramebuffer:null;Se.bindFramebuffer(N.FRAMEBUFFER,Tt);const Rt=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await cM(N,Rt,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,Ke),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,Me),N.deleteBuffer(Ke),N.deleteSync(Rt),Me}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(I,G=null,Q=0){I.isTexture!==!0&&(mu("WebGLRenderer: copyFramebufferToTexture function signature has changed."),G=arguments[0]||null,I=arguments[1]);const $=Math.pow(2,-Q),Y=Math.floor(I.image.width*$),Me=Math.floor(I.image.height*$),Oe=G!==null?G.x:0,Ge=G!==null?G.y:0;F.setTexture2D(I,0),N.copyTexSubImage2D(N.TEXTURE_2D,Q,0,0,Oe,Ge,Y,Me),Se.unbindTexture()},this.copyTextureToTexture=function(I,G,Q=null,$=null,Y=0){I.isTexture!==!0&&(mu("WebGLRenderer: copyTextureToTexture function signature has changed."),$=arguments[0]||null,I=arguments[1],G=arguments[2],Y=arguments[3]||0,Q=null);let Me,Oe,Ge,We,st,ot;Q!==null?(Me=Q.max.x-Q.min.x,Oe=Q.max.y-Q.min.y,Ge=Q.min.x,We=Q.min.y):(Me=I.image.width,Oe=I.image.height,Ge=0,We=0),$!==null?(st=$.x,ot=$.y):(st=0,ot=0);const Ke=ut.convert(G.format),Tt=ut.convert(G.type);F.setTexture2D(G,0),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,G.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,G.unpackAlignment);const Rt=N.getParameter(N.UNPACK_ROW_LENGTH),Ut=N.getParameter(N.UNPACK_IMAGE_HEIGHT),_t=N.getParameter(N.UNPACK_SKIP_PIXELS),$e=N.getParameter(N.UNPACK_SKIP_ROWS),Ye=N.getParameter(N.UNPACK_SKIP_IMAGES),At=I.isCompressedTexture?I.mipmaps[Y]:I.image;N.pixelStorei(N.UNPACK_ROW_LENGTH,At.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,At.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,Ge),N.pixelStorei(N.UNPACK_SKIP_ROWS,We),I.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,Y,st,ot,Me,Oe,Ke,Tt,At.data):I.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,Y,st,ot,At.width,At.height,Ke,At.data):N.texSubImage2D(N.TEXTURE_2D,Y,st,ot,Me,Oe,Ke,Tt,At),N.pixelStorei(N.UNPACK_ROW_LENGTH,Rt),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,Ut),N.pixelStorei(N.UNPACK_SKIP_PIXELS,_t),N.pixelStorei(N.UNPACK_SKIP_ROWS,$e),N.pixelStorei(N.UNPACK_SKIP_IMAGES,Ye),Y===0&&G.generateMipmaps&&N.generateMipmap(N.TEXTURE_2D),Se.unbindTexture()},this.copyTextureToTexture3D=function(I,G,Q=null,$=null,Y=0){I.isTexture!==!0&&(mu("WebGLRenderer: copyTextureToTexture3D function signature has changed."),Q=arguments[0]||null,$=arguments[1]||null,I=arguments[2],G=arguments[3],Y=arguments[4]||0);let Me,Oe,Ge,We,st,ot,Ke,Tt,Rt;const Ut=I.isCompressedTexture?I.mipmaps[Y]:I.image;Q!==null?(Me=Q.max.x-Q.min.x,Oe=Q.max.y-Q.min.y,Ge=Q.max.z-Q.min.z,We=Q.min.x,st=Q.min.y,ot=Q.min.z):(Me=Ut.width,Oe=Ut.height,Ge=Ut.depth,We=0,st=0,ot=0),$!==null?(Ke=$.x,Tt=$.y,Rt=$.z):(Ke=0,Tt=0,Rt=0);const _t=ut.convert(G.format),$e=ut.convert(G.type);let Ye;if(G.isData3DTexture)F.setTexture3D(G,0),Ye=N.TEXTURE_3D;else if(G.isDataArrayTexture||G.isCompressedArrayTexture)F.setTexture2DArray(G,0),Ye=N.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,G.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,G.unpackAlignment);const At=N.getParameter(N.UNPACK_ROW_LENGTH),ct=N.getParameter(N.UNPACK_IMAGE_HEIGHT),sn=N.getParameter(N.UNPACK_SKIP_PIXELS),Kn=N.getParameter(N.UNPACK_SKIP_ROWS),Ot=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,Ut.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,Ut.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,We),N.pixelStorei(N.UNPACK_SKIP_ROWS,st),N.pixelStorei(N.UNPACK_SKIP_IMAGES,ot),I.isDataTexture||I.isData3DTexture?N.texSubImage3D(Ye,Y,Ke,Tt,Rt,Me,Oe,Ge,_t,$e,Ut.data):G.isCompressedArrayTexture?N.compressedTexSubImage3D(Ye,Y,Ke,Tt,Rt,Me,Oe,Ge,_t,Ut.data):N.texSubImage3D(Ye,Y,Ke,Tt,Rt,Me,Oe,Ge,_t,$e,Ut),N.pixelStorei(N.UNPACK_ROW_LENGTH,At),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ct),N.pixelStorei(N.UNPACK_SKIP_PIXELS,sn),N.pixelStorei(N.UNPACK_SKIP_ROWS,Kn),N.pixelStorei(N.UNPACK_SKIP_IMAGES,Ot),Y===0&&G.generateMipmaps&&N.generateMipmap(Ye),Se.unbindTexture()},this.initRenderTarget=function(I){Le.get(I).__webglFramebuffer===void 0&&F.setupRenderTarget(I)},this.initTexture=function(I){I.isCubeTexture?F.setTextureCube(I,0):I.isData3DTexture?F.setTexture3D(I,0):I.isDataArrayTexture||I.isCompressedArrayTexture?F.setTexture2DArray(I,0):F.setTexture2D(I,0),Se.unbindTexture()},this.resetState=function(){U=0,P=0,L=null,Se.reset(),Nt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Yi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===vh?"display-p3":"srgb",t.unpackColorSpace=Dt.workingColorSpace===sl?"display-p3":"srgb"}}class xh{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ue(e),this.density=t}clone(){return new xh(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class Sh{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ue(e),this.near=t,this.far=n}clone(){return new Sh(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Up extends Ct{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ai,this.environmentIntensity=1,this.environmentRotation=new ai,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Mh{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Xa,this.updateRanges=[],this.version=0,this.uuid=oi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,s=this.stride;i<s;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=oi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=oi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const On=new D;class si{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)On.fromBufferAttribute(this,t),On.applyMatrix4(e),this.setXYZ(t,On.x,On.y,On.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)On.fromBufferAttribute(this,t),On.applyNormalMatrix(e),this.setXYZ(t,On.x,On.y,On.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)On.fromBufferAttribute(this,t),On.transformDirection(e),this.setXYZ(t,On.x,On.y,On.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=zn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=pt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=zn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=zn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=zn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=zn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),i=pt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),i=pt(i,this.array),s=pt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return new Ft(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new si(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Np extends Ln{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ue(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let po;const pa=new D,mo=new D,go=new D,vo=new pe,ma=new pe,Z_=new rt,Fc=new D,ga=new D,Oc=new D,A0=new pe,Sd=new pe,T0=new pe;class J_ extends Ct{constructor(e=new Np){if(super(),this.isSprite=!0,this.type="Sprite",po===void 0){po=new vt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Mh(t,5);po.setIndex([0,1,2,0,2,3]),po.setAttribute("position",new si(n,3,0,!1)),po.setAttribute("uv",new si(n,2,3,!1))}this.geometry=po,this.material=e,this.center=new pe(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),mo.setFromMatrixScale(this.matrixWorld),Z_.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),go.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&mo.multiplyScalar(-go.z);const n=this.material.rotation;let i,s;n!==0&&(s=Math.cos(n),i=Math.sin(n));const a=this.center;Bc(Fc.set(-.5,-.5,0),go,a,mo,i,s),Bc(ga.set(.5,-.5,0),go,a,mo,i,s),Bc(Oc.set(.5,.5,0),go,a,mo,i,s),A0.set(0,0),Sd.set(1,0),T0.set(1,1);let c=e.ray.intersectTriangle(Fc,ga,Oc,!1,pa);if(c===null&&(Bc(ga.set(-.5,.5,0),go,a,mo,i,s),Sd.set(0,1),c=e.ray.intersectTriangle(Fc,Oc,ga,!1,pa),c===null))return;const u=e.ray.origin.distanceTo(pa);u<e.near||u>e.far||t.push({distance:u,point:pa.clone(),uv:Yn.getInterpolation(pa,Fc,ga,Oc,A0,Sd,T0,new pe),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Bc(r,e,t,n,i,s){vo.subVectors(r,t).addScalar(.5).multiply(n),i!==void 0?(ma.x=s*vo.x-i*vo.y,ma.y=i*vo.x+s*vo.y):ma.copy(vo),r.copy(e),r.x+=ma.x,r.y+=ma.y,r.applyMatrix4(Z_)}const zc=new D,b0=new D;class K_ extends Ct{constructor(){super(),this._currentLevel=0,this.type="LOD",Object.defineProperties(this,{levels:{enumerable:!0,value:[]},isLOD:{value:!0}}),this.autoUpdate=!0}copy(e){super.copy(e,!1);const t=e.levels;for(let n=0,i=t.length;n<i;n++){const s=t[n];this.addLevel(s.object.clone(),s.distance,s.hysteresis)}return this.autoUpdate=e.autoUpdate,this}addLevel(e,t=0,n=0){t=Math.abs(t);const i=this.levels;let s;for(s=0;s<i.length&&!(t<i[s].distance);s++);return i.splice(s,0,{distance:t,hysteresis:n,object:e}),this.add(e),this}removeLevel(e){const t=this.levels;for(let n=0;n<t.length;n++)if(t[n].distance===e){const i=t.splice(n,1);return this.remove(i[0].object),!0}return!1}getCurrentLevel(){return this._currentLevel}getObjectForDistance(e){const t=this.levels;if(t.length>0){let n,i;for(n=1,i=t.length;n<i;n++){let s=t[n].distance;if(t[n].object.visible&&(s-=s*t[n].hysteresis),e<s)break}return t[n-1].object}return null}raycast(e,t){if(this.levels.length>0){zc.setFromMatrixPosition(this.matrixWorld);const i=e.ray.origin.distanceTo(zc);this.getObjectForDistance(i).raycast(e,t)}}update(e){const t=this.levels;if(t.length>1){zc.setFromMatrixPosition(e.matrixWorld),b0.setFromMatrixPosition(this.matrixWorld);const n=zc.distanceTo(b0)/e.zoom;t[0].object.visible=!0;let i,s;for(i=1,s=t.length;i<s;i++){let a=t[i].distance;if(t[i].object.visible&&(a-=a*t[i].hysteresis),n>=a)t[i-1].object.visible=!1,t[i].object.visible=!0;else break}for(this._currentLevel=i-1;i<s;i++)t[i].object.visible=!1}}toJSON(e){const t=super.toJSON(e);this.autoUpdate===!1&&(t.object.autoUpdate=!1),t.object.levels=[];const n=this.levels;for(let i=0,s=n.length;i<s;i++){const a=n[i];t.object.levels.push({object:a.object.uuid,distance:a.distance,hysteresis:a.hysteresis})}return t}}const C0=new D,R0=new xt,P0=new xt,AT=new D,I0=new rt,kc=new D,Md=new mn,L0=new rt,wd=new Oo;class Q_ extends Qt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Kd,this.bindMatrix=new rt,this.bindMatrixInverse=new rt,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new pn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,kc),this.boundingBox.expandByPoint(kc)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new mn),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,kc),this.boundingSphere.expandByPoint(kc)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Md.copy(this.boundingSphere),Md.applyMatrix4(i),e.ray.intersectsSphere(Md)!==!1&&(L0.copy(i).invert(),wd.copy(e.ray).applyMatrix4(L0),!(this.boundingBox!==null&&wd.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,wd)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new xt,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Kd?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===__?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;R0.fromBufferAttribute(i.attributes.skinIndex,e),P0.fromBufferAttribute(i.attributes.skinWeight,e),C0.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){const a=P0.getComponent(s);if(a!==0){const c=R0.getComponent(s);I0.multiplyMatrices(n.bones[c].matrixWorld,n.boneInverses[c]),t.addScaledVector(AT.copy(C0).applyMatrix4(I0),a)}}return t.applyMatrix4(this.bindMatrixInverse)}}class Fp extends Ct{constructor(){super(),this.isBone=!0,this.type="Bone"}}class ji extends Zt{constructor(e=null,t=1,n=1,i,s,a,c,u,h=dn,f=dn,p,m){super(null,a,c,u,h,f,i,s,p,m),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const D0=new rt,TT=new rt;class wh{constructor(e=[],t=[]){this.uuid=oi(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new rt)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new rt;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let s=0,a=e.length;s<a;s++){const c=e[s]?e[s].matrixWorld:TT;D0.multiplyMatrices(c,t[s]),D0.toArray(n,s*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new wh(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new ji(t,e,e,Pn,qn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const s=e.bones[n];let a=t[s];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),a=new Fp),this.bones.push(a),this.boneInverses.push(new rt().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,s=t.length;i<s;i++){const a=t[i];e.bones.push(a.uuid);const c=n[i];e.boneInverses.push(c.toArray())}return e}}class Do extends Ft{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const _o=new rt,U0=new rt,Hc=[],N0=new pn,bT=new rt,va=new Qt,_a=new mn;class $_ extends Qt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Do(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,bT)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new pn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,_o),N0.copy(e.boundingBox).applyMatrix4(_o),this.boundingBox.union(N0)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new mn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,_o),_a.copy(e.boundingSphere).applyMatrix4(_o),this.boundingSphere.union(_a)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,s=n.length+1,a=e*s+1;for(let c=0;c<n.length;c++)n[c]=i[a+c]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(va.geometry=this.geometry,va.material=this.material,va.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),_a.copy(this.boundingSphere),_a.applyMatrix4(n),e.ray.intersectsSphere(_a)!==!1))for(let s=0;s<i;s++){this.getMatrixAt(s,_o),U0.multiplyMatrices(n,_o),va.matrixWorld=U0,va.raycast(e,Hc);for(let a=0,c=Hc.length;a<c;a++){const u=Hc[a];u.instanceId=s,u.object=this,t.push(u)}Hc.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Do(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new ji(new Float32Array(i*this.count),i,this.count,dh,qn));const s=this.morphTexture.source.data.data;let a=0;for(let h=0;h<n.length;h++)a+=n[h];const c=this.geometry.morphTargetsRelative?1:1-a,u=i*e;s[u]=c,s.set(n,u+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}function CT(r,e){return r.z-e.z}function RT(r,e){return e.z-r.z}class PT{constructor(){this.index=0,this.pool=[],this.list=[]}push(e,t,n){const i=this.pool,s=this.list;this.index>=i.length&&i.push({start:-1,count:-1,z:-1,index:-1});const a=i[this.index];s.push(a),this.index++,a.start=e.start,a.count=e.count,a.z=t,a.index=n}reset(){this.list.length=0,this.index=0}}const Or=new rt,Ed=new rt,IT=new rt,LT=new Ue(1,1,1),F0=new rt,Ad=new ll,Vc=new pn,cs=new mn,ya=new D,O0=new D,DT=new D,Td=new PT,Rn=new Qt,Gc=[];function UT(r,e,t=0){const n=e.itemSize;if(r.isInterleavedBufferAttribute||r.array.constructor!==e.array.constructor){const i=r.count;for(let s=0;s<i;s++)for(let a=0;a<n;a++)e.setComponent(s+t,a,r.getComponent(s,a))}else e.array.set(r.array,t*n);e.needsUpdate=!0}class ey extends Qt{get maxInstanceCount(){return this._maxInstanceCount}constructor(e,t,n=t*2,i){super(new vt,i),this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._drawInfo=[],this._availableInstanceIds=[],this._drawRanges=[],this._reservedRanges=[],this._bounds=[],this._maxInstanceCount=e,this._maxVertexCount=t,this._maxIndexCount=n,this._geometryInitialized=!1,this._geometryCount=0,this._multiDrawCounts=new Int32Array(e),this._multiDrawStarts=new Int32Array(e),this._multiDrawCount=0,this._multiDrawInstances=null,this._visibilityChanged=!0,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}_initMatricesTexture(){let e=Math.sqrt(this._maxInstanceCount*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4),n=new ji(t,e,e,Pn,qn);this._matricesTexture=n}_initIndirectTexture(){let e=Math.sqrt(this._maxInstanceCount);e=Math.ceil(e);const t=new Uint32Array(e*e),n=new ji(t,e,e,rl,vr);this._indirectTexture=n}_initColorsTexture(){let e=Math.sqrt(this._maxInstanceCount);e=Math.ceil(e);const t=new Float32Array(e*e*4).fill(1),n=new ji(t,e,e,Pn,qn);n.colorSpace=Dt.workingColorSpace,this._colorsTexture=n}_initializeGeometry(e){const t=this.geometry,n=this._maxVertexCount,i=this._maxIndexCount;if(this._geometryInitialized===!1){for(const s in e.attributes){const a=e.getAttribute(s),{array:c,itemSize:u,normalized:h}=a,f=new c.constructor(n*u),p=new Ft(f,u,h);t.setAttribute(s,p)}if(e.getIndex()!==null){const s=n>65535?new Uint32Array(i):new Uint16Array(i);t.setIndex(new Ft(s,1))}this._geometryInitialized=!0}}_validateGeometry(e){const t=this.geometry;if(!!e.getIndex()!=!!t.getIndex())throw new Error('BatchedMesh: All geometries must consistently have "index".');for(const n in t.attributes){if(!e.hasAttribute(n))throw new Error(`BatchedMesh: Added geometry missing "${n}". All geometries must have consistent attributes.`);const i=e.getAttribute(n),s=t.getAttribute(n);if(i.itemSize!==s.itemSize||i.normalized!==s.normalized)throw new Error("BatchedMesh: All attributes must have a consistent itemSize and normalized value.")}}setCustomSort(e){return this.customSort=e,this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new pn);const e=this.boundingBox,t=this._drawInfo;e.makeEmpty();for(let n=0,i=t.length;n<i;n++){if(t[n].active===!1)continue;const s=t[n].geometryIndex;this.getMatrixAt(n,Or),this.getBoundingBoxAt(s,Vc).applyMatrix4(Or),e.union(Vc)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new mn);const e=this.boundingSphere,t=this._drawInfo;e.makeEmpty();for(let n=0,i=t.length;n<i;n++){if(t[n].active===!1)continue;const s=t[n].geometryIndex;this.getMatrixAt(n,Or),this.getBoundingSphereAt(s,cs).applyMatrix4(Or),e.union(cs)}}addInstance(e){if(this._drawInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw new Error("BatchedMesh: Maximum item count reached.");const n={visible:!0,active:!0,geometryIndex:e};let i=null;this._availableInstanceIds.length>0?(i=this._availableInstanceIds.pop(),this._drawInfo[i]=n):(i=this._drawInfo.length,this._drawInfo.push(n));const s=this._matricesTexture,a=s.image.data;IT.toArray(a,i*16),s.needsUpdate=!0;const c=this._colorsTexture;return c&&(LT.toArray(c.image.data,i*4),c.needsUpdate=!0),i}addGeometry(e,t=-1,n=-1){if(this._initializeGeometry(e),this._validateGeometry(e),this._drawInfo.length>=this._maxInstanceCount)throw new Error("BatchedMesh: Maximum item count reached.");const i={vertexStart:-1,vertexCount:-1,indexStart:-1,indexCount:-1};let s=null;const a=this._reservedRanges,c=this._drawRanges,u=this._bounds;this._geometryCount!==0&&(s=a[a.length-1]),t===-1?i.vertexCount=e.getAttribute("position").count:i.vertexCount=t,s===null?i.vertexStart=0:i.vertexStart=s.vertexStart+s.vertexCount;const h=e.getIndex(),f=h!==null;if(f&&(n===-1?i.indexCount=h.count:i.indexCount=n,s===null?i.indexStart=0:i.indexStart=s.indexStart+s.indexCount),i.indexStart!==-1&&i.indexStart+i.indexCount>this._maxIndexCount||i.vertexStart+i.vertexCount>this._maxVertexCount)throw new Error("BatchedMesh: Reserved space request exceeds the maximum buffer size.");const p=this._geometryCount;return this._geometryCount++,a.push(i),c.push({start:f?i.indexStart:i.vertexStart,count:-1}),u.push({boxInitialized:!1,box:new pn,sphereInitialized:!1,sphere:new mn}),this.setGeometryAt(p,e),p}setGeometryAt(e,t){if(e>=this._geometryCount)throw new Error("BatchedMesh: Maximum geometry count reached.");this._validateGeometry(t);const n=this.geometry,i=n.getIndex()!==null,s=n.getIndex(),a=t.getIndex(),c=this._reservedRanges[e];if(i&&a.count>c.indexCount||t.attributes.position.count>c.vertexCount)throw new Error("BatchedMesh: Reserved space not large enough for provided geometry.");const u=c.vertexStart,h=c.vertexCount;for(const g in n.attributes){const y=t.getAttribute(g),M=n.getAttribute(g);UT(y,M,u);const x=y.itemSize;for(let _=y.count,E=h;_<E;_++){const w=u+_;for(let T=0;T<x;T++)M.setComponent(w,T,0)}M.needsUpdate=!0,M.addUpdateRange(u*x,h*x)}if(i){const g=c.indexStart;for(let y=0;y<a.count;y++)s.setX(g+y,u+a.getX(y));for(let y=a.count,M=c.indexCount;y<M;y++)s.setX(g+y,u);s.needsUpdate=!0,s.addUpdateRange(g,c.indexCount)}const f=this._bounds[e];t.boundingBox!==null?(f.box.copy(t.boundingBox),f.boxInitialized=!0):f.boxInitialized=!1,t.boundingSphere!==null?(f.sphere.copy(t.boundingSphere),f.sphereInitialized=!0):f.sphereInitialized=!1;const p=this._drawRanges[e],m=t.getAttribute("position");return p.count=i?a.count:m.count,this._visibilityChanged=!0,e}deleteInstance(e){const t=this._drawInfo;return e>=t.length||t[e].active===!1?this:(t[e].active=!1,this._availableInstanceIds.push(e),this._visibilityChanged=!0,this)}getBoundingBoxAt(e,t){if(e>=this._geometryCount)return null;const n=this._bounds[e],i=n.box,s=this.geometry;if(n.boxInitialized===!1){i.makeEmpty();const a=s.index,c=s.attributes.position,u=this._drawRanges[e];for(let h=u.start,f=u.start+u.count;h<f;h++){let p=h;a&&(p=a.getX(p)),i.expandByPoint(ya.fromBufferAttribute(c,p))}n.boxInitialized=!0}return t.copy(i),t}getBoundingSphereAt(e,t){if(e>=this._geometryCount)return null;const n=this._bounds[e],i=n.sphere,s=this.geometry;if(n.sphereInitialized===!1){i.makeEmpty(),this.getBoundingBoxAt(e,Vc),Vc.getCenter(i.center);const a=s.index,c=s.attributes.position,u=this._drawRanges[e];let h=0;for(let f=u.start,p=u.start+u.count;f<p;f++){let m=f;a&&(m=a.getX(m)),ya.fromBufferAttribute(c,m),h=Math.max(h,i.center.distanceToSquared(ya))}i.radius=Math.sqrt(h),n.sphereInitialized=!0}return t.copy(i),t}setMatrixAt(e,t){const n=this._drawInfo,i=this._matricesTexture,s=this._matricesTexture.image.data;return e>=n.length||n[e].active===!1?this:(t.toArray(s,e*16),i.needsUpdate=!0,this)}getMatrixAt(e,t){const n=this._drawInfo,i=this._matricesTexture.image.data;return e>=n.length||n[e].active===!1?null:t.fromArray(i,e*16)}setColorAt(e,t){this._colorsTexture===null&&this._initColorsTexture();const n=this._colorsTexture,i=this._colorsTexture.image.data,s=this._drawInfo;return e>=s.length||s[e].active===!1?this:(t.toArray(i,e*4),n.needsUpdate=!0,this)}getColorAt(e,t){const n=this._colorsTexture.image.data,i=this._drawInfo;return e>=i.length||i[e].active===!1?null:t.fromArray(n,e*4)}setVisibleAt(e,t){const n=this._drawInfo;return e>=n.length||n[e].active===!1||n[e].visible===t?this:(n[e].visible=t,this._visibilityChanged=!0,this)}getVisibleAt(e){const t=this._drawInfo;return e>=t.length||t[e].active===!1?!1:t[e].visible}setGeometryIdAt(e,t){const n=this._drawInfo;return e>=n.length||n[e].active===!1||t<0||t>=this._geometryCount?null:(n[e].geometryIndex=t,this)}getGeometryIdAt(e){const t=this._drawInfo;return e>=t.length||t[e].active===!1?-1:t[e].geometryIndex}getGeometryRangeAt(e,t={}){if(e<0||e>=this._geometryCount)return null;const n=this._drawRanges[e];return t.start=n.start,t.count=n.count,t}raycast(e,t){const n=this._drawInfo,i=this._drawRanges,s=this.matrixWorld,a=this.geometry;Rn.material=this.material,Rn.geometry.index=a.index,Rn.geometry.attributes=a.attributes,Rn.geometry.boundingBox===null&&(Rn.geometry.boundingBox=new pn),Rn.geometry.boundingSphere===null&&(Rn.geometry.boundingSphere=new mn);for(let c=0,u=n.length;c<u;c++){if(!n[c].visible||!n[c].active)continue;const h=n[c].geometryIndex,f=i[h];Rn.geometry.setDrawRange(f.start,f.count),this.getMatrixAt(c,Rn.matrixWorld).premultiply(s),this.getBoundingBoxAt(h,Rn.geometry.boundingBox),this.getBoundingSphereAt(h,Rn.geometry.boundingSphere),Rn.raycast(e,Gc);for(let p=0,m=Gc.length;p<m;p++){const g=Gc[p];g.object=this,g.batchId=c,t.push(g)}Gc.length=0}Rn.material=null,Rn.geometry.index=null,Rn.geometry.attributes={},Rn.geometry.setDrawRange(0,1/0)}copy(e){return super.copy(e),this.geometry=e.geometry.clone(),this.perObjectFrustumCulled=e.perObjectFrustumCulled,this.sortObjects=e.sortObjects,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this._drawRanges=e._drawRanges.map(t=>({...t})),this._reservedRanges=e._reservedRanges.map(t=>({...t})),this._drawInfo=e._drawInfo.map(t=>({...t})),this._bounds=e._bounds.map(t=>({boxInitialized:t.boxInitialized,box:t.box.clone(),sphereInitialized:t.sphereInitialized,sphere:t.sphere.clone()})),this._maxInstanceCount=e._maxInstanceCount,this._maxVertexCount=e._maxVertexCount,this._maxIndexCount=e._maxIndexCount,this._geometryInitialized=e._geometryInitialized,this._geometryCount=e._geometryCount,this._multiDrawCounts=e._multiDrawCounts.slice(),this._multiDrawStarts=e._multiDrawStarts.slice(),this._matricesTexture=e._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),this._colorsTexture!==null&&(this._colorsTexture=e._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice()),this}dispose(){return this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null&&(this._colorsTexture.dispose(),this._colorsTexture=null),this}onBeforeRender(e,t,n,i,s){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;const a=i.getIndex(),c=a===null?1:a.array.BYTES_PER_ELEMENT,u=this._drawInfo,h=this._multiDrawStarts,f=this._multiDrawCounts,p=this._drawRanges,m=this.perObjectFrustumCulled,g=this._indirectTexture,y=g.image.data;m&&(F0.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse).multiply(this.matrixWorld),Ad.setFromProjectionMatrix(F0,e.coordinateSystem));let M=0;if(this.sortObjects){Ed.copy(this.matrixWorld).invert(),ya.setFromMatrixPosition(n.matrixWorld).applyMatrix4(Ed),O0.set(0,0,-1).transformDirection(n.matrixWorld).transformDirection(Ed);for(let E=0,w=u.length;E<w;E++)if(u[E].visible&&u[E].active){const T=u[E].geometryIndex;this.getMatrixAt(E,Or),this.getBoundingSphereAt(T,cs).applyMatrix4(Or);let U=!1;if(m&&(U=!Ad.intersectsSphere(cs)),!U){const P=DT.subVectors(cs.center,ya).dot(O0);Td.push(p[T],P,E)}}const x=Td.list,_=this.customSort;_===null?x.sort(s.transparent?RT:CT):_.call(this,x,n);for(let E=0,w=x.length;E<w;E++){const T=x[E];h[M]=T.start*c,f[M]=T.count,y[M]=T.index,M++}Td.reset()}else for(let x=0,_=u.length;x<_;x++)if(u[x].visible&&u[x].active){const E=u[x].geometryIndex;let w=!1;if(m&&(this.getMatrixAt(x,Or),this.getBoundingSphereAt(E,cs).applyMatrix4(Or),w=!Ad.intersectsSphere(cs)),!w){const T=p[E];h[M]=T.start*c,f[M]=T.count,y[M]=x,M++}}g.needsUpdate=!0,this._multiDrawCount=M,this._visibilityChanged=!1}onBeforeShadow(e,t,n,i,s,a){this.onBeforeRender(e,null,i,s,a)}}class kn extends Ln{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ue(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const ih=new D,rh=new D,B0=new rt,xa=new Oo,Wc=new mn,bd=new D,z0=new D;let Gr=class extends Ct{constructor(e=new vt,t=new kn){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,s=t.count;i<s;i++)ih.fromBufferAttribute(t,i-1),rh.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=ih.distanceTo(rh);e.setAttribute("lineDistance",new je(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Wc.copy(n.boundingSphere),Wc.applyMatrix4(i),Wc.radius+=s,e.ray.intersectsSphere(Wc)===!1)return;B0.copy(i).invert(),xa.copy(e.ray).applyMatrix4(B0);const c=s/((this.scale.x+this.scale.y+this.scale.z)/3),u=c*c,h=this.isLineSegments?2:1,f=n.index,m=n.attributes.position;if(f!==null){const g=Math.max(0,a.start),y=Math.min(f.count,a.start+a.count);for(let M=g,x=y-1;M<x;M+=h){const _=f.getX(M),E=f.getX(M+1),w=Xc(this,e,xa,u,_,E);w&&t.push(w)}if(this.isLineLoop){const M=f.getX(y-1),x=f.getX(g),_=Xc(this,e,xa,u,M,x);_&&t.push(_)}}else{const g=Math.max(0,a.start),y=Math.min(m.count,a.start+a.count);for(let M=g,x=y-1;M<x;M+=h){const _=Xc(this,e,xa,u,M,M+1);_&&t.push(_)}if(this.isLineLoop){const M=Xc(this,e,xa,u,y-1,g);M&&t.push(M)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const c=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[c]=s}}}}};function Xc(r,e,t,n,i,s){const a=r.geometry.attributes.position;if(ih.fromBufferAttribute(a,i),rh.fromBufferAttribute(a,s),t.distanceSqToSegment(ih,rh,bd,z0)>n)return;bd.applyMatrix4(r.matrixWorld);const u=e.ray.origin.distanceTo(bd);if(!(u<e.near||u>e.far))return{distance:u,point:z0.clone().applyMatrix4(r.matrixWorld),index:i,face:null,faceIndex:null,barycoord:null,object:r}}const k0=new D,H0=new D;class Ki extends Gr{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,s=t.count;i<s;i+=2)k0.fromBufferAttribute(t,i),H0.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+k0.distanceTo(H0);e.setAttribute("lineDistance",new je(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class ty extends Gr{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Op extends Ln{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ue(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const V0=new rt,ip=new Oo,Yc=new mn,qc=new D;class ny extends Ct{constructor(e=new vt,t=new Op){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Yc.copy(n.boundingSphere),Yc.applyMatrix4(i),Yc.radius+=s,e.ray.intersectsSphere(Yc)===!1)return;V0.copy(i).invert(),ip.copy(e.ray).applyMatrix4(V0);const c=s/((this.scale.x+this.scale.y+this.scale.z)/3),u=c*c,h=n.index,p=n.attributes.position;if(h!==null){const m=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let y=m,M=g;y<M;y++){const x=h.getX(y);qc.fromBufferAttribute(p,x),G0(qc,x,u,i,e,t,this)}}else{const m=Math.max(0,a.start),g=Math.min(p.count,a.start+a.count);for(let y=m,M=g;y<M;y++)qc.fromBufferAttribute(p,y),G0(qc,y,u,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const c=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[c]=s}}}}}function G0(r,e,t,n,i,s,a){const c=ip.distanceSqToPoint(r);if(c<t){const u=new D;ip.closestPointToPoint(r,u),u.applyMatrix4(n);const h=i.ray.origin.distanceTo(u);if(h<i.near||h>i.far)return;s.push({distance:h,distanceToRay:Math.sqrt(c),point:u,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class NT extends Zt{constructor(e,t,n,i,s,a,c,u,h){super(e,t,n,i,s,a,c,u,h),this.isVideoTexture=!0,this.minFilter=a!==void 0?a:rn,this.magFilter=s!==void 0?s:rn,this.generateMipmaps=!1;const f=this;function p(){f.needsUpdate=!0,e.requestVideoFrameCallback(p)}"requestVideoFrameCallback"in e&&e.requestVideoFrameCallback(p)}clone(){return new this.constructor(this.image).copy(this)}update(){const e=this.image;"requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}}class FT extends Zt{constructor(e,t){super({width:e,height:t}),this.isFramebufferTexture=!0,this.magFilter=dn,this.minFilter=dn,this.generateMipmaps=!1,this.needsUpdate=!0}}class Eh extends Zt{constructor(e,t,n,i,s,a,c,u,h,f,p,m){super(null,a,c,u,h,f,i,s,p,m),this.isCompressedTexture=!0,this.image={width:t,height:n},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}}class OT extends Eh{constructor(e,t,n,i,s,a){super(e,t,n,s,a),this.isCompressedArrayTexture=!0,this.image.depth=i,this.wrapR=_i,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class BT extends Eh{constructor(e,t,n){super(void 0,e[0].width,e[0].height,t,n,gr),this.isCompressedCubeTexture=!0,this.isCubeTexture=!0,this.image=e}}class Bp extends Zt{constructor(e,t,n,i,s,a,c,u,h){super(e,t,n,i,s,a,c,u,h),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Ii{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,i=this.getPoint(0),s=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),s+=n.distanceTo(i),t.push(s),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const n=this.getLengths();let i=0;const s=n.length;let a;t?a=t:a=e*n[s-1];let c=0,u=s-1,h;for(;c<=u;)if(i=Math.floor(c+(u-c)/2),h=n[i]-a,h<0)c=i+1;else if(h>0)u=i-1;else{u=i;break}if(i=u,n[i]===a)return i/(s-1);const f=n[i],m=n[i+1]-f,g=(a-f)/m;return(i+g)/(s-1)}getTangent(e,t){let i=e-1e-4,s=e+1e-4;i<0&&(i=0),s>1&&(s=1);const a=this.getPoint(i),c=this.getPoint(s),u=t||(a.isVector2?new pe:new D);return u.copy(c).sub(a).normalize(),u}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){const n=new D,i=[],s=[],a=[],c=new D,u=new rt;for(let g=0;g<=e;g++){const y=g/e;i[g]=this.getTangentAt(y,new D)}s[0]=new D,a[0]=new D;let h=Number.MAX_VALUE;const f=Math.abs(i[0].x),p=Math.abs(i[0].y),m=Math.abs(i[0].z);f<=h&&(h=f,n.set(1,0,0)),p<=h&&(h=p,n.set(0,1,0)),m<=h&&n.set(0,0,1),c.crossVectors(i[0],n).normalize(),s[0].crossVectors(i[0],c),a[0].crossVectors(i[0],s[0]);for(let g=1;g<=e;g++){if(s[g]=s[g-1].clone(),a[g]=a[g-1].clone(),c.crossVectors(i[g-1],i[g]),c.length()>Number.EPSILON){c.normalize();const y=Math.acos(jt(i[g-1].dot(i[g]),-1,1));s[g].applyMatrix4(u.makeRotationAxis(c,y))}a[g].crossVectors(i[g],s[g])}if(t===!0){let g=Math.acos(jt(s[0].dot(s[e]),-1,1));g/=e,i[0].dot(c.crossVectors(s[0],s[e]))>0&&(g=-g);for(let y=1;y<=e;y++)s[y].applyMatrix4(u.makeRotationAxis(i[y],g*y)),a[y].crossVectors(i[y],s[y])}return{tangents:i,normals:s,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class Ah extends Ii{constructor(e=0,t=0,n=1,i=1,s=0,a=Math.PI*2,c=!1,u=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=s,this.aEndAngle=a,this.aClockwise=c,this.aRotation=u}getPoint(e,t=new pe){const n=t,i=Math.PI*2;let s=this.aEndAngle-this.aStartAngle;const a=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=i;for(;s>i;)s-=i;s<Number.EPSILON&&(a?s=0:s=i),this.aClockwise===!0&&!a&&(s===i?s=-i:s=s-i);const c=this.aStartAngle+e*s;let u=this.aX+this.xRadius*Math.cos(c),h=this.aY+this.yRadius*Math.sin(c);if(this.aRotation!==0){const f=Math.cos(this.aRotation),p=Math.sin(this.aRotation),m=u-this.aX,g=h-this.aY;u=m*f-g*p+this.aX,h=m*p+g*f+this.aY}return n.set(u,h)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class iy extends Ah{constructor(e,t,n,i,s,a){super(e,t,n,n,i,s,a),this.isArcCurve=!0,this.type="ArcCurve"}}function zp(){let r=0,e=0,t=0,n=0;function i(s,a,c,u){r=s,e=c,t=-3*s+3*a-2*c-u,n=2*s-2*a+c+u}return{initCatmullRom:function(s,a,c,u,h){i(a,c,h*(c-s),h*(u-a))},initNonuniformCatmullRom:function(s,a,c,u,h,f,p){let m=(a-s)/h-(c-s)/(h+f)+(c-a)/f,g=(c-a)/f-(u-a)/(f+p)+(u-c)/p;m*=f,g*=f,i(a,c,m,g)},calc:function(s){const a=s*s,c=a*s;return r+e*s+t*a+n*c}}}const jc=new D,Cd=new zp,Rd=new zp,Pd=new zp;class ry extends Ii{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new D){const n=t,i=this.points,s=i.length,a=(s-(this.closed?0:1))*e;let c=Math.floor(a),u=a-c;this.closed?c+=c>0?0:(Math.floor(Math.abs(c)/s)+1)*s:u===0&&c===s-1&&(c=s-2,u=1);let h,f;this.closed||c>0?h=i[(c-1)%s]:(jc.subVectors(i[0],i[1]).add(i[0]),h=jc);const p=i[c%s],m=i[(c+1)%s];if(this.closed||c+2<s?f=i[(c+2)%s]:(jc.subVectors(i[s-1],i[s-2]).add(i[s-1]),f=jc),this.curveType==="centripetal"||this.curveType==="chordal"){const g=this.curveType==="chordal"?.5:.25;let y=Math.pow(h.distanceToSquared(p),g),M=Math.pow(p.distanceToSquared(m),g),x=Math.pow(m.distanceToSquared(f),g);M<1e-4&&(M=1),y<1e-4&&(y=M),x<1e-4&&(x=M),Cd.initNonuniformCatmullRom(h.x,p.x,m.x,f.x,y,M,x),Rd.initNonuniformCatmullRom(h.y,p.y,m.y,f.y,y,M,x),Pd.initNonuniformCatmullRom(h.z,p.z,m.z,f.z,y,M,x)}else this.curveType==="catmullrom"&&(Cd.initCatmullRom(h.x,p.x,m.x,f.x,this.tension),Rd.initCatmullRom(h.y,p.y,m.y,f.y,this.tension),Pd.initCatmullRom(h.z,p.z,m.z,f.z,this.tension));return n.set(Cd.calc(u),Rd.calc(u),Pd.calc(u)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new D().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function W0(r,e,t,n,i){const s=(n-e)*.5,a=(i-t)*.5,c=r*r,u=r*c;return(2*t-2*n+s+a)*u+(-3*t+3*n-2*s-a)*c+s*r+t}function zT(r,e){const t=1-r;return t*t*e}function kT(r,e){return 2*(1-r)*r*e}function HT(r,e){return r*r*e}function Ua(r,e,t,n){return zT(r,e)+kT(r,t)+HT(r,n)}function VT(r,e){const t=1-r;return t*t*t*e}function GT(r,e){const t=1-r;return 3*t*t*r*e}function WT(r,e){return 3*(1-r)*r*r*e}function XT(r,e){return r*r*r*e}function Na(r,e,t,n,i){return VT(r,e)+GT(r,t)+WT(r,n)+XT(r,i)}class kp extends Ii{constructor(e=new pe,t=new pe,n=new pe,i=new pe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new pe){const n=t,i=this.v0,s=this.v1,a=this.v2,c=this.v3;return n.set(Na(e,i.x,s.x,a.x,c.x),Na(e,i.y,s.y,a.y,c.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class sy extends Ii{constructor(e=new D,t=new D,n=new D,i=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new D){const n=t,i=this.v0,s=this.v1,a=this.v2,c=this.v3;return n.set(Na(e,i.x,s.x,a.x,c.x),Na(e,i.y,s.y,a.y,c.y),Na(e,i.z,s.z,a.z,c.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Hp extends Ii{constructor(e=new pe,t=new pe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new pe){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new pe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class oy extends Ii{constructor(e=new D,t=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new D){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new D){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Vp extends Ii{constructor(e=new pe,t=new pe,n=new pe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new pe){const n=t,i=this.v0,s=this.v1,a=this.v2;return n.set(Ua(e,i.x,s.x,a.x),Ua(e,i.y,s.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class cl extends Ii{constructor(e=new D,t=new D,n=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new D){const n=t,i=this.v0,s=this.v1,a=this.v2;return n.set(Ua(e,i.x,s.x,a.x),Ua(e,i.y,s.y,a.y),Ua(e,i.z,s.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Gp extends Ii{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new pe){const n=t,i=this.points,s=(i.length-1)*e,a=Math.floor(s),c=s-a,u=i[a===0?a:a-1],h=i[a],f=i[a>i.length-2?i.length-1:a+1],p=i[a>i.length-3?i.length-1:a+2];return n.set(W0(c,u.x,h.x,f.x,p.x),W0(c,u.y,h.y,f.y,p.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new pe().fromArray(i))}return this}}var sh=Object.freeze({__proto__:null,ArcCurve:iy,CatmullRomCurve3:ry,CubicBezierCurve:kp,CubicBezierCurve3:sy,EllipseCurve:Ah,LineCurve:Hp,LineCurve3:oy,QuadraticBezierCurve:Vp,QuadraticBezierCurve3:cl,SplineCurve:Gp});class ay extends Ii{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new sh[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),i=this.getCurveLengths();let s=0;for(;s<i.length;){if(i[s]>=n){const a=i[s]-n,c=this.curves[s],u=c.getLength(),h=u===0?0:1-a/u;return c.getPointAt(h,t)}s++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let i=0,s=this.curves;i<s.length;i++){const a=s[i],c=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,u=a.getPoints(c);for(let h=0;h<u.length;h++){const f=u[h];n&&n.equals(f)||(t.push(f),n=f)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const i=e.curves[t];this.curves.push(new sh[i.type]().fromJSON(i))}return this}}class ja extends ay{constructor(e){super(),this.type="Path",this.currentPoint=new pe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new Hp(this.currentPoint.clone(),new pe(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){const s=new Vp(this.currentPoint.clone(),new pe(e,t),new pe(n,i));return this.curves.push(s),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,s,a){const c=new kp(this.currentPoint.clone(),new pe(e,t),new pe(n,i),new pe(s,a));return this.curves.push(c),this.currentPoint.set(s,a),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new Gp(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,s,a){const c=this.currentPoint.x,u=this.currentPoint.y;return this.absarc(e+c,t+u,n,i,s,a),this}absarc(e,t,n,i,s,a){return this.absellipse(e,t,n,n,i,s,a),this}ellipse(e,t,n,i,s,a,c,u){const h=this.currentPoint.x,f=this.currentPoint.y;return this.absellipse(e+h,t+f,n,i,s,a,c,u),this}absellipse(e,t,n,i,s,a,c,u){const h=new Ah(e,t,n,i,s,a,c,u);if(this.curves.length>0){const p=h.getPoint(0);p.equals(this.currentPoint)||this.lineTo(p.x,p.y)}this.curves.push(h);const f=h.getPoint(1);return this.currentPoint.copy(f),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class ul extends vt{constructor(e=[new pe(0,-.5),new pe(.5,0),new pe(0,.5)],t=12,n=0,i=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:i},t=Math.floor(t),i=jt(i,0,Math.PI*2);const s=[],a=[],c=[],u=[],h=[],f=1/t,p=new D,m=new pe,g=new D,y=new D,M=new D;let x=0,_=0;for(let E=0;E<=e.length-1;E++)switch(E){case 0:x=e[E+1].x-e[E].x,_=e[E+1].y-e[E].y,g.x=_*1,g.y=-x,g.z=_*0,M.copy(g),g.normalize(),u.push(g.x,g.y,g.z);break;case e.length-1:u.push(M.x,M.y,M.z);break;default:x=e[E+1].x-e[E].x,_=e[E+1].y-e[E].y,g.x=_*1,g.y=-x,g.z=_*0,y.copy(g),g.x+=M.x,g.y+=M.y,g.z+=M.z,g.normalize(),u.push(g.x,g.y,g.z),M.copy(y)}for(let E=0;E<=t;E++){const w=n+E*f*i,T=Math.sin(w),U=Math.cos(w);for(let P=0;P<=e.length-1;P++){p.x=e[P].x*T,p.y=e[P].y,p.z=e[P].x*U,a.push(p.x,p.y,p.z),m.x=E/t,m.y=P/(e.length-1),c.push(m.x,m.y);const L=u[3*P+0]*T,O=u[3*P+1],k=u[3*P+0]*U;h.push(L,O,k)}}for(let E=0;E<t;E++)for(let w=0;w<e.length-1;w++){const T=w+E*e.length,U=T,P=T+e.length,L=T+e.length+1,O=T+1;s.push(U,P,O),s.push(L,O,P)}this.setIndex(s),this.setAttribute("position",new je(a,3)),this.setAttribute("uv",new je(c,2)),this.setAttribute("normal",new je(h,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ul(e.points,e.segments,e.phiStart,e.phiLength)}}class Th extends ul{constructor(e=1,t=1,n=4,i=8){const s=new ja;s.absarc(0,-t/2,e,Math.PI*1.5,0),s.absarc(0,t/2,e,0,Math.PI*.5),super(s.getPoints(n),i),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:n,radialSegments:i}}static fromJSON(e){return new Th(e.radius,e.length,e.capSegments,e.radialSegments)}}class bh extends vt{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);const s=[],a=[],c=[],u=[],h=new D,f=new pe;a.push(0,0,0),c.push(0,0,1),u.push(.5,.5);for(let p=0,m=3;p<=t;p++,m+=3){const g=n+p/t*i;h.x=e*Math.cos(g),h.y=e*Math.sin(g),a.push(h.x,h.y,h.z),c.push(0,0,1),f.x=(a[m]/e+1)/2,f.y=(a[m+1]/e+1)/2,u.push(f.x,f.y)}for(let p=1;p<=t;p++)s.push(p,p+1,0);this.setIndex(s),this.setAttribute("position",new je(a,3)),this.setAttribute("normal",new je(c,3)),this.setAttribute("uv",new je(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new bh(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class xr extends vt{constructor(e=1,t=1,n=1,i=32,s=1,a=!1,c=0,u=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:s,openEnded:a,thetaStart:c,thetaLength:u};const h=this;i=Math.floor(i),s=Math.floor(s);const f=[],p=[],m=[],g=[];let y=0;const M=[],x=n/2;let _=0;E(),a===!1&&(e>0&&w(!0),t>0&&w(!1)),this.setIndex(f),this.setAttribute("position",new je(p,3)),this.setAttribute("normal",new je(m,3)),this.setAttribute("uv",new je(g,2));function E(){const T=new D,U=new D;let P=0;const L=(t-e)/n;for(let O=0;O<=s;O++){const k=[],b=O/s,C=b*(t-e)+e;for(let W=0;W<=i;W++){const q=W/i,J=q*u+c,re=Math.sin(J),j=Math.cos(J);U.x=C*re,U.y=-b*n+x,U.z=C*j,p.push(U.x,U.y,U.z),T.set(re,L,j).normalize(),m.push(T.x,T.y,T.z),g.push(q,1-b),k.push(y++)}M.push(k)}for(let O=0;O<i;O++)for(let k=0;k<s;k++){const b=M[k][O],C=M[k+1][O],W=M[k+1][O+1],q=M[k][O+1];e>0&&(f.push(b,C,q),P+=3),t>0&&(f.push(C,W,q),P+=3)}h.addGroup(_,P,0),_+=P}function w(T){const U=y,P=new pe,L=new D;let O=0;const k=T===!0?e:t,b=T===!0?1:-1;for(let W=1;W<=i;W++)p.push(0,x*b,0),m.push(0,b,0),g.push(.5,.5),y++;const C=y;for(let W=0;W<=i;W++){const J=W/i*u+c,re=Math.cos(J),j=Math.sin(J);L.x=k*j,L.y=x*b,L.z=k*re,p.push(L.x,L.y,L.z),m.push(0,b,0),P.x=re*.5+.5,P.y=j*.5*b+.5,g.push(P.x,P.y),y++}for(let W=0;W<i;W++){const q=U+W,J=C+W;T===!0?f.push(J,J+1,q):f.push(J+1,J,q),O+=3}h.addGroup(_,O,T===!0?1:2),_+=O}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new xr(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ko extends xr{constructor(e=1,t=1,n=32,i=1,s=!1,a=0,c=Math.PI*2){super(0,e,t,n,i,s,a,c),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:s,thetaStart:a,thetaLength:c}}static fromJSON(e){return new ko(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Yr extends vt{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};const s=[],a=[];c(i),h(n),f(),this.setAttribute("position",new je(s,3)),this.setAttribute("normal",new je(s.slice(),3)),this.setAttribute("uv",new je(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function c(E){const w=new D,T=new D,U=new D;for(let P=0;P<t.length;P+=3)g(t[P+0],w),g(t[P+1],T),g(t[P+2],U),u(w,T,U,E)}function u(E,w,T,U){const P=U+1,L=[];for(let O=0;O<=P;O++){L[O]=[];const k=E.clone().lerp(T,O/P),b=w.clone().lerp(T,O/P),C=P-O;for(let W=0;W<=C;W++)W===0&&O===P?L[O][W]=k:L[O][W]=k.clone().lerp(b,W/C)}for(let O=0;O<P;O++)for(let k=0;k<2*(P-O)-1;k++){const b=Math.floor(k/2);k%2===0?(m(L[O][b+1]),m(L[O+1][b]),m(L[O][b])):(m(L[O][b+1]),m(L[O+1][b+1]),m(L[O+1][b]))}}function h(E){const w=new D;for(let T=0;T<s.length;T+=3)w.x=s[T+0],w.y=s[T+1],w.z=s[T+2],w.normalize().multiplyScalar(E),s[T+0]=w.x,s[T+1]=w.y,s[T+2]=w.z}function f(){const E=new D;for(let w=0;w<s.length;w+=3){E.x=s[w+0],E.y=s[w+1],E.z=s[w+2];const T=x(E)/2/Math.PI+.5,U=_(E)/Math.PI+.5;a.push(T,1-U)}y(),p()}function p(){for(let E=0;E<a.length;E+=6){const w=a[E+0],T=a[E+2],U=a[E+4],P=Math.max(w,T,U),L=Math.min(w,T,U);P>.9&&L<.1&&(w<.2&&(a[E+0]+=1),T<.2&&(a[E+2]+=1),U<.2&&(a[E+4]+=1))}}function m(E){s.push(E.x,E.y,E.z)}function g(E,w){const T=E*3;w.x=e[T+0],w.y=e[T+1],w.z=e[T+2]}function y(){const E=new D,w=new D,T=new D,U=new D,P=new pe,L=new pe,O=new pe;for(let k=0,b=0;k<s.length;k+=9,b+=6){E.set(s[k+0],s[k+1],s[k+2]),w.set(s[k+3],s[k+4],s[k+5]),T.set(s[k+6],s[k+7],s[k+8]),P.set(a[b+0],a[b+1]),L.set(a[b+2],a[b+3]),O.set(a[b+4],a[b+5]),U.copy(E).add(w).add(T).divideScalar(3);const C=x(U);M(P,b+0,E,C),M(L,b+2,w,C),M(O,b+4,T,C)}}function M(E,w,T,U){U<0&&E.x===1&&(a[w]=E.x-1),T.x===0&&T.z===0&&(a[w]=U/2/Math.PI+.5)}function x(E){return Math.atan2(E.z,-E.x)}function _(E){return Math.atan2(-E.y,Math.sqrt(E.x*E.x+E.z*E.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Yr(e.vertices,e.indices,e.radius,e.details)}}class Ch extends Yr{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,i=1/n,s=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-i,-n,0,-i,n,0,i,-n,0,i,n,-i,-n,0,-i,n,0,i,-n,0,i,n,0,-n,0,-i,n,0,-i,-n,0,i,n,0,i],a=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(s,a,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Ch(e.radius,e.detail)}}const Zc=new D,Jc=new D,Id=new D,Kc=new Yn;class ly extends vt{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){const i=Math.pow(10,4),s=Math.cos(As*t),a=e.getIndex(),c=e.getAttribute("position"),u=a?a.count:c.count,h=[0,0,0],f=["a","b","c"],p=new Array(3),m={},g=[];for(let y=0;y<u;y+=3){a?(h[0]=a.getX(y),h[1]=a.getX(y+1),h[2]=a.getX(y+2)):(h[0]=y,h[1]=y+1,h[2]=y+2);const{a:M,b:x,c:_}=Kc;if(M.fromBufferAttribute(c,h[0]),x.fromBufferAttribute(c,h[1]),_.fromBufferAttribute(c,h[2]),Kc.getNormal(Id),p[0]=`${Math.round(M.x*i)},${Math.round(M.y*i)},${Math.round(M.z*i)}`,p[1]=`${Math.round(x.x*i)},${Math.round(x.y*i)},${Math.round(x.z*i)}`,p[2]=`${Math.round(_.x*i)},${Math.round(_.y*i)},${Math.round(_.z*i)}`,!(p[0]===p[1]||p[1]===p[2]||p[2]===p[0]))for(let E=0;E<3;E++){const w=(E+1)%3,T=p[E],U=p[w],P=Kc[f[E]],L=Kc[f[w]],O=`${T}_${U}`,k=`${U}_${T}`;k in m&&m[k]?(Id.dot(m[k].normal)<=s&&(g.push(P.x,P.y,P.z),g.push(L.x,L.y,L.z)),m[k]=null):O in m||(m[O]={index0:h[E],index1:h[w],normal:Id.clone()})}}for(const y in m)if(m[y]){const{index0:M,index1:x}=m[y];Zc.fromBufferAttribute(c,M),Jc.fromBufferAttribute(c,x),g.push(Zc.x,Zc.y,Zc.z),g.push(Jc.x,Jc.y,Jc.z)}this.setAttribute("position",new je(g,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}class Hr extends ja{constructor(e){super(e),this.uuid=oi(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const i=e.holes[t];this.holes.push(new ja().fromJSON(i))}return this}}const YT={triangulate:function(r,e,t=2){const n=e&&e.length,i=n?e[0]*t:r.length;let s=cy(r,0,i,t,!0);const a=[];if(!s||s.next===s.prev)return a;let c,u,h,f,p,m,g;if(n&&(s=KT(r,e,s,t)),r.length>80*t){c=h=r[0],u=f=r[1];for(let y=t;y<i;y+=t)p=r[y],m=r[y+1],p<c&&(c=p),m<u&&(u=m),p>h&&(h=p),m>f&&(f=m);g=Math.max(h-c,f-u),g=g!==0?32767/g:0}return Za(s,a,t,c,u,g,0),a}};function cy(r,e,t,n,i){let s,a;if(i===lb(r,e,t,n)>0)for(s=e;s<t;s+=n)a=X0(s,r[s],r[s+1],a);else for(s=t-n;s>=e;s-=n)a=X0(s,r[s],r[s+1],a);return a&&Rh(a,a.next)&&(Ka(a),a=a.next),a}function Ds(r,e){if(!r)return r;e||(e=r);let t=r,n;do if(n=!1,!t.steiner&&(Rh(t,t.next)||Xt(t.prev,t,t.next)===0)){if(Ka(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Za(r,e,t,n,i,s,a){if(!r)return;!a&&s&&nb(r,n,i,s);let c=r,u,h;for(;r.prev!==r.next;){if(u=r.prev,h=r.next,s?jT(r,n,i,s):qT(r)){e.push(u.i/t|0),e.push(r.i/t|0),e.push(h.i/t|0),Ka(r),r=h.next,c=h.next;continue}if(r=h,r===c){a?a===1?(r=ZT(Ds(r),e,t),Za(r,e,t,n,i,s,2)):a===2&&JT(r,e,t,n,i,s):Za(Ds(r),e,t,n,i,s,1);break}}}function qT(r){const e=r.prev,t=r,n=r.next;if(Xt(e,t,n)>=0)return!1;const i=e.x,s=t.x,a=n.x,c=e.y,u=t.y,h=n.y,f=i<s?i<a?i:a:s<a?s:a,p=c<u?c<h?c:h:u<h?u:h,m=i>s?i>a?i:a:s>a?s:a,g=c>u?c>h?c:h:u>h?u:h;let y=n.next;for(;y!==e;){if(y.x>=f&&y.x<=m&&y.y>=p&&y.y<=g&&bo(i,c,s,u,a,h,y.x,y.y)&&Xt(y.prev,y,y.next)>=0)return!1;y=y.next}return!0}function jT(r,e,t,n){const i=r.prev,s=r,a=r.next;if(Xt(i,s,a)>=0)return!1;const c=i.x,u=s.x,h=a.x,f=i.y,p=s.y,m=a.y,g=c<u?c<h?c:h:u<h?u:h,y=f<p?f<m?f:m:p<m?p:m,M=c>u?c>h?c:h:u>h?u:h,x=f>p?f>m?f:m:p>m?p:m,_=rp(g,y,e,t,n),E=rp(M,x,e,t,n);let w=r.prevZ,T=r.nextZ;for(;w&&w.z>=_&&T&&T.z<=E;){if(w.x>=g&&w.x<=M&&w.y>=y&&w.y<=x&&w!==i&&w!==a&&bo(c,f,u,p,h,m,w.x,w.y)&&Xt(w.prev,w,w.next)>=0||(w=w.prevZ,T.x>=g&&T.x<=M&&T.y>=y&&T.y<=x&&T!==i&&T!==a&&bo(c,f,u,p,h,m,T.x,T.y)&&Xt(T.prev,T,T.next)>=0))return!1;T=T.nextZ}for(;w&&w.z>=_;){if(w.x>=g&&w.x<=M&&w.y>=y&&w.y<=x&&w!==i&&w!==a&&bo(c,f,u,p,h,m,w.x,w.y)&&Xt(w.prev,w,w.next)>=0)return!1;w=w.prevZ}for(;T&&T.z<=E;){if(T.x>=g&&T.x<=M&&T.y>=y&&T.y<=x&&T!==i&&T!==a&&bo(c,f,u,p,h,m,T.x,T.y)&&Xt(T.prev,T,T.next)>=0)return!1;T=T.nextZ}return!0}function ZT(r,e,t){let n=r;do{const i=n.prev,s=n.next.next;!Rh(i,s)&&uy(i,n,n.next,s)&&Ja(i,s)&&Ja(s,i)&&(e.push(i.i/t|0),e.push(n.i/t|0),e.push(s.i/t|0),Ka(n),Ka(n.next),n=r=s),n=n.next}while(n!==r);return Ds(n)}function JT(r,e,t,n,i,s){let a=r;do{let c=a.next.next;for(;c!==a.prev;){if(a.i!==c.i&&sb(a,c)){let u=hy(a,c);a=Ds(a,a.next),u=Ds(u,u.next),Za(a,e,t,n,i,s,0),Za(u,e,t,n,i,s,0);return}c=c.next}a=a.next}while(a!==r)}function KT(r,e,t,n){const i=[];let s,a,c,u,h;for(s=0,a=e.length;s<a;s++)c=e[s]*n,u=s<a-1?e[s+1]*n:r.length,h=cy(r,c,u,n,!1),h===h.next&&(h.steiner=!0),i.push(rb(h));for(i.sort(QT),s=0;s<i.length;s++)t=$T(i[s],t);return t}function QT(r,e){return r.x-e.x}function $T(r,e){const t=eb(r,e);if(!t)return e;const n=hy(t,r);return Ds(n,n.next),Ds(t,t.next)}function eb(r,e){let t=e,n=-1/0,i;const s=r.x,a=r.y;do{if(a<=t.y&&a>=t.next.y&&t.next.y!==t.y){const m=t.x+(a-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(m<=s&&m>n&&(n=m,i=t.x<t.next.x?t:t.next,m===s))return i}t=t.next}while(t!==e);if(!i)return null;const c=i,u=i.x,h=i.y;let f=1/0,p;t=i;do s>=t.x&&t.x>=u&&s!==t.x&&bo(a<h?s:n,a,u,h,a<h?n:s,a,t.x,t.y)&&(p=Math.abs(a-t.y)/(s-t.x),Ja(t,r)&&(p<f||p===f&&(t.x>i.x||t.x===i.x&&tb(i,t)))&&(i=t,f=p)),t=t.next;while(t!==c);return i}function tb(r,e){return Xt(r.prev,r,e.prev)<0&&Xt(e.next,r,r.next)<0}function nb(r,e,t,n){let i=r;do i.z===0&&(i.z=rp(i.x,i.y,e,t,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==r);i.prevZ.nextZ=null,i.prevZ=null,ib(i)}function ib(r){let e,t,n,i,s,a,c,u,h=1;do{for(t=r,r=null,s=null,a=0;t;){for(a++,n=t,c=0,e=0;e<h&&(c++,n=n.nextZ,!!n);e++);for(u=h;c>0||u>0&&n;)c!==0&&(u===0||!n||t.z<=n.z)?(i=t,t=t.nextZ,c--):(i=n,n=n.nextZ,u--),s?s.nextZ=i:r=i,i.prevZ=s,s=i;t=n}s.nextZ=null,h*=2}while(a>1);return r}function rp(r,e,t,n,i){return r=(r-t)*i|0,e=(e-n)*i|0,r=(r|r<<8)&16711935,r=(r|r<<4)&252645135,r=(r|r<<2)&858993459,r=(r|r<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,r|e<<1}function rb(r){let e=r,t=r;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==r);return t}function bo(r,e,t,n,i,s,a,c){return(i-a)*(e-c)>=(r-a)*(s-c)&&(r-a)*(n-c)>=(t-a)*(e-c)&&(t-a)*(s-c)>=(i-a)*(n-c)}function sb(r,e){return r.next.i!==e.i&&r.prev.i!==e.i&&!ob(r,e)&&(Ja(r,e)&&Ja(e,r)&&ab(r,e)&&(Xt(r.prev,r,e.prev)||Xt(r,e.prev,e))||Rh(r,e)&&Xt(r.prev,r,r.next)>0&&Xt(e.prev,e,e.next)>0)}function Xt(r,e,t){return(e.y-r.y)*(t.x-e.x)-(e.x-r.x)*(t.y-e.y)}function Rh(r,e){return r.x===e.x&&r.y===e.y}function uy(r,e,t,n){const i=$c(Xt(r,e,t)),s=$c(Xt(r,e,n)),a=$c(Xt(t,n,r)),c=$c(Xt(t,n,e));return!!(i!==s&&a!==c||i===0&&Qc(r,t,e)||s===0&&Qc(r,n,e)||a===0&&Qc(t,r,n)||c===0&&Qc(t,e,n))}function Qc(r,e,t){return e.x<=Math.max(r.x,t.x)&&e.x>=Math.min(r.x,t.x)&&e.y<=Math.max(r.y,t.y)&&e.y>=Math.min(r.y,t.y)}function $c(r){return r>0?1:r<0?-1:0}function ob(r,e){let t=r;do{if(t.i!==r.i&&t.next.i!==r.i&&t.i!==e.i&&t.next.i!==e.i&&uy(t,t.next,r,e))return!0;t=t.next}while(t!==r);return!1}function Ja(r,e){return Xt(r.prev,r,r.next)<0?Xt(r,e,r.next)>=0&&Xt(r,r.prev,e)>=0:Xt(r,e,r.prev)<0||Xt(r,r.next,e)<0}function ab(r,e){let t=r,n=!1;const i=(r.x+e.x)/2,s=(r.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&i<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==r);return n}function hy(r,e){const t=new sp(r.i,r.x,r.y),n=new sp(e.i,e.x,e.y),i=r.next,s=e.prev;return r.next=e,e.prev=r,t.next=i,i.prev=t,n.next=t,t.prev=n,s.next=n,n.prev=s,n}function X0(r,e,t,n){const i=new sp(r,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function Ka(r){r.next.prev=r.prev,r.prev.next=r.next,r.prevZ&&(r.prevZ.nextZ=r.nextZ),r.nextZ&&(r.nextZ.prevZ=r.prevZ)}function sp(r,e,t){this.i=r,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function lb(r,e,t,n){let i=0;for(let s=e,a=t-n;s<t;s+=n)i+=(r[a]-r[s])*(r[s+1]+r[a+1]),a=s;return i}class Zi{static area(e){const t=e.length;let n=0;for(let i=t-1,s=0;s<t;i=s++)n+=e[i].x*e[s].y-e[s].x*e[i].y;return n*.5}static isClockWise(e){return Zi.area(e)<0}static triangulateShape(e,t){const n=[],i=[],s=[];Y0(e),q0(n,e);let a=e.length;t.forEach(Y0);for(let u=0;u<t.length;u++)i.push(a),a+=t[u].length,q0(n,t[u]);const c=YT.triangulate(n,i);for(let u=0;u<c.length;u+=3)s.push(c.slice(u,u+3));return s}}function Y0(r){const e=r.length;e>2&&r[e-1].equals(r[0])&&r.pop()}function q0(r,e){for(let t=0;t<e.length;t++)r.push(e[t].x),r.push(e[t].y)}class Ph extends vt{constructor(e=new Hr([new pe(.5,.5),new pe(-.5,.5),new pe(-.5,-.5),new pe(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,i=[],s=[];for(let c=0,u=e.length;c<u;c++){const h=e[c];a(h)}this.setAttribute("position",new je(i,3)),this.setAttribute("uv",new je(s,2)),this.computeVertexNormals();function a(c){const u=[],h=t.curveSegments!==void 0?t.curveSegments:12,f=t.steps!==void 0?t.steps:1,p=t.depth!==void 0?t.depth:1;let m=t.bevelEnabled!==void 0?t.bevelEnabled:!0,g=t.bevelThickness!==void 0?t.bevelThickness:.2,y=t.bevelSize!==void 0?t.bevelSize:g-.1,M=t.bevelOffset!==void 0?t.bevelOffset:0,x=t.bevelSegments!==void 0?t.bevelSegments:3;const _=t.extrudePath,E=t.UVGenerator!==void 0?t.UVGenerator:cb;let w,T=!1,U,P,L,O;_&&(w=_.getSpacedPoints(f),T=!0,m=!1,U=_.computeFrenetFrames(f,!1),P=new D,L=new D,O=new D),m||(x=0,g=0,y=0,M=0);const k=c.extractPoints(h);let b=k.shape;const C=k.holes;if(!Zi.isClockWise(b)){b=b.reverse();for(let he=0,N=C.length;he<N;he++){const we=C[he];Zi.isClockWise(we)&&(C[he]=we.reverse())}}const q=Zi.triangulateShape(b,C),J=b;for(let he=0,N=C.length;he<N;he++){const we=C[he];b=b.concat(we)}function re(he,N,we){return N||console.error("THREE.ExtrudeGeometry: vec does not exist"),he.clone().addScaledVector(N,we)}const j=b.length,fe=q.length;function z(he,N,we){let xe,ve,Se;const Je=he.x-N.x,Le=he.y-N.y,F=we.x-he.x,R=we.y-he.y,Z=Je*Je+Le*Le,ce=Je*R-Le*F;if(Math.abs(ce)>Number.EPSILON){const de=Math.sqrt(Z),ue=Math.sqrt(F*F+R*R),qe=N.x-Le/de,Ee=N.y+Je/de,ke=we.x-R/ue,St=we.y+F/ue,_e=((ke-qe)*R-(St-Ee)*F)/(Je*R-Le*F);xe=qe+Je*_e-he.x,ve=Ee+Le*_e-he.y;const He=xe*xe+ve*ve;if(He<=2)return new pe(xe,ve);Se=Math.sqrt(He/2)}else{let de=!1;Je>Number.EPSILON?F>Number.EPSILON&&(de=!0):Je<-Number.EPSILON?F<-Number.EPSILON&&(de=!0):Math.sign(Le)===Math.sign(R)&&(de=!0),de?(xe=-Le,ve=Je,Se=Math.sqrt(Z)):(xe=Je,ve=Le,Se=Math.sqrt(Z/2))}return new pe(xe/Se,ve/Se)}const ae=[];for(let he=0,N=J.length,we=N-1,xe=he+1;he<N;he++,we++,xe++)we===N&&(we=0),xe===N&&(xe=0),ae[he]=z(J[he],J[we],J[xe]);const ee=[];let le,Pe=ae.concat();for(let he=0,N=C.length;he<N;he++){const we=C[he];le=[];for(let xe=0,ve=we.length,Se=ve-1,Je=xe+1;xe<ve;xe++,Se++,Je++)Se===ve&&(Se=0),Je===ve&&(Je=0),le[xe]=z(we[xe],we[Se],we[Je]);ee.push(le),Pe=Pe.concat(le)}for(let he=0;he<x;he++){const N=he/x,we=g*Math.cos(N*Math.PI/2),xe=y*Math.sin(N*Math.PI/2)+M;for(let ve=0,Se=J.length;ve<Se;ve++){const Je=re(J[ve],ae[ve],xe);Ae(Je.x,Je.y,-we)}for(let ve=0,Se=C.length;ve<Se;ve++){const Je=C[ve];le=ee[ve];for(let Le=0,F=Je.length;Le<F;Le++){const R=re(Je[Le],le[Le],xe);Ae(R.x,R.y,-we)}}}const Ne=y+M;for(let he=0;he<j;he++){const N=m?re(b[he],Pe[he],Ne):b[he];T?(L.copy(U.normals[0]).multiplyScalar(N.x),P.copy(U.binormals[0]).multiplyScalar(N.y),O.copy(w[0]).add(L).add(P),Ae(O.x,O.y,O.z)):Ae(N.x,N.y,0)}for(let he=1;he<=f;he++)for(let N=0;N<j;N++){const we=m?re(b[N],Pe[N],Ne):b[N];T?(L.copy(U.normals[he]).multiplyScalar(we.x),P.copy(U.binormals[he]).multiplyScalar(we.y),O.copy(w[he]).add(L).add(P),Ae(O.x,O.y,O.z)):Ae(we.x,we.y,p/f*he)}for(let he=x-1;he>=0;he--){const N=he/x,we=g*Math.cos(N*Math.PI/2),xe=y*Math.sin(N*Math.PI/2)+M;for(let ve=0,Se=J.length;ve<Se;ve++){const Je=re(J[ve],ae[ve],xe);Ae(Je.x,Je.y,p+we)}for(let ve=0,Se=C.length;ve<Se;ve++){const Je=C[ve];le=ee[ve];for(let Le=0,F=Je.length;Le<F;Le++){const R=re(Je[Le],le[Le],xe);T?Ae(R.x,R.y+w[f-1].y,w[f-1].x+we):Ae(R.x,R.y,p+we)}}}ne(),me();function ne(){const he=i.length/3;if(m){let N=0,we=j*N;for(let xe=0;xe<fe;xe++){const ve=q[xe];tt(ve[2]+we,ve[1]+we,ve[0]+we)}N=f+x*2,we=j*N;for(let xe=0;xe<fe;xe++){const ve=q[xe];tt(ve[0]+we,ve[1]+we,ve[2]+we)}}else{for(let N=0;N<fe;N++){const we=q[N];tt(we[2],we[1],we[0])}for(let N=0;N<fe;N++){const we=q[N];tt(we[0]+j*f,we[1]+j*f,we[2]+j*f)}}n.addGroup(he,i.length/3-he,0)}function me(){const he=i.length/3;let N=0;Ce(J,N),N+=J.length;for(let we=0,xe=C.length;we<xe;we++){const ve=C[we];Ce(ve,N),N+=ve.length}n.addGroup(he,i.length/3-he,1)}function Ce(he,N){let we=he.length;for(;--we>=0;){const xe=we;let ve=we-1;ve<0&&(ve=he.length-1);for(let Se=0,Je=f+x*2;Se<Je;Se++){const Le=j*Se,F=j*(Se+1),R=N+xe+Le,Z=N+ve+Le,ce=N+ve+F,de=N+xe+F;nt(R,Z,ce,de)}}}function Ae(he,N,we){u.push(he),u.push(N),u.push(we)}function tt(he,N,we){Ze(he),Ze(N),Ze(we);const xe=i.length/3,ve=E.generateTopUV(n,i,xe-3,xe-2,xe-1);Re(ve[0]),Re(ve[1]),Re(ve[2])}function nt(he,N,we,xe){Ze(he),Ze(N),Ze(xe),Ze(N),Ze(we),Ze(xe);const ve=i.length/3,Se=E.generateSideWallUV(n,i,ve-6,ve-3,ve-2,ve-1);Re(Se[0]),Re(Se[1]),Re(Se[3]),Re(Se[1]),Re(Se[2]),Re(Se[3])}function Ze(he){i.push(u[he*3+0]),i.push(u[he*3+1]),i.push(u[he*3+2])}function Re(he){s.push(he.x),s.push(he.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return ub(t,n,e)}static fromJSON(e,t){const n=[];for(let s=0,a=e.shapes.length;s<a;s++){const c=t[e.shapes[s]];n.push(c)}const i=e.options.extrudePath;return i!==void 0&&(e.options.extrudePath=new sh[i.type]().fromJSON(i)),new Ph(n,e.options)}}const cb={generateTopUV:function(r,e,t,n,i){const s=e[t*3],a=e[t*3+1],c=e[n*3],u=e[n*3+1],h=e[i*3],f=e[i*3+1];return[new pe(s,a),new pe(c,u),new pe(h,f)]},generateSideWallUV:function(r,e,t,n,i,s){const a=e[t*3],c=e[t*3+1],u=e[t*3+2],h=e[n*3],f=e[n*3+1],p=e[n*3+2],m=e[i*3],g=e[i*3+1],y=e[i*3+2],M=e[s*3],x=e[s*3+1],_=e[s*3+2];return Math.abs(c-f)<Math.abs(a-h)?[new pe(a,1-u),new pe(h,1-p),new pe(m,1-y),new pe(M,1-_)]:[new pe(c,1-u),new pe(f,1-p),new pe(g,1-y),new pe(x,1-_)]}};function ub(r,e,t){if(t.shapes=[],Array.isArray(r))for(let n=0,i=r.length;n<i;n++){const s=r[n];t.shapes.push(s.uuid)}else t.shapes.push(r.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class Ih extends Yr{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Ih(e.radius,e.detail)}}class hl extends Yr{constructor(e=1,t=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],i=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,i,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new hl(e.radius,e.detail)}}class Ho extends vt{constructor(e=.5,t=1,n=32,i=1,s=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:s,thetaLength:a},n=Math.max(3,n),i=Math.max(1,i);const c=[],u=[],h=[],f=[];let p=e;const m=(t-e)/i,g=new D,y=new pe;for(let M=0;M<=i;M++){for(let x=0;x<=n;x++){const _=s+x/n*a;g.x=p*Math.cos(_),g.y=p*Math.sin(_),u.push(g.x,g.y,g.z),h.push(0,0,1),y.x=(g.x/t+1)/2,y.y=(g.y/t+1)/2,f.push(y.x,y.y)}p+=m}for(let M=0;M<i;M++){const x=M*(n+1);for(let _=0;_<n;_++){const E=_+x,w=E,T=E+n+1,U=E+n+2,P=E+1;c.push(w,T,P),c.push(T,U,P)}}this.setIndex(c),this.setAttribute("position",new je(u,3)),this.setAttribute("normal",new je(h,3)),this.setAttribute("uv",new je(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ho(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Lh extends vt{constructor(e=new Hr([new pe(0,.5),new pe(-.5,-.5),new pe(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};const n=[],i=[],s=[],a=[];let c=0,u=0;if(Array.isArray(e)===!1)h(e);else for(let f=0;f<e.length;f++)h(e[f]),this.addGroup(c,u,f),c+=u,u=0;this.setIndex(n),this.setAttribute("position",new je(i,3)),this.setAttribute("normal",new je(s,3)),this.setAttribute("uv",new je(a,2));function h(f){const p=i.length/3,m=f.extractPoints(t);let g=m.shape;const y=m.holes;Zi.isClockWise(g)===!1&&(g=g.reverse());for(let x=0,_=y.length;x<_;x++){const E=y[x];Zi.isClockWise(E)===!0&&(y[x]=E.reverse())}const M=Zi.triangulateShape(g,y);for(let x=0,_=y.length;x<_;x++){const E=y[x];g=g.concat(E)}for(let x=0,_=g.length;x<_;x++){const E=g[x];i.push(E.x,E.y,0),s.push(0,0,1),a.push(E.x,E.y)}for(let x=0,_=M.length;x<_;x++){const E=M[x],w=E[0]+p,T=E[1]+p,U=E[2]+p;n.push(w,T,U),u+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes;return hb(t,e)}static fromJSON(e,t){const n=[];for(let i=0,s=e.shapes.length;i<s;i++){const a=t[e.shapes[i]];n.push(a)}return new Lh(n,e.curveSegments)}}function hb(r,e){if(e.shapes=[],Array.isArray(r))for(let t=0,n=r.length;t<n;t++){const i=r[t];e.shapes.push(i.uuid)}else e.shapes.push(r.uuid);return e}class Vo extends vt{constructor(e=1,t=32,n=16,i=0,s=Math.PI*2,a=0,c=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:s,thetaStart:a,thetaLength:c},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const u=Math.min(a+c,Math.PI);let h=0;const f=[],p=new D,m=new D,g=[],y=[],M=[],x=[];for(let _=0;_<=n;_++){const E=[],w=_/n;let T=0;_===0&&a===0?T=.5/t:_===n&&u===Math.PI&&(T=-.5/t);for(let U=0;U<=t;U++){const P=U/t;p.x=-e*Math.cos(i+P*s)*Math.sin(a+w*c),p.y=e*Math.cos(a+w*c),p.z=e*Math.sin(i+P*s)*Math.sin(a+w*c),y.push(p.x,p.y,p.z),m.copy(p).normalize(),M.push(m.x,m.y,m.z),x.push(P+T,1-w),E.push(h++)}f.push(E)}for(let _=0;_<n;_++)for(let E=0;E<t;E++){const w=f[_][E+1],T=f[_][E],U=f[_+1][E],P=f[_+1][E+1];(_!==0||a>0)&&g.push(w,T,P),(_!==n-1||u<Math.PI)&&g.push(T,U,P)}this.setIndex(g),this.setAttribute("position",new je(y,3)),this.setAttribute("normal",new je(M,3)),this.setAttribute("uv",new je(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Vo(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Dh extends Yr{constructor(e=1,t=0){const n=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],i=[2,1,0,0,3,2,1,3,0,2,3,1];super(n,i,e,t),this.type="TetrahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Dh(e.radius,e.detail)}}class Uh extends vt{constructor(e=1,t=.4,n=12,i=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:s},n=Math.floor(n),i=Math.floor(i);const a=[],c=[],u=[],h=[],f=new D,p=new D,m=new D;for(let g=0;g<=n;g++)for(let y=0;y<=i;y++){const M=y/i*s,x=g/n*Math.PI*2;p.x=(e+t*Math.cos(x))*Math.cos(M),p.y=(e+t*Math.cos(x))*Math.sin(M),p.z=t*Math.sin(x),c.push(p.x,p.y,p.z),f.x=e*Math.cos(M),f.y=e*Math.sin(M),m.subVectors(p,f).normalize(),u.push(m.x,m.y,m.z),h.push(y/i),h.push(g/n)}for(let g=1;g<=n;g++)for(let y=1;y<=i;y++){const M=(i+1)*g+y-1,x=(i+1)*(g-1)+y-1,_=(i+1)*(g-1)+y,E=(i+1)*g+y;a.push(M,x,E),a.push(x,_,E)}this.setIndex(a),this.setAttribute("position",new je(c,3)),this.setAttribute("normal",new je(u,3)),this.setAttribute("uv",new je(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Uh(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Nh extends vt{constructor(e=1,t=.4,n=64,i=8,s=2,a=3){super(),this.type="TorusKnotGeometry",this.parameters={radius:e,tube:t,tubularSegments:n,radialSegments:i,p:s,q:a},n=Math.floor(n),i=Math.floor(i);const c=[],u=[],h=[],f=[],p=new D,m=new D,g=new D,y=new D,M=new D,x=new D,_=new D;for(let w=0;w<=n;++w){const T=w/n*s*Math.PI*2;E(T,s,a,e,g),E(T+.01,s,a,e,y),x.subVectors(y,g),_.addVectors(y,g),M.crossVectors(x,_),_.crossVectors(M,x),M.normalize(),_.normalize();for(let U=0;U<=i;++U){const P=U/i*Math.PI*2,L=-t*Math.cos(P),O=t*Math.sin(P);p.x=g.x+(L*_.x+O*M.x),p.y=g.y+(L*_.y+O*M.y),p.z=g.z+(L*_.z+O*M.z),u.push(p.x,p.y,p.z),m.subVectors(p,g).normalize(),h.push(m.x,m.y,m.z),f.push(w/n),f.push(U/i)}}for(let w=1;w<=n;w++)for(let T=1;T<=i;T++){const U=(i+1)*(w-1)+(T-1),P=(i+1)*w+(T-1),L=(i+1)*w+T,O=(i+1)*(w-1)+T;c.push(U,P,O),c.push(P,L,O)}this.setIndex(c),this.setAttribute("position",new je(u,3)),this.setAttribute("normal",new je(h,3)),this.setAttribute("uv",new je(f,2));function E(w,T,U,P,L){const O=Math.cos(w),k=Math.sin(w),b=U/T*w,C=Math.cos(b);L.x=P*(2+C)*.5*O,L.y=P*(2+C)*k*.5,L.z=P*Math.sin(b)*.5}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Nh(e.radius,e.tube,e.tubularSegments,e.radialSegments,e.p,e.q)}}class Fh extends vt{constructor(e=new cl(new D(-1,-1,0),new D(-1,1,0),new D(1,1,0)),t=64,n=1,i=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:i,closed:s};const a=e.computeFrenetFrames(t,s);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;const c=new D,u=new D,h=new pe;let f=new D;const p=[],m=[],g=[],y=[];M(),this.setIndex(y),this.setAttribute("position",new je(p,3)),this.setAttribute("normal",new je(m,3)),this.setAttribute("uv",new je(g,2));function M(){for(let w=0;w<t;w++)x(w);x(s===!1?t:0),E(),_()}function x(w){f=e.getPointAt(w/t,f);const T=a.normals[w],U=a.binormals[w];for(let P=0;P<=i;P++){const L=P/i*Math.PI*2,O=Math.sin(L),k=-Math.cos(L);u.x=k*T.x+O*U.x,u.y=k*T.y+O*U.y,u.z=k*T.z+O*U.z,u.normalize(),m.push(u.x,u.y,u.z),c.x=f.x+n*u.x,c.y=f.y+n*u.y,c.z=f.z+n*u.z,p.push(c.x,c.y,c.z)}}function _(){for(let w=1;w<=t;w++)for(let T=1;T<=i;T++){const U=(i+1)*(w-1)+(T-1),P=(i+1)*w+(T-1),L=(i+1)*w+T,O=(i+1)*(w-1)+T;y.push(U,P,O),y.push(P,L,O)}}function E(){for(let w=0;w<=t;w++)for(let T=0;T<=i;T++)h.x=w/t,h.y=T/i,g.push(h.x,h.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new Fh(new sh[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class Wp extends vt{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){const t=[],n=new Set,i=new D,s=new D;if(e.index!==null){const a=e.attributes.position,c=e.index;let u=e.groups;u.length===0&&(u=[{start:0,count:c.count,materialIndex:0}]);for(let h=0,f=u.length;h<f;++h){const p=u[h],m=p.start,g=p.count;for(let y=m,M=m+g;y<M;y+=3)for(let x=0;x<3;x++){const _=c.getX(y+x),E=c.getX(y+(x+1)%3);i.fromBufferAttribute(a,_),s.fromBufferAttribute(a,E),j0(i,s,n)===!0&&(t.push(i.x,i.y,i.z),t.push(s.x,s.y,s.z))}}}else{const a=e.attributes.position;for(let c=0,u=a.count/3;c<u;c++)for(let h=0;h<3;h++){const f=3*c+h,p=3*c+(h+1)%3;i.fromBufferAttribute(a,f),s.fromBufferAttribute(a,p),j0(i,s,n)===!0&&(t.push(i.x,i.y,i.z),t.push(s.x,s.y,s.z))}}this.setAttribute("position",new je(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}function j0(r,e,t){const n=`${r.x},${r.y},${r.z}-${e.x},${e.y},${e.z}`,i=`${e.x},${e.y},${e.z}-${r.x},${r.y},${r.z}`;return t.has(n)===!0||t.has(i)===!0?!1:(t.add(n),t.add(i),!0)}var Z0=Object.freeze({__proto__:null,BoxGeometry:Xr,CapsuleGeometry:Th,CircleGeometry:bh,ConeGeometry:ko,CylinderGeometry:xr,DodecahedronGeometry:Ch,EdgesGeometry:ly,ExtrudeGeometry:Ph,IcosahedronGeometry:Ih,LatheGeometry:ul,OctahedronGeometry:hl,PlaneGeometry:Bo,PolyhedronGeometry:Yr,RingGeometry:Ho,ShapeGeometry:Lh,SphereGeometry:Vo,TetrahedronGeometry:Dh,TorusGeometry:Uh,TorusKnotGeometry:Nh,TubeGeometry:Fh,WireframeGeometry:Wp});class fy extends Ln{constructor(e){super(),this.isShadowMaterial=!0,this.type="ShadowMaterial",this.color=new Ue(0),this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.fog=e.fog,this}}class dy extends Zn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class yi extends Ln{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Ue(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Wr,this.normalScale=new pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ai,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class py extends yi{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new pe(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return jt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ue(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ue(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ue(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class my extends Ln{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Ue(16777215),this.specular=new Ue(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Wr,this.normalScale=new pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ai,this.combine=il,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class gy extends Ln{constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.type="MeshToonMaterial",this.color=new Ue(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Wr,this.normalScale=new pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}class vy extends Ln{constructor(e){super(),this.isMeshNormalMaterial=!0,this.type="MeshNormalMaterial",this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Wr,this.normalScale=new pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this}}class _y extends Ln{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ue(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Wr,this.normalScale=new pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ai,this.combine=il,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class yy extends Ln{constructor(e){super(),this.isMeshMatcapMaterial=!0,this.defines={MATCAP:""},this.type="MeshMatcapMaterial",this.color=new Ue(16777215),this.matcap=null,this.map=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Wr,this.normalScale=new pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={MATCAP:""},this.color.copy(e.color),this.matcap=e.matcap,this.map=e.map,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.flatShading=e.flatShading,this.fog=e.fog,this}}class xy extends kn{constructor(e){super(),this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(e)}copy(e){return super.copy(e),this.scale=e.scale,this.dashSize=e.dashSize,this.gapSize=e.gapSize,this}}function Ms(r,e,t){return!r||!t&&r.constructor===e?r:typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r)}function Sy(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function My(r){function e(i,s){return r[i]-r[s]}const t=r.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function op(r,e,t){const n=r.length,i=new r.constructor(n);for(let s=0,a=0;a!==n;++s){const c=t[s]*e;for(let u=0;u!==e;++u)i[a++]=r[c+u]}return i}function Xp(r,e,t,n){let i=1,s=r[0];for(;s!==void 0&&s[n]===void 0;)s=r[i++];if(s===void 0)return;let a=s[n];if(a!==void 0)if(Array.isArray(a))do a=s[n],a!==void 0&&(e.push(s.time),t.push.apply(t,a)),s=r[i++];while(s!==void 0);else if(a.toArray!==void 0)do a=s[n],a!==void 0&&(e.push(s.time),a.toArray(t,t.length)),s=r[i++];while(s!==void 0);else do a=s[n],a!==void 0&&(e.push(s.time),t.push(a)),s=r[i++];while(s!==void 0)}function fb(r,e,t,n,i=30){const s=r.clone();s.name=e;const a=[];for(let u=0;u<s.tracks.length;++u){const h=s.tracks[u],f=h.getValueSize(),p=[],m=[];for(let g=0;g<h.times.length;++g){const y=h.times[g]*i;if(!(y<t||y>=n)){p.push(h.times[g]);for(let M=0;M<f;++M)m.push(h.values[g*f+M])}}p.length!==0&&(h.times=Ms(p,h.times.constructor),h.values=Ms(m,h.values.constructor),a.push(h))}s.tracks=a;let c=1/0;for(let u=0;u<s.tracks.length;++u)c>s.tracks[u].times[0]&&(c=s.tracks[u].times[0]);for(let u=0;u<s.tracks.length;++u)s.tracks[u].shift(-1*c);return s.resetDuration(),s}function db(r,e=0,t=r,n=30){n<=0&&(n=30);const i=t.tracks.length,s=e/n;for(let a=0;a<i;++a){const c=t.tracks[a],u=c.ValueTypeName;if(u==="bool"||u==="string")continue;const h=r.tracks.find(function(_){return _.name===c.name&&_.ValueTypeName===u});if(h===void 0)continue;let f=0;const p=c.getValueSize();c.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(f=p/3);let m=0;const g=h.getValueSize();h.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(m=g/3);const y=c.times.length-1;let M;if(s<=c.times[0]){const _=f,E=p-f;M=c.values.slice(_,E)}else if(s>=c.times[y]){const _=y*p+f,E=_+p-f;M=c.values.slice(_,E)}else{const _=c.createInterpolant(),E=f,w=p-f;_.evaluate(s),M=_.resultBuffer.slice(E,w)}u==="quaternion"&&new jn().fromArray(M).normalize().conjugate().toArray(M);const x=h.times.length;for(let _=0;_<x;++_){const E=_*g+m;if(u==="quaternion")jn.multiplyQuaternionsFlat(h.values,E,M,0,h.values,E);else{const w=g-m*2;for(let T=0;T<w;++T)h.values[E+T]-=M[T]}}}return r.blendMode=Ep,r}const pb={convertArray:Ms,isTypedArray:Sy,getKeyframeOrder:My,sortedArray:op,flattenJSON:Xp,subclip:fb,makeClipAdditive:db};class fl{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],s=t[n-1];e:{t:{let a;n:{i:if(!(e<i)){for(let c=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===c)break;if(s=i,i=t[++n],e<i)break t}a=t.length;break n}if(!(e>=s)){const c=t[1];e<c&&(n=2,s=c);for(let u=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===u)break;if(i=s,s=t[--n-1],e>=s)break t}a=n,n=0;break n}break e}for(;n<a;){const c=n+a>>>1;e<t[c]?a=c:n=c+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let a=0;a!==i;++a)t[a]=n[s+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class wy extends fl{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ys,endingEnd:ys}}intervalChanged_(e,t,n){const i=this.parameterPositions;let s=e-2,a=e+1,c=i[s],u=i[a];if(c===void 0)switch(this.getSettings_().endingStart){case xs:s=e,c=2*t-n;break;case Ha:s=i.length-2,c=t+i[s]-i[s+1];break;default:s=e,c=n}if(u===void 0)switch(this.getSettings_().endingEnd){case xs:a=e,u=2*n-t;break;case Ha:a=1,u=n+i[1]-i[0];break;default:a=e-1,u=t}const h=(n-t)*.5,f=this.valueSize;this._weightPrev=h/(t-c),this._weightNext=h/(u-n),this._offsetPrev=s*f,this._offsetNext=a*f}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,c=this.valueSize,u=e*c,h=u-c,f=this._offsetPrev,p=this._offsetNext,m=this._weightPrev,g=this._weightNext,y=(n-t)/(i-t),M=y*y,x=M*y,_=-m*x+2*m*M-m*y,E=(1+m)*x+(-1.5-2*m)*M+(-.5+m)*y+1,w=(-1-g)*x+(1.5+g)*M+.5*y,T=g*x-g*M;for(let U=0;U!==c;++U)s[U]=_*a[f+U]+E*a[h+U]+w*a[u+U]+T*a[p+U];return s}}class Yp extends fl{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,c=this.valueSize,u=e*c,h=u-c,f=(n-t)/(i-t),p=1-f;for(let m=0;m!==c;++m)s[m]=a[h+m]*p+a[u+m]*f;return s}}class Ey extends fl{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class Li{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ms(t,this.TimeBufferType),this.values=Ms(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ms(e.times,Array),values:Ms(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Ey(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Yp(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new wy(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case ka:t=this.InterpolantFactoryMethodDiscrete;break;case th:t=this.InterpolantFactoryMethodLinear;break;case pu:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ka;case this.InterpolantFactoryMethodLinear:return th;case this.InterpolantFactoryMethodSmooth:return pu}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let s=0,a=i-1;for(;s!==i&&n[s]<e;)++s;for(;a!==-1&&n[a]>t;)--a;if(++a,s!==0||a!==i){s>=a&&(a=Math.max(a,1),s=a-1);const c=this.getValueSize();this.times=n.slice(s,a),this.values=this.values.slice(s*c,a*c)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let c=0;c!==s;c++){const u=n[c];if(typeof u=="number"&&isNaN(u)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,c,u),e=!1;break}if(a!==null&&a>u){console.error("THREE.KeyframeTrack: Out of order keys.",this,c,u,a),e=!1;break}a=u}if(i!==void 0&&Sy(i))for(let c=0,u=i.length;c!==u;++c){const h=i[c];if(isNaN(h)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,c,h),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===pu,s=e.length-1;let a=1;for(let c=1;c<s;++c){let u=!1;const h=e[c],f=e[c+1];if(h!==f&&(c!==1||h!==e[0]))if(i)u=!0;else{const p=c*n,m=p-n,g=p+n;for(let y=0;y!==n;++y){const M=t[p+y];if(M!==t[m+y]||M!==t[g+y]){u=!0;break}}}if(u){if(c!==a){e[a]=e[c];const p=c*n,m=a*n;for(let g=0;g!==n;++g)t[m+g]=t[p+g]}++a}}if(s>0){e[a]=e[s];for(let c=s*n,u=a*n,h=0;h!==n;++h)t[u+h]=t[c+h];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}Li.prototype.TimeBufferType=Float32Array;Li.prototype.ValueBufferType=Float32Array;Li.prototype.DefaultInterpolation=th;class Fs extends Li{constructor(e,t,n){super(e,t,n)}}Fs.prototype.ValueTypeName="bool";Fs.prototype.ValueBufferType=Array;Fs.prototype.DefaultInterpolation=ka;Fs.prototype.InterpolantFactoryMethodLinear=void 0;Fs.prototype.InterpolantFactoryMethodSmooth=void 0;class qp extends Li{}qp.prototype.ValueTypeName="color";class Qa extends Li{}Qa.prototype.ValueTypeName="number";class Ay extends fl{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,c=this.valueSize,u=(n-t)/(i-t);let h=e*c;for(let f=h+c;h!==f;h+=4)jn.slerpFlat(s,0,a,h-c,a,h,u);return s}}class dl extends Li{InterpolantFactoryMethodLinear(e){return new Ay(this.times,this.values,this.getValueSize(),e)}}dl.prototype.ValueTypeName="quaternion";dl.prototype.InterpolantFactoryMethodSmooth=void 0;class Os extends Li{constructor(e,t,n){super(e,t,n)}}Os.prototype.ValueTypeName="string";Os.prototype.ValueBufferType=Array;Os.prototype.DefaultInterpolation=ka;Os.prototype.InterpolantFactoryMethodLinear=void 0;Os.prototype.InterpolantFactoryMethodSmooth=void 0;class $a extends Li{}$a.prototype.ValueTypeName="vector";class el{constructor(e="",t=-1,n=[],i=gh){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=oi(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let a=0,c=n.length;a!==c;++a)t.push(gb(n[a]).scale(i));const s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let s=0,a=n.length;s!==a;++s)t.push(Li.toJSON(n[s]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const s=t.length,a=[];for(let c=0;c<s;c++){let u=[],h=[];u.push((c+s-1)%s,c,(c+1)%s),h.push(0,1,0);const f=My(u);u=op(u,1,f),h=op(h,1,f),!i&&u[0]===0&&(u.push(s),h.push(h[0])),a.push(new Qa(".morphTargetInfluences["+t[c].name+"]",u,h).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},s=/^([\w-]*?)([\d]+)$/;for(let c=0,u=e.length;c<u;c++){const h=e[c],f=h.name.match(s);if(f&&f.length>1){const p=f[1];let m=i[p];m||(i[p]=m=[]),m.push(h)}}const a=[];for(const c in i)a.push(this.CreateFromMorphTargetSequence(c,i[c],t,n));return a}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(p,m,g,y,M){if(g.length!==0){const x=[],_=[];Xp(g,x,_,y),x.length!==0&&M.push(new p(m,x,_))}},i=[],s=e.name||"default",a=e.fps||30,c=e.blendMode;let u=e.length||-1;const h=e.hierarchy||[];for(let p=0;p<h.length;p++){const m=h[p].keys;if(!(!m||m.length===0))if(m[0].morphTargets){const g={};let y;for(y=0;y<m.length;y++)if(m[y].morphTargets)for(let M=0;M<m[y].morphTargets.length;M++)g[m[y].morphTargets[M]]=-1;for(const M in g){const x=[],_=[];for(let E=0;E!==m[y].morphTargets.length;++E){const w=m[y];x.push(w.time),_.push(w.morphTarget===M?1:0)}i.push(new Qa(".morphTargetInfluence["+M+"]",x,_))}u=g.length*a}else{const g=".bones["+t[p].name+"]";n($a,g+".position",m,"pos",i),n(dl,g+".quaternion",m,"rot",i),n($a,g+".scale",m,"scl",i)}}return i.length===0?null:new this(s,u,i,c)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function mb(r){switch(r.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Qa;case"vector":case"vector2":case"vector3":case"vector4":return $a;case"color":return qp;case"quaternion":return dl;case"bool":case"boolean":return Fs;case"string":return Os}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+r)}function gb(r){if(r.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=mb(r.type);if(r.times===void 0){const t=[],n=[];Xp(r.keys,t,n,"value"),r.times=t,r.values=n}return e.parse!==void 0?e.parse(r):new e(r.name,r.times,r.values,r.interpolation)}const dr={enabled:!1,files:{},add:function(r,e){this.enabled!==!1&&(this.files[r]=e)},get:function(r){if(this.enabled!==!1)return this.files[r]},remove:function(r){delete this.files[r]},clear:function(){this.files={}}};class jp{constructor(e,t,n){const i=this;let s=!1,a=0,c=0,u;const h=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(f){c++,s===!1&&i.onStart!==void 0&&i.onStart(f,a,c),s=!0},this.itemEnd=function(f){a++,i.onProgress!==void 0&&i.onProgress(f,a,c),a===c&&(s=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(f){i.onError!==void 0&&i.onError(f)},this.resolveURL=function(f){return u?u(f):f},this.setURLModifier=function(f){return u=f,this},this.addHandler=function(f,p){return h.push(f,p),this},this.removeHandler=function(f){const p=h.indexOf(f);return p!==-1&&h.splice(p,2),this},this.getHandler=function(f){for(let p=0,m=h.length;p<m;p+=2){const g=h[p],y=h[p+1];if(g.global&&(g.lastIndex=0),g.test(f))return y}return null}}}const Ty=new jp;class Jn{constructor(e){this.manager=e!==void 0?e:Ty,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,s){n.load(e,i,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}Jn.DEFAULT_MATERIAL_NAME="__DEFAULT";const ur={};class vb extends Error{constructor(e,t){super(e),this.response=t}}class _r extends Jn{constructor(e){super(e)}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=dr.get(e);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(ur[e]!==void 0){ur[e].push({onLoad:t,onProgress:n,onError:i});return}ur[e]=[],ur[e].push({onLoad:t,onProgress:n,onError:i});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),c=this.mimeType,u=this.responseType;fetch(a).then(h=>{if(h.status===200||h.status===0){if(h.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||h.body===void 0||h.body.getReader===void 0)return h;const f=ur[e],p=h.body.getReader(),m=h.headers.get("X-File-Size")||h.headers.get("Content-Length"),g=m?parseInt(m):0,y=g!==0;let M=0;const x=new ReadableStream({start(_){E();function E(){p.read().then(({done:w,value:T})=>{if(w)_.close();else{M+=T.byteLength;const U=new ProgressEvent("progress",{lengthComputable:y,loaded:M,total:g});for(let P=0,L=f.length;P<L;P++){const O=f[P];O.onProgress&&O.onProgress(U)}_.enqueue(T),E()}},w=>{_.error(w)})}}});return new Response(x)}else throw new vb(`fetch for "${h.url}" responded with ${h.status}: ${h.statusText}`,h)}).then(h=>{switch(u){case"arraybuffer":return h.arrayBuffer();case"blob":return h.blob();case"document":return h.text().then(f=>new DOMParser().parseFromString(f,c));case"json":return h.json();default:if(c===void 0)return h.text();{const p=/charset="?([^;"\s]*)"?/i.exec(c),m=p&&p[1]?p[1].toLowerCase():void 0,g=new TextDecoder(m);return h.arrayBuffer().then(y=>g.decode(y))}}}).then(h=>{dr.add(e,h);const f=ur[e];delete ur[e];for(let p=0,m=f.length;p<m;p++){const g=f[p];g.onLoad&&g.onLoad(h)}}).catch(h=>{const f=ur[e];if(f===void 0)throw this.manager.itemError(e),h;delete ur[e];for(let p=0,m=f.length;p<m;p++){const g=f[p];g.onError&&g.onError(h)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class _b extends Jn{constructor(e){super(e)}load(e,t,n,i){const s=this,a=new _r(this.manager);a.setPath(this.path),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(c){try{t(s.parse(JSON.parse(c)))}catch(u){i?i(u):console.error(u),s.manager.itemError(e)}},n,i)}parse(e){const t=[];for(let n=0;n<e.length;n++){const i=el.parse(e[n]);t.push(i)}return t}}class yb extends Jn{constructor(e){super(e)}load(e,t,n,i){const s=this,a=[],c=new Eh,u=new _r(this.manager);u.setPath(this.path),u.setResponseType("arraybuffer"),u.setRequestHeader(this.requestHeader),u.setWithCredentials(s.withCredentials);let h=0;function f(p){u.load(e[p],function(m){const g=s.parse(m,!0);a[p]={width:g.width,height:g.height,format:g.format,mipmaps:g.mipmaps},h+=1,h===6&&(g.mipmapCount===1&&(c.minFilter=rn),c.image=a,c.format=g.format,c.needsUpdate=!0,t&&t(c))},n,i)}if(Array.isArray(e))for(let p=0,m=e.length;p<m;++p)f(p);else u.load(e,function(p){const m=s.parse(p,!0);if(m.isCubemap){const g=m.mipmaps.length/m.mipmapCount;for(let y=0;y<g;y++){a[y]={mipmaps:[]};for(let M=0;M<m.mipmapCount;M++)a[y].mipmaps.push(m.mipmaps[y*m.mipmapCount+M]),a[y].format=m.format,a[y].width=m.width,a[y].height=m.height}c.image=a}else c.image.width=m.width,c.image.height=m.height,c.mipmaps=m.mipmaps;m.mipmapCount===1&&(c.minFilter=rn),c.format=m.format,c.needsUpdate=!0,t&&t(c)},n,i);return c}}class tl extends Jn{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=dr.get(e);if(a!==void 0)return s.manager.itemStart(e),setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a;const c=qa("img");function u(){f(),dr.add(e,this),t&&t(this),s.manager.itemEnd(e)}function h(p){f(),i&&i(p),s.manager.itemError(e),s.manager.itemEnd(e)}function f(){c.removeEventListener("load",u,!1),c.removeEventListener("error",h,!1)}return c.addEventListener("load",u,!1),c.addEventListener("error",h,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(c.crossOrigin=this.crossOrigin),s.manager.itemStart(e),c.src=e,c}}class xb extends Jn{constructor(e){super(e)}load(e,t,n,i){const s=new al;s.colorSpace=Xn;const a=new tl(this.manager);a.setCrossOrigin(this.crossOrigin),a.setPath(this.path);let c=0;function u(h){a.load(e[h],function(f){s.images[h]=f,c++,c===6&&(s.needsUpdate=!0,t&&t(s))},void 0,i)}for(let h=0;h<e.length;++h)u(h);return s}}class Sb extends Jn{constructor(e){super(e)}load(e,t,n,i){const s=this,a=new ji,c=new _r(this.manager);return c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setPath(this.path),c.setWithCredentials(s.withCredentials),c.load(e,function(u){let h;try{h=s.parse(u)}catch(f){if(i!==void 0)i(f);else{console.error(f);return}}h.image!==void 0?a.image=h.image:h.data!==void 0&&(a.image.width=h.width,a.image.height=h.height,a.image.data=h.data),a.wrapS=h.wrapS!==void 0?h.wrapS:_i,a.wrapT=h.wrapT!==void 0?h.wrapT:_i,a.magFilter=h.magFilter!==void 0?h.magFilter:rn,a.minFilter=h.minFilter!==void 0?h.minFilter:rn,a.anisotropy=h.anisotropy!==void 0?h.anisotropy:1,h.colorSpace!==void 0&&(a.colorSpace=h.colorSpace),h.flipY!==void 0&&(a.flipY=h.flipY),h.format!==void 0&&(a.format=h.format),h.type!==void 0&&(a.type=h.type),h.mipmaps!==void 0&&(a.mipmaps=h.mipmaps,a.minFilter=Xi),h.mipmapCount===1&&(a.minFilter=rn),h.generateMipmaps!==void 0&&(a.generateMipmaps=h.generateMipmaps),a.needsUpdate=!0,t&&t(a,h)},n,i),a}}class Mb extends Jn{constructor(e){super(e)}load(e,t,n,i){const s=new Zt,a=new tl(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(c){s.image=c,s.needsUpdate=!0,t!==void 0&&t(s)},n,i),s}}class qr extends Ct{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ue(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class by extends qr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ct.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ue(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const Ld=new rt,J0=new D,K0=new D;class Zp{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new pe(512,512),this.map=null,this.mapPass=null,this.matrix=new rt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ll,this._frameExtents=new pe(1,1),this._viewportCount=1,this._viewports=[new xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;J0.setFromMatrixPosition(e.matrixWorld),t.position.copy(J0),K0.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(K0),t.updateMatrixWorld(),Ld.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ld),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Ld)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class wb extends Zp{constructor(){super(new nn(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,n=Io*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height,s=e.distance||t.far;(n!==t.fov||i!==t.aspect||s!==t.far)&&(t.fov=n,t.aspect=i,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Cy extends qr{constructor(e,t,n=0,i=Math.PI/3,s=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Ct.DEFAULT_UP),this.updateMatrix(),this.target=new Ct,this.distance=n,this.angle=i,this.penumbra=s,this.decay=a,this.map=null,this.shadow=new wb}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Q0=new rt,Sa=new D,Dd=new D;class Eb extends Zp{constructor(){super(new nn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new pe(4,2),this._viewportCount=6,this._viewports=[new xt(2,1,1,1),new xt(0,1,1,1),new xt(3,1,1,1),new xt(1,1,1,1),new xt(3,0,1,1),new xt(1,0,1,1)],this._cubeDirections=[new D(1,0,0),new D(-1,0,0),new D(0,0,1),new D(0,0,-1),new D(0,1,0),new D(0,-1,0)],this._cubeUps=[new D(0,1,0),new D(0,1,0),new D(0,1,0),new D(0,1,0),new D(0,0,1),new D(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),Sa.setFromMatrixPosition(e.matrixWorld),n.position.copy(Sa),Dd.copy(n.position),Dd.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Dd),n.updateMatrixWorld(),i.makeTranslation(-Sa.x,-Sa.y,-Sa.z),Q0.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Q0)}}class Ry extends qr{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Eb}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class Ab extends Zp{constructor(){super(new Ns(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Py extends qr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ct.DEFAULT_UP),this.updateMatrix(),this.target=new Ct,this.shadow=new Ab}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Iy extends qr{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class Ly extends qr{constructor(e,t,n=10,i=10){super(e,t),this.isRectAreaLight=!0,this.type="RectAreaLight",this.width=n,this.height=i}get power(){return this.intensity*this.width*this.height*Math.PI}set power(e){this.intensity=e/(this.width*this.height*Math.PI)}copy(e){return super.copy(e),this.width=e.width,this.height=e.height,this}toJSON(e){const t=super.toJSON(e);return t.object.width=this.width,t.object.height=this.height,t}}class Dy{constructor(){this.isSphericalHarmonics3=!0,this.coefficients=[];for(let e=0;e<9;e++)this.coefficients.push(new D)}set(e){for(let t=0;t<9;t++)this.coefficients[t].copy(e[t]);return this}zero(){for(let e=0;e<9;e++)this.coefficients[e].set(0,0,0);return this}getAt(e,t){const n=e.x,i=e.y,s=e.z,a=this.coefficients;return t.copy(a[0]).multiplyScalar(.282095),t.addScaledVector(a[1],.488603*i),t.addScaledVector(a[2],.488603*s),t.addScaledVector(a[3],.488603*n),t.addScaledVector(a[4],1.092548*(n*i)),t.addScaledVector(a[5],1.092548*(i*s)),t.addScaledVector(a[6],.315392*(3*s*s-1)),t.addScaledVector(a[7],1.092548*(n*s)),t.addScaledVector(a[8],.546274*(n*n-i*i)),t}getIrradianceAt(e,t){const n=e.x,i=e.y,s=e.z,a=this.coefficients;return t.copy(a[0]).multiplyScalar(.886227),t.addScaledVector(a[1],2*.511664*i),t.addScaledVector(a[2],2*.511664*s),t.addScaledVector(a[3],2*.511664*n),t.addScaledVector(a[4],2*.429043*n*i),t.addScaledVector(a[5],2*.429043*i*s),t.addScaledVector(a[6],.743125*s*s-.247708),t.addScaledVector(a[7],2*.429043*n*s),t.addScaledVector(a[8],.429043*(n*n-i*i)),t}add(e){for(let t=0;t<9;t++)this.coefficients[t].add(e.coefficients[t]);return this}addScaledSH(e,t){for(let n=0;n<9;n++)this.coefficients[n].addScaledVector(e.coefficients[n],t);return this}scale(e){for(let t=0;t<9;t++)this.coefficients[t].multiplyScalar(e);return this}lerp(e,t){for(let n=0;n<9;n++)this.coefficients[n].lerp(e.coefficients[n],t);return this}equals(e){for(let t=0;t<9;t++)if(!this.coefficients[t].equals(e.coefficients[t]))return!1;return!0}copy(e){return this.set(e.coefficients)}clone(){return new this.constructor().copy(this)}fromArray(e,t=0){const n=this.coefficients;for(let i=0;i<9;i++)n[i].fromArray(e,t+i*3);return this}toArray(e=[],t=0){const n=this.coefficients;for(let i=0;i<9;i++)n[i].toArray(e,t+i*3);return e}static getBasisAt(e,t){const n=e.x,i=e.y,s=e.z;t[0]=.282095,t[1]=.488603*i,t[2]=.488603*s,t[3]=.488603*n,t[4]=1.092548*n*i,t[5]=1.092548*i*s,t[6]=.315392*(3*s*s-1),t[7]=1.092548*n*s,t[8]=.546274*(n*n-i*i)}}class Uy extends qr{constructor(e=new Dy,t=1){super(void 0,t),this.isLightProbe=!0,this.sh=e}copy(e){return super.copy(e),this.sh.copy(e.sh),this}fromJSON(e){return this.intensity=e.intensity,this.sh.fromArray(e.sh),this}toJSON(e){const t=super.toJSON(e);return t.object.sh=this.sh.toArray(),t}}class Oh extends Jn{constructor(e){super(e),this.textures={}}load(e,t,n,i){const s=this,a=new _r(s.manager);a.setPath(s.path),a.setRequestHeader(s.requestHeader),a.setWithCredentials(s.withCredentials),a.load(e,function(c){try{t(s.parse(JSON.parse(c)))}catch(u){i?i(u):console.error(u),s.manager.itemError(e)}},n,i)}parse(e){const t=this.textures;function n(s){return t[s]===void 0&&console.warn("THREE.MaterialLoader: Undefined texture",s),t[s]}const i=this.createMaterialFromType(e.type);if(e.uuid!==void 0&&(i.uuid=e.uuid),e.name!==void 0&&(i.name=e.name),e.color!==void 0&&i.color!==void 0&&i.color.setHex(e.color),e.roughness!==void 0&&(i.roughness=e.roughness),e.metalness!==void 0&&(i.metalness=e.metalness),e.sheen!==void 0&&(i.sheen=e.sheen),e.sheenColor!==void 0&&(i.sheenColor=new Ue().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(i.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&i.emissive!==void 0&&i.emissive.setHex(e.emissive),e.specular!==void 0&&i.specular!==void 0&&i.specular.setHex(e.specular),e.specularIntensity!==void 0&&(i.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&i.specularColor!==void 0&&i.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(i.shininess=e.shininess),e.clearcoat!==void 0&&(i.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(i.dispersion=e.dispersion),e.iridescence!==void 0&&(i.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(i.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(i.transmission=e.transmission),e.thickness!==void 0&&(i.thickness=e.thickness),e.attenuationDistance!==void 0&&(i.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&i.attenuationColor!==void 0&&i.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(i.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(i.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(i.fog=e.fog),e.flatShading!==void 0&&(i.flatShading=e.flatShading),e.blending!==void 0&&(i.blending=e.blending),e.combine!==void 0&&(i.combine=e.combine),e.side!==void 0&&(i.side=e.side),e.shadowSide!==void 0&&(i.shadowSide=e.shadowSide),e.opacity!==void 0&&(i.opacity=e.opacity),e.transparent!==void 0&&(i.transparent=e.transparent),e.alphaTest!==void 0&&(i.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(i.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(i.depthFunc=e.depthFunc),e.depthTest!==void 0&&(i.depthTest=e.depthTest),e.depthWrite!==void 0&&(i.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(i.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(i.blendSrc=e.blendSrc),e.blendDst!==void 0&&(i.blendDst=e.blendDst),e.blendEquation!==void 0&&(i.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(i.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(i.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(i.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&i.blendColor!==void 0&&i.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(i.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(i.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(i.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(i.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(i.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(i.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(i.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(i.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(i.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(i.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(i.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(i.rotation=e.rotation),e.linewidth!==void 0&&(i.linewidth=e.linewidth),e.dashSize!==void 0&&(i.dashSize=e.dashSize),e.gapSize!==void 0&&(i.gapSize=e.gapSize),e.scale!==void 0&&(i.scale=e.scale),e.polygonOffset!==void 0&&(i.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(i.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(i.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(i.dithering=e.dithering),e.alphaToCoverage!==void 0&&(i.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(i.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(i.forceSinglePass=e.forceSinglePass),e.visible!==void 0&&(i.visible=e.visible),e.toneMapped!==void 0&&(i.toneMapped=e.toneMapped),e.userData!==void 0&&(i.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?i.vertexColors=e.vertexColors>0:i.vertexColors=e.vertexColors),e.uniforms!==void 0)for(const s in e.uniforms){const a=e.uniforms[s];switch(i.uniforms[s]={},a.type){case"t":i.uniforms[s].value=n(a.value);break;case"c":i.uniforms[s].value=new Ue().setHex(a.value);break;case"v2":i.uniforms[s].value=new pe().fromArray(a.value);break;case"v3":i.uniforms[s].value=new D().fromArray(a.value);break;case"v4":i.uniforms[s].value=new xt().fromArray(a.value);break;case"m3":i.uniforms[s].value=new dt().fromArray(a.value);break;case"m4":i.uniforms[s].value=new rt().fromArray(a.value);break;default:i.uniforms[s].value=a.value}}if(e.defines!==void 0&&(i.defines=e.defines),e.vertexShader!==void 0&&(i.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(i.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(i.glslVersion=e.glslVersion),e.extensions!==void 0)for(const s in e.extensions)i.extensions[s]=e.extensions[s];if(e.lights!==void 0&&(i.lights=e.lights),e.clipping!==void 0&&(i.clipping=e.clipping),e.size!==void 0&&(i.size=e.size),e.sizeAttenuation!==void 0&&(i.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(i.map=n(e.map)),e.matcap!==void 0&&(i.matcap=n(e.matcap)),e.alphaMap!==void 0&&(i.alphaMap=n(e.alphaMap)),e.bumpMap!==void 0&&(i.bumpMap=n(e.bumpMap)),e.bumpScale!==void 0&&(i.bumpScale=e.bumpScale),e.normalMap!==void 0&&(i.normalMap=n(e.normalMap)),e.normalMapType!==void 0&&(i.normalMapType=e.normalMapType),e.normalScale!==void 0){let s=e.normalScale;Array.isArray(s)===!1&&(s=[s,s]),i.normalScale=new pe().fromArray(s)}return e.displacementMap!==void 0&&(i.displacementMap=n(e.displacementMap)),e.displacementScale!==void 0&&(i.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(i.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(i.roughnessMap=n(e.roughnessMap)),e.metalnessMap!==void 0&&(i.metalnessMap=n(e.metalnessMap)),e.emissiveMap!==void 0&&(i.emissiveMap=n(e.emissiveMap)),e.emissiveIntensity!==void 0&&(i.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(i.specularMap=n(e.specularMap)),e.specularIntensityMap!==void 0&&(i.specularIntensityMap=n(e.specularIntensityMap)),e.specularColorMap!==void 0&&(i.specularColorMap=n(e.specularColorMap)),e.envMap!==void 0&&(i.envMap=n(e.envMap)),e.envMapRotation!==void 0&&i.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(i.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(i.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(i.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(i.lightMap=n(e.lightMap)),e.lightMapIntensity!==void 0&&(i.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(i.aoMap=n(e.aoMap)),e.aoMapIntensity!==void 0&&(i.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(i.gradientMap=n(e.gradientMap)),e.clearcoatMap!==void 0&&(i.clearcoatMap=n(e.clearcoatMap)),e.clearcoatRoughnessMap!==void 0&&(i.clearcoatRoughnessMap=n(e.clearcoatRoughnessMap)),e.clearcoatNormalMap!==void 0&&(i.clearcoatNormalMap=n(e.clearcoatNormalMap)),e.clearcoatNormalScale!==void 0&&(i.clearcoatNormalScale=new pe().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(i.iridescenceMap=n(e.iridescenceMap)),e.iridescenceThicknessMap!==void 0&&(i.iridescenceThicknessMap=n(e.iridescenceThicknessMap)),e.transmissionMap!==void 0&&(i.transmissionMap=n(e.transmissionMap)),e.thicknessMap!==void 0&&(i.thicknessMap=n(e.thicknessMap)),e.anisotropyMap!==void 0&&(i.anisotropyMap=n(e.anisotropyMap)),e.sheenColorMap!==void 0&&(i.sheenColorMap=n(e.sheenColorMap)),e.sheenRoughnessMap!==void 0&&(i.sheenRoughnessMap=n(e.sheenRoughnessMap)),i}setTextures(e){return this.textures=e,this}createMaterialFromType(e){return Oh.createMaterialFromType(e)}static createMaterialFromType(e){const t={ShadowMaterial:fy,SpriteMaterial:Np,RawShaderMaterial:dy,ShaderMaterial:Zn,PointsMaterial:Op,MeshPhysicalMaterial:py,MeshStandardMaterial:yi,MeshPhongMaterial:my,MeshToonMaterial:gy,MeshNormalMaterial:vy,MeshLambertMaterial:_y,MeshDepthMaterial:Lp,MeshDistanceMaterial:Dp,MeshBasicMaterial:Pi,MeshMatcapMaterial:yy,LineDashedMaterial:xy,LineBasicMaterial:kn,Material:Ln};return new t[e]}}class ap{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,i=e.length;n<i;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class Jp extends vt{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){const e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}}class Ny extends Jn{constructor(e){super(e)}load(e,t,n,i){const s=this,a=new _r(s.manager);a.setPath(s.path),a.setRequestHeader(s.requestHeader),a.setWithCredentials(s.withCredentials),a.load(e,function(c){try{t(s.parse(JSON.parse(c)))}catch(u){i?i(u):console.error(u),s.manager.itemError(e)}},n,i)}parse(e){const t={},n={};function i(g,y){if(t[y]!==void 0)return t[y];const x=g.interleavedBuffers[y],_=s(g,x.buffer),E=Eo(x.type,_),w=new Mh(E,x.stride);return w.uuid=x.uuid,t[y]=w,w}function s(g,y){if(n[y]!==void 0)return n[y];const x=g.arrayBuffers[y],_=new Uint32Array(x).buffer;return n[y]=_,_}const a=e.isInstancedBufferGeometry?new Jp:new vt,c=e.data.index;if(c!==void 0){const g=Eo(c.type,c.array);a.setIndex(new Ft(g,1))}const u=e.data.attributes;for(const g in u){const y=u[g];let M;if(y.isInterleavedBufferAttribute){const x=i(e.data,y.data);M=new si(x,y.itemSize,y.offset,y.normalized)}else{const x=Eo(y.type,y.array),_=y.isInstancedBufferAttribute?Do:Ft;M=new _(x,y.itemSize,y.normalized)}y.name!==void 0&&(M.name=y.name),y.usage!==void 0&&M.setUsage(y.usage),a.setAttribute(g,M)}const h=e.data.morphAttributes;if(h)for(const g in h){const y=h[g],M=[];for(let x=0,_=y.length;x<_;x++){const E=y[x];let w;if(E.isInterleavedBufferAttribute){const T=i(e.data,E.data);w=new si(T,E.itemSize,E.offset,E.normalized)}else{const T=Eo(E.type,E.array);w=new Ft(T,E.itemSize,E.normalized)}E.name!==void 0&&(w.name=E.name),M.push(w)}a.morphAttributes[g]=M}e.data.morphTargetsRelative&&(a.morphTargetsRelative=!0);const p=e.data.groups||e.data.drawcalls||e.data.offsets;if(p!==void 0)for(let g=0,y=p.length;g!==y;++g){const M=p[g];a.addGroup(M.start,M.count,M.materialIndex)}const m=e.data.boundingSphere;if(m!==void 0){const g=new D;m.center!==void 0&&g.fromArray(m.center),a.boundingSphere=new mn(g,m.radius)}return e.name&&(a.name=e.name),e.userData&&(a.userData=e.userData),a}}class Tb extends Jn{constructor(e){super(e)}load(e,t,n,i){const s=this,a=this.path===""?ap.extractUrlBase(e):this.path;this.resourcePath=this.resourcePath||a;const c=new _r(this.manager);c.setPath(this.path),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(u){let h=null;try{h=JSON.parse(u)}catch(p){i!==void 0&&i(p),console.error("THREE:ObjectLoader: Can't parse "+e+".",p.message);return}const f=h.metadata;if(f===void 0||f.type===void 0||f.type.toLowerCase()==="geometry"){i!==void 0&&i(new Error("THREE.ObjectLoader: Can't load "+e)),console.error("THREE.ObjectLoader: Can't load "+e);return}s.parse(h,t)},n,i)}async loadAsync(e,t){const n=this,i=this.path===""?ap.extractUrlBase(e):this.path;this.resourcePath=this.resourcePath||i;const s=new _r(this.manager);s.setPath(this.path),s.setRequestHeader(this.requestHeader),s.setWithCredentials(this.withCredentials);const a=await s.loadAsync(e,t),c=JSON.parse(a),u=c.metadata;if(u===void 0||u.type===void 0||u.type.toLowerCase()==="geometry")throw new Error("THREE.ObjectLoader: Can't load "+e);return await n.parseAsync(c)}parse(e,t){const n=this.parseAnimations(e.animations),i=this.parseShapes(e.shapes),s=this.parseGeometries(e.geometries,i),a=this.parseImages(e.images,function(){t!==void 0&&t(h)}),c=this.parseTextures(e.textures,a),u=this.parseMaterials(e.materials,c),h=this.parseObject(e.object,s,u,c,n),f=this.parseSkeletons(e.skeletons,h);if(this.bindSkeletons(h,f),this.bindLightTargets(h),t!==void 0){let p=!1;for(const m in a)if(a[m].data instanceof HTMLImageElement){p=!0;break}p===!1&&t(h)}return h}async parseAsync(e){const t=this.parseAnimations(e.animations),n=this.parseShapes(e.shapes),i=this.parseGeometries(e.geometries,n),s=await this.parseImagesAsync(e.images),a=this.parseTextures(e.textures,s),c=this.parseMaterials(e.materials,a),u=this.parseObject(e.object,i,c,a,t),h=this.parseSkeletons(e.skeletons,u);return this.bindSkeletons(u,h),this.bindLightTargets(u),u}parseShapes(e){const t={};if(e!==void 0)for(let n=0,i=e.length;n<i;n++){const s=new Hr().fromJSON(e[n]);t[s.uuid]=s}return t}parseSkeletons(e,t){const n={},i={};if(t.traverse(function(s){s.isBone&&(i[s.uuid]=s)}),e!==void 0)for(let s=0,a=e.length;s<a;s++){const c=new wh().fromJSON(e[s],i);n[c.uuid]=c}return n}parseGeometries(e,t){const n={};if(e!==void 0){const i=new Ny;for(let s=0,a=e.length;s<a;s++){let c;const u=e[s];switch(u.type){case"BufferGeometry":case"InstancedBufferGeometry":c=i.parse(u);break;default:u.type in Z0?c=Z0[u.type].fromJSON(u,t):console.warn(`THREE.ObjectLoader: Unsupported geometry type "${u.type}"`)}c.uuid=u.uuid,u.name!==void 0&&(c.name=u.name),u.userData!==void 0&&(c.userData=u.userData),n[u.uuid]=c}}return n}parseMaterials(e,t){const n={},i={};if(e!==void 0){const s=new Oh;s.setTextures(t);for(let a=0,c=e.length;a<c;a++){const u=e[a];n[u.uuid]===void 0&&(n[u.uuid]=s.parse(u)),i[u.uuid]=n[u.uuid]}}return i}parseAnimations(e){const t={};if(e!==void 0)for(let n=0;n<e.length;n++){const i=e[n],s=el.parse(i);t[s.uuid]=s}return t}parseImages(e,t){const n=this,i={};let s;function a(u){return n.manager.itemStart(u),s.load(u,function(){n.manager.itemEnd(u)},void 0,function(){n.manager.itemError(u),n.manager.itemEnd(u)})}function c(u){if(typeof u=="string"){const h=u,f=/^(\/\/)|([a-z]+:(\/\/)?)/i.test(h)?h:n.resourcePath+h;return a(f)}else return u.data?{data:Eo(u.type,u.data),width:u.width,height:u.height}:null}if(e!==void 0&&e.length>0){const u=new jp(t);s=new tl(u),s.setCrossOrigin(this.crossOrigin);for(let h=0,f=e.length;h<f;h++){const p=e[h],m=p.url;if(Array.isArray(m)){const g=[];for(let y=0,M=m.length;y<M;y++){const x=m[y],_=c(x);_!==null&&(_ instanceof HTMLImageElement?g.push(_):g.push(new ji(_.data,_.width,_.height)))}i[p.uuid]=new Ss(g)}else{const g=c(p.url);i[p.uuid]=new Ss(g)}}}return i}async parseImagesAsync(e){const t=this,n={};let i;async function s(a){if(typeof a=="string"){const c=a,u=/^(\/\/)|([a-z]+:(\/\/)?)/i.test(c)?c:t.resourcePath+c;return await i.loadAsync(u)}else return a.data?{data:Eo(a.type,a.data),width:a.width,height:a.height}:null}if(e!==void 0&&e.length>0){i=new tl(this.manager),i.setCrossOrigin(this.crossOrigin);for(let a=0,c=e.length;a<c;a++){const u=e[a],h=u.url;if(Array.isArray(h)){const f=[];for(let p=0,m=h.length;p<m;p++){const g=h[p],y=await s(g);y!==null&&(y instanceof HTMLImageElement?f.push(y):f.push(new ji(y.data,y.width,y.height)))}n[u.uuid]=new Ss(f)}else{const f=await s(u.url);n[u.uuid]=new Ss(f)}}}return n}parseTextures(e,t){function n(s,a){return typeof s=="number"?s:(console.warn("THREE.ObjectLoader.parseTexture: Constant should be in numeric form.",s),a[s])}const i={};if(e!==void 0)for(let s=0,a=e.length;s<a;s++){const c=e[s];c.image===void 0&&console.warn('THREE.ObjectLoader: No "image" specified for',c.uuid),t[c.image]===void 0&&console.warn("THREE.ObjectLoader: Undefined image",c.image);const u=t[c.image],h=u.data;let f;Array.isArray(h)?(f=new al,h.length===6&&(f.needsUpdate=!0)):(h&&h.data?f=new ji:f=new Zt,h&&(f.needsUpdate=!0)),f.source=u,f.uuid=c.uuid,c.name!==void 0&&(f.name=c.name),c.mapping!==void 0&&(f.mapping=n(c.mapping,bb)),c.channel!==void 0&&(f.channel=c.channel),c.offset!==void 0&&f.offset.fromArray(c.offset),c.repeat!==void 0&&f.repeat.fromArray(c.repeat),c.center!==void 0&&f.center.fromArray(c.center),c.rotation!==void 0&&(f.rotation=c.rotation),c.wrap!==void 0&&(f.wrapS=n(c.wrap[0],$0),f.wrapT=n(c.wrap[1],$0)),c.format!==void 0&&(f.format=c.format),c.internalFormat!==void 0&&(f.internalFormat=c.internalFormat),c.type!==void 0&&(f.type=c.type),c.colorSpace!==void 0&&(f.colorSpace=c.colorSpace),c.minFilter!==void 0&&(f.minFilter=n(c.minFilter,ev)),c.magFilter!==void 0&&(f.magFilter=n(c.magFilter,ev)),c.anisotropy!==void 0&&(f.anisotropy=c.anisotropy),c.flipY!==void 0&&(f.flipY=c.flipY),c.generateMipmaps!==void 0&&(f.generateMipmaps=c.generateMipmaps),c.premultiplyAlpha!==void 0&&(f.premultiplyAlpha=c.premultiplyAlpha),c.unpackAlignment!==void 0&&(f.unpackAlignment=c.unpackAlignment),c.compareFunction!==void 0&&(f.compareFunction=c.compareFunction),c.userData!==void 0&&(f.userData=c.userData),i[c.uuid]=f}return i}parseObject(e,t,n,i,s){let a;function c(m){return t[m]===void 0&&console.warn("THREE.ObjectLoader: Undefined geometry",m),t[m]}function u(m){if(m!==void 0){if(Array.isArray(m)){const g=[];for(let y=0,M=m.length;y<M;y++){const x=m[y];n[x]===void 0&&console.warn("THREE.ObjectLoader: Undefined material",x),g.push(n[x])}return g}return n[m]===void 0&&console.warn("THREE.ObjectLoader: Undefined material",m),n[m]}}function h(m){return i[m]===void 0&&console.warn("THREE.ObjectLoader: Undefined texture",m),i[m]}let f,p;switch(e.type){case"Scene":a=new Up,e.background!==void 0&&(Number.isInteger(e.background)?a.background=new Ue(e.background):a.background=h(e.background)),e.environment!==void 0&&(a.environment=h(e.environment)),e.fog!==void 0&&(e.fog.type==="Fog"?a.fog=new Sh(e.fog.color,e.fog.near,e.fog.far):e.fog.type==="FogExp2"&&(a.fog=new xh(e.fog.color,e.fog.density)),e.fog.name!==""&&(a.fog.name=e.fog.name)),e.backgroundBlurriness!==void 0&&(a.backgroundBlurriness=e.backgroundBlurriness),e.backgroundIntensity!==void 0&&(a.backgroundIntensity=e.backgroundIntensity),e.backgroundRotation!==void 0&&a.backgroundRotation.fromArray(e.backgroundRotation),e.environmentIntensity!==void 0&&(a.environmentIntensity=e.environmentIntensity),e.environmentRotation!==void 0&&a.environmentRotation.fromArray(e.environmentRotation);break;case"PerspectiveCamera":a=new nn(e.fov,e.aspect,e.near,e.far),e.focus!==void 0&&(a.focus=e.focus),e.zoom!==void 0&&(a.zoom=e.zoom),e.filmGauge!==void 0&&(a.filmGauge=e.filmGauge),e.filmOffset!==void 0&&(a.filmOffset=e.filmOffset),e.view!==void 0&&(a.view=Object.assign({},e.view));break;case"OrthographicCamera":a=new Ns(e.left,e.right,e.top,e.bottom,e.near,e.far),e.zoom!==void 0&&(a.zoom=e.zoom),e.view!==void 0&&(a.view=Object.assign({},e.view));break;case"AmbientLight":a=new Iy(e.color,e.intensity);break;case"DirectionalLight":a=new Py(e.color,e.intensity),a.target=e.target||"";break;case"PointLight":a=new Ry(e.color,e.intensity,e.distance,e.decay);break;case"RectAreaLight":a=new Ly(e.color,e.intensity,e.width,e.height);break;case"SpotLight":a=new Cy(e.color,e.intensity,e.distance,e.angle,e.penumbra,e.decay),a.target=e.target||"";break;case"HemisphereLight":a=new by(e.color,e.groundColor,e.intensity);break;case"LightProbe":a=new Uy().fromJSON(e);break;case"SkinnedMesh":f=c(e.geometry),p=u(e.material),a=new Q_(f,p),e.bindMode!==void 0&&(a.bindMode=e.bindMode),e.bindMatrix!==void 0&&a.bindMatrix.fromArray(e.bindMatrix),e.skeleton!==void 0&&(a.skeleton=e.skeleton);break;case"Mesh":f=c(e.geometry),p=u(e.material),a=new Qt(f,p);break;case"InstancedMesh":f=c(e.geometry),p=u(e.material);const m=e.count,g=e.instanceMatrix,y=e.instanceColor;a=new $_(f,p,m),a.instanceMatrix=new Do(new Float32Array(g.array),16),y!==void 0&&(a.instanceColor=new Do(new Float32Array(y.array),y.itemSize));break;case"BatchedMesh":f=c(e.geometry),p=u(e.material),a=new ey(e.maxInstanceCount,e.maxVertexCount,e.maxIndexCount,p),a.geometry=f,a.perObjectFrustumCulled=e.perObjectFrustumCulled,a.sortObjects=e.sortObjects,a._drawRanges=e.drawRanges,a._reservedRanges=e.reservedRanges,a._visibility=e.visibility,a._active=e.active,a._bounds=e.bounds.map(M=>{const x=new pn;x.min.fromArray(M.boxMin),x.max.fromArray(M.boxMax);const _=new mn;return _.radius=M.sphereRadius,_.center.fromArray(M.sphereCenter),{boxInitialized:M.boxInitialized,box:x,sphereInitialized:M.sphereInitialized,sphere:_}}),a._maxInstanceCount=e.maxInstanceCount,a._maxVertexCount=e.maxVertexCount,a._maxIndexCount=e.maxIndexCount,a._geometryInitialized=e.geometryInitialized,a._geometryCount=e.geometryCount,a._matricesTexture=h(e.matricesTexture.uuid),e.colorsTexture!==void 0&&(a._colorsTexture=h(e.colorsTexture.uuid));break;case"LOD":a=new K_;break;case"Line":a=new Gr(c(e.geometry),u(e.material));break;case"LineLoop":a=new ty(c(e.geometry),u(e.material));break;case"LineSegments":a=new Ki(c(e.geometry),u(e.material));break;case"PointCloud":case"Points":a=new ny(c(e.geometry),u(e.material));break;case"Sprite":a=new J_(u(e.material));break;case"Group":a=new To;break;case"Bone":a=new Fp;break;default:a=new Ct}if(a.uuid=e.uuid,e.name!==void 0&&(a.name=e.name),e.matrix!==void 0?(a.matrix.fromArray(e.matrix),e.matrixAutoUpdate!==void 0&&(a.matrixAutoUpdate=e.matrixAutoUpdate),a.matrixAutoUpdate&&a.matrix.decompose(a.position,a.quaternion,a.scale)):(e.position!==void 0&&a.position.fromArray(e.position),e.rotation!==void 0&&a.rotation.fromArray(e.rotation),e.quaternion!==void 0&&a.quaternion.fromArray(e.quaternion),e.scale!==void 0&&a.scale.fromArray(e.scale)),e.up!==void 0&&a.up.fromArray(e.up),e.castShadow!==void 0&&(a.castShadow=e.castShadow),e.receiveShadow!==void 0&&(a.receiveShadow=e.receiveShadow),e.shadow&&(e.shadow.intensity!==void 0&&(a.shadow.intensity=e.shadow.intensity),e.shadow.bias!==void 0&&(a.shadow.bias=e.shadow.bias),e.shadow.normalBias!==void 0&&(a.shadow.normalBias=e.shadow.normalBias),e.shadow.radius!==void 0&&(a.shadow.radius=e.shadow.radius),e.shadow.mapSize!==void 0&&a.shadow.mapSize.fromArray(e.shadow.mapSize),e.shadow.camera!==void 0&&(a.shadow.camera=this.parseObject(e.shadow.camera))),e.visible!==void 0&&(a.visible=e.visible),e.frustumCulled!==void 0&&(a.frustumCulled=e.frustumCulled),e.renderOrder!==void 0&&(a.renderOrder=e.renderOrder),e.userData!==void 0&&(a.userData=e.userData),e.layers!==void 0&&(a.layers.mask=e.layers),e.children!==void 0){const m=e.children;for(let g=0;g<m.length;g++)a.add(this.parseObject(m[g],t,n,i,s))}if(e.animations!==void 0){const m=e.animations;for(let g=0;g<m.length;g++){const y=m[g];a.animations.push(s[y])}}if(e.type==="LOD"){e.autoUpdate!==void 0&&(a.autoUpdate=e.autoUpdate);const m=e.levels;for(let g=0;g<m.length;g++){const y=m[g],M=a.getObjectByProperty("uuid",y.object);M!==void 0&&a.addLevel(M,y.distance,y.hysteresis)}}return a}bindSkeletons(e,t){Object.keys(t).length!==0&&e.traverse(function(n){if(n.isSkinnedMesh===!0&&n.skeleton!==void 0){const i=t[n.skeleton];i===void 0?console.warn("THREE.ObjectLoader: No skeleton found with UUID:",n.skeleton):n.bind(i,n.bindMatrix)}})}bindLightTargets(e){e.traverse(function(t){if(t.isDirectionalLight||t.isSpotLight){const n=t.target,i=e.getObjectByProperty("uuid",n);i!==void 0?t.target=i:t.target=new Ct}})}}const bb={UVMapping:ch,CubeReflectionMapping:gr,CubeRefractionMapping:Vr,EquirectangularReflectionMapping:Oa,EquirectangularRefractionMapping:Ba,CubeUVReflectionMapping:No},$0={RepeatWrapping:Ps,ClampToEdgeWrapping:_i,MirroredRepeatWrapping:za},ev={NearestFilter:dn,NearestMipmapNearestFilter:pp,NearestMipmapLinearFilter:wo,LinearFilter:rn,LinearMipmapNearestFilter:ba,LinearMipmapLinearFilter:Xi};class Cb extends Jn{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=dr.get(e);if(a!==void 0){if(s.manager.itemStart(e),a.then){a.then(h=>{t&&t(h),s.manager.itemEnd(e)}).catch(h=>{i&&i(h)});return}return setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a}const c={};c.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",c.headers=this.requestHeader;const u=fetch(e,c).then(function(h){return h.blob()}).then(function(h){return createImageBitmap(h,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(h){return dr.add(e,h),t&&t(h),s.manager.itemEnd(e),h}).catch(function(h){i&&i(h),dr.remove(e),s.manager.itemError(e),s.manager.itemEnd(e)});dr.add(e,u),s.manager.itemStart(e)}}let eu;class Kp{static getContext(){return eu===void 0&&(eu=new(window.AudioContext||window.webkitAudioContext)),eu}static setContext(e){eu=e}}class Rb extends Jn{constructor(e){super(e)}load(e,t,n,i){const s=this,a=new _r(this.manager);a.setResponseType("arraybuffer"),a.setPath(this.path),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(u){try{const h=u.slice(0);Kp.getContext().decodeAudioData(h,function(p){t(p)}).catch(c)}catch(h){c(h)}},n,i);function c(u){i?i(u):console.error(u),s.manager.itemError(e)}}}const tv=new rt,nv=new rt,us=new rt;class Pb{constructor(){this.type="StereoCamera",this.aspect=1,this.eyeSep=.064,this.cameraL=new nn,this.cameraL.layers.enable(1),this.cameraL.matrixAutoUpdate=!1,this.cameraR=new nn,this.cameraR.layers.enable(2),this.cameraR.matrixAutoUpdate=!1,this._cache={focus:null,fov:null,aspect:null,near:null,far:null,zoom:null,eyeSep:null}}update(e){const t=this._cache;if(t.focus!==e.focus||t.fov!==e.fov||t.aspect!==e.aspect*this.aspect||t.near!==e.near||t.far!==e.far||t.zoom!==e.zoom||t.eyeSep!==this.eyeSep){t.focus=e.focus,t.fov=e.fov,t.aspect=e.aspect*this.aspect,t.near=e.near,t.far=e.far,t.zoom=e.zoom,t.eyeSep=this.eyeSep,us.copy(e.projectionMatrix);const i=t.eyeSep/2,s=i*t.near/t.focus,a=t.near*Math.tan(As*t.fov*.5)/t.zoom;let c,u;nv.elements[12]=-i,tv.elements[12]=i,c=-a*t.aspect+s,u=a*t.aspect+s,us.elements[0]=2*t.near/(u-c),us.elements[8]=(u+c)/(u-c),this.cameraL.projectionMatrix.copy(us),c=-a*t.aspect-s,u=a*t.aspect-s,us.elements[0]=2*t.near/(u-c),us.elements[8]=(u+c)/(u-c),this.cameraR.projectionMatrix.copy(us)}this.cameraL.matrixWorld.copy(e.matrixWorld).multiply(nv),this.cameraR.matrixWorld.copy(e.matrixWorld).multiply(tv)}}class Qp{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=iv(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=iv();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function iv(){return performance.now()}const hs=new D,rv=new jn,Ib=new D,fs=new D;class Lb extends Ct{constructor(){super(),this.type="AudioListener",this.context=Kp.getContext(),this.gain=this.context.createGain(),this.gain.connect(this.context.destination),this.filter=null,this.timeDelta=0,this._clock=new Qp}getInput(){return this.gain}removeFilter(){return this.filter!==null&&(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination),this.gain.connect(this.context.destination),this.filter=null),this}getFilter(){return this.filter}setFilter(e){return this.filter!==null?(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination)):this.gain.disconnect(this.context.destination),this.filter=e,this.gain.connect(this.filter),this.filter.connect(this.context.destination),this}getMasterVolume(){return this.gain.gain.value}setMasterVolume(e){return this.gain.gain.setTargetAtTime(e,this.context.currentTime,.01),this}updateMatrixWorld(e){super.updateMatrixWorld(e);const t=this.context.listener,n=this.up;if(this.timeDelta=this._clock.getDelta(),this.matrixWorld.decompose(hs,rv,Ib),fs.set(0,0,-1).applyQuaternion(rv),t.positionX){const i=this.context.currentTime+this.timeDelta;t.positionX.linearRampToValueAtTime(hs.x,i),t.positionY.linearRampToValueAtTime(hs.y,i),t.positionZ.linearRampToValueAtTime(hs.z,i),t.forwardX.linearRampToValueAtTime(fs.x,i),t.forwardY.linearRampToValueAtTime(fs.y,i),t.forwardZ.linearRampToValueAtTime(fs.z,i),t.upX.linearRampToValueAtTime(n.x,i),t.upY.linearRampToValueAtTime(n.y,i),t.upZ.linearRampToValueAtTime(n.z,i)}else t.setPosition(hs.x,hs.y,hs.z),t.setOrientation(fs.x,fs.y,fs.z,n.x,n.y,n.z)}}class Fy extends Ct{constructor(e){super(),this.type="Audio",this.listener=e,this.context=e.context,this.gain=this.context.createGain(),this.gain.connect(e.getInput()),this.autoplay=!1,this.buffer=null,this.detune=0,this.loop=!1,this.loopStart=0,this.loopEnd=0,this.offset=0,this.duration=void 0,this.playbackRate=1,this.isPlaying=!1,this.hasPlaybackControl=!0,this.source=null,this.sourceType="empty",this._startedAt=0,this._progress=0,this._connected=!1,this.filters=[]}getOutput(){return this.gain}setNodeSource(e){return this.hasPlaybackControl=!1,this.sourceType="audioNode",this.source=e,this.connect(),this}setMediaElementSource(e){return this.hasPlaybackControl=!1,this.sourceType="mediaNode",this.source=this.context.createMediaElementSource(e),this.connect(),this}setMediaStreamSource(e){return this.hasPlaybackControl=!1,this.sourceType="mediaStreamNode",this.source=this.context.createMediaStreamSource(e),this.connect(),this}setBuffer(e){return this.buffer=e,this.sourceType="buffer",this.autoplay&&this.play(),this}play(e=0){if(this.isPlaying===!0){console.warn("THREE.Audio: Audio is already playing.");return}if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}this._startedAt=this.context.currentTime+e;const t=this.context.createBufferSource();return t.buffer=this.buffer,t.loop=this.loop,t.loopStart=this.loopStart,t.loopEnd=this.loopEnd,t.onended=this.onEnded.bind(this),t.start(this._startedAt,this._progress+this.offset,this.duration),this.isPlaying=!0,this.source=t,this.setDetune(this.detune),this.setPlaybackRate(this.playbackRate),this.connect()}pause(){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this.isPlaying===!0&&(this._progress+=Math.max(this.context.currentTime-this._startedAt,0)*this.playbackRate,this.loop===!0&&(this._progress=this._progress%(this.duration||this.buffer.duration)),this.source.stop(),this.source.onended=null,this.isPlaying=!1),this}stop(e=0){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this._progress=0,this.source!==null&&(this.source.stop(this.context.currentTime+e),this.source.onended=null),this.isPlaying=!1,this}connect(){if(this.filters.length>0){this.source.connect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].connect(this.filters[e]);this.filters[this.filters.length-1].connect(this.getOutput())}else this.source.connect(this.getOutput());return this._connected=!0,this}disconnect(){if(this._connected!==!1){if(this.filters.length>0){this.source.disconnect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].disconnect(this.filters[e]);this.filters[this.filters.length-1].disconnect(this.getOutput())}else this.source.disconnect(this.getOutput());return this._connected=!1,this}}getFilters(){return this.filters}setFilters(e){return e||(e=[]),this._connected===!0?(this.disconnect(),this.filters=e.slice(),this.connect()):this.filters=e.slice(),this}setDetune(e){return this.detune=e,this.isPlaying===!0&&this.source.detune!==void 0&&this.source.detune.setTargetAtTime(this.detune,this.context.currentTime,.01),this}getDetune(){return this.detune}getFilter(){return this.getFilters()[0]}setFilter(e){return this.setFilters(e?[e]:[])}setPlaybackRate(e){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this.playbackRate=e,this.isPlaying===!0&&this.source.playbackRate.setTargetAtTime(this.playbackRate,this.context.currentTime,.01),this}getPlaybackRate(){return this.playbackRate}onEnded(){this.isPlaying=!1}getLoop(){return this.hasPlaybackControl===!1?(console.warn("THREE.Audio: this Audio has no playback control."),!1):this.loop}setLoop(e){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this.loop=e,this.isPlaying===!0&&(this.source.loop=this.loop),this}setLoopStart(e){return this.loopStart=e,this}setLoopEnd(e){return this.loopEnd=e,this}getVolume(){return this.gain.gain.value}setVolume(e){return this.gain.gain.setTargetAtTime(e,this.context.currentTime,.01),this}}const ds=new D,sv=new jn,Db=new D,ps=new D;class Ub extends Fy{constructor(e){super(e),this.panner=this.context.createPanner(),this.panner.panningModel="HRTF",this.panner.connect(this.gain)}connect(){super.connect(),this.panner.connect(this.gain)}disconnect(){super.disconnect(),this.panner.disconnect(this.gain)}getOutput(){return this.panner}getRefDistance(){return this.panner.refDistance}setRefDistance(e){return this.panner.refDistance=e,this}getRolloffFactor(){return this.panner.rolloffFactor}setRolloffFactor(e){return this.panner.rolloffFactor=e,this}getDistanceModel(){return this.panner.distanceModel}setDistanceModel(e){return this.panner.distanceModel=e,this}getMaxDistance(){return this.panner.maxDistance}setMaxDistance(e){return this.panner.maxDistance=e,this}setDirectionalCone(e,t,n){return this.panner.coneInnerAngle=e,this.panner.coneOuterAngle=t,this.panner.coneOuterGain=n,this}updateMatrixWorld(e){if(super.updateMatrixWorld(e),this.hasPlaybackControl===!0&&this.isPlaying===!1)return;this.matrixWorld.decompose(ds,sv,Db),ps.set(0,0,1).applyQuaternion(sv);const t=this.panner;if(t.positionX){const n=this.context.currentTime+this.listener.timeDelta;t.positionX.linearRampToValueAtTime(ds.x,n),t.positionY.linearRampToValueAtTime(ds.y,n),t.positionZ.linearRampToValueAtTime(ds.z,n),t.orientationX.linearRampToValueAtTime(ps.x,n),t.orientationY.linearRampToValueAtTime(ps.y,n),t.orientationZ.linearRampToValueAtTime(ps.z,n)}else t.setPosition(ds.x,ds.y,ds.z),t.setOrientation(ps.x,ps.y,ps.z)}}class Nb{constructor(e,t=2048){this.analyser=e.context.createAnalyser(),this.analyser.fftSize=t,this.data=new Uint8Array(this.analyser.frequencyBinCount),e.getOutput().connect(this.analyser)}getFrequencyData(){return this.analyser.getByteFrequencyData(this.data),this.data}getAverageFrequency(){let e=0;const t=this.getFrequencyData();for(let n=0;n<t.length;n++)e+=t[n];return e/t.length}}class Oy{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,s,a;switch(t){case"quaternion":i=this._slerp,s=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,s=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,s=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=s,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){const n=this.buffer,i=this.valueSize,s=e*i+i;let a=this.cumulativeWeight;if(a===0){for(let c=0;c!==i;++c)n[s+c]=n[c];a=t}else{a+=t;const c=t/a;this._mixBufferRegion(n,s,0,c,i)}this.cumulativeWeight=a}accumulateAdditive(e){const t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){const t=this.valueSize,n=this.buffer,i=e*t+t,s=this.cumulativeWeight,a=this.cumulativeWeightAdditive,c=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,s<1){const u=t*this._origIndex;this._mixBufferRegion(n,i,u,1-s,t)}a>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let u=t,h=t+t;u!==h;++u)if(n[u]!==n[u+t]){c.setValue(n,i);break}}saveOriginalState(){const e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let s=n,a=i;s!==a;++s)t[s]=t[i+s%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){const e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){const e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){const e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,s){if(i>=.5)for(let a=0;a!==s;++a)e[t+a]=e[n+a]}_slerp(e,t,n,i){jn.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,s){const a=this._workIndex*s;jn.multiplyQuaternionsFlat(e,a,e,t,e,n),jn.slerpFlat(e,t,e,t,e,a,i)}_lerp(e,t,n,i,s){const a=1-i;for(let c=0;c!==s;++c){const u=t+c;e[u]=e[u]*a+e[n+c]*i}}_lerpAdditive(e,t,n,i,s){for(let a=0;a!==s;++a){const c=t+a;e[c]=e[c]+e[n+a]*i}}}const $p="\\[\\]\\.:\\/",Fb=new RegExp("["+$p+"]","g"),em="[^"+$p+"]",Ob="[^"+$p.replace("\\.","")+"]",Bb=/((?:WC+[\/:])*)/.source.replace("WC",em),zb=/(WCOD+)?/.source.replace("WCOD",Ob),kb=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",em),Hb=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",em),Vb=new RegExp("^"+Bb+zb+kb+Hb+"$"),Gb=["material","materials","bones","map"];class Wb{constructor(e,t,n){const i=n||bt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class bt{constructor(e,t,n){this.path=t,this.parsedPath=n||bt.parseTrackName(t),this.node=bt.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new bt.Composite(e,t,n):new bt(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Fb,"")}static parseTrackName(e){const t=Vb.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const s=n.nodeName.substring(i+1);Gb.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(s){for(let a=0;a<s.length;a++){const c=s[a];if(c.name===t||c.uuid===t)return c;const u=n(c.children);if(u)return u}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let s=t.propertyIndex;if(e||(e=bt.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let h=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let f=0;f<e.length;f++)if(e[f].name===h){h=f;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(h!==void 0){if(e[h]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[h]}}const a=e[i];if(a===void 0){const h=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+h+"."+i+" but it wasn't found.",e);return}let c=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?c=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(c=this.Versioning.MatrixWorldNeedsUpdate);let u=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}u=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(u=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(u=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[u],this.setValue=this.SetterByBindingTypeAndVersioning[u][c]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}bt.Composite=Wb;bt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};bt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};bt.prototype.GetterByBindingType=[bt.prototype._getValue_direct,bt.prototype._getValue_array,bt.prototype._getValue_arrayElement,bt.prototype._getValue_toArray];bt.prototype.SetterByBindingTypeAndVersioning=[[bt.prototype._setValue_direct,bt.prototype._setValue_direct_setNeedsUpdate,bt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[bt.prototype._setValue_array,bt.prototype._setValue_array_setNeedsUpdate,bt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[bt.prototype._setValue_arrayElement,bt.prototype._setValue_arrayElement_setNeedsUpdate,bt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[bt.prototype._setValue_fromArray,bt.prototype._setValue_fromArray_setNeedsUpdate,bt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class Xb{constructor(){this.isAnimationObjectGroup=!0,this.uuid=oi(),this._objects=Array.prototype.slice.call(arguments),this.nCachedObjects_=0;const e={};this._indicesByUUID=e;for(let n=0,i=arguments.length;n!==i;++n)e[arguments[n].uuid]=n;this._paths=[],this._parsedPaths=[],this._bindings=[],this._bindingsIndicesByPath={};const t=this;this.stats={objects:{get total(){return t._objects.length},get inUse(){return this.total-t.nCachedObjects_}},get bindingsPerObject(){return t._bindings.length}}}add(){const e=this._objects,t=this._indicesByUUID,n=this._paths,i=this._parsedPaths,s=this._bindings,a=s.length;let c,u=e.length,h=this.nCachedObjects_;for(let f=0,p=arguments.length;f!==p;++f){const m=arguments[f],g=m.uuid;let y=t[g];if(y===void 0){y=u++,t[g]=y,e.push(m);for(let M=0,x=a;M!==x;++M)s[M].push(new bt(m,n[M],i[M]))}else if(y<h){c=e[y];const M=--h,x=e[M];t[x.uuid]=y,e[y]=x,t[g]=M,e[M]=m;for(let _=0,E=a;_!==E;++_){const w=s[_],T=w[M];let U=w[y];w[y]=T,U===void 0&&(U=new bt(m,n[_],i[_])),w[M]=U}}else e[y]!==c&&console.error("THREE.AnimationObjectGroup: Different objects with the same UUID detected. Clean the caches or recreate your infrastructure when reloading scenes.")}this.nCachedObjects_=h}remove(){const e=this._objects,t=this._indicesByUUID,n=this._bindings,i=n.length;let s=this.nCachedObjects_;for(let a=0,c=arguments.length;a!==c;++a){const u=arguments[a],h=u.uuid,f=t[h];if(f!==void 0&&f>=s){const p=s++,m=e[p];t[m.uuid]=f,e[f]=m,t[h]=p,e[p]=u;for(let g=0,y=i;g!==y;++g){const M=n[g],x=M[p],_=M[f];M[f]=x,M[p]=_}}}this.nCachedObjects_=s}uncache(){const e=this._objects,t=this._indicesByUUID,n=this._bindings,i=n.length;let s=this.nCachedObjects_,a=e.length;for(let c=0,u=arguments.length;c!==u;++c){const h=arguments[c],f=h.uuid,p=t[f];if(p!==void 0)if(delete t[f],p<s){const m=--s,g=e[m],y=--a,M=e[y];t[g.uuid]=p,e[p]=g,t[M.uuid]=m,e[m]=M,e.pop();for(let x=0,_=i;x!==_;++x){const E=n[x],w=E[m],T=E[y];E[p]=w,E[m]=T,E.pop()}}else{const m=--a,g=e[m];m>0&&(t[g.uuid]=p),e[p]=g,e.pop();for(let y=0,M=i;y!==M;++y){const x=n[y];x[p]=x[m],x.pop()}}}this.nCachedObjects_=s}subscribe_(e,t){const n=this._bindingsIndicesByPath;let i=n[e];const s=this._bindings;if(i!==void 0)return s[i];const a=this._paths,c=this._parsedPaths,u=this._objects,h=u.length,f=this.nCachedObjects_,p=new Array(h);i=s.length,n[e]=i,a.push(e),c.push(t),s.push(p);for(let m=f,g=u.length;m!==g;++m){const y=u[m];p[m]=new bt(y,e,t)}return p}unsubscribe_(e){const t=this._bindingsIndicesByPath,n=t[e];if(n!==void 0){const i=this._paths,s=this._parsedPaths,a=this._bindings,c=a.length-1,u=a[c],h=e[c];t[h]=n,a[n]=u,a.pop(),s[n]=s[c],s.pop(),i[n]=i[c],i.pop()}}}class By{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;const s=t.tracks,a=s.length,c=new Array(a),u={endingStart:ys,endingEnd:ys};for(let h=0;h!==a;++h){const f=s[h].createInterpolant(null);c[h]=f,f.settings=u}this._interpolantSettings=u,this._interpolants=c,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=x_,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n){if(e.fadeOut(t),this.fadeIn(t),n){const i=this._clip.duration,s=e._clip.duration,a=s/i,c=i/s;e.warp(1,a,t),this.warp(c,1,t)}return this}crossFadeTo(e,t,n){return e.crossFadeFrom(this,t,n)}stopFading(){const e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){const i=this._mixer,s=i.time,a=this.timeScale;let c=this._timeScaleInterpolant;c===null&&(c=i._lendControlInterpolant(),this._timeScaleInterpolant=c);const u=c.parameterPositions,h=c.sampleValues;return u[0]=s,u[1]=s+n,h[0]=e/a,h[1]=t/a,this}stopWarping(){const e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}const s=this._startTime;if(s!==null){const u=(e-s)*n;u<0||n===0?t=0:(this._startTime=null,t=n*u)}t*=this._updateTimeScale(e);const a=this._updateTime(t),c=this._updateWeight(e);if(c>0){const u=this._interpolants,h=this._propertyBindings;switch(this.blendMode){case Ep:for(let f=0,p=u.length;f!==p;++f)u[f].evaluate(a),h[f].accumulateAdditive(c);break;case gh:default:for(let f=0,p=u.length;f!==p;++f)u[f].evaluate(a),h[f].accumulate(i,c)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;const n=this._weightInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;const n=this._timeScaleInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){const t=this._clip.duration,n=this.loop;let i=this.time+e,s=this._loopCount;const a=n===S_;if(e===0)return s===-1?i:a&&(s&1)===1?t-i:i;if(n===y_){s===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(s===-1&&(e>=0?(s=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),i>=t||i<0){const c=Math.floor(i/t);i-=t*c,s+=Math.abs(c);const u=this.repetitions-s;if(u<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(u===1){const h=e<0;this._setEndings(h,!h,a)}else this._setEndings(!1,!1,a);this._loopCount=s,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:c})}}else this.time=i;if(a&&(s&1)===1)return t-i}return i}_setEndings(e,t,n){const i=this._interpolantSettings;n?(i.endingStart=xs,i.endingEnd=xs):(e?i.endingStart=this.zeroSlopeAtStart?xs:ys:i.endingStart=Ha,t?i.endingEnd=this.zeroSlopeAtEnd?xs:ys:i.endingEnd=Ha)}_scheduleFading(e,t,n){const i=this._mixer,s=i.time;let a=this._weightInterpolant;a===null&&(a=i._lendControlInterpolant(),this._weightInterpolant=a);const c=a.parameterPositions,u=a.sampleValues;return c[0]=s,u[0]=t,c[1]=s+e,u[1]=n,this}}const Yb=new Float32Array(1);class qb extends Ji{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){const n=e._localRoot||this._root,i=e._clip.tracks,s=i.length,a=e._propertyBindings,c=e._interpolants,u=n.uuid,h=this._bindingsByRootAndName;let f=h[u];f===void 0&&(f={},h[u]=f);for(let p=0;p!==s;++p){const m=i[p],g=m.name;let y=f[g];if(y!==void 0)++y.referenceCount,a[p]=y;else{if(y=a[p],y!==void 0){y._cacheIndex===null&&(++y.referenceCount,this._addInactiveBinding(y,u,g));continue}const M=t&&t._propertyBindings[p].binding.parsedPath;y=new Oy(bt.create(n,g,M),m.ValueTypeName,m.getValueSize()),++y.referenceCount,this._addInactiveBinding(y,u,g),a[p]=y}c[p].resultBuffer=y.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){const n=(e._localRoot||this._root).uuid,i=e._clip.uuid,s=this._actionsByClip[i];this._bindAction(e,s&&s.knownActions[0]),this._addInactiveAction(e,i,n)}const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];s.useCount++===0&&(this._lendBinding(s),s.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];--s.useCount===0&&(s.restoreOriginalState(),this._takeBackBinding(s))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;const e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){const t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){const i=this._actions,s=this._actionsByClip;let a=s[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,s[t]=a;else{const c=a.knownActions;e._byClipCacheIndex=c.length,c.push(e)}e._cacheIndex=i.length,i.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){const t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;const s=e._clip.uuid,a=this._actionsByClip,c=a[s],u=c.knownActions,h=u[u.length-1],f=e._byClipCacheIndex;h._byClipCacheIndex=f,u[f]=h,u.pop(),e._byClipCacheIndex=null;const p=c.actionByRoot,m=(e._localRoot||this._root).uuid;delete p[m],u.length===0&&delete a[s],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];--s.referenceCount===0&&this._removeInactiveBinding(s)}}_lendAction(e){const t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackAction(e){const t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_addInactiveBinding(e,t,n){const i=this._bindingsByRootAndName,s=this._bindings;let a=i[t];a===void 0&&(a={},i[t]=a),a[n]=e,e._cacheIndex=s.length,s.push(e)}_removeInactiveBinding(e){const t=this._bindings,n=e.binding,i=n.rootNode.uuid,s=n.path,a=this._bindingsByRootAndName,c=a[i],u=t[t.length-1],h=e._cacheIndex;u._cacheIndex=h,t[h]=u,t.pop(),delete c[s],Object.keys(c).length===0&&delete a[i]}_lendBinding(e){const t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackBinding(e){const t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_lendControlInterpolant(){const e=this._controlInterpolants,t=this._nActiveControlInterpolants++;let n=e[t];return n===void 0&&(n=new Yp(new Float32Array(2),new Float32Array(2),1,Yb),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){const t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,s=t[i];e.__cacheIndex=i,t[i]=e,s.__cacheIndex=n,t[n]=s}clipAction(e,t,n){const i=t||this._root,s=i.uuid;let a=typeof e=="string"?el.findByName(i,e):e;const c=a!==null?a.uuid:e,u=this._actionsByClip[c];let h=null;if(n===void 0&&(a!==null?n=a.blendMode:n=gh),u!==void 0){const p=u.actionByRoot[s];if(p!==void 0&&p.blendMode===n)return p;h=u.knownActions[0],a===null&&(a=h._clip)}if(a===null)return null;const f=new By(this,a,t,n);return this._bindAction(f,h),this._addInactiveAction(f,c,s),f}existingAction(e,t){const n=t||this._root,i=n.uuid,s=typeof e=="string"?el.findByName(n,e):e,a=s?s.uuid:e,c=this._actionsByClip[a];return c!==void 0&&c.actionByRoot[i]||null}stopAllAction(){const e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;const t=this._actions,n=this._nActiveActions,i=this.time+=e,s=Math.sign(e),a=this._accuIndex^=1;for(let h=0;h!==n;++h)t[h]._update(i,e,s,a);const c=this._bindings,u=this._nActiveBindings;for(let h=0;h!==u;++h)c[h].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){const t=this._actions,n=e.uuid,i=this._actionsByClip,s=i[n];if(s!==void 0){const a=s.knownActions;for(let c=0,u=a.length;c!==u;++c){const h=a[c];this._deactivateAction(h);const f=h._cacheIndex,p=t[t.length-1];h._cacheIndex=null,h._byClipCacheIndex=null,p._cacheIndex=f,t[f]=p,t.pop(),this._removeInactiveBindingsForAction(h)}delete i[n]}}uncacheRoot(e){const t=e.uuid,n=this._actionsByClip;for(const a in n){const c=n[a].actionByRoot,u=c[t];u!==void 0&&(this._deactivateAction(u),this._removeInactiveAction(u))}const i=this._bindingsByRootAndName,s=i[t];if(s!==void 0)for(const a in s){const c=s[a];c.restoreOriginalState(),this._removeInactiveBinding(c)}}uncacheAction(e,t){const n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}}class tm{constructor(e){this.value=e}clone(){return new tm(this.value.clone===void 0?this.value:this.value.clone())}}let jb=0;class Zb extends Ji{constructor(){super(),this.isUniformsGroup=!0,Object.defineProperty(this,"id",{value:jb++}),this.name="",this.usage=Xa,this.uniforms=[]}add(e){return this.uniforms.push(e),this}remove(e){const t=this.uniforms.indexOf(e);return t!==-1&&this.uniforms.splice(t,1),this}setName(e){return this.name=e,this}setUsage(e){return this.usage=e,this}dispose(){return this.dispatchEvent({type:"dispose"}),this}copy(e){this.name=e.name,this.usage=e.usage;const t=e.uniforms;this.uniforms.length=0;for(let n=0,i=t.length;n<i;n++){const s=Array.isArray(t[n])?t[n]:[t[n]];for(let a=0;a<s.length;a++)this.uniforms.push(s[a].clone())}return this}clone(){return new this.constructor().copy(this)}}class oh extends Mh{constructor(e,t,n=1){super(e,t),this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=n}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}clone(e){const t=super.clone(e);return t.meshPerAttribute=this.meshPerAttribute,t}toJSON(e){const t=super.toJSON(e);return t.isInstancedInterleavedBuffer=!0,t.meshPerAttribute=this.meshPerAttribute,t}}class Jb{constructor(e,t,n,i,s){this.isGLBufferAttribute=!0,this.name="",this.buffer=e,this.type=t,this.itemSize=n,this.elementSize=i,this.count=s,this.version=0}set needsUpdate(e){e===!0&&this.version++}setBuffer(e){return this.buffer=e,this}setType(e,t){return this.type=e,this.elementSize=t,this}setItemSize(e){return this.itemSize=e,this}setCount(e){return this.count=e,this}}const ov=new rt;class zy{constructor(e,t,n=0,i=1/0){this.ray=new Oo(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new Ts,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return ov.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(ov),this}intersectObject(e,t=!0,n=[]){return lp(e,this,n,t),n.sort(av),n}intersectObjects(e,t=!0,n=[]){for(let i=0,s=e.length;i<s;i++)lp(e[i],this,n,t);return n.sort(av),n}}function av(r,e){return r.distance-e.distance}function lp(r,e,t,n){let i=!0;if(r.layers.test(e.layers)&&r.raycast(e,t)===!1&&(i=!1),i===!0&&n===!0){const s=r.children;for(let a=0,c=s.length;a<c;a++)lp(s[a],e,t,!0)}}class Kb{constructor(e=1,t=0,n=0){return this.radius=e,this.phi=t,this.theta=n,this}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(jt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class Qb{constructor(e=1,t=0,n=0){return this.radius=e,this.theta=t,this.y=n,this}set(e,t,n){return this.radius=e,this.theta=t,this.y=n,this}copy(e){return this.radius=e.radius,this.theta=e.theta,this.y=e.y,this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+n*n),this.theta=Math.atan2(e,n),this.y=t,this}clone(){return new this.constructor().copy(this)}}class nm{constructor(e,t,n,i){nm.prototype.isMatrix2=!0,this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,i){const s=this.elements;return s[0]=e,s[2]=t,s[1]=n,s[3]=i,this}}const lv=new pe;class $b{constructor(e=new pe(1/0,1/0),t=new pe(-1/0,-1/0)){this.isBox2=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=lv.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=1/0,this.max.x=this.max.y=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y}getCenter(e){return this.isEmpty()?e.set(0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,lv).distanceTo(e)}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const cv=new D,tu=new D;class ky{constructor(e=new D,t=new D){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){cv.subVectors(e,this.start),tu.subVectors(this.end,this.start);const n=tu.dot(tu);let s=tu.dot(cv)/n;return t&&(s=jt(s,0,1)),s}closestPointToPoint(e,t,n){const i=this.closestPointToPointParameter(e,t);return this.delta(n).multiplyScalar(i).add(this.start)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}const uv=new D;class eC extends Ct{constructor(e,t){super(),this.light=e,this.matrixAutoUpdate=!1,this.color=t,this.type="SpotLightHelper";const n=new vt,i=[0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,-1,0,1,0,0,0,0,1,1,0,0,0,0,-1,1];for(let a=0,c=1,u=32;a<u;a++,c++){const h=a/u*Math.PI*2,f=c/u*Math.PI*2;i.push(Math.cos(h),Math.sin(h),1,Math.cos(f),Math.sin(f),1)}n.setAttribute("position",new je(i,3));const s=new kn({fog:!1,toneMapped:!1});this.cone=new Ki(n,s),this.add(this.cone),this.update()}dispose(){this.cone.geometry.dispose(),this.cone.material.dispose()}update(){this.light.updateWorldMatrix(!0,!1),this.light.target.updateWorldMatrix(!0,!1),this.parent?(this.parent.updateWorldMatrix(!0),this.matrix.copy(this.parent.matrixWorld).invert().multiply(this.light.matrixWorld)):this.matrix.copy(this.light.matrixWorld),this.matrixWorld.copy(this.light.matrixWorld);const e=this.light.distance?this.light.distance:1e3,t=e*Math.tan(this.light.angle);this.cone.scale.set(t,t,e),uv.setFromMatrixPosition(this.light.target.matrixWorld),this.cone.lookAt(uv),this.color!==void 0?this.cone.material.color.set(this.color):this.cone.material.color.copy(this.light.color)}}const Br=new D,nu=new rt,Ud=new rt;class tC extends Ki{constructor(e){const t=Hy(e),n=new vt,i=[],s=[],a=new Ue(0,0,1),c=new Ue(0,1,0);for(let h=0;h<t.length;h++){const f=t[h];f.parent&&f.parent.isBone&&(i.push(0,0,0),i.push(0,0,0),s.push(a.r,a.g,a.b),s.push(c.r,c.g,c.b))}n.setAttribute("position",new je(i,3)),n.setAttribute("color",new je(s,3));const u=new kn({vertexColors:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,transparent:!0});super(n,u),this.isSkeletonHelper=!0,this.type="SkeletonHelper",this.root=e,this.bones=t,this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1}updateMatrixWorld(e){const t=this.bones,n=this.geometry,i=n.getAttribute("position");Ud.copy(this.root.matrixWorld).invert();for(let s=0,a=0;s<t.length;s++){const c=t[s];c.parent&&c.parent.isBone&&(nu.multiplyMatrices(Ud,c.matrixWorld),Br.setFromMatrixPosition(nu),i.setXYZ(a,Br.x,Br.y,Br.z),nu.multiplyMatrices(Ud,c.parent.matrixWorld),Br.setFromMatrixPosition(nu),i.setXYZ(a+1,Br.x,Br.y,Br.z),a+=2)}n.getAttribute("position").needsUpdate=!0,super.updateMatrixWorld(e)}dispose(){this.geometry.dispose(),this.material.dispose()}}function Hy(r){const e=[];r.isBone===!0&&e.push(r);for(let t=0;t<r.children.length;t++)e.push.apply(e,Hy(r.children[t]));return e}class nC extends Qt{constructor(e,t,n){const i=new Vo(t,4,2),s=new Pi({wireframe:!0,fog:!1,toneMapped:!1});super(i,s),this.light=e,this.color=n,this.type="PointLightHelper",this.matrix=this.light.matrixWorld,this.matrixAutoUpdate=!1,this.update()}dispose(){this.geometry.dispose(),this.material.dispose()}update(){this.light.updateWorldMatrix(!0,!1),this.color!==void 0?this.material.color.set(this.color):this.material.color.copy(this.light.color)}}const iC=new D,hv=new Ue,fv=new Ue;class rC extends Ct{constructor(e,t,n){super(),this.light=e,this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.color=n,this.type="HemisphereLightHelper";const i=new hl(t);i.rotateY(Math.PI*.5),this.material=new Pi({wireframe:!0,fog:!1,toneMapped:!1}),this.color===void 0&&(this.material.vertexColors=!0);const s=i.getAttribute("position"),a=new Float32Array(s.count*3);i.setAttribute("color",new Ft(a,3)),this.add(new Qt(i,this.material)),this.update()}dispose(){this.children[0].geometry.dispose(),this.children[0].material.dispose()}update(){const e=this.children[0];if(this.color!==void 0)this.material.color.set(this.color);else{const t=e.geometry.getAttribute("color");hv.copy(this.light.color),fv.copy(this.light.groundColor);for(let n=0,i=t.count;n<i;n++){const s=n<i/2?hv:fv;t.setXYZ(n,s.r,s.g,s.b)}t.needsUpdate=!0}this.light.updateWorldMatrix(!0,!1),e.lookAt(iC.setFromMatrixPosition(this.light.matrixWorld).negate())}}class sC extends Ki{constructor(e=10,t=10,n=4473924,i=8947848){n=new Ue(n),i=new Ue(i);const s=t/2,a=e/t,c=e/2,u=[],h=[];for(let m=0,g=0,y=-c;m<=t;m++,y+=a){u.push(-c,0,y,c,0,y),u.push(y,0,-c,y,0,c);const M=m===s?n:i;M.toArray(h,g),g+=3,M.toArray(h,g),g+=3,M.toArray(h,g),g+=3,M.toArray(h,g),g+=3}const f=new vt;f.setAttribute("position",new je(u,3)),f.setAttribute("color",new je(h,3));const p=new kn({vertexColors:!0,toneMapped:!1});super(f,p),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class oC extends Ki{constructor(e=10,t=16,n=8,i=64,s=4473924,a=8947848){s=new Ue(s),a=new Ue(a);const c=[],u=[];if(t>1)for(let p=0;p<t;p++){const m=p/t*(Math.PI*2),g=Math.sin(m)*e,y=Math.cos(m)*e;c.push(0,0,0),c.push(g,0,y);const M=p&1?s:a;u.push(M.r,M.g,M.b),u.push(M.r,M.g,M.b)}for(let p=0;p<n;p++){const m=p&1?s:a,g=e-e/n*p;for(let y=0;y<i;y++){let M=y/i*(Math.PI*2),x=Math.sin(M)*g,_=Math.cos(M)*g;c.push(x,0,_),u.push(m.r,m.g,m.b),M=(y+1)/i*(Math.PI*2),x=Math.sin(M)*g,_=Math.cos(M)*g,c.push(x,0,_),u.push(m.r,m.g,m.b)}}const h=new vt;h.setAttribute("position",new je(c,3)),h.setAttribute("color",new je(u,3));const f=new kn({vertexColors:!0,toneMapped:!1});super(h,f),this.type="PolarGridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}const dv=new D,iu=new D,pv=new D;class aC extends Ct{constructor(e,t,n){super(),this.light=e,this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.color=n,this.type="DirectionalLightHelper",t===void 0&&(t=1);let i=new vt;i.setAttribute("position",new je([-t,t,0,t,t,0,t,-t,0,-t,-t,0,-t,t,0],3));const s=new kn({fog:!1,toneMapped:!1});this.lightPlane=new Gr(i,s),this.add(this.lightPlane),i=new vt,i.setAttribute("position",new je([0,0,0,0,0,1],3)),this.targetLine=new Gr(i,s),this.add(this.targetLine),this.update()}dispose(){this.lightPlane.geometry.dispose(),this.lightPlane.material.dispose(),this.targetLine.geometry.dispose(),this.targetLine.material.dispose()}update(){this.light.updateWorldMatrix(!0,!1),this.light.target.updateWorldMatrix(!0,!1),dv.setFromMatrixPosition(this.light.matrixWorld),iu.setFromMatrixPosition(this.light.target.matrixWorld),pv.subVectors(iu,dv),this.lightPlane.lookAt(iu),this.color!==void 0?(this.lightPlane.material.color.set(this.color),this.targetLine.material.color.set(this.color)):(this.lightPlane.material.color.copy(this.light.color),this.targetLine.material.color.copy(this.light.color)),this.targetLine.lookAt(iu),this.targetLine.scale.z=pv.length()}}const ru=new D,qt=new ol;class lC extends Ki{constructor(e){const t=new vt,n=new kn({color:16777215,vertexColors:!0,toneMapped:!1}),i=[],s=[],a={};c("n1","n2"),c("n2","n4"),c("n4","n3"),c("n3","n1"),c("f1","f2"),c("f2","f4"),c("f4","f3"),c("f3","f1"),c("n1","f1"),c("n2","f2"),c("n3","f3"),c("n4","f4"),c("p","n1"),c("p","n2"),c("p","n3"),c("p","n4"),c("u1","u2"),c("u2","u3"),c("u3","u1"),c("c","t"),c("p","c"),c("cn1","cn2"),c("cn3","cn4"),c("cf1","cf2"),c("cf3","cf4");function c(y,M){u(y),u(M)}function u(y){i.push(0,0,0),s.push(0,0,0),a[y]===void 0&&(a[y]=[]),a[y].push(i.length/3-1)}t.setAttribute("position",new je(i,3)),t.setAttribute("color",new je(s,3)),super(t,n),this.type="CameraHelper",this.camera=e,this.camera.updateProjectionMatrix&&this.camera.updateProjectionMatrix(),this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.pointMap=a,this.update();const h=new Ue(16755200),f=new Ue(16711680),p=new Ue(43775),m=new Ue(16777215),g=new Ue(3355443);this.setColors(h,f,p,m,g)}setColors(e,t,n,i,s){const c=this.geometry.getAttribute("color");c.setXYZ(0,e.r,e.g,e.b),c.setXYZ(1,e.r,e.g,e.b),c.setXYZ(2,e.r,e.g,e.b),c.setXYZ(3,e.r,e.g,e.b),c.setXYZ(4,e.r,e.g,e.b),c.setXYZ(5,e.r,e.g,e.b),c.setXYZ(6,e.r,e.g,e.b),c.setXYZ(7,e.r,e.g,e.b),c.setXYZ(8,e.r,e.g,e.b),c.setXYZ(9,e.r,e.g,e.b),c.setXYZ(10,e.r,e.g,e.b),c.setXYZ(11,e.r,e.g,e.b),c.setXYZ(12,e.r,e.g,e.b),c.setXYZ(13,e.r,e.g,e.b),c.setXYZ(14,e.r,e.g,e.b),c.setXYZ(15,e.r,e.g,e.b),c.setXYZ(16,e.r,e.g,e.b),c.setXYZ(17,e.r,e.g,e.b),c.setXYZ(18,e.r,e.g,e.b),c.setXYZ(19,e.r,e.g,e.b),c.setXYZ(20,e.r,e.g,e.b),c.setXYZ(21,e.r,e.g,e.b),c.setXYZ(22,e.r,e.g,e.b),c.setXYZ(23,e.r,e.g,e.b),c.setXYZ(24,t.r,t.g,t.b),c.setXYZ(25,t.r,t.g,t.b),c.setXYZ(26,t.r,t.g,t.b),c.setXYZ(27,t.r,t.g,t.b),c.setXYZ(28,t.r,t.g,t.b),c.setXYZ(29,t.r,t.g,t.b),c.setXYZ(30,t.r,t.g,t.b),c.setXYZ(31,t.r,t.g,t.b),c.setXYZ(32,n.r,n.g,n.b),c.setXYZ(33,n.r,n.g,n.b),c.setXYZ(34,n.r,n.g,n.b),c.setXYZ(35,n.r,n.g,n.b),c.setXYZ(36,n.r,n.g,n.b),c.setXYZ(37,n.r,n.g,n.b),c.setXYZ(38,i.r,i.g,i.b),c.setXYZ(39,i.r,i.g,i.b),c.setXYZ(40,s.r,s.g,s.b),c.setXYZ(41,s.r,s.g,s.b),c.setXYZ(42,s.r,s.g,s.b),c.setXYZ(43,s.r,s.g,s.b),c.setXYZ(44,s.r,s.g,s.b),c.setXYZ(45,s.r,s.g,s.b),c.setXYZ(46,s.r,s.g,s.b),c.setXYZ(47,s.r,s.g,s.b),c.setXYZ(48,s.r,s.g,s.b),c.setXYZ(49,s.r,s.g,s.b),c.needsUpdate=!0}update(){const e=this.geometry,t=this.pointMap,n=1,i=1;qt.projectionMatrixInverse.copy(this.camera.projectionMatrixInverse),Kt("c",t,e,qt,0,0,-1),Kt("t",t,e,qt,0,0,1),Kt("n1",t,e,qt,-n,-i,-1),Kt("n2",t,e,qt,n,-i,-1),Kt("n3",t,e,qt,-n,i,-1),Kt("n4",t,e,qt,n,i,-1),Kt("f1",t,e,qt,-n,-i,1),Kt("f2",t,e,qt,n,-i,1),Kt("f3",t,e,qt,-n,i,1),Kt("f4",t,e,qt,n,i,1),Kt("u1",t,e,qt,n*.7,i*1.1,-1),Kt("u2",t,e,qt,-n*.7,i*1.1,-1),Kt("u3",t,e,qt,0,i*2,-1),Kt("cf1",t,e,qt,-n,0,1),Kt("cf2",t,e,qt,n,0,1),Kt("cf3",t,e,qt,0,-i,1),Kt("cf4",t,e,qt,0,i,1),Kt("cn1",t,e,qt,-n,0,-1),Kt("cn2",t,e,qt,n,0,-1),Kt("cn3",t,e,qt,0,-i,-1),Kt("cn4",t,e,qt,0,i,-1),e.getAttribute("position").needsUpdate=!0}dispose(){this.geometry.dispose(),this.material.dispose()}}function Kt(r,e,t,n,i,s,a){ru.set(i,s,a).unproject(n);const c=e[r];if(c!==void 0){const u=t.getAttribute("position");for(let h=0,f=c.length;h<f;h++)u.setXYZ(c[h],ru.x,ru.y,ru.z)}}const su=new pn;class cC extends Ki{constructor(e,t=16776960){const n=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),i=new Float32Array(8*3),s=new vt;s.setIndex(new Ft(n,1)),s.setAttribute("position",new Ft(i,3)),super(s,new kn({color:t,toneMapped:!1})),this.object=e,this.type="BoxHelper",this.matrixAutoUpdate=!1,this.update()}update(e){if(e!==void 0&&console.warn("THREE.BoxHelper: .update() has no longer arguments."),this.object!==void 0&&su.setFromObject(this.object),su.isEmpty())return;const t=su.min,n=su.max,i=this.geometry.attributes.position,s=i.array;s[0]=n.x,s[1]=n.y,s[2]=n.z,s[3]=t.x,s[4]=n.y,s[5]=n.z,s[6]=t.x,s[7]=t.y,s[8]=n.z,s[9]=n.x,s[10]=t.y,s[11]=n.z,s[12]=n.x,s[13]=n.y,s[14]=t.z,s[15]=t.x,s[16]=n.y,s[17]=t.z,s[18]=t.x,s[19]=t.y,s[20]=t.z,s[21]=n.x,s[22]=t.y,s[23]=t.z,i.needsUpdate=!0,this.geometry.computeBoundingSphere()}setFromObject(e){return this.object=e,this.update(),this}copy(e,t){return super.copy(e,t),this.object=e.object,this}dispose(){this.geometry.dispose(),this.material.dispose()}}class uC extends Ki{constructor(e,t=16776960){const n=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),i=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],s=new vt;s.setIndex(new Ft(n,1)),s.setAttribute("position",new je(i,3)),super(s,new kn({color:t,toneMapped:!1})),this.box=e,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(e){const t=this.box;t.isEmpty()||(t.getCenter(this.position),t.getSize(this.scale),this.scale.multiplyScalar(.5),super.updateMatrixWorld(e))}dispose(){this.geometry.dispose(),this.material.dispose()}}class hC extends Gr{constructor(e,t=1,n=16776960){const i=n,s=[1,-1,0,-1,1,0,-1,-1,0,1,1,0,-1,1,0,-1,-1,0,1,-1,0,1,1,0],a=new vt;a.setAttribute("position",new je(s,3)),a.computeBoundingSphere(),super(a,new kn({color:i,toneMapped:!1})),this.type="PlaneHelper",this.plane=e,this.size=t;const c=[1,1,0,-1,1,0,-1,-1,0,1,1,0,-1,-1,0,1,-1,0],u=new vt;u.setAttribute("position",new je(c,3)),u.computeBoundingSphere(),this.add(new Qt(u,new Pi({color:i,opacity:.2,transparent:!0,depthWrite:!1,toneMapped:!1})))}updateMatrixWorld(e){this.position.set(0,0,0),this.scale.set(.5*this.size,.5*this.size,1),this.lookAt(this.plane.normal),this.translateZ(-this.plane.constant),super.updateMatrixWorld(e)}dispose(){this.geometry.dispose(),this.material.dispose(),this.children[0].geometry.dispose(),this.children[0].material.dispose()}}const mv=new D;let ou,Nd;class fC extends Ct{constructor(e=new D(0,0,1),t=new D(0,0,0),n=1,i=16776960,s=n*.2,a=s*.2){super(),this.type="ArrowHelper",ou===void 0&&(ou=new vt,ou.setAttribute("position",new je([0,0,0,0,1,0],3)),Nd=new xr(0,.5,1,5,1),Nd.translate(0,-.5,0)),this.position.copy(t),this.line=new Gr(ou,new kn({color:i,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new Qt(Nd,new Pi({color:i,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(e),this.setLength(n,s,a)}setDirection(e){if(e.y>.99999)this.quaternion.set(0,0,0,1);else if(e.y<-.99999)this.quaternion.set(1,0,0,0);else{mv.set(e.z,0,-e.x).normalize();const t=Math.acos(e.y);this.quaternion.setFromAxisAngle(mv,t)}}setLength(e,t=e*.2,n=t*.2){this.line.scale.set(1,Math.max(1e-4,e-t),1),this.line.updateMatrix(),this.cone.scale.set(n,t,n),this.cone.position.y=e,this.cone.updateMatrix()}setColor(e){this.line.material.color.set(e),this.cone.material.color.set(e)}copy(e){return super.copy(e,!1),this.line.copy(e.line),this.cone.copy(e.cone),this}dispose(){this.line.geometry.dispose(),this.line.material.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}}class dC extends Ki{constructor(e=1){const t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],n=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],i=new vt;i.setAttribute("position",new je(t,3)),i.setAttribute("color",new je(n,3));const s=new kn({vertexColors:!0,toneMapped:!1});super(i,s),this.type="AxesHelper"}setColors(e,t,n){const i=new Ue,s=this.geometry.attributes.color.array;return i.set(e),i.toArray(s,0),i.toArray(s,3),i.set(t),i.toArray(s,6),i.toArray(s,9),i.set(n),i.toArray(s,12),i.toArray(s,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}}class pC{constructor(){this.type="ShapePath",this.color=new Ue,this.subPaths=[],this.currentPath=null}moveTo(e,t){return this.currentPath=new ja,this.subPaths.push(this.currentPath),this.currentPath.moveTo(e,t),this}lineTo(e,t){return this.currentPath.lineTo(e,t),this}quadraticCurveTo(e,t,n,i){return this.currentPath.quadraticCurveTo(e,t,n,i),this}bezierCurveTo(e,t,n,i,s,a){return this.currentPath.bezierCurveTo(e,t,n,i,s,a),this}splineThru(e){return this.currentPath.splineThru(e),this}toShapes(e){function t(_){const E=[];for(let w=0,T=_.length;w<T;w++){const U=_[w],P=new Hr;P.curves=U.curves,E.push(P)}return E}function n(_,E){const w=E.length;let T=!1;for(let U=w-1,P=0;P<w;U=P++){let L=E[U],O=E[P],k=O.x-L.x,b=O.y-L.y;if(Math.abs(b)>Number.EPSILON){if(b<0&&(L=E[P],k=-k,O=E[U],b=-b),_.y<L.y||_.y>O.y)continue;if(_.y===L.y){if(_.x===L.x)return!0}else{const C=b*(_.x-L.x)-k*(_.y-L.y);if(C===0)return!0;if(C<0)continue;T=!T}}else{if(_.y!==L.y)continue;if(O.x<=_.x&&_.x<=L.x||L.x<=_.x&&_.x<=O.x)return!0}}return T}const i=Zi.isClockWise,s=this.subPaths;if(s.length===0)return[];let a,c,u;const h=[];if(s.length===1)return c=s[0],u=new Hr,u.curves=c.curves,h.push(u),h;let f=!i(s[0].getPoints());f=e?!f:f;const p=[],m=[];let g=[],y=0,M;m[y]=void 0,g[y]=[];for(let _=0,E=s.length;_<E;_++)c=s[_],M=c.getPoints(),a=i(M),a=e?!a:a,a?(!f&&m[y]&&y++,m[y]={s:new Hr,p:M},m[y].s.curves=c.curves,f&&y++,g[y]=[]):g[y].push({h:c,p:M[0]});if(!m[0])return t(s);if(m.length>1){let _=!1,E=0;for(let w=0,T=m.length;w<T;w++)p[w]=[];for(let w=0,T=m.length;w<T;w++){const U=g[w];for(let P=0;P<U.length;P++){const L=U[P];let O=!0;for(let k=0;k<m.length;k++)n(L.p,m[k].p)&&(w!==k&&E++,O?(O=!1,p[k].push(L)):_=!0);O&&p[w].push(L)}}E>0&&_===!1&&(g=p)}let x;for(let _=0,E=m.length;_<E;_++){u=m[_].s,h.push(u),x=g[_];for(let w=0,T=x.length;w<T;w++)u.holes.push(x[w].h)}return h}}class mC extends Ji{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}}class gC extends Ri{constructor(e=1,t=1,n=1,i={}){console.warn('THREE.WebGLMultipleRenderTargets has been deprecated and will be removed in r172. Use THREE.WebGLRenderTarget and set the "count" parameter to enable MRT.'),super(e,t,{...i,count:n}),this.isWebGLMultipleRenderTargets=!0}get texture(){return this.textures}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:nl}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=nl);const vC=Object.freeze(Object.defineProperty({__proto__:null,ACESFilmicToneMapping:dp,AddEquation:kr,AddOperation:h_,AdditiveAnimationBlendMode:Ep,AdditiveBlending:Fa,AgXToneMapping:g_,AlphaFormat:_p,AlwaysCompare:I_,AlwaysDepth:wu,AlwaysStencilFunc:Qd,AmbientLight:Iy,AnimationAction:By,AnimationClip:el,AnimationLoader:_b,AnimationMixer:qb,AnimationObjectGroup:Xb,AnimationUtils:pb,ArcCurve:iy,ArrayCamera:q_,ArrowHelper:fC,AttachedBindMode:Kd,Audio:Fy,AudioAnalyser:Nb,AudioContext:Kp,AudioListener:Lb,AudioLoader:Rb,AxesHelper:dC,BackSide:In,BasicDepthPacking:M_,BasicShadowMap:Xv,BatchedMesh:ey,Bone:Fp,BooleanKeyframeTrack:Fs,Box2:$b,Box3:pn,Box3Helper:uC,BoxGeometry:Xr,BoxHelper:cC,BufferAttribute:Ft,BufferGeometry:vt,BufferGeometryLoader:Ny,ByteType:mp,Cache:dr,Camera:ol,CameraHelper:lC,CanvasTexture:Bp,CapsuleGeometry:Th,CatmullRomCurve3:ry,CineonToneMapping:p_,CircleGeometry:bh,ClampToEdgeWrapping:_i,Clock:Qp,Color:Ue,ColorKeyframeTrack:qp,ColorManagement:Dt,CompressedArrayTexture:OT,CompressedCubeTexture:BT,CompressedTexture:Eh,CompressedTextureLoader:yb,ConeGeometry:ko,ConstantAlphaFactor:l_,ConstantColorFactor:o_,Controls:mC,CubeCamera:z_,CubeReflectionMapping:gr,CubeRefractionMapping:Vr,CubeTexture:al,CubeTextureLoader:xb,CubeUVReflectionMapping:No,CubicBezierCurve:kp,CubicBezierCurve3:sy,CubicInterpolant:wy,CullFaceBack:jd,CullFaceFront:Wv,CullFaceFrontBack:fS,CullFaceNone:Gv,Curve:Ii,CurvePath:ay,CustomBlending:Yv,CustomToneMapping:m_,CylinderGeometry:xr,Cylindrical:Qb,Data3DTexture:bp,DataArrayTexture:_h,DataTexture:ji,DataTextureLoader:Sb,DataUtils:TM,DecrementStencilOp:TS,DecrementWrapStencilOp:CS,DefaultLoadingManager:Ty,DepthFormat:Es,DepthStencilFormat:Ls,DepthTexture:Ip,DetachedBindMode:__,DirectionalLight:Py,DirectionalLightHelper:aC,DiscreteInterpolant:Ey,DisplayP3ColorSpace:vh,DodecahedronGeometry:Ch,DoubleSide:ri,DstAlphaFactor:t_,DstColorFactor:i_,DynamicCopyUsage:GS,DynamicDrawUsage:OS,DynamicReadUsage:kS,EdgesGeometry:ly,EllipseCurve:Ah,EqualCompare:b_,EqualDepth:Au,EqualStencilFunc:LS,EquirectangularReflectionMapping:Oa,EquirectangularRefractionMapping:Ba,Euler:ai,EventDispatcher:Ji,ExtrudeGeometry:Ph,FileLoader:_r,Float16BufferAttribute:LM,Float32BufferAttribute:je,FloatType:qn,Fog:Sh,FogExp2:xh,FramebufferTexture:FT,FrontSide:mr,Frustum:ll,GLBufferAttribute:Jb,GLSL1:XS,GLSL3:$d,GreaterCompare:C_,GreaterDepth:bu,GreaterEqualCompare:P_,GreaterEqualDepth:Tu,GreaterEqualStencilFunc:FS,GreaterStencilFunc:US,GridHelper:sC,Group:To,HalfFloatType:Fo,HemisphereLight:by,HemisphereLightHelper:rC,IcosahedronGeometry:Ih,ImageBitmapLoader:Cb,ImageLoader:tl,ImageUtils:N_,IncrementStencilOp:AS,IncrementWrapStencilOp:bS,InstancedBufferAttribute:Do,InstancedBufferGeometry:Jp,InstancedInterleavedBuffer:oh,InstancedMesh:$_,Int16BufferAttribute:PM,Int32BufferAttribute:IM,Int8BufferAttribute:bM,IntType:uh,InterleavedBuffer:Mh,InterleavedBufferAttribute:si,Interpolant:fl,InterpolateDiscrete:ka,InterpolateLinear:th,InterpolateSmooth:pu,InvertStencilOp:RS,KeepStencilOp:gs,KeyframeTrack:Li,LOD:K_,LatheGeometry:ul,Layers:Ts,LessCompare:T_,LessDepth:Eu,LessEqualCompare:Ap,LessEqualDepth:Rs,LessEqualStencilFunc:DS,LessStencilFunc:IS,Light:qr,LightProbe:Uy,Line:Gr,Line3:ky,LineBasicMaterial:kn,LineCurve:Hp,LineCurve3:oy,LineDashedMaterial:xy,LineLoop:ty,LineSegments:Ki,LinearDisplayP3ColorSpace:sl,LinearFilter:rn,LinearInterpolant:Yp,LinearMipMapLinearFilter:gS,LinearMipMapNearestFilter:mS,LinearMipmapLinearFilter:Xi,LinearMipmapNearestFilter:ba,LinearSRGBColorSpace:yr,LinearToneMapping:f_,LinearTransfer:Va,Loader:Jn,LoaderUtils:ap,LoadingManager:jp,LoopOnce:y_,LoopPingPong:S_,LoopRepeat:x_,LuminanceAlphaFormat:Sp,LuminanceFormat:xp,MOUSE:uS,Material:Ln,MaterialLoader:Oh,MathUtils:L_,Matrix2:nm,Matrix3:dt,Matrix4:rt,MaxEquation:Jv,Mesh:Qt,MeshBasicMaterial:Pi,MeshDepthMaterial:Lp,MeshDistanceMaterial:Dp,MeshLambertMaterial:_y,MeshMatcapMaterial:yy,MeshNormalMaterial:vy,MeshPhongMaterial:my,MeshPhysicalMaterial:py,MeshStandardMaterial:yi,MeshToonMaterial:gy,MinEquation:Zv,MirroredRepeatWrapping:za,MixOperation:u_,MultiplyBlending:Jd,MultiplyOperation:il,NearestFilter:dn,NearestMipMapLinearFilter:pS,NearestMipMapNearestFilter:dS,NearestMipmapLinearFilter:wo,NearestMipmapNearestFilter:pp,NeutralToneMapping:v_,NeverCompare:A_,NeverDepth:Mu,NeverStencilFunc:PS,NoBlending:pr,NoColorSpace:hr,NoToneMapping:qi,NormalAnimationBlendMode:gh,NormalBlending:ws,NotEqualCompare:R_,NotEqualDepth:Cu,NotEqualStencilFunc:NS,NumberKeyframeTrack:Qa,Object3D:Ct,ObjectLoader:Tb,ObjectSpaceNormalMap:E_,OctahedronGeometry:hl,OneFactor:Qv,OneMinusConstantAlphaFactor:c_,OneMinusConstantColorFactor:a_,OneMinusDstAlphaFactor:n_,OneMinusDstColorFactor:r_,OneMinusSrcAlphaFactor:Su,OneMinusSrcColorFactor:e_,OrthographicCamera:Ns,P3Primaries:Wa,PCFShadowMap:lh,PCFSoftShadowMap:Ta,PMREMGenerator:ep,Path:ja,PerspectiveCamera:nn,Plane:zr,PlaneGeometry:Bo,PlaneHelper:hC,PointLight:Ry,PointLightHelper:nC,Points:ny,PointsMaterial:Op,PolarGridHelper:oC,PolyhedronGeometry:Yr,PositionalAudio:Ub,PropertyBinding:bt,PropertyMixer:Oy,QuadraticBezierCurve:Vp,QuadraticBezierCurve3:cl,Quaternion:jn,QuaternionKeyframeTrack:dl,QuaternionLinearInterpolant:Ay,RED_GREEN_RGTC2_Format:$u,RED_RGTC1_Format:wp,REVISION:nl,RGBADepthPacking:w_,RGBAFormat:Pn,RGBAIntegerFormat:mh,RGBA_ASTC_10x10_Format:qu,RGBA_ASTC_10x5_Format:Wu,RGBA_ASTC_10x6_Format:Xu,RGBA_ASTC_10x8_Format:Yu,RGBA_ASTC_12x10_Format:ju,RGBA_ASTC_12x12_Format:Zu,RGBA_ASTC_4x4_Format:Fu,RGBA_ASTC_5x4_Format:Ou,RGBA_ASTC_5x5_Format:Bu,RGBA_ASTC_6x5_Format:zu,RGBA_ASTC_6x6_Format:ku,RGBA_ASTC_8x5_Format:Hu,RGBA_ASTC_8x6_Format:Vu,RGBA_ASTC_8x8_Format:Gu,RGBA_BPTC_Format:La,RGBA_ETC2_EAC_Format:Nu,RGBA_PVRTC_2BPPV1_Format:Lu,RGBA_PVRTC_4BPPV1_Format:Iu,RGBA_S3TC_DXT1_Format:Ra,RGBA_S3TC_DXT3_Format:Pa,RGBA_S3TC_DXT5_Format:Ia,RGBDepthPacking:SS,RGBFormat:yp,RGBIntegerFormat:vS,RGB_BPTC_SIGNED_Format:Ju,RGB_BPTC_UNSIGNED_Format:Ku,RGB_ETC1_Format:Du,RGB_ETC2_Format:Uu,RGB_PVRTC_2BPPV1_Format:Pu,RGB_PVRTC_4BPPV1_Format:Ru,RGB_S3TC_DXT1_Format:Ca,RGDepthPacking:MS,RGFormat:Mp,RGIntegerFormat:ph,RawShaderMaterial:dy,Ray:Oo,Raycaster:zy,Rec709Primaries:Ga,RectAreaLight:Ly,RedFormat:dh,RedIntegerFormat:rl,ReinhardToneMapping:d_,RenderTarget:F_,RepeatWrapping:Ps,ReplaceStencilOp:ES,ReverseSubtractEquation:jv,RingGeometry:Ho,SIGNED_RED_GREEN_RGTC2_Format:eh,SIGNED_RED_RGTC1_Format:Qu,SRGBColorSpace:Xn,SRGBTransfer:zt,Scene:Up,ShaderChunk:mt,ShaderLib:bi,ShaderMaterial:Zn,ShadowMaterial:fy,Shape:Hr,ShapeGeometry:Lh,ShapePath:pC,ShapeUtils:Zi,ShortType:gp,Skeleton:wh,SkeletonHelper:tC,SkinnedMesh:Q_,Source:Ss,Sphere:mn,SphereGeometry:Vo,Spherical:Kb,SphericalHarmonics3:Dy,SplineCurve:Gp,SpotLight:Cy,SpotLightHelper:eC,Sprite:J_,SpriteMaterial:Np,SrcAlphaFactor:xu,SrcAlphaSaturateFactor:s_,SrcColorFactor:$v,StaticCopyUsage:VS,StaticDrawUsage:Xa,StaticReadUsage:zS,StereoCamera:Pb,StreamCopyUsage:WS,StreamDrawUsage:BS,StreamReadUsage:HS,StringKeyframeTrack:Os,SubtractEquation:qv,SubtractiveBlending:Zd,TOUCH:hS,TangentSpaceNormalMap:Wr,TetrahedronGeometry:Dh,Texture:Zt,TextureLoader:Mb,TextureUtils:mT,TorusGeometry:Uh,TorusKnotGeometry:Nh,Triangle:Yn,TriangleFanDrawMode:xS,TriangleStripDrawMode:yS,TrianglesDrawMode:_S,TubeGeometry:Fh,UVMapping:ch,Uint16BufferAttribute:Cp,Uint32BufferAttribute:Rp,Uint8BufferAttribute:CM,Uint8ClampedBufferAttribute:RM,Uniform:tm,UniformsGroup:Zb,UniformsLib:be,UniformsUtils:nh,UnsignedByteType:Ci,UnsignedInt248Type:Is,UnsignedInt5999Type:vp,UnsignedIntType:vr,UnsignedShort4444Type:hh,UnsignedShort5551Type:fh,UnsignedShortType:Po,VSMShadowMap:Ti,Vector2:pe,Vector3:D,Vector4:xt,VectorKeyframeTrack:$a,VideoTexture:NT,WebGL3DRenderTarget:gM,WebGLArrayRenderTarget:mM,WebGLCoordinateSystem:Yi,WebGLCubeRenderTarget:k_,WebGLMultipleRenderTargets:gC,WebGLRenderTarget:Ri,WebGLRenderer:j_,WebGLUtils:Y_,WebGPUCoordinateSystem:Ya,WireframeGeometry:Wp,WrapAroundEnding:Ha,ZeroCurvatureEnding:ys,ZeroFactor:Kv,ZeroSlopeEnding:xs,ZeroStencilOp:wS,createCanvasElement:U_},Symbol.toStringTag,{value:"Module"}));var Vy={exports:{}},Bs={};/**
 * @license React
 * react-reconciler-constants.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */Bs.ConcurrentRoot=1;Bs.ContinuousEventPriority=4;Bs.DefaultEventPriority=16;Bs.DiscreteEventPriority=1;Bs.IdleEventPriority=536870912;Bs.LegacyRoot=0;Vy.exports=Bs;var Co=Vy.exports;function _C(r){let e;const t=new Set,n=(h,f)=>{const p=typeof h=="function"?h(e):h;if(p!==e){const m=e;e=f?p:Object.assign({},e,p),t.forEach(g=>g(e,m))}},i=()=>e,s=(h,f=i,p=Object.is)=>{console.warn("[DEPRECATED] Please use `subscribeWithSelector` middleware");let m=f(e);function g(){const y=f(e);if(!p(m,y)){const M=m;h(m=y,M)}}return t.add(g),()=>t.delete(g)},u={setState:n,getState:i,subscribe:(h,f,p)=>f||p?s(h,f,p):(t.add(h),()=>t.delete(h)),destroy:()=>t.clear()};return e=r(n,i,u),u}const yC=typeof window>"u"||!window.navigator||/ServerSideRendering|^Deno\//.test(window.navigator.userAgent),gv=yC?ie.useEffect:ie.useLayoutEffect;function xC(r){const e=typeof r=="function"?_C(r):r,t=(n=e.getState,i=Object.is)=>{const[,s]=ie.useReducer(x=>x+1,0),a=e.getState(),c=ie.useRef(a),u=ie.useRef(n),h=ie.useRef(i),f=ie.useRef(!1),p=ie.useRef();p.current===void 0&&(p.current=n(a));let m,g=!1;(c.current!==a||u.current!==n||h.current!==i||f.current)&&(m=n(a),g=!i(p.current,m)),gv(()=>{g&&(p.current=m),c.current=a,u.current=n,h.current=i,f.current=!1});const y=ie.useRef(a);gv(()=>{const x=()=>{try{const E=e.getState(),w=u.current(E);h.current(p.current,w)||(c.current=E,p.current=w,s())}catch{f.current=!0,s()}},_=e.subscribe(x);return e.getState()!==y.current&&x(),_},[]);const M=g?m:p.current;return ie.useDebugValue(M),M};return Object.assign(t,e),t[Symbol.iterator]=function(){console.warn("[useStore, api] = create() is deprecated and will be removed in v4");const n=[t,e];return{next(){const i=n.length<=0;return{value:n.shift(),done:i}}}},t}var Gy={exports:{}},Wy={exports:{}},Xy={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(r){function e(z,ae){var ee=z.length;z.push(ae);e:for(;0<ee;){var le=ee-1>>>1,Pe=z[le];if(0<i(Pe,ae))z[le]=ae,z[ee]=Pe,ee=le;else break e}}function t(z){return z.length===0?null:z[0]}function n(z){if(z.length===0)return null;var ae=z[0],ee=z.pop();if(ee!==ae){z[0]=ee;e:for(var le=0,Pe=z.length,Ne=Pe>>>1;le<Ne;){var ne=2*(le+1)-1,me=z[ne],Ce=ne+1,Ae=z[Ce];if(0>i(me,ee))Ce<Pe&&0>i(Ae,me)?(z[le]=Ae,z[Ce]=ee,le=Ce):(z[le]=me,z[ne]=ee,le=ne);else if(Ce<Pe&&0>i(Ae,ee))z[le]=Ae,z[Ce]=ee,le=Ce;else break e}}return ae}function i(z,ae){var ee=z.sortIndex-ae.sortIndex;return ee!==0?ee:z.id-ae.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;r.unstable_now=function(){return s.now()}}else{var a=Date,c=a.now();r.unstable_now=function(){return a.now()-c}}var u=[],h=[],f=1,p=null,m=3,g=!1,y=!1,M=!1,x=typeof setTimeout=="function"?setTimeout:null,_=typeof clearTimeout=="function"?clearTimeout:null,E=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function w(z){for(var ae=t(h);ae!==null;){if(ae.callback===null)n(h);else if(ae.startTime<=z)n(h),ae.sortIndex=ae.expirationTime,e(u,ae);else break;ae=t(h)}}function T(z){if(M=!1,w(z),!y)if(t(u)!==null)y=!0,j(U);else{var ae=t(h);ae!==null&&fe(T,ae.startTime-z)}}function U(z,ae){y=!1,M&&(M=!1,_(O),O=-1),g=!0;var ee=m;try{for(w(ae),p=t(u);p!==null&&(!(p.expirationTime>ae)||z&&!C());){var le=p.callback;if(typeof le=="function"){p.callback=null,m=p.priorityLevel;var Pe=le(p.expirationTime<=ae);ae=r.unstable_now(),typeof Pe=="function"?p.callback=Pe:p===t(u)&&n(u),w(ae)}else n(u);p=t(u)}if(p!==null)var Ne=!0;else{var ne=t(h);ne!==null&&fe(T,ne.startTime-ae),Ne=!1}return Ne}finally{p=null,m=ee,g=!1}}var P=!1,L=null,O=-1,k=5,b=-1;function C(){return!(r.unstable_now()-b<k)}function W(){if(L!==null){var z=r.unstable_now();b=z;var ae=!0;try{ae=L(!0,z)}finally{ae?q():(P=!1,L=null)}}else P=!1}var q;if(typeof E=="function")q=function(){E(W)};else if(typeof MessageChannel<"u"){var J=new MessageChannel,re=J.port2;J.port1.onmessage=W,q=function(){re.postMessage(null)}}else q=function(){x(W,0)};function j(z){L=z,P||(P=!0,q())}function fe(z,ae){O=x(function(){z(r.unstable_now())},ae)}r.unstable_IdlePriority=5,r.unstable_ImmediatePriority=1,r.unstable_LowPriority=4,r.unstable_NormalPriority=3,r.unstable_Profiling=null,r.unstable_UserBlockingPriority=2,r.unstable_cancelCallback=function(z){z.callback=null},r.unstable_continueExecution=function(){y||g||(y=!0,j(U))},r.unstable_forceFrameRate=function(z){0>z||125<z?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):k=0<z?Math.floor(1e3/z):5},r.unstable_getCurrentPriorityLevel=function(){return m},r.unstable_getFirstCallbackNode=function(){return t(u)},r.unstable_next=function(z){switch(m){case 1:case 2:case 3:var ae=3;break;default:ae=m}var ee=m;m=ae;try{return z()}finally{m=ee}},r.unstable_pauseExecution=function(){},r.unstable_requestPaint=function(){},r.unstable_runWithPriority=function(z,ae){switch(z){case 1:case 2:case 3:case 4:case 5:break;default:z=3}var ee=m;m=z;try{return ae()}finally{m=ee}},r.unstable_scheduleCallback=function(z,ae,ee){var le=r.unstable_now();switch(typeof ee=="object"&&ee!==null?(ee=ee.delay,ee=typeof ee=="number"&&0<ee?le+ee:le):ee=le,z){case 1:var Pe=-1;break;case 2:Pe=250;break;case 5:Pe=1073741823;break;case 4:Pe=1e4;break;default:Pe=5e3}return Pe=ee+Pe,z={id:f++,callback:ae,priorityLevel:z,startTime:ee,expirationTime:Pe,sortIndex:-1},ee>le?(z.sortIndex=ee,e(h,z),t(u)===null&&z===t(h)&&(M?(_(O),O=-1):M=!0,fe(T,ee-le))):(z.sortIndex=Pe,e(u,z),y||g||(y=!0,j(U))),z},r.unstable_shouldYield=C,r.unstable_wrapCallback=function(z){var ae=m;return function(){var ee=m;m=ae;try{return z.apply(this,arguments)}finally{m=ee}}}})(Xy);Wy.exports=Xy;var cp=Wy.exports;/**
 * @license React
 * react-reconciler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var SC=function(e){var t={},n=ie,i=cp,s=Object.assign;function a(o){for(var l="https://reactjs.org/docs/error-decoder.html?invariant="+o,d=1;d<arguments.length;d++)l+="&args[]="+encodeURIComponent(arguments[d]);return"Minified React error #"+o+"; visit "+l+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var c=n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,u=Symbol.for("react.element"),h=Symbol.for("react.portal"),f=Symbol.for("react.fragment"),p=Symbol.for("react.strict_mode"),m=Symbol.for("react.profiler"),g=Symbol.for("react.provider"),y=Symbol.for("react.context"),M=Symbol.for("react.forward_ref"),x=Symbol.for("react.suspense"),_=Symbol.for("react.suspense_list"),E=Symbol.for("react.memo"),w=Symbol.for("react.lazy"),T=Symbol.for("react.offscreen"),U=Symbol.iterator;function P(o){return o===null||typeof o!="object"?null:(o=U&&o[U]||o["@@iterator"],typeof o=="function"?o:null)}function L(o){if(o==null)return null;if(typeof o=="function")return o.displayName||o.name||null;if(typeof o=="string")return o;switch(o){case f:return"Fragment";case h:return"Portal";case m:return"Profiler";case p:return"StrictMode";case x:return"Suspense";case _:return"SuspenseList"}if(typeof o=="object")switch(o.$$typeof){case y:return(o.displayName||"Context")+".Consumer";case g:return(o._context.displayName||"Context")+".Provider";case M:var l=o.render;return o=o.displayName,o||(o=l.displayName||l.name||"",o=o!==""?"ForwardRef("+o+")":"ForwardRef"),o;case E:return l=o.displayName||null,l!==null?l:L(o.type)||"Memo";case w:l=o._payload,o=o._init;try{return L(o(l))}catch{}}return null}function O(o){var l=o.type;switch(o.tag){case 24:return"Cache";case 9:return(l.displayName||"Context")+".Consumer";case 10:return(l._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return o=l.render,o=o.displayName||o.name||"",l.displayName||(o!==""?"ForwardRef("+o+")":"ForwardRef");case 7:return"Fragment";case 5:return l;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return L(l);case 8:return l===p?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof l=="function")return l.displayName||l.name||null;if(typeof l=="string")return l}return null}function k(o){var l=o,d=o;if(o.alternate)for(;l.return;)l=l.return;else{o=l;do l=o,l.flags&4098&&(d=l.return),o=l.return;while(o)}return l.tag===3?d:null}function b(o){if(k(o)!==o)throw Error(a(188))}function C(o){var l=o.alternate;if(!l){if(l=k(o),l===null)throw Error(a(188));return l!==o?null:o}for(var d=o,v=l;;){var S=d.return;if(S===null)break;var A=S.alternate;if(A===null){if(v=S.return,v!==null){d=v;continue}break}if(S.child===A.child){for(A=S.child;A;){if(A===d)return b(S),o;if(A===v)return b(S),l;A=A.sibling}throw Error(a(188))}if(d.return!==v.return)d=S,v=A;else{for(var B=!1,H=S.child;H;){if(H===d){B=!0,d=S,v=A;break}if(H===v){B=!0,v=S,d=A;break}H=H.sibling}if(!B){for(H=A.child;H;){if(H===d){B=!0,d=A,v=S;break}if(H===v){B=!0,v=A,d=S;break}H=H.sibling}if(!B)throw Error(a(189))}}if(d.alternate!==v)throw Error(a(190))}if(d.tag!==3)throw Error(a(188));return d.stateNode.current===d?o:l}function W(o){return o=C(o),o!==null?q(o):null}function q(o){if(o.tag===5||o.tag===6)return o;for(o=o.child;o!==null;){var l=q(o);if(l!==null)return l;o=o.sibling}return null}function J(o){if(o.tag===5||o.tag===6)return o;for(o=o.child;o!==null;){if(o.tag!==4){var l=J(o);if(l!==null)return l}o=o.sibling}return null}var re=Array.isArray,j=e.getPublicInstance,fe=e.getRootHostContext,z=e.getChildHostContext,ae=e.prepareForCommit,ee=e.resetAfterCommit,le=e.createInstance,Pe=e.appendInitialChild,Ne=e.finalizeInitialChildren,ne=e.prepareUpdate,me=e.shouldSetTextContent,Ce=e.createTextInstance,Ae=e.scheduleTimeout,tt=e.cancelTimeout,nt=e.noTimeout,Ze=e.isPrimaryRenderer,Re=e.supportsMutation,he=e.supportsPersistence,N=e.supportsHydration,we=e.getInstanceFromNode,xe=e.preparePortalMount,ve=e.getCurrentEventPriority,Se=e.detachDeletedInstance,Je=e.supportsMicrotasks,Le=e.scheduleMicrotask,F=e.supportsTestSelectors,R=e.findFiberRoot,Z=e.getBoundingRect,ce=e.getTextContent,de=e.isHiddenSubtree,ue=e.matchAccessibilityRole,qe=e.setFocusIfFocusable,Ee=e.setupIntersectionObserver,ke=e.appendChild,St=e.appendChildToContainer,_e=e.commitTextUpdate,He=e.commitMount,at=e.commitUpdate,lt=e.insertBefore,Ve=e.insertInContainerBefore,Mt=e.removeChild,ut=e.removeChildFromContainer,Nt=e.resetTextContent,V=e.hideInstance,Be=e.hideTextInstance,se=e.unhideInstance,ge=e.unhideTextInstance,Fe=e.clearContainer,ze=e.cloneInstance,wt=e.createContainerChildSet,Gt=e.appendChildToContainerChildSet,Mn=e.finalizeContainerChildren,Et=e.replaceContainerChildren,gn=e.cloneHiddenInstance,li=e.cloneHiddenTextInstance,vl=e.canHydrateInstance,_l=e.canHydrateTextInstance,Qi=e.canHydrateSuspenseInstance,zs=e.isSuspenseInstancePending,ks=e.isSuspenseInstanceFallback,yl=e.registerSuspenseInstanceRetry,Di=e.getNextHydratableSibling,xl=e.getFirstHydratableChild,Hs=e.getFirstHydratableChildWithinContainer,Sl=e.getFirstHydratableChildWithinSuspenseInstance,Ml=e.hydrateInstance,Bh=e.hydrateTextInstance,zh=e.hydrateSuspenseInstance,kh=e.getNextHydratableInstanceAfterSuspenseInstance,I=e.commitHydratedContainer,G=e.commitHydratedSuspenseInstance,Q=e.clearSuspenseBoundary,$=e.clearSuspenseBoundaryFromContainer,Y=e.shouldDeleteUnhydratedTailInstances,Me=e.didNotMatchHydratedContainerTextInstance,Oe=e.didNotMatchHydratedTextInstance,Ge;function We(o){if(Ge===void 0)try{throw Error()}catch(d){var l=d.stack.trim().match(/\n( *(at )?)/);Ge=l&&l[1]||""}return`
`+Ge+o}var st=!1;function ot(o,l){if(!o||st)return"";st=!0;var d=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(l)if(l=function(){throw Error()},Object.defineProperty(l.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(l,[])}catch(ye){var v=ye}Reflect.construct(o,[],l)}else{try{l.call()}catch(ye){v=ye}o.call(l.prototype)}else{try{throw Error()}catch(ye){v=ye}o()}}catch(ye){if(ye&&v&&typeof ye.stack=="string"){for(var S=ye.stack.split(`
`),A=v.stack.split(`
`),B=S.length-1,H=A.length-1;1<=B&&0<=H&&S[B]!==A[H];)H--;for(;1<=B&&0<=H;B--,H--)if(S[B]!==A[H]){if(B!==1||H!==1)do if(B--,H--,0>H||S[B]!==A[H]){var oe=`
`+S[B].replace(" at new "," at ");return o.displayName&&oe.includes("<anonymous>")&&(oe=oe.replace("<anonymous>",o.displayName)),oe}while(1<=B&&0<=H);break}}}finally{st=!1,Error.prepareStackTrace=d}return(o=o?o.displayName||o.name:"")?We(o):""}var Ke=Object.prototype.hasOwnProperty,Tt=[],Rt=-1;function Ut(o){return{current:o}}function _t(o){0>Rt||(o.current=Tt[Rt],Tt[Rt]=null,Rt--)}function $e(o,l){Rt++,Tt[Rt]=o.current,o.current=l}var Ye={},At=Ut(Ye),ct=Ut(!1),sn=Ye;function Kn(o,l){var d=o.type.contextTypes;if(!d)return Ye;var v=o.stateNode;if(v&&v.__reactInternalMemoizedUnmaskedChildContext===l)return v.__reactInternalMemoizedMaskedChildContext;var S={},A;for(A in d)S[A]=l[A];return v&&(o=o.stateNode,o.__reactInternalMemoizedUnmaskedChildContext=l,o.__reactInternalMemoizedMaskedChildContext=S),S}function Ot(o){return o=o.childContextTypes,o!=null}function Sr(){_t(ct),_t(At)}function Ht(o,l,d){if(At.current!==Ye)throw Error(a(168));$e(At,l),$e(ct,d)}function xi(o,l,d){var v=o.stateNode;if(l=l.childContextTypes,typeof v.getChildContext!="function")return d;v=v.getChildContext();for(var S in v)if(!(S in l))throw Error(a(108,O(o)||"Unknown",S));return s({},d,v)}function Mr(o){return o=(o=o.stateNode)&&o.__reactInternalMemoizedMergedChildContext||Ye,sn=At.current,$e(At,o),$e(ct,ct.current),!0}function Dn(o,l,d){var v=o.stateNode;if(!v)throw Error(a(169));d?(o=xi(o,l,sn),v.__reactInternalMemoizedMergedChildContext=o,_t(ct),_t(At),$e(At,o)):_t(ct),$e(ct,d)}var Un=Math.clz32?Math.clz32:mx,Hh=Math.log,wl=Math.LN2;function mx(o){return o>>>=0,o===0?32:31-(Hh(o)/wl|0)|0}var El=64,Al=4194304;function Wo(o){switch(o&-o){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return o&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return o&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return o}}function Tl(o,l){var d=o.pendingLanes;if(d===0)return 0;var v=0,S=o.suspendedLanes,A=o.pingedLanes,B=d&268435455;if(B!==0){var H=B&~S;H!==0?v=Wo(H):(A&=B,A!==0&&(v=Wo(A)))}else B=d&~S,B!==0?v=Wo(B):A!==0&&(v=Wo(A));if(v===0)return 0;if(l!==0&&l!==v&&!(l&S)&&(S=v&-v,A=l&-l,S>=A||S===16&&(A&4194240)!==0))return l;if(v&4&&(v|=d&16),l=o.entangledLanes,l!==0)for(o=o.entanglements,l&=v;0<l;)d=31-Un(l),S=1<<d,v|=o[d],l&=~S;return v}function gx(o,l){switch(o){case 1:case 2:case 4:return l+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return l+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function vx(o,l){for(var d=o.suspendedLanes,v=o.pingedLanes,S=o.expirationTimes,A=o.pendingLanes;0<A;){var B=31-Un(A),H=1<<B,oe=S[B];oe===-1?(!(H&d)||H&v)&&(S[B]=gx(H,l)):oe<=l&&(o.expiredLanes|=H),A&=~H}}function Vh(o){return o=o.pendingLanes&-1073741825,o!==0?o:o&1073741824?1073741824:0}function Gh(o){for(var l=[],d=0;31>d;d++)l.push(o);return l}function Xo(o,l,d){o.pendingLanes|=l,l!==536870912&&(o.suspendedLanes=0,o.pingedLanes=0),o=o.eventTimes,l=31-Un(l),o[l]=d}function _x(o,l){var d=o.pendingLanes&~l;o.pendingLanes=l,o.suspendedLanes=0,o.pingedLanes=0,o.expiredLanes&=l,o.mutableReadLanes&=l,o.entangledLanes&=l,l=o.entanglements;var v=o.eventTimes;for(o=o.expirationTimes;0<d;){var S=31-Un(d),A=1<<S;l[S]=0,v[S]=-1,o[S]=-1,d&=~A}}function Wh(o,l){var d=o.entangledLanes|=l;for(o=o.entanglements;d;){var v=31-Un(d),S=1<<v;S&l|o[v]&l&&(o[v]|=l),d&=~S}}var Pt=0;function lm(o){return o&=-o,1<o?4<o?o&268435455?16:536870912:4:1}var Xh=i.unstable_scheduleCallback,cm=i.unstable_cancelCallback,yx=i.unstable_shouldYield,xx=i.unstable_requestPaint,cn=i.unstable_now,Yh=i.unstable_ImmediatePriority,Sx=i.unstable_UserBlockingPriority,qh=i.unstable_NormalPriority,Mx=i.unstable_IdlePriority,bl=null,Ui=null;function wx(o){if(Ui&&typeof Ui.onCommitFiberRoot=="function")try{Ui.onCommitFiberRoot(bl,o,void 0,(o.current.flags&128)===128)}catch{}}function Ex(o,l){return o===l&&(o!==0||1/o===1/l)||o!==o&&l!==l}var Ni=typeof Object.is=="function"?Object.is:Ex,$i=null,Cl=!1,jh=!1;function um(o){$i===null?$i=[o]:$i.push(o)}function Ax(o){Cl=!0,um(o)}function Fi(){if(!jh&&$i!==null){jh=!0;var o=0,l=Pt;try{var d=$i;for(Pt=1;o<d.length;o++){var v=d[o];do v=v(!0);while(v!==null)}$i=null,Cl=!1}catch(S){throw $i!==null&&($i=$i.slice(o+1)),Xh(Yh,Fi),S}finally{Pt=l,jh=!1}}return null}var Tx=c.ReactCurrentBatchConfig;function Rl(o,l){if(Ni(o,l))return!0;if(typeof o!="object"||o===null||typeof l!="object"||l===null)return!1;var d=Object.keys(o),v=Object.keys(l);if(d.length!==v.length)return!1;for(v=0;v<d.length;v++){var S=d[v];if(!Ke.call(l,S)||!Ni(o[S],l[S]))return!1}return!0}function bx(o){switch(o.tag){case 5:return We(o.type);case 16:return We("Lazy");case 13:return We("Suspense");case 19:return We("SuspenseList");case 0:case 2:case 15:return o=ot(o.type,!1),o;case 11:return o=ot(o.type.render,!1),o;case 1:return o=ot(o.type,!0),o;default:return""}}function Si(o,l){if(o&&o.defaultProps){l=s({},l),o=o.defaultProps;for(var d in o)l[d]===void 0&&(l[d]=o[d]);return l}return l}var Pl=Ut(null),Il=null,Vs=null,Zh=null;function Jh(){Zh=Vs=Il=null}function hm(o,l,d){Ze?($e(Pl,l._currentValue),l._currentValue=d):($e(Pl,l._currentValue2),l._currentValue2=d)}function Kh(o){var l=Pl.current;_t(Pl),Ze?o._currentValue=l:o._currentValue2=l}function Qh(o,l,d){for(;o!==null;){var v=o.alternate;if((o.childLanes&l)!==l?(o.childLanes|=l,v!==null&&(v.childLanes|=l)):v!==null&&(v.childLanes&l)!==l&&(v.childLanes|=l),o===d)break;o=o.return}}function Gs(o,l){Il=o,Zh=Vs=null,o=o.dependencies,o!==null&&o.firstContext!==null&&(o.lanes&l&&(ei=!0),o.firstContext=null)}function ci(o){var l=Ze?o._currentValue:o._currentValue2;if(Zh!==o)if(o={context:o,memoizedValue:l,next:null},Vs===null){if(Il===null)throw Error(a(308));Vs=o,Il.dependencies={lanes:0,firstContext:o}}else Vs=Vs.next=o;return l}var Oi=null,wr=!1;function $h(o){o.updateQueue={baseState:o.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function fm(o,l){o=o.updateQueue,l.updateQueue===o&&(l.updateQueue={baseState:o.baseState,firstBaseUpdate:o.firstBaseUpdate,lastBaseUpdate:o.lastBaseUpdate,shared:o.shared,effects:o.effects})}function er(o,l){return{eventTime:o,lane:l,tag:0,payload:null,callback:null,next:null}}function Er(o,l){var d=o.updateQueue;d!==null&&(d=d.shared,$t!==null&&o.mode&1&&!(yt&2)?(o=d.interleaved,o===null?(l.next=l,Oi===null?Oi=[d]:Oi.push(d)):(l.next=o.next,o.next=l),d.interleaved=l):(o=d.pending,o===null?l.next=l:(l.next=o.next,o.next=l),d.pending=l))}function Ll(o,l,d){if(l=l.updateQueue,l!==null&&(l=l.shared,(d&4194240)!==0)){var v=l.lanes;v&=o.pendingLanes,d|=v,l.lanes=d,Wh(o,d)}}function dm(o,l){var d=o.updateQueue,v=o.alternate;if(v!==null&&(v=v.updateQueue,d===v)){var S=null,A=null;if(d=d.firstBaseUpdate,d!==null){do{var B={eventTime:d.eventTime,lane:d.lane,tag:d.tag,payload:d.payload,callback:d.callback,next:null};A===null?S=A=B:A=A.next=B,d=d.next}while(d!==null);A===null?S=A=l:A=A.next=l}else S=A=l;d={baseState:v.baseState,firstBaseUpdate:S,lastBaseUpdate:A,shared:v.shared,effects:v.effects},o.updateQueue=d;return}o=d.lastBaseUpdate,o===null?d.firstBaseUpdate=l:o.next=l,d.lastBaseUpdate=l}function Dl(o,l,d,v){var S=o.updateQueue;wr=!1;var A=S.firstBaseUpdate,B=S.lastBaseUpdate,H=S.shared.pending;if(H!==null){S.shared.pending=null;var oe=H,ye=oe.next;oe.next=null,B===null?A=ye:B.next=ye,B=oe;var Xe=o.alternate;Xe!==null&&(Xe=Xe.updateQueue,H=Xe.lastBaseUpdate,H!==B&&(H===null?Xe.firstBaseUpdate=ye:H.next=ye,Xe.lastBaseUpdate=oe))}if(A!==null){var ht=S.baseState;B=0,Xe=ye=oe=null,H=A;do{var it=H.lane,Bt=H.eventTime;if((v&it)===it){Xe!==null&&(Xe=Xe.next={eventTime:Bt,lane:0,tag:H.tag,payload:H.payload,callback:H.callback,next:null});e:{var et=o,Tn=H;switch(it=l,Bt=d,Tn.tag){case 1:if(et=Tn.payload,typeof et=="function"){ht=et.call(Bt,ht,it);break e}ht=et;break e;case 3:et.flags=et.flags&-65537|128;case 0:if(et=Tn.payload,it=typeof et=="function"?et.call(Bt,ht,it):et,it==null)break e;ht=s({},ht,it);break e;case 2:wr=!0}}H.callback!==null&&H.lane!==0&&(o.flags|=64,it=S.effects,it===null?S.effects=[H]:it.push(H))}else Bt={eventTime:Bt,lane:it,tag:H.tag,payload:H.payload,callback:H.callback,next:null},Xe===null?(ye=Xe=Bt,oe=ht):Xe=Xe.next=Bt,B|=it;if(H=H.next,H===null){if(H=S.shared.pending,H===null)break;it=H,H=it.next,it.next=null,S.lastBaseUpdate=it,S.shared.pending=null}}while(!0);if(Xe===null&&(oe=ht),S.baseState=oe,S.firstBaseUpdate=ye,S.lastBaseUpdate=Xe,l=S.shared.interleaved,l!==null){S=l;do B|=S.lane,S=S.next;while(S!==l)}else A===null&&(S.shared.lanes=0);Qs|=B,o.lanes=B,o.memoizedState=ht}}function pm(o,l,d){if(o=l.effects,l.effects=null,o!==null)for(l=0;l<o.length;l++){var v=o[l],S=v.callback;if(S!==null){if(v.callback=null,v=d,typeof S!="function")throw Error(a(191,S));S.call(v)}}}var mm=new n.Component().refs;function ef(o,l,d,v){l=o.memoizedState,d=d(v,l),d=d==null?l:s({},l,d),o.memoizedState=d,o.lanes===0&&(o.updateQueue.baseState=d)}var Ul={isMounted:function(o){return(o=o._reactInternals)?k(o)===o:!1},enqueueSetState:function(o,l,d){o=o._reactInternals;var v=Fn(),S=br(o),A=er(v,S);A.payload=l,d!=null&&(A.callback=d),Er(o,A),l=pi(o,S,v),l!==null&&Ll(l,o,S)},enqueueReplaceState:function(o,l,d){o=o._reactInternals;var v=Fn(),S=br(o),A=er(v,S);A.tag=1,A.payload=l,d!=null&&(A.callback=d),Er(o,A),l=pi(o,S,v),l!==null&&Ll(l,o,S)},enqueueForceUpdate:function(o,l){o=o._reactInternals;var d=Fn(),v=br(o),S=er(d,v);S.tag=2,l!=null&&(S.callback=l),Er(o,S),l=pi(o,v,d),l!==null&&Ll(l,o,v)}};function gm(o,l,d,v,S,A,B){return o=o.stateNode,typeof o.shouldComponentUpdate=="function"?o.shouldComponentUpdate(v,A,B):l.prototype&&l.prototype.isPureReactComponent?!Rl(d,v)||!Rl(S,A):!0}function vm(o,l,d){var v=!1,S=Ye,A=l.contextType;return typeof A=="object"&&A!==null?A=ci(A):(S=Ot(l)?sn:At.current,v=l.contextTypes,A=(v=v!=null)?Kn(o,S):Ye),l=new l(d,A),o.memoizedState=l.state!==null&&l.state!==void 0?l.state:null,l.updater=Ul,o.stateNode=l,l._reactInternals=o,v&&(o=o.stateNode,o.__reactInternalMemoizedUnmaskedChildContext=S,o.__reactInternalMemoizedMaskedChildContext=A),l}function _m(o,l,d,v){o=l.state,typeof l.componentWillReceiveProps=="function"&&l.componentWillReceiveProps(d,v),typeof l.UNSAFE_componentWillReceiveProps=="function"&&l.UNSAFE_componentWillReceiveProps(d,v),l.state!==o&&Ul.enqueueReplaceState(l,l.state,null)}function tf(o,l,d,v){var S=o.stateNode;S.props=d,S.state=o.memoizedState,S.refs=mm,$h(o);var A=l.contextType;typeof A=="object"&&A!==null?S.context=ci(A):(A=Ot(l)?sn:At.current,S.context=Kn(o,A)),S.state=o.memoizedState,A=l.getDerivedStateFromProps,typeof A=="function"&&(ef(o,l,A,d),S.state=o.memoizedState),typeof l.getDerivedStateFromProps=="function"||typeof S.getSnapshotBeforeUpdate=="function"||typeof S.UNSAFE_componentWillMount!="function"&&typeof S.componentWillMount!="function"||(l=S.state,typeof S.componentWillMount=="function"&&S.componentWillMount(),typeof S.UNSAFE_componentWillMount=="function"&&S.UNSAFE_componentWillMount(),l!==S.state&&Ul.enqueueReplaceState(S,S.state,null),Dl(o,d,S,v),S.state=o.memoizedState),typeof S.componentDidMount=="function"&&(o.flags|=4194308)}var Ws=[],Xs=0,Nl=null,Fl=0,ui=[],hi=0,jr=null,tr=1,nr="";function Zr(o,l){Ws[Xs++]=Fl,Ws[Xs++]=Nl,Nl=o,Fl=l}function ym(o,l,d){ui[hi++]=tr,ui[hi++]=nr,ui[hi++]=jr,jr=o;var v=tr;o=nr;var S=32-Un(v)-1;v&=~(1<<S),d+=1;var A=32-Un(l)+S;if(30<A){var B=S-S%5;A=(v&(1<<B)-1).toString(32),v>>=B,S-=B,tr=1<<32-Un(l)+S|d<<S|v,nr=A+o}else tr=1<<A|d<<S|v,nr=o}function nf(o){o.return!==null&&(Zr(o,1),ym(o,1,0))}function rf(o){for(;o===Nl;)Nl=Ws[--Xs],Ws[Xs]=null,Fl=Ws[--Xs],Ws[Xs]=null;for(;o===jr;)jr=ui[--hi],ui[hi]=null,nr=ui[--hi],ui[hi]=null,tr=ui[--hi],ui[hi]=null}var Qn=null,$n=null,Vt=!1,Yo=!1,Mi=null;function xm(o,l){var d=mi(5,null,null,0);d.elementType="DELETED",d.stateNode=l,d.return=o,l=o.deletions,l===null?(o.deletions=[d],o.flags|=16):l.push(d)}function Sm(o,l){switch(o.tag){case 5:return l=vl(l,o.type,o.pendingProps),l!==null?(o.stateNode=l,Qn=o,$n=xl(l),!0):!1;case 6:return l=_l(l,o.pendingProps),l!==null?(o.stateNode=l,Qn=o,$n=null,!0):!1;case 13:if(l=Qi(l),l!==null){var d=jr!==null?{id:tr,overflow:nr}:null;return o.memoizedState={dehydrated:l,treeContext:d,retryLane:1073741824},d=mi(18,null,null,0),d.stateNode=l,d.return=o,o.child=d,Qn=o,$n=null,!0}return!1;default:return!1}}function sf(o){return(o.mode&1)!==0&&(o.flags&128)===0}function of(o){if(Vt){var l=$n;if(l){var d=l;if(!Sm(o,l)){if(sf(o))throw Error(a(418));l=Di(d);var v=Qn;l&&Sm(o,l)?xm(v,d):(o.flags=o.flags&-4097|2,Vt=!1,Qn=o)}}else{if(sf(o))throw Error(a(418));o.flags=o.flags&-4097|2,Vt=!1,Qn=o}}}function Mm(o){for(o=o.return;o!==null&&o.tag!==5&&o.tag!==3&&o.tag!==13;)o=o.return;Qn=o}function qo(o){if(!N||o!==Qn)return!1;if(!Vt)return Mm(o),Vt=!0,!1;if(o.tag!==3&&(o.tag!==5||Y(o.type)&&!me(o.type,o.memoizedProps))){var l=$n;if(l){if(sf(o)){for(o=$n;o;)o=Di(o);throw Error(a(418))}for(;l;)xm(o,l),l=Di(l)}}if(Mm(o),o.tag===13){if(!N)throw Error(a(316));if(o=o.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(a(317));$n=kh(o)}else $n=Qn?Di(o.stateNode):null;return!0}function Ys(){N&&($n=Qn=null,Yo=Vt=!1)}function af(o){Mi===null?Mi=[o]:Mi.push(o)}function jo(o,l,d){if(o=d.ref,o!==null&&typeof o!="function"&&typeof o!="object"){if(d._owner){if(d=d._owner,d){if(d.tag!==1)throw Error(a(309));var v=d.stateNode}if(!v)throw Error(a(147,o));var S=v,A=""+o;return l!==null&&l.ref!==null&&typeof l.ref=="function"&&l.ref._stringRef===A?l.ref:(l=function(B){var H=S.refs;H===mm&&(H=S.refs={}),B===null?delete H[A]:H[A]=B},l._stringRef=A,l)}if(typeof o!="string")throw Error(a(284));if(!d._owner)throw Error(a(290,o))}return o}function Ol(o,l){throw o=Object.prototype.toString.call(l),Error(a(31,o==="[object Object]"?"object with keys {"+Object.keys(l).join(", ")+"}":o))}function wm(o){var l=o._init;return l(o._payload)}function Em(o){function l(K,X){if(o){var te=K.deletions;te===null?(K.deletions=[X],K.flags|=16):te.push(X)}}function d(K,X){if(!o)return null;for(;X!==null;)l(K,X),X=X.sibling;return null}function v(K,X){for(K=new Map;X!==null;)X.key!==null?K.set(X.key,X):K.set(X.index,X),X=X.sibling;return K}function S(K,X){return K=Rr(K,X),K.index=0,K.sibling=null,K}function A(K,X,te){return K.index=te,o?(te=K.alternate,te!==null?(te=te.index,te<X?(K.flags|=2,X):te):(K.flags|=2,X)):(K.flags|=1048576,X)}function B(K){return o&&K.alternate===null&&(K.flags|=2),K}function H(K,X,te,De){return X===null||X.tag!==6?(X=Wf(te,K.mode,De),X.return=K,X):(X=S(X,te),X.return=K,X)}function oe(K,X,te,De){var Qe=te.type;return Qe===f?Xe(K,X,te.props.children,De,te.key):X!==null&&(X.elementType===Qe||typeof Qe=="object"&&Qe!==null&&Qe.$$typeof===w&&wm(Qe)===X.type)?(De=S(X,te.props),De.ref=jo(K,X,te),De.return=K,De):(De=pc(te.type,te.key,te.props,null,K.mode,De),De.ref=jo(K,X,te),De.return=K,De)}function ye(K,X,te,De){return X===null||X.tag!==4||X.stateNode.containerInfo!==te.containerInfo||X.stateNode.implementation!==te.implementation?(X=Xf(te,K.mode,De),X.return=K,X):(X=S(X,te.children||[]),X.return=K,X)}function Xe(K,X,te,De,Qe){return X===null||X.tag!==7?(X=ns(te,K.mode,De,Qe),X.return=K,X):(X=S(X,te),X.return=K,X)}function ht(K,X,te){if(typeof X=="string"&&X!==""||typeof X=="number")return X=Wf(""+X,K.mode,te),X.return=K,X;if(typeof X=="object"&&X!==null){switch(X.$$typeof){case u:return te=pc(X.type,X.key,X.props,null,K.mode,te),te.ref=jo(K,null,X),te.return=K,te;case h:return X=Xf(X,K.mode,te),X.return=K,X;case w:var De=X._init;return ht(K,De(X._payload),te)}if(re(X)||P(X))return X=ns(X,K.mode,te,null),X.return=K,X;Ol(K,X)}return null}function it(K,X,te,De){var Qe=X!==null?X.key:null;if(typeof te=="string"&&te!==""||typeof te=="number")return Qe!==null?null:H(K,X,""+te,De);if(typeof te=="object"&&te!==null){switch(te.$$typeof){case u:return te.key===Qe?oe(K,X,te,De):null;case h:return te.key===Qe?ye(K,X,te,De):null;case w:return Qe=te._init,it(K,X,Qe(te._payload),De)}if(re(te)||P(te))return Qe!==null?null:Xe(K,X,te,De,null);Ol(K,te)}return null}function Bt(K,X,te,De,Qe){if(typeof De=="string"&&De!==""||typeof De=="number")return K=K.get(te)||null,H(X,K,""+De,Qe);if(typeof De=="object"&&De!==null){switch(De.$$typeof){case u:return K=K.get(De.key===null?te:De.key)||null,oe(X,K,De,Qe);case h:return K=K.get(De.key===null?te:De.key)||null,ye(X,K,De,Qe);case w:var gt=De._init;return Bt(K,X,te,gt(De._payload),Qe)}if(re(De)||P(De))return K=K.get(te)||null,Xe(X,K,De,Qe,null);Ol(X,De)}return null}function et(K,X,te,De){for(var Qe=null,gt=null,ft=X,It=X=0,hn=null;ft!==null&&It<te.length;It++){ft.index>It?(hn=ft,ft=null):hn=ft.sibling;var Lt=it(K,ft,te[It],De);if(Lt===null){ft===null&&(ft=hn);break}o&&ft&&Lt.alternate===null&&l(K,ft),X=A(Lt,X,It),gt===null?Qe=Lt:gt.sibling=Lt,gt=Lt,ft=hn}if(It===te.length)return d(K,ft),Vt&&Zr(K,It),Qe;if(ft===null){for(;It<te.length;It++)ft=ht(K,te[It],De),ft!==null&&(X=A(ft,X,It),gt===null?Qe=ft:gt.sibling=ft,gt=ft);return Vt&&Zr(K,It),Qe}for(ft=v(K,ft);It<te.length;It++)hn=Bt(ft,K,It,te[It],De),hn!==null&&(o&&hn.alternate!==null&&ft.delete(hn.key===null?It:hn.key),X=A(hn,X,It),gt===null?Qe=hn:gt.sibling=hn,gt=hn);return o&&ft.forEach(function(Pr){return l(K,Pr)}),Vt&&Zr(K,It),Qe}function Tn(K,X,te,De){var Qe=P(te);if(typeof Qe!="function")throw Error(a(150));if(te=Qe.call(te),te==null)throw Error(a(151));for(var gt=Qe=null,ft=X,It=X=0,hn=null,Lt=te.next();ft!==null&&!Lt.done;It++,Lt=te.next()){ft.index>It?(hn=ft,ft=null):hn=ft.sibling;var Pr=it(K,ft,Lt.value,De);if(Pr===null){ft===null&&(ft=hn);break}o&&ft&&Pr.alternate===null&&l(K,ft),X=A(Pr,X,It),gt===null?Qe=Pr:gt.sibling=Pr,gt=Pr,ft=hn}if(Lt.done)return d(K,ft),Vt&&Zr(K,It),Qe;if(ft===null){for(;!Lt.done;It++,Lt=te.next())Lt=ht(K,Lt.value,De),Lt!==null&&(X=A(Lt,X,It),gt===null?Qe=Lt:gt.sibling=Lt,gt=Lt);return Vt&&Zr(K,It),Qe}for(ft=v(K,ft);!Lt.done;It++,Lt=te.next())Lt=Bt(ft,K,It,Lt.value,De),Lt!==null&&(o&&Lt.alternate!==null&&ft.delete(Lt.key===null?It:Lt.key),X=A(Lt,X,It),gt===null?Qe=Lt:gt.sibling=Lt,gt=Lt);return o&&ft.forEach(function(iS){return l(K,iS)}),Vt&&Zr(K,It),Qe}function gi(K,X,te,De){if(typeof te=="object"&&te!==null&&te.type===f&&te.key===null&&(te=te.props.children),typeof te=="object"&&te!==null){switch(te.$$typeof){case u:e:{for(var Qe=te.key,gt=X;gt!==null;){if(gt.key===Qe){if(Qe=te.type,Qe===f){if(gt.tag===7){d(K,gt.sibling),X=S(gt,te.props.children),X.return=K,K=X;break e}}else if(gt.elementType===Qe||typeof Qe=="object"&&Qe!==null&&Qe.$$typeof===w&&wm(Qe)===gt.type){d(K,gt.sibling),X=S(gt,te.props),X.ref=jo(K,gt,te),X.return=K,K=X;break e}d(K,gt);break}else l(K,gt);gt=gt.sibling}te.type===f?(X=ns(te.props.children,K.mode,De,te.key),X.return=K,K=X):(De=pc(te.type,te.key,te.props,null,K.mode,De),De.ref=jo(K,X,te),De.return=K,K=De)}return B(K);case h:e:{for(gt=te.key;X!==null;){if(X.key===gt)if(X.tag===4&&X.stateNode.containerInfo===te.containerInfo&&X.stateNode.implementation===te.implementation){d(K,X.sibling),X=S(X,te.children||[]),X.return=K,K=X;break e}else{d(K,X);break}else l(K,X);X=X.sibling}X=Xf(te,K.mode,De),X.return=K,K=X}return B(K);case w:return gt=te._init,gi(K,X,gt(te._payload),De)}if(re(te))return et(K,X,te,De);if(P(te))return Tn(K,X,te,De);Ol(K,te)}return typeof te=="string"&&te!==""||typeof te=="number"?(te=""+te,X!==null&&X.tag===6?(d(K,X.sibling),X=S(X,te),X.return=K,K=X):(d(K,X),X=Wf(te,K.mode,De),X.return=K,K=X),B(K)):d(K,X)}return gi}var qs=Em(!0),Am=Em(!1),Zo={},fi=Ut(Zo),Jo=Ut(Zo),js=Ut(Zo);function Bi(o){if(o===Zo)throw Error(a(174));return o}function lf(o,l){$e(js,l),$e(Jo,o),$e(fi,Zo),o=fe(l),_t(fi),$e(fi,o)}function Zs(){_t(fi),_t(Jo),_t(js)}function Tm(o){var l=Bi(js.current),d=Bi(fi.current);l=z(d,o.type,l),d!==l&&($e(Jo,o),$e(fi,l))}function cf(o){Jo.current===o&&(_t(fi),_t(Jo))}var Wt=Ut(0);function Bl(o){for(var l=o;l!==null;){if(l.tag===13){var d=l.memoizedState;if(d!==null&&(d=d.dehydrated,d===null||zs(d)||ks(d)))return l}else if(l.tag===19&&l.memoizedProps.revealOrder!==void 0){if(l.flags&128)return l}else if(l.child!==null){l.child.return=l,l=l.child;continue}if(l===o)break;for(;l.sibling===null;){if(l.return===null||l.return===o)return null;l=l.return}l.sibling.return=l.return,l=l.sibling}return null}var uf=[];function hf(){for(var o=0;o<uf.length;o++){var l=uf[o];Ze?l._workInProgressVersionPrimary=null:l._workInProgressVersionSecondary=null}uf.length=0}var zl=c.ReactCurrentDispatcher,di=c.ReactCurrentBatchConfig,Js=0,Yt=null,wn=null,un=null,kl=!1,Ko=!1,Qo=0,Cx=0;function En(){throw Error(a(321))}function ff(o,l){if(l===null)return!1;for(var d=0;d<l.length&&d<o.length;d++)if(!Ni(o[d],l[d]))return!1;return!0}function df(o,l,d,v,S,A){if(Js=A,Yt=l,l.memoizedState=null,l.updateQueue=null,l.lanes=0,zl.current=o===null||o.memoizedState===null?Lx:Dx,o=d(v,S),Ko){A=0;do{if(Ko=!1,Qo=0,25<=A)throw Error(a(301));A+=1,un=wn=null,l.updateQueue=null,zl.current=Ux,o=d(v,S)}while(Ko)}if(zl.current=Xl,l=wn!==null&&wn.next!==null,Js=0,un=wn=Yt=null,kl=!1,l)throw Error(a(300));return o}function pf(){var o=Qo!==0;return Qo=0,o}function ir(){var o={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return un===null?Yt.memoizedState=un=o:un=un.next=o,un}function zi(){if(wn===null){var o=Yt.alternate;o=o!==null?o.memoizedState:null}else o=wn.next;var l=un===null?Yt.memoizedState:un.next;if(l!==null)un=l,wn=o;else{if(o===null)throw Error(a(310));wn=o,o={memoizedState:wn.memoizedState,baseState:wn.baseState,baseQueue:wn.baseQueue,queue:wn.queue,next:null},un===null?Yt.memoizedState=un=o:un=un.next=o}return un}function Jr(o,l){return typeof l=="function"?l(o):l}function Hl(o){var l=zi(),d=l.queue;if(d===null)throw Error(a(311));d.lastRenderedReducer=o;var v=wn,S=v.baseQueue,A=d.pending;if(A!==null){if(S!==null){var B=S.next;S.next=A.next,A.next=B}v.baseQueue=S=A,d.pending=null}if(S!==null){A=S.next,v=v.baseState;var H=B=null,oe=null,ye=A;do{var Xe=ye.lane;if((Js&Xe)===Xe)oe!==null&&(oe=oe.next={lane:0,action:ye.action,hasEagerState:ye.hasEagerState,eagerState:ye.eagerState,next:null}),v=ye.hasEagerState?ye.eagerState:o(v,ye.action);else{var ht={lane:Xe,action:ye.action,hasEagerState:ye.hasEagerState,eagerState:ye.eagerState,next:null};oe===null?(H=oe=ht,B=v):oe=oe.next=ht,Yt.lanes|=Xe,Qs|=Xe}ye=ye.next}while(ye!==null&&ye!==A);oe===null?B=v:oe.next=H,Ni(v,l.memoizedState)||(ei=!0),l.memoizedState=v,l.baseState=B,l.baseQueue=oe,d.lastRenderedState=v}if(o=d.interleaved,o!==null){S=o;do A=S.lane,Yt.lanes|=A,Qs|=A,S=S.next;while(S!==o)}else S===null&&(d.lanes=0);return[l.memoizedState,d.dispatch]}function Vl(o){var l=zi(),d=l.queue;if(d===null)throw Error(a(311));d.lastRenderedReducer=o;var v=d.dispatch,S=d.pending,A=l.memoizedState;if(S!==null){d.pending=null;var B=S=S.next;do A=o(A,B.action),B=B.next;while(B!==S);Ni(A,l.memoizedState)||(ei=!0),l.memoizedState=A,l.baseQueue===null&&(l.baseState=A),d.lastRenderedState=A}return[A,v]}function bm(){}function Cm(o,l){var d=Yt,v=zi(),S=l(),A=!Ni(v.memoizedState,S);if(A&&(v.memoizedState=S,ei=!0),v=v.queue,ea(Im.bind(null,d,v,o),[o]),v.getSnapshot!==l||A||un!==null&&un.memoizedState.tag&1){if(d.flags|=2048,$o(9,Pm.bind(null,d,v,S,l),void 0,null),$t===null)throw Error(a(349));Js&30||Rm(d,l,S)}return S}function Rm(o,l,d){o.flags|=16384,o={getSnapshot:l,value:d},l=Yt.updateQueue,l===null?(l={lastEffect:null,stores:null},Yt.updateQueue=l,l.stores=[o]):(d=l.stores,d===null?l.stores=[o]:d.push(o))}function Pm(o,l,d,v){l.value=d,l.getSnapshot=v,Lm(l)&&pi(o,1,-1)}function Im(o,l,d){return d(function(){Lm(l)&&pi(o,1,-1)})}function Lm(o){var l=o.getSnapshot;o=o.value;try{var d=l();return!Ni(o,d)}catch{return!0}}function mf(o){var l=ir();return typeof o=="function"&&(o=o()),l.memoizedState=l.baseState=o,o={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Jr,lastRenderedState:o},l.queue=o,o=o.dispatch=Ix.bind(null,Yt,o),[l.memoizedState,o]}function $o(o,l,d,v){return o={tag:o,create:l,destroy:d,deps:v,next:null},l=Yt.updateQueue,l===null?(l={lastEffect:null,stores:null},Yt.updateQueue=l,l.lastEffect=o.next=o):(d=l.lastEffect,d===null?l.lastEffect=o.next=o:(v=d.next,d.next=o,o.next=v,l.lastEffect=o)),o}function Dm(){return zi().memoizedState}function Gl(o,l,d,v){var S=ir();Yt.flags|=o,S.memoizedState=$o(1|l,d,void 0,v===void 0?null:v)}function Wl(o,l,d,v){var S=zi();v=v===void 0?null:v;var A=void 0;if(wn!==null){var B=wn.memoizedState;if(A=B.destroy,v!==null&&ff(v,B.deps)){S.memoizedState=$o(l,d,A,v);return}}Yt.flags|=o,S.memoizedState=$o(1|l,d,A,v)}function gf(o,l){return Gl(8390656,8,o,l)}function ea(o,l){return Wl(2048,8,o,l)}function Um(o,l){return Wl(4,2,o,l)}function Nm(o,l){return Wl(4,4,o,l)}function Fm(o,l){if(typeof l=="function")return o=o(),l(o),function(){l(null)};if(l!=null)return o=o(),l.current=o,function(){l.current=null}}function Om(o,l,d){return d=d!=null?d.concat([o]):null,Wl(4,4,Fm.bind(null,l,o),d)}function vf(){}function Bm(o,l){var d=zi();l=l===void 0?null:l;var v=d.memoizedState;return v!==null&&l!==null&&ff(l,v[1])?v[0]:(d.memoizedState=[o,l],o)}function zm(o,l){var d=zi();l=l===void 0?null:l;var v=d.memoizedState;return v!==null&&l!==null&&ff(l,v[1])?v[0]:(o=o(),d.memoizedState=[o,l],o)}function Rx(o,l){var d=Pt;Pt=d!==0&&4>d?d:4,o(!0);var v=di.transition;di.transition={};try{o(!1),l()}finally{Pt=d,di.transition=v}}function km(){return zi().memoizedState}function Px(o,l,d){var v=br(o);d={lane:v,action:d,hasEagerState:!1,eagerState:null,next:null},Hm(o)?Vm(l,d):(Gm(o,l,d),d=Fn(),o=pi(o,v,d),o!==null&&Wm(o,l,v))}function Ix(o,l,d){var v=br(o),S={lane:v,action:d,hasEagerState:!1,eagerState:null,next:null};if(Hm(o))Vm(l,S);else{Gm(o,l,S);var A=o.alternate;if(o.lanes===0&&(A===null||A.lanes===0)&&(A=l.lastRenderedReducer,A!==null))try{var B=l.lastRenderedState,H=A(B,d);if(S.hasEagerState=!0,S.eagerState=H,Ni(H,B))return}catch{}finally{}d=Fn(),o=pi(o,v,d),o!==null&&Wm(o,l,v)}}function Hm(o){var l=o.alternate;return o===Yt||l!==null&&l===Yt}function Vm(o,l){Ko=kl=!0;var d=o.pending;d===null?l.next=l:(l.next=d.next,d.next=l),o.pending=l}function Gm(o,l,d){$t!==null&&o.mode&1&&!(yt&2)?(o=l.interleaved,o===null?(d.next=d,Oi===null?Oi=[l]:Oi.push(l)):(d.next=o.next,o.next=d),l.interleaved=d):(o=l.pending,o===null?d.next=d:(d.next=o.next,o.next=d),l.pending=d)}function Wm(o,l,d){if(d&4194240){var v=l.lanes;v&=o.pendingLanes,d|=v,l.lanes=d,Wh(o,d)}}var Xl={readContext:ci,useCallback:En,useContext:En,useEffect:En,useImperativeHandle:En,useInsertionEffect:En,useLayoutEffect:En,useMemo:En,useReducer:En,useRef:En,useState:En,useDebugValue:En,useDeferredValue:En,useTransition:En,useMutableSource:En,useSyncExternalStore:En,useId:En,unstable_isNewReconciler:!1},Lx={readContext:ci,useCallback:function(o,l){return ir().memoizedState=[o,l===void 0?null:l],o},useContext:ci,useEffect:gf,useImperativeHandle:function(o,l,d){return d=d!=null?d.concat([o]):null,Gl(4194308,4,Fm.bind(null,l,o),d)},useLayoutEffect:function(o,l){return Gl(4194308,4,o,l)},useInsertionEffect:function(o,l){return Gl(4,2,o,l)},useMemo:function(o,l){var d=ir();return l=l===void 0?null:l,o=o(),d.memoizedState=[o,l],o},useReducer:function(o,l,d){var v=ir();return l=d!==void 0?d(l):l,v.memoizedState=v.baseState=l,o={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:o,lastRenderedState:l},v.queue=o,o=o.dispatch=Px.bind(null,Yt,o),[v.memoizedState,o]},useRef:function(o){var l=ir();return o={current:o},l.memoizedState=o},useState:mf,useDebugValue:vf,useDeferredValue:function(o){var l=mf(o),d=l[0],v=l[1];return gf(function(){var S=di.transition;di.transition={};try{v(o)}finally{di.transition=S}},[o]),d},useTransition:function(){var o=mf(!1),l=o[0];return o=Rx.bind(null,o[1]),ir().memoizedState=o,[l,o]},useMutableSource:function(){},useSyncExternalStore:function(o,l,d){var v=Yt,S=ir();if(Vt){if(d===void 0)throw Error(a(407));d=d()}else{if(d=l(),$t===null)throw Error(a(349));Js&30||Rm(v,l,d)}S.memoizedState=d;var A={value:d,getSnapshot:l};return S.queue=A,gf(Im.bind(null,v,A,o),[o]),v.flags|=2048,$o(9,Pm.bind(null,v,A,d,l),void 0,null),d},useId:function(){var o=ir(),l=$t.identifierPrefix;if(Vt){var d=nr,v=tr;d=(v&~(1<<32-Un(v)-1)).toString(32)+d,l=":"+l+"R"+d,d=Qo++,0<d&&(l+="H"+d.toString(32)),l+=":"}else d=Cx++,l=":"+l+"r"+d.toString(32)+":";return o.memoizedState=l},unstable_isNewReconciler:!1},Dx={readContext:ci,useCallback:Bm,useContext:ci,useEffect:ea,useImperativeHandle:Om,useInsertionEffect:Um,useLayoutEffect:Nm,useMemo:zm,useReducer:Hl,useRef:Dm,useState:function(){return Hl(Jr)},useDebugValue:vf,useDeferredValue:function(o){var l=Hl(Jr),d=l[0],v=l[1];return ea(function(){var S=di.transition;di.transition={};try{v(o)}finally{di.transition=S}},[o]),d},useTransition:function(){var o=Hl(Jr)[0],l=zi().memoizedState;return[o,l]},useMutableSource:bm,useSyncExternalStore:Cm,useId:km,unstable_isNewReconciler:!1},Ux={readContext:ci,useCallback:Bm,useContext:ci,useEffect:ea,useImperativeHandle:Om,useInsertionEffect:Um,useLayoutEffect:Nm,useMemo:zm,useReducer:Vl,useRef:Dm,useState:function(){return Vl(Jr)},useDebugValue:vf,useDeferredValue:function(o){var l=Vl(Jr),d=l[0],v=l[1];return ea(function(){var S=di.transition;di.transition={};try{v(o)}finally{di.transition=S}},[o]),d},useTransition:function(){var o=Vl(Jr)[0],l=zi().memoizedState;return[o,l]},useMutableSource:bm,useSyncExternalStore:Cm,useId:km,unstable_isNewReconciler:!1};function _f(o,l){try{var d="",v=l;do d+=bx(v),v=v.return;while(v);var S=d}catch(A){S=`
Error generating stack: `+A.message+`
`+A.stack}return{value:o,source:l,stack:S}}function yf(o,l){try{console.error(l.value)}catch(d){setTimeout(function(){throw d})}}var Nx=typeof WeakMap=="function"?WeakMap:Map;function Xm(o,l,d){d=er(-1,d),d.tag=3,d.payload={element:null};var v=l.value;return d.callback=function(){ac||(ac=!0,Of=v),yf(o,l)},d}function Ym(o,l,d){d=er(-1,d),d.tag=3;var v=o.type.getDerivedStateFromError;if(typeof v=="function"){var S=l.value;d.payload=function(){return v(S)},d.callback=function(){yf(o,l)}}var A=o.stateNode;return A!==null&&typeof A.componentDidCatch=="function"&&(d.callback=function(){yf(o,l),typeof v!="function"&&(Ar===null?Ar=new Set([this]):Ar.add(this));var B=l.stack;this.componentDidCatch(l.value,{componentStack:B!==null?B:""})}),d}function qm(o,l,d){var v=o.pingCache;if(v===null){v=o.pingCache=new Nx;var S=new Set;v.set(l,S)}else S=v.get(l),S===void 0&&(S=new Set,v.set(l,S));S.has(d)||(S.add(d),o=Zx.bind(null,o,l,d),l.then(o,o))}function jm(o){do{var l;if((l=o.tag===13)&&(l=o.memoizedState,l=l!==null?l.dehydrated!==null:!0),l)return o;o=o.return}while(o!==null);return null}function Zm(o,l,d,v,S){return o.mode&1?(o.flags|=65536,o.lanes=S,o):(o===l?o.flags|=65536:(o.flags|=128,d.flags|=131072,d.flags&=-52805,d.tag===1&&(d.alternate===null?d.tag=17:(l=er(-1,1),l.tag=2,Er(d,l))),d.lanes|=1),o)}function ki(o){o.flags|=4}function Jm(o,l){if(o!==null&&o.child===l.child)return!0;if(l.flags&16)return!1;for(o=l.child;o!==null;){if(o.flags&12854||o.subtreeFlags&12854)return!1;o=o.sibling}return!0}var ta,na,Yl,ql;if(Re)ta=function(o,l){for(var d=l.child;d!==null;){if(d.tag===5||d.tag===6)Pe(o,d.stateNode);else if(d.tag!==4&&d.child!==null){d.child.return=d,d=d.child;continue}if(d===l)break;for(;d.sibling===null;){if(d.return===null||d.return===l)return;d=d.return}d.sibling.return=d.return,d=d.sibling}},na=function(){},Yl=function(o,l,d,v,S){if(o=o.memoizedProps,o!==v){var A=l.stateNode,B=Bi(fi.current);d=ne(A,d,o,v,S,B),(l.updateQueue=d)&&ki(l)}},ql=function(o,l,d,v){d!==v&&ki(l)};else if(he){ta=function(o,l,d,v){for(var S=l.child;S!==null;){if(S.tag===5){var A=S.stateNode;d&&v&&(A=gn(A,S.type,S.memoizedProps,S)),Pe(o,A)}else if(S.tag===6)A=S.stateNode,d&&v&&(A=li(A,S.memoizedProps,S)),Pe(o,A);else if(S.tag!==4){if(S.tag===22&&S.memoizedState!==null)A=S.child,A!==null&&(A.return=S),ta(o,S,!0,!0);else if(S.child!==null){S.child.return=S,S=S.child;continue}}if(S===l)break;for(;S.sibling===null;){if(S.return===null||S.return===l)return;S=S.return}S.sibling.return=S.return,S=S.sibling}};var Km=function(o,l,d,v){for(var S=l.child;S!==null;){if(S.tag===5){var A=S.stateNode;d&&v&&(A=gn(A,S.type,S.memoizedProps,S)),Gt(o,A)}else if(S.tag===6)A=S.stateNode,d&&v&&(A=li(A,S.memoizedProps,S)),Gt(o,A);else if(S.tag!==4){if(S.tag===22&&S.memoizedState!==null)A=S.child,A!==null&&(A.return=S),Km(o,S,!0,!0);else if(S.child!==null){S.child.return=S,S=S.child;continue}}if(S===l)break;for(;S.sibling===null;){if(S.return===null||S.return===l)return;S=S.return}S.sibling.return=S.return,S=S.sibling}};na=function(o,l){var d=l.stateNode;if(!Jm(o,l)){o=d.containerInfo;var v=wt(o);Km(v,l,!1,!1),d.pendingChildren=v,ki(l),Mn(o,v)}},Yl=function(o,l,d,v,S){var A=o.stateNode,B=o.memoizedProps;if((o=Jm(o,l))&&B===v)l.stateNode=A;else{var H=l.stateNode,oe=Bi(fi.current),ye=null;B!==v&&(ye=ne(H,d,B,v,S,oe)),o&&ye===null?l.stateNode=A:(A=ze(A,ye,d,B,v,l,o,H),Ne(A,d,v,S,oe)&&ki(l),l.stateNode=A,o?ki(l):ta(A,l,!1,!1))}},ql=function(o,l,d,v){d!==v?(o=Bi(js.current),d=Bi(fi.current),l.stateNode=Ce(v,o,d,l),ki(l)):l.stateNode=o.stateNode}}else na=function(){},Yl=function(){},ql=function(){};function ia(o,l){if(!Vt)switch(o.tailMode){case"hidden":l=o.tail;for(var d=null;l!==null;)l.alternate!==null&&(d=l),l=l.sibling;d===null?o.tail=null:d.sibling=null;break;case"collapsed":d=o.tail;for(var v=null;d!==null;)d.alternate!==null&&(v=d),d=d.sibling;v===null?l||o.tail===null?o.tail=null:o.tail.sibling=null:v.sibling=null}}function An(o){var l=o.alternate!==null&&o.alternate.child===o.child,d=0,v=0;if(l)for(var S=o.child;S!==null;)d|=S.lanes|S.childLanes,v|=S.subtreeFlags&14680064,v|=S.flags&14680064,S.return=o,S=S.sibling;else for(S=o.child;S!==null;)d|=S.lanes|S.childLanes,v|=S.subtreeFlags,v|=S.flags,S.return=o,S=S.sibling;return o.subtreeFlags|=v,o.childLanes=d,l}function Fx(o,l,d){var v=l.pendingProps;switch(rf(l),l.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return An(l),null;case 1:return Ot(l.type)&&Sr(),An(l),null;case 3:return v=l.stateNode,Zs(),_t(ct),_t(At),hf(),v.pendingContext&&(v.context=v.pendingContext,v.pendingContext=null),(o===null||o.child===null)&&(qo(l)?ki(l):o===null||o.memoizedState.isDehydrated&&!(l.flags&256)||(l.flags|=1024,Mi!==null&&(kf(Mi),Mi=null))),na(o,l),An(l),null;case 5:cf(l),d=Bi(js.current);var S=l.type;if(o!==null&&l.stateNode!=null)Yl(o,l,S,v,d),o.ref!==l.ref&&(l.flags|=512,l.flags|=2097152);else{if(!v){if(l.stateNode===null)throw Error(a(166));return An(l),null}if(o=Bi(fi.current),qo(l)){if(!N)throw Error(a(175));o=Ml(l.stateNode,l.type,l.memoizedProps,d,o,l,!Yo),l.updateQueue=o,o!==null&&ki(l)}else{var A=le(S,v,d,o,l);ta(A,l,!1,!1),l.stateNode=A,Ne(A,S,v,d,o)&&ki(l)}l.ref!==null&&(l.flags|=512,l.flags|=2097152)}return An(l),null;case 6:if(o&&l.stateNode!=null)ql(o,l,o.memoizedProps,v);else{if(typeof v!="string"&&l.stateNode===null)throw Error(a(166));if(o=Bi(js.current),d=Bi(fi.current),qo(l)){if(!N)throw Error(a(176));if(o=l.stateNode,v=l.memoizedProps,(d=Bh(o,v,l,!Yo))&&(S=Qn,S!==null))switch(A=(S.mode&1)!==0,S.tag){case 3:Me(S.stateNode.containerInfo,o,v,A);break;case 5:Oe(S.type,S.memoizedProps,S.stateNode,o,v,A)}d&&ki(l)}else l.stateNode=Ce(v,o,d,l)}return An(l),null;case 13:if(_t(Wt),v=l.memoizedState,Vt&&$n!==null&&l.mode&1&&!(l.flags&128)){for(o=$n;o;)o=Di(o);return Ys(),l.flags|=98560,l}if(v!==null&&v.dehydrated!==null){if(v=qo(l),o===null){if(!v)throw Error(a(318));if(!N)throw Error(a(344));if(o=l.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(a(317));zh(o,l)}else Ys(),!(l.flags&128)&&(l.memoizedState=null),l.flags|=4;return An(l),null}return Mi!==null&&(kf(Mi),Mi=null),l.flags&128?(l.lanes=d,l):(v=v!==null,d=!1,o===null?qo(l):d=o.memoizedState!==null,v&&!d&&(l.child.flags|=8192,l.mode&1&&(o===null||Wt.current&1?on===0&&(on=3):Vf())),l.updateQueue!==null&&(l.flags|=4),An(l),null);case 4:return Zs(),na(o,l),o===null&&xe(l.stateNode.containerInfo),An(l),null;case 10:return Kh(l.type._context),An(l),null;case 17:return Ot(l.type)&&Sr(),An(l),null;case 19:if(_t(Wt),S=l.memoizedState,S===null)return An(l),null;if(v=(l.flags&128)!==0,A=S.rendering,A===null)if(v)ia(S,!1);else{if(on!==0||o!==null&&o.flags&128)for(o=l.child;o!==null;){if(A=Bl(o),A!==null){for(l.flags|=128,ia(S,!1),o=A.updateQueue,o!==null&&(l.updateQueue=o,l.flags|=4),l.subtreeFlags=0,o=d,v=l.child;v!==null;)d=v,S=o,d.flags&=14680066,A=d.alternate,A===null?(d.childLanes=0,d.lanes=S,d.child=null,d.subtreeFlags=0,d.memoizedProps=null,d.memoizedState=null,d.updateQueue=null,d.dependencies=null,d.stateNode=null):(d.childLanes=A.childLanes,d.lanes=A.lanes,d.child=A.child,d.subtreeFlags=0,d.deletions=null,d.memoizedProps=A.memoizedProps,d.memoizedState=A.memoizedState,d.updateQueue=A.updateQueue,d.type=A.type,S=A.dependencies,d.dependencies=S===null?null:{lanes:S.lanes,firstContext:S.firstContext}),v=v.sibling;return $e(Wt,Wt.current&1|2),l.child}o=o.sibling}S.tail!==null&&cn()>Ff&&(l.flags|=128,v=!0,ia(S,!1),l.lanes=4194304)}else{if(!v)if(o=Bl(A),o!==null){if(l.flags|=128,v=!0,o=o.updateQueue,o!==null&&(l.updateQueue=o,l.flags|=4),ia(S,!0),S.tail===null&&S.tailMode==="hidden"&&!A.alternate&&!Vt)return An(l),null}else 2*cn()-S.renderingStartTime>Ff&&d!==1073741824&&(l.flags|=128,v=!0,ia(S,!1),l.lanes=4194304);S.isBackwards?(A.sibling=l.child,l.child=A):(o=S.last,o!==null?o.sibling=A:l.child=A,S.last=A)}return S.tail!==null?(l=S.tail,S.rendering=l,S.tail=l.sibling,S.renderingStartTime=cn(),l.sibling=null,o=Wt.current,$e(Wt,v?o&1|2:o&1),l):(An(l),null);case 22:case 23:return Hf(),v=l.memoizedState!==null,o!==null&&o.memoizedState!==null!==v&&(l.flags|=8192),v&&l.mode&1?ti&1073741824&&(An(l),Re&&l.subtreeFlags&6&&(l.flags|=8192)):An(l),null;case 24:return null;case 25:return null}throw Error(a(156,l.tag))}var Ox=c.ReactCurrentOwner,ei=!1;function Nn(o,l,d,v){l.child=o===null?Am(l,null,d,v):qs(l,o.child,d,v)}function Qm(o,l,d,v,S){d=d.render;var A=l.ref;return Gs(l,S),v=df(o,l,d,v,A,S),d=pf(),o!==null&&!ei?(l.updateQueue=o.updateQueue,l.flags&=-2053,o.lanes&=~S,rr(o,l,S)):(Vt&&d&&nf(l),l.flags|=1,Nn(o,l,v,S),l.child)}function $m(o,l,d,v,S){if(o===null){var A=d.type;return typeof A=="function"&&!Gf(A)&&A.defaultProps===void 0&&d.compare===null&&d.defaultProps===void 0?(l.tag=15,l.type=A,eg(o,l,A,v,S)):(o=pc(d.type,null,v,l,l.mode,S),o.ref=l.ref,o.return=l,l.child=o)}if(A=o.child,!(o.lanes&S)){var B=A.memoizedProps;if(d=d.compare,d=d!==null?d:Rl,d(B,v)&&o.ref===l.ref)return rr(o,l,S)}return l.flags|=1,o=Rr(A,v),o.ref=l.ref,o.return=l,l.child=o}function eg(o,l,d,v,S){if(o!==null&&Rl(o.memoizedProps,v)&&o.ref===l.ref)if(ei=!1,(o.lanes&S)!==0)o.flags&131072&&(ei=!0);else return l.lanes=o.lanes,rr(o,l,S);return xf(o,l,d,v,S)}function tg(o,l,d){var v=l.pendingProps,S=v.children,A=o!==null?o.memoizedState:null;if(v.mode==="hidden")if(!(l.mode&1))l.memoizedState={baseLanes:0,cachePool:null},$e(Ks,ti),ti|=d;else if(d&1073741824)l.memoizedState={baseLanes:0,cachePool:null},v=A!==null?A.baseLanes:d,$e(Ks,ti),ti|=v;else return o=A!==null?A.baseLanes|d:d,l.lanes=l.childLanes=1073741824,l.memoizedState={baseLanes:o,cachePool:null},l.updateQueue=null,$e(Ks,ti),ti|=o,null;else A!==null?(v=A.baseLanes|d,l.memoizedState=null):v=d,$e(Ks,ti),ti|=v;return Nn(o,l,S,d),l.child}function ng(o,l){var d=l.ref;(o===null&&d!==null||o!==null&&o.ref!==d)&&(l.flags|=512,l.flags|=2097152)}function xf(o,l,d,v,S){var A=Ot(d)?sn:At.current;return A=Kn(l,A),Gs(l,S),d=df(o,l,d,v,A,S),v=pf(),o!==null&&!ei?(l.updateQueue=o.updateQueue,l.flags&=-2053,o.lanes&=~S,rr(o,l,S)):(Vt&&v&&nf(l),l.flags|=1,Nn(o,l,d,S),l.child)}function ig(o,l,d,v,S){if(Ot(d)){var A=!0;Mr(l)}else A=!1;if(Gs(l,S),l.stateNode===null)o!==null&&(o.alternate=null,l.alternate=null,l.flags|=2),vm(l,d,v),tf(l,d,v,S),v=!0;else if(o===null){var B=l.stateNode,H=l.memoizedProps;B.props=H;var oe=B.context,ye=d.contextType;typeof ye=="object"&&ye!==null?ye=ci(ye):(ye=Ot(d)?sn:At.current,ye=Kn(l,ye));var Xe=d.getDerivedStateFromProps,ht=typeof Xe=="function"||typeof B.getSnapshotBeforeUpdate=="function";ht||typeof B.UNSAFE_componentWillReceiveProps!="function"&&typeof B.componentWillReceiveProps!="function"||(H!==v||oe!==ye)&&_m(l,B,v,ye),wr=!1;var it=l.memoizedState;B.state=it,Dl(l,v,B,S),oe=l.memoizedState,H!==v||it!==oe||ct.current||wr?(typeof Xe=="function"&&(ef(l,d,Xe,v),oe=l.memoizedState),(H=wr||gm(l,d,H,v,it,oe,ye))?(ht||typeof B.UNSAFE_componentWillMount!="function"&&typeof B.componentWillMount!="function"||(typeof B.componentWillMount=="function"&&B.componentWillMount(),typeof B.UNSAFE_componentWillMount=="function"&&B.UNSAFE_componentWillMount()),typeof B.componentDidMount=="function"&&(l.flags|=4194308)):(typeof B.componentDidMount=="function"&&(l.flags|=4194308),l.memoizedProps=v,l.memoizedState=oe),B.props=v,B.state=oe,B.context=ye,v=H):(typeof B.componentDidMount=="function"&&(l.flags|=4194308),v=!1)}else{B=l.stateNode,fm(o,l),H=l.memoizedProps,ye=l.type===l.elementType?H:Si(l.type,H),B.props=ye,ht=l.pendingProps,it=B.context,oe=d.contextType,typeof oe=="object"&&oe!==null?oe=ci(oe):(oe=Ot(d)?sn:At.current,oe=Kn(l,oe));var Bt=d.getDerivedStateFromProps;(Xe=typeof Bt=="function"||typeof B.getSnapshotBeforeUpdate=="function")||typeof B.UNSAFE_componentWillReceiveProps!="function"&&typeof B.componentWillReceiveProps!="function"||(H!==ht||it!==oe)&&_m(l,B,v,oe),wr=!1,it=l.memoizedState,B.state=it,Dl(l,v,B,S);var et=l.memoizedState;H!==ht||it!==et||ct.current||wr?(typeof Bt=="function"&&(ef(l,d,Bt,v),et=l.memoizedState),(ye=wr||gm(l,d,ye,v,it,et,oe)||!1)?(Xe||typeof B.UNSAFE_componentWillUpdate!="function"&&typeof B.componentWillUpdate!="function"||(typeof B.componentWillUpdate=="function"&&B.componentWillUpdate(v,et,oe),typeof B.UNSAFE_componentWillUpdate=="function"&&B.UNSAFE_componentWillUpdate(v,et,oe)),typeof B.componentDidUpdate=="function"&&(l.flags|=4),typeof B.getSnapshotBeforeUpdate=="function"&&(l.flags|=1024)):(typeof B.componentDidUpdate!="function"||H===o.memoizedProps&&it===o.memoizedState||(l.flags|=4),typeof B.getSnapshotBeforeUpdate!="function"||H===o.memoizedProps&&it===o.memoizedState||(l.flags|=1024),l.memoizedProps=v,l.memoizedState=et),B.props=v,B.state=et,B.context=oe,v=ye):(typeof B.componentDidUpdate!="function"||H===o.memoizedProps&&it===o.memoizedState||(l.flags|=4),typeof B.getSnapshotBeforeUpdate!="function"||H===o.memoizedProps&&it===o.memoizedState||(l.flags|=1024),v=!1)}return Sf(o,l,d,v,A,S)}function Sf(o,l,d,v,S,A){ng(o,l);var B=(l.flags&128)!==0;if(!v&&!B)return S&&Dn(l,d,!1),rr(o,l,A);v=l.stateNode,Ox.current=l;var H=B&&typeof d.getDerivedStateFromError!="function"?null:v.render();return l.flags|=1,o!==null&&B?(l.child=qs(l,o.child,null,A),l.child=qs(l,null,H,A)):Nn(o,l,H,A),l.memoizedState=v.state,S&&Dn(l,d,!0),l.child}function rg(o){var l=o.stateNode;l.pendingContext?Ht(o,l.pendingContext,l.pendingContext!==l.context):l.context&&Ht(o,l.context,!1),lf(o,l.containerInfo)}function sg(o,l,d,v,S){return Ys(),af(S),l.flags|=256,Nn(o,l,d,v),l.child}var jl={dehydrated:null,treeContext:null,retryLane:0};function Zl(o){return{baseLanes:o,cachePool:null}}function og(o,l,d){var v=l.pendingProps,S=Wt.current,A=!1,B=(l.flags&128)!==0,H;if((H=B)||(H=o!==null&&o.memoizedState===null?!1:(S&2)!==0),H?(A=!0,l.flags&=-129):(o===null||o.memoizedState!==null)&&(S|=1),$e(Wt,S&1),o===null)return of(l),o=l.memoizedState,o!==null&&(o=o.dehydrated,o!==null)?(l.mode&1?ks(o)?l.lanes=8:l.lanes=1073741824:l.lanes=1,null):(S=v.children,o=v.fallback,A?(v=l.mode,A=l.child,S={mode:"hidden",children:S},!(v&1)&&A!==null?(A.childLanes=0,A.pendingProps=S):A=mc(S,v,0,null),o=ns(o,v,d,null),A.return=l,o.return=l,A.sibling=o,l.child=A,l.child.memoizedState=Zl(d),l.memoizedState=jl,o):Mf(l,S));if(S=o.memoizedState,S!==null){if(H=S.dehydrated,H!==null){if(B)return l.flags&256?(l.flags&=-257,Jl(o,l,d,Error(a(422)))):l.memoizedState!==null?(l.child=o.child,l.flags|=128,null):(A=v.fallback,S=l.mode,v=mc({mode:"visible",children:v.children},S,0,null),A=ns(A,S,d,null),A.flags|=2,v.return=l,A.return=l,v.sibling=A,l.child=v,l.mode&1&&qs(l,o.child,null,d),l.child.memoizedState=Zl(d),l.memoizedState=jl,A);if(!(l.mode&1))l=Jl(o,l,d,null);else if(ks(H))l=Jl(o,l,d,Error(a(419)));else if(v=(d&o.childLanes)!==0,ei||v){if(v=$t,v!==null){switch(d&-d){case 4:A=2;break;case 16:A=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:A=32;break;case 536870912:A=268435456;break;default:A=0}v=A&(v.suspendedLanes|d)?0:A,v!==0&&v!==S.retryLane&&(S.retryLane=v,pi(o,v,-1))}Vf(),l=Jl(o,l,d,Error(a(421)))}else zs(H)?(l.flags|=128,l.child=o.child,l=Jx.bind(null,o),yl(H,l),l=null):(d=S.treeContext,N&&($n=Sl(H),Qn=l,Vt=!0,Mi=null,Yo=!1,d!==null&&(ui[hi++]=tr,ui[hi++]=nr,ui[hi++]=jr,tr=d.id,nr=d.overflow,jr=l)),l=Mf(l,l.pendingProps.children),l.flags|=4096);return l}return A?(v=lg(o,l,v.children,v.fallback,d),A=l.child,S=o.child.memoizedState,A.memoizedState=S===null?Zl(d):{baseLanes:S.baseLanes|d,cachePool:null},A.childLanes=o.childLanes&~d,l.memoizedState=jl,v):(d=ag(o,l,v.children,d),l.memoizedState=null,d)}return A?(v=lg(o,l,v.children,v.fallback,d),A=l.child,S=o.child.memoizedState,A.memoizedState=S===null?Zl(d):{baseLanes:S.baseLanes|d,cachePool:null},A.childLanes=o.childLanes&~d,l.memoizedState=jl,v):(d=ag(o,l,v.children,d),l.memoizedState=null,d)}function Mf(o,l){return l=mc({mode:"visible",children:l},o.mode,0,null),l.return=o,o.child=l}function ag(o,l,d,v){var S=o.child;return o=S.sibling,d=Rr(S,{mode:"visible",children:d}),!(l.mode&1)&&(d.lanes=v),d.return=l,d.sibling=null,o!==null&&(v=l.deletions,v===null?(l.deletions=[o],l.flags|=16):v.push(o)),l.child=d}function lg(o,l,d,v,S){var A=l.mode;o=o.child;var B=o.sibling,H={mode:"hidden",children:d};return!(A&1)&&l.child!==o?(d=l.child,d.childLanes=0,d.pendingProps=H,l.deletions=null):(d=Rr(o,H),d.subtreeFlags=o.subtreeFlags&14680064),B!==null?v=Rr(B,v):(v=ns(v,A,S,null),v.flags|=2),v.return=l,d.return=l,d.sibling=v,l.child=d,v}function Jl(o,l,d,v){return v!==null&&af(v),qs(l,o.child,null,d),o=Mf(l,l.pendingProps.children),o.flags|=2,l.memoizedState=null,o}function cg(o,l,d){o.lanes|=l;var v=o.alternate;v!==null&&(v.lanes|=l),Qh(o.return,l,d)}function wf(o,l,d,v,S){var A=o.memoizedState;A===null?o.memoizedState={isBackwards:l,rendering:null,renderingStartTime:0,last:v,tail:d,tailMode:S}:(A.isBackwards=l,A.rendering=null,A.renderingStartTime=0,A.last=v,A.tail=d,A.tailMode=S)}function ug(o,l,d){var v=l.pendingProps,S=v.revealOrder,A=v.tail;if(Nn(o,l,v.children,d),v=Wt.current,v&2)v=v&1|2,l.flags|=128;else{if(o!==null&&o.flags&128)e:for(o=l.child;o!==null;){if(o.tag===13)o.memoizedState!==null&&cg(o,d,l);else if(o.tag===19)cg(o,d,l);else if(o.child!==null){o.child.return=o,o=o.child;continue}if(o===l)break e;for(;o.sibling===null;){if(o.return===null||o.return===l)break e;o=o.return}o.sibling.return=o.return,o=o.sibling}v&=1}if($e(Wt,v),!(l.mode&1))l.memoizedState=null;else switch(S){case"forwards":for(d=l.child,S=null;d!==null;)o=d.alternate,o!==null&&Bl(o)===null&&(S=d),d=d.sibling;d=S,d===null?(S=l.child,l.child=null):(S=d.sibling,d.sibling=null),wf(l,!1,S,d,A);break;case"backwards":for(d=null,S=l.child,l.child=null;S!==null;){if(o=S.alternate,o!==null&&Bl(o)===null){l.child=S;break}o=S.sibling,S.sibling=d,d=S,S=o}wf(l,!0,d,null,A);break;case"together":wf(l,!1,null,null,void 0);break;default:l.memoizedState=null}return l.child}function rr(o,l,d){if(o!==null&&(l.dependencies=o.dependencies),Qs|=l.lanes,!(d&l.childLanes))return null;if(o!==null&&l.child!==o.child)throw Error(a(153));if(l.child!==null){for(o=l.child,d=Rr(o,o.pendingProps),l.child=d,d.return=l;o.sibling!==null;)o=o.sibling,d=d.sibling=Rr(o,o.pendingProps),d.return=l;d.sibling=null}return l.child}function Bx(o,l,d){switch(l.tag){case 3:rg(l),Ys();break;case 5:Tm(l);break;case 1:Ot(l.type)&&Mr(l);break;case 4:lf(l,l.stateNode.containerInfo);break;case 10:hm(l,l.type._context,l.memoizedProps.value);break;case 13:var v=l.memoizedState;if(v!==null)return v.dehydrated!==null?($e(Wt,Wt.current&1),l.flags|=128,null):d&l.child.childLanes?og(o,l,d):($e(Wt,Wt.current&1),o=rr(o,l,d),o!==null?o.sibling:null);$e(Wt,Wt.current&1);break;case 19:if(v=(d&l.childLanes)!==0,o.flags&128){if(v)return ug(o,l,d);l.flags|=128}var S=l.memoizedState;if(S!==null&&(S.rendering=null,S.tail=null,S.lastEffect=null),$e(Wt,Wt.current),v)break;return null;case 22:case 23:return l.lanes=0,tg(o,l,d)}return rr(o,l,d)}function zx(o,l){switch(rf(l),l.tag){case 1:return Ot(l.type)&&Sr(),o=l.flags,o&65536?(l.flags=o&-65537|128,l):null;case 3:return Zs(),_t(ct),_t(At),hf(),o=l.flags,o&65536&&!(o&128)?(l.flags=o&-65537|128,l):null;case 5:return cf(l),null;case 13:if(_t(Wt),o=l.memoizedState,o!==null&&o.dehydrated!==null){if(l.alternate===null)throw Error(a(340));Ys()}return o=l.flags,o&65536?(l.flags=o&-65537|128,l):null;case 19:return _t(Wt),null;case 4:return Zs(),null;case 10:return Kh(l.type._context),null;case 22:case 23:return Hf(),null;case 24:return null;default:return null}}var Kl=!1,Kr=!1,kx=typeof WeakSet=="function"?WeakSet:Set,Ie=null;function Ql(o,l){var d=o.ref;if(d!==null)if(typeof d=="function")try{d(null)}catch(v){Gn(o,l,v)}else d.current=null}function Ef(o,l,d){try{d()}catch(v){Gn(o,l,v)}}var hg=!1;function Hx(o,l){for(ae(o.containerInfo),Ie=l;Ie!==null;)if(o=Ie,l=o.child,(o.subtreeFlags&1028)!==0&&l!==null)l.return=o,Ie=l;else for(;Ie!==null;){o=Ie;try{var d=o.alternate;if(o.flags&1024)switch(o.tag){case 0:case 11:case 15:break;case 1:if(d!==null){var v=d.memoizedProps,S=d.memoizedState,A=o.stateNode,B=A.getSnapshotBeforeUpdate(o.elementType===o.type?v:Si(o.type,v),S);A.__reactInternalSnapshotBeforeUpdate=B}break;case 3:Re&&Fe(o.stateNode.containerInfo);break;case 5:case 6:case 4:case 17:break;default:throw Error(a(163))}}catch(H){Gn(o,o.return,H)}if(l=o.sibling,l!==null){l.return=o.return,Ie=l;break}Ie=o.return}return d=hg,hg=!1,d}function Qr(o,l,d){var v=l.updateQueue;if(v=v!==null?v.lastEffect:null,v!==null){var S=v=v.next;do{if((S.tag&o)===o){var A=S.destroy;S.destroy=void 0,A!==void 0&&Ef(l,d,A)}S=S.next}while(S!==v)}}function ra(o,l){if(l=l.updateQueue,l=l!==null?l.lastEffect:null,l!==null){var d=l=l.next;do{if((d.tag&o)===o){var v=d.create;d.destroy=v()}d=d.next}while(d!==l)}}function Af(o){var l=o.ref;if(l!==null){var d=o.stateNode;switch(o.tag){case 5:o=j(d);break;default:o=d}typeof l=="function"?l(o):l.current=o}}function fg(o,l,d){if(Ui&&typeof Ui.onCommitFiberUnmount=="function")try{Ui.onCommitFiberUnmount(bl,l)}catch{}switch(l.tag){case 0:case 11:case 14:case 15:if(o=l.updateQueue,o!==null&&(o=o.lastEffect,o!==null)){var v=o=o.next;do{var S=v,A=S.destroy;S=S.tag,A!==void 0&&(S&2||S&4)&&Ef(l,d,A),v=v.next}while(v!==o)}break;case 1:if(Ql(l,d),o=l.stateNode,typeof o.componentWillUnmount=="function")try{o.props=l.memoizedProps,o.state=l.memoizedState,o.componentWillUnmount()}catch(B){Gn(l,d,B)}break;case 5:Ql(l,d);break;case 4:Re?_g(o,l,d):he&&he&&(l=l.stateNode.containerInfo,d=wt(l),Et(l,d))}}function dg(o,l,d){for(var v=l;;)if(fg(o,v,d),v.child===null||Re&&v.tag===4){if(v===l)break;for(;v.sibling===null;){if(v.return===null||v.return===l)return;v=v.return}v.sibling.return=v.return,v=v.sibling}else v.child.return=v,v=v.child}function pg(o){var l=o.alternate;l!==null&&(o.alternate=null,pg(l)),o.child=null,o.deletions=null,o.sibling=null,o.tag===5&&(l=o.stateNode,l!==null&&Se(l)),o.stateNode=null,o.return=null,o.dependencies=null,o.memoizedProps=null,o.memoizedState=null,o.pendingProps=null,o.stateNode=null,o.updateQueue=null}function mg(o){return o.tag===5||o.tag===3||o.tag===4}function gg(o){e:for(;;){for(;o.sibling===null;){if(o.return===null||mg(o.return))return null;o=o.return}for(o.sibling.return=o.return,o=o.sibling;o.tag!==5&&o.tag!==6&&o.tag!==18;){if(o.flags&2||o.child===null||o.tag===4)continue e;o.child.return=o,o=o.child}if(!(o.flags&2))return o.stateNode}}function vg(o){if(Re){e:{for(var l=o.return;l!==null;){if(mg(l))break e;l=l.return}throw Error(a(160))}var d=l;switch(d.tag){case 5:l=d.stateNode,d.flags&32&&(Nt(l),d.flags&=-33),d=gg(o),bf(o,d,l);break;case 3:case 4:l=d.stateNode.containerInfo,d=gg(o),Tf(o,d,l);break;default:throw Error(a(161))}}}function Tf(o,l,d){var v=o.tag;if(v===5||v===6)o=o.stateNode,l?Ve(d,o,l):St(d,o);else if(v!==4&&(o=o.child,o!==null))for(Tf(o,l,d),o=o.sibling;o!==null;)Tf(o,l,d),o=o.sibling}function bf(o,l,d){var v=o.tag;if(v===5||v===6)o=o.stateNode,l?lt(d,o,l):ke(d,o);else if(v!==4&&(o=o.child,o!==null))for(bf(o,l,d),o=o.sibling;o!==null;)bf(o,l,d),o=o.sibling}function _g(o,l,d){for(var v=l,S=!1,A,B;;){if(!S){S=v.return;e:for(;;){if(S===null)throw Error(a(160));switch(A=S.stateNode,S.tag){case 5:B=!1;break e;case 3:A=A.containerInfo,B=!0;break e;case 4:A=A.containerInfo,B=!0;break e}S=S.return}S=!0}if(v.tag===5||v.tag===6)dg(o,v,d),B?ut(A,v.stateNode):Mt(A,v.stateNode);else if(v.tag===18)B?$(A,v.stateNode):Q(A,v.stateNode);else if(v.tag===4){if(v.child!==null){A=v.stateNode.containerInfo,B=!0,v.child.return=v,v=v.child;continue}}else if(fg(o,v,d),v.child!==null){v.child.return=v,v=v.child;continue}if(v===l)break;for(;v.sibling===null;){if(v.return===null||v.return===l)return;v=v.return,v.tag===4&&(S=!1)}v.sibling.return=v.return,v=v.sibling}}function Cf(o,l){if(Re){switch(l.tag){case 0:case 11:case 14:case 15:Qr(3,l,l.return),ra(3,l),Qr(5,l,l.return);return;case 1:return;case 5:var d=l.stateNode;if(d!=null){var v=l.memoizedProps;o=o!==null?o.memoizedProps:v;var S=l.type,A=l.updateQueue;l.updateQueue=null,A!==null&&at(d,A,S,o,v,l)}return;case 6:if(l.stateNode===null)throw Error(a(162));d=l.memoizedProps,_e(l.stateNode,o!==null?o.memoizedProps:d,d);return;case 3:N&&o!==null&&o.memoizedState.isDehydrated&&I(l.stateNode.containerInfo);return;case 12:return;case 13:$l(l);return;case 19:$l(l);return;case 17:return}throw Error(a(163))}switch(l.tag){case 0:case 11:case 14:case 15:Qr(3,l,l.return),ra(3,l),Qr(5,l,l.return);return;case 12:return;case 13:$l(l);return;case 19:$l(l);return;case 3:N&&o!==null&&o.memoizedState.isDehydrated&&I(l.stateNode.containerInfo);break;case 22:case 23:return}e:if(he){switch(l.tag){case 1:case 5:case 6:break e;case 3:case 4:l=l.stateNode,Et(l.containerInfo,l.pendingChildren);break e}throw Error(a(163))}}function $l(o){var l=o.updateQueue;if(l!==null){o.updateQueue=null;var d=o.stateNode;d===null&&(d=o.stateNode=new kx),l.forEach(function(v){var S=Kx.bind(null,o,v);d.has(v)||(d.add(v),v.then(S,S))})}}function Vx(o,l){for(Ie=l;Ie!==null;){l=Ie;var d=l.deletions;if(d!==null)for(var v=0;v<d.length;v++){var S=d[v];try{var A=o;Re?_g(A,S,l):dg(A,S,l);var B=S.alternate;B!==null&&(B.return=null),S.return=null}catch(Qe){Gn(S,l,Qe)}}if(d=l.child,l.subtreeFlags&12854&&d!==null)d.return=l,Ie=d;else for(;Ie!==null;){l=Ie;try{var H=l.flags;if(H&32&&Re&&Nt(l.stateNode),H&512){var oe=l.alternate;if(oe!==null){var ye=oe.ref;ye!==null&&(typeof ye=="function"?ye(null):ye.current=null)}}if(H&8192)switch(l.tag){case 13:if(l.memoizedState!==null){var Xe=l.alternate;(Xe===null||Xe.memoizedState===null)&&(Nf=cn())}break;case 22:var ht=l.memoizedState!==null,it=l.alternate,Bt=it!==null&&it.memoizedState!==null;if(d=l,Re){e:if(v=d,S=ht,A=null,Re)for(var et=v;;){if(et.tag===5){if(A===null){A=et;var Tn=et.stateNode;S?V(Tn):se(et.stateNode,et.memoizedProps)}}else if(et.tag===6){if(A===null){var gi=et.stateNode;S?Be(gi):ge(gi,et.memoizedProps)}}else if((et.tag!==22&&et.tag!==23||et.memoizedState===null||et===v)&&et.child!==null){et.child.return=et,et=et.child;continue}if(et===v)break;for(;et.sibling===null;){if(et.return===null||et.return===v)break e;A===et&&(A=null),et=et.return}A===et&&(A=null),et.sibling.return=et.return,et=et.sibling}}if(ht&&!Bt&&d.mode&1){Ie=d;for(var K=d.child;K!==null;){for(d=Ie=K;Ie!==null;){v=Ie;var X=v.child;switch(v.tag){case 0:case 11:case 14:case 15:Qr(4,v,v.return);break;case 1:Ql(v,v.return);var te=v.stateNode;if(typeof te.componentWillUnmount=="function"){var De=v.return;try{te.props=v.memoizedProps,te.state=v.memoizedState,te.componentWillUnmount()}catch(Qe){Gn(v,De,Qe)}}break;case 5:Ql(v,v.return);break;case 22:if(v.memoizedState!==null){Sg(d);continue}}X!==null?(X.return=v,Ie=X):Sg(d)}K=K.sibling}}}switch(H&4102){case 2:vg(l),l.flags&=-3;break;case 6:vg(l),l.flags&=-3,Cf(l.alternate,l);break;case 4096:l.flags&=-4097;break;case 4100:l.flags&=-4097,Cf(l.alternate,l);break;case 4:Cf(l.alternate,l)}}catch(Qe){Gn(l,l.return,Qe)}if(d=l.sibling,d!==null){d.return=l.return,Ie=d;break}Ie=l.return}}}function Gx(o,l,d){Ie=o,yg(o)}function yg(o,l,d){for(var v=(o.mode&1)!==0;Ie!==null;){var S=Ie,A=S.child;if(S.tag===22&&v){var B=S.memoizedState!==null||Kl;if(!B){var H=S.alternate,oe=H!==null&&H.memoizedState!==null||Kr;H=Kl;var ye=Kr;if(Kl=B,(Kr=oe)&&!ye)for(Ie=S;Ie!==null;)B=Ie,oe=B.child,B.tag===22&&B.memoizedState!==null?Mg(S):oe!==null?(oe.return=B,Ie=oe):Mg(S);for(;A!==null;)Ie=A,yg(A),A=A.sibling;Ie=S,Kl=H,Kr=ye}xg(o)}else S.subtreeFlags&8772&&A!==null?(A.return=S,Ie=A):xg(o)}}function xg(o){for(;Ie!==null;){var l=Ie;if(l.flags&8772){var d=l.alternate;try{if(l.flags&8772)switch(l.tag){case 0:case 11:case 15:Kr||ra(5,l);break;case 1:var v=l.stateNode;if(l.flags&4&&!Kr)if(d===null)v.componentDidMount();else{var S=l.elementType===l.type?d.memoizedProps:Si(l.type,d.memoizedProps);v.componentDidUpdate(S,d.memoizedState,v.__reactInternalSnapshotBeforeUpdate)}var A=l.updateQueue;A!==null&&pm(l,A,v);break;case 3:var B=l.updateQueue;if(B!==null){if(d=null,l.child!==null)switch(l.child.tag){case 5:d=j(l.child.stateNode);break;case 1:d=l.child.stateNode}pm(l,B,d)}break;case 5:var H=l.stateNode;d===null&&l.flags&4&&He(H,l.type,l.memoizedProps,l);break;case 6:break;case 4:break;case 12:break;case 13:if(N&&l.memoizedState===null){var oe=l.alternate;if(oe!==null){var ye=oe.memoizedState;if(ye!==null){var Xe=ye.dehydrated;Xe!==null&&G(Xe)}}}break;case 19:case 17:case 21:case 22:case 23:break;default:throw Error(a(163))}Kr||l.flags&512&&Af(l)}catch(ht){Gn(l,l.return,ht)}}if(l===o){Ie=null;break}if(d=l.sibling,d!==null){d.return=l.return,Ie=d;break}Ie=l.return}}function Sg(o){for(;Ie!==null;){var l=Ie;if(l===o){Ie=null;break}var d=l.sibling;if(d!==null){d.return=l.return,Ie=d;break}Ie=l.return}}function Mg(o){for(;Ie!==null;){var l=Ie;try{switch(l.tag){case 0:case 11:case 15:var d=l.return;try{ra(4,l)}catch(oe){Gn(l,d,oe)}break;case 1:var v=l.stateNode;if(typeof v.componentDidMount=="function"){var S=l.return;try{v.componentDidMount()}catch(oe){Gn(l,S,oe)}}var A=l.return;try{Af(l)}catch(oe){Gn(l,A,oe)}break;case 5:var B=l.return;try{Af(l)}catch(oe){Gn(l,B,oe)}}}catch(oe){Gn(l,l.return,oe)}if(l===o){Ie=null;break}var H=l.sibling;if(H!==null){H.return=l.return,Ie=H;break}Ie=l.return}}var ec=0,tc=1,nc=2,ic=3,rc=4;if(typeof Symbol=="function"&&Symbol.for){var sa=Symbol.for;ec=sa("selector.component"),tc=sa("selector.has_pseudo_class"),nc=sa("selector.role"),ic=sa("selector.test_id"),rc=sa("selector.text")}function Rf(o){var l=we(o);if(l!=null){if(typeof l.memoizedProps["data-testname"]!="string")throw Error(a(364));return l}if(o=R(o),o===null)throw Error(a(362));return o.stateNode.current}function Pf(o,l){switch(l.$$typeof){case ec:if(o.type===l.value)return!0;break;case tc:e:{l=l.value,o=[o,0];for(var d=0;d<o.length;){var v=o[d++],S=o[d++],A=l[S];if(v.tag!==5||!de(v)){for(;A!=null&&Pf(v,A);)S++,A=l[S];if(S===l.length){l=!0;break e}else for(v=v.child;v!==null;)o.push(v,S),v=v.sibling}}l=!1}return l;case nc:if(o.tag===5&&ue(o.stateNode,l.value))return!0;break;case rc:if((o.tag===5||o.tag===6)&&(o=ce(o),o!==null&&0<=o.indexOf(l.value)))return!0;break;case ic:if(o.tag===5&&(o=o.memoizedProps["data-testname"],typeof o=="string"&&o.toLowerCase()===l.value.toLowerCase()))return!0;break;default:throw Error(a(365))}return!1}function If(o){switch(o.$$typeof){case ec:return"<"+(L(o.value)||"Unknown")+">";case tc:return":has("+(If(o)||"")+")";case nc:return'[role="'+o.value+'"]';case rc:return'"'+o.value+'"';case ic:return'[data-testname="'+o.value+'"]';default:throw Error(a(365))}}function wg(o,l){var d=[];o=[o,0];for(var v=0;v<o.length;){var S=o[v++],A=o[v++],B=l[A];if(S.tag!==5||!de(S)){for(;B!=null&&Pf(S,B);)A++,B=l[A];if(A===l.length)d.push(S);else for(S=S.child;S!==null;)o.push(S,A),S=S.sibling}}return d}function Lf(o,l){if(!F)throw Error(a(363));o=Rf(o),o=wg(o,l),l=[],o=Array.from(o);for(var d=0;d<o.length;){var v=o[d++];if(v.tag===5)de(v)||l.push(v.stateNode);else for(v=v.child;v!==null;)o.push(v),v=v.sibling}return l}var Wx=Math.ceil,sc=c.ReactCurrentDispatcher,Df=c.ReactCurrentOwner,Jt=c.ReactCurrentBatchConfig,yt=0,$t=null,en=null,vn=0,ti=0,Ks=Ut(0),on=0,oa=null,Qs=0,oc=0,Uf=0,aa=null,Hn=null,Nf=0,Ff=1/0;function $s(){Ff=cn()+500}var ac=!1,Of=null,Ar=null,lc=!1,Tr=null,cc=0,la=0,Bf=null,uc=-1,hc=0;function Fn(){return yt&6?cn():uc!==-1?uc:uc=cn()}function br(o){return o.mode&1?yt&2&&vn!==0?vn&-vn:Tx.transition!==null?(hc===0&&(o=El,El<<=1,!(El&4194240)&&(El=64),hc=o),hc):(o=Pt,o!==0?o:ve()):1}function pi(o,l,d){if(50<la)throw la=0,Bf=null,Error(a(185));var v=fc(o,l);return v===null?null:(Xo(v,l,d),(!(yt&2)||v!==$t)&&(v===$t&&(!(yt&2)&&(oc|=l),on===4&&Cr(v,vn)),Vn(v,d),l===1&&yt===0&&!(o.mode&1)&&($s(),Cl&&Fi())),v)}function fc(o,l){o.lanes|=l;var d=o.alternate;for(d!==null&&(d.lanes|=l),d=o,o=o.return;o!==null;)o.childLanes|=l,d=o.alternate,d!==null&&(d.childLanes|=l),d=o,o=o.return;return d.tag===3?d.stateNode:null}function Vn(o,l){var d=o.callbackNode;vx(o,l);var v=Tl(o,o===$t?vn:0);if(v===0)d!==null&&cm(d),o.callbackNode=null,o.callbackPriority=0;else if(l=v&-v,o.callbackPriority!==l){if(d!=null&&cm(d),l===1)o.tag===0?Ax(Ag.bind(null,o)):um(Ag.bind(null,o)),Je?Le(function(){yt===0&&Fi()}):Xh(Yh,Fi),d=null;else{switch(lm(v)){case 1:d=Yh;break;case 4:d=Sx;break;case 16:d=qh;break;case 536870912:d=Mx;break;default:d=qh}d=Ug(d,Eg.bind(null,o))}o.callbackPriority=l,o.callbackNode=d}}function Eg(o,l){if(uc=-1,hc=0,yt&6)throw Error(a(327));var d=o.callbackNode;if(ts()&&o.callbackNode!==d)return null;var v=Tl(o,o===$t?vn:0);if(v===0)return null;if(v&30||v&o.expiredLanes||l)l=dc(o,v);else{l=v;var S=yt;yt|=2;var A=Cg();($t!==o||vn!==l)&&($s(),$r(o,l));do try{qx();break}catch(H){bg(o,H)}while(!0);Jh(),sc.current=A,yt=S,en!==null?l=0:($t=null,vn=0,l=on)}if(l!==0){if(l===2&&(S=Vh(o),S!==0&&(v=S,l=zf(o,S))),l===1)throw d=oa,$r(o,0),Cr(o,v),Vn(o,cn()),d;if(l===6)Cr(o,v);else{if(S=o.current.alternate,!(v&30)&&!Xx(S)&&(l=dc(o,v),l===2&&(A=Vh(o),A!==0&&(v=A,l=zf(o,A))),l===1))throw d=oa,$r(o,0),Cr(o,v),Vn(o,cn()),d;switch(o.finishedWork=S,o.finishedLanes=v,l){case 0:case 1:throw Error(a(345));case 2:es(o,Hn);break;case 3:if(Cr(o,v),(v&130023424)===v&&(l=Nf+500-cn(),10<l)){if(Tl(o,0)!==0)break;if(S=o.suspendedLanes,(S&v)!==v){Fn(),o.pingedLanes|=o.suspendedLanes&S;break}o.timeoutHandle=Ae(es.bind(null,o,Hn),l);break}es(o,Hn);break;case 4:if(Cr(o,v),(v&4194240)===v)break;for(l=o.eventTimes,S=-1;0<v;){var B=31-Un(v);A=1<<B,B=l[B],B>S&&(S=B),v&=~A}if(v=S,v=cn()-v,v=(120>v?120:480>v?480:1080>v?1080:1920>v?1920:3e3>v?3e3:4320>v?4320:1960*Wx(v/1960))-v,10<v){o.timeoutHandle=Ae(es.bind(null,o,Hn),v);break}es(o,Hn);break;case 5:es(o,Hn);break;default:throw Error(a(329))}}}return Vn(o,cn()),o.callbackNode===d?Eg.bind(null,o):null}function zf(o,l){var d=aa;return o.current.memoizedState.isDehydrated&&($r(o,l).flags|=256),o=dc(o,l),o!==2&&(l=Hn,Hn=d,l!==null&&kf(l)),o}function kf(o){Hn===null?Hn=o:Hn.push.apply(Hn,o)}function Xx(o){for(var l=o;;){if(l.flags&16384){var d=l.updateQueue;if(d!==null&&(d=d.stores,d!==null))for(var v=0;v<d.length;v++){var S=d[v],A=S.getSnapshot;S=S.value;try{if(!Ni(A(),S))return!1}catch{return!1}}}if(d=l.child,l.subtreeFlags&16384&&d!==null)d.return=l,l=d;else{if(l===o)break;for(;l.sibling===null;){if(l.return===null||l.return===o)return!0;l=l.return}l.sibling.return=l.return,l=l.sibling}}return!0}function Cr(o,l){for(l&=~Uf,l&=~oc,o.suspendedLanes|=l,o.pingedLanes&=~l,o=o.expirationTimes;0<l;){var d=31-Un(l),v=1<<d;o[d]=-1,l&=~v}}function Ag(o){if(yt&6)throw Error(a(327));ts();var l=Tl(o,0);if(!(l&1))return Vn(o,cn()),null;var d=dc(o,l);if(o.tag!==0&&d===2){var v=Vh(o);v!==0&&(l=v,d=zf(o,v))}if(d===1)throw d=oa,$r(o,0),Cr(o,l),Vn(o,cn()),d;if(d===6)throw Error(a(345));return o.finishedWork=o.current.alternate,o.finishedLanes=l,es(o,Hn),Vn(o,cn()),null}function Tg(o){Tr!==null&&Tr.tag===0&&!(yt&6)&&ts();var l=yt;yt|=1;var d=Jt.transition,v=Pt;try{if(Jt.transition=null,Pt=1,o)return o()}finally{Pt=v,Jt.transition=d,yt=l,!(yt&6)&&Fi()}}function Hf(){ti=Ks.current,_t(Ks)}function $r(o,l){o.finishedWork=null,o.finishedLanes=0;var d=o.timeoutHandle;if(d!==nt&&(o.timeoutHandle=nt,tt(d)),en!==null)for(d=en.return;d!==null;){var v=d;switch(rf(v),v.tag){case 1:v=v.type.childContextTypes,v!=null&&Sr();break;case 3:Zs(),_t(ct),_t(At),hf();break;case 5:cf(v);break;case 4:Zs();break;case 13:_t(Wt);break;case 19:_t(Wt);break;case 10:Kh(v.type._context);break;case 22:case 23:Hf()}d=d.return}if($t=o,en=o=Rr(o.current,null),vn=ti=l,on=0,oa=null,Uf=oc=Qs=0,Hn=aa=null,Oi!==null){for(l=0;l<Oi.length;l++)if(d=Oi[l],v=d.interleaved,v!==null){d.interleaved=null;var S=v.next,A=d.pending;if(A!==null){var B=A.next;A.next=S,v.next=B}d.pending=v}Oi=null}return o}function bg(o,l){do{var d=en;try{if(Jh(),zl.current=Xl,kl){for(var v=Yt.memoizedState;v!==null;){var S=v.queue;S!==null&&(S.pending=null),v=v.next}kl=!1}if(Js=0,un=wn=Yt=null,Ko=!1,Qo=0,Df.current=null,d===null||d.return===null){on=1,oa=l,en=null;break}e:{var A=o,B=d.return,H=d,oe=l;if(l=vn,H.flags|=32768,oe!==null&&typeof oe=="object"&&typeof oe.then=="function"){var ye=oe,Xe=H,ht=Xe.tag;if(!(Xe.mode&1)&&(ht===0||ht===11||ht===15)){var it=Xe.alternate;it?(Xe.updateQueue=it.updateQueue,Xe.memoizedState=it.memoizedState,Xe.lanes=it.lanes):(Xe.updateQueue=null,Xe.memoizedState=null)}var Bt=jm(B);if(Bt!==null){Bt.flags&=-257,Zm(Bt,B,H,A,l),Bt.mode&1&&qm(A,ye,l),l=Bt,oe=ye;var et=l.updateQueue;if(et===null){var Tn=new Set;Tn.add(oe),l.updateQueue=Tn}else et.add(oe);break e}else{if(!(l&1)){qm(A,ye,l),Vf();break e}oe=Error(a(426))}}else if(Vt&&H.mode&1){var gi=jm(B);if(gi!==null){!(gi.flags&65536)&&(gi.flags|=256),Zm(gi,B,H,A,l),af(oe);break e}}A=oe,on!==4&&(on=2),aa===null?aa=[A]:aa.push(A),oe=_f(oe,H),H=B;do{switch(H.tag){case 3:H.flags|=65536,l&=-l,H.lanes|=l;var K=Xm(H,oe,l);dm(H,K);break e;case 1:A=oe;var X=H.type,te=H.stateNode;if(!(H.flags&128)&&(typeof X.getDerivedStateFromError=="function"||te!==null&&typeof te.componentDidCatch=="function"&&(Ar===null||!Ar.has(te)))){H.flags|=65536,l&=-l,H.lanes|=l;var De=Ym(H,A,l);dm(H,De);break e}}H=H.return}while(H!==null)}Pg(d)}catch(Qe){l=Qe,en===d&&d!==null&&(en=d=d.return);continue}break}while(!0)}function Cg(){var o=sc.current;return sc.current=Xl,o===null?Xl:o}function Vf(){(on===0||on===3||on===2)&&(on=4),$t===null||!(Qs&268435455)&&!(oc&268435455)||Cr($t,vn)}function dc(o,l){var d=yt;yt|=2;var v=Cg();$t===o&&vn===l||$r(o,l);do try{Yx();break}catch(S){bg(o,S)}while(!0);if(Jh(),yt=d,sc.current=v,en!==null)throw Error(a(261));return $t=null,vn=0,on}function Yx(){for(;en!==null;)Rg(en)}function qx(){for(;en!==null&&!yx();)Rg(en)}function Rg(o){var l=Dg(o.alternate,o,ti);o.memoizedProps=o.pendingProps,l===null?Pg(o):en=l,Df.current=null}function Pg(o){var l=o;do{var d=l.alternate;if(o=l.return,l.flags&32768){if(d=zx(d,l),d!==null){d.flags&=32767,en=d;return}if(o!==null)o.flags|=32768,o.subtreeFlags=0,o.deletions=null;else{on=6,en=null;return}}else if(d=Fx(d,l,ti),d!==null){en=d;return}if(l=l.sibling,l!==null){en=l;return}en=l=o}while(l!==null);on===0&&(on=5)}function es(o,l){var d=Pt,v=Jt.transition;try{Jt.transition=null,Pt=1,jx(o,l,d)}finally{Jt.transition=v,Pt=d}return null}function jx(o,l,d){do ts();while(Tr!==null);if(yt&6)throw Error(a(327));var v=o.finishedWork,S=o.finishedLanes;if(v===null)return null;if(o.finishedWork=null,o.finishedLanes=0,v===o.current)throw Error(a(177));o.callbackNode=null,o.callbackPriority=0;var A=v.lanes|v.childLanes;if(_x(o,A),o===$t&&(en=$t=null,vn=0),!(v.subtreeFlags&2064)&&!(v.flags&2064)||lc||(lc=!0,Ug(qh,function(){return ts(),null})),A=(v.flags&15990)!==0,v.subtreeFlags&15990||A){A=Jt.transition,Jt.transition=null;var B=Pt;Pt=1;var H=yt;yt|=4,Df.current=null,Hx(o,v),Vx(o,v),ee(o.containerInfo),o.current=v,Gx(v),xx(),yt=H,Pt=B,Jt.transition=A}else o.current=v;if(lc&&(lc=!1,Tr=o,cc=S),A=o.pendingLanes,A===0&&(Ar=null),wx(v.stateNode),Vn(o,cn()),l!==null)for(d=o.onRecoverableError,v=0;v<l.length;v++)d(l[v]);if(ac)throw ac=!1,o=Of,Of=null,o;return cc&1&&o.tag!==0&&ts(),A=o.pendingLanes,A&1?o===Bf?la++:(la=0,Bf=o):la=0,Fi(),null}function ts(){if(Tr!==null){var o=lm(cc),l=Jt.transition,d=Pt;try{if(Jt.transition=null,Pt=16>o?16:o,Tr===null)var v=!1;else{if(o=Tr,Tr=null,cc=0,yt&6)throw Error(a(331));var S=yt;for(yt|=4,Ie=o.current;Ie!==null;){var A=Ie,B=A.child;if(Ie.flags&16){var H=A.deletions;if(H!==null){for(var oe=0;oe<H.length;oe++){var ye=H[oe];for(Ie=ye;Ie!==null;){var Xe=Ie;switch(Xe.tag){case 0:case 11:case 15:Qr(8,Xe,A)}var ht=Xe.child;if(ht!==null)ht.return=Xe,Ie=ht;else for(;Ie!==null;){Xe=Ie;var it=Xe.sibling,Bt=Xe.return;if(pg(Xe),Xe===ye){Ie=null;break}if(it!==null){it.return=Bt,Ie=it;break}Ie=Bt}}}var et=A.alternate;if(et!==null){var Tn=et.child;if(Tn!==null){et.child=null;do{var gi=Tn.sibling;Tn.sibling=null,Tn=gi}while(Tn!==null)}}Ie=A}}if(A.subtreeFlags&2064&&B!==null)B.return=A,Ie=B;else e:for(;Ie!==null;){if(A=Ie,A.flags&2048)switch(A.tag){case 0:case 11:case 15:Qr(9,A,A.return)}var K=A.sibling;if(K!==null){K.return=A.return,Ie=K;break e}Ie=A.return}}var X=o.current;for(Ie=X;Ie!==null;){B=Ie;var te=B.child;if(B.subtreeFlags&2064&&te!==null)te.return=B,Ie=te;else e:for(B=X;Ie!==null;){if(H=Ie,H.flags&2048)try{switch(H.tag){case 0:case 11:case 15:ra(9,H)}}catch(Qe){Gn(H,H.return,Qe)}if(H===B){Ie=null;break e}var De=H.sibling;if(De!==null){De.return=H.return,Ie=De;break e}Ie=H.return}}if(yt=S,Fi(),Ui&&typeof Ui.onPostCommitFiberRoot=="function")try{Ui.onPostCommitFiberRoot(bl,o)}catch{}v=!0}return v}finally{Pt=d,Jt.transition=l}}return!1}function Ig(o,l,d){l=_f(d,l),l=Xm(o,l,1),Er(o,l),l=Fn(),o=fc(o,1),o!==null&&(Xo(o,1,l),Vn(o,l))}function Gn(o,l,d){if(o.tag===3)Ig(o,o,d);else for(;l!==null;){if(l.tag===3){Ig(l,o,d);break}else if(l.tag===1){var v=l.stateNode;if(typeof l.type.getDerivedStateFromError=="function"||typeof v.componentDidCatch=="function"&&(Ar===null||!Ar.has(v))){o=_f(d,o),o=Ym(l,o,1),Er(l,o),o=Fn(),l=fc(l,1),l!==null&&(Xo(l,1,o),Vn(l,o));break}}l=l.return}}function Zx(o,l,d){var v=o.pingCache;v!==null&&v.delete(l),l=Fn(),o.pingedLanes|=o.suspendedLanes&d,$t===o&&(vn&d)===d&&(on===4||on===3&&(vn&130023424)===vn&&500>cn()-Nf?$r(o,0):Uf|=d),Vn(o,l)}function Lg(o,l){l===0&&(o.mode&1?(l=Al,Al<<=1,!(Al&130023424)&&(Al=4194304)):l=1);var d=Fn();o=fc(o,l),o!==null&&(Xo(o,l,d),Vn(o,d))}function Jx(o){var l=o.memoizedState,d=0;l!==null&&(d=l.retryLane),Lg(o,d)}function Kx(o,l){var d=0;switch(o.tag){case 13:var v=o.stateNode,S=o.memoizedState;S!==null&&(d=S.retryLane);break;case 19:v=o.stateNode;break;default:throw Error(a(314))}v!==null&&v.delete(l),Lg(o,d)}var Dg;Dg=function(o,l,d){if(o!==null)if(o.memoizedProps!==l.pendingProps||ct.current)ei=!0;else{if(!(o.lanes&d)&&!(l.flags&128))return ei=!1,Bx(o,l,d);ei=!!(o.flags&131072)}else ei=!1,Vt&&l.flags&1048576&&ym(l,Fl,l.index);switch(l.lanes=0,l.tag){case 2:var v=l.type;o!==null&&(o.alternate=null,l.alternate=null,l.flags|=2),o=l.pendingProps;var S=Kn(l,At.current);Gs(l,d),S=df(null,l,v,o,S,d);var A=pf();return l.flags|=1,typeof S=="object"&&S!==null&&typeof S.render=="function"&&S.$$typeof===void 0?(l.tag=1,l.memoizedState=null,l.updateQueue=null,Ot(v)?(A=!0,Mr(l)):A=!1,l.memoizedState=S.state!==null&&S.state!==void 0?S.state:null,$h(l),S.updater=Ul,l.stateNode=S,S._reactInternals=l,tf(l,v,o,d),l=Sf(null,l,v,!0,A,d)):(l.tag=0,Vt&&A&&nf(l),Nn(null,l,S,d),l=l.child),l;case 16:v=l.elementType;e:{switch(o!==null&&(o.alternate=null,l.alternate=null,l.flags|=2),o=l.pendingProps,S=v._init,v=S(v._payload),l.type=v,S=l.tag=$x(v),o=Si(v,o),S){case 0:l=xf(null,l,v,o,d);break e;case 1:l=ig(null,l,v,o,d);break e;case 11:l=Qm(null,l,v,o,d);break e;case 14:l=$m(null,l,v,Si(v.type,o),d);break e}throw Error(a(306,v,""))}return l;case 0:return v=l.type,S=l.pendingProps,S=l.elementType===v?S:Si(v,S),xf(o,l,v,S,d);case 1:return v=l.type,S=l.pendingProps,S=l.elementType===v?S:Si(v,S),ig(o,l,v,S,d);case 3:e:{if(rg(l),o===null)throw Error(a(387));v=l.pendingProps,A=l.memoizedState,S=A.element,fm(o,l),Dl(l,v,null,d);var B=l.memoizedState;if(v=B.element,N&&A.isDehydrated)if(A={element:v,isDehydrated:!1,cache:B.cache,transitions:B.transitions},l.updateQueue.baseState=A,l.memoizedState=A,l.flags&256){S=Error(a(423)),l=sg(o,l,v,d,S);break e}else if(v!==S){S=Error(a(424)),l=sg(o,l,v,d,S);break e}else for(N&&($n=Hs(l.stateNode.containerInfo),Qn=l,Vt=!0,Mi=null,Yo=!1),d=Am(l,null,v,d),l.child=d;d;)d.flags=d.flags&-3|4096,d=d.sibling;else{if(Ys(),v===S){l=rr(o,l,d);break e}Nn(o,l,v,d)}l=l.child}return l;case 5:return Tm(l),o===null&&of(l),v=l.type,S=l.pendingProps,A=o!==null?o.memoizedProps:null,B=S.children,me(v,S)?B=null:A!==null&&me(v,A)&&(l.flags|=32),ng(o,l),Nn(o,l,B,d),l.child;case 6:return o===null&&of(l),null;case 13:return og(o,l,d);case 4:return lf(l,l.stateNode.containerInfo),v=l.pendingProps,o===null?l.child=qs(l,null,v,d):Nn(o,l,v,d),l.child;case 11:return v=l.type,S=l.pendingProps,S=l.elementType===v?S:Si(v,S),Qm(o,l,v,S,d);case 7:return Nn(o,l,l.pendingProps,d),l.child;case 8:return Nn(o,l,l.pendingProps.children,d),l.child;case 12:return Nn(o,l,l.pendingProps.children,d),l.child;case 10:e:{if(v=l.type._context,S=l.pendingProps,A=l.memoizedProps,B=S.value,hm(l,v,B),A!==null)if(Ni(A.value,B)){if(A.children===S.children&&!ct.current){l=rr(o,l,d);break e}}else for(A=l.child,A!==null&&(A.return=l);A!==null;){var H=A.dependencies;if(H!==null){B=A.child;for(var oe=H.firstContext;oe!==null;){if(oe.context===v){if(A.tag===1){oe=er(-1,d&-d),oe.tag=2;var ye=A.updateQueue;if(ye!==null){ye=ye.shared;var Xe=ye.pending;Xe===null?oe.next=oe:(oe.next=Xe.next,Xe.next=oe),ye.pending=oe}}A.lanes|=d,oe=A.alternate,oe!==null&&(oe.lanes|=d),Qh(A.return,d,l),H.lanes|=d;break}oe=oe.next}}else if(A.tag===10)B=A.type===l.type?null:A.child;else if(A.tag===18){if(B=A.return,B===null)throw Error(a(341));B.lanes|=d,H=B.alternate,H!==null&&(H.lanes|=d),Qh(B,d,l),B=A.sibling}else B=A.child;if(B!==null)B.return=A;else for(B=A;B!==null;){if(B===l){B=null;break}if(A=B.sibling,A!==null){A.return=B.return,B=A;break}B=B.return}A=B}Nn(o,l,S.children,d),l=l.child}return l;case 9:return S=l.type,v=l.pendingProps.children,Gs(l,d),S=ci(S),v=v(S),l.flags|=1,Nn(o,l,v,d),l.child;case 14:return v=l.type,S=Si(v,l.pendingProps),S=Si(v.type,S),$m(o,l,v,S,d);case 15:return eg(o,l,l.type,l.pendingProps,d);case 17:return v=l.type,S=l.pendingProps,S=l.elementType===v?S:Si(v,S),o!==null&&(o.alternate=null,l.alternate=null,l.flags|=2),l.tag=1,Ot(v)?(o=!0,Mr(l)):o=!1,Gs(l,d),vm(l,v,S),tf(l,v,S,d),Sf(null,l,v,!0,o,d);case 19:return ug(o,l,d);case 22:return tg(o,l,d)}throw Error(a(156,l.tag))};function Ug(o,l){return Xh(o,l)}function Qx(o,l,d,v){this.tag=o,this.key=d,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=l,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=v,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function mi(o,l,d,v){return new Qx(o,l,d,v)}function Gf(o){return o=o.prototype,!(!o||!o.isReactComponent)}function $x(o){if(typeof o=="function")return Gf(o)?1:0;if(o!=null){if(o=o.$$typeof,o===M)return 11;if(o===E)return 14}return 2}function Rr(o,l){var d=o.alternate;return d===null?(d=mi(o.tag,l,o.key,o.mode),d.elementType=o.elementType,d.type=o.type,d.stateNode=o.stateNode,d.alternate=o,o.alternate=d):(d.pendingProps=l,d.type=o.type,d.flags=0,d.subtreeFlags=0,d.deletions=null),d.flags=o.flags&14680064,d.childLanes=o.childLanes,d.lanes=o.lanes,d.child=o.child,d.memoizedProps=o.memoizedProps,d.memoizedState=o.memoizedState,d.updateQueue=o.updateQueue,l=o.dependencies,d.dependencies=l===null?null:{lanes:l.lanes,firstContext:l.firstContext},d.sibling=o.sibling,d.index=o.index,d.ref=o.ref,d}function pc(o,l,d,v,S,A){var B=2;if(v=o,typeof o=="function")Gf(o)&&(B=1);else if(typeof o=="string")B=5;else e:switch(o){case f:return ns(d.children,S,A,l);case p:B=8,S|=8;break;case m:return o=mi(12,d,l,S|2),o.elementType=m,o.lanes=A,o;case x:return o=mi(13,d,l,S),o.elementType=x,o.lanes=A,o;case _:return o=mi(19,d,l,S),o.elementType=_,o.lanes=A,o;case T:return mc(d,S,A,l);default:if(typeof o=="object"&&o!==null)switch(o.$$typeof){case g:B=10;break e;case y:B=9;break e;case M:B=11;break e;case E:B=14;break e;case w:B=16,v=null;break e}throw Error(a(130,o==null?o:typeof o,""))}return l=mi(B,d,l,S),l.elementType=o,l.type=v,l.lanes=A,l}function ns(o,l,d,v){return o=mi(7,o,v,l),o.lanes=d,o}function mc(o,l,d,v){return o=mi(22,o,v,l),o.elementType=T,o.lanes=d,o.stateNode={},o}function Wf(o,l,d){return o=mi(6,o,null,l),o.lanes=d,o}function Xf(o,l,d){return l=mi(4,o.children!==null?o.children:[],o.key,l),l.lanes=d,l.stateNode={containerInfo:o.containerInfo,pendingChildren:null,implementation:o.implementation},l}function eS(o,l,d,v,S){this.tag=l,this.containerInfo=o,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=nt,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Gh(0),this.expirationTimes=Gh(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Gh(0),this.identifierPrefix=v,this.onRecoverableError=S,N&&(this.mutableSourceEagerHydrationData=null)}function Ng(o,l,d,v,S,A,B,H,oe){return o=new eS(o,l,d,H,oe),l===1?(l=1,A===!0&&(l|=8)):l=0,A=mi(3,null,null,l),o.current=A,A.stateNode=o,A.memoizedState={element:v,isDehydrated:d,cache:null,transitions:null},$h(A),o}function Fg(o){if(!o)return Ye;o=o._reactInternals;e:{if(k(o)!==o||o.tag!==1)throw Error(a(170));var l=o;do{switch(l.tag){case 3:l=l.stateNode.context;break e;case 1:if(Ot(l.type)){l=l.stateNode.__reactInternalMemoizedMergedChildContext;break e}}l=l.return}while(l!==null);throw Error(a(171))}if(o.tag===1){var d=o.type;if(Ot(d))return xi(o,d,l)}return l}function Og(o){var l=o._reactInternals;if(l===void 0)throw typeof o.render=="function"?Error(a(188)):(o=Object.keys(o).join(","),Error(a(268,o)));return o=W(l),o===null?null:o.stateNode}function Bg(o,l){if(o=o.memoizedState,o!==null&&o.dehydrated!==null){var d=o.retryLane;o.retryLane=d!==0&&d<l?d:l}}function Yf(o,l){Bg(o,l),(o=o.alternate)&&Bg(o,l)}function tS(o){return o=W(o),o===null?null:o.stateNode}function nS(){return null}return t.attemptContinuousHydration=function(o){if(o.tag===13){var l=Fn();pi(o,134217728,l),Yf(o,134217728)}},t.attemptHydrationAtCurrentPriority=function(o){if(o.tag===13){var l=Fn(),d=br(o);pi(o,d,l),Yf(o,d)}},t.attemptSynchronousHydration=function(o){switch(o.tag){case 3:var l=o.stateNode;if(l.current.memoizedState.isDehydrated){var d=Wo(l.pendingLanes);d!==0&&(Wh(l,d|1),Vn(l,cn()),!(yt&6)&&($s(),Fi()))}break;case 13:var v=Fn();Tg(function(){return pi(o,1,v)}),Yf(o,1)}},t.batchedUpdates=function(o,l){var d=yt;yt|=1;try{return o(l)}finally{yt=d,yt===0&&($s(),Cl&&Fi())}},t.createComponentSelector=function(o){return{$$typeof:ec,value:o}},t.createContainer=function(o,l,d,v,S,A,B){return Ng(o,l,!1,null,d,v,S,A,B)},t.createHasPseudoClassSelector=function(o){return{$$typeof:tc,value:o}},t.createHydrationContainer=function(o,l,d,v,S,A,B,H,oe){return o=Ng(d,v,!0,o,S,A,B,H,oe),o.context=Fg(null),d=o.current,v=Fn(),S=br(d),A=er(v,S),A.callback=l??null,Er(d,A),o.current.lanes=S,Xo(o,S,v),Vn(o,v),o},t.createPortal=function(o,l,d){var v=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:h,key:v==null?null:""+v,children:o,containerInfo:l,implementation:d}},t.createRoleSelector=function(o){return{$$typeof:nc,value:o}},t.createTestNameSelector=function(o){return{$$typeof:ic,value:o}},t.createTextSelector=function(o){return{$$typeof:rc,value:o}},t.deferredUpdates=function(o){var l=Pt,d=Jt.transition;try{return Jt.transition=null,Pt=16,o()}finally{Pt=l,Jt.transition=d}},t.discreteUpdates=function(o,l,d,v,S){var A=Pt,B=Jt.transition;try{return Jt.transition=null,Pt=1,o(l,d,v,S)}finally{Pt=A,Jt.transition=B,yt===0&&$s()}},t.findAllNodes=Lf,t.findBoundingRects=function(o,l){if(!F)throw Error(a(363));l=Lf(o,l),o=[];for(var d=0;d<l.length;d++)o.push(Z(l[d]));for(l=o.length-1;0<l;l--){d=o[l];for(var v=d.x,S=v+d.width,A=d.y,B=A+d.height,H=l-1;0<=H;H--)if(l!==H){var oe=o[H],ye=oe.x,Xe=ye+oe.width,ht=oe.y,it=ht+oe.height;if(v>=ye&&A>=ht&&S<=Xe&&B<=it){o.splice(l,1);break}else if(v!==ye||d.width!==oe.width||it<A||ht>B){if(!(A!==ht||d.height!==oe.height||Xe<v||ye>S)){ye>v&&(oe.width+=ye-v,oe.x=v),Xe<S&&(oe.width=S-ye),o.splice(l,1);break}}else{ht>A&&(oe.height+=ht-A,oe.y=A),it<B&&(oe.height=B-ht),o.splice(l,1);break}}}return o},t.findHostInstance=Og,t.findHostInstanceWithNoPortals=function(o){return o=C(o),o=o!==null?J(o):null,o===null?null:o.stateNode},t.findHostInstanceWithWarning=function(o){return Og(o)},t.flushControlled=function(o){var l=yt;yt|=1;var d=Jt.transition,v=Pt;try{Jt.transition=null,Pt=1,o()}finally{Pt=v,Jt.transition=d,yt=l,yt===0&&($s(),Fi())}},t.flushPassiveEffects=ts,t.flushSync=Tg,t.focusWithin=function(o,l){if(!F)throw Error(a(363));for(o=Rf(o),l=wg(o,l),l=Array.from(l),o=0;o<l.length;){var d=l[o++];if(!de(d)){if(d.tag===5&&qe(d.stateNode))return!0;for(d=d.child;d!==null;)l.push(d),d=d.sibling}}return!1},t.getCurrentUpdatePriority=function(){return Pt},t.getFindAllNodesFailureDescription=function(o,l){if(!F)throw Error(a(363));var d=0,v=[];o=[Rf(o),0];for(var S=0;S<o.length;){var A=o[S++],B=o[S++],H=l[B];if((A.tag!==5||!de(A))&&(Pf(A,H)&&(v.push(If(H)),B++,B>d&&(d=B)),B<l.length))for(A=A.child;A!==null;)o.push(A,B),A=A.sibling}if(d<l.length){for(o=[];d<l.length;d++)o.push(If(l[d]));return`findAllNodes was able to match part of the selector:
  `+(v.join(" > ")+`

No matching component was found for:
  `)+o.join(" > ")}return null},t.getPublicRootInstance=function(o){if(o=o.current,!o.child)return null;switch(o.child.tag){case 5:return j(o.child.stateNode);default:return o.child.stateNode}},t.injectIntoDevTools=function(o){if(o={bundleType:o.bundleType,version:o.version,rendererPackageName:o.rendererPackageName,rendererConfig:o.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:c.ReactCurrentDispatcher,findHostInstanceByFiber:tS,findFiberByHostInstance:o.findFiberByHostInstance||nS,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.0.0-fc46dba67-20220329"},typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u")o=!1;else{var l=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(l.isDisabled||!l.supportsFiber)o=!0;else{try{bl=l.inject(o),Ui=l}catch{}o=!!l.checkDCE}}return o},t.isAlreadyRendering=function(){return!1},t.observeVisibleRects=function(o,l,d,v){if(!F)throw Error(a(363));o=Lf(o,l);var S=Ee(o,d,v).disconnect;return{disconnect:function(){S()}}},t.registerMutableSourceForHydration=function(o,l){var d=l._getVersion;d=d(l._source),o.mutableSourceEagerHydrationData==null?o.mutableSourceEagerHydrationData=[l,d]:o.mutableSourceEagerHydrationData.push(l,d)},t.runWithPriority=function(o,l){var d=Pt;try{return Pt=o,l()}finally{Pt=d}},t.shouldError=function(){return null},t.shouldSuspend=function(){return!1},t.updateContainer=function(o,l,d,v){var S=l.current,A=Fn(),B=br(S);return d=Fg(d),l.context===null?l.context=d:l.pendingContext=d,l=er(A,B),l.payload={element:o},v=v===void 0?null:v,v!==null&&(l.callback=v),Er(S,l),o=pi(S,B,A),o!==null&&Ll(o,S,B),B},t};Gy.exports=SC;var MC=Gy.exports;const wC=rS(MC),im={},EC=r=>void Object.assign(im,r);function AC(r,e){function t(f,{args:p=[],attach:m,...g},y){let M=`${f[0].toUpperCase()}${f.slice(1)}`,x;if(f==="primitive"){if(g.object===void 0)throw new Error("R3F: Primitives without 'object' are invalid!");const _=g.object;x=So(_,{type:f,root:y,attach:m,primitive:!0})}else{const _=im[M];if(!_)throw new Error(`R3F: ${M} is not part of the THREE namespace! Did you forget to extend? See: https://docs.pmnd.rs/react-three-fiber/api/objects#using-3rd-party-objects-declaratively`);if(!Array.isArray(p))throw new Error("R3F: The args prop must be an array!");x=So(new _(...p),{type:f,root:y,attach:m,memoizedProps:{args:p}})}return x.__r3f.attach===void 0&&(x.isBufferGeometry?x.__r3f.attach="geometry":x.isMaterial&&(x.__r3f.attach="material")),M!=="inject"&&Bd(x,g),x}function n(f,p){let m=!1;if(p){var g,y;(g=p.__r3f)!=null&&g.attach?Od(f,p,p.__r3f.attach):p.isObject3D&&f.isObject3D&&(f.add(p),m=!0),m||(y=f.__r3f)==null||y.objects.push(p),p.__r3f||So(p,{}),p.__r3f.parent=f,hp(p),Mo(p)}}function i(f,p,m){let g=!1;if(p){var y,M;if((y=p.__r3f)!=null&&y.attach)Od(f,p,p.__r3f.attach);else if(p.isObject3D&&f.isObject3D){p.parent=f,p.dispatchEvent({type:"added"}),f.dispatchEvent({type:"childadded",child:p});const x=f.children.filter(E=>E!==p),_=x.indexOf(m);f.children=[...x.slice(0,_),p,...x.slice(_)],g=!0}g||(M=f.__r3f)==null||M.objects.push(p),p.__r3f||So(p,{}),p.__r3f.parent=f,hp(p),Mo(p)}}function s(f,p,m=!1){f&&[...f].forEach(g=>a(p,g,m))}function a(f,p,m){if(p){var g,y,M;if(p.__r3f&&(p.__r3f.parent=null),(g=f.__r3f)!=null&&g.objects&&(f.__r3f.objects=f.__r3f.objects.filter(T=>T!==p)),(y=p.__r3f)!=null&&y.attach)Sv(f,p,p.__r3f.attach);else if(p.isObject3D&&f.isObject3D){var x;f.remove(p),(x=p.__r3f)!=null&&x.root&&LC(vu(p),p)}const E=(M=p.__r3f)==null?void 0:M.primitive,w=!E&&(m===void 0?p.dispose!==null:m);if(!E){var _;s((_=p.__r3f)==null?void 0:_.objects,p,w),s(p.children,p,w)}if(delete p.__r3f,w&&p.dispose&&p.type!=="Scene"){const T=()=>{try{p.dispose()}catch{}};typeof IS_REACT_ACT_ENVIRONMENT>"u"?cp.unstable_scheduleCallback(cp.unstable_IdlePriority,T):T()}Mo(f)}}function c(f,p,m,g){var y;const M=(y=f.__r3f)==null?void 0:y.parent;if(!M)return;const x=t(p,m,f.__r3f.root);if(f.children){for(const _ of f.children)_.__r3f&&n(x,_);f.children=f.children.filter(_=>!_.__r3f)}f.__r3f.objects.forEach(_=>n(x,_)),f.__r3f.objects=[],f.__r3f.autoRemovedBeforeAppend||a(M,f),x.parent&&(x.__r3f.autoRemovedBeforeAppend=!0),n(M,x),x.raycast&&x.__r3f.eventCount&&vu(x).getState().internal.interaction.push(x),[g,g.alternate].forEach(_=>{_!==null&&(_.stateNode=x,_.ref&&(typeof _.ref=="function"?_.ref(x):_.ref.current=x))})}const u=()=>{};return{reconciler:wC({createInstance:t,removeChild:a,appendChild:n,appendInitialChild:n,insertBefore:i,supportsMutation:!0,isPrimaryRenderer:!1,supportsPersistence:!1,supportsHydration:!1,noTimeout:-1,appendChildToContainer:(f,p)=>{if(!p)return;const m=f.getState().scene;m.__r3f&&(m.__r3f.root=f,n(m,p))},removeChildFromContainer:(f,p)=>{p&&a(f.getState().scene,p)},insertInContainerBefore:(f,p,m)=>{if(!p||!m)return;const g=f.getState().scene;g.__r3f&&i(g,p,m)},getRootHostContext:()=>null,getChildHostContext:f=>f,finalizeInitialChildren(f){var p;return!!((p=f==null?void 0:f.__r3f)!=null?p:{}).handlers},prepareUpdate(f,p,m,g){var y;if(((y=f==null?void 0:f.__r3f)!=null?y:{}).primitive&&g.object&&g.object!==f)return[!0];{const{args:x=[],children:_,...E}=g,{args:w=[],children:T,...U}=m;if(!Array.isArray(x))throw new Error("R3F: the args prop must be an array!");if(x.some((L,O)=>L!==w[O]))return[!0];const P=Qy(f,E,U,!0);return P.changes.length?[!1,P]:null}},commitUpdate(f,[p,m],g,y,M,x){p?c(f,g,M,x):Bd(f,m)},commitMount(f,p,m,g){var y;const M=(y=f.__r3f)!=null?y:{};f.raycast&&M.handlers&&M.eventCount&&vu(f).getState().internal.interaction.push(f)},getPublicInstance:f=>f,prepareForCommit:()=>null,preparePortalMount:f=>So(f.getState().scene),resetAfterCommit:()=>{},shouldSetTextContent:()=>!1,clearContainer:()=>!1,hideInstance(f){var p;const{attach:m,parent:g}=(p=f.__r3f)!=null?p:{};m&&g&&Sv(g,f,m),f.isObject3D&&(f.visible=!1),Mo(f)},unhideInstance(f,p){var m;const{attach:g,parent:y}=(m=f.__r3f)!=null?m:{};g&&y&&Od(y,f,g),(f.isObject3D&&p.visible==null||p.visible)&&(f.visible=!0),Mo(f)},createTextInstance:u,hideTextInstance:u,unhideTextInstance:u,getCurrentEventPriority:()=>e?e():Co.DefaultEventPriority,beforeActiveInstanceBlur:()=>{},afterActiveInstanceBlur:()=>{},detachDeletedInstance:()=>{},now:typeof performance<"u"&&kt.fun(performance.now)?performance.now:kt.fun(Date.now)?Date.now:()=>0,scheduleTimeout:kt.fun(setTimeout)?setTimeout:void 0,cancelTimeout:kt.fun(clearTimeout)?clearTimeout:void 0}),applyProps:Bd}}var vv,_v;const Fd=r=>"colorSpace"in r||"outputColorSpace"in r,Yy=()=>{var r;return(r=im.ColorManagement)!=null?r:null},qy=r=>r&&r.isOrthographicCamera,TC=r=>r&&r.hasOwnProperty("current"),pl=typeof window<"u"&&((vv=window.document)!=null&&vv.createElement||((_v=window.navigator)==null?void 0:_v.product)==="ReactNative")?ie.useLayoutEffect:ie.useEffect;function jy(r){const e=ie.useRef(r);return pl(()=>void(e.current=r),[r]),e}function bC({set:r}){return pl(()=>(r(new Promise(()=>null)),()=>r(!1)),[r]),null}class Zy extends ie.Component{constructor(...e){super(...e),this.state={error:!1}}componentDidCatch(e){this.props.set(e)}render(){return this.state.error?null:this.props.children}}Zy.getDerivedStateFromError=()=>({error:!0});const Jy="__default",yv=new Map,CC=r=>r&&!!r.memoized&&!!r.changes;function Ky(r){var e;const t=typeof window<"u"?(e=window.devicePixelRatio)!=null?e:2:1;return Array.isArray(r)?Math.min(Math.max(r[0],t),r[1]):r}const Ma=r=>{var e;return(e=r.__r3f)==null?void 0:e.root.getState()};function vu(r){let e=r.__r3f.root;for(;e.getState().previousRoot;)e=e.getState().previousRoot;return e}const kt={obj:r=>r===Object(r)&&!kt.arr(r)&&typeof r!="function",fun:r=>typeof r=="function",str:r=>typeof r=="string",num:r=>typeof r=="number",boo:r=>typeof r=="boolean",und:r=>r===void 0,arr:r=>Array.isArray(r),equ(r,e,{arrays:t="shallow",objects:n="reference",strict:i=!0}={}){if(typeof r!=typeof e||!!r!=!!e)return!1;if(kt.str(r)||kt.num(r)||kt.boo(r))return r===e;const s=kt.obj(r);if(s&&n==="reference")return r===e;const a=kt.arr(r);if(a&&t==="reference")return r===e;if((a||s)&&r===e)return!0;let c;for(c in r)if(!(c in e))return!1;if(s&&t==="shallow"&&n==="shallow"){for(c in i?e:r)if(!kt.equ(r[c],e[c],{strict:i,objects:"reference"}))return!1}else for(c in i?e:r)if(r[c]!==e[c])return!1;if(kt.und(c)){if(a&&r.length===0&&e.length===0||s&&Object.keys(r).length===0&&Object.keys(e).length===0)return!0;if(r!==e)return!1}return!0}};function RC(r){r.dispose&&r.type!=="Scene"&&r.dispose();for(const e in r)e.dispose==null||e.dispose(),delete r[e]}function So(r,e){const t=r;return t.__r3f={type:"",root:null,previousAttach:null,memoizedProps:{},eventCount:0,handlers:{},objects:[],parent:null,...e},r}function up(r,e){let t=r;if(e.includes("-")){const n=e.split("-"),i=n.pop();return t=n.reduce((s,a)=>s[a],r),{target:t,key:i}}else return{target:t,key:e}}const xv=/-\d+$/;function Od(r,e,t){if(kt.str(t)){if(xv.test(t)){const s=t.replace(xv,""),{target:a,key:c}=up(r,s);Array.isArray(a[c])||(a[c]=[])}const{target:n,key:i}=up(r,t);e.__r3f.previousAttach=n[i],n[i]=e}else e.__r3f.previousAttach=t(r,e)}function Sv(r,e,t){var n,i;if(kt.str(t)){const{target:s,key:a}=up(r,t),c=e.__r3f.previousAttach;c===void 0?delete s[a]:s[a]=c}else(n=e.__r3f)==null||n.previousAttach==null||n.previousAttach(r,e);(i=e.__r3f)==null||delete i.previousAttach}function Qy(r,{children:e,key:t,ref:n,...i},{children:s,key:a,ref:c,...u}={},h=!1){const f=r.__r3f,p=Object.entries(i),m=[];if(h){const y=Object.keys(u);for(let M=0;M<y.length;M++)i.hasOwnProperty(y[M])||p.unshift([y[M],Jy+"remove"])}p.forEach(([y,M])=>{var x;if((x=r.__r3f)!=null&&x.primitive&&y==="object"||kt.equ(M,u[y]))return;if(/^on(Pointer|Click|DoubleClick|ContextMenu|Wheel)/.test(y))return m.push([y,M,!0,[]]);let _=[];y.includes("-")&&(_=y.split("-")),m.push([y,M,!1,_]);for(const E in i){const w=i[E];E.startsWith(`${y}-`)&&m.push([E,w,!1,E.split("-")])}});const g={...i};return f!=null&&f.memoizedProps&&f!=null&&f.memoizedProps.args&&(g.args=f.memoizedProps.args),f!=null&&f.memoizedProps&&f!=null&&f.memoizedProps.attach&&(g.attach=f.memoizedProps.attach),{memoized:g,changes:m}}function Bd(r,e){var t;const n=r.__r3f,i=n==null?void 0:n.root,s=i==null||i.getState==null?void 0:i.getState(),{memoized:a,changes:c}=CC(e)?e:Qy(r,e),u=n==null?void 0:n.eventCount;r.__r3f&&(r.__r3f.memoizedProps=a);for(let m=0;m<c.length;m++){let[g,y,M,x]=c[m];if(Fd(r)){const T="srgb",U="srgb-linear";g==="encoding"?(g="colorSpace",y=y===3001?T:U):g==="outputEncoding"&&(g="outputColorSpace",y=y===3001?T:U)}let _=r,E=_[g];if(x.length&&(E=x.reduce((w,T)=>w[T],r),!(E&&E.set))){const[w,...T]=x.reverse();_=T.reverse().reduce((U,P)=>U[P],r),g=w}if(y===Jy+"remove")if(_.constructor){let w=yv.get(_.constructor);w||(w=new _.constructor,yv.set(_.constructor,w)),y=w[g]}else y=0;if(M&&n)y?n.handlers[g]=y:delete n.handlers[g],n.eventCount=Object.keys(n.handlers).length;else if(E&&E.set&&(E.copy||E instanceof Ts)){if(Array.isArray(y))E.fromArray?E.fromArray(y):E.set(...y);else if(E.copy&&y&&y.constructor&&E.constructor===y.constructor)E.copy(y);else if(y!==void 0){var h;const w=(h=E)==null?void 0:h.isColor;!w&&E.setScalar?E.setScalar(y):E instanceof Ts&&y instanceof Ts?E.mask=y.mask:E.set(y),!Yy()&&s&&!s.linear&&w&&E.convertSRGBToLinear()}}else{var f;if(_[g]=y,(f=_[g])!=null&&f.isTexture&&_[g].format===Pn&&_[g].type===Ci&&s){const w=_[g];Fd(w)&&Fd(s.gl)?w.colorSpace=s.gl.outputColorSpace:w.encoding=s.gl.outputEncoding}}Mo(r)}if(n&&n.parent&&r.raycast&&u!==n.eventCount){const m=vu(r).getState().internal,g=m.interaction.indexOf(r);g>-1&&m.interaction.splice(g,1),n.eventCount&&m.interaction.push(r)}return!(c.length===1&&c[0][0]==="onUpdate")&&c.length&&(t=r.__r3f)!=null&&t.parent&&hp(r),r}function Mo(r){var e,t;const n=(e=r.__r3f)==null||(t=e.root)==null||t.getState==null?void 0:t.getState();n&&n.internal.frames===0&&n.invalidate()}function hp(r){r.onUpdate==null||r.onUpdate(r)}function PC(r,e){r.manual||(qy(r)?(r.left=e.width/-2,r.right=e.width/2,r.top=e.height/2,r.bottom=e.height/-2):r.aspect=e.width/e.height,r.updateProjectionMatrix(),r.updateMatrixWorld())}function au(r){return(r.eventObject||r.object).uuid+"/"+r.index+r.instanceId}function IC(){var r;const e=typeof self<"u"&&self||typeof window<"u"&&window;if(!e)return Co.DefaultEventPriority;switch((r=e.event)==null?void 0:r.type){case"click":case"contextmenu":case"dblclick":case"pointercancel":case"pointerdown":case"pointerup":return Co.DiscreteEventPriority;case"pointermove":case"pointerout":case"pointerover":case"pointerenter":case"pointerleave":case"wheel":return Co.ContinuousEventPriority;default:return Co.DefaultEventPriority}}function $y(r,e,t,n){const i=t.get(e);i&&(t.delete(e),t.size===0&&(r.delete(n),i.target.releasePointerCapture(n)))}function LC(r,e){const{internal:t}=r.getState();t.interaction=t.interaction.filter(n=>n!==e),t.initialHits=t.initialHits.filter(n=>n!==e),t.hovered.forEach((n,i)=>{(n.eventObject===e||n.object===e)&&t.hovered.delete(i)}),t.capturedMap.forEach((n,i)=>{$y(t.capturedMap,e,n,i)})}function DC(r){function e(u){const{internal:h}=r.getState(),f=u.offsetX-h.initialClick[0],p=u.offsetY-h.initialClick[1];return Math.round(Math.sqrt(f*f+p*p))}function t(u){return u.filter(h=>["Move","Over","Enter","Out","Leave"].some(f=>{var p;return(p=h.__r3f)==null?void 0:p.handlers["onPointer"+f]}))}function n(u,h){const f=r.getState(),p=new Set,m=[],g=h?h(f.internal.interaction):f.internal.interaction;for(let _=0;_<g.length;_++){const E=Ma(g[_]);E&&(E.raycaster.camera=void 0)}f.previousRoot||f.events.compute==null||f.events.compute(u,f);function y(_){const E=Ma(_);if(!E||!E.events.enabled||E.raycaster.camera===null)return[];if(E.raycaster.camera===void 0){var w;E.events.compute==null||E.events.compute(u,E,(w=E.previousRoot)==null?void 0:w.getState()),E.raycaster.camera===void 0&&(E.raycaster.camera=null)}return E.raycaster.camera?E.raycaster.intersectObject(_,!0):[]}let M=g.flatMap(y).sort((_,E)=>{const w=Ma(_.object),T=Ma(E.object);return!w||!T?_.distance-E.distance:T.events.priority-w.events.priority||_.distance-E.distance}).filter(_=>{const E=au(_);return p.has(E)?!1:(p.add(E),!0)});f.events.filter&&(M=f.events.filter(M,f));for(const _ of M){let E=_.object;for(;E;){var x;(x=E.__r3f)!=null&&x.eventCount&&m.push({..._,eventObject:E}),E=E.parent}}if("pointerId"in u&&f.internal.capturedMap.has(u.pointerId))for(let _ of f.internal.capturedMap.get(u.pointerId).values())p.has(au(_.intersection))||m.push(_.intersection);return m}function i(u,h,f,p){const m=r.getState();if(u.length){const g={stopped:!1};for(const y of u){const M=Ma(y.object)||m,{raycaster:x,pointer:_,camera:E,internal:w}=M,T=new D(_.x,_.y,0).unproject(E),U=b=>{var C,W;return(C=(W=w.capturedMap.get(b))==null?void 0:W.has(y.eventObject))!=null?C:!1},P=b=>{const C={intersection:y,target:h.target};w.capturedMap.has(b)?w.capturedMap.get(b).set(y.eventObject,C):w.capturedMap.set(b,new Map([[y.eventObject,C]])),h.target.setPointerCapture(b)},L=b=>{const C=w.capturedMap.get(b);C&&$y(w.capturedMap,y.eventObject,C,b)};let O={};for(let b in h){let C=h[b];typeof C!="function"&&(O[b]=C)}let k={...y,...O,pointer:_,intersections:u,stopped:g.stopped,delta:f,unprojectedPoint:T,ray:x.ray,camera:E,stopPropagation(){const b="pointerId"in h&&w.capturedMap.get(h.pointerId);if((!b||b.has(y.eventObject))&&(k.stopped=g.stopped=!0,w.hovered.size&&Array.from(w.hovered.values()).find(C=>C.eventObject===y.eventObject))){const C=u.slice(0,u.indexOf(y));s([...C,y])}},target:{hasPointerCapture:U,setPointerCapture:P,releasePointerCapture:L},currentTarget:{hasPointerCapture:U,setPointerCapture:P,releasePointerCapture:L},nativeEvent:h};if(p(k),g.stopped===!0)break}}return u}function s(u){const{internal:h}=r.getState();for(const f of h.hovered.values())if(!u.length||!u.find(p=>p.object===f.object&&p.index===f.index&&p.instanceId===f.instanceId)){const m=f.eventObject.__r3f,g=m==null?void 0:m.handlers;if(h.hovered.delete(au(f)),m!=null&&m.eventCount){const y={...f,intersections:u};g.onPointerOut==null||g.onPointerOut(y),g.onPointerLeave==null||g.onPointerLeave(y)}}}function a(u,h){for(let f=0;f<h.length;f++){const p=h[f].__r3f;p==null||p.handlers.onPointerMissed==null||p.handlers.onPointerMissed(u)}}function c(u){switch(u){case"onPointerLeave":case"onPointerCancel":return()=>s([]);case"onLostPointerCapture":return h=>{const{internal:f}=r.getState();"pointerId"in h&&f.capturedMap.has(h.pointerId)&&requestAnimationFrame(()=>{f.capturedMap.has(h.pointerId)&&(f.capturedMap.delete(h.pointerId),s([]))})}}return function(f){const{onPointerMissed:p,internal:m}=r.getState();m.lastEvent.current=f;const g=u==="onPointerMove",y=u==="onClick"||u==="onContextMenu"||u==="onDoubleClick",x=n(f,g?t:void 0),_=y?e(f):0;u==="onPointerDown"&&(m.initialClick=[f.offsetX,f.offsetY],m.initialHits=x.map(w=>w.eventObject)),y&&!x.length&&_<=2&&(a(f,m.interaction),p&&p(f)),g&&s(x);function E(w){const T=w.eventObject,U=T.__r3f,P=U==null?void 0:U.handlers;if(U!=null&&U.eventCount)if(g){if(P.onPointerOver||P.onPointerEnter||P.onPointerOut||P.onPointerLeave){const L=au(w),O=m.hovered.get(L);O?O.stopped&&w.stopPropagation():(m.hovered.set(L,w),P.onPointerOver==null||P.onPointerOver(w),P.onPointerEnter==null||P.onPointerEnter(w))}P.onPointerMove==null||P.onPointerMove(w)}else{const L=P[u];L?(!y||m.initialHits.includes(T))&&(a(f,m.interaction.filter(O=>!m.initialHits.includes(O))),L(w)):y&&m.initialHits.includes(T)&&a(f,m.interaction.filter(O=>!m.initialHits.includes(O)))}}i(x,f,_,E)}}return{handlePointer:c}}const ex=r=>!!(r!=null&&r.render),tx=ie.createContext(null),UC=(r,e)=>{const t=xC((c,u)=>{const h=new D,f=new D,p=new D;function m(_=u().camera,E=f,w=u().size){const{width:T,height:U,top:P,left:L}=w,O=T/U;E.isVector3?p.copy(E):p.set(...E);const k=_.getWorldPosition(h).distanceTo(p);if(qy(_))return{width:T/_.zoom,height:U/_.zoom,top:P,left:L,factor:1,distance:k,aspect:O};{const b=_.fov*Math.PI/180,C=2*Math.tan(b/2)*k,W=C*(T/U);return{width:W,height:C,top:P,left:L,factor:T/W,distance:k,aspect:O}}}let g;const y=_=>c(E=>({performance:{...E.performance,current:_}})),M=new pe;return{set:c,get:u,gl:null,camera:null,raycaster:null,events:{priority:1,enabled:!0,connected:!1},xr:null,scene:null,invalidate:(_=1)=>r(u(),_),advance:(_,E)=>e(_,E,u()),legacy:!1,linear:!1,flat:!1,controls:null,clock:new Qp,pointer:M,mouse:M,frameloop:"always",onPointerMissed:void 0,performance:{current:1,min:.5,max:1,debounce:200,regress:()=>{const _=u();g&&clearTimeout(g),_.performance.current!==_.performance.min&&y(_.performance.min),g=setTimeout(()=>y(u().performance.max),_.performance.debounce)}},size:{width:0,height:0,top:0,left:0,updateStyle:!1},viewport:{initialDpr:0,dpr:0,width:0,height:0,top:0,left:0,aspect:0,distance:0,factor:0,getCurrentViewport:m},setEvents:_=>c(E=>({...E,events:{...E.events,..._}})),setSize:(_,E,w,T,U)=>{const P=u().camera,L={width:_,height:E,top:T||0,left:U||0,updateStyle:w};c(O=>({size:L,viewport:{...O.viewport,...m(P,f,L)}}))},setDpr:_=>c(E=>{const w=Ky(_);return{viewport:{...E.viewport,dpr:w,initialDpr:E.viewport.initialDpr||w}}}),setFrameloop:(_="always")=>{const E=u().clock;E.stop(),E.elapsedTime=0,_!=="never"&&(E.start(),E.elapsedTime=0),c(()=>({frameloop:_}))},previousRoot:void 0,internal:{active:!1,priority:0,frames:0,lastEvent:ie.createRef(),interaction:[],hovered:new Map,subscribers:[],initialClick:[0,0],initialHits:[],capturedMap:new Map,subscribe:(_,E,w)=>{const T=u().internal;return T.priority=T.priority+(E>0?1:0),T.subscribers.push({ref:_,priority:E,store:w}),T.subscribers=T.subscribers.sort((U,P)=>U.priority-P.priority),()=>{const U=u().internal;U!=null&&U.subscribers&&(U.priority=U.priority-(E>0?1:0),U.subscribers=U.subscribers.filter(P=>P.ref!==_))}}}}}),n=t.getState();let i=n.size,s=n.viewport.dpr,a=n.camera;return t.subscribe(()=>{const{camera:c,size:u,viewport:h,gl:f,set:p}=t.getState();if(u.width!==i.width||u.height!==i.height||h.dpr!==s){var m;i=u,s=h.dpr,PC(c,u),f.setPixelRatio(h.dpr);const g=(m=u.updateStyle)!=null?m:typeof HTMLCanvasElement<"u"&&f.domElement instanceof HTMLCanvasElement;f.setSize(u.width,u.height,g)}c!==a&&(a=c,p(g=>({viewport:{...g.viewport,...g.viewport.getCurrentViewport(c)}})))}),t.subscribe(c=>r(c)),t};let lu,NC=new Set,FC=new Set,OC=new Set;function zd(r,e){if(r.size)for(const{callback:t}of r.values())t(e)}function wa(r,e){switch(r){case"before":return zd(NC,e);case"after":return zd(FC,e);case"tail":return zd(OC,e)}}let kd,Hd;function Vd(r,e,t){let n=e.clock.getDelta();for(e.frameloop==="never"&&typeof r=="number"&&(n=r-e.clock.elapsedTime,e.clock.oldTime=e.clock.elapsedTime,e.clock.elapsedTime=r),kd=e.internal.subscribers,lu=0;lu<kd.length;lu++)Hd=kd[lu],Hd.ref.current(Hd.store.getState(),n,t);return!e.internal.priority&&e.gl.render&&e.gl.render(e.scene,e.camera),e.internal.frames=Math.max(0,e.internal.frames-1),e.frameloop==="always"?1:e.internal.frames}function BC(r){let e=!1,t=!1,n,i,s;function a(h){i=requestAnimationFrame(a),e=!0,n=0,wa("before",h),t=!0;for(const p of r.values()){var f;s=p.store.getState(),s.internal.active&&(s.frameloop==="always"||s.internal.frames>0)&&!((f=s.gl.xr)!=null&&f.isPresenting)&&(n+=Vd(h,s))}if(t=!1,wa("after",h),n===0)return wa("tail",h),e=!1,cancelAnimationFrame(i)}function c(h,f=1){var p;if(!h)return r.forEach(m=>c(m.store.getState(),f));(p=h.gl.xr)!=null&&p.isPresenting||!h.internal.active||h.frameloop==="never"||(f>1?h.internal.frames=Math.min(60,h.internal.frames+f):t?h.internal.frames=2:h.internal.frames=1,e||(e=!0,requestAnimationFrame(a)))}function u(h,f=!0,p,m){if(f&&wa("before",h),p)Vd(h,p,m);else for(const g of r.values())Vd(h,g.store.getState());f&&wa("after",h)}return{loop:a,invalidate:c,advance:u}}function nx(){const r=ie.useContext(tx);if(!r)throw new Error("R3F: Hooks can only be used within the Canvas component!");return r}function Go(r=t=>t,e){return nx()(r,e)}function ml(r,e=0){const t=nx(),n=t.getState().internal.subscribe,i=jy(r);return pl(()=>n(i,e,t),[e,n,t]),null}const Uo=new Map,{invalidate:Mv,advance:wv}=BC(Uo),{reconciler:ah,applyProps:yo}=AC(Uo,IC),xo={objects:"shallow",strict:!1},zC=(r,e)=>{const t=typeof r=="function"?r(e):r;return ex(t)?t:new j_({powerPreference:"high-performance",canvas:e,antialias:!0,alpha:!0,...r})};function kC(r,e){const t=typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement;if(e){const{width:n,height:i,top:s,left:a,updateStyle:c=t}=e;return{width:n,height:i,top:s,left:a,updateStyle:c}}else if(typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement&&r.parentElement){const{width:n,height:i,top:s,left:a}=r.parentElement.getBoundingClientRect();return{width:n,height:i,top:s,left:a,updateStyle:t}}else if(typeof OffscreenCanvas<"u"&&r instanceof OffscreenCanvas)return{width:r.width,height:r.height,top:0,left:0,updateStyle:t};return{width:0,height:0,top:0,left:0}}function HC(r){const e=Uo.get(r),t=e==null?void 0:e.fiber,n=e==null?void 0:e.store;e&&console.warn("R3F.createRoot should only be called once!");const i=typeof reportError=="function"?reportError:console.error,s=n||UC(Mv,wv),a=t||ah.createContainer(s,Co.ConcurrentRoot,null,!1,null,"",i,null);e||Uo.set(r,{fiber:a,store:s});let c,u=!1,h;return{configure(f={}){let{gl:p,size:m,scene:g,events:y,onCreated:M,shadows:x=!1,linear:_=!1,flat:E=!1,legacy:w=!1,orthographic:T=!1,frameloop:U="always",dpr:P=[1,2],performance:L,raycaster:O,camera:k,onPointerMissed:b}=f,C=s.getState(),W=C.gl;C.gl||C.set({gl:W=zC(p,r)});let q=C.raycaster;q||C.set({raycaster:q=new zy});const{params:J,...re}=O||{};if(kt.equ(re,q,xo)||yo(q,{...re}),kt.equ(J,q.params,xo)||yo(q,{params:{...q.params,...J}}),!C.camera||C.camera===h&&!kt.equ(h,k,xo)){h=k;const ee=k instanceof ol,le=ee?k:T?new Ns(0,0,0,0,.1,1e3):new nn(75,0,.1,1e3);ee||(le.position.z=5,k&&(yo(le,k),("aspect"in k||"left"in k||"right"in k||"bottom"in k||"top"in k)&&(le.manual=!0,le.updateProjectionMatrix())),!C.camera&&!(k!=null&&k.rotation)&&le.lookAt(0,0,0)),C.set({camera:le}),q.camera=le}if(!C.scene){let ee;g!=null&&g.isScene?ee=g:(ee=new Up,g&&yo(ee,g)),C.set({scene:So(ee)})}if(!C.xr){var j;const ee=(Ne,ne)=>{const me=s.getState();me.frameloop!=="never"&&wv(Ne,!0,me,ne)},le=()=>{const Ne=s.getState();Ne.gl.xr.enabled=Ne.gl.xr.isPresenting,Ne.gl.xr.setAnimationLoop(Ne.gl.xr.isPresenting?ee:null),Ne.gl.xr.isPresenting||Mv(Ne)},Pe={connect(){const Ne=s.getState().gl;Ne.xr.addEventListener("sessionstart",le),Ne.xr.addEventListener("sessionend",le)},disconnect(){const Ne=s.getState().gl;Ne.xr.removeEventListener("sessionstart",le),Ne.xr.removeEventListener("sessionend",le)}};typeof((j=W.xr)==null?void 0:j.addEventListener)=="function"&&Pe.connect(),C.set({xr:Pe})}if(W.shadowMap){const ee=W.shadowMap.enabled,le=W.shadowMap.type;if(W.shadowMap.enabled=!!x,kt.boo(x))W.shadowMap.type=Ta;else if(kt.str(x)){var fe;const Pe={basic:Xv,percentage:lh,soft:Ta,variance:Ti};W.shadowMap.type=(fe=Pe[x])!=null?fe:Ta}else kt.obj(x)&&Object.assign(W.shadowMap,x);(ee!==W.shadowMap.enabled||le!==W.shadowMap.type)&&(W.shadowMap.needsUpdate=!0)}const z=Yy();z&&("enabled"in z?z.enabled=!w:"legacyMode"in z&&(z.legacyMode=w)),u||yo(W,{outputEncoding:_?3e3:3001,toneMapping:E?qi:dp}),C.legacy!==w&&C.set(()=>({legacy:w})),C.linear!==_&&C.set(()=>({linear:_})),C.flat!==E&&C.set(()=>({flat:E})),p&&!kt.fun(p)&&!ex(p)&&!kt.equ(p,W,xo)&&yo(W,p),y&&!C.events.handlers&&C.set({events:y(s)});const ae=kC(r,m);return kt.equ(ae,C.size,xo)||C.setSize(ae.width,ae.height,ae.updateStyle,ae.top,ae.left),P&&C.viewport.dpr!==Ky(P)&&C.setDpr(P),C.frameloop!==U&&C.setFrameloop(U),C.onPointerMissed||C.set({onPointerMissed:b}),L&&!kt.equ(L,C.performance,xo)&&C.set(ee=>({performance:{...ee.performance,...L}})),c=M,u=!0,this},render(f){return u||this.configure(),ah.updateContainer(Te.jsx(VC,{store:s,children:f,onCreated:c,rootElement:r}),a,null,()=>{}),s},unmount(){ix(r)}}}function VC({store:r,children:e,onCreated:t,rootElement:n}){return pl(()=>{const i=r.getState();i.set(s=>({internal:{...s.internal,active:!0}})),t&&t(i),r.getState().events.connected||i.events.connect==null||i.events.connect(n)},[]),Te.jsx(tx.Provider,{value:r,children:e})}function ix(r,e){const t=Uo.get(r),n=t==null?void 0:t.fiber;if(n){const i=t==null?void 0:t.store.getState();i&&(i.internal.active=!1),ah.updateContainer(null,n,null,()=>{i&&setTimeout(()=>{try{var s,a,c,u;i.events.disconnect==null||i.events.disconnect(),(s=i.gl)==null||(a=s.renderLists)==null||a.dispose==null||a.dispose(),(c=i.gl)==null||c.forceContextLoss==null||c.forceContextLoss(),(u=i.gl)!=null&&u.xr&&i.xr.disconnect(),RC(i),Uo.delete(r)}catch{}},500)})}}ah.injectIntoDevTools({bundleType:0,rendererPackageName:"@react-three/fiber",version:ie.version});const Gd={onClick:["click",!1],onContextMenu:["contextmenu",!1],onDoubleClick:["dblclick",!1],onWheel:["wheel",!0],onPointerDown:["pointerdown",!0],onPointerUp:["pointerup",!0],onPointerLeave:["pointerleave",!0],onPointerMove:["pointermove",!0],onPointerCancel:["pointercancel",!0],onLostPointerCapture:["lostpointercapture",!0]};function GC(r){const{handlePointer:e}=DC(r);return{priority:1,enabled:!0,compute(t,n,i){n.pointer.set(t.offsetX/n.size.width*2-1,-(t.offsetY/n.size.height)*2+1),n.raycaster.setFromCamera(n.pointer,n.camera)},connected:void 0,handlers:Object.keys(Gd).reduce((t,n)=>({...t,[n]:e(n)}),{}),update:()=>{var t;const{events:n,internal:i}=r.getState();(t=i.lastEvent)!=null&&t.current&&n.handlers&&n.handlers.onPointerMove(i.lastEvent.current)},connect:t=>{var n;const{set:i,events:s}=r.getState();s.disconnect==null||s.disconnect(),i(a=>({events:{...a.events,connected:t}})),Object.entries((n=s.handlers)!=null?n:[]).forEach(([a,c])=>{const[u,h]=Gd[a];t.addEventListener(u,c,{passive:h})})},disconnect:()=>{const{set:t,events:n}=r.getState();if(n.connected){var i;Object.entries((i=n.handlers)!=null?i:[]).forEach(([s,a])=>{if(n&&n.connected instanceof HTMLElement){const[c]=Gd[s];n.connected.removeEventListener(c,a)}}),t(s=>({events:{...s.events,connected:void 0}}))}}}}function Ev(r,e){let t;return(...n)=>{window.clearTimeout(t),t=window.setTimeout(()=>r(...n),e)}}function WC({debounce:r,scroll:e,polyfill:t,offsetSize:n}={debounce:0,scroll:!1,offsetSize:!1}){const i=t||(typeof window>"u"?class{}:window.ResizeObserver);if(!i)throw new Error("This browser does not support ResizeObserver out of the box. See: https://github.com/react-spring/react-use-measure/#resize-observer-polyfills");const[s,a]=ie.useState({left:0,top:0,width:0,height:0,bottom:0,right:0,x:0,y:0}),c=ie.useRef({element:null,scrollContainers:null,resizeObserver:null,lastBounds:s,orientationHandler:null}),u=r?typeof r=="number"?r:r.scroll:null,h=r?typeof r=="number"?r:r.resize:null,f=ie.useRef(!1);ie.useEffect(()=>(f.current=!0,()=>void(f.current=!1)));const[p,m,g]=ie.useMemo(()=>{const _=()=>{if(!c.current.element)return;const{left:E,top:w,width:T,height:U,bottom:P,right:L,x:O,y:k}=c.current.element.getBoundingClientRect(),b={left:E,top:w,width:T,height:U,bottom:P,right:L,x:O,y:k};c.current.element instanceof HTMLElement&&n&&(b.height=c.current.element.offsetHeight,b.width=c.current.element.offsetWidth),Object.freeze(b),f.current&&!jC(c.current.lastBounds,b)&&a(c.current.lastBounds=b)};return[_,h?Ev(_,h):_,u?Ev(_,u):_]},[a,n,u,h]);function y(){c.current.scrollContainers&&(c.current.scrollContainers.forEach(_=>_.removeEventListener("scroll",g,!0)),c.current.scrollContainers=null),c.current.resizeObserver&&(c.current.resizeObserver.disconnect(),c.current.resizeObserver=null),c.current.orientationHandler&&("orientation"in screen&&"removeEventListener"in screen.orientation?screen.orientation.removeEventListener("change",c.current.orientationHandler):"onorientationchange"in window&&window.removeEventListener("orientationchange",c.current.orientationHandler))}function M(){c.current.element&&(c.current.resizeObserver=new i(g),c.current.resizeObserver.observe(c.current.element),e&&c.current.scrollContainers&&c.current.scrollContainers.forEach(_=>_.addEventListener("scroll",g,{capture:!0,passive:!0})),c.current.orientationHandler=()=>{g()},"orientation"in screen&&"addEventListener"in screen.orientation?screen.orientation.addEventListener("change",c.current.orientationHandler):"onorientationchange"in window&&window.addEventListener("orientationchange",c.current.orientationHandler))}const x=_=>{!_||_===c.current.element||(y(),c.current.element=_,c.current.scrollContainers=rx(_),M())};return YC(g,!!e),XC(m),ie.useEffect(()=>{y(),M()},[e,g,m]),ie.useEffect(()=>y,[]),[x,s,p]}function XC(r){ie.useEffect(()=>{const e=r;return window.addEventListener("resize",e),()=>void window.removeEventListener("resize",e)},[r])}function YC(r,e){ie.useEffect(()=>{if(e){const t=r;return window.addEventListener("scroll",t,{capture:!0,passive:!0}),()=>void window.removeEventListener("scroll",t,!0)}},[r,e])}function rx(r){const e=[];if(!r||r===document.body)return e;const{overflow:t,overflowX:n,overflowY:i}=window.getComputedStyle(r);return[t,n,i].some(s=>s==="auto"||s==="scroll")&&e.push(r),[...e,...rx(r.parentElement)]}const qC=["x","y","top","bottom","left","right","width","height"],jC=(r,e)=>qC.every(t=>r[t]===e[t]);var ZC=Object.defineProperty,JC=Object.defineProperties,KC=Object.getOwnPropertyDescriptors,Av=Object.getOwnPropertySymbols,QC=Object.prototype.hasOwnProperty,$C=Object.prototype.propertyIsEnumerable,Tv=(r,e,t)=>e in r?ZC(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t,bv=(r,e)=>{for(var t in e||(e={}))QC.call(e,t)&&Tv(r,t,e[t]);if(Av)for(var t of Av(e))$C.call(e,t)&&Tv(r,t,e[t]);return r},eR=(r,e)=>JC(r,KC(e)),Cv,Rv;typeof window<"u"&&((Cv=window.document)!=null&&Cv.createElement||((Rv=window.navigator)==null?void 0:Rv.product)==="ReactNative")?ie.useLayoutEffect:ie.useEffect;function sx(r,e,t){if(!r)return;if(t(r)===!0)return r;let n=r.child;for(;n;){const i=sx(n,e,t);if(i)return i;n=n.sibling}}function ox(r){try{return Object.defineProperties(r,{_currentRenderer:{get(){return null},set(){}},_currentRenderer2:{get(){return null},set(){}}})}catch{return r}}const Pv=console.error;console.error=function(){const r=[...arguments].join("");if(r!=null&&r.startsWith("Warning:")&&r.includes("useContext")){console.error=Pv;return}return Pv.apply(this,arguments)};const rm=ox(ie.createContext(null));class ax extends ie.Component{render(){return ie.createElement(rm.Provider,{value:this._reactInternals},this.props.children)}}function tR(){const r=ie.useContext(rm);if(r===null)throw new Error("its-fine: useFiber must be called within a <FiberProvider />!");const e=ie.useId();return ie.useMemo(()=>{for(const n of[r,r==null?void 0:r.alternate]){if(!n)continue;const i=sx(n,!1,s=>{let a=s.memoizedState;for(;a;){if(a.memoizedState===e)return!0;a=a.next}});if(i)return i}},[r,e])}function nR(){const r=tR(),[e]=ie.useState(()=>new Map);e.clear();let t=r;for(;t;){if(t.type&&typeof t.type=="object"){const i=t.type._context===void 0&&t.type.Provider===t.type?t.type:t.type._context;i&&i!==rm&&!e.has(i)&&e.set(i,ie.useContext(ox(i)))}t=t.return}return e}function iR(){const r=nR();return ie.useMemo(()=>Array.from(r.keys()).reduce((e,t)=>n=>ie.createElement(e,null,ie.createElement(t.Provider,eR(bv({},n),{value:r.get(t)}))),e=>ie.createElement(ax,bv({},e))),[r])}const rR=ie.forwardRef(function({children:e,fallback:t,resize:n,style:i,gl:s,events:a=GC,eventSource:c,eventPrefix:u,shadows:h,linear:f,flat:p,legacy:m,orthographic:g,frameloop:y,dpr:M,performance:x,raycaster:_,camera:E,scene:w,onPointerMissed:T,onCreated:U,...P},L){ie.useMemo(()=>EC(vC),[]);const O=iR(),[k,b]=WC({scroll:!0,debounce:{scroll:50,resize:0},...n}),C=ie.useRef(null),W=ie.useRef(null);ie.useImperativeHandle(L,()=>C.current);const q=jy(T),[J,re]=ie.useState(!1),[j,fe]=ie.useState(!1);if(J)throw J;if(j)throw j;const z=ie.useRef(null);pl(()=>{const ee=C.current;b.width>0&&b.height>0&&ee&&(z.current||(z.current=HC(ee)),z.current.configure({gl:s,events:a,shadows:h,linear:f,flat:p,legacy:m,orthographic:g,frameloop:y,dpr:M,performance:x,raycaster:_,camera:E,scene:w,size:b,onPointerMissed:(...le)=>q.current==null?void 0:q.current(...le),onCreated:le=>{le.events.connect==null||le.events.connect(c?TC(c)?c.current:c:W.current),u&&le.setEvents({compute:(Pe,Ne)=>{const ne=Pe[u+"X"],me=Pe[u+"Y"];Ne.pointer.set(ne/Ne.size.width*2-1,-(me/Ne.size.height)*2+1),Ne.raycaster.setFromCamera(Ne.pointer,Ne.camera)}}),U==null||U(le)}}),z.current.render(Te.jsx(O,{children:Te.jsx(Zy,{set:fe,children:Te.jsx(ie.Suspense,{fallback:Te.jsx(bC,{set:re}),children:e??null})})})))}),ie.useEffect(()=>{const ee=C.current;if(ee)return()=>ix(ee)},[]);const ae=c?"none":"auto";return Te.jsx("div",{ref:W,style:{position:"relative",width:"100%",height:"100%",overflow:"hidden",pointerEvents:ae,...i},...P,children:Te.jsx("div",{ref:k,style:{width:"100%",height:"100%"},children:Te.jsx("canvas",{ref:C,style:{display:"block"},children:t})})})}),sR=ie.forwardRef(function(e,t){return Te.jsx(ax,{children:Te.jsx(rR,{...e,ref:t})})});function Us(){return Us=Object.assign?Object.assign.bind():function(r){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var n in t)({}).hasOwnProperty.call(t,n)&&(r[n]=t[n])}return r},Us.apply(null,arguments)}const gl=new D,sm=new D,oR=new D,Iv=new pe;function aR(r,e,t){const n=gl.setFromMatrixPosition(r.matrixWorld);n.project(e);const i=t.width/2,s=t.height/2;return[n.x*i+i,-(n.y*s)+s]}function lR(r,e){const t=gl.setFromMatrixPosition(r.matrixWorld),n=sm.setFromMatrixPosition(e.matrixWorld),i=t.sub(n),s=e.getWorldDirection(oR);return i.angleTo(s)>Math.PI/2}function cR(r,e,t,n){const i=gl.setFromMatrixPosition(r.matrixWorld),s=i.clone();s.project(e),Iv.set(s.x,s.y),t.setFromCamera(Iv,e);const a=t.intersectObjects(n,!0);if(a.length){const c=a[0].distance;return i.distanceTo(t.ray.origin)<c}return!0}function uR(r,e){if(e instanceof Ns)return e.zoom;if(e instanceof nn){const t=gl.setFromMatrixPosition(r.matrixWorld),n=sm.setFromMatrixPosition(e.matrixWorld),i=e.fov*Math.PI/180,s=t.distanceTo(n);return 1/(2*Math.tan(i/2)*s)}else return 1}function hR(r,e,t){if(e instanceof nn||e instanceof Ns){const n=gl.setFromMatrixPosition(r.matrixWorld),i=sm.setFromMatrixPosition(e.matrixWorld),s=n.distanceTo(i),a=(t[1]-t[0])/(e.far-e.near),c=t[1]-a*e.far;return Math.round(a*s+c)}}const fp=r=>Math.abs(r)<1e-10?0:r;function lx(r,e,t=""){let n="matrix3d(";for(let i=0;i!==16;i++)n+=fp(e[i]*r.elements[i])+(i!==15?",":")");return t+n}const fR=(r=>e=>lx(e,r))([1,-1,1,1,1,-1,1,1,1,-1,1,1,1,-1,1,1]),dR=(r=>(e,t)=>lx(e,r(t),"translate(-50%,-50%)"))(r=>[1/r,1/r,1/r,1,-1/r,-1/r,-1/r,-1,1/r,1/r,1/r,1,1,1,1,1]);function pR(r){return r&&typeof r=="object"&&"current"in r}const cx=ie.forwardRef(({children:r,eps:e=.001,style:t,className:n,prepend:i,center:s,fullscreen:a,portal:c,distanceFactor:u,sprite:h=!1,transform:f=!1,occlude:p,onOcclude:m,castShadow:g,receiveShadow:y,material:M,geometry:x,zIndexRange:_=[16777271,0],calculatePosition:E=aR,as:w="div",wrapperClass:T,pointerEvents:U="auto",...P},L)=>{const{gl:O,camera:k,scene:b,size:C,raycaster:W,events:q,viewport:J}=Go(),[re]=ie.useState(()=>document.createElement(w)),j=ie.useRef(),fe=ie.useRef(null),z=ie.useRef(0),ae=ie.useRef([0,0]),ee=ie.useRef(null),le=ie.useRef(null),Pe=(c==null?void 0:c.current)||q.connected||O.domElement.parentNode,Ne=ie.useRef(null),ne=ie.useRef(!1),me=ie.useMemo(()=>p&&p!=="blending"||Array.isArray(p)&&p.length&&pR(p[0]),[p]);ie.useLayoutEffect(()=>{const Ze=O.domElement;p&&p==="blending"?(Ze.style.zIndex=`${Math.floor(_[0]/2)}`,Ze.style.position="absolute",Ze.style.pointerEvents="none"):(Ze.style.zIndex=null,Ze.style.position=null,Ze.style.pointerEvents=null)},[p]),ie.useLayoutEffect(()=>{if(fe.current){const Ze=j.current=sS(re);if(b.updateMatrixWorld(),f)re.style.cssText="position:absolute;top:0;left:0;pointer-events:none;overflow:hidden;";else{const Re=E(fe.current,k,C);re.style.cssText=`position:absolute;top:0;left:0;transform:translate3d(${Re[0]}px,${Re[1]}px,0);transform-origin:0 0;`}return Pe&&(i?Pe.prepend(re):Pe.appendChild(re)),()=>{Pe&&Pe.removeChild(re),Ze.unmount()}}},[Pe,f]),ie.useLayoutEffect(()=>{T&&(re.className=T)},[T]);const Ce=ie.useMemo(()=>f?{position:"absolute",top:0,left:0,width:C.width,height:C.height,transformStyle:"preserve-3d",pointerEvents:"none"}:{position:"absolute",transform:s?"translate3d(-50%,-50%,0)":"none",...a&&{top:-C.height/2,left:-C.width/2,width:C.width,height:C.height},...t},[t,s,a,C,f]),Ae=ie.useMemo(()=>({position:"absolute",pointerEvents:U}),[U]);ie.useLayoutEffect(()=>{if(ne.current=!1,f){var Ze;(Ze=j.current)==null||Ze.render(ie.createElement("div",{ref:ee,style:Ce},ie.createElement("div",{ref:le,style:Ae},ie.createElement("div",{ref:L,className:n,style:t,children:r}))))}else{var Re;(Re=j.current)==null||Re.render(ie.createElement("div",{ref:L,style:Ce,className:n,children:r}))}});const tt=ie.useRef(!0);ml(Ze=>{if(fe.current){k.updateMatrixWorld(),fe.current.updateWorldMatrix(!0,!1);const Re=f?ae.current:E(fe.current,k,C);if(f||Math.abs(z.current-k.zoom)>e||Math.abs(ae.current[0]-Re[0])>e||Math.abs(ae.current[1]-Re[1])>e){const he=lR(fe.current,k);let N=!1;me&&(Array.isArray(p)?N=p.map(Se=>Se.current):p!=="blending"&&(N=[b]));const we=tt.current;if(N){const Se=cR(fe.current,k,W,N);tt.current=Se&&!he}else tt.current=!he;we!==tt.current&&(m?m(!tt.current):re.style.display=tt.current?"block":"none");const xe=Math.floor(_[0]/2),ve=p?me?[_[0],xe]:[xe-1,0]:_;if(re.style.zIndex=`${hR(fe.current,k,ve)}`,f){const[Se,Je]=[C.width/2,C.height/2],Le=k.projectionMatrix.elements[5]*Je,{isOrthographicCamera:F,top:R,left:Z,bottom:ce,right:de}=k,ue=fR(k.matrixWorldInverse),qe=F?`scale(${Le})translate(${fp(-(de+Z)/2)}px,${fp((R+ce)/2)}px)`:`translateZ(${Le}px)`;let Ee=fe.current.matrixWorld;h&&(Ee=k.matrixWorldInverse.clone().transpose().copyPosition(Ee).scale(fe.current.scale),Ee.elements[3]=Ee.elements[7]=Ee.elements[11]=0,Ee.elements[15]=1),re.style.width=C.width+"px",re.style.height=C.height+"px",re.style.perspective=F?"":`${Le}px`,ee.current&&le.current&&(ee.current.style.transform=`${qe}${ue}translate(${Se}px,${Je}px)`,le.current.style.transform=dR(Ee,1/((u||10)/400)))}else{const Se=u===void 0?1:uR(fe.current,k)*u;re.style.transform=`translate3d(${Re[0]}px,${Re[1]}px,0) scale(${Se})`}ae.current=Re,z.current=k.zoom}}if(!me&&Ne.current&&!ne.current)if(f){if(ee.current){const Re=ee.current.children[0];if(Re!=null&&Re.clientWidth&&Re!=null&&Re.clientHeight){const{isOrthographicCamera:he}=k;if(he||x)P.scale&&(Array.isArray(P.scale)?P.scale instanceof D?Ne.current.scale.copy(P.scale.clone().divideScalar(1)):Ne.current.scale.set(1/P.scale[0],1/P.scale[1],1/P.scale[2]):Ne.current.scale.setScalar(1/P.scale));else{const N=(u||10)/400,we=Re.clientWidth*N,xe=Re.clientHeight*N;Ne.current.scale.set(we,xe,1)}ne.current=!0}}}else{const Re=re.children[0];if(Re!=null&&Re.clientWidth&&Re!=null&&Re.clientHeight){const he=1/J.factor,N=Re.clientWidth*he,we=Re.clientHeight*he;Ne.current.scale.set(N,we,1),ne.current=!0}Ne.current.lookAt(Ze.camera.position)}});const nt=ie.useMemo(()=>({vertexShader:f?void 0:`
          /*
            This shader is from the THREE's SpriteMaterial.
            We need to turn the backing plane into a Sprite
            (make it always face the camera) if "transfrom"
            is false.
          */
          #include <common>

          void main() {
            vec2 center = vec2(0., 1.);
            float rotation = 0.0;

            // This is somewhat arbitrary, but it seems to work well
            // Need to figure out how to derive this dynamically if it even matters
            float size = 0.03;

            vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
            vec2 scale;
            scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
            scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

            bool isPerspective = isPerspectiveMatrix( projectionMatrix );
            if ( isPerspective ) scale *= - mvPosition.z;

            vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale * size;
            vec2 rotatedPosition;
            rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
            rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
            mvPosition.xy += rotatedPosition;

            gl_Position = projectionMatrix * mvPosition;
          }
      `,fragmentShader:`
        void main() {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
      `}),[f]);return ie.createElement("group",Us({},P,{ref:fe}),p&&!me&&ie.createElement("mesh",{castShadow:g,receiveShadow:y,ref:Ne},x||ie.createElement("planeGeometry",null),M||ie.createElement("shaderMaterial",{side:ri,vertexShader:nt.vertexShader,fragmentShader:nt.fragmentShader})))}),ux=parseInt(nl.replace(/\D+/g,"")),hx=ux>=125?"uv1":"uv2";function mR(r,e=Math.PI/3){const t=Math.cos(e),n=(1+1e-10)*100,i=[new D,new D,new D],s=new D,a=new D,c=new D,u=new D;function h(M){const x=~~(M.x*n),_=~~(M.y*n),E=~~(M.z*n);return`${x},${_},${E}`}const f=r.index?r.toNonIndexed():r,p=f.attributes.position,m={};for(let M=0,x=p.count/3;M<x;M++){const _=3*M,E=i[0].fromBufferAttribute(p,_+0),w=i[1].fromBufferAttribute(p,_+1),T=i[2].fromBufferAttribute(p,_+2);s.subVectors(T,w),a.subVectors(E,w);const U=new D().crossVectors(s,a).normalize();for(let P=0;P<3;P++){const L=i[P],O=h(L);O in m||(m[O]=[]),m[O].push(U)}}const g=new Float32Array(p.count*3),y=new Ft(g,3,!1);for(let M=0,x=p.count/3;M<x;M++){const _=3*M,E=i[0].fromBufferAttribute(p,_+0),w=i[1].fromBufferAttribute(p,_+1),T=i[2].fromBufferAttribute(p,_+2);s.subVectors(T,w),a.subVectors(E,w),c.crossVectors(s,a).normalize();for(let U=0;U<3;U++){const P=i[U],L=h(P),O=m[L];u.set(0,0,0);for(let k=0,b=O.length;k<b;k++){const C=O[k];c.dot(C)>t&&u.add(C)}u.normalize(),y.setXYZ(_+U,u.x,u.y,u.z)}}return f.setAttribute("normal",y),f}const Lv=new pn,cu=new D;class om extends Jp{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],n=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(n),this.setAttribute("position",new je(e,3)),this.setAttribute("uv",new je(t,2))}applyMatrix4(e){const t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new oh(t,6,1);return this.setAttribute("instanceStart",new si(n,3,0)),this.setAttribute("instanceEnd",new si(n,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,t=3){let n;e instanceof Float32Array?n=e:Array.isArray(e)&&(n=new Float32Array(e));const i=new oh(n,t*2,1);return this.setAttribute("instanceColorStart",new si(i,t,0)),this.setAttribute("instanceColorEnd",new si(i,t,t)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new Wp(e.geometry)),this}fromLineSegments(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new pn);const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),Lv.setFromBufferAttribute(t),this.boundingBox.union(Lv))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new mn),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){const n=this.boundingSphere.center;this.boundingBox.getCenter(n);let i=0;for(let s=0,a=e.count;s<a;s++)cu.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(cu)),cu.fromBufferAttribute(t,s),i=Math.max(i,n.distanceToSquared(cu));this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}class fx extends om{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const t=e.length-3,n=new Float32Array(2*t);for(let i=0;i<t;i+=3)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];return super.setPositions(n),this}setColors(e,t=3){const n=e.length-t,i=new Float32Array(2*n);if(t===3)for(let s=0;s<n;s+=t)i[2*s]=e[s],i[2*s+1]=e[s+1],i[2*s+2]=e[s+2],i[2*s+3]=e[s+3],i[2*s+4]=e[s+4],i[2*s+5]=e[s+5];else for(let s=0;s<n;s+=t)i[2*s]=e[s],i[2*s+1]=e[s+1],i[2*s+2]=e[s+2],i[2*s+3]=e[s+3],i[2*s+4]=e[s+4],i[2*s+5]=e[s+5],i[2*s+6]=e[s+6],i[2*s+7]=e[s+7];return super.setColors(i,t),this}fromLine(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class am extends Zn{constructor(e){super({type:"LineMaterial",uniforms:nh.clone(nh.merge([be.common,be.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new pe(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`,fragmentShader:`
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${ux>=154?"colorspace_fragment":"encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(t){this.uniforms.diffuse.value=t}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(t){t===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(t){this.uniforms.linewidth.value=t}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(t){!!t!="USE_DASH"in this.defines&&(this.needsUpdate=!0),t===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(t){this.uniforms.dashScale.value=t}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(t){this.uniforms.dashSize.value=t}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(t){this.uniforms.dashOffset.value=t}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(t){this.uniforms.gapSize.value=t}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(t){this.uniforms.opacity.value=t}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(t){this.uniforms.resolution.value.copy(t)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(t){!!t!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),t===!0?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(e)}}const Wd=new xt,Dv=new D,Uv=new D,_n=new xt,yn=new xt,Hi=new xt,Xd=new D,Yd=new rt,Sn=new ky,Nv=new D,uu=new pn,hu=new mn,Vi=new xt;let Wi,bs;function Fv(r,e,t){return Vi.set(0,0,-e,1).applyMatrix4(r.projectionMatrix),Vi.multiplyScalar(1/Vi.w),Vi.x=bs/t.width,Vi.y=bs/t.height,Vi.applyMatrix4(r.projectionMatrixInverse),Vi.multiplyScalar(1/Vi.w),Math.abs(Math.max(Vi.x,Vi.y))}function gR(r,e){const t=r.matrixWorld,n=r.geometry,i=n.attributes.instanceStart,s=n.attributes.instanceEnd,a=Math.min(n.instanceCount,i.count);for(let c=0,u=a;c<u;c++){Sn.start.fromBufferAttribute(i,c),Sn.end.fromBufferAttribute(s,c),Sn.applyMatrix4(t);const h=new D,f=new D;Wi.distanceSqToSegment(Sn.start,Sn.end,f,h),f.distanceTo(h)<bs*.5&&e.push({point:f,pointOnLine:h,distance:Wi.origin.distanceTo(f),object:r,face:null,faceIndex:c,uv:null,[hx]:null})}}function vR(r,e,t){const n=e.projectionMatrix,s=r.material.resolution,a=r.matrixWorld,c=r.geometry,u=c.attributes.instanceStart,h=c.attributes.instanceEnd,f=Math.min(c.instanceCount,u.count),p=-e.near;Wi.at(1,Hi),Hi.w=1,Hi.applyMatrix4(e.matrixWorldInverse),Hi.applyMatrix4(n),Hi.multiplyScalar(1/Hi.w),Hi.x*=s.x/2,Hi.y*=s.y/2,Hi.z=0,Xd.copy(Hi),Yd.multiplyMatrices(e.matrixWorldInverse,a);for(let m=0,g=f;m<g;m++){if(_n.fromBufferAttribute(u,m),yn.fromBufferAttribute(h,m),_n.w=1,yn.w=1,_n.applyMatrix4(Yd),yn.applyMatrix4(Yd),_n.z>p&&yn.z>p)continue;if(_n.z>p){const w=_n.z-yn.z,T=(_n.z-p)/w;_n.lerp(yn,T)}else if(yn.z>p){const w=yn.z-_n.z,T=(yn.z-p)/w;yn.lerp(_n,T)}_n.applyMatrix4(n),yn.applyMatrix4(n),_n.multiplyScalar(1/_n.w),yn.multiplyScalar(1/yn.w),_n.x*=s.x/2,_n.y*=s.y/2,yn.x*=s.x/2,yn.y*=s.y/2,Sn.start.copy(_n),Sn.start.z=0,Sn.end.copy(yn),Sn.end.z=0;const M=Sn.closestPointToPointParameter(Xd,!0);Sn.at(M,Nv);const x=L_.lerp(_n.z,yn.z,M),_=x>=-1&&x<=1,E=Xd.distanceTo(Nv)<bs*.5;if(_&&E){Sn.start.fromBufferAttribute(u,m),Sn.end.fromBufferAttribute(h,m),Sn.start.applyMatrix4(a),Sn.end.applyMatrix4(a);const w=new D,T=new D;Wi.distanceSqToSegment(Sn.start,Sn.end,T,w),t.push({point:T,pointOnLine:w,distance:Wi.origin.distanceTo(T),object:r,face:null,faceIndex:m,uv:null,[hx]:null})}}}class dx extends Qt{constructor(e=new om,t=new am({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,i=new Float32Array(2*t.count);for(let a=0,c=0,u=t.count;a<u;a++,c+=2)Dv.fromBufferAttribute(t,a),Uv.fromBufferAttribute(n,a),i[c]=c===0?0:i[c-1],i[c+1]=i[c]+Dv.distanceTo(Uv);const s=new oh(i,2,1);return e.setAttribute("instanceDistanceStart",new si(s,1,0)),e.setAttribute("instanceDistanceEnd",new si(s,1,1)),this}raycast(e,t){const n=this.material.worldUnits,i=e.camera;i===null&&!n&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const s=e.params.Line2!==void 0&&e.params.Line2.threshold||0;Wi=e.ray;const a=this.matrixWorld,c=this.geometry,u=this.material;bs=u.linewidth+s,c.boundingSphere===null&&c.computeBoundingSphere(),hu.copy(c.boundingSphere).applyMatrix4(a);let h;if(n)h=bs*.5;else{const p=Math.max(i.near,hu.distanceToPoint(Wi.origin));h=Fv(i,p,u.resolution)}if(hu.radius+=h,Wi.intersectsSphere(hu)===!1)return;c.boundingBox===null&&c.computeBoundingBox(),uu.copy(c.boundingBox).applyMatrix4(a);let f;if(n)f=bs*.5;else{const p=Math.max(i.near,uu.distanceToPoint(Wi.origin));f=Fv(i,p,u.resolution)}uu.expandByScalar(f),Wi.intersectsBox(uu)!==!1&&(n?gR(this,t):vR(this,i,t))}onBeforeRender(e){const t=this.material.uniforms;t&&t.resolution&&(e.getViewport(Wd),this.material.uniforms.resolution.value.set(Wd.z,Wd.w))}}class _R extends dx{constructor(e=new fx,t=new am({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}}const yR=ie.forwardRef(function({points:e,color:t=16777215,vertexColors:n,linewidth:i,lineWidth:s,segments:a,dashed:c,...u},h){var f,p;const m=Go(_=>_.size),g=ie.useMemo(()=>a?new dx:new _R,[a]),[y]=ie.useState(()=>new am),M=(n==null||(f=n[0])==null?void 0:f.length)===4?4:3,x=ie.useMemo(()=>{const _=a?new om:new fx,E=e.map(w=>{const T=Array.isArray(w);return w instanceof D||w instanceof xt?[w.x,w.y,w.z]:w instanceof pe?[w.x,w.y,0]:T&&w.length===3?[w[0],w[1],w[2]]:T&&w.length===2?[w[0],w[1],0]:w});if(_.setPositions(E.flat()),n){t=16777215;const w=n.map(T=>T instanceof Ue?T.toArray():T);_.setColors(w.flat(),M)}return _},[e,a,n,M]);return ie.useLayoutEffect(()=>{g.computeLineDistances()},[e,g]),ie.useLayoutEffect(()=>{c?y.defines.USE_DASH="":delete y.defines.USE_DASH,y.needsUpdate=!0},[c,y]),ie.useEffect(()=>()=>{x.dispose(),y.dispose()},[x]),ie.createElement("primitive",Us({object:g,ref:h},u),ie.createElement("primitive",{object:x,attach:"geometry"}),ie.createElement("primitive",Us({object:y,attach:"material",color:t,vertexColors:!!n,resolution:[m.width,m.height],linewidth:(p=i??s)!==null&&p!==void 0?p:1,dashed:c,transparent:M===4},u)))}),xR=new D,SR=ie.forwardRef(function({start:e=[0,0,0],end:t=[0,0,0],mid:n,segments:i=20,...s},a){const c=ie.useRef(null);ie.useImperativeHandle(a,()=>c.current);const[u]=ie.useState(()=>new cl(void 0,void 0,void 0)),h=ie.useCallback((p,m,g,y=20)=>(p instanceof D?u.v0.copy(p):u.v0.set(...p),m instanceof D?u.v2.copy(m):u.v2.set(...m),g instanceof D?u.v1.copy(g):Array.isArray(g)?u.v1.set(...g):u.v1.copy(u.v0.clone().add(u.v2.clone().sub(u.v0)).add(xR.set(0,u.v0.y-u.v2.y,0))),u.getPoints(y)),[]);ie.useLayoutEffect(()=>{c.current.setPoints=(p,m,g)=>{const y=h(p,m,g);c.current.geometry&&c.current.geometry.setPositions(y.map(M=>M.toArray()).flat())}},[]);const f=ie.useMemo(()=>h(e,t,n,i),[e,t,n,i]);return ie.createElement(yR,Us({ref:c,points:f},s))}),Gi=1e-5;function MR(r,e,t){const n=new Hr,i=t-Gi;return n.absarc(Gi,Gi,Gi,-Math.PI/2,-Math.PI,!0),n.absarc(Gi,e-i*2,Gi,Math.PI,Math.PI/2,!0),n.absarc(r-i*2,e-i*2,Gi,Math.PI/2,0,!0),n.absarc(r-i*2,Gi,Gi,0,-Math.PI/2,!0),n}const wR=ie.forwardRef(function({args:[e=1,t=1,n=1]=[],radius:i=.05,steps:s=1,smoothness:a=4,bevelSegments:c=4,creaseAngle:u=.4,children:h,...f},p){const m=ie.useMemo(()=>MR(e,t,i),[e,t,i]),g=ie.useMemo(()=>({depth:n-i*2,bevelEnabled:!0,bevelSegments:c*2,steps:s,bevelSize:i-Gi,bevelThickness:i,curveSegments:a}),[n,i,a]),y=ie.useRef(null);return ie.useLayoutEffect(()=>{y.current&&(y.current.center(),mR(y.current,u))},[m,g]),ie.createElement("mesh",Us({ref:p},f),ie.createElement("extrudeGeometry",{ref:y,args:[m,g]}),h)});function ER(r,e,t){const s=document.createElement("canvas");s.width=2048,s.height=1024;const a=s.getContext("2d"),c=a.createLinearGradient(0,0,0,1024),u=t?"#0B2A6E":"#1747B8",h=t?"#1A4FB0":"#2F74E4";c.addColorStop(0,u),c.addColorStop(.5,h),c.addColorStop(1,u),a.fillStyle=c,a.fillRect(0,0,2048,1024),a.strokeStyle="rgba(255,255,255,0.07)",a.lineWidth=1;for(let g=-180;g<=180;g+=30){const y=(g+180)/360*2048;a.beginPath(),a.moveTo(y,0),a.lineTo(y,1024),a.stroke()}for(let g=-60;g<=60;g+=30){const y=(90-g)/180*1024;a.beginPath(),a.moveTo(0,y),a.lineTo(2048,y),a.stroke()}const f=g=>(g+180)/360*2048,p=g=>(90-g)/180*1024;r.features.forEach((g,y)=>{const M=g.properties.iso2||"";let x=oS(g,y+7);e.has(M)&&(x="#7CD992");const _=aS(g);Math.abs(_)>58&&!e.has(M)&&x.startsWith("hsl(1")&&(x=`hsl(110, 22%, ${t?62:70}%)`),a.fillStyle=x,a.beginPath();for(const E of g.geometry.coordinates)for(const w of E)w.forEach(([T,U],P)=>P?a.lineTo(f(T),p(U)):a.moveTo(f(T),p(U))),a.closePath();a.fill("evenodd"),a.strokeStyle=e.has(M)?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.38)",a.lineWidth=e.has(M)?1.6:.8,a.stroke()});const m=new Bp(s);return m.colorSpace=Xn,m.anisotropy=4,m}let ms=null;function AR(){if(ms)return ms;const r=document.createElement("canvas");r.width=64,r.height=64;const e=r.getContext("2d");e.fillStyle="#F7F9FC",e.fillRect(0,0,64,64);for(let t=8;t<64;t+=16)for(let n=6;n<64;n+=16){const i=(n*7+t*3)%7===0;e.fillStyle=i?"#FFE9B0":"#B9CFF4",e.fillRect(n,t,10,8)}return ms=new Bp(r),ms.colorSpace=Xn,ms.wrapS=Ps,ms.wrapT=Ps,ms}const xn=new Xr(1,1,1),fu=new xr(1,1,1,14),qd=new xr(1,1,1,3),TR=new ko(1,1,4),bR=new Ho(.17,.215,40),du=new yi({color:"#F3F6FB",roughness:.7}),Ov=new yi({color:"#86AEF0",roughness:.25,metalness:.25}),Bv=new yi({color:"#CBD5E3",roughness:.8}),zv=new yi({color:"#E5484D",roughness:.6});function CR(r){const e=AR().clone();return e.needsUpdate=!0,e.repeat.set(1.2,Math.max(1,Math.round(r*3.2))),new yi({map:e,roughness:.65})}function RR({kind:r,height:e,accent:t,position:n,active:i,onOver:s,onOut:a,onClick:c}){const u=Math.max(.22,e),h=ie.useMemo(()=>new yi({color:t,roughness:.45,emissive:t,emissiveIntensity:.12}),[t]),f=ie.useMemo(()=>CR(u),[u]),p=ie.useMemo(()=>new Pi({color:t,transparent:!0,opacity:.9,side:ri}),[t]),m=(y,M,x,_,E,w)=>Te.jsx("mesh",{geometry:y,material:M,position:x,scale:_,rotation:E,castShadow:!0,receiveShadow:!0},w);let g=[];switch(r){case"store":{const y=u*.8;g=[m(xn,f,[0,y/2,0],[.34,y,.28],void 0,"b"),m(xn,Ov,[0,.06,.142],[.28,.1,.01],void 0,"g"),m(xn,h,[0,.14,.17],[.36,.018,.07],[.35,0,0],"aw"),m(xn,h,[0,y+.05,.05],[.22,.08,.03],void 0,"sign")];break}case"hospital":g=[m(xn,f,[0,u/2,0],[.32,u,.3],void 0,"b"),m(xn,du,[.24,u*.3,0],[.16,u*.6,.26],void 0,"wing"),m(xn,zv,[0,u-.07,.152],[.1,.03,.01],void 0,"c1"),m(xn,zv,[0,u-.07,.152],[.03,.1,.01],void 0,"c2"),m(fu,h,[0,u+.008,0],[.09,.016,.09],void 0,"pad")];break;case"bank":{const y=u*.78;g=[m(xn,Bv,[0,.02,0],[.4,.04,.36],void 0,"pl"),m(xn,f,[0,y/2+.04,-.03],[.34,y,.24],void 0,"b"),...[-.12,-.04,.04,.12].map(M=>m(fu,du,[M,y/2+.04,.12],[.022,y,.022],void 0,`c${M}`)),m(xn,du,[0,y+.055,0],[.38,.03,.32],void 0,"ent"),m(qd,h,[0,y+.103,0],[.22,.34,.067],[-Math.PI/2,0,0],"ped")];break}case"factory":{const y=Math.max(.16,u*.45);g=[m(xn,f,[0,y/2,0],[.42,y,.3],void 0,"b"),...[-.14,0,.14].map(M=>m(qd,h,[M,y+.02,0],[.08,.3,.04],[-Math.PI/2,0,0],`t${M}`)),m(fu,Bv,[.15,u/2,-.1],[.035,u,.035],void 0,"ch"),m(fu,h,[.15,u-.04,-.1],[.038,.04,.038],void 0,"band")];break}case"campus":{const y=u*.55;g=[m(xn,f,[0,y/2,0],[.42,y,.22],void 0,"b"),m(qd,h,[0,y+.033,0],[.15,.44,.067],[-Math.PI/2,0,-Math.PI/2],"roof"),m(xn,du,[0,u/2,.02],[.1,u,.1],void 0,"tw"),m(TR,h,[0,u+.05,.02],[.085,.1,.085],[0,Math.PI/4,0],"tr")];break}default:g=[m(xn,Ov,[0,u/2,0],[.26,u,.26],void 0,"b"),m(xn,f,[0,u/2,0],[.265,u*.96,.18],void 0,"core"),m(xn,h,[0,u+.02,0],[.18,.04,.18],void 0,"crown")]}return Te.jsxs("group",{position:n,onPointerOver:s,onPointerOut:a,onClick:c,children:[g,i&&Te.jsx("mesh",{geometry:bR,material:p,rotation:[-Math.PI/2,0,0],position:[0,.006,0]})]})}const PR=new ko(1,1,7),IR=new xr(1,1,1,6),LR=new yi({color:"#3FB46B",roughness:.8}),DR=new yi({color:"#6CCB7D",roughness:.8}),UR=new yi({color:"#A57A52",roughness:.9});function NR({position:r,s:e=1,alt:t=!1}){return Te.jsxs("group",{position:r,scale:e,children:[Te.jsx("mesh",{geometry:IR,material:UR,position:[0,.03,0],scale:[.012,.06,.012],castShadow:!0}),Te.jsx("mesh",{geometry:PR,material:t?DR:LR,position:[0,.11,0],scale:[.05,.13,.05],castShadow:!0})]})}const FR=.12,Cs=1;function OR(r){return ie.useRef({rot:_u(r),target:_u(r),tilt:.12,dragging:!1,hovering:!1,lastX:0,lastY:0})}function BR({rig:r,autoRotate:e,reducedMotion:t,y:n,children:i}){const s=ie.useRef(null),a=ie.useRef(null),{gl:c,invalidate:u}=Go();return ie.useEffect(()=>{const h=c.domElement,f=M=>{r.current.dragging=!0,r.current.lastX=M.clientX,r.current.lastY=M.clientY,h.style.cursor="grabbing"},p=M=>{const x=r.current;if(!x.dragging)return;const _=M.clientX-x.lastX,E=M.clientY-x.lastY;x.lastX=M.clientX,x.lastY=M.clientY,x.rot+=_*.0065,x.target=x.rot,x.tilt=Math.max(-.35,Math.min(.6,x.tilt+E*.004)),u()},m=()=>{r.current.dragging=!1,h.style.cursor="grab"},g=()=>r.current.hovering=!0,y=()=>r.current.hovering=!1;return h.style.cursor="grab",h.style.touchAction="pan-y",h.addEventListener("pointerdown",f),window.addEventListener("pointermove",p),window.addEventListener("pointerup",m),h.addEventListener("pointerenter",g),h.addEventListener("pointerleave",y),()=>{h.removeEventListener("pointerdown",f),window.removeEventListener("pointermove",p),window.removeEventListener("pointerup",m),h.removeEventListener("pointerenter",g),h.removeEventListener("pointerleave",y)}},[c,r,u]),ml((h,f)=>{const p=r.current;!p.dragging&&e&&!t&&!p.hovering&&(p.target+=Math.min(f,.05)*.07),p.rot+=(p.target-p.rot)*Math.min(1,f*6),s.current&&(s.current.rotation.y=p.rot),a.current&&(a.current.rotation.x=p.tilt),Math.abs(p.target-p.rot)>5e-4&&u()}),Te.jsx("group",{ref:a,position:[0,n,0],children:Te.jsx("group",{ref:s,children:i})})}const kv="varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",zR="uniform vec3 c; uniform float k; varying vec3 vN; void main(){ float i = pow(max(0.0, 0.72 - dot(vN, vec3(0.0,0.0,1.0))), 3.2); gl_FragColor = vec4(c, 1.0) * i * k; }",kR="uniform vec3 c; uniform float k; varying vec3 vN; void main(){ float i = pow(1.0 - max(0.0, dot(vN, vec3(0.0,0.0,1.0))), 3.0); gl_FragColor = vec4(c, i * k); }";function HR({countries:r,dark:e}){const[t,n]=ie.useState(null),i=r.join(",");ie.useEffect(()=>{let c=!0;return lS().then(u=>{c&&n(ER(u,new Set(r),e))}),()=>{c=!1}},[i,e]),ie.useEffect(()=>()=>t==null?void 0:t.dispose(),[t]);const s=ie.useMemo(()=>new Zn({vertexShader:kv,fragmentShader:zR,uniforms:{c:{value:new Ue(e?"#4C8DFF":"#5FA2FF")},k:{value:e?.9:.75}},side:In,blending:Fa,transparent:!0,depthWrite:!1}),[e]),a=ie.useMemo(()=>new Zn({vertexShader:kv,fragmentShader:kR,uniforms:{c:{value:new Ue("#BFE0FF")},k:{value:.75}},transparent:!0,depthWrite:!1,blending:Fa}),[]);return Te.jsxs("group",{children:[Te.jsxs("mesh",{castShadow:!0,children:[Te.jsx("sphereGeometry",{args:[Cs,96,64]}),t?Te.jsx("meshStandardMaterial",{map:t,roughness:.74,metalness:.05},"tex"):Te.jsx("meshStandardMaterial",{color:e?"#1A4FB0":"#2F74E4",roughness:.78,metalness:.04},"plain")]}),Te.jsx("mesh",{material:a,scale:1.004,children:Te.jsx("sphereGeometry",{args:[Cs,64,48]})}),Te.jsx("mesh",{material:s,scale:1.16,children:Te.jsx("sphereGeometry",{args:[Cs,64,48]})})]})}const px=new Vo(1,16,12),VR=new Ho(.75,1,40);function GR({m:r,i:e,reducedMotion:t}){const n=ie.useMemo(()=>new D(...yu(r.lat,r.lon,Cs*1.004)),[r.lat,r.lon]),i=ie.useRef(null),s=ie.useMemo(()=>new Pi({color:r.color,transparent:!0,opacity:.6,side:ri,depthWrite:!1}),[r.color]),a=ie.useMemo(()=>new Pi({color:r.color,transparent:!0}),[r.color]);return ie.useLayoutEffect(()=>{var c;(c=i.current)==null||c.lookAt(n.clone().multiplyScalar(2))},[n]),ml(({clock:c})=>{const u=r.dim?.25:1;if(a.opacity=u,!i.current)return;if(t){i.current.scale.setScalar(r.size*2.2),s.opacity=.35*u;return}const h=(c.elapsedTime*.45+e*.137)%1;i.current.scale.setScalar(r.size*(1.2+h*2.6)),s.opacity=(1-h)*.65*u}),Te.jsxs("group",{children:[Te.jsx("mesh",{geometry:px,material:a,position:n,scale:r.size}),Te.jsx("mesh",{ref:i,geometry:VR,material:s,position:n})]})}function WR({a:r,reducedMotion:e,i:t}){const{start:n,end:i,mid:s,curve:a}=ie.useMemo(()=>{const u=new D(...yu(r.from[0],r.from[1],Cs*1.003)),h=new D(...yu(r.to[0],r.to[1],Cs*1.003)),f=1+.18+u.distanceTo(h)*.22,p=u.clone().add(h).normalize().multiplyScalar(f);return{start:u,end:h,mid:p,curve:new cl(u,p,h)}},[r.from,r.to]),c=ie.useRef(null);return ml(({clock:u})=>{if(!c.current||(c.current.visible=!e&&!r.dim,e))return;const h=(u.elapsedTime*.28+t*.21)%1;c.current.position.copy(a.getPoint(h))}),Te.jsxs("group",{children:[Te.jsx(SR,{start:n,end:i,mid:s,color:r.color,lineWidth:1.6,transparent:!0,opacity:r.dim?.18:.85}),Te.jsx("mesh",{ref:c,geometry:px,scale:.018,children:Te.jsx("meshBasicMaterial",{color:"#ffffff"})})]})}function XR({items:r}){const e=ie.useRef([]),t=ie.useRef([]),{camera:n,size:i}=Go(),s=ie.useMemo(()=>new D,[]),a=ie.useMemo(()=>new D,[]),c=ie.useMemo(()=>r.map((u,h)=>h).sort((u,h)=>r[u].priority-r[h].priority),[r]);return ml(()=>{var h;const u=[];for(const f of c){const p=e.current[f],m=t.current[f];if(!p||!m)continue;p.getWorldPosition(s),(h=p.parent)==null||h.getWorldPosition(a);const g=s.clone().sub(a).normalize(),y=n.position.clone().sub(s).normalize();let M=g.dot(y)>.22;const x=s.clone().project(n),_=(x.x*.5+.5)*i.width,E=(-x.y*.5+.5)*i.height,w=m.offsetWidth||140,T=m.offsetHeight||54;let U=_>i.width*.5;U&&_+12+w>i.width-4?U=!1:!U&&_-12-w<4&&(U=!0),(U?_+12+w>i.width-4:_-12-w<4)&&(M=!1);const P=E-6-T<2,L=U?_+12:_-12-w,O=P?E+6:E-6-T,k=[L-4,O-4,L+w+4,O+T+4];M&&u.some(([W,q,J,re])=>k[0]<J&&k[2]>W&&k[1]<re&&k[3]>q)&&(M=!1),M&&u.push(k);const b=M?"1":"0";m.style.opacity!==b&&(m.style.opacity=b,m.style.pointerEvents=M?"auto":"none",m.setAttribute("aria-hidden",M?"false":"true"),m.tabIndex=M?0:-1);const C=`translate(${U?12:-12-w}px, ${P?6:-6-T}px)`;m.style.transform!==C&&(m.style.transform=C)}}),Te.jsx(Te.Fragment,{children:r.map((u,h)=>Te.jsx("group",{position:yu(u.lat,u.lon,Cs*1.01),ref:f=>e.current[h]=f,children:Te.jsx(cx,{zIndexRange:[30,10],style:{pointerEvents:"none"},children:Te.jsxs("div",{ref:f=>t.current[h]=f,className:`g-callout ${u.dim?"dim":""}`,style:{opacity:0},role:"button","aria-label":`${u.label}: ${u.line1}, ${u.line2}. Filter to this region`,onClick:u.onClick,onKeyDown:f=>{var p;return(f.key==="Enter"||f.key===" ")&&((p=u.onClick)==null?void 0:p.call(u))},children:[Te.jsx(cS,{code:u.flag,size:24}),Te.jsxs("span",{children:[Te.jsx("strong",{children:u.label}),Te.jsx("small",{children:u.line1}),Te.jsx("b",{children:u.line2})]})]})})},u.id))})}const Hv=[[0,-.22],[-.42,-.2],[.42,-.24],[-.22,.24],[.24,.26],[.6,.18]];function Vv({side:r,items:e,kind:t,hoverId:n,onHover:i,onSelect:s,dark:a}){const{viewport:c,camera:u,gl:h}=Go(),p=c.getCurrentViewport(u,new D(0,-.78,.45)).width/2,m=Math.max(.45,Math.min(.86,(p-1.35)/.97)),g=Math.min(2.5,Math.max(1.35,p-.97*m)),y=a?"#1B2740":"#F1F5FB",M=a?"#1F4B3A":"#CDEFD7",x=a?"#2A3956":"#DCE3EE";return Te.jsxs("group",{position:[r*g,-.78,.45],rotation:[0,r*-.42,0],scale:m,children:[Te.jsx(wR,{args:[1.62,.1,1.12],radius:.05,smoothness:3,position:[0,-.05,0],receiveShadow:!0,children:Te.jsx("meshStandardMaterial",{color:y,roughness:.9})}),Te.jsxs("mesh",{position:[0,.003,.02],receiveShadow:!0,children:[Te.jsx("boxGeometry",{args:[1.5,.006,.12]}),Te.jsx("meshStandardMaterial",{color:x,roughness:.95})]}),[[-.56,-.38],[.56,.38],[-.62,.36]].map(([_,E],w)=>Te.jsxs("mesh",{position:[_,.004,E],receiveShadow:!0,children:[Te.jsx("boxGeometry",{args:[.36,.008,.26]}),Te.jsx("meshStandardMaterial",{color:M,roughness:.95})]},w)),[[-.68,-.42],[-.5,.42],[.7,.44],[.72,-.4],[-.72,.3],[.52,.48]].map(([_,E],w)=>Te.jsx(NR,{position:[_,0,E],s:.9+w%3*.15,alt:w%2===1},w)),e.slice(0,Hv.length).map((_,E)=>{const[w,T]=Hv[E],U=n===_.id;return Te.jsxs("group",{children:[Te.jsx(RR,{kind:t,height:_.height,accent:_.accent,position:[w,0,T],active:U,onOver:P=>{P.stopPropagation(),i(_.id),h.domElement.style.cursor="pointer"},onOut:()=>{i(null),h.domElement.style.cursor="grab"},onClick:P=>{P.stopPropagation(),P.delta<6&&s(_.id)}}),U&&Te.jsx(cx,{position:[w,_.height+.22,T],center:!0,zIndexRange:[40,30],style:{pointerEvents:"none"},children:Te.jsxs("div",{className:"b-tip",children:[Te.jsxs("span",{className:"b-rank",children:["#",_.rank]}),Te.jsx("strong",{children:_.name}),Te.jsx("small",{children:_.sub}),Te.jsx("b",{children:_.value})]})})]},_.id)})]})}function YR({dark:r}){return Te.jsxs(Te.Fragment,{children:[Te.jsx("ambientLight",{intensity:r?.55:.75}),Te.jsx("hemisphereLight",{args:[r?"#9fb6ff":"#ffffff",r?"#0b1220":"#c4d0e4",r?.45:.65]}),Te.jsx("directionalLight",{position:[3.5,5.5,5],intensity:r?1.4:1.7,castShadow:!0,"shadow-mapSize":[1024,1024],"shadow-camera-left":-4.5,"shadow-camera-right":4.5,"shadow-camera-top":2.5,"shadow-camera-bottom":-2.5,"shadow-bias":-6e-4}),Te.jsx("directionalLight",{position:[-5,1.5,-2],intensity:.45,color:"#9CC2FF"})]})}function qR({rig:r,focusLon:e,register:t}){const{invalidate:n}=Go();return ie.useEffect(()=>{t(i=>{const s=r.current;if(i==="ArrowLeft"&&(s.target-=.35),i==="ArrowRight"&&(s.target+=.35),i==="ArrowUp"&&(s.tilt=Math.min(.6,s.tilt+.12)),i==="ArrowDown"&&(s.tilt=Math.max(-.35,s.tilt-.12)),i==="Home"){const a=_u(e),c=Math.round((s.rot-a)/(Math.PI*2));s.target=a+c*Math.PI*2,s.tilt=.12}n()})},[r,e,t,n]),null}function JR(r){const e=OR(r.focusLon),t=ie.useRef(!0);ie.useEffect(()=>()=>{t.current=!1},[]);const n=ie.useRef(()=>{});ie.useEffect(()=>{const a=e.current,c=_u(r.focusLon);a.target=c+Math.round((a.rot-c)/(Math.PI*2))*Math.PI*2},[r.focusLon,e]);const i=r.buildings.filter((a,c)=>c%2===0),s=r.buildings.filter((a,c)=>c%2===1);return Te.jsx("div",{className:"scene-wrap",tabIndex:0,role:"group","aria-label":"3D globe. Drag or use the arrow keys to rotate, Home to reset. Hover or select a building for details.",onKeyDown:a=>{["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home"].includes(a.key)&&(a.preventDefault(),n.current(a.key))},onDoubleClick:()=>n.current("Home"),children:Te.jsxs(sR,{dpr:[1,1.75],shadows:!0,frameloop:r.active?r.reducedMotion?"demand":"always":"never",camera:{position:[0,1.25,5.3],fov:30,near:.1,far:60},gl:{antialias:!0,alpha:!0,powerPreference:"high-performance"},onCreated:({gl:a,camera:c})=>{c.lookAt(0,-.12,0),a.domElement.addEventListener("webglcontextlost",u=>{var h;u.preventDefault(),t.current&&((h=r.onContextLost)==null||h.call(r))})},children:[Te.jsx(YR,{dark:r.dark}),Te.jsx(qR,{rig:e,focusLon:r.focusLon,register:a=>n.current=a}),Te.jsxs(BR,{rig:e,autoRotate:r.autoRotate,reducedMotion:r.reducedMotion,y:r.showCity?FR:-.12,children:[Te.jsx(HR,{countries:r.countries,dark:r.dark}),r.markers.map((a,c)=>Te.jsx(GR,{m:a,i:c,reducedMotion:r.reducedMotion},a.id)),r.arcs.map((a,c)=>Te.jsx(WR,{a,i:c,reducedMotion:r.reducedMotion},a.id)),Te.jsx(XR,{items:r.callouts})]}),r.showCity&&Te.jsxs(Te.Fragment,{children:[Te.jsx(Vv,{side:-1,items:i,kind:r.kind,hoverId:r.hoverId,onHover:r.onHover,onSelect:r.onSelect,dark:r.dark}),Te.jsx(Vv,{side:1,items:s,kind:r.kind,hoverId:r.hoverId,onHover:r.onHover,onSelect:r.onSelect,dark:r.dark})]})]})})}export{JR as default};
