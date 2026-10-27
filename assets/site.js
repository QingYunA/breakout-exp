(function(){
"use strict";
var I18N={
en:{skip:"Skip to results",navFind:"Results",navGames:"Games",navMethod:"Method",navRaw:"Materials",
h1a:"Same Breakout,",h1b:"built 5 ways",
sub:"One requirement, five AI coding setups, one hidden 25-item checklist, blind grading. Play what each one built.",
cta:"See the results",reddit:"Reddit post",repo:"GitHub repo",
cabOpen:"Open full page",cabHint:"Click the screen, then play with the arrow keys or the mouse.",cabAria:"Choose a build",frameTitle:"Breakout game ",
hFind:"What the numbers say",findLead:"Computed from the finished groups. One run each, so read gaps as hints, not rankings.",
fFast:"Fastest build",fCheap:"Lowest cost",fScore:"Best overall score",fVisual:"Strongest visuals",
metricAria:"Metric",fU_min:"min",fU_score:"/ 10",
ftAll:"Every finished group passed the full checklist.",ftMiss:"Missed checklist items: ",
hCards:"Play every build",cardsLead:"Click a screenshot to step through it, or play the real build.",
hRes1:"Every number,",hRes2:"side by side",
bestNote:"Highlighted value = best in that column among finished groups. One run per group, so treat small gaps as noise.",
group:"Group",pc:"Planner → Coder",time:"Time",cost:"Cost (USD)",otok:"Opus out",ctok:"Coder out",loc:"Lines",chk:"Checklist",subj:"Visual / Feel / Overall",
visual:"Visual",feel:"Feel",overall:"Overall",
running:"running",play:"Play",noplay:"Not playable yet",nogame:"No screenshots yet",inCab:"Load in cabinet",more:"More",sMin:"Minutes",sCost:"Cost",min:"min",lines:"lines",
hMethod:"How it was run",hGrade:"Grading",hOrig:"The Reddit original",
fGroups:"Groups",fItems:"Checklist items",fRuns:"Runs per group",fGraders:"Blind graders",
hRaw:"Raw materials",rawLead:"Everything needed to rerun or check the experiment.",
fDesc:"A same-game AI benchmark",updated:"Updated ",
themeLight:"Light theme",themeDark:"Dark theme",themeSystem:"Follow system theme",
m:["Every group got the same requirement text (experiment/requirement.md), no extra hints.","Each group ran in a fresh, isolated session, so no group saw another group's work.","The 25-item checklist was written and frozen before any game was graded.","Grading was blind: files were renamed so the grader did not know which model made which game.","Costs are API list-price equivalents computed from session transcripts by experiment/stats.py, not real bills.","One run per group. Results are noisy; do not read them as a ranking of the models."],
kinds:{"experiment/requirement.md":"The prompt","experiment/checklist.zh.md":"Hidden checklist","experiment/b-opus-deepseek/spec.md":"Opus spec","experiment/b-opus-deepseek/dsh-prompt.md":"DeepSeek prompt","experiment/b-opus-deepseek/dsh.ndjson.gz":"Session log","experiment/stats.py":"Cost script"}},
zh:{skip:"跳到结果",navFind:"结果",navGames:"游戏",navMethod:"方法",navRaw:"材料",
h1a:"同一个打砖块，",h1b:"五种做法",
sub:"同一份需求，五种 AI 编程组合，一份隐藏的 25 项清单，盲评。每个成品都能直接玩。",
cta:"看结果",reddit:"Reddit 原帖",repo:"GitHub 仓库",
cabOpen:"打开完整页面",cabHint:"先点一下画面，再用方向键或鼠标玩。",cabAria:"选择一个版本",frameTitle:"打砖块游戏 ",
hFind:"数字说了什么",findLead:"由已完成的组别实时算出。每组只跑一次，差距请当作线索，而非排名。",
fFast:"最快完成",fCheap:"成本最低",fScore:"总评最高",fVisual:"画面最强",
metricAria:"指标",fU_min:"分钟",fU_score:"/ 10",
ftAll:"所有已完成的组别都通过了全部清单。",ftMiss:"清单未通过：",
hCards:"五个版本，都能玩",cardsLead:"点击截图可切换，也可以直接试玩真实构建。",
hRes1:"所有数字，",hRes2:"一张表",
bestNote:"高亮数值 = 已完成组别中该列的最优值。每组只跑一次，差距小时请当作噪声。",
group:"组别",pc:"规划 → 写码",time:"耗时",cost:"成本（美元）",otok:"Opus 输出",ctok:"写码输出",loc:"代码行数",chk:"检查清单",subj:"画面 / 手感 / 总评",
visual:"画面",feel:"手感",overall:"总评",
running:"进行中",play:"试玩",noplay:"暂不可玩",nogame:"暂无截图",inCab:"放进上方街机",more:"更多",sMin:"分钟",sCost:"成本",min:"分钟",lines:"行",
hMethod:"怎么跑的",hGrade:"评分方式",hOrig:"Reddit 原帖数据",
fGroups:"组别",fItems:"清单项",fRuns:"每组运行次数",fGraders:"盲评者",
hRaw:"原始材料",rawLead:"重跑或核对这个实验所需的全部材料。",
fDesc:"同一游戏的 AI 对照实验",updated:"更新于 ",
themeLight:"浅色主题",themeDark:"深色主题",themeSystem:"跟随系统主题",
m:["每组拿到完全相同的需求文本（experiment/requirement.md），没有额外提示。","每组都在全新的隔离会话里运行，互相看不到对方的成果。","25 项检查清单在评分前写好并冻结。","盲评：文件改名后再打分，评分者不知道哪个游戏出自哪个模型。","成本是按 API 标价折算的等价金额，由 experiment/stats.py 从会话记录算出，不是真实账单。","每组只跑了一次，结果有噪声，不要当成模型排名。"],
kinds:{"experiment/requirement.md":"需求原文","experiment/checklist.zh.md":"隐藏清单","experiment/b-opus-deepseek/spec.md":"Opus 的 spec","experiment/b-opus-deepseek/dsh-prompt.md":"DeepSeek 提示词","experiment/b-opus-deepseek/dsh.ndjson.gz":"会话记录","experiment/stats.py":"成本脚本"}}
};
var RAW=["experiment/requirement.md","experiment/checklist.zh.md","experiment/b-opus-deepseek/spec.md","experiment/b-opus-deepseek/dsh-prompt.md","experiment/b-opus-deepseek/dsh.ndjson.gz","experiment/stats.py"];
var D="—";
var root=document.documentElement;
var lang=(function(){var q=/[?&]lang=(en|zh)\b/.exec(location.search);if(q)return q[1];try{var s=localStorage.getItem("lang");if(s==="zh"||s==="en")return s}catch(e){}return /^zh/i.test(navigator.language||"")?"zh":"en"})();
var pref=root.getAttribute("data-pref")||"system";
var mq=window.matchMedia?matchMedia("(prefers-color-scheme: dark)"):null;
var DATA=null,shotIdx={},findIdx=0,cabId=null,dataRenders=0,io=null;
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;

function t(k){return I18N[lang][k]}
function $(id){return document.getElementById(id)}
function el(tag,cls,txt){var n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n}
function loc(o){return o?(o[lang]||o.en||""):""}
function G(g){return(g.id||"?").toUpperCase()}
function chip(g){return el("span","chip",G(g))}
function fmtTime(s){if(s==null)return D;return Math.floor(s/60)+":"+("0"+Math.round(s%60)).slice(-2)+" "+t("min")}
function fmtClock(s){if(s==null)return D;return Math.floor(s/60)+":"+("0"+Math.round(s%60)).slice(-2)}
function fmtCost(g){if(g.costRange)return"$"+g.costRange[0].toFixed(2)+"–"+g.costRange[1].toFixed(2);return g.costUSD==null?D:"$"+g.costUSD.toFixed(2)}
function fmtK(n){return n==null?D:(n===0?"0":(n/1000).toFixed(1)+"k")}
function fmtN(n){return n==null?D:n.toLocaleString("en-US")}
function fmtChk(g){return g.checklist==null?D:g.checklist+"/"+DATA.checklistTotal}
function fmtSubj(g){return g.scores?[g.scores.visual,g.scores.feel,g.scores.overall].join(" / "):D}
function best(vals,mode){var f=vals.filter(function(v){return v!=null});if(!f.length)return null;return mode==="min"?Math.min.apply(null,f):Math.max.apply(null,f)}
function badge(g){return g.status==="running"?el("span","badge",t("running")):null}
function finished(){return(DATA&&DATA.groups||[]).filter(function(g){return g.status!=="running"})}
function plain(n){return el("span",null,n)}

/* theme */
function applyTheme(){
var dark=pref==="dark"||(pref==="system"&&mq&&mq.matches);
root.setAttribute("data-theme",dark?"dark":"light");root.setAttribute("data-pref",pref);
document.querySelectorAll("#themeSeg button").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.p===pref))})}
if(mq){var onMq=function(){if(pref==="system")applyTheme()};if(mq.addEventListener)mq.addEventListener("change",onMq);else if(mq.addListener)mq.addListener(onMq)}
document.querySelectorAll("#themeSeg button").forEach(function(b){b.onclick=function(){pref=b.dataset.p;try{if(pref==="system")localStorage.removeItem("theme");else localStorage.setItem("theme",pref)}catch(e){}applyTheme()}});

/* reveal on scroll */
function reveal(){
var list=document.querySelectorAll("[data-rv]:not(.in)");
if(!list.length)return;
if(dataRenders>1||reduce||!("IntersectionObserver" in window)){list.forEach(function(n){n.classList.add("in")});return}
if(!io)io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12,rootMargin:"0px 0px -6% 0px"});
list.forEach(function(n){io.observe(n)})}
function stagger(box,sel){box.querySelectorAll(sel).forEach(function(n,i){n.setAttribute("data-rv","");n.style.setProperty("--i",Math.min(i,5))})}

/* cabinet */
function playable(){return(DATA&&DATA.groups||[]).filter(function(g){return g.play})}
function setCabinet(id,focus){
var g=(DATA&&DATA.groups||[]).filter(function(x){return x.id===id})[0];if(!g||!g.play)return;
cabId=id;
var old=$("cabFrame");
if(old.getAttribute("src")!==g.play){
var f=document.createElement("iframe");f.id="cabFrame";f.src=g.play;f.setAttribute("allow","autoplay; fullscreen");
old.parentNode.replaceChild(f,old)}
$("cabFrame").title=t("frameTitle")+G(g)+" – "+loc(g.label);
$("cabOpen").href=g.play;
document.querySelectorAll("#pick .pk").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.id===id))});
if(focus){var fr=$("cabFrame");try{fr.focus()}catch(e){}}}
function renderPick(){
var box=$("pick");box.textContent="";
playable().forEach(function(g){
var b=el("button","pk");b.type="button";b.dataset.id=g.id;b.setAttribute("aria-pressed","false");
b.appendChild(chip(g));
var s=el("span",null,loc(g.label));s.appendChild(el("em",null,fmtTime(g.seconds)+" · "+fmtCost(g)));b.appendChild(s);
b.onclick=function(){setCabinet(g.id,true)};box.appendChild(b)});
var first=playable()[0];
if(first&&!cabId)cabId=first.id;
if(cabId)setCabinet(cabId,false)}

/* findings */
var FINDS=[
{k:"fFast",v:function(g){return g.seconds},mode:"min",big:function(g){return fmtTime(g.seconds).replace(" "+t("min"),"")},unit:function(){return t("fU_min")},lab:function(g){return fmtTime(g.seconds)}},
{k:"fCheap",v:function(g){return g.costUSD},mode:"min",big:function(g){return"$"+g.costUSD.toFixed(2)},unit:function(g){return g.costRange?fmtCost(g):""},lab:fmtCost},
{k:"fScore",v:function(g){return g.scores&&g.scores.overall},mode:"max",big:function(g){return String(g.scores.overall)},unit:function(){return t("fU_score")},lab:function(g){return String(g.scores.overall)}},
{k:"fVisual",v:function(g){return g.scores&&g.scores.visual},mode:"max",big:function(g){return String(g.scores.visual)},unit:function(){return t("fU_score")},lab:function(g){return String(g.scores.visual)}}];
function renderFindings(){
var sec=$("findings"),fin=finished();
var avail=FINDS.filter(function(f){return fin.some(function(g){return f.v(g)!=null})});
sec.hidden=!avail.length;if(!avail.length)return;
if(findIdx>=avail.length)findIdx=0;
var pk=$("finds");pk.textContent="";
avail.forEach(function(f,i){var wv=best(fin.map(f.v),f.mode),w=fin.filter(function(g){return f.v(g)===wv});
var b=el("button","pill");b.type="button";b.setAttribute("aria-pressed",String(i===findIdx));
b.appendChild(el("span",null,t(f.k)));b.appendChild(el("span","pv",w.map(G).join(", ")+" · "+f.lab(w[0])));
b.onclick=function(){findIdx=i;renderFindings()};pk.appendChild(b)});
var f=avail[findIdx],bv=best(fin.map(f.v),f.mode);
var ws=fin.filter(function(g){return f.v(g)===bv});
var big=$("figBig");big.textContent=f.big(ws[0]);var u=f.unit(ws[0]);if(u)big.appendChild(el("small",null,u));
var cl=$("figClaim");cl.textContent="";
ws.forEach(function(g){var s=el("span");s.appendChild(chip(g));s.appendChild(document.createTextNode(loc(g.label)));cl.appendChild(s)});
var max=Math.max.apply(null,fin.map(function(g){return f.v(g)||0}))||1;
var bars=$("bars");bars.textContent="";
(DATA.groups||[]).forEach(function(g){
var v=f.v(g);if(g.status==="running"||v==null)return;
var c=el("div","col"+(ws.indexOf(g)>-1?" win":""));c.setAttribute("role","listitem");
c.style.setProperty("--r",(v/max).toFixed(4));
c.setAttribute("aria-label",G(g)+" "+loc(g.label)+": "+f.lab(g));
c.appendChild(el("div","val",f.lab(g)));
var b=el("div","bar");b.appendChild(el("span","ltr",G(g)));b.appendChild(el("span","nmx",loc(g.label)));c.appendChild(b);
bars.appendChild(c)});
var miss=fin.filter(function(g){return g.checklist!=null&&g.checklist<DATA.checklistTotal});
$("ftnote").textContent=miss.length?t("ftMiss")+miss.map(function(g){return G(g)+" "+fmtChk(g)}).join(", ")+".":t("ftAll")}

/* table */
function renderTable(){
var tb=$("tbl");tb.textContent="";
var gs=DATA.groups,done=finished();
var cols=[
{h:"group"},{h:"pc"},
{h:"time",v:function(g){return g.seconds},f:function(g){return fmtTime(g.seconds)},m:"min"},
{h:"cost",v:function(g){return g.costUSD},f:fmtCost,m:"min"},
{h:"otok",f:function(g){return fmtK(g.opusOutputTokens)}},
{h:"ctok",f:function(g){return fmtK(g.coderOutputTokens)}},
{h:"loc",f:function(g){return fmtN(g.lines)}},
{h:"chk",v:function(g){return g.checklist},f:fmtChk,m:"max"},
{h:"subj",v:function(g){return g.scores&&g.scores.overall},f:fmtSubj,m:"max"}];
var tr=el("tr");cols.forEach(function(c){var th=el("th",null,t(c.h));th.scope="col";tr.appendChild(th)});tb.appendChild(el("thead")).appendChild(tr);
var body=el("tbody");
var bests=cols.map(function(c){return c.m?best(done.map(c.v),c.m):null});
gs.forEach(function(g){
var r=el("tr",g.status==="running"?"run":"");
var n=el("td","name");n.appendChild(chip(g));n.appendChild(document.createTextNode(loc(g.label)));var b=badge(g);if(b)n.appendChild(b);r.appendChild(n);
r.appendChild(el("td","pc",(g.planner||D)+" → "+(g.coder||D)));
cols.slice(2).forEach(function(c,i){var td=el("td",null,c.f(g));td.setAttribute("data-l",t(c.h));var v=c.v&&c.v(g);if(c.m&&v!=null&&g.status!=="running"&&v===bests[i+2])td.className="best";r.appendChild(td)});
body.appendChild(r)});
tb.appendChild(body)}

/* cards */
function showShot(g,i,card){
var sc=g.screens||[];shotIdx[g.id]=i;
var im=card.querySelector(".shot img");if(im){im.src=sc[i];im.alt=G(g)+" – "+loc(g.label)+" "+(i+1)+"/"+sc.length}
card.querySelectorAll(".thumbs button").forEach(function(b,j){if(j===i)b.setAttribute("aria-current","true");else b.removeAttribute("aria-current")})}
function vals(cls,pairs){var d=el("div","vals"+cls);pairs.forEach(function(x){var s=el("div");s.appendChild(el("b",null,x[0]));s.appendChild(el("span",null,x[1]));d.appendChild(s)});return d}
function renderCards(){
var box=$("cards");box.textContent="";
DATA.groups.forEach(function(g){
var c=el("article","card");
var sc=g.screens||[];
if(sc.length){
var sh=el("button","shot");sh.type="button";sh.setAttribute("aria-label",G(g)+" – "+loc(g.label));
var im=el("img");im.loading="lazy";im.width=1000;im.height=660;sh.appendChild(im);sh.onclick=function(){showShot(g,((shotIdx[g.id]||0)+1)%sc.length,c)};c.appendChild(sh)}
else c.appendChild(el("div","shot",g.status==="running"?t("running"):t("nogame")));
var st=el("div","strip");
var h=el("h3");h.appendChild(chip(g));h.appendChild(document.createTextNode(loc(g.label)));var bd=badge(g);if(bd)h.appendChild(bd);st.appendChild(h);
if(g.planner||g.coder)st.appendChild(el("div","pc2",(g.planner||D)+" → "+(g.coder||D)));
st.appendChild(vals("",[[fmtClock(g.seconds),t("sMin")],[fmtCost(g),t("sCost")],[fmtChk(g),t("chk")]].concat(g.scores?[[String(g.scores.overall),t("overall")]]:[])));
if(g.notes)st.appendChild(el("p",null,loc(g.notes)));
if(g.setup||g.scores){var dt=el("details","more");dt.appendChild(el("summary",null,t("more")));
if(g.setup)dt.appendChild(el("p",null,loc(g.setup)));
dt.appendChild(vals("",[[fmtN(g.lines),t("loc")]].concat(g.scores?[[String(g.scores.visual),t("visual")],[String(g.scores.feel),t("feel")]]:[])));
st.appendChild(dt)}
if(sc.length>1){var th=el("div","thumbs");sc.forEach(function(s,j){var bt=el("button");bt.type="button";bt.setAttribute("aria-label",G(g)+" "+(j+1)+"/"+sc.length);var ti=el("img");ti.src=s;ti.alt="";ti.decoding="async";ti.setAttribute("fetchpriority","low");ti.width=64;ti.height=42;bt.appendChild(ti);bt.onclick=function(){showShot(g,j,c)};th.appendChild(bt)});st.appendChild(th)}
var bb=el("div","cbtns");
if(g.play){var a=el("a","play",t("play"));a.href=g.play;bb.appendChild(a);
var lb=el("button","linkbtn",t("inCab"));lb.type="button";lb.onclick=function(){setCabinet(g.id,true);$("top").scrollIntoView({behavior:reduce?"auto":"smooth"})};bb.appendChild(lb)}
else bb.appendChild(el("span",null,t("noplay")));
st.appendChild(bb);
c.appendChild(st);box.appendChild(c);
if(sc.length)showShot(g,shotIdx[g.id]||0,c)});
stagger(box,".card")}

/* method + raw */
function renderMethod(){
var fa=$("facts");fa.textContent="";
[[t("fGroups"),String(DATA.groups.length)],[t("fItems"),String(DATA.checklistTotal||D)],[t("fRuns"),"1"],[t("fGraders"),"1"]].forEach(function(x){var d=el("div");d.setAttribute("data-rv","");d.appendChild(el("span",null,x[0]));d.appendChild(el("b",null,x[1]));fa.appendChild(d)});
var m=$("mlist");m.textContent="";t("m").forEach(function(s){var li=el("li",null,s);li.setAttribute("data-rv","");m.appendChild(li)});
$("grading").textContent=loc(DATA.grading);$("origIn").textContent=loc(DATA.original);}
function renderRaw(){
var r=$("rawList");r.textContent="";
RAW.forEach(function(p){var li=el("li");li.setAttribute("data-rv","");var a=el("a");a.href=p;var n=el("span","nm");n.appendChild(el("i"));n.appendChild(plain(p));a.appendChild(n);a.appendChild(el("span","kind",t("kinds")[p]||""));li.appendChild(a);r.appendChild(li)});
stagger(r,"li")}

function renderStatic(){
root.lang=lang==="zh"?"zh-CN":"en";
document.title=lang==="zh"?"同一个打砖块，五种做法":"Same Breakout game, built 5 ways";
document.querySelectorAll("[data-t]").forEach(function(n){var v=t(n.getAttribute("data-t"));if(v!=null)n.textContent=v});
["h1a","h1b","sub","cta"].forEach(function(k){$(k).textContent=t(k)});
$("lReddit").textContent=t("reddit");$("lRepo").textContent=t("repo");
$("hRes1").textContent=t("hRes1");$("hRes2").textContent=t("hRes2");
$("cabOpen").textContent=t("cabOpen");$("cabHint").textContent=t("cabHint");$("pick").setAttribute("aria-label",t("cabAria"));$("finds").setAttribute("aria-label",t("metricAria"));
$("fDesc").textContent=t("fDesc");
$("tblreg").setAttribute("aria-label",t("hRes1")+" "+t("hRes2"));
var nav=$("nav");nav.textContent="";
[["#findings","navFind"],["#games","navGames"],["#method","navMethod"],["#raw","navRaw"]].forEach(function(x){var a=el("a",null,t(x[1]));a.href=x[0];nav.appendChild(a)});
var fl=$("fLinks");fl.textContent="";
[[t("reddit"),DATA&&DATA.inspiration||$("lReddit").href],[t("repo"),DATA&&DATA.repo||$("lRepo").href]].forEach(function(x){var a=el("a",null,x[0]);a.href=x[1];a.target="_blank";a.rel="noopener";fl.appendChild(a)});
document.querySelectorAll("#langSeg button").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.l===lang))});
document.querySelectorAll("#themeSeg button").forEach(function(b){var k={light:"themeLight",dark:"themeDark",system:"themeSystem"}[b.dataset.p];b.setAttribute("aria-label",t(k));b.title=t(k)});
applyTheme();
if(DATA){
dataRenders++;
if(DATA.inspiration)$("lReddit").href=DATA.inspiration;if(DATA.repo)$("lRepo").href=DATA.repo;
$("upd").textContent=DATA.updated?t("updated")+DATA.updated:"";
renderPick();renderFindings();renderTable();renderCards();renderMethod();renderRaw();
reveal()}}
document.querySelectorAll("#langSeg button").forEach(function(b){b.onclick=function(){lang=b.dataset.l;try{localStorage.setItem("lang",lang)}catch(e){}renderStatic()}});
renderStatic();
fetch("data/results.json").then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(j){DATA=j;if(!DATA.groups)DATA.groups=[];renderStatic()}).catch(function(e){var d=$("err");d.className="err";d.textContent="Failed to load data/results.json: "+e.message});
reveal();
})();
