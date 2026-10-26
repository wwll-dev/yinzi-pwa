# 銀子日記

iPhone 用嘅記帳 PWA。流水以 CSV 存在私人 repo [wwll-dev/yinzi-ledger](https://github.com/wwll-dev/yinzi-ledger) 嘅 `data/2026_ledger.csv`。呢個公開 repo 只放前端，唔包含真實帳本。

上線網址：https://wwll-dev.github.io/yinzi-pwa/

## 加入主畫面（iPhone）

1. 用 **Safari** 打開 https://wwll-dev.github.io/yinzi-pwa/
2. 撳底部分享掣（方框加向上箭嘴）
3. 向下掃，揀 **加入主畫面**
4. 名稱保持「銀子日記」，撳 **加入**
5. 之後由主畫面個 icon 打開。狀態列會係黑色半透明，畫面會延伸到安全區域。

請用主畫面開啟，唔好留喺 Safari 分頁，先至係獨立 app。

## GitHub Token

App 要有 Personal Access Token 先讀寫到私人帳本。

1. GitHub → Settings → Developer settings → Personal access tokens
2. Classic token 要勾 **`repo`** scope（私人 `yinzi-ledger` 必須有 repo 權限）
3. 打開銀子日記，貼上 token，撳「儲存並解鎖」

Token 只寫入呢部機嘅 `localStorage` key `yinzi_gh_token`，唔會上傳去 Pages。可以喺設定清除。畫面唔會顯示完整 token。

Fine-grained token 只要對 `wwll-dev/yinzi-ledger` 有 Contents 讀寫都得；classic token 就用 `repo` scope。

預設連線：

| 項目 | 預設 |
| --- | --- |
| 擁有者 | `wwll-dev` |
| Repo | `yinzi-ledger` |
| 路徑 | `data/2026_ledger.csv` |
| 分支 | `main` |
| 每月預算 | HK$15,000（本機可改） |

## CSV

欄位順序固定，同帳本檔一致：

```text
日期,類型,金額,類別,備註,帳戶,記錄時間
```

例子（假資料）：

```text
2026-01-02（週五）,支出,HK$48.00,飲食,示範午餐,八達通,2026-01-02 12:30
```

- 類型：`支出` 或 `收入`
- 金額：`HK$` 加兩位小數
- 日期：`YYYY-MM-DD（週X）`，時區係香港
- 帳戶：八達通、PayMe、轉數快、信用卡、現金
- 類別：飲食、交通、購物、住屋、娛樂、健康、訂閱、其他

記一筆會先 GET 檔案攞 sha，再將新行 append 上去，然後 PUT 全檔。如果 sha 撞咗，會提示再試一次。

## 開發

```bash
npm install
npm test
npm run dev
```

開發網址係 http://localhost:5173/yinzi-pwa/ 。未有 token 可以撳「先睇示範」，示範資料只留喺記憶體。

```bash
npm run build
```

`base` 係 `/yinzi-pwa/`，對應 GitHub project Pages。

## GitHub Pages

`.github/workflows/deploy-pages.yml` 會喺 push `main` 時 build，再用 `upload-pages-artifact` 同 `deploy-pages` 發佈。Pages 來源要設為 **GitHub Actions**（`build_type=workflow`）。
