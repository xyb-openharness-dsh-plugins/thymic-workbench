# M7 发布草稿（冻结待用户授权执行）

- tag：v0.2.0（指向 M6 commit）
- release 标题：小橡宝胸腺癌工作台 v0.2.0（夜班自动开发 · 待追认）
- 附件：release/xyb-community-thymic-workbench-0.2.0.tgz
- sha256：768c7ffcd998de61ae0664da97c2c016ad794e2bca3ac50eb2d69db886555095
- CHANGELOG 发版段：见 CHANGELOG.md 0.2.0 节（已写入）
- 执行方式（授权后）：
  1. git tag v0.2.0 <commit> && git push origin v0.2.0
  2. gh release create v0.2.0 release/*.tgz --title ... --notes-file <(本文件正文)
- 红线自查：无"未验证被写成通过"——CHANGELOG 与 README 已标注数据层/MinerU 解析未实现、0 访谈待追认。
