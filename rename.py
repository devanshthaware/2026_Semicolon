import os
import re

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return # Skip binary or unreadable files

    original_content = content

    replacements = [
        (re.compile(r'TruthLayer', re.IGNORECASE), lambda m: 
            'ARGUS' if m.group(0) == 'TRUTHLAYER' else 
            'Argus' if m.group(0) == 'TruthLayer' or m.group(0) == 'Truthlayer' else 
            'argus'
        ),
        (re.compile(r'Truth Layer', re.IGNORECASE), lambda m:
            'Argus' if m.group(0) == 'Truth Layer' else
            'argus'
        )
    ]

    for regex, repl in replacements:
        content = regex.sub(repl, content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        print(f"Updated: {filepath}")

def main():
    exclude_dirs = {'.git', 'node_modules', '.next', '.pnpm-store', 'dist', 'build'}
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            # exclude some file extensions
            if file.endswith(('.png', '.jpg', '.jpeg', '.ico', '.webp', '.lock', '.svg', '.woff', '.woff2', '.ttf', '.eot')):
                continue
            if 'pnpm-lock.yaml' in file or 'package-lock.json' in file:
                continue
            
            filepath = os.path.join(root, file)
            # Skip the script itself
            if 'rename.py' in filepath:
                continue
            replace_in_file(filepath)

if __name__ == '__main__':
    main()
