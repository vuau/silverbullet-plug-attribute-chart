var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../home/au/study/silverbullet/lib/plugos/worker_runtime.ts
var workerPostMessage = (_msg) => {
  throw new Error("Not initialized yet");
};
var runningAsWebWorker = typeof window === "undefined" && // @ts-ignore: globalThis
typeof globalThis.WebSocketPair === "undefined";
if (typeof Deno === "undefined") {
  self.Deno = {
    args: [],
    // @ts-ignore: Deno hack
    build: {
      arch: "x86_64"
    },
    env: {
      // @ts-ignore: Deno hack
      get() {
      }
    }
  };
}
var pendingRequests = /* @__PURE__ */ new Map();
var syscallReqId = 0;
if (runningAsWebWorker) {
  globalThis.syscall = async (name, ...args) => {
    return await new Promise((resolve, reject) => {
      syscallReqId++;
      pendingRequests.set(syscallReqId, { resolve, reject });
      workerPostMessage({
        type: "sys",
        id: syscallReqId,
        name,
        args
      });
    });
  };
}
function setupMessageListener(functionMapping2, manifest2, postMessageFn) {
  if (!runningAsWebWorker) {
    return;
  }
  workerPostMessage = postMessageFn;
  self.addEventListener("message", (event) => {
    (async () => {
      const data = event.data;
      switch (data.type) {
        case "inv":
          {
            const fn = functionMapping2[data.name];
            if (!fn) {
              throw new Error(`Function not loaded: ${data.name}`);
            }
            try {
              const result = await Promise.resolve(fn(...data.args || []));
              workerPostMessage({
                type: "invr",
                id: data.id,
                result
              });
            } catch (e) {
              console.error(
                "An exception was thrown as a result of invoking function",
                data.name,
                "error:",
                e.message
              );
              workerPostMessage({
                type: "invr",
                id: data.id,
                error: e.message
              });
            }
          }
          break;
        case "sysr":
          {
            const syscallId = data.id;
            const lookup = pendingRequests.get(syscallId);
            if (!lookup) {
              throw Error("Invalid request id");
            }
            pendingRequests.delete(syscallId);
            if (data.error) {
              lookup.reject(new Error(data.error));
            } else {
              lookup.resolve(data.result);
            }
          }
          break;
      }
    })().catch(console.error);
  });
  workerPostMessage({
    type: "manifest",
    manifest: manifest2
  });
}
function base64Decode(s) {
  const binString = atob(s);
  const len = binString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}
function base64Encode(buffer) {
  if (typeof buffer === "string") {
    buffer = new TextEncoder().encode(buffer);
  }
  let binary = "";
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}
async function sandboxFetch(reqInfo, options) {
  if (typeof reqInfo !== "string") {
    const body = new Uint8Array(await reqInfo.arrayBuffer());
    const encodedBody = body.length > 0 ? base64Encode(body) : void 0;
    options = {
      method: reqInfo.method,
      headers: Object.fromEntries(reqInfo.headers.entries()),
      base64Body: encodedBody
    };
    reqInfo = reqInfo.url;
  }
  return syscall("sandboxFetch.fetch", reqInfo, options);
}
globalThis.nativeFetch = globalThis.fetch;
function monkeyPatchFetch() {
  globalThis.fetch = async function(reqInfo, init) {
    const encodedBody = init && init.body ? base64Encode(
      new Uint8Array(await new Response(init.body).arrayBuffer())
    ) : void 0;
    const r = await sandboxFetch(
      reqInfo,
      init && {
        method: init.method,
        headers: init.headers,
        base64Body: encodedBody
      }
    );
    return new Response(r.base64Body ? base64Decode(r.base64Body) : null, {
      status: r.status,
      headers: r.headers
    });
  };
}
if (runningAsWebWorker) {
  monkeyPatchFetch();
}

// ../home/au/study/silverbullet/plug-api/syscall.ts
if (typeof self === "undefined") {
  self = {
    syscall: () => {
      throw new Error("Not implemented here");
    }
  };
}
function syscall2(name, ...args) {
  return globalThis.syscall(name, ...args);
}

// ../home/au/study/silverbullet/plug-api/syscalls/system.ts
var system_exports = {};
__export(system_exports, {
  applyAttributeExtractors: () => applyAttributeExtractors,
  getEnv: () => getEnv,
  getMode: () => getMode,
  getSpaceConfig: () => getSpaceConfig,
  getVersion: () => getVersion,
  invokeCommand: () => invokeCommand,
  invokeFunction: () => invokeFunction,
  invokeSpaceFunction: () => invokeSpaceFunction,
  listCommands: () => listCommands,
  listSyscalls: () => listSyscalls,
  reloadConfig: () => reloadConfig,
  reloadPlugs: () => reloadPlugs
});
function invokeFunction(name, ...args) {
  return syscall2("system.invokeFunction", name, ...args);
}
function invokeCommand(name, args) {
  return syscall2("system.invokeCommand", name, args);
}
function listCommands() {
  return syscall2("system.listCommands");
}
function listSyscalls() {
  return syscall2("system.listSyscalls");
}
function invokeSpaceFunction(name, ...args) {
  return syscall2("system.invokeSpaceFunction", name, ...args);
}
function applyAttributeExtractors(tags, text, tree) {
  return syscall2("system.applyAttributeExtractors", tags, text, tree);
}
async function getSpaceConfig(key, defaultValue) {
  return await syscall2("system.getSpaceConfig", key) ?? defaultValue;
}
function reloadPlugs() {
  return syscall2("system.reloadPlugs");
}
function reloadConfig() {
  return syscall2("system.reloadConfig");
}
function getEnv() {
  return syscall2("system.getEnv");
}
function getMode() {
  return syscall2("system.getMode");
}
function getVersion() {
  return syscall2("system.getVersion");
}

// ../home/au/study/silverbullet/plug-api/syscalls/language.ts
var language_exports = {};
__export(language_exports, {
  listLanguages: () => listLanguages,
  parseLanguage: () => parseLanguage
});
function parseLanguage(language, code) {
  return syscall2("language.parseLanguage", language, code);
}
function listLanguages() {
  return syscall2("language.listLanguages");
}

// ../home/au/study/silverbullet/plug-api/syscalls/yaml.ts
var yaml_exports = {};
__export(yaml_exports, {
  parse: () => parse,
  stringify: () => stringify
});
function parse(text) {
  return syscall2("yaml.parse", text);
}
function stringify(obj) {
  return syscall2("yaml.stringify", obj);
}

// ../home/au/study/silverbullet/plug-api/lib/tree.ts
function collectNodesOfType(tree, nodeType) {
  return collectNodesMatching(tree, (n) => n.type === nodeType);
}
function collectNodesMatching(tree, matchFn) {
  if (matchFn(tree)) {
    return [tree];
  }
  let results = [];
  if (tree.children) {
    for (const child of tree.children) {
      results = [...results, ...collectNodesMatching(child, matchFn)];
    }
  }
  return results;
}
function renderToText(tree) {
  if (!tree) {
    return "";
  }
  const pieces = [];
  if (tree.text !== void 0) {
    return tree.text;
  }
  for (const child of tree.children) {
    pieces.push(renderToText(child));
  }
  return pieces.join("");
}
function parseTreeToAST(tree, omitTrimmable = true) {
  const parseErrorNodes = collectNodesOfType(tree, "\u26A0");
  if (parseErrorNodes.length > 0) {
    throw new Error(
      `Parse error in: ${renderToText(tree)}`
    );
  }
  if (tree.text !== void 0) {
    return tree.text;
  }
  const ast = [tree.type];
  for (const node of tree.children) {
    if (node.type && !node.type.endsWith("Mark") && node.type !== "Comment") {
      ast.push(parseTreeToAST(node, omitTrimmable));
    }
    if (node.text && (omitTrimmable && node.text.trim() || !omitTrimmable)) {
      ast.push(node.text);
    }
  }
  return ast;
}

// ../home/au/study/silverbullet/plug-api/lib/parse_query.ts
function astToKvQuery(node) {
  const query = {
    querySource: ""
  };
  const [queryType, querySource, ...clauses] = node;
  if (queryType !== "Query") {
    throw new Error(`Expected query type, got ${queryType}`);
  }
  query.querySource = querySource[1];
  for (const clause of clauses) {
    const [clauseType] = clause;
    switch (clauseType) {
      case "WhereClause": {
        if (query.filter) {
          query.filter = [
            "and",
            query.filter,
            expressionToKvQueryExpression(clause[2])
          ];
        } else {
          query.filter = expressionToKvQueryExpression(clause[2]);
        }
        break;
      }
      case "OrderClause": {
        if (!query.orderBy) {
          query.orderBy = [];
        }
        for (const orderBy of clause.slice(2)) {
          if (orderBy[0] === "OrderBy") {
            const expr = orderBy[1][1];
            if (orderBy[2]) {
              query.orderBy.push({
                expr: expressionToKvQueryExpression(expr),
                desc: orderBy[2][1][1] === "desc"
              });
            } else {
              query.orderBy.push({
                expr: expressionToKvQueryExpression(expr),
                desc: false
              });
            }
          }
        }
        break;
      }
      case "LimitClause": {
        query.limit = expressionToKvQueryExpression(clause[2][1]);
        break;
      }
      case "SelectClause": {
        for (const select of clause.slice(2)) {
          if (select[0] === "Select") {
            if (!query.select) {
              query.select = [];
            }
            if (select.length === 2) {
              query.select.push({
                name: cleanIdentifier(select[1][1])
              });
            } else {
              query.select.push({
                name: cleanIdentifier(select[3][1]),
                expr: expressionToKvQueryExpression(select[1])
              });
            }
          }
        }
        break;
      }
      case "RenderClause": {
        const pageRef = clause.find((c) => c[0] === "PageRef");
        query.render = pageRef[1].slice(2, -2);
        query.renderAll = !!clause.find((c) => c[0] === "all");
        break;
      }
      default:
        throw new Error(`Unknown clause type: ${clauseType}`);
    }
  }
  return query;
}
function cleanIdentifier(s) {
  if (s.startsWith("`") && s.endsWith("`")) {
    return s.slice(1, -1);
  }
  return s;
}
function expressionToKvQueryExpression(node) {
  if (["LVal", "Expression", "Value"].includes(node[0])) {
    return expressionToKvQueryExpression(node[1]);
  }
  switch (node[0]) {
    case "Attribute": {
      return [
        "attr",
        expressionToKvQueryExpression(node[1]),
        cleanIdentifier(node[3][1])
      ];
    }
    case "Identifier":
      return ["attr", cleanIdentifier(node[1])];
    case "String":
      return ["string", node[1].slice(1, -1)];
    case "Number":
      return ["number", +node[1]];
    case "Bool":
      return ["boolean", node[1][1] === "true"];
    case "null":
      return ["null"];
    case "Regex":
      return ["regexp", node[1].slice(1, -1), "i"];
    case "List": {
      const exprs = [];
      for (const expr of node.slice(2)) {
        if (expr[0] === "Expression") {
          exprs.push(expr);
        }
      }
      return ["array", exprs.map(expressionToKvQueryExpression)];
    }
    case "Object": {
      const objAttrs = [];
      for (const kv of node.slice(2)) {
        if (typeof kv === "string") {
          continue;
        }
        const [_, key, _colon, expr] = kv;
        objAttrs.push([
          key[1].slice(1, -1),
          expressionToKvQueryExpression(
            expr
          )
        ]);
      }
      return ["object", objAttrs];
    }
    case "BinExpression": {
      const lval = expressionToKvQueryExpression(node[1]);
      const binOp = node[2][0] === "in" ? "in" : node[2].trim();
      const val = expressionToKvQueryExpression(node[3]);
      return [binOp, lval, val];
    }
    case "LogicalExpression": {
      const op1 = expressionToKvQueryExpression(node[1]);
      const op = node[2];
      const op2 = expressionToKvQueryExpression(node[3]);
      return [op[1], op1, op2];
    }
    case "ParenthesizedExpression": {
      return expressionToKvQueryExpression(node[2]);
    }
    case "Call": {
      const fn = cleanIdentifier(node[1][1]);
      const args = [];
      for (const expr of node.slice(2)) {
        if (expr[0] === "Expression") {
          args.push(expr);
        }
      }
      return ["call", fn, args.map(expressionToKvQueryExpression)];
    }
    case "UnaryExpression": {
      if (node[1][0] === "not" || node[1][0] === "!") {
        return ["not", expressionToKvQueryExpression(node[2])];
      } else if (node[1][0] === "-") {
        return ["-", expressionToKvQueryExpression(node[2])];
      }
      throw new Error(`Unknown unary expression: ${node[1][0]}`);
    }
    case "TopLevelVal": {
      return ["attr"];
    }
    case "GlobalIdentifier": {
      return ["global", node[1].substring(1)];
    }
    case "TernaryExpression": {
      const [_, condition, _space, ifTrue, _space2, ifFalse] = node;
      return [
        "?",
        expressionToKvQueryExpression(condition),
        expressionToKvQueryExpression(ifTrue),
        expressionToKvQueryExpression(ifFalse)
      ];
    }
    case "QueryExpression": {
      return ["query", astToKvQuery(node[2])];
    }
    case "PageRef": {
      return ["pageref", node[1].slice(2, -2)];
    }
    default:
      throw new Error(`Not supported: ${node[0]}`);
  }
}
async function parseQuery(query) {
  const queryAST = parseTreeToAST(
    await language_exports.parseLanguage(
      "query",
      query
    )
  );
  return astToKvQuery(queryAST[1]);
}

// ../home/au/study/silverbullet/lib/limited_map.ts
var LimitedMap = class {
  constructor(maxSize, initialJson = {}) {
    this.maxSize = maxSize;
    this.map = new Map(Object.entries(initialJson));
  }
  map;
  /**
   * @param key
   * @param value
   * @param ttl time to live (in ms)
   */
  set(key, value, ttl) {
    const entry = { value, la: Date.now() };
    if (ttl) {
      const existingEntry = this.map.get(key);
      if (existingEntry?.expTimer) {
        clearTimeout(existingEntry.expTimer);
      }
      entry.expTimer = setTimeout(() => {
        this.map.delete(key);
      }, ttl);
    }
    if (this.map.size >= this.maxSize) {
      const oldestKey = this.getOldestKey();
      this.map.delete(oldestKey);
    }
    this.map.set(key, entry);
  }
  get(key) {
    const entry = this.map.get(key);
    if (entry) {
      entry.la = Date.now();
      return entry.value;
    }
    return void 0;
  }
  remove(key) {
    this.map.delete(key);
  }
  toJSON() {
    return Object.fromEntries(this.map.entries());
  }
  getOldestKey() {
    let oldestKey;
    let oldestTimestamp;
    for (const [key, entry] of this.map.entries()) {
      if (!oldestTimestamp || entry.la < oldestTimestamp) {
        oldestKey = key;
        oldestTimestamp = entry.la;
      }
    }
    return oldestKey;
  }
};

// ../home/au/study/silverbullet/lib/memory_cache.ts
var cache = new LimitedMap(50);

// ../home/au/study/silverbullet/plugs/index/plug_api.ts
function getObjectByRef(page, tag, ref) {
  return system_exports.invokeFunction("index.getObjectByRef", page, tag, ref);
}

// ../home/au/study/silverbullet/plugs/template/page.ts
async function loadPageObject(pageName) {
  if (!pageName) {
    return {
      ref: "",
      name: "",
      tags: ["page"],
      lastModified: "",
      created: ""
    };
  }
  return await getObjectByRef(
    pageName,
    "page",
    pageName
  ) || {
    ref: pageName,
    name: pageName,
    tags: ["page"],
    lastModified: "",
    created: ""
  };
}

// ../home/au/study/silverbullet-plug-attribute-chart/attributeChart.ts
async function widget(bodyText, pageName) {
  const config = await system_exports.getSpaceConfig();
  const pageObject = await loadPageObject(pageName);
  try {
    const chartConfig = await yaml_exports.parse(bodyText);
    const query = await parseQuery(chartConfig.query);
    const attributes = chartConfig.attributes || [];
    const options = chartConfig.options || {};
    const results = await system_exports.invokeFunction(
      "query.renderQuery",
      query,
      {
        page: pageObject,
        config
      }
    );
    return {
      html: `
      <style>
        html[data-theme=dark] {
          color-scheme: dark;
          --root-background-color: #111;
          --root-color: #fff;
          --top-background-color: #262626;
        }
        html {
          --root-background-color: #fff;
          --root-color: inherit;
          --top-background-color: #e1e1e1;
          --ui-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
        }
        body{
          margin:0;
          background-color:var(--root-background-color);
          color:var(--root-color);
          font-family: var(--ui-font);
        }
      </style>
      <canvas id="myChart"></canvas>`,
      script: `
        loadJsByUrl("https://cdn.jsdelivr.net/npm/chart.js").then(() => {
          const chartData = ${JSON.stringify(createChartData(results, attributes))};
          const ctx = document.getElementById('myChart');
          const myChart = new Chart(ctx, {
            data: chartData,
            options: ${JSON.stringify(options)}
          })
        });
      `
    };
  } catch (e) {
    return { markdown: `**Error:** ${e.message}` };
  }
}
function createChartData(results, attributes = []) {
  const labels = results.map((d) => d.name.replace("Journal/Day/", ""));
  const datasets = [];
  for (const attribute of attributes) {
    if (!attribute.name) {
      continue;
    }
    datasets.push({
      type: attribute.type || "line",
      label: attribute.label || attribute.name,
      data: results.map((d) => d.attribute && d.attribute[attribute.name]),
      ...attribute.color && { backgroundColor: attribute.color, borderColor: attribute.color }
    });
  }
  return { labels, datasets };
}

// 25e30fcec7407ee1.js
var functionMapping = {
  attributeChartWidget: widget
};
var manifest = {
  "name": "attributeChart",
  "functions": {
    "attributeChartWidget": {
      "path": "attributeChart.ts:widget",
      "codeWidget": "attributeChart"
    }
  },
  "assets": {}
};
var plug = { manifest, functionMapping };
setupMessageListener(functionMapping, manifest, self.postMessage);
export {
  plug
};
//# sourceMappingURL=attributeChart.plug.js.map
