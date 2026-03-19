import { useState, useRef, useMemo } from 'react';
import { T } from '../../constants/tokens';
import { S } from '../../constants/styles';
import { I } from '../../components/Icons';
import { Atmosphere } from '../../components/Atmosphere';
import { Logo } from '../../components/Logo';
import { SkipLink } from '../../components/SkipLink';
import { Tag } from '../../components/Tag';
import { AnimCount } from '../../components/AnimCount';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { VirtualMasonry } from '../../components/VirtualMasonry';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PullToRefresh } from '../../components/PullToRefresh';
import { MobileNavOverlay } from '../../components/MobileNavOverlay';
import { CategoryCard } from './CategoryCard';
import { CategoryModal } from './CategoryModal';
import { AiPanel } from '../AiPanel';
import { useDebounce } from '../../hooks/useDebounce';
import { useUndoToast } from '../../hooks/useUndoToast';

export function Dashboard({ user, categories, setCategories, onNavigate, onLogout }) {
  const [searchInput,setSearchInput]=useState("");
  const debouncedSearch = useDebounce(searchInput, 150);
  const [filterTag,setFilterTag]=useState(null);
  const [showNewCat,setShowNewCat]=useState(false); const [editCat,setEditCat]=useState(null);
  const [mobileNav,setMobileNav]=useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [sortBy, setSortBy] = useState("default");
  const [showAi, setShowAi] = useState(false);
  const fileRef=useRef(null); const { flash, flashUndo, ToastEl } = useUndoToast();
  const isSearching = searchInput !== debouncedSearch;

  const allTags = useMemo(()=>[...new Set(categories.flatMap(c=>[...(c.tags||[]),...c.bookmarks.flatMap(b=>b.tags||[])]))],[categories]);
  const filtered = useMemo(()=>{
    const q = debouncedSearch;
    let result = categories.map(cat=>{
      const bms=cat.bookmarks.filter(bm=>{const ms=!q||bm.title.toLowerCase().includes(q.toLowerCase())||bm.url.toLowerCase().includes(q.toLowerCase())||bm.note?.toLowerCase().includes(q.toLowerCase());const mt=!filterTag||bm.tags?.includes(filterTag)||cat.tags?.includes(filterTag);return ms&&mt});
      return {...cat,bookmarks:bms};
    }).filter(cat=>(filterTag&&cat.tags?.includes(filterTag))||cat.bookmarks.length>0||(!q&&!filterTag));
    if (sortBy === "az") result = [...result].sort((a,b) => a.name.localeCompare(b.name));
    else if (sortBy === "za") result = [...result].sort((a,b) => b.name.localeCompare(a.name));
    else if (sortBy === "most") result = [...result].sort((a,b) => b.bookmarks.length - a.bookmarks.length);
    else if (sortBy === "least") result = [...result].sort((a,b) => a.bookmarks.length - b.bookmarks.length);
    else if (sortBy === "newest") result = [...result].reverse();
    return result;
  },[categories,debouncedSearch,filterTag,sortBy]);

  const saveCat=cat=>{if(categories.find(c=>c.id===cat.id))setCategories(categories.map(c=>c.id===cat.id?cat:c));else setCategories([...categories,cat]);setShowNewCat(false);setEditCat(null)};
  const exportData=()=>{const b=new Blob([JSON.stringify(categories,null,2)],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="markme_bookmarks.json";a.click();URL.revokeObjectURL(u);flash("Exported ✓")};
  const importData=e=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=ev=>{try{const d=JSON.parse(ev.target.result);if(Array.isArray(d)){setCategories(d);flash("Imported ✓")}}catch{flash("Invalid file")}};r.readAsText(file);e.target.value=""};

  const requestDeleteCat = cat => setConfirmDel({ cat });
  const confirmDeleteCat = () => {
    const cat = confirmDel?.cat;
    if (!cat) return;
    const snapshot = [...categories];
    setCategories(categories.filter(c => c.id !== cat.id));
    setConfirmDel(null);
    flashUndo(
      `"${cat.name}" deleted`,
      () => setCategories(snapshot)
    );
  };

  const deleteBm = (catId, bmId, bmTitle) => {
    const snapshot = [...categories];
    setCategories(categories.map(c =>
      c.id === catId ? { ...c, bookmarks: c.bookmarks.filter(b => b.id !== bmId) } : c
    ));
    flashUndo(
      `"${bmTitle}" removed`,
      () => setCategories(snapshot)
    );
  };

  const totalBm=categories.reduce((a,c)=>a+c.bookmarks.length,0);
  const totalPinned=categories.reduce((a,c)=>a+c.bookmarks.filter(b=>b.pinned).length,0);
  const stats=[{label:"CATEGORIES",val:categories.length,color:T.primary},{label:"BOOKMARKS",val:totalBm,color:T.secondary},{label:"PINNED",val:totalPinned,color:T.warning},{label:"TAGS",val:allTags.length,color:T.success}];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.font, color:T.text, position:"relative" }}>
      <Atmosphere />
      <SkipLink />

      <nav aria-label="Main navigation" style={{ position:"sticky", top:0, zIndex:100, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", background:"rgba(13,13,13,0.85)", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 16px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Logo />
          <div className="mm-desk" style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div role="search" style={{ display:"flex", alignItems:"center", gap:6, background:T.bgInput, border:`1px solid ${searchInput ? T.primary+"60" : T.border}`, padding:"6px 12px", minWidth:180, transition:"border-color 0.2s" }}>
              <I.Search s={14} /><input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Search…" aria-label="Search bookmarks" style={{ border:"none", outline:"none", fontSize:13, fontFamily:T.font, background:"transparent", color:T.text, flex:1, fontWeight:500 }} />
              {isSearching && <div style={{ width:12, height:12, border:`2px solid ${T.primary}`, borderTopColor:"transparent", borderRadius:"50%", animation:"mmSpin 0.5s linear infinite", flexShrink:0 }} />}
              {searchInput&&<button onClick={()=>setSearchInput("")} aria-label="Clear search" style={{ ...S.btn, background:"none", padding:2, color:T.textMuted }}><I.X s={12}/></button>}
            </div>
            <button onClick={exportData} title="Export" aria-label="Export bookmarks as JSON" style={{ ...S.btn, background:"transparent", color:T.textSec, padding:"6px 10px", border:`1px solid ${T.border}` }} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.text}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSec}}><I.Export /></button>
            <button onClick={()=>fileRef.current?.click()} title="Import" aria-label="Import bookmarks from JSON" style={{ ...S.btn, background:"transparent", color:T.textSec, padding:"6px 10px", border:`1px solid ${T.border}` }} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.text}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSec}}><I.Import /></button>
            <input ref={fileRef} type="file" accept=".json" onChange={importData} style={{ display:"none" }} aria-hidden="true" tabIndex={-1} />
            <button onClick={()=>setShowAi(true)} title="AI Assistant" aria-label="Open AI assistant" style={{ ...S.btn, background:T.primarySubtle, color:T.primary, padding:"6px 10px", border:`1px solid ${T.primary}30`, position:"relative" }}
              onMouseEnter={e=>{e.currentTarget.style.background=T.primary+"25"}} onMouseLeave={e=>{e.currentTarget.style.background=T.primarySubtle}}>
              <I.Sparkle /><span style={{ position:"absolute", top:-2, right:-2, width:6, height:6, background:T.secondary, borderRadius:"50%" }} />
            </button>
            <button onClick={()=>setShowNewCat(true)} aria-label="Create new category" style={{ ...S.btn, background:"#fff", color:T.bg, padding:"7px 16px", fontWeight:800, fontSize:13, boxShadow:"2px 2px 0 rgba(0,0,0,0.3)", transition:"all 0.15s cubic-bezier(0.4,0,0.2,1)" }}
              onMouseDown={e=>{e.currentTarget.style.transform="scale(0.95)";e.currentTarget.style.boxShadow="1px 1px 0 rgba(0,0,0,0.2)"}}
              onMouseUp={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="4px 4px 0 rgba(0,0,0,0.4)"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="4px 4px 0 rgba(0,0,0,0.4)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="2px 2px 0 rgba(0,0,0,0.3)"}}><I.Plus /> New</button>
            <button onClick={()=>onNavigate("profile")} aria-label={`Profile — ${user.name}`} style={{ ...S.btn, width:32, height:32, padding:0, background:`linear-gradient(135deg, ${T.primary}, ${T.secondary})`, color:"#fff", fontSize:12, fontWeight:800, flexShrink:0 }}
              title="Profile">{user.name?.[0]?.toUpperCase()||"U"}</button>
          </div>
          <button className="mm-mob-btn" onClick={()=>setMobileNav(!mobileNav)} aria-label="Open menu" aria-expanded={mobileNav} style={{ ...S.btn, background:"transparent", color:T.textSec, padding:6, display:"none" }}><I.Menu /></button>
        </div>
      </nav>

      {mobileNav && <MobileNavOverlay onClose={()=>setMobileNav(false)}
        items={[
          {icon:<I.Plus />,label:"New Category",fn:()=>{setShowNewCat(true);setMobileNav(false)}},
          {icon:<I.Sparkle />,label:"AI Assistant",fn:()=>{setShowAi(true);setMobileNav(false)}},
          {icon:<I.Export />,label:"Export",fn:()=>{exportData();setMobileNav(false)}},
          {icon:<I.Import />,label:"Import",fn:()=>{fileRef.current?.click();setMobileNav(false)}},
          {icon:<I.User />,label:"Profile",fn:()=>{onNavigate("profile");setMobileNav(false)}},
          {icon:<I.LogOut />,label:"Log out",fn:()=>{onLogout();setMobileNav(false)}},
        ]} />}

      <main id="main-content" style={{ maxWidth:1100, margin:"0 auto", padding:"16px 16px 60px", position:"relative", zIndex:1 }}>
        <PullToRefresh onRefresh={() => { setCategories([...categories]); flash("Refreshed ✓"); }}>
        <div className="mm-mob-search" style={{ display:"none", marginBottom:14 }}>
          <div role="search" style={{ display:"flex", alignItems:"center", gap:6, background:T.bgInput, border:`1px solid ${searchInput ? T.primary+"60" : T.border}`, padding:"8px 12px", transition:"border-color 0.2s" }}>
            <I.Search s={14} /><input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Search bookmarks…" aria-label="Search bookmarks" style={{ border:"none", outline:"none", fontSize:14, fontFamily:T.font, background:"transparent", color:T.text, flex:1, fontWeight:500 }} />
            {isSearching && <div style={{ width:12, height:12, border:`2px solid ${T.primary}`, borderTopColor:"transparent", borderRadius:"50%", animation:"mmSpin 0.5s linear infinite", flexShrink:0 }} />}
            {searchInput&&<button onClick={()=>setSearchInput("")} aria-label="Clear search" style={{ ...S.btn, background:"none", padding:2, color:T.textMuted }}><I.X s={12}/></button>}
          </div>
        </div>

        <div className="mm-stats" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
          {stats.map((s,i)=>(
            <div key={s.label} style={{ background:T.bgEl, border:`1px solid ${T.border}`, padding:"14px 16px", position:"relative", overflow:"hidden", animation:`mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i*60}ms both` }}>
              <div style={{ position:"absolute", top:-15, right:-15, width:50, height:50, borderRadius:"50%", background:s.color, filter:"blur(30px)", opacity:0.15 }} />
              <div style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1, position:"relative" }}><AnimCount to={s.val} duration={700+i*100} /></div>
              <div style={{ fontSize:10, fontWeight:600, color:T.textMuted, letterSpacing:"0.04em", marginTop:4, textTransform:"uppercase", position:"relative" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {allTags.length>0&&<div role="toolbar" aria-label="Filter by tags" style={{ marginBottom:12, display:"flex", alignItems:"center", gap:5, flexWrap:"wrap", overflowX:"auto", paddingBottom:4 }}>
          <span style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", marginRight:2, flexShrink:0 }}>Filter</span>
          <Tag tag="ALL" small active={!filterTag} onClick={()=>setFilterTag(null)} />
          {allTags.map(t=><Tag key={t} tag={t} small active={filterTag===t} onClick={()=>setFilterTag(filterTag===t?null:t)} />)}
        </div>}

        <div role="toolbar" aria-label="Sort categories" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", marginRight:2, flexShrink:0, display:"flex", alignItems:"center", gap:4 }}><I.Sort /> Sort</span>
            {[
              { id:"default", label:"Default", icon:null },
              { id:"az", label:"A→Z", icon:<I.AZ /> },
              { id:"za", label:"Z→A", icon:null },
              { id:"most", label:"Most links", icon:<I.Hash /> },
              { id:"least", label:"Fewest", icon:null },
              { id:"newest", label:"Newest", icon:<I.Clock /> },
            ].map(s=>(
              <button key={s.id} onClick={()=>setSortBy(s.id)}
                aria-pressed={sortBy===s.id}
                aria-label={`Sort by ${s.label}`}
                style={{
                  ...S.btn, padding:"3px 10px", fontSize:10, fontWeight:700, letterSpacing:"0.02em", textTransform:"uppercase",
                  background:sortBy===s.id?T.primary+"20":"transparent",
                  color:sortBy===s.id?T.primary:T.textMuted,
                  border:`1px solid ${sortBy===s.id?T.primary+"40":T.border}`,
                  transition:"all 0.15s",
                }}
                onMouseEnter={e=>{if(sortBy!==s.id){e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.textSec}}}
                onMouseLeave={e=>{if(sortBy!==s.id){e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textMuted}}}
              >{s.label}</button>
            ))}
          </div>
          <span style={{ fontSize:11, color:T.textMuted, fontFamily:T.font }}>
            {filtered.length} categor{filtered.length===1?"y":"ies"} · {filtered.reduce((a,c)=>a+c.bookmarks.length,0)} links
          </span>
        </div>

        <ErrorBoundary fallbackTitle="Dashboard error" fallbackMessage="The bookmark grid encountered an error. Try refreshing.">
        <VirtualMasonry items={filtered} columnCount={3} gap={14}
          renderItem={(cat) => (
            <CategoryCard cat={cat} allTags={allTags} searchQuery={debouncedSearch}
              onUpdate={c=>setCategories(categories.map(x=>x.id===c.id?c:x))}
              onDelete={requestDeleteCat}
              onDeleteBm={deleteBm}
              onEdit={c=>setEditCat(c)} />
          )} />
        </ErrorBoundary>

        {filtered.length===0&&<div style={{ textAlign:"center", padding:"80px 20px" }}><div style={{ fontSize:40, marginBottom:12, opacity:0.4 }}>🔍</div><p style={{ fontSize:16, fontWeight:700, color:T.textSec, marginBottom:6 }}>{debouncedSearch||filterTag?"No matches":"No categories yet"}</p><p style={{ fontSize:13, color:T.textMuted }}>{debouncedSearch||filterTag?"Try a different search":"Create your first category"}</p></div>}
        </PullToRefresh>
      </main>

      <button className="mm-fab" onClick={()=>setShowNewCat(true)} aria-label="Create new category"
        style={{
          ...S.btn, display:"none", position:"fixed", bottom:24, right:20, zIndex:90,
          width:52, height:52, padding:0, background:`linear-gradient(135deg, ${T.primary}, ${T.secondary})`,
          color:"#fff", boxShadow:`0 4px 20px ${T.primary}50, 4px 4px 0 rgba(0,0,0,0.3)`,
          transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)",
        }}
        onTouchStart={e=>e.currentTarget.style.transform="scale(0.9)"}
        onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}
      ><I.Plus /></button>

      <CategoryModal open={showNewCat} onClose={()=>setShowNewCat(false)} onSave={saveCat} />
      <CategoryModal open={!!editCat} onClose={()=>setEditCat(null)} onSave={saveCat} cat={editCat} />
      <ConfirmDialog
        open={!!confirmDel}
        onClose={()=>setConfirmDel(null)}
        onConfirm={confirmDeleteCat}
        title={`Delete "${confirmDel?.cat?.name}"?`}
        itemName={confirmDel?.cat?.name}
        count={confirmDel?.cat?.bookmarks?.length || 0}
      />
      <AiPanel open={showAi} onClose={()=>setShowAi(false)} categories={categories} />
      {ToastEl}

      <style>{`
        @media(max-width:860px){.mm-grid{column-count:2!important}.mm-stats{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:640px){.mm-grid{column-count:1!important}.mm-desk{display:none!important}.mm-mob-btn{display:flex!important}.mm-mob-search{display:block!important}.mm-stats{grid-template-columns:repeat(2,1fr)!important}.mm-fab{display:flex!important}}
        *:focus-visible{outline:2px solid ${T.primary};outline-offset:2px}
        input:focus-visible,select:focus-visible,textarea:focus-visible{outline:none;border-color:${T.primary}!important}
        .mm-bm-actions:focus-within{opacity:1!important}
      `}</style>
    </div>
  );
}
