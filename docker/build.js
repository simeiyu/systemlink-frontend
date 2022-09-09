// readme first :)
// env option
// DONTPUSH=1 -> no push to registry
// CROSS_BUILD=1 -> will build all support platform images
const version = require('./../package.json').version;
const tagVersions = [version, 'latest'];

// build scripts here
const exec = require('child_process').exec;
const run = function (cmd) {
  return new Promise((resolve, reject) => {
    console.log(`run cmd: ${cmd}`);
    const p = exec(
      cmd,
      {
        encoding: 'utf8',
      },
      function (error, stdout, stderr) {
        if (error) {
          console.error('error: ' + error);
          reject(error);
        }
        if (stdout) console.log('cmd end: ' + stdout);
        if (stderr) console.log('cmd err: ' + stderr);
        resolve();
      }
    );
    p.stdout.on('data', (data) => {
      console.log(data);
    });
    // return out
  });
};
const archMaps = {
  x64: 'amd64',
};
const env = process.env;

async function buildImage(imageName, tags, arch) {
  let tagParameter = '';
  for (const tag of tags) {
    console.log('build', `${imageName}:${tag} `);
    tagParameter += ` -t ${imageName}:${tag} `;
  }
  await run(
    `docker build ${tagParameter} --build-arg ARCH=${arch}  -f docker/Dockerfile .`
  );
}

async function pushImage(imageName, tags) {
  for (const tag of tags) {
    await run(`docker push ${imageName}:${tag}`).catch((error) => {
      console.log(error);
    });
  }
}
const suanpan = require('./../package.json').suanpan;
const imageName = suanpan.image_name;
const imageRegistry =
  process.env.suanpan_image_registry || suanpan.image_registry;
const imageNamespace = suanpan.image_namespace;
const imageArches = suanpan.image_arches;

if (env.CROSS_BUILD) console.log('cross build');
async function main() {
  await run('pwd');
  const arches = [];
  arches.push(...imageArches);

  for (const arch of arches) {
    console.log('building platform', archMaps[process.arch], arch);
    await buildImage(
      `${imageRegistry}/${imageNamespace}-${arch}/${imageName}`,
      tagVersions,
      arch
    );
    if (env.DONTPUSH) {
      console.log('skip push images');
    } else {
      await pushImage(
        `${imageRegistry}/${imageNamespace}-${arch}/${imageName}`,
        tagVersions
      );
    }
  }
}
main();
