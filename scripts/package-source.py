"""Package only project files; never include installed packages or Git history."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parents[1]
target = root / 'dist' / 'glyphguard-source.zip'
with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
    for file in sorted(root.rglob('*')):
        relative = file.relative_to(root)
        if not file.is_file() or any(part in {'.git', '.openai', 'node_modules', '__pycache__'} for part in relative.parts):
            continue
        if file.suffix in {'.zip', '.pyc'} or file.name.startswith('.env'):
            continue
        archive.write(file, Path('glyphguard') / relative)
print('Created', target.name)
