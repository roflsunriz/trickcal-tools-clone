# Trickcal Tools Clone

トリッカルの装備素材を選び、まとめて集められる周回ステージを探すツールです。日本語・英語に対応しています。

[周回ツールを開く](https://roflsunriz.github.io/trickcal-tools-clone/sweep/)

## 使い方

1. 集めたい素材をクリックして選びます。検索やランク絞り込みで素材を探せます。
2. 装備一式を集める場合は、物理・魔法武器を選び、クイック選択の目標ランクを押します。
3. 表示された周回ステージと副産物の候補を確認します。選択内容はブラウザに保存されます。

ワールド1〜32、ランク1〜9を収録しています。ワールド31・32ではランク9の素材を2種類ずつ集められます。

## データの出典

ワールド3以降の設計図・欠片は、[トリッカルwiki「装備設計図」](https://wikiwiki.jp/thetrickal/装備設計図)の「素材ドロップ場所一覧」を使用しています。取得した表と更新日時をリポジトリに保存し、設計図と副産物の両方を周回候補に反映しています。表にないランク1素材とワールド1・2は既存データを維持しています。

データと画像はローカルに同梱しています。利用時にwikiへの接続は発生しません。収録情報の更新方法は[更新手順](how-to-update.md)を参照してください。

## English

[Open the sweep planner](https://roflsunriz.github.io/trickcal-tools-clone/sweep/) and switch the language to English. Select materials or a target equipment rank to find farming stages. The catalog covers worlds 1–32 and ranks 1–9; equipment drops for worlds 3 onward come from the [Trickcal community wiki](https://wikiwiki.jp/thetrickal/装備設計図). Data and images are bundled locally.

## 開発

パッケージ管理とスクリプト実行にはBunを使用します。

```sh
bun install
bun run dev
bun run data:update --check
bun run format:check
bun run lint
bun run typecheck
bun test
bun run build
```

`data:update --check` はwikiとの照合のみを行います。差分がある場合は終了コード1を返します。反映する場合は `bun run data:update` を実行します。

- `src/app`: ツールの登録情報
- `src/tools/sweep`: 周回UI、素材名、データ、保存処理、計算処理、テスト
- `scripts/update-sweep-data.ts`: wikiからの更新コマンド
- `scripts/fixtures/wiki-equipment-drops.html`: 取得元・更新日時付きの素材表
- `public/assets/gears`: 素材画像

新しいツールは `src/tools/<tool-name>` に追加し、`src/app/tools.ts` へ登録します。

## CIと公開

`main` へのpushとPull Requestで、整形、lint、型チェック、テスト、ビルドを実行します。GitHub Pagesは `main` からの自動公開と手動実行に対応しています。リポジトリ設定のPages公開元にはGitHub Actionsを指定します。

`bun run build` は公開用の `dist/sweep/index.html` も生成します。公開先は [GitHub Pages](https://roflsunriz.github.io/trickcal-tools-clone/sweep/) です。

## 関連文書

- [変更履歴](CHANGELOG.md)
- [更新手順](how-to-update.md)・[検証手順](verification.md)
- [開発への参加](CONTRIBUTING.md)・[出典と貢献の扱い](CONTRIBUTIONS.md)
- [行動規範](CODE_OF_CONDUCT.md)・[サポート](SUPPORT.md)・[セキュリティ](SECURITY.md)
- [MITライセンス](LICENSE)

MITライセンスは本リポジトリ独自のコードと文書に適用されます。ゲームのデータ・名称・画像の権利は、それぞれの権利者に帰属します。
