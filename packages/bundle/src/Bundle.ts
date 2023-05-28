
import type { BundleConfig } from './interface';

import fs from 'node:fs'
import path from 'node:path'
import { Bundle as MagicStringBundle } from 'magic-string'
import Module from './Module'

export class Bundle {
    private _options: { 
        config: {
            input: string,
            output: {
                filename: string
            }
        },
    }
    private _entry: string
    private _statements: Array<SafeAny>
  constructor(options: BundleConfig) {
    this._options = options;
    this._entry = options.config.input;
    this._statements = [];
  }

  build() {
    // 1. 先基于 entry 文件来开始 -> 转换成 Module
    const entryModule = this.fetchModule(this._entry);
    // 2. 对入口文件抽象语法树进行依赖解析
    this._statements = entryModule.expandAllStatements();
    // 3. 生成最终的代码
    const { code } = this.generate();
    // 4. 保存到file

    const { config } = this._options;
    const entryDir = path.dirname(config.input);
    const filename = path.join(entryDir, config.output.filename);
    fs.writeFileSync(filename, code);
  }

  fetchModule(importee: string) {
    const code = fs.readFileSync(importee, "utf-8");
    const module = new Module({
      code,
      path: importee,
      bundle: this,
    });

    return module;
  }

  generate() {
    const ms = new MagicStringBundle();
    this._statements.forEach((statement) => {
      const source = statement._source.clone();
      if (/^Export/.test(statement.type)) {
        if (statement.type === "ExportNamedDeclaration") {
          source.remove(statement.start, statement.declaration.start);
        }
      }

      ms.addSource({
        content: source,
      });
    });

    return {
      code: ms.toString(),
    };
  }
}