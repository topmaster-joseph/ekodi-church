import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const runtime=readFileSync(new URL('../church-public-updates.js',import.meta.url),'utf8');
const shared=readFileSync(new URL('../church-shared-schedules.js',import.meta.url),'utf8');
const html='<html lang="ko"><head><meta charset="utf-8"></head><body>'
  +'<div data-church-notices data-limit="3"></div>'
  +'<button data-church-inline-manage="notices" hidden>공지사항 바로 관리</button>'
  +'<button data-church-inline-manage="schedule" hidden>일정 바로 관리</button>'
  +'<div data-church-shared-schedules data-limit="3"><ol data-church-schedules-list></ol></div>'
  +'<section data-church-public-manage data-church-home-manage hidden><div data-church-schedule data-limit="100" hidden></div></section>'
  +'<script src="/ekodichurch/church-shared-schedules.js"></script>'
  +'<script src="/ekodichurch/church-public-updates.js"></script></body></html>';
async function boot(page,authorized){
  await page.route('https://ekodi.kr/ekodichurch/',route=>route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html}));
  await page.route('https://ekodi.kr/ekodichurch/church-public-updates.js',route=>route.fulfill({status:200,contentType:'application/javascript; charset=utf-8',body:runtime}));
  await page.route('https://ekodi.kr/ekodichurch/church-shared-schedules.js',route=>route.fulfill({status:200,contentType:'application/javascript; charset=utf-8',body:shared}));
  await page.addInitScript(({authorized})=>{
    if(authorized)localStorage.setItem('sb-renzehysxirjilvdxacv-auth-token',JSON.stringify({currentSession:{access_token:'fixture-token'}}));
    window.__records=[{id:1,title:'기존 공지',body:'기존 내용',categoryId:'notice',createdAt:'2026-11-22T00:00:00Z'}];
    window.__mutations=[];
    window.__canManage=authorized;
    window.fetch=async(input,options={})=>{
      const path=new URL(String(input),location.href).pathname;
      const method=(options.method||'GET').toUpperCase();
      const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
      if(path.endsWith('/board/api/me'))return response({authenticated:window.__canManage,manage:window.__canManage,role:window.__canManage?'admin':'member'});
      if(path.endsWith('/board/api/posts')&&method==='GET')return response({ok:true,items:window.__records});
      if(path.endsWith('/board/api/categories'))return response({items:[{category_id:'notice'},{category_id:'schedule'}]});
      if(path.includes('/board/api/posts')&&method!=='GET'){
        if(!window.__canManage)return response({error:'forbidden'},403);
        const data=JSON.parse(options.body||'{}');
        window.__mutations.push({path,method,data});
        if(method==='POST')window.__records.push({id:10+window.__mutations.length,...data,createdAt:'2026-11-22T00:00:00Z'});
        if(method==='PATCH')Object.assign(window.__records.find(x=>x.id===Number(path.split('/').pop())),data);
        if(method==='DELETE')window.__records=window.__records.filter(x=>x.id!==Number(path.split('/').pop()));
        return response({ok:true});
      }
      if(path.endsWith('/board/api/shared-schedules'))return response({ok:true,mode:'published-read-only',items:[
        {source:'ekodimission',id:81,date:'2026-12-09',time:'11:00',kind:'event',title:'선교회 일정',venue:'선교회',url:'/ekodimission#schedule'}]});
      if(path.endsWith('/board/api/saturday'))return response({meeting:null});
      if(path.includes('church_worship_materials'))return response([]);
      return response({},404);
    };
  },{authorized});
  await page.goto('https://ekodi.kr/ekodichurch/');
}
test('guest remains read-only',async({page})=>{
  await boot(page,false);
  await expect(page.getByText('기존 공지')).toBeVisible();
  await expect(page.locator('[data-church-inline-manage="notices"]')).toBeHidden();
  await expect(page.locator('[data-church-inline-manage="schedule"]')).toBeHidden();
  await expect(page.locator('[data-church-home-manage]')).toBeHidden();
});
test('manager creates notice and loses editor on logout',async({page})=>{
  await boot(page,true);
  const toggle=page.locator('[data-church-inline-manage="notices"]');
  await expect(toggle).toBeVisible();
  await toggle.click();
  const form=page.locator('[data-church-home-manage] form');
  await form.locator('[name="title"]').fill('새 공지');
  await form.locator('[name="body"]').fill('새 내용');
  await form.locator('button[type="submit"]').click();
  await expect(page.getByText('새 공지').first()).toBeVisible();
  const mutations=await page.evaluate(()=>window.__mutations);
  expect(mutations.some(x=>x.method==='POST'&&x.data.categoryId==='notice')).toBeTruthy();
  await expect(form.locator('.church-public-delete')).toBeHidden();
  const row=page.locator('[data-church-manage-notices] .church-public-item').filter({hasText:'새 공지'});
  await row.getByRole('button',{name:'수정'}).click();
  await expect(form.locator('.church-public-delete')).toBeVisible();
  await form.locator('[name="title"]').fill('새 공지 수정');
  await form.locator('button[type="submit"]').click();
  await expect.poll(()=>page.evaluate(()=>window.__mutations.some(x=>x.method==='PATCH'))).toBeTruthy();
  await page.locator('[data-church-manage-notices] .church-public-item').filter({hasText:'새 공지 수정'}).getByRole('button',{name:'수정'}).click();
  page.on('dialog',dialog=>dialog.accept());
  await form.locator('.church-public-delete').click();
  await expect.poll(()=>page.evaluate(()=>window.__mutations.some(x=>x.method==='DELETE'))).toBeTruthy();
  await page.evaluate(()=>{window.__canManage=false;window.dispatchEvent(new Event('focus'));});
  await expect(toggle).toBeHidden();
  await page.evaluate(()=>window.dispatchEvent(new Event('ekodi:auth-logout')));
  await expect(toggle).toBeHidden();
});
test('manager creates own schedule without writing Mission records',async({page})=>{
  await boot(page,true);
  const toggle=page.locator('[data-church-inline-manage="schedule"]');
  await expect(toggle).toBeVisible();
  await toggle.click();
  const form=page.locator('[data-church-home-manage] form');
  await form.locator('[name="title"]').fill('교회 행사');
  await form.locator('[name="date"]').fill('2026-12-10');
  await form.locator('[name="time"]').fill('10:00');
  await form.locator('[name="venue"]').fill('예배실');
  await form.locator('[name="body"]').fill('준비모임');
  await form.locator('button[type="submit"]').click();
  await expect.poll(()=>page.evaluate(()=>window.__mutations.some(x=>x.method==='POST'&&x.data.categoryId==='schedule'))).toBeTruthy();
  const mutations=await page.evaluate(()=>window.__mutations);
  const saved=mutations.find(x=>x.method==='POST'&&x.data.categoryId==='schedule');
  expect(JSON.parse(saved.data.body)).toMatchObject({date:'2026-12-10',time:'10:00',venue:'예배실'});
  expect(mutations.some(x=>x.path.includes('ekodimission'))).toBeFalsy();
});