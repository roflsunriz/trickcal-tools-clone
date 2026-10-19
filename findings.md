# 調査知見

- 装備ドロップ表は通常HTMLに含まれず、`lazy-accordion-container` の属性から公開部分取得URLを組み立てる。行番号やhashを固定しない。取得HTMLは出典・wiki更新日時付きfixtureとして保存し、CIからwikiへ接続しない。
- wikiコードは「rank + 装備種別」を表す。`equipmentByRank` と保存済み選択が使う `material-NNN` を表示名変更に合わせて振り直さない。
- 出典表はworld 3以降・rank 2以上だけ。rank 1とworld 1/2の既存dataを表から再生成しない。
- 2026-09-11の表は10-5で設計図と副産物を逆にして重複する。同一素材集合だけ統合し、異なる集合の重複や既存stage欠落はエラーにする。
- Pages公開ではアプリのBunとは別にActions自体のNode警告も確認する。公開成功はCI、deploy、公開asset反映を分けて判定する。
