with open(r'src\app\inventory\page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

replacements = [
    # Modal header
    ('Initialize Asset', 'Add New Item'),
    ('System Registry Protocol', 'Fill in the details to add a new stock item.'),
    # Remove the tiny p tag with old subtitle (it'll now have the new subtitle from h2 change)
    # Labels
    ('System SKU', 'SKU *'),
    ('Metric Unit', 'Unit'),
    ('Asset Nomenclature', 'Item Name *'),
    ('Init Stock', 'Opening Qty'),
    ('Low Alarm', 'Low Stock Alert'),
    ('Invoice Ref', 'Invoice No. (optional)'),
    ('Audit Payload', 'Attach Invoice (optional)'),
    # Buttons
    ('>Abort<', '>Cancel<'),
    ('"SYNCING..."', '"Saving\u2026"'),
    ('\"COMMIT REGISTRY\"', '"Add Item"'),
    # Fix the p tag class
    ('text-[9px] font-black text-text-muted uppercase tracking-[2px] mt-0.5', 'text-xs text-text-secondary mt-0.5'),
    # Modal title styling
    ('text-xl font-black text-text-primary tracking-tight', 'text-base font-bold text-text-primary'),
    # Button styling - Abort
    ('px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-all', 'px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary glass glass-hover transition-all'),
    # Button styling - Commit
    ('px-8 py-3 rounded-xl bg-cyan-glow-grad text-deep-space text-xs font-black uppercase tracking-widest shadow-cyan-glow hover:scale-[1.02] transition-all disabled:opacity-50', 'px-5 py-2 rounded-xl bg-cyan-glow-grad text-deep-space text-sm font-semibold shadow-cyan-sm hover:shadow-cyan-glow transition-all disabled:opacity-50'),
    # Invoice placeholder
    ('placeholder="Optional"', 'placeholder="e.g. INV-1024"'),
    # File input styling
    ('file:text-[10px] file:font-black file:uppercase file:bg-white/5', 'file:text-xs file:font-semibold file:bg-white/5'),
    ('w-full text-[10px] text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0', 'w-full text-xs text-text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0'),
    # Header bg
    ('px-8 py-6 border-b border-white/5 bg-white/[0.02]', 'px-6 py-5 border-b border-white/5'),
    # Remove active:scale-90 from close button
    ('active:scale-90', ''),
    # Form padding
    ('p-8 space-y-6', 'p-6 space-y-5'),
    # Grid gaps
    ('grid grid-cols-2 gap-6', 'grid grid-cols-2 gap-5'),
    ('grid grid-cols-3 gap-6', 'grid grid-cols-3 gap-5'),
]

for old, new in replacements:
    if old in c:
        c = c.replace(old, new)
        print(f"Replaced: {old[:50]}")
    else:
        print(f"NOT FOUND: {old[:50]}")

with open(r'src\app\inventory\page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('\nDone!')
