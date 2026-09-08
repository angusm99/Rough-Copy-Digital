/* Rectangular panes, independent of the underlying dimension grid.
   Full fixed columns remain continuous; B-range fixed bases span across columns.
   Full-fix templates keep their intentional divisions. */
(function(root) {
function standardSpans(p) {
 if(!['tophung','sidehung'].includes(p.family) || !p.types?.some(t=>t!=='FIXED')) return [];
 const out=[], used=new Set();
 const add=(r,c,rs,cs)=>{
  out.push({r,c,rs,cs});
  for(let y=r;y<r+rs;y++) for(let x=c;x<c+cs;x++) used.add(y*p.cols+x);
 };
 // A fixed sidelight/centre panel runs the full height, not through each transom.
 for(let c=0;c<p.cols;c++) if(p.rows>1 && p.types.every((t,i)=>i%p.cols!==c || t==='FIXED')) add(0,c,p.rows,1);
 // Remaining fixed base panes: merge horizontal runs, then matching rows below.
 for(let r=0;r<p.rows;r++) for(let c=0;c<p.cols;c++) {
  const free=(y,x)=>p.types[y*p.cols+x]==='FIXED' && !used.has(y*p.cols+x);
  if(!free(r,c))continue;
  let cs=1,rs=1;
  while(c+cs<p.cols && free(r,c+cs))cs++;
  while(r+rs<p.rows && Array.from({length:cs},(_,i)=>free(r+rs,c+i)).every(Boolean))rs++;
  if(rs*cs>1)add(r,c,rs,cs);
 }
 return out;
}
function panes(p) {
 const used=new Set(), result=[];
 for(const sp of p.spans || []) {
  const {r,c,rs,cs}=sp;
  if(![r,c,rs,cs].every(Number.isInteger)||r<0||c<0||rs<1||cs<1||r+rs>p.rows||c+cs>p.cols)continue;
  const t=p.types[r*p.cols+c], indices=[];
  for(let y=r;y<r+rs;y++)for(let x=c;x<c+cs;x++)indices.push(y*p.cols+x);
  if(indices.some(i=>used.has(i)||p.types[i]!==t))continue;
  indices.forEach(i=>used.add(i));result.push({...sp,t});
 }
 for(let r=0;r<p.rows;r++)for(let c=0;c<p.cols;c++)if(!used.has(r*p.cols+c))result.push({r,c,rs:1,cs:1,t:p.types[r*p.cols+c]});
 return result.sort((a,b)=>a.r-b.r||a.c-b.c);
}
function svg(p, W, H, couplingEdge, interactive=false) {
  const mmW = p.W, mmH = p.H;
  const FR = 45;        // outer frame border (mm)
  const GAP = 14;       // gold gap between panes (mullion/transom)
  const SASH = 22;      // sash inner gold border
  const GOLD = '#ffcc00', GLASS = '#0f1012';
  const TINT_S = 'rgba(40,100,180,0.60)', TINT_F = 'rgba(40,100,180,0.60)';
  const OPEN = 'rgba(255,255,255,0.6)';
  let colXs=[0]; p.colW.forEach(w=>colXs.push(colXs[colXs.length-1]+w));
  let rowYs=[0]; p.rowH.forEach(h=>rowYs.push(rowYs[rowYs.length-1]+h));

  let s = `<rect x="0" y="0" width="${mmW}" height="${mmH}" rx="6" fill="${GOLD}"/>`;
  for (const pane of panes(p)) {
    const {r,c,rs,cs,t}=pane;
    const x1 = colXs[c]   + (c===0        ? FR : GAP/2);
    const x2 = colXs[c+cs] - (c+cs===p.cols ? FR : GAP/2);
    const y1 = rowYs[r]   + (r===0        ? FR : GAP/2);
    const y2 = rowYs[r+rs] - (r+rs===p.rows ? FR : GAP/2);
    const w = x2-x1, h = y2-y1;
    if (w <= 0 || h <= 0) continue;
    const vent = (t==='TOP' || t==='SIDE');
    s += `<rect data-pane="${r},${c},${rs},${cs}" x="${x1}" y="${y1}" width="${w}" height="${h}" fill="${GLASS}" stroke="#000" stroke-width="2"/>`;
    s += `<rect x="${x1}" y="${y1}" width="${w}" height="${h}" fill="${vent ? TINT_S : TINT_F}"/>`;
    if (vent) {
      const si = SASH/2 + 6;
      s += `<rect x="${x1+si}" y="${y1+si}" width="${w-2*si}" height="${h-2*si}" fill="none" stroke="${GOLD}" stroke-width="${SASH}"/>`;
      const m = SASH + 22; // opening-line inset
      const dash = `fill="none" stroke="${OPEN}" stroke-width="6" stroke-dasharray="12,12" stroke-linecap="round" stroke-linejoin="round"`;
      if (t === 'TOP') {
        s += `<polyline points="${x1+m},${y1+m} ${(x1+x2)/2},${y2-m} ${x2-m},${y1+m}" ${dash}/>`;
      } else {
        s += `<polyline points="${x1+m},${y1+m} ${x2-m},${(y1+y2)/2} ${x1+m},${y2-m}" ${dash}/>`;
      }
    }
    if (interactive) s += '<rect data-i="'+(r*p.cols+c)+'" x="'+x1+'" y="'+y1+'" width="'+w+'" height="'+h+'" fill="transparent" pointer-events="all"/>';
  }

  // Stronger coupling-mullion indicator (fix presets): red edge line —
  // toplight = below, sublight = above, sidelight = left/right.
  if (couplingEdge) {
    const RED = '#e5484d', cw = 40, i = cw/2;
    if (couplingEdge === 'top')    s += `<line x1="0" y1="${i}" x2="${mmW}" y2="${i}" stroke="${RED}" stroke-width="${cw}"/>`;
    if (couplingEdge === 'bottom') s += `<line x1="0" y1="${mmH-i}" x2="${mmW}" y2="${mmH-i}" stroke="${RED}" stroke-width="${cw}"/>`;
    if (couplingEdge === 'left')   s += `<line x1="${i}" y1="0" x2="${i}" y2="${mmH}" stroke="${RED}" stroke-width="${cw}"/>`;
    if (couplingEdge === 'right')  s += `<line x1="${mmW-i}" y1="0" x2="${mmW-i}" y2="${mmH}" stroke="${RED}" stroke-width="${cw}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${mmW} ${mmH}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid meet">${s}</svg>`;
}
const api={standardSpans,panes,svg};
if(typeof module!=='undefined')module.exports=api; else root.WindowFrames=api;
})(typeof globalThis!=='undefined'?globalThis:this);

