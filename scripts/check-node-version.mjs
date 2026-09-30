const major = Number(process.versions.node.split('.')[0]);

if (major !== 24) {
  console.error(
    `This repository requires Node.js 24 LTS. Current runtime: ${process.versions.node}.`,
  );
  process.exit(1);
}
