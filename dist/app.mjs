const $=s=>document.querySelector(s);
const icons={shield:'<path d="M12 3 3 6v5c0 5 9 10 9 10s9-5 9-10V6z"/><path d="m8 12 3 3 5-6"/>',scan:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5M7 12h10"/>',book:'<path d="M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3zM12 6v15"/>',link:'<path d="m10 14 4-4m-6 6-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 10a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-1 1" transform="translate(1 -1) scale(.95)"/>',globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16"/>',download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',compare:'<path d="M4 7h15m-3-3 3 3-3 3M20 17H5m3-3-3 3 3 3"/>',arrow:'<path d="M3 12h17m-5-5 5 5-5 5"/>',copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',fingerprint:'<path d="M5 16v-5a7 7 0 0 1 14 0v4m-3 3v-7a4 4 0 0 0-8 0v5l-2 4m6-9v7l-2 4m9-4-2 4M3 12V9"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',alert:'<path d="m12 3 10 18H2zM12 9v5m0 3v1"/>'};
const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.scan}</svg>`;
function fillIcons(){document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));}fillIcons();
// All values from untrusted URLs are escaped before entering HTML. No target
// URL is fetched, opened, or turned into a clickable link.
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let analyze,current=null,selected=null,timer,toastTimer;
const charLevel=c=>c.hidden||c.lookalike?'danger':c.nonAscii?'warning':'safe';
const displayChar=c=>c.hidden?'◌':c.char===' '?'␠':c.char;
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2500);}
function renderCharacters(){if(!current)return;const list=current.details.map(c=>({...c,origin:'domain',key:'d'+c.index}));
 // Add submitted evidence that IDNA removed/mapped, including hidden characters.
 if(current.normalizationChanged)for(const c of current.originalDetails){if((c.hidden||c.nonAscii)&&!current.details.some(d=>d.cp===c.cp))list.push({...c,origin:'input',key:'o'+c.index});}
 const visible=$('#suspicious-only').checked?list.filter(c=>c.nonAscii||c.hidden):list;
 $('#char-count').textContent=`${current.details.length} ký tự · ${current.scripts.join(', ')}`;
 $('#character-strip').innerHTML=visible.map(c=>`<button type="button" class="char-tile ${charLevel(c)} ${selected===c.key?'selected':''}" data-char="${c.key}" aria-label="${esc(c.hex+' '+c.name)}" aria-pressed="${selected===c.key}" title="${esc(c.name)}"><bdi>${esc(displayChar(c))}</bdi><small>${esc(c.hex.slice(2))}</small></button>`).join('');
 $('#character-table').innerHTML=visible.map(c=>`<tr id="row-${c.key}" class="${charLevel(c)} ${selected===c.key?'selected':''}"><td><bdi>${esc(displayChar(c))}</bdi></td><td><code>${esc(c.hex)}</code></td><td>${esc(c.name)}${c.origin==='input'?'<span class="muted"> · đầu vào gốc</span>':''}</td><td><span class="script-pill">${esc(c.script)}</span></td><td><span class="status-tag ${charLevel(c)}">${c.hidden?'Ký tự ẩn / điều khiển':c.lookalike?'Giống '+esc(c.similar):c.nonAscii?'Ngoài ASCII':'ASCII hợp lệ'}</span></td></tr>`).join('')||'<tr><td colspan="5" style="font:12px inherit;color:#8193a9">Không có ký tự bất thường.</td></tr>';
 $('#character-strip').querySelectorAll('[data-char]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.char;renderCharacters();$('#row-'+selected)?.scrollIntoView({block:'nearest',behavior:'smooth'});}));
}
function render(r){current=r;$('#results').hidden=!r;$('#empty').hidden=!!r;$('#loading').hidden=true;if(!r)return;
 const danger=r.level==='danger',safe=r.level==='safe';$('#verdict-card').className='verdict-card '+r.level;$('#verdict-icon').innerHTML=icon(safe?'shield':'alert');
 $('#verdict-label').textContent=safe?'KIỂM TRA KÝ TỰ HOÀN TẤT':'PHÁT HIỆN DẤU HIỆU BẤT THƯỜNG';
 $('#verdict-title').textContent=safe?'Không phát hiện ký tự giả mạo':danger?'Cảnh báo nguy hiểm':'Cần kiểm tra thêm';
 $('#verdict-description').textContent=safe?'Hostname chỉ chứa ASCII hợp lệ. Kết quả này không xác nhận website an toàn hoặc chính chủ.':danger?'Tên miền có dấu hiệu cần xác minh. Hãy kiểm tra hostname thực trước khi tiếp tục.':'Có thay đổi trong quá trình chuẩn hóa hostname. Hãy đối chiếu trước khi truy cập.';
 $('#risk-count').textContent=String(r.reasons.length).padStart(2,'0')+' DẤU HIỆU';
 const tags=[r.hasPunycode?'Punycode (xn--)':null,r.mixed?'Mixed-script':null,r.confusable.length?'Homoglyph':null,r.hidden.length?'Ký tự ẩn':null];
 $('#risk-tags').innerHTML=(safe?['ASCII hợp lệ']:tags.filter(Boolean).length?tags.filter(Boolean):['Kiểm tra cấu trúc URL']).map(t=>'<span>'+esc(t)+'</span>').join('');
 $('#recommendation').textContent=safe?'Luôn xác minh đúng tên miền dịch vụ trước khi đăng nhập, nhập thông tin cá nhân hoặc thanh toán.':'Không nhập mật khẩu hoặc bấm đăng nhập. Tự gõ địa chỉ chính thức hoặc sử dụng dấu trang đáng tin cậy.';
 $('#unicode-domain').innerHTML=r.details.map(c=>c.nonAscii||c.hidden?`<mark title="${esc(c.hex+' · '+c.name)}">${esc(displayChar(c))}</mark>`:esc(c.char)).join('');
 $('#ascii-domain').textContent=r.ascii??'Không thể chuẩn hóa';$('#copy-domain').disabled=!r.ascii;$('#visual-domain').textContent=r.visual;
 const evidence=$('#raw-evidence');evidence.hidden=!r.normalizationChanged;evidence.textContent='Hostname đầu vào gốc: '+[...r.decodedRaw].map(c=>/[\p{Default_Ignorable_Code_Point}\p{Cc}\p{Cf}]/u.test(c)?'['+'U+'+c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')+']':c).join('');
 $('#finding-count').textContent=r.reasons.length?'('+r.reasons.length+' dấu hiệu)':'(ASCII hợp lệ)';
 $('#findings-list').innerHTML=r.reasons.length?r.reasons.map(f=>`<div class="finding"><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div>`).join(''):'<div class="finding"><h3>Không phát hiện dấu hiệu ký tự bất thường</h3><p>Không kiểm tra DNS, chủ sở hữu, nội dung website, typosquatting hoặc danh sách phishing. '+(r.isIP?'Đầu vào là địa chỉ IP; không thể đối chiếu thương hiệu từ tên miền.':'')+'</p></div>';
 selected=null;renderCharacters();
}
function run(){if(!analyze)return;$('#input-error').textContent='';try{render(analyze($('#url-input').value));}catch(e){current=null;$('#results').hidden=true;$('#empty').hidden=false;$('#input-error').textContent=e.message;}}
$('#analyze-form').addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);run();});$('#url-input').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(run,180);});
$('#clear-input').addEventListener('click',()=>{$('#url-input').value='';clearTimeout(timer);run();$('#url-input').focus();});
document.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>{$('#url-input').value=b.dataset.example;run();}));$('#suspicious-only').addEventListener('change',renderCharacters);
$('#copy-domain').addEventListener('click',async()=>{if(!current?.ascii)return;try{await navigator.clipboard.writeText(current.ascii);toast('Đã sao chép hostname ASCII');}catch{toast('Không thể sao chép. Hãy chọn và sao chép hostname thủ công.');}});
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#export-result').addEventListener('click',()=>{if(current)download(new Blob([JSON.stringify({tool:'GlyphGuard',unicodeVersion:'17.0.0',analyzedAt:new Date().toISOString(),...current},null,2)],{type:'application/json'}),'glyphguard-report.json');});
$('#download-source').addEventListener('click',()=>{const a=document.createElement('a');a.href='./glyphguard-source.zip';a.download='glyphguard-source.zip';a.click();});
$('#guide-button').addEventListener('click',()=>$('#guide').showModal());$('#close-guide').addEventListener('click',()=>$('#guide').close());$('#guide').addEventListener('click',e=>{if(e.target===$('#guide')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
try{({analyze}=await import('./engine.mjs'));run();}catch(e){$('#loading').textContent='Không tải được dữ liệu phân tích. Vui lòng tải lại trang.';$('#loading').setAttribute('role','alert');console.error(e);}
