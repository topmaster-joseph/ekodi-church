import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const file=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('Church homepage offers in-place notice and event management only after role verification',()=>{
  const home=file('index.html'),ui=file('church-public-updates.js'),css=file('church-home-content-editor.css');
  assert.match(home,/data-church-inline-manage="notices"[^>]*hidden/);
  assert.match(home,/data-church-inline-manage="schedule"[^>]*hidden/);
  assert.match(home,/data-church-home-manage hidden/);
  assert.match(home,/data-church-schedule data-limit="100" hidden/);
  assert.match(home,/href="church-home-content-editor\.css"/);
  assert.match(ui,/result\.authenticated!==true\|\|result\.manage!==true/);
  assert.match(ui,/owner','admin','moderator/);
  assert.match(ui,/function revokeEditor\(/);
  assert.match(ui,/data-church-inline-manage/);
  assert.match(ui,/data-church-home-manage/);
  assert.match(css,/church-home-manage-toggle/);
});
test('Editing remains board-only and shared Mission data stays immutable',()=>{
  const ui=file('church-public-updates.js'),shared=file('church-shared-schedules.js');
  assert.match(ui,/const BASE='\/ekodichurch\/board\/api'/);
  assert.match(ui,/categoryId:kind==='notices'\?'notice':'schedule'/);
  assert.match(ui,/managingHome\?allPosts\.map\(parseSchedulePost\)/);
  assert.match(ui,/source==='board'/);
  assert.match(ui,/document\.addEventListener\('church:public-content-updated'/);
  assert.match(shared,/document\.addEventListener\('church:public-content-updated'/);
  assert.match(shared,/mode!=='published-read-only'/);
  assert.doesNotMatch(shared,/\bPOST\b|\bPATCH\b|\bDELETE\b|innerHTML/);
  assert.doesNotMatch(ui,/innerHTML\s*=|eval\(|new Function\(/);
});
