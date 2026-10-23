# Trickcal Tools Clone

トリッカルの周回計画、クレヨンボード、食べ物の好みをまとめて確認できる非公式ツール集です。日本語・英語に対応しています。

- [周回ツールを開く](https://roflsunriz.github.io/trickcal-tools-clone/sweep/)
- [クレヨンボードを開く](https://roflsunriz.github.io/trickcal-tools-clone/board/)
- [食べ物の好みを開く](https://roflsunriz.github.io/trickcal-tools-clone/food/)

## 使い方

1. 集めたい素材をクリックして選びます。検索やランク絞り込みで素材を探せます。
2. 装備一式を集める場合は、物理・魔法武器を選び、クイック選択の目標ランクを押します。
3. 表示された周回ステージと、必要な場合だけ副産物候補を開いて確認します。素材、絞り込み、装備セットの武器種・必要ランクはブラウザに保存され、再読み込み後も選択色とともに復元されます。

ワールド1〜32、ランク1〜9を収録しています。ワールド31・32ではランク9の素材を2種類ずつ集められます。

### クレヨンボード

1. 第1〜3層と、攻撃力・会心・HP・会心抵抗・防御力のマスを選びます。
2. 使徒カードを押して特殊マスを開放済みにし、カード下部で所持・未所持を記録します。
3. 層別・全層の開放率、全体ボーナス、残りの金クレヨンを確認します。記録はブラウザへ保存されます。

2026年10月23日時点の補完元にある82使徒を収録し、元サイトの公開データ後に追加されたグウィン、コミー（水着）、レーテーなども含みます。

### 食べ物の好み

使徒を選ぶと大好物・好物・苦手な料理だけに絞り込まれます。料理を選ぶと、その料理に反応する使徒を逆引きできます。76使徒・60料理を収録し、情報源で未確認の使徒は未確認と表示します。

## データの出典

ワールド3以降の設計図・欠片は、[トリッカルwiki「装備設計図」](https://wikiwiki.jp/thetrickal/装備設計図)の「素材ドロップ場所一覧」を使用しています。クレヨン情報は[トリッカル攻略ポータルの使徒・ボードマネージャー](https://trickcal-strategy.pages.dev/board/manager.html)、料理の好みは[トリッカルwiki「宴会場」](https://wikiwiki.jp/thetrickal/宴会場)の「好物早見表」を使用しています。取得した該当部分と更新元のハッシュをリポジトリに保存します。

データと装備画像はローカルに同梱しています。利用時に情報源への接続は発生しません。収録情報の一括更新方法は[更新手順](how-to-update.md)を参照してください。

## English

Open the [sweep planner](https://roflsunriz.github.io/trickcal-tools-clone/sweep/), [Crayon Board](https://roflsunriz.github.io/trickcal-tools-clone/board/), or [Food Preferences](https://roflsunriz.github.io/trickcal-tools-clone/food/), then switch the language to English. The generated data is bundled locally; the Japanese source names remain unchanged where no verified English name is available.

## 関連文書

- [変更履歴](CHANGELOG.md)
- [更新手順](how-to-update.md)・[検証手順](verification.md)
- [開発への参加](CONTRIBUTING.md)・[出典と貢献の扱い](CONTRIBUTIONS.md)
- [行動規範](CODE_OF_CONDUCT.md)・[サポート](SUPPORT.md)・[セキュリティ](SECURITY.md)
- [MITライセンス](LICENSE)

MITライセンスは本リポジトリ独自のコードと文書に適用されます。ゲームのデータ・名称・画像の権利は、それぞれの権利者に帰属します。

## 開発・運用の知見

開発環境、内部構成、検証コマンドと運用上の注意は [findings.md](findings.md) を参照してください。更新・復旧の手順と検証記録は、同ファイルから案内しています。
