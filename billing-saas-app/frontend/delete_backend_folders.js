const fs = require('fs');
['src/cron', 'src/lib', 'src/middleware', 'server', 'prisma', 'scripts'].forEach(dir => {
    try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log('Removed', dir);
    } catch (e) {
        console.log('Error removing', dir, e.message);
    }
});
