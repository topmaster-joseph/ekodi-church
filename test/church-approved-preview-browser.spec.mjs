import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const origin='https://church-layout.ekodi.test/ekodichurch/';
const root=new URL('../',import.meta.url);
const types={html:'text/html',css:'text/css',js:'application/javascript',json:'application/json'};
test.describe('approved Church first view in isolated first-party Chromium',()=>{
  for(const device of [{name:'mobile',width:390,height:844},{name:'desktop',width:1440,height:900}]){
    test(device.name+' four-entry overview -> worship -> secondary menus',async({browser})=>{
      const context=await browser.newContext({viewport:{width:device.width,height:device.height}});
      await context.route('**/*',async route=>{
        const url=new URL(route.request().url());
        if(url.origin!==new URL(origin).origin||!url.pathname.startsWith('/ekodichurch/')){
          await route.abort();return;
        }
        const rel=url.pathname.slice('/ekodichurch/'.length)||'index.html';
        if(!/^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+$/.test(rel)||rel.startsWith('.')){
          await route.fulfill({status:404,body:'Not Found'});return;
        }
        try{
          const body=await readFile(new URL(rel,root));
          const ext=rel.split('.').pop();
          await route.fulfill({status:200,contentType:types[ext]||'application/octet-stream',body});
        }catch{await route.fulfill({status:404,body:'Not Found'});}
      });
      const page=await context.newPage();
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      const visible=page.locator('.hero .overview-grid:not(.church-overview-secondary) > a');
      await expect(visible).toHaveCount(4);
      for(const href of ['#life-hub','#weekly-worship','#community','#online']){
        await expect(page.locator('.hero .overview-grid:not(.church-overview-secondary) > a[href="'+href+'"]')).toHaveCount(1);
      }
      const more=page.locator('details.church-more-menu');
      await expect(more).not.toHaveAttribute('open');
      await more.locator('summary').click();
      await expect(more).toHaveAttribute('open','');
      await expect(more.locator('a')).toHaveCount(4);
      const first=await page.locator('.hero').boundingBox();
      await page.locator('.hero .overview-grid:not(.church-overview-secondary) > a[href="#weekly-worship"]').click();
      await expect(page).toHaveURL(/#weekly-worship$/);
      const after=await page.locator('.hero').boundingBox();
      expect(after.height).toBeLessThan(first.height);
      await expect(page.locator('[data-weekly-bulletin]')).toBeVisible();
      await expect(page.locator('[data-weekly-slides]')).toBeVisible();
      await expect(page.locator('[data-weekly-live-host]')).toBeVisible();
      await expect(page.locator('[data-church-worship-admin]')).toBeHidden();
      await expect(page.locator('[data-weekly-editor]')).toBeHidden();
      const tools=page.locator('details.church-weekly-extras');
      await expect(tools).not.toHaveAttribute('open');
      await tools.locator('summary').click();
      await expect(tools).toHaveAttribute('open','');
      await expect(page.locator('[data-weekly-broadcast]')).toBeVisible();
      const result=await page.evaluate(()=>{
        const root=document.querySelector('[data-church-weekly]').getBoundingClientRect();
        return {width:innerWidth,left:root.left,right:root.right};
      });
      expect(result.left).toBeGreaterThanOrEqual(-2);
      expect(result.right).toBeLessThanOrEqual(result.width+2);
      await page.screenshot({path:'test-results/church-home-'+device.name+'.png',fullPage:true});
      await context.close();
    });
  }
});
