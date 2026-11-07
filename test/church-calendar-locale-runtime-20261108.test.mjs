import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../church-shared-schedules.js',import.meta.url),'utf8');
const fixtures=[
  {id:1,source:'ekodichurch',sourceLabel:'에코디교회',date:'2026-11-15',time:'11:00',title:'주일모임',venue:'목포 평화광장',url:'/ekodichurch/board/post/1',kind:'recurring-meeting'},
  {id:2,source:'ekodimission',sourceLabel:'에코디선교회',date:'2026-11-14',time:'17:00',title:'토요 성경토론과 함께하는 식사',venue:'에코디교회',url:'/ekodimission?meeting=2026-11-14#saturday',kind:'recurring-meeting'}
];
const make=(tag)=>{
  const node={tag,tagName:tag.toUpperCase(),textContent:'',className:'',href:'',children:[],attrs:{},classList:{add(){}},
    append(...items){this.children.push(...items)},
    replaceChildren(...items){this.children=[...items]},
    setAttribute(name,value){this.attrs[name]=String(value)}
  };
  return node;
};
async function render(language){
  const list=make('ol');
  const root={dataset:{limit:'3'},querySelector:sel=>sel==='[data-church-schedules-list]'?list:null};
  const listeners={};
  const document={
    hidden:false,documentElement:{lang:language},
    querySelector:sel=>sel==='[data-church-shared-schedules]'?root:null,
    createElement:make,addEventListener(name,callback){listeners['document:'+name]=callback}
  };
  const window={addEventListener(name,callback){listeners['window:'+name]=callback},
    EKODIChurchI18n:{getLocale:()=>language}};
  const location={search:'?lang='+encodeURIComponent(language)};
  const mockFetch=async()=>({ok:true,json:async()=>({ok:true,mode:'published-read-only',items:fixtures})});
  const context=vm.createContext({document,window,location,fetch:mockFetch,Intl,Date,URLSearchParams,Object,Number,String,Math,RegExp,
    AbortSignal,setInterval:()=>100,clearInterval:()=>{},console});
  vm.runInContext(source,context,{timeout:1500});
  await new Promise(resolve=>setImmediate(resolve));
  await new Promise(resolve=>setImmediate(resolve));
  const textContent=node=>[node.textContent,...(node.children||[]).map(textContent)].join(' ');
  return {list,allText:textContent(list),listeners,location};
}
test('all nine calendar locales render origins and original links without leaking untranslated titles',async()=>{
  const langs=['ko-KR','en','zh-CN','ja','my','kac','vi','mn','id'];
  for(const lang of langs){
    const out=await render(lang);
    assert.equal(out.list.children.length,2,'public row count in '+lang);
    assert.ok(out.allText.trim().length>15,'nonempty rows in '+lang);
    if(lang==='ko-KR'){
      const badges=out.list.children.map(row=>row.children.find(child=>child.className?.includes('church-schedule-origin')));
      assert.deepEqual(badges.map(node=>node?.textContent),['교회','선교회'],'short visible source labels');
      assert.deepEqual(badges.map(node=>node?.attrs['aria-label']),['교회 일정','선교회 일정'],'full accessible source labels');
      assert.match(out.allText,/토요 성경토론과 함께하는 식사/);
    }else{
      assert.doesNotMatch(out.allText,/[가-힣]/,'no untranslated Korean in '+lang);
    }
    const links=out.list.children.map(row=>row.children.find(child=>child.tag==='a')?.href);
    assert.deepEqual(links,['/ekodimission?meeting=2026-11-14#saturday','/ekodichurch/board/post/1'],'source links preserved '+lang);
  }
});
test('public renderer never inserts HTML, writes another board or emits original author body',async()=>{
  const out=await render('en');
  assert.equal(out.list.children.length,2);
  assert.doesNotMatch(source,/innerHTML|eval\(|fetch\([^]*method:['"](?:POST|PATCH|DELETE)/);
  assert.ok(out.list.children.every(row=>row.children.some(child=>child.tag==='a')));
  assert.ok(out.listeners['window:ekodi:locale-change']);
});
