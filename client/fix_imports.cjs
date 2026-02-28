const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);

// Mapping from old abstract paths (e.g., from src's root) to new abstract paths
// Instead of rewriting with new relative paths, let's configure vite/ts to use @/ prefix.
// But wait, the user wants standard clean code. Setting up @/ alias is standard.
// For now, let's just do a naive replace in all files:
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Let's configure vite + tsconfig explicitly later or replace with aliases.
    // Actually, rewriting back to correct relative paths is a pain.
    // We'll replace them with @/ aliases:
    // e.g., import X from '../components/Y' -> import X from '@/extension/components/Y'
    // import X from '../../types/Y' -> import X from '@/shared/models/Y'

    // To be safe, we rely on @ alias which we'll configure later.
    content = content.replace(/from\s+['"](?:\.\.\/)+components\/([^'"]+)['"]/g, "from '@/extension/components/$1'");
    content = content.replace(/from\s+['"](?:\.\.\/)+pages\/([^'"]+)['"]/g, "from '@/extension/popup/pages/$1'");
    content = content.replace(/from\s+['"](?:\.\.\/)+contexts\/([^'"]+)['"]/g, "from '@/extension/popup/contexts/$1'");
    content = content.replace(/from\s+['"](?:\.\.\/)+assets\/([^'"]+)['"]/g, "from '@/extension/popup/assets/$1'");
    content = content.replace(/import\s+['"](?:\.\.\/)+index\.css['"]/g, "import '@/extension/popup/index.css'");
    content = content.replace(/from\s+['"](?:\.\.\/)+types\/([^'"]+)['"]/g, "from '@/shared/models/$1'");
    content = content.replace(/from\s+['"](?:\.\.\/)+services\/([^'"]+)['"]/g, "from '@/shared/sync/$1'");
    content = content.replace(/from\s+['"](?:\.\.\/)+utils\/([^'"]+)['"]/g, "from '@/shared/utils/$1'");

    // Also handle './' inside the same moved directories if they are now separated, but most internal './' are fine since the whole folder moved.
    // E.g., inside pages, './Dashboard' is fine.
    // But from App.tsx, './pages/Dashboard' becomes './pages/Dashboard' because both moved to popup. Wait! App.tsx is in popup, pages is in popup/pages. So './pages/...' is still correct relative to App.tsx!

    // The only ones breaking are imports across the old standard folders (e.g. from pages to components or services).
    // Cross-folder imports previously used '../components/'. We fixed that above.

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated paths in ${file}`);
    }
});
