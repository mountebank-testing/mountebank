'use strict';

const run = require('./run').run,
    fs = require('fs-extra');

async function distPackage (source, destination, packageTransformer) {
    fs.ensureDirSync(`dist/${destination}`);
    const pkg = JSON.parse(fs.readFileSync(`${source}/package.json`));

    pkg.files.forEach(file => {
        fs.copySync(`${source}/${file}`, `dist/${destination}/${file}`);
    });

    packageTransformer(pkg);
    fs.writeFileSync(`dist/${destination}/package.json`, JSON.stringify(pkg, null, 2));

    await run('npm', ['install', '--production'], { cwd: `dist/${destination}` });
    await run('npm', ['pack'], { cwd: `dist/${destination}` });
}

async function packageMountebank () {
    await distPackage('.', 'mountebank', pkg => {
        delete pkg.devDependencies;
        Object.keys(pkg.scripts).forEach(script => {
            // We don't package most tasks and don't want users running them anyhow
            if (['start', 'restart', 'stop'].indexOf(script) < 0) {
                delete pkg.scripts[script];
            }
        });
        fs.copySync('./Dockerfile', 'dist/mountebank/Dockerfile');
    });
}

async function packageMbTest () {
    await distPackage('mbTest', 'test', pkg => {
        /*
         * 1. Update the lockfile to reflect the new dependency reference
         * 2. Update root dependency reference to point to '../mountebank' instead of '..'
         * 3. Update the package entry key for mountebank to match the new path '../mountebank' instead of '..'
         * 4. Remove the old package entry for '..' since it's no longer valid
         * 5. Update the package-lock.json file with the modified lockfile content
         */
        pkg.dependencies.mountebank = 'file:../mountebank';

        const lockfile = JSON.parse(fs.readFileSync('dist/test/package-lock.json'));
        lockfile.packages[''].dependencies.mountebank = 'file:../mountebank';
        lockfile.packages['../mountebank'] = lockfile.packages['..'];
        delete lockfile.packages['..'];

        fs.writeFileSync('dist/test/package-lock.json', JSON.stringify(lockfile, null, 2));
    });
}

fs.removeSync('dist');
packageMountebank()
    .then(() => packageMbTest())
    .then(() => console.log('packages available in dist directory'))
    .catch(error => {
        console.error(error);
        process.exit(1); // eslint-disable-line no-process-exit
    });
