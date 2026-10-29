// @magpie-community/page-chat：在 magpie 窗口里加一个「对话」页面。
//
// 两件事：
//   1. 作为 OpenCode v1 插件被 magpie 的 Bun 宿主加载（不注册任何供应商，只借宿主的进程起服务）。
//   2. 在加载时起一个本地 HTTP 服务，窗口里的页面把自己导航过去，界面与 magpie 网关同源直连。
//
// magpie 的插件页面跑在 sandbox="allow-scripts" 的框架里，没有网络权限、不能内嵌框架、
// 不能用存储，唯一能做的联网动作是把自身导航到别处（文档已明说）。所以这里只是一个
// 「带路页」，真正的界面由本插件的服务提供。

import { startServer } from "./lib/server.mjs";

const started = startServer({ configDir: process.env.MAGPIE_CHAT_CONFIG || "", options: {} })
  .then((info) => {
    console.log(`[page-chat] listening on http://127.0.0.1:${info.port}`);
    return info;
  })
  .catch((err) => {
    console.error("[page-chat] could not start:", err?.message || err);
    return null;
  });

// magpie 会把每个导出的函数当成一个插件调用；用 OpenCode v1 的形式只导出服务器。
export default {
  id: "magpie-chat",
  server: async (input, options) => {
    // 插件被重新启用时，宿主是新的进程；这里无事可做，服务已在加载时起来。
    if (options && typeof options === "object") {
      await started.catch(() => null);
    }
    return {};
  },
};
