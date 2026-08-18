import { createPresetToolDefs } from './src/node/tools.ts'
import { homedir } from 'node:os'
import { join } from 'node:path'
const DSH = homedir() + '/.dsh'
const env = { presetsDir: join(DSH, '.ui-presets'), assetsDir: join(DSH, '.ui-presets', 'assets'), dataDir: join(DSH, 'data', 'ui-presets'), activeFile: join(DSH, 'data', 'ui-presets', 'active.json'), configFile: join(DSH, 'data', 'ui-presets', 'config.json') }
const defs = createPresetToolDefs(env, d => d)
const T = Object.fromEntries(defs.map(d => [d.name, d]))
const assets = await T.asset_list.execute({}, {})
console.log('===== asset_list render =====')
console.log(T.asset_list.output.render({}, assets)[0].text)
console.log()
const detail = await T.preset_get.execute({ id: 'default' }, {})
console.log('===== preset_get render (default) =====')
console.log(T.preset_get.output.render({}, detail)[0].text.slice(0, 900))