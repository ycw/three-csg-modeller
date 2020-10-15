function t(){this.polygons=[]}t.fromPolygons=function(n){var o=new t;return o.polygons=n,o},t.prototype={clone:function(){var n=new t;return n.polygons=this.polygons.map((function(t){return t.clone()})),n},toPolygons:function(){return this.polygons},union:function(n){var o=new t.Node(this.clone().polygons),e=new t.Node(n.clone().polygons);return o.clipTo(e),e.clipTo(o),e.invert(),e.clipTo(o),e.invert(),o.build(e.allPolygons()),t.fromPolygons(o.allPolygons())},subtract:function(n){var o=new t.Node(this.clone().polygons),e=new t.Node(n.clone().polygons);return o.invert(),o.clipTo(e),e.clipTo(o),e.invert(),e.clipTo(o),e.invert(),o.build(e.allPolygons()),o.invert(),t.fromPolygons(o.allPolygons())},intersect:function(n){var o=new t.Node(this.clone().polygons),e=new t.Node(n.clone().polygons);return o.invert(),e.clipTo(o),e.invert(),o.clipTo(e),e.clipTo(o),o.build(e.allPolygons()),o.invert(),t.fromPolygons(o.allPolygons())},inverse:function(){var t=this.clone();return t.polygons.map((function(t){t.flip()})),t}},t.Vector=function(t,n,o){3==arguments.length?(this.x=t,this.y=n,this.z=o):"x"in t?(this.x=t.x,this.y=t.y,this.z=t.z):(this.x=t[0],this.y=t[1],this.z=t[2])},t.Vector.prototype={clone:function(){return new t.Vector(this.x,this.y,this.z)},negated:function(){return new t.Vector(-this.x,-this.y,-this.z)},plus:function(n){return new t.Vector(this.x+n.x,this.y+n.y,this.z+n.z)},minus:function(n){return new t.Vector(this.x-n.x,this.y-n.y,this.z-n.z)},times:function(n){return new t.Vector(this.x*n,this.y*n,this.z*n)},dividedBy:function(n){return new t.Vector(this.x/n,this.y/n,this.z/n)},dot:function(t){return this.x*t.x+this.y*t.y+this.z*t.z},lerp:function(t,n){return this.plus(t.minus(this).times(n))},length:function(){return Math.sqrt(this.dot(this))},unit:function(){return this.dividedBy(this.length())},cross:function(n){return new t.Vector(this.y*n.z-this.z*n.y,this.z*n.x-this.x*n.z,this.x*n.y-this.y*n.x)}},t.Vertex=function(n,o,e,r){this.pos=new t.Vector(n),this.normal=o&&new t.Vector(o),this.uv=e&&e.clone(),this.color=r&&new t.Vector(r)},t.Vertex.prototype={clone:function(){return new t.Vertex(this.pos.clone(),this.normal&&this.normal.clone(),this.uv&&this.uv.clone(),this.color&&this.color.clone())},flip:function(){this.normal&&(this.normal=this.normal.negated())},interpolate:function(n,o){return new t.Vertex(this.pos.lerp(n.pos,o),this.normal&&n.normal&&this.normal.lerp(n.normal,o),this.uv&&n.uv&&this.uv.clone().lerp(n.uv,o),this.color&&n.color&&this.color.lerp(n.color,o))}},t.Plane=function(t,n){this.normal=t,this.w=n},t.Plane.EPSILON=1e-5,t.Plane.fromPoints=function(n,o,e){var r=o.minus(n).cross(e.minus(n)).unit();return new t.Plane(r,r.dot(n))},t.Plane.prototype={clone:function(){return new t.Plane(this.normal.clone(),this.w)},flip:function(){this.normal=this.normal.negated(),this.w=-this.w},splitPolygon:function(n,o,e,r,i){for(var s=0,l=[],h=0;h<n.vertices.length;h++){var c=(w=this.normal.dot(n.vertices[h].pos)-this.w)<-t.Plane.EPSILON?2:w>t.Plane.EPSILON?1:0;s|=c,l.push(c)}switch(s){case 0:(this.normal.dot(n.plane.normal)>0?o:e).push(n);break;case 1:r.push(n);break;case 2:i.push(n);break;case 3:var a=[],u=[];for(h=0;h<n.vertices.length;h++){var p=(h+1)%n.vertices.length,f=l[h],y=l[p],g=n.vertices[h],m=n.vertices[p];if(2!=f&&a.push(g),1!=f&&u.push(2!=f?g.clone():g),3==(f|y)){var w=(this.w-this.normal.dot(g.pos))/this.normal.dot(m.pos.minus(g.pos)),v=g.interpolate(m,w);a.push(v),u.push(v.clone())}}a.length>=3&&r.push(new t.Polygon(a,n.shared)),u.length>=3&&i.push(new t.Polygon(u,n.shared))}}},t.Polygon=function(n,o){this.vertices=n,this.shared=o,this.plane=t.Plane.fromPoints(n[0].pos,n[1].pos,n[2].pos)},t.Polygon.prototype={clone:function(){var n=this.vertices.map((function(t){return t.clone()}));return new t.Polygon(n,this.shared)},flip:function(){this.vertices.reverse().map((function(t){t.flip()})),this.plane.flip()}},t.Node=function(t){this.plane=null,this.front=null,this.back=null,this.polygons=[],t&&this.build(t)},t.Node.prototype={clone:function(){var n=new t.Node;return n.plane=this.plane&&this.plane.clone(),n.front=this.front&&this.front.clone(),n.back=this.back&&this.back.clone(),n.polygons=this.polygons.map((function(t){return t.clone()})),n},invert:function(){for(var t=0;t<this.polygons.length;t++)this.polygons[t].flip();this.plane.flip(),this.front&&this.front.invert(),this.back&&this.back.invert();var n=this.front;this.front=this.back,this.back=n},clipPolygons:function(t){if(!this.plane)return t.slice();for(var n=[],o=[],e=0;e<t.length;e++)this.plane.splitPolygon(t[e],n,o,n,o);return this.front&&(n=this.front.clipPolygons(n)),o=this.back?this.back.clipPolygons(o):[],n.concat(o)},clipTo:function(t){this.polygons=t.clipPolygons(this.polygons),this.front&&this.front.clipTo(t),this.back&&this.back.clipTo(t)},allPolygons:function(){var t=this.polygons.slice();return this.front&&(t=t.concat(this.front.allPolygons())),this.back&&(t=t.concat(this.back.allPolygons())),t},build:function(n){if(n.length){this.plane||(this.plane=n[0].plane.clone());for(var o=[],e=[],r=0;r<n.length;r++)this.plane.splitPolygon(n[r],this.polygons,this.polygons,o,e);o.length&&(this.front||(this.front=new t.Node),this.front.build(o)),e.length&&(this.back||(this.back=new t.Node),this.back.build(e))}}};class n{constructor(t){this._THREE=t,this._csg=null}union(t){return o(this._THREE,this._csg.union(t._csg))}subtract(t){return o(this._THREE,this._csg.subtract(t._csg))}intersect(t){return o(this._THREE,this._csg.intersect(t._csg))}applyMatrix4(t){const o=this.build();return o.geometry.applyMatrix4(t),n._fromMesh(this._THREE,o)}build(){return function(t,n){const o=n.toPolygons(),e=new Map;let r=0;for(const{vertices:t,shared:n}of o)e.has(n)?e.get(n).push(t):e.set(n,[t]),r+=t.length;const i=new Float32Array(3*r),s=new Float32Array(3*r),l=new Float32Array(2*r),h=new Float32Array(3*r),c=new t.BufferGeometry,a=[],u=new t.Mesh(c,a);let p,f,y,g=0,m=0,w=0,v=0,d=0,b=0,P=0;const x=[];let z=0;for(const[t,n]of e.entries()){m=0;for(const t of n){for(let n=1,o=t.length-1;n<o;++n)x.push(z,z+n,z+n+1);z+=t.length,m+=3*(t.length-2);for(const{pos:n,normal:o,uv:e,color:r}of t)i[v++]=n.x,i[v++]=n.y,i[v++]=n.z,p||(p=o),o?(s[d++]=o.x,s[d++]=o.y,s[d++]=o.z):d+=3,f||(f=e),e?(l[b++]=e.x,l[b++]=e.y):b+=2,y||(y=r),r?(h[P++]=r.x,h[P++]=r.y,h[P++]=r.z):P+=3}a.push(t),c.addGroup(g,m,w),g+=m,w+=1}z<=65535?c.index=new t.Uint16BufferAttribute(x,1):(console.warn("index > 65535"),c.index=new t.Uint32BufferAttribute(x,1));c.setAttribute("position",new t.BufferAttribute(i,3)),p&&c.setAttribute("normal",new t.BufferAttribute(s,3));f&&c.setAttribute("uv",new t.BufferAttribute(l,2));y&&c.setAttribute("color",new t.BufferAttribute(h,3));return u}(this._THREE,this._csg)}static _fromMesh(o,e){return function(o,e){const r=new n(o);return r._csg=t.fromPolygons(function(n,o){const e=o.clone();e.updateMatrix();const{matrix:r}=e,i=!r.equals(new n.Matrix4),s=[],l=o.geometry.attributes.position.array,{normal:h,uv:c,color:a}=o.geometry.attributes,u=h&&h.array,p=c&&c.array,f=a&&a.array,y=o.geometry.index&&o.geometry.index.array,g=y?y.length:l.length/3,m=Array.isArray(o.material)?o.geometry.groups:[{start:0,count:g,materialIndex:0}];for(const{start:e,count:h,materialIndex:c}of m){const a=Array.isArray(o.material)?o.material[c]:o.material;for(let o=e;o<e+h;o+=3){const e=[];for(let s=0;s<3;++s){const h=y?y[o+s]:o+s;e.push(new t.Vertex(i?(new n.Vector3).fromArray(l,3*h).applyMatrix4(r):l.subarray(3*h,3*h+3),u&&u.subarray(3*h,3*h+3),p&&(new n.Vector2).fromArray(p,2*h),f&&f.subarray(3*h,3*h+3)))}s.push(new t.Polygon(e,a))}}return s}(o,e)),r}(o,e)}}function o(t,o){const e=new n(t);return e._csg=o,e}class e{constructor(t){this._THREE=t}model(t){return n._fromMesh(this._THREE,t)}}export{e as CSGModeller};
//# sourceMappingURL=lib.esm.js.map
