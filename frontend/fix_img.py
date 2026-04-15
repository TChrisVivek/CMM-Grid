import re

with open(r'src\app\settings\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and fix the broken img tag
# The broken content has the eslint comment merged into the ternary and the img src is missing
old_pattern = '{settings.companyLogo ? ({/* eslint-disable-next-line @next/next/no-img-element */}'
new_content = '{settings.companyLogo ? (\n                                     <img src={settings.companyLogo} alt="Logo" className="w-full h-full object-contain p-1" />'

# Also remove the orphaned alt="Logo" line that follows
if old_pattern in content:
    # Replace the broken opening
    content = content.replace(old_pattern, '{settings.companyLogo ? (', 1)
    # Remove the dangling alt= line
    content = re.sub(r'\n\s*alt="Logo" className="w-full h-full object-contain p-1" />', '', content, count=1)
    # Now insert the correct img tag after the ternary opening
    content = content.replace(
        '{settings.companyLogo ? (\n',
        '{settings.companyLogo ? (\n                                     <img src={settings.companyLogo} alt="Logo" className="w-full h-full object-contain p-1" />\n',
        1
    )
    print("Fixed broken img tag")
else:
    print("Pattern not found - checking current state...")
    idx = content.find('settings.companyLogo ? (')
    print(repr(content[idx:idx+200]))

with open(r'src\app\settings\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
