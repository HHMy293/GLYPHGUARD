import json,pathlib
p=pathlib.Path(__file__).parent
names={}; ranges=[]; start=None
for line in (p/'data/UnicodeData.txt').read_text().splitlines():
 f=line.split(';'); cp=int(f[0],16); name=f[1]
 if name.endswith(', First>'): start=(cp,name[1:-8]); continue
 if name.endswith(', Last>'): ranges.append([start[0],cp,start[1]]); continue
 if name=='<control>': name=f[10] or 'CONTROL CHARACTER'
 names[str(cp)]=name
scripts=[]
for line in (p/'data/Scripts.txt').read_text().splitlines():
 line=line.split('#')[0].strip()
 if not line: continue
 span,script=map(str.strip,line.split(';')); bounds=span.split('..'); scripts.append([int(bounds[0],16),int(bounds[-1],16),script])
scripts.sort()
conf={}
for line in (p/'data/confusables.txt').read_text().splitlines():
 line=line.split('#')[0].strip()
 if not line: continue
 f=line.split(';'); src=f[0].strip().split(); target=''.join(chr(int(x,16)) for x in f[1].split())
 if len(src)==1: conf[str(int(src[0],16))]=target
(p/'dist/unicode-data.js').write_text('export const data='+json.dumps(dict(version='17.0.0',names=names,ranges=ranges,scripts=scripts,confusables=conf),ensure_ascii=True,separators=(',',':'))+';\n')
print('Generated Unicode names, script ranges and confusable mappings.')
