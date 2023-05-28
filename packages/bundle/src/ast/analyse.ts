import type MagicString from "magic-string";

export function analyse(ast: { body: { start: number, end: number }[] }, ms: MagicString) {
    ast.body.forEach((statement) => {
        Object.defineProperties(statement, {
        _source: {
            value: ms.snip(statement.start, statement.end),
        },
        });
    });
}