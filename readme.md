# Planet
Planet v1.0 by shundroid

## What's this?
HTML5でできた、2Dアクションゲーム用ステージ作成ツール。  
（今、Planetに対応したアクションゲームをUnityで作成中）  

### 次のような形式になる。
```js
// JSONでは // によるコメントはできませんが、ここでは説明として入れます。
{
  "jsonPlanetVersion": 0.1,
  "skyboxes": [ "sunny", "night" ], // skybox たち。stageLayer別で
  "stage": [
    // stageLayer
    [
      // prefab [ "名前", X, Y ]
      [ "block/block", 0, 2 ],
      [ "block/block", 2, 2 ],
      [ "gimmick/brdg", ... ], ...
    ],
    [
      [ "gimmick/dokan", 3, 3 ], ...
    ], ...
  ]
}
```
JSONです。

## 準備
次のモジュールがない場合は、インストールしてください。  
- gulp
  
次のコマンドを入力してください。  
```bash
npm i
bower i
```
  
## ブラウザについて
次の構文などが対応しているブラウザに対応しています。  
Firefox 45.0で確認しています。
- `Array.prototype.forEach()`
- `DOMContentLoaded` Event
- `try-catch` 文
- CSS flexible box
- `Object.defineProperty()`
- Promise
- CSS PointerEvents
  
## 開発について
| 種類 | 言語 |
|:--|:--|
| スクリプト言語 | Typescript |
| スタイルシート言語 | Less |
| マークアップ言語 | Jade |

- Gulpでコンパイル
- パッケージ管理はNode Package Manager、Bower
- TypescriptはCommonjsモジュール、Browserifyを使用。

### GulpでのBrowserify

#### 普通に実行する
```bash
gulp brify
```

#### Taskのオプション
- `--min`は、つけると uglify をし、all.min.js として出す。
- `--watch`は、つけると watchify する。

### ブラウザでの確認
サーバーサイドスクリプトは使用してないが、Ajaxを使用している。  
ローカルでのAjaxに対応していないブラウザでは、XAMPP、Apacheなどでサーバーを立てる。