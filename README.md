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

## 関連文書

- [変更履歴](CHANGELOG.md)
- [更新手順](how-to-update.md)・[検証手順](verification.md)
- [開発への参加](CONTRIBUTING.md)・[出典と貢献の扱い](CONTRIBUTIONS.md)
- [行動規範](CODE_OF_CONDUCT.md)・[サポート](SUPPORT.md)・[セキュリティ](SECURITY.md)
- [MITライセンス](LICENSE)

MITライセンスは本リポジトリ独自のコードと文書に適用されます。ゲームのデータ・名称・画像の権利は、それぞれの権利者に帰属します。

## 開発・運用の知見

開発環境、内部構成、検証コマンドと運用上の注意は [findings.md](findings.md) を参照してください。更新・復旧の手順と検証記録は、同ファイルから案内しています。
