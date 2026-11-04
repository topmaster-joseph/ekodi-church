import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 390, height: 844 },
  permissions: ['camera', 'microphone']
});

test('virtual broadcaster -> virtual viewer delivers synthetic camera/audio over WebRTC', async ({ page }) => {
  await page.goto('about:blank');
  const result = await page.evaluate(async () => {
    const canvas=document.createElement('canvas');
    canvas.width=360; canvas.height=640;
    const ctx=canvas.getContext('2d');
    let frame=0;
    const timer=setInterval(()=>{
      frame++;
      ctx.fillStyle='#000';ctx.fillRect(0,0,360,640);
      ctx.fillStyle='#fff';
      ctx.fillRect(0,0,28,28);ctx.fillRect(332,0,28,28);
      ctx.fillRect(0,612,28,28);ctx.fillRect(332,612,28,28);
      ctx.font='28px sans-serif';ctx.fillText(String(frame),145,330);
    },33);
    const videoStream=canvas.captureStream(30);
    const audioCtx=new AudioContext();
    const osc=audioCtx.createOscillator();
    const gain=audioCtx.createGain();
    const dest=audioCtx.createMediaStreamDestination();
    gain.gain.value=.05;osc.frequency.value=440;osc.connect(gain).connect(dest);osc.start();
    const source=new MediaStream([...videoStream.getVideoTracks(),...dest.stream.getAudioTracks()]);
    const broadcaster=new RTCPeerConnection();
    const viewer=new RTCPeerConnection();
    broadcaster.onicecandidate=e=>e.candidate&&viewer.addIceCandidate(e.candidate);
    viewer.onicecandidate=e=>e.candidate&&broadcaster.addIceCandidate(e.candidate);
    const received=new MediaStream();
    viewer.ontrack=e=>received.addTrack(e.track);
    source.getTracks().forEach(track=>broadcaster.addTrack(track,source));
    await broadcaster.setLocalDescription(await broadcaster.createOffer());
    await viewer.setRemoteDescription(broadcaster.localDescription);
    await viewer.setLocalDescription(await viewer.createAnswer());
    await broadcaster.setRemoteDescription(viewer.localDescription);
    const deadline=Date.now()+5000;
    while(Date.now()<deadline && received.getTracks().length<2) await new Promise(r=>setTimeout(r,50));
    const video=document.createElement('video');video.muted=true;video.autoplay=true;video.playsInline=true;video.srcObject=received;document.body.append(video);
    await video.play();
    while(Date.now()<deadline && (!video.videoWidth||video.readyState<2)) await new Promise(r=>setTimeout(r,50));
    const out={tracks:received.getTracks().map(t=>({kind:t.kind,state:t.readyState})),width:video.videoWidth,height:video.videoHeight};
    clearInterval(timer);osc.stop();source.getTracks().forEach(t=>t.stop());broadcaster.close();viewer.close();await audioCtx.close();
    return out;
  });
  expect(result.tracks.filter(t=>t.state==='live').map(t=>t.kind).sort()).toEqual(['audio','video']);
  expect(result.width).toBe(360);
  expect(result.height).toBe(640);
});

test('production live surface exposes required System Verified controls', async ({ page }) => {
  const response=await page.goto('https://ekodi.kr/ekodichurch/live/',{waitUntil:'domcontentloaded'});
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('#hostButton')).toBeAttached();
  await expect(page.locator('#presentationFileInput')).not.toHaveAttribute('accept', /.+/);
  await expect(page.locator('[data-share-mode="screen"]')).toBeAttached();
  await expect(page.locator('[data-share-mode="window"]')).toBeAttached();
  await expect(page.locator('[data-share-mode="tab"]')).toBeAttached();
  await expect(page.locator('[data-layout="pip"]')).toBeAttached();
  await expect(page.locator('[data-layout="side"]')).toBeAttached();
  await expect(page.locator('[data-layout="equal"]')).toBeAttached();
  await expect(page.locator('[data-layout="screen"]')).toBeAttached();
});


test('Church Live shared header/footer and intro remain centered across mobile and desktop widths', async ({ browser }) => {
  const { readFile } = await import('node:fs/promises');
  const fixture = new URL('../', import.meta.url);
  const fake = 'https://live.ekodi.test/ekodichurch/live/';
  const routes = new Map([
    ['/ekodichurch/live/', 'live/index.html'],
    ['/ekodichurch/live/live.css', 'live/live.css'],
    ['/ekodichurch/live/worship-materials.css', 'live/worship-materials.css'],
    ['/ekodichurch/live/church-live-layout.css', 'live/church-live-layout.css'],
    ['/ekodichurch/live/church-live-shell.js', 'live/church-live-shell.js'],
    ['/ekodichurch/church-footer.css', 'church-footer.css'],
    ['/ekodichurch/church-daily-verse.js', 'church-daily-verse.js'],
  ]);
  for (const width of [320, 390, 768, 1366, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'live.ekodi.test') return route.abort();
      const path = routes.get(url.pathname);
      if (!path) return route.abort();
      const type = path.endsWith('.css') ? 'text/css' : path.endsWith('.js') ? 'application/javascript' : 'text/html';
      return route.fulfill({ status: 200, contentType: type, body: await readFile(new URL(path, fixture), 'utf8') });
    });
    const page = await context.newPage();
    await page.goto(fake, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.site-header .brand')).toBeVisible();
    await expect(page.locator('footer.site-footer.church-footer')).toBeAttached();
    await expect(page.locator('#hostButton')).toBeVisible();
    await expect(page.locator('#joinButton')).toBeVisible();
    const geometry = await page.evaluate(() => {
      const rect = sel => {
        const b = document.querySelector(sel).getBoundingClientRect();
        return { x: b.x, width: b.width, mid: b.x + b.width / 2 };
      };
      return {
        viewport: window.innerWidth,
        scroll: document.documentElement.scrollWidth,
        banner: rect('.live-page-banner-inner'),
        intro: rect('.live-intro'),
        actions: rect('.entry-actions'),
        shell: rect('.live-shell'),
        footer: rect('.church-footer-inner'),
      };
    });
    expect(geometry.scroll, 'horizontal overflow at ' + width).toBeLessThanOrEqual(width + 1);
    for (const item of ['banner', 'intro', 'actions', 'shell', 'footer']) {
      expect(Math.abs(geometry[item].mid - geometry.viewport / 2), item + ' not centered at ' + width).toBeLessThan(3);
    }
    expect(geometry.shell.width).toBeLessThanOrEqual(1120);
    if (width <= 768) {
      const toggle = page.locator('.menu-button');
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('#main-nav')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    }
    await context.close();
  }
});
