/* Trim surrounding whitespace only; retain all ink, including white-frame outlines.
   The original data URL remains on the line for Reset crop. */
(function(root) {
function bounds(data,w,h,pad=3) {
 let left=w,top=h,right=-1,bottom=-1;
 for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
  const i=(y*w+x)*4;
  if(data[i+3]<16 || (data[i]>238 && data[i+1]>238 && data[i+2]>238)) continue;
  left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
 }
 if(right<left) return null;
 left=Math.max(0,left-pad);top=Math.max(0,top-pad);
 right=Math.min(w-1,right+pad);bottom=Math.min(h-1,bottom+pad);
 return {x:left,y:top,w:right-left+1,h:bottom-top+1};
}
async function trim(src) {
 if(!/^data:image\/(png|jpeg);base64,/.test(src || '')) return src;
 const img=new Image(); img.src=src; await img.decode();
 const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
 const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
 const b=bounds(ctx.getImageData(0,0,c.width,c.height).data,c.width,c.height);
 if(!b || b.w<10 || b.h<10 || (b.w===c.width && b.h===c.height)) return src;
 const out=document.createElement('canvas');out.width=b.w;out.height=b.h;
 out.getContext('2d').drawImage(c,b.x,b.y,b.w,b.h,0,0,b.w,b.h);
 return out.toDataURL('image/png');
}
const api={bounds,trim};
if(typeof module!=='undefined') module.exports=api; else root.QuoteDrawing=api;
})(typeof globalThis!=='undefined'?globalThis:this);

