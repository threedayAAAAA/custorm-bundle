import type { Bundle } from './Bundle';
import type { Node } from 'acorn'

import { analyse } from './ast/analyse'
import path from 'path'
import { parse } from 'acorn'
import MagicString from 'magic-string'

export default class Module {
    private _code: MagicString;
    private _path: string;
    private _bundle: Bundle;
    private _ast: Node;
    private _imports: Node[];

  constructor({ code, path, bundle }: { code: string, path: string, bundle: Bundle }) {
    // 使用 magicString 是为了更好的处理 code（string）
    // 提供了很多处理 string 的方法
    this._code = new MagicString(code, {
      filename: path,
    });

    this._path = path;
    this._bundle = bundle;
    // 基于当前的 code 生成 ast
    this._ast = parse(code, {
      ecmaVersion: 7,
      sourceType: "module",
      locations: true,
    });
    this._imports = [];
    this.analyse();
  }
  analyse() {
    // 1. 收集所有的 import
    // 2. 然后使用 fetchModule 去拉取这个模块的 statements
    // 3. 然后push 到 statements 内

    this._ast.body.forEach((statement) => {
      if (statement.type === "ImportDeclaration") {
        this._imports.push(statement);
      }
    });

    analyse(this._ast, this._code, this);
  }

  expandAllStatements() {
    const statements = [];

    this._imports.forEach((node) => {
      const sourceValue = node.source.value.endsWith(".js")
        ? node.source.value
        : node.source.value + ".js";

      const importee = path.resolve(path.dirname(this._path), sourceValue);

      const module = this._bundle.fetchModule(importee);
      statements.push(...module.expandAllStatements());
    });

    this._ast.body.forEach((statement) => {
      if (!(statement.type === "ImportDeclaration")) {
        statements.push(this.expandStatement(statement));
      }
    });
    return statements;
  }

  expandStatement(statement) {
    // 给一个标记
    statement._included = true;
    return statement;
  }
}