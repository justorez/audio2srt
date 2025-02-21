import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { program, Option } from 'commander'
import { App } from '../index.js'
import Debug from 'debug'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf-8'))

const debug = Debug('ats')
const boolstr = (val) => {
    return (String(val).toLowerCase() === 'false') ? 'False' : 'True'
}

program
    .name('ats')
    .addOption(new Option('-a, --appid <value>', '应用标识').env('ATS_APPID'))
    .addOption(new Option('-t, --token <value>', '鉴权 Token').env('ATS_TOKEN'))
    .option('-l, --language <code>', '字幕语言类型', 'zh-CN')
    .option('-w, --words_per_line <number>', '每行最多展示字数', 46)
    .option('-m, --max_lines <number>', '每屏最多展示行数', 1)
    .addOption(
        new Option('-c, --caption_type <type>', '字幕识别类型')
            .choices(['auto', 'speech', 'singing'])
            .default('speech')
    )
    .option('-f, --file <path>', '音频文件路径')
    .addOption(new Option('-u, --url <link>', '音频链接').conflicts('file'))
    .option('--use_itn', '使用数字转换功能', boolstr)
    .option('--no-use_punc', '不增加标点')
    .option('--no-use_ddc', '不使用顺滑标注水词')
    .option('--with_speaker_info', '返回说话人信息', boolstr)
    .helpOption('-h, --help', '打印帮助信息')
    .version(`v${pkg.version}`, '-v, --version', '打印版本号')

program.addHelpText('after',`
Supported languages:
  +--------------+---------------+----------------+
  | 语言         | Language Code | 分句长度推荐值 |
  +--------------+---------------+----------------+
  | 中文普通话   | zh-CN         | 15             |
  | 英语（美国） | en-US         | 55             |
  | 日语         | ja-JP         | 32             |
  | 韩语         | ko-KR         | 32             |
  | 粤语         | yue           | 15             |
  | 上海话       | wuu           | 15             |
  | 闽南语       | nan           | 15             |
  | 西南官话     | xghu          | 15             |
  | 中原官话     | zgyu          | 15             |
  | 维语         | ug            | 55             |
  | 西班牙语     | es-MX         | 55             |
  | 俄语         | ru-RU         | 55             |
  | 法语         | fr-FR         | 55             |
  +--------------+---------------+----------------+
  
更多信息请查看官网文档：https://www.volcengine.com/docs/6561/80909`
)

program.parse(process.argv)

;(() => {
    const opts = program.opts()

    opts.use_punc = boolstr(opts.use_punc)
    opts.use_ddc = boolstr(opts.use_ddc)

    debug('%O', opts)

    if (!opts.appid) {
        return console.error('error: 请传入 appid 或设置环境变量 ATS_APPID')
    }
    if (!opts.token) {
        return console.error('error: 请传入 token 或设置环境变量 ATS_TOKEN')
    }

    if (!opts.file && !opts.url) {
        return console.error(`error: option '-f, --file <path>' or '-u, --url <link>' must set one of them`)
    }
    
    if (opts.file) {
        opts.fileType = path.extname(opts.file).slice(1) || 'wav'
    }
    
    new App(opts).run()
})()
