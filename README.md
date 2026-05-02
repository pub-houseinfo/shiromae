# BESSO 城前 / BESSO Shiromae

姫路城下、路地の小宿。戦国武将ゆかりの2部屋限定の宿泊施設「BESSO城前」公式サイト。

> 秀吉の夜か、官兵衛の夜か。
> 姫路城へ徒歩6分。物語に泊まる。

---

## 公開URL

- **GitHub Pages**: https://pub-houseinfo.github.io/siromae/
- **本番ドメイン**: （未設定）

## 施設概要

| 項目 | 内容 |
|---|---|
| 名称 | BESSO 城前（しろまえ）/ BESSO Shiromae |
| 住所 | 兵庫県姫路市本町68番地1153 姫小路入る |
| 立地 | 姫路城 徒歩6分 / JR姫路駅 徒歩10分 |
| 規模 | 2部屋（1階「官兵衛」2名 / 2階「秀吉」4名） |
| 開業 | 2026年4月末 |
| 公式予約 | （調整中） |

---

## サイト構造

シングルページ・縦長スクロール構成（LP風HP）。

```
siromae/
├── index.html          ← メインHTML（CSS・JSはインライン）
├── images/             ← 画像素材
│   ├── hero-castle-sunset.jpg     夕景の姫路城（提供：姫路市フォトバンク）
│   ├── kanbei-01.jpg〜04.jpg      官兵衛（1階）室内写真
│   ├── hideyoshi-01.jpg〜04.jpg   秀吉（2階）室内写真
│   ├── floorplan-1f.jpg           1階平面図
│   ├── floorplan-2f.jpg           2階平面図
│   └── about-location.png         場所案内
├── README.md
└── .gitignore
```

## 主要セクション（縦スクロール順）

1. **ヘッダー**（固定・スクロールでテーマ切替）
2. **ヒーロー**（FV）— 姫路城夕景背景＋ブランドコピー
3. **コンセプト** — 泊まる・変身する・歩く 3ステップ
4. **立地** — 姫路城徒歩6分のBento UI
5. **部屋：官兵衛**（1階・2名）— 写真ギャラリー＋平面図
6. **部屋：秀吉**（2階・4名）— 写真ギャラリー＋平面図
7. **体験** — 同建物「夢織館」武将扮装連携
8. **周辺観光** — Bento UI
9. **食事** — 城下町の食事処（仮表示）
10. **料金・空室状況** — 参考価格＋公式サイトへの誘導
11. **公式予約** — 大型CTAボタン
12. **FAQ** — アコーディオン
13. **アクセス** — Googleマップ埋め込み
14. **フッター**

---

## 技術スタック

- **HTML5 + CSS3**（Grid Layout・Flexbox・カスタムプロパティ）
- **Vanilla JS**（最小限・スムーススクロール・IntersectionObserver）
- **Google Fonts**: Noto Serif JP / Cormorant Garamond / Shippori Mincho / Noto Sans JP
- **SVGロゴ**（インライン・色変更可能）
- **Googleマップ埋め込み**（座標指定）

## デザインテーマ

**和モダン重厚 × Bento UI × Organic Minimalism**

| 要素 | 色 |
|---|---|
| 墨 | `#1a1a1a` |
| 和紙白 | `#f5f3ee` |
| 金（基調） | `#c9a961` |
| 金（深） | `#a88a3f` |
| 朱 | `#aa3333` |

---

## 写真素材

| カテゴリ | 出典 |
|---|---|
| ヒーロー（姫路城夕景） | [姫路市フォトバンク](https://www.city.himeji.lg.jp/photobank/index.html)（クレジット表記済み） |
| 客室写真（官兵衛・秀吉） | 自社撮影 |
| 平面図 | 自社作成 |

---

## ローカルプレビュー

```bash
# シンプルにブラウザで開く
open index.html

# またはローカルサーバー起動（推奨）
python3 -m http.server 8080
# → http://localhost:8080
```

## 編集について

- HTMLとCSSは `index.html` に同梱（CSS変数で配色を一元管理）
- 写真の差し替えは `images/` 内のファイルを同名で上書き
- 開発元のGDriveは別途プロジェクトドキュメント・素材を保管

---

## 運営

**株式会社ハウスインフォ**
[BESSO姫路](https://travel.rakuten.co.jp/HOTEL/184816/184816.html)（姉妹施設）

## ライセンス

社内利用 / All rights reserved.
