import punycode from './punycode.js';
import {data} from './unicode-data.js';
export const unicodeVersion=data.version;
const ignorable=/[\p{Default_Ignorable_Code_Point}\p{Cc}\p{Cf}]/u;
const hex=n=>'U+'+n.toString(16).toUpperCase().padStart(4,'0');
// Scripts.txt is sorted into non-overlapping ranges. Binary search identifies
// every Unicode 17 script, including Common and Inherited; no guessed ranges.
export function scriptOf(cp){let lo=0,hi=data.scripts.length-1;while(lo<=hi){const m=(lo+hi)>>1,r=data.scripts[m];if(cp<r[0])hi=m-1;else if(cp>r[1])lo=m+1;else return r[2];}return 'Unknown';}
function nameOf(cp){if(data.names[cp])return data.names[cp];for(const [a,b,n] of data.ranges){if(cp>=a&&cp<=b){if(n==='Hangul Syllable'){const L=['G','GG','N','D','DD','R','M','B','BB','S','SS','','J','JJ','C','K','T','P','H'],V=['A','AE','YA','YAE','EO','E','YEO','YE','O','WA','WAE','OE','YO','U','WEO','WE','WI','YU','EU','YI','I'],T=['','G','GG','GS','N','NJ','NH','D','L','LG','LM','LB','LS','LT','LP','LH','M','B','BS','S','SS','NG','J','C','K','T','P','H'],s=cp-0xAC00;return 'HANGUL SYLLABLE '+L[Math.floor(s/588)]+V[Math.floor(s%588/28)]+T[s%28];}if(n.startsWith('CJK'))return 'CJK UNIFIED IDEOGRAPH-'+cp.toString(16).toUpperCase();if(n.startsWith('Tangut'))return 'TANGUT IDEOGRAPH-'+cp.toString(16).toUpperCase();return n.toUpperCase()+' (range)';}}return 'UNASSIGNED CODE POINT';}
// UTS #39 skeleton: NFD -> official confusables mapping -> NFD.
// This is a visual comparison aid, never a replacement destination URL.
export function skeleton(s){return [...s.normalize('NFD')].map(c=>data.confusables[c.codePointAt(0)]??c).join('').normalize('NFD');}
function inspect(s){return [...s].map((char,index)=>{const cp=char.codePointAt(0),script=scriptOf(cp),hidden=ignorable.test(char),lookalike=cp>127&&skeleton(char)!==char.normalize('NFD')&&/^[\x20-\x7e]+$/.test(skeleton(char));return {index,char,cp,hex:hex(cp),name:nameOf(cp),script,hidden,nonAscii:cp>127,lookalike,similar:lookalike?skeleton(char):null};});}
export function analyze(input){
 if(!input.trim())return null;
 if(input.length>8192)throw Error('Đường dẫn quá dài. Vui lòng nhập tối đa 8.192 ký tự.');
 const text=input.trim();
 // Capture raw authority BEFORE URL normalizes IDN or removes invisible chars.
 // The URL standard treats a backslash as a slash for HTTP(S).
 let rest=text,scheme='https:';
 const prefix=text.match(/^([a-z][a-z0-9+.-]*):\/\//i);
 if(prefix){scheme=prefix[1].toLowerCase()+':';if(!['http:','https:'].includes(scheme))throw Error('Chỉ hỗ trợ URL HTTP/HTTPS hoặc tên miền.');rest=text.slice(prefix[0].length);}
 else if(text.startsWith('//'))rest=text.slice(2);
 else if(/^[a-z][a-z0-9+.-]*:/i.test(text)&&!/^([^/?#\\]+):\d+(?:[/?#]|$)/.test(text)&&!text.startsWith('['))throw Error('Định dạng URL không được hỗ trợ. Hãy nhập domain hoặc URL HTTP/HTTPS.');
 const authority=rest.split(/[/?#\\]/)[0],at=authority.lastIndexOf('@'),hostPort=authority.slice(at+1);
 let rawHost=hostPort;
 if(rawHost.startsWith('[')){const end=rawHost.indexOf(']');if(end<0)throw Error('Địa chỉ IPv6 không hợp lệ.');rawHost=rawHost.slice(0,end+1);}
 else rawHost=rawHost.replace(/:\d+$/,'');
 if(!rawHost)throw Error('Chưa có tên miền để phân tích.');
 let decodedRaw;try{decodedRaw=decodeURIComponent(rawHost);}catch{throw Error('Mã phần trăm (%) trong hostname không hợp lệ.');}
 let parsed,error=null;try{parsed=new URL(scheme+'//'+rest);}catch{error='Hostname không hợp lệ theo bộ phân tích URL của trình duyệt.';}
 const ascii=parsed?.hostname??null;
 if(ascii&&!ascii.startsWith('[')){const labels=ascii.replace(/\.$/,'').split('.');if(ascii.length>254||labels.some(l=>!l||l.length>63||!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(l)))error='Hostname không tuân theo cấu trúc nhãn DNS (chữ, số, gạch nối; tối đa 63 ký tự mỗi nhãn).';}
 let unicode=decodedRaw;try{unicode=punycode.toUnicode(ascii??decodedRaw);}catch{error='Nhãn Punycode không hợp lệ.';}
 // Inspect submitted characters too: IDNA may erase ZWSP, soft hyphens, controls
 // or map fullwidth letters. Never discard that evidence.
 const originalDetails=inspect(decodedRaw),details=inspect(unicode);
 const hidden=originalDetails.filter(x=>x.hidden),suspicious=details.filter(x=>x.nonAscii||x.hidden);
 const labelScripts=unicode.replace(/\.$/,'').split('.').map(label=>[...new Set(inspect(label).map(x=>x.script).filter(s=>!['Common','Inherited','Unknown'].includes(s)))]);
 const mixed=labelScripts.some(s=>s.length>1);
 const hasPunycode=/(^|\.)xn--/i.test(ascii??'')||/(^|\.)xn--/i.test(decodedRaw);
 const reasons=[];
 if(error)reasons.push({kind:'danger',title:'Hostname không hợp lệ',text:error});
 if(hasPunycode)reasons.push({kind:'danger',title:'Phát hiện tên miền Punycode',text:'Nhãn xn-- chứa tên miền quốc tế (IDN). Cần xác minh độc lập trước khi truy cập; IDN cũng có thể là tên miền hợp pháp.'});
 if(mixed)reasons.push({kind:'danger',title:'Trộn bảng chữ cái trong cùng một nhãn',text:labelScripts.filter(s=>s.length>1).map(s=>s.join(' + ')).join(' · ')+'. Các ký tự có thể đang giả dạng chữ Latin.'});
 const confusable=[...new Map([...details,...originalDetails].filter(x=>x.lookalike).map(x=>[x.cp,x])).values()];
 if(confusable.length)reasons.push({kind:'danger',title:'Có ký tự dễ nhầm với ASCII',text:confusable.map(x=>`${x.hex} (${x.script}) → ${x.similar}`).join(' · ')});
 if(hidden.length)reasons.push({kind:'danger',title:'Phát hiện ký tự ẩn / điều khiển',text:hidden.map(x=>x.hex+' '+x.name).join(' · ')+'. Trình duyệt có thể loại bỏ hoặc từ chối chúng.'});
 if(at>=0)reasons.push({kind:'danger',title:'URL chứa thông tin trước dấu @',text:'Phần trước @ không phải hostname đích. Hostname thực tế là '+(ascii??decodedRaw)+'.'});
 const mapped=ascii&&decodedRaw.toLowerCase().replace(/\.$/,'')!==ascii.toLowerCase().replace(/\.$/,'')&&!hasPunycode;
 if(mapped&&!hidden.length)reasons.push({kind:'warning',title:'Hostname đã được chuẩn hóa',text:'Trình duyệt thay đổi ký tự đầu vào. Hãy đối chiếu phần hostname gốc và máy đọc.'});
 if(!reasons.length&&suspicious.length)reasons.push({kind:'warning',title:'Có ký tự ngoài ASCII',text:'Tên miền cần được kiểm tra thêm trước khi sử dụng.'});
 const level=reasons.some(x=>x.kind==='danger')?'danger':reasons.length?'warning':'safe';
 return {input,rawHost,decodedRaw,unicode,ascii,details,originalDetails,hidden,hasPunycode,mixed,confusable,reasons,level,visual:skeleton(unicode),scripts:[...new Set(details.map(x=>x.script))],isIP:!!ascii&&(/^\[/.test(ascii)||/^\d+\.\d+\.\d+\.\d+$/.test(ascii)),normalizationChanged:decodedRaw!==unicode};
}
