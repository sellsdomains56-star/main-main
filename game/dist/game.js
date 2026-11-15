(()=>{var sp=0,Oh=1,rp=2;var Ef=1,pc=2,ri=3,Yn=0,rn=1,Sn=2;var Ti=0,Ei=1,ci=2,Bh=3,zh=4,ap=5,Ki=100,op=101,lp=102,kh=103,Hh=104,cp=200,hp=201,up=202,fp=203,Tl=204,El=205,dp=206,pp=207,mp=208,gp=209,xp=210,vp=211,_p=212,yp=213,Mp=214,Sp=0,wp=1,bp=2,Pa=3,Tp=4,Ep=5,Ap=6,Rp=7,oo=0,Cp=1,Pp=2,Ai=0,Lp=1,Ip=2,Dp=3,mc=4,Up=5,Np=6,Vh="attached",Fp="detached",Af=300,Hs=301,Vs=302,ts=303,Al=304,lo=306,mn=1e3,sn=1001,Er=1002,kt=1003,La=1004;var _r=1005;var hn=1006,gc=1007;var Ci=1008;var Ri=1009,Op=1010,Bp=1011,xc=1012,Rf=1013,wi=1014,oi=1015,Ar=1016,Cf=1017,Pf=1018,$i=1020,zp=1021,Cn=1023,kp=1024,Hp=1025,ji=1026,Gs=1027,Vp=1028,Lf=1029,Gp=1030,If=1031,Df=1033,Vo=33776,Go=33777,Wo=33778,Xo=33779,Gh=35840,Wh=35841,Xh=35842,qh=35843,Uf=36196,Yh=37492,Kh=37496,Zh=37808,Jh=37809,$h=37810,jh=37811,Qh=37812,eu=37813,tu=37814,nu=37815,iu=37816,su=37817,ru=37818,au=37819,ou=37820,lu=37821,qo=36492,cu=36494,hu=36495,Wp=36283,uu=36284,fu=36285,du=36286,Xp=2200,qp=2201,Yp=2202,Ws=2300,ns=2301,Yo=2302,Us=2400,Ns=2401,Ia=2402,vc=2500,Kp=2501,Nf=0,co=1,Vr=2,Ff=3e3,Qi=3001,Zp=3200,Jp=3201,ho=0,$p=1,pn="",it="srgb",Vt="srgb-linear",_c="display-p3",uo="display-p3-linear",Da="linear",Rt="srgb",Ua="rec709",Na="p3";var ds=7680;var pu=519,jp=512,Qp=513,em=514,Of=515,tm=516,nm=517,im=518,sm=519,Rl=35044;var mu="300 es",Cl=1035,li=2e3,Fa=2001,hi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let i=this._listeners[e];if(i!==void 0){let s=i.indexOf(t);s!==-1&&i.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let n=this._listeners[e.type];if(n!==void 0){e.target=this;let i=n.slice(0);for(let s=0,a=i.length;s<a;s++)i[s].call(this,e);e.target=null}}},tn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],gu=1234567,yr=Math.PI/180,Xs=180/Math.PI;function Pn(){let r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(tn[r&255]+tn[r>>8&255]+tn[r>>16&255]+tn[r>>24&255]+"-"+tn[e&255]+tn[e>>8&255]+"-"+tn[e>>16&15|64]+tn[e>>24&255]+"-"+tn[t&63|128]+tn[t>>8&255]+"-"+tn[t>>16&255]+tn[t>>24&255]+tn[n&255]+tn[n>>8&255]+tn[n>>16&255]+tn[n>>24&255]).toLowerCase()}function Zt(r,e,t){return Math.max(e,Math.min(t,r))}function yc(r,e){return(r%e+e)%e}function rm(r,e,t,n,i){return n+(r-e)*(i-n)/(t-e)}function am(r,e,t){return r!==e?(t-r)/(e-r):0}function Mr(r,e,t){return(1-t)*r+t*e}function om(r,e,t,n){return Mr(r,e,1-Math.exp(-t*n))}function lm(r,e=1){return e-Math.abs(yc(r,e*2)-e)}function cm(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*(3-2*r))}function hm(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*r*(r*(r*6-15)+10))}function um(r,e){return r+Math.floor(Math.random()*(e-r+1))}function fm(r,e){return r+Math.random()*(e-r)}function dm(r){return r*(.5-Math.random())}function pm(r){r!==void 0&&(gu=r);let e=gu+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function mm(r){return r*yr}function gm(r){return r*Xs}function Pl(r){return(r&r-1)===0&&r!==0}function xm(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function Oa(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function vm(r,e,t,n,i){let s=Math.cos,a=Math.sin,o=s(t/2),l=a(t/2),c=s((e+n)/2),h=a((e+n)/2),u=s((e-n)/2),f=a((e-n)/2),d=s((n-e)/2),g=a((n-e)/2);switch(i){case"XYX":r.set(o*h,l*u,l*f,o*c);break;case"YZY":r.set(l*f,o*h,l*u,o*c);break;case"ZXZ":r.set(l*u,l*f,o*h,o*c);break;case"XZX":r.set(o*h,l*g,l*d,o*c);break;case"YXY":r.set(l*d,o*h,l*g,o*c);break;case"ZYZ":r.set(l*g,l*d,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function qn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function wt(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}var $t={DEG2RAD:yr,RAD2DEG:Xs,generateUUID:Pn,clamp:Zt,euclideanModulo:yc,mapLinear:rm,inverseLerp:am,lerp:Mr,damp:om,pingpong:lm,smoothstep:cm,smootherstep:hm,randInt:um,randFloat:fm,randFloatSpread:dm,seededRandom:pm,degToRad:mm,radToDeg:gm,isPowerOfTwo:Pl,ceilPowerOfTwo:xm,floorPowerOfTwo:Oa,setQuaternionFromProperEuler:vm,normalize:wt,denormalize:qn},pe=class r{constructor(e=0,t=0){r.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Zt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*i+e.x,this.y=s*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},nt=class r{constructor(e,t,n,i,s,a,o,l,c){r.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c)}set(e,t,n,i,s,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=i,h[2]=o,h[3]=t,h[4]=s,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],d=n[5],g=n[8],x=i[0],m=i[3],p=i[6],_=i[1],v=i[4],M=i[7],D=i[2],C=i[5],P=i[8];return s[0]=a*x+o*_+l*D,s[3]=a*m+o*v+l*C,s[6]=a*p+o*M+l*P,s[1]=c*x+h*_+u*D,s[4]=c*m+h*v+u*C,s[7]=c*p+h*M+u*P,s[2]=f*x+d*_+g*D,s[5]=f*m+d*v+g*C,s[8]=f*p+d*M+g*P,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*s*h+n*o*l+i*s*c-i*a*l}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,f=o*l-h*s,d=c*s-a*l,g=t*u+n*f+i*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return e[0]=u*x,e[1]=(i*c-h*n)*x,e[2]=(o*n-i*a)*x,e[3]=f*x,e[4]=(h*t-i*l)*x,e[5]=(i*s-o*t)*x,e[6]=d*x,e[7]=(n*l-c*t)*x,e[8]=(a*t-n*s)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,a,o){let l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-i*c,i*l,-i*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Ko.makeScale(e,t)),this}rotate(e){return this.premultiply(Ko.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ko.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Ko=new nt;function Bf(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function Rr(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function _m(){let r=Rr("canvas");return r.style.display="block",r}var xu={};function Sr(r){r in xu||(xu[r]=!0,console.warn(r))}var vu=new nt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),_u=new nt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Jr={[Vt]:{transfer:Da,primaries:Ua,toReference:r=>r,fromReference:r=>r},[it]:{transfer:Rt,primaries:Ua,toReference:r=>r.convertSRGBToLinear(),fromReference:r=>r.convertLinearToSRGB()},[uo]:{transfer:Da,primaries:Na,toReference:r=>r.applyMatrix3(_u),fromReference:r=>r.applyMatrix3(vu)},[_c]:{transfer:Rt,primaries:Na,toReference:r=>r.convertSRGBToLinear().applyMatrix3(_u),fromReference:r=>r.applyMatrix3(vu).convertLinearToSRGB()}},ym=new Set([Vt,uo]),xt={enabled:!0,_workingColorSpace:Vt,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(r){if(!ym.has(r))throw new Error(`Unsupported working color space, "${r}".`);this._workingColorSpace=r},convert:function(r,e,t){if(this.enabled===!1||e===t||!e||!t)return r;let n=Jr[e].toReference,i=Jr[t].fromReference;return i(n(r))},fromWorkingColorSpace:function(r,e){return this.convert(r,this._workingColorSpace,e)},toWorkingColorSpace:function(r,e){return this.convert(r,e,this._workingColorSpace)},getPrimaries:function(r){return Jr[r].primaries},getTransfer:function(r){return r===pn?Da:Jr[r].transfer}};function zs(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function Zo(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}var ps,Ba=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{ps===void 0&&(ps=Rr("canvas")),ps.width=e.width,ps.height=e.height;let n=ps.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=ps}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Rr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let a=0;a<s.length;a++)s[a]=zs(s[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(zs(t[n]/255)*255):t[n]=zs(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Mm=0,za=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Mm++}),this.uuid=Pn(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?s.push(Jo(i[a].image)):s.push(Jo(i[a]))}else s=Jo(i);n.url=s}return t||(e.images[this.uuid]=n),n}};function Jo(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?Ba.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Sm=0,It=class r extends hi{constructor(e=r.DEFAULT_IMAGE,t=r.DEFAULT_MAPPING,n=sn,i=sn,s=hn,a=Ci,o=Cn,l=Ri,c=r.DEFAULT_ANISOTROPY,h=pn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Sm++}),this.uuid=Pn(),this.name="",this.source=new za(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new pe(0,0),this.repeat=new pe(1,1),this.center=new pe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new nt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof h=="string"?this.colorSpace=h:(Sr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=h===Qi?it:pn),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Af)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case mn:e.x=e.x-Math.floor(e.x);break;case sn:e.x=e.x<0?0:1;break;case Er:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case mn:e.y=e.y-Math.floor(e.y);break;case sn:e.y=e.y<0?0:1;break;case Er:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Sr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===it?Qi:Ff}set encoding(e){Sr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===Qi?it:pn}};It.DEFAULT_IMAGE=null;It.DEFAULT_MAPPING=Af;It.DEFAULT_ANISOTROPY=1;var dt=class r{constructor(e=0,t=0,n=0,i=1){r.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s,l=e.elements,c=l[0],h=l[4],u=l[8],f=l[1],d=l[5],g=l[9],x=l[2],m=l[6],p=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+x)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let v=(c+1)/2,M=(d+1)/2,D=(p+1)/2,C=(h+f)/4,P=(u+x)/4,V=(g+m)/4;return v>M&&v>D?v<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(v),i=C/n,s=P/n):M>D?M<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(M),n=C/i,s=V/i):D<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(D),n=P/s,i=V/s),this.set(n,i,s,t),this}let _=Math.sqrt((m-g)*(m-g)+(u-x)*(u-x)+(f-h)*(f-h));return Math.abs(_)<.001&&(_=1),this.x=(m-g)/_,this.y=(u-x)/_,this.z=(f-h)/_,this.w=Math.acos((c+d+p-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ll=class extends hi{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new dt(0,0,e,t),this.scissorTest=!1,this.viewport=new dt(0,0,e,t);let i={width:e,height:t,depth:1};n.encoding!==void 0&&(Sr("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),n.colorSpace=n.encoding===Qi?it:pn),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:hn,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},n),this.texture=new It(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps,this.texture.internalFormat=n.internalFormat,this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}setSize(e,t,n=1){(this.width!==e||this.height!==t||this.depth!==n)&&(this.width=e,this.height=t,this.depth=n,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new za(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},ui=class extends Ll{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},ka=class extends It{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=kt,this.minFilter=kt,this.wrapR=sn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Il=class extends It{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=kt,this.minFilter=kt,this.wrapR=sn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var bt=class{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3],f=s[a+0],d=s[a+1],g=s[a+2],x=s[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(o===1){e[t+0]=f,e[t+1]=d,e[t+2]=g,e[t+3]=x;return}if(u!==x||l!==f||c!==d||h!==g){let m=1-o,p=l*f+c*d+h*g+u*x,_=p>=0?1:-1,v=1-p*p;if(v>Number.EPSILON){let D=Math.sqrt(v),C=Math.atan2(D,p*_);m=Math.sin(m*C)/D,o=Math.sin(o*C)/D}let M=o*_;if(l=l*m+f*M,c=c*m+d*M,h=h*m+g*M,u=u*m+x*M,m===1-o){let D=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=D,c*=D,h*=D,u*=D}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,s,a){let o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=s[a],f=s[a+1],d=s[a+2],g=s[a+3];return e[t]=o*g+h*u+l*d-c*f,e[t+1]=l*g+h*f+c*u-o*d,e[t+2]=c*g+h*d+o*f-l*u,e[t+3]=h*g-o*u-l*f-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,i=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),u=o(s/2),f=l(n/2),d=l(i/2),g=l(s/2);switch(a){case"XYZ":this._x=f*h*u+c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u-f*d*g;break;case"YXZ":this._x=f*h*u+c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u+f*d*g;break;case"ZXY":this._x=f*h*u-c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u-f*d*g;break;case"ZYX":this._x=f*h*u-c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u+f*d*g;break;case"YZX":this._x=f*h*u+c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u-f*d*g;break;case"XZY":this._x=f*h*u-c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u+f*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],s=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],f=n+o+u;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-l)*d,this._y=(s-c)*d,this._z=(a-i)*d}else if(n>o&&n>u){let d=2*Math.sqrt(1+n-o-u);this._w=(h-l)/d,this._x=.25*d,this._y=(i+a)/d,this._z=(s+c)/d}else if(o>u){let d=2*Math.sqrt(1+o-n-u);this._w=(s-c)/d,this._x=(i+a)/d,this._y=.25*d,this._z=(l+h)/d}else{let d=2*Math.sqrt(1+u-n-o);this._w=(a-i)/d,this._x=(s+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Zt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,i=e._y,s=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+i*c-s*l,this._y=i*h+a*l+s*o-n*c,this._z=s*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,i=this._y,s=this._z,a=this._w,o=a*e._w+n*e._x+i*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=i,this._z=s,this;let l=1-o*o;if(l<=Number.EPSILON){let d=1-t;return this._w=d*a+t*this._w,this._x=d*n+t*this._x,this._y=d*i+t*this._y,this._z=d*s+t*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-t)*h)/c,f=Math.sin(t*h)/c;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=i*u+this._y*f,this._z=s*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=Math.random(),t=Math.sqrt(1-e),n=Math.sqrt(e),i=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(t*Math.cos(i),n*Math.sin(s),n*Math.cos(s),t*Math.sin(i))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},R=class r{constructor(e=0,t=0,n=0){r.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(yu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(yu.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*i-o*n),h=2*(o*t-s*i),u=2*(s*n-a*t);return this.x=t+l*c+a*u-o*h,this.y=n+l*h+o*c-s*u,this.z=i+l*u+s*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,i=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=i*l-s*o,this.y=s*a-n*l,this.z=n*o-i*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return $o.copy(this).projectOnVector(e),this.sub($o)}reflect(e){return this.sub($o.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Zt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,n=Math.sqrt(1-e**2);return this.x=n*Math.cos(t),this.y=n*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},$o=new R,yu=new bt,un=class{constructor(e=new R(1/0,1/0,1/0),t=new R(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Fn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Fn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Fn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Fn):Fn.fromBufferAttribute(s,a),Fn.applyMatrix4(e.matrixWorld),this.expandByPoint(Fn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),$r.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),$r.copy(n.boundingBox)),$r.applyMatrix4(e.matrixWorld),this.union($r)}let i=e.children;for(let s=0,a=i.length;s<a;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Fn),Fn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(cr),jr.subVectors(this.max,cr),ms.subVectors(e.a,cr),gs.subVectors(e.b,cr),xs.subVectors(e.c,cr),vi.subVectors(gs,ms),_i.subVectors(xs,gs),Gi.subVectors(ms,xs);let t=[0,-vi.z,vi.y,0,-_i.z,_i.y,0,-Gi.z,Gi.y,vi.z,0,-vi.x,_i.z,0,-_i.x,Gi.z,0,-Gi.x,-vi.y,vi.x,0,-_i.y,_i.x,0,-Gi.y,Gi.x,0];return!jo(t,ms,gs,xs,jr)||(t=[1,0,0,0,1,0,0,0,1],!jo(t,ms,gs,xs,jr))?!1:(Qr.crossVectors(vi,_i),t=[Qr.x,Qr.y,Qr.z],jo(t,ms,gs,xs,jr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Fn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Fn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Qn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Qn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Qn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Qn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Qn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Qn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Qn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Qn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Qn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Qn=[new R,new R,new R,new R,new R,new R,new R,new R],Fn=new R,$r=new un,ms=new R,gs=new R,xs=new R,vi=new R,_i=new R,Gi=new R,cr=new R,jr=new R,Qr=new R,Wi=new R;function jo(r,e,t,n,i){for(let s=0,a=r.length-3;s<=a;s+=3){Wi.fromArray(r,s);let o=i.x*Math.abs(Wi.x)+i.y*Math.abs(Wi.y)+i.z*Math.abs(Wi.z),l=e.dot(Wi),c=t.dot(Wi),h=n.dot(Wi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var wm=new un,hr=new R,Qo=new R,wn=class{constructor(e=new R,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):wm.setFromPoints(e).getCenter(n);let i=0;for(let s=0,a=e.length;s<a;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;hr.subVectors(e,this.center);let t=hr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(hr,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Qo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(hr.copy(e.center).add(Qo)),this.expandByPoint(hr.copy(e.center).sub(Qo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},ei=new R,el=new R,ea=new R,yi=new R,tl=new R,ta=new R,nl=new R,qs=class{constructor(e=new R,t=new R(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ei)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=ei.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ei.copy(this.origin).addScaledVector(this.direction,t),ei.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){el.copy(e).add(t).multiplyScalar(.5),ea.copy(t).sub(e).normalize(),yi.copy(this.origin).sub(el);let s=e.distanceTo(t)*.5,a=-this.direction.dot(ea),o=yi.dot(this.direction),l=-yi.dot(ea),c=yi.lengthSq(),h=Math.abs(1-a*a),u,f,d,g;if(h>0)if(u=a*l-o,f=a*o-l,g=s*h,u>=0)if(f>=-g)if(f<=g){let x=1/h;u*=x,f*=x,d=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=s,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f=-s,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f<=-g?(u=Math.max(0,-(-a*s+o)),f=u>0?-s:Math.min(Math.max(-s,-l),s),d=-u*u+f*(f+2*l)+c):f<=g?(u=0,f=Math.min(Math.max(-s,-l),s),d=f*(f+2*l)+c):(u=Math.max(0,-(a*s+o)),f=u>0?s:Math.min(Math.max(-s,-l),s),d=-u*u+f*(f+2*l)+c);else f=a>0?-s:s,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(el).addScaledVector(ea,f),d}intersectSphere(e,t){ei.subVectors(e.center,this.origin);let n=ei.dot(this.direction),i=ei.dot(ei)-n*n,s=e.radius*e.radius;if(i>s)return null;let a=Math.sqrt(s-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,a,o,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,i=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,i=(e.min.x-f.x)*c),h>=0?(s=(e.min.y-f.y)*h,a=(e.max.y-f.y)*h):(s=(e.max.y-f.y)*h,a=(e.min.y-f.y)*h),n>a||s>i||((s>n||isNaN(n))&&(n=s),(a<i||isNaN(i))&&(i=a),u>=0?(o=(e.min.z-f.z)*u,l=(e.max.z-f.z)*u):(o=(e.max.z-f.z)*u,l=(e.min.z-f.z)*u),n>l||o>i)||((o>n||n!==n)&&(n=o),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,ei)!==null}intersectTriangle(e,t,n,i,s){tl.subVectors(t,e),ta.subVectors(n,e),nl.crossVectors(tl,ta);let a=this.direction.dot(nl),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;yi.subVectors(this.origin,e);let l=o*this.direction.dot(ta.crossVectors(yi,ta));if(l<0)return null;let c=o*this.direction.dot(tl.cross(yi));if(c<0||l+c>a)return null;let h=-o*yi.dot(nl);return h<0?null:this.at(h/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ie=class r{constructor(e,t,n,i,s,a,o,l,c,h,u,f,d,g,x,m){r.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c,h,u,f,d,g,x,m)}set(e,t,n,i,s,a,o,l,c,h,u,f,d,g,x,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=s,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=f,p[3]=d,p[7]=g,p[11]=x,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new r().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,i=1/vs.setFromMatrixColumn(e,0).length(),s=1/vs.setFromMatrixColumn(e,1).length(),a=1/vs.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,i=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(s),u=Math.sin(s);if(e.order==="XYZ"){let f=a*h,d=a*u,g=o*h,x=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=d+g*c,t[5]=f-x*c,t[9]=-o*l,t[2]=x-f*c,t[6]=g+d*c,t[10]=a*l}else if(e.order==="YXZ"){let f=l*h,d=l*u,g=c*h,x=c*u;t[0]=f+x*o,t[4]=g*o-d,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=d*o-g,t[6]=x+f*o,t[10]=a*l}else if(e.order==="ZXY"){let f=l*h,d=l*u,g=c*h,x=c*u;t[0]=f-x*o,t[4]=-a*u,t[8]=g+d*o,t[1]=d+g*o,t[5]=a*h,t[9]=x-f*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let f=a*h,d=a*u,g=o*h,x=o*u;t[0]=l*h,t[4]=g*c-d,t[8]=f*c+x,t[1]=l*u,t[5]=x*c+f,t[9]=d*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let f=a*l,d=a*c,g=o*l,x=o*c;t[0]=l*h,t[4]=x-f*u,t[8]=g*u+d,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=d*u+g,t[10]=f-x*u}else if(e.order==="XZY"){let f=a*l,d=a*c,g=o*l,x=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=f*u+x,t[5]=a*h,t[9]=d*u-g,t[2]=g*u-d,t[6]=o*h,t[10]=x*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(bm,e,Tm)}lookAt(e,t,n){let i=this.elements;return yn.subVectors(e,t),yn.lengthSq()===0&&(yn.z=1),yn.normalize(),Mi.crossVectors(n,yn),Mi.lengthSq()===0&&(Math.abs(n.z)===1?yn.x+=1e-4:yn.z+=1e-4,yn.normalize(),Mi.crossVectors(n,yn)),Mi.normalize(),na.crossVectors(yn,Mi),i[0]=Mi.x,i[4]=na.x,i[8]=yn.x,i[1]=Mi.y,i[5]=na.y,i[9]=yn.y,i[2]=Mi.z,i[6]=na.z,i[10]=yn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],d=n[13],g=n[2],x=n[6],m=n[10],p=n[14],_=n[3],v=n[7],M=n[11],D=n[15],C=i[0],P=i[4],V=i[8],w=i[12],E=i[1],q=i[5],Q=i[9],le=i[13],F=i[2],Y=i[6],J=i[10],ae=i[14],ie=i[3],ee=i[7],oe=i[11],k=i[15];return s[0]=a*C+o*E+l*F+c*ie,s[4]=a*P+o*q+l*Y+c*ee,s[8]=a*V+o*Q+l*J+c*oe,s[12]=a*w+o*le+l*ae+c*k,s[1]=h*C+u*E+f*F+d*ie,s[5]=h*P+u*q+f*Y+d*ee,s[9]=h*V+u*Q+f*J+d*oe,s[13]=h*w+u*le+f*ae+d*k,s[2]=g*C+x*E+m*F+p*ie,s[6]=g*P+x*q+m*Y+p*ee,s[10]=g*V+x*Q+m*J+p*oe,s[14]=g*w+x*le+m*ae+p*k,s[3]=_*C+v*E+M*F+D*ie,s[7]=_*P+v*q+M*Y+D*ee,s[11]=_*V+v*Q+M*J+D*oe,s[15]=_*w+v*le+M*ae+D*k,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],f=e[10],d=e[14],g=e[3],x=e[7],m=e[11],p=e[15];return g*(+s*l*u-i*c*u-s*o*f+n*c*f+i*o*d-n*l*d)+x*(+t*l*d-t*c*f+s*a*f-i*a*d+i*c*h-s*l*h)+m*(+t*c*u-t*o*d-s*a*u+n*a*d+s*o*h-n*c*h)+p*(-i*o*h-t*l*u+t*o*f+i*a*u-n*a*f+n*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],f=e[10],d=e[11],g=e[12],x=e[13],m=e[14],p=e[15],_=u*m*c-x*f*c+x*l*d-o*m*d-u*l*p+o*f*p,v=g*f*c-h*m*c-g*l*d+a*m*d+h*l*p-a*f*p,M=h*x*c-g*u*c+g*o*d-a*x*d-h*o*p+a*u*p,D=g*u*l-h*x*l-g*o*f+a*x*f+h*o*m-a*u*m,C=t*_+n*v+i*M+s*D;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let P=1/C;return e[0]=_*P,e[1]=(x*f*s-u*m*s-x*i*d+n*m*d+u*i*p-n*f*p)*P,e[2]=(o*m*s-x*l*s+x*i*c-n*m*c-o*i*p+n*l*p)*P,e[3]=(u*l*s-o*f*s-u*i*c+n*f*c+o*i*d-n*l*d)*P,e[4]=v*P,e[5]=(h*m*s-g*f*s+g*i*d-t*m*d-h*i*p+t*f*p)*P,e[6]=(g*l*s-a*m*s-g*i*c+t*m*c+a*i*p-t*l*p)*P,e[7]=(a*f*s-h*l*s+h*i*c-t*f*c-a*i*d+t*l*d)*P,e[8]=M*P,e[9]=(g*u*s-h*x*s-g*n*d+t*x*d+h*n*p-t*u*p)*P,e[10]=(a*x*s-g*o*s+g*n*c-t*x*c-a*n*p+t*o*p)*P,e[11]=(h*o*s-a*u*s-h*n*c+t*u*c+a*n*d-t*o*d)*P,e[12]=D*P,e[13]=(h*x*i-g*u*i+g*n*f-t*x*f-h*n*m+t*u*m)*P,e[14]=(g*o*i-a*x*i-g*n*l+t*x*l+a*n*m-t*o*m)*P,e[15]=(a*u*i-h*o*i+h*n*l-t*u*l-a*n*f+t*o*f)*P,this}scale(e){let t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),s=1-n,a=e.x,o=e.y,l=e.z,c=s*a,h=s*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,a){return this.set(1,n,s,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,c=s+s,h=a+a,u=o+o,f=s*c,d=s*h,g=s*u,x=a*h,m=a*u,p=o*u,_=l*c,v=l*h,M=l*u,D=n.x,C=n.y,P=n.z;return i[0]=(1-(x+p))*D,i[1]=(d+M)*D,i[2]=(g-v)*D,i[3]=0,i[4]=(d-M)*C,i[5]=(1-(f+p))*C,i[6]=(m+_)*C,i[7]=0,i[8]=(g+v)*P,i[9]=(m-_)*P,i[10]=(1-(f+x))*P,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements,s=vs.set(i[0],i[1],i[2]).length(),a=vs.set(i[4],i[5],i[6]).length(),o=vs.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),e.x=i[12],e.y=i[13],e.z=i[14],On.copy(this);let c=1/s,h=1/a,u=1/o;return On.elements[0]*=c,On.elements[1]*=c,On.elements[2]*=c,On.elements[4]*=h,On.elements[5]*=h,On.elements[6]*=h,On.elements[8]*=u,On.elements[9]*=u,On.elements[10]*=u,t.setFromRotationMatrix(On),n.x=s,n.y=a,n.z=o,this}makePerspective(e,t,n,i,s,a,o=li){let l=this.elements,c=2*s/(t-e),h=2*s/(n-i),u=(t+e)/(t-e),f=(n+i)/(n-i),d,g;if(o===li)d=-(a+s)/(a-s),g=-2*a*s/(a-s);else if(o===Fa)d=-a/(a-s),g=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,s,a,o=li){let l=this.elements,c=1/(t-e),h=1/(n-i),u=1/(a-s),f=(t+e)*c,d=(n+i)*h,g,x;if(o===li)g=(a+s)*u,x=-2*u;else if(o===Fa)g=s*u,x=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=x,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},vs=new R,On=new Ie,bm=new R(0,0,0),Tm=new R(1,1,1),Mi=new R,na=new R,yn=new R,Mu=new Ie,Su=new bt,Gt=class r{constructor(e=0,t=0,n=0,i=r.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,s=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],u=i[2],f=i[6],d=i[10];switch(t){case"XYZ":this._y=Math.asin(Zt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Zt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(Zt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Zt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Zt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-Zt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Mu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Mu,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Su.setFromEuler(this),this.setFromQuaternion(Su,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Gt.DEFAULT_ORDER="XYZ";var Ha=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Em=0,wu=new R,_s=new bt,ti=new Ie,ia=new R,ur=new R,Am=new R,Rm=new bt,bu=new R(1,0,0),Tu=new R(0,1,0),Eu=new R(0,0,1),Cm={type:"added"},Pm={type:"removed"},Mt=class r extends hi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Em++}),this.uuid=Pn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=r.DEFAULT_UP.clone();let e=new R,t=new Gt,n=new bt,i=new R(1,1,1);function s(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Ie},normalMatrix:{value:new nt}}),this.matrix=new Ie,this.matrixWorld=new Ie,this.matrixAutoUpdate=r.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=r.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ha,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return _s.setFromAxisAngle(e,t),this.quaternion.multiply(_s),this}rotateOnWorldAxis(e,t){return _s.setFromAxisAngle(e,t),this.quaternion.premultiply(_s),this}rotateX(e){return this.rotateOnAxis(bu,e)}rotateY(e){return this.rotateOnAxis(Tu,e)}rotateZ(e){return this.rotateOnAxis(Eu,e)}translateOnAxis(e,t){return wu.copy(e).applyQuaternion(this.quaternion),this.position.add(wu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(bu,e)}translateY(e){return this.translateOnAxis(Tu,e)}translateZ(e){return this.translateOnAxis(Eu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ti.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ia.copy(e):ia.set(e,t,n);let i=this.parent;this.updateWorldMatrix(!0,!1),ur.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ti.lookAt(ur,ia,this.up):ti.lookAt(ia,ur,this.up),this.quaternion.setFromRotationMatrix(ti),i&&(ti.extractRotation(i.matrixWorld),_s.setFromRotationMatrix(ti),this.quaternion.premultiply(_s.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(Cm)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Pm)),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ti.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ti.multiply(e.parent.matrixWorld)),e.applyMatrix4(ti),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ur,e,Am),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ur,Rm,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,i=t.length;n<i;n++){let s=t[n];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){let i=this.children;for(let s=0,a=i.length;s<a;s++){let o=i[s];o.matrixWorldAutoUpdate===!0&&o.updateWorldMatrix(!1,!0)}}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),i.maxGeometryCount=this._maxGeometryCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];s(e.shapes,u)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));i.material=o}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];i.animations.push(s(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),f=a(e.skeletons),d=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=i,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}};Mt.DEFAULT_UP=new R(0,1,0);Mt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Mt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Bn=new R,ni=new R,il=new R,ii=new R,ys=new R,Ms=new R,Au=new R,sl=new R,rl=new R,al=new R,sa=!1,Ji=class r{constructor(e=new R,t=new R,n=new R){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),Bn.subVectors(e,t),i.cross(Bn);let s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){Bn.subVectors(i,t),ni.subVectors(n,t),il.subVectors(e,t);let a=Bn.dot(Bn),o=Bn.dot(ni),l=Bn.dot(il),c=ni.dot(ni),h=ni.dot(il),u=a*c-o*o;if(u===0)return s.set(0,0,0),null;let f=1/u,d=(c*l-o*h)*f,g=(a*h-o*l)*f;return s.set(1-d-g,g,d)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,ii)===null?!1:ii.x>=0&&ii.y>=0&&ii.x+ii.y<=1}static getUV(e,t,n,i,s,a,o,l){return sa===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),sa=!0),this.getInterpolation(e,t,n,i,s,a,o,l)}static getInterpolation(e,t,n,i,s,a,o,l){return this.getBarycoord(e,t,n,i,ii)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,ii.x),l.addScaledVector(a,ii.y),l.addScaledVector(o,ii.z),l)}static isFrontFacing(e,t,n,i){return Bn.subVectors(n,t),ni.subVectors(e,t),Bn.cross(ni).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Bn.subVectors(this.c,this.b),ni.subVectors(this.a,this.b),Bn.cross(ni).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return r.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return r.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,n,i,s){return sa===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),sa=!0),r.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}getInterpolation(e,t,n,i,s){return r.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return r.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return r.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,s=this.c,a,o;ys.subVectors(i,n),Ms.subVectors(s,n),sl.subVectors(e,n);let l=ys.dot(sl),c=Ms.dot(sl);if(l<=0&&c<=0)return t.copy(n);rl.subVectors(e,i);let h=ys.dot(rl),u=Ms.dot(rl);if(h>=0&&u<=h)return t.copy(i);let f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(ys,a);al.subVectors(e,s);let d=ys.dot(al),g=Ms.dot(al);if(g>=0&&d<=g)return t.copy(s);let x=d*c-l*g;if(x<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(Ms,o);let m=h*g-d*u;if(m<=0&&u-h>=0&&d-g>=0)return Au.subVectors(s,i),o=(u-h)/(u-h+(d-g)),t.copy(i).addScaledVector(Au,o);let p=1/(m+x+f);return a=x*p,o=f*p,t.copy(n).addScaledVector(ys,a).addScaledVector(Ms,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},zf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Si={h:0,s:0,l:0},ra={h:0,s:0,l:0};function ol(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}var Re=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=it){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,xt.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=xt.workingColorSpace){return this.r=e,this.g=t,this.b=n,xt.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=xt.workingColorSpace){if(e=yc(e,1),t=Zt(t,0,1),n=Zt(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=ol(a,s,e+1/3),this.g=ol(a,s,e),this.b=ol(a,s,e-1/3)}return xt.toWorkingColorSpace(this,i),this}setStyle(e,t=it){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=i[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=it){let n=zf[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=zs(e.r),this.g=zs(e.g),this.b=zs(e.b),this}copyLinearToSRGB(e){return this.r=Zo(e.r),this.g=Zo(e.g),this.b=Zo(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=it){return xt.fromWorkingColorSpace(nn.copy(this),e),Math.round(Zt(nn.r*255,0,255))*65536+Math.round(Zt(nn.g*255,0,255))*256+Math.round(Zt(nn.b*255,0,255))}getHexString(e=it){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=xt.workingColorSpace){xt.fromWorkingColorSpace(nn.copy(this),t);let n=nn.r,i=nn.g,s=nn.b,a=Math.max(n,i,s),o=Math.min(n,i,s),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(i-s)/u+(i<s?6:0);break;case i:l=(s-n)/u+2;break;case s:l=(n-i)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=xt.workingColorSpace){return xt.fromWorkingColorSpace(nn.copy(this),t),e.r=nn.r,e.g=nn.g,e.b=nn.b,e}getStyle(e=it){xt.fromWorkingColorSpace(nn.copy(this),e);let t=nn.r,n=nn.g,i=nn.b;return e!==it?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Si),this.setHSL(Si.h+e,Si.s+t,Si.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Si),e.getHSL(ra);let n=Mr(Si.h,ra.h,t),i=Mr(Si.s,ra.s,t),s=Mr(Si.l,ra.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},nn=new Re;Re.NAMES=zf;var Lm=0,an=class extends hi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Lm++}),this.uuid=Pn(),this.name="",this.type="Material",this.blending=Ei,this.side=Yn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Tl,this.blendDst=El,this.blendEquation=Ki,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Re(0,0,0),this.blendAlpha=0,this.depthFunc=Pa,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=pu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ds,this.stencilZFail=ds,this.stencilZPass=ds,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ei&&(n.blending=this.blending),this.side!==Yn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Tl&&(n.blendSrc=this.blendSrc),this.blendDst!==El&&(n.blendDst=this.blendDst),this.blendEquation!==Ki&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Pa&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==pu&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ds&&(n.stencilFail=this.stencilFail),this.stencilZFail!==ds&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==ds&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){let a=[];for(let o in s){let l=s[o];delete l.metadata,a.push(l)}return a}if(t){let s=i(e.textures),a=i(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Jt=class extends an{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Re(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=oo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var zt=new R,aa=new pe,Ht=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Rl,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=oi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)aa.fromBufferAttribute(this,t),aa.applyMatrix3(e),this.setXY(t,aa.x,aa.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)zt.fromBufferAttribute(this,t),zt.applyMatrix3(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)zt.fromBufferAttribute(this,t),zt.applyMatrix4(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)zt.fromBufferAttribute(this,t),zt.applyNormalMatrix(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)zt.fromBufferAttribute(this,t),zt.transformDirection(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=qn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=wt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=qn(t,this.array)),t}setX(e,t){return this.normalized&&(t=wt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=qn(t,this.array)),t}setY(e,t){return this.normalized&&(t=wt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=qn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=wt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=qn(t,this.array)),t}setW(e,t){return this.normalized&&(t=wt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=wt(t,this.array),n=wt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=wt(t,this.array),n=wt(n,this.array),i=wt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=wt(t,this.array),n=wt(n,this.array),i=wt(i,this.array),s=wt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Rl&&(e.usage=this.usage),e}};var Pi=class extends Ht{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Ys=class extends Ht{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var pt=class extends Ht{constructor(e,t,n){super(new Float32Array(e),t,n)}};var Im=0,Rn=new Ie,ll=new Mt,Ss=new R,Mn=new un,fr=new un,Kt=new R,Dt=class r extends hi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Im++}),this.uuid=Pn(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Bf(e)?Ys:Pi)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new nt().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Rn.makeRotationFromQuaternion(e),this.applyMatrix4(Rn),this}rotateX(e){return Rn.makeRotationX(e),this.applyMatrix4(Rn),this}rotateY(e){return Rn.makeRotationY(e),this.applyMatrix4(Rn),this}rotateZ(e){return Rn.makeRotationZ(e),this.applyMatrix4(Rn),this}translate(e,t,n){return Rn.makeTranslation(e,t,n),this.applyMatrix4(Rn),this}scale(e,t,n){return Rn.makeScale(e,t,n),this.applyMatrix4(Rn),this}lookAt(e){return ll.lookAt(e),ll.updateMatrix(),this.applyMatrix4(ll.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ss).negate(),this.translate(Ss.x,Ss.y,Ss.z),this}setFromPoints(e){let t=[];for(let n=0,i=e.length;n<i;n++){let s=e[n];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new pt(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new un);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new R(-1/0,-1/0,-1/0),new R(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let s=t[n];Mn.setFromBufferAttribute(s),this.morphTargetsRelative?(Kt.addVectors(this.boundingBox.min,Mn.min),this.boundingBox.expandByPoint(Kt),Kt.addVectors(this.boundingBox.max,Mn.max),this.boundingBox.expandByPoint(Kt)):(this.boundingBox.expandByPoint(Mn.min),this.boundingBox.expandByPoint(Mn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new wn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new R,1/0);return}if(e){let n=this.boundingSphere.center;if(Mn.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){let o=t[s];fr.setFromBufferAttribute(o),this.morphTargetsRelative?(Kt.addVectors(Mn.min,fr.min),Mn.expandByPoint(Kt),Kt.addVectors(Mn.max,fr.max),Mn.expandByPoint(Kt)):(Mn.expandByPoint(fr.min),Mn.expandByPoint(fr.max))}Mn.getCenter(n);let i=0;for(let s=0,a=e.count;s<a;s++)Kt.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(Kt));if(t)for(let s=0,a=t.length;s<a;s++){let o=t[s],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Kt.fromBufferAttribute(o,c),l&&(Ss.fromBufferAttribute(e,c),Kt.add(Ss)),i=Math.max(i,n.distanceToSquared(Kt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.array,i=t.position.array,s=t.normal.array,a=t.uv.array,o=i.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ht(new Float32Array(4*o),4));let l=this.getAttribute("tangent").array,c=[],h=[];for(let E=0;E<o;E++)c[E]=new R,h[E]=new R;let u=new R,f=new R,d=new R,g=new pe,x=new pe,m=new pe,p=new R,_=new R;function v(E,q,Q){u.fromArray(i,E*3),f.fromArray(i,q*3),d.fromArray(i,Q*3),g.fromArray(a,E*2),x.fromArray(a,q*2),m.fromArray(a,Q*2),f.sub(u),d.sub(u),x.sub(g),m.sub(g);let le=1/(x.x*m.y-m.x*x.y);isFinite(le)&&(p.copy(f).multiplyScalar(m.y).addScaledVector(d,-x.y).multiplyScalar(le),_.copy(d).multiplyScalar(x.x).addScaledVector(f,-m.x).multiplyScalar(le),c[E].add(p),c[q].add(p),c[Q].add(p),h[E].add(_),h[q].add(_),h[Q].add(_))}let M=this.groups;M.length===0&&(M=[{start:0,count:n.length}]);for(let E=0,q=M.length;E<q;++E){let Q=M[E],le=Q.start,F=Q.count;for(let Y=le,J=le+F;Y<J;Y+=3)v(n[Y+0],n[Y+1],n[Y+2])}let D=new R,C=new R,P=new R,V=new R;function w(E){P.fromArray(s,E*3),V.copy(P);let q=c[E];D.copy(q),D.sub(P.multiplyScalar(P.dot(q))).normalize(),C.crossVectors(V,q);let le=C.dot(h[E])<0?-1:1;l[E*4]=D.x,l[E*4+1]=D.y,l[E*4+2]=D.z,l[E*4+3]=le}for(let E=0,q=M.length;E<q;++E){let Q=M[E],le=Q.start,F=Q.count;for(let Y=le,J=le+F;Y<J;Y+=3)w(n[Y+0]),w(n[Y+1]),w(n[Y+2])}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ht(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);let i=new R,s=new R,a=new R,o=new R,l=new R,c=new R,h=new R,u=new R;if(e)for(let f=0,d=e.count;f<d;f+=3){let g=e.getX(f+0),x=e.getX(f+1),m=e.getX(f+2);i.fromBufferAttribute(t,g),s.fromBufferAttribute(t,x),a.fromBufferAttribute(t,m),h.subVectors(a,s),u.subVectors(i,s),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,d=t.count;f<d;f+=3)i.fromBufferAttribute(t,f+0),s.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),h.subVectors(a,s),u.subVectors(i,s),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Kt.fromBufferAttribute(e,t),Kt.normalize(),e.setXYZ(t,Kt.x,Kt.y,Kt.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,u=o.normalized,f=new c.constructor(l.length*h),d=0,g=0;for(let x=0,m=l.length;x<m;x++){o.isInterleavedBufferAttribute?d=l[x]*o.data.stride+o.offset:d=l[x]*h;for(let p=0;p<h;p++)f[g++]=c[d++]}return new Ht(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new r,n=this.index.array,i=this.attributes;for(let o in i){let l=i[o],c=e(l,n);t.setAttribute(o,c)}let s=this.morphAttributes;for(let o in s){let l=[],c=s[o];for(let h=0,u=c.length;h<u;h++){let f=c[h],d=e(f,n);l.push(d)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let i={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){let d=c[u];h.push(d.toJSON(e.data))}h.length>0&&(i[l]=h,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let i=e.attributes;for(let c in i){let h=i[c];this.setAttribute(c,h.clone(t))}let s=e.morphAttributes;for(let c in s){let h=[],u=s[c];for(let f=0,d=u.length;f<d;f++)h.push(u[f].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ru=new Ie,Xi=new qs,oa=new wn,Cu=new R,ws=new R,bs=new R,Ts=new R,cl=new R,la=new R,ca=new pe,ha=new pe,ua=new pe,Pu=new R,Lu=new R,Iu=new R,fa=new R,da=new R,gt=class extends Mt{constructor(e=new Dt,t=new Jt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){let o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){let n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);let o=this.morphTargetInfluences;if(s&&o){la.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let h=o[l],u=s[l];h!==0&&(cl.fromBufferAttribute(u,e),a?la.addScaledVector(cl,h):la.addScaledVector(cl.sub(t),h))}t.add(la)}return t}raycast(e,t){let n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),oa.copy(n.boundingSphere),oa.applyMatrix4(s),Xi.copy(e.ray).recast(e.near),!(oa.containsPoint(Xi.origin)===!1&&(Xi.intersectSphere(oa,Cu)===null||Xi.origin.distanceToSquared(Cu)>(e.far-e.near)**2))&&(Ru.copy(s).invert(),Xi.copy(e.ray).applyMatrix4(Ru),!(n.boundingBox!==null&&Xi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Xi)))}_computeIntersections(e,t,n){let i,s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,f=s.groups,d=s.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,x=f.length;g<x;g++){let m=f[g],p=a[m.materialIndex],_=Math.max(m.start,d.start),v=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let M=_,D=v;M<D;M+=3){let C=o.getX(M),P=o.getX(M+1),V=o.getX(M+2);i=pa(this,p,e,n,c,h,u,C,P,V),i&&(i.faceIndex=Math.floor(M/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{let g=Math.max(0,d.start),x=Math.min(o.count,d.start+d.count);for(let m=g,p=x;m<p;m+=3){let _=o.getX(m),v=o.getX(m+1),M=o.getX(m+2);i=pa(this,a,e,n,c,h,u,_,v,M),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,x=f.length;g<x;g++){let m=f[g],p=a[m.materialIndex],_=Math.max(m.start,d.start),v=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let M=_,D=v;M<D;M+=3){let C=M,P=M+1,V=M+2;i=pa(this,p,e,n,c,h,u,C,P,V),i&&(i.faceIndex=Math.floor(M/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{let g=Math.max(0,d.start),x=Math.min(l.count,d.start+d.count);for(let m=g,p=x;m<p;m+=3){let _=m,v=m+1,M=m+2;i=pa(this,a,e,n,c,h,u,_,v,M),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}}};function Dm(r,e,t,n,i,s,a,o){let l;if(e.side===rn?l=n.intersectTriangle(a,s,i,!0,o):l=n.intersectTriangle(i,s,a,e.side===Yn,o),l===null)return null;da.copy(o),da.applyMatrix4(r.matrixWorld);let c=t.ray.origin.distanceTo(da);return c<t.near||c>t.far?null:{distance:c,point:da.clone(),object:r}}function pa(r,e,t,n,i,s,a,o,l,c){r.getVertexPosition(o,ws),r.getVertexPosition(l,bs),r.getVertexPosition(c,Ts);let h=Dm(r,e,t,n,ws,bs,Ts,fa);if(h){i&&(ca.fromBufferAttribute(i,o),ha.fromBufferAttribute(i,l),ua.fromBufferAttribute(i,c),h.uv=Ji.getInterpolation(fa,ws,bs,Ts,ca,ha,ua,new pe)),s&&(ca.fromBufferAttribute(s,o),ha.fromBufferAttribute(s,l),ua.fromBufferAttribute(s,c),h.uv1=Ji.getInterpolation(fa,ws,bs,Ts,ca,ha,ua,new pe),h.uv2=h.uv1),a&&(Pu.fromBufferAttribute(a,o),Lu.fromBufferAttribute(a,l),Iu.fromBufferAttribute(a,c),h.normal=Ji.getInterpolation(fa,ws,bs,Ts,Pu,Lu,Iu,new R),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new R,materialIndex:0};Ji.getNormal(ws,bs,Ts,u.normal),h.face=u}return h}var on=class r extends Dt{constructor(e=1,t=1,n=1,i=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:a};let o=this;i=Math.floor(i),s=Math.floor(s),a=Math.floor(a);let l=[],c=[],h=[],u=[],f=0,d=0;g("z","y","x",-1,-1,n,t,e,a,s,0),g("z","y","x",1,-1,n,t,-e,a,s,1),g("x","z","y",1,1,e,n,t,i,a,2),g("x","z","y",1,-1,e,n,-t,i,a,3),g("x","y","z",1,-1,e,t,n,i,s,4),g("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(l),this.setAttribute("position",new pt(c,3)),this.setAttribute("normal",new pt(h,3)),this.setAttribute("uv",new pt(u,2));function g(x,m,p,_,v,M,D,C,P,V,w){let E=M/P,q=D/V,Q=M/2,le=D/2,F=C/2,Y=P+1,J=V+1,ae=0,ie=0,ee=new R;for(let oe=0;oe<J;oe++){let k=oe*q-le;for(let j=0;j<Y;j++){let W=j*E-Q;ee[x]=W*_,ee[m]=k*v,ee[p]=F,c.push(ee.x,ee.y,ee.z),ee[x]=0,ee[m]=0,ee[p]=C>0?1:-1,h.push(ee.x,ee.y,ee.z),u.push(j/P),u.push(1-oe/V),ae+=1}}for(let oe=0;oe<V;oe++)for(let k=0;k<P;k++){let j=f+k+Y*oe,W=f+k+Y*(oe+1),se=f+(k+1)+Y*(oe+1),ge=f+(k+1)+Y*oe;l.push(j,W,ge),l.push(W,se,ge),ie+=6}o.addGroup(d,ie,w),d+=ie,f+=ae}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Ks(r){let e={};for(let t in r){e[t]={};for(let n in r[t]){let i=r[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function cn(r){let e={};for(let t=0;t<r.length;t++){let n=Ks(r[t]);for(let i in n)e[i]=n[i]}return e}function Um(r){let e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function kf(r){return r.getRenderTarget()===null?r.outputColorSpace:xt.workingColorSpace}var Nm={clone:Ks,merge:cn},Fm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Om=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,fi=class extends an{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Fm,this.fragmentShader=Om,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ks(e.uniforms),this.uniformsGroups=Um(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Va=class extends Mt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ie,this.projectionMatrix=new Ie,this.projectionMatrixInverse=new Ie,this.coordinateSystem=li}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Ft=class extends Va{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Xs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(yr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Xs*2*Math.atan(Math.tan(yr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,n,i,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(yr*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-.5*i,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*i/l,t-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Es=-90,As=1,Dl=class extends Mt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new Ft(Es,As,e,t);i.layers=this.layers,this.add(i);let s=new Ft(Es,As,e,t);s.layers=this.layers,this.add(s);let a=new Ft(Es,As,e,t);a.layers=this.layers,this.add(a);let o=new Ft(Es,As,e,t);o.layers=this.layers,this.add(o);let l=new Ft(Es,As,e,t);l.layers=this.layers,this.add(l);let c=new Ft(Es,As,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,i,s,a,o,l]=t;for(let c of t)this.remove(c);if(e===li)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Fa)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,a,o,l,c,h]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,a),e.setRenderTarget(n,2,i),e.render(t,o),e.setRenderTarget(n,3,i),e.render(t,l),e.setRenderTarget(n,4,i),e.render(t,c),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(u,f,d),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Ga=class extends It{constructor(e,t,n,i,s,a,o,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:Hs,super(e,t,n,i,s,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ul=class extends ui{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];t.encoding!==void 0&&(Sr("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===Qi?it:pn),this.texture=new Ga(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:hn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new on(5,5,5),s=new fi({name:"CubemapFromEquirect",uniforms:Ks(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:rn,blending:Ti});s.uniforms.tEquirect.value=t;let a=new gt(i,s),o=t.minFilter;return t.minFilter===Ci&&(t.minFilter=hn),new Dl(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,i){let s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(s)}},hl=new R,Bm=new R,zm=new nt,ai=class{constructor(e=new R(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=hl.subVectors(n,t).cross(Bm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(hl),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||zm.getNormalMatrix(e),i=this.coplanarPoint(hl).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},qi=new wn,ma=new R,Cr=class{constructor(e=new ai,t=new ai,n=new ai,i=new ai,s=new ai,a=new ai){this.planes=[e,t,n,i,s,a]}set(e,t,n,i,s,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(s),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=li){let n=this.planes,i=e.elements,s=i[0],a=i[1],o=i[2],l=i[3],c=i[4],h=i[5],u=i[6],f=i[7],d=i[8],g=i[9],x=i[10],m=i[11],p=i[12],_=i[13],v=i[14],M=i[15];if(n[0].setComponents(l-s,f-c,m-d,M-p).normalize(),n[1].setComponents(l+s,f+c,m+d,M+p).normalize(),n[2].setComponents(l+a,f+h,m+g,M+_).normalize(),n[3].setComponents(l-a,f-h,m-g,M-_).normalize(),n[4].setComponents(l-o,f-u,m-x,M-v).normalize(),t===li)n[5].setComponents(l+o,f+u,m+x,M+v).normalize();else if(t===Fa)n[5].setComponents(o,u,x,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),qi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),qi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(qi)}intersectsSprite(e){return qi.center.set(0,0,0),qi.radius=.7071067811865476,qi.applyMatrix4(e.matrixWorld),this.intersectsSphere(qi)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(ma.x=i.normal.x>0?e.max.x:e.min.x,ma.y=i.normal.y>0?e.max.y:e.min.y,ma.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(ma)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Hf(){let r=null,e=!1,t=null,n=null;function i(s,a){t(s,a),n=r.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(i),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function km(r,e){let t=e.isWebGL2,n=new WeakMap;function i(c,h){let u=c.array,f=c.usage,d=u.byteLength,g=r.createBuffer();r.bindBuffer(h,g),r.bufferData(h,u,f),c.onUploadCallback();let x;if(u instanceof Float32Array)x=r.FLOAT;else if(u instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)x=r.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else x=r.UNSIGNED_SHORT;else if(u instanceof Int16Array)x=r.SHORT;else if(u instanceof Uint32Array)x=r.UNSIGNED_INT;else if(u instanceof Int32Array)x=r.INT;else if(u instanceof Int8Array)x=r.BYTE;else if(u instanceof Uint8Array)x=r.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)x=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:g,type:x,bytesPerElement:u.BYTES_PER_ELEMENT,version:c.version,size:d}}function s(c,h,u){let f=h.array,d=h._updateRange,g=h.updateRanges;if(r.bindBuffer(u,c),d.count===-1&&g.length===0&&r.bufferSubData(u,0,f),g.length!==0){for(let x=0,m=g.length;x<m;x++){let p=g[x];t?r.bufferSubData(u,p.start*f.BYTES_PER_ELEMENT,f,p.start,p.count):r.bufferSubData(u,p.start*f.BYTES_PER_ELEMENT,f.subarray(p.start,p.start+p.count))}h.clearUpdateRanges()}d.count!==-1&&(t?r.bufferSubData(u,d.offset*f.BYTES_PER_ELEMENT,f,d.offset,d.count):r.bufferSubData(u,d.offset*f.BYTES_PER_ELEMENT,f.subarray(d.offset,d.offset+d.count)),d.count=-1),h.onUploadCallback()}function a(c){return c.isInterleavedBufferAttribute&&(c=c.data),n.get(c)}function o(c){c.isInterleavedBufferAttribute&&(c=c.data);let h=n.get(c);h&&(r.deleteBuffer(h.buffer),n.delete(c))}function l(c,h){if(c.isGLBufferAttribute){let f=n.get(c);(!f||f.version<c.version)&&n.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);let u=n.get(c);if(u===void 0)n.set(c,i(c,h));else if(u.version<c.version){if(u.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(u.buffer,c,h),u.version=c.version}}return{get:a,remove:o,update:l}}var di=class r extends Dt{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let s=e/2,a=t/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,u=e/o,f=t/l,d=[],g=[],x=[],m=[];for(let p=0;p<h;p++){let _=p*f-a;for(let v=0;v<c;v++){let M=v*u-s;g.push(M,-_,0),x.push(0,0,1),m.push(v/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let _=0;_<o;_++){let v=_+c*p,M=_+c*(p+1),D=_+1+c*(p+1),C=_+1+c*p;d.push(v,M,C),d.push(M,D,C)}this.setIndex(d),this.setAttribute("position",new pt(g,3)),this.setAttribute("normal",new pt(x,3)),this.setAttribute("uv",new pt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.width,e.height,e.widthSegments,e.heightSegments)}},Hm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Vm=`#ifdef USE_ALPHAHASH
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
#endif`,Gm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Wm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Xm=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,qm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Ym=`#ifdef USE_AOMAP
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
#endif`,Km=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Zm=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
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
#endif`,Jm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,$m=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,jm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Qm=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,e0=`#ifdef USE_IRIDESCENCE
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
#endif`,t0=`#ifdef USE_BUMPMAP
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
#endif`,n0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
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
#endif`,i0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,s0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,r0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,a0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,o0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,l0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,c0=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,h0=`#define PI 3.141592653589793
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
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
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
} // validated`,u0=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,f0=`vec3 transformedNormal = objectNormal;
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
#endif`,d0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,p0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,m0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,g0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,x0="gl_FragColor = linearToOutputTexel( gl_FragColor );",v0=`
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
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,_0=`#ifdef USE_ENVMAP
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
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
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
#endif`,y0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,M0=`#ifdef USE_ENVMAP
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
#endif`,S0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,w0=`#ifdef USE_ENVMAP
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
#endif`,b0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,T0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,E0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,A0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,R0=`#ifdef USE_GRADIENTMAP
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
}`,C0=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,P0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,L0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,I0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,D0=`uniform bool receiveShadow;
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
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
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
#endif`,U0=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
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
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
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
#endif`,N0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,F0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,O0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,B0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,z0=`PhysicalMaterial material;
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
#endif`,k0=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
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
}`,H0=`
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
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
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
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
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
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
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
#endif`,V0=`#if defined( RE_IndirectDiffuse )
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
#endif`,G0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,W0=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,X0=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,q0=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,Y0=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,K0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Z0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,J0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,$0=`#if defined( USE_POINTS_UV )
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
#endif`,j0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Q0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,eg=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,tg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,ng=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,ig=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,sg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,rg=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,ag=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,og=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,lg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,cg=`#ifdef USE_NORMALMAP
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
#endif`,hg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ug=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,fg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,dg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,pg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,mg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
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
}`,gg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,xg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,vg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,_g=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,yg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Mg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Sg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
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
		return shadow;
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
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
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
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,wg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
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
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,bg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Tg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Eg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ag=`#ifdef USE_SKINNING
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
#endif`,Rg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Cg=`#ifdef USE_SKINNING
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
#endif`,Pg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Lg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Ig=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Dg=`#ifndef saturate
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
vec3 OptimizedCineonToneMapping( vec3 color ) {
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
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color *= toneMappingExposure;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Ug=`#ifdef USE_TRANSMISSION
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
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Ng=`#ifdef USE_TRANSMISSION
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
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Fg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Og=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Bg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,zg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,kg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Hg=`uniform sampler2D t2D;
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
}`,Vg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Gg=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Wg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Xg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,qg=`#include <common>
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
}`,Yg=`#if DEPTH_PACKING == 3200
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
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
	#endif
}`,Kg=`#define DISTANCE
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
}`,Zg=`#define DISTANCE
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Jg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,$g=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jg=`uniform float scale;
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
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Qg=`uniform vec3 diffuse;
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
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ex=`#include <common>
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
}`,tx=`uniform vec3 diffuse;
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
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
}`,nx=`#define LAMBERT
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
}`,ix=`#define LAMBERT
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
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
}`,sx=`#define MATCAP
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
}`,rx=`#define MATCAP
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
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
}`,ax=`#define NORMAL
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
}`,ox=`#define NORMAL
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
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,lx=`#define PHONG
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
}`,cx=`#define PHONG
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
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
}`,hx=`#define STANDARD
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
}`,ux=`#define STANDARD
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
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
}`,fx=`#define TOON
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
}`,dx=`#define TOON
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
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
}`,px=`uniform float size;
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
}`,mx=`uniform vec3 diffuse;
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
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
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
}`,gx=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
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
}`,xx=`uniform vec3 color;
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
}`,vx=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
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
}`,_x=`uniform vec3 diffuse;
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
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
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
}`,tt={alphahash_fragment:Hm,alphahash_pars_fragment:Vm,alphamap_fragment:Gm,alphamap_pars_fragment:Wm,alphatest_fragment:Xm,alphatest_pars_fragment:qm,aomap_fragment:Ym,aomap_pars_fragment:Km,batching_pars_vertex:Zm,batching_vertex:Jm,begin_vertex:$m,beginnormal_vertex:jm,bsdfs:Qm,iridescence_fragment:e0,bumpmap_pars_fragment:t0,clipping_planes_fragment:n0,clipping_planes_pars_fragment:i0,clipping_planes_pars_vertex:s0,clipping_planes_vertex:r0,color_fragment:a0,color_pars_fragment:o0,color_pars_vertex:l0,color_vertex:c0,common:h0,cube_uv_reflection_fragment:u0,defaultnormal_vertex:f0,displacementmap_pars_vertex:d0,displacementmap_vertex:p0,emissivemap_fragment:m0,emissivemap_pars_fragment:g0,colorspace_fragment:x0,colorspace_pars_fragment:v0,envmap_fragment:_0,envmap_common_pars_fragment:y0,envmap_pars_fragment:M0,envmap_pars_vertex:S0,envmap_physical_pars_fragment:U0,envmap_vertex:w0,fog_vertex:b0,fog_pars_vertex:T0,fog_fragment:E0,fog_pars_fragment:A0,gradientmap_pars_fragment:R0,lightmap_fragment:C0,lightmap_pars_fragment:P0,lights_lambert_fragment:L0,lights_lambert_pars_fragment:I0,lights_pars_begin:D0,lights_toon_fragment:N0,lights_toon_pars_fragment:F0,lights_phong_fragment:O0,lights_phong_pars_fragment:B0,lights_physical_fragment:z0,lights_physical_pars_fragment:k0,lights_fragment_begin:H0,lights_fragment_maps:V0,lights_fragment_end:G0,logdepthbuf_fragment:W0,logdepthbuf_pars_fragment:X0,logdepthbuf_pars_vertex:q0,logdepthbuf_vertex:Y0,map_fragment:K0,map_pars_fragment:Z0,map_particle_fragment:J0,map_particle_pars_fragment:$0,metalnessmap_fragment:j0,metalnessmap_pars_fragment:Q0,morphcolor_vertex:eg,morphnormal_vertex:tg,morphtarget_pars_vertex:ng,morphtarget_vertex:ig,normal_fragment_begin:sg,normal_fragment_maps:rg,normal_pars_fragment:ag,normal_pars_vertex:og,normal_vertex:lg,normalmap_pars_fragment:cg,clearcoat_normal_fragment_begin:hg,clearcoat_normal_fragment_maps:ug,clearcoat_pars_fragment:fg,iridescence_pars_fragment:dg,opaque_fragment:pg,packing:mg,premultiplied_alpha_fragment:gg,project_vertex:xg,dithering_fragment:vg,dithering_pars_fragment:_g,roughnessmap_fragment:yg,roughnessmap_pars_fragment:Mg,shadowmap_pars_fragment:Sg,shadowmap_pars_vertex:wg,shadowmap_vertex:bg,shadowmask_pars_fragment:Tg,skinbase_vertex:Eg,skinning_pars_vertex:Ag,skinning_vertex:Rg,skinnormal_vertex:Cg,specularmap_fragment:Pg,specularmap_pars_fragment:Lg,tonemapping_fragment:Ig,tonemapping_pars_fragment:Dg,transmission_fragment:Ug,transmission_pars_fragment:Ng,uv_pars_fragment:Fg,uv_pars_vertex:Og,uv_vertex:Bg,worldpos_vertex:zg,background_vert:kg,background_frag:Hg,backgroundCube_vert:Vg,backgroundCube_frag:Gg,cube_vert:Wg,cube_frag:Xg,depth_vert:qg,depth_frag:Yg,distanceRGBA_vert:Kg,distanceRGBA_frag:Zg,equirect_vert:Jg,equirect_frag:$g,linedashed_vert:jg,linedashed_frag:Qg,meshbasic_vert:ex,meshbasic_frag:tx,meshlambert_vert:nx,meshlambert_frag:ix,meshmatcap_vert:sx,meshmatcap_frag:rx,meshnormal_vert:ax,meshnormal_frag:ox,meshphong_vert:lx,meshphong_frag:cx,meshphysical_vert:hx,meshphysical_frag:ux,meshtoon_vert:fx,meshtoon_frag:dx,points_vert:px,points_frag:mx,shadow_vert:gx,shadow_frag:xx,sprite_vert:vx,sprite_frag:_x},_e={common:{diffuse:{value:new Re(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new nt},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new nt}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new nt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new nt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new nt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new nt},normalScale:{value:new pe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new nt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new nt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new nt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new nt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Re(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Re(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0},uvTransform:{value:new nt}},sprite:{diffuse:{value:new Re(16777215)},opacity:{value:1},center:{value:new pe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new nt},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0}}},Xn={basic:{uniforms:cn([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.fog]),vertexShader:tt.meshbasic_vert,fragmentShader:tt.meshbasic_frag},lambert:{uniforms:cn([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,_e.lights,{emissive:{value:new Re(0)}}]),vertexShader:tt.meshlambert_vert,fragmentShader:tt.meshlambert_frag},phong:{uniforms:cn([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,_e.lights,{emissive:{value:new Re(0)},specular:{value:new Re(1118481)},shininess:{value:30}}]),vertexShader:tt.meshphong_vert,fragmentShader:tt.meshphong_frag},standard:{uniforms:cn([_e.common,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.roughnessmap,_e.metalnessmap,_e.fog,_e.lights,{emissive:{value:new Re(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:tt.meshphysical_vert,fragmentShader:tt.meshphysical_frag},toon:{uniforms:cn([_e.common,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.gradientmap,_e.fog,_e.lights,{emissive:{value:new Re(0)}}]),vertexShader:tt.meshtoon_vert,fragmentShader:tt.meshtoon_frag},matcap:{uniforms:cn([_e.common,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,{matcap:{value:null}}]),vertexShader:tt.meshmatcap_vert,fragmentShader:tt.meshmatcap_frag},points:{uniforms:cn([_e.points,_e.fog]),vertexShader:tt.points_vert,fragmentShader:tt.points_frag},dashed:{uniforms:cn([_e.common,_e.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:tt.linedashed_vert,fragmentShader:tt.linedashed_frag},depth:{uniforms:cn([_e.common,_e.displacementmap]),vertexShader:tt.depth_vert,fragmentShader:tt.depth_frag},normal:{uniforms:cn([_e.common,_e.bumpmap,_e.normalmap,_e.displacementmap,{opacity:{value:1}}]),vertexShader:tt.meshnormal_vert,fragmentShader:tt.meshnormal_frag},sprite:{uniforms:cn([_e.sprite,_e.fog]),vertexShader:tt.sprite_vert,fragmentShader:tt.sprite_frag},background:{uniforms:{uvTransform:{value:new nt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:tt.background_vert,fragmentShader:tt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:tt.backgroundCube_vert,fragmentShader:tt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:tt.cube_vert,fragmentShader:tt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:tt.equirect_vert,fragmentShader:tt.equirect_frag},distanceRGBA:{uniforms:cn([_e.common,_e.displacementmap,{referencePosition:{value:new R},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:tt.distanceRGBA_vert,fragmentShader:tt.distanceRGBA_frag},shadow:{uniforms:cn([_e.lights,_e.fog,{color:{value:new Re(0)},opacity:{value:1}}]),vertexShader:tt.shadow_vert,fragmentShader:tt.shadow_frag}};Xn.physical={uniforms:cn([Xn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new nt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new nt},clearcoatNormalScale:{value:new pe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new nt},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new nt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new nt},sheen:{value:0},sheenColor:{value:new Re(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new nt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new nt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new nt},transmissionSamplerSize:{value:new pe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new nt},attenuationDistance:{value:0},attenuationColor:{value:new Re(0)},specularColor:{value:new Re(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new nt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new nt},anisotropyVector:{value:new pe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new nt}}]),vertexShader:tt.meshphysical_vert,fragmentShader:tt.meshphysical_frag};var ga={r:0,b:0,g:0};function yx(r,e,t,n,i,s,a){let o=new Re(0),l=s===!0?0:1,c,h,u=null,f=0,d=null;function g(m,p){let _=!1,v=p.isScene===!0?p.background:null;v&&v.isTexture&&(v=(p.backgroundBlurriness>0?t:e).get(v)),v===null?x(o,l):v&&v.isColor&&(x(v,1),_=!0);let M=r.xr.getEnvironmentBlendMode();M==="additive"?n.buffers.color.setClear(0,0,0,1,a):M==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(r.autoClear||_)&&r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil),v&&(v.isCubeTexture||v.mapping===lo)?(h===void 0&&(h=new gt(new on(1,1,1),new fi({name:"BackgroundCubeMaterial",uniforms:Ks(Xn.backgroundCube.uniforms),vertexShader:Xn.backgroundCube.vertexShader,fragmentShader:Xn.backgroundCube.fragmentShader,side:rn,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(D,C,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),h.material.uniforms.envMap.value=v,h.material.uniforms.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=p.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=p.backgroundIntensity,h.material.toneMapped=xt.getTransfer(v.colorSpace)!==Rt,(u!==v||f!==v.version||d!==r.toneMapping)&&(h.material.needsUpdate=!0,u=v,f=v.version,d=r.toneMapping),h.layers.enableAll(),m.unshift(h,h.geometry,h.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new gt(new di(2,2),new fi({name:"BackgroundMaterial",uniforms:Ks(Xn.background.uniforms),vertexShader:Xn.background.vertexShader,fragmentShader:Xn.background.fragmentShader,side:Yn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=p.backgroundIntensity,c.material.toneMapped=xt.getTransfer(v.colorSpace)!==Rt,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(u!==v||f!==v.version||d!==r.toneMapping)&&(c.material.needsUpdate=!0,u=v,f=v.version,d=r.toneMapping),c.layers.enableAll(),m.unshift(c,c.geometry,c.material,0,0,null))}function x(m,p){m.getRGB(ga,kf(r)),n.buffers.color.setClear(ga.r,ga.g,ga.b,p,a)}return{getClearColor:function(){return o},setClearColor:function(m,p=1){o.set(m),l=p,x(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(m){l=m,x(o,l)},render:g}}function Mx(r,e,t,n){let i=r.getParameter(r.MAX_VERTEX_ATTRIBS),s=n.isWebGL2?null:e.get("OES_vertex_array_object"),a=n.isWebGL2||s!==null,o={},l=m(null),c=l,h=!1;function u(F,Y,J,ae,ie){let ee=!1;if(a){let oe=x(ae,J,Y);c!==oe&&(c=oe,d(c.object)),ee=p(F,ae,J,ie),ee&&_(F,ae,J,ie)}else{let oe=Y.wireframe===!0;(c.geometry!==ae.id||c.program!==J.id||c.wireframe!==oe)&&(c.geometry=ae.id,c.program=J.id,c.wireframe=oe,ee=!0)}ie!==null&&t.update(ie,r.ELEMENT_ARRAY_BUFFER),(ee||h)&&(h=!1,V(F,Y,J,ae),ie!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,t.get(ie).buffer))}function f(){return n.isWebGL2?r.createVertexArray():s.createVertexArrayOES()}function d(F){return n.isWebGL2?r.bindVertexArray(F):s.bindVertexArrayOES(F)}function g(F){return n.isWebGL2?r.deleteVertexArray(F):s.deleteVertexArrayOES(F)}function x(F,Y,J){let ae=J.wireframe===!0,ie=o[F.id];ie===void 0&&(ie={},o[F.id]=ie);let ee=ie[Y.id];ee===void 0&&(ee={},ie[Y.id]=ee);let oe=ee[ae];return oe===void 0&&(oe=m(f()),ee[ae]=oe),oe}function m(F){let Y=[],J=[],ae=[];for(let ie=0;ie<i;ie++)Y[ie]=0,J[ie]=0,ae[ie]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:Y,enabledAttributes:J,attributeDivisors:ae,object:F,attributes:{},index:null}}function p(F,Y,J,ae){let ie=c.attributes,ee=Y.attributes,oe=0,k=J.getAttributes();for(let j in k)if(k[j].location>=0){let se=ie[j],ge=ee[j];if(ge===void 0&&(j==="instanceMatrix"&&F.instanceMatrix&&(ge=F.instanceMatrix),j==="instanceColor"&&F.instanceColor&&(ge=F.instanceColor)),se===void 0||se.attribute!==ge||ge&&se.data!==ge.data)return!0;oe++}return c.attributesNum!==oe||c.index!==ae}function _(F,Y,J,ae){let ie={},ee=Y.attributes,oe=0,k=J.getAttributes();for(let j in k)if(k[j].location>=0){let se=ee[j];se===void 0&&(j==="instanceMatrix"&&F.instanceMatrix&&(se=F.instanceMatrix),j==="instanceColor"&&F.instanceColor&&(se=F.instanceColor));let ge={};ge.attribute=se,se&&se.data&&(ge.data=se.data),ie[j]=ge,oe++}c.attributes=ie,c.attributesNum=oe,c.index=ae}function v(){let F=c.newAttributes;for(let Y=0,J=F.length;Y<J;Y++)F[Y]=0}function M(F){D(F,0)}function D(F,Y){let J=c.newAttributes,ae=c.enabledAttributes,ie=c.attributeDivisors;J[F]=1,ae[F]===0&&(r.enableVertexAttribArray(F),ae[F]=1),ie[F]!==Y&&((n.isWebGL2?r:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](F,Y),ie[F]=Y)}function C(){let F=c.newAttributes,Y=c.enabledAttributes;for(let J=0,ae=Y.length;J<ae;J++)Y[J]!==F[J]&&(r.disableVertexAttribArray(J),Y[J]=0)}function P(F,Y,J,ae,ie,ee,oe){oe===!0?r.vertexAttribIPointer(F,Y,J,ie,ee):r.vertexAttribPointer(F,Y,J,ae,ie,ee)}function V(F,Y,J,ae){if(n.isWebGL2===!1&&(F.isInstancedMesh||ae.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;v();let ie=ae.attributes,ee=J.getAttributes(),oe=Y.defaultAttributeValues;for(let k in ee){let j=ee[k];if(j.location>=0){let W=ie[k];if(W===void 0&&(k==="instanceMatrix"&&F.instanceMatrix&&(W=F.instanceMatrix),k==="instanceColor"&&F.instanceColor&&(W=F.instanceColor)),W!==void 0){let se=W.normalized,ge=W.itemSize,Me=t.get(W);if(Me===void 0)continue;let Se=Me.buffer,Fe=Me.type,He=Me.bytesPerElement,Ne=n.isWebGL2===!0&&(Fe===r.INT||Fe===r.UNSIGNED_INT||W.gpuType===Rf);if(W.isInterleavedBufferAttribute){let Be=W.data,L=Be.stride,me=W.offset;if(Be.isInstancedInterleavedBuffer){for(let te=0;te<j.locationSize;te++)D(j.location+te,Be.meshPerAttribute);F.isInstancedMesh!==!0&&ae._maxInstanceCount===void 0&&(ae._maxInstanceCount=Be.meshPerAttribute*Be.count)}else for(let te=0;te<j.locationSize;te++)M(j.location+te);r.bindBuffer(r.ARRAY_BUFFER,Se);for(let te=0;te<j.locationSize;te++)P(j.location+te,ge/j.locationSize,Fe,se,L*He,(me+ge/j.locationSize*te)*He,Ne)}else{if(W.isInstancedBufferAttribute){for(let Be=0;Be<j.locationSize;Be++)D(j.location+Be,W.meshPerAttribute);F.isInstancedMesh!==!0&&ae._maxInstanceCount===void 0&&(ae._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let Be=0;Be<j.locationSize;Be++)M(j.location+Be);r.bindBuffer(r.ARRAY_BUFFER,Se);for(let Be=0;Be<j.locationSize;Be++)P(j.location+Be,ge/j.locationSize,Fe,se,ge*He,ge/j.locationSize*Be*He,Ne)}}else if(oe!==void 0){let se=oe[k];if(se!==void 0)switch(se.length){case 2:r.vertexAttrib2fv(j.location,se);break;case 3:r.vertexAttrib3fv(j.location,se);break;case 4:r.vertexAttrib4fv(j.location,se);break;default:r.vertexAttrib1fv(j.location,se)}}}}C()}function w(){Q();for(let F in o){let Y=o[F];for(let J in Y){let ae=Y[J];for(let ie in ae)g(ae[ie].object),delete ae[ie];delete Y[J]}delete o[F]}}function E(F){if(o[F.id]===void 0)return;let Y=o[F.id];for(let J in Y){let ae=Y[J];for(let ie in ae)g(ae[ie].object),delete ae[ie];delete Y[J]}delete o[F.id]}function q(F){for(let Y in o){let J=o[Y];if(J[F.id]===void 0)continue;let ae=J[F.id];for(let ie in ae)g(ae[ie].object),delete ae[ie];delete J[F.id]}}function Q(){le(),h=!0,c!==l&&(c=l,d(c.object))}function le(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:u,reset:Q,resetDefaultState:le,dispose:w,releaseStatesOfGeometry:E,releaseStatesOfProgram:q,initAttributes:v,enableAttribute:M,disableUnusedAttributes:C}}function Sx(r,e,t,n){let i=n.isWebGL2,s;function a(h){s=h}function o(h,u){r.drawArrays(s,h,u),t.update(u,s,1)}function l(h,u,f){if(f===0)return;let d,g;if(i)d=r,g="drawArraysInstanced";else if(d=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",d===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}d[g](s,h,u,f),t.update(u,s,f)}function c(h,u,f){if(f===0)return;let d=e.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<f;g++)this.render(h[g],u[g]);else{d.multiDrawArraysWEBGL(s,h,0,u,0,f);let g=0;for(let x=0;x<f;x++)g+=u[x];t.update(g,s,1)}}this.setMode=a,this.render=o,this.renderInstances=l,this.renderMultiDraw=c}function wx(r,e,t){let n;function i(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){let P=e.get("EXT_texture_filter_anisotropic");n=r.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function s(P){if(P==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";P="mediump"}return P==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let a=typeof WebGL2RenderingContext<"u"&&r.constructor.name==="WebGL2RenderingContext",o=t.precision!==void 0?t.precision:"highp",l=s(o);l!==o&&(console.warn("THREE.WebGLRenderer:",o,"not supported, using",l,"instead."),o=l);let c=a||e.has("WEBGL_draw_buffers"),h=t.logarithmicDepthBuffer===!0,u=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),f=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),d=r.getParameter(r.MAX_TEXTURE_SIZE),g=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),x=r.getParameter(r.MAX_VERTEX_ATTRIBS),m=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),p=r.getParameter(r.MAX_VARYING_VECTORS),_=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),v=f>0,M=a||e.has("OES_texture_float"),D=v&&M,C=a?r.getParameter(r.MAX_SAMPLES):0;return{isWebGL2:a,drawBuffers:c,getMaxAnisotropy:i,getMaxPrecision:s,precision:o,logarithmicDepthBuffer:h,maxTextures:u,maxVertexTextures:f,maxTextureSize:d,maxCubemapSize:g,maxAttributes:x,maxVertexUniforms:m,maxVaryings:p,maxFragmentUniforms:_,vertexTextures:v,floatFragmentTextures:M,floatVertexTextures:D,maxSamples:C}}function bx(r){let e=this,t=null,n=0,i=!1,s=!1,a=new ai,o=new nt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){let d=u.length!==0||f||n!==0||i;return i=f,n=u.length,d},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,f){t=h(u,f,0)},this.setState=function(u,f,d){let g=u.clippingPlanes,x=u.clipIntersection,m=u.clipShadows,p=r.get(u);if(!i||g===null||g.length===0||s&&!m)s?h(null):c();else{let _=s?0:n,v=_*4,M=p.clippingState||null;l.value=M,M=h(g,f,v,d);for(let D=0;D!==v;++D)M[D]=t[D];p.clippingState=M,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,f,d,g){let x=u!==null?u.length:0,m=null;if(x!==0){if(m=l.value,g!==!0||m===null){let p=d+x*4,_=f.matrixWorldInverse;o.getNormalMatrix(_),(m===null||m.length<p)&&(m=new Float32Array(p));for(let v=0,M=d;v!==x;++v,M+=4)a.copy(u[v]).applyMatrix4(_,o),a.normal.toArray(m,M),m[M+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}function Tx(r){let e=new WeakMap;function t(a,o){return o===ts?a.mapping=Hs:o===Al&&(a.mapping=Vs),a}function n(a){if(a&&a.isTexture){let o=a.mapping;if(o===ts||o===Al)if(e.has(a)){let l=e.get(a).texture;return t(l,a.mapping)}else{let l=a.image;if(l&&l.height>0){let c=new Ul(l.height/2);return c.fromEquirectangularTexture(r,a),e.set(a,c),a.addEventListener("dispose",i),t(c.texture,a.mapping)}else return null}}return a}function i(a){let o=a.target;o.removeEventListener("dispose",i);let l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}var Li=class extends Va{constructor(e=-1,t=1,n=1,i=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,s=n-e,a=n+e,o=i+t,l=i-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Fs=4,Du=[.125,.215,.35,.446,.526,.582],Zi=20,ul=new Li,Uu=new Re,fl=null,dl=0,pl=0,Yi=(1+Math.sqrt(5))/2,Rs=1/Yi,Nu=[new R(1,1,1),new R(-1,1,1),new R(1,1,-1),new R(-1,1,-1),new R(0,Yi,Rs),new R(0,Yi,-Rs),new R(Rs,0,Yi),new R(-Rs,0,Yi),new R(Yi,Rs,0),new R(-Yi,Rs,0)],Zs=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){fl=this._renderer.getRenderTarget(),dl=this._renderer.getActiveCubeFace(),pl=this._renderer.getActiveMipmapLevel(),this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,i,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Bu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ou(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(fl,dl,pl),e.scissorTest=!1,xa(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Hs||e.mapping===Vs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),fl=this._renderer.getRenderTarget(),dl=this._renderer.getActiveCubeFace(),pl=this._renderer.getActiveMipmapLevel();let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:hn,minFilter:hn,generateMipmaps:!1,type:Ar,format:Cn,colorSpace:Vt,depthBuffer:!1},i=Fu(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Fu(e,t,n);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Ex(s)),this._blurMaterial=Ax(s,e,t)}return i}_compileMaterial(e){let t=new gt(this._lodPlanes[0],e);this._renderer.compile(t,ul)}_sceneToCubeUV(e,t,n,i){let o=new Ft(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,f=h.toneMapping;h.getClearColor(Uu),h.toneMapping=Ai,h.autoClear=!1;let d=new Jt({name:"PMREM.Background",side:rn,depthWrite:!1,depthTest:!1}),g=new gt(new on,d),x=!1,m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,x=!0):(d.color.copy(Uu),x=!0);for(let p=0;p<6;p++){let _=p%3;_===0?(o.up.set(0,l[p],0),o.lookAt(c[p],0,0)):_===1?(o.up.set(0,0,l[p]),o.lookAt(0,c[p],0)):(o.up.set(0,l[p],0),o.lookAt(0,0,c[p]));let v=this._cubeSize;xa(i,_*v,p>2?v:0,v,v),h.setRenderTarget(i),x&&h.render(g,o),h.render(e,o)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=f,h.autoClear=u,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,i=e.mapping===Hs||e.mapping===Vs;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Bu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ou());let s=i?this._cubemapMaterial:this._equirectMaterial,a=new gt(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;let l=this._cubeSize;xa(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,ul)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let i=1;i<this._lodPlanes.length;i++){let s=Math.sqrt(this._sigmas[i]*this._sigmas[i]-this._sigmas[i-1]*this._sigmas[i-1]),a=Nu[(i-1)%Nu.length];this._blur(e,i-1,i,s,a)}t.autoClear=n}_blur(e,t,n,i,s){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",s),this._halfBlur(a,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,a,o){let l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,u=new gt(this._lodPlanes[i],c),f=c.uniforms,d=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*d):2*Math.PI/(2*Zi-1),x=s/g,m=isFinite(s)?1+Math.floor(h*x):Zi;m>Zi&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Zi}`);let p=[],_=0;for(let P=0;P<Zi;++P){let V=P/x,w=Math.exp(-V*V/2);p.push(w),P===0?_+=w:P<m&&(_+=2*w)}for(let P=0;P<p.length;P++)p[P]=p[P]/_;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=p,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);let{_lodMax:v}=this;f.dTheta.value=g,f.mipInt.value=v-n;let M=this._sizeLods[i],D=3*M*(i>v-Fs?i-v+Fs:0),C=4*(this._cubeSize-M);xa(t,D,C,3*M,2*M),l.setRenderTarget(t),l.render(u,ul)}};function Ex(r){let e=[],t=[],n=[],i=r,s=r-Fs+1+Du.length;for(let a=0;a<s;a++){let o=Math.pow(2,i);t.push(o);let l=1/o;a>r-Fs?l=Du[a-r+Fs-1]:a===0&&(l=0),n.push(l);let c=1/(o-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,g=6,x=3,m=2,p=1,_=new Float32Array(x*g*d),v=new Float32Array(m*g*d),M=new Float32Array(p*g*d);for(let C=0;C<d;C++){let P=C%3*2/3-1,V=C>2?0:-1,w=[P,V,0,P+2/3,V,0,P+2/3,V+1,0,P,V,0,P+2/3,V+1,0,P,V+1,0];_.set(w,x*g*C),v.set(f,m*g*C);let E=[C,C,C,C,C,C];M.set(E,p*g*C)}let D=new Dt;D.setAttribute("position",new Ht(_,x)),D.setAttribute("uv",new Ht(v,m)),D.setAttribute("faceIndex",new Ht(M,p)),e.push(D),i>Fs&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Fu(r,e,t){let n=new ui(r,e,t);return n.texture.mapping=lo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function xa(r,e,t,n,i){r.viewport.set(e,t,n,i),r.scissor.set(e,t,n,i)}function Ax(r,e,t){let n=new Float32Array(Zi),i=new R(0,1,0);return new fi({name:"SphericalGaussianBlur",defines:{n:Zi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Mc(),fragmentShader:`

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
		`,blending:Ti,depthTest:!1,depthWrite:!1})}function Ou(){return new fi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Mc(),fragmentShader:`

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
		`,blending:Ti,depthTest:!1,depthWrite:!1})}function Bu(){return new fi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Mc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ti,depthTest:!1,depthWrite:!1})}function Mc(){return`

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
	`}function Rx(r){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){let l=o.mapping,c=l===ts||l===Al,h=l===Hs||l===Vs;if(c||h)if(o.isRenderTargetTexture&&o.needsPMREMUpdate===!0){o.needsPMREMUpdate=!1;let u=e.get(o);return t===null&&(t=new Zs(r)),u=c?t.fromEquirectangular(o,u):t.fromCubemap(o,u),e.set(o,u),u.texture}else{if(e.has(o))return e.get(o).texture;{let u=o.image;if(c&&u&&u.height>0||h&&u&&i(u)){t===null&&(t=new Zs(r));let f=c?t.fromEquirectangular(o):t.fromCubemap(o);return e.set(o,f),o.addEventListener("dispose",s),f.texture}else return null}}}return o}function i(o){let l=0,c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function s(o){let l=o.target;l.removeEventListener("dispose",s);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function Cx(r){let e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){let i=t(n);return i===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function Px(r,e,t,n){let i={},s=new WeakMap;function a(u){let f=u.target;f.index!==null&&e.remove(f.index);for(let g in f.attributes)e.remove(f.attributes[g]);for(let g in f.morphAttributes){let x=f.morphAttributes[g];for(let m=0,p=x.length;m<p;m++)e.remove(x[m])}f.removeEventListener("dispose",a),delete i[f.id];let d=s.get(f);d&&(e.remove(d),s.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(u,f){return i[f.id]===!0||(f.addEventListener("dispose",a),i[f.id]=!0,t.memory.geometries++),f}function l(u){let f=u.attributes;for(let g in f)e.update(f[g],r.ARRAY_BUFFER);let d=u.morphAttributes;for(let g in d){let x=d[g];for(let m=0,p=x.length;m<p;m++)e.update(x[m],r.ARRAY_BUFFER)}}function c(u){let f=[],d=u.index,g=u.attributes.position,x=0;if(d!==null){let _=d.array;x=d.version;for(let v=0,M=_.length;v<M;v+=3){let D=_[v+0],C=_[v+1],P=_[v+2];f.push(D,C,C,P,P,D)}}else if(g!==void 0){let _=g.array;x=g.version;for(let v=0,M=_.length/3-1;v<M;v+=3){let D=v+0,C=v+1,P=v+2;f.push(D,C,C,P,P,D)}}else return;let m=new(Bf(f)?Ys:Pi)(f,1);m.version=x;let p=s.get(u);p&&e.remove(p),s.set(u,m)}function h(u){let f=s.get(u);if(f){let d=u.index;d!==null&&f.version<d.version&&c(u)}else c(u);return s.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function Lx(r,e,t,n){let i=n.isWebGL2,s;function a(d){s=d}let o,l;function c(d){o=d.type,l=d.bytesPerElement}function h(d,g){r.drawElements(s,g,o,d*l),t.update(g,s,1)}function u(d,g,x){if(x===0)return;let m,p;if(i)m=r,p="drawElementsInstanced";else if(m=e.get("ANGLE_instanced_arrays"),p="drawElementsInstancedANGLE",m===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[p](s,g,o,d*l,x),t.update(g,s,x)}function f(d,g,x){if(x===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<x;p++)this.render(d[p]/l,g[p]);else{m.multiDrawElementsWEBGL(s,g,0,o,d,0,x);let p=0;for(let _=0;_<x;_++)p+=g[_];t.update(p,s,1)}}this.setMode=a,this.setIndex=c,this.render=h,this.renderInstances=u,this.renderMultiDraw=f}function Ix(r){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,o){switch(t.calls++,a){case r.TRIANGLES:t.triangles+=o*(s/3);break;case r.LINES:t.lines+=o*(s/2);break;case r.LINE_STRIP:t.lines+=o*(s-1);break;case r.LINE_LOOP:t.lines+=o*s;break;case r.POINTS:t.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function Dx(r,e){return r[0]-e[0]}function Ux(r,e){return Math.abs(e[1])-Math.abs(r[1])}function Nx(r,e,t){let n={},i=new Float32Array(8),s=new WeakMap,a=new dt,o=[];for(let c=0;c<8;c++)o[c]=[c,0];function l(c,h,u){let f=c.morphTargetInfluences;if(e.isWebGL2===!0){let d=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,g=d!==void 0?d.length:0,x=s.get(h);if(x===void 0||x.count!==g){let F=function(){Q.dispose(),s.delete(h),h.removeEventListener("dispose",F)};x!==void 0&&x.texture.dispose();let _=h.morphAttributes.position!==void 0,v=h.morphAttributes.normal!==void 0,M=h.morphAttributes.color!==void 0,D=h.morphAttributes.position||[],C=h.morphAttributes.normal||[],P=h.morphAttributes.color||[],V=0;_===!0&&(V=1),v===!0&&(V=2),M===!0&&(V=3);let w=h.attributes.position.count*V,E=1;w>e.maxTextureSize&&(E=Math.ceil(w/e.maxTextureSize),w=e.maxTextureSize);let q=new Float32Array(w*E*4*g),Q=new ka(q,w,E,g);Q.type=oi,Q.needsUpdate=!0;let le=V*4;for(let Y=0;Y<g;Y++){let J=D[Y],ae=C[Y],ie=P[Y],ee=w*E*4*Y;for(let oe=0;oe<J.count;oe++){let k=oe*le;_===!0&&(a.fromBufferAttribute(J,oe),q[ee+k+0]=a.x,q[ee+k+1]=a.y,q[ee+k+2]=a.z,q[ee+k+3]=0),v===!0&&(a.fromBufferAttribute(ae,oe),q[ee+k+4]=a.x,q[ee+k+5]=a.y,q[ee+k+6]=a.z,q[ee+k+7]=0),M===!0&&(a.fromBufferAttribute(ie,oe),q[ee+k+8]=a.x,q[ee+k+9]=a.y,q[ee+k+10]=a.z,q[ee+k+11]=ie.itemSize===4?a.w:1)}}x={count:g,texture:Q,size:new pe(w,E)},s.set(h,x),h.addEventListener("dispose",F)}let m=0;for(let _=0;_<f.length;_++)m+=f[_];let p=h.morphTargetsRelative?1:1-m;u.getUniforms().setValue(r,"morphTargetBaseInfluence",p),u.getUniforms().setValue(r,"morphTargetInfluences",f),u.getUniforms().setValue(r,"morphTargetsTexture",x.texture,t),u.getUniforms().setValue(r,"morphTargetsTextureSize",x.size)}else{let d=f===void 0?0:f.length,g=n[h.id];if(g===void 0||g.length!==d){g=[];for(let v=0;v<d;v++)g[v]=[v,0];n[h.id]=g}for(let v=0;v<d;v++){let M=g[v];M[0]=v,M[1]=f[v]}g.sort(Ux);for(let v=0;v<8;v++)v<d&&g[v][1]?(o[v][0]=g[v][0],o[v][1]=g[v][1]):(o[v][0]=Number.MAX_SAFE_INTEGER,o[v][1]=0);o.sort(Dx);let x=h.morphAttributes.position,m=h.morphAttributes.normal,p=0;for(let v=0;v<8;v++){let M=o[v],D=M[0],C=M[1];D!==Number.MAX_SAFE_INTEGER&&C?(x&&h.getAttribute("morphTarget"+v)!==x[D]&&h.setAttribute("morphTarget"+v,x[D]),m&&h.getAttribute("morphNormal"+v)!==m[D]&&h.setAttribute("morphNormal"+v,m[D]),i[v]=C,p+=C):(x&&h.hasAttribute("morphTarget"+v)===!0&&h.deleteAttribute("morphTarget"+v),m&&h.hasAttribute("morphNormal"+v)===!0&&h.deleteAttribute("morphNormal"+v),i[v]=0)}let _=h.morphTargetsRelative?1:1-p;u.getUniforms().setValue(r,"morphTargetBaseInfluence",_),u.getUniforms().setValue(r,"morphTargetInfluences",i)}}return{update:l}}function Fx(r,e,t,n){let i=new WeakMap;function s(l){let c=n.render.frame,h=l.geometry,u=e.get(l,h);if(i.get(u)!==c&&(e.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),i.get(l)!==c&&(t.update(l.instanceMatrix,r.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,r.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){let f=l.skeleton;i.get(f)!==c&&(f.update(),i.set(f,c))}return u}function a(){i=new WeakMap}function o(l){let c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:a}}var Wa=class extends It{constructor(e,t,n,i,s,a,o,l,c,h){if(h=h!==void 0?h:ji,h!==ji&&h!==Gs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===ji&&(n=wi),n===void 0&&h===Gs&&(n=$i),super(null,i,s,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:kt,this.minFilter=l!==void 0?l:kt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Vf=new It,Gf=new Wa(1,1);Gf.compareFunction=Of;var Wf=new ka,Xf=new Il,qf=new Ga,zu=[],ku=[],Hu=new Float32Array(16),Vu=new Float32Array(9),Gu=new Float32Array(4);function nr(r,e,t){let n=r[0];if(n<=0||n>0)return r;let i=e*t,s=zu[i];if(s===void 0&&(s=new Float32Array(i),zu[i]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,r[a].toArray(s,o)}return s}function Wt(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function Xt(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function fo(r,e){let t=ku[e];t===void 0&&(t=new Int32Array(e),ku[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function Ox(r,e){let t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function Bx(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Wt(t,e))return;r.uniform2fv(this.addr,e),Xt(t,e)}}function zx(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Wt(t,e))return;r.uniform3fv(this.addr,e),Xt(t,e)}}function kx(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Wt(t,e))return;r.uniform4fv(this.addr,e),Xt(t,e)}}function Hx(r,e){let t=this.cache,n=e.elements;if(n===void 0){if(Wt(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),Xt(t,e)}else{if(Wt(t,n))return;Gu.set(n),r.uniformMatrix2fv(this.addr,!1,Gu),Xt(t,n)}}function Vx(r,e){let t=this.cache,n=e.elements;if(n===void 0){if(Wt(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),Xt(t,e)}else{if(Wt(t,n))return;Vu.set(n),r.uniformMatrix3fv(this.addr,!1,Vu),Xt(t,n)}}function Gx(r,e){let t=this.cache,n=e.elements;if(n===void 0){if(Wt(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),Xt(t,e)}else{if(Wt(t,n))return;Hu.set(n),r.uniformMatrix4fv(this.addr,!1,Hu),Xt(t,n)}}function Wx(r,e){let t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function Xx(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Wt(t,e))return;r.uniform2iv(this.addr,e),Xt(t,e)}}function qx(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Wt(t,e))return;r.uniform3iv(this.addr,e),Xt(t,e)}}function Yx(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Wt(t,e))return;r.uniform4iv(this.addr,e),Xt(t,e)}}function Kx(r,e){let t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function Zx(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Wt(t,e))return;r.uniform2uiv(this.addr,e),Xt(t,e)}}function Jx(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Wt(t,e))return;r.uniform3uiv(this.addr,e),Xt(t,e)}}function $x(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Wt(t,e))return;r.uniform4uiv(this.addr,e),Xt(t,e)}}function jx(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i);let s=this.type===r.SAMPLER_2D_SHADOW?Gf:Vf;t.setTexture2D(e||s,i)}function Qx(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Xf,i)}function ev(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||qf,i)}function tv(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Wf,i)}function nv(r){switch(r){case 5126:return Ox;case 35664:return Bx;case 35665:return zx;case 35666:return kx;case 35674:return Hx;case 35675:return Vx;case 35676:return Gx;case 5124:case 35670:return Wx;case 35667:case 35671:return Xx;case 35668:case 35672:return qx;case 35669:case 35673:return Yx;case 5125:return Kx;case 36294:return Zx;case 36295:return Jx;case 36296:return $x;case 35678:case 36198:case 36298:case 36306:case 35682:return jx;case 35679:case 36299:case 36307:return Qx;case 35680:case 36300:case 36308:case 36293:return ev;case 36289:case 36303:case 36311:case 36292:return tv}}function iv(r,e){r.uniform1fv(this.addr,e)}function sv(r,e){let t=nr(e,this.size,2);r.uniform2fv(this.addr,t)}function rv(r,e){let t=nr(e,this.size,3);r.uniform3fv(this.addr,t)}function av(r,e){let t=nr(e,this.size,4);r.uniform4fv(this.addr,t)}function ov(r,e){let t=nr(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function lv(r,e){let t=nr(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function cv(r,e){let t=nr(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function hv(r,e){r.uniform1iv(this.addr,e)}function uv(r,e){r.uniform2iv(this.addr,e)}function fv(r,e){r.uniform3iv(this.addr,e)}function dv(r,e){r.uniform4iv(this.addr,e)}function pv(r,e){r.uniform1uiv(this.addr,e)}function mv(r,e){r.uniform2uiv(this.addr,e)}function gv(r,e){r.uniform3uiv(this.addr,e)}function xv(r,e){r.uniform4uiv(this.addr,e)}function vv(r,e,t){let n=this.cache,i=e.length,s=fo(t,i);Wt(n,s)||(r.uniform1iv(this.addr,s),Xt(n,s));for(let a=0;a!==i;++a)t.setTexture2D(e[a]||Vf,s[a])}function _v(r,e,t){let n=this.cache,i=e.length,s=fo(t,i);Wt(n,s)||(r.uniform1iv(this.addr,s),Xt(n,s));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||Xf,s[a])}function yv(r,e,t){let n=this.cache,i=e.length,s=fo(t,i);Wt(n,s)||(r.uniform1iv(this.addr,s),Xt(n,s));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||qf,s[a])}function Mv(r,e,t){let n=this.cache,i=e.length,s=fo(t,i);Wt(n,s)||(r.uniform1iv(this.addr,s),Xt(n,s));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||Wf,s[a])}function Sv(r){switch(r){case 5126:return iv;case 35664:return sv;case 35665:return rv;case 35666:return av;case 35674:return ov;case 35675:return lv;case 35676:return cv;case 5124:case 35670:return hv;case 35667:case 35671:return uv;case 35668:case 35672:return fv;case 35669:case 35673:return dv;case 5125:return pv;case 36294:return mv;case 36295:return gv;case 36296:return xv;case 35678:case 36198:case 36298:case 36306:case 35682:return vv;case 35679:case 36299:case 36307:return _v;case 35680:case 36300:case 36308:case 36293:return yv;case 36289:case 36303:case 36311:case 36292:return Mv}}var Nl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=nv(t.type)}},Fl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Sv(t.type)}},Ol=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let i=this.seq;for(let s=0,a=i.length;s!==a;++s){let o=i[s];o.setValue(e,t[o.id],n)}}},ml=/(\w+)(\])?(\[|\.)?/g;function Wu(r,e){r.seq.push(e),r.map[e.id]=e}function wv(r,e,t){let n=r.name,i=n.length;for(ml.lastIndex=0;;){let s=ml.exec(n),a=ml.lastIndex,o=s[1],l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===i){Wu(t,c===void 0?new Nl(o,r,e):new Fl(o,r,e));break}else{let u=t.map[o];u===void 0&&(u=new Ol(o),Wu(t,u)),t=u}}}var ks=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){let s=e.getActiveUniform(t,i),a=e.getUniformLocation(t,s.name);wv(s,a,this)}}setValue(e,t,n,i){let s=this.map[t];s!==void 0&&s.setValue(e,n,i)}setOptional(e,t,n){let i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,a=t.length;s!==a;++s){let o=t[s],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,i)}}static seqWithValue(e,t){let n=[];for(let i=0,s=e.length;i!==s;++i){let a=e[i];a.id in t&&n.push(a)}return n}};function Xu(r,e,t){let n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}var bv=37297,Tv=0;function Ev(r,e){let t=r.split(`
`),n=[],i=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=i;a<s;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}function Av(r){let e=xt.getPrimaries(xt.workingColorSpace),t=xt.getPrimaries(r),n;switch(e===t?n="":e===Na&&t===Ua?n="LinearDisplayP3ToLinearSRGB":e===Ua&&t===Na&&(n="LinearSRGBToLinearDisplayP3"),r){case Vt:case uo:return[n,"LinearTransferOETF"];case it:case _c:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",r),[n,"LinearTransferOETF"]}}function qu(r,e,t){let n=r.getShaderParameter(e,r.COMPILE_STATUS),i=r.getShaderInfoLog(e).trim();if(n&&i==="")return"";let s=/ERROR: 0:(\d+)/.exec(i);if(s){let a=parseInt(s[1]);return t.toUpperCase()+`

`+i+`

`+Ev(r.getShaderSource(e),a)}else return i}function Rv(r,e){let t=Av(e);return`vec4 ${r}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function Cv(r,e){let t;switch(e){case Lp:t="Linear";break;case Ip:t="Reinhard";break;case Dp:t="OptimizedCineon";break;case mc:t="ACESFilmic";break;case Np:t="AgX";break;case Up:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function Pv(r){return[r.extensionDerivatives||r.envMapCubeUVHeight||r.bumpMap||r.normalMapTangentSpace||r.clearcoatNormalMap||r.flatShading||r.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(r.extensionFragDepth||r.logarithmicDepthBuffer)&&r.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",r.extensionDrawBuffers&&r.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(r.extensionShaderTextureLOD||r.envMap||r.transmission)&&r.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(Os).join(`
`)}function Lv(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(Os).join(`
`)}function Iv(r){let e=[];for(let t in r){let n=r[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Dv(r,e){let t={},n=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){let s=r.getActiveAttrib(e,i),a=s.name,o=1;s.type===r.FLOAT_MAT2&&(o=2),s.type===r.FLOAT_MAT3&&(o=3),s.type===r.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:r.getAttribLocation(e,a),locationSize:o}}return t}function Os(r){return r!==""}function Yu(r,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ku(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Uv=/^[ \t]*#include +<([\w\d./]+)>/gm;function Bl(r){return r.replace(Uv,Fv)}var Nv=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function Fv(r,e){let t=tt[e];if(t===void 0){let n=Nv.get(e);if(n!==void 0)t=tt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Bl(t)}var Ov=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Zu(r){return r.replace(Ov,Bv)}function Bv(r,e,t,n){let i="";for(let s=parseInt(e);s<parseInt(t);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function Ju(r){let e="precision "+r.precision+` float;
precision `+r.precision+" int;";return r.precision==="highp"?e+=`
#define HIGH_PRECISION`:r.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function zv(r){let e="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===Ef?e="SHADOWMAP_TYPE_PCF":r.shadowMapType===pc?e="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===ri&&(e="SHADOWMAP_TYPE_VSM"),e}function kv(r){let e="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case Hs:case Vs:e="ENVMAP_TYPE_CUBE";break;case lo:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Hv(r){let e="ENVMAP_MODE_REFLECTION";return r.envMap&&r.envMapMode===Vs&&(e="ENVMAP_MODE_REFRACTION"),e}function Vv(r){let e="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case oo:e="ENVMAP_BLENDING_MULTIPLY";break;case Cp:e="ENVMAP_BLENDING_MIX";break;case Pp:e="ENVMAP_BLENDING_ADD";break}return e}function Gv(r){let e=r.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Wv(r,e,t,n){let i=r.getContext(),s=t.defines,a=t.vertexShader,o=t.fragmentShader,l=zv(t),c=kv(t),h=Hv(t),u=Vv(t),f=Gv(t),d=t.isWebGL2?"":Pv(t),g=Lv(t),x=Iv(s),m=i.createProgram(),p,_,v=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Os).join(`
`),p.length>0&&(p+=`
`),_=[d,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Os).join(`
`),_.length>0&&(_+=`
`)):(p=[Ju(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Os).join(`
`),_=[d,Ju(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Ai?"#define TONE_MAPPING":"",t.toneMapping!==Ai?tt.tonemapping_pars_fragment:"",t.toneMapping!==Ai?Cv("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",tt.colorspace_pars_fragment,Rv("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Os).join(`
`)),a=Bl(a),a=Yu(a,t),a=Ku(a,t),o=Bl(o),o=Yu(o,t),o=Ku(o,t),a=Zu(a),o=Zu(o),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,p=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,_=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===mu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===mu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+_);let M=v+p+a,D=v+_+o,C=Xu(i,i.VERTEX_SHADER,M),P=Xu(i,i.FRAGMENT_SHADER,D);i.attachShader(m,C),i.attachShader(m,P),t.index0AttributeName!==void 0?i.bindAttribLocation(m,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(m,0,"position"),i.linkProgram(m);function V(Q){if(r.debug.checkShaderErrors){let le=i.getProgramInfoLog(m).trim(),F=i.getShaderInfoLog(C).trim(),Y=i.getShaderInfoLog(P).trim(),J=!0,ae=!0;if(i.getProgramParameter(m,i.LINK_STATUS)===!1)if(J=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,m,C,P);else{let ie=qu(i,C,"vertex"),ee=qu(i,P,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(m,i.VALIDATE_STATUS)+`

Program Info Log: `+le+`
`+ie+`
`+ee)}else le!==""?console.warn("THREE.WebGLProgram: Program Info Log:",le):(F===""||Y==="")&&(ae=!1);ae&&(Q.diagnostics={runnable:J,programLog:le,vertexShader:{log:F,prefix:p},fragmentShader:{log:Y,prefix:_}})}i.deleteShader(C),i.deleteShader(P),w=new ks(i,m),E=Dv(i,m)}let w;this.getUniforms=function(){return w===void 0&&V(this),w};let E;this.getAttributes=function(){return E===void 0&&V(this),E};let q=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return q===!1&&(q=i.getProgramParameter(m,bv)),q},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Tv++,this.cacheKey=e,this.usedTimes=1,this.program=m,this.vertexShader=C,this.fragmentShader=P,this}var Xv=0,zl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new kl(e),t.set(e,n)),n}},kl=class{constructor(e){this.id=Xv++,this.code=e,this.usedTimes=0}};function qv(r,e,t,n,i,s,a){let o=new Ha,l=new zl,c=[],h=i.isWebGL2,u=i.logarithmicDepthBuffer,f=i.vertexTextures,d=i.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(w){return w===0?"uv":`uv${w}`}function m(w,E,q,Q,le){let F=Q.fog,Y=le.geometry,J=w.isMeshStandardMaterial?Q.environment:null,ae=(w.isMeshStandardMaterial?t:e).get(w.envMap||J),ie=ae&&ae.mapping===lo?ae.image.height:null,ee=g[w.type];w.precision!==null&&(d=i.getMaxPrecision(w.precision),d!==w.precision&&console.warn("THREE.WebGLProgram.getParameters:",w.precision,"not supported, using",d,"instead."));let oe=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,k=oe!==void 0?oe.length:0,j=0;Y.morphAttributes.position!==void 0&&(j=1),Y.morphAttributes.normal!==void 0&&(j=2),Y.morphAttributes.color!==void 0&&(j=3);let W,se,ge,Me;if(ee){let De=Xn[ee];W=De.vertexShader,se=De.fragmentShader}else W=w.vertexShader,se=w.fragmentShader,l.update(w),ge=l.getVertexShaderID(w),Me=l.getFragmentShaderID(w);let Se=r.getRenderTarget(),Fe=le.isInstancedMesh===!0,He=le.isBatchedMesh===!0,Ne=!!w.map,Be=!!w.matcap,L=!!ae,me=!!w.aoMap,te=!!w.lightMap,de=!!w.bumpMap,ne=!!w.normalMap,Oe=!!w.displacementMap,we=!!w.emissiveMap,T=!!w.metalnessMap,y=!!w.roughnessMap,X=w.anisotropy>0,ue=w.clearcoat>0,ce=w.iridescence>0,he=w.sheen>0,Ee=w.transmission>0,ve=X&&!!w.anisotropyMap,Pe=ue&&!!w.clearcoatMap,Ve=ue&&!!w.clearcoatNormalMap,Ye=ue&&!!w.clearcoatRoughnessMap,fe=ce&&!!w.iridescenceMap,ht=ce&&!!w.iridescenceThicknessMap,et=he&&!!w.sheenColorMap,Xe=he&&!!w.sheenRoughnessMap,ke=!!w.specularMap,Le=!!w.specularColorMap,Ke=!!w.specularIntensityMap,A=Ee&&!!w.transmissionMap,I=Ee&&!!w.thicknessMap,U=!!w.gradientMap,O=!!w.alphaMap,S=w.alphaTest>0,z=!!w.alphaHash,B=!!w.extensions,G=!!Y.attributes.uv1,re=!!Y.attributes.uv2,ye=!!Y.attributes.uv3,Ae=Ai;return w.toneMapped&&(Se===null||Se.isXRRenderTarget===!0)&&(Ae=r.toneMapping),{isWebGL2:h,shaderID:ee,shaderType:w.type,shaderName:w.name,vertexShader:W,fragmentShader:se,defines:w.defines,customVertexShaderID:ge,customFragmentShaderID:Me,isRawShaderMaterial:w.isRawShaderMaterial===!0,glslVersion:w.glslVersion,precision:d,batching:He,instancing:Fe,instancingColor:Fe&&le.instanceColor!==null,supportsVertexTextures:f,outputColorSpace:Se===null?r.outputColorSpace:Se.isXRRenderTarget===!0?Se.texture.colorSpace:Vt,map:Ne,matcap:Be,envMap:L,envMapMode:L&&ae.mapping,envMapCubeUVHeight:ie,aoMap:me,lightMap:te,bumpMap:de,normalMap:ne,displacementMap:f&&Oe,emissiveMap:we,normalMapObjectSpace:ne&&w.normalMapType===$p,normalMapTangentSpace:ne&&w.normalMapType===ho,metalnessMap:T,roughnessMap:y,anisotropy:X,anisotropyMap:ve,clearcoat:ue,clearcoatMap:Pe,clearcoatNormalMap:Ve,clearcoatRoughnessMap:Ye,iridescence:ce,iridescenceMap:fe,iridescenceThicknessMap:ht,sheen:he,sheenColorMap:et,sheenRoughnessMap:Xe,specularMap:ke,specularColorMap:Le,specularIntensityMap:Ke,transmission:Ee,transmissionMap:A,thicknessMap:I,gradientMap:U,opaque:w.transparent===!1&&w.blending===Ei,alphaMap:O,alphaTest:S,alphaHash:z,combine:w.combine,mapUv:Ne&&x(w.map.channel),aoMapUv:me&&x(w.aoMap.channel),lightMapUv:te&&x(w.lightMap.channel),bumpMapUv:de&&x(w.bumpMap.channel),normalMapUv:ne&&x(w.normalMap.channel),displacementMapUv:Oe&&x(w.displacementMap.channel),emissiveMapUv:we&&x(w.emissiveMap.channel),metalnessMapUv:T&&x(w.metalnessMap.channel),roughnessMapUv:y&&x(w.roughnessMap.channel),anisotropyMapUv:ve&&x(w.anisotropyMap.channel),clearcoatMapUv:Pe&&x(w.clearcoatMap.channel),clearcoatNormalMapUv:Ve&&x(w.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ye&&x(w.clearcoatRoughnessMap.channel),iridescenceMapUv:fe&&x(w.iridescenceMap.channel),iridescenceThicknessMapUv:ht&&x(w.iridescenceThicknessMap.channel),sheenColorMapUv:et&&x(w.sheenColorMap.channel),sheenRoughnessMapUv:Xe&&x(w.sheenRoughnessMap.channel),specularMapUv:ke&&x(w.specularMap.channel),specularColorMapUv:Le&&x(w.specularColorMap.channel),specularIntensityMapUv:Ke&&x(w.specularIntensityMap.channel),transmissionMapUv:A&&x(w.transmissionMap.channel),thicknessMapUv:I&&x(w.thicknessMap.channel),alphaMapUv:O&&x(w.alphaMap.channel),vertexTangents:!!Y.attributes.tangent&&(ne||X),vertexColors:w.vertexColors,vertexAlphas:w.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,vertexUv1s:G,vertexUv2s:re,vertexUv3s:ye,pointsUvs:le.isPoints===!0&&!!Y.attributes.uv&&(Ne||O),fog:!!F,useFog:w.fog===!0,fogExp2:F&&F.isFogExp2,flatShading:w.flatShading===!0,sizeAttenuation:w.sizeAttenuation===!0,logarithmicDepthBuffer:u,skinning:le.isSkinnedMesh===!0,morphTargets:Y.morphAttributes.position!==void 0,morphNormals:Y.morphAttributes.normal!==void 0,morphColors:Y.morphAttributes.color!==void 0,morphTargetsCount:k,morphTextureStride:j,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:w.dithering,shadowMapEnabled:r.shadowMap.enabled&&q.length>0,shadowMapType:r.shadowMap.type,toneMapping:Ae,useLegacyLights:r._useLegacyLights,decodeVideoTexture:Ne&&w.map.isVideoTexture===!0&&xt.getTransfer(w.map.colorSpace)===Rt,premultipliedAlpha:w.premultipliedAlpha,doubleSided:w.side===Sn,flipSided:w.side===rn,useDepthPacking:w.depthPacking>=0,depthPacking:w.depthPacking||0,index0AttributeName:w.index0AttributeName,extensionDerivatives:B&&w.extensions.derivatives===!0,extensionFragDepth:B&&w.extensions.fragDepth===!0,extensionDrawBuffers:B&&w.extensions.drawBuffers===!0,extensionShaderTextureLOD:B&&w.extensions.shaderTextureLOD===!0,extensionClipCullDistance:B&&w.extensions.clipCullDistance&&n.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:h||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:w.customProgramCacheKey()}}function p(w){let E=[];if(w.shaderID?E.push(w.shaderID):(E.push(w.customVertexShaderID),E.push(w.customFragmentShaderID)),w.defines!==void 0)for(let q in w.defines)E.push(q),E.push(w.defines[q]);return w.isRawShaderMaterial===!1&&(_(E,w),v(E,w),E.push(r.outputColorSpace)),E.push(w.customProgramCacheKey),E.join()}function _(w,E){w.push(E.precision),w.push(E.outputColorSpace),w.push(E.envMapMode),w.push(E.envMapCubeUVHeight),w.push(E.mapUv),w.push(E.alphaMapUv),w.push(E.lightMapUv),w.push(E.aoMapUv),w.push(E.bumpMapUv),w.push(E.normalMapUv),w.push(E.displacementMapUv),w.push(E.emissiveMapUv),w.push(E.metalnessMapUv),w.push(E.roughnessMapUv),w.push(E.anisotropyMapUv),w.push(E.clearcoatMapUv),w.push(E.clearcoatNormalMapUv),w.push(E.clearcoatRoughnessMapUv),w.push(E.iridescenceMapUv),w.push(E.iridescenceThicknessMapUv),w.push(E.sheenColorMapUv),w.push(E.sheenRoughnessMapUv),w.push(E.specularMapUv),w.push(E.specularColorMapUv),w.push(E.specularIntensityMapUv),w.push(E.transmissionMapUv),w.push(E.thicknessMapUv),w.push(E.combine),w.push(E.fogExp2),w.push(E.sizeAttenuation),w.push(E.morphTargetsCount),w.push(E.morphAttributeCount),w.push(E.numDirLights),w.push(E.numPointLights),w.push(E.numSpotLights),w.push(E.numSpotLightMaps),w.push(E.numHemiLights),w.push(E.numRectAreaLights),w.push(E.numDirLightShadows),w.push(E.numPointLightShadows),w.push(E.numSpotLightShadows),w.push(E.numSpotLightShadowsWithMaps),w.push(E.numLightProbes),w.push(E.shadowMapType),w.push(E.toneMapping),w.push(E.numClippingPlanes),w.push(E.numClipIntersection),w.push(E.depthPacking)}function v(w,E){o.disableAll(),E.isWebGL2&&o.enable(0),E.supportsVertexTextures&&o.enable(1),E.instancing&&o.enable(2),E.instancingColor&&o.enable(3),E.matcap&&o.enable(4),E.envMap&&o.enable(5),E.normalMapObjectSpace&&o.enable(6),E.normalMapTangentSpace&&o.enable(7),E.clearcoat&&o.enable(8),E.iridescence&&o.enable(9),E.alphaTest&&o.enable(10),E.vertexColors&&o.enable(11),E.vertexAlphas&&o.enable(12),E.vertexUv1s&&o.enable(13),E.vertexUv2s&&o.enable(14),E.vertexUv3s&&o.enable(15),E.vertexTangents&&o.enable(16),E.anisotropy&&o.enable(17),E.alphaHash&&o.enable(18),E.batching&&o.enable(19),w.push(o.mask),o.disableAll(),E.fog&&o.enable(0),E.useFog&&o.enable(1),E.flatShading&&o.enable(2),E.logarithmicDepthBuffer&&o.enable(3),E.skinning&&o.enable(4),E.morphTargets&&o.enable(5),E.morphNormals&&o.enable(6),E.morphColors&&o.enable(7),E.premultipliedAlpha&&o.enable(8),E.shadowMapEnabled&&o.enable(9),E.useLegacyLights&&o.enable(10),E.doubleSided&&o.enable(11),E.flipSided&&o.enable(12),E.useDepthPacking&&o.enable(13),E.dithering&&o.enable(14),E.transmission&&o.enable(15),E.sheen&&o.enable(16),E.opaque&&o.enable(17),E.pointsUvs&&o.enable(18),E.decodeVideoTexture&&o.enable(19),w.push(o.mask)}function M(w){let E=g[w.type],q;if(E){let Q=Xn[E];q=Nm.clone(Q.uniforms)}else q=w.uniforms;return q}function D(w,E){let q;for(let Q=0,le=c.length;Q<le;Q++){let F=c[Q];if(F.cacheKey===E){q=F,++q.usedTimes;break}}return q===void 0&&(q=new Wv(r,E,w,s),c.push(q)),q}function C(w){if(--w.usedTimes===0){let E=c.indexOf(w);c[E]=c[c.length-1],c.pop(),w.destroy()}}function P(w){l.remove(w)}function V(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:M,acquireProgram:D,releaseProgram:C,releaseShaderCache:P,programs:c,dispose:V}}function Yv(){let r=new WeakMap;function e(s){let a=r.get(s);return a===void 0&&(a={},r.set(s,a)),a}function t(s){r.delete(s)}function n(s,a,o){r.get(s)[a]=o}function i(){r=new WeakMap}return{get:e,remove:t,update:n,dispose:i}}function Kv(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function $u(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function ju(){let r=[],e=0,t=[],n=[],i=[];function s(){e=0,t.length=0,n.length=0,i.length=0}function a(u,f,d,g,x,m){let p=r[e];return p===void 0?(p={id:u.id,object:u,geometry:f,material:d,groupOrder:g,renderOrder:u.renderOrder,z:x,group:m},r[e]=p):(p.id=u.id,p.object=u,p.geometry=f,p.material=d,p.groupOrder=g,p.renderOrder=u.renderOrder,p.z=x,p.group=m),e++,p}function o(u,f,d,g,x,m){let p=a(u,f,d,g,x,m);d.transmission>0?n.push(p):d.transparent===!0?i.push(p):t.push(p)}function l(u,f,d,g,x,m){let p=a(u,f,d,g,x,m);d.transmission>0?n.unshift(p):d.transparent===!0?i.unshift(p):t.unshift(p)}function c(u,f){t.length>1&&t.sort(u||Kv),n.length>1&&n.sort(f||$u),i.length>1&&i.sort(f||$u)}function h(){for(let u=e,f=r.length;u<f;u++){let d=r[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:t,transmissive:n,transparent:i,init:s,push:o,unshift:l,finish:h,sort:c}}function Zv(){let r=new WeakMap;function e(n,i){let s=r.get(n),a;return s===void 0?(a=new ju,r.set(n,[a])):i>=s.length?(a=new ju,s.push(a)):a=s[i],a}function t(){r=new WeakMap}return{get:e,dispose:t}}function Jv(){let r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new R,color:new Re};break;case"SpotLight":t={position:new R,direction:new R,color:new Re,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new R,color:new Re,distance:0,decay:0};break;case"HemisphereLight":t={direction:new R,skyColor:new Re,groundColor:new Re};break;case"RectAreaLight":t={color:new Re,position:new R,halfWidth:new R,halfHeight:new R};break}return r[e.id]=t,t}}}function $v(){let r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}var jv=0;function Qv(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function e_(r,e){let t=new Jv,n=$v(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)i.probe.push(new R);let s=new R,a=new Ie,o=new Ie;function l(h,u){let f=0,d=0,g=0;for(let Q=0;Q<9;Q++)i.probe[Q].set(0,0,0);let x=0,m=0,p=0,_=0,v=0,M=0,D=0,C=0,P=0,V=0,w=0;h.sort(Qv);let E=u===!0?Math.PI:1;for(let Q=0,le=h.length;Q<le;Q++){let F=h[Q],Y=F.color,J=F.intensity,ae=F.distance,ie=F.shadow&&F.shadow.map?F.shadow.map.texture:null;if(F.isAmbientLight)f+=Y.r*J*E,d+=Y.g*J*E,g+=Y.b*J*E;else if(F.isLightProbe){for(let ee=0;ee<9;ee++)i.probe[ee].addScaledVector(F.sh.coefficients[ee],J);w++}else if(F.isDirectionalLight){let ee=t.get(F);if(ee.color.copy(F.color).multiplyScalar(F.intensity*E),F.castShadow){let oe=F.shadow,k=n.get(F);k.shadowBias=oe.bias,k.shadowNormalBias=oe.normalBias,k.shadowRadius=oe.radius,k.shadowMapSize=oe.mapSize,i.directionalShadow[x]=k,i.directionalShadowMap[x]=ie,i.directionalShadowMatrix[x]=F.shadow.matrix,M++}i.directional[x]=ee,x++}else if(F.isSpotLight){let ee=t.get(F);ee.position.setFromMatrixPosition(F.matrixWorld),ee.color.copy(Y).multiplyScalar(J*E),ee.distance=ae,ee.coneCos=Math.cos(F.angle),ee.penumbraCos=Math.cos(F.angle*(1-F.penumbra)),ee.decay=F.decay,i.spot[p]=ee;let oe=F.shadow;if(F.map&&(i.spotLightMap[P]=F.map,P++,oe.updateMatrices(F),F.castShadow&&V++),i.spotLightMatrix[p]=oe.matrix,F.castShadow){let k=n.get(F);k.shadowBias=oe.bias,k.shadowNormalBias=oe.normalBias,k.shadowRadius=oe.radius,k.shadowMapSize=oe.mapSize,i.spotShadow[p]=k,i.spotShadowMap[p]=ie,C++}p++}else if(F.isRectAreaLight){let ee=t.get(F);ee.color.copy(Y).multiplyScalar(J),ee.halfWidth.set(F.width*.5,0,0),ee.halfHeight.set(0,F.height*.5,0),i.rectArea[_]=ee,_++}else if(F.isPointLight){let ee=t.get(F);if(ee.color.copy(F.color).multiplyScalar(F.intensity*E),ee.distance=F.distance,ee.decay=F.decay,F.castShadow){let oe=F.shadow,k=n.get(F);k.shadowBias=oe.bias,k.shadowNormalBias=oe.normalBias,k.shadowRadius=oe.radius,k.shadowMapSize=oe.mapSize,k.shadowCameraNear=oe.camera.near,k.shadowCameraFar=oe.camera.far,i.pointShadow[m]=k,i.pointShadowMap[m]=ie,i.pointShadowMatrix[m]=F.shadow.matrix,D++}i.point[m]=ee,m++}else if(F.isHemisphereLight){let ee=t.get(F);ee.skyColor.copy(F.color).multiplyScalar(J*E),ee.groundColor.copy(F.groundColor).multiplyScalar(J*E),i.hemi[v]=ee,v++}}_>0&&(e.isWebGL2?r.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=_e.LTC_FLOAT_1,i.rectAreaLTC2=_e.LTC_FLOAT_2):(i.rectAreaLTC1=_e.LTC_HALF_1,i.rectAreaLTC2=_e.LTC_HALF_2):r.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=_e.LTC_FLOAT_1,i.rectAreaLTC2=_e.LTC_FLOAT_2):r.has("OES_texture_half_float_linear")===!0?(i.rectAreaLTC1=_e.LTC_HALF_1,i.rectAreaLTC2=_e.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),i.ambient[0]=f,i.ambient[1]=d,i.ambient[2]=g;let q=i.hash;(q.directionalLength!==x||q.pointLength!==m||q.spotLength!==p||q.rectAreaLength!==_||q.hemiLength!==v||q.numDirectionalShadows!==M||q.numPointShadows!==D||q.numSpotShadows!==C||q.numSpotMaps!==P||q.numLightProbes!==w)&&(i.directional.length=x,i.spot.length=p,i.rectArea.length=_,i.point.length=m,i.hemi.length=v,i.directionalShadow.length=M,i.directionalShadowMap.length=M,i.pointShadow.length=D,i.pointShadowMap.length=D,i.spotShadow.length=C,i.spotShadowMap.length=C,i.directionalShadowMatrix.length=M,i.pointShadowMatrix.length=D,i.spotLightMatrix.length=C+P-V,i.spotLightMap.length=P,i.numSpotLightShadowsWithMaps=V,i.numLightProbes=w,q.directionalLength=x,q.pointLength=m,q.spotLength=p,q.rectAreaLength=_,q.hemiLength=v,q.numDirectionalShadows=M,q.numPointShadows=D,q.numSpotShadows=C,q.numSpotMaps=P,q.numLightProbes=w,i.version=jv++)}function c(h,u){let f=0,d=0,g=0,x=0,m=0,p=u.matrixWorldInverse;for(let _=0,v=h.length;_<v;_++){let M=h[_];if(M.isDirectionalLight){let D=i.directional[f];D.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),D.direction.sub(s),D.direction.transformDirection(p),f++}else if(M.isSpotLight){let D=i.spot[g];D.position.setFromMatrixPosition(M.matrixWorld),D.position.applyMatrix4(p),D.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),D.direction.sub(s),D.direction.transformDirection(p),g++}else if(M.isRectAreaLight){let D=i.rectArea[x];D.position.setFromMatrixPosition(M.matrixWorld),D.position.applyMatrix4(p),o.identity(),a.copy(M.matrixWorld),a.premultiply(p),o.extractRotation(a),D.halfWidth.set(M.width*.5,0,0),D.halfHeight.set(0,M.height*.5,0),D.halfWidth.applyMatrix4(o),D.halfHeight.applyMatrix4(o),x++}else if(M.isPointLight){let D=i.point[d];D.position.setFromMatrixPosition(M.matrixWorld),D.position.applyMatrix4(p),d++}else if(M.isHemisphereLight){let D=i.hemi[m];D.direction.setFromMatrixPosition(M.matrixWorld),D.direction.transformDirection(p),m++}}}return{setup:l,setupView:c,state:i}}function Qu(r,e){let t=new e_(r,e),n=[],i=[];function s(){n.length=0,i.length=0}function a(u){n.push(u)}function o(u){i.push(u)}function l(u){t.setup(n,u)}function c(u){t.setupView(n,u)}return{init:s,state:{lightsArray:n,shadowsArray:i,lights:t},setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function t_(r,e){let t=new WeakMap;function n(s,a=0){let o=t.get(s),l;return o===void 0?(l=new Qu(r,e),t.set(s,[l])):a>=o.length?(l=new Qu(r,e),o.push(l)):l=o[a],l}function i(){t=new WeakMap}return{get:n,dispose:i}}var Hl=class extends an{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Zp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Vl=class extends an{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},n_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,i_=`uniform sampler2D shadow_pass;
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
}`;function s_(r,e,t){let n=new Cr,i=new pe,s=new pe,a=new dt,o=new Hl({depthPacking:Jp}),l=new Vl,c={},h=t.maxTextureSize,u={[Yn]:rn,[rn]:Yn,[Sn]:Sn},f=new fi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new pe},radius:{value:4}},vertexShader:n_,fragmentShader:i_}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let g=new Dt;g.setAttribute("position",new Ht(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new gt(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ef;let p=this.type;this.render=function(C,P,V){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||C.length===0)return;let w=r.getRenderTarget(),E=r.getActiveCubeFace(),q=r.getActiveMipmapLevel(),Q=r.state;Q.setBlending(Ti),Q.buffers.color.setClear(1,1,1,1),Q.buffers.depth.setTest(!0),Q.setScissorTest(!1);let le=p!==ri&&this.type===ri,F=p===ri&&this.type!==ri;for(let Y=0,J=C.length;Y<J;Y++){let ae=C[Y],ie=ae.shadow;if(ie===void 0){console.warn("THREE.WebGLShadowMap:",ae,"has no shadow.");continue}if(ie.autoUpdate===!1&&ie.needsUpdate===!1)continue;i.copy(ie.mapSize);let ee=ie.getFrameExtents();if(i.multiply(ee),s.copy(ie.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(s.x=Math.floor(h/ee.x),i.x=s.x*ee.x,ie.mapSize.x=s.x),i.y>h&&(s.y=Math.floor(h/ee.y),i.y=s.y*ee.y,ie.mapSize.y=s.y)),ie.map===null||le===!0||F===!0){let k=this.type!==ri?{minFilter:kt,magFilter:kt}:{};ie.map!==null&&ie.map.dispose(),ie.map=new ui(i.x,i.y,k),ie.map.texture.name=ae.name+".shadowMap",ie.camera.updateProjectionMatrix()}r.setRenderTarget(ie.map),r.clear();let oe=ie.getViewportCount();for(let k=0;k<oe;k++){let j=ie.getViewport(k);a.set(s.x*j.x,s.y*j.y,s.x*j.z,s.y*j.w),Q.viewport(a),ie.updateMatrices(ae,k),n=ie.getFrustum(),M(P,V,ie.camera,ae,this.type)}ie.isPointLightShadow!==!0&&this.type===ri&&_(ie,V),ie.needsUpdate=!1}p=this.type,m.needsUpdate=!1,r.setRenderTarget(w,E,q)};function _(C,P){let V=e.update(x);f.defines.VSM_SAMPLES!==C.blurSamples&&(f.defines.VSM_SAMPLES=C.blurSamples,d.defines.VSM_SAMPLES=C.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new ui(i.x,i.y)),f.uniforms.shadow_pass.value=C.map.texture,f.uniforms.resolution.value=C.mapSize,f.uniforms.radius.value=C.radius,r.setRenderTarget(C.mapPass),r.clear(),r.renderBufferDirect(P,null,V,f,x,null),d.uniforms.shadow_pass.value=C.mapPass.texture,d.uniforms.resolution.value=C.mapSize,d.uniforms.radius.value=C.radius,r.setRenderTarget(C.map),r.clear(),r.renderBufferDirect(P,null,V,d,x,null)}function v(C,P,V,w){let E=null,q=V.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(q!==void 0)E=q;else if(E=V.isPointLight===!0?l:o,r.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0){let Q=E.uuid,le=P.uuid,F=c[Q];F===void 0&&(F={},c[Q]=F);let Y=F[le];Y===void 0&&(Y=E.clone(),F[le]=Y,P.addEventListener("dispose",D)),E=Y}if(E.visible=P.visible,E.wireframe=P.wireframe,w===ri?E.side=P.shadowSide!==null?P.shadowSide:P.side:E.side=P.shadowSide!==null?P.shadowSide:u[P.side],E.alphaMap=P.alphaMap,E.alphaTest=P.alphaTest,E.map=P.map,E.clipShadows=P.clipShadows,E.clippingPlanes=P.clippingPlanes,E.clipIntersection=P.clipIntersection,E.displacementMap=P.displacementMap,E.displacementScale=P.displacementScale,E.displacementBias=P.displacementBias,E.wireframeLinewidth=P.wireframeLinewidth,E.linewidth=P.linewidth,V.isPointLight===!0&&E.isMeshDistanceMaterial===!0){let Q=r.properties.get(E);Q.light=V}return E}function M(C,P,V,w,E){if(C.visible===!1)return;if(C.layers.test(P.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&E===ri)&&(!C.frustumCulled||n.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,C.matrixWorld);let le=e.update(C),F=C.material;if(Array.isArray(F)){let Y=le.groups;for(let J=0,ae=Y.length;J<ae;J++){let ie=Y[J],ee=F[ie.materialIndex];if(ee&&ee.visible){let oe=v(C,ee,w,E);C.onBeforeShadow(r,C,P,V,le,oe,ie),r.renderBufferDirect(V,null,le,oe,C,ie),C.onAfterShadow(r,C,P,V,le,oe,ie)}}}else if(F.visible){let Y=v(C,F,w,E);C.onBeforeShadow(r,C,P,V,le,Y,null),r.renderBufferDirect(V,null,le,Y,C,null),C.onAfterShadow(r,C,P,V,le,Y,null)}}let Q=C.children;for(let le=0,F=Q.length;le<F;le++)M(Q[le],P,V,w,E)}function D(C){C.target.removeEventListener("dispose",D);for(let V in c){let w=c[V],E=C.target.uuid;E in w&&(w[E].dispose(),delete w[E])}}}function r_(r,e,t){let n=t.isWebGL2;function i(){let S=!1,z=new dt,B=null,G=new dt(0,0,0,0);return{setMask:function(re){B!==re&&!S&&(r.colorMask(re,re,re,re),B=re)},setLocked:function(re){S=re},setClear:function(re,ye,Ae,Ue,De){De===!0&&(re*=Ue,ye*=Ue,Ae*=Ue),z.set(re,ye,Ae,Ue),G.equals(z)===!1&&(r.clearColor(re,ye,Ae,Ue),G.copy(z))},reset:function(){S=!1,B=null,G.set(-1,0,0,0)}}}function s(){let S=!1,z=null,B=null,G=null;return{setTest:function(re){re?He(r.DEPTH_TEST):Ne(r.DEPTH_TEST)},setMask:function(re){z!==re&&!S&&(r.depthMask(re),z=re)},setFunc:function(re){if(B!==re){switch(re){case Sp:r.depthFunc(r.NEVER);break;case wp:r.depthFunc(r.ALWAYS);break;case bp:r.depthFunc(r.LESS);break;case Pa:r.depthFunc(r.LEQUAL);break;case Tp:r.depthFunc(r.EQUAL);break;case Ep:r.depthFunc(r.GEQUAL);break;case Ap:r.depthFunc(r.GREATER);break;case Rp:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}B=re}},setLocked:function(re){S=re},setClear:function(re){G!==re&&(r.clearDepth(re),G=re)},reset:function(){S=!1,z=null,B=null,G=null}}}function a(){let S=!1,z=null,B=null,G=null,re=null,ye=null,Ae=null,Ue=null,De=null;return{setTest:function(be){S||(be?He(r.STENCIL_TEST):Ne(r.STENCIL_TEST))},setMask:function(be){z!==be&&!S&&(r.stencilMask(be),z=be)},setFunc:function(be,Ce,$e){(B!==be||G!==Ce||re!==$e)&&(r.stencilFunc(be,Ce,$e),B=be,G=Ce,re=$e)},setOp:function(be,Ce,$e){(ye!==be||Ae!==Ce||Ue!==$e)&&(r.stencilOp(be,Ce,$e),ye=be,Ae=Ce,Ue=$e)},setLocked:function(be){S=be},setClear:function(be){De!==be&&(r.clearStencil(be),De=be)},reset:function(){S=!1,z=null,B=null,G=null,re=null,ye=null,Ae=null,Ue=null,De=null}}}let o=new i,l=new s,c=new a,h=new WeakMap,u=new WeakMap,f={},d={},g=new WeakMap,x=[],m=null,p=!1,_=null,v=null,M=null,D=null,C=null,P=null,V=null,w=new Re(0,0,0),E=0,q=!1,Q=null,le=null,F=null,Y=null,J=null,ae=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS),ie=!1,ee=0,oe=r.getParameter(r.VERSION);oe.indexOf("WebGL")!==-1?(ee=parseFloat(/^WebGL (\d)/.exec(oe)[1]),ie=ee>=1):oe.indexOf("OpenGL ES")!==-1&&(ee=parseFloat(/^OpenGL ES (\d)/.exec(oe)[1]),ie=ee>=2);let k=null,j={},W=r.getParameter(r.SCISSOR_BOX),se=r.getParameter(r.VIEWPORT),ge=new dt().fromArray(W),Me=new dt().fromArray(se);function Se(S,z,B,G){let re=new Uint8Array(4),ye=r.createTexture();r.bindTexture(S,ye),r.texParameteri(S,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(S,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let Ae=0;Ae<B;Ae++)n&&(S===r.TEXTURE_3D||S===r.TEXTURE_2D_ARRAY)?r.texImage3D(z,0,r.RGBA,1,1,G,0,r.RGBA,r.UNSIGNED_BYTE,re):r.texImage2D(z+Ae,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,re);return ye}let Fe={};Fe[r.TEXTURE_2D]=Se(r.TEXTURE_2D,r.TEXTURE_2D,1),Fe[r.TEXTURE_CUBE_MAP]=Se(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(Fe[r.TEXTURE_2D_ARRAY]=Se(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),Fe[r.TEXTURE_3D]=Se(r.TEXTURE_3D,r.TEXTURE_3D,1,1)),o.setClear(0,0,0,1),l.setClear(1),c.setClear(0),He(r.DEPTH_TEST),l.setFunc(Pa),we(!1),T(Oh),He(r.CULL_FACE),ne(Ti);function He(S){f[S]!==!0&&(r.enable(S),f[S]=!0)}function Ne(S){f[S]!==!1&&(r.disable(S),f[S]=!1)}function Be(S,z){return d[S]!==z?(r.bindFramebuffer(S,z),d[S]=z,n&&(S===r.DRAW_FRAMEBUFFER&&(d[r.FRAMEBUFFER]=z),S===r.FRAMEBUFFER&&(d[r.DRAW_FRAMEBUFFER]=z)),!0):!1}function L(S,z){let B=x,G=!1;if(S)if(B=g.get(z),B===void 0&&(B=[],g.set(z,B)),S.isWebGLMultipleRenderTargets){let re=S.texture;if(B.length!==re.length||B[0]!==r.COLOR_ATTACHMENT0){for(let ye=0,Ae=re.length;ye<Ae;ye++)B[ye]=r.COLOR_ATTACHMENT0+ye;B.length=re.length,G=!0}}else B[0]!==r.COLOR_ATTACHMENT0&&(B[0]=r.COLOR_ATTACHMENT0,G=!0);else B[0]!==r.BACK&&(B[0]=r.BACK,G=!0);G&&(t.isWebGL2?r.drawBuffers(B):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(B))}function me(S){return m!==S?(r.useProgram(S),m=S,!0):!1}let te={[Ki]:r.FUNC_ADD,[op]:r.FUNC_SUBTRACT,[lp]:r.FUNC_REVERSE_SUBTRACT};if(n)te[kh]=r.MIN,te[Hh]=r.MAX;else{let S=e.get("EXT_blend_minmax");S!==null&&(te[kh]=S.MIN_EXT,te[Hh]=S.MAX_EXT)}let de={[cp]:r.ZERO,[hp]:r.ONE,[up]:r.SRC_COLOR,[Tl]:r.SRC_ALPHA,[xp]:r.SRC_ALPHA_SATURATE,[mp]:r.DST_COLOR,[dp]:r.DST_ALPHA,[fp]:r.ONE_MINUS_SRC_COLOR,[El]:r.ONE_MINUS_SRC_ALPHA,[gp]:r.ONE_MINUS_DST_COLOR,[pp]:r.ONE_MINUS_DST_ALPHA,[vp]:r.CONSTANT_COLOR,[_p]:r.ONE_MINUS_CONSTANT_COLOR,[yp]:r.CONSTANT_ALPHA,[Mp]:r.ONE_MINUS_CONSTANT_ALPHA};function ne(S,z,B,G,re,ye,Ae,Ue,De,be){if(S===Ti){p===!0&&(Ne(r.BLEND),p=!1);return}if(p===!1&&(He(r.BLEND),p=!0),S!==ap){if(S!==_||be!==q){if((v!==Ki||C!==Ki)&&(r.blendEquation(r.FUNC_ADD),v=Ki,C=Ki),be)switch(S){case Ei:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case ci:r.blendFunc(r.ONE,r.ONE);break;case Bh:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case zh:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",S);break}else switch(S){case Ei:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case ci:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case Bh:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case zh:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",S);break}M=null,D=null,P=null,V=null,w.set(0,0,0),E=0,_=S,q=be}return}re=re||z,ye=ye||B,Ae=Ae||G,(z!==v||re!==C)&&(r.blendEquationSeparate(te[z],te[re]),v=z,C=re),(B!==M||G!==D||ye!==P||Ae!==V)&&(r.blendFuncSeparate(de[B],de[G],de[ye],de[Ae]),M=B,D=G,P=ye,V=Ae),(Ue.equals(w)===!1||De!==E)&&(r.blendColor(Ue.r,Ue.g,Ue.b,De),w.copy(Ue),E=De),_=S,q=!1}function Oe(S,z){S.side===Sn?Ne(r.CULL_FACE):He(r.CULL_FACE);let B=S.side===rn;z&&(B=!B),we(B),S.blending===Ei&&S.transparent===!1?ne(Ti):ne(S.blending,S.blendEquation,S.blendSrc,S.blendDst,S.blendEquationAlpha,S.blendSrcAlpha,S.blendDstAlpha,S.blendColor,S.blendAlpha,S.premultipliedAlpha),l.setFunc(S.depthFunc),l.setTest(S.depthTest),l.setMask(S.depthWrite),o.setMask(S.colorWrite);let G=S.stencilWrite;c.setTest(G),G&&(c.setMask(S.stencilWriteMask),c.setFunc(S.stencilFunc,S.stencilRef,S.stencilFuncMask),c.setOp(S.stencilFail,S.stencilZFail,S.stencilZPass)),X(S.polygonOffset,S.polygonOffsetFactor,S.polygonOffsetUnits),S.alphaToCoverage===!0?He(r.SAMPLE_ALPHA_TO_COVERAGE):Ne(r.SAMPLE_ALPHA_TO_COVERAGE)}function we(S){Q!==S&&(S?r.frontFace(r.CW):r.frontFace(r.CCW),Q=S)}function T(S){S!==sp?(He(r.CULL_FACE),S!==le&&(S===Oh?r.cullFace(r.BACK):S===rp?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):Ne(r.CULL_FACE),le=S}function y(S){S!==F&&(ie&&r.lineWidth(S),F=S)}function X(S,z,B){S?(He(r.POLYGON_OFFSET_FILL),(Y!==z||J!==B)&&(r.polygonOffset(z,B),Y=z,J=B)):Ne(r.POLYGON_OFFSET_FILL)}function ue(S){S?He(r.SCISSOR_TEST):Ne(r.SCISSOR_TEST)}function ce(S){S===void 0&&(S=r.TEXTURE0+ae-1),k!==S&&(r.activeTexture(S),k=S)}function he(S,z,B){B===void 0&&(k===null?B=r.TEXTURE0+ae-1:B=k);let G=j[B];G===void 0&&(G={type:void 0,texture:void 0},j[B]=G),(G.type!==S||G.texture!==z)&&(k!==B&&(r.activeTexture(B),k=B),r.bindTexture(S,z||Fe[S]),G.type=S,G.texture=z)}function Ee(){let S=j[k];S!==void 0&&S.type!==void 0&&(r.bindTexture(S.type,null),S.type=void 0,S.texture=void 0)}function ve(){try{r.compressedTexImage2D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function Pe(){try{r.compressedTexImage3D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function Ve(){try{r.texSubImage2D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function Ye(){try{r.texSubImage3D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function fe(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function ht(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function et(){try{r.texStorage2D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function Xe(){try{r.texStorage3D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function ke(){try{r.texImage2D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function Le(){try{r.texImage3D.apply(r,arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function Ke(S){ge.equals(S)===!1&&(r.scissor(S.x,S.y,S.z,S.w),ge.copy(S))}function A(S){Me.equals(S)===!1&&(r.viewport(S.x,S.y,S.z,S.w),Me.copy(S))}function I(S,z){let B=u.get(z);B===void 0&&(B=new WeakMap,u.set(z,B));let G=B.get(S);G===void 0&&(G=r.getUniformBlockIndex(z,S.name),B.set(S,G))}function U(S,z){let G=u.get(z).get(S);h.get(z)!==G&&(r.uniformBlockBinding(z,G,S.__bindingPointIndex),h.set(z,G))}function O(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),n===!0&&(r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null)),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),f={},k=null,j={},d={},g=new WeakMap,x=[],m=null,p=!1,_=null,v=null,M=null,D=null,C=null,P=null,V=null,w=new Re(0,0,0),E=0,q=!1,Q=null,le=null,F=null,Y=null,J=null,ge.set(0,0,r.canvas.width,r.canvas.height),Me.set(0,0,r.canvas.width,r.canvas.height),o.reset(),l.reset(),c.reset()}return{buffers:{color:o,depth:l,stencil:c},enable:He,disable:Ne,bindFramebuffer:Be,drawBuffers:L,useProgram:me,setBlending:ne,setMaterial:Oe,setFlipSided:we,setCullFace:T,setLineWidth:y,setPolygonOffset:X,setScissorTest:ue,activeTexture:ce,bindTexture:he,unbindTexture:Ee,compressedTexImage2D:ve,compressedTexImage3D:Pe,texImage2D:ke,texImage3D:Le,updateUBOMapping:I,uniformBlockBinding:U,texStorage2D:et,texStorage3D:Xe,texSubImage2D:Ve,texSubImage3D:Ye,compressedTexSubImage2D:fe,compressedTexSubImage3D:ht,scissor:Ke,viewport:A,reset:O}}function a_(r,e,t,n,i,s,a){let o=i.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new WeakMap,u,f=new WeakMap,d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,y){return d?new OffscreenCanvas(T,y):Rr("canvas")}function x(T,y,X,ue){let ce=1;if((T.width>ue||T.height>ue)&&(ce=ue/Math.max(T.width,T.height)),ce<1||y===!0)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap){let he=y?Oa:Math.floor,Ee=he(ce*T.width),ve=he(ce*T.height);u===void 0&&(u=g(Ee,ve));let Pe=X?g(Ee,ve):u;return Pe.width=Ee,Pe.height=ve,Pe.getContext("2d").drawImage(T,0,0,Ee,ve),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+T.width+"x"+T.height+") to ("+Ee+"x"+ve+")."),Pe}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+T.width+"x"+T.height+")."),T;return T}function m(T){return Pl(T.width)&&Pl(T.height)}function p(T){return o?!1:T.wrapS!==sn||T.wrapT!==sn||T.minFilter!==kt&&T.minFilter!==hn}function _(T,y){return T.generateMipmaps&&y&&T.minFilter!==kt&&T.minFilter!==hn}function v(T){r.generateMipmap(T)}function M(T,y,X,ue,ce=!1){if(o===!1)return y;if(T!==null){if(r[T]!==void 0)return r[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let he=y;if(y===r.RED&&(X===r.FLOAT&&(he=r.R32F),X===r.HALF_FLOAT&&(he=r.R16F),X===r.UNSIGNED_BYTE&&(he=r.R8)),y===r.RED_INTEGER&&(X===r.UNSIGNED_BYTE&&(he=r.R8UI),X===r.UNSIGNED_SHORT&&(he=r.R16UI),X===r.UNSIGNED_INT&&(he=r.R32UI),X===r.BYTE&&(he=r.R8I),X===r.SHORT&&(he=r.R16I),X===r.INT&&(he=r.R32I)),y===r.RG&&(X===r.FLOAT&&(he=r.RG32F),X===r.HALF_FLOAT&&(he=r.RG16F),X===r.UNSIGNED_BYTE&&(he=r.RG8)),y===r.RGBA){let Ee=ce?Da:xt.getTransfer(ue);X===r.FLOAT&&(he=r.RGBA32F),X===r.HALF_FLOAT&&(he=r.RGBA16F),X===r.UNSIGNED_BYTE&&(he=Ee===Rt?r.SRGB8_ALPHA8:r.RGBA8),X===r.UNSIGNED_SHORT_4_4_4_4&&(he=r.RGBA4),X===r.UNSIGNED_SHORT_5_5_5_1&&(he=r.RGB5_A1)}return(he===r.R16F||he===r.R32F||he===r.RG16F||he===r.RG32F||he===r.RGBA16F||he===r.RGBA32F)&&e.get("EXT_color_buffer_float"),he}function D(T,y,X){return _(T,X)===!0||T.isFramebufferTexture&&T.minFilter!==kt&&T.minFilter!==hn?Math.log2(Math.max(y.width,y.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?y.mipmaps.length:1}function C(T){return T===kt||T===La||T===_r?r.NEAREST:r.LINEAR}function P(T){let y=T.target;y.removeEventListener("dispose",P),w(y),y.isVideoTexture&&h.delete(y)}function V(T){let y=T.target;y.removeEventListener("dispose",V),q(y)}function w(T){let y=n.get(T);if(y.__webglInit===void 0)return;let X=T.source,ue=f.get(X);if(ue){let ce=ue[y.__cacheKey];ce.usedTimes--,ce.usedTimes===0&&E(T),Object.keys(ue).length===0&&f.delete(X)}n.remove(T)}function E(T){let y=n.get(T);r.deleteTexture(y.__webglTexture);let X=T.source,ue=f.get(X);delete ue[y.__cacheKey],a.memory.textures--}function q(T){let y=T.texture,X=n.get(T),ue=n.get(y);if(ue.__webglTexture!==void 0&&(r.deleteTexture(ue.__webglTexture),a.memory.textures--),T.depthTexture&&T.depthTexture.dispose(),T.isWebGLCubeRenderTarget)for(let ce=0;ce<6;ce++){if(Array.isArray(X.__webglFramebuffer[ce]))for(let he=0;he<X.__webglFramebuffer[ce].length;he++)r.deleteFramebuffer(X.__webglFramebuffer[ce][he]);else r.deleteFramebuffer(X.__webglFramebuffer[ce]);X.__webglDepthbuffer&&r.deleteRenderbuffer(X.__webglDepthbuffer[ce])}else{if(Array.isArray(X.__webglFramebuffer))for(let ce=0;ce<X.__webglFramebuffer.length;ce++)r.deleteFramebuffer(X.__webglFramebuffer[ce]);else r.deleteFramebuffer(X.__webglFramebuffer);if(X.__webglDepthbuffer&&r.deleteRenderbuffer(X.__webglDepthbuffer),X.__webglMultisampledFramebuffer&&r.deleteFramebuffer(X.__webglMultisampledFramebuffer),X.__webglColorRenderbuffer)for(let ce=0;ce<X.__webglColorRenderbuffer.length;ce++)X.__webglColorRenderbuffer[ce]&&r.deleteRenderbuffer(X.__webglColorRenderbuffer[ce]);X.__webglDepthRenderbuffer&&r.deleteRenderbuffer(X.__webglDepthRenderbuffer)}if(T.isWebGLMultipleRenderTargets)for(let ce=0,he=y.length;ce<he;ce++){let Ee=n.get(y[ce]);Ee.__webglTexture&&(r.deleteTexture(Ee.__webglTexture),a.memory.textures--),n.remove(y[ce])}n.remove(y),n.remove(T)}let Q=0;function le(){Q=0}function F(){let T=Q;return T>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+i.maxTextures),Q+=1,T}function Y(T){let y=[];return y.push(T.wrapS),y.push(T.wrapT),y.push(T.wrapR||0),y.push(T.magFilter),y.push(T.minFilter),y.push(T.anisotropy),y.push(T.internalFormat),y.push(T.format),y.push(T.type),y.push(T.generateMipmaps),y.push(T.premultiplyAlpha),y.push(T.flipY),y.push(T.unpackAlignment),y.push(T.colorSpace),y.join()}function J(T,y){let X=n.get(T);if(T.isVideoTexture&&Oe(T),T.isRenderTargetTexture===!1&&T.version>0&&X.__version!==T.version){let ue=T.image;if(ue===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ue.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ge(X,T,y);return}}t.bindTexture(r.TEXTURE_2D,X.__webglTexture,r.TEXTURE0+y)}function ae(T,y){let X=n.get(T);if(T.version>0&&X.__version!==T.version){ge(X,T,y);return}t.bindTexture(r.TEXTURE_2D_ARRAY,X.__webglTexture,r.TEXTURE0+y)}function ie(T,y){let X=n.get(T);if(T.version>0&&X.__version!==T.version){ge(X,T,y);return}t.bindTexture(r.TEXTURE_3D,X.__webglTexture,r.TEXTURE0+y)}function ee(T,y){let X=n.get(T);if(T.version>0&&X.__version!==T.version){Me(X,T,y);return}t.bindTexture(r.TEXTURE_CUBE_MAP,X.__webglTexture,r.TEXTURE0+y)}let oe={[mn]:r.REPEAT,[sn]:r.CLAMP_TO_EDGE,[Er]:r.MIRRORED_REPEAT},k={[kt]:r.NEAREST,[La]:r.NEAREST_MIPMAP_NEAREST,[_r]:r.NEAREST_MIPMAP_LINEAR,[hn]:r.LINEAR,[gc]:r.LINEAR_MIPMAP_NEAREST,[Ci]:r.LINEAR_MIPMAP_LINEAR},j={[jp]:r.NEVER,[sm]:r.ALWAYS,[Qp]:r.LESS,[Of]:r.LEQUAL,[em]:r.EQUAL,[im]:r.GEQUAL,[tm]:r.GREATER,[nm]:r.NOTEQUAL};function W(T,y,X){if(X?(r.texParameteri(T,r.TEXTURE_WRAP_S,oe[y.wrapS]),r.texParameteri(T,r.TEXTURE_WRAP_T,oe[y.wrapT]),(T===r.TEXTURE_3D||T===r.TEXTURE_2D_ARRAY)&&r.texParameteri(T,r.TEXTURE_WRAP_R,oe[y.wrapR]),r.texParameteri(T,r.TEXTURE_MAG_FILTER,k[y.magFilter]),r.texParameteri(T,r.TEXTURE_MIN_FILTER,k[y.minFilter])):(r.texParameteri(T,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(T,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),(T===r.TEXTURE_3D||T===r.TEXTURE_2D_ARRAY)&&r.texParameteri(T,r.TEXTURE_WRAP_R,r.CLAMP_TO_EDGE),(y.wrapS!==sn||y.wrapT!==sn)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),r.texParameteri(T,r.TEXTURE_MAG_FILTER,C(y.magFilter)),r.texParameteri(T,r.TEXTURE_MIN_FILTER,C(y.minFilter)),y.minFilter!==kt&&y.minFilter!==hn&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),y.compareFunction&&(r.texParameteri(T,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(T,r.TEXTURE_COMPARE_FUNC,j[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){let ue=e.get("EXT_texture_filter_anisotropic");if(y.magFilter===kt||y.minFilter!==_r&&y.minFilter!==Ci||y.type===oi&&e.has("OES_texture_float_linear")===!1||o===!1&&y.type===Ar&&e.has("OES_texture_half_float_linear")===!1)return;(y.anisotropy>1||n.get(y).__currentAnisotropy)&&(r.texParameterf(T,ue.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,i.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy)}}function se(T,y){let X=!1;T.__webglInit===void 0&&(T.__webglInit=!0,y.addEventListener("dispose",P));let ue=y.source,ce=f.get(ue);ce===void 0&&(ce={},f.set(ue,ce));let he=Y(y);if(he!==T.__cacheKey){ce[he]===void 0&&(ce[he]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,X=!0),ce[he].usedTimes++;let Ee=ce[T.__cacheKey];Ee!==void 0&&(ce[T.__cacheKey].usedTimes--,Ee.usedTimes===0&&E(y)),T.__cacheKey=he,T.__webglTexture=ce[he].texture}return X}function ge(T,y,X){let ue=r.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(ue=r.TEXTURE_2D_ARRAY),y.isData3DTexture&&(ue=r.TEXTURE_3D);let ce=se(T,y),he=y.source;t.bindTexture(ue,T.__webglTexture,r.TEXTURE0+X);let Ee=n.get(he);if(he.version!==Ee.__version||ce===!0){t.activeTexture(r.TEXTURE0+X);let ve=xt.getPrimaries(xt.workingColorSpace),Pe=y.colorSpace===pn?null:xt.getPrimaries(y.colorSpace),Ve=y.colorSpace===pn||ve===Pe?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,y.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,y.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ve);let Ye=p(y)&&m(y.image)===!1,fe=x(y.image,Ye,!1,i.maxTextureSize);fe=we(y,fe);let ht=m(fe)||o,et=s.convert(y.format,y.colorSpace),Xe=s.convert(y.type),ke=M(y.internalFormat,et,Xe,y.colorSpace,y.isVideoTexture);W(ue,y,ht);let Le,Ke=y.mipmaps,A=o&&y.isVideoTexture!==!0&&ke!==Uf,I=Ee.__version===void 0||ce===!0,U=D(y,fe,ht);if(y.isDepthTexture)ke=r.DEPTH_COMPONENT,o?y.type===oi?ke=r.DEPTH_COMPONENT32F:y.type===wi?ke=r.DEPTH_COMPONENT24:y.type===$i?ke=r.DEPTH24_STENCIL8:ke=r.DEPTH_COMPONENT16:y.type===oi&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),y.format===ji&&ke===r.DEPTH_COMPONENT&&y.type!==xc&&y.type!==wi&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),y.type=wi,Xe=s.convert(y.type)),y.format===Gs&&ke===r.DEPTH_COMPONENT&&(ke=r.DEPTH_STENCIL,y.type!==$i&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),y.type=$i,Xe=s.convert(y.type))),I&&(A?t.texStorage2D(r.TEXTURE_2D,1,ke,fe.width,fe.height):t.texImage2D(r.TEXTURE_2D,0,ke,fe.width,fe.height,0,et,Xe,null));else if(y.isDataTexture)if(Ke.length>0&&ht){A&&I&&t.texStorage2D(r.TEXTURE_2D,U,ke,Ke[0].width,Ke[0].height);for(let O=0,S=Ke.length;O<S;O++)Le=Ke[O],A?t.texSubImage2D(r.TEXTURE_2D,O,0,0,Le.width,Le.height,et,Xe,Le.data):t.texImage2D(r.TEXTURE_2D,O,ke,Le.width,Le.height,0,et,Xe,Le.data);y.generateMipmaps=!1}else A?(I&&t.texStorage2D(r.TEXTURE_2D,U,ke,fe.width,fe.height),t.texSubImage2D(r.TEXTURE_2D,0,0,0,fe.width,fe.height,et,Xe,fe.data)):t.texImage2D(r.TEXTURE_2D,0,ke,fe.width,fe.height,0,et,Xe,fe.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){A&&I&&t.texStorage3D(r.TEXTURE_2D_ARRAY,U,ke,Ke[0].width,Ke[0].height,fe.depth);for(let O=0,S=Ke.length;O<S;O++)Le=Ke[O],y.format!==Cn?et!==null?A?t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,O,0,0,0,Le.width,Le.height,fe.depth,et,Le.data,0,0):t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,O,ke,Le.width,Le.height,fe.depth,0,Le.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):A?t.texSubImage3D(r.TEXTURE_2D_ARRAY,O,0,0,0,Le.width,Le.height,fe.depth,et,Xe,Le.data):t.texImage3D(r.TEXTURE_2D_ARRAY,O,ke,Le.width,Le.height,fe.depth,0,et,Xe,Le.data)}else{A&&I&&t.texStorage2D(r.TEXTURE_2D,U,ke,Ke[0].width,Ke[0].height);for(let O=0,S=Ke.length;O<S;O++)Le=Ke[O],y.format!==Cn?et!==null?A?t.compressedTexSubImage2D(r.TEXTURE_2D,O,0,0,Le.width,Le.height,et,Le.data):t.compressedTexImage2D(r.TEXTURE_2D,O,ke,Le.width,Le.height,0,Le.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):A?t.texSubImage2D(r.TEXTURE_2D,O,0,0,Le.width,Le.height,et,Xe,Le.data):t.texImage2D(r.TEXTURE_2D,O,ke,Le.width,Le.height,0,et,Xe,Le.data)}else if(y.isDataArrayTexture)A?(I&&t.texStorage3D(r.TEXTURE_2D_ARRAY,U,ke,fe.width,fe.height,fe.depth),t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,fe.width,fe.height,fe.depth,et,Xe,fe.data)):t.texImage3D(r.TEXTURE_2D_ARRAY,0,ke,fe.width,fe.height,fe.depth,0,et,Xe,fe.data);else if(y.isData3DTexture)A?(I&&t.texStorage3D(r.TEXTURE_3D,U,ke,fe.width,fe.height,fe.depth),t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,fe.width,fe.height,fe.depth,et,Xe,fe.data)):t.texImage3D(r.TEXTURE_3D,0,ke,fe.width,fe.height,fe.depth,0,et,Xe,fe.data);else if(y.isFramebufferTexture){if(I)if(A)t.texStorage2D(r.TEXTURE_2D,U,ke,fe.width,fe.height);else{let O=fe.width,S=fe.height;for(let z=0;z<U;z++)t.texImage2D(r.TEXTURE_2D,z,ke,O,S,0,et,Xe,null),O>>=1,S>>=1}}else if(Ke.length>0&&ht){A&&I&&t.texStorage2D(r.TEXTURE_2D,U,ke,Ke[0].width,Ke[0].height);for(let O=0,S=Ke.length;O<S;O++)Le=Ke[O],A?t.texSubImage2D(r.TEXTURE_2D,O,0,0,et,Xe,Le):t.texImage2D(r.TEXTURE_2D,O,ke,et,Xe,Le);y.generateMipmaps=!1}else A?(I&&t.texStorage2D(r.TEXTURE_2D,U,ke,fe.width,fe.height),t.texSubImage2D(r.TEXTURE_2D,0,0,0,et,Xe,fe)):t.texImage2D(r.TEXTURE_2D,0,ke,et,Xe,fe);_(y,ht)&&v(ue),Ee.__version=he.version,y.onUpdate&&y.onUpdate(y)}T.__version=y.version}function Me(T,y,X){if(y.image.length!==6)return;let ue=se(T,y),ce=y.source;t.bindTexture(r.TEXTURE_CUBE_MAP,T.__webglTexture,r.TEXTURE0+X);let he=n.get(ce);if(ce.version!==he.__version||ue===!0){t.activeTexture(r.TEXTURE0+X);let Ee=xt.getPrimaries(xt.workingColorSpace),ve=y.colorSpace===pn?null:xt.getPrimaries(y.colorSpace),Pe=y.colorSpace===pn||Ee===ve?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,y.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,y.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Pe);let Ve=y.isCompressedTexture||y.image[0].isCompressedTexture,Ye=y.image[0]&&y.image[0].isDataTexture,fe=[];for(let O=0;O<6;O++)!Ve&&!Ye?fe[O]=x(y.image[O],!1,!0,i.maxCubemapSize):fe[O]=Ye?y.image[O].image:y.image[O],fe[O]=we(y,fe[O]);let ht=fe[0],et=m(ht)||o,Xe=s.convert(y.format,y.colorSpace),ke=s.convert(y.type),Le=M(y.internalFormat,Xe,ke,y.colorSpace),Ke=o&&y.isVideoTexture!==!0,A=he.__version===void 0||ue===!0,I=D(y,ht,et);W(r.TEXTURE_CUBE_MAP,y,et);let U;if(Ve){Ke&&A&&t.texStorage2D(r.TEXTURE_CUBE_MAP,I,Le,ht.width,ht.height);for(let O=0;O<6;O++){U=fe[O].mipmaps;for(let S=0;S<U.length;S++){let z=U[S];y.format!==Cn?Xe!==null?Ke?t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+O,S,0,0,z.width,z.height,Xe,z.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+O,S,Le,z.width,z.height,0,z.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ke?t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+O,S,0,0,z.width,z.height,Xe,ke,z.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+O,S,Le,z.width,z.height,0,Xe,ke,z.data)}}}else{U=y.mipmaps,Ke&&A&&(U.length>0&&I++,t.texStorage2D(r.TEXTURE_CUBE_MAP,I,Le,fe[0].width,fe[0].height));for(let O=0;O<6;O++)if(Ye){Ke?t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+O,0,0,0,fe[O].width,fe[O].height,Xe,ke,fe[O].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+O,0,Le,fe[O].width,fe[O].height,0,Xe,ke,fe[O].data);for(let S=0;S<U.length;S++){let B=U[S].image[O].image;Ke?t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+O,S+1,0,0,B.width,B.height,Xe,ke,B.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+O,S+1,Le,B.width,B.height,0,Xe,ke,B.data)}}else{Ke?t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+O,0,0,0,Xe,ke,fe[O]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+O,0,Le,Xe,ke,fe[O]);for(let S=0;S<U.length;S++){let z=U[S];Ke?t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+O,S+1,0,0,Xe,ke,z.image[O]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+O,S+1,Le,Xe,ke,z.image[O])}}}_(y,et)&&v(r.TEXTURE_CUBE_MAP),he.__version=ce.version,y.onUpdate&&y.onUpdate(y)}T.__version=y.version}function Se(T,y,X,ue,ce,he){let Ee=s.convert(X.format,X.colorSpace),ve=s.convert(X.type),Pe=M(X.internalFormat,Ee,ve,X.colorSpace);if(!n.get(y).__hasExternalTextures){let Ye=Math.max(1,y.width>>he),fe=Math.max(1,y.height>>he);ce===r.TEXTURE_3D||ce===r.TEXTURE_2D_ARRAY?t.texImage3D(ce,he,Pe,Ye,fe,y.depth,0,Ee,ve,null):t.texImage2D(ce,he,Pe,Ye,fe,0,Ee,ve,null)}t.bindFramebuffer(r.FRAMEBUFFER,T),ne(y)?l.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,ue,ce,n.get(X).__webglTexture,0,de(y)):(ce===r.TEXTURE_2D||ce>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&ce<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,ue,ce,n.get(X).__webglTexture,he),t.bindFramebuffer(r.FRAMEBUFFER,null)}function Fe(T,y,X){if(r.bindRenderbuffer(r.RENDERBUFFER,T),y.depthBuffer&&!y.stencilBuffer){let ue=o===!0?r.DEPTH_COMPONENT24:r.DEPTH_COMPONENT16;if(X||ne(y)){let ce=y.depthTexture;ce&&ce.isDepthTexture&&(ce.type===oi?ue=r.DEPTH_COMPONENT32F:ce.type===wi&&(ue=r.DEPTH_COMPONENT24));let he=de(y);ne(y)?l.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,he,ue,y.width,y.height):r.renderbufferStorageMultisample(r.RENDERBUFFER,he,ue,y.width,y.height)}else r.renderbufferStorage(r.RENDERBUFFER,ue,y.width,y.height);r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.RENDERBUFFER,T)}else if(y.depthBuffer&&y.stencilBuffer){let ue=de(y);X&&ne(y)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,ue,r.DEPTH24_STENCIL8,y.width,y.height):ne(y)?l.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ue,r.DEPTH24_STENCIL8,y.width,y.height):r.renderbufferStorage(r.RENDERBUFFER,r.DEPTH_STENCIL,y.width,y.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.RENDERBUFFER,T)}else{let ue=y.isWebGLMultipleRenderTargets===!0?y.texture:[y.texture];for(let ce=0;ce<ue.length;ce++){let he=ue[ce],Ee=s.convert(he.format,he.colorSpace),ve=s.convert(he.type),Pe=M(he.internalFormat,Ee,ve,he.colorSpace),Ve=de(y);X&&ne(y)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,Ve,Pe,y.width,y.height):ne(y)?l.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Ve,Pe,y.width,y.height):r.renderbufferStorage(r.RENDERBUFFER,Pe,y.width,y.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function He(T,y){if(y&&y.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(r.FRAMEBUFFER,T),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(y.depthTexture).__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),J(y.depthTexture,0);let ue=n.get(y.depthTexture).__webglTexture,ce=de(y);if(y.depthTexture.format===ji)ne(y)?l.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ue,0,ce):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ue,0);else if(y.depthTexture.format===Gs)ne(y)?l.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ue,0,ce):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ue,0);else throw new Error("Unknown depthTexture format")}function Ne(T){let y=n.get(T),X=T.isWebGLCubeRenderTarget===!0;if(T.depthTexture&&!y.__autoAllocateDepthBuffer){if(X)throw new Error("target.depthTexture not supported in Cube render targets");He(y.__webglFramebuffer,T)}else if(X){y.__webglDepthbuffer=[];for(let ue=0;ue<6;ue++)t.bindFramebuffer(r.FRAMEBUFFER,y.__webglFramebuffer[ue]),y.__webglDepthbuffer[ue]=r.createRenderbuffer(),Fe(y.__webglDepthbuffer[ue],T,!1)}else t.bindFramebuffer(r.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer=r.createRenderbuffer(),Fe(y.__webglDepthbuffer,T,!1);t.bindFramebuffer(r.FRAMEBUFFER,null)}function Be(T,y,X){let ue=n.get(T);y!==void 0&&Se(ue.__webglFramebuffer,T,T.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),X!==void 0&&Ne(T)}function L(T){let y=T.texture,X=n.get(T),ue=n.get(y);T.addEventListener("dispose",V),T.isWebGLMultipleRenderTargets!==!0&&(ue.__webglTexture===void 0&&(ue.__webglTexture=r.createTexture()),ue.__version=y.version,a.memory.textures++);let ce=T.isWebGLCubeRenderTarget===!0,he=T.isWebGLMultipleRenderTargets===!0,Ee=m(T)||o;if(ce){X.__webglFramebuffer=[];for(let ve=0;ve<6;ve++)if(o&&y.mipmaps&&y.mipmaps.length>0){X.__webglFramebuffer[ve]=[];for(let Pe=0;Pe<y.mipmaps.length;Pe++)X.__webglFramebuffer[ve][Pe]=r.createFramebuffer()}else X.__webglFramebuffer[ve]=r.createFramebuffer()}else{if(o&&y.mipmaps&&y.mipmaps.length>0){X.__webglFramebuffer=[];for(let ve=0;ve<y.mipmaps.length;ve++)X.__webglFramebuffer[ve]=r.createFramebuffer()}else X.__webglFramebuffer=r.createFramebuffer();if(he)if(i.drawBuffers){let ve=T.texture;for(let Pe=0,Ve=ve.length;Pe<Ve;Pe++){let Ye=n.get(ve[Pe]);Ye.__webglTexture===void 0&&(Ye.__webglTexture=r.createTexture(),a.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(o&&T.samples>0&&ne(T)===!1){let ve=he?y:[y];X.__webglMultisampledFramebuffer=r.createFramebuffer(),X.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,X.__webglMultisampledFramebuffer);for(let Pe=0;Pe<ve.length;Pe++){let Ve=ve[Pe];X.__webglColorRenderbuffer[Pe]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,X.__webglColorRenderbuffer[Pe]);let Ye=s.convert(Ve.format,Ve.colorSpace),fe=s.convert(Ve.type),ht=M(Ve.internalFormat,Ye,fe,Ve.colorSpace,T.isXRRenderTarget===!0),et=de(T);r.renderbufferStorageMultisample(r.RENDERBUFFER,et,ht,T.width,T.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Pe,r.RENDERBUFFER,X.__webglColorRenderbuffer[Pe])}r.bindRenderbuffer(r.RENDERBUFFER,null),T.depthBuffer&&(X.__webglDepthRenderbuffer=r.createRenderbuffer(),Fe(X.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(ce){t.bindTexture(r.TEXTURE_CUBE_MAP,ue.__webglTexture),W(r.TEXTURE_CUBE_MAP,y,Ee);for(let ve=0;ve<6;ve++)if(o&&y.mipmaps&&y.mipmaps.length>0)for(let Pe=0;Pe<y.mipmaps.length;Pe++)Se(X.__webglFramebuffer[ve][Pe],T,y,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+ve,Pe);else Se(X.__webglFramebuffer[ve],T,y,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0);_(y,Ee)&&v(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(he){let ve=T.texture;for(let Pe=0,Ve=ve.length;Pe<Ve;Pe++){let Ye=ve[Pe],fe=n.get(Ye);t.bindTexture(r.TEXTURE_2D,fe.__webglTexture),W(r.TEXTURE_2D,Ye,Ee),Se(X.__webglFramebuffer,T,Ye,r.COLOR_ATTACHMENT0+Pe,r.TEXTURE_2D,0),_(Ye,Ee)&&v(r.TEXTURE_2D)}t.unbindTexture()}else{let ve=r.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(o?ve=T.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(ve,ue.__webglTexture),W(ve,y,Ee),o&&y.mipmaps&&y.mipmaps.length>0)for(let Pe=0;Pe<y.mipmaps.length;Pe++)Se(X.__webglFramebuffer[Pe],T,y,r.COLOR_ATTACHMENT0,ve,Pe);else Se(X.__webglFramebuffer,T,y,r.COLOR_ATTACHMENT0,ve,0);_(y,Ee)&&v(ve),t.unbindTexture()}T.depthBuffer&&Ne(T)}function me(T){let y=m(T)||o,X=T.isWebGLMultipleRenderTargets===!0?T.texture:[T.texture];for(let ue=0,ce=X.length;ue<ce;ue++){let he=X[ue];if(_(he,y)){let Ee=T.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:r.TEXTURE_2D,ve=n.get(he).__webglTexture;t.bindTexture(Ee,ve),v(Ee),t.unbindTexture()}}}function te(T){if(o&&T.samples>0&&ne(T)===!1){let y=T.isWebGLMultipleRenderTargets?T.texture:[T.texture],X=T.width,ue=T.height,ce=r.COLOR_BUFFER_BIT,he=[],Ee=T.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ve=n.get(T),Pe=T.isWebGLMultipleRenderTargets===!0;if(Pe)for(let Ve=0;Ve<y.length;Ve++)t.bindFramebuffer(r.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ve,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,ve.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ve,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,ve.__webglMultisampledFramebuffer),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,ve.__webglFramebuffer);for(let Ve=0;Ve<y.length;Ve++){he.push(r.COLOR_ATTACHMENT0+Ve),T.depthBuffer&&he.push(Ee);let Ye=ve.__ignoreDepthValues!==void 0?ve.__ignoreDepthValues:!1;if(Ye===!1&&(T.depthBuffer&&(ce|=r.DEPTH_BUFFER_BIT),T.stencilBuffer&&(ce|=r.STENCIL_BUFFER_BIT)),Pe&&r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,ve.__webglColorRenderbuffer[Ve]),Ye===!0&&(r.invalidateFramebuffer(r.READ_FRAMEBUFFER,[Ee]),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[Ee])),Pe){let fe=n.get(y[Ve]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,fe,0)}r.blitFramebuffer(0,0,X,ue,0,0,X,ue,ce,r.NEAREST),c&&r.invalidateFramebuffer(r.READ_FRAMEBUFFER,he)}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),Pe)for(let Ve=0;Ve<y.length;Ve++){t.bindFramebuffer(r.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ve,r.RENDERBUFFER,ve.__webglColorRenderbuffer[Ve]);let Ye=n.get(y[Ve]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,ve.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ve,r.TEXTURE_2D,Ye,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,ve.__webglMultisampledFramebuffer)}}function de(T){return Math.min(i.maxSamples,T.samples)}function ne(T){let y=n.get(T);return o&&T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function Oe(T){let y=a.render.frame;h.get(T)!==y&&(h.set(T,y),T.update())}function we(T,y){let X=T.colorSpace,ue=T.format,ce=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||T.format===Cl||X!==Vt&&X!==pn&&(xt.getTransfer(X)===Rt?o===!1?e.has("EXT_sRGB")===!0&&ue===Cn?(T.format=Cl,T.minFilter=hn,T.generateMipmaps=!1):y=Ba.sRGBToLinear(y):(ue!==Cn||ce!==Ri)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",X)),y}this.allocateTextureUnit=F,this.resetTextureUnits=le,this.setTexture2D=J,this.setTexture2DArray=ae,this.setTexture3D=ie,this.setTextureCube=ee,this.rebindTextures=Be,this.setupRenderTarget=L,this.updateRenderTargetMipmap=me,this.updateMultisampleRenderTarget=te,this.setupDepthRenderbuffer=Ne,this.setupFrameBufferTexture=Se,this.useMultisampledRTT=ne}function o_(r,e,t){let n=t.isWebGL2;function i(s,a=pn){let o,l=xt.getTransfer(a);if(s===Ri)return r.UNSIGNED_BYTE;if(s===Cf)return r.UNSIGNED_SHORT_4_4_4_4;if(s===Pf)return r.UNSIGNED_SHORT_5_5_5_1;if(s===Op)return r.BYTE;if(s===Bp)return r.SHORT;if(s===xc)return r.UNSIGNED_SHORT;if(s===Rf)return r.INT;if(s===wi)return r.UNSIGNED_INT;if(s===oi)return r.FLOAT;if(s===Ar)return n?r.HALF_FLOAT:(o=e.get("OES_texture_half_float"),o!==null?o.HALF_FLOAT_OES:null);if(s===zp)return r.ALPHA;if(s===Cn)return r.RGBA;if(s===kp)return r.LUMINANCE;if(s===Hp)return r.LUMINANCE_ALPHA;if(s===ji)return r.DEPTH_COMPONENT;if(s===Gs)return r.DEPTH_STENCIL;if(s===Cl)return o=e.get("EXT_sRGB"),o!==null?o.SRGB_ALPHA_EXT:null;if(s===Vp)return r.RED;if(s===Lf)return r.RED_INTEGER;if(s===Gp)return r.RG;if(s===If)return r.RG_INTEGER;if(s===Df)return r.RGBA_INTEGER;if(s===Vo||s===Go||s===Wo||s===Xo)if(l===Rt)if(o=e.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(s===Vo)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===Go)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===Wo)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===Xo)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=e.get("WEBGL_compressed_texture_s3tc"),o!==null){if(s===Vo)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===Go)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===Wo)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===Xo)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===Gh||s===Wh||s===Xh||s===qh)if(o=e.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(s===Gh)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===Wh)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===Xh)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===qh)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===Uf)return o=e.get("WEBGL_compressed_texture_etc1"),o!==null?o.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===Yh||s===Kh)if(o=e.get("WEBGL_compressed_texture_etc"),o!==null){if(s===Yh)return l===Rt?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(s===Kh)return l===Rt?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===Zh||s===Jh||s===$h||s===jh||s===Qh||s===eu||s===tu||s===nu||s===iu||s===su||s===ru||s===au||s===ou||s===lu)if(o=e.get("WEBGL_compressed_texture_astc"),o!==null){if(s===Zh)return l===Rt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===Jh)return l===Rt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===$h)return l===Rt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===jh)return l===Rt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===Qh)return l===Rt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===eu)return l===Rt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===tu)return l===Rt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===nu)return l===Rt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===iu)return l===Rt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===su)return l===Rt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===ru)return l===Rt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===au)return l===Rt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===ou)return l===Rt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===lu)return l===Rt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===qo||s===cu||s===hu)if(o=e.get("EXT_texture_compression_bptc"),o!==null){if(s===qo)return l===Rt?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===cu)return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===hu)return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===Wp||s===uu||s===fu||s===du)if(o=e.get("EXT_texture_compression_rgtc"),o!==null){if(s===qo)return o.COMPRESSED_RED_RGTC1_EXT;if(s===uu)return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===fu)return o.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===du)return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===$i?n?r.UNSIGNED_INT_24_8:(o=e.get("WEBGL_depth_texture"),o!==null?o.UNSIGNED_INT_24_8_WEBGL:null):r[s]!==void 0?r[s]:null}return{convert:i}}var Gl=class extends Ft{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},At=class extends Mt{constructor(){super(),this.isGroup=!0,this.type="Group"}},l_={type:"move"},wr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new At,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new At,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new R,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new R),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new At,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new R,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new R),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,s=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let x of e.hand.values()){let m=t.getJointPose(x,n),p=this._getHandJoint(c,x);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),d=.02,g=.005;c.inputState.pinching&&f>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(l_)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new At;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Wl=class extends hi{constructor(e,t){super();let n=this,i=null,s=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,f=null,d=null,g=null,x=t.getContextAttributes(),m=null,p=null,_=[],v=[],M=new pe,D=null,C=new Ft;C.layers.enable(1),C.viewport=new dt;let P=new Ft;P.layers.enable(2),P.viewport=new dt;let V=[C,P],w=new Gl;w.layers.enable(1),w.layers.enable(2);let E=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let se=_[W];return se===void 0&&(se=new wr,_[W]=se),se.getTargetRaySpace()},this.getControllerGrip=function(W){let se=_[W];return se===void 0&&(se=new wr,_[W]=se),se.getGripSpace()},this.getHand=function(W){let se=_[W];return se===void 0&&(se=new wr,_[W]=se),se.getHandSpace()};function Q(W){let se=v.indexOf(W.inputSource);if(se===-1)return;let ge=_[se];ge!==void 0&&(ge.update(W.inputSource,W.frame,c||a),ge.dispatchEvent({type:W.type,data:W.inputSource}))}function le(){i.removeEventListener("select",Q),i.removeEventListener("selectstart",Q),i.removeEventListener("selectend",Q),i.removeEventListener("squeeze",Q),i.removeEventListener("squeezestart",Q),i.removeEventListener("squeezeend",Q),i.removeEventListener("end",le),i.removeEventListener("inputsourceschange",F);for(let W=0;W<_.length;W++){let se=v[W];se!==null&&(v[W]=null,_[W].disconnect(se))}E=null,q=null,e.setRenderTarget(m),d=null,f=null,u=null,i=null,p=null,j.stop(),n.isPresenting=!1,e.setPixelRatio(D),e.setSize(M.width,M.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){s=W,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){o=W,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(W){c=W},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(W){if(i=W,i!==null){if(m=e.getRenderTarget(),i.addEventListener("select",Q),i.addEventListener("selectstart",Q),i.addEventListener("selectend",Q),i.addEventListener("squeeze",Q),i.addEventListener("squeezestart",Q),i.addEventListener("squeezeend",Q),i.addEventListener("end",le),i.addEventListener("inputsourceschange",F),x.xrCompatible!==!0&&await t.makeXRCompatible(),D=e.getPixelRatio(),e.getSize(M),i.renderState.layers===void 0||e.capabilities.isWebGL2===!1){let se={antialias:i.renderState.layers===void 0?x.antialias:!0,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(i,t,se),i.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),p=new ui(d.framebufferWidth,d.framebufferHeight,{format:Cn,type:Ri,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil})}else{let se=null,ge=null,Me=null;x.depth&&(Me=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,se=x.stencil?Gs:ji,ge=x.stencil?$i:wi);let Se={colorFormat:t.RGBA8,depthFormat:Me,scaleFactor:s};u=new XRWebGLBinding(i,t),f=u.createProjectionLayer(Se),i.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),p=new ui(f.textureWidth,f.textureHeight,{format:Cn,type:Ri,depthTexture:new Wa(f.textureWidth,f.textureHeight,ge,void 0,void 0,void 0,void 0,void 0,void 0,se),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0});let Fe=e.properties.get(p);Fe.__ignoreDepthValues=f.ignoreDepthValues}p.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),j.setContext(i),j.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode};function F(W){for(let se=0;se<W.removed.length;se++){let ge=W.removed[se],Me=v.indexOf(ge);Me>=0&&(v[Me]=null,_[Me].disconnect(ge))}for(let se=0;se<W.added.length;se++){let ge=W.added[se],Me=v.indexOf(ge);if(Me===-1){for(let Fe=0;Fe<_.length;Fe++)if(Fe>=v.length){v.push(ge),Me=Fe;break}else if(v[Fe]===null){v[Fe]=ge,Me=Fe;break}if(Me===-1)break}let Se=_[Me];Se&&Se.connect(ge)}}let Y=new R,J=new R;function ae(W,se,ge){Y.setFromMatrixPosition(se.matrixWorld),J.setFromMatrixPosition(ge.matrixWorld);let Me=Y.distanceTo(J),Se=se.projectionMatrix.elements,Fe=ge.projectionMatrix.elements,He=Se[14]/(Se[10]-1),Ne=Se[14]/(Se[10]+1),Be=(Se[9]+1)/Se[5],L=(Se[9]-1)/Se[5],me=(Se[8]-1)/Se[0],te=(Fe[8]+1)/Fe[0],de=He*me,ne=He*te,Oe=Me/(-me+te),we=Oe*-me;se.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(we),W.translateZ(Oe),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert();let T=He+Oe,y=Ne+Oe,X=de-we,ue=ne+(Me-we),ce=Be*Ne/y*T,he=L*Ne/y*T;W.projectionMatrix.makePerspective(X,ue,ce,he,T,y),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}function ie(W,se){se===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(se.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(i===null)return;w.near=P.near=C.near=W.near,w.far=P.far=C.far=W.far,(E!==w.near||q!==w.far)&&(i.updateRenderState({depthNear:w.near,depthFar:w.far}),E=w.near,q=w.far);let se=W.parent,ge=w.cameras;ie(w,se);for(let Me=0;Me<ge.length;Me++)ie(ge[Me],se);ge.length===2?ae(w,C,P):w.projectionMatrix.copy(C.projectionMatrix),ee(W,w,se)};function ee(W,se,ge){ge===null?W.matrix.copy(se.matrixWorld):(W.matrix.copy(ge.matrixWorld),W.matrix.invert(),W.matrix.multiply(se.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(se.projectionMatrix),W.projectionMatrixInverse.copy(se.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=Xs*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return w},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(W){l=W,f!==null&&(f.fixedFoveation=W),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=W)};let oe=null;function k(W,se){if(h=se.getViewerPose(c||a),g=se,h!==null){let ge=h.views;d!==null&&(e.setRenderTargetFramebuffer(p,d.framebuffer),e.setRenderTarget(p));let Me=!1;ge.length!==w.cameras.length&&(w.cameras.length=0,Me=!0);for(let Se=0;Se<ge.length;Se++){let Fe=ge[Se],He=null;if(d!==null)He=d.getViewport(Fe);else{let Be=u.getViewSubImage(f,Fe);He=Be.viewport,Se===0&&(e.setRenderTargetTextures(p,Be.colorTexture,f.ignoreDepthValues?void 0:Be.depthStencilTexture),e.setRenderTarget(p))}let Ne=V[Se];Ne===void 0&&(Ne=new Ft,Ne.layers.enable(Se),Ne.viewport=new dt,V[Se]=Ne),Ne.matrix.fromArray(Fe.transform.matrix),Ne.matrix.decompose(Ne.position,Ne.quaternion,Ne.scale),Ne.projectionMatrix.fromArray(Fe.projectionMatrix),Ne.projectionMatrixInverse.copy(Ne.projectionMatrix).invert(),Ne.viewport.set(He.x,He.y,He.width,He.height),Se===0&&(w.matrix.copy(Ne.matrix),w.matrix.decompose(w.position,w.quaternion,w.scale)),Me===!0&&w.cameras.push(Ne)}}for(let ge=0;ge<_.length;ge++){let Me=v[ge],Se=_[ge];Me!==null&&Se!==void 0&&Se.update(Me,se,c||a)}oe&&oe(W,se),se.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:se}),g=null}let j=new Hf;j.setAnimationLoop(k),this.setAnimationLoop=function(W){oe=W},this.dispose=function(){}}};function c_(r,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,kf(r)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function i(m,p,_,v,M){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(m,p):p.isMeshToonMaterial?(s(m,p),u(m,p)):p.isMeshPhongMaterial?(s(m,p),h(m,p)):p.isMeshStandardMaterial?(s(m,p),f(m,p),p.isMeshPhysicalMaterial&&d(m,p,M)):p.isMeshMatcapMaterial?(s(m,p),g(m,p)):p.isMeshDepthMaterial?s(m,p):p.isMeshDistanceMaterial?(s(m,p),x(m,p)):p.isMeshNormalMaterial?s(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,_,v):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===rn&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===rn&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let _=e.get(p).envMap;if(_&&(m.envMap.value=_,m.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap){m.lightMap.value=p.lightMap;let v=r._useLegacyLights===!0?Math.PI:1;m.lightMapIntensity.value=p.lightMapIntensity*v,t(p.lightMap,m.lightMapTransform)}p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,_,v){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*_,m.scale.value=v*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function f(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),e.get(p).envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,_){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===rn&&m.clearcoatNormalScale.value.negate())),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=_.texture,m.transmissionSamplerSize.value.set(_.width,_.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function x(m,p){let _=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(_.matrixWorld),m.nearDistance.value=_.shadow.camera.near,m.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function h_(r,e,t,n){let i={},s={},a=[],o=t.isWebGL2?r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(_,v){let M=v.program;n.uniformBlockBinding(_,M)}function c(_,v){let M=i[_.id];M===void 0&&(g(_),M=h(_),i[_.id]=M,_.addEventListener("dispose",m));let D=v.program;n.updateUBOMapping(_,D);let C=e.render.frame;s[_.id]!==C&&(f(_),s[_.id]=C)}function h(_){let v=u();_.__bindingPointIndex=v;let M=r.createBuffer(),D=_.__size,C=_.usage;return r.bindBuffer(r.UNIFORM_BUFFER,M),r.bufferData(r.UNIFORM_BUFFER,D,C),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,v,M),M}function u(){for(let _=0;_<o;_++)if(a.indexOf(_)===-1)return a.push(_),_;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(_){let v=i[_.id],M=_.uniforms,D=_.__cache;r.bindBuffer(r.UNIFORM_BUFFER,v);for(let C=0,P=M.length;C<P;C++){let V=Array.isArray(M[C])?M[C]:[M[C]];for(let w=0,E=V.length;w<E;w++){let q=V[w];if(d(q,C,w,D)===!0){let Q=q.__offset,le=Array.isArray(q.value)?q.value:[q.value],F=0;for(let Y=0;Y<le.length;Y++){let J=le[Y],ae=x(J);typeof J=="number"||typeof J=="boolean"?(q.__data[0]=J,r.bufferSubData(r.UNIFORM_BUFFER,Q+F,q.__data)):J.isMatrix3?(q.__data[0]=J.elements[0],q.__data[1]=J.elements[1],q.__data[2]=J.elements[2],q.__data[3]=0,q.__data[4]=J.elements[3],q.__data[5]=J.elements[4],q.__data[6]=J.elements[5],q.__data[7]=0,q.__data[8]=J.elements[6],q.__data[9]=J.elements[7],q.__data[10]=J.elements[8],q.__data[11]=0):(J.toArray(q.__data,F),F+=ae.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,Q,q.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function d(_,v,M,D){let C=_.value,P=v+"_"+M;if(D[P]===void 0)return typeof C=="number"||typeof C=="boolean"?D[P]=C:D[P]=C.clone(),!0;{let V=D[P];if(typeof C=="number"||typeof C=="boolean"){if(V!==C)return D[P]=C,!0}else if(V.equals(C)===!1)return V.copy(C),!0}return!1}function g(_){let v=_.uniforms,M=0,D=16;for(let P=0,V=v.length;P<V;P++){let w=Array.isArray(v[P])?v[P]:[v[P]];for(let E=0,q=w.length;E<q;E++){let Q=w[E],le=Array.isArray(Q.value)?Q.value:[Q.value];for(let F=0,Y=le.length;F<Y;F++){let J=le[F],ae=x(J),ie=M%D;ie!==0&&D-ie<ae.boundary&&(M+=D-ie),Q.__data=new Float32Array(ae.storage/Float32Array.BYTES_PER_ELEMENT),Q.__offset=M,M+=ae.storage}}}let C=M%D;return C>0&&(M+=D-C),_.__size=M,_.__cache={},this}function x(_){let v={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(v.boundary=4,v.storage=4):_.isVector2?(v.boundary=8,v.storage=8):_.isVector3||_.isColor?(v.boundary=16,v.storage=12):_.isVector4?(v.boundary=16,v.storage=16):_.isMatrix3?(v.boundary=48,v.storage=48):_.isMatrix4?(v.boundary=64,v.storage=64):_.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",_),v}function m(_){let v=_.target;v.removeEventListener("dispose",m);let M=a.indexOf(v.__bindingPointIndex);a.splice(M,1),r.deleteBuffer(i[v.id]),delete i[v.id],delete s[v.id]}function p(){for(let _ in i)r.deleteBuffer(i[_]);a=[],i={},s={}}return{bind:l,update:c,dispose:p}}var Pr=class{constructor(e={}){let{canvas:t=_m(),context:n=null,depth:i=!0,stencil:s=!0,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1}=e;this.isWebGLRenderer=!0;let f;n!==null?f=n.getContextAttributes().alpha:f=a;let d=new Uint32Array(4),g=new Int32Array(4),x=null,m=null,p=[],_=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=it,this._useLegacyLights=!1,this.toneMapping=Ai,this.toneMappingExposure=1;let v=this,M=!1,D=0,C=0,P=null,V=-1,w=null,E=new dt,q=new dt,Q=null,le=new Re(0),F=0,Y=t.width,J=t.height,ae=1,ie=null,ee=null,oe=new dt(0,0,Y,J),k=new dt(0,0,Y,J),j=!1,W=new Cr,se=!1,ge=!1,Me=null,Se=new Ie,Fe=new pe,He=new R,Ne={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function Be(){return P===null?ae:1}let L=n;function me(b,H){for(let K=0;K<b.length;K++){let $=b[K],Z=t.getContext($,H);if(Z!==null)return Z}return null}try{let b={alpha:!0,depth:i,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r160"),t.addEventListener("webglcontextlost",O,!1),t.addEventListener("webglcontextrestored",S,!1),t.addEventListener("webglcontextcreationerror",z,!1),L===null){let H=["webgl2","webgl","experimental-webgl"];if(v.isWebGL1Renderer===!0&&H.shift(),L=me(H,b),L===null)throw me(H)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&L instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),L.getShaderPrecisionFormat===void 0&&(L.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let te,de,ne,Oe,we,T,y,X,ue,ce,he,Ee,ve,Pe,Ve,Ye,fe,ht,et,Xe,ke,Le,Ke,A;function I(){te=new Cx(L),de=new wx(L,te,e),te.init(de),Le=new o_(L,te,de),ne=new r_(L,te,de),Oe=new Ix(L),we=new Yv,T=new a_(L,te,ne,we,de,Le,Oe),y=new Tx(v),X=new Rx(v),ue=new km(L,de),Ke=new Mx(L,te,ue,de),ce=new Px(L,ue,Oe,Ke),he=new Fx(L,ce,ue,Oe),et=new Nx(L,de,T),Ye=new bx(we),Ee=new qv(v,y,X,te,de,Ke,Ye),ve=new c_(v,we),Pe=new Zv,Ve=new t_(te,de),ht=new yx(v,y,X,ne,he,f,l),fe=new s_(v,he,de),A=new h_(L,Oe,de,ne),Xe=new Sx(L,te,Oe,de),ke=new Lx(L,te,Oe,de),Oe.programs=Ee.programs,v.capabilities=de,v.extensions=te,v.properties=we,v.renderLists=Pe,v.shadowMap=fe,v.state=ne,v.info=Oe}I();let U=new Wl(v,L);this.xr=U,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let b=te.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){let b=te.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return ae},this.setPixelRatio=function(b){b!==void 0&&(ae=b,this.setSize(Y,J,!1))},this.getSize=function(b){return b.set(Y,J)},this.setSize=function(b,H,K=!0){if(U.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Y=b,J=H,t.width=Math.floor(b*ae),t.height=Math.floor(H*ae),K===!0&&(t.style.width=b+"px",t.style.height=H+"px"),this.setViewport(0,0,b,H)},this.getDrawingBufferSize=function(b){return b.set(Y*ae,J*ae).floor()},this.setDrawingBufferSize=function(b,H,K){Y=b,J=H,ae=K,t.width=Math.floor(b*K),t.height=Math.floor(H*K),this.setViewport(0,0,b,H)},this.getCurrentViewport=function(b){return b.copy(E)},this.getViewport=function(b){return b.copy(oe)},this.setViewport=function(b,H,K,$){b.isVector4?oe.set(b.x,b.y,b.z,b.w):oe.set(b,H,K,$),ne.viewport(E.copy(oe).multiplyScalar(ae).floor())},this.getScissor=function(b){return b.copy(k)},this.setScissor=function(b,H,K,$){b.isVector4?k.set(b.x,b.y,b.z,b.w):k.set(b,H,K,$),ne.scissor(q.copy(k).multiplyScalar(ae).floor())},this.getScissorTest=function(){return j},this.setScissorTest=function(b){ne.setScissorTest(j=b)},this.setOpaqueSort=function(b){ie=b},this.setTransparentSort=function(b){ee=b},this.getClearColor=function(b){return b.copy(ht.getClearColor())},this.setClearColor=function(){ht.setClearColor.apply(ht,arguments)},this.getClearAlpha=function(){return ht.getClearAlpha()},this.setClearAlpha=function(){ht.setClearAlpha.apply(ht,arguments)},this.clear=function(b=!0,H=!0,K=!0){let $=0;if(b){let Z=!1;if(P!==null){let Te=P.texture.format;Z=Te===Df||Te===If||Te===Lf}if(Z){let Te=P.texture.type,ze=Te===Ri||Te===wi||Te===xc||Te===$i||Te===Cf||Te===Pf,Ge=ht.getClearColor(),qe=ht.getClearAlpha(),st=Ge.r,Je=Ge.g,je=Ge.b;ze?(d[0]=st,d[1]=Je,d[2]=je,d[3]=qe,L.clearBufferuiv(L.COLOR,0,d)):(g[0]=st,g[1]=Je,g[2]=je,g[3]=qe,L.clearBufferiv(L.COLOR,0,g))}else $|=L.COLOR_BUFFER_BIT}H&&($|=L.DEPTH_BUFFER_BIT),K&&($|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear($)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",O,!1),t.removeEventListener("webglcontextrestored",S,!1),t.removeEventListener("webglcontextcreationerror",z,!1),Pe.dispose(),Ve.dispose(),we.dispose(),y.dispose(),X.dispose(),he.dispose(),Ke.dispose(),A.dispose(),Ee.dispose(),U.dispose(),U.removeEventListener("sessionstart",De),U.removeEventListener("sessionend",be),Me&&(Me.dispose(),Me=null),Ce.stop()};function O(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),M=!0}function S(){console.log("THREE.WebGLRenderer: Context Restored."),M=!1;let b=Oe.autoReset,H=fe.enabled,K=fe.autoUpdate,$=fe.needsUpdate,Z=fe.type;I(),Oe.autoReset=b,fe.enabled=H,fe.autoUpdate=K,fe.needsUpdate=$,fe.type=Z}function z(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function B(b){let H=b.target;H.removeEventListener("dispose",B),G(H)}function G(b){re(b),we.remove(b)}function re(b){let H=we.get(b).programs;H!==void 0&&(H.forEach(function(K){Ee.releaseProgram(K)}),b.isShaderMaterial&&Ee.releaseShaderCache(b))}this.renderBufferDirect=function(b,H,K,$,Z,Te){H===null&&(H=Ne);let ze=Z.isMesh&&Z.matrixWorld.determinant()<0,Ge=ot(b,H,K,$,Z);ne.setMaterial($,ze);let qe=K.index,st=1;if($.wireframe===!0){if(qe=ce.getWireframeAttribute(K),qe===void 0)return;st=2}let Je=K.drawRange,je=K.attributes.position,Ot=Je.start*st,_n=(Je.start+Je.count)*st;Te!==null&&(Ot=Math.max(Ot,Te.start*st),_n=Math.min(_n,(Te.start+Te.count)*st)),qe!==null?(Ot=Math.max(Ot,0),_n=Math.min(_n,qe.count)):je!=null&&(Ot=Math.max(Ot,0),_n=Math.min(_n,je.count));let Yt=_n-Ot;if(Yt<0||Yt===1/0)return;Ke.setup(Z,$,Ge,K,qe);let jn,Pt=Xe;if(qe!==null&&(jn=ue.get(qe),Pt=ke,Pt.setIndex(jn)),Z.isMesh)$.wireframe===!0?(ne.setLineWidth($.wireframeLinewidth*Be()),Pt.setMode(L.LINES)):Pt.setMode(L.TRIANGLES);else if(Z.isLine){let ct=$.linewidth;ct===void 0&&(ct=1),ne.setLineWidth(ct*Be()),Z.isLineSegments?Pt.setMode(L.LINES):Z.isLineLoop?Pt.setMode(L.LINE_LOOP):Pt.setMode(L.LINE_STRIP)}else Z.isPoints?Pt.setMode(L.POINTS):Z.isSprite&&Pt.setMode(L.TRIANGLES);if(Z.isBatchedMesh)Pt.renderMultiDraw(Z._multiDrawStarts,Z._multiDrawCounts,Z._multiDrawCount);else if(Z.isInstancedMesh)Pt.renderInstances(Ot,Yt,Z.count);else if(K.isInstancedBufferGeometry){let ct=K._maxInstanceCount!==void 0?K._maxInstanceCount:1/0,Bo=Math.min(K.instanceCount,ct);Pt.renderInstances(Ot,Yt,Bo)}else Pt.render(Ot,Yt)};function ye(b,H,K){b.transparent===!0&&b.side===Sn&&b.forceSinglePass===!1?(b.side=rn,b.needsUpdate=!0,yt(b,H,K),b.side=Yn,b.needsUpdate=!0,yt(b,H,K),b.side=Sn):yt(b,H,K)}this.compile=function(b,H,K=null){K===null&&(K=b),m=Ve.get(K),m.init(),_.push(m),K.traverseVisible(function(Z){Z.isLight&&Z.layers.test(H.layers)&&(m.pushLight(Z),Z.castShadow&&m.pushShadow(Z))}),b!==K&&b.traverseVisible(function(Z){Z.isLight&&Z.layers.test(H.layers)&&(m.pushLight(Z),Z.castShadow&&m.pushShadow(Z))}),m.setupLights(v._useLegacyLights);let $=new Set;return b.traverse(function(Z){let Te=Z.material;if(Te)if(Array.isArray(Te))for(let ze=0;ze<Te.length;ze++){let Ge=Te[ze];ye(Ge,K,Z),$.add(Ge)}else ye(Te,K,Z),$.add(Te)}),_.pop(),m=null,$},this.compileAsync=function(b,H,K=null){let $=this.compile(b,H,K);return new Promise(Z=>{function Te(){if($.forEach(function(ze){we.get(ze).currentProgram.isReady()&&$.delete(ze)}),$.size===0){Z(b);return}setTimeout(Te,10)}te.get("KHR_parallel_shader_compile")!==null?Te():setTimeout(Te,10)})};let Ae=null;function Ue(b){Ae&&Ae(b)}function De(){Ce.stop()}function be(){Ce.start()}let Ce=new Hf;Ce.setAnimationLoop(Ue),typeof self<"u"&&Ce.setContext(self),this.setAnimationLoop=function(b){Ae=b,U.setAnimationLoop(b),b===null?Ce.stop():Ce.start()},U.addEventListener("sessionstart",De),U.addEventListener("sessionend",be),this.render=function(b,H){if(H!==void 0&&H.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(M===!0)return;b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),H.parent===null&&H.matrixWorldAutoUpdate===!0&&H.updateMatrixWorld(),U.enabled===!0&&U.isPresenting===!0&&(U.cameraAutoUpdate===!0&&U.updateCamera(H),H=U.getCamera()),b.isScene===!0&&b.onBeforeRender(v,b,H,P),m=Ve.get(b,_.length),m.init(),_.push(m),Se.multiplyMatrices(H.projectionMatrix,H.matrixWorldInverse),W.setFromProjectionMatrix(Se),ge=this.localClippingEnabled,se=Ye.init(this.clippingPlanes,ge),x=Pe.get(b,p.length),x.init(),p.push(x),$e(b,H,0,v.sortObjects),x.finish(),v.sortObjects===!0&&x.sort(ie,ee),this.info.render.frame++,se===!0&&Ye.beginShadows();let K=m.state.shadowsArray;if(fe.render(K,b,H),se===!0&&Ye.endShadows(),this.info.autoReset===!0&&this.info.reset(),ht.render(x,b),m.setupLights(v._useLegacyLights),H.isArrayCamera){let $=H.cameras;for(let Z=0,Te=$.length;Z<Te;Z++){let ze=$[Z];Ct(x,b,ze,ze.viewport)}}else Ct(x,b,H);P!==null&&(T.updateMultisampleRenderTarget(P),T.updateRenderTargetMipmap(P)),b.isScene===!0&&b.onAfterRender(v,b,H),Ke.resetDefaultState(),V=-1,w=null,_.pop(),_.length>0?m=_[_.length-1]:m=null,p.pop(),p.length>0?x=p[p.length-1]:x=null};function $e(b,H,K,$){if(b.visible===!1)return;if(b.layers.test(H.layers)){if(b.isGroup)K=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(H);else if(b.isLight)m.pushLight(b),b.castShadow&&m.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||W.intersectsSprite(b)){$&&He.setFromMatrixPosition(b.matrixWorld).applyMatrix4(Se);let ze=he.update(b),Ge=b.material;Ge.visible&&x.push(b,ze,Ge,K,He.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||W.intersectsObject(b))){let ze=he.update(b),Ge=b.material;if($&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),He.copy(b.boundingSphere.center)):(ze.boundingSphere===null&&ze.computeBoundingSphere(),He.copy(ze.boundingSphere.center)),He.applyMatrix4(b.matrixWorld).applyMatrix4(Se)),Array.isArray(Ge)){let qe=ze.groups;for(let st=0,Je=qe.length;st<Je;st++){let je=qe[st],Ot=Ge[je.materialIndex];Ot&&Ot.visible&&x.push(b,ze,Ot,K,He.z,je)}}else Ge.visible&&x.push(b,ze,Ge,K,He.z,null)}}let Te=b.children;for(let ze=0,Ge=Te.length;ze<Ge;ze++)$e(Te[ze],H,K,$)}function Ct(b,H,K,$){let Z=b.opaque,Te=b.transmissive,ze=b.transparent;m.setupLightsView(K),se===!0&&Ye.setGlobalState(v.clippingPlanes,K),Te.length>0&&ft(Z,Te,H,K),$&&ne.viewport(E.copy($)),Z.length>0&&at(Z,H,K),Te.length>0&&at(Te,H,K),ze.length>0&&at(ze,H,K),ne.buffers.depth.setTest(!0),ne.buffers.depth.setMask(!0),ne.buffers.color.setMask(!0),ne.setPolygonOffset(!1)}function ft(b,H,K,$){if((K.isScene===!0?K.overrideMaterial:null)!==null)return;let Te=de.isWebGL2;Me===null&&(Me=new ui(1,1,{generateMipmaps:!0,type:te.has("EXT_color_buffer_half_float")?Ar:Ri,minFilter:Ci,samples:Te?4:0})),v.getDrawingBufferSize(Fe),Te?Me.setSize(Fe.x,Fe.y):Me.setSize(Oa(Fe.x),Oa(Fe.y));let ze=v.getRenderTarget();v.setRenderTarget(Me),v.getClearColor(le),F=v.getClearAlpha(),F<1&&v.setClearColor(16777215,.5),v.clear();let Ge=v.toneMapping;v.toneMapping=Ai,at(b,K,$),T.updateMultisampleRenderTarget(Me),T.updateRenderTargetMipmap(Me);let qe=!1;for(let st=0,Je=H.length;st<Je;st++){let je=H[st],Ot=je.object,_n=je.geometry,Yt=je.material,jn=je.group;if(Yt.side===Sn&&Ot.layers.test($.layers)){let Pt=Yt.side;Yt.side=rn,Yt.needsUpdate=!0,St(Ot,K,$,_n,Yt,jn),Yt.side=Pt,Yt.needsUpdate=!0,qe=!0}}qe===!0&&(T.updateMultisampleRenderTarget(Me),T.updateRenderTargetMipmap(Me)),v.setRenderTarget(ze),v.setClearColor(le,F),v.toneMapping=Ge}function at(b,H,K){let $=H.isScene===!0?H.overrideMaterial:null;for(let Z=0,Te=b.length;Z<Te;Z++){let ze=b[Z],Ge=ze.object,qe=ze.geometry,st=$===null?ze.material:$,Je=ze.group;Ge.layers.test(K.layers)&&St(Ge,H,K,qe,st,Je)}}function St(b,H,K,$,Z,Te){b.onBeforeRender(v,H,K,$,Z,Te),b.modelViewMatrix.multiplyMatrices(K.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),Z.onBeforeRender(v,H,K,$,b,Te),Z.transparent===!0&&Z.side===Sn&&Z.forceSinglePass===!1?(Z.side=rn,Z.needsUpdate=!0,v.renderBufferDirect(K,H,$,Z,b,Te),Z.side=Yn,Z.needsUpdate=!0,v.renderBufferDirect(K,H,$,Z,b,Te),Z.side=Sn):v.renderBufferDirect(K,H,$,Z,b,Te),b.onAfterRender(v,H,K,$,Z,Te)}function yt(b,H,K){H.isScene!==!0&&(H=Ne);let $=we.get(b),Z=m.state.lights,Te=m.state.shadowsArray,ze=Z.state.version,Ge=Ee.getParameters(b,Z.state,Te,H,K),qe=Ee.getProgramCacheKey(Ge),st=$.programs;$.environment=b.isMeshStandardMaterial?H.environment:null,$.fog=H.fog,$.envMap=(b.isMeshStandardMaterial?X:y).get(b.envMap||$.environment),st===void 0&&(b.addEventListener("dispose",B),st=new Map,$.programs=st);let Je=st.get(qe);if(Je!==void 0){if($.currentProgram===Je&&$.lightsStateVersion===ze)return Et(b,Ge),Je}else Ge.uniforms=Ee.getUniforms(b),b.onBuild(K,Ge,v),b.onBeforeCompile(Ge,v),Je=Ee.acquireProgram(Ge,qe),st.set(qe,Je),$.uniforms=Ge.uniforms;let je=$.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(je.clippingPlanes=Ye.uniform),Et(b,Ge),$.needsLights=Ut(b),$.lightsStateVersion=ze,$.needsLights&&(je.ambientLightColor.value=Z.state.ambient,je.lightProbe.value=Z.state.probe,je.directionalLights.value=Z.state.directional,je.directionalLightShadows.value=Z.state.directionalShadow,je.spotLights.value=Z.state.spot,je.spotLightShadows.value=Z.state.spotShadow,je.rectAreaLights.value=Z.state.rectArea,je.ltc_1.value=Z.state.rectAreaLTC1,je.ltc_2.value=Z.state.rectAreaLTC2,je.pointLights.value=Z.state.point,je.pointLightShadows.value=Z.state.pointShadow,je.hemisphereLights.value=Z.state.hemi,je.directionalShadowMap.value=Z.state.directionalShadowMap,je.directionalShadowMatrix.value=Z.state.directionalShadowMatrix,je.spotShadowMap.value=Z.state.spotShadowMap,je.spotLightMatrix.value=Z.state.spotLightMatrix,je.spotLightMap.value=Z.state.spotLightMap,je.pointShadowMap.value=Z.state.pointShadowMap,je.pointShadowMatrix.value=Z.state.pointShadowMatrix),$.currentProgram=Je,$.uniformsList=null,Je}function Ze(b){if(b.uniformsList===null){let H=b.currentProgram.getUniforms();b.uniformsList=ks.seqWithValue(H.seq,b.uniforms)}return b.uniformsList}function Et(b,H){let K=we.get(b);K.outputColorSpace=H.outputColorSpace,K.batching=H.batching,K.instancing=H.instancing,K.instancingColor=H.instancingColor,K.skinning=H.skinning,K.morphTargets=H.morphTargets,K.morphNormals=H.morphNormals,K.morphColors=H.morphColors,K.morphTargetsCount=H.morphTargetsCount,K.numClippingPlanes=H.numClippingPlanes,K.numIntersection=H.numClipIntersection,K.vertexAlphas=H.vertexAlphas,K.vertexTangents=H.vertexTangents,K.toneMapping=H.toneMapping}function ot(b,H,K,$,Z){H.isScene!==!0&&(H=Ne),T.resetTextureUnits();let Te=H.fog,ze=$.isMeshStandardMaterial?H.environment:null,Ge=P===null?v.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:Vt,qe=($.isMeshStandardMaterial?X:y).get($.envMap||ze),st=$.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,Je=!!K.attributes.tangent&&(!!$.normalMap||$.anisotropy>0),je=!!K.morphAttributes.position,Ot=!!K.morphAttributes.normal,_n=!!K.morphAttributes.color,Yt=Ai;$.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(Yt=v.toneMapping);let jn=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,Pt=jn!==void 0?jn.length:0,ct=we.get($),Bo=m.state.lights;if(se===!0&&(ge===!0||b!==w)){let An=b===w&&$.id===V;Ye.setState($,b,An)}let Nt=!1;$.version===ct.__version?(ct.needsLights&&ct.lightsStateVersion!==Bo.state.version||ct.outputColorSpace!==Ge||Z.isBatchedMesh&&ct.batching===!1||!Z.isBatchedMesh&&ct.batching===!0||Z.isInstancedMesh&&ct.instancing===!1||!Z.isInstancedMesh&&ct.instancing===!0||Z.isSkinnedMesh&&ct.skinning===!1||!Z.isSkinnedMesh&&ct.skinning===!0||Z.isInstancedMesh&&ct.instancingColor===!0&&Z.instanceColor===null||Z.isInstancedMesh&&ct.instancingColor===!1&&Z.instanceColor!==null||ct.envMap!==qe||$.fog===!0&&ct.fog!==Te||ct.numClippingPlanes!==void 0&&(ct.numClippingPlanes!==Ye.numPlanes||ct.numIntersection!==Ye.numIntersection)||ct.vertexAlphas!==st||ct.vertexTangents!==Je||ct.morphTargets!==je||ct.morphNormals!==Ot||ct.morphColors!==_n||ct.toneMapping!==Yt||de.isWebGL2===!0&&ct.morphTargetsCount!==Pt)&&(Nt=!0):(Nt=!0,ct.__version=$.version);let Hi=ct.currentProgram;Nt===!0&&(Hi=yt($,H,Z));let Nh=!1,lr=!1,zo=!1,en=Hi.getUniforms(),Vi=ct.uniforms;if(ne.useProgram(Hi.program)&&(Nh=!0,lr=!0,zo=!0),$.id!==V&&(V=$.id,lr=!0),Nh||w!==b){en.setValue(L,"projectionMatrix",b.projectionMatrix),en.setValue(L,"viewMatrix",b.matrixWorldInverse);let An=en.map.cameraPosition;An!==void 0&&An.setValue(L,He.setFromMatrixPosition(b.matrixWorld)),de.logarithmicDepthBuffer&&en.setValue(L,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),($.isMeshPhongMaterial||$.isMeshToonMaterial||$.isMeshLambertMaterial||$.isMeshBasicMaterial||$.isMeshStandardMaterial||$.isShaderMaterial)&&en.setValue(L,"isOrthographic",b.isOrthographicCamera===!0),w!==b&&(w=b,lr=!0,zo=!0)}if(Z.isSkinnedMesh){en.setOptional(L,Z,"bindMatrix"),en.setOptional(L,Z,"bindMatrixInverse");let An=Z.skeleton;An&&(de.floatVertexTextures?(An.boneTexture===null&&An.computeBoneTexture(),en.setValue(L,"boneTexture",An.boneTexture,T)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}Z.isBatchedMesh&&(en.setOptional(L,Z,"batchingTexture"),en.setValue(L,"batchingTexture",Z._matricesTexture,T));let ko=K.morphAttributes;if((ko.position!==void 0||ko.normal!==void 0||ko.color!==void 0&&de.isWebGL2===!0)&&et.update(Z,K,Hi),(lr||ct.receiveShadow!==Z.receiveShadow)&&(ct.receiveShadow=Z.receiveShadow,en.setValue(L,"receiveShadow",Z.receiveShadow)),$.isMeshGouraudMaterial&&$.envMap!==null&&(Vi.envMap.value=qe,Vi.flipEnvMap.value=qe.isCubeTexture&&qe.isRenderTargetTexture===!1?-1:1),lr&&(en.setValue(L,"toneMappingExposure",v.toneMappingExposure),ct.needsLights&&lt(Vi,zo),Te&&$.fog===!0&&ve.refreshFogUniforms(Vi,Te),ve.refreshMaterialUniforms(Vi,$,ae,J,Me),ks.upload(L,Ze(ct),Vi,T)),$.isShaderMaterial&&$.uniformsNeedUpdate===!0&&(ks.upload(L,Ze(ct),Vi,T),$.uniformsNeedUpdate=!1),$.isSpriteMaterial&&en.setValue(L,"center",Z.center),en.setValue(L,"modelViewMatrix",Z.modelViewMatrix),en.setValue(L,"normalMatrix",Z.normalMatrix),en.setValue(L,"modelMatrix",Z.matrixWorld),$.isShaderMaterial||$.isRawShaderMaterial){let An=$.uniformsGroups;for(let Ho=0,ip=An.length;Ho<ip;Ho++)if(de.isWebGL2){let Fh=An[Ho];A.update(Fh,Hi),A.bind(Fh,Hi)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Hi}function lt(b,H){b.ambientLightColor.needsUpdate=H,b.lightProbe.needsUpdate=H,b.directionalLights.needsUpdate=H,b.directionalLightShadows.needsUpdate=H,b.pointLights.needsUpdate=H,b.pointLightShadows.needsUpdate=H,b.spotLights.needsUpdate=H,b.spotLightShadows.needsUpdate=H,b.rectAreaLights.needsUpdate=H,b.hemisphereLights.needsUpdate=H}function Ut(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return D},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(b,H,K){we.get(b.texture).__webglTexture=H,we.get(b.depthTexture).__webglTexture=K;let $=we.get(b);$.__hasExternalTextures=!0,$.__hasExternalTextures&&($.__autoAllocateDepthBuffer=K===void 0,$.__autoAllocateDepthBuffer||te.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),$.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(b,H){let K=we.get(b);K.__webglFramebuffer=H,K.__useDefaultFramebuffer=H===void 0},this.setRenderTarget=function(b,H=0,K=0){P=b,D=H,C=K;let $=!0,Z=null,Te=!1,ze=!1;if(b){let qe=we.get(b);qe.__useDefaultFramebuffer!==void 0?(ne.bindFramebuffer(L.FRAMEBUFFER,null),$=!1):qe.__webglFramebuffer===void 0?T.setupRenderTarget(b):qe.__hasExternalTextures&&T.rebindTextures(b,we.get(b.texture).__webglTexture,we.get(b.depthTexture).__webglTexture);let st=b.texture;(st.isData3DTexture||st.isDataArrayTexture||st.isCompressedArrayTexture)&&(ze=!0);let Je=we.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Je[H])?Z=Je[H][K]:Z=Je[H],Te=!0):de.isWebGL2&&b.samples>0&&T.useMultisampledRTT(b)===!1?Z=we.get(b).__webglMultisampledFramebuffer:Array.isArray(Je)?Z=Je[K]:Z=Je,E.copy(b.viewport),q.copy(b.scissor),Q=b.scissorTest}else E.copy(oe).multiplyScalar(ae).floor(),q.copy(k).multiplyScalar(ae).floor(),Q=j;if(ne.bindFramebuffer(L.FRAMEBUFFER,Z)&&de.drawBuffers&&$&&ne.drawBuffers(b,Z),ne.viewport(E),ne.scissor(q),ne.setScissorTest(Q),Te){let qe=we.get(b.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+H,qe.__webglTexture,K)}else if(ze){let qe=we.get(b.texture),st=H||0;L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,qe.__webglTexture,K||0,st)}V=-1},this.readRenderTargetPixels=function(b,H,K,$,Z,Te,ze){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ge=we.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&ze!==void 0&&(Ge=Ge[ze]),Ge){ne.bindFramebuffer(L.FRAMEBUFFER,Ge);try{let qe=b.texture,st=qe.format,Je=qe.type;if(st!==Cn&&Le.convert(st)!==L.getParameter(L.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}let je=Je===Ar&&(te.has("EXT_color_buffer_half_float")||de.isWebGL2&&te.has("EXT_color_buffer_float"));if(Je!==Ri&&Le.convert(Je)!==L.getParameter(L.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Je===oi&&(de.isWebGL2||te.has("OES_texture_float")||te.has("WEBGL_color_buffer_float")))&&!je){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}H>=0&&H<=b.width-$&&K>=0&&K<=b.height-Z&&L.readPixels(H,K,$,Z,Le.convert(st),Le.convert(Je),Te)}finally{let qe=P!==null?we.get(P).__webglFramebuffer:null;ne.bindFramebuffer(L.FRAMEBUFFER,qe)}}},this.copyFramebufferToTexture=function(b,H,K=0){let $=Math.pow(2,-K),Z=Math.floor(H.image.width*$),Te=Math.floor(H.image.height*$);T.setTexture2D(H,0),L.copyTexSubImage2D(L.TEXTURE_2D,K,0,0,b.x,b.y,Z,Te),ne.unbindTexture()},this.copyTextureToTexture=function(b,H,K,$=0){let Z=H.image.width,Te=H.image.height,ze=Le.convert(K.format),Ge=Le.convert(K.type);T.setTexture2D(K,0),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,K.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,K.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,K.unpackAlignment),H.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,$,b.x,b.y,Z,Te,ze,Ge,H.image.data):H.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,$,b.x,b.y,H.mipmaps[0].width,H.mipmaps[0].height,ze,H.mipmaps[0].data):L.texSubImage2D(L.TEXTURE_2D,$,b.x,b.y,ze,Ge,H.image),$===0&&K.generateMipmaps&&L.generateMipmap(L.TEXTURE_2D),ne.unbindTexture()},this.copyTextureToTexture3D=function(b,H,K,$,Z=0){if(v.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}let Te=b.max.x-b.min.x+1,ze=b.max.y-b.min.y+1,Ge=b.max.z-b.min.z+1,qe=Le.convert($.format),st=Le.convert($.type),Je;if($.isData3DTexture)T.setTexture3D($,0),Je=L.TEXTURE_3D;else if($.isDataArrayTexture||$.isCompressedArrayTexture)T.setTexture2DArray($,0),Je=L.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,$.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,$.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,$.unpackAlignment);let je=L.getParameter(L.UNPACK_ROW_LENGTH),Ot=L.getParameter(L.UNPACK_IMAGE_HEIGHT),_n=L.getParameter(L.UNPACK_SKIP_PIXELS),Yt=L.getParameter(L.UNPACK_SKIP_ROWS),jn=L.getParameter(L.UNPACK_SKIP_IMAGES),Pt=K.isCompressedTexture?K.mipmaps[Z]:K.image;L.pixelStorei(L.UNPACK_ROW_LENGTH,Pt.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Pt.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,b.min.x),L.pixelStorei(L.UNPACK_SKIP_ROWS,b.min.y),L.pixelStorei(L.UNPACK_SKIP_IMAGES,b.min.z),K.isDataTexture||K.isData3DTexture?L.texSubImage3D(Je,Z,H.x,H.y,H.z,Te,ze,Ge,qe,st,Pt.data):K.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),L.compressedTexSubImage3D(Je,Z,H.x,H.y,H.z,Te,ze,Ge,qe,Pt.data)):L.texSubImage3D(Je,Z,H.x,H.y,H.z,Te,ze,Ge,qe,st,Pt),L.pixelStorei(L.UNPACK_ROW_LENGTH,je),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Ot),L.pixelStorei(L.UNPACK_SKIP_PIXELS,_n),L.pixelStorei(L.UNPACK_SKIP_ROWS,Yt),L.pixelStorei(L.UNPACK_SKIP_IMAGES,jn),Z===0&&$.generateMipmaps&&L.generateMipmap(Je),ne.unbindTexture()},this.initTexture=function(b){b.isCubeTexture?T.setTextureCube(b,0):b.isData3DTexture?T.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?T.setTexture2DArray(b,0):T.setTexture2D(b,0),ne.unbindTexture()},this.resetState=function(){D=0,C=0,P=null,ne.reset(),Ke.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return li}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=e===_c?"display-p3":"srgb",t.unpackColorSpace=xt.workingColorSpace===uo?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===it?Qi:Ff}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===Qi?it:Vt}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}},Xl=class extends Pr{};Xl.prototype.isWebGL1Renderer=!0;var Xa=class r{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Re(e),this.near=t,this.far=n}clone(){return new r(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Lr=class extends Mt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}},Js=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Rl,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=Pn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,s=this.stride;i<s;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Pn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Pn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},ln=new R,is=class r{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)ln.fromBufferAttribute(this,t),ln.applyMatrix4(e),this.setXYZ(t,ln.x,ln.y,ln.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ln.fromBufferAttribute(this,t),ln.applyNormalMatrix(e),this.setXYZ(t,ln.x,ln.y,ln.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ln.fromBufferAttribute(this,t),ln.transformDirection(e),this.setXYZ(t,ln.x,ln.y,ln.z);return this}setX(e,t){return this.normalized&&(t=wt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=wt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=wt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=wt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=qn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=qn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=qn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=qn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=wt(t,this.array),n=wt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=wt(t,this.array),n=wt(n,this.array),i=wt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=wt(t,this.array),n=wt(n,this.array),i=wt(i,this.array),s=wt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return new Ht(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new r(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},zn=class extends an{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Re(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Cs,dr=new R,Ps=new R,Ls=new R,Is=new pe,pr=new pe,Yf=new Ie,va=new R,mr=new R,_a=new R,ef=new pe,gl=new pe,tf=new pe,Kn=class extends Mt{constructor(e=new zn){if(super(),this.isSprite=!0,this.type="Sprite",Cs===void 0){Cs=new Dt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Js(t,5);Cs.setIndex([0,1,2,0,2,3]),Cs.setAttribute("position",new is(n,3,0,!1)),Cs.setAttribute("uv",new is(n,2,3,!1))}this.geometry=Cs,this.material=e,this.center=new pe(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Ps.setFromMatrixScale(this.matrixWorld),Yf.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Ls.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Ps.multiplyScalar(-Ls.z);let n=this.material.rotation,i,s;n!==0&&(s=Math.cos(n),i=Math.sin(n));let a=this.center;ya(va.set(-.5,-.5,0),Ls,a,Ps,i,s),ya(mr.set(.5,-.5,0),Ls,a,Ps,i,s),ya(_a.set(.5,.5,0),Ls,a,Ps,i,s),ef.set(0,0),gl.set(1,0),tf.set(1,1);let o=e.ray.intersectTriangle(va,mr,_a,!1,dr);if(o===null&&(ya(mr.set(-.5,.5,0),Ls,a,Ps,i,s),gl.set(0,1),o=e.ray.intersectTriangle(va,_a,mr,!1,dr),o===null))return;let l=e.ray.origin.distanceTo(dr);l<e.near||l>e.far||t.push({distance:l,point:dr.clone(),uv:Ji.getInterpolation(dr,va,mr,_a,ef,gl,tf,new pe),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function ya(r,e,t,n,i,s){Is.subVectors(r,t).addScalar(.5).multiply(n),i!==void 0?(pr.x=s*Is.x-i*Is.y,pr.y=i*Is.x+s*Is.y):pr.copy(Is),r.copy(e),r.x+=pr.x,r.y+=pr.y,r.applyMatrix4(Yf)}var nf=new R,sf=new dt,rf=new dt,u_=new R,af=new Ie,Ma=new R,xl=new wn,of=new Ie,vl=new qs,$s=class extends gt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Vh,this.bindMatrix=new Ie,this.bindMatrixInverse=new Ie,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new un),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ma),this.boundingBox.expandByPoint(Ma)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new wn),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ma),this.boundingSphere.expandByPoint(Ma)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),xl.copy(this.boundingSphere),xl.applyMatrix4(i),e.ray.intersectsSphere(xl)!==!1&&(of.copy(i).invert(),vl.copy(e.ray).applyMatrix4(of),!(this.boundingBox!==null&&vl.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,vl)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new dt,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);let s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Vh?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Fp?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,i=this.geometry;sf.fromBufferAttribute(i.attributes.skinIndex,e),rf.fromBufferAttribute(i.attributes.skinWeight,e),nf.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){let a=rf.getComponent(s);if(a!==0){let o=sf.getComponent(s);af.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(u_.copy(nf).applyMatrix4(af),a)}}return t.applyMatrix4(this.bindMatrixInverse)}boneTransform(e,t){return console.warn("THREE.SkinnedMesh: .boneTransform() was renamed to .applyBoneTransform() in r151."),this.applyBoneTransform(e,t)}},Ii=class extends Mt{constructor(){super(),this.isBone=!0,this.type="Bone"}},ql=class extends It{constructor(e=null,t=1,n=1,i,s,a,o,l,c=kt,h=kt,u,f){super(null,a,o,l,c,h,i,s,u,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},lf=new Ie,f_=new Ie,js=class r{constructor(e=[],t=[]){this.uuid=Pn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Ie)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new Ie;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let s=0,a=e.length;s<a;s++){let o=e[s]?e[s].matrixWorld:f_;lf.multiplyMatrices(o,t[s]),lf.toArray(n,s*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new r(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new ql(t,e,e,Cn,oi);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){let s=e.bones[n],a=t[s];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),a=new Ii),this.bones.push(a),this.boneInverses.push(new Ie().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let i=0,s=t.length;i<s;i++){let a=t[i];e.bones.push(a.uuid);let o=n[i];e.boneInverses.push(o.toArray())}return e}},ss=class extends Ht{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ds=new Ie,cf=new Ie,Sa=[],hf=new un,d_=new Ie,gr=new gt,xr=new wn,qa=class extends gt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ss(new Float32Array(n*16),16),this.instanceColor=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,d_)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new un),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ds),hf.copy(e.boundingBox).applyMatrix4(Ds),this.boundingBox.union(hf)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new wn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ds),xr.copy(e.boundingSphere).applyMatrix4(Ds),this.boundingSphere.union(xr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){let n=this.matrixWorld,i=this.count;if(gr.geometry=this.geometry,gr.material=this.material,gr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),xr.copy(this.boundingSphere),xr.applyMatrix4(n),e.ray.intersectsSphere(xr)!==!1))for(let s=0;s<i;s++){this.getMatrixAt(s,Ds),cf.multiplyMatrices(n,Ds),gr.matrixWorld=cf,gr.raycast(e,Sa);for(let a=0,o=Sa.length;a<o;a++){let l=Sa[a];l.instanceId=s,l.object=this,t.push(l)}Sa.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new ss(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}};var rs=class extends an{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Re(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},uf=new R,ff=new R,df=new Ie,_l=new qs,wa=new wn,Di=class extends Mt{constructor(e=new Dt,t=new rs){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let i=1,s=t.count;i<s;i++)uf.fromBufferAttribute(t,i-1),ff.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=uf.distanceTo(ff);e.setAttribute("lineDistance",new pt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,s=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),wa.copy(n.boundingSphere),wa.applyMatrix4(i),wa.radius+=s,e.ray.intersectsSphere(wa)===!1)return;df.copy(i).invert(),_l.copy(e.ray).applyMatrix4(df);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=new R,h=new R,u=new R,f=new R,d=this.isLineSegments?2:1,g=n.index,m=n.attributes.position;if(g!==null){let p=Math.max(0,a.start),_=Math.min(g.count,a.start+a.count);for(let v=p,M=_-1;v<M;v+=d){let D=g.getX(v),C=g.getX(v+1);if(c.fromBufferAttribute(m,D),h.fromBufferAttribute(m,C),_l.distanceSqToSegment(c,h,f,u)>l)continue;f.applyMatrix4(this.matrixWorld);let V=e.ray.origin.distanceTo(f);V<e.near||V>e.far||t.push({distance:V,point:u.clone().applyMatrix4(this.matrixWorld),index:v,face:null,faceIndex:null,object:this})}}else{let p=Math.max(0,a.start),_=Math.min(m.count,a.start+a.count);for(let v=p,M=_-1;v<M;v+=d){if(c.fromBufferAttribute(m,v),h.fromBufferAttribute(m,v+1),_l.distanceSqToSegment(c,h,f,u)>l)continue;f.applyMatrix4(this.matrixWorld);let C=e.ray.origin.distanceTo(f);C<e.near||C>e.far||t.push({distance:C,point:u.clone().applyMatrix4(this.matrixWorld),index:v,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){let o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}},pf=new R,mf=new R,Ya=class extends Di{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let i=0,s=t.count;i<s;i+=2)pf.fromBufferAttribute(t,i),mf.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+pf.distanceTo(mf);e.setAttribute("lineDistance",new pt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Ka=class extends Di{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},Ir=class extends an{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Re(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},gf=new Ie,Yl=new qs,ba=new wn,Ta=new R,Za=class extends Mt{constructor(e=new Dt,t=new Ir){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,s=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ba.copy(n.boundingSphere),ba.applyMatrix4(i),ba.radius+=s,e.ray.intersectsSphere(ba)===!1)return;gf.copy(i).invert(),Yl.copy(e.ray).applyMatrix4(gf);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){let f=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);for(let g=f,x=d;g<x;g++){let m=c.getX(g);Ta.fromBufferAttribute(u,m),xf(Ta,m,l,i,e,t,this)}}else{let f=Math.max(0,a.start),d=Math.min(u.count,a.start+a.count);for(let g=f,x=d;g<x;g++)Ta.fromBufferAttribute(u,g),xf(Ta,g,l,i,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){let o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}};function xf(r,e,t,n,i,s,a){let o=Yl.distanceSqToPoint(r);if(o<t){let l=new R;Yl.closestPointToPoint(r,l),l.applyMatrix4(n);let c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;s.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,object:a})}}var kn=class extends It{constructor(e,t,n,i,s,a,o,l,c){super(e,t,n,i,s,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},gn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,i=this.getPoint(0),s=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),s+=n.distanceTo(i),t.push(s),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let n=this.getLengths(),i=0,s=n.length,a;t?a=t:a=e*n[s-1];let o=0,l=s-1,c;for(;o<=l;)if(i=Math.floor(o+(l-o)/2),c=n[i]-a,c<0)o=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===a)return i/(s-1);let h=n[i],f=n[i+1]-h,d=(a-h)/f;return(i+d)/(s-1)}getTangent(e,t){let i=e-1e-4,s=e+1e-4;i<0&&(i=0),s>1&&(s=1);let a=this.getPoint(i),o=this.getPoint(s),l=t||(a.isVector2?new pe:new R);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){let n=new R,i=[],s=[],a=[],o=new R,l=new Ie;for(let d=0;d<=e;d++){let g=d/e;i[d]=this.getTangentAt(g,new R)}s[0]=new R,a[0]=new R;let c=Number.MAX_VALUE,h=Math.abs(i[0].x),u=Math.abs(i[0].y),f=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),f<=c&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),s[0].crossVectors(i[0],o),a[0].crossVectors(i[0],s[0]);for(let d=1;d<=e;d++){if(s[d]=s[d-1].clone(),a[d]=a[d-1].clone(),o.crossVectors(i[d-1],i[d]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos(Zt(i[d-1].dot(i[d]),-1,1));s[d].applyMatrix4(l.makeRotationAxis(o,g))}a[d].crossVectors(i[d],s[d])}if(t===!0){let d=Math.acos(Zt(s[0].dot(s[e]),-1,1));d/=e,i[0].dot(o.crossVectors(s[0],s[e]))>0&&(d=-d);for(let g=1;g<=e;g++)s[g].applyMatrix4(l.makeRotationAxis(i[g],d*g)),a[g].crossVectors(i[g],s[g])}return{tangents:i,normals:s,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Dr=class extends gn{constructor(e=0,t=0,n=1,i=1,s=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=s,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t){let n=t||new pe,i=Math.PI*2,s=this.aEndAngle-this.aStartAngle,a=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=i;for(;s>i;)s-=i;s<Number.EPSILON&&(a?s=0:s=i),this.aClockwise===!0&&!a&&(s===i?s=-i:s=s-i);let o=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),f=l-this.aX,d=c-this.aY;l=f*h-d*u+this.aX,c=f*u+d*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Kl=class extends Dr{constructor(e,t,n,i,s,a){super(e,t,n,n,i,s,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Sc(){let r=0,e=0,t=0,n=0;function i(s,a,o,l){r=s,e=o,t=-3*s+3*a-2*o-l,n=2*s-2*a+o+l}return{initCatmullRom:function(s,a,o,l,c){i(a,o,c*(o-s),c*(l-a))},initNonuniformCatmullRom:function(s,a,o,l,c,h,u){let f=(a-s)/c-(o-s)/(c+h)+(o-a)/h,d=(o-a)/h-(l-a)/(h+u)+(l-o)/u;f*=h,d*=h,i(a,o,f,d)},calc:function(s){let a=s*s,o=a*s;return r+e*s+t*a+n*o}}}var Ea=new R,yl=new Sc,Ml=new Sc,Sl=new Sc,Zl=class extends gn{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new R){let n=t,i=this.points,s=i.length,a=(s-(this.closed?0:1))*e,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/s)+1)*s:l===0&&o===s-1&&(o=s-2,l=1);let c,h;this.closed||o>0?c=i[(o-1)%s]:(Ea.subVectors(i[0],i[1]).add(i[0]),c=Ea);let u=i[o%s],f=i[(o+1)%s];if(this.closed||o+2<s?h=i[(o+2)%s]:(Ea.subVectors(i[s-1],i[s-2]).add(i[s-1]),h=Ea),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(u),d),x=Math.pow(u.distanceToSquared(f),d),m=Math.pow(f.distanceToSquared(h),d);x<1e-4&&(x=1),g<1e-4&&(g=x),m<1e-4&&(m=x),yl.initNonuniformCatmullRom(c.x,u.x,f.x,h.x,g,x,m),Ml.initNonuniformCatmullRom(c.y,u.y,f.y,h.y,g,x,m),Sl.initNonuniformCatmullRom(c.z,u.z,f.z,h.z,g,x,m)}else this.curveType==="catmullrom"&&(yl.initCatmullRom(c.x,u.x,f.x,h.x,this.tension),Ml.initCatmullRom(c.y,u.y,f.y,h.y,this.tension),Sl.initCatmullRom(c.z,u.z,f.z,h.z,this.tension));return n.set(yl.calc(l),Ml.calc(l),Sl.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new R().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function vf(r,e,t,n,i){let s=(n-e)*.5,a=(i-t)*.5,o=r*r,l=r*o;return(2*t-2*n+s+a)*l+(-3*t+3*n-2*s-a)*o+s*r+t}function p_(r,e){let t=1-r;return t*t*e}function m_(r,e){return 2*(1-r)*r*e}function g_(r,e){return r*r*e}function br(r,e,t,n){return p_(r,e)+m_(r,t)+g_(r,n)}function x_(r,e){let t=1-r;return t*t*t*e}function v_(r,e){let t=1-r;return 3*t*t*r*e}function __(r,e){return 3*(1-r)*r*r*e}function y_(r,e){return r*r*r*e}function Tr(r,e,t,n,i){return x_(r,e)+v_(r,t)+__(r,n)+y_(r,i)}var Ja=class extends gn{constructor(e=new pe,t=new pe,n=new pe,i=new pe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new pe){let n=t,i=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(Tr(e,i.x,s.x,a.x,o.x),Tr(e,i.y,s.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Jl=class extends gn{constructor(e=new R,t=new R,n=new R,i=new R){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new R){let n=t,i=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(Tr(e,i.x,s.x,a.x,o.x),Tr(e,i.y,s.y,a.y,o.y),Tr(e,i.z,s.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},$a=class extends gn{constructor(e=new pe,t=new pe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new pe){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new pe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},$l=class extends gn{constructor(e=new R,t=new R){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new R){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new R){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ja=class extends gn{constructor(e=new pe,t=new pe,n=new pe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new pe){let n=t,i=this.v0,s=this.v1,a=this.v2;return n.set(br(e,i.x,s.x,a.x),br(e,i.y,s.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},jl=class extends gn{constructor(e=new R,t=new R,n=new R){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new R){let n=t,i=this.v0,s=this.v1,a=this.v2;return n.set(br(e,i.x,s.x,a.x),br(e,i.y,s.y,a.y),br(e,i.z,s.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Qa=class extends gn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new pe){let n=t,i=this.points,s=(i.length-1)*e,a=Math.floor(s),o=s-a,l=i[a===0?a:a-1],c=i[a],h=i[a>i.length-2?i.length-1:a+1],u=i[a>i.length-3?i.length-1:a+2];return n.set(vf(o,l.x,c.x,h.x,u.x),vf(o,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new pe().fromArray(i))}return this}},Ql=Object.freeze({__proto__:null,ArcCurve:Kl,CatmullRomCurve3:Zl,CubicBezierCurve:Ja,CubicBezierCurve3:Jl,EllipseCurve:Dr,LineCurve:$a,LineCurve3:$l,QuadraticBezierCurve:ja,QuadraticBezierCurve3:jl,SplineCurve:Qa}),ec=class extends gn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ql[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),i=this.getCurveLengths(),s=0;for(;s<i.length;){if(i[s]>=n){let a=i[s]-n,o=this.curves[s],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let i=0,s=this.curves;i<s.length;i++){let a=s[i],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(new Ql[i.type]().fromJSON(i))}return this}},eo=class extends ec{constructor(e){super(),this.type="Path",this.currentPoint=new pe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new $a(this.currentPoint.clone(),new pe(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){let s=new ja(this.currentPoint.clone(),new pe(e,t),new pe(n,i));return this.curves.push(s),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,s,a){let o=new Ja(this.currentPoint.clone(),new pe(e,t),new pe(n,i),new pe(s,a));return this.curves.push(o),this.currentPoint.set(s,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new Qa(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,s,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,i,s,a),this}absarc(e,t,n,i,s,a){return this.absellipse(e,t,n,n,i,s,a),this}ellipse(e,t,n,i,s,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,i,s,a,o,l),this}absellipse(e,t,n,i,s,a,o,l){let c=new Dr(e,t,n,i,s,a,o,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}};var Ui=class r extends Dt{constructor(e=1,t=1,n=1,i=32,s=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:l};let c=this;i=Math.floor(i),s=Math.floor(s);let h=[],u=[],f=[],d=[],g=0,x=[],m=n/2,p=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(h),this.setAttribute("position",new pt(u,3)),this.setAttribute("normal",new pt(f,3)),this.setAttribute("uv",new pt(d,2));function _(){let M=new R,D=new R,C=0,P=(t-e)/n;for(let V=0;V<=s;V++){let w=[],E=V/s,q=E*(t-e)+e;for(let Q=0;Q<=i;Q++){let le=Q/i,F=le*l+o,Y=Math.sin(F),J=Math.cos(F);D.x=q*Y,D.y=-E*n+m,D.z=q*J,u.push(D.x,D.y,D.z),M.set(Y,P,J).normalize(),f.push(M.x,M.y,M.z),d.push(le,1-E),w.push(g++)}x.push(w)}for(let V=0;V<i;V++)for(let w=0;w<s;w++){let E=x[w][V],q=x[w+1][V],Q=x[w+1][V+1],le=x[w][V+1];h.push(E,q,le),h.push(q,Q,le),C+=6}c.addGroup(p,C,0),p+=C}function v(M){let D=g,C=new pe,P=new R,V=0,w=M===!0?e:t,E=M===!0?1:-1;for(let Q=1;Q<=i;Q++)u.push(0,m*E,0),f.push(0,E,0),d.push(.5,.5),g++;let q=g;for(let Q=0;Q<=i;Q++){let F=Q/i*l+o,Y=Math.cos(F),J=Math.sin(F);P.x=w*J,P.y=m*E,P.z=w*Y,u.push(P.x,P.y,P.z),f.push(0,E,0),C.x=Y*.5+.5,C.y=J*.5*E+.5,d.push(C.x,C.y),g++}for(let Q=0;Q<i;Q++){let le=D+Q,F=q+Q;M===!0?h.push(F,F+1,le):h.push(F+1,F,le),V+=3}c.addGroup(p,V,M===!0?1:2),p+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Ur=class extends eo{constructor(e){super(e),this.uuid=Pn(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(new eo().fromJSON(i))}return this}},M_={triangulate:function(r,e,t=2){let n=e&&e.length,i=n?e[0]*t:r.length,s=Kf(r,0,i,t,!0),a=[];if(!s||s.next===s.prev)return a;let o,l,c,h,u,f,d;if(n&&(s=E_(r,e,s,t)),r.length>80*t){o=c=r[0],l=h=r[1];for(let g=t;g<i;g+=t)u=r[g],f=r[g+1],u<o&&(o=u),f<l&&(l=f),u>c&&(c=u),f>h&&(h=f);d=Math.max(c-o,h-l),d=d!==0?32767/d:0}return Nr(s,a,t,o,l,d,0),a}};function Kf(r,e,t,n,i){let s,a;if(i===O_(r,e,t,n)>0)for(s=e;s<t;s+=n)a=_f(s,r[s],r[s+1],a);else for(s=t-n;s>=e;s-=n)a=_f(s,r[s],r[s+1],a);return a&&po(a,a.next)&&(Or(a),a=a.next),a}function as(r,e){if(!r)return r;e||(e=r);let t=r,n;do if(n=!1,!t.steiner&&(po(t,t.next)||Lt(t.prev,t,t.next)===0)){if(Or(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Nr(r,e,t,n,i,s,a){if(!r)return;!a&&s&&L_(r,n,i,s);let o=r,l,c;for(;r.prev!==r.next;){if(l=r.prev,c=r.next,s?w_(r,n,i,s):S_(r)){e.push(l.i/t|0),e.push(r.i/t|0),e.push(c.i/t|0),Or(r),r=c.next,o=c.next;continue}if(r=c,r===o){a?a===1?(r=b_(as(r),e,t),Nr(r,e,t,n,i,s,2)):a===2&&T_(r,e,t,n,i,s):Nr(as(r),e,t,n,i,s,1);break}}}function S_(r){let e=r.prev,t=r,n=r.next;if(Lt(e,t,n)>=0)return!1;let i=e.x,s=t.x,a=n.x,o=e.y,l=t.y,c=n.y,h=i<s?i<a?i:a:s<a?s:a,u=o<l?o<c?o:c:l<c?l:c,f=i>s?i>a?i:a:s>a?s:a,d=o>l?o>c?o:c:l>c?l:c,g=n.next;for(;g!==e;){if(g.x>=h&&g.x<=f&&g.y>=u&&g.y<=d&&Bs(i,o,s,l,a,c,g.x,g.y)&&Lt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function w_(r,e,t,n){let i=r.prev,s=r,a=r.next;if(Lt(i,s,a)>=0)return!1;let o=i.x,l=s.x,c=a.x,h=i.y,u=s.y,f=a.y,d=o<l?o<c?o:c:l<c?l:c,g=h<u?h<f?h:f:u<f?u:f,x=o>l?o>c?o:c:l>c?l:c,m=h>u?h>f?h:f:u>f?u:f,p=tc(d,g,e,t,n),_=tc(x,m,e,t,n),v=r.prevZ,M=r.nextZ;for(;v&&v.z>=p&&M&&M.z<=_;){if(v.x>=d&&v.x<=x&&v.y>=g&&v.y<=m&&v!==i&&v!==a&&Bs(o,h,l,u,c,f,v.x,v.y)&&Lt(v.prev,v,v.next)>=0||(v=v.prevZ,M.x>=d&&M.x<=x&&M.y>=g&&M.y<=m&&M!==i&&M!==a&&Bs(o,h,l,u,c,f,M.x,M.y)&&Lt(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;v&&v.z>=p;){if(v.x>=d&&v.x<=x&&v.y>=g&&v.y<=m&&v!==i&&v!==a&&Bs(o,h,l,u,c,f,v.x,v.y)&&Lt(v.prev,v,v.next)>=0)return!1;v=v.prevZ}for(;M&&M.z<=_;){if(M.x>=d&&M.x<=x&&M.y>=g&&M.y<=m&&M!==i&&M!==a&&Bs(o,h,l,u,c,f,M.x,M.y)&&Lt(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function b_(r,e,t){let n=r;do{let i=n.prev,s=n.next.next;!po(i,s)&&Zf(i,n,n.next,s)&&Fr(i,s)&&Fr(s,i)&&(e.push(i.i/t|0),e.push(n.i/t|0),e.push(s.i/t|0),Or(n),Or(n.next),n=r=s),n=n.next}while(n!==r);return as(n)}function T_(r,e,t,n,i,s){let a=r;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&U_(a,o)){let l=Jf(a,o);a=as(a,a.next),l=as(l,l.next),Nr(a,e,t,n,i,s,0),Nr(l,e,t,n,i,s,0);return}o=o.next}a=a.next}while(a!==r)}function E_(r,e,t,n){let i=[],s,a,o,l,c;for(s=0,a=e.length;s<a;s++)o=e[s]*n,l=s<a-1?e[s+1]*n:r.length,c=Kf(r,o,l,n,!1),c===c.next&&(c.steiner=!0),i.push(D_(c));for(i.sort(A_),s=0;s<i.length;s++)t=R_(i[s],t);return t}function A_(r,e){return r.x-e.x}function R_(r,e){let t=C_(r,e);if(!t)return e;let n=Jf(t,r);return as(n,n.next),as(t,t.next)}function C_(r,e){let t=e,n=-1/0,i,s=r.x,a=r.y;do{if(a<=t.y&&a>=t.next.y&&t.next.y!==t.y){let f=t.x+(a-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(f<=s&&f>n&&(n=f,i=t.x<t.next.x?t:t.next,f===s))return i}t=t.next}while(t!==e);if(!i)return null;let o=i,l=i.x,c=i.y,h=1/0,u;t=i;do s>=t.x&&t.x>=l&&s!==t.x&&Bs(a<c?s:n,a,l,c,a<c?n:s,a,t.x,t.y)&&(u=Math.abs(a-t.y)/(s-t.x),Fr(t,r)&&(u<h||u===h&&(t.x>i.x||t.x===i.x&&P_(i,t)))&&(i=t,h=u)),t=t.next;while(t!==o);return i}function P_(r,e){return Lt(r.prev,r,e.prev)<0&&Lt(e.next,r,r.next)<0}function L_(r,e,t,n){let i=r;do i.z===0&&(i.z=tc(i.x,i.y,e,t,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==r);i.prevZ.nextZ=null,i.prevZ=null,I_(i)}function I_(r){let e,t,n,i,s,a,o,l,c=1;do{for(t=r,r=null,s=null,a=0;t;){for(a++,n=t,o=0,e=0;e<c&&(o++,n=n.nextZ,!!n);e++);for(l=c;o>0||l>0&&n;)o!==0&&(l===0||!n||t.z<=n.z)?(i=t,t=t.nextZ,o--):(i=n,n=n.nextZ,l--),s?s.nextZ=i:r=i,i.prevZ=s,s=i;t=n}s.nextZ=null,c*=2}while(a>1);return r}function tc(r,e,t,n,i){return r=(r-t)*i|0,e=(e-n)*i|0,r=(r|r<<8)&16711935,r=(r|r<<4)&252645135,r=(r|r<<2)&858993459,r=(r|r<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,r|e<<1}function D_(r){let e=r,t=r;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==r);return t}function Bs(r,e,t,n,i,s,a,o){return(i-a)*(e-o)>=(r-a)*(s-o)&&(r-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(s-o)>=(i-a)*(n-o)}function U_(r,e){return r.next.i!==e.i&&r.prev.i!==e.i&&!N_(r,e)&&(Fr(r,e)&&Fr(e,r)&&F_(r,e)&&(Lt(r.prev,r,e.prev)||Lt(r,e.prev,e))||po(r,e)&&Lt(r.prev,r,r.next)>0&&Lt(e.prev,e,e.next)>0)}function Lt(r,e,t){return(e.y-r.y)*(t.x-e.x)-(e.x-r.x)*(t.y-e.y)}function po(r,e){return r.x===e.x&&r.y===e.y}function Zf(r,e,t,n){let i=Ra(Lt(r,e,t)),s=Ra(Lt(r,e,n)),a=Ra(Lt(t,n,r)),o=Ra(Lt(t,n,e));return!!(i!==s&&a!==o||i===0&&Aa(r,t,e)||s===0&&Aa(r,n,e)||a===0&&Aa(t,r,n)||o===0&&Aa(t,e,n))}function Aa(r,e,t){return e.x<=Math.max(r.x,t.x)&&e.x>=Math.min(r.x,t.x)&&e.y<=Math.max(r.y,t.y)&&e.y>=Math.min(r.y,t.y)}function Ra(r){return r>0?1:r<0?-1:0}function N_(r,e){let t=r;do{if(t.i!==r.i&&t.next.i!==r.i&&t.i!==e.i&&t.next.i!==e.i&&Zf(t,t.next,r,e))return!0;t=t.next}while(t!==r);return!1}function Fr(r,e){return Lt(r.prev,r,r.next)<0?Lt(r,e,r.next)>=0&&Lt(r,r.prev,e)>=0:Lt(r,e,r.prev)<0||Lt(r,r.next,e)<0}function F_(r,e){let t=r,n=!1,i=(r.x+e.x)/2,s=(r.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&i<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==r);return n}function Jf(r,e){let t=new nc(r.i,r.x,r.y),n=new nc(e.i,e.x,e.y),i=r.next,s=e.prev;return r.next=e,e.prev=r,t.next=i,i.prev=t,n.next=t,t.prev=n,s.next=n,n.prev=s,n}function _f(r,e,t,n){let i=new nc(r,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function Or(r){r.next.prev=r.prev,r.prev.next=r.next,r.prevZ&&(r.prevZ.nextZ=r.nextZ),r.nextZ&&(r.nextZ.prevZ=r.prevZ)}function nc(r,e,t){this.i=r,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function O_(r,e,t,n){let i=0;for(let s=e,a=t-n;s<t;s+=n)i+=(r[a]-r[s])*(r[s+1]+r[a+1]),a=s;return i}var es=class r{static area(e){let t=e.length,n=0;for(let i=t-1,s=0;s<t;i=s++)n+=e[i].x*e[s].y-e[s].x*e[i].y;return n*.5}static isClockWise(e){return r.area(e)<0}static triangulateShape(e,t){let n=[],i=[],s=[];yf(e),Mf(n,e);let a=e.length;t.forEach(yf);for(let l=0;l<t.length;l++)i.push(a),a+=t[l].length,Mf(n,t[l]);let o=M_.triangulate(n,i);for(let l=0;l<o.length;l+=3)s.push(o.slice(l,l+3));return s}};function yf(r){let e=r.length;e>2&&r[e-1].equals(r[0])&&r.pop()}function Mf(r,e){for(let t=0;t<e.length;t++)r.push(e[t].x),r.push(e[t].y)}var to=class r extends Dt{constructor(e=new Ur([new pe(.5,.5),new pe(-.5,.5),new pe(-.5,-.5),new pe(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,i=[],s=[];for(let o=0,l=e.length;o<l;o++){let c=e[o];a(c)}this.setAttribute("position",new pt(i,3)),this.setAttribute("uv",new pt(s,2)),this.computeVertexNormals();function a(o){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1,f=t.bevelEnabled!==void 0?t.bevelEnabled:!0,d=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:d-.1,x=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,p=t.extrudePath,_=t.UVGenerator!==void 0?t.UVGenerator:B_,v,M=!1,D,C,P,V;p&&(v=p.getSpacedPoints(h),M=!0,f=!1,D=p.computeFrenetFrames(h,!1),C=new R,P=new R,V=new R),f||(m=0,d=0,g=0,x=0);let w=o.extractPoints(c),E=w.shape,q=w.holes;if(!es.isClockWise(E)){E=E.reverse();for(let L=0,me=q.length;L<me;L++){let te=q[L];es.isClockWise(te)&&(q[L]=te.reverse())}}let le=es.triangulateShape(E,q),F=E;for(let L=0,me=q.length;L<me;L++){let te=q[L];E=E.concat(te)}function Y(L,me,te){return me||console.error("THREE.ExtrudeGeometry: vec does not exist"),L.clone().addScaledVector(me,te)}let J=E.length,ae=le.length;function ie(L,me,te){let de,ne,Oe,we=L.x-me.x,T=L.y-me.y,y=te.x-L.x,X=te.y-L.y,ue=we*we+T*T,ce=we*X-T*y;if(Math.abs(ce)>Number.EPSILON){let he=Math.sqrt(ue),Ee=Math.sqrt(y*y+X*X),ve=me.x-T/he,Pe=me.y+we/he,Ve=te.x-X/Ee,Ye=te.y+y/Ee,fe=((Ve-ve)*X-(Ye-Pe)*y)/(we*X-T*y);de=ve+we*fe-L.x,ne=Pe+T*fe-L.y;let ht=de*de+ne*ne;if(ht<=2)return new pe(de,ne);Oe=Math.sqrt(ht/2)}else{let he=!1;we>Number.EPSILON?y>Number.EPSILON&&(he=!0):we<-Number.EPSILON?y<-Number.EPSILON&&(he=!0):Math.sign(T)===Math.sign(X)&&(he=!0),he?(de=-T,ne=we,Oe=Math.sqrt(ue)):(de=we,ne=T,Oe=Math.sqrt(ue/2))}return new pe(de/Oe,ne/Oe)}let ee=[];for(let L=0,me=F.length,te=me-1,de=L+1;L<me;L++,te++,de++)te===me&&(te=0),de===me&&(de=0),ee[L]=ie(F[L],F[te],F[de]);let oe=[],k,j=ee.concat();for(let L=0,me=q.length;L<me;L++){let te=q[L];k=[];for(let de=0,ne=te.length,Oe=ne-1,we=de+1;de<ne;de++,Oe++,we++)Oe===ne&&(Oe=0),we===ne&&(we=0),k[de]=ie(te[de],te[Oe],te[we]);oe.push(k),j=j.concat(k)}for(let L=0;L<m;L++){let me=L/m,te=d*Math.cos(me*Math.PI/2),de=g*Math.sin(me*Math.PI/2)+x;for(let ne=0,Oe=F.length;ne<Oe;ne++){let we=Y(F[ne],ee[ne],de);Se(we.x,we.y,-te)}for(let ne=0,Oe=q.length;ne<Oe;ne++){let we=q[ne];k=oe[ne];for(let T=0,y=we.length;T<y;T++){let X=Y(we[T],k[T],de);Se(X.x,X.y,-te)}}}let W=g+x;for(let L=0;L<J;L++){let me=f?Y(E[L],j[L],W):E[L];M?(P.copy(D.normals[0]).multiplyScalar(me.x),C.copy(D.binormals[0]).multiplyScalar(me.y),V.copy(v[0]).add(P).add(C),Se(V.x,V.y,V.z)):Se(me.x,me.y,0)}for(let L=1;L<=h;L++)for(let me=0;me<J;me++){let te=f?Y(E[me],j[me],W):E[me];M?(P.copy(D.normals[L]).multiplyScalar(te.x),C.copy(D.binormals[L]).multiplyScalar(te.y),V.copy(v[L]).add(P).add(C),Se(V.x,V.y,V.z)):Se(te.x,te.y,u/h*L)}for(let L=m-1;L>=0;L--){let me=L/m,te=d*Math.cos(me*Math.PI/2),de=g*Math.sin(me*Math.PI/2)+x;for(let ne=0,Oe=F.length;ne<Oe;ne++){let we=Y(F[ne],ee[ne],de);Se(we.x,we.y,u+te)}for(let ne=0,Oe=q.length;ne<Oe;ne++){let we=q[ne];k=oe[ne];for(let T=0,y=we.length;T<y;T++){let X=Y(we[T],k[T],de);M?Se(X.x,X.y+v[h-1].y,v[h-1].x+te):Se(X.x,X.y,u+te)}}}se(),ge();function se(){let L=i.length/3;if(f){let me=0,te=J*me;for(let de=0;de<ae;de++){let ne=le[de];Fe(ne[2]+te,ne[1]+te,ne[0]+te)}me=h+m*2,te=J*me;for(let de=0;de<ae;de++){let ne=le[de];Fe(ne[0]+te,ne[1]+te,ne[2]+te)}}else{for(let me=0;me<ae;me++){let te=le[me];Fe(te[2],te[1],te[0])}for(let me=0;me<ae;me++){let te=le[me];Fe(te[0]+J*h,te[1]+J*h,te[2]+J*h)}}n.addGroup(L,i.length/3-L,0)}function ge(){let L=i.length/3,me=0;Me(F,me),me+=F.length;for(let te=0,de=q.length;te<de;te++){let ne=q[te];Me(ne,me),me+=ne.length}n.addGroup(L,i.length/3-L,1)}function Me(L,me){let te=L.length;for(;--te>=0;){let de=te,ne=te-1;ne<0&&(ne=L.length-1);for(let Oe=0,we=h+m*2;Oe<we;Oe++){let T=J*Oe,y=J*(Oe+1),X=me+de+T,ue=me+ne+T,ce=me+ne+y,he=me+de+y;He(X,ue,ce,he)}}}function Se(L,me,te){l.push(L),l.push(me),l.push(te)}function Fe(L,me,te){Ne(L),Ne(me),Ne(te);let de=i.length/3,ne=_.generateTopUV(n,i,de-3,de-2,de-1);Be(ne[0]),Be(ne[1]),Be(ne[2])}function He(L,me,te,de){Ne(L),Ne(me),Ne(de),Ne(me),Ne(te),Ne(de);let ne=i.length/3,Oe=_.generateSideWallUV(n,i,ne-6,ne-3,ne-2,ne-1);Be(Oe[0]),Be(Oe[1]),Be(Oe[3]),Be(Oe[1]),Be(Oe[2]),Be(Oe[3])}function Ne(L){i.push(l[L*3+0]),i.push(l[L*3+1]),i.push(l[L*3+2])}function Be(L){s.push(L.x),s.push(L.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return z_(t,n,e)}static fromJSON(e,t){let n=[];for(let s=0,a=e.shapes.length;s<a;s++){let o=t[e.shapes[s]];n.push(o)}let i=e.options.extrudePath;return i!==void 0&&(e.options.extrudePath=new Ql[i.type]().fromJSON(i)),new r(n,e.options)}},B_={generateTopUV:function(r,e,t,n,i){let s=e[t*3],a=e[t*3+1],o=e[n*3],l=e[n*3+1],c=e[i*3],h=e[i*3+1];return[new pe(s,a),new pe(o,l),new pe(c,h)]},generateSideWallUV:function(r,e,t,n,i,s){let a=e[t*3],o=e[t*3+1],l=e[t*3+2],c=e[n*3],h=e[n*3+1],u=e[n*3+2],f=e[i*3],d=e[i*3+1],g=e[i*3+2],x=e[s*3],m=e[s*3+1],p=e[s*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new pe(a,1-l),new pe(c,1-u),new pe(f,1-g),new pe(x,1-p)]:[new pe(o,1-l),new pe(h,1-u),new pe(d,1-g),new pe(m,1-p)]}};function z_(r,e,t){if(t.shapes=[],Array.isArray(r))for(let n=0,i=r.length;n<i;n++){let s=r[n];t.shapes.push(s.uuid)}else t.shapes.push(r.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var os=class r extends Dt{constructor(e=1,t=32,n=16,i=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],u=new R,f=new R,d=[],g=[],x=[],m=[];for(let p=0;p<=n;p++){let _=[],v=p/n,M=0;p===0&&a===0?M=.5/t:p===n&&l===Math.PI&&(M=-.5/t);for(let D=0;D<=t;D++){let C=D/t;u.x=-e*Math.cos(i+C*s)*Math.sin(a+v*o),u.y=e*Math.cos(a+v*o),u.z=e*Math.sin(i+C*s)*Math.sin(a+v*o),g.push(u.x,u.y,u.z),f.copy(u).normalize(),x.push(f.x,f.y,f.z),m.push(C+M,1-v),_.push(c++)}h.push(_)}for(let p=0;p<n;p++)for(let _=0;_<t;_++){let v=h[p][_+1],M=h[p][_],D=h[p+1][_],C=h[p+1][_+1];(p!==0||a>0)&&d.push(v,M,C),(p!==n-1||l<Math.PI)&&d.push(M,D,C)}this.setIndex(d),this.setAttribute("position",new pt(g,3)),this.setAttribute("normal",new pt(x,3)),this.setAttribute("uv",new pt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Qe=class extends an{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Re(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Re(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ho,this.normalScale=new pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Ln=class extends Qe{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new pe(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Zt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Re(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Re(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Re(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}},Qs=class extends an{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Re(16777215),this.specular=new Re(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Re(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ho,this.normalScale=new pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=oo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var no=class extends an{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Re(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Re(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ho,this.normalScale=new pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=oo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function Ca(r,e,t){return!r||!t&&r.constructor===e?r:typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r)}function k_(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function H_(r){function e(i,s){return r[i]-r[s]}let t=r.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function Sf(r,e,t){let n=r.length,i=new r.constructor(n);for(let s=0,a=0;a!==n;++s){let o=t[s]*e;for(let l=0;l!==e;++l)i[a++]=r[o+l]}return i}function $f(r,e,t,n){let i=1,s=r[0];for(;s!==void 0&&s[n]===void 0;)s=r[i++];if(s===void 0)return;let a=s[n];if(a!==void 0)if(Array.isArray(a))do a=s[n],a!==void 0&&(e.push(s.time),t.push.apply(t,a)),s=r[i++];while(s!==void 0);else if(a.toArray!==void 0)do a=s[n],a!==void 0&&(e.push(s.time),a.toArray(t,t.length)),s=r[i++];while(s!==void 0);else do a=s[n],a!==void 0&&(e.push(s.time),t.push(a)),s=r[i++];while(s!==void 0)}var Ni=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],s=t[n-1];e:{t:{let a;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(s=i,i=t[++n],e<i)break t}a=t.length;break n}if(!(e>=s)){let o=t[1];e<o&&(n=2,s=o);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=s,s=t[--n-1],e>=s)break t}a=n,n=0;break n}break e}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let a=0;a!==i;++a)t[a]=n[s+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},ic=class extends Ni{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Us,endingEnd:Us}}intervalChanged_(e,t,n){let i=this.parameterPositions,s=e-2,a=e+1,o=i[s],l=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case Ns:s=e,o=2*t-n;break;case Ia:s=i.length-2,o=t+i[s]-i[s+1];break;default:s=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Ns:a=e,l=2*n-t;break;case Ia:a=1,l=n+i[1]-i[0];break;default:a=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=s*h,this._offsetNext=a*h}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,d=this._weightNext,g=(n-t)/(i-t),x=g*g,m=x*g,p=-f*m+2*f*x-f*g,_=(1+f)*m+(-1.5-2*f)*x+(-.5+f)*g+1,v=(-1-d)*m+(1.5+d)*x+.5*g,M=d*m-d*x;for(let D=0;D!==o;++D)s[D]=p*a[h+D]+_*a[c+D]+v*a[l+D]+M*a[u+D];return s}},io=class extends Ni{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(i-t),u=1-h;for(let f=0;f!==o;++f)s[f]=a[c+f]*u+a[l+f]*h;return s}},sc=class extends Ni{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}},In=class{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ca(t,this.TimeBufferType),this.values=Ca(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ca(e.times,Array),values:Ca(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new sc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new io(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ic(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Ws:t=this.InterpolantFactoryMethodDiscrete;break;case ns:t=this.InterpolantFactoryMethodLinear;break;case Yo:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ws;case this.InterpolantFactoryMethodLinear:return ns;case this.InterpolantFactoryMethodSmooth:return Yo}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){let n=this.times,i=n.length,s=0,a=i-1;for(;s!==i&&n[s]<e;)++s;for(;a!==-1&&n[a]>t;)--a;if(++a,s!==0||a!==i){s>=a&&(a=Math.max(a,1),s=a-1);let o=this.getValueSize();this.times=n.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,i=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(i!==void 0&&k_(i))for(let o=0,l=i.length;o!==l;++o){let c=i[o];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Yo,s=e.length-1,a=1;for(let o=1;o<s;++o){let l=!1,c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(i)l=!0;else{let u=o*n,f=u-n,d=u+n;for(let g=0;g!==n;++g){let x=t[u+g];if(x!==t[f+g]||x!==t[d+g]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let u=o*n,f=a*n;for(let d=0;d!==n;++d)t[f+d]=t[u+d]}++a}}if(s>0){e[a]=e[s];for(let o=s*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}};In.prototype.TimeBufferType=Float32Array;In.prototype.ValueBufferType=Float32Array;In.prototype.DefaultInterpolation=ns;var Fi=class extends In{};Fi.prototype.ValueTypeName="bool";Fi.prototype.ValueBufferType=Array;Fi.prototype.DefaultInterpolation=Ws;Fi.prototype.InterpolantFactoryMethodLinear=void 0;Fi.prototype.InterpolantFactoryMethodSmooth=void 0;var so=class extends In{};so.prototype.ValueTypeName="color";var Hn=class extends In{};Hn.prototype.ValueTypeName="number";var rc=class extends Ni{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(i-t),c=e*o;for(let h=c+o;c!==h;c+=4)bt.slerpFlat(s,0,a,c-o,a,c,l);return s}},xn=class extends In{InterpolantFactoryMethodLinear(e){return new rc(this.times,this.values,this.getValueSize(),e)}};xn.prototype.ValueTypeName="quaternion";xn.prototype.DefaultInterpolation=ns;xn.prototype.InterpolantFactoryMethodSmooth=void 0;var Oi=class extends In{};Oi.prototype.ValueTypeName="string";Oi.prototype.ValueBufferType=Array;Oi.prototype.DefaultInterpolation=Ws;Oi.prototype.InterpolantFactoryMethodLinear=void 0;Oi.prototype.InterpolantFactoryMethodSmooth=void 0;var Dn=class extends In{};Dn.prototype.ValueTypeName="vector";var pi=class{constructor(e,t=-1,n,i=vc){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=Pn(),this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,i=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(G_(n[a]).scale(i));let s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s}static toJSON(e){let t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let s=0,a=n.length;s!==a;++s)t.push(In.toJSON(n[s]));return i}static CreateFromMorphTargetSequence(e,t,n,i){let s=t.length,a=[];for(let o=0;o<s;o++){let l=[],c=[];l.push((o+s-1)%s,o,(o+1)%s),c.push(0,1,0);let h=H_(l);l=Sf(l,1,h),c=Sf(c,1,h),!i&&l[0]===0&&(l.push(s),c.push(c[0])),a.push(new Hn(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let i={},s=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){let c=e[o],h=c.name.match(s);if(h&&h.length>1){let u=h[1],f=i[u];f||(i[u]=f=[]),f.push(c)}}let a=[];for(let o in i)a.push(this.CreateFromMorphTargetSequence(o,i[o],t,n));return a}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let n=function(u,f,d,g,x){if(d.length!==0){let m=[],p=[];$f(d,m,p,g),m.length!==0&&x.push(new u(f,m,p))}},i=[],s=e.name||"default",a=e.fps||30,o=e.blendMode,l=e.length||-1,c=e.hierarchy||[];for(let u=0;u<c.length;u++){let f=c[u].keys;if(!(!f||f.length===0))if(f[0].morphTargets){let d={},g;for(g=0;g<f.length;g++)if(f[g].morphTargets)for(let x=0;x<f[g].morphTargets.length;x++)d[f[g].morphTargets[x]]=-1;for(let x in d){let m=[],p=[];for(let _=0;_!==f[g].morphTargets.length;++_){let v=f[g];m.push(v.time),p.push(v.morphTarget===x?1:0)}i.push(new Hn(".morphTargetInfluence["+x+"]",m,p))}l=d.length*a}else{let d=".bones["+t[u].name+"]";n(Dn,d+".position",f,"pos",i),n(xn,d+".quaternion",f,"rot",i),n(Dn,d+".scale",f,"scl",i)}}return i.length===0?null:new this(s,l,i,o)}resetDuration(){let e=this.tracks,t=0;for(let n=0,i=e.length;n!==i;++n){let s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}};function V_(r){switch(r.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Hn;case"vector":case"vector2":case"vector3":case"vector4":return Dn;case"color":return so;case"quaternion":return xn;case"bool":case"boolean":return Fi;case"string":return Oi}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+r)}function G_(r){if(r.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=V_(r.type);if(r.times===void 0){let t=[],n=[];$f(r.keys,t,n,"value"),r.times=t,r.values=n}return e.parse!==void 0?e.parse(r):new e(r.name,r.times,r.values,r.interpolation)}var bi={enabled:!1,files:{},add:function(r,e){this.enabled!==!1&&(this.files[r]=e)},get:function(r){if(this.enabled!==!1)return this.files[r]},remove:function(r){delete this.files[r]},clear:function(){this.files={}}},Br=class{constructor(e,t,n){let i=this,s=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){o++,s===!1&&i.onStart!==void 0&&i.onStart(h,a,o),s=!0},this.itemEnd=function(h){a++,i.onProgress!==void 0&&i.onProgress(h,a,o),a===o&&(s=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,f=c.length;u<f;u+=2){let d=c[u],g=c[u+1];if(d.global&&(d.lastIndex=0),d.test(h))return g}return null}}},W_=new Br,bn=class{constructor(e){this.manager=e!==void 0?e:W_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(i,s){n.load(e,i,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};bn.DEFAULT_MATERIAL_NAME="__DEFAULT";var si={},ac=class extends Error{constructor(e,t){super(e),this.response=t}},ls=class extends bn{constructor(e){super(e)}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=bi.get(e);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(si[e]!==void 0){si[e].push({onLoad:t,onProgress:n,onError:i});return}si[e]=[],si[e].push({onLoad:t,onProgress:n,onError:i});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let h=si[e],u=c.body.getReader(),f=c.headers.get("Content-Length")||c.headers.get("X-File-Size"),d=f?parseInt(f):0,g=d!==0,x=0,m=new ReadableStream({start(p){_();function _(){u.read().then(({done:v,value:M})=>{if(v)p.close();else{x+=M.byteLength;let D=new ProgressEvent("progress",{lengthComputable:g,loaded:x,total:d});for(let C=0,P=h.length;C<P;C++){let V=h[C];V.onProgress&&V.onProgress(D)}p.enqueue(M),_()}})}}});return new Response(m)}else throw new ac(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return c.json();default:if(o===void 0)return c.text();{let u=/charset="?([^;"\s]*)"?/i.exec(o),f=u&&u[1]?u[1].toLowerCase():void 0,d=new TextDecoder(f);return c.arrayBuffer().then(g=>d.decode(g))}}}).then(c=>{bi.add(e,c);let h=si[e];delete si[e];for(let u=0,f=h.length;u<f;u++){let d=h[u];d.onLoad&&d.onLoad(c)}}).catch(c=>{let h=si[e];if(h===void 0)throw this.manager.itemError(e),c;delete si[e];for(let u=0,f=h.length;u<f;u++){let d=h[u];d.onError&&d.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}};var oc=class extends bn{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=this,a=bi.get(e);if(a!==void 0)return s.manager.itemStart(e),setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a;let o=Rr("img");function l(){h(),bi.add(e,this),t&&t(this),s.manager.itemEnd(e)}function c(u){h(),i&&i(u),s.manager.itemError(e),s.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),s.manager.itemStart(e),o.src=e,o}};var er=class extends bn{constructor(e){super(e)}load(e,t,n,i){let s=new It,a=new oc(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){s.image=o,s.needsUpdate=!0,t!==void 0&&t(s)},n,i),s}},cs=class extends Mt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Re(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}},zr=class extends cs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Mt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Re(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},wl=new Ie,wf=new R,bf=new R,kr=class{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new pe(512,512),this.map=null,this.mapPass=null,this.matrix=new Ie,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Cr,this._frameExtents=new pe(1,1),this._viewportCount=1,this._viewports=[new dt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;wf.setFromMatrixPosition(e.matrixWorld),t.position.copy(wf),bf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(bf),t.updateMatrixWorld(),wl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(wl),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(wl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},lc=class extends kr{constructor(){super(new Ft(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){let t=this.camera,n=Xs*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height,s=e.distance||t.far;(n!==t.fov||i!==t.aspect||s!==t.far)&&(t.fov=n,t.aspect=i,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},tr=class extends cs{constructor(e,t,n=0,i=Math.PI/3,s=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Mt.DEFAULT_UP),this.updateMatrix(),this.target=new Mt,this.distance=n,this.angle=i,this.penumbra=s,this.decay=a,this.map=null,this.shadow=new lc}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Tf=new Ie,vr=new R,bl=new R,cc=class extends kr{constructor(){super(new Ft(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new pe(4,2),this._viewportCount=6,this._viewports=[new dt(2,1,1,1),new dt(0,1,1,1),new dt(3,1,1,1),new dt(1,1,1,1),new dt(3,0,1,1),new dt(1,0,1,1)],this._cubeDirections=[new R(1,0,0),new R(-1,0,0),new R(0,0,1),new R(0,0,-1),new R(0,1,0),new R(0,-1,0)],this._cubeUps=[new R(0,1,0),new R(0,1,0),new R(0,1,0),new R(0,1,0),new R(0,0,1),new R(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,i=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),vr.setFromMatrixPosition(e.matrixWorld),n.position.copy(vr),bl.copy(n.position),bl.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(bl),n.updateMatrixWorld(),i.makeTranslation(-vr.x,-vr.y,-vr.z),Tf.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Tf)}},Vn=class extends cs{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new cc}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},hc=class extends kr{constructor(){super(new Li(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},mi=class extends cs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Mt.DEFAULT_UP),this.updateMatrix(),this.target=new Mt,this.shadow=new hc}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},ro=class extends cs{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var Zn=class{static decodeText(e){if(typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,i=e.length;n<i;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var ao=class extends bn{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=this,a=bi.get(e);if(a!==void 0){if(s.manager.itemStart(e),a.then){a.then(c=>{t&&t(c),s.manager.itemEnd(e)}).catch(c=>{i&&i(c)});return}return setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a}let o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader;let l=fetch(e,o).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(c){return bi.add(e,c),t&&t(c),s.manager.itemEnd(e),c}).catch(function(c){i&&i(c),bi.remove(e),s.manager.itemError(e),s.manager.itemEnd(e)});bi.add(e,l),s.manager.itemStart(e)}};var uc=class{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,s,a;switch(t){case"quaternion":i=this._slerp,s=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,s=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,s=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=s,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let n=this.buffer,i=this.valueSize,s=e*i+i,a=this.cumulativeWeight;if(a===0){for(let o=0;o!==i;++o)n[s+o]=n[o];a=t}else{a+=t;let o=t/a;this._mixBufferRegion(n,s,0,o,i)}this.cumulativeWeight=a}accumulateAdditive(e){let t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,n=this.buffer,i=e*t+t,s=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,s<1){let l=t*this._origIndex;this._mixBufferRegion(n,i,l,1-s,t)}a>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){o.setValue(n,i);break}}saveOriginalState(){let e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let s=n,a=i;s!==a;++s)t[s]=t[i+s%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,s){if(i>=.5)for(let a=0;a!==s;++a)e[t+a]=e[n+a]}_slerp(e,t,n,i){bt.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,s){let a=this._workIndex*s;bt.multiplyQuaternionsFlat(e,a,e,t,e,n),bt.slerpFlat(e,t,e,t,e,a,i)}_lerp(e,t,n,i,s){let a=1-i;for(let o=0;o!==s;++o){let l=t+o;e[l]=e[l]*a+e[n+o]*i}}_lerpAdditive(e,t,n,i,s){for(let a=0;a!==s;++a){let o=t+a;e[o]=e[o]+e[n+a]*i}}},wc="\\[\\]\\.:\\/",X_=new RegExp("["+wc+"]","g"),bc="[^"+wc+"]",q_="[^"+wc.replace("\\.","")+"]",Y_=/((?:WC+[\/:])*)/.source.replace("WC",bc),K_=/(WCOD+)?/.source.replace("WCOD",q_),Z_=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",bc),J_=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",bc),$_=new RegExp("^"+Y_+K_+Z_+J_+"$"),j_=["material","materials","bones","map"],fc=class{constructor(e,t,n){let i=n||mt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},mt=class r{constructor(e,t,n){this.path=t,this.parsedPath=n||r.parseTrackName(t),this.node=r.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new r.Composite(e,t,n):new r(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(X_,"")}static parseTrackName(e){let t=$_.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let s=n.nodeName.substring(i+1);j_.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let a=0;a<s.length;a++){let o=s[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,i=t.propertyName,s=t.propertyIndex;if(e||(e=r.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[i];if(a===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};mt.Composite=fc;mt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};mt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};mt.prototype.GetterByBindingType=[mt.prototype._getValue_direct,mt.prototype._getValue_array,mt.prototype._getValue_arrayElement,mt.prototype._getValue_toArray];mt.prototype.SetterByBindingTypeAndVersioning=[[mt.prototype._setValue_direct,mt.prototype._setValue_direct_setNeedsUpdate,mt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[mt.prototype._setValue_array,mt.prototype._setValue_array_setNeedsUpdate,mt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[mt.prototype._setValue_arrayElement,mt.prototype._setValue_arrayElement_setNeedsUpdate,mt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[mt.prototype._setValue_fromArray,mt.prototype._setValue_fromArray_setNeedsUpdate,mt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var dc=class{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;let s=t.tracks,a=s.length,o=new Array(a),l={endingStart:Us,endingEnd:Us};for(let c=0;c!==a;++c){let h=s[c].createInterpolant(null);o[c]=h,h.settings=l}this._interpolantSettings=l,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=qp,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n){if(e.fadeOut(t),this.fadeIn(t),n){let i=this._clip.duration,s=e._clip.duration,a=s/i,o=i/s;e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n){return e.crossFadeFrom(this,t,n)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){let i=this._mixer,s=i.time,a=this.timeScale,o=this._timeScaleInterpolant;o===null&&(o=i._lendControlInterpolant(),this._timeScaleInterpolant=o);let l=o.parameterPositions,c=o.sampleValues;return l[0]=s,l[1]=s+n,c[0]=e/a,c[1]=t/a,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}let s=this._startTime;if(s!==null){let l=(e-s)*n;l<0||n===0?t=0:(this._startTime=null,t=n*l)}t*=this._updateTimeScale(e);let a=this._updateTime(t),o=this._updateWeight(e);if(o>0){let l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case Kp:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulateAdditive(o);break;case vc:default:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulate(i,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let n=this._weightInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,n=this.loop,i=this.time+e,s=this._loopCount,a=n===Yp;if(e===0)return s===-1?i:a&&(s&1)===1?t-i:i;if(n===Xp){s===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(s===-1&&(e>=0?(s=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),i>=t||i<0){let o=Math.floor(i/t);i-=t*o,s+=Math.abs(o);let l=this.repetitions-s;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){let c=e<0;this._setEndings(c,!c,a)}else this._setEndings(!1,!1,a);this._loopCount=s,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this.time=i;if(a&&(s&1)===1)return t-i}return i}_setEndings(e,t,n){let i=this._interpolantSettings;n?(i.endingStart=Ns,i.endingEnd=Ns):(e?i.endingStart=this.zeroSlopeAtStart?Ns:Us:i.endingStart=Ia,t?i.endingEnd=this.zeroSlopeAtEnd?Ns:Us:i.endingEnd=Ia)}_scheduleFading(e,t,n){let i=this._mixer,s=i.time,a=this._weightInterpolant;a===null&&(a=i._lendControlInterpolant(),this._weightInterpolant=a);let o=a.parameterPositions,l=a.sampleValues;return o[0]=s,l[0]=t,o[1]=s+e,l[1]=n,this}},Q_=new Float32Array(1),Hr=class extends hi{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){let n=e._localRoot||this._root,i=e._clip.tracks,s=i.length,a=e._propertyBindings,o=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName,h=c[l];h===void 0&&(h={},c[l]=h);for(let u=0;u!==s;++u){let f=i[u],d=f.name,g=h[d];if(g!==void 0)++g.referenceCount,a[u]=g;else{if(g=a[u],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,l,d));continue}let x=t&&t._propertyBindings[u].binding.parsedPath;g=new uc(mt.create(n,d,x),f.ValueTypeName,f.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,l,d),a[u]=g}o[u].resultBuffer=g.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let n=(e._localRoot||this._root).uuid,i=e._clip.uuid,s=this._actionsByClip[i];this._bindAction(e,s&&s.knownActions[0]),this._addInactiveAction(e,i,n)}let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let s=t[n];s.useCount++===0&&(this._lendBinding(s),s.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let s=t[n];--s.useCount===0&&(s.restoreOriginalState(),this._takeBackBinding(s))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){let i=this._actions,s=this._actionsByClip,a=s[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,s[t]=a;else{let o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=i.length,i.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){let t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;let s=e._clip.uuid,a=this._actionsByClip,o=a[s],l=o.knownActions,c=l[l.length-1],h=e._byClipCacheIndex;c._byClipCacheIndex=h,l[h]=c,l.pop(),e._byClipCacheIndex=null;let u=o.actionByRoot,f=(e._localRoot||this._root).uuid;delete u[f],l.length===0&&delete a[s],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let s=t[n];--s.referenceCount===0&&this._removeInactiveBinding(s)}}_lendAction(e){let t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackAction(e){let t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_addInactiveBinding(e,t,n){let i=this._bindingsByRootAndName,s=this._bindings,a=i[t];a===void 0&&(a={},i[t]=a),a[n]=e,e._cacheIndex=s.length,s.push(e)}_removeInactiveBinding(e){let t=this._bindings,n=e.binding,i=n.rootNode.uuid,s=n.path,a=this._bindingsByRootAndName,o=a[i],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete o[s],Object.keys(o).length===0&&delete a[i]}_lendBinding(e){let t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackBinding(e){let t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,n=e[t];return n===void 0&&(n=new io(new Float32Array(2),new Float32Array(2),1,Q_),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){let t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,s=t[i];e.__cacheIndex=i,t[i]=e,s.__cacheIndex=n,t[n]=s}clipAction(e,t,n){let i=t||this._root,s=i.uuid,a=typeof e=="string"?pi.findByName(i,e):e,o=a!==null?a.uuid:e,l=this._actionsByClip[o],c=null;if(n===void 0&&(a!==null?n=a.blendMode:n=vc),l!==void 0){let u=l.actionByRoot[s];if(u!==void 0&&u.blendMode===n)return u;c=l.knownActions[0],a===null&&(a=c._clip)}if(a===null)return null;let h=new dc(this,a,t,n);return this._bindAction(h,c),this._addInactiveAction(h,o,s),h}existingAction(e,t){let n=t||this._root,i=n.uuid,s=typeof e=="string"?pi.findByName(n,e):e,a=s?s.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[i]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;let t=this._actions,n=this._nActiveActions,i=this.time+=e,s=Math.sign(e),a=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(i,e,s,a);let o=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)o[c].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,n=e.uuid,i=this._actionsByClip,s=i[n];if(s!==void 0){let a=s.knownActions;for(let o=0,l=a.length;o!==l;++o){let c=a[o];this._deactivateAction(c);let h=c._cacheIndex,u=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,u._cacheIndex=h,t[h]=u,t.pop(),this._removeInactiveBindingsForAction(c)}delete i[n]}}uncacheRoot(e){let t=e.uuid,n=this._actionsByClip;for(let a in n){let o=n[a].actionByRoot,l=o[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}let i=this._bindingsByRootAndName,s=i[t];if(s!==void 0)for(let a in s){let o=s[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){let n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"160"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="160");var N={state:"menu",time:0,settings:{sens:1,fov:78,diff:1,quality:"high"},scene:null,camera:null,renderer:null,world:null,audio:null,player:null,bots:[],actors:[],scores:[0,0],scoreLimit:40,matchTime:0,matchLimit:600,shake:0,debug:!1},Tt=(r,e,t)=>r<e?e:r>t?t:r,Tn=(r,e,t)=>r+(e-r)*t,xe=(r,e)=>r+Math.random()*(e-r),jt=(r,e,t,n)=>Tn(r,e,1-Math.exp(-t*n));function Tc(r,e){let t=(e-r)%(Math.PI*2);return t>Math.PI&&(t-=Math.PI*2),t<-Math.PI&&(t+=Math.PI*2),t}function Ec(r,e){if(e===Nf)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),r;if(e===Vr||e===co){let t=r.getIndex();if(t===null){let a=[],o=r.getAttribute("position");if(o!==void 0){for(let l=0;l<o.count;l++)a.push(l);r.setIndex(a),t=r.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),r}let n=t.count-2,i=[];if(e===Vr)for(let a=1;a<=n;a++)i.push(t.getX(0)),i.push(t.getX(a)),i.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2===0?(i.push(t.getX(a)),i.push(t.getX(a+1)),i.push(t.getX(a+2))):(i.push(t.getX(a+2)),i.push(t.getX(a+1)),i.push(t.getX(a)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let s=r.clone();return s.setIndex(i),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),r}var mo=class extends bn{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Dc(t)}),this.register(function(t){return new Vc(t)}),this.register(function(t){return new Gc(t)}),this.register(function(t){return new Wc(t)}),this.register(function(t){return new Nc(t)}),this.register(function(t){return new Fc(t)}),this.register(function(t){return new Oc(t)}),this.register(function(t){return new Bc(t)}),this.register(function(t){return new Ic(t)}),this.register(function(t){return new zc(t)}),this.register(function(t){return new Uc(t)}),this.register(function(t){return new Hc(t)}),this.register(function(t){return new kc(t)}),this.register(function(t){return new Pc(t)}),this.register(function(t){return new Xc(t)}),this.register(function(t){return new qc(t)})}load(e,t,n,i){let s=this,a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){let c=Zn.extractUrlBase(e);a=Zn.resolveURL(c,this.path)}else a=Zn.extractUrlBase(e);this.manager.itemStart(e);let o=function(c){i?i(c):console.error(c),s.manager.itemError(e),s.manager.itemEnd(e)},l=new ls(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{s.parse(c,a,function(h){t(h),s.manager.itemEnd(e)},o)}catch(h){o(h)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setDDSLoader(){throw new Error('THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".')}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let s,a={},o={},l=new TextDecoder;if(typeof e=="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===nd){try{a[ut.KHR_BINARY_GLTF]=new Yc(e)}catch(u){i&&i(u);return}s=JSON.parse(a[ut.KHR_BINARY_GLTF].content)}else s=JSON.parse(l.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let c=new eh(s,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){let u=this.pluginCallbacks[h](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[u.name]=u,a[u.name]=!0}if(s.extensionsUsed)for(let h=0;h<s.extensionsUsed.length;++h){let u=s.extensionsUsed[h],f=s.extensionsRequired||[];switch(u){case ut.KHR_MATERIALS_UNLIT:a[u]=new Lc;break;case ut.KHR_DRACO_MESH_COMPRESSION:a[u]=new Kc(s,this.dracoLoader);break;case ut.KHR_TEXTURE_TRANSFORM:a[u]=new Zc;break;case ut.KHR_MESH_QUANTIZATION:a[u]=new Jc;break;default:f.indexOf(u)>=0&&o[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(a),c.setPlugins(o),c.parse(n,i)}parseAsync(e,t){let n=this;return new Promise(function(i,s){n.parse(e,t,i,s)})}};function ey(){let r={};return{get:function(e){return r[e]},add:function(e,t){r[e]=t},remove:function(e){delete r[e]},removeAll:function(){r={}}}}var ut={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},Pc=class{constructor(e){this.parser=e,this.name=ut.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){let s=t[n];s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,i=t.cache.get(n);if(i)return i;let s=t.json,l=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e],c,h=new Re(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],Vt);let u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new mi(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Vn(h),c.distance=u;break;case"spot":c=new tr(h),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),c.decay=2,zi(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),i=Promise.resolve(c),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,s=n.json.nodes[e],o=(s.extensions&&s.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(l){return n._getNodeRef(t.cache,o,l)})}},Lc=class{constructor(){this.name=ut.KHR_MATERIALS_UNLIT}getMaterialType(){return Jt}extendParams(e,t,n){let i=[];e.color=new Re(1,1,1),e.opacity=1;let s=t.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){let a=s.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],Vt),e.opacity=a[3]}s.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",s.baseColorTexture,it))}return Promise.all(i)}},Ic=class{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=i.extensions[this.name].emissiveStrength;return s!==void 0&&(t.emissiveIntensity=s),Promise.resolve()}},Dc=class{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ln}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],a=i.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(s.push(n.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){let o=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new pe(o,o)}return Promise.all(s)}},Uc=class{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ln}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],a=i.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceMap",a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceThicknessMap",a.iridescenceThicknessTexture)),Promise.all(s)}},Nc=class{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_SHEEN}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ln}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[];t.sheenColor=new Re(0,0,0),t.sheenRoughness=0,t.sheen=1;let a=i.extensions[this.name];if(a.sheenColorFactor!==void 0){let o=a.sheenColorFactor;t.sheenColor.setRGB(o[0],o[1],o[2],Vt)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&s.push(n.assignTexture(t,"sheenColorMap",a.sheenColorTexture,it)),a.sheenRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(s)}},Fc=class{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ln}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],a=i.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&s.push(n.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(s)}},Oc=class{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_VOLUME}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ln}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],a=i.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&s.push(n.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;let o=a.attenuationColor||[1,1,1];return t.attenuationColor=new Re().setRGB(o[0],o[1],o[2],Vt),Promise.all(s)}},Bc=class{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_IOR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ln}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=i.extensions[this.name];return t.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}},zc=class{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_SPECULAR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ln}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],a=i.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&s.push(n.assignTexture(t,"specularIntensityMap",a.specularTexture));let o=a.specularColorFactor||[1,1,1];return t.specularColor=new Re().setRGB(o[0],o[1],o[2],Vt),a.specularColorTexture!==void 0&&s.push(n.assignTexture(t,"specularColorMap",a.specularColorTexture,it)),Promise.all(s)}},kc=class{constructor(e){this.parser=e,this.name=ut.EXT_MATERIALS_BUMP}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ln}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],a=i.extensions[this.name];return t.bumpScale=a.bumpFactor!==void 0?a.bumpFactor:1,a.bumpTexture!==void 0&&s.push(n.assignTexture(t,"bumpMap",a.bumpTexture)),Promise.all(s)}},Hc=class{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Ln}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],a=i.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&s.push(n.assignTexture(t,"anisotropyMap",a.anisotropyTexture)),Promise.all(s)}},Vc=class{constructor(e){this.parser=e,this.name=ut.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;let s=i.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,s.source,a)}},Gc=class{constructor(e){this.parser=e,this.name=ut.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){let t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;let a=s.extensions[t],o=i.images[a.source],l=n.textureLoader;if(o.uri){let c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,a.source,l);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){let t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}},Wc=class{constructor(e){this.parser=e,this.name=ut.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){let t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;let a=s.extensions[t],o=i.images[a.source],l=n.textureLoader;if(o.uri){let c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,a.source,l);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){let t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}},Xc=class{constructor(e){this.name=ut.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let i=n.extensions[this.name],s=this.parser.getDependency("buffer",i.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return s.then(function(o){let l=i.byteOffset||0,c=i.byteLength||0,h=i.count,u=i.byteStride,f=new Uint8Array(o,l,c);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(h,u,f,i.mode,i.filter).then(function(d){return d.buffer}):a.ready.then(function(){let d=new ArrayBuffer(h*u);return a.decodeGltfBuffer(new Uint8Array(d),h,u,f,i.mode,i.filter),d})})}else return null}},qc=class{constructor(e){this.name=ut.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let i=t.meshes[n.mesh];for(let c of i.primitives)if(c.mode!==Un.TRIANGLES&&c.mode!==Un.TRIANGLE_STRIP&&c.mode!==Un.TRIANGLE_FAN&&c.mode!==void 0)return null;let a=n.extensions[this.name].attributes,o=[],l={};for(let c in a)o.push(this.parser.getDependency("accessor",a[c]).then(h=>(l[c]=h,l[c])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(c=>{let h=c.pop(),u=h.isGroup?h.children:[h],f=c[0].count,d=[];for(let g of u){let x=new Ie,m=new R,p=new bt,_=new R(1,1,1),v=new qa(g.geometry,g.material,f);for(let M=0;M<f;M++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,M),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,M),l.SCALE&&_.fromBufferAttribute(l.SCALE,M),v.setMatrixAt(M,x.compose(m,p,_));for(let M in l)if(M==="_COLOR_0"){let D=l[M];v.instanceColor=new ss(D.array,D.itemSize,D.normalized)}else M!=="TRANSLATION"&&M!=="ROTATION"&&M!=="SCALE"&&g.geometry.setAttribute(M,l[M]);Mt.prototype.copy.call(v,g),this.parser.assignFinalMaterial(v),d.push(v)}return h.isGroup?(h.clear(),h.add(...d),h):d[0]}))}},nd="glTF",Gr=12,jf={JSON:1313821514,BIN:5130562},Yc=class{constructor(e){this.name=ut.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,Gr),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==nd)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let i=this.header.length-Gr,s=new DataView(e,Gr),a=0;for(;a<i;){let o=s.getUint32(a,!0);a+=4;let l=s.getUint32(a,!0);if(a+=4,l===jf.JSON){let c=new Uint8Array(e,Gr+a,o);this.content=n.decode(c)}else if(l===jf.BIN){let c=Gr+a;this.body=e.slice(c,c+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},Kc=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=ut.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,i=this.dracoLoader,s=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},l={},c={};for(let h in a){let u=jc[h]||h.toLowerCase();o[u]=a[h]}for(let h in e.attributes){let u=jc[h]||h.toLowerCase();if(a[h]!==void 0){let f=n.accessors[e.attributes[h]],d=ir[f.componentType];c[u]=d.name,l[u]=f.normalized===!0}}return t.getDependency("bufferView",s).then(function(h){return new Promise(function(u,f){i.decodeDracoFile(h,function(d){for(let g in d.attributes){let x=d.attributes[g],m=l[g];m!==void 0&&(x.normalized=m)}u(d)},o,c,Vt,f)})})}},Zc=class{constructor(){this.name=ut.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}},Jc=class{constructor(){this.name=ut.KHR_MESH_QUANTIZATION}},go=class extends Ni{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i*3+i;for(let a=0;a!==i;a++)t[a]=n[s+a];return t}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=o*2,c=o*3,h=i-t,u=(n-t)/h,f=u*u,d=f*u,g=e*c,x=g-c,m=-2*d+3*f,p=d-f,_=1-m,v=p-f+u;for(let M=0;M!==o;M++){let D=a[x+M+o],C=a[x+M+l]*h,P=a[g+M+o],V=a[g+M]*h;s[M]=_*D+v*C+m*P+p*V}return s}},ty=new bt,$c=class extends go{interpolate_(e,t,n,i){let s=super.interpolate_(e,t,n,i);return ty.fromArray(s).normalize().toArray(s),s}},Un={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},ir={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Qf={9728:kt,9729:hn,9984:La,9985:gc,9986:_r,9987:Ci},ed={33071:sn,33648:Er,10497:mn},Ac={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},jc={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Bi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},ny={CUBICSPLINE:void 0,LINEAR:ns,STEP:Ws},Rc={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function iy(r){return r.DefaultMaterial===void 0&&(r.DefaultMaterial=new Qe({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Yn})),r.DefaultMaterial}function hs(r,e,t){for(let n in t.extensions)r[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function zi(r,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(r.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function sy(r,e,t){let n=!1,i=!1,s=!1;for(let c=0,h=e.length;c<h;c++){let u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(i=!0),u.COLOR_0!==void 0&&(s=!0),n&&i&&s)break}if(!n&&!i&&!s)return Promise.resolve(r);let a=[],o=[],l=[];for(let c=0,h=e.length;c<h;c++){let u=e[c];if(n){let f=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):r.attributes.position;a.push(f)}if(i){let f=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):r.attributes.normal;o.push(f)}if(s){let f=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):r.attributes.color;l.push(f)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l)]).then(function(c){let h=c[0],u=c[1],f=c[2];return n&&(r.morphAttributes.position=h),i&&(r.morphAttributes.normal=u),s&&(r.morphAttributes.color=f),r.morphTargetsRelative=!0,r})}function ry(r,e){if(r.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)r.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(r.morphTargetInfluences.length===t.length){r.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)r.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function ay(r){let e,t=r.extensions&&r.extensions[ut.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Cc(t.attributes):e=r.indices+":"+Cc(r.attributes)+":"+r.mode,r.targets!==void 0)for(let n=0,i=r.targets.length;n<i;n++)e+=":"+Cc(r.targets[n]);return e}function Cc(r){let e="",t=Object.keys(r).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+r[t[n]]+";";return e}function Qc(r){switch(r){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function oy(r){return r.search(/\.jpe?g($|\?)/i)>0||r.search(/^data\:image\/jpeg/)===0?"image/jpeg":r.search(/\.webp($|\?)/i)>0||r.search(/^data\:image\/webp/)===0?"image/webp":"image/png"}var ly=new Ie,eh=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new ey,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=!1,s=-1;typeof navigator<"u"&&(n=/^((?!chrome|android).)*safari/i.test(navigator.userAgent)===!0,i=navigator.userAgent.indexOf("Firefox")>-1,s=i?navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]:-1),typeof createImageBitmap>"u"||n||i&&s<98?this.textureLoader=new er(this.options.manager):this.textureLoader=new ao(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new ls(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,i=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){let o={scene:a[0][i.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:i.asset,parser:n,userData:{}};return hs(s,o,i),zi(o,i),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(o)})).then(function(){e(o)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,s=t.length;i<s;i++){let a=t[i].joints;for(let o=0,l=a.length;o<l;o++)e[a[o]].isBone=!0}for(let i=0,s=e.length;i<s;i++){let a=e[i];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let i=n.clone(),s=(a,o)=>{let l=this.associations.get(a);l!=null&&this.associations.set(o,l);for(let[c,h]of a.children.entries())s(h,o.children[c])};return s(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let i=e(t[n]);if(i)return i}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let i=0;i<t.length;i++){let s=e(t[i]);s&&n.push(s)}return n}getDependency(e,t){let n=e+":"+t,i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(s){return s.loadNode&&s.loadNode(t)});break;case"mesh":i=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(s,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[ut.KHR_BINARY_GLTF].body);let i=this.options;return new Promise(function(s,a){n.load(Zn.resolveURL(t.uri,i.path),s,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let i=t.byteLength||0,s=t.byteOffset||0;return n.slice(s,s+i)})}loadAccessor(e){let t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){let a=Ac[i.type],o=ir[i.componentType],l=i.normalized===!0,c=new o(i.count*a);return Promise.resolve(new Ht(c,a,l))}let s=[];return i.bufferView!==void 0?s.push(this.getDependency("bufferView",i.bufferView)):s.push(null),i.sparse!==void 0&&(s.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(s).then(function(a){let o=a[0],l=Ac[i.type],c=ir[i.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,f=i.byteOffset||0,d=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,g=i.normalized===!0,x,m;if(d&&d!==u){let p=Math.floor(f/d),_="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+p+":"+i.count,v=t.cache.get(_);v||(x=new c(o,p*d,i.count*d/h),v=new Js(x,d/h),t.cache.add(_,v)),m=new is(v,l,f%d/h,g)}else o===null?x=new c(i.count*l):x=new c(o,f,i.count*l),m=new Ht(x,l,g);if(i.sparse!==void 0){let p=Ac.SCALAR,_=ir[i.sparse.indices.componentType],v=i.sparse.indices.byteOffset||0,M=i.sparse.values.byteOffset||0,D=new _(a[1],v,i.sparse.count*p),C=new c(a[2],M,i.sparse.count*l);o!==null&&(m=new Ht(m.array.slice(),m.itemSize,m.normalized));for(let P=0,V=D.length;P<V;P++){let w=D[P];if(m.setX(w,C[P*l]),l>=2&&m.setY(w,C[P*l+1]),l>=3&&m.setZ(w,C[P*l+2]),l>=4&&m.setW(w,C[P*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}}return m})}loadTexture(e){let t=this.json,n=this.options,s=t.textures[e].source,a=t.images[s],o=this.textureLoader;if(a.uri){let l=n.manager.getHandler(a.uri);l!==null&&(o=l)}return this.loadTextureImage(e,s,o)}loadTextureImage(e,t,n){let i=this,s=this.json,a=s.textures[e],o=s.images[t],l=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[l])return this.textureCache[l];let c=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=a.name||o.name||"",h.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(h.name=o.uri);let f=(s.samplers||{})[a.sampler]||{};return h.magFilter=Qf[f.magFilter]||hn,h.minFilter=Qf[f.minFilter]||Ci,h.wrapS=ed[f.wrapS]||mn,h.wrapT=ed[f.wrapT]||mn,i.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){let n=this,i=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());let a=i.images[e],o=self.URL||self.webkitURL,l=a.uri||"",c=!1;if(a.bufferView!==void 0)l=n.getDependency("bufferView",a.bufferView).then(function(u){c=!0;let f=new Blob([u],{type:a.mimeType});return l=o.createObjectURL(f),l});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let h=Promise.resolve(l).then(function(u){return new Promise(function(f,d){let g=f;t.isImageBitmapLoader===!0&&(g=function(x){let m=new It(x);m.needsUpdate=!0,f(m)}),t.load(Zn.resolveURL(u,s.path),g,void 0,d)})}).then(function(u){return c===!0&&o.revokeObjectURL(l),u.userData.mimeType=a.mimeType||oy(a.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,i){let s=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),s.extensions[ut.KHR_TEXTURE_TRANSFORM]){let o=n.extensions!==void 0?n.extensions[ut.KHR_TEXTURE_TRANSFORM]:void 0;if(o){let l=s.associations.get(a);a=s.extensions[ut.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),s.associations.set(a,l)}}return i!==void 0&&(a.colorSpace=i),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,i=t.attributes.tangent===void 0,s=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let o="PointsMaterial:"+n.uuid,l=this.cache.get(o);l||(l=new Ir,an.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(o,l)),n=l}else if(e.isLine){let o="LineBasicMaterial:"+n.uuid,l=this.cache.get(o);l||(l=new rs,an.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(o,l)),n=l}if(i||s||a){let o="ClonedMaterial:"+n.uuid+":";i&&(o+="derivative-tangents:"),s&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let l=this.cache.get(o);l||(l=n.clone(),s&&(l.vertexColors=!0),a&&(l.flatShading=!0),i&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(o,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return Qe}loadMaterial(e){let t=this,n=this.json,i=this.extensions,s=n.materials[e],a,o={},l=s.extensions||{},c=[];if(l[ut.KHR_MATERIALS_UNLIT]){let u=i[ut.KHR_MATERIALS_UNLIT];a=u.getMaterialType(),c.push(u.extendParams(o,s,t))}else{let u=s.pbrMetallicRoughness||{};if(o.color=new Re(1,1,1),o.opacity=1,Array.isArray(u.baseColorFactor)){let f=u.baseColorFactor;o.color.setRGB(f[0],f[1],f[2],Vt),o.opacity=f[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(o,"map",u.baseColorTexture,it)),o.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,o.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(o,"roughnessMap",u.metallicRoughnessTexture))),a=this._invokeOne(function(f){return f.getMaterialType&&f.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(f){return f.extendMaterialParams&&f.extendMaterialParams(e,o)})))}s.doubleSided===!0&&(o.side=Sn);let h=s.alphaMode||Rc.OPAQUE;if(h===Rc.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,h===Rc.MASK&&(o.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:.5)),s.normalTexture!==void 0&&a!==Jt&&(c.push(t.assignTexture(o,"normalMap",s.normalTexture)),o.normalScale=new pe(1,1),s.normalTexture.scale!==void 0)){let u=s.normalTexture.scale;o.normalScale.set(u,u)}if(s.occlusionTexture!==void 0&&a!==Jt&&(c.push(t.assignTexture(o,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=s.occlusionTexture.strength)),s.emissiveFactor!==void 0&&a!==Jt){let u=s.emissiveFactor;o.emissive=new Re().setRGB(u[0],u[1],u[2],Vt)}return s.emissiveTexture!==void 0&&a!==Jt&&c.push(t.assignTexture(o,"emissiveMap",s.emissiveTexture,it)),Promise.all(c).then(function(){let u=new a(o);return s.name&&(u.name=s.name),zi(u,s),t.associations.set(u,{materials:e}),s.extensions&&hs(i,u,s),u})}createUniqueName(e){let t=mt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,i=this.primitiveCache;function s(o){return n[ut.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(l){return td(l,o,t)})}let a=[];for(let o=0,l=e.length;o<l;o++){let c=e[o],h=ay(c),u=i[h];if(u)a.push(u.promise);else{let f;c.extensions&&c.extensions[ut.KHR_DRACO_MESH_COMPRESSION]?f=s(c):f=td(new Dt,c,t),i[h]={primitive:c,promise:f},a.push(f)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,i=this.extensions,s=n.meshes[e],a=s.primitives,o=[];for(let l=0,c=a.length;l<c;l++){let h=a[l].material===void 0?iy(this.cache):this.getDependency("material",a[l].material);o.push(h)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(l){let c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let d=0,g=h.length;d<g;d++){let x=h[d],m=a[d],p,_=c[d];if(m.mode===Un.TRIANGLES||m.mode===Un.TRIANGLE_STRIP||m.mode===Un.TRIANGLE_FAN||m.mode===void 0)p=s.isSkinnedMesh===!0?new $s(x,_):new gt(x,_),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===Un.TRIANGLE_STRIP?p.geometry=Ec(p.geometry,co):m.mode===Un.TRIANGLE_FAN&&(p.geometry=Ec(p.geometry,Vr));else if(m.mode===Un.LINES)p=new Ya(x,_);else if(m.mode===Un.LINE_STRIP)p=new Di(x,_);else if(m.mode===Un.LINE_LOOP)p=new Ka(x,_);else if(m.mode===Un.POINTS)p=new Za(x,_);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&ry(p,s),p.name=t.createUniqueName(s.name||"mesh_"+e),zi(p,s),m.extensions&&hs(i,p,m),t.assignFinalMaterial(p),u.push(p)}for(let d=0,g=u.length;d<g;d++)t.associations.set(u[d],{meshes:e,primitives:d});if(u.length===1)return s.extensions&&hs(i,u[0],s),u[0];let f=new At;s.extensions&&hs(i,f,s),t.associations.set(f,{meshes:e});for(let d=0,g=u.length;d<g;d++)f.add(u[d]);return f})}loadCamera(e){let t,n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Ft($t.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new Li(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),zi(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let i=0,s=t.joints.length;i<s;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){let s=i.pop(),a=i,o=[],l=[];for(let c=0,h=a.length;c<h;c++){let u=a[c];if(u){o.push(u);let f=new Ie;s!==null&&f.fromArray(s.array,c*16),l.push(f)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new js(o,l)})}loadAnimation(e){let t=this.json,n=this,i=t.animations[e],s=i.name?i.name:"animation_"+e,a=[],o=[],l=[],c=[],h=[];for(let u=0,f=i.channels.length;u<f;u++){let d=i.channels[u],g=i.samplers[d.sampler],x=d.target,m=x.node,p=i.parameters!==void 0?i.parameters[g.input]:g.input,_=i.parameters!==void 0?i.parameters[g.output]:g.output;x.node!==void 0&&(a.push(this.getDependency("node",m)),o.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",_)),c.push(g),h.push(x))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(u){let f=u[0],d=u[1],g=u[2],x=u[3],m=u[4],p=[];for(let _=0,v=f.length;_<v;_++){let M=f[_],D=d[_],C=g[_],P=x[_],V=m[_];if(M===void 0)continue;M.updateMatrix&&M.updateMatrix();let w=n._createAnimationTracks(M,D,C,P,V);if(w)for(let E=0;E<w.length;E++)p.push(w[E])}return new pi(s,void 0,p)})}createNodeMesh(e){let t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(s){let a=n._getNodeRef(n.meshCache,i.mesh,s);return i.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let l=0,c=i.weights.length;l<c;l++)o.morphTargetInfluences[l]=i.weights[l]}),a})}loadNode(e){let t=this.json,n=this,i=t.nodes[e],s=n._loadNodeShallow(e),a=[],o=i.children||[];for(let c=0,h=o.length;c<h;c++)a.push(n.getDependency("node",o[c]));let l=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([s,Promise.all(a),l]).then(function(c){let h=c[0],u=c[1],f=c[2];f!==null&&h.traverse(function(d){d.isSkinnedMesh&&d.bind(f,ly)});for(let d=0,g=u.length;d<g;d++)h.add(u[d]);return h})}_loadNodeShallow(e){let t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let s=t.nodes[e],a=s.name?i.createUniqueName(s.name):"",o=[],l=i._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&o.push(l),s.camera!==void 0&&o.push(i.getDependency("camera",s.camera).then(function(c){return i._getNodeRef(i.cameraCache,s.camera,c)})),i._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){o.push(c)}),this.nodeCache[e]=Promise.all(o).then(function(c){let h;if(s.isBone===!0?h=new Ii:c.length>1?h=new At:c.length===1?h=c[0]:h=new Mt,h!==c[0])for(let u=0,f=c.length;u<f;u++)h.add(c[u]);if(s.name&&(h.userData.name=s.name,h.name=a),zi(h,s),s.extensions&&hs(n,h,s),s.matrix!==void 0){let u=new Ie;u.fromArray(s.matrix),h.applyMatrix4(u)}else s.translation!==void 0&&h.position.fromArray(s.translation),s.rotation!==void 0&&h.quaternion.fromArray(s.rotation),s.scale!==void 0&&h.scale.fromArray(s.scale);return i.associations.has(h)||i.associations.set(h,{}),i.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],i=this,s=new At;n.name&&(s.name=i.createUniqueName(n.name)),zi(s,n),n.extensions&&hs(t,s,n);let a=n.nodes||[],o=[];for(let l=0,c=a.length;l<c;l++)o.push(i.getDependency("node",a[l]));return Promise.all(o).then(function(l){for(let h=0,u=l.length;h<u;h++)s.add(l[h]);let c=h=>{let u=new Map;for(let[f,d]of i.associations)(f instanceof an||f instanceof It)&&u.set(f,d);return h.traverse(f=>{let d=i.associations.get(f);d!=null&&u.set(f,d)}),u};return i.associations=c(s),s})}_createAnimationTracks(e,t,n,i,s){let a=[],o=e.name?e.name:e.uuid,l=[];Bi[s.path]===Bi.weights?e.traverse(function(f){f.morphTargetInfluences&&l.push(f.name?f.name:f.uuid)}):l.push(o);let c;switch(Bi[s.path]){case Bi.weights:c=Hn;break;case Bi.rotation:c=xn;break;case Bi.position:case Bi.scale:c=Dn;break;default:n.itemSize===1?c=Hn:c=Dn;break}let h=i.interpolation!==void 0?ny[i.interpolation]:ns,u=this._getArrayFromAccessor(n);for(let f=0,d=l.length;f<d;f++){let g=new c(l[f]+"."+Bi[s.path],t.array,u,h);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),a.push(g)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=Qc(t.constructor),i=new Float32Array(t.length);for(let s=0,a=t.length;s<a;s++)i[s]=t[s]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let i=this instanceof xn?$c:go;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function cy(r,e,t){let n=e.attributes,i=new un;if(n.POSITION!==void 0){let o=t.json.accessors[n.POSITION],l=o.min,c=o.max;if(l!==void 0&&c!==void 0){if(i.set(new R(l[0],l[1],l[2]),new R(c[0],c[1],c[2])),o.normalized){let h=Qc(ir[o.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let s=e.targets;if(s!==void 0){let o=new R,l=new R;for(let c=0,h=s.length;c<h;c++){let u=s[c];if(u.POSITION!==void 0){let f=t.json.accessors[u.POSITION],d=f.min,g=f.max;if(d!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(d[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(d[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(d[2]),Math.abs(g[2]))),f.normalized){let x=Qc(ir[f.componentType]);l.multiplyScalar(x)}o.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(o)}r.boundingBox=i;let a=new wn;i.getCenter(a.center),a.radius=i.min.distanceTo(i.max)/2,r.boundingSphere=a}function td(r,e,t){let n=e.attributes,i=[];function s(a,o){return t.getDependency("accessor",a).then(function(l){r.setAttribute(o,l)})}for(let a in n){let o=jc[a]||a.toLowerCase();o in r.attributes||i.push(s(n[a],o))}if(e.indices!==void 0&&!r.index){let a=t.getDependency("accessor",e.indices).then(function(o){r.setIndex(o)});i.push(a)}return xt.workingColorSpace!==Vt&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${xt.workingColorSpace}" not supported.`),zi(r,e),cy(r,e,t),Promise.all(i).then(function(){return e.targets!==void 0?sy(r,e.targets,t):r})}var id=function(r){return URL.createObjectURL(new Blob([r],{type:"text/javascript"}))},hy=function(r){return new Worker(r)};try{URL.revokeObjectURL(id(""))}catch{id=function(e){return"data:application/javascript;charset=UTF-8,"+encodeURI(e)},hy=function(e){return new Worker(e,{type:"module"})}}var Nn=Uint8Array,ki=Uint16Array,ih=Uint32Array,sd=new Nn([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),rd=new Nn([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),uy=new Nn([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),ad=function(r,e){for(var t=new ki(31),n=0;n<31;++n)t[n]=e+=1<<r[n-1];for(var i=new ih(t[30]),n=1;n<30;++n)for(var s=t[n];s<t[n+1];++s)i[s]=s-t[n]<<5|n;return[t,i]},od=ad(sd,2),ld=od[0],fy=od[1];ld[28]=258,fy[258]=28;var cd=ad(rd,0),dy=cd[0],vM=cd[1],sh=new ki(32768);for(vt=0;vt<32768;++vt)xi=(vt&43690)>>>1|(vt&21845)<<1,xi=(xi&52428)>>>2|(xi&13107)<<2,xi=(xi&61680)>>>4|(xi&3855)<<4,sh[vt]=((xi&65280)>>>8|(xi&255)<<8)>>>1;var xi,vt,Wr=(function(r,e,t){for(var n=r.length,i=0,s=new ki(e);i<n;++i)++s[r[i]-1];var a=new ki(e);for(i=0;i<e;++i)a[i]=a[i-1]+s[i-1]<<1;var o;if(t){o=new ki(1<<e);var l=15-e;for(i=0;i<n;++i)if(r[i])for(var c=i<<4|r[i],h=e-r[i],u=a[r[i]-1]++<<h,f=u|(1<<h)-1;u<=f;++u)o[sh[u]>>>l]=c}else for(o=new ki(n),i=0;i<n;++i)r[i]&&(o[i]=sh[a[r[i]-1]++]>>>15-r[i]);return o}),Xr=new Nn(288);for(vt=0;vt<144;++vt)Xr[vt]=8;var vt;for(vt=144;vt<256;++vt)Xr[vt]=9;var vt;for(vt=256;vt<280;++vt)Xr[vt]=7;var vt;for(vt=280;vt<288;++vt)Xr[vt]=8;var vt,hd=new Nn(32);for(vt=0;vt<32;++vt)hd[vt]=5;var vt;var py=Wr(Xr,9,1);var my=Wr(hd,5,1),th=function(r){for(var e=r[0],t=1;t<r.length;++t)r[t]>e&&(e=r[t]);return e},Gn=function(r,e,t){var n=e/8|0;return(r[n]|r[n+1]<<8)>>(e&7)&t},nh=function(r,e){var t=e/8|0;return(r[t]|r[t+1]<<8|r[t+2]<<16)>>(e&7)},gy=function(r){return(r/8|0)+(r&7&&1)},xy=function(r,e,t){(e==null||e<0)&&(e=0),(t==null||t>r.length)&&(t=r.length);var n=new(r instanceof ki?ki:r instanceof ih?ih:Nn)(t-e);return n.set(r.subarray(e,t)),n},vy=function(r,e,t){var n=r.length;if(!n||t&&!t.l&&n<5)return e||new Nn(0);var i=!e||t,s=!t||t.i;t||(t={}),e||(e=new Nn(n*3));var a=function(Me){var Se=e.length;if(Me>Se){var Fe=new Nn(Math.max(Se*2,Me));Fe.set(e),e=Fe}},o=t.f||0,l=t.p||0,c=t.b||0,h=t.l,u=t.d,f=t.m,d=t.n,g=n*8;do{if(!h){t.f=o=Gn(r,l,1);var x=Gn(r,l+1,3);if(l+=3,x)if(x==1)h=py,u=my,f=9,d=5;else if(x==2){var v=Gn(r,l,31)+257,M=Gn(r,l+10,15)+4,D=v+Gn(r,l+5,31)+1;l+=14;for(var C=new Nn(D),P=new Nn(19),V=0;V<M;++V)P[uy[V]]=Gn(r,l+V*3,7);l+=M*3;for(var w=th(P),E=(1<<w)-1,q=Wr(P,w,1),V=0;V<D;){var Q=q[Gn(r,l,E)];l+=Q&15;var m=Q>>>4;if(m<16)C[V++]=m;else{var le=0,F=0;for(m==16?(F=3+Gn(r,l,3),l+=2,le=C[V-1]):m==17?(F=3+Gn(r,l,7),l+=3):m==18&&(F=11+Gn(r,l,127),l+=7);F--;)C[V++]=le}}var Y=C.subarray(0,v),J=C.subarray(v);f=th(Y),d=th(J),h=Wr(Y,f,1),u=Wr(J,d,1)}else throw"invalid block type";else{var m=gy(l)+4,p=r[m-4]|r[m-3]<<8,_=m+p;if(_>n){if(s)throw"unexpected EOF";break}i&&a(c+p),e.set(r.subarray(m,_),c),t.b=c+=p,t.p=l=_*8;continue}if(l>g){if(s)throw"unexpected EOF";break}}i&&a(c+131072);for(var ae=(1<<f)-1,ie=(1<<d)-1,ee=l;;ee=l){var le=h[nh(r,l)&ae],oe=le>>>4;if(l+=le&15,l>g){if(s)throw"unexpected EOF";break}if(!le)throw"invalid length/literal";if(oe<256)e[c++]=oe;else if(oe==256){ee=l,h=null;break}else{var k=oe-254;if(oe>264){var V=oe-257,j=sd[V];k=Gn(r,l,(1<<j)-1)+ld[V],l+=j}var W=u[nh(r,l)&ie],se=W>>>4;if(!W)throw"invalid distance";l+=W&15;var J=dy[se];if(se>3){var j=rd[se];J+=nh(r,l)&(1<<j)-1,l+=j}if(l>g){if(s)throw"unexpected EOF";break}i&&a(c+131072);for(var ge=c+k;c<ge;c+=4)e[c]=e[c-J],e[c+1]=e[c+1-J],e[c+2]=e[c+2-J],e[c+3]=e[c+3-J];c=ge}}t.l=h,t.p=ee,t.b=c,h&&(o=1,t.m=f,t.d=u,t.n=d)}while(!o);return c==e.length?e:xy(e,0,c)};var _y=new Nn(0);var yy=function(r){if((r[0]&15)!=8||r[0]>>>4>7||(r[0]<<8|r[1])%31)throw"invalid zlib data";if(r[1]&32)throw"invalid zlib data: preset dictionaries not supported"};function ud(r,e){return vy((yy(r),r.subarray(2,-4)),e)}var My=typeof TextDecoder<"u"&&new TextDecoder,Sy=0;try{My.decode(_y,{stream:!0}),Sy=1}catch{}function fd(r,e,t){let n=t.length-r-1;if(e>=t[n])return n-1;if(e<=t[r])return r;let i=r,s=n,a=Math.floor((i+s)/2);for(;e<t[a]||e>=t[a+1];)e<t[a]?s=a:i=a,a=Math.floor((i+s)/2);return a}function by(r,e,t,n){let i=[],s=[],a=[];i[0]=1;for(let o=1;o<=t;++o){s[o]=e-n[r+1-o],a[o]=n[r+o]-e;let l=0;for(let c=0;c<o;++c){let h=a[c+1],u=s[o-c],f=i[c]/(h+u);i[c]=l+h*f,l=u*f}i[o]=l}return i}function dd(r,e,t,n){let i=fd(r,n,e),s=by(i,n,r,e),a=new dt(0,0,0,0);for(let o=0;o<=r;++o){let l=t[i-r+o],c=s[o],h=l.w*c;a.x+=l.x*h,a.y+=l.y*h,a.z+=l.z*h,a.w+=l.w*c}return a}function Ty(r,e,t,n,i){let s=[];for(let u=0;u<=t;++u)s[u]=0;let a=[];for(let u=0;u<=n;++u)a[u]=s.slice(0);let o=[];for(let u=0;u<=t;++u)o[u]=s.slice(0);o[0][0]=1;let l=s.slice(0),c=s.slice(0);for(let u=1;u<=t;++u){l[u]=e-i[r+1-u],c[u]=i[r+u]-e;let f=0;for(let d=0;d<u;++d){let g=c[d+1],x=l[u-d];o[u][d]=g+x;let m=o[d][u-1]/o[u][d];o[d][u]=f+g*m,f=x*m}o[u][u]=f}for(let u=0;u<=t;++u)a[0][u]=o[u][t];for(let u=0;u<=t;++u){let f=0,d=1,g=[];for(let x=0;x<=t;++x)g[x]=s.slice(0);g[0][0]=1;for(let x=1;x<=n;++x){let m=0,p=u-x,_=t-x;u>=x&&(g[d][0]=g[f][0]/o[_+1][p],m=g[d][0]*o[p][_]);let v=p>=-1?1:-p,M=u-1<=_?x-1:t-u;for(let C=v;C<=M;++C)g[d][C]=(g[f][C]-g[f][C-1])/o[_+1][p+C],m+=g[d][C]*o[p+C][_];u<=_&&(g[d][x]=-g[f][x-1]/o[_+1][u],m+=g[d][x]*o[u][_]),a[x][u]=m;let D=f;f=d,d=D}}let h=t;for(let u=1;u<=n;++u){for(let f=0;f<=t;++f)a[u][f]*=h;h*=t-u}return a}function Ey(r,e,t,n,i){let s=i<r?i:r,a=[],o=fd(r,n,e),l=Ty(o,n,r,s,e),c=[];for(let h=0;h<t.length;++h){let u=t[h].clone(),f=u.w;u.x*=f,u.y*=f,u.z*=f,c[h]=u}for(let h=0;h<=s;++h){let u=c[o-r].clone().multiplyScalar(l[h][0]);for(let f=1;f<=r;++f)u.add(c[o-r+f].clone().multiplyScalar(l[h][f]));a[h]=u}for(let h=s+1;h<=i+1;++h)a[h]=new dt(0,0,0);return a}function Ay(r,e){let t=1;for(let i=2;i<=r;++i)t*=i;let n=1;for(let i=2;i<=e;++i)n*=i;for(let i=2;i<=r-e;++i)n*=i;return t/n}function Ry(r){let e=r.length,t=[],n=[];for(let s=0;s<e;++s){let a=r[s];t[s]=new R(a.x,a.y,a.z),n[s]=a.w}let i=[];for(let s=0;s<e;++s){let a=t[s].clone();for(let o=1;o<=s;++o)a.sub(i[s-o].clone().multiplyScalar(Ay(s,o)*n[o]));i[s]=a.divideScalar(n[0])}return i}function pd(r,e,t,n,i){let s=Ey(r,e,t,n,i);return Ry(s)}var xo=class extends gn{constructor(e,t,n,i,s){super(),this.degree=e,this.knots=t,this.controlPoints=[],this.startKnot=i||0,this.endKnot=s||this.knots.length-1;for(let a=0;a<n.length;++a){let o=n[a];this.controlPoints[a]=new dt(o.x,o.y,o.z,o.w)}}getPoint(e,t=new R){let n=t,i=this.knots[this.startKnot]+e*(this.knots[this.endKnot]-this.knots[this.startKnot]),s=dd(this.degree,this.knots,this.controlPoints,i);return s.w!==1&&s.divideScalar(s.w),n.set(s.x,s.y,s.z)}getTangent(e,t=new R){let n=t,i=this.knots[0]+e*(this.knots[this.knots.length-1]-this.knots[0]),s=pd(this.degree,this.knots,this.controlPoints,i,1);return n.copy(s[1]).normalize(),n}};var rt,Bt,fn,_o=class extends bn{constructor(e){super(e)}load(e,t,n,i){let s=this,a=s.path===""?Zn.extractUrlBase(e):s.path,o=new ls(this.manager);o.setPath(s.path),o.setResponseType("arraybuffer"),o.setRequestHeader(s.requestHeader),o.setWithCredentials(s.withCredentials),o.load(e,function(l){try{t(s.parse(l,a))}catch(c){i?i(c):console.error(c),s.manager.itemError(e)}},n,i)}parse(e,t){if(Py(e))rt=new uh().parse(e);else{let i=vd(e);if(!Ly(i))throw new Error("THREE.FBXLoader: Unknown format.");if(md(i)<7e3)throw new Error("THREE.FBXLoader: FBX version not supported, FileVersion: "+md(i));rt=new hh().parse(i)}let n=new er(this.manager).setPath(this.resourcePath||t).setCrossOrigin(this.crossOrigin);return new oh(n,this.manager).parse(rt)}},oh=class{constructor(e,t){this.textureLoader=e,this.manager=t}parse(){Bt=this.parseConnections();let e=this.parseImages(),t=this.parseTextures(e),n=this.parseMaterials(t),i=this.parseDeformers(),s=new lh().parse(i);return this.parseScene(i,s,n),fn}parseConnections(){let e=new Map;return"Connections"in rt&&rt.Connections.connections.forEach(function(n){let i=n[0],s=n[1],a=n[2];e.has(i)||e.set(i,{parents:[],children:[]});let o={ID:s,relationship:a};e.get(i).parents.push(o),e.has(s)||e.set(s,{parents:[],children:[]});let l={ID:i,relationship:a};e.get(s).children.push(l)}),e}parseImages(){let e={},t={};if("Video"in rt.Objects){let n=rt.Objects.Video;for(let i in n){let s=n[i],a=parseInt(i);if(e[a]=s.RelativeFilename||s.Filename,"Content"in s){let o=s.Content instanceof ArrayBuffer&&s.Content.byteLength>0,l=typeof s.Content=="string"&&s.Content!=="";if(o||l){let c=this.parseImage(n[i]);t[s.RelativeFilename||s.Filename]=c}}}}for(let n in e){let i=e[n];t[i]!==void 0?e[n]=t[i]:e[n]=e[n].split("\\").pop()}return e}parseImage(e){let t=e.Content,n=e.RelativeFilename||e.Filename,i=n.slice(n.lastIndexOf(".")+1).toLowerCase(),s;switch(i){case"bmp":s="image/bmp";break;case"jpg":case"jpeg":s="image/jpeg";break;case"png":s="image/png";break;case"tif":s="image/tiff";break;case"tga":this.manager.getHandler(".tga")===null&&console.warn("FBXLoader: TGA loader not found, skipping ",n),s="image/tga";break;default:console.warn('FBXLoader: Image type "'+i+'" is not supported.');return}if(typeof t=="string")return"data:"+s+";base64,"+t;{let a=new Uint8Array(t);return window.URL.createObjectURL(new Blob([a],{type:s}))}}parseTextures(e){let t=new Map;if("Texture"in rt.Objects){let n=rt.Objects.Texture;for(let i in n){let s=this.parseTexture(n[i],e);t.set(parseInt(i),s)}}return t}parseTexture(e,t){let n=this.loadTexture(e,t);n.ID=e.id,n.name=e.attrName;let i=e.WrapModeU,s=e.WrapModeV,a=i!==void 0?i.value:0,o=s!==void 0?s.value:0;if(n.wrapS=a===0?mn:sn,n.wrapT=o===0?mn:sn,"Scaling"in e){let l=e.Scaling.value;n.repeat.x=l[0],n.repeat.y=l[1]}if("Translation"in e){let l=e.Translation.value;n.offset.x=l[0],n.offset.y=l[1]}return n}loadTexture(e,t){let n,i=this.textureLoader.path,s=Bt.get(e.id).children;s!==void 0&&s.length>0&&t[s[0].ID]!==void 0&&(n=t[s[0].ID],(n.indexOf("blob:")===0||n.indexOf("data:")===0)&&this.textureLoader.setPath(void 0));let a,o=e.FileName.slice(-3).toLowerCase();if(o==="tga"){let l=this.manager.getHandler(".tga");l===null?(console.warn("FBXLoader: TGA loader not found, creating placeholder texture for",e.RelativeFilename),a=new It):(l.setPath(this.textureLoader.path),a=l.load(n))}else if(o==="dds"){let l=this.manager.getHandler(".dds");l===null?(console.warn("FBXLoader: DDS loader not found, creating placeholder texture for",e.RelativeFilename),a=new It):(l.setPath(this.textureLoader.path),a=l.load(n))}else o==="psd"?(console.warn("FBXLoader: PSD textures are not supported, creating placeholder texture for",e.RelativeFilename),a=new It):a=this.textureLoader.load(n);return this.textureLoader.setPath(i),a}parseMaterials(e){let t=new Map;if("Material"in rt.Objects){let n=rt.Objects.Material;for(let i in n){let s=this.parseMaterial(n[i],e);s!==null&&t.set(parseInt(i),s)}}return t}parseMaterial(e,t){let n=e.id,i=e.attrName,s=e.ShadingModel;if(typeof s=="object"&&(s=s.value),!Bt.has(n))return null;let a=this.parseParameters(e,t,n),o;switch(s.toLowerCase()){case"phong":o=new Qs;break;case"lambert":o=new no;break;default:console.warn('THREE.FBXLoader: unknown material type "%s". Defaulting to MeshPhongMaterial.',s),o=new Qs;break}return o.setValues(a),o.name=i,o}parseParameters(e,t,n){let i={};e.BumpFactor&&(i.bumpScale=e.BumpFactor.value),e.Diffuse?i.color=new Re().fromArray(e.Diffuse.value).convertSRGBToLinear():e.DiffuseColor&&(e.DiffuseColor.type==="Color"||e.DiffuseColor.type==="ColorRGB")&&(i.color=new Re().fromArray(e.DiffuseColor.value).convertSRGBToLinear()),e.DisplacementFactor&&(i.displacementScale=e.DisplacementFactor.value),e.Emissive?i.emissive=new Re().fromArray(e.Emissive.value).convertSRGBToLinear():e.EmissiveColor&&(e.EmissiveColor.type==="Color"||e.EmissiveColor.type==="ColorRGB")&&(i.emissive=new Re().fromArray(e.EmissiveColor.value).convertSRGBToLinear()),e.EmissiveFactor&&(i.emissiveIntensity=parseFloat(e.EmissiveFactor.value)),e.Opacity&&(i.opacity=parseFloat(e.Opacity.value)),i.opacity<1&&(i.transparent=!0),e.ReflectionFactor&&(i.reflectivity=e.ReflectionFactor.value),e.Shininess&&(i.shininess=e.Shininess.value),e.Specular?i.specular=new Re().fromArray(e.Specular.value).convertSRGBToLinear():e.SpecularColor&&e.SpecularColor.type==="Color"&&(i.specular=new Re().fromArray(e.SpecularColor.value).convertSRGBToLinear());let s=this;return Bt.get(n).children.forEach(function(a){let o=a.relationship;switch(o){case"Bump":i.bumpMap=s.getTexture(t,a.ID);break;case"Maya|TEX_ao_map":i.aoMap=s.getTexture(t,a.ID);break;case"DiffuseColor":case"Maya|TEX_color_map":i.map=s.getTexture(t,a.ID),i.map!==void 0&&(i.map.colorSpace=it);break;case"DisplacementColor":i.displacementMap=s.getTexture(t,a.ID);break;case"EmissiveColor":i.emissiveMap=s.getTexture(t,a.ID),i.emissiveMap!==void 0&&(i.emissiveMap.colorSpace=it);break;case"NormalMap":case"Maya|TEX_normal_map":i.normalMap=s.getTexture(t,a.ID);break;case"ReflectionColor":i.envMap=s.getTexture(t,a.ID),i.envMap!==void 0&&(i.envMap.mapping=ts,i.envMap.colorSpace=it);break;case"SpecularColor":i.specularMap=s.getTexture(t,a.ID),i.specularMap!==void 0&&(i.specularMap.colorSpace=it);break;case"TransparentColor":case"TransparencyFactor":i.alphaMap=s.getTexture(t,a.ID),i.transparent=!0;break;default:console.warn("THREE.FBXLoader: %s map is not supported in three.js, skipping texture.",o);break}}),i}getTexture(e,t){return"LayeredTexture"in rt.Objects&&t in rt.Objects.LayeredTexture&&(console.warn("THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer."),t=Bt.get(t).children[0].ID),e.get(t)}parseDeformers(){let e={},t={};if("Deformer"in rt.Objects){let n=rt.Objects.Deformer;for(let i in n){let s=n[i],a=Bt.get(parseInt(i));if(s.attrType==="Skin"){let o=this.parseSkeleton(a,n);o.ID=i,a.parents.length>1&&console.warn("THREE.FBXLoader: skeleton attached to more than one geometry is not supported."),o.geometryID=a.parents[0].ID,e[i]=o}else if(s.attrType==="BlendShape"){let o={id:i};o.rawTargets=this.parseMorphTargets(a,n),o.id=i,a.parents.length>1&&console.warn("THREE.FBXLoader: morph target attached to more than one geometry is not supported."),t[i]=o}}}return{skeletons:e,morphTargets:t}}parseSkeleton(e,t){let n=[];return e.children.forEach(function(i){let s=t[i.ID];if(s.attrType!=="Cluster")return;let a={ID:i.ID,indices:[],weights:[],transformLink:new Ie().fromArray(s.TransformLink.a)};"Indexes"in s&&(a.indices=s.Indexes.a,a.weights=s.Weights.a),n.push(a)}),{rawBones:n,bones:[]}}parseMorphTargets(e,t){let n=[];for(let i=0;i<e.children.length;i++){let s=e.children[i],a=t[s.ID],o={name:a.attrName,initialWeight:a.DeformPercent,id:a.id,fullWeights:a.FullWeights.a};if(a.attrType!=="BlendShapeChannel")return;o.geoID=Bt.get(parseInt(s.ID)).children.filter(function(l){return l.relationship===void 0})[0].ID,n.push(o)}return n}parseScene(e,t,n){fn=new At;let i=this.parseModels(e.skeletons,t,n),s=rt.Objects.Model,a=this;i.forEach(function(l){let c=s[l.ID];a.setLookAtProperties(l,c),Bt.get(l.ID).parents.forEach(function(u){let f=i.get(u.ID);f!==void 0&&f.add(l)}),l.parent===null&&fn.add(l)}),this.bindSkeleton(e.skeletons,t,i),this.addGlobalSceneSettings(),fn.traverse(function(l){if(l.userData.transformData){l.parent&&(l.userData.transformData.parentMatrix=l.parent.matrix,l.userData.transformData.parentMatrixWorld=l.parent.matrixWorld);let c=gd(l.userData.transformData);l.applyMatrix4(c),l.updateWorldMatrix()}});let o=new ch().parse();fn.children.length===1&&fn.children[0].isGroup&&(fn.children[0].animations=o,fn=fn.children[0]),fn.animations=o}parseModels(e,t,n){let i=new Map,s=rt.Objects.Model;for(let a in s){let o=parseInt(a),l=s[a],c=Bt.get(o),h=this.buildSkeleton(c,e,o,l.attrName);if(!h){switch(l.attrType){case"Camera":h=this.createCamera(c);break;case"Light":h=this.createLight(c);break;case"Mesh":h=this.createMesh(c,t,n);break;case"NurbsCurve":h=this.createCurve(c,t);break;case"LimbNode":case"Root":h=new Ii;break;default:h=new At;break}h.name=l.attrName?mt.sanitizeNodeName(l.attrName):"",h.userData.originalName=l.attrName,h.ID=o}this.getTransformData(h,l),i.set(o,h)}return i}buildSkeleton(e,t,n,i){let s=null;return e.parents.forEach(function(a){for(let o in t){let l=t[o];l.rawBones.forEach(function(c,h){if(c.ID===a.ID){let u=s;s=new Ii,s.matrixWorld.copy(c.transformLink),s.name=i?mt.sanitizeNodeName(i):"",s.userData.originalName=i,s.ID=n,l.bones[h]=s,u!==null&&s.add(u)}})}}),s}createCamera(e){let t,n;if(e.children.forEach(function(i){let s=rt.Objects.NodeAttribute[i.ID];s!==void 0&&(n=s)}),n===void 0)t=new Mt;else{let i=0;n.CameraProjectionType!==void 0&&n.CameraProjectionType.value===1&&(i=1);let s=1;n.NearPlane!==void 0&&(s=n.NearPlane.value/1e3);let a=1e3;n.FarPlane!==void 0&&(a=n.FarPlane.value/1e3);let o=window.innerWidth,l=window.innerHeight;n.AspectWidth!==void 0&&n.AspectHeight!==void 0&&(o=n.AspectWidth.value,l=n.AspectHeight.value);let c=o/l,h=45;n.FieldOfView!==void 0&&(h=n.FieldOfView.value);let u=n.FocalLength?n.FocalLength.value:null;switch(i){case 0:t=new Ft(h,c,s,a),u!==null&&t.setFocalLength(u);break;case 1:t=new Li(-o/2,o/2,l/2,-l/2,s,a);break;default:console.warn("THREE.FBXLoader: Unknown camera type "+i+"."),t=new Mt;break}}return t}createLight(e){let t,n;if(e.children.forEach(function(i){let s=rt.Objects.NodeAttribute[i.ID];s!==void 0&&(n=s)}),n===void 0)t=new Mt;else{let i;n.LightType===void 0?i=0:i=n.LightType.value;let s=16777215;n.Color!==void 0&&(s=new Re().fromArray(n.Color.value).convertSRGBToLinear());let a=n.Intensity===void 0?1:n.Intensity.value/100;n.CastLightOnObject!==void 0&&n.CastLightOnObject.value===0&&(a=0);let o=0;n.FarAttenuationEnd!==void 0&&(n.EnableFarAttenuation!==void 0&&n.EnableFarAttenuation.value===0?o=0:o=n.FarAttenuationEnd.value);let l=1;switch(i){case 0:t=new Vn(s,a,o,l);break;case 1:t=new mi(s,a);break;case 2:let c=Math.PI/3;n.InnerAngle!==void 0&&(c=$t.degToRad(n.InnerAngle.value));let h=0;n.OuterAngle!==void 0&&(h=$t.degToRad(n.OuterAngle.value),h=Math.max(h,1)),t=new tr(s,a,o,c,h,l);break;default:console.warn("THREE.FBXLoader: Unknown light type "+n.LightType.value+", defaulting to a PointLight."),t=new Vn(s,a);break}n.CastShadows!==void 0&&n.CastShadows.value===1&&(t.castShadow=!0)}return t}createMesh(e,t,n){let i,s=null,a=null,o=[];return e.children.forEach(function(l){t.has(l.ID)&&(s=t.get(l.ID)),n.has(l.ID)&&o.push(n.get(l.ID))}),o.length>1?a=o:o.length>0?a=o[0]:(a=new Qs({name:bn.DEFAULT_MATERIAL_NAME,color:13421772}),o.push(a)),"color"in s.attributes&&o.forEach(function(l){l.vertexColors=!0}),s.FBX_Deformer?(i=new $s(s,a),i.normalizeSkinWeights()):i=new gt(s,a),i}createCurve(e,t){let n=e.children.reduce(function(s,a){return t.has(a.ID)&&(s=t.get(a.ID)),s},null),i=new rs({name:bn.DEFAULT_MATERIAL_NAME,color:3342591,linewidth:1});return new Di(n,i)}getTransformData(e,t){let n={};"InheritType"in t&&(n.inheritType=parseInt(t.InheritType.value)),"RotationOrder"in t?n.eulerOrder=xd(t.RotationOrder.value):n.eulerOrder="ZYX","Lcl_Translation"in t&&(n.translation=t.Lcl_Translation.value),"PreRotation"in t&&(n.preRotation=t.PreRotation.value),"Lcl_Rotation"in t&&(n.rotation=t.Lcl_Rotation.value),"PostRotation"in t&&(n.postRotation=t.PostRotation.value),"Lcl_Scaling"in t&&(n.scale=t.Lcl_Scaling.value),"ScalingOffset"in t&&(n.scalingOffset=t.ScalingOffset.value),"ScalingPivot"in t&&(n.scalingPivot=t.ScalingPivot.value),"RotationOffset"in t&&(n.rotationOffset=t.RotationOffset.value),"RotationPivot"in t&&(n.rotationPivot=t.RotationPivot.value),e.userData.transformData=n}setLookAtProperties(e,t){"LookAtProperty"in t&&Bt.get(e.ID).children.forEach(function(i){if(i.relationship==="LookAtProperty"){let s=rt.Objects.Model[i.ID];if("Lcl_Translation"in s){let a=s.Lcl_Translation.value;e.target!==void 0?(e.target.position.fromArray(a),fn.add(e.target)):e.lookAt(new R().fromArray(a))}}})}bindSkeleton(e,t,n){let i=this.parsePoseNodes();for(let s in e){let a=e[s];Bt.get(parseInt(a.ID)).parents.forEach(function(l){if(t.has(l.ID)){let c=l.ID;Bt.get(c).parents.forEach(function(u){n.has(u.ID)&&n.get(u.ID).bind(new js(a.bones),i[u.ID])})}})}}parsePoseNodes(){let e={};if("Pose"in rt.Objects){let t=rt.Objects.Pose;for(let n in t)if(t[n].attrType==="BindPose"&&t[n].NbPoseNodes>0){let i=t[n].PoseNode;Array.isArray(i)?i.forEach(function(s){e[s.Node]=new Ie().fromArray(s.Matrix.a)}):e[i.Node]=new Ie().fromArray(i.Matrix.a)}}return e}addGlobalSceneSettings(){if("GlobalSettings"in rt){if("AmbientColor"in rt.GlobalSettings){let e=rt.GlobalSettings.AmbientColor.value,t=e[0],n=e[1],i=e[2];if(t!==0||n!==0||i!==0){let s=new Re(t,n,i).convertSRGBToLinear();fn.add(new ro(s,1))}}"UnitScaleFactor"in rt.GlobalSettings&&(fn.userData.unitScaleFactor=rt.GlobalSettings.UnitScaleFactor.value)}}},lh=class{constructor(){this.negativeMaterialIndices=!1}parse(e){let t=new Map;if("Geometry"in rt.Objects){let n=rt.Objects.Geometry;for(let i in n){let s=Bt.get(parseInt(i)),a=this.parseGeometry(s,n[i],e);t.set(parseInt(i),a)}}return this.negativeMaterialIndices===!0&&console.warn("THREE.FBXLoader: The FBX file contains invalid (negative) material indices. The asset might not render as expected."),t}parseGeometry(e,t,n){switch(t.attrType){case"Mesh":return this.parseMeshGeometry(e,t,n);case"NurbsCurve":return this.parseNurbsGeometry(t)}}parseMeshGeometry(e,t,n){let i=n.skeletons,s=[],a=e.parents.map(function(u){return rt.Objects.Model[u.ID]});if(a.length===0)return;let o=e.children.reduce(function(u,f){return i[f.ID]!==void 0&&(u=i[f.ID]),u},null);e.children.forEach(function(u){n.morphTargets[u.ID]!==void 0&&s.push(n.morphTargets[u.ID])});let l=a[0],c={};"RotationOrder"in l&&(c.eulerOrder=xd(l.RotationOrder.value)),"InheritType"in l&&(c.inheritType=parseInt(l.InheritType.value)),"GeometricTranslation"in l&&(c.translation=l.GeometricTranslation.value),"GeometricRotation"in l&&(c.rotation=l.GeometricRotation.value),"GeometricScaling"in l&&(c.scale=l.GeometricScaling.value);let h=gd(c);return this.genGeometry(t,o,s,h)}genGeometry(e,t,n,i){let s=new Dt;e.attrName&&(s.name=e.attrName);let a=this.parseGeoNode(e,t),o=this.genBuffers(a),l=new pt(o.vertex,3);if(l.applyMatrix4(i),s.setAttribute("position",l),o.colors.length>0&&s.setAttribute("color",new pt(o.colors,3)),t&&(s.setAttribute("skinIndex",new Pi(o.weightsIndices,4)),s.setAttribute("skinWeight",new pt(o.vertexWeights,4)),s.FBX_Deformer=t),o.normal.length>0){let c=new nt().getNormalMatrix(i),h=new pt(o.normal,3);h.applyNormalMatrix(c),s.setAttribute("normal",h)}if(o.uvs.forEach(function(c,h){let u=h===0?"uv":`uv${h}`;s.setAttribute(u,new pt(o.uvs[h],2))}),a.material&&a.material.mappingType!=="AllSame"){let c=o.materialIndex[0],h=0;if(o.materialIndex.forEach(function(u,f){u!==c&&(s.addGroup(h,f-h,c),c=u,h=f)}),s.groups.length>0){let u=s.groups[s.groups.length-1],f=u.start+u.count;f!==o.materialIndex.length&&s.addGroup(f,o.materialIndex.length-f,c)}s.groups.length===0&&s.addGroup(0,o.materialIndex.length,o.materialIndex[0])}return this.addMorphTargets(s,e,n,i),s}parseGeoNode(e,t){let n={};if(n.vertexPositions=e.Vertices!==void 0?e.Vertices.a:[],n.vertexIndices=e.PolygonVertexIndex!==void 0?e.PolygonVertexIndex.a:[],e.LayerElementColor&&(n.color=this.parseVertexColors(e.LayerElementColor[0])),e.LayerElementMaterial&&(n.material=this.parseMaterialIndices(e.LayerElementMaterial[0])),e.LayerElementNormal&&(n.normal=this.parseNormals(e.LayerElementNormal[0])),e.LayerElementUV){n.uv=[];let i=0;for(;e.LayerElementUV[i];)e.LayerElementUV[i].UV&&n.uv.push(this.parseUVs(e.LayerElementUV[i])),i++}return n.weightTable={},t!==null&&(n.skeleton=t,t.rawBones.forEach(function(i,s){i.indices.forEach(function(a,o){n.weightTable[a]===void 0&&(n.weightTable[a]=[]),n.weightTable[a].push({id:s,weight:i.weights[o]})})})),n}genBuffers(e){let t={vertex:[],normal:[],colors:[],uvs:[],materialIndex:[],vertexWeights:[],weightsIndices:[]},n=0,i=0,s=!1,a=[],o=[],l=[],c=[],h=[],u=[],f=this;return e.vertexIndices.forEach(function(d,g){let x,m=!1;d<0&&(d=d^-1,m=!0);let p=[],_=[];if(a.push(d*3,d*3+1,d*3+2),e.color){let v=vo(g,n,d,e.color);l.push(v[0],v[1],v[2])}if(e.skeleton){if(e.weightTable[d]!==void 0&&e.weightTable[d].forEach(function(v){_.push(v.weight),p.push(v.id)}),_.length>4){s||(console.warn("THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights."),s=!0);let v=[0,0,0,0],M=[0,0,0,0];_.forEach(function(D,C){let P=D,V=p[C];M.forEach(function(w,E,q){if(P>w){q[E]=P,P=w;let Q=v[E];v[E]=V,V=Q}})}),p=v,_=M}for(;_.length<4;)_.push(0),p.push(0);for(let v=0;v<4;++v)h.push(_[v]),u.push(p[v])}if(e.normal){let v=vo(g,n,d,e.normal);o.push(v[0],v[1],v[2])}e.material&&e.material.mappingType!=="AllSame"&&(x=vo(g,n,d,e.material)[0],x<0&&(f.negativeMaterialIndices=!0,x=0)),e.uv&&e.uv.forEach(function(v,M){let D=vo(g,n,d,v);c[M]===void 0&&(c[M]=[]),c[M].push(D[0]),c[M].push(D[1])}),i++,m&&(f.genFace(t,e,a,x,o,l,c,h,u,i),n++,i=0,a=[],o=[],l=[],c=[],h=[],u=[])}),t}getNormalNewell(e){let t=new R(0,0,0);for(let n=0;n<e.length;n++){let i=e[n],s=e[(n+1)%e.length];t.x+=(i.y-s.y)*(i.z+s.z),t.y+=(i.z-s.z)*(i.x+s.x),t.z+=(i.x-s.x)*(i.y+s.y)}return t.normalize(),t}getNormalTangentAndBitangent(e){let t=this.getNormalNewell(e),i=(Math.abs(t.z)>.5?new R(0,1,0):new R(0,0,1)).cross(t).normalize(),s=t.clone().cross(i).normalize();return{normal:t,tangent:i,bitangent:s}}flattenVertex(e,t,n){return new pe(e.dot(t),e.dot(n))}genFace(e,t,n,i,s,a,o,l,c,h){let u;if(h>3){let f=[];for(let m=0;m<n.length;m+=3)f.push(new R(t.vertexPositions[n[m]],t.vertexPositions[n[m+1]],t.vertexPositions[n[m+2]]));let{tangent:d,bitangent:g}=this.getNormalTangentAndBitangent(f),x=[];for(let m of f)x.push(this.flattenVertex(m,d,g));u=es.triangulateShape(x,[])}else u=[[0,1,2]];for(let[f,d,g]of u)e.vertex.push(t.vertexPositions[n[f*3]]),e.vertex.push(t.vertexPositions[n[f*3+1]]),e.vertex.push(t.vertexPositions[n[f*3+2]]),e.vertex.push(t.vertexPositions[n[d*3]]),e.vertex.push(t.vertexPositions[n[d*3+1]]),e.vertex.push(t.vertexPositions[n[d*3+2]]),e.vertex.push(t.vertexPositions[n[g*3]]),e.vertex.push(t.vertexPositions[n[g*3+1]]),e.vertex.push(t.vertexPositions[n[g*3+2]]),t.skeleton&&(e.vertexWeights.push(l[f*4]),e.vertexWeights.push(l[f*4+1]),e.vertexWeights.push(l[f*4+2]),e.vertexWeights.push(l[f*4+3]),e.vertexWeights.push(l[d*4]),e.vertexWeights.push(l[d*4+1]),e.vertexWeights.push(l[d*4+2]),e.vertexWeights.push(l[d*4+3]),e.vertexWeights.push(l[g*4]),e.vertexWeights.push(l[g*4+1]),e.vertexWeights.push(l[g*4+2]),e.vertexWeights.push(l[g*4+3]),e.weightsIndices.push(c[f*4]),e.weightsIndices.push(c[f*4+1]),e.weightsIndices.push(c[f*4+2]),e.weightsIndices.push(c[f*4+3]),e.weightsIndices.push(c[d*4]),e.weightsIndices.push(c[d*4+1]),e.weightsIndices.push(c[d*4+2]),e.weightsIndices.push(c[d*4+3]),e.weightsIndices.push(c[g*4]),e.weightsIndices.push(c[g*4+1]),e.weightsIndices.push(c[g*4+2]),e.weightsIndices.push(c[g*4+3])),t.color&&(e.colors.push(a[f*3]),e.colors.push(a[f*3+1]),e.colors.push(a[f*3+2]),e.colors.push(a[d*3]),e.colors.push(a[d*3+1]),e.colors.push(a[d*3+2]),e.colors.push(a[g*3]),e.colors.push(a[g*3+1]),e.colors.push(a[g*3+2])),t.material&&t.material.mappingType!=="AllSame"&&(e.materialIndex.push(i),e.materialIndex.push(i),e.materialIndex.push(i)),t.normal&&(e.normal.push(s[f*3]),e.normal.push(s[f*3+1]),e.normal.push(s[f*3+2]),e.normal.push(s[d*3]),e.normal.push(s[d*3+1]),e.normal.push(s[d*3+2]),e.normal.push(s[g*3]),e.normal.push(s[g*3+1]),e.normal.push(s[g*3+2])),t.uv&&t.uv.forEach(function(x,m){e.uvs[m]===void 0&&(e.uvs[m]=[]),e.uvs[m].push(o[m][f*2]),e.uvs[m].push(o[m][f*2+1]),e.uvs[m].push(o[m][d*2]),e.uvs[m].push(o[m][d*2+1]),e.uvs[m].push(o[m][g*2]),e.uvs[m].push(o[m][g*2+1])})}addMorphTargets(e,t,n,i){if(n.length===0)return;e.morphTargetsRelative=!0,e.morphAttributes.position=[];let s=this;n.forEach(function(a){a.rawTargets.forEach(function(o){let l=rt.Objects.Geometry[o.geoID];l!==void 0&&s.genMorphGeometry(e,t,l,i,o.name)})})}genMorphGeometry(e,t,n,i,s){let a=t.PolygonVertexIndex!==void 0?t.PolygonVertexIndex.a:[],o=n.Vertices!==void 0?n.Vertices.a:[],l=n.Indexes!==void 0?n.Indexes.a:[],c=e.attributes.position.count*3,h=new Float32Array(c);for(let g=0;g<l.length;g++){let x=l[g]*3;h[x]=o[g*3],h[x+1]=o[g*3+1],h[x+2]=o[g*3+2]}let u={vertexIndices:a,vertexPositions:h},f=this.genBuffers(u),d=new pt(f.vertex,3);d.name=s||n.attrName,d.applyMatrix4(i),e.morphAttributes.position.push(d)}parseNormals(e){let t=e.MappingInformationType,n=e.ReferenceInformationType,i=e.Normals.a,s=[];return n==="IndexToDirect"&&("NormalIndex"in e?s=e.NormalIndex.a:"NormalsIndex"in e&&(s=e.NormalsIndex.a)),{dataSize:3,buffer:i,indices:s,mappingType:t,referenceType:n}}parseUVs(e){let t=e.MappingInformationType,n=e.ReferenceInformationType,i=e.UV.a,s=[];return n==="IndexToDirect"&&(s=e.UVIndex.a),{dataSize:2,buffer:i,indices:s,mappingType:t,referenceType:n}}parseVertexColors(e){let t=e.MappingInformationType,n=e.ReferenceInformationType,i=e.Colors.a,s=[];n==="IndexToDirect"&&(s=e.ColorIndex.a);for(let a=0,o=new Re;a<i.length;a+=4)o.fromArray(i,a).convertSRGBToLinear().toArray(i,a);return{dataSize:4,buffer:i,indices:s,mappingType:t,referenceType:n}}parseMaterialIndices(e){let t=e.MappingInformationType,n=e.ReferenceInformationType;if(t==="NoMappingInformation")return{dataSize:1,buffer:[0],indices:[0],mappingType:"AllSame",referenceType:n};let i=e.Materials.a,s=[];for(let a=0;a<i.length;++a)s.push(a);return{dataSize:1,buffer:i,indices:s,mappingType:t,referenceType:n}}parseNurbsGeometry(e){let t=parseInt(e.Order);if(isNaN(t))return console.error("THREE.FBXLoader: Invalid Order %s given for geometry ID: %s",e.Order,e.id),new Dt;let n=t-1,i=e.KnotVector.a,s=[],a=e.Points.a;for(let u=0,f=a.length;u<f;u+=4)s.push(new dt().fromArray(a,u));let o,l;if(e.Form==="Closed")s.push(s[0]);else if(e.Form==="Periodic"){o=n,l=i.length-1-o;for(let u=0;u<n;++u)s.push(s[u])}let h=new xo(n,i,s,o,l).getPoints(s.length*12);return new Dt().setFromPoints(h)}},ch=class{parse(){let e=[],t=this.parseClips();if(t!==void 0)for(let n in t){let i=t[n],s=this.addClip(i);e.push(s)}return e}parseClips(){if(rt.Objects.AnimationCurve===void 0)return;let e=this.parseAnimationCurveNodes();this.parseAnimationCurves(e);let t=this.parseAnimationLayers(e);return this.parseAnimStacks(t)}parseAnimationCurveNodes(){let e=rt.Objects.AnimationCurveNode,t=new Map;for(let n in e){let i=e[n];if(i.attrName.match(/S|R|T|DeformPercent/)!==null){let s={id:i.id,attr:i.attrName,curves:{}};t.set(s.id,s)}}return t}parseAnimationCurves(e){let t=rt.Objects.AnimationCurve;for(let n in t){let i={id:t[n].id,times:t[n].KeyTime.a.map(Iy),values:t[n].KeyValueFloat.a},s=Bt.get(i.id);if(s!==void 0){let a=s.parents[0].ID,o=s.parents[0].relationship;o.match(/X/)?e.get(a).curves.x=i:o.match(/Y/)?e.get(a).curves.y=i:o.match(/Z/)?e.get(a).curves.z=i:o.match(/DeformPercent/)&&e.has(a)&&(e.get(a).curves.morph=i)}}}parseAnimationLayers(e){let t=rt.Objects.AnimationLayer,n=new Map;for(let i in t){let s=[],a=Bt.get(parseInt(i));a!==void 0&&(a.children.forEach(function(l,c){if(e.has(l.ID)){let h=e.get(l.ID);if(h.curves.x!==void 0||h.curves.y!==void 0||h.curves.z!==void 0){if(s[c]===void 0){let u=Bt.get(l.ID).parents.filter(function(f){return f.relationship!==void 0})[0].ID;if(u!==void 0){let f=rt.Objects.Model[u.toString()];if(f===void 0){console.warn("THREE.FBXLoader: Encountered a unused curve.",l);return}let d={modelName:f.attrName?mt.sanitizeNodeName(f.attrName):"",ID:f.id,initialPosition:[0,0,0],initialRotation:[0,0,0],initialScale:[1,1,1]};fn.traverse(function(g){g.ID===f.id&&(d.transform=g.matrix,g.userData.transformData&&(d.eulerOrder=g.userData.transformData.eulerOrder))}),d.transform||(d.transform=new Ie),"PreRotation"in f&&(d.preRotation=f.PreRotation.value),"PostRotation"in f&&(d.postRotation=f.PostRotation.value),s[c]=d}}s[c]&&(s[c][h.attr]=h)}else if(h.curves.morph!==void 0){if(s[c]===void 0){let u=Bt.get(l.ID).parents.filter(function(p){return p.relationship!==void 0})[0].ID,f=Bt.get(u).parents[0].ID,d=Bt.get(f).parents[0].ID,g=Bt.get(d).parents[0].ID,x=rt.Objects.Model[g],m={modelName:x.attrName?mt.sanitizeNodeName(x.attrName):"",morphName:rt.Objects.Deformer[u].attrName};s[c]=m}s[c][h.attr]=h}}}),n.set(parseInt(i),s))}return n}parseAnimStacks(e){let t=rt.Objects.AnimationStack,n={};for(let i in t){let s=Bt.get(parseInt(i)).children;s.length>1&&console.warn("THREE.FBXLoader: Encountered an animation stack with multiple layers, this is currently not supported. Ignoring subsequent layers.");let a=e.get(s[0].ID);n[i]={name:t[i].attrName,layer:a}}return n}addClip(e){let t=[],n=this;return e.layer.forEach(function(i){t=t.concat(n.generateTracks(i))}),new pi(e.name,-1,t)}generateTracks(e){let t=[],n=new R,i=new R;if(e.transform&&e.transform.decompose(n,new bt,i),n=n.toArray(),i=i.toArray(),e.T!==void 0&&Object.keys(e.T.curves).length>0){let s=this.generateVectorTrack(e.modelName,e.T.curves,n,"position");s!==void 0&&t.push(s)}if(e.R!==void 0&&Object.keys(e.R.curves).length>0){let s=this.generateRotationTrack(e.modelName,e.R.curves,e.preRotation,e.postRotation,e.eulerOrder);s!==void 0&&t.push(s)}if(e.S!==void 0&&Object.keys(e.S.curves).length>0){let s=this.generateVectorTrack(e.modelName,e.S.curves,i,"scale");s!==void 0&&t.push(s)}if(e.DeformPercent!==void 0){let s=this.generateMorphTrack(e);s!==void 0&&t.push(s)}return t}generateVectorTrack(e,t,n,i){let s=this.getTimesForAllAxes(t),a=this.getKeyframeTrackValues(s,t,n);return new Dn(e+"."+i,s,a)}generateRotationTrack(e,t,n,i,s){let a,o;if(t.x!==void 0&&t.y!==void 0&&t.z!==void 0){let u=this.interpolateRotations(t.x,t.y,t.z,s);a=u[0],o=u[1]}n!==void 0&&(n=n.map($t.degToRad),n.push(s),n=new Gt().fromArray(n),n=new bt().setFromEuler(n)),i!==void 0&&(i=i.map($t.degToRad),i.push(s),i=new Gt().fromArray(i),i=new bt().setFromEuler(i).invert());let l=new bt,c=new Gt,h=[];if(!o||!a)return new xn(e+".quaternion",[],[]);for(let u=0;u<o.length;u+=3)c.set(o[u],o[u+1],o[u+2],s),l.setFromEuler(c),n!==void 0&&l.premultiply(n),i!==void 0&&l.multiply(i),u>2&&new bt().fromArray(h,(u-3)/3*4).dot(l)<0&&l.set(-l.x,-l.y,-l.z,-l.w),l.toArray(h,u/3*4);return new xn(e+".quaternion",a,h)}generateMorphTrack(e){let t=e.DeformPercent.curves.morph,n=t.values.map(function(s){return s/100}),i=fn.getObjectByName(e.modelName).morphTargetDictionary[e.morphName];return new Hn(e.modelName+".morphTargetInfluences["+i+"]",t.times,n)}getTimesForAllAxes(e){let t=[];if(e.x!==void 0&&(t=t.concat(e.x.times)),e.y!==void 0&&(t=t.concat(e.y.times)),e.z!==void 0&&(t=t.concat(e.z.times)),t=t.sort(function(n,i){return n-i}),t.length>1){let n=1,i=t[0];for(let s=1;s<t.length;s++){let a=t[s];a!==i&&(t[n]=a,i=a,n++)}t=t.slice(0,n)}return t}getKeyframeTrackValues(e,t,n){let i=n,s=[],a=-1,o=-1,l=-1;return e.forEach(function(c){if(t.x&&(a=t.x.times.indexOf(c)),t.y&&(o=t.y.times.indexOf(c)),t.z&&(l=t.z.times.indexOf(c)),a!==-1){let h=t.x.values[a];s.push(h),i[0]=h}else s.push(i[0]);if(o!==-1){let h=t.y.values[o];s.push(h),i[1]=h}else s.push(i[1]);if(l!==-1){let h=t.z.values[l];s.push(h),i[2]=h}else s.push(i[2])}),s}interpolateRotations(e,t,n,i){let s=[],a=[];s.push(e.times[0]),a.push($t.degToRad(e.values[0])),a.push($t.degToRad(t.values[0])),a.push($t.degToRad(n.values[0]));for(let o=1;o<e.values.length;o++){let l=[e.values[o-1],t.values[o-1],n.values[o-1]];if(isNaN(l[0])||isNaN(l[1])||isNaN(l[2]))continue;let c=l.map($t.degToRad),h=[e.values[o],t.values[o],n.values[o]];if(isNaN(h[0])||isNaN(h[1])||isNaN(h[2]))continue;let u=h.map($t.degToRad),f=[h[0]-l[0],h[1]-l[1],h[2]-l[2]],d=[Math.abs(f[0]),Math.abs(f[1]),Math.abs(f[2])];if(d[0]>=180||d[1]>=180||d[2]>=180){let x=Math.max(...d)/180,m=new Gt(...c,i),p=new Gt(...u,i),_=new bt().setFromEuler(m),v=new bt().setFromEuler(p);_.dot(v)&&v.set(-v.x,-v.y,-v.z,-v.w);let M=e.times[o-1],D=e.times[o]-M,C=new bt,P=new Gt;for(let V=0;V<1;V+=1/x)C.copy(_.clone().slerp(v.clone(),V)),s.push(M+V*D),P.setFromQuaternion(C,i),a.push(P.x),a.push(P.y),a.push(P.z)}else s.push(e.times[o]),a.push($t.degToRad(e.values[o])),a.push($t.degToRad(t.values[o])),a.push($t.degToRad(n.values[o]))}return[s,a]}},hh=class{getPrevNode(){return this.nodeStack[this.currentIndent-2]}getCurrentNode(){return this.nodeStack[this.currentIndent-1]}getCurrentProp(){return this.currentProp}pushStack(e){this.nodeStack.push(e),this.currentIndent+=1}popStack(){this.nodeStack.pop(),this.currentIndent-=1}setCurrentProp(e,t){this.currentProp=e,this.currentPropName=t}parse(e){this.currentIndent=0,this.allNodes=new Mo,this.nodeStack=[],this.currentProp=[],this.currentPropName="";let t=this,n=e.split(/[\r\n]+/);return n.forEach(function(i,s){let a=i.match(/^[\s\t]*;/),o=i.match(/^[\s\t]*$/);if(a||o)return;let l=i.match("^\\t{"+t.currentIndent+"}(\\w+):(.*){",""),c=i.match("^\\t{"+t.currentIndent+"}(\\w+):[\\s\\t\\r\\n](.*)"),h=i.match("^\\t{"+(t.currentIndent-1)+"}}");l?t.parseNodeBegin(i,l):c?t.parseNodeProperty(i,c,n[++s]):h?t.popStack():i.match(/^[^\s\t}]/)&&t.parseNodePropertyContinued(i)}),this.allNodes}parseNodeBegin(e,t){let n=t[1].trim().replace(/^"/,"").replace(/"$/,""),i=t[2].split(",").map(function(l){return l.trim().replace(/^"/,"").replace(/"$/,"")}),s={name:n},a=this.parseNodeAttr(i),o=this.getCurrentNode();this.currentIndent===0?this.allNodes.add(n,s):n in o?(n==="PoseNode"?o.PoseNode.push(s):o[n].id!==void 0&&(o[n]={},o[n][o[n].id]=o[n]),a.id!==""&&(o[n][a.id]=s)):typeof a.id=="number"?(o[n]={},o[n][a.id]=s):n!=="Properties70"&&(n==="PoseNode"?o[n]=[s]:o[n]=s),typeof a.id=="number"&&(s.id=a.id),a.name!==""&&(s.attrName=a.name),a.type!==""&&(s.attrType=a.type),this.pushStack(s)}parseNodeAttr(e){let t=e[0];e[0]!==""&&(t=parseInt(e[0]),isNaN(t)&&(t=e[0]));let n="",i="";return e.length>1&&(n=e[1].replace(/^(\w+)::/,""),i=e[2]),{id:t,name:n,type:i}}parseNodeProperty(e,t,n){let i=t[1].replace(/^"/,"").replace(/"$/,"").trim(),s=t[2].replace(/^"/,"").replace(/"$/,"").trim();i==="Content"&&s===","&&(s=n.replace(/"/g,"").replace(/,$/,"").trim());let a=this.getCurrentNode();if(a.name==="Properties70"){this.parseNodeSpecialProperty(e,i,s);return}if(i==="C"){let l=s.split(",").slice(1),c=parseInt(l[0]),h=parseInt(l[1]),u=s.split(",").slice(3);u=u.map(function(f){return f.trim().replace(/^"/,"")}),i="connections",s=[c,h],Uy(s,u),a[i]===void 0&&(a[i]=[])}i==="Node"&&(a.id=s),i in a&&Array.isArray(a[i])?a[i].push(s):i!=="a"?a[i]=s:a.a=s,this.setCurrentProp(a,i),i==="a"&&s.slice(-1)!==","&&(a.a=ah(s))}parseNodePropertyContinued(e){let t=this.getCurrentNode();t.a+=e,e.slice(-1)!==","&&(t.a=ah(t.a))}parseNodeSpecialProperty(e,t,n){let i=n.split('",').map(function(h){return h.trim().replace(/^\"/,"").replace(/\s/,"_")}),s=i[0],a=i[1],o=i[2],l=i[3],c=i[4];switch(a){case"int":case"enum":case"bool":case"ULongLong":case"double":case"Number":case"FieldOfView":c=parseFloat(c);break;case"Color":case"ColorRGB":case"Vector3D":case"Lcl_Translation":case"Lcl_Rotation":case"Lcl_Scaling":c=ah(c);break}this.getPrevNode()[s]={type:a,type2:o,flag:l,value:c},this.setCurrentProp(this.getPrevNode(),s)}},uh=class{parse(e){let t=new yo(e);t.skip(23);let n=t.getUint32();if(n<6400)throw new Error("THREE.FBXLoader: FBX version not supported, FileVersion: "+n);let i=new Mo;for(;!this.endOfContent(t);){let s=this.parseNode(t,n);s!==null&&i.add(s.name,s)}return i}endOfContent(e){return e.size()%16===0?(e.getOffset()+160+16&-16)>=e.size():e.getOffset()+160+16>=e.size()}parseNode(e,t){let n={},i=t>=7500?e.getUint64():e.getUint32(),s=t>=7500?e.getUint64():e.getUint32();t>=7500?e.getUint64():e.getUint32();let a=e.getUint8(),o=e.getString(a);if(i===0)return null;let l=[];for(let f=0;f<s;f++)l.push(this.parseProperty(e));let c=l.length>0?l[0]:"",h=l.length>1?l[1]:"",u=l.length>2?l[2]:"";for(n.singleProperty=s===1&&e.getOffset()===i;i>e.getOffset();){let f=this.parseNode(e,t);f!==null&&this.parseSubNode(o,n,f)}return n.propertyList=l,typeof c=="number"&&(n.id=c),h!==""&&(n.attrName=h),u!==""&&(n.attrType=u),o!==""&&(n.name=o),n}parseSubNode(e,t,n){if(n.singleProperty===!0){let i=n.propertyList[0];Array.isArray(i)?(t[n.name]=n,n.a=i):t[n.name]=i}else if(e==="Connections"&&n.name==="C"){let i=[];n.propertyList.forEach(function(s,a){a!==0&&i.push(s)}),t.connections===void 0&&(t.connections=[]),t.connections.push(i)}else if(n.name==="Properties70")Object.keys(n).forEach(function(s){t[s]=n[s]});else if(e==="Properties70"&&n.name==="P"){let i=n.propertyList[0],s=n.propertyList[1],a=n.propertyList[2],o=n.propertyList[3],l;i.indexOf("Lcl ")===0&&(i=i.replace("Lcl ","Lcl_")),s.indexOf("Lcl ")===0&&(s=s.replace("Lcl ","Lcl_")),s==="Color"||s==="ColorRGB"||s==="Vector"||s==="Vector3D"||s.indexOf("Lcl_")===0?l=[n.propertyList[4],n.propertyList[5],n.propertyList[6]]:l=n.propertyList[4],t[i]={type:s,type2:a,flag:o,value:l}}else t[n.name]===void 0?typeof n.id=="number"?(t[n.name]={},t[n.name][n.id]=n):t[n.name]=n:n.name==="PoseNode"?(Array.isArray(t[n.name])||(t[n.name]=[t[n.name]]),t[n.name].push(n)):t[n.name][n.id]===void 0&&(t[n.name][n.id]=n)}parseProperty(e){let t=e.getString(1),n;switch(t){case"C":return e.getBoolean();case"D":return e.getFloat64();case"F":return e.getFloat32();case"I":return e.getInt32();case"L":return e.getInt64();case"R":return n=e.getUint32(),e.getArrayBuffer(n);case"S":return n=e.getUint32(),e.getString(n);case"Y":return e.getInt16();case"b":case"c":case"d":case"f":case"i":case"l":let i=e.getUint32(),s=e.getUint32(),a=e.getUint32();if(s===0)switch(t){case"b":case"c":return e.getBooleanArray(i);case"d":return e.getFloat64Array(i);case"f":return e.getFloat32Array(i);case"i":return e.getInt32Array(i);case"l":return e.getInt64Array(i)}let o=ud(new Uint8Array(e.getArrayBuffer(a))),l=new yo(o.buffer);switch(t){case"b":case"c":return l.getBooleanArray(i);case"d":return l.getFloat64Array(i);case"f":return l.getFloat32Array(i);case"i":return l.getInt32Array(i);case"l":return l.getInt64Array(i)}break;default:throw new Error("THREE.FBXLoader: Unknown property type "+t)}}},yo=class{constructor(e,t){this.dv=new DataView(e),this.offset=0,this.littleEndian=t!==void 0?t:!0,this._textDecoder=new TextDecoder}getOffset(){return this.offset}size(){return this.dv.buffer.byteLength}skip(e){this.offset+=e}getBoolean(){return(this.getUint8()&1)===1}getBooleanArray(e){let t=[];for(let n=0;n<e;n++)t.push(this.getBoolean());return t}getUint8(){let e=this.dv.getUint8(this.offset);return this.offset+=1,e}getInt16(){let e=this.dv.getInt16(this.offset,this.littleEndian);return this.offset+=2,e}getInt32(){let e=this.dv.getInt32(this.offset,this.littleEndian);return this.offset+=4,e}getInt32Array(e){let t=[];for(let n=0;n<e;n++)t.push(this.getInt32());return t}getUint32(){let e=this.dv.getUint32(this.offset,this.littleEndian);return this.offset+=4,e}getInt64(){let e,t;return this.littleEndian?(e=this.getUint32(),t=this.getUint32()):(t=this.getUint32(),e=this.getUint32()),t&2147483648?(t=~t&4294967295,e=~e&4294967295,e===4294967295&&(t=t+1&4294967295),e=e+1&4294967295,-(t*4294967296+e)):t*4294967296+e}getInt64Array(e){let t=[];for(let n=0;n<e;n++)t.push(this.getInt64());return t}getUint64(){let e,t;return this.littleEndian?(e=this.getUint32(),t=this.getUint32()):(t=this.getUint32(),e=this.getUint32()),t*4294967296+e}getFloat32(){let e=this.dv.getFloat32(this.offset,this.littleEndian);return this.offset+=4,e}getFloat32Array(e){let t=[];for(let n=0;n<e;n++)t.push(this.getFloat32());return t}getFloat64(){let e=this.dv.getFloat64(this.offset,this.littleEndian);return this.offset+=8,e}getFloat64Array(e){let t=[];for(let n=0;n<e;n++)t.push(this.getFloat64());return t}getArrayBuffer(e){let t=this.dv.buffer.slice(this.offset,this.offset+e);return this.offset+=e,t}getString(e){let t=this.offset,n=new Uint8Array(this.dv.buffer,t,e);this.skip(e);let i=n.indexOf(0);return i>=0&&(n=new Uint8Array(this.dv.buffer,t,i)),this._textDecoder.decode(n)}},Mo=class{add(e,t){this[e]=t}};function Py(r){let e="Kaydara FBX Binary  \0";return r.byteLength>=e.length&&e===vd(r,0,e.length)}function Ly(r){let e=["K","a","y","d","a","r","a","\\","F","B","X","\\","B","i","n","a","r","y","\\","\\"],t=0;function n(i){let s=r[i-1];return r=r.slice(t+i),t++,s}for(let i=0;i<e.length;++i)if(n(1)===e[i])return!1;return!0}function md(r){let e=/FBXVersion: (\d+)/,t=r.match(e);if(t)return parseInt(t[1]);throw new Error("THREE.FBXLoader: Cannot find the version number for the file given.")}function Iy(r){return r/46186158e3}var Dy=[];function vo(r,e,t,n){let i;switch(n.mappingType){case"ByPolygonVertex":i=r;break;case"ByPolygon":i=e;break;case"ByVertice":i=t;break;case"AllSame":i=n.indices[0];break;default:console.warn("THREE.FBXLoader: unknown attribute mapping type "+n.mappingType)}n.referenceType==="IndexToDirect"&&(i=n.indices[i]);let s=i*n.dataSize,a=s+n.dataSize;return Ny(Dy,n.buffer,s,a)}var rh=new Gt,sr=new R;function gd(r){let e=new Ie,t=new Ie,n=new Ie,i=new Ie,s=new Ie,a=new Ie,o=new Ie,l=new Ie,c=new Ie,h=new Ie,u=new Ie,f=new Ie,d=r.inheritType?r.inheritType:0;if(r.translation&&e.setPosition(sr.fromArray(r.translation)),r.preRotation){let E=r.preRotation.map($t.degToRad);E.push(r.eulerOrder||Gt.DEFAULT_ORDER),t.makeRotationFromEuler(rh.fromArray(E))}if(r.rotation){let E=r.rotation.map($t.degToRad);E.push(r.eulerOrder||Gt.DEFAULT_ORDER),n.makeRotationFromEuler(rh.fromArray(E))}if(r.postRotation){let E=r.postRotation.map($t.degToRad);E.push(r.eulerOrder||Gt.DEFAULT_ORDER),i.makeRotationFromEuler(rh.fromArray(E)),i.invert()}r.scale&&s.scale(sr.fromArray(r.scale)),r.scalingOffset&&o.setPosition(sr.fromArray(r.scalingOffset)),r.scalingPivot&&a.setPosition(sr.fromArray(r.scalingPivot)),r.rotationOffset&&l.setPosition(sr.fromArray(r.rotationOffset)),r.rotationPivot&&c.setPosition(sr.fromArray(r.rotationPivot)),r.parentMatrixWorld&&(u.copy(r.parentMatrix),h.copy(r.parentMatrixWorld));let g=t.clone().multiply(n).multiply(i),x=new Ie;x.extractRotation(h);let m=new Ie;m.copyPosition(h);let p=m.clone().invert().multiply(h),_=x.clone().invert().multiply(p),v=s,M=new Ie;if(d===0)M.copy(x).multiply(g).multiply(_).multiply(v);else if(d===1)M.copy(x).multiply(_).multiply(g).multiply(v);else{let q=new Ie().scale(new R().setFromMatrixScale(u)).clone().invert(),Q=_.clone().multiply(q);M.copy(x).multiply(g).multiply(Q).multiply(v)}let D=c.clone().invert(),C=a.clone().invert(),P=e.clone().multiply(l).multiply(c).multiply(t).multiply(n).multiply(i).multiply(D).multiply(o).multiply(a).multiply(s).multiply(C),V=new Ie().copyPosition(P),w=h.clone().multiply(V);return f.copyPosition(w),P=f.clone().multiply(M),P.premultiply(h.invert()),P}function xd(r){r=r||0;let e=["ZYX","YZX","XZY","ZXY","YXZ","XYZ"];return r===6?(console.warn("THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect."),e[0]):e[r]}function ah(r){return r.split(",").map(function(t){return parseFloat(t)})}function vd(r,e,t){return e===void 0&&(e=0),t===void 0&&(t=r.byteLength),new TextDecoder().decode(new Uint8Array(r,e,t))}function Uy(r,e){for(let t=0,n=r.length,i=e.length;t<i;t++,n++)r[n]=e[t]}function Ny(r,e,t,n){for(let i=t,s=0;i<n;i++,s++)r[s]=e[i];return r}var qt={models:{},tex:{},landmarks:null},_d=["soldier","rifle","pistol","grenade","crate","barrel","barrier"],yd=["large_sandstone_blocks_01","white_sandstone_bricks_03","beige_wall_002","asphalt_05","rectangular_paving","marble_tiles","dense_sand","plastered_wall_04","concrete_wall_007"];async function So(r){let e=window.__ASSETS&&window.__ASSETS[r];if(e){let n=atob(e),i=new Uint8Array(n.length);for(let s=0;s<n.length;s++)i[s]=n.charCodeAt(s);return i.buffer}let t=await fetch("assets/"+r);if(!t.ok)throw new Error("missing asset "+r);return t.arrayBuffer()}async function fh(r,e){let t=await So(r),n=await createImageBitmap(new Blob([t],{type:"image/jpeg"}),{imageOrientation:"flipY"}),i=new It(n);return i.wrapS=i.wrapT=mn,i.colorSpace=e?it:pn,i.anisotropy=8,i.needsUpdate=!0,i}async function Md(r){let e=_d.length+yd.length*2+3,t=0,n=()=>r&&r(++t/e),i=new mo;await Promise.all([..._d.map(async a=>{let o=await So(`models/${a}.glb`);qt.models[a]=await i.parseAsync(o,""),n()}),...yd.flatMap(a=>[fh(`tex/${a}_d.jpg`,!0).then(o=>{(qt.tex[a]||={}).map=o,n()}),fh(`tex/${a}_n.jpg`,!1).then(o=>{(qt.tex[a]||={}).normal=o,n()})]),(async()=>{let[a,o]=await Promise.all([So("models/m4a1.fbx"),fh("tex/m4a1_d.jpg",!0)]),l=new Br;l.setURLModifier(()=>"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");let c=new _o(l).parse(a,""),h=new Qe({map:o,roughness:.5,metalness:.55,envMapIntensity:1});c.traverse(u=>{u.isMesh&&(u.material=h)}),qt.models.m4a1={scene:c,animations:[]},n(),n()})(),So("osm/landmarks.json").then(a=>{qt.landmarks=JSON.parse(new TextDecoder().decode(a)),n()})]);let s=(a,o)=>{let l=[];qt.models[a].scene.traverse(c=>{o.test(c.name)&&l.push(c)}),l.forEach(c=>c.parent&&c.parent.remove(c))};s("pistol",/_b$|magazine_empty|bullet/),qt.models.pistol.scene.traverse(a=>{/magazine_loaded/.test(a.name)&&a.position.set(0,0,0)}),s("rifle",/bullet/),s("crate",/_b$|cloth/)}var _t=100,Sd=.5,dh={lat:25.1955,lon:55.276},wd={x:-180,z:-170},Fy=(r,e)=>[(r-dh.lon)*111320*Math.cos(dh.lat*Math.PI/180)-wd.x,-(e-dh.lat)*110574-wd.z],Oy=r=>r.type==="Polygon"?[r.coordinates[0]]:r.type==="MultiPolygon"?r.coordinates.map(e=>e[0]):[];function qr(r,e=r){let t=document.createElement("canvas");return t.width=r,t.height=e,t}function ph(r,e=!0){let t=new kn(r);return t.wrapS=t.wrapT=mn,t.anisotropy=8,e&&(t.colorSpace=it),t}function By(){let r=qr(256),e=r.getContext("2d"),t=e.createLinearGradient(0,0,0,256);t.addColorStop(0,"#9fc0d6"),t.addColorStop(.5,"#7aa0bd"),t.addColorStop(1,"#5d86a6"),e.fillStyle=t,e.fillRect(0,0,256,256);for(let i=0;i<256;i+=16)e.fillStyle=`rgba(255,255,255,${.06+Math.random()*.12})`,e.fillRect(0,i,256,14);e.fillStyle="rgba(20,35,50,.32)";for(let i=0;i<256;i+=16)e.fillRect(i,0,2,256);for(let i=0;i<256;i+=16)e.fillRect(0,i,256,2);return ph(r)}function zy(){let r=qr(64,128),e=r.getContext("2d");e.fillStyle="#7b6a55",e.fillRect(0,0,64,128);for(let t=0;t<128;t+=7)e.fillStyle=`rgba(40,30,20,${.35+Math.random()*.2})`,e.fillRect(0,t,64,2+Math.random()*2);return ph(r)}function ky(){let r=qr(128,256),e=r.getContext("2d");e.clearRect(0,0,128,256),e.strokeStyle="#2f5a24",e.lineWidth=3,e.beginPath(),e.moveTo(64,256),e.lineTo(64,4),e.stroke();for(let t=6;t<250;t+=5){let n=58*Math.sin(Math.min(1,(250-t)/250+.1)*2.2)*(.5+.5*(t/250)*.4+.5*Math.min(1,(250-t)/120));for(let i of[-1,1])e.strokeStyle=`rgba(${55+Math.random()*25|0},${105+Math.random()*40|0},45,.95)`,e.lineWidth=2.2,e.beginPath(),e.moveTo(64,t),e.lineTo(64+i*n,t+14+n*.15),e.stroke()}return ph(r)}function bd(r,e){let t=[],n=new Map,i=qt.tex,s=(A,I,U={})=>new Qe({map:i[A].map,normalMap:i[A].normal,normalScale:new pe(U.ns??.9,U.ns??.9),roughness:U.rough??.92,metalness:U.metal??0,color:U.color??16777215,envMapIntensity:U.env??.5}),a=By(),o={stone:s("large_sandstone_blocks_01",4,{color:15786696}),plaster:s("beige_wall_002",3,{color:16773592}),brick:s("white_sandstone_bricks_03",3,{color:16774884}),plaster2:s("plastered_wall_04",3,{color:15983558}),marble:s("marble_tiles",3,{rough:.35,env:.8}),concrete:s("concrete_wall_007",3,{color:15130838}),asphalt:s("asphalt_05",4,{rough:.95}),paving:s("rectangular_paving",3,{color:15918802}),roof:s("concrete_wall_007",4,{color:12169894}),glass:new Qe({map:a,color:16777215,metalness:.85,roughness:.18,envMapIntensity:1.4}),glassDark:new Qe({map:a,color:7309984,metalness:.9,roughness:.14,envMapIntensity:1.5}),metal:new Qe({color:3159098,roughness:.45,metalness:.8,envMapIntensity:.9}),gold:new Qe({color:14265690,roughness:.3,metalness:.95,envMapIntensity:1.3}),lamp:new Jt({color:16773320}),water:new Qe({color:2068392,roughness:.04,metalness:.2,envMapIntensity:2}),grass:new Qe({color:5208628,roughness:1}),bush:new Qe({color:3893802,roughness:1}),soil:new Qe({color:11570014,roughness:1}),paint:new Qe({color:15319626,roughness:.9,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),paintWhite:new Qe({color:15262938,roughness:.9,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),carWhite:new Qe({color:15790318,roughness:.22,metalness:.65,envMapIntensity:1.2}),carBlack:new Qe({color:1382170,roughness:.2,metalness:.7,envMapIntensity:1.2}),carGold:new Qe({color:13214282,roughness:.25,metalness:.8,envMapIntensity:1.2}),carGlass:new Qe({color:791064,roughness:.05,metalness:.9,envMapIntensity:1.6}),tire:new Qe({color:855309,roughness:.9}),trunk:new Qe({map:zy(),roughness:1}),frond:new Qe({map:ky(),alphaTest:.5,side:Sn,roughness:.8,transparent:!1})};function l(A){let I=n.get(A);return I||(I={pos:[],nor:[],uv:[],idx:[],n:0},n.set(A,I)),I}function c(A,I){I.index===null&&(I=I.toNonIndexed?(()=>{let B=[];for(let G=0;G<I.attributes.position.count;G++)B.push(G);return I.setIndex(B),I})():I);let U=l(A),O=I.attributes.position,S=I.attributes.normal,z=I.attributes.uv;for(let B=0;B<O.count;B++)U.pos.push(O.getX(B),O.getY(B),O.getZ(B)),U.nor.push(S.getX(B),S.getY(B),S.getZ(B)),U.uv.push(z?z.getX(B):0,z?z.getY(B):0);for(let B=0;B<I.index.count;B++)U.idx.push(I.index.getX(B)+U.n);U.n+=O.count,I.dispose()}function h(A,I,U,O,S,z,B={}){let G=B.y0||0,re=B.tile||3,ye=B.solid!==!1,Ae=new on(U,S,O),Ue=Ae.attributes.uv,De=xe(0,1),be=xe(0,1);for(let Ce=0;Ce<6;Ce++){let $e=Ce<2?O:U,Ct=Ce<2?S:Ce<4?O:S;for(let ft=0;ft<4;ft++){let at=Ce*4+ft;Ue.setXY(at,Ue.getX(at)*$e/re+De,Ue.getY(at)*Ct/re+be)}}B.ry&&Ae.rotateY(B.ry),Ae.translate(A,G+S/2,I),c(z,Ae),ye&&t.push({x0:A-U/2,x1:A+U/2,y0:G,y1:G+S,z0:I-O/2,z1:I+O/2})}function u(A,I,U,O,S,z={}){let B=new Ui(z.r2??U,U,O,z.seg||14);B.translate(A,(z.y0||0)+O/2,I),c(S,B),z.solid!==!1&&t.push({x0:A-U*.85,x1:A+U*.85,y0:z.y0||0,y1:(z.y0||0)+O,z0:I-U*.85,z1:I+U*.85})}let f=(A,I,U,O,S)=>{let z=new os(O,16,10);z.translate(A,I,U),c(S,z)},d=(A,I,U,O,S=.6)=>!t.some(z=>A+U/2+S>z.x0&&A-U/2-S<z.x1&&I+O/2+S>z.z0&&I-O/2-S<z.z1&&z.y0<2.5);function g(A,I,U,O,S,z,B,G){O-U<.05||z-S<.05||(A==="x"?h((U+O)/2,I,O-U,B,z-S,G,{y0:S,tile:3}):h(I,(U+O)/2,B,O-U,z-S,G,{y0:S,tile:3}))}function x(A,I,U,O,S,z,B,G){let re=[...B||[]].sort((Ue,De)=>Ue.at-De.at),ye=(U+O)/2,Ae=U;for(let Ue of re){let De=ye+Ue.at-Ue.w/2,be=ye+Ue.at+Ue.w/2;g(A,I,Ae,De,0,S,z,G),Ue.kind==="win"?(g(A,I,De,be,0,1,z,G),g(A,I,De,be,2.3,S,z,G)):g(A,I,De,be,2.7,S,z,G),Ae=be}g(A,I,Ae,O,0,S,z,G)}function m(A,I,U,O,S,z){let G=z.key||"plaster";if(x("x",I-O/2,A-U/2-.7/2,A+U/2+.7/2,S,.7,z.n,G),x("x",I+O/2,A-U/2-.7/2,A+U/2+.7/2,S,.7,z.s,G),x("z",A-U/2,I-O/2+.7/2,I+O/2-.7/2,S,.7,z.w,G),x("z",A+U/2,I-O/2+.7/2,I+O/2-.7/2,S,.7,z.e,G),z.roof!==!1&&(h(A,I,U+1.2,O+1.2,.45,"roof",{y0:S,tile:4}),h(A,I-O/2-.3,U+1.4,.35,.7,G,{y0:S+.45,tile:3,solid:!1}),h(A,I+O/2+.3,U+1.4,.35,.7,G,{y0:S+.45,tile:3,solid:!1}),h(A-U/2-.3,I,.35,O+1.4,.7,G,{y0:S+.45,tile:3,solid:!1}),h(A+U/2+.3,I,.35,O+1.4,.7,G,{y0:S+.45,tile:3,solid:!1})),z.tower){let re=A+(z.tower.dx||0),ye=I+(z.tower.dz||0);h(re,ye,2.4,2.4,4.2,G,{y0:S+.45,tile:2,solid:!1});for(let Ae=0;Ae<4;Ae++)h(re,ye,1,2.5,1.6,"metal",{y0:S+2.6,tile:1,solid:!1});h(re,ye,2.6,2.6,.3,"roof",{y0:S+4.65,tile:2,solid:!1})}}let p=(A,I=3.2)=>({at:A,w:I,kind:"door"}),_=(A,I=2.4)=>({at:A,w:I,kind:"win"});function v(A,I,U,O,S=8){let z=new Ur(A.map(re=>new pe(re[0],-re[1]))),B=new to(z,{depth:U-I,bevelEnabled:!1,curveSegments:1});B.rotateX(-Math.PI/2),B.translate(0,I,0);let G=B.attributes.uv;for(let re=0;re<G.count;re++)G.setXY(re,G.getX(re)/S,G.getY(re)/S);c(O,B)}function M(A,I,U=1.4){let O=Math.max(-_t,Math.min(...A.map(G=>G[1]))),S=Math.min(_t,Math.max(...A.map(G=>G[1]))),z=[],B=[];for(let G=O;G<S;G+=U){let re=G+U/2,ye=[];for(let De=0;De<A.length;De++){let be=A[De],Ce=A[(De+1)%A.length];(be[1]<=re&&Ce[1]>re||Ce[1]<=re&&be[1]>re)&&ye.push(be[0]+(re-be[1])*(Ce[0]-be[0])/(Ce[1]-be[1]))}ye.sort((De,be)=>De-be);let Ae=[];for(let De=0;De+1<ye.length;De+=2){let be=Math.max(-_t,ye[De]),Ce=Math.min(_t,ye[De+1]);Ce-be>.2&&Ae.push([be,Ce])}let Ue=[];for(let De of Ae){let be=z.find(Ce=>Math.abs(Ce.x0-De[0])<.35&&Math.abs(Ce.x1-De[1])<.35&&!Ce.used);if(be)be.z1=G+U,be.used=!0,Ue.push(be);else{let Ce={x0:De[0],x1:De[1],z0:G,z1:G+U,y0:0,y1:I,used:!0};B.push(Ce),Ue.push(Ce)}}for(let De of Ue)De.used=!1;z=Ue}for(let G of B)delete G.used,t.push(G)}let D=(A,I)=>{let U=0,O=0;for(let S of A)U+=S[0],O+=S[1];return U/=A.length,O/=A.length,A.map(S=>[U+(S[0]-U)*I,O+(S[1]-O)*I])},C=qt.landmarks,P=A=>C[A]?Oy(C[A].geo).map(I=>I.map(U=>Fy(U[0],U[1]))):[],V=P("Burj Khalifa Dubai")[0];M(V,40);let w=[[0,45,1],[45,110,.94],[110,190,.85],[190,290,.75],[290,400,.65],[400,510,.54],[510,620,.43],[620,710,.32],[710,770,.2]];for(let[A,I,U]of w)v(U===1?V:D(V,U),A,I,"glass",40);{let A=0,I=0;for(let U of V)A+=U[0],I+=U[1];A/=V.length,I/=V.length,u(A,I,2.6,60,"metal",{r2:.25,y0:768,solid:!1,seg:10})}v(D(V,1.02),0,3.2,"stone",4),v(D(V,1.03),3.2,3.6,"gold",4);let E=[["The Address Downtown Dubai",302,"glass"],["Boulevard Plaza Dubai",263,"glass"],["The Lofts Downtown Dubai",150,"glassDark"],["Vida Downtown Dubai",95,"glass"],["Burj Views Dubai",210,"glassDark"],["Palace Downtown Dubai",42,"stone"],["Souk Al Bahar Dubai",24,"stone"],["Dubai Opera",30,"brick"]];for(let[A,I,U]of E)for(let O of P(A))v(O,0,I,U,U==="stone"||U==="brick"?6:40),v(O,I,I+.8,"roof",4);for(let A of P("The Dubai Mall"))M(A,26),v(A,0,26,"brick",6),v(A,26,27,"roof",4);for(let A of P("Burj Park Dubai"))v(A,0,.12,"grass",8);for(let A of P("Dubai Fountain Dubai"))v(A,0,.18,"water",8);let q=_t+1.5;for(let[A,I,U,O]of[[0,-q,_t*2+6,3],[0,q,_t*2+6,3],[-q,0,3,_t*2+6],[q,0,3,_t*2+6]])h(A,I,U,O,5.5,"stone",{tile:4}),h(A,I,U+.4,O+.4,.4,"gold",{y0:5.5,tile:3,solid:!1});m(-62,56,24,15,6.4,{key:"plaster",n:[p(-6),_(6)],s:[p(4),_(-7,2.4)],w:[p(0)],e:[p(-3),_(4)],tower:{dx:-6,dz:0}}),m(-82,20,15,20,6,{key:"brick",n:[_(0)],s:[p(0)],w:[_(-5),_(5)],e:[p(-4),p(5)],tower:{dx:0,dz:5}}),m(-36,78,18,12,6,{key:"plaster2",n:[p(0)],s:[_(0)],w:[p(0)],e:[_(0)],tower:{dx:4,dz:0}}),m(-35,40,13,13,5.6,{key:"brick",n:[p(0)],s:[p(0)],w:[_(0)],e:[_(0)]});for(let A=0;A<6;A++)h(-70+A*4.2,33,.8,.8,3.6,"stone",{tile:2});h(-58.5,33,26,2.6,.5,"roof",{y0:3.6,tile:3,solid:!1}),d(70,-20,22,16)&&(m(70,-20,20,14,6.6,{key:"brick",roof:!1,n:[_(-5),_(5)],s:[p(0,4)],w:[p(0)],e:[_(0)]}),h(70,-20,21.4,15.4,.5,"roof",{y0:6.6,tile:4,solid:!1}),f(70,8.4,-20,5.2,"gold"),u(82.5,-28,1.3,24,"brick",{r2:1}),f(82.5,25.6,-28,1.25,"gold"),u(82.5,-28,.12,4,"gold",{y0:26.5,solid:!1,r2:.04}));function Q(A,I,U,O,S,z=4.2){for(let B=0;B<U;B++)for(let G=0;G<O;G++)(B===0||B===U-1||G===0||G===O-1)&&h(A+(B-(U-1)/2)*S,I+(G-(O-1)/2)*S,.7,.7,z,"stone",{tile:2});h(A,I,(U-1)*S+3,(O-1)*S+3,.4,"roof",{y0:z,tile:4,solid:!1}),h(A,I,(U-1)*S+3.6,(O-1)*S+3.6,.2,"gold",{y0:z+.4,tile:3,solid:!1})}Q(40,62,5,3,5),Q(-8,-70,4,3,5),h(40,62,14,4,.55,"marble",{y0:0,tile:2});function le(A,I,U,O){h(A,I,U,O,.45,"marble",{tile:2});let S=new di(U-1.2,O-1.2);S.rotateX(-Math.PI/2),S.translate(A,.43,I),c("water",S)}le(-8,60,18,7),le(60,30,14,14),le(-60,-76,16,6);function F(A,I,U,O){h(A,I,U,O,.9,"stone",{tile:2}),h(A,I,U-.5,O-.5,.1,"soil",{y0:.9,tile:3,solid:!1});for(let S=0;S<Math.max(2,Math.round(Math.max(U,O)/1.4));S++){let z=A+(Math.random()-.5)*(U-.8),B=I+(Math.random()-.5)*(O-.8);f(z,1.25,B,.55+Math.random()*.2,"bush")}}for(let[A,I,U,O]of[[-8,36,10,2.2],[14,40,2.2,10],[-20,-34,8,2.2],[24,-40,2.2,9],[0,12,2.4,8],[48,6,9,2.2],[-46,-18,2.2,9],[30,-66,10,2.2],[66,56,8,2.2],[-74,-48,2.2,8],[-26,8,7,2.2],[20,-12,6,2.2]])d(A,I,U,O)&&F(A,I,U,O);function Y(A,I,U,O,S=!0){let z=S?4.9:4.4,B=1.95,G=new At,re=[],ye=(Ce,$e,Ct,ft,at,St,yt)=>{let Ze=new on(Ce,$e,Ct);Ze.translate(ft,at,St),re.push([yt,Ze])};ye(z,.78,B,0,.72,0,O),ye(z*.55,.62,B*.92,-z*.04,1.38,0,O),ye(z*.5,.5,B*.94,-z*.04,1.4,0,"carGlass"),ye(.12,.4,B*.9,z/2-.05,.9,0,"carBlack");for(let Ce of[-1,1])for(let $e of[-1,1]){let Ct=new Ui(.42,.42,.3,14);Ct.rotateX(Math.PI/2),Ct.translate(Ce*z*.32,.42,$e*(B/2-.05)),re.push(["tire",Ct])}for(let[Ce,$e]of re)$e.rotateY(U),$e.translate(A,0,I),c(Ce,$e);let Ae=Math.abs(Math.cos(U)),Ue=Math.abs(Math.sin(U)),De=(z*Ae+B*Ue)/2,be=(z*Ue+B*Ae)/2;t.push({x0:A-De,x1:A+De,y0:.15,y1:1.95,z0:I-be,z1:I+be})}for(let[A,I,U,O]of[[-20,70,0,"carWhite"],[-28,70,.1,"carBlack"],[18,78,0,"carWhite"],[30,78,0,"carGold"],[-12,-50,Math.PI/2,"carWhite"],[10,-52,Math.PI/2,"carBlack"],[60,-56,0,"carWhite"],[-50,4,Math.PI/2,"carGold"],[52,82,0,"carBlack"],[-66,-20,Math.PI/2,"carWhite"]])d(A,I,5,2.2,.4)&&Y(A,I,U,O);for(let[A,I]of[[-40,-30],[-30,20],[4,-24],[30,-6],[-4,28],[50,-44],[-56,-62],[36,40],[-90,60],[90,60],[-90,-60],[90,-60],[-5,90],[5,-90]])d(A,I,.6,.6)&&(h(A,I,.3,.3,7.5,"metal",{tile:2}),h(A+.6,I,1.4,.2,.18,"metal",{y0:7.4,solid:!1,tile:2}),h(A+1.2,I,.5,.3,.12,"lamp",{y0:7.28,solid:!1,tile:2}));for(let A=-96;A<96;A+=6)h(A,88,3,.2,.02,"paintWhite",{solid:!1});for(let A=-96;A<96;A+=8)d(0,A,.3,2,.1)&&h(0,A,.2,3,.02,"paint",{solid:!1});let J=[];function ae(A,I,U,O,S,z,B,G){if(!d(I,U,z,B,.3))return;let re=qt.models[A].scene.clone(!0);re.position.set(I,0,U),re.rotation.y=O,re.scale.setScalar(S),re.traverse(Ue=>{Ue.isMesh&&(Ue.castShadow=!0,Ue.receiveShadow=!0)}),J.push(re);let ye=Math.abs(Math.cos(O)),Ae=Math.abs(Math.sin(O));t.push({x0:I-(z*ye+B*Ae)/2,x1:I+(z*ye+B*Ae)/2,y0:0,y1:G,z0:U-(z*Ae+B*ye)/2,z1:U+(z*Ae+B*ye)/2})}let ie=[[-30,-12,0],[-27,-12,0],[-24,-12,0],[26,14,0],[29,14,0],[32,14,0],[-6,-22,Math.PI/2],[-6,-19,Math.PI/2],[10,20,Math.PI/2],[10,23,Math.PI/2],[-50,38,Math.PI/2],[-50,41,Math.PI/2],[50,-56,0],[53,-56,0],[-44,-44,0],[-41,-44,0],[44,44,0],[47,44,0],[0,50,0],[3,50,0],[0,-40,0],[-3,-40,0],[70,10,Math.PI/2],[70,13,Math.PI/2],[-70,-30,Math.PI/2],[-70,-33,Math.PI/2]];for(let[A,I,U]of ie)ae("barrier",A,I,U,1,1.56,.45,1.1);for(let[A,I]of[[-14,-4],[-14.9,-3],[24,-26],[24.9,-27.2],[-40,66],[-41,67.2],[50,70],[49,68.8],[6,0],[-58,-56],[76,40],[-24,94]])ae("barrel",A,I,xe(0,6),1.15,.65,.65,1);for(let[A,I,U]of[[-18,20,.3],[-17,21.2,-.2],[20,-22,.4],[21,-20.8,.1],[44,-8,0],[-52,-10,1],[60,66,.5],[-4,-60,.2],[36,20,1.2],[-30,-50,.7]])ae("crate",A,I,U,1.7,1.4,.8,.45);let ee=[];for(let A=-4;A<=4;A++)ee.push([A*10+5,24],[A*10+5,-30]);for(let A=-3;A<=3;A++)ee.push([-20,A*14],[20,A*14+6],[-88,A*12],[88,A*12+4]);let oe=0;for(let[A,I]of ee){if(!d(A,I,.7,.7,.8)||Math.abs(A)>_t-3||Math.abs(I)>_t-3||oe>46)continue;oe++;let U=xe(7,11),O=xe(-1,1),S=xe(0,6.28),z=7,B=[0,0,0];for(let Ae=0;Ae<z;Ae++){let Ue=Ae/z,De=(Ae+1)/z,be=St=>O*St*St*2.2,Ce=[Math.cos(S)*be(Ue),Ue*U,Math.sin(S)*be(Ue)],$e=[Math.cos(S)*be(De),De*U,Math.sin(S)*be(De)],Ct=Math.hypot($e[0]-Ce[0],$e[1]-Ce[1],$e[2]-Ce[2]),ft=new Ui(.2-De*.07,.2-Ue*.07,Ct,7,1,!0),at=new R($e[0]-Ce[0],$e[1]-Ce[1],$e[2]-Ce[2]).normalize();ft.applyQuaternion(new bt().setFromUnitVectors(new R(0,1,0),at)),ft.translate(A+(Ce[0]+$e[0])/2,(Ce[1]+$e[1])/2,I+(Ce[2]+$e[2])/2),c("trunk",ft),B=$e}let G=A+B[0],re=B[1],ye=I+B[2];t.push({x0:A-.25,x1:A+.25,y0:0,y1:4,z0:I-.25,z1:I+.25});for(let Ae=0;Ae<15;Ae++){let Ue=Ae/15*Math.PI*2+xe(-.15,.15),De=xe(.7,1.35),be=xe(2.8,3.8),Ce=[],$e=[],Ct=[],ft=7;for(let St=0;St<=ft;St++){let yt=St/ft,Ze=be*yt,Et=Math.sin(yt*2)*.95-yt*yt*De*1.7,ot=.55*Math.sin(Math.min(1,yt*3.2)*1.4+.2)*(1-yt*.55),lt=Math.cos(Ue)*Ze,Ut=Math.sin(Ue)*Ze,b=-Math.sin(Ue)*ot,H=Math.cos(Ue)*ot;if(Ce.push(G+lt-b,re+Et,ye+Ut-H,G+lt+b,re+Et,ye+Ut+H),$e.push(0,yt,1,yt),St<ft){let K=St*2;Ct.push(K,K+1,K+2,K+1,K+3,K+2)}}let at=new Dt;at.setAttribute("position",new pt(Ce,3)),at.setAttribute("uv",new pt($e,2)),at.setIndex(Ct),at.computeVertexNormals(),c("frond",at)}}for(let[A,I]of n){let U=new Dt;U.setAttribute("position",new pt(I.pos,3)),U.setAttribute("normal",new pt(I.nor,3)),U.setAttribute("uv",new pt(I.uv,2)),U.setIndex(I.n>65535?new Ys(I.idx,1):new Pi(I.idx,1)),(A==="stone"||A==="plaster"||A==="brick"||A==="plaster2"||A==="marble"||A==="concrete"||A==="roof"||A==="asphalt"||A==="paving")&&U.computeTangents,U.computeBoundingSphere();let O=new gt(U,o[A]);O.castShadow=!["lamp","paint","paintWhite","water","grass"].includes(A),O.receiveShadow=A!=="lamp",r.add(O)}for(let A of J)r.add(A);let k=(A,I,U,O,S)=>{let z=qt.tex[A],B=new Qe({map:z.map.clone(),normalMap:z.normal.clone(),roughness:.95,color:S,envMapIntensity:.4});for(let re of["map","normalMap"])B[re].repeat.set(I/U,I/U),B[re].needsUpdate=!0;let G=new gt(new di(I,I),B);return G.rotation.x=-Math.PI/2,G.position.y=O,G.receiveShadow=!0,r.add(G),G};k("dense_sand",3200,8,-.06,15126432),k("rectangular_paving",_t*2+40,3.2,0,16050388);{let A=qt.tex.asphalt_05,I=new Qe({map:A.map.clone(),normalMap:A.normal.clone(),roughness:.95,envMapIntensity:.4});for(let O of["map","normalMap"])I[O].repeat.set(_t*2/4,4),I[O].needsUpdate=!0;let U=new gt(new di(_t*2,16),I);U.rotation.x=-Math.PI/2,U.position.set(0,.015,88),U.receiveShadow=!0,r.add(U)}let j=(()=>{let A=qr(1024,512),I=A.getContext("2d"),U=I.createLinearGradient(0,0,0,512);U.addColorStop(0,"#2f6ab8"),U.addColorStop(.3,"#5e97d2"),U.addColorStop(.43,"#a9c6dc"),U.addColorStop(.5,"#ecdcc0"),U.addColorStop(.52,"#e8d3b0"),U.addColorStop(1,"#cdb48f"),I.fillStyle=U,I.fillRect(0,0,1024,512);for(let S=0;S<70;S++){let z=xe(0,1024),B=xe(100,215),G=xe(40,150),re=xe(4,12),ye=I.createRadialGradient(z,B,0,z,B,G);ye.addColorStop(0,"rgba(255,255,255,.28)"),ye.addColorStop(1,"rgba(255,255,255,0)"),I.save(),I.translate(z,B),I.scale(1,re/G),I.translate(-z,-B),I.fillStyle=ye,I.fillRect(z-G,B-G,G*2,G*2),I.restore()}let O=new kn(A);return O.colorSpace=it,O.mapping=ts,O})(),W=new gt(new os(1500,32,16),new Jt({map:j,side:rn,fog:!1,depthWrite:!1}));W.renderOrder=-10,r.add(W);let se=2.2,ge=.62,Me=new R(Math.cos(ge)*Math.sin(se),Math.sin(ge),Math.cos(ge)*Math.cos(se)),Se=qr(128),Fe=Se.getContext("2d"),He=Fe.createRadialGradient(64,64,0,64,64,64);He.addColorStop(0,"rgba(255,250,235,1)"),He.addColorStop(.15,"rgba(255,235,190,.85)"),He.addColorStop(.5,"rgba(255,210,150,.2)"),He.addColorStop(1,"rgba(255,200,130,0)"),Fe.fillStyle=He,Fe.fillRect(0,0,128,128);let Ne=new Kn(new zn({map:new kn(Se),blending:ci,depthWrite:!1,fog:!1,transparent:!0}));Ne.position.copy(Me).multiplyScalar(1300),Ne.scale.set(700,700,1),r.add(Ne);for(let A=0;A<70;A++){let I=A/70*Math.PI*2+xe(-.04,.04),U=xe(380,900),O=xe(24,60),S=xe(24,60),z=xe(40,220),B=new gt(new on(O,z,S),o[Math.random()<.6?"glass":"glassDark"]);B.position.set(Math.cos(I)*U,z/2-2,Math.sin(I)*U),B.rotation.y=xe(0,1.6);let G=B.geometry.attributes.uv;for(let re=0;re<G.count;re++)G.setXY(re,G.getX(re)*O/50,G.getY(re)*z/50);r.add(B)}let Be=1.5,L=Math.ceil(_t*2/Be),me=new Uint8Array(L*L),te=.6;for(let A of t){if(!(A.y0<1.8&&A.y1>.45))continue;let I=Math.max(0,Math.floor((A.x0-te+_t)/Be)),U=Math.min(L-1,Math.floor((A.x1+te+_t)/Be)),O=Math.max(0,Math.floor((A.z0-te+_t)/Be)),S=Math.min(L-1,Math.floor((A.z1+te+_t)/Be));for(let z=O;z<=S;z++)for(let B=I;B<=U;B++){let G=-_t+(B+.5)*Be,re=-_t+(z+.5)*Be;G>A.x0-te&&G<A.x1+te&&re>A.z0-te&&re<A.z1+te&&(me[z*L+B]=1)}}for(let A=0;A<L;A++)me[A]=1,me[(L-1)*L+A]=1,me[A*L]=1,me[A*L+L-1]=1;let de=A=>Math.max(0,Math.min(L-1,Math.floor((A+_t)/Be))),ne=(A,I)=>me[de(I)*L+de(A)]===1;function Oe(A,I){if(!me[I*L+A])return[A,I];for(let U=1;U<16;U++)for(let O=-U;O<=U;O++)for(let S=-U;S<=U;S++){if(Math.max(Math.abs(S),Math.abs(O))!==U)continue;let z=A+S,B=I+O;if(!(z<0||B<0||z>=L||B>=L)&&!me[B*L+z])return[z,B]}return null}function we(A,I,U,O){let S=U-A,z=O-I,B=Math.ceil(Math.hypot(S,z)/.5);for(let G=1;G<=B;G++)if(ne(A+S*G/B,I+z*G/B))return!1;return!0}let T=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.4142],[-1,1,1.4142],[1,-1,1.4142],[-1,-1,1.4142]],y=L*L,X=new Float32Array(y),ue=new Int32Array(y),ce=new Uint8Array(y),he=y*9,Ee=new Float32Array(he),ve=new Int32Array(he);function Pe(A,I,U,O){let S=Oe(de(A),de(I)),z=Oe(de(U),de(O));if(!S||!z)return[];X.fill(1e9),ue.fill(-1),ce.fill(0);let B=0,G=(Ze,Et)=>{let ot=B++;for(;ot>0;){let lt=ot-1>>1;if(Ee[lt]<=Ze)break;Ee[ot]=Ee[lt],ve[ot]=ve[lt],ot=lt}Ee[ot]=Ze,ve[ot]=Et},re=()=>{let Ze=ve[0];if(B--,B>0){let Et=Ee[B],ot=ve[B],lt=0;for(;;){let Ut=lt*2+1;if(Ut>=B)break;let b=Ut+1,H=b<B&&Ee[b]<Ee[Ut]?b:Ut;if(Ee[H]>=Et)break;Ee[lt]=Ee[H],ve[lt]=ve[H],lt=H}Ee[lt]=Et,ve[lt]=ot}return Ze},ye=S[1]*L+S[0],Ae=z[1]*L+z[0],Ue=z[0],De=z[1],be=Ze=>{let Et=Math.abs(Ze%L-Ue),ot=Math.abs((Ze/L|0)-De);return Et+ot-.5858*Math.min(Et,ot)};X[ye]=0,G(be(ye),ye);let Ce=!1,$e=0;for(;B>0&&$e++<2e4;){let Ze=re();if(ce[Ze])continue;if(ce[Ze]=1,Ze===Ae){Ce=!0;break}let Et=Ze%L,ot=Ze/L|0;for(let lt=0;lt<8;lt++){let Ut=T[lt],b=Ut[0],H=Ut[1],K=Et+b,$=ot+H;if(K<0||$<0||K>=L||$>=L)continue;let Z=$*L+K;if(me[Z]||ce[Z]||b!==0&&H!==0&&(me[ot*L+K]||me[$*L+Et]))continue;let Te=X[Ze]+Ut[2];Te<X[Z]&&(X[Z]=Te,ue[Z]=Ze,G(Te+be(Z),Z))}}if(!Ce)return[];let Ct=[];for(let Ze=Ae;Ze!==-1;Ze=ue[Ze])Ct.push(Ze);Ct.reverse();let ft=Ct.map(Ze=>({x:-_t+(Ze%L+.5)*Be,z:-_t+((Ze/L|0)+.5)*Be})),at=[],St={x:A,z:I},yt=0;for(;yt<ft.length;){let Ze=yt;for(let Et=Math.min(ft.length-1,yt+40);Et>yt;Et--)if(we(St.x,St.z,ft[Et].x,ft[Et].z)){Ze=Et;break}at.push(ft[Ze]),St=ft[Ze],yt=Ze+1}return at}function Ve(A=-_t+3,I=_t-3,U=-_t+3,O=_t-3){for(let S=0;S<80;S++){let z=xe(A,I),B=xe(U,O);if(!ne(z,B))return{x:z,z:B}}return{x:0,z:90}}function Ye(A,I,U,O){let S=0;for(let z=0;z<t.length;z++){let B=t[z];A+U>B.x0&&A-U<B.x1&&I+U>B.z0&&I-U<B.z1&&B.y1<=O+Sd+.001&&B.y1>S&&(S=B.y1)}return S}function fe(A,I,U,O){let S=!1;for(let z=0;z<3;z++)for(let B=0;B<t.length;B++){let G=t[B];if(G.y1<=U+Sd||G.y0>=U+O||A.x<G.x0-I||A.x>G.x1+I||A.z<G.z0-I||A.z>G.z1+I)continue;let re=A.x<G.x0?G.x0:A.x>G.x1?G.x1:A.x,ye=A.z<G.z0?G.z0:A.z>G.z1?G.z1:A.z,Ae=A.x-re,Ue=A.z-ye,De=Ae*Ae+Ue*Ue;if(!(De>=I*I))if(S=!0,De>1e-8){let be=Math.sqrt(De),Ce=I-be;A.x+=Ae/be*Ce,A.z+=Ue/be*Ce}else{let be=A.x-G.x0,Ce=G.x1-A.x,$e=A.z-G.z0,Ct=G.z1-A.z,ft=Math.min(be,Ce,$e,Ct);ft===be?A.x=G.x0-I:ft===Ce?A.x=G.x1+I:ft===$e?A.z=G.z0-I:A.z=G.z1+I}}return S}let ht={x:0,y:0,z:0};function et(A,I,U,O,S,z,B){let G=B,re=-1,ye=0,Ae=1e-12,Ue=A+O*B,De=U+z*B,be=Math.min(A,Ue),Ce=Math.max(A,Ue),$e=Math.min(U,De),Ct=Math.max(U,De);for(let ft=0;ft<t.length;ft++){let at=t[ft];if(at.x1<be||at.x0>Ce||at.z1<$e||at.z0>Ct)continue;let St=-1/0,yt=1/0,Ze=-1,Et=0;if(Math.abs(O)<Ae){if(A<at.x0||A>at.x1)continue}else{let ot=(at.x0-A)/O,lt=(at.x1-A)/O,Ut=-1;if(ot>lt){let b=ot;ot=lt,lt=b,Ut=1}ot>St&&(St=ot,Ze=0,Et=Ut),lt<yt&&(yt=lt)}if(Math.abs(S)<Ae){if(I<at.y0||I>at.y1)continue}else{let ot=(at.y0-I)/S,lt=(at.y1-I)/S,Ut=-1;if(ot>lt){let b=ot;ot=lt,lt=b,Ut=1}ot>St&&(St=ot,Ze=1,Et=Ut),lt<yt&&(yt=lt)}if(Math.abs(z)<Ae){if(U<at.z0||U>at.z1)continue}else{let ot=(at.z0-U)/z,lt=(at.z1-U)/z,Ut=-1;if(ot>lt){let b=ot;ot=lt,lt=b,Ut=1}ot>St&&(St=ot,Ze=2,Et=Ut),lt<yt&&(yt=lt)}St>yt||yt<0||St<0||St<G&&(G=St,re=Ze,ye=Et)}if(S<-1e-9){let ft=-I/S;ft>0&&ft<G&&(G=ft,re=1,ye=1)}return re<0?-1:(ht.x=re===0?ye:0,ht.y=re===1?ye:0,ht.z=re===2?ye:0,G)}function Xe(A,I,U,O,S,z){let B=O-A,G=S-I,re=z-U,ye=Math.hypot(B,G,re);return ye<.01?!0:et(A,I,U,B/ye,G/ye,re/ye,ye-.05)<0}let ke=A=>{let I=Oe(de(A.x),de(A.z));return I?{x:-_t+(I[0]+.5)*Be,z:-_t+(I[1]+.5)*Be}:A},Le=[[{x:-90,z:70},{x:-90,z:40},{x:-92,z:10},{x:-86,z:85},{x:-92,z:-20},{x:-76,z:76}],[{x:92,z:-70},{x:92,z:-40},{x:90,z:-10},{x:86,z:-85},{x:92,z:20},{x:76,z:-76}]].map(A=>A.map(ke)),Ke=[];for(let A=-85;A<=85;A+=17)for(let I=-85;I<=85;I+=17)ne(A,I)||Ke.push({x:A,z:I});return{boxes:t,spawns:Le,pois:Ke,sunLight:{dir:Me},mats:o,skyT:j,half:_t,groundHeight:Ye,resolveCircle:fe,rayWorld:et,hasLOS:Xe,rayNormal:ht,findPath:Pe,randomFreePoint:Ve,isBlocked:ne,walkable:we}}var wo=class{constructor(){this.ctx=null,this.muted=!1,this._v=new R}init(){if(this.ctx)return;let e=window.AudioContext||window.webkitAudioContext;if(!e)return;let t=this.ctx=new e;this.master=t.createGain(),this.master.gain.value=.75;let n=t.createDynamicsCompressor();n.threshold.value=-16,n.ratio.value=5,n.attack.value=.003,n.release.value=.2,this.master.connect(n),n.connect(t.destination);let i=t.sampleRate*2;this.noise=t.createBuffer(1,i,t.sampleRate);let s=this.noise.getChannelData(0);for(let c=0;c<i;c++)s[c]=Math.random()*2-1;let a=t.sampleRate*1.8|0,o=t.createBuffer(2,a,t.sampleRate);for(let c=0;c<2;c++){let h=o.getChannelData(c);for(let u=0;u<a;u++)h[u]=(Math.random()*2-1)*Math.pow(1-u/a,3.4)}this.reverb=t.createConvolver(),this.reverb.buffer=o;let l=t.createGain();l.gain.value=.5,this.reverb.connect(l),l.connect(this.master)}resume(){this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()}_bus(e,t,n){let i=this.ctx,s=i.createGain();s.gain.value=e;let a=s;if(i.createStereoPanner){let o=i.createStereoPanner();o.pan.value=Tt(t,-1,1),s.connect(o),a=o}if(a.connect(this.master),n>0){let o=i.createGain();o.gain.value=n,a.connect(o),o.connect(this.reverb)}return s}_noise(e,t,n,i,s,a,o,l){let c=this.ctx,h=c.createBufferSource();h.buffer=this.noise,h.loop=!0;let u=c.createBiquadFilter();u.type=i,u.Q.value=o,u.frequency.setValueAtTime(s,t),u.frequency.exponentialRampToValueAtTime(Math.max(20,a),t+n);let f=c.createGain();f.gain.setValueAtTime(1e-4,t),f.gain.linearRampToValueAtTime(l,t+.002),f.gain.exponentialRampToValueAtTime(1e-4,t+n),h.connect(u),u.connect(f),f.connect(e),h.start(t,Math.random()),h.stop(t+n+.05)}_tone(e,t,n,i,s,a,o="sine"){let l=this.ctx,c=l.createOscillator();c.type=o,c.frequency.setValueAtTime(i,t),c.frequency.exponentialRampToValueAtTime(Math.max(10,s),t+n);let h=l.createGain();h.gain.setValueAtTime(a,t),h.gain.exponentialRampToValueAtTime(1e-4,t+n),c.connect(h),h.connect(e),c.start(t),c.stop(t+n+.05)}spatial(e,t=14){let n=N.camera;if(!e||!n)return{vol:1,pan:0,wet:.25};let i=this._v.copy(e).sub(n.position),s=i.length();i.applyQuaternion(n.quaternion.clone().invert());let a=s>.5?i.x/s:0;return{vol:Tt(t/(s+t*.6),0,1),pan:a*.9,wet:.2+Tt(s/90,0,.55),d:s}}shot(e,t=null,n=1){if(!this.ctx||this.muted)return;let i=this.ctx,s=i.currentTime,a=this.spatial(t),o=t?.8:1,l=this._bus(a.vol*o*n,a.pan,a.wet);switch(e){case"ar":this._noise(l,s,.16,"bandpass",3400,700,.6,1),this._noise(l,s,.03,"highpass",5e3,3e3,.5,.8),this._tone(l,s,.14,190,45,.9);break;case"smg":this._noise(l,s,.11,"bandpass",4200,1200,.7,.9),this._noise(l,s,.025,"highpass",6e3,3500,.5,.7),this._tone(l,s,.09,230,70,.6);break;case"pistol":this._noise(l,s,.2,"bandpass",2800,500,.8,1),this._noise(l,s,.03,"highpass",4500,2500,.5,.8),this._tone(l,s,.18,160,40,.9);break;case"shotgun":this._noise(l,s,.5,"lowpass",3200,150,.7,1.3),this._noise(l,s,.05,"highpass",3e3,1500,.5,.9),this._tone(l,s,.4,110,28,1.2);break;case"sniper":this._noise(l,s,.9,"lowpass",4500,120,.6,1.4),this._noise(l,s,.06,"highpass",3500,1500,.5,1),this._tone(l,s,.7,90,22,1.5);break}}click(e,t=null,n=.5){if(!this.ctx||this.muted)return;let i=this.ctx,s=i.currentTime,a=this.spatial(t,8),o=this._bus(a.vol*n,a.pan,.05);e==="empty"?(this._noise(o,s,.04,"highpass",3500,2500,1,.6),this._tone(o,s,.04,1800,900,.15,"square")):e==="magout"?(this._noise(o,s,.07,"bandpass",1600,800,2,.7),this._tone(o,s,.06,420,200,.3,"triangle")):e==="magin"?(this._noise(o,s,.05,"bandpass",2400,1200,2,.9),this._tone(o,s,.08,300,120,.5,"triangle")):e==="bolt"?(this._noise(o,s,.06,"bandpass",2200,900,3,.9),this._tone(o,s+.07,.05,520,260,.3,"square")):e==="switch"?this._noise(o,s,.05,"bandpass",1800,900,2,.5):e==="shell"?this._tone(o,s,.05,3400,2600,.12,"triangle"):e==="pin"&&(this._tone(o,s,.05,1500,900,.3,"triangle"),this._noise(o,s,.04,"highpass",4e3,3e3,1,.4))}hit(e){if(!this.ctx||this.muted)return;let t=this.ctx.currentTime,n=this._bus(.5,0,0);this._tone(n,t,.06,e?2600:1700,e?2e3:1300,.5,"triangle")}kill(e){if(!this.ctx||this.muted)return;let t=this.ctx.currentTime,n=this._bus(.65,0,.1);this._tone(n,t,.18,880,700,.5,"triangle"),this._tone(n,t+.07,.3,1320,1100,.45,"triangle"),e&&this._tone(n,t+.14,.4,1760,1500,.35,"triangle")}hurt(){if(!this.ctx||this.muted)return;let e=this.ctx.currentTime,t=this._bus(.9,0,.1);this._tone(t,e,.2,120,50,.8),this._noise(t,e,.12,"lowpass",900,200,1,.5)}whiz(e){if(!this.ctx||this.muted)return;let t=this.ctx.currentTime,n=this.spatial(e,4),i=this._bus(.35,n.pan,0);this._noise(i,t,.18,"bandpass",5e3,1500,4,.8)}step(e=null,t=.22){if(!this.ctx||this.muted)return;let n=this.ctx.currentTime,i=this.spatial(e,6),s=this._bus(i.vol*t,i.pan,.02);this._noise(s,n,.07,"lowpass",700,150,1,.9)}explosion(e){if(!this.ctx||this.muted)return;let t=this.ctx.currentTime,n=this.spatial(e,30),i=this._bus(Math.max(.35,n.vol)*1.3,n.pan,.5);this._noise(i,t,1.4,"lowpass",2600,60,.7,1.6),this._tone(i,t,1,80,18,1.8),this._noise(i,t,.12,"highpass",2500,1500,.5,1)}thud(e){if(!this.ctx||this.muted)return;let t=this.ctx.currentTime,n=this.spatial(e,8),i=this._bus(n.vol*.5,n.pan,.05);this._tone(i,t,.12,260,90,.8,"triangle")}beep(){if(!this.ctx||this.muted)return;let e=this.ctx.currentTime,t=this._bus(.3,0,0);this._tone(t,e,.12,980,980,.4,"square")}streak(){if(!this.ctx||this.muted)return;let e=this.ctx.currentTime,t=this._bus(.5,0,.2);this._tone(t,e,.12,440,440,.4,"sawtooth"),this._tone(t,e+.1,.12,660,660,.4,"sawtooth"),this._tone(t,e+.2,.3,880,880,.4,"sawtooth")}};var rr,_h=[],yh=[],gh=[],Hy=0,xh,vh,Td,Mh,us,Sh=[];function mh(r,e=64){let t=document.createElement("canvas");t.width=t.height=e;let n=t.getContext("2d"),i=n.createRadialGradient(e/2,e/2,0,e/2,e/2,e/2);for(let[a,o]of r)i.addColorStop(a,o);n.fillStyle=i,n.fillRect(0,0,e,e);let s=new kn(t);return s.colorSpace=it,s}function Vy(){let e=document.createElement("canvas");e.width=e.height=128;let t=e.getContext("2d");t.translate(128/2,128/2);let n=t.createRadialGradient(0,0,0,0,0,128/2);n.addColorStop(0,"rgba(255,255,230,1)"),n.addColorStop(.25,"rgba(255,200,90,.85)"),n.addColorStop(1,"rgba(255,120,30,0)"),t.fillStyle=n,t.beginPath(),t.arc(0,0,128/2,0,7),t.fill(),t.fillStyle="rgba(255,230,160,.9)";for(let s=0;s<6;s++)t.rotate(Math.PI/3+xe(-.2,.2)),t.beginPath(),t.moveTo(0,-3),t.lineTo(128*.48,0),t.lineTo(0,3),t.closePath(),t.fill();let i=new kn(e);return i.colorSpace=it,i}function Ed(){return new Kn(new zn({map:vh,blending:ci,transparent:!0,depthWrite:!1,fog:!1}))}function Ad(r){rr=r,xh=mh([[0,"rgba(255,255,255,1)"],[.4,"rgba(255,255,255,.6)"],[1,"rgba(255,255,255,0)"]]),Mh=mh([[0,"rgba(255,255,255,.85)"],[.6,"rgba(255,255,255,.35)"],[1,"rgba(255,255,255,0)"]]),vh=Vy(),Td=mh([[0,"rgba(0,0,0,.95)"],[.35,"rgba(10,10,10,.75)"],[.7,"rgba(10,10,10,.2)"],[1,"rgba(0,0,0,0)"]],64);for(let t=0;t<360;t++){let n=new zn({map:xh,transparent:!0,depthWrite:!1,opacity:0}),i=new Kn(n);i.visible=!1,rr.add(i),_h.push({s:i,m:n,vel:new R,life:0,max:1,g:0,drag:0,s0:1,s1:1,o0:1,rot:0,rotv:0,grow:!1})}let e=new on(1,1,1);e.translate(0,0,-.5);for(let t=0;t<36;t++){let n=new gt(e,new Jt({color:16767392,transparent:!0,opacity:.9,blending:ci,depthWrite:!1,fog:!1}));n.visible=!1,rr.add(n),yh.push({m:n,a:new R,b:new R,dir:new R,dist:0,age:0,speed:400,len:5,live:!1})}for(let t=0;t<64;t++){let n=new gt(new di(1,1),new Jt({map:Td,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4,opacity:.85}));n.visible=!1,rr.add(n),gh.push(n)}for(let t=0;t<12;t++){let n=new Kn(new zn({map:vh,blending:ci,transparent:!0,depthWrite:!1,fog:!1}));n.visible=!1,rr.add(n),Sh.push({m:n,t:0})}us=new Vn(16751168,0,40,2),rr.add(us)}function ar(r){let e=null;for(let t of _h)if(t.life<=0){e=t;break}return e?(e.s.visible=!0,e.s.position.copy(r.pos),e.vel.copy(r.vel||{x:0,y:0,z:0}),e.life=e.max=r.life,e.g=r.g||0,e.drag=r.drag||0,e.s0=r.s0,e.s1=r.s1??r.s0,e.o0=r.op??1,e.m.map=r.tex||xh,e.m.color.set(r.color??16777215),e.m.blending=r.add?ci:Ei,e.m.opacity=e.o0,e.m.rotation=xe(0,6.28),e.rotv=r.rotv||0,e.s.scale.set(r.s0,r.s0,1),e):null}var Qt=new R;function Rd(r,e,t=16767392,n=420,i=6,s=.02){let a=null;for(let o of yh)if(!o.live){a=o;break}a&&(a.a.copy(r),a.b.copy(e),a.dir.copy(e).sub(r),a.dist=a.dir.length(),!(a.dist<1)&&(a.dir.multiplyScalar(1/a.dist),a.age=0,a.speed=n,a.len=i,a.live=!0,a.m.material.color.set(t),a.m.visible=!0,a.w=s))}function Gy(r,e=8,t=16760944,n=5,i=null){for(let s=0;s<e;s++)Qt.set(xe(-1,1),xe(-.2,1),xe(-1,1)).normalize().multiplyScalar(xe(n*.4,n)),i&&Qt.addScaledVector(i,n*.6),ar({pos:r,vel:Qt,life:xe(.15,.4),s0:.07,s1:.01,color:t,add:!0,g:12})}function Wy(r,e=3,t=null,n=12102296,i=.7){for(let s=0;s<e;s++)Qt.set(xe(-.6,.6),xe(.2,1),xe(-.6,.6)),t&&Qt.addScaledVector(t,1.2),ar({pos:r,vel:Qt,life:xe(.5,.9),s0:i*.3,s1:i,color:n,op:.38,drag:3,tex:Mh,rotv:xe(-1,1)})}function wh(r,e=6,t=null){for(let n=0;n<e;n++)Qt.set(xe(-1,1),xe(-.2,1),xe(-1,1)).normalize().multiplyScalar(xe(1,4)),t&&Qt.addScaledVector(t,3),ar({pos:r,vel:Qt,life:xe(.25,.6),s0:.1,s1:.03,color:10489872,g:10,op:.95})}function bh(r,e,t=.14,n=!1){let i=gh[Hy++%gh.length];i.visible=!0,i.position.copy(r).addScaledVector(e,.012+Math.random()*.004),i.lookAt(Qt.copy(r).add(e)),i.rotateZ(xe(0,6.28));let s=t*xe(.85,1.25);i.scale.set(s,s,1),i.material.opacity=n?.9:.8}function Cd(r,e=.45){let t=null;for(let n of Sh)if(n.t<=0){t=n;break}t&&(t.t=.055,t.m.visible=!0,t.m.position.copy(r),t.size=e*xe(.8,1.2),t.m.scale.set(t.size,t.size,1),t.m.material.rotation=xe(0,6.28),t.m.material.opacity=1)}function Pd(r,e,t="world"){if(t==="actor"){wh(r,7,e);return}Gy(r,7,16758880,5.5,e),Wy(r,3,e),bh(r,e,.13)}function Ld(r){for(let e=0;e<9;e++)Qt.set(xe(-1,1),xe(0,1),xe(-1,1)).multiplyScalar(xe(2,5)),ar({pos:r,vel:Qt,life:xe(.35,.6),s0:1.2,s1:xe(4,7),color:16747050,add:!0,drag:3,op:.95});for(let e=0;e<14;e++)Qt.set(xe(-1,1),xe(.2,1.4),xe(-1,1)).multiplyScalar(xe(1,5)),ar({pos:r,vel:Qt,life:xe(1.4,2.6),s0:2,s1:xe(6,10),color:3683375,op:.7,drag:1.8,tex:Mh,rotv:xe(-.6,.6)});for(let e=0;e<40;e++)Qt.set(xe(-1,1),xe(-.1,1),xe(-1,1)).normalize().multiplyScalar(xe(6,22)),ar({pos:r,vel:Qt,life:xe(.3,.9),s0:.14,s1:.02,color:16756816,add:!0,g:14});us.position.copy(r),us.position.y+=1,us.intensity=260}function Id(r){for(let e of _h){if(e.life<=0)continue;if(e.life-=r,e.life<=0){e.s.visible=!1;continue}let t=1-e.life/e.max;e.vel.y-=e.g*r,e.drag&&e.vel.multiplyScalar(Math.max(0,1-e.drag*r)),e.s.position.addScaledVector(e.vel,r),e.s.position.y<.02&&e.g>0&&(e.s.position.y=.02,e.vel.y*=-.3,e.vel.x*=.6,e.vel.z*=.6);let n=e.s0+(e.s1-e.s0)*t;e.s.scale.set(n,n,1),e.m.opacity=e.o0*(1-t*t),e.m.rotation+=e.rotv*r}for(let e of yh){if(!e.live)continue;e.age+=r;let t=e.age*e.speed;if(t-e.len>e.dist){e.live=!1,e.m.visible=!1;continue}let n=Math.min(t,e.dist),i=Math.max(0,t-e.len),s=n-i;if(s<=.01){e.m.visible=!1;continue}e.m.visible=!0,e.m.position.copy(e.a).addScaledVector(e.dir,n),e.m.lookAt(Qt.copy(e.m.position).add(e.dir)),e.m.scale.set(e.w,e.w,s)}for(let e of Sh)e.t<=0||(e.t-=r,e.t<=0?e.m.visible=!1:e.m.material.opacity=e.t/.055);us.intensity=Math.max(0,us.intensity-r*520)}var Xy=r=>document.getElementById(r),We={},Jn={},Th=null,fs=168,qy=46;function Od(){for(let r of["scoreA","scoreB","timer","killfeed","hp","hpfill","wname","wtype","ammoCur","ammoRes","nades","slots","msg","death","deathBy","respawnT","scoreboard","sbA","sbB","fps","indicators","scope","vignette","lowhp","crosshair","hitmarker","banner","points","radar","hint","reloadbar","reloadfill","dot"])We[r]=Xy(r);Th=We.radar.getContext("2d"),We.radar.width=fs*2,We.radar.height=fs*2,Th.scale(2,2)}function En(r,e){Jn[r]!==e&&(Jn[r]=e,We[r].textContent=e)}function Bd(r,e,t,n){let i=document.createElement("div");i.className="kf"+(r.isPlayer?" me":"")+(e.isPlayer?" died":"");let s=r.team===0?"ally":"enemy",a=e.team===0?"ally":"enemy";for(i.innerHTML=`<b class="${s}">${r===e?"":r.name}</b><i>${r===e?"SELF":t.toUpperCase()}${n?" \u25C9":""}</i><b class="${a}">${e.name}</b>`,We.killfeed.prepend(i);We.killfeed.children.length>6;)We.killfeed.lastChild.remove();setTimeout(()=>i.classList.add("out"),5200),setTimeout(()=>i.remove(),5800)}function zd(r){let e=document.createElement("div");e.textContent=r,We.points.appendChild(e),setTimeout(()=>e.remove(),1400)}var Dd=0;function To(r,e=""){We.banner.className="",We.banner.offsetWidth,We.banner.className="show "+e,We.banner.textContent=r,clearTimeout(Dd),Dd=setTimeout(()=>We.banner.className="",2200)}var Ud=0;function Eo(r,e){We.hitmarker.className="",We.hitmarker.offsetWidth,We.hitmarker.className="show"+(r?" kill":e?" head":""),clearTimeout(Ud),Ud=setTimeout(()=>We.hitmarker.className="",r?380:160)}function kd(r,e){let t=N.player;if(!t)return;let n=r-t.pos.x,i=e-t.pos.z,s=-Math.sin(t.yaw),a=-Math.cos(t.yaw),o=Math.cos(t.yaw),l=-Math.sin(t.yaw),c=Math.atan2(n*o+i*l,n*s+i*a),h=document.createElement("div");h.className="ind",h.style.transform=`rotate(${c}rad)`,We.indicators.appendChild(h),setTimeout(()=>h.classList.add("out"),700),setTimeout(()=>h.remove(),1500)}var Nd=0;function Eh(r,e=1400){We.msg.textContent=r,We.msg.style.opacity=1,clearTimeout(Nd),Nd=setTimeout(()=>We.msg.style.opacity=0,e)}function Yr(r,e){We.death.style.display=e?"flex":"none",e&&(We.deathBy.textContent=r)}function Hd(r){En("respawnT",r>0?`RESPAWN IN ${Math.ceil(r)}`:"DEPLOYING")}function Vd(r){Jn.scope!==r&&(Jn.scope=r,We.scope.style.display=r?"block":"none")}function Ao(r){We.scoreboard.style.display=r?"flex":"none",r&&Wd()}function Gd(){We.hint.style.opacity=0}function Wd(){let r=t=>`<tr class="${t.isPlayer?"me":""}${t.alive?"":" dead"}"><td>${t.name}</td><td>${t.kills}</td><td>${t.deaths}</td><td>${t.score}</td></tr>`,e=t=>N.actors.filter(n=>n.team===t).sort((n,i)=>i.score-n.score).map(r).join("");We.sbA.innerHTML=e(0),We.sbB.innerHTML=e(1)}function Yy(r){return r=Math.max(0,Math.ceil(r)),`${r/60|0}:${String(r%60).padStart(2,"0")}`}var Fd=0;function Xd(r,e){let t=N.player;if(En("scoreA",N.scores[0]),En("scoreB",N.scores[1]),En("timer",Yy(N.matchLimit-N.matchTime)),!t)return;let n=Math.ceil(t.hp);En("hp",n),We.hpfill.style.width=Tt(t.hp,0,100)+"%",We.hpfill.style.background=t.hp<35?"#ff4a3a":"";let i=t.weapon,s=t.ws[i.id];En("wname",i.name),En("wtype",i.type),En("ammoCur",String(s.ammo).padStart(2,"0")),En("ammoRes",s.reserve),En("nades",t.nades),Jn.slotsKey!==t.cur&&(Jn.slotsKey=t.cur,We.slots.querySelectorAll("span").forEach((h,u)=>h.classList.toggle("on",u===t.cur))),We.lowhp.style.opacity=t.alive&&t.hp<35?.4+Math.sin(N.time*7)*.2:0,We.vignette.style.opacity=Tt(t.dmgFlash,0,1);let a=t.scoped(),o=6+t.spreadDeg*9,l=We.crosshair;!t.adsT||t.adsT<.25?(l.style.opacity=t.alive&&!t.sprinting?1:0,l.style.setProperty("--gap",o.toFixed(1)+"px"),We.dot.style.opacity=0):(l.style.opacity=0,We.dot.style.opacity=a?0:1),t.reloading&&!t.weapon.shell?(We.reloadbar.style.opacity=1,We.reloadfill.style.width=(t.reloadProgress()*100).toFixed(0)+"%"):We.reloadbar.style.opacity=0;let c=s.ammo<=Math.ceil(i.mag*.25)&&s.ammo>0;!t.reloading&&t.alive&&(s.ammo===0&&s.reserve>0?(En("msg","PRESS R TO RELOAD"),We.msg.style.opacity=1):s.ammo===0?(En("msg","NO AMMO \u2014 SWITCH WEAPON"),We.msg.style.opacity=1):c&&s.reserve>0?(En("msg","LOW AMMO"),We.msg.style.opacity=.8):(Jn.msg==="PRESS R TO RELOAD"||Jn.msg==="LOW AMMO"||Jn.msg==="NO AMMO \u2014 SWITCH WEAPON")&&(We.msg.style.opacity=0,Jn.msg="")),We.fps.textContent=e?e+" FPS":"",(Fd++&1)===0&&Ky(t),We.scoreboard.style.display==="flex"&&(Fd&15)===0&&Wd()}function Ky(r){let e=Th,t=N.world,n=fs/2,i=n/qy;e.clearRect(0,0,fs,fs),e.save(),e.translate(n,n),e.beginPath(),e.arc(0,0,n-1,0,7),e.clip(),e.fillStyle="rgba(8,14,20,.72)",e.fillRect(-n,-n,fs,fs),e.rotate(r.yaw),e.translate(-r.pos.x*i,-r.pos.z*i),e.fillStyle="rgba(160,190,210,.28)";for(let s of t.boxes)s.y0>2||s.x1-s.x0>120||e.fillRect(s.x0*i,s.z0*i,(s.x1-s.x0)*i,(s.z1-s.z0)*i);e.strokeStyle="rgba(255,170,60,.5)",e.lineWidth=1.5;{let s=t.half;e.strokeRect(-s*i,-s*i,s*2*i,s*2*i)}for(let s of N.actors)!s.alive||s.isPlayer||s.team!==0&&!(s.revealT>0)||(e.save(),e.translate(s.pos.x*i,s.pos.z*i),e.rotate(-s.yaw),e.fillStyle=s.team===0?"#52c6ff":"#ff4b36",e.beginPath(),e.moveTo(0,-5),e.lineTo(3.8,4),e.lineTo(-3.8,4),e.closePath(),e.fill(),e.restore());e.restore(),e.save(),e.translate(n,n),e.fillStyle="rgba(255,255,255,.09)",e.beginPath(),e.moveTo(0,0),e.arc(0,0,n-2,-Math.PI/2-.65,-Math.PI/2+.65),e.closePath(),e.fill(),e.fillStyle="#fff",e.beginPath(),e.moveTo(0,-6),e.lineTo(4.5,5),e.lineTo(0,2.5),e.lineTo(-4.5,5),e.closePath(),e.fill(),e.restore()}var Co={ar:{id:"ar",name:"M4A1 CARBINE",type:"ASSAULT RIFLE",auto:!0,rpm:760,dmg:27,head:2,mag:30,reserve:150,reload:2.2,range:160,fStart:35,fEnd:100,fMin:.6,spread:1,adsSpread:.12,moveSpread:1.1,jumpSpread:3,recoilP:.62,recoilY:.28,kick:.035,adsFov:52,adsSpeed:.78,adsTime:.13,pellets:1,sound:"ar",flash:1,moveSpeed:1},smg:{id:"smg",name:"MP9 VECTOR",type:"SUBMACHINE GUN",auto:!0,rpm:980,dmg:20,head:1.8,mag:40,reserve:200,reload:1.8,range:110,fStart:18,fEnd:60,fMin:.5,spread:1.4,adsSpread:.25,moveSpread:.6,jumpSpread:2.4,recoilP:.42,recoilY:.3,kick:.025,adsFov:58,adsSpeed:.9,adsTime:.1,pellets:1,sound:"smg",flash:.8,moveSpeed:1.08},shotgun:{id:"shotgun",name:"S12 BREACHER",type:"SHOTGUN",auto:!1,rpm:75,dmg:13,head:1.5,mag:8,reserve:40,reload:.55,shell:!0,range:40,fStart:7,fEnd:24,fMin:.15,spread:3.6,adsSpread:2.6,moveSpread:1,jumpSpread:2.5,recoilP:3.6,recoilY:.6,kick:.1,adsFov:62,adsSpeed:.9,adsTime:.14,pellets:9,sound:"shotgun",flash:1.7,moveSpeed:1},sniper:{id:"sniper",name:"KAR-98 MARKSMAN",type:"BOLT-ACTION RIFLE",auto:!1,rpm:48,dmg:105,head:2,mag:5,reserve:25,reload:3.2,range:400,fStart:200,fEnd:400,fMin:.9,spread:6,adsSpread:0,moveSpread:5,jumpSpread:8,recoilP:4.2,recoilY:.5,kick:.12,adsFov:13,adsSpeed:.55,adsTime:.24,pellets:1,sound:"sniper",flash:2,scope:!0,moveSpeed:.92},pistol:{id:"pistol",name:"M1911 SERVICE",type:"PISTOL",auto:!1,rpm:380,dmg:36,head:2.2,mag:12,reserve:72,reload:1.5,range:90,fStart:22,fEnd:60,fMin:.55,spread:1,adsSpread:.1,moveSpread:1.2,jumpSpread:2.6,recoilP:1.5,recoilY:.35,kick:.05,adsFov:62,adsSpeed:.95,adsTime:.09,pellets:1,sound:"pistol",flash:.9,moveSpeed:1.1}},Wn=["ar","smg","shotgun","sniper","pistol"],Ro=null;function Zy(){return Ro||(Ro={metal:new Qe({color:2764340,metalness:.85,roughness:.35}),dark:new Qe({color:1184791,metalness:.3,roughness:.65}),poly:new Qe({color:1908772,metalness:.15,roughness:.7}),tan:new Qe({color:9139537,metalness:.1,roughness:.7}),steel:new Qe({color:9212313,metalness:.9,roughness:.3}),glove:new Qe({color:1513756,metalness:0,roughness:.85}),sleeve:new Qe({color:3819056,metalness:0,roughness:.95}),dot:new Qe({color:0,emissive:16722458,emissiveIntensity:3}),lens:new Qe({color:2243146,metalness:1,roughness:.05,emissive:662052})},Ro)}var Rh={ar:{parts:[],model:{name:"m4a1",ry:Math.PI,off:[0,-.02,0],s:1},muzzle:[0,.03,-.66],handL:[.005,-.04,-.3],handR:[0,-.1,.03],hip:[.2,-.2,-.38],ads:[0,-.15,-.24]},smg:{parts:[["b",.056,.085,.3,0,0,-.1,"metal"],["b",.05,.06,.2,0,-.01,-.33,"poly"],["c",.011,.2,0,.003,-.55,"steel"],["c",.024,.14,0,.003,-.62,"dark"],["b",.04,.08,.2,0,-.01,.17,"poly"],["b",.044,.11,.06,0,-.095,.01,"poly",{rx:.25}],["b",.04,.2,.06,0,-.17,-.12,"dark",{name:"mag",rx:.04}],["b",.04,.09,.05,0,-.07,-.34,"poly",{rx:.15}],["b",.036,.012,.1,0,.047,-.08,"dark"],["b",.006,.04,.08,-.022,.068,-.08,"dark"],["b",.006,.04,.08,.022,.068,-.08,"dark"],["b",.05,.008,.08,0,.09,-.08,"dark"],["b",.006,.006,.004,0,.068,-.13,"dot"]],muzzle:[0,.003,-.72],handL:[0,-.08,-.34],handR:[0,-.105,0],hip:[.2,-.2,-.36],ads:[0,-.068,-.24]},shotgun:{parts:[["b",.062,.095,.34,0,0,-.1,"metal"],["c",.017,.5,0,.012,-.5,"steel"],["c",.017,.4,0,-.026,-.46,"steel"],["b",.07,.055,.24,0,-.03,-.46,"tan",{name:"pump"}],["b",.052,.12,.3,0,-.02,.26,"tan"],["b",.045,.11,.06,0,-.1,.02,"poly",{rx:.3}],["b",.012,.028,.012,0,.04,-.74,"dot"]],muzzle:[0,.012,-.78],handL:[0,-.06,-.46],handR:[0,-.108,.01],hip:[.2,-.21,-.38],ads:[0,-.067,-.25]},sniper:{parts:[],model:{name:"rifle",ry:Math.PI/2,off:[0,0,-.294],s:1},muzzle:[0,.02,-.9],handL:[0,-.045,-.46],handR:[0,-.1,.02],hip:[.2,-.2,-.42],ads:[0,-.115,-.3]},pistol:{parts:[],model:{name:"pistol",ry:Math.PI/2,off:[0,-.02,.02],s:1.2},muzzle:[0,.03,-.17],handL:[0,-.075,.05],handR:[0,-.07,.05],hip:[.15,-.13,-.3],ads:[0,-.075,-.22]}},qd=.78;function Po(r,e=!0){let t=Zy(),n=Rh[r],i=new At,s=new At;e&&s.scale.setScalar(qd),i.add(s);let a={};for(let l of n.parts){let c,h;l[0]==="b"?(c=new gt(new on(l[1],l[2],l[3]),t[l[7]]),c.position.set(l[4],l[5],l[6]),h=l[8]):(c=new gt(new Ui(l[1],l[1],l[2],12),t[l[6]]),c.rotation.x=Math.PI/2,c.position.set(l[3],l[4],l[5]),h=l[7]),h&&(h.rx&&(c.rotation.x+=h.rx),h.name&&(c.name=h.name,a[h.name]=c,c.userData.home=c.position.clone())),s.add(c)}if(n.model){let l=qt.models[n.model.name].scene.clone(!0),c=new At;c.add(l),l.rotation.y=n.model.ry,l.position.set(...n.model.off),l.scale.setScalar(n.model.s),l.traverse(h=>{h.isMesh&&(h.castShadow=!1,h.frustumCulled=!1,h.material=h.material.clone(),h.material.envMapIntensity=1)}),s.add(c),a.model=c}let o=new Mt;if(o.position.set(...n.muzzle),s.add(o),e){let l=(c,h)=>{let u=new At,f=new gt(new on(.075,.07,.1),t.glove);u.add(f);let d=new gt(new on(.07,.07,.3),t.sleeve);d.position.set(h*.05,-.075,.2),d.rotation.set(.28,h*-.2,0),u.add(d);let g=new gt(new on(.09,.09,.05),t.dark);return g.position.set(h*.012,-.03,.07),g.rotation.set(.28,h*-.2,0),u.add(g),u.position.set(...c),s.add(u),u};l(n.handL,-1),l(n.handR,1)}return{root:i,gun:s,muzzle:o,named:a,def:n}}function Yd(r){let e=Rh[r].hip;return[e[0]*.9,e[1]+.005,e[2]-.1]}function Kd(r){let e=Rh[r].ads;return[e[0],e[1]*qd,e[2]-.02]}var HM=new R,Jy=new R,Kr=new R,Lo=new R,Ch=new R;function $y(r,e,t,n,i,s,a,o,l,c,h){let u=r-a,f=e-o,d=t-l,g=u*n+f*i+d*s,x=u*u+f*f+d*d-c*c,m=g*g-x;if(m<0)return-1;let p=Math.sqrt(m),_=-g-p;return _<0&&(_=-g+p),_>=0&&_<=h?_:-1}function jy(r,e,t,n,i,s,a,o,l,c,h,u){let f=n*n+s*s;if(f<1e-9)return-1;let d=r-a,g=t-o,x=2*(d*n+g*s),m=d*d+g*g-l*l,p=x*x-4*f*m;if(p<0)return-1;let _=Math.sqrt(p),v=(-x-_)/(2*f);if(v<0&&(v=(-x+_)/(2*f)),v<0||v>u)return-1;let M=e+i*v;return M<c||M>h?-1:v}var vn={type:"none",t:0,actor:null,head:!1,nx:0,ny:1,nz:0};function Qy(r,e,t,n,i,s,a,o){let l=N.world,c=l.rayWorld(r,e,t,n,i,s,a);vn.type="none",vn.t=a,vn.actor=null,vn.head=!1,c>=0&&(vn.type="world",vn.t=c,vn.nx=l.rayNormal.x,vn.ny=l.rayNormal.y,vn.nz=l.rayNormal.z);let u=c>=0?c:a,f=null,d=!1;for(let g of N.actors){if(!g.alive||g===o||o&&g.team===o.team)continue;let x=g.pos.x,m=g.pos.y,p=g.pos.z,_=x-r,v=p-t;if(_*n+v*s<-1)continue;let D=g.headY(),C=$y(r,e,t,n,i,s,x,m+D,p,.21,u);C>=0&&C<u&&(u=C,f=g,d=!0);let P=jy(r,e,t,n,i,s,x,p,.36,m,m+D-.16,u);P>=0&&P<u&&(u=P,f=g,d=!1)}return f&&(vn.type="actor",vn.t=u,vn.actor=f,vn.head=d),vn}function eM(r,e){return e<=r.fStart?1:e>=r.fEnd?r.fMin:1-(1-r.fMin)*((e-r.fStart)/(r.fEnd-r.fStart))}function Io(r,e,t,n,i,s=16767392){let a=Qy(e.x,e.y,e.z,t.x,t.y,t.z,n.range,r),o=a.t;Kr.set(e.x+t.x*o,e.y+t.y*o,e.z+t.z*o),i&&(Ch.copy(i),Rd(Ch,Kr,s,r.isPlayer?380:320,r.isPlayer?5:7));let l=null;if(a.type==="actor"){let c=a.actor,h=n.dmg*eM(n,o)*(a.head?n.head:1);Lo.set(-t.x,-t.y,-t.z),wh(Kr,a.head?9:5,Lo.multiplyScalar(.4)),c.takeDamage(h,r,a.head,n.name,e),l={actor:c,head:a.head,dmg:h}}else a.type==="world"&&(Lo.set(a.nx,a.ny,a.nz),Pd(Kr,Lo,"world"));if(!r.isPlayer&&N.player&&N.player.alive&&(!l||l.actor!==N.player)&&r.team!==N.player.team){let c=N.player,h=c.pos.x,u=c.pos.y+c.eyeH(),f=c.pos.z,d=h-e.x,g=u-e.y,x=f-e.z,m=d*t.x+g*t.y+x*t.z;if(m>0&&m<o){let p=e.x+t.x*m-h,_=e.y+t.y*m-u,v=e.z+t.z*m-f;Math.hypot(p,_,v)<1.8&&(N.audio&&N.audio.whiz(Kr.set(h+p,u+_,f+v)),N.shake=Math.max(N.shake,.25))}}return l}function Do(r,e,t){for(let n of N.bots){if(!n.alive||n.team===t)continue;let i=Math.hypot(n.pos.x-r.x,n.pos.z-r.z);i<e&&n.hear(r,i/e)}}var or=[],Zd,tM,nM;function Uo(r,e,t){Zd||(Zd=new os(.07,10,8),tM=new Qe({color:3951146,roughness:.6,metalness:.4}),nM=new Jt({color:16724e3}));let n=new At,i=qt.models.grenade.scene.clone(!0);i.scale.setScalar(1.15),i.traverse(s=>{s.isMesh&&(s.castShadow=!0)}),n.add(i),N.scene.add(n),or.push({m:n,owner:r,pos:e.clone(),vel:t.clone(),fuse:2.6,bounces:0}),n.position.copy(e)}function iM(r,e){Ld(r),N.audio&&N.audio.explosion(r);let t=8.5;for(let s of N.actors){if(!s.alive||s!==e&&e&&s.team===e.team)continue;let a=s.pos.y+1,o=s.pos.x-r.x,l=a-r.y,c=s.pos.z-r.z,h=Math.hypot(o,l,c);if(h>t||h>.8&&!N.world.hasLOS(r.x,r.y+.3,r.z,s.pos.x,a,s.pos.z))continue;let u=190*Math.pow(1-h/t,1.3);s===e&&(u*=.55),!(u<5)&&s.takeDamage(u,e,!1,"FRAG GRENADE",r)}let n=N.player;if(n){let s=Math.hypot(n.pos.x-r.x,n.pos.z-r.z);N.shake=Math.max(N.shake,Tt(1.5-s/18,0,1.5))}let i=Ch.set(r.x,0,r.z);bh(i,Jy.set(0,1,0),3.2,!0)}function Jd(r){let e=N.world;for(let t=or.length-1;t>=0;t--){let n=or[t];n.fuse-=r,n.vel.y-=17*r;let i=n.vel.length(),s=i*r;if(s>1e-4){let a=n.vel.x/i,o=n.vel.y/i,l=n.vel.z/i,c=e.rayWorld(n.pos.x,n.pos.y,n.pos.z,a,o,l,s+.1);if(c>=0&&c<s+.08){let h=e.rayNormal.x,u=e.rayNormal.y,f=e.rayNormal.z;n.pos.x+=a*Math.max(0,c-.08),n.pos.y+=o*Math.max(0,c-.08),n.pos.z+=l*Math.max(0,c-.08);let d=n.vel.x*h+n.vel.y*u+n.vel.z*f;n.vel.x-=1.6*d*h,n.vel.y-=1.6*d*u,n.vel.z-=1.6*d*f;let g=u>.5?.62:.8;n.vel.x*=g,n.vel.z*=g,u>.5&&(n.vel.y*=.6),u>.5&&Math.abs(n.vel.y)<1.2&&(n.vel.y=0),n.bounces++,n.bounces<6&&i>2&&N.audio&&N.audio.thud(n.pos)}else n.pos.addScaledVector(n.vel,r)}n.m.position.copy(n.pos),n.m.rotation.x+=r*8,n.m.rotation.z+=r*5,n.fuse<=0&&(iM(n.pos,n.owner),N.scene.remove(n.m),or.splice(t,1))}}function $d(){for(let r of or)N.scene.remove(r.m);or.length=0}var sM=["","","DOUBLE KILL","TRIPLE KILL","MULTI KILL","MEGA KILL","ULTRA KILL","MONSTER KILL"];function No(r,e,t,n){r.alive=!1,r.deaths++;let i=e||r;if(e&&e!==r?(e.kills++,N.scores[e.team]++):e===r&&N.scores[1-r.team]++,Bd(i,r,t,n),e&&e.isPlayer&&e!==r){let s=N.time;e.killTimes=(e.killTimes||[]).filter(l=>s-l<4.5),e.killTimes.push(s),e.streak=(e.streak||0)+1;let a=100+(n?50:0);e.score+=a,zd(`+${a}${n?" HEADSHOT":""}`);let o=e.killTimes.length;o>=2?(To(sM[Math.min(o,7)],"multi"),N.audio&&N.audio.streak()):e.streak===5?To("KILLSTREAK \xB7 5","streak"):e.streak===10&&To("UNSTOPPABLE \xB7 10","streak"),Eo(!0,n),N.audio&&N.audio.kill(n)}else e&&(e.score+=100);r.isPlayer&&(r.streak=0),(N.scores[0]>=N.scoreLimit||N.scores[1]>=N.scoreLimit)&&N.endMatch&&N.endMatch()}var Ph=Math.PI/180,Lh=new R,Ih=new R,Dh=new R,Uh=new R,qM=new Gt(0,0,0,"YXZ"),Fo=class{constructor(e,t){this.isPlayer=!0,this.name="YOU",this.team=0,this.vmScene=e,this.vmCam=t,this.pos=new R,this.vel=new R,this.yaw=0,this.pitch=0,this.recoilKick=0,this.alive=!1,this.hp=100,this.kills=0,this.deaths=0,this.score=0,this.streak=0,this.onGround=!0,this.crouch=0,this.sprinting=!1,this.radius=.38,this.dmgFlash=0,this.lastHit=-99,this.deadT=0,this.killer=null,this.bob=0,this.stepT=0,this.sway=new pe,this.landKick=0,this.input={mx:0,my:0},this.fireCd=0,this.reloading=!1,this.reloadT=0,this.switchT=0,this.adsT=0,this.spreadDeg=1,this.heat=0,this.nades=3,this.nadeCd=0,this.vmKick=0,this.boltT=0,this.cur=0,this.last=1,this.ws={},this.fov=78,this.vmRoot=new At,e.add(this.vmRoot),this.guns={};for(let n of Wn){let i=Po(n,!0);i.root.visible=!1,this.vmRoot.add(i.root),this.guns[n]=i,i.flash=Ed(),i.flash.visible=!1,i.muzzle.add(i.flash)}this.flashLight=new Vn(16756832,0,3,2),e.add(this.flashLight),this.flashT=0,this.flashSize=1,this.resetLoadout()}resetLoadout(){for(let e of Wn){let t=Co[e];this.ws[e]={ammo:t.mag,reserve:t.reserve}}this.nades=3,this.cur=0,this.last=1,this.weapon=Co[Wn[0]],this.showGun(this.weapon.id)}showGun(e){for(let t of Wn)this.guns[t].root.visible=t===e;this.gun=this.guns[e]}setMuzzleFlashTexture(e){}eyeH(){return Tn(1.62,1.08,this.crouch)}headY(){return this.eyeH()+.02}height(){return Tn(1.8,1.3,this.crouch)}scoped(){return this.weapon.scope&&this.adsT>.85&&!this.reloading&&this.switchT<=0}respawn(e,t){this.pos.set(e.x,0,e.z),this.vel.set(0,0,0),this.yaw=t,this.pitch=0,this.hp=100,this.alive=!0,this.crouch=0,this.reloading=!1,this.switchT=0,this.adsT=0,this.fireCd=.4,this.dmgFlash=0,this.heat=0,this.recoilKick=0,this.resetLoadout(),this.killTimes=[],this.deadT=0,Yr("",!1)}takeDamage(e,t,n,i,s){!this.alive||N.state!=="playing"||(this.hp-=e,this.lastHit=N.time,this.dmgFlash=Math.min(1,this.dmgFlash+e/45),N.audio&&N.audio.hurt(),N.shake=Math.max(N.shake,Math.min(.6,e/60)),s&&t!==this&&kd(t.pos.x,t.pos.z),this.hp<=0&&(this.hp=0,this.alive=!1,this.deadT=0,this.killer=t,this.vel.multiplyScalar(.2),No(this,t,i,n),Yr(t&&t!==this?t.name:"YOURSELF",!0),this.alive=!1))}look(e,t){let n=.0022*N.settings.sens*(this.adsT>.1?Tn(1,this.weapon.adsFov/this.fov,this.adsT):1);this.yaw-=e*n,this.pitch=Tt(this.pitch-t*n,-1.5,1.5),this.sway.x+=e*18e-5,this.sway.y+=t*18e-5}switchTo(e){e===this.cur||e<0||e>=Wn.length||this.switchT>0||!this.alive||(this.last=this.cur,this.pendingSwitch=e,this.switchT=.5,this.reloading=!1,N.audio&&N.audio.click("switch",null,.5))}cycle(e){this.switchTo((this.cur+e+Wn.length)%Wn.length)}startReload(){let e=this.weapon,t=this.ws[e.id];this.reloading||this.switchT>0||t.ammo>=e.mag||t.reserve<=0||(this.reloading=!0,this.reloadT=0,this.adsHold=!1,this.reloadShellT=.35,N.audio&&N.audio.click(e.shell?"shell":"magout",null,.5))}reloadProgress(){return Tt(this.reloadT/this.weapon.reload,0,1)}throwNade(){if(this.nades<=0||this.nadeCd>0||!this.alive||this.switchT>0)return;this.nades--,this.nadeCd=1,this.reloading=!1;let e=Lh.set(-Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),-Math.cos(this.yaw)*Math.cos(this.pitch)),t=Ih.set(this.pos.x,this.pos.y+this.eyeH()-.1,this.pos.z).addScaledVector(e,.5),n=e.clone().multiplyScalar(17).add(new R(this.vel.x*.5,2.2+0,this.vel.z*.5));Uo(this,t,n),N.audio&&N.audio.click("pin",null,.7),this.vmKick=.5}canFire(){return this.alive&&this.fireCd<=0&&this.switchT<=0&&!this.sprinting&&(!this.reloading||this.weapon.shell&&this.ws[this.weapon.id].ammo>0)}fire(){let e=this.weapon,t=this.ws[e.id];if(t.ammo<=0){this.fireCd=.25,N.audio&&N.audio.click("empty",null,.5),t.reserve>0&&this.startReload();return}this.reloading&&(this.reloading=!1),t.ammo--,this.fireCd=60/e.rpm,this.heat=Math.min(1,this.heat+.12);let n=this.pos.y+this.eyeH();Ih.set(this.pos.x,n,this.pos.z);let i=Math.cos(this.pitch),s=new R(-Math.sin(this.yaw)*i,Math.sin(this.pitch),-Math.cos(this.yaw)*i),a=new R(Math.cos(this.yaw),0,-Math.sin(this.yaw)),o=new R().crossVectors(a,s).normalize();this.vmRoot.updateMatrixWorld(!0),this.gun.muzzle.getWorldPosition(Dh);let l=Uh.copy(Dh).project(this.vmCam),c=new R(l.x,l.y,.5).unproject(N.camera).sub(N.camera.position).normalize(),h=-Dh.z/Math.max(.2,c.dot(s)),u=N.camera.position.clone().addScaledVector(c,h),f=this.currentSpread()*Ph;for(let g=0;g<e.pellets;g++){let x=f*Math.sqrt(Math.random()),m=xe(0,6.283);Lh.copy(s).addScaledVector(a,Math.cos(m)*x).addScaledVector(o,Math.sin(m)*x).normalize();let p=Io(this,Ih,Lh,e,u,16769960);p&&(Eo(!1,p.head),N.audio&&N.audio.hit(p.head))}N.audio&&N.audio.shot(e.sound,null,1),Do(this.pos,70,this.team);let d=Tn(1,.6,this.adsT);this.pitch+=e.recoilP*Ph*d*(.85+Math.random()*.3),this.yaw+=(Math.random()-.5)*2*e.recoilY*Ph*d,this.vmKick=Math.min(1.4,this.vmKick+e.kick*18),N.shake=Math.max(N.shake,e.id==="shotgun"?.35:e.id==="sniper"?.5:.1),this.flashT=.05,this.flashSize=e.flash,this.flashLight.intensity=4*e.flash,this.boltT=e.id==="sniper"||e.id==="shotgun"?1:0,this.lastFire=N.time,t.ammo===0&&t.reserve>0&&!e.shell&&(this.autoReload=.35)}currentSpread(){let e=this.weapon,t=Math.hypot(this.vel.x,this.vel.z),n=Tn(e.spread,e.adsSpread,this.adsT);return n+=t/6*e.moveSpread*(1-this.adsT*.6),this.onGround||(n+=e.jumpSpread),this.crouch>.5&&(n*=.75),n+this.heat*(e.auto?1.4:.4)}update(e,t,n){let i=N.world;if(this.dmgFlash=Math.max(0,this.dmgFlash-e*1.2),!this.alive){this.updateDead(e);return}N.time-this.lastHit>5&&this.hp<100&&(this.hp=Math.min(100,this.hp+28*e)),this.fireCd-=e,this.nadeCd-=e,this.heat=Math.max(0,this.heat-e*1.6),this.autoReload>0&&(this.autoReload-=e,this.autoReload<=0&&!this.reloading&&this.startReload());let s=(t.KeyW?1:0)-(t.KeyS?1:0),a=(t.KeyD?1:0)-(t.KeyA?1:0),o=t.KeyC||t.ControlLeft;this.crouch=jt(this.crouch,o?1:0,12,e);let l=t.ShiftLeft&&s>0&&!o&&!n.ads;this.sprinting=l&&(this.onGround||this.sprinting),n.fire&&this.weapon.id!=="sniper"&&(this.sprinting=!1);let c=this.sprinting?8.2:5.4;o&&(c=2.8),c*=this.weapon.moveSpeed*Tn(1,this.weapon.adsSpeed,this.adsT);let h=0,u=0;if(s||a){let _=Math.hypot(s,a),v=s/_,M=a/_;h=(-Math.sin(this.yaw)*v+Math.cos(this.yaw)*M)*c,u=(-Math.cos(this.yaw)*v-Math.sin(this.yaw)*M)*c}let f=this.onGround?11:2.2;this.vel.x=jt(this.vel.x,h,f,e),this.vel.z=jt(this.vel.z,u,f,e),t.Space&&this.onGround&&(this.vel.y=7.4,this.onGround=!1,this.sprinting=this.sprinting),this.vel.y-=24*e,this.pos.x+=this.vel.x*e,this.pos.z+=this.vel.z*e,i.resolveCircle(this.pos,this.radius,this.pos.y,this.height());let d=i.groundHeight(this.pos.x,this.pos.z,this.radius*.8,this.pos.y);this.pos.y+=this.vel.y*e,this.pos.y<=d?(!this.onGround&&this.vel.y<-6&&(this.landKick=Tt(-this.vel.y/20,0,.5),N.audio&&N.audio.step(null,.5)),this.pos.y=d,this.vel.y=0,this.onGround=!0):this.pos.y>d+.05&&(this.onGround=!1);let g=i.half-1.2;this.pos.x=Tt(this.pos.x,-g,g),this.pos.z=Tt(this.pos.z,-g,g);let x=Math.hypot(this.vel.x,this.vel.z);this.onGround&&x>1&&(this.bob+=e*x*1.55,this.stepT-=e*x,this.stepT<=0&&(this.stepT=this.sprinting?3.4:2.7,o||N.audio&&N.audio.step(null,.18)));let m=n.ads&&!this.sprinting&&this.switchT<=0&&(!this.reloading||this.weapon.shell),p=1/this.weapon.adsTime;if(this.adsT=Tt(this.adsT+(m?1:-1)*p*e,0,1),this.switchT>0){let _=this.switchT;this.switchT-=e,_>.25&&this.switchT<=.25&&(this.cur=this.pendingSwitch,this.weapon=Co[Wn[this.cur]],this.showGun(this.weapon.id),this.adsT=0)}if(this.reloading){let _=this.weapon,v=this.ws[_.id];if(_.shell)this.reloadShellT-=e,this.reloadShellT<=0&&(this.reloadShellT=_.reload,v.ammo<_.mag&&v.reserve>0&&(v.ammo++,v.reserve--,N.audio&&N.audio.click("shell",null,.6)),(v.ammo>=_.mag||v.reserve<=0)&&(this.reloading=!1,N.audio&&N.audio.click("bolt",null,.5))),this.reloadT=(this.reloadT+e)%1;else{let M=this.reloadT;if(this.reloadT+=e,M<_.reload*.55&&this.reloadT>=_.reload*.55&&N.audio&&N.audio.click("magin",null,.6),this.reloadT>=_.reload){let D=Math.min(_.mag-v.ammo,v.reserve);v.ammo+=D,v.reserve-=D,this.reloading=!1,this.reloadT=0,N.audio&&N.audio.click("bolt",null,.4)}}}n.fire&&this.canFire()&&(this.weapon.auto||!n.firedThisPress)&&(this.fire(),n.firedThisPress=!0),n.fire||(n.firedThisPress=!1),this.spreadDeg=this.currentSpread(),this.updateCamera(e,x),this.updateViewmodel(e,x)}updateCamera(e,t){let n=N.camera;this.landKick=jt(this.landKick,0,9,e);let i=this.onGround?Math.min(1,t/6)*(this.sprinting?1.4:1)*(1-this.adsT*.7):0,s=Math.sin(this.bob*2)*.022*i,a=Math.cos(this.bob)*.015*i;n.position.set(this.pos.x,this.pos.y+this.eyeH()+s-this.landKick*.25,this.pos.z);let o=N.shake,l=(Math.random()-.5)*o*.012,c=(Math.random()-.5)*o*.012;n.rotation.set(this.pitch+l,this.yaw+c,a*.5+rM(this),"YXZ");let h=Tn(N.settings.fov,this.weapon.adsFov,this.adsT*(this.scoped()||!this.weapon.scope,1))+(this.sprinting?5:0);this.fov=jt(this.fov,h,18,e),Math.abs(n.fov-this.fov)>.01&&(n.fov=this.fov,n.updateProjectionMatrix()),n.updateMatrixWorld(!0)}updateViewmodel(e,t){let n=this.weapon,i=this.gun,s=this.vmRoot,a=Yd(n.id),o=Kd(n.id);this.vmKick=jt(this.vmKick,0,14,e),this.sway.x=jt(this.sway.x,0,8,e),this.sway.y=jt(this.sway.y,0,8,e);let l=this.adsT,c=l*l*(3-2*l),h=Tn(a[0],o[0],c),u=Tn(a[1],o[1],c),f=Tn(a[2],o[2],c),d=0,g=0,x=0,m=this.onGround?Math.min(1,t/6)*(1-c*.85):0;if(h+=Math.cos(this.bob)*.006*m-this.sway.x*(1-c*.7),u+=Math.abs(Math.sin(this.bob))*-.008*m+this.sway.y*(1-c*.7)-this.landKick*.1,u+=Math.sin(N.time*1.6)*.0014,h+=Math.cos(N.time*1.1)*.001,this.onGround||(u-=.01),f+=this.vmKick*.05,d+=this.vmKick*.07*(1-c*.4),this.sprintT=jt(this.sprintT||0,this.sprinting?1:0,10,e),h-=this.sprintT*.06,u-=this.sprintT*.08,f+=this.sprintT*.04,g+=this.sprintT*.7,d+=this.sprintT*-.25,x+=this.sprintT*.15,this.switchT>0){let p=Math.sin(Tt(this.switchT/.5,0,1)*Math.PI);u-=p*.35,d-=p*.6}if(this.reloading&&!n.shell){let p=this.reloadProgress(),_=Math.sin(p*Math.PI);u-=_*.1,d-=_*.5,x+=_*.35,h-=_*.04;let v=i.named.mag;if(v){let M=p<.2?p/.2:p<.5?1:p<.7?1-(p-.5)/.2:0;v.position.y=v.userData.home.y-M*.2,v.position.x=v.userData.home.x-M*.03}}else i.named.mag&&i.named.mag.position.copy(i.named.mag.userData.home);if(this.reloading&&n.shell&&(d-=.25,u-=.05),this.boltT>0){this.boltT=Math.max(0,this.boltT-e/(n.id==="sniper"?.9:.6));let p=Math.sin(this.boltT*Math.PI);n.id==="sniper"&&(x+=p*.25,h+=p*.01),i.named.pump&&(i.named.pump.position.z=i.named.pump.userData.home.z+p*.12),i.named.bolt&&(i.named.bolt.position.z=i.named.bolt.userData.home.z+p*.08)}if(s.position.set(h,u,f),s.rotation.set(d,g,x),i.root.visible=!this.scoped(),this.flashLight.intensity=Math.max(0,this.flashLight.intensity-e*120),i.muzzle.getWorldPosition(Uh),this.flashLight.position.copy(Uh).add(new R(0,.04,.12)),this.flashT>0){this.flashT-=e,i.flash.visible=!this.scoped(),i.flash.material.rotation=xe(0,6.28);let p=.13*this.flashSize*xe(.8,1.15);i.flash.scale.set(p,p,1)}else i.flash.visible=!1}updateDead(e){this.deadT+=e;let t=N.camera,n=Tt(this.deadT/.6,0,1);t.position.set(this.pos.x,this.pos.y+Tn(this.eyeH(),.3,n),this.pos.z),t.rotation.set(this.pitch*(1-n)+.2*n,this.yaw,n*.5*(this.deadSide||(this.deadSide=Math.random()<.5?1:-1)),"YXZ"),t.fov=jt(t.fov,N.settings.fov,8,e),t.updateProjectionMatrix(),t.updateMatrixWorld(!0),this.adsT=0,this.gun.root.visible=!1;let i=4-this.deadT;Hd(i),this.deadT>4&&N.state==="playing"&&N.respawnActor(this)}};function rM(r){let e=r.vel.x*Math.cos(r.yaw)-r.vel.z*Math.sin(r.yaw);return-Tt(e/6,-1,1)*.012}function jd(r){let e=new Map,t=new Map,n=r.clone();return Qd(r,n,function(i,s){e.set(s,i),t.set(i,s)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;let s=i,a=e.get(i),o=a.skeleton.bones;s.skeleton=a.skeleton.clone(),s.bindMatrix.copy(a.bindMatrix),s.skeleton.bones=o.map(function(l){return t.get(l)}),s.bind(s.skeleton,s.bindMatrix)}),n}function Qd(r,e,t){t(r,e);for(let n=0;n<r.children.length;n++)Qd(r.children[n],e.children[n],t)}var oM=[{name:"RECRUIT",react:.75,spread:4.6,dmg:8,turn:3.6,head:.06,view:60,burst:[2,4],pause:[.5,1.1],grenade:.5},{name:"REGULAR",react:.42,spread:2.7,dmg:11,turn:6,head:.16,view:75,burst:[3,6],pause:[.3,.8],grenade:1},{name:"VETERAN",react:.2,spread:1.5,dmg:14,turn:9.5,head:.3,view:90,burst:[4,8],pause:[.15,.5],grenade:1.6}];function lM(r,e){let t=document.createElement("canvas");t.width=256,t.height=64;let n=t.getContext("2d");n.font='700 30px "Segoe UI", Arial, sans-serif',n.textAlign="center",n.textBaseline="middle",n.fillStyle="rgba(0,0,0,.55)",n.fillText(r.toUpperCase(),129,25),n.fillStyle=e===0?"#6fd0ff":"#ff6a4a",n.fillText(r.toUpperCase(),128,24),n.beginPath(),n.moveTo(112,48),n.lineTo(144,48),n.lineTo(128,62),n.closePath(),n.fill();let i=new kn(t);i.colorSpace=it;let s=new Kn(new zn({map:i,depthTest:!1,depthWrite:!1,transparent:!0,fog:!1}));return s.scale.set(1.5,.375,1),s.renderOrder=20,s}var ep=new bt,cM=new Gt,tp=new R,hM=new R(0,1,0),uM=new R,dn=new R,$n=new R,Oo=new R,np=new R,Zr=class{constructor(e,t,n){this.id=e,this.name=t,this.team=n,this.isPlayer=!1,this.pos=new R,this.vel=new R,this.yaw=0,this.alive=!1,this.hp=100,this.kills=0,this.deaths=0,this.score=0,this.target=null,this.visible=!1,this.seenT=0,this.lostT=99,this.lastKnown=null,this.path=[],this.pathIdx=0,this.repathT=0,this.goal=null,this.fireCd=0,this.mag=30,this.reloadT=0,this.burstLeft=4,this.pauseT=0,this.grenCd=xe(5,14),this.strafe=1,this.strafeT=1,this.senseT=xe(0,.2),this.walk=0,this.deadT=0,this.lastHit=-99,this.revealT=0,this.stuckT=0,this.lastCheck=new R,this.investT=0,this.retreatT=0,this.aimHead=!1,this.kick=0,this.lastFired=-99,this.def={name:"M4A1 CARBINE",dmg:11,head:2,range:130,fStart:35,fEnd:100,fMin:.55},this.build()}build(){let e=qt.models.soldier,t=jd(e.scene),n=this.model=new At;n.add(t),n.updateMatrixWorld(!0);let i=new un().setFromObject(t),s=1.82/Math.max(.01,i.max.y-i.min.y);t.scale.multiplyScalar(s),n.updateMatrixWorld(!0);let a=new un().setFromObject(t);t.position.y-=a.min.y;let o=this.team===0?new Re(.55,.78,1.25):new Re(1.3,.58,.5),l=this.team===0?3716863:16726556;t.traverse(u=>{u.isMesh&&(u.castShadow=!0,u.frustumCulled=!1,u.material=u.material.clone(),/visor/i.test(u.material.name)||/visor/i.test(u.name)?(u.material.color.set(0),u.material.emissive=new Re(l),u.material.emissiveIntensity=2.5):(u.material.color.copy(o),u.material.envMapIntensity=.5))}),this.mixer=new Hr(t);let c=u=>e.animations.find(f=>f.name===u);this.act={};for(let u of["Idle","Walk","Run"]){let f=this.mixer.clipAction(c(u));f.play(),f.setEffectiveWeight(u==="Idle"?1:0),this.act[u]=f}this.wts={Idle:1,Walk:0,Run:0},this.mixer.update(Math.random()*2),this.bones={},t.traverse(u=>{if(u.isBone){let f=u.name.replace(/^mixamorig:?/,"");this.bones[f]=u}});let h=this.gun=Po("ar",!1);this.gunHolder=new At,n.add(this.gunHolder),this.gunHolder.add(h.root),h.root.scale.setScalar(.95),n.visible=!1,N.scene.add(n),this.team===0&&(this.tag=lM(this.name,0),this.tag.visible=!1,N.scene.add(this.tag)),this.poseK=0,this.pitch=0}get skill(){return oM[N.settings.diff]}headY(){return 1.58}eyeH(){return 1.6}eye(e){return e.set(this.pos.x,this.pos.y+1.6,this.pos.z)}spawnAt(e){this.pos.set(e.x,0,e.z),this.vel.set(0,0,0),this.hp=100,this.alive=!0,this.deadT=0,this.mag=30,this.reloadT=0,this.target=null,this.visible=!1,this.lastKnown=null,this.path=[],this.goal=null,this.retreatT=0,this.investT=0,this.fireCd=.5,this.grenCd=xe(6,14);let t=N.spawnCenter(1-this.team);this.yaw=Math.atan2(-(t.x-e.x),-(t.z-e.z)),this.model.visible=!0,this.model.rotation.set(0,this.yaw,0),this.model.position.set(e.x,0,e.z);for(let n of Object.values(this.act))n.paused=!1;this.model.position.y=0,this.tag&&(this.tag.visible=!0)}takeDamage(e,t,n,i,s){this.alive&&(this.hp-=e,this.lastHit=N.time,t&&t.alive&&t.team!==this.team&&(this.visible||(this.lastKnown={x:t.pos.x,z:t.pos.z},this.investT=8,this.path=[]),this.target||(this.target=t,this.seenT=this.skill.react*.5)),this.hp<38&&Math.random()<.35&&(this.retreatT=xe(2.5,4.5)),this.hp<=0&&(this.hp=0,this.alive=!1,this.deadT=0,this.fallDir=Math.random()<.5?1:-1,this.tag&&(this.tag.visible=!1),No(this,t,i,n),this.alive=!1))}hear(e,t){this.visible||Math.random()<.55&&(this.lastKnown={x:e.x,z:e.z},this.investT=7,this.path=[],this.repathT=0)}sense(){let e=N.world,t=this.skill;this.eye(dn);let n=-Math.sin(this.yaw),i=-Math.cos(this.yaw),s=null,a=1e9;for(let o of N.actors){if(!o.alive||o.team===this.team)continue;let l=o.pos.x-this.pos.x,c=o.pos.z-this.pos.z,h=Math.hypot(l,c);h>t.view||(l*n+c*i)/(h||1)<.3&&h>6||!e.hasLOS(dn.x,dn.y,dn.z,o.pos.x,o.pos.y+1.1,o.pos.z)&&!e.hasLOS(dn.x,dn.y,dn.z,o.pos.x,o.pos.y+o.headY(),o.pos.z)||h<a&&(a=h,s=o)}s?(this.target!==s&&(this.target=s,this.seenT=0,this.aimHead=Math.random()<t.head),this.visible=!0,this.lostT=0,this.lastKnown={x:s.pos.x,z:s.pos.z},this.investT=0):(this.visible&&(this.visible=!1,this.investT=6,this.path=[],this.repathT=0),this.lostT+=.15,this.lostT>7&&(this.target=null))}pickGoal(){let e=N.world,t=N.spawnCenter(1-this.team),n=null,i=1e9,s=3;for(let o=0;o<s;o++){let l=e.pois[Math.random()*e.pois.length|0],c=Math.hypot(l.x-t.x,l.z-t.z)+Math.random()*40;c<i&&(i=c,n=l)}return Math.random()<.4&&(n=e.pois[Math.random()*e.pois.length|0]),{x:n.x+xe(-3,3),z:n.z+xe(-3,3)}}setGoal(e){this.goal=e,this.path=N.world.findPath(this.pos.x,this.pos.z,e.x,e.z),this.pathIdx=0,this.repathT=xe(1.2,2.2)}followPath(e,t){for(;this.pathIdx<this.path.length;){let n=this.path[this.pathIdx],i=n.x-this.pos.x,s=n.z-this.pos.z,a=Math.hypot(i,s);if(a<.7){this.pathIdx++;continue}return this.moveDir(i/a,s/a,t,e),!0}return!1}moveDir(e,t,n,i){let s=0,a=0;for(let c of N.actors){if(c===this||!c.alive)continue;let h=this.pos.x-c.pos.x,u=this.pos.z-c.pos.z,f=h*h+u*u;if(f<1.4&&f>1e-4){let d=Math.sqrt(f);s+=h/d*(1.2-d),a+=u/d*(1.2-d)}}let o=e*n+s*2.5,l=t*n+a*2.5;this.vel.x=jt(this.vel.x,o,9,i),this.vel.z=jt(this.vel.z,l,9,i)}shoot(){let e=this.skill,t=this.target;this.eye(dn);let n=this.aimHead?t.headY():1.15;np.set(t.pos.x,t.pos.y+n,t.pos.z),$n.copy(np).sub(dn);let i=$n.length();$n.multiplyScalar(1/i);let s=Math.hypot(this.vel.x,this.vel.z)>1.5?1.35:1,a=1+3.2*Math.exp(-this.seenT*1.6+this.skill.react*1.6),l=e.spread*(.55+Tt(i,0,70)/70)*s*Math.min(a,4.5)*Math.PI/180*Math.sqrt(Math.random())*.6,c=xe(0,6.283),h=-$n.z,u=$n.x,f=Math.hypot(h,u)||1;$n.x+=h/f*Math.cos(c)*l,$n.z+=u/f*Math.cos(c)*l,$n.y+=Math.sin(c)*l,$n.normalize(),this.model.updateMatrixWorld(!0),this.gun.muzzle.getWorldPosition(Oo),this.def.dmg=e.dmg,Io(this,dn,$n,this.def,Oo,this.team===0?10475775:16756880),Cd(Oo,.5),N.audio&&N.audio.shot("ar",Oo,.85),Do(this.pos,60,this.team),this.mag--,this.fireCd=60/640,this.kick=1,this.lastFired=N.time,this.revealT=1.4,this.burstLeft--,this.burstLeft<=0&&(this.pauseT=xe(e.pause[0],e.pause[1]),this.burstLeft=Math.round(xe(e.burst[0],e.burst[1])),this.aimHead=Math.random()<e.head)}throwNade(){let e=this.target;this.eye(dn);let t=1.5,n=e.pos.x-dn.x+xe(-1.5,1.5),i=e.pos.z-dn.z+xe(-1.5,1.5),s=e.pos.y-dn.y,a=new R(n/t,(s+.5*17*t*t)/t,i/t);Uo(this,dn,a),this.grenCd=xe(14,24)/this.skill.grenade,N.audio&&N.audio.click("pin",this.pos,.6)}update(e){let t=N.world,n=this.skill;if(!this.alive){this.updateDead(e);return}this.revealT>0&&(this.revealT-=e),this.fireCd-=e,this.pauseT-=e,this.grenCd-=e,this.kick=Math.max(0,this.kick-e*9),N.time-this.lastHit>5&&this.hp<100&&(this.hp=Math.min(100,this.hp+22*e)),this.retreatT-=e,this.senseT-=e,this.senseT<=0&&(this.senseT=.15,this.sense()),this.reloadT>0?(this.reloadT-=e,this.reloadT<=0&&(this.mag=30)):(this.mag<=0||!this.visible&&this.mag<14)&&(this.reloadT=2.3,N.audio&&N.audio.click("magout",this.pos,.4));let i=0,s=null,a=this.target,o=this.visible&&a&&a.alive;if(o){this.seenT+=e;let g=a.pos.x-this.pos.x,x=a.pos.z-this.pos.z,m=Math.hypot(g,x);s=Math.atan2(-g,-x);let p=Math.abs(Tc(this.yaw,s));if(this.retreatT>0){let _=N.spawnCenter(this.team),v=_.x-this.pos.x,M=_.z-this.pos.z,D=Math.hypot(v,M)||1;this.moveDir(v/D,M/D,4.6,e),i=4.6}else if(m>32)this.repathT-=e,(this.repathT<=0||!this.path.length)&&this.setGoal({x:a.pos.x,z:a.pos.z}),this.followPath(e,4.8)&&(i=4.8);else{this.strafeT-=e,this.strafeT<=0&&(this.strafe=Math.random()<.5?-1:1,this.strafeT=xe(.5,1.6));let _=g/(m||1),v=x/(m||1),M=-v*this.strafe,D=_*this.strafe,C=M,P=D;m>20?(C+=_*.7,P+=v*.7):m<7&&(C-=_*.8,P-=v*.8);let V=Math.hypot(C,P)||1;i=3,this.moveDir(C/V,P/V,i,e)}this.seenT>n.react&&this.reloadT<=0&&this.mag>0&&this.fireCd<=0&&this.pauseT<=0&&p<.14&&this.shoot(),this.grenCd<=0&&m>12&&m<34&&this.seenT>.8&&Math.random()<e*.5&&this.throwNade()}else this.seenT=0,this.repathT-=e,this.investT>0&&this.lastKnown?(this.investT-=e,(!this.path.length||this.repathT<=0)&&this.setGoal(this.lastKnown),this.followPath(e,5.4)?i=5.4:this.investT=0):((!this.goal||this.pathIdx>=this.path.length||this.repathT<=-2)&&this.setGoal(this.pickGoal()),this.followPath(e,4.3)?i=4.3:this.goal=null),i>.1&&Math.hypot(this.vel.x,this.vel.z)>.5&&(s=Math.atan2(-this.vel.x,-this.vel.z));if(i===0&&(this.vel.x=jt(this.vel.x,0,10,e),this.vel.z=jt(this.vel.z,0,10,e)),s!==null){let g=Tc(this.yaw,s),x=n.turn*(o?1:.75)*e;this.yaw+=Tt(g,-x,x)}this.pos.x+=this.vel.x*e,this.pos.z+=this.vel.z*e,t.resolveCircle(this.pos,.38,this.pos.y,1.8);let l=t.groundHeight(this.pos.x,this.pos.z,.3,this.pos.y);if(this.pos.y=jt(this.pos.y,l,18,e),this.stuckT+=e,this.stuckT>1.2){let g=Math.hypot(this.pos.x-this.lastCheck.x,this.pos.z-this.lastCheck.z);i>1&&g<.35&&(this.path=[],this.goal=null,this.strafe*=-1,this.repathT=0,o||this.setGoal(this.pickGoal())),this.lastCheck.copy(this.pos),this.stuckT=0}let c=Math.hypot(this.vel.x,this.vel.z);c>2&&N.audio&&N.player&&Math.abs(this.pos.x-N.player.pos.x)<30&&Math.abs(this.pos.z-N.player.pos.z)<30&&(this.stepAcc=(this.stepAcc||0)+c*e,this.stepAcc>(c>4.6?2.6:1.9)&&(this.stepAcc=0,N.audio.step(this.pos,c>4.6?.34:.22)));let h=c<.4?1:0,u=c>3.4?1:0,f=c>=.4&&c<=3.4?1:0,d=1-Math.exp(-10*e);this.wts.Idle+=(h-this.wts.Idle)*d,this.wts.Walk+=(f-this.wts.Walk)*d,this.wts.Run+=(u-this.wts.Run)*d;for(let g of["Idle","Walk","Run"])this.act[g].setEffectiveWeight(this.wts[g]);this.act.Walk.timeScale=Tt(c/1.5,.6,2.2),this.act.Run.timeScale=Tt(c/4.2,.7,1.5),this.mixer.update(e),this.model.position.set(this.pos.x,this.pos.y,this.pos.z),this.model.rotation.y=this.yaw,this.applyAim(e,o||this.kick>0||N.time-this.lastFired<1.2),this.tag&&this.tag.position.set(this.pos.x,this.pos.y+2.25,this.pos.z)}applyAim(e,t){this.poseK+=((t?1:.55)-this.poseK)*(1-Math.exp(-8*e));let n=this.bones,i=this.poseK,s=this.target&&this.target.alive?this.target:null,a=0;if(s){let c=s.pos.x-this.pos.x,h=s.pos.z-this.pos.z,u=s.pos.y+1.1-(this.pos.y+1.45);a=Math.atan2(u,Math.hypot(c,h))}this.pitch+=(a-this.pitch)*(1-Math.exp(-10*e));let o=(c,h,u,f)=>{c&&(ep.setFromEuler(cM.set(h,u,f)),c.quaternion.multiply(ep))};o(n.Spine1,-this.pitch*.35,0,0),o(n.Spine2,-this.pitch*.35,0,0),o(n.RightArm,-1.12*i,.12*i,0),o(n.LeftArm,-1.25*i,-.08*i,0),o(n.RightForeArm,0,-.18*i,0),o(n.LeftForeArm,0,.22*i,0);let l=n.RightHand;l&&(this.model.updateMatrixWorld(!0),l.getWorldPosition(tp),this.gunHolder.position.copy(tp).sub(this.model.position).applyAxisAngle(hM,-this.yaw),this.gunHolder.rotation.set(this.pitch,0,0),this.gunHolder.position.add(uM.set(0,.06,-.02)))}updateDead(e){this.deadT+=e;let t=Tt(this.deadT/.55,0,1),n=1-Math.pow(1-t,3);this.model.rotation.set(n*1.5,this.yaw,n*.3*this.fallDir,"YXZ"),this.model.position.y=this.pos.y-(this.deadT>3.5?(this.deadT-3.5)*1.2:0),this.model.position.x=this.pos.x,this.model.position.z=this.pos.z,this.model.position.y+=n*.12,this.deadT>4.8&&(this.model.visible=!1),this.deadT>5.2&&N.state==="playing"&&N.respawnActor(this)}};(async()=>{let r=k=>document.getElementById(k);N.debug=new URLSearchParams(location.search).has("debug");let e=new Pr({antialias:!0,powerPreference:"high-performance"}),t=Math.min(window.devicePixelRatio||1,1.5),n=t;e.setPixelRatio(n),e.setSize(innerWidth,innerHeight),e.outputColorSpace=it,e.toneMapping=mc,e.toneMappingExposure=1.22,e.shadowMap.enabled=!0,e.shadowMap.type=pc,e.autoClear=!1,r("game").appendChild(e.domElement);let i=new Lr;i.fog=new Xa(14272942,90,620);let s=new Ft(78,innerWidth/innerHeight,.05,3500);i.add(s);let a=new Lr,o=new Ft(56,innerWidth/innerHeight,.07,6);N.scene=i,N.camera=s,N.renderer=e,await Md(k=>{let j=document.getElementById("loading");j&&(j.textContent="LOADING "+Math.round(k*100)+"%")});let l=bd(i);N.world=l;let c=new zr(12375280,13217930,1.45);i.add(c);let h=new mi(16773334,3.4);h.castShadow=!0,h.shadow.mapSize.set(2048,2048),h.shadow.camera.left=-58,h.shadow.camera.right=58,h.shadow.camera.top=58,h.shadow.camera.bottom=-58,h.shadow.camera.near=1,h.shadow.camera.far=400,h.shadow.bias=-4e-4,h.shadow.normalBias=.04,i.add(h,h.target);let u=l.sunLight.dir,d=new Zs(e).fromEquirectangular(l.skyT).texture;i.environment=d,a.environment=d,a.add(new zr(12570864,4864556,1.4));let g=new mi(16765600,2.6);g.position.set(-.4,1,.6),a.add(g),N.audio=new wo,Ad(i),Od();let x=new Fo(a,o);N.player=x,a.traverse(k=>{k.material&&k.material.isMeshStandardMaterial&&(k.material.envMapIntensity=.9)});let m=["REYES","HAYES","TANAKA","MERCER"],p=["VOLKOV","OKAFOR","LINDQVIST","DUARTE","KOWALSKI"];N.bots=[];for(let k=0;k<4;k++)N.bots.push(new Zr(k,m[k],0));for(let k=0;k<5;k++)N.bots.push(new Zr(10+k,p[k],1));N.actors=[x,...N.bots],N.spawnCenter=k=>{let j=l.spawns[k],W=0,se=0;for(let ge of j)W+=ge.x,se+=ge.z;return{x:W/j.length,z:se/j.length}};function _(k){let j=l.spawns[k.team],W=j[0],se=-1e9;for(let ge of j){let Me=1e9;for(let Fe of N.actors){if(!Fe.alive||Fe===k)continue;let He=Math.hypot(Fe.pos.x-ge.x,Fe.pos.z-ge.z);Me=Math.min(Me,Fe.team!==k.team?He:He*2.5)}let Se=Me+xe(0,10);Se>se&&(se=Se,W=ge)}return{x:W.x+xe(-1,1),z:W.z+xe(-1,1)}}N.respawnActor=k=>{let j=_(k),W=N.spawnCenter(1-k.team);k.isPlayer?k.respawn(j,Math.atan2(-(W.x-j.x),-(W.z-j.z))):k.spawnAt(j)};let v={},M={fire:!1,ads:!1,firedThisPress:!1};window.__keys=v,window.__mouse=M,window.__G=N;let D=!1;addEventListener("keydown",k=>{if((k.code==="Tab"||k.code==="Space"||k.code.startsWith("Arrow"))&&k.preventDefault(),!k.repeat&&(v[k.code]=!0,N.state==="playing")){if(k.code.startsWith("Digit")){let j=+k.code.slice(5)-1;j>=0&&j<Wn.length&&x.switchTo(j)}else k.code==="KeyR"?x.startReload():k.code==="KeyG"?x.throwNade():k.code==="KeyQ"?x.switchTo(x.last):k.code==="Tab"?Ao(!0):k.code==="KeyM"?(N.audio.muted=!N.audio.muted,Eh(N.audio.muted?"SOUND OFF":"SOUND ON",900)):k.code==="F3"&&(F=!F);Gd()}}),addEventListener("keyup",k=>{v[k.code]=!1,k.code==="Tab"&&Ao(!1)}),addEventListener("blur",()=>{for(let k in v)v[k]=!1;M.fire=M.ads=!1,Ao(!1)}),e.domElement.addEventListener("mousedown",k=>{if(N.state==="playing"){if(!D&&!N.debug){C();return}k.button===0&&(M.fire=!0),k.button===2&&(M.ads=!0),N.audio.resume()}}),addEventListener("mouseup",k=>{k.button===0&&(M.fire=!1),k.button===2&&(M.ads=!1)}),addEventListener("contextmenu",k=>k.preventDefault()),addEventListener("mousemove",k=>{if(N.state!=="playing"||!(D||N.debug)||!x.alive)return;let j=Tt(k.movementX||0,-250,250),W=Tt(k.movementY||0,-250,250);x.look(j,W)}),addEventListener("wheel",k=>{N.state==="playing"&&x.alive&&x.cycle(k.deltaY>0?1:-1)},{passive:!0});function C(){let k=e.domElement;try{let j=k.requestPointerLock({unadjustedMovement:!0});j&&j.catch&&j.catch(()=>{try{k.requestPointerLock()}catch{}})}catch{try{k.requestPointerLock()}catch{}}}document.addEventListener("pointerlockchange",()=>{D=document.pointerLockElement===e.domElement,D?N.state==="paused"&&(N.state="playing",r("pause").classList.remove("on")):N.state==="playing"&&!N.debug&&(N.state="paused",r("pause").classList.add("on"),M.fire=M.ads=!1)});function P(k,j){let W=r(k);W.addEventListener("click",se=>{let ge=se.target.closest("button");ge&&(W.querySelectorAll("button").forEach(Me=>Me.classList.toggle("on",Me===ge)),j(ge.dataset.v))})}P("diff",k=>N.settings.diff=+k),P("qual",k=>V(k)),r("sens").addEventListener("input",k=>{N.settings.sens=+k.target.value,r("sensV").textContent=(+k.target.value).toFixed(1)}),r("fov").addEventListener("input",k=>{N.settings.fov=+k.target.value,r("fovV").textContent=k.target.value});function V(k){N.settings.quality=k;let j=k==="low";h.castShadow=!j,t=j?1:Math.min(window.devicePixelRatio||1,1.5),n=t,e.setPixelRatio(n),e.setSize(innerWidth,innerHeight)}function w(){N.audio.init(),N.audio.resume(),$d(),N.scores=[0,0],N.matchTime=0,N.time=0,N.shake=0,x.kills=x.deaths=x.score=x.streak=0;for(let j of N.bots)j.kills=j.deaths=j.score=0,j.alive=!1;let k=[0,0];for(let j of N.actors){let W=l.spawns[j.team],se=W[k[j.team]++%W.length],ge=N.spawnCenter(1-j.team),Me={x:se.x,z:se.z};j.isPlayer?j.respawn(Me,Math.atan2(-(ge.x-Me.x),-(ge.z-Me.z))):j.spawnAt(Me)}document.body.className="",r("menu").classList.remove("on"),r("end").classList.remove("on"),r("pause").classList.remove("on"),Yr("",!1),document.getElementById("hint").style.opacity=1,N.state="playing",N.debug||C(),Eh("ELIMINATE THE HOSTILES",2200)}N.endMatch=()=>{if(N.state!=="playing")return;N.state="ended",document.pointerLockElement&&document.exitPointerLock(),M.fire=M.ads=!1,document.body.className="ended";let k=N.scores[0]>N.scores[1],j=N.scores[0]===N.scores[1];r("endTitle").textContent=j?"DRAW":k?"VICTORY":"DEFEAT",r("endTitle").className=k?"win":"lose";let W=(x.kills/Math.max(1,x.deaths)).toFixed(2);r("endStats").innerHTML=`ALLIES <b>${N.scores[0]}</b> \u2014 <b>${N.scores[1]}</b> HOSTILES<br>YOUR KILLS <b>${x.kills}</b> \xB7 DEATHS <b>${x.deaths}</b> \xB7 K/D <b>${W}</b> \xB7 SCORE <b>${x.score}</b>`,setTimeout(()=>r("end").classList.add("on"),900)},r("deploy").addEventListener("click",w),r("again").addEventListener("click",w),r("resume").addEventListener("click",()=>C()),r("pause").addEventListener("click",k=>{k.target.id==="pause"&&C()}),r("quit").addEventListener("click",()=>{N.state="menu",document.body.className="menu",r("pause").classList.remove("on"),r("menu").classList.add("on")}),addEventListener("resize",()=>{e.setSize(innerWidth,innerHeight),s.aspect=innerWidth/innerHeight,s.updateProjectionMatrix(),o.aspect=innerWidth/innerHeight,o.updateProjectionMatrix()});let E=performance.now(),q=0,Q=0,le=0,F=!1,Y=0,J=0,ae=3,ie=new R;function ee(k){requestAnimationFrame(ee);let j=Math.min((k-E)/1e3,1/20);if(E=k,q++,Q+=j,Y+=j,J++,Q>=.5&&(le=Math.round(q/Q),q=0,Q=0),ae-=j,ae<=0&&J>30){let W=Y/J;W>.0215&&n>.6?(n=Math.max(.6,n-.15),e.setPixelRatio(n),e.setSize(innerWidth,innerHeight)):W<.0135&&n<t&&(n=Math.min(t,n+.1),e.setPixelRatio(n),e.setSize(innerWidth,innerHeight)),Y=0,J=0,ae=2.5}if(N.state==="playing"){N.time+=j,N.matchTime+=j,N.matchTime>=N.matchLimit&&N.state==="playing"&&N.endMatch(),x.update(j,v,M);for(let W of N.bots)W.update(j);Jd(j),N.shake=Math.max(0,N.shake-j*2.2),Xd(j,F?le:0)}else if((N.state==="menu"||N.state==="ended"||N.state==="paused")&&(N.state==="menu"||N.state==="ended")){N.time+=j;let W=N.time*.08;s.position.set(Math.cos(W)*150,34+Math.sin(W*1.7)*6,Math.sin(W)*150),s.lookAt(0,60,0),s.fov=62,s.updateProjectionMatrix(),s.updateMatrixWorld(!0)}Id(j),ie.set(Math.round(s.position.x/2)*2,0,Math.round(s.position.z/2)*2),h.target.position.copy(ie),h.position.copy(ie).addScaledVector(u,200),e.clear(),e.render(i,s),N.state!=="menu"&&x.alive&&N.state!=="ended"&&(e.clearDepth(),oe(),e.render(a,o))}function oe(){Vd(x.scoped())}r("loading").style.opacity=0,setTimeout(()=>r("loading").remove(),700),V("high"),requestAnimationFrame(ee),N.debug&&(window.__start=w)})();})();
/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
/*!
fflate - fast JavaScript compression/decompression
<https://101arrowz.github.io/fflate>
Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
version 0.6.9
*/
