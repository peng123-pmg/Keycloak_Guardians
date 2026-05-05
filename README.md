# Keycloak Guardians

Keycloak Guardians 是一个基于 Keycloak 的团队文件协作与共享项目，提供统一认证、团队成员管理、文件上传/下载与共享能力，并支持自定义主题与扩展开发。

## 功能亮点

- 统一认证：基于 Keycloak 的 OIDC/OAuth2 登录与 Token 管理。
- 团队协作：小组创建、成员邀请与角色管理（OWNER/MEMBER）。
- 文件能力：个人与团队文件上传/下载、共享与删除（团队文件仅创建者可删）。
- 可扩展：自定义主题与扩展模块，便于定制品牌与业务逻辑。
- 可观测：日志、监控、告警与审计的可扩展能力。

## 技术架构

- 架构说明与图示：参见 [docs/product-development.md](docs/product-development.md)。
- 技术方案与模块设计：参见 [技术方案.md](技术方案.md)。

## 目录结构

- keycloak-server/: 后端服务与运行环境（Quarkus + Kotlin）
- Theme/: 前端主题与页面（Vite + React + TypeScript）
- rest-api/: API 调试或前端相关资源
- docs/: 文档与说明
- postman/: Postman 测试集

## 快速开始

1) 启动后端（开发模式）
- 进入 keycloak-server/，执行 gradlew.bat quarkusDev

2) 启动主题开发（可选）
- 进入 Theme/，执行 npm install
- 执行 npm run dev 或 npm run build

3) API 调试
- 使用 Postman 集合 postman/Keycloak-Guardians.postman_collection.json
- 配置 access_token 与 base_url（默认 http://localhost:8081）

## 文档入口

- API 文档：[API.md](API.md)
- 产品开发文档：[docs/product-development.md](docs/product-development.md)
- Wiki 版 API 总览：[docs/wiki/API.md](docs/wiki/API.md)

## License

- 参见 [LICENSE](LICENSE)
