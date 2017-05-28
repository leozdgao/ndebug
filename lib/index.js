const { execSync } = require('child_process')
const semver = require('semver')
const path = require('path')
const fs = require('fs')

module.exports = {
  checkEnv() {
    try {
      const verison = execSync('node -v', { encoding: 'utf-8' }).replace('v', '').trim()
      if (semver.lt(verison, '6.3.0')) {
        console.log('node 版本过低，要求 >= 6.3.0')
        process.exit(1)
      }
    } catch(e) {
      console.log(e)
      console.log('检测 node 版本失败，请检查 node 是否被正确安装')
      process.exit(1)
    }
  },
  exec(entry, noBrk, others) {
    const cwd = process.cwd()

    if (!entry) {
      try {
        const pkg = require(path.join(cwd, 'package.json'))
        if (pkg.bin) {
          if (typeof pkg.bin === 'object') {
            entry = pkg.bin[Object.keys(pkg.bin)[0]]
          } else {
            entry = pkg.bin
          }
        } else if (pkg.main) {
          entry = pkg.main
        } else {
          entry = 'index.js'
        }
      } catch(e) {
        console.log('无法从 package.json 中推测出入口')
        process.exit(1)
      }
    } else {
      const ext = path.extname(entry)

      if (!ext) {
        // bin
        if (!fs.existsSync(path.join(cwd, entry))) {
          entry = path.join('./node_modules/.bin', entry)
        }
      }
    }

    execSync(`node --inspect ${noBrk ? '' : '--debug-brk'} ${entry} ${others.slice(1).join(' ')}`, {
      stdio: 'inherit'
    })
  }
}
